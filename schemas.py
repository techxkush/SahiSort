from typing import List, Optional, Dict, Literal
from pydantic import BaseModel, Field


class MaterialHypothesis(BaseModel):
    material: str = Field(..., description="Likely material or polymer/component name")
    component: str = Field(default="Main body", description="Part of the object")
    confidence: Literal["high", "medium", "low"] = Field(
        default="medium", description="Qualitative epistemic confidence"
    )
    basis: str = Field(..., description="Visual observation vs model inference")
    uncertainty: str = Field(..., description="What cannot be verified from appearance alone")


class ClarificationQuestion(BaseModel):
    id: str = Field(..., description="Stable question key")
    question: str = Field(..., description="Targeted question whose answer affects disposal")
    options: List[str] = Field(default_factory=list, description="Helpful quick-answer options")


class AIIdentificationOutput(BaseModel):
    object_name: str
    short_description: str
    visible_characteristics: List[str]
    materials: List[MaterialHypothesis]
    uncertainty_notes: str
    clarification_required: bool
    questions: List[ClarificationQuestion]
    narration_script: str


class SourceEvidenceItem(BaseModel):
    passage_id: str
    guide_title: str
    jurisdiction: str
    section: str
    page: int
    excerpt: str
    relevance_explanation: str


class DisposalRecommendationResponse(BaseModel):
    id: str
    discovery_id: str
    status: Literal["VERIFIED", "CONDITIONAL", "INSUFFICIENT_EVIDENCE"]
    disposal_category: str
    reasoning: str
    preparation_instructions: List[str]
    conditions_and_exceptions: List[str]
    uncertainty_or_limitations: str
    general_guidance_note: Optional[str] = None
    source_evidence: List[SourceEvidenceItem]
    version: int
    updated_at: str


class CorrectionResponse(BaseModel):
    id: str
    previous_object_name: str
    corrected_object_name: str
    corrected_primary_material: str
    user_notes: Optional[str] = None
    created_at: str


class ReuseProjectIdeaSchema(BaseModel):
    title: str
    category: Literal[
        "Functional reuse",
        "Organisation and storage",
        "Home or desk utility",
        "Decorative projects",
        "Creative experimentation",
    ]
    description: str
    intended_use: str
    difficulty: Literal["Easy", "Moderate", "Detailed"]
    estimated_time: str
    required_materials: List[str]
    required_tools: List[str]
    steps: List[str]
    safety_notes: str
    assumptions_or_limitations: str


class AIReuseGenerationOutput(BaseModel):
    projects: List[ReuseProjectIdeaSchema]
    suitability_warning: Optional[str] = None


class ReuseProjectResponse(ReuseProjectIdeaSchema):
    id: str
    discovery_id: str
    object_name: Optional[str] = None
    is_saved: bool
    saved_at: Optional[str] = None
    is_completed: bool
    completed_at: Optional[str] = None
    created_at: str


class DiscoveryResponse(BaseModel):
    id: str
    input_type: str
    user_description: Optional[str] = None
    image_data_url: Optional[str] = None
    object_name: str
    short_description: str
    visible_characteristics: List[str]
    materials: List[MaterialHypothesis]
    uncertainty_notes: str
    clarification_required: bool
    questions: List[ClarificationQuestion]
    clarification_answers: Dict[str, str]
    narration_script: str
    status: str
    disposal_confirmed: bool
    disposal_confirmed_at: Optional[str] = None
    disposal_confirmed_route: Optional[str] = None
    created_at: str
    updated_at: str
    recommendation: Optional[DisposalRecommendationResponse] = None
    corrections: List[CorrectionResponse] = []
    projects: List[ReuseProjectResponse] = []


class ClarifyRequest(BaseModel):
    answers: Dict[str, str] = Field(..., description="Map of question_id to user answer")


class CorrectDiscoveryRequest(BaseModel):
    corrected_object_name: str = Field(..., min_length=2, max_length=200)
    corrected_primary_material: str = Field(..., min_length=2, max_length=200)
    condition_or_notes: Optional[str] = Field(default=None, max_length=500)


class RecreateGenerationRequest(BaseModel):
    available_time: Optional[str] = Field(default="Under 45 minutes")
    available_tools: Optional[str] = Field(default="Scissors, craft knife, ruler, tape, glue")
    difficulty_preference: Optional[str] = Field(default="Any")
    user_constraints: Optional[str] = Field(default=None)


class ConfirmDisposalRequest(BaseModel):
    followed_route: str = Field(..., min_length=2, max_length=255)


class SaveToggleRequest(BaseModel):
    saved: bool = True