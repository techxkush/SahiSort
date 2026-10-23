import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

export interface AnalysisResult {
  itemName: string;
  material: string;
  condition: string;
  confidence: 'high' | 'medium' | 'needs_clarification';
  isUnclear: boolean;
  mixedMaterials: boolean;
  components: string[];
  evidence: string;
  isReuseSafe: boolean;
  safetyWarning?: string | null;
  clarificationQuestion?: string;
  clarificationOptions?: { id: string; label: string; item: string; material: string; condition: string }[];
}

export class GeminiService {
  private customApiKey: string | null = null;
  private demoCatalog: any[];

  constructor() {
    const catalogPath = path.join(__dirname, '..', 'data', 'demoItems.json');
    const raw = fs.readFileSync(catalogPath, 'utf-8');
    this.demoCatalog = JSON.parse(raw);
  }

  public setApiKey(key: string) {
    this.customApiKey = key;
  }

  public getApiKey(): string | null {
    return this.customApiKey || process.env.GEMINI_API_KEY || null;
  }

  private formatCatalogItem(item: any, overrideCondition?: string): AnalysisResult {
    return {
      itemName: item.name || item.itemName,
      material: item.material,
      condition: overrideCondition || item.condition,
      confidence: item.confidence,
      isUnclear: Boolean(item.isUnclear),
      mixedMaterials: Boolean(item.mixedMaterials),
      components: item.components || [],
      evidence: item.evidence || '',
      isReuseSafe: typeof item.isReuseSafe === 'boolean' ? item.isReuseSafe : true,
      safetyWarning: item.safetyWarning || null,
      clarificationQuestion: item.clarificationQuestion,
      clarificationOptions: item.clarificationOptions
    };
  }

