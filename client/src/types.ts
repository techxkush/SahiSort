export interface GuideCategory {
  id: string;
  name: string;
  color: string;
  badgeColor: string;
  icon: string;
  binType: string;
  description: string;
  accepted: string[];
  notAccepted: string[];
  generalPreparationSteps: string[];
}

export interface SupportingRule {
  section: string;
  pageNumber: number;
  exactQuote: string;
  guideDocument: string;
  edition: string;
}

export interface SafetyAssessment {
  isReuseSafe: boolean;
  hazardLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  warning: string | null;
}

export interface DisposalRecommendation {
  category: string;
  categoryName: string;
  binType: string;
  color: string;
  badgeColor: string;
  icon: string;
  preparationSteps: string[];
  supportingRule: SupportingRule;
  safetyAssessment: SafetyAssessment;
}

export interface ClarificationOption {
  id: string;
  label: string;
  item: string;
  material: string;
  condition: string;
}

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
  clarificationOptions?: ClarificationOption[];
}

export interface DIYStep {
  stepNumber: number;
  title: string;
  instruction: string;
  tool?: string;
  safetyTip?: string;
}

export interface ReuseProject {
  id: string;
  itemMatch: string[];
  title: string;
  subtitle: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  estimatedTime: string;
  purpose: 'Home' | 'Desk' | 'Garden' | 'Storage' | 'Decor' | 'Organization';
  materials: string[];
  tools: string[];
  safetyNotes: string;
  finishedResult: {
    name: string;
    description: string;
    benefits: string[];
  };
  steps: DIYStep[];
}

export interface HistoryEntry {
  id: string;
  itemName: string;
  material: string;
  condition: string;
  confidence: 'high' | 'medium' | 'needs_clarification';
  image?: string;
  category: string;
  categoryName: string;
  decision: 'disposed' | 'reused' | 'pending';
  reuseProject?: string | null;
  correctedByUser: boolean;
  originalIdentification?: {
    itemName: string;
    material: string;
    condition: string;
  };
  createdAt: string;
}

export interface DemoItem {
  id: string;
  name: string;
  categoryType: string;
  material: string;
  condition: string;
  confidence: 'high' | 'medium' | 'needs_clarification';
  isUnclear: boolean;
  mixedMaterials: boolean;
  components: string[];
  evidence: string;
  isReuseSafe: boolean;
  hazardLevel?: string;
  safetyWarning?: string;
  clarificationQuestion?: string;
  clarificationOptions?: ClarificationOption[];
  icon: string;
  description: string;
}

export interface StatsData {
  itemsSorted: number;
  correctlySorted: number;
  reuseOpportunities: number;
  itemsGivenSecondLife: number;
}
