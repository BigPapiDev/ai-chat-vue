# AI Chat Interface - Design Specification

> Design generato con Google Stitch
> Data: 2026-03-23
> Tema: Material Design 3 (Dark) + Glassmorphism

---

## Panoramica

Interfaccia chat AI con design moderno, effetti glassmorphism, e tema dark basato sui token Material Design 3.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌─────────────────────────────────────┐  │
│  │          │  │  HEADER (64px)                      │  │
│  │ SIDEBAR  │  │  ─────────────────────────────────  │  │
│  │ (260px)  │  │                                     │  │
│  │          │  │  Chat messages area (scrollable)    │  │
│  │ • New    │  │  ─────────────────────────────────  │  │
│  │   Chat   │  │  User bubble (right, primary/20%)   │  │
│  │ • Conv   │  │  AI bubble (left, glass panel)      │  │
│  │   Hist   │  │  Streaming indicator (3 dots)       │  │
│  │ • Prof   │  │                                     │  │
│  │          │  │  ─────────────────────────────────  │  │
│  │          │  │  COMMAND BAR (pill shape)           │  │
│  │          │  │  [🎤] [Text area.......] [Send ▶]   │  │
│  └──────────┘  └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Color System

### Surface Colors (Backgrounds)

| Token | HEX | Usage |
|-------|-----|-------|
| `--surface-darkest` | `#060e20` | Deepest layer |
| `--surface-dark` | `#0b1326` | App background |
| `--surface-base` | `#171f33` | Cards/elevated surfaces |
| `--surface-elevated` | `#131b2e` | Sidebar |
| `--surface-overlay` | `#222a3d` | Hover states |
| `--surface-highest` | `#2d3449` | Borders, dividers |
| `--surface-glass` | `rgba(49,57,77,0.4)` | Glass panels |

### Primary Colors (Interactive)

| Token | HEX | Usage |
|-------|-----|-------|
| `--primary-lightest` | `#d8e2ff` | Text on primary |
| `--primary-light` | `#adc6ff` | Accent text |
| `--primary-base` | `#4d8eff` | Buttons, links |
| `--primary-dark` | `#005ac2` | Pressed states |

### Secondary Colors

| Token | HEX | Usage |
|-------|-----|-------|
| `--secondary-light` | `#b1c6f9` | Secondary text |
| `--secondary-dark` | `#304671` | Secondary containers |

### Tertiary Colors

| Token | HEX | Usage |
|-------|-----|-------|
| `--tertiary-light` | `#ffb786` | Highlights |
| `--tertiary-base` | `#df7412` | Active indicators |
| `--tertiary-lightest` | `#ffdcc6` | Subtle accents |

### Semantic Colors

| Token | HEX | Usage |
|-------|-----|-------|
| `--error-light` | `#ffb4ab` | Error text |
| `--error-dark` | `#93000a` | Error background |
| `--outline-strong` | `#8c909f` | Strong borders |
| `--outline-subtle` | `#424754` | Subtle borders |

### On-Surface Text

| Token | HEX | Usage |
|-------|-----|-------|
| `--on-surface-primary` | `#dae2fd` | Primary text |
| `--on-surface-secondary` | `#c2c6d6` | Secondary text |

---

## Typography

**Font Family:** Inter (Google Fonts)

| Style | Size | Weight | Usage |
|-------|------|--------|-------|
| Headline | 24px | 700 | Page titles |
| Title | 18px | 600 | Section headers |
| Body | 14px | 400 | Messages, content |
| Label | 12px | 500 | Buttons, nav items |
| Caption | 11px | 400 | Timestamps, hints |

---

## Components

### Sidebar (260px fissa)

- **Background:** `--surface-elevated` (#131b2e)
- **Border-right:** 1px solid `--outline-subtle`
- **Sezioni:**
  - Logo/App name (top)
  - "New Chat" button (primary)
  - Conversation history (scrollable)
  - Profile section (bottom)

### Chat Bubbles

**User Message:**
- Background: `--primary-base` at 20% opacity
- Border-radius: `--radius-lg` (0.5rem)
- Padding: `--space-4` (16px)
- Align: flex-end (destra)

**AI Message:**
- Background: `--glass-background` with backdrop-blur(20px)
- Border: `--glass-border`
- Border-radius: `--radius-lg`
- Padding: `--space-4`
- Align: flex-start (sinistra)

### Command Bar

- **Shape:** Pill (`--radius-full`)
- **Background:** `--glass-background`
- **Backdrop:** blur(20px)
- **Border:** `--glass-border`
- **Height:** 56px
- **Elements:**
  - Mic button (left)
  - Text area (center, auto-expand)
  - Send button (right, primary)

### Streaming Indicator

Three dots with staggered animation:
```css
animation: streaming-dot 1.4s ease-in-out infinite;
animation-delay: calc(var(--i) * 0.2s);
```

### Typing Cursor

```css
animation: blink 1s step-end infinite;
```

---

## Effects & Animations

### Glassmorphism

```css
glass-panel {
  background: rgba(49, 57, 77, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

### Micro-interactions

| Interaction | Effect | Duration |
|-------------|--------|----------|
| Hover | `opacity: 0.9`, `translateY(-1px)` | 200ms |
| Active | `scale(0.98)` | 100ms |
| Focus | `ring: 2px solid primary-base` | instant |
| Send | `scale(1.05)` → `scale(1)` | 300ms |

---

## Spacing System

**Grid base:** 4px

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |

**Vertical rhythm:** 16px base, 24px between sections

---

## Layout Dimensions

| Element | Width | Height |
|---------|-------|--------|
| Sidebar | 260px (fixed) | 100vh |
| Header | calc(100% - 260px) | 64px |
| Main area | calc(100% - 260px) | calc(100vh - 64px) |
| Command bar | max-width: 720px | 56px |

---

## Responsive Considerations

- **Desktop (≥1024px):** Full sidebar visibile
- **Tablet (768-1023px):** Sidebar collapsibile (icon only 72px)
- **Mobile (<768px):** Sidebar drawer (overlay)

---

## Assets Needed

- [ ] Inter font (Google Fonts CDN)
- [ ] Microphone icon (Lucide or Heroicons)
- [ ] Send icon (Lucide or Heroicons)
- [ ] User avatar placeholder
- [ ] AI avatar/logo
