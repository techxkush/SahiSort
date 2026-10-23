import {
  AnalysisResult,
  DisposalRecommendation,
  ReuseProject,
  HistoryEntry,
  GuideCategory,
  DemoItem,
  StatsData
} from '../types';

const API_BASE = '/api';

export async function analyzeItem(payload: {
  textDescription?: string;
  imageBase64?: string;
  mimeType?: string;
  demoItemId?: string;
  file?: File;
}): Promise<{ success: boolean; analysis: AnalysisResult; error?: string }> {
  if (payload.file) {
    const formData = new FormData();
    formData.append('photo', payload.file);
    if (payload.textDescription) {
      formData.append('textDescription', payload.textDescription);
    }
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  }

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function getDisposalRecommendation(
  itemName: string,
  material?: string,
  condition?: string
): Promise<{
  success: boolean;
  matched: boolean;
  disposal?: DisposalRecommendation;
  message?: string;
  error?: string;
}> {
  const res = await fetch(`${API_BASE}/disposal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemName, material, condition })
  });
  return res.json();
}

export async function getReuseProjects(
  itemName: string,
  filters?: { difficulty?: string; purpose?: string }
): Promise<{ success: boolean; projects: ReuseProject[]; error?: string }> {
  const res = await fetch(`${API_BASE}/reuse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemName, ...filters })
  });
  return res.json();
}

export async function getProjectDetails(
  projectId: string
): Promise<{ success: boolean; project?: ReuseProject; error?: string }> {
  const res = await fetch(`${API_BASE}/reuse/project`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId })
  });
  return res.json();
}

export async function saveHistoryEntry(data: {
  itemName: string;
  material: string;
  condition: string;
  confidence: string;
  image?: string;
  category: string;
  categoryName: string;
  decision: 'disposed' | 'reused' | 'pending';
  reuseProject?: string | null;
  correctedByUser?: boolean;
}): Promise<{ success: boolean; entry: HistoryEntry; error?: string }> {
  const res = await fetch(`${API_BASE}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getHistory(): Promise<{ success: boolean; history: HistoryEntry[]; error?: string }> {
  const res = await fetch(`${API_BASE}/history`);
  return res.json();
}

export async function correctHistoryRecord(
  id: string,
  data: {
    itemName: string;
    material: string;
    condition: string;
  }
): Promise<{
  success: boolean;
  message: string;
  entry: HistoryEntry;
  disposal?: DisposalRecommendation;
  error?: string;
}> {
  const res = await fetch(`${API_BASE}/history/${id}/correct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getWasteGuide(): Promise<{
  success: boolean;
  metadata: any;
  categories: GuideCategory[];
  faq: { q: string; a: string }[];
  error?: string;
}> {
  const res = await fetch(`${API_BASE}/guide`);
  return res.json();
}

export async function getDashboardStats(): Promise<{
  success: boolean;
  stats: StatsData;
  error?: string;
}> {
  const res = await fetch(`${API_BASE}/stats`);
  return res.json();
}

export async function getDemoSamples(): Promise<{
  success: boolean;
  items: DemoItem[];
  error?: string;
}> {
  const res = await fetch(`${API_BASE}/demo-samples`);
  return res.json();
}

export async function updateApiKey(apiKey: string): Promise<{
  success: boolean;
  configured: boolean;
  message?: string;
  error?: string;
}> {
  const res = await fetch(`${API_BASE}/settings/key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey })
  });
  return res.json();
}

export async function checkBackendHealth(): Promise<{
  status: string;
  geminiConfigured: boolean;
}> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  } catch (e) {
    return { status: 'offline', geminiConfigured: false };
  }
}
