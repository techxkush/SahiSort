import http.server
import json
import os
import sqlite3
import urllib.parse
import uuid
from datetime import datetime, timezone

PORT = 8000
DB_FILE = "sahisort.db"

# ============================================================================
# 1. BUILT-IN MUNICIPAL WASTE GUIDE (Source of Truth)
# ============================================================================
WASTE_GUIDE = {
    "guide_title": "Metro Solid Waste & Resource Recovery Handbook (2026 Edition)",
    "jurisdiction": "Metro Municipal Solid Waste Authority (Single-Stream & Drop-Off)",
    "version": "2026.2",
    "last_updated": "2026-01-15",
    "coverage_summary": "Covers household rigid plastics (#1, #2, #5), glass containers, clean paper/cardboard, metal cans, multi-layer beverage cartons, compostable organics, and household hazardous/e-waste.",
    "unverified_scope": "Industrial chemicals, medical sharps, construction rubble, and unmarked composite bio-plastics.",
    "passages": [
        {
            "id": "MG-PL-101",
            "section": "Section 4.1 — Rigid Household Plastics (#1 PET, #2 HDPE, #5 PP)",
            "page": 14,
            "keywords": ["plastic", "bottle", "jar", "jug", "tub", "container", "pet", "hdpe", "pp", "polypropylene", "beverage"],
            "disposal_category": "Dry Recyclables (Blue Bin)",
            "supported_materials": ["pet", "hdpe", "pp", "rigid plastic", "plastic #1", "plastic #2", "plastic #5"],
            "required_conditions": [
                "Container must be empty, rinsed free of food residue, and dry.",
                "Resin code must be #1 (PET), #2 (HDPE), or #5 (PP).",
                "Black carbon-pigmented plastic is NOT accepted by optical sorters."
            ],
            "preparation_steps": [
                "Empty all liquid or food residue completely.",
                "Give a quick rinse and shake dry.",
                "Replace plastic screw caps tightly onto the bottle before placing in the Blue Bin."
            ],
            "exceptions": "Black microwave trays, foam polystyrene (#6 EPS), and flexible film pouches must go to General Waste.",
            "excerpt": "Clean rigid plastic bottles, tubs, and jugs bearing resin identification codes #1 (PET), #2 (HDPE), and #5 (PP) are accepted in curbside Dry Recyclables. Carbon-black plastics belong in General Waste."
        },
        {
            "id": "MG-GL-201",
            "section": "Section 5.2 — Culinary Glass Jars & Bottles",
            "page": 21,
            "keywords": ["glass", "jar", "bottle", "sauce", "jam", "beverage glass", "culinary glass", "mason"],
            "disposal_category": "Glass Drop-Off / Curbside Glass Crate",
            "supported_materials": ["glass", "culinary glass", "soda-lime glass"],
            "required_conditions": [
                "Must be food or beverage packaging glass (clear, green, or amber).",
                "Must not be heat-treated borosilicate (Pyrex), mirror, window glass, or ceramics."
            ],
            "preparation_steps": [
                "Rinse jar or bottle clean; paper labels may remain attached.",
                "Remove metal lids and recycle them separately in the Metal stream."
            ],
            "exceptions": "Drinking glasses, Pyrex bakeware, and lightbulbs contaminate glass cullet.",
            "excerpt": "Clear, green, and amber food and beverage bottles and jars are 100% recyclable in the Glass stream. Separate metal lug caps into dry mixed recycling. Never include heat-resistant borosilicate glass."
        },
        {
            "id": "MG-PA-301",
            "section": "Section 3.1 — Corrugated Cardboard & Uncoated Paperboard",
            "page": 9,
            "keywords": ["cardboard", "box", "paper", "carton", "paperboard", "shipping box", "pizza box"],
            "disposal_category": "Clean Fiber & Cardboard (Blue Bin)",
            "supported_materials": ["cardboard", "corrugated fiberboard", "paperboard", "paper"],
            "required_conditions": [
                "Material must be dry and free from soaked grease, oil, or food residue.",
                "Must not have plastic film lamination or metallic foil coating."
            ],
            "preparation_steps": [
                "Remove all inner plastic air pillows and foam inserts.",
                "Flatten boxes completely to conserve collection capacity.",
                "Tear off and compost or discard heavily greased sections (such as pizza box bottoms)."
            ],
            "exceptions": "Greasy paper and wax-coated produce boxes contaminate paper pulp.",
            "excerpt": "Clean, dry corrugated cardboard and uncoated paperboard boxes belong in Clean Fiber recycling. Flatten all boxes. Tear off greasy sections before recycling."
        }
    ]
}

# ============================================================================
# 2. DATABASE INITIALIZATION & HELPERS
# ============================================================================
def init_db():
    conn = sqlite3.connect(DB_FILE)
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS discoveries (
            id TEXT PRIMARY KEY,
            input_type TEXT NOT NULL,
            user_description TEXT,
            object_name TEXT NOT NULL,
            short_description TEXT NOT NULL,
            visible_characteristics TEXT NOT NULL,
            materials TEXT NOT NULL,
            uncertainty_notes TEXT NOT NULL,
            clarification_required INTEGER DEFAULT 0,
            questions TEXT NOT NULL,
            clarification_answers TEXT NOT NULL,
            narration_script TEXT NOT NULL,
            status TEXT DEFAULT 'IDENTIFIED',
            disposal_confirmed INTEGER DEFAULT 0,
            disposal_confirmed_at TEXT,
            disposal_confirmed_route TEXT,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS disposal_recommendations (
            id TEXT PRIMARY KEY,
            discovery_id TEXT NOT NULL UNIQUE,
            status TEXT NOT NULL,
            disposal_category TEXT NOT NULL,
            reasoning TEXT NOT NULL,
            preparation_instructions TEXT NOT NULL,
            conditions_and_exceptions TEXT NOT NULL,
            uncertainty_or_limitations TEXT NOT NULL,
            source_evidence TEXT NOT NULL,
            version INTEGER DEFAULT 1,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS reuse_projects (
            id TEXT PRIMARY KEY,
            discovery_id TEXT NOT NULL,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            intended_use TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            estimated_time TEXT NOT NULL,
            required_materials TEXT NOT NULL,
            required_tools TEXT NOT NULL,
            steps TEXT NOT NULL,
            safety_notes TEXT NOT NULL,
            assumptions_or_limitations TEXT NOT NULL,
            is_saved INTEGER DEFAULT 0,
            is_completed INTEGER DEFAULT 0,
            created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS activity_history (
            id TEXT PRIMARY KEY,
            action_type TEXT NOT NULL,
            discovery_id TEXT,
            project_id TEXT,
            summary TEXT NOT NULL,
            created_at TEXT
        );
        """
    )
    conn.commit()
    conn.close()

def utc_iso():
    return datetime.now(timezone.utc).isoformat()

def log_activity(conn, action_type, summary, discovery_id=None, project_id=None):
    conn.execute(
        "INSERT INTO activity_history (id, action_type, discovery_id, project_id, summary, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (str(uuid.uuid4()), action_type, discovery_id, project_id, summary, utc_iso())
    )

# ============================================================================
# 3. EVIDENCE & HEURISTIC ENGINE
# ============================================================================
def evaluate_disposal(object_name, short_desc, materials, clarification_answers):
    corpus = f"{object_name} {short_desc} {' '.join(m.get('material','') for m in materials)} {' '.join(clarification_answers.values())}".lower()
    scored = []
    for p in WASTE_GUIDE["passages"]:
        score = sum(3 for kw in p["keywords"] if kw in corpus) + sum(4 for mat in p["supported_materials"] if mat in corpus)
        if score > 0:
            scored.append((score, p))
    scored.sort(key=lambda x: x[0], reverse=True)

    if not scored:
        return {
            "status": "INSUFFICIENT_EVIDENCE",
            "disposal_category": "Unverified — No Matching Guide Passage",
            "reasoning": f"No direct passage in {WASTE_GUIDE['guide_title']} matches this item.",
            "preparation_instructions": ["Keep clean and dry until official schedule is verified."],
            "conditions_and_exceptions": ["Local acceptance varies."],
            "uncertainty_or_limitations": "Guide database missing passage.",
            "general_guidance_note": "Clean single-material items are commonly recyclable.",
            "source_evidence": []
        }

    _, top_passage = scored[0]
    evidence_items = [{
        "passage_id": top_passage["id"],
        "guide_title": WASTE_GUIDE["guide_title"],
        "jurisdiction": WASTE_GUIDE["jurisdiction"],
        "section": top_passage["section"],
        "page": top_passage["page"],
        "excerpt": top_passage["excerpt"],
        "relevance_explanation": f"Matched attributes against {top_passage['section']}."
    }]

    return {
        "status": "VERIFIED" if clarification_answers else "CONDITIONAL",
        "disposal_category": top_passage["disposal_category"],
        "reasoning": f"Direct evidence match in {WASTE_GUIDE['guide_title']} ({top_passage['section']}).",
        "preparation_instructions": top_passage["preparation_steps"],
        "conditions_and_exceptions": top_passage["required_conditions"],
        "uncertainty_or_limitations": f"Verified for {WASTE_GUIDE['jurisdiction']}.",
        "general_guidance_note": None,
        "source_evidence": evidence_items
    }

def analyze_object(description):
    text = description.strip().lower()
    if any(w in text for w in ["glass", "jar", "jam", "sauce"]):
        return {
            "object_name": "Culinary Glass Jar / Bottle",
            "short_description": f"A glass container described as: '{description}'.",
            "visible_characteristics": ["Rigid transparent vessel", "Threaded neck for lid"],
            "materials": [{"material": "Soda-lime culinary glass", "component": "Main vessel", "confidence": "high", "basis": "User description", "uncertainty": "Rule out borosilicate"}],
            "uncertainty_notes": "Standard food jars are soda-lime glass.",
            "clarification_required": True,
            "questions": [{"id": "glass_type", "question": "Is this standard packaging glass or heat-resistant Pyrex?", "options": ["Standard packaging jar/bottle", "Pyrex / borosilicate glass"]}],
            "narration_script": "This appears to be a culinary glass container. Once rinsed clean, it can be recycled."
        }
    return {
        "object_name": description.strip().title()[:60] or "Rigid Consumer Container",
        "short_description": f"An everyday object described as: '{description}'.",
        "visible_characteristics": ["Molded rigid outer structure"],
        "materials": [{"material": "Rigid Plastic (#1 PET, #2 HDPE, or #5 PP)", "component": "Main body", "confidence": "medium", "basis": "Packaging inference", "uncertainty": "Exact resin code"}],
        "uncertainty_notes": "Checking the resin triangle on the base determines recyclability.",
        "clarification_required": True,
        "questions": [{"id": "resin_code", "question": "What recycling resin number (#1 to #7) is stamped on the base?", "options": ["#1 PET or #2 HDPE", "#5 PP", "Unmarked"]}],
        "narration_script": "We identified this rigid container. Checking its resin code confirms the correct sorting stream."
    }

def generate_projects(object_name, materials):
    return [
        {
            "id": str(uuid.uuid4()),
            "title": "Airtight Dry-Goods Apothecary & Tare Jar",
            "category": "Organisation and storage",
            "description": "Transform a container into a calibrated pantry storage vessel.",
            "intended_use": "Pantry storage for grains or coffee beans",
            "difficulty": "Easy",
            "estimated_time": "20 minutes",
            "required_materials": [object_name],
            "required_tools": ["Sponge"],
            "steps": ["Clean container thoroughly", "Air dry and label"],
            "safety_notes": "Inspect edges before reuse.",
            "assumptions_or_limitations": "Requires clean condition."
        }
    ]

# ============================================================================
# 4. EMBEDDED FRONTEND (Vanilla HTML/CSS/JS with zero modules)
# ============================================================================
HTML_UI = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SahiSort — Sort it right. Give it a second life.</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-ivory: #FAF9F4; --surface-white: #FFFFFF; --surface-sage: #EDF4E8;
            --accent-leaf: #4D8B55; --accent-leaf-hover: #3E7345; --accent-spring: #A8D5A2;
            --highlight-lime: #E5F2B8; --warm-apricot: #F3C6A5; --text-charcoal: #29332B;
            --text-olive: #69736A; --border-stone: #E4E7DD; --font-serif: 'Fraunces', serif;
            --font-sans: 'Plus Jakarta Sans', sans-serif; --radius-sm: 8px; --radius-md: 14px;
            --shadow-soft: 0 10px 30px -10px rgba(41, 51, 43, 0.06);
        }
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background-color: var(--bg-ivory); color: var(--text-charcoal); font-family: var(--font-sans); font-size: 16px; line-height: 1.6; }
        h1, h2, h3 { font-family: var(--font-serif); font-weight: 500; color: var(--text-charcoal); margin-top: 0; }
        a { color: inherit; text-decoration: none; }
        .container { width: 100%; max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
        .section-pad { padding: 4rem 0; }
        .surface-card { background-color: var(--surface-white); border: 1px solid var(--border-stone); border-radius: var(--radius-md); padding: 2rem; box-shadow: var(--shadow-soft); margin-bottom: 1.5rem; }
        header { position: sticky; top: 0; z-index: 50; background: rgba(250, 249, 244, 0.95); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border-stone); }
        .nav-bar { display: flex; align-items: center; justify-content: space-between; height: 72px; }
        .brand { display: flex; align-items: center; gap: 0.6rem; font-family: var(--font-serif); font-size: 1.4rem; font-weight: 600; cursor: pointer; }
        .brand-dot { width: 26px; height: 26px; background: var(--accent-leaf); color: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
        .nav-links { display: flex; gap: 0.5rem; align-items: center; }
        .nav-link { padding: 0.4rem 0.8rem; border-radius: var(--radius-sm); font-weight: 500; color: var(--text-olive); cursor: pointer; }
        .nav-link:hover, .nav-link.active { color: var(--text-charcoal); background: var(--surface-sage); }
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border-radius: var(--radius-sm); font-weight: 600; border: 1px solid transparent; cursor: pointer; }
        .btn-primary { background: var(--accent-leaf); color: white; }
        .btn-primary:hover { background: var(--accent-leaf-hover); }
        .btn-secondary { background: white; color: var(--text-charcoal); border-color: var(--border-stone); }
        .pill { display: inline-flex; padding: 0.25rem 0.65rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
        .pill-verified { background: var(--highlight-lime); color: #214B27; border: 1px solid var(--accent-spring); }
        .eyebrow { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-leaf); margin-bottom: 0.5rem; display: block; }
        .grid-2 { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2.5rem; align-items: center; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .input-field, .textarea-field { width: 100%; background: white; border: 1px solid var(--border-stone); border-radius: var(--radius-sm); padding: 0.75rem; font: inherit; }
        .evidence-excerpt { background: var(--bg-ivory); border-left: 4px solid var(--accent-leaf); padding: 1rem; font-family: var(--font-serif); font-style: italic; margin: 1rem 0; }
    </style>
</head>
<body>
    <header>
        <div class="container nav-bar">
            <div class="brand" onclick="navigate('home')">
                <span class="brand-dot">S</span>
                <span>SahiSort</span>
            </div>
            <nav class="nav-links">
                <a class="nav-link" id="nav-home" onclick="navigate('home')">Home</a>
                <a class="nav-link" id="nav-discover" onclick="navigate('discover')">Discover</a>
                <a class="nav-link" id="nav-recreate" onclick="navigate('recreate')">RE:CREATE</a>
                <a class="nav-link" id="nav-collection" onclick="navigate('collection')">Collection</a>
                <a class="nav-link" id="nav-journey" onclick="navigate('journey')">Journey</a>
                <a class="nav-link" id="nav-guide" onclick="navigate('guide')">Guide</a>
                <a class="nav-link" id="nav-about" onclick="navigate('about')">About</a>
            </nav>
        </div>
    </header>

    <main id="app-content" class="container section-pad"></main>

    <script>
        let currentRoute = 'home';
        let routeParam = null;

        async function apiCall(endpoint, options = {}) {
            const res = await fetch(`/api${endpoint}`, options);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error?.message || `HTTP error ${res.status}`);
            }
            return res.json();
        }

        function navigate(route, param = null) {
            currentRoute = route;
            routeParam = param;
            window.location.hash = param ? `${route}/${param}` : route;
            render();
            window.scrollTo(0, 0);
        }

        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '');
            const parts = hash.split('/');
            currentRoute = parts[0] || 'home';
            routeParam = parts[1] || null;
            render();
        });

        async function render() {
            document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
            const activeNav = document.getElementById(`nav-${currentRoute}`);
            if (activeNav) activeNav.classList.add('active');

            const container = document.getElementById('app-content');

            if (currentRoute === 'home') {
                container.innerHTML = `
                    <div class="grid-2">
                        <div>
                            <span class="eyebrow">Material Intelligence Studio</span>
                            <h1 style="font-size: 3.5rem; margin-bottom: 1rem;">Sort it right. Give it a second life.</h1>
                            <p style="font-size: 1.15rem; color: var(--text-charcoal); margin-bottom: 2rem;">
                                Discover what your everyday objects are made of, where they belong, and what they could become next.
                            </p>
                            <div style="display: flex; gap: 1rem;">
                                <button class="btn btn-primary" onclick="navigate('discover')">Discover an Object</button>
                                <button class="btn btn-secondary" onclick="navigate('recreate')">Explore RE:CREATE</button>
                            </div>
                        </div>
                        <div class="surface-card" style="background: linear-gradient(135deg, #FFF, #EDF4E8);">
                            <span class="pill pill-verified" style="margin-bottom: 1rem;">Daylight Specimen Table</span>
                            <h3>Culinary Soda-Lime Glass Jar</h3>
                            <p>Separable tinplate lug cap • Closed-loop cullet OR calibrated pantry tare vessel.</p>
                        </div>
                    </div>
                `;
            } else if (currentRoute === 'discover' && !routeParam) {
                container.innerHTML = `
                    <div style="max-width: 700px; margin: 0 auto;">
                        <span class="eyebrow">Object Intelligence</span>
                        <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">Discover an Object</h1>
                        <p style="margin-bottom: 2rem;">Describe an everyday object to analyze its material composition and disposal guidelines.</p>
                        <form onsubmit="handleDiscover(event)" class="surface-card">
                            <div style="margin-bottom: 1.5rem;">
                                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Object Description</label>
                                <textarea id="disc-desc" rows="4" class="textarea-field" placeholder="e.g., Empty clear glass pasta sauce jar with metal lid..."></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">Analyse Object</button>
                        </form>
                    </div>
                `;
            } else if (currentRoute === 'discover' && routeParam) {
                container.innerHTML = `<div class="surface-card">Loading discovery record...</div>`;
                const d = await apiCall(`/discover/${routeParam}`);
                let recHTML = d.recommendation ? `
                    <div class="surface-card">
                        <span class="pill pill-verified">${d.recommendation.status}</span>
                        <h2 style="font-size: 2rem; margin: 0.5rem 0;">${d.recommendation.disposal_category}</h2>
                        <p>${d.recommendation.reasoning}</p>
                        <h4>Preparation Steps:</h4>
                        <ul>${d.recommendation.preparation_instructions.map(s => `<li>${s}</li>`).join('')}</ul>
                        ${d.recommendation.source_evidence.length > 0 ? `<blockquote class="evidence-excerpt">“${d.recommendation.source_evidence[0].excerpt}”</blockquote>` : ''}
                        <div style="margin-top: 1.5rem;">
                            ${d.disposal_confirmed ? '<span class="pill pill-verified">Confirmed Disposal</span>' : '<button class="btn btn-primary" onclick="confirmDisposal(\''+d.id+'\')">Confirm I Sorted This Object</button>'}
                        </div>
                    </div>
                ` : '';
                container.innerHTML = `
                    <div class="surface-card">
                        <span class="eyebrow">Living Discovery</span>
                        <h1 style="font-size: 2.5rem; margin-bottom: 0.4rem;">${d.object_name}</h1>
                        <p>${d.short_description}</p>
                        <button class="btn btn-secondary" onclick="navigate('recreate', '${d.id}')" style="margin-top: 1rem;">Explore RE:CREATE Studio Ideas</button>
                    </div>
                    ${recHTML}
                `;
            } else if (currentRoute === 'recreate') {
                const discId = routeParam || localStorage.getItem('sahisort_active_discovery_id') || '';
                container.innerHTML = `
                    <div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">RE:CREATE Studio</h1>
                        <p style="margin-bottom: 2rem;">Transform your discovered object into a practical second-life project.</p>
                        <button class="btn btn-primary" onclick="generateProjects('${discId}')" style="margin-bottom: 2rem;">Generate RE:CREATE Blueprints</button>
                        <div id="recreate-results" class="grid-3"></div>
                    </div>
                `;
                if (discId) generateProjects(discId);
            } else if (currentRoute === 'collection') {
                const col = await apiCall('/collection');
                container.innerHTML = `
                    <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">Personal Collection</h1>
                    <div class="grid-3">
                        ${col.discoveries.map(d => `<div class="surface-card"><h3>${d.object_name}</h3><p>${d.short_description}</p><button class="btn btn-secondary" style="width: 100%; margin-top: 1rem;" onclick="navigate('discover', '${d.id}')">Open Record</button></div>`).join('')}
                    </div>
                `;
            } else if (currentRoute === 'journey') {
                const j = await apiCall('/journey');
                container.innerHTML = `
                    <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">Sustainability Journey</h1>
                    <div class="grid-3">
                        <div class="surface-card"><h2>${j.metrics.total_discoveries}</h2><p>Total Discoveries</p></div>
                        <div class="surface-card"><h2>${j.metrics.confirmed_disposal_actions}</h2><p>Confirmed Disposals</p></div>
                    </div>
                `;
            } else if (currentRoute === 'guide') {
                const g = await apiCall('/guide');
                container.innerHTML = `
                    <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">Evidence Guide</h1>
                    <p>${g.guide_title} (${g.jurisdiction})</p>
                    <div style="margin-top: 2rem; display: grid; gap: 1rem;">
                        ${g.passages.map(p => `<div class="surface-card"><strong>${p.section}</strong><blockquote class="evidence-excerpt">“${p.excerpt}”</blockquote></div>`).join('')}
                    </div>
                `;
            } else if (currentRoute === 'about') {
                container.innerHTML = `<div class="surface-card" style="max-width: 800px; margin: 0 auto;"><h1>About SahiSort</h1><p>SahiSort combines material intelligence, municipal disposal guidance, and creative reuse studios.</p></div>`;
            }
        }

        async function handleDiscover(e) {
            e.preventDefault();
            const desc = document.getElementById('disc-desc').value.trim();
            const formData = new URLSearchParams();
            formData.append('description', desc);
            const res = await fetch('/api/discover', { method: 'POST', body: formData });
            const data = await res.json();
            localStorage.setItem('sahisort_active_discovery_id', data.id);
            navigate('discover', data.id);
        }

        async function confirmDisposal(discId) {
            await apiCall(`/discover/${discId}/confirm-disposal`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({followed_route: 'Drop-Off'}) });
            navigate('discover', discId);
        }

        async function generateProjects(discId) {
            if (!discId) return;
            const res = await apiCall(`/discover/${discId}/recreate`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({}) });
            const grid = document.getElementById('recreate-results');
            if (grid) {
                grid.innerHTML = res.projects.map(p => `<div class="surface-card"><h3>${p.title}</h3><p>${p.description}</p></div>`).join('');
            }
        }

        window.addEventListener('load', () => {
            const hash = window.location.hash.replace('#', '');
            if (hash) {
                const parts = hash.split('/');
                currentRoute = parts[0];
                routeParam = parts[1] || null;
            }
            render();
        });
    </script>
</body>
</html>"""

# ============================================================================
# 5. HTTP SERVER & API ROUTING
# ============================================================================
class SahiSortHandler(http.server.BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row

        try:
            if path == "/" or path == "/index.html":
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(HTML_UI.encode("utf-8"))
                return

            if path == "/api/health":
                self._send_json({"status": "ok", "product": "SahiSort"})
            elif path == "/api/guide":
                self._send_json({
                    "configured": True,
                    "guide_title": WASTE_GUIDE["guide_title"],
                    "jurisdiction": WASTE_GUIDE["jurisdiction"],
                    "passage_count": len(WASTE_GUIDE["passages"]),
                    "passages": WASTE_GUIDE["passages"]
                })
            elif path == "/api/collection":
                disc_rows = conn.execute("SELECT * FROM discoveries ORDER BY created_at DESC").fetchall()
                discoveries = []
                for dr in disc_rows:
                    rec_row = conn.execute("SELECT * FROM disposal_recommendations WHERE discovery_id = ?", (dr["id"],)).fetchone()
                    discoveries.append({
                        "id": dr["id"],
                        "object_name": dr["object_name"],
                        "short_description": dr["short_description"],
                        "disposal_confirmed": bool(dr["disposal_confirmed"]),
                        "recommendation": dict(rec_row) if rec_row else None
                    })
                self._send_json({"discoveries": discoveries, "saved_projects": [], "completed_projects": [], "confirmed_disposals": []})
            elif path == "/api/journey":
                tot_disc = conn.execute("SELECT COUNT(*) FROM discoveries").fetchone()[0]
                conf_disp = conn.execute("SELECT COUNT(*) FROM discoveries WHERE disposal_confirmed = 1").fetchone()[0]
                self._send_json({
                    "metrics": {"total_discoveries": tot_disc, "confirmed_disposal_actions": conf_disp, "completed_projects": 0},
                    "methodology_note": "Calculated from local database records."
                })
            elif path.startswith("/api/discover/"):
                disc_id = path.split("/")[3]
                dr = conn.execute("SELECT * FROM discoveries WHERE id = ?", (disc_id,)).fetchone()
                rec_row = conn.execute("SELECT * FROM disposal_recommendations WHERE discovery_id = ?", (disc_id,)).fetchone()
                self._send_json({
                    "id": dr["id"],
                    "object_name": dr["object_name"],
                    "short_description": dr["short_description"],
                    "materials": json.loads(dr["materials"]),
                    "clarification_required": bool(dr["clarification_required"]),
                    "questions": json.loads(dr["questions"]),
                    "disposal_confirmed": bool(dr["disposal_confirmed"]),
                    "recommendation": {
                        "status": rec_row["status"],
                        "disposal_category": rec_row["disposal_category"],
                        "reasoning": rec_row["reasoning"],
                        "preparation_instructions": json.loads(rec_row["preparation_instructions"]),
                        "source_evidence": json.loads(rec_row["source_evidence"])
                    } if rec_row else None
                })
            else:
                self._send_json({"error": {"message": "Not found"}}, 404)
        finally:
            conn.close()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(length) if length > 0 else b""
        body = {}
        if "application/x-www-form-urlencoded" in self.headers.get("Content-Type", ""):
            body = {k: v[0] for k, v in urllib.parse.parse_qs(raw_body.decode("utf-8")).items()}
        elif raw_body:
            try: body = json.loads(raw_body.decode("utf-8"))
            except: pass

        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        try:
            if path == "/api/discover":
                desc = body.get("description", "")
                ai_res = analyze_object(desc)
                disc_id = str(uuid.uuid4())
                now = utc_iso()
                conn.execute(
                    "INSERT INTO discoveries (id, input_type, object_name, short_description, visible_characteristics, materials, uncertainty_notes, clarification_required, questions, clarification_answers, narration_script, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (disc_id, "text", ai_res["object_name"], ai_res["short_description"], json.dumps(ai_res["visible_characteristics"]), json.dumps(ai_res["materials"]), ai_res["uncertainty_notes"], 1 if ai_res["clarification_required"] else 0, json.dumps(ai_res["questions"]), json.dumps({}), ai_res["narration_script"], "NEEDS_CLARIFICATION", now, now)
                )
                eval_res = evaluate_disposal(ai_res["object_name"], ai_res["short_description"], ai_res["materials"], {})
                conn.execute(
                    "INSERT INTO disposal_recommendations (id, discovery_id, status, disposal_category, reasoning, preparation_instructions, conditions_and_exceptions, uncertainty_or_limitations, source_evidence, version, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (str(uuid.uuid4()), disc_id, eval_res["status"], eval_res["disposal_category"], eval_res["reasoning"], json.dumps(eval_res["preparation_instructions"]), json.dumps(eval_res["conditions_and_exceptions"]), eval_res["uncertainty_or_limitations"], json.dumps(eval_res["source_evidence"]), 1, now)
                )
                conn.commit()
                self._send_json({"id": disc_id, "object_name": ai_res["object_name"]})
            elif path.endswith("/confirm-disposal"):
                disc_id = path.split("/")[3]
                conn.execute("UPDATE discoveries SET disposal_confirmed = 1 WHERE id = ?", (disc_id,))
                conn.commit()
                self._send_json({"status": "confirmed"})
            elif path.endswith("/recreate"):
                disc_id = path.split("/")[3]
                dr = conn.execute("SELECT * FROM discoveries WHERE id = ?", (disc_id,)).fetchone()
                projects = generate_projects(dr["object_name"], json.loads(dr["materials"]))
                self._send_json({"projects": projects})
        finally:
            conn.close()

if __name__ == "__main__":
    init_db()
    server = http.server.HTTPServer(("0.0.0.0", PORT), SahiSortHandler)
    print(f"\n[SahiSort] Zero-module master application running at: http://127.0.0.1:{PORT}\n")
    server.serve_forever()