# DevLog Design System & Aesthetic Specification (DESIGN.md)

> **Architectural Direction**: *Linear meets Obsidian* — A precision instrument designed for senior engineering teams. High information density, tactile feedback, technical typographic hierarchy, and deliberate omission of generic AI clichés.

---

## 1. Core Visual Tone & Design Philosophy

- **Mode: Operate**: Scanability, spatial predictability, and muscle memory rank above decorative expression. Every pixel serves a purpose.
- **Physicality & Tactility**: Restrained depth achieved through subtle 1px hairline borders (`rgba(255,255,255,0.07)` on dark, `rgba(0,0,0,0.08)` on light) rather than heavy drop-shadows.
- **Technical Provenance**: Monospace accents (`font-mono`) for ticket identifiers, tags, and timestamps to ground the interface in developer workflows.
- **Micro-Interaction Restraint**: Fast, predictable transitions (120ms–180ms ease-out). No sluggish animations, no bouncy cartoon springs, no UI that slows down power users.

---

## 2. Anti-AI-Slop Manifesto (Absolute Bans)

| AI Slop Pattern | Senior Developer Execution | Why |
| :--- | :--- | :--- |
| **Purple/Cyan Mesh Gradients** | Monochromatic zinc surfaces with sharp, single-accent semantics | Generic gradients scream "bootstrapped AI demo"; purposeful contrast denotes high-end craft. |
| **Card Inside Card Nesting** | Flat spatial dividers, subtle tint shifts, and single-depth panels | Nested cards create claustrophobic visual noise and waste valuable screen real estate. |
| **Decorative Floating Glow Blobs** | Precision lighting: cursor-aware hairline border spotlights | Diffuse blurred background circles obscure typography and distract from data. |
| **Emoji as Status Icons** | Curated SVG icons (`lucide-react`) at fixed 14px/16px line weights | Emojis break font metrics, render inconsistently across platforms, and look amateurish. |
| **Sluggish Animations (>300ms)** | 120ms–160ms instant feedback (`cubic-bezier(0.16, 1, 0.3, 1)`) | High-frequency productivity tools must feel instantaneous to keep pace with thought. |
| **Vague Three-Line Hero Copy** | Data-dense headers, search bars, and immediate action bars | Operative workspaces require immediate utility from the first viewport without marketing fluff. |

---

## 3. Color Palette & Token Architecture

DevLog utilizes a high-contrast dark-first palette with warm zinc undertones:

```css
:root {
  /* Surface Tokens (Dark Mode Primary) */
  --bg-canvas: #090a0f;           /* Deep obsidian foundation */
  --bg-surface: #11131a;          /* Elevated panel surface */
  --bg-surface-hover: #181b24;    /* Interactive hover state */
  --bg-surface-active: #202430;   /* Active / pressed state */
  
  /* Border & Hairline Tokens */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-medium: rgba(255, 255, 255, 0.12);
  --border-focus: #6366f1;
  
  /* Typography Tokens */
  --text-primary: #f8fafc;        /* High-contrast headings and body */
  --text-secondary: #94a3b8;      /* Supporting descriptions and labels */
  --text-tertiary: #64748b;       /* Metadata, timestamps, placeholders */
  --text-inverse: #090a0f;
  
  /* Semantic Task Type Indicators */
  --type-feature: #10b981;        /* Emerald / Mint */
  --type-feature-bg: rgba(16, 185, 129, 0.1);
  --type-bug: #f43f5e;            /* Rose */
  --type-bug-bg: rgba(244, 63, 94, 0.1);
  --type-rd: #8b5cf6;             /* Violet / Amethyst */
  --type-rd-bg: rgba(139, 92, 246, 0.1);
  
  /* Priority Semantics */
  --prio-low: #94a3b8;
  --prio-medium: #f59e0b;         /* Amber */
  --prio-high: #ef4444;           /* Crimson */
}
```

---

## 4. Typographic Hierarchy & Scale

- **Display & Headings**: Inter / System Sans-Serif (`font-sans`), -0.02em letter spacing, crisp medium (`500`) and semibold (`600`) weights.
- **Metadata & Identifiers**: JetBrains Mono / SF Mono / Consolas (`font-mono`), tabular numerals (`tabular-nums`), -0.01em tracking.
- **Scale**:
  - `Header 1`: 20px / line-height 28px (`text-xl font-semibold`)
  - `Header 2`: 16px / line-height 24px (`text-base font-semibold`)
  - `Body`: 14px / line-height 20px (`text-sm font-normal`)
  - `Caption / Meta`: 12px / line-height 16px (`text-xs font-medium`)
  - `Code Tag`: 11px / line-height 14px (`text-[11px] font-mono tracking-tight`)

---

## 5. Component Anatomy & Layout Blueprint

### A. Global Shell
- **Slim Sidebar (60px icon-only or 220px compact)**:
  - High-density navigation links with subtle pill indicators.
  - User workspace switcher and avatar with instant status indicator.
- **Top Command Bar (52px height)**:
  - Instant project breadcrumbs (`DevLog / Core Platform / Sprint 4`).
  - Search trigger shortcut (`⌘K`).
  - Active user profile and session action.

### B. Kanban Board & Task Cards
- **Columns**: Fixed 320px width, discrete background surface (`var(--bg-surface)`), count badge with subtle contrast, quick-add button at bottom or column header.
- **Task Cards**:
  - Crisp 1px hairline border (`var(--border-subtle)`).
  - Top header: Monospace ticket key (`DVL-104`) + Task Type badge (`Feature`, `Bug`, `R&D`) + Priority bar icon.
  - Middle: High-legibility title in `text-sm font-medium`.
  - Bottom row: Assignee avatar + Due date badge + Knowledge Base indicator pill (`1 Learning`).
  - Hover: Subtle `translateY(-1px)` and border brightening (`var(--border-medium)`).
  - Active Press: `scale(0.98)` for tactile button feel.

### C. The Learning Logger (Drawer / Modal)
- **Signature Feature**: Dual-pane or collapsible layout.
  - Task specification & acceptance criteria on left.
  - Markdown Learning Logger on right with live preview, syntax highlighting, and chip-based JSON tag input (`#D1`, `#EdgeJWT`, `#Cache`).
  - Quick action: "Promote to Global Knowledge Base".

### D. Global Knowledge Base Search
- **Search Hero**: Sticky search input with instant debounce, tag filter strip, and counter badge.
- **Learning Card Stream**:
  - Markdown formatted blocks with copy-snippet buttons.
  - Task provenance link: `Derived from closed task: DVL-42 (Fix D1 Connection Pool)`.
  - JSON tag pills with click-to-filter capability.

---

## 6. Motion & Interaction Rules

- **Micro-transitions**: `transition: transform 140ms cubic-bezier(0.16, 1, 0.3, 1), border-color 140ms ease, background-color 140ms ease`. Never use `transition: all`.
- **Modals & Drawers**:
  - Modals enter with `scale(0.96) -> scale(1)` and `opacity: 0 -> 1` over 160ms.
  - Drawers slide from right edge with `translateX(100%) -> translateX(0)`.
- **Keyboard Actions**: Instant execution. No transition delay on hotkey-triggered modals or toggles.
- **Reduced Motion**: All animations wrapped with `@media (prefers-reduced-motion: reduce)` fallbacks.
