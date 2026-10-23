import uuid
from typing import Optional, List, Dict, Any

class SahiSortAIService:
    def __init__(self):
        pass

    def identify_object(self, description: Optional[str] = None, image_bytes: Optional[bytes] = None) -> Dict[str, Any]:
        text = (description or "").strip().lower()
        
        if any(w in text for w in ["glass", "jar", "jam", "sauce"]):
            return {
                "object_name": "Culinary Glass Jar / Bottle",
                "short_description": f"A glass container described as: '{description}'.",
                "visible_characteristics": ["Rigid transparent vessel", "Threaded neck for lid"],
                "materials": [{
                    "material": "Soda-lime culinary glass",
                    "component": "Main vessel",
                    "confidence": "high",
                    "basis": "User description",
                    "uncertainty": "Rule out borosilicate"
                }],
                "uncertainty_notes": "Standard food jars are soda-lime glass; Pyrex is borosilicate.",
                "clarification_required": True,
                "questions": [{
                    "id": "glass_type",
                    "question": "Is this standard packaging glass or heat-resistant Pyrex?",
                    "options": ["Standard packaging jar/bottle", "Pyrex / borosilicate glass"]
                }],
                "narration_script": "This appears to be a culinary glass container. Once rinsed clean, it can be recycled or reused for storage."
            }
            
        if any(w in text for w in ["cup", "coffee"]):
            return {
                "object_name": "Single-Use Hot Beverage Paper Cup",
                "short_description": f"A takeaway cup described as: '{description}'.",
                "visible_characteristics": ["Paperboard outer wall", "Inner waterproof lining"],
                "materials": [{
                    "material": "Polyethylene-lined paperboard",
                    "component": "Cup body",
                    "confidence": "high",
                    "basis": "Beverage packaging function",
                    "uncertainty": "Check lining type"
                }],
                "uncertainty_notes": "Hot cups have a bonded polyethylene waterproof film.",
                "clarification_required": True,
                "questions": [{
                    "id": "cup_lining",
                    "question": "Does it have a cardboard sleeve and is it marked compostable?",
                    "options": ["Standard PE lined takeaway cup", "Certified compostable fiber"]
                }],
                "narration_script": "This is a single-use hot beverage cup. The sleeve and lid sort differently from the PE-lined cup body."
            }
            
        if any(w in text for w in ["battery", "power bank", "charger"]):
            return {
                "object_name": "Rechargeable Battery / Power Bank",
                "short_description": f"An electronic or energy storage item described as: '{description}'.",
                "visible_characteristics": ["Enclosed battery cell with electrical contacts"],
                "materials": [{
                    "material": "Lithium-ion cell / Circuitry",
                    "component": "Internal assembly",
                    "confidence": "high",
                    "basis": "Identified battery device",
                    "uncertainty": "Cell integrity"
                }],
                "uncertainty_notes": "Must be brought to E-Waste drop-off.",
                "clarification_required": False,
                "questions": [],
                "narration_script": "This is a battery or electronic accessory. Bring it to an authorized E-Waste drop-off."
            }
            
        return {
            "object_name": (description.strip().title()[:60] if description else "Rigid Consumer Container"),
            "short_description": f"An everyday object described as: '{description}'.",
            "visible_characteristics": ["Molded rigid outer structure", "May feature a resin stamp"],
            "materials": [{
                "material": "Rigid Plastic (#1 PET, #2 HDPE, or #5 PP)",
                "component": "Main body",
                "confidence": "medium",
                "basis": "Packaging inference",
                "uncertainty": "Exact resin code"
            }],
            "uncertainty_notes": "Checking the resin triangle (#1–#7) on the base determines recyclability.",
            "clarification_required": True,
            "questions": [{
                "id": "resin_code",
                "question": "What recycling resin number (#1 to #7) is stamped on the base?",
                "options": ["#1 PET or #2 HDPE", "#5 PP", "Black plastic or unmarked"]
            }],
            "narration_script": "We identified this rigid container. Checking its resin code confirms the correct sorting stream."
        }

    def generate_reuse_projects(self, object_name: str, materials: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        mat_str = " ".join(m.get("material", "") for m in materials).lower()
        if "glass" in mat_str:
            return [
                {
                    "id": str(uuid.uuid4()),
                    "title": "Airtight Dry-Goods Apothecary & Tare Jar",
                    "category": "Organisation and storage",
                    "description": "Transform a culinary glass jar into a calibrated pantry storage vessel.",
                    "intended_use": "Pantry storage for grains or coffee beans",
                    "difficulty": "Easy",
                    "estimated_time": "20 minutes",
                    "required_materials": [object_name, "Baking soda and oil for label removal"],
                    "required_tools": ["Sponge", "Kitchen scale"],
                    "steps": [
                        "Soak jar in warm soapy water",
                        "Peel label and remove adhesive with oil and baking soda",
                        "Air dry and write tare weight on base"
                    ],
                    "safety_notes": "Inspect rim for chips before reuse.",
                    "assumptions_or_limitations": "Requires intact lid seal."
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Passive Hydro-Wicking Herb Propagator",
                    "category": "Home or desk utility",
                    "description": "Use the glass vessel as a sunlit water reservoir for rooting plant cuttings.",
                    "intended_use": "Indoor botanical propagation",
                    "difficulty": "Easy",
                    "estimated_time": "15 minutes",
                    "required_materials": [object_name, "Fresh plant cuttings", "Water"],
                    "required_tools": ["Scissors"],
                    "steps": [
                        "Clean glass vessel thoroughly",
                        "Fill with water and insert stem cuttings",
                        "Place in indirect daylight"
                    ],
                    "safety_notes": "Keep away from electrical outlets.",
                    "assumptions_or_limitations": "Change water weekly."
                }
            ]
            
        return [
            {
                "id": str(uuid.uuid4()),
                "title": "Wall-Mounted Hardware & Fastener Scoop Bin",
                "category": "Organisation and storage",
                "description": "Reshape a clean rigid container into an angled open-front bin for screws or stationery.",
                "intended_use": "Workbench storage bin",
                "difficulty": "Easy",
                "estimated_time": "20 minutes",
                "required_materials": [object_name, "Masking tape"],
                "required_tools": ["Scissors", "Marker"],
                "steps": [
                    "Clean container thoroughly",
                    "Draw angled cut line from high back to low front",
                    "Cut with heavy scissors and tape rim"
                ],
                "safety_notes": "Smooth cut edges to prevent scrapes.",
                "assumptions_or_limitations": "Best suited for rigid plastic."
            }
        ]