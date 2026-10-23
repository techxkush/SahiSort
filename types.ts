export interface MaterialHypothesis {
material: string;
component: string;
confidence: 'high' | 'medium' | 'low';
basis: string;
uncertainty: string;
}

export interface ClarificationQuestion {
id: string;
question: string;
options: string[];
}

export interface SourceEvidenceItem {
passage_id: string;
guide_title: string;
jurisdiction: string;
section: string;
page: number;
excerpt: string;
relevance_explanation: string;
}

export interface DisposalRecommendation {
id: string;
discovery_id: string;
status: 'VERIFIED' | 'CONDITIONAL' | 'INSUFFICIENT_EVIDENCE';
disposal_category: string;
reasoning: string;
preparation_instructions: string[];
conditions_and_exceptions: string[];
uncertainty_or_limitations: string;
source_evidence: SourceEvidenceItem[];
version: number;
updated_at: string;
}

export interface ReuseProject {
id: string;
discovery_id: string;
object_name?: string;
title: string;
category: string;
description: string;
intended_use: string;
difficulty: 'Easy' | 'Moderate' | 'Detailed';
estimated_time: string;
required_materials: string[];
required_tools: string[];
steps: string[];
safety_notes: string;
assumptions_or_limitations: string;
is_saved: boolean;
is_completed: boolean;
created_at: string;
}

export interface DiscoveryRecord {
id: string;
input_type: string;
object_name: string;
short_description: string;
materials: MaterialHypothesis[];
clarification_required: boolean;
questions: ClarificationQuestion[];
disposal_confirmed: boolean;
recommendation?: DisposalRecommendation | null;
projects: ReuseProject[];
}