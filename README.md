# 🌿 WasteWise
### AI-Powered Waste Identification, Local Municipal Disposal & Creative Reuse Platform

> **SCAN → IDENTIFY → CHECK LOCAL RULE → REUSE OR DISPOSE**  
> For safe items: **SCAN → GET IDEAS → CHOOSE PROJECT → SEE WHAT IT CAN BECOME → FOLLOW STEPS**

WasteWise is a full-stack sustainability product designed to solve confusion at the waste bin. Instead of relying on generic internet recycling advice, WasteWise pairs **multimodal AI material identification** with an **authoritative local waste-management guide** and **practical household reuse generation**.

---

## 🌟 Key Product Pillars

1. **Official Municipal Disposal Intelligence (Authoritative)**
   - All disposal recommendations are derived strictly from the local municipal waste-management guidelines (*Metro Regional Waste & Resource Recovery Guidelines, 2025-2026 Official Edition*).
   - Shows the exact section, page number, and quote verifying the rule.
   - **Zero Hallucination Guarantee:** If a rule does not exist in the guide, WasteWise explicitly displays: *"We couldn't find a matching rule in the local guide"* rather than guessing.

2. **Mixed-Material & Multi-Layer Packaging Analysis**
   - Detects complex composites like poly-coated coffee cups (paperboard + PE plastic liner), snack chip bags (BOPP plastic + vaporized aluminum foil + PE), and toothpaste tubes (ABL laminate).
   - Visually breaks down material layers and explains visible evidence (*"Why we think this"*).

3. **Demonstrated Uncertainty Handling (Zero Blind Confidence)**
   - When a photograph is blurry, dark, distant, or ambiguous, WasteWise does **not** guess.
   - Triggers the *"We're not completely sure"* clarification flow with targeted questions (*"Does the interior have a shiny plastic or metallic coating, or is it plain paper?"*), re-upload options, and description fallbacks.

4. **Strict Safety Override Protocol**
   - Casual DIY reuse is strictly blocked for batteries, chemicals, hazardous materials, electronics, medical waste, or contaminated items.
   - Unsafe items immediately display: **"Reuse isn't recommended for this item"** with a hazard explanation, directing the user exclusively to certified hazardous drop-off facilities.

5. **Best Out of Waste (Practical Creative Reuse)**
   - For safe items, Gemini curates 3–5 realistic, functional projects (hanging planters, self-watering pots, cable organizers, biophilic terrariums, desk caddies).
   - **"What It Can Become" Transformation Visual:** Original item → Finished project concept.
   - **"Show Me How" Interactive Mode:** Fullscreen, step-by-step DIY tutorial with tools, safety notes, progress tracking, and celebratory completion.

6. **User Correction & Audit Trail**
   - Every identification includes *"Is this correct?"* with *"Looks right"* and *"Correct identification"*.
   - Users can adjust the item name, material, or condition. WasteWise re-queries the authoritative municipal guide, tags the record as `User Corrected`, and preserves the audit history.

7. **Persistent Sustainability History & Dashboard**
   - Tracks scans, disposal decisions, reuse choices, and correction status with persistent JSON/SQLite logging.
   - Lightweight metrics: *Items Sorted, Correctly Sorted, Reuse Opportunities, Items Given a Second Life*.

---

## 🎨 Visual Design System

Built to look like an intentional, premium sustainability publication rather than an AI chatbot or template dashboard:
- **Palette:** Warm off-white / cream background (`#FBFBF7`, `#F6F5EE`), deep forest green primary (`#1A382B`, `#12261E`), earthy terracotta (`#C86D49`), sage moss (`#6A8064`), and warm charcoal text (`#1A211D`).
- **Typography:** Editorial serif headings paired with clean, readable sans-serif body text.
- **UI:** Subtle shadows, restrained border radii, custom waste stream badge icons, and tactile micro-interactions.
- **Responsiveness:** Fluid experience across desktop, tablet, and mobile devices (with a dedicated bottom navigation bar).

---

## 🚀 5 Live Demonstration Scenarios

Launch any scenario with a single click from the **Home** or **Scan** page:

| Scenario | Item | What WasteWise Demonstrates | Target Stream |
|---|---|---|---|
| **Demo 1 — Simple Item** | Plastic Water Bottle | Clear PET #1 detection, cap handling instructions, preparation steps (rinse, keep cap tight). | Blue Recycling Cart (Section 4.1, Page 12) |
| **Demo 2 — Mixed Packaging** | Snack Packet (Chips) | Identifies multi-layer BOPP + Aluminum + PE laminate; explains why mechanical delamination fails. | Black/Gray Landfill Cart (Section 7.1, Page 27) |
| **Demo 3 — Unclear Photo** | Blurry / Dark Packaging | Refuses to hallucinate; shows *"We're not completely sure"* and asks a clarifying question with options. | Interactive Clarification Flow |
| **Demo 4 — Best Out of Waste** | Plastic Bottle | Select *"Give it a Second Life"* → Explore Hanging Planter / Self-Watering Planter → Launch *"Show Me How"* step-by-step tutorial. | DIY Upcycling Mode |
| **Demo 5 — Unsafe Item** | AA Battery | Strict safety lock blocks creative reuse (*"Reuse isn't recommended for this item"*); provides terminal-taping prep instructions. | Hazardous Waste Depot (Section 9.1, Page 34) |

