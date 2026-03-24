# Intelligence Flux — AI Chat Interface

![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-2.0_Flash-4285F4?logo=google&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-3.0-FFD859?logo=pinia&logoColor=black)
![VueUse](https://img.shields.io/badge/VueUse-14.2-41B883)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Live-000000?logo=vercel&logoColor=white)

🚀 **Live Demo:** [https://ai-chat-vue-six.vercel.app](https://ai-chat-vue-six.vercel.app)

A modern AI chat interface built with **Vue 3.5** and **Gemini API** featuring real-time token-by-token streaming, speech-to-text input, and a dark glassmorphism design. Built to showcase advanced Vue.js competencies.

---

## Vue 3.5 Competencies Demonstrated

- **Composition API avanzata** — `<script setup>` + `defineModel()` for all two-way bindings
- **State management moderno** — Single Pinia store with full TypeScript typing, no props drilling
- **Composables riutilizzabili** — `useAIStream.ts` with exponential backoff retry logic
- **Transizioni native** — `<TransitionGroup>` for message entrance animations (slide-up + fade)
- **Integrazione ecosystem** — VueUse for speech recognition, localStorage persistence, dark mode
- **Streaming reattivo** — Gemini SDK `generateContentStream` with token-by-token reactive ref updates (no polling)

---

## Wow Features

| Feature | Implementation | Why It Impresses |
|---------|---------------|-----------------|
| **Speech-to-text** | `useSpeechRecognition` (VueUse) + Web Speech API | Advanced Vue ecosystem knowledge |
| **Token-by-token streaming** | Gemini SDK `generateContentStream` + reactive ref | Deep understanding of Vue reactivity |
| **Message entrance animations** | `<TransitionGroup>` with CSS slide-up/fade | Vue-specific feature (complex in Angular) |
| **Live markdown rendering** | `marked` v17 + `v-html` | UX polish and attention to detail |
| **Persistent chat state** | `useLocalStorage` (VueUse) in Pinia store | State survives refresh, zero boilerplate |
| **Dark/Light mode** | `useDark` + `useToggle` (VueUse) | Modern UX in <20 lines of code |

---

## Quick Start

```bash
# Install dependencies
npm install

# Configure Gemini API key
cp .env.example .env
# Edit .env and add your VITE_GEMINI_API_KEY

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Gemini API Configuration

- **Model:** `gemini-2.0-flash-exp` (maximum throughput)
- **Config:** `temperature: 0.7, topK: 40, topP: 0.95`
- **Safety:** `BLOCK_NONE` for all categories (demo purposes only — not for production)
- **Multi-turn:** Full conversation history sent for context-aware responses
- **Get a key:** [Google AI Studio](https://aistudio.google.com/apikey)

---

## Architecture

```
src/
├── App.vue                         # Layout: sidebar + header + chat area + TransitionGroup
├── main.ts                         # App bootstrap: Vue + Pinia + Router
├── components/
│   ├── ChatMessage.vue             # Message bubble + markdown (marked) + StreamingCursor
│   ├── ChatInput.vue               # Command bar: defineModel + speech + auto-resize
│   ├── StreamingCursor.vue         # Blinking | cursor (CSS animation)
│   ├── ConversationList.vue        # Sidebar: chat history (presentational)
│   └── DarkModeToggle.vue          # Theme toggle: useDark + useToggle
├── composables/
│   └── useAIStream.ts              # Core: Gemini SDK streaming + retry (3x backoff)
├── stores/
│   └── chat.store.ts               # Pinia: messages, chats, streaming + useLocalStorage
├── types/
│   └── chat.ts                     # Interfaces: Message, Chat, StreamEvent
└── assets/
    └── main.css                    # Tailwind v4 + Material Design 3 dark tokens
```

### Design Pattern

```
Store (Pinia)  ←→  Composable (useAIStream)  ←→  Gemini SDK
      ↕
  Components (presentational, props/emits only)
```

- **State:** Centralized in Pinia — no props drilling
- **Logic:** Business logic in composables
- **UI:** Purely presentational components receiving state via props
- **Persistence:** `useLocalStorage` at store level for automatic sync

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Vue | 3.5.30 | UI framework |
| Pinia | 3.0.4 | State management |
| VueUse | 14.2.1 | Composable utilities |
| @google/generative-ai | 0.24.1 | Gemini streaming SDK |
| Tailwind CSS | 4.2.2 | Utility-first styling |
| marked | 17.0.5 | Markdown rendering |
| TypeScript | 5.9.3 | Type safety |
| Vite | 7.3.1 | Build tool |

---

## Build

```bash
# Type check
npx vue-tsc --noEmit

# Production build
npm run build

# Run tests
npm run test:unit
```

---

## Design

Dark glassmorphism theme based on Material Design 3 tokens, designed with [Google Stitch](https://stitch.withgoogle.com).

- **Surface:** `#0b1326` with glass panels (`backdrop-blur: 20px`)
- **Primary:** `#adc6ff` / `#4d8eff` gradient
- **Typography:** Inter (400–900)
- **Layout:** 260px fixed sidebar + main chat canvas
