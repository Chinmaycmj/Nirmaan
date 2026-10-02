# Nirmaan (निर्माण) — AI-Powered Development Platform That Makes You Learn While Building

> **"AI can build with you, but AI should not build everything for you."**

Nirmaan is a web-based development environment where users create real software applications with AI assistance. Unlike conventional AI code generators that turn developers into passive copy-pasters, Nirmaan strategically pauses at foundational engineering concepts, prompting users to personally write and understand the critical logic.

---

## 🌟 Key Features

1. **AI Co-Builder & Tutor**
   - **4 Intervention Levels**:
     - *Tutor*: User writes most code; AI hints, explains, and reviews.
     - *Guided Builder (Default)*: AI generates infrastructure & boilerplate; human implements core concepts.
     - *Collaborative*: Balanced paired programming with periodic checkpoints.
     - *AI Builder*: AI constructs large components; user inspects and analyzes.
2. **7 Human Coding Task Types**
   - **Type A**: Complete the Code (`// YOUR CODE HERE`)
   - **Type B**: Write From Scratch
   - **Type C**: Predict the Output
   - **Type D**: Fix the Bug (debugging state mutations & syntax errors)
   - **Type E**: Explain the Code (natural language evaluation graded by AI)
   - **Type F**: Choose the Correct Approach
   - **Type G**: Modify Existing Features
3. **Progressive 4-Tier Hint Engine**
   - Hint 1: Conceptual
   - Hint 2: Structural / Placement
   - Hint 3: Syntax Pattern
   - Hint 4: Partial Solution Skeleton
   - Solution Unlocked only after all hints have been explored.
4. **Code-to-Preview Connection (Visual Inspector)**
   - Click "Inspect UI" in the live preview to hover over any button, form, or card.
   - Clicking an element instantly jumps the Monaco Editor to the exact file & line, and triggers the conceptual breakdown in the Tutor panel.
5. **Real-Time Sandboxed Preview**
   - In-browser isolated runtime using Babel Standalone, React 18, and Tailwind CSS.
   - Zero security risks on the host; instant sub-second live updates.
6. **Reflective Code Ownership**
   - Tracks line-level authorship (`USER_WRITTEN`, `USER_MODIFIED`, `AI_ASSISTED`, `AI_GENERATED`).
   - Displays real-time ownership progress (e.g. *"You wrote 42% of this application yourself"*).
7. **Concept Knowledge Graph & Milestones Timeline**
   - Visual dependency graph connecting prerequisites across JavaScript, TypeScript, and React.
   - Step-by-step milestone history tracking project evolution.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js v24)
- npm 9+

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/Chinmaycmj/Nirmaan.git
cd Nirmaan

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Automated Tests

```bash
node --test tests/platform.test.mjs
```

### Production Build

```bash
npm run build
npm start
```

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router & Turbopack)
- **Frontend UI**: React 19, Tailwind CSS 4, Lucide Icons
- **Code Editor**: `@monaco-editor/react` (Monaco Editor with custom dark theme)
- **Preview Engine**: Isolated sandboxed `iframe` with Babel Standalone & React 18 UMD
- **AI Abstraction**: Pluggable provider architecture supporting Built-in Offline Intelligent Curriculum, Google Gemini API, OpenAI GPT-4o, and Anthropic Claude.