  public async analyzeWaste(
    input: {
      textDescription?: string;
      imageBase64?: string;
      mimeType?: string;
      demoItemId?: string;
    }
  ): Promise<AnalysisResult> {
    // 1. If user selected a demo item directly, return precision demo data
    if (input.demoItemId) {
      const match = this.demoCatalog.find(d => d.id === input.demoItemId);
      if (match) {
        return this.formatCatalogItem(match);
      }
    }

    const apiKey = this.getApiKey();

    // 2. If Gemini API key is configured and image or custom prompt is supplied, attempt Gemini call
    if (apiKey && (input.imageBase64 || (input.textDescription && input.textDescription.length > 5))) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `You are WasteWise AI, an expert environmental material analyst.
Your job is to identify what object this is, determine its material (identifying mixed packaging components if applicable, such as paperboard + polyethylene plastic lining, or metallized film), condition, and whether it is safe for household craft reuse.

STRICT SAFETY DIRECTIVE:
Batteries, household chemicals, automotive fluids, medical waste, hypodermic needles, corrosive agents, toxic substances, sharp broken glass, and hazardous electronics MUST have isReuseSafe: false with a clear warning explaining why casual DIY reuse is hazardous.

UNCLEAR IMAGE DIRECTIVE:
If the image is blurry, dark, heavily cropped, or ambiguous, DO NOT guess with fake certainty. Set confidence: "needs_clarification", isUnclear: true, and formulate a helpful clarification question with 3 actionable options (e.g. Yes, No, I'm not sure).

Respond strictly with valid JSON conforming to this structure:
{
  "itemName": "string",
  "material": "string",
  "condition": "string",
  "confidence": "high" | "medium" | "needs_clarification",
  "isUnclear": boolean,
  "mixedMaterials": boolean,
  "components": ["string"],
  "evidence": "Brief explanation based on visible characteristics",
  "isReuseSafe": boolean,
  "safetyWarning": "string or null",
  "clarificationQuestion": "string or null",
  "clarificationOptions": [
    {"id": "opt-1", "label": "string", "item": "string", "material": "string", "condition": "string"}
  ]
}`;

        const parts: any[] = [];
        if (input.imageBase64) {
          parts.push({
            inlineData: {
              data: input.imageBase64.replace(/^data:image\/\w+;base64,/, ''),
              mimeType: input.mimeType || 'image/jpeg'
            }
          });
        }

        const userPrompt = input.textDescription
          ? `User says: "${input.textDescription}". Analyze the item, material, mixed packaging layers, condition, confidence, and reuse safety.`
          : 'Analyze the photographed item for waste categorization, material layers, condition, confidence, and reuse safety.';
        parts.push({ text: userPrompt });

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: parts,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json'
          }
        });

        const text = response.text?.trim() || '{}';
        const parsed = JSON.parse(text);

        return {
          itemName: parsed.itemName || 'Identified Waste Item',
          material: parsed.material || 'Mixed material',
          condition: parsed.condition || 'Used',
          confidence: parsed.confidence || 'high',
          isUnclear: Boolean(parsed.isUnclear),
          mixedMaterials: Boolean(parsed.mixedMaterials),
          components: Array.isArray(parsed.components) ? parsed.components : ['Main container body'],
          evidence: parsed.evidence || 'Analyzed via visible morphological properties and surface finish.',
          isReuseSafe: typeof parsed.isReuseSafe === 'boolean' ? parsed.isReuseSafe : true,
          safetyWarning: parsed.safetyWarning || null,
          clarificationQuestion: parsed.clarificationQuestion,
          clarificationOptions: parsed.clarificationOptions
        };
      } catch (err) {
        console.warn('Gemini API call returned error, falling back to local expert intelligence:', err);
      }
    }

    // 3. Grounded Fallback & Local Simulation Engine
    return this.fallbackAnalysis(input.textDescription || 'item');
  }

  private fallbackAnalysis(rawText: string): AnalysisResult {
    const text = rawText.toLowerCase();

    // Specific phrase shortcuts
    if (text.includes('cereal') || text.includes('cardboard') || text.includes('box') || text.includes('shipping')) {
      const match = this.demoCatalog.find(d => d.id === 'demo-cardboard-box');
      if (match) return this.formatCatalogItem(match, text.includes('clean') ? 'Clean and dry' : match.condition);
    }

    if (text.includes('coffee') || text.includes('latte') || text.includes('cup') || text.includes('starbucks')) {
      const match = this.demoCatalog.find(d => d.id === 'demo-coffee-cup');
      if (match) return this.formatCatalogItem(match);
    }

    if (text.includes('chip') || text.includes('snack') || text.includes('crisp') || text.includes('wrapper') || text.includes('foil packet')) {
      const match = this.demoCatalog.find(d => d.id === 'demo-snack-packet');
      if (match) return this.formatCatalogItem(match);
    }

    if (text.includes('water bottle') || text.includes('soda bottle') || text.includes('plastic bottle') || text.includes('pet bottle')) {
      const match = this.demoCatalog.find(d => d.id === 'demo-plastic-bottle');
      if (match) return this.formatCatalogItem(match);
    }

    if (text.includes('pizza')) {
      const match = this.demoCatalog.find(d => d.id === 'demo-pizza-box');
      if (match) return this.formatCatalogItem(match);
    }

    if (text.includes('jar') || text.includes('mason') || text.includes('pasta sauce')) {
      const match = this.demoCatalog.find(d => d.id === 'demo-glass-jar');
      if (match) return this.formatCatalogItem(match);
    }

    if (text.includes('can') || text.includes('aluminum') || text.includes('tin can') || text.includes('soda can')) {
      const match = this.demoCatalog.find(d => d.id === 'demo-aluminum-can');
      if (match) return this.formatCatalogItem(match);
    }

    if (text.includes('shampoo') || text.includes('conditioner') || text.includes('soap bottle')) {
      const match = this.demoCatalog.find(d => d.id === 'demo-shampoo-bottle');
      if (match) return this.formatCatalogItem(match);
    }

    if (text.includes('milk') || text.includes('carton') || text.includes('juice carton') || text.includes('tetra')) {
      const match = this.demoCatalog.find(d => d.id === 'demo-milk-carton');
      if (match) return this.formatCatalogItem(match);
    }

    if (text.includes('food') || text.includes('banana') || text.includes('apple') || text.includes('organic') || text.includes('scraps')) {
      const match = this.demoCatalog.find(d => d.id === 'demo-food-scraps');
      if (match) return this.formatCatalogItem(match);
    }

    if (text.includes('toothpaste') || text.includes('lotion tube')) {
      const match = this.demoCatalog.find(d => d.id === 'demo-toothpaste-tube');
      if (match) return this.formatCatalogItem(match);
    }

    if (text.includes('cable') || text.includes('wire') || text.includes('charger') || text.includes('usb')) {
      const match = this.demoCatalog.find(d => d.id === 'demo-electronic-cable');
      if (match) return this.formatCatalogItem(match);
    }

    if (text.includes('blurry') || text.includes('unclear') || text.includes('dark') || text.includes('not sure')) {
      const unclear = this.demoCatalog.find(d => d.id === 'demo-unclear-item');
      if (unclear) return this.formatCatalogItem(unclear);
    }

    if (text.includes('battery') || text.includes('chemical') || text.includes('paint') || text.includes('acid') || text.includes('poison')) {
      const battery = this.demoCatalog.find(d => d.id === 'demo-battery');
      if (battery) return this.formatCatalogItem(battery);
      return {
        itemName: 'Hazardous Substance / Battery',
        material: 'Toxic chemical electrolyte and metals',
        condition: 'Spent / potentially hazardous',
        confidence: 'high',
        isUnclear: false,
        mixedMaterials: true,
        components: ['Casing', 'Active chemical compound'],
        evidence: 'Identified as hazardous consumer waste posing fire and toxicity risks.',
        isReuseSafe: false,
        safetyWarning: "Reuse isn't recommended for this item. Contains toxic and caustic compounds. Always prioritize human safety and municipal hazardous recovery protocols."
      };
    }

    // Check against demo catalog keywords (length >= 3)
    for (const item of this.demoCatalog) {
      const match = item.name.toLowerCase().split(/[\s()#]+/).some((word: string) => {
        return word.length >= 3 && text.includes(word);
      });

      if (match) {
        return this.formatCatalogItem(item);
      }
    }

    // Generic fallback for any other text input
    const cleanWords = rawText.trim().replace(/^(i have an?|there is an?|it is an?)\s+/i, '');
    const capitalized = cleanWords.charAt(0).toUpperCase() + cleanWords.slice(1);
    return {
      itemName: capitalized || 'Identified Item',
      material: 'Standard consumer material',
      condition: 'Used',
      confidence: 'medium',
      isUnclear: false,
      mixedMaterials: false,
      components: ['Primary material packaging'],
      evidence: 'Item identified from provided textual description.',
      isReuseSafe: true,
      safetyWarning: null
    };
  }
}

export const geminiService = new GeminiService();