---

## 📁 Project Structure

```
hackathon345/
├── package.json                   # Root orchestrator scripts
├── start.js                       # Starts both backend and frontend servers
│
├── server/                        # Express Backend & AI Engine
│   ├── package.json
│   ├── tsconfig.json
│   ├── server.ts                  # REST API endpoints (/api/analyze, /api/disposal, /api/reuse, /api/history)
│   ├── data/
│   │   ├── localWasteGuide.json   # Authoritative municipal guide with quotes, pages, and prep steps
│   │   ├── reuseProjects.json     # Detailed DIY tutorials (materials, tools, safety, steps)
│   │   ├── demoItems.json         # 18+ comprehensive seed items for instant verification
│   │   └── history.json           # Persistent scan & decision history log
│   └── services/
│       ├── geminiService.ts       # Gemini API vision/text engine + local autonomous intelligence
│       ├── guideService.ts        # Grounded RAG rule retriever (never invents rules)
│       ├── reuseService.ts        # Best Out of Waste filter & project generator
│       └── historyService.ts      # Persistent history, user correction, & community metrics
│
└── client/                        # Modern React + Vite Frontend
    ├── package.json
    ├── vite.config.ts             # Vite proxy (/api -> http://localhost:3001)
    ├── tailwind.config.js         # Editorial color palette & typography
    ├── src/
    │   ├── types.ts               # Shared TypeScript interfaces
    │   ├── App.tsx                # App layout, header, footer, mobile navigation
    │   ├── index.css              # Typography & styling
    │   ├── services/
    │   │   └── api.ts             # Full client API client
    │   ├── components/
    │   │   ├── Header.tsx         # Editorial navigation & engine status pill
    │   │   ├── MobileNavigation.tsx # Bottom navigation bar for mobile devices
    │   │   ├── ConfidenceBadge.tsx# High / Medium / Needs clarification badges
    │   │   ├── MaterialBreakdown.tsx # Multi-layer visual breakdown & visible evidence
    │   │   ├── DisposalCard.tsx   # Color-coded stream bin card & preparation checklist
    │   │   ├── GuideEvidenceCard.tsx # "Why does it go here?" quote & citation block
    │   │   ├── ReuseOrDisposeChoice.tsx # Give it a Second Life vs Dispose Responsibly
    │   │   ├── ClarificationModal.tsx # Zero-hallucination clarification dialog
    │   │   ├── CorrectionModal.tsx# User correction editor & re-evaluation
    │   │   ├── TransformationVisual.tsx # "What It Can Become" before/after graphic
    │   │   ├── ProjectCard.tsx    # Best Out of Waste idea cards
    │   │   ├── ProjectDetailModal.tsx # DIY overview & "Show Me How" step-by-step mode
    │   │   ├── SustainabilityStats.tsx # Community impact metrics counter
    │   │   └── ApiKeyModal.tsx    # Optional runtime Gemini API key config dialog
    │   └── pages/
    │       ├── HomePage.tsx       # Hero, transformation visual, quick benefits, demo scenarios
    │       ├── ScanPage.tsx       # Photo upload, camera capture, text describe, disposal results
    │       ├── BestOutOfWastePage.tsx # Upcycling catalog, filters (difficulty, purpose, time)
    │       ├── HistoryPage.tsx    # Persistent audit log, filtering by Reused/Disposed/Corrected
    │       └── WasteGuidePage.tsx # Official municipal guidelines & FAQs
```

---

## 🏃 Running the Application

Both servers are currently running and ready to use:

- **Web Application URL:** [http://localhost:5174/](http://localhost:5174/)
- **Backend API URL:** [http://localhost:3001/api/health](http://localhost:3001/api/health)

To start the application at any time from terminal:
```bash
# Option 1: Start both frontend and backend concurrently
npm start

# Option 2: Run backend and frontend in separate terminals
npm run server  # starts Express backend on port 3001
npm run client  # starts Vite dev server on port 5174
```

---

## 🔑 Gemini API Configuration

WasteWise is engineered with **autonomous local intelligence** covering all 18+ item categories, mixed materials, and the municipal guidelines, functioning completely out of the box with zero setup.

To connect live Google Gemini Multimodal Vision:
1. Click the status pill in the top navigation bar (**"Source: Municipal Guide RAG"**).
2. Enter your Gemini API key in the settings modal.
3. WasteWise will immediately start routing live webcam photos and custom image uploads directly to **Gemini 2.5 Flash**.

Alternatively, set your key in an environment variable before launching:
```bash
$env:GEMINI_API_KEY="AIzaSy..."
```
