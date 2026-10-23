import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { geminiService } from './services/geminiService';
import { guideService } from './services/guideService';
import { reuseService } from './services/reuseService';
import { historyService } from './services/historyService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer in-memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'WasteWise',
    geminiConfigured: Boolean(geminiService.getApiKey()),
    timestamp: new Date().toISOString()
  });
});

// 1. POST /api/analyze
// Accepts base64 image, uploaded file, text description, or demoItemId
app.post('/api/analyze', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    let imageBase64: string | undefined = req.body.imageBase64;
    let mimeType: string | undefined = req.body.mimeType;

    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype;
    }

    const textDescription = req.body.textDescription;
    const demoItemId = req.body.demoItemId;

    const analysis = await geminiService.analyzeWaste({
      textDescription,
      imageBase64,
      mimeType,
      demoItemId
    });

    res.json({
      success: true,
      analysis
    });
  } catch (error: any) {
    console.error('Error analyzing waste item:', error);
    res.status(500).json({
      success: false,
      error: 'We encountered an issue analyzing this item. Please try again or describe the item directly.'
    });
  }
});

// 2. POST /api/disposal
// Authoritative check against local municipal waste-management guide
app.post('/api/disposal', (req: Request, res: Response) => {
  try {
    const { itemName, material, condition } = req.body;

    if (!itemName) {
      return res.status(400).json({ success: false, error: 'Item name is required for local disposal check' });
    }

    const match = guideService.findRule(itemName, material, condition);

    if (!match.matched || !match.rule || !match.category) {
      return res.json({
        success: true,
        matched: false,
        message: match.reason || "We couldn't find a matching rule in the local guide."
      });
    }

    res.json({
      success: true,
      matched: true,
      disposal: {
        category: match.category.id,
        categoryName: match.category.name,
        binType: match.category.binType,
        color: match.category.color,
        badgeColor: match.category.badgeColor,
        icon: match.category.icon,
        preparationSteps: match.rule.preparationSteps,
        supportingRule: {
          section: match.rule.supportingSection,
          pageNumber: match.rule.pageNumber,
          exactQuote: match.rule.exactQuote,
          guideDocument: guideService.getMetadata().title,
          edition: guideService.getMetadata().edition
        },
        safetyAssessment: match.rule.safetyAssessment
      }
    });
  } catch (error: any) {
    console.error('Error fetching disposal rule:', error);
    res.status(500).json({
      success: false,
      error: "We couldn't check the local waste guide right now."
    });
  }
});

// 3. POST /api/reuse
// Generate or retrieve practical Best Out of Waste ideas
app.post('/api/reuse', (req: Request, res: Response) => {
  try {
    const { itemName, material, condition, difficulty, purpose } = req.body;

    if (!itemName) {
      return res.status(400).json({ success: false, error: 'Item name is required' });
    }

    const projects = reuseService.getProjectsForItem(itemName, {
      difficulty,
      purpose
    });

    res.json({
      success: true,
      projects
    });
  } catch (error: any) {
    console.error('Error fetching reuse projects:', error);
    res.status(500).json({ success: false, error: 'Error generating reuse projects' });
  }
});

// 4. POST /api/reuse/project
// Fetch full details of a specific project (steps, tools, materials, safety, finished visual)
app.post('/api/reuse/project', (req: Request, res: Response) => {
  try {
    const { projectId } = req.body;
    const project = reuseService.getProjectById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    res.json({
      success: true,
      project
    });
  } catch (error: any) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ success: false, error: 'Error fetching project details' });
  }
});

// 5. POST /api/history
// Save scan / decision to history
app.post('/api/history', (req: Request, res: Response) => {
  try {
    const {
      itemName,
      material,
      condition,
      confidence,
      image,
      category,
      categoryName,
      decision,
      reuseProject,
      correctedByUser
    } = req.body;

    const entry = historyService.add({
      itemName: itemName || 'Unknown Item',
      material: material || 'General',
      condition: condition || 'Standard',
      confidence: confidence || 'high',
      image,
      category: category || 'general_waste_black',
      categoryName: categoryName || 'General Waste',
      decision: decision || 'disposed',
      reuseProject: reuseProject || null,
      correctedByUser: Boolean(correctedByUser)
    });

    res.json({
      success: true,
      entry
    });
  } catch (error: any) {
    console.error('Error saving history:', error);
    res.status(500).json({ success: false, error: 'Failed to save to history' });
  }
});

// 6. GET /api/history
app.get('/api/history', (req: Request, res: Response) => {
  try {
    const history = historyService.getAll();
    res.json({
      success: true,
      history
    });
  } catch (error: any) {
    console.error('Error reading history:', error);
    res.status(500).json({ success: false, error: 'Failed to read history' });
  }
});

// 7. POST /api/history/:id/correct
// User correction flow
app.post('/api/history/:id/correct', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { itemName, material, condition } = req.body;

    // Re-evaluate disposal rule against authoritative guide with corrected parameters
    const match = guideService.findRule(itemName, material, condition);
    const categoryId = match.category ? match.category.id : 'general_waste_black';
    const categoryName = match.category ? match.category.name : 'General Waste';

    const updated = historyService.correctIdentification(id, {
      itemName,
      material,
      condition,
      category: categoryId,
      categoryName
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'History record not found' });
    }

    res.json({
      success: true,
      message: 'Identification updated',
      entry: updated,
      disposal: match.matched ? {
        category: match.category!.id,
        categoryName: match.category!.name,
        binType: match.category!.binType,
        preparationSteps: match.rule!.preparationSteps,
        supportingRule: {
          section: match.rule!.supportingSection,
          pageNumber: match.rule!.pageNumber,
          exactQuote: match.rule!.exactQuote
        }
      } : null
    });
  } catch (error: any) {
    console.error('Error correcting history entry:', error);
    res.status(500).json({ success: false, error: 'Failed to update record' });
  }
});

// 8. GET /api/guide
app.get('/api/guide', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      metadata: guideService.getMetadata(),
      categories: guideService.getCategories(),
      faq: guideService.getFaq()
    });
  } catch (error: any) {
    console.error('Error getting guide:', error);
    res.status(500).json({ success: false, error: 'Failed to load local guide' });
  }
});

// 9. GET /api/stats
app.get('/api/stats', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      stats: historyService.getStats()
    });
  } catch (error: any) {
    console.error('Error getting stats:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate stats' });
  }
});

// 10. GET /api/demo-samples
app.get('/api/demo-samples', (req: Request, res: Response) => {
  try {
    const catalogPath = require('path').join(__dirname, 'data', 'demoItems.json');
    const raw = require('fs').readFileSync(catalogPath, 'utf-8');
    res.json({
      success: true,
      items: JSON.parse(raw)
    });
  } catch (error: any) {
    console.error('Error loading demo items:', error);
    res.status(500).json({ success: false, error: 'Failed to load demo items' });
  }
});

// 11. POST /api/settings/key
app.post('/api/settings/key', (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;
    if (typeof apiKey === 'string') {
      geminiService.setApiKey(apiKey.trim());
      return res.json({
        success: true,
        configured: Boolean(geminiService.getApiKey()),
        message: 'API key updated for session'
      });
    }
    res.status(400).json({ success: false, error: 'Invalid API key format' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to update key' });
  }
});

app.listen(PORT, () => {
  console.log(`🌿 WasteWise backend server running on http://localhost:${PORT}`);
});
