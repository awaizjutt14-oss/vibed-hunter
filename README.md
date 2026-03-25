# Content Hunter AI

Content Hunter AI is a production-oriented content intelligence web app that discovers safe public signals, clusters emerging topics, explains why they matter, and generates originality-safe content packets for multi-platform publishing.

## Architecture First

Implementation planning lives in [ARCHITECTURE.md](/Users/awaizhassanhanjra/Documents/New%20project/content-hunter-ai/ARCHITECTURE.md).

That document includes:

- final folder architecture
- Prisma domain model
- ingestion pipeline design
- weighted scoring logic
- AI packet generation workflow
- phased roadmap

## Folder Structure

```text
content-hunter-ai/
  app/
    (marketing)/
    (auth)/
    (dashboard)/
    api/
  components/
  lib/
  prisma/
  scripts/
  tests/
```

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-compatible UI primitives
- Prisma + PostgreSQL
- NextAuth credentials scaffold
- Redis + BullMQ queues
- OpenAI structured generation
- Docker + docker-compose
- Vitest + Playwright

## What’s Implemented

### Phase 1 MVP scaffold

- landing page
- auth pages
- dashboard shell
- topic detail page
- packet detail page
- saved ideas page
- content calendar page
- settings page
- admin source manager page

### Data + backend

- Prisma schema for:
  - `User`
  - `UserSettings`
  - `Source`
  - `SourceItem`
  - `TopicCluster`
  - `TrendScore`
  - `ContentPacket`
  - `GeneratedAsset`
  - `KeywordWatch`
  - `DigestRun`
  - `SavedIdea`
  - `JobRun`
  - `AuditLog`
- seed script with demo sources, clusters, and packets
- RSS connector MVP
- connector placeholders for News API, Reddit, YouTube, and Trends
- ingestion service
- trend cluster rebuild service
- weighted scoring formula
- OpenAI packet generation scaffold with structured JSON mode
- background queues and worker entrypoints

### API routes

- `POST /api/ingest/run`
- `POST /api/trends/run`
- `POST /api/packets/generate`
- `GET /api/packets`
- `POST /api/favorites/toggle`
- `POST /api/topics/dismiss`
- `PUT /api/settings`
- `POST /api/digest/run`
- `GET /api/export/[id]`

## Setup

### Easiest way

Double-click:

- `run.command`

To stop it later, double-click:

- `stop.command`

If you prefer Terminal, use the manual setup steps below.

### No-Docker dev mode

If Docker is not installed, `run.command` now switches automatically into a local fallback mode:

- SQLite via Prisma
- no Postgres requirement
- no Redis requirement
- BullMQ workers disabled safely in fallback mode

You can also run it manually:

```bash
cd "/Users/awaizhassanhanjra/Documents/New project/content-hunter-ai"
cp .env.example .env
npm install
export DEV_NO_DOCKER="true"
export DATABASE_URL="file:./dev.db"
npm run prisma:generate:dev
npx prisma db push --schema prisma/schema.dev.prisma
npm run prisma:seed:dev
npm run dev
```

In this mode, the production architecture stays the same, but local development uses SQLite and in-memory queue fallbacks.

### Docker mode

If Docker is available, the app uses the original production-like local stack:

1. Copy envs:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Start Postgres and Redis:

```bash
docker compose up -d postgres redis
```

4. Generate Prisma client:

```bash
npm run prisma:generate
```

5. Run migrations:

```bash
npm run prisma:migrate
```

6. Seed demo data:

```bash
npm run prisma:seed
```

7. Run the app:

```bash
npm run dev
```

8. Optional worker + scheduler:

```bash
npm run jobs:worker
npm run jobs:scheduler
```

## Demo Credentials

Use the values from `.env`:

- `DEMO_ADMIN_EMAIL`
- `DEMO_ADMIN_PASSWORD`

## Core Design Choices

- Server logic is kept under `lib/` and API routes only orchestrate.
- Connectors normalize into a single schema before any scoring or generation happens.
- Scoring is explainable and stored as a structured payload.
- Packet generation is guarded by structured prompts plus validation.
- Demo mode keeps the app explorable before every API is wired.

## TODO Markers For Advanced Integrations

- replace credentials auth with production NextAuth adapter or Clerk
- add production email delivery for digests
- integrate YouTube Data API connector
- integrate Reddit OAuth/API connector
- integrate Google Trends or approved trend API
- add Notion and Google Docs exports
- add team workspaces and role-based controls
- add observability hooks for Sentry / OpenTelemetry

## Tests

Run unit + integration tests:

```bash
npm test
```

Run E2E tests:

```bash
npm run test:e2e
```

## Notes

- This scaffold is designed to be Vercel-friendly on the frontend while still supporting workers and scheduled jobs outside the web process.
- All secrets are environment-driven.
- Content generation is designed to synthesize, not copy, and each packet stores source links plus an originality note.
