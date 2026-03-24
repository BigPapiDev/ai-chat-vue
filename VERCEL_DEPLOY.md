# Deploy su Vercel con API Key Nascosta

## 🎯 Architettura Vercel

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Vue App       │────▶│  Vercel Function     │────▶│  Gemini API     │
│   (Static)      │     │  /api/chat           │     │  (Google)       │
│                 │◄────│  API Key 🔒          │◄────│                 │
│                 │ SSE  │  (Serverless)        │     │                 │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
```

## 🚀 Setup Vercel

### 1. Configura Environment Variable su Vercel

Vai su [Vercel Dashboard](https://vercel.com/dashboard) → Il tuo progetto → Settings → Environment Variables

Aggiungi:
- **Name**: `GEMINI_API_KEY`
- **Value**: `AIzaSyClcyuK4syMerqzW_Qv73f6gIsqUWgns54`
- **Environment**: Production (e Preview se vuoi)

### 2. Modifica lo Store

Cambia `src/stores/chat.store.ts` riga 12:

```typescript
// Da:
import { useAIStream } from '@/composables/useAIStream'

// A:
import { useAIStream } from '@/composables/useAIStreamVercel'
```

### 3. Deploy

```bash
# Commit e push
git add .
git commit -m "Add Vercel serverless function for Gemini API"
git push

# O deploy manuale
vercel --prod
```

## 📁 File Creati

```
ai-chat-vue/
├── api/
│   └── chat.js              # Vercel Serverless Function
├── src/
│   └── composables/
│       └── useAIStreamVercel.ts  # Client per Vercel
├── vercel.json              # Config Vercel
└── VERCEL_DEPLOY.md         # Questa guida
```

## ⚠️ Importante

1. **Non committare .env** - La chiave va solo su Vercel dashboard
2. **api/chat.js** - Deve essere nella cartella `/api` per essere riconosciuto come serverless function
3. **Local dev** - Per testare localmente, usa `vercel dev` (installa `npm i -g vercel`)

## 🔧 Sviluppo Locale

```bash
# Installa CLI Vercel
npm i -g vercel

# Login (prima volta)
vercel login

# Link progetto
vercel link

# Avvia dev server con funzioni
vercel dev
```

Questo avvia sia il frontend Vue sia le API functions.

## ✅ Vantaggi

- ✅ **Chiave nascosta** - Solo Vercel la vede
- ✅ **Gratuito** - 100GB bandwidth/mese
- ✅ **Serverless** - Scala automaticamente
- ✅ **Stesso dominio** - No problemi CORS
