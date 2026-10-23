import fs from 'fs';
import path from 'path';

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

class ReuseService {
  private projects: ReuseProject[];

  constructor() {
    const projPath = path.join(__dirname, '..', 'data', 'reuseProjects.json');
    const raw = fs.readFileSync(projPath, 'utf-8');
    this.projects = JSON.parse(raw);
  }

  public getAllProjects(): ReuseProject[] {
    return this.projects;
  }

  public getProjectById(id: string): ReuseProject | undefined {
    return this.projects.find(p => p.id === id);
  }

  public getProjectsForItem(
    itemName: string,
    filters?: {
      difficulty?: string;
      maxTimeMinutes?: number;
      purpose?: string;
    }
  ): ReuseProject[] {
    const cleanItem = (itemName || '').toLowerCase().trim();

    // Match projects
    let matched = this.projects.filter(p => {
      return p.itemMatch.some(m => cleanItem.includes(m.toLowerCase()) || m.toLowerCase().includes(cleanItem));
    });

    // If no direct project matches specific keyword, return general household upcycling projects
    if (matched.length === 0) {
      if (cleanItem.includes('bottle') || cleanItem.includes('container') || cleanItem.includes('shampoo')) {
        matched = this.projects.filter(p => p.id.includes('bottle'));
      } else if (cleanItem.includes('box') || cleanItem.includes('cardboard') || cleanItem.includes('carton')) {
        matched = this.projects.filter(p => p.id.includes('cardboard'));
      } else if (cleanItem.includes('can') || cleanItem.includes('metal') || cleanItem.includes('tin')) {
        matched = this.projects.filter(p => p.id.includes('can'));
      } else if (cleanItem.includes('glass') || cleanItem.includes('jar')) {
        matched = this.projects.filter(p => p.id.includes('jar'));
      } else {
        // Fallback to top curated general projects
        matched = this.projects.slice(0, 3);
      }
    }

    // Apply filters if provided
    if (filters?.difficulty && filters.difficulty !== 'All') {
      matched = matched.filter(p => p.difficulty.toLowerCase() === filters.difficulty!.toLowerCase());
    }

    if (filters?.purpose && filters.purpose !== 'All') {
      matched = matched.filter(p => p.purpose.toLowerCase() === filters.purpose!.toLowerCase());
    }

    return matched;
  }
}

export const reuseService = new ReuseService();
