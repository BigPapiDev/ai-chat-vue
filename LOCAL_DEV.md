# Sviluppo Locale con Vercel

## Approccio Unificato

Usa Vercel CLI anche in locale per avere la stessa architettura dev/prod.

## Setup Rapido

1. **Installa Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Configura Variabili Locali**
   Crea `.env.local` nella root:
   ```
   GEMINI_API_KEY=AIzaSyClcyuK4syMerqzW_Qv73f6gIsqUWgns54
   ```

3. **Linka il Progetto (prima volta)**
   ```bash
   vercel link
   ```

4. **Avvia Dev Server**
   ```bash
   vercel dev
   ```
   Questo avvia Vite + API functions su localhost:3000

## Comandi Utili

- `vercel dev` - Avvia dev server
- `vercel env pull .env.local` - Scarica variabili da Vercel
- `vercel --prod` - Deploy produzione

## Vantaggi

- Stessa architettura dev/prod
- Una sola soluzione (no Express)
- API key in .env.local (sicuro)
- Hot reload su tutto

## Nota

La cartella server/ e opzionale - con Vercel CLI non serve. Puoi eliminarla.
