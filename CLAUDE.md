# AI Chat Vue 3.5 — Gemini Streaming

## Stack & Versioni
- Vue 3.5 + TypeScript (obbligatorio <script setup> sempre)
- Gemini API (@google/generative-ai) con streaming SSE
- Pinia stato globale (un solo store: chat.store.ts)
- VueUse composables per logica riutilizzabile
- TailwindCSS v4 (usa STITCH_DESIGN.md tokens)
- Vite build tool

## Regole Architetturali
1. **State**: Tutto lo stato condiviso in Pinia store (nessun props drilling)
2. **Logic**: Tutta la business logic in composables (useAIStream.ts)
3. **UI Components**: Puramente presentazionali, ricevono state via props
4. **Vue 3.5 Features**:
   - Usa `defineModel()` per tutti i due-way binding (input, toggle)
   - Usa `<TransitionGroup>` per animazioni liste messaggi
   - Tipizzazione rigorosa con interfaces/types
5. **Streaming**:
   - SSE via `useEventSource` (VueUse) mai polling
   - Token per token inserito in ref reattivo
   - Gestione errori con retry esponenziale (max 3 tentativi)

## Gemini Specifics
- Modello: `gemini-2.0-flash-exp` (massimo throughput)
- Config: `{ temperature: 0.7, topK: 40, topP: 0.95 }`
- Safety settings: `BLOCK_NONE` per demo (aggiungi nota in README)
- Streaming: `streamGenerateContent` con handler su ogni chunk
