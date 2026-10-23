import os
import json

class EvidenceEngine:
    def __init__(self, guide_path=None):
        self.guide_path = guide_path or "waste_guide.json"
        self.guide_data = self._load_guide()

    def _load_guide(self):
        if os.path.exists(self.guide_path):
            try:
                with open(self.guide_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return None
        return None

    def get_guide_metadata(self):
        if not self.guide_data:
            return {
                "configured": False,
                "guide_title": None,
                "jurisdiction": None,
                "version": None,
                "last_updated": None,
                "coverage_summary": "No waste guide configured.",
                "unverified_scope": "All unverified.",
                "passage_count": 0,
                "passages": []
            }
        return {
            "configured": True,
            "guide_title": self.guide_data.get("guide_title"),
            "jurisdiction": self.guide_data.get("jurisdiction"),
            "version": self.guide_data.get("version"),
            "last_updated": self.guide_data.get("last_updated"),
            "coverage_summary": self.guide_data.get("coverage_summary"),
            "unverified_scope": self.guide_data.get("unverified_scope"),
            "passage_count": len(self.guide_data.get("passages", [])),
            "passages": self.guide_data.get("passages", [])
        }

    def evaluate_disposal(self, object_name: str, short_desc: str, materials: list, clarification_answers: dict):
        if not self.guide_data or not self.guide_data.get("passages"):
            return {
                "status": "INSUFFICIENT_EVIDENCE",
                "disposal_category": "Unverified — No Guide Loaded",
                "reasoning": "No municipal waste guide is loaded on the server.",
                "preparation_instructions": ["Keep clean and dry until official schedule is verified."],
                "conditions_and_exceptions": ["Local acceptance varies."],
                "uncertainty_or_limitations": "Guide database missing.",
                "general_guidance_note": "Clean single-material items are commonly recyclable.",
                "source_evidence": []
            }

        corpus = f"{object_name} {short_desc} {' '.join(m.get('material','') for m in materials)} {' '.join(clarification_answers.values())}".lower()
        scored = []
        for p in self.guide_data.get("passages", []):
            score = sum(3 for kw in p.get("keywords", []) if kw in corpus) + sum(4 for mat in p.get("supported_materials", []) if mat in corpus)
            if score > 0:
                scored.append((score, p))
        scored.sort(key=lambda x: x[0], reverse=True)

        if not scored:
            return {
                "status": "INSUFFICIENT_EVIDENCE",
                "disposal_category": "No Matching Rule in Guide",
                "reasoning": f"No passage in {self.guide_data.get('guide_title')} matches this item.",
                "preparation_instructions": ["Do not place unverified composite items in recycling."],
                "conditions_and_exceptions": ["Scope limitation."],
                "uncertainty_or_limitations": "No direct evidence passage.",
                "general_guidance_note": "When evidence is absent, place mixed composite items in General Waste.",
                "source_evidence": []
            }

        _, top_passage = scored[0]
        evidence_items = [{
            "passage_id": top_passage["id"],
            "guide_title": self.guide_data["guide_title"],
            "jurisdiction": self.guide_data["jurisdiction"],
            "section": top_passage["section"],
            "page": top_passage["page"],
            "excerpt": top_passage["excerpt"],
            "relevance_explanation": f"Matched attributes against {top_passage['section']}."
        }]

        answers_text = " ".join(clarification_answers.values()).lower()
        if "black" in answers_text and "MG-PL-101" == top_passage["id"]:
            return {
                "status": "VERIFIED",
                "disposal_category": "General Waste (Excluded by Guide Exception)",
                "reasoning": "Black carbon-pigmented plastic cannot be optically sorted.",
                "preparation_instructions": ["Ensure item is empty before placing in General Waste."],
                "conditions_and_exceptions": [top_passage.get("exceptions", "")],
                "uncertainty_or_limitations": "Verified via clarification exception rule.",
                "general_guidance_note": None,
                "source_evidence": evidence_items
            }

        if len(clarification_answers) == 0:
            return {
                "status": "CONDITIONAL",
                "disposal_category": top_passage["disposal_category"],
                "reasoning": f"Provisional match to {top_passage['section']}. Resolution depends on clarification answers.",
                "preparation_instructions": top_passage.get("preparation_steps", []),
                "conditions_and_exceptions": top_passage.get("required_conditions", []),
                "uncertainty_or_limitations": "Visual appearance requires clarification.",
                "general_guidance_note": None,
                "source_evidence": evidence_items
            }

        return {
            "status": "VERIFIED",
            "disposal_category": top_passage["disposal_category"],
            "reasoning": f"Direct evidence match in {self.guide_data['guide_title']} ({top_passage['section']}).",
            "preparation_instructions": top_passage.get("preparation_steps", []),
            "conditions_and_exceptions": top_passage.get("required_conditions", []),
            "uncertainty_or_limitations": f"Verified for {self.guide_data['jurisdiction']}.",
            "general_guidance_note": None,
            "source_evidence": evidence_items
        }