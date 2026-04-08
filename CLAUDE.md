# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run build:dev    # Development mode build
npm run lint         # ESLint on all TS/TSX files
npm run test         # Run Vitest once
npm run test:watch   # Run Vitest in watch mode
npm run preview      # Preview production build
```

## Architecture

This is a React + TypeScript SPA for AI-powered business travel planning on the Onfly platform. Users go through a linear journey:

```
Login → Index (dashboard) → JourneySetup → JourneyLoading → JourneyOptions → JourneyConfirmed
                                                                           ↗
                                                               AdminMetrics (admin role)
```

**Routing** is in `src/App.tsx` with React Router v6. Protected routes wrap pages requiring auth via `src/components/ProtectedRoute.tsx`.

**Auth** (`src/context/AuthContext.tsx`) uses sessionStorage for session state. Two login methods exist: mock login and Onfly OAuth (CSRF token protected). The `AuthContext` is the single source of truth for user identity.

**All backend data is mocked.** `src/lib/mock-data.ts` contains all users, calendar events, travel recommendation cards, AI terminal logs, and admin metrics. Supabase is wired up (client in `src/integrations/supabase/client.ts`) but the app doesn't currently depend on live data — mock functions simulate async API calls.

**Pages** live in `src/pages/`. The journey flow is:
- `JourneySetup.tsx` — multi-step form: calendar permission grant + preference selection
- `JourneyLoading.tsx` — simulated AI processing with animated terminal log output
- `JourneyOptions.tsx` — three recommendation cards (price / speed / comfort priorities)
- `JourneyConfirmed.tsx` — booking confirmation with confetti animation
- `AdminMetrics.tsx` — charts (Recharts) showing platform metrics

## Key Conventions

**Path alias:** `@/` maps to `src/` — always use this for imports.

**UI components:** Shadcn UI (Radix UI + Tailwind) in `src/components/ui/`. Add new Shadcn components with `npx shadcn-ui@latest add <component>`.

**Styling:** Tailwind utility classes + CSS variables. Dark mode is on by default (`class="dark"` in `index.html`). Custom utility classes are defined in `src/index.css`: `.glass-card`, `.gradient-primary`, `.glow-primary`.

**Animations:** Framer Motion is used extensively. Page transitions use `AnimatePresence`. List items use staggered `variants`. Avoid adding raw CSS animations when Framer Motion can do it.

**Forms:** React Hook Form + Zod for validation. Wire new forms through `@hookform/resolvers/zod`.

**State:** Minimal global state — only `AuthContext`. Page-local state stays in components. React Query is installed but not heavily used yet.

## Environment Variables

Required in `.env` (not committed):
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — Supabase project
- `VITE_GOOGLE_CLIENT_ID` / `VITE_GOOGLE_REDIRECT_URI` — Google OAuth
- `VITE_SESSION_SECRET` — Session signing

## Testing

Tests use Vitest + Testing Library. Setup file at `src/test/setup.ts` configures globals and mocks `window.matchMedia`. E2E tests use Playwright (no test files exist yet).
