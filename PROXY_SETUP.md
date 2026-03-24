# Gemini API Proxy Setup

Questa soluzione usa un **backend proxy** per nascondere la chiave API Gemini.

## 🏗️ Architettura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vue App       │────▶│  Proxy Server   │────▶│  Gemini API   │
│   (Browser)     │     │   (Express)     │     │  (Google)     │
│                 │◄────│                 │◄────│               │
│                 │ SSE  │  API Key 🔒     │     │               │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 🚀 Setup Rapido

### 1. Installa dipendenze del server

```bash
cd server
npm install
```

### 2. Configura la chiave API

```bash
# Copia il file di esempio
cp .env.example .env

# Modifica .env con la tua chiave
GEMINI_API_KEY=AIzaSyClcyuK4syMerqzW_Qv73f6gIsqUWgns54
```

### 3. Avvia il server

```bash
npm run dev
```

Il server girerà su `http://localhost:3000`

### 4. Aggiorna il frontend

Modifica `src/stores/chat.store.ts` per usare il nuovo composable:

```typescript
// Cambia questa riga:
import { useAIStream } from '@/composables/useAIStream'

// In:
import { useAIStream } from '@/composables/useAIStreamProxy'
```

### 5. Avvia l'app Vue

```bash
# Nella root del progetto (nuovo terminale)
npm run dev
```

## 🔧 API Endpoints

- `POST /api/chat` - Streaming chat (SSE)
- `POST /api/chat-complete` - Non-streaming chat
- `GET /api/health` - Health check

## ✅ Vantaggi

- ✅ **Chiave API nascosta** - Mai esposta al browser
- ✅ **Rate limiting controllato** - Puoi implementarlo nel proxy
- ✅ **Logging e monitoring** - Traccia tutte le richieste
- ✅ **CORS gestito** - Configurato nel server
- ✅ **Fallback** - Puoi aggiungere cache o altre ottimizzazioni

## ⚠️ Note

- Il server deve rimanere attivo durante l'uso dell'app
- Per produzione, deploya il server su un servizio come Railway, Render, o VPS
- Puoi usare lo stesso server per più funzionalità (auth, database, etc.)

## 🔒 Sicurezza

La chiave API è ora:
1. **Nel server** - Accessibile solo lato backend
2. **Mai nel browser** - Nessuna variabile VITE_ esposta
3. **Protetta da CORS** - Solo il tuo frontend può chiamare il proxy
