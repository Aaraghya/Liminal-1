# Liminal — Technical Documentation

> A comprehensive breakdown of every technology used in Liminal, where it's used, and why.  
> Built for hackathon judges and reviewers.

---

## Table of Contents

- [Frontend Framework](#frontend-framework)
- [Build Tool](#build-tool)
- [Styling & Design System](#styling--design-system)
- [Component Library](#component-library)
- [Animation](#animation)
- [3D Graphics & Shaders](#3d-graphics--shaders)
- [Routing](#routing)
- [State Management](#state-management)
- [Data Fetching](#data-fetching)
- [Icons](#icons)
- [Backend & Database](#backend--database)
- [Authentication](#authentication)
- [File Storage](#file-storage)
- [AI Integration](#ai-integration)
- [Edge Functions & SSE Streaming](#edge-functions--sse-streaming)
- [Typography](#typography)
- [Date Utilities](#date-utilities)
- [Testing](#testing)
- [Architecture Overview](#architecture-overview)
- [Database Schema](#database-schema)
- [Package Versions](#package-versions)

---

## Frontend Framework

### React 18 + TypeScript

**What it is:** React is a JavaScript library for building user interfaces through reusable components. TypeScript adds static type checking on top of JavaScript, catching errors at compile time and improving code maintainability.

**Where it's used:** Every single file in the `src/` directory. React powers the entire UI — from the Landing page to the AI Companion chat interface.

**How it's used:**
- **Functional components with hooks** — all components use `useState`, `useEffect`, `useCallback`, `useRef`, `useMemo` for state and lifecycle management
- **Context API** — `AuthProvider` (authentication state), `ChatProvider` (persistent AI chat messages), and `QueryClientProvider` (data fetching cache) wrap the app in `App.tsx`
- **Custom hooks** — `useAuth()` for authentication, `useChat()` for AI conversation state, `useIsMobile()` for responsive detection, `useToast()` for notifications
- **TypeScript interfaces** — all data shapes are typed (`JournalEntry`, `SavedMessage`, `Post`, `ChatMessage`, `StreamChatOptions`, etc.)
- **Entry point:** `index.html` → `src/main.tsx` → `<App />` rendered via `createRoot`

**Key files:** `src/App.tsx`, `src/main.tsx`, `src/hooks/useAuth.tsx`, `src/contexts/ChatContext.tsx`, every page in `src/pages/`

---

## Build Tool

### Vite

**What it is:** A next-generation build tool that provides instant hot module replacement (HMR) during development and optimized production builds using Rollup under the hood. Significantly faster than Webpack.

**Where it's used:** Project configuration and build pipeline.

**How it's used:**
- `vite.config.ts` — configures path aliases (`@/` maps to `src/`), React plugin via `@vitejs/plugin-react-swc` (uses SWC, a Rust-based compiler ~20x faster than Babel)
- `index.html` — serves as the single entry point; Vite injects the React bundle at build time
- Environment variables — `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY` are loaded from `.env` via Vite's built-in env handling
- Hot module replacement — instant UI updates during development without full page reloads

**Package manager:** Bun (`bun.lockb`) — a fast JavaScript runtime and package manager written in Zig, significantly faster than npm/yarn for installs.

**Key files:** `vite.config.ts`, `index.html`, `.env`, `tsconfig.app.json`

---

## Styling & Design System

### Tailwind CSS

**What it is:** A utility-first CSS framework that lets you style elements directly in JSX using predefined class names. Instead of writing separate CSS files, you compose styles like `rounded-lg bg-primary px-4 py-2.5 text-sm`.

**Where it's used:** Every component and page in the application.

**How it's used:**

- **Semantic color tokens** — all colors are defined as HSL CSS custom properties in `src/index.css` (e.g., `--primary: 260 30% 62%`) and mapped in `tailwind.config.ts` (e.g., `bg-primary`, `text-muted-foreground`). No hardcoded hex/rgb values appear in component code.
- **Dark/light mode** — class-based dark mode (`darkMode: ["class"]`). The `:root` block defines light mode tokens; `.dark` overrides them with the soft charcoal + violet palette. The `ThemeToggle` component toggles the `dark` class on `<html>`.
- **Custom Liminal tokens** — unique to this project:
  - `--surface` / `--surface-foreground` — elevated card surfaces
  - `--lavender` — soft purple accent for emotion tags
  - `--periwinkle` — blue-violet for secondary accents
  - `--indigo-soft` — muted indigo for subtle elements
  - `--glow` — luminous purple for text glow effects
  - `--calm-transition` — `300ms cubic-bezier(0.4, 0, 0.2, 1)` for smooth, calming transitions
- **Custom utilities:**
  - `.text-glow` — CSS text-shadow with glow color for ethereal heading effects
  - `.surface` — applies surface background and foreground colors
  - `.transition-calm` — uses the custom calm cubic-bezier for all transitions
- **Custom keyframes:**
  - `breathe-expand` — 19s infinite expanding/contracting circle for the landing page
  - `fade-in` / `fade-out` — smooth entrance/exit for elements
- **Typography system:**
  - `font-display` → Playfair Display (serif headings)
  - `font-sans` → Funnel Sans (body text)
  - `tracking-calm: 0.01em` — subtle letter-spacing for calm readability
  - `leading-relaxed: 1.8` — generous line height

**Supporting libraries:**
- **tailwind-merge** (`tailwind-merge@^2.6.0`) — intelligently merges Tailwind classes, resolving conflicts (e.g., `bg-red-500 bg-blue-500` → `bg-blue-500`). Used in the `cn()` utility function.
- **clsx** (`clsx@^2.1.1`) — constructs className strings conditionally. Combined with tailwind-merge in `cn()`.
- **class-variance-authority** (`cva@^0.7.1`) — creates typed component variants (e.g., button `variant="outline"`, `size="lg"`). Powers all shadcn/ui component variants.
- **tailwindcss-animate** (`^1.0.7`) — Tailwind plugin providing animation utilities like `animate-pulse`, `animate-spin`, `animate-accordion-down`.

**Key files:** `src/index.css`, `tailwind.config.ts`, `postcss.config.js`, `src/lib/utils.ts`

---

## Component Library

### shadcn/ui (Built on Radix UI)

**What it is:** A collection of beautifully designed, accessible UI components built on top of Radix UI primitives. Unlike a traditional component library, shadcn/ui copies component source code into your project, giving you full ownership and customization control.

**Where it's used:** Form elements, overlays, layout primitives, and interactive components throughout the app.

**How it works:** Components are generated into `src/components/ui/` as actual source files. Each wraps a Radix UI primitive with Tailwind styling. You own the code — full customization without fighting a library API.

**Components actively used in features:**

| Component | Radix Package | Where Used |
|-----------|---------------|------------|
| `ScrollArea` | `@radix-ui/react-scroll-area` | AI Companion chat message container |
| `Textarea` | Native HTML | AI chat input with auto-resize |
| `Slider` | `@radix-ui/react-slider` | Emotion intensity in Say It For Me (Quiet → Deep) |
| `Toaster` | `@radix-ui/react-toast` | Notifications throughout app |
| `Sonner` | `sonner` | Additional toast notifications |
| `TooltipProvider` | `@radix-ui/react-tooltip` | Wraps entire app for global tooltips |
| `Switch` | `@radix-ui/react-switch` | Theme toggle |

**Additional available components (50+ in `src/components/ui/`):** Accordion, AlertDialog, Avatar, Badge, Button, Calendar, Card, Carousel, Checkbox, Collapsible, Command, ContextMenu, Dialog, Drawer, DropdownMenu, Form, HoverCard, InputOTP, Label, Menubar, NavigationMenu, Pagination, Popover, Progress, RadioGroup, Resizable, Select, Separator, Sheet, Sidebar, Skeleton, Table, Tabs, Toggle, ToggleGroup.

**Supporting component libraries:**
- **Vaul** (`vaul@^0.9.9`) — Mobile-friendly bottom sheet drawer
- **cmdk** (`cmdk@^1.1.1`) — Command palette (⌘K style)
- **input-otp** (`input-otp@^1.4.2`) — One-time password input
- **Embla Carousel** (`embla-carousel-react@^8.6.0`) — Lightweight carousel/slider
- **React Resizable Panels** (`react-resizable-panels@^2.1.9`) — Resizable layout panels
- **React Day Picker** (`react-day-picker@^8.10.1`) — Calendar date picker

**Configuration:** `components.json` defines the shadcn registry settings — style, aliases, base color (slate), and CSS variable mode.

**Key files:** `src/components/ui/`, `components.json`

---

## Animation

### Framer Motion (`framer-motion@^12.34.0`)

**What it is:** A production-ready animation library for React. It provides declarative animations through props like `initial`, `animate`, `exit`, and `transition`, plus layout animations and gesture handling.

**Where it's used:** Every page and interactive component in the application.

**Animation catalog:**

| Feature | Animation Type | Implementation |
|---------|---------------|----------------|
| **Page entrances** | Fade-up on mount | `initial={{ opacity: 0, y: 8 }}` → `animate={{ opacity: 1, y: 0 }}` on every page |
| **Landing subtexts** | Crossfade text rotation | `AnimatePresence mode="wait"` cycles through 5 affirmations every 4 seconds |
| **Chat messages** | Staggered fade-in | Each message bubble fades in with `y: 6` slide, `duration: 0.3` |
| **Breathing circle** | Scale sync to phase | `motion.div animate={{ scale: circleScale }}` where scale maps to inhale/hold/exhale |
| **Tubelight navbar** | Shared layout animation | `layoutId="tubelight-bar"` — spring-animated indicator bar slides between tabs (`stiffness: 350, damping: 30`) |
| **Tab glow** | Shared layout animation | `layoutId="tubelight"` — glowing background follows active tab |
| **Emotion expander** | Slide-down reveal | `initial={{ opacity: 0, y: -4 }}` for granular synonym chips |
| **Community create form** | Expand/collapse | `initial={{ opacity: 0, height: 0 }}` with `AnimatePresence` for enter/exit |
| **Comment sections** | Fade-in | Smooth reveal when expanding comment threads |
| **Welcome notification** | Slide-in from right | Spring-animated notification panel with auto-dismiss |
| **Say It For Me result** | Fade reveal | Generated message fades in with `initial={{ opacity: 0 }}` |
| **Auth form** | Entrance animation | `initial={{ opacity: 0, y: 10 }}` on the entire form container |

**Key APIs:** `motion.div`, `AnimatePresence`, `layoutId`, spring physics transitions

---

## 3D Graphics & Shaders

### Three.js (`three@^0.160.1`) + @react-three/fiber (`@react-three/fiber@^8.18.0`)

**What it is:** Three.js is a JavaScript 3D graphics library that uses WebGL to render 3D scenes in the browser. `@react-three/fiber` is a React renderer for Three.js that lets you build 3D scenes using JSX components.

**Where it's used:** Landing page background — a full-screen animated purple shader effect at 30% opacity.

**How it's used:**

1. **Canvas setup** (`LandingShaderBackground.tsx`):
   - `<Canvas>` with transparent background (`gl={{ alpha: true }}`), 75° field of view
   - Fixed position overlay, `pointer-events: none`, 30% opacity
   - Wrapped in `<Suspense>` for lazy loading

2. **Custom GLSL Shaders** (`background-paper-shaders.tsx`):

   **Vertex shader:**
   - Displaces mesh vertices using sine/cosine wave functions over time
   - Creates organic, undulating motion on a 4×4 plane (32×32 subdivisions)
   - Uniforms: `time`, `intensity`

   **Fragment shader:**
   - Blends two purple tones (`#6b4fa0`, `#9b87c2`) using layered sine noise
   - Applies radial glow falloff from center (`1.0 - length(uv - 0.5) * 2.0`)
   - Outputs with transparency for seamless page integration

3. **ShaderPlane component:**
   - Custom `THREE.ShaderMaterial` with `time` and `intensity` uniforms
   - `useFrame` hook updates uniforms every frame: `time` advances at 0.4× speed, `intensity` pulses with sine wave

4. **EnergyRing components:**
   - Two concentric `ringGeometry` meshes at different radii (1.8 and 2.4)
   - Slowly rotate (`rotation.z = elapsedTime * 0.3`) and pulse opacity (0.15 ± 0.1)
   - Create subtle orbital glow behind the breathing circle

**Why Three.js:** The landing page needed an ambient, living visual that couldn't be achieved with CSS alone. Custom GLSL shaders create a unique generative art effect reinforcing Liminal's calm aesthetic.

**Key files:** `src/components/LandingShaderBackground.tsx`, `src/components/ui/background-paper-shaders.tsx`

---

## Routing

### React Router DOM v6 (`react-router-dom@^6.30.1`)

**What it is:** The standard routing library for React single-page applications. Handles URL-based navigation, nested layouts, route protection, and programmatic navigation.

**Where it's used:** `src/App.tsx` (route definitions), every page for navigation.

**Route structure:**
```
/                    → Landing          (public)
/auth                → Auth             (public)
/onboarding          → Onboarding       (public)
/intent              → IntentPage       (protected)
├── /home            → HomePage         (protected, AppLayout shell)
├── /mind-bridge     → MindBridgePage   (Say It For Me)
├── /unsent          → UnsentTextsPage
├── /ai-companion    → AICompanionPage
├── /community       → CommunityPage
├── /breathe         → BreathePage
├── /journal         → JournalPage
├── /profile         → ProfilePage
└── /peer-support    → PeerSupportPage
*                    → NotFound (404)
```

**Key patterns:**
- **Nested routes with layout:** `AppLayout` wraps all authenticated pages via `<Outlet />`, providing the shared header (back button, logo, theme toggle) and bottom tubelight navbar
- **Protected routes:** `ProtectedRoute` component checks `useAuth()` session; redirects to `/auth` if unauthenticated
- **Programmatic navigation:** `useNavigate()` — landing auto-redirects logged-in users to `/home`, first-time users redirected to `/intent`, back button uses `navigate(-1)`
- **Active route detection:** `useLocation()` in AppLayout to conditionally show/hide back button and welcome notification; in tubelight navbar for active indicator positioning

**Key files:** `src/App.tsx`, `src/components/ProtectedRoute.tsx`, `src/components/AppLayout.tsx`

---

## State Management

### React Hooks + Context API

**What it is:** React's built-in state management. `useState` for local state, Context API for global state shared across unrelated components.

**Three context providers (nested in `App.tsx`):**

| Provider | File | Manages | Consumed By |
|----------|------|---------|-------------|
| `AuthProvider` | `useAuth.tsx` | `user`, `session`, `loading` + `signIn()`, `signUp()`, `signOut()` | Every protected page, profile, community, saved messages |
| `ChatProvider` | `ChatContext.tsx` | `messages[]` array + `setMessages()` + `welcomeMessage` | AI Companion page (preserves chat across page navigations) |
| `QueryClientProvider` | `App.tsx` | Server state cache, background refetching | Data fetching operations |

**Local state patterns:**
- **Multi-step forms:** `step` state in MindBridgePage (`"select" | "compose" | "result"`)
- **`localStorage` persistence:** intent selection (`liminal_intent`), onboarding status (`liminal_onboarded`), challenge badges (`mindbridge_badges`), theme preference
- **`sessionStorage` persistence:** welcome notification shown flag (`liminal_welcome_shown`) — only shown once per login session

**Auth state listener:** `supabase.auth.onAuthStateChange()` fires on login, logout, token refresh, and tab focus. Set up BEFORE `getSession()` to avoid race conditions.

---

## Data Fetching

### TanStack React Query (`@tanstack/react-query@^5.83.0`)

**What it is:** A powerful data-fetching and server-state management library that handles caching, background refetching, stale data management, loading/error states, and retry logic.

**Where it's used:** Wraps the entire application via `QueryClientProvider` in `App.tsx`. Provides infrastructure for automatic request deduplication, cache invalidation, and background synchronization.

**Direct Supabase calls** are also used throughout for CRUD operations on community posts, reactions, comments, saved messages, profiles, and journal entries.

---

## Icons

### Lucide React (`lucide-react@^0.462.0`)

**What it is:** A beautiful, consistent icon library with 1000+ SVG icons. Tree-shakable — only imported icons are bundled.

**Icons used across the app:**

| Context | Icons |
|---------|-------|
| **Bottom navbar** | `Home`, `MessageCircle`, `Bot`, `Users`, `BookOpen`, `User`, `Mail` |
| **App header** | `ArrowLeft` (back button) |
| **AI Companion** | `Send` (send message), `Trash2` (clear chat) |
| **Say It For Me** | `Copy`, `RotateCcw` (start over), `Bookmark` (save), `Archive` (view unsent) |
| **Home dashboard** | `Wind` (breathe), `PenLine` (express), `BookOpen` (journal) |
| **Journal** | `Plus` (new entry), `Download` (export as .txt) |
| **Community** | `Heart` (Me Too reaction), `BookOpen` (Helped), `MessageSquare` (comments), `X` (close), `Trash2` (delete), `Send` (post comment), `Plus` (new post) |
| **Profile** | `Camera` (avatar upload), `LogOut` (sign out) |
| **Auth** | `Eye` / `EyeOff` (password visibility toggle) |
| **Theme toggle** | `Sun` / `Moon` |

---

## Backend & Database

### Lovable Cloud (PostgreSQL)

**What it is:** A fully managed PostgreSQL database with automatic REST API generation (PostgREST), Row Level Security (RLS), real-time capabilities, and edge function hosting. Provides authentication, storage, and serverless functions in one platform.

**Where it's used:** All persistent data — user profiles, community posts, journal entries, saved messages, reactions, comments, and avatar storage.

**How it's used:**

The Supabase JavaScript client (`@supabase/supabase-js@^2.95.3`) is initialized in `src/integrations/supabase/client.ts` with session persistence and auto-refresh:

```typescript
import { supabase } from "@/integrations/supabase/client";
```

**Database operations by feature:**

| Feature | Operations | Table(s) |
|---------|-----------|----------|
| **Profile** | Fetch, update profile; upload avatar | `profiles`, `avatars` bucket |
| **Community** | Create/delete posts; toggle reactions; create/delete comments; fetch with aggregation | `community_posts`, `post_reactions`, `post_comments` |
| **Unsent Texts** | Save from Say It For Me; list with ordering; copy; delete | `saved_messages` |
| **Journal** | Create entries with emotion tags | `journal_entries` |

**Row Level Security (RLS):**
Every table has RLS enabled with **restrictive** policies (`PERMISSIVE: No`). Data isolation is enforced at the database level:
- **Private tables** (journal, saved_messages): Users can only SELECT, INSERT, DELETE their own rows (`auth.uid() = user_id`)
- **Public-read tables** (community_posts, reactions, comments): Anyone can SELECT; only authenticated users can INSERT with their own `user_id`; only owners can DELETE
- **Profiles**: Anyone can SELECT (for display names); only owners can UPDATE/INSERT

This means even direct API calls cannot access another user's private data.

**Database functions (triggers):**
- `handle_new_user()` — SECURITY DEFINER trigger on `auth.users` INSERT → auto-creates a `profiles` row with `user_id` and `display_name` from signup metadata
- `update_updated_at_column()` — trigger on `profiles` UPDATE → sets `updated_at = now()`

**Key files:** `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts` (auto-generated)

---

## Authentication

### Lovable Cloud Auth (Email + Password)

**What it is:** A complete authentication system handling user registration, login, email verification, JWT token issuance, session persistence, and automatic token refresh.

**Where it's used:** `Auth.tsx`, `useAuth.tsx`, `ProtectedRoute.tsx`

**Sign Up flow:**
1. User enters email, password, display name on `/auth`
2. `supabase.auth.signUp()` sends confirmation email with redirect URL
3. User clicks email link → session established
4. PostgreSQL trigger `handle_new_user()` auto-creates a `profiles` row
5. First login redirects to `/intent` for intent selection

**Sign In flow:**
1. `supabase.auth.signInWithPassword()` validates credentials
2. Context-aware error messages: "Invalid credentials!" vs generic errors
3. On success → navigate to `/home`
4. JWT stored in `localStorage` with `autoRefreshToken: true`

**Session management:**
- `onAuthStateChange()` listener fires on login, logout, token refresh, tab focus
- `ProtectedRoute` checks `useAuth()` and redirects to `/auth` if unauthenticated
- Landing page auto-redirects logged-in users to `/home`

**UX features:**
- Password visibility toggle (Eye/EyeOff)
- "Remember me" checkbox
- Email confirmation screen with back-to-signin link
- Context-aware error messages
- Minimum 6-character password requirement

**Key files:** `src/pages/Auth.tsx`, `src/hooks/useAuth.tsx`, `src/components/ProtectedRoute.tsx`

---

## File Storage

### Lovable Cloud Storage (S3-compatible)

**What it is:** Object storage for files like images and media, organized in buckets with access policies.

**Where it's used:** Profile avatar uploads.

**How it's used:**
- **Bucket:** `avatars` (public read access)
- **Upload path:** `{user_id}/avatar.{extension}` — namespaced per user
- **Upsert mode:** `supabase.storage.from("avatars").upload(path, file, { upsert: true })` — overwrites previous avatar
- **Public URL:** `supabase.storage.from("avatars").getPublicUrl(path)` — permanent URL stored in `profiles.avatar_url`

**Key file:** `src/pages/ProfilePage.tsx`

---

## AI Integration

### Lovable AI Gateway → Google Gemini 3 Flash Preview

**What it is:** An AI gateway service providing access to large language models through a REST API compatible with the OpenAI chat completions format. Handles authentication, rate limiting, and model routing. The API key (`LOVABLE_API_KEY`) is automatically provisioned as a backend secret.

**Where it's used:** Liminal AI Companion — the real-time streaming chat interface at `/ai-companion`.

**System prompt engineering** (defined in `supabase/functions/mind-bridge-chat/index.ts`):

The AI persona "Liminal AI" is configured with:

1. **Emotional keyword analysis** — continuously scans for:
   - Emotional keywords: overwhelmed, stuck, numb, hopeful, angry, lost
   - Tone indicators: fragmented sentences = distress, question marks = seeking clarity, ellipses = hesitation
   - Intensity markers: all caps, repetition, profanity

2. **Adaptive response rules:**
   - High distress → slower pacing, shorter sentences, more validation, less questioning
   - Anger → acknowledgment without minimizing, space for venting, no "calming" language
   - Numbness → grounding statements, simple presence, no pressure to "feel more"
   - Tentative hope → gentle encouragement without forcing optimism

3. **Core directives:**
   - Validate, don't fix ("I'm here with you" not "Try journaling")
   - Grounded language — no corporate positivity or toxic optimism
   - Non-performative — no emojis, no exclamation marks, no "Good job!"
   - Crisis detection → surfaces hotline numbers (988, Crisis Text Line, IASP)

4. **Formatting rules:** Under 3-4 sentences, no bullet points, no "I understand" openers, natural paragraph breaks

5. **Language adaptation (Hinglish):** Fully understands and responds in Hindi + English mixed in Roman script. Detects user language automatically. Uses natural Indian chat style ("haan yaar, samajh sakta hoon").

**Contextual adaptation:**
The user's selected intent from `/intent` (Mental support, Vent out, Understand my feelings, Calm down, Just explore) is passed as `userContext.journeyStage` and appended to the system prompt to subtly shape tone.

**Error handling:**
- `429` → "Take a breath — try again in a moment."
- `402` → "Usage limit reached. Please add credits."
- `500` → "Something went wrong on our end."
- Frontend catches all errors and shows toast notifications
- `AbortController` support for canceling mid-stream

**Key files:** `supabase/functions/mind-bridge-chat/index.ts`, `src/lib/streamChat.ts`, `src/pages/AICompanionPage.tsx`

---

## Edge Functions & SSE Streaming

### Deno (Serverless Edge Functions)

**What it is:** Deno is a secure JavaScript/TypeScript runtime. Edge functions are serverless functions deployed at the edge for low latency. They execute server-side logic without managing infrastructure.

**Where it's used:** `supabase/functions/mind-bridge-chat/index.ts` — the AI chat backend.

**Architecture:**
```
Browser → fetch(CHAT_URL) → Edge Function → AI Gateway → SSE Stream → Browser
```

**Edge function responsibilities:**
1. Handle CORS preflight (`OPTIONS` → 200 with headers)
2. Parse incoming `{ messages, userContext }` from frontend
3. Build contextual system prompt (base + intent adaptation)
4. Forward to `https://ai.gateway.lovable.dev/v1/chat/completions` with `stream: true`
5. Return raw SSE response body as `text/event-stream`
6. Handle error codes (429, 402, 500) with user-friendly messages

**SSE streaming implementation** (`src/lib/streamChat.ts`):

The frontend implements a robust SSE parser:

1. **Fetch** the edge function with auth header (`Bearer VITE_SUPABASE_PUBLISHABLE_KEY`)
2. **Read** the response body as a `ReadableStream` via `getReader()`
3. **Decode** chunks with `TextDecoder({ stream: true })`
4. **Parse line-by-line:** buffer text, split on `\n`, handle CRLF
5. **Filter:** skip SSE comments (`:` prefix), empty lines, non-`data:` lines
6. **Extract tokens:** parse JSON from `data: {...}`, extract `choices[0].delta.content`
7. **Emit:** call `onDelta(content)` for each token → triggers React state update
8. **Terminate:** detect `data: [DONE]` signal
9. **Flush:** process any remaining buffered text after stream ends
10. **Cleanup:** call `onDone()` callback

**React rendering pattern:**
```typescript
// Each delta token updates the last assistant message in-place
assistantSoFar += chunk;
setMessages(prev => {
  const last = prev[prev.length - 1];
  if (last?.role === "assistant") {
    return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
  }
  return [...prev, { role: "assistant", content: assistantSoFar }];
});
```
This creates a smooth typewriter effect without pushing a new message per token.

**Key files:** `supabase/functions/mind-bridge-chat/index.ts`, `src/lib/streamChat.ts`, `src/pages/AICompanionPage.tsx`, `src/contexts/ChatContext.tsx`

---

## Typography

### Playfair Display + Funnel Sans

**Playfair Display** (serif) — an elegant transitional serif with high contrast and refined letterforms. Evokes quietness and sophistication.
- Used via `font-display` class → page titles ("Say It For Me", "Journal", "Community"), brand name "Liminal", greeting text

**Funnel Sans** (sans-serif) — clean, modern sans-serif optimized for readability at small sizes.
- Used via `font-sans` class (default) → body copy, buttons, labels, navigation, chat messages

**Configuration:**
```typescript
// tailwind.config.ts
fontFamily: {
  sans: ['"Funnel Sans"', 'system-ui', '-apple-system', 'sans-serif'],
  display: ['"Playfair Display"', 'Georgia', 'serif'],
}
```

Fonts loaded via Google Fonts in `index.html`.

---

## Date Utilities

### date-fns (`date-fns@^3.6.0`)

**What it is:** A modern, modular, tree-shakable JavaScript date utility library. Only imported functions are bundled.

**Where it's used:** Journal entries — formatting dates for display.

```typescript
import { format } from "date-fns";
format(new Date(), "MMM d, yyyy") // → "Feb 14, 2026"
```

**Key file:** `src/pages/JournalPage.tsx`

---

## Testing

### Vitest

**What it is:** A Vite-native test framework — fast, ESM-first, and Jest-compatible. Shares Vite's config and transform pipeline for zero configuration duplication.

**Where it's used:** `src/test/` directory, configured in `vitest.config.ts`.

**Key files:** `vitest.config.ts`, `src/test/setup.ts`, `src/test/example.test.ts`

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      FRONTEND (React 18)                      │
│                                                               │
│  Landing ──► Auth ──► Intent ──► AppLayout                    │
│   (Three.js    (Email+     (First-time     (Header +          │
│    shaders)     Pass)       intent)         Tubelight Nav)     │
│                                    │                          │
│                    ┌───────────────┼───────────────┐          │
│                    │               │               │          │
│                  Home         AI Companion     Community       │
│                (Greeting,    (SSE Streaming,  (Anonymous       │
│                 Quick        ChatContext,      Posts,           │
│                 Actions)     Crisis Protocol)  Reactions)       │
│                    │                                           │
│          ┌────────┼────────┐                                  │
│          │        │        │                                  │
│     Say It    Unsent    Breathe    Journal     Profile         │
│     For Me    Texts     (4-7-8)   (Emotion    (Avatar         │
│     (3-step   (CRUD)    (Timer)    Tags,       Upload,         │
│      flow)                         Timeline)   Sign Out)       │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                    STATE MANAGEMENT                            │
│                                                               │
│  AuthProvider ─── ChatProvider ─── QueryClientProvider         │
│  (JWT Session)    (AI Messages     (Server State               │
│                    persist across   Cache)                     │
│                    navigation)                                │
│                                                               │
│  localStorage: intent, badges, onboarding, theme              │
│  sessionStorage: welcome notification flag                    │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                 BACKEND (Lovable Cloud)                        │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐       │
│  │   Auth       │  │  PostgreSQL  │  │   Storage     │       │
│  │ Email+Pass   │  │  6 Tables    │  │   Avatars     │       │
│  │ JWT Tokens   │  │  RLS on all  │  │   (Public)    │       │
│  │ Auto-refresh │  │  2 Triggers  │  │   S3-compat   │       │
│  └──────────────┘  └──────────────┘  └───────────────┘       │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │          Edge Function: mind-bridge-chat              │    │
│  │   Deno Runtime → System Prompt → AI Gateway           │    │
│  │   Google Gemini 3 Flash Preview → SSE Stream          │    │
│  │   Rate limit handling (429/402) → Error responses     │    │
│  └──────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Tables

| Table | Purpose | Key Columns | RLS |
|-------|---------|-------------|-----|
| `profiles` | User profile data | `user_id`, `display_name`, `bio`, `avatar_url`, `created_at`, `updated_at` | View all; update/insert own only |
| `community_posts` | Anonymous community posts | `user_id`, `content`, `type` (vent/reflection/support/etc.), `badge`, `created_at` | View all; create with own ID; delete own |
| `post_reactions` | Reactions on posts | `post_id`, `user_id`, `reaction_type` (me_too/helped), `created_at` | View all; create with own ID; delete own |
| `post_comments` | Comment threads | `post_id`, `user_id`, `content`, `created_at` | View all; create with own ID; delete own |
| `journal_entries` | Private journal | `user_id`, `content`, `emotions[]` (text array), `created_at` | Own data only (SELECT/INSERT/DELETE) |
| `saved_messages` | Unsent texts | `user_id`, `message`, `emotions[]`, `intensity` (int), `tone`, `context`, `created_at` | Own data only (SELECT/INSERT/DELETE) |

### Triggers

| Trigger | Table | Function | Action |
|---------|-------|----------|--------|
| Auto profile creation | `auth.users` INSERT | `handle_new_user()` | Creates `profiles` row with `user_id` + `display_name` |
| Timestamp update | `profiles` UPDATE | `update_updated_at_column()` | Sets `updated_at = now()` |

### Storage

| Bucket | Visibility | Path Pattern | Purpose |
|--------|------------|-------------|---------|
| `avatars` | Public | `{user_id}/avatar.{ext}` | Profile avatar images |

---

## Package Versions

| Package | Version | Category | Purpose |
|---------|---------|----------|---------|
| `react` | ^18.3.1 | Core | UI framework |
| `react-dom` | ^18.3.1 | Core | DOM rendering |
| `react-router-dom` | ^6.30.1 | Core | Client-side routing |
| `framer-motion` | ^12.34.0 | Animation | Page transitions, layout animations |
| `three` | ^0.160.1 | 3D | WebGL graphics engine |
| `@react-three/fiber` | ^8.18.0 | 3D | React renderer for Three.js |
| `@supabase/supabase-js` | ^2.95.3 | Backend | Database client, auth, storage |
| `@tanstack/react-query` | ^5.83.0 | Data | Server state management |
| `lucide-react` | ^0.462.0 | UI | SVG icon library |
| `tailwind-merge` | ^2.6.0 | Styling | Tailwind class conflict resolution |
| `tailwindcss-animate` | ^1.0.7 | Styling | Animation utility classes |
| `class-variance-authority` | ^0.7.1 | Styling | Component variant management |
| `clsx` | ^2.1.1 | Styling | Conditional class joining |
| `date-fns` | ^3.6.0 | Utility | Date formatting |
| `sonner` | ^1.7.4 | UI | Toast notifications |
| `zod` | ^3.25.76 | Validation | Schema validation |
| `react-hook-form` | ^7.61.1 | Forms | Form state management |
| `@hookform/resolvers` | ^3.10.0 | Forms | Form validation resolvers |
| `recharts` | ^2.15.4 | Visualization | Charting library |
| `vaul` | ^0.9.9 | UI | Drawer component |
| `cmdk` | ^1.1.1 | UI | Command palette |
| `input-otp` | ^1.4.2 | UI | OTP input component |
| `embla-carousel-react` | ^8.6.0 | UI | Carousel/slider |
| `react-resizable-panels` | ^2.1.9 | UI | Resizable layouts |
| `react-day-picker` | ^8.10.1 | UI | Calendar/date picker |
| `next-themes` | ^0.3.0 | UI | Theme management |

---

*Built with care for emotional safety. No scores. No streaks. Just space.*
