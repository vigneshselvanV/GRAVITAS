# GRAVITAS — Autonomous AI Productivity Agent
> "The weight of action."

**One-line pitch:** Not a to-do list. An autonomous AI agent that plans, monitors, replans, and acts on deadlines without waiting for commands.

---

## Problem Statement
**PS1: The Last-Minute Life Saver** — Students and professionals miss deadlines because passive reminder tools don't help them actually complete tasks.

---

## What Makes GRAVITAS Different
- Acts autonomously — detects conflicts, sends nudges, and replans without user prompting
- Real-time AI reasoning — every replan shows WHY the AI made that decision
- Rescue Mode — emergency sprint planning when deadline < 2 hours
- Server-side autonomy — agent acts even when app is closed (Cloud Scheduler)

---

## Core Features
- **Natural Language Task Extraction**: Extracts intent, deadlines, and parameters from conversational input.
- **AI-Powered Micro-Step Planning**: Breaks large tasks into manageable 15-45 minute blocks.
- **Dynamic Replanning**: Auto-rebuilds schedule when steps are missed or delayed.
- **Autonomous Nudge Engine**: Escalating urgency with periodic background checks.
- **Multi-Task Conflict Detection**: Flags when tasks overlap or exceed available bandwidth.
- **Rescue Mode**: Sub-2hr deadline emergency sprints, cutting non-essential steps.
- **AI Reasoning Panel**: "Why I Changed Your Plan" transparency feature.
- **Daily Mission Briefing**: High-level morning summary of at-risk tasks.
- **Extension Email Drafting**: Auto-generates professional delay requests.
- **Mission Control Dashboard**: Live success %, burnout risk, and time-to-failure metrics.
- **Activity Log**: Autonomous action audit trail for full transparency.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS |
| AI Engine | Gemini 2.5 Flash (Google AI Studio) |
| Backend | Node.js / Express (Cloud Functions) |
| Database | Firestore |
| Auth | Firebase Auth (Google Sign-In) |
| Autonomy | Cloud Scheduler |
| Deployment | Google Cloud Run |

---

## Google Technologies Used
- **Gemini 2.5 Flash API** — Core reasoning engine, powering all 6+ agent functions.
- **Google AI Studio** — Development and deployment platform.
- **Cloud Run** — Production hosting.
- **Firebase Auth** — User authentication.
- **Firestore** — Persistent cloud database.
- **Cloud Scheduler** — Autonomous background execution.

---

## Architecture

```text
User Input → Gemini (EXTRACT_TASK) → Firestore
                                          ↓
                          Cloud Scheduler (every 15 min)
                                          ↓
                    Gemini (NUDGE / REPLAN / CONFLICT CHECK)
                                          ↓
                          Firestore → Real-time UI update
```

---

## Setup Instructions

```bash
git clone [repo-url]
cd gravitas
npm install
```

Create `.env` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_key_here
VITE_FIREBASE_CONFIG=your_config_here
```

Run locally:
```bash
npm run dev
```

---

## Demo Flow
1. Sign in with Google
2. Issue a new directive (natural language task)
3. Watch GRAVITAS extract, prioritize, and plan automatically
4. Add a second task — see conflict detection fire
5. Miss a step — watch autonomous replan + AI reasoning
6. Deadline < 2hrs — Rescue Mode activates

---

## Live Demo
Deployed link: (https://ais-pre-3qxaox47mmkm7vukun7ia6-525033774835.asia-east1.run.app)](https://gravitas-960987036807.us-west1.run.app)

---

## Team / Credits
Built for Hackathon — PS1: The Last-Minute Life Saver.
