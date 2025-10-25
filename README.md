# UZH Student Socializer – Web

Scaffold for the MVP frontend built with Next.js (App Router), React, TypeScript, and Tailwind CSS.

## Prerequisites

- Node.js ≥ 18.18.0 (tested with 22.20 via `nvm use 22.20.0`).
- npm 9+.

If you hit permission issues with the global npm cache, set a project-local cache:

```bash
npm_config_cache=../.npm-cache npm install
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to verify the app.

## Project Layout

- `src/app/layout.tsx`: Root metadata + font setup shared across all routes.
- `src/app/page.tsx`: Redirects visitors to `/login` for now.
- `src/app/(auth)`: Gradient layout + sign-in (`/login`) and sign-up (`/register`) screens matching the Figma.
- `src/app/(app)`: Authenticated shell with navigation, hosting:
  - `dashboard`: Event discovery view with placeholder cards and filters.
  - `events`: Create (`/events/new`), detail (`/[eventId]`), and edit (`/[eventId]/edit`) flows.
  - `profile`: Profile summary with segmented history placeholders.
- `public`: Static assets such as icons and images.
- `eslint.config.mjs`, `tsconfig.json`: Linting and TypeScript configuration.

## Upcoming Work

- Define domain models (users, events, RSVPs, categories) and persistence strategy.
- Integrate auth (Supabase, Clerk, or custom) with `@uzh.ch` domain enforcement and protect routes.
- Replace static placeholders with real data access (Supabase client/server actions) and optimistic mutations.
- Add form validation with Zod/React Hook Form and surface slot-capacity logic.
- Build shared UI primitives (event card, filter panel, profile sections) and extract mock data into fixtures.
- Prepare testing strategy (Playwright smoke tests + Vitest for server logic) before enabling real writes.
