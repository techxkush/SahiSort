import fs from 'fs';
import path from 'path';

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

export interface WasteRule {
  id: string;
  keywords: string[];
  itemCanonical: string;
  material: string;
  condition: string;
  category: string;
  categoryName: string;
  supportingSection: string;
  pageNumber: number;
  exactQuote: string;
  preparationSteps: string[];
  safetyAssessment: {
    isReuseSafe: boolean;
    hazardLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    warning: string | null;
  };
}

export interface LocalWasteGuide {
  guideMetadata: {
    title: string;
    edition: string;
    jurisdiction: string;
    authority: string;
    effectiveDate: string;
    documentId: string;
    summary: string;
  };
  categories: GuideCategory[];
  rules: WasteRule[];
  faq: { q: string; a: string }[];
}

class GuideService {
  private guideData: LocalWasteGuide;

  constructor() {
    const guidePath = path.join(__dirname, '..', 'data', 'localWasteGuide.json');
    const raw = fs.readFileSync(guidePath, 'utf-8');
    this.guideData = JSON.parse(raw);
  }

  public getMetadata() {
    return this.guideData.guideMetadata;
  }

  public getCategories(): GuideCategory[] {
    return this.guideData.categories;
  }

  public getCategoryById(id: string): GuideCategory | undefined {
    return this.guideData.categories.find(c => c.id === id);
  }

  public getFaq() {
    return this.guideData.faq;
  }

  public findRule(
    itemName: string,
    material?: string,
    condition?: string
  ): {
    matched: boolean;
    rule?: WasteRule;
    category?: GuideCategory;
    reason?: string;
  } {
    const cleanItem = (itemName || '').toLowerCase().trim();
    const cleanMaterial = (material || '').toLowerCase().trim();
    const cleanCondition = (condition || '').toLowerCase().trim();

    // Check specific condition overrides (e.g. greasy pizza box)
    if (cleanItem.includes('pizza') && (cleanCondition.includes('greas') || cleanItem.includes('greas') || cleanCondition.includes('soil'))) {
      const pizzaRule = this.guideData.rules.find(r => r.id === 'RULE-PIZZA-BOX');
      if (pizzaRule) {
        return {
          matched: true,
          rule: pizzaRule,
          category: this.getCategoryById(pizzaRule.category)
        };
      }
    }

    // Direct keyword match
    for (const rule of this.guideData.rules) {
      const matchesKeyword = rule.keywords.some(k => {
        const cleanK = k.toLowerCase();
        return cleanItem.includes(cleanK) || cleanK.includes(cleanItem);
      });

      if (matchesKeyword) {
        return {
          matched: true,
          rule,
          category: this.getCategoryById(rule.category)
        };
      }
    }

    // Secondary search by canonical name or material keywords
    for (const rule of this.guideData.rules) {
      const matchCanonical = rule.itemCanonical.toLowerCase().split(/[\s,()#]+/).some(token => {
        return token.length > 3 && cleanItem.includes(token);
      });
      const matchMaterial = cleanMaterial.length > 2 && rule.material.toLowerCase().includes(cleanMaterial);

      if (matchCanonical || matchMaterial) {
        return {
          matched: true,
          rule,
          category: this.getCategoryById(rule.category)
        };
      }
    }

    // Check if matched in category accepted lists directly
    for (const category of this.guideData.categories) {
      const matchAccepted = category.accepted.find(acc => acc.toLowerCase().includes(cleanItem));
      if (matchAccepted) {
        // Return a synthesized rule strictly grounded in that category's guidelines
        const fallbackRule: WasteRule = {
          id: `CATEGORY-DERIVED-${category.id}`,
          keywords: [cleanItem],
          itemCanonical: itemName,
          material: material || 'General material',
          condition: condition || 'Standard condition',
          category: category.id,
          categoryName: category.name,
          supportingSection: `Official Accepted Items: ${category.name}`,
          pageNumber: 1,
          exactQuote: `Listed as accepted under ${category.name}: "${matchAccepted}". ${category.description}`,
          preparationSteps: category.generalPreparationSteps.slice(0, 3),
          safetyAssessment: {
            isReuseSafe: category.id !== 'hazardous_depot',
            hazardLevel: category.id === 'hazardous_depot' ? 'critical' : 'none',
            warning: category.id === 'hazardous_depot' ? 'Potentially hazardous material. Handle with extreme caution.' : null
          }
        };

        return {
          matched: true,
          rule: fallbackRule,
          category
        };
      }
    }

    // If completely unmatched, adhere strictly to trust rule: Never invent a rule
    return {
      matched: false,
      reason: "We couldn't find a matching rule in the local guide. We do not invent rules or guess when official guidance is absent."
    };
  }
}

export const guideService = new GuideService();
