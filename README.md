# Press.hub

Press.hub is a frontend-only news aggregator built for the Innoscripta frontend assessment. It normalizes stories from The Guardian, NewsAPI.ai, and The New York Times into a responsive editorial feed with shareable filters and persistent preferences.

## Features

- Unified, deduplicated feed with independent provider health and retry controls
- Keyword, date, category, and publisher filters stored in the URL
- Source, category, and stable-author preferences stored locally under `presshub.preferences.v1`
- Accessible external article cards, mobile navigation/filter sheets, loading and empty states
- Partial-provider failure handling: one failed provider never hides successful results
- Strict TypeScript, Zod response validation, Vitest component/unit tests, and Playwright flows
- Multi-stage Docker build with Nginx SPA fallback

No sample articles are bundled. If no credentials are configured, the UI intentionally shows an actionable setup state.

## Local development

Requirements: Node.js 22+ and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Add any available keys to `.env.local`:

```dotenv
VITE_GUARDIAN_API_KEY=
VITE_NEWSAPI_AI_API_KEY=
VITE_NYT_API_KEY=
```

All three providers are optional at runtime. Missing keys disable only that provider. Because this is intentionally frontend-only, every `VITE_` value is compiled into the browser bundle and must be treated as public. Use restricted assessment/developer keys, never privileged credentials.

## Verification

```bash
npm run check
npx playwright install chromium
npm run test:e2e
```

The unit suite covers domain codecs, URL canonicalization/deduplication, preferences, normalization, and exact provider request translation. Playwright covers the credential-free configuration state, URL filters, persisted preferences, and mobile navigation.

Real-provider connectivity is a separate manual check because it requires credentials and consumes provider quotas.

## Docker

```bash
docker compose up --build
```

Open `http://localhost:8080`. Compose forwards `.env` values as build arguments. Nginx serves immutable generated assets and falls back to `index.html` for deep React Router URLs such as `/articles?category=science`.

## Deploy to Render

This repository includes `render.yaml` for a Docker web service. In Render, create a new Blueprint and select the repository; Render will use the existing `Dockerfile`, build the Vite bundle, and serve it through Nginx on the Render `PORT`.

Add these environment variables in the Render dashboard before deploying:

```dotenv
VITE_GUARDIAN_API_KEY=
VITE_NEWSAPI_AI_API_KEY=
VITE_NYT_API_KEY=
```

The `VITE_` values are embedded in the browser bundle by design, so treat them as public client-side credentials and apply the providers' usage restrictions where available.

## Architecture

- `src/services/news/providers`: isolated provider adapters, validation, normalization, error mapping, and cursors
- `src/services/news`: normalized contracts, taxonomy, query codec, canonicalization, and aggregation utilities
- `src/features/articles`: independent TanStack Query flows merged into one deterministic feed
- `src/features/preferences`: versioned storage and reactive preference state
- `src/pages`: route-level editorial compositions

Preference groups use OR matching within a group and AND matching across non-empty groups. Provider-qualified authors are selectable only when the API supplies a stable identifier; NYT bylines are displayed but intentionally unavailable as author preferences.

## Provider notes

- Guardian uses authenticated browser `fetch`, sections, contributor tags, and page cursors. Its documented JSONP callback remains a compatibility fallback only if a credentialed deployment proves that CORS blocks browser fetch; JSONP weakens cancellation and content isolation and is therefore not enabled by default.
- NewsAPI.ai uses its POST article endpoint and grouped advanced query structure.
- NYT uses Article Search, `begin_date`/`end_date`, escaped Lucene `fq`, and zero-based pages.
