# Content Hunter AI Architecture Plan

## Product Architecture

The app is organized into five operational agents with a shared data model:

1. `Hunter` connectors ingest public source metadata into `SourceItem`.
2. `Filter` normalization removes duplicates, spam, and broken items while standardizing fields.
3. `Scorer` groups items into `TopicCluster` records and produces explainable `TrendScore` snapshots.
4. `Generator` uses OpenAI structured outputs plus safety prompts to create originality-safe `ContentPacket` assets.
5. `Delivery` surfaces packets in the dashboard, digests, saved ideas, exports, and scheduled jobs.

## Folder Structure

```text
content-hunter-ai/
  app/
    (marketing)/
    (auth)/
    (dashboard)/
    api/
  components/
    dashboard/
    layout/
    packets/
    providers/
    ui/
  lib/
    ai/
    auth/
    db/
    ingestion/
      connectors/
    jobs/
    scoring/
    trends/
    utils/
    validation/
  prisma/
  scripts/
  tests/
    unit/
    integration/
    e2e/
```

## Ingestion Pipeline

1. Fetch from connector modules with retry-safe, source-specific adapters.
2. Normalize each result into a shared object with title, summary, url, publish time, tags, region, language, and engagement metadata.
3. Generate dedupe keys from canonical title + url + source.
4. Merge near-duplicates into topic clusters using shared normalized keywords and cosine-like token overlap heuristics.
5. Persist raw items, then recompute cluster scores and packet generation eligibility.

## Scoring Logic

Weighted default scoring:

- freshness: `0.22`
- momentum: `0.18`
- audience fit: `0.16`
- originality potential: `0.14`
- visual content potential: `0.12`
- postability: `0.10`
- source diversity: `0.05`
- novelty: `0.03`

Each score is stored with a human-readable explanation payload so the UI can show why a topic ranked highly.

## AI Packet Workflow

1. Gather cluster summary + source citations + user settings.
2. Create structured prompt with guardrails:
   - synthesize only
   - no copying
   - uncertain claims labeled
   - source links included
3. Request JSON output with hooks, captions, scripts, thumbnails, CTAs, risks, and confidence.
4. Validate response via Zod before saving.
5. Fall back to deterministic template generation in demo mode or API failure.

## Delivery + Jobs

- `ingestionQueue`: source syncs
- `analysisQueue`: clustering + trend rescoring
- `packetQueue`: packet generation
- `digestQueue`: digest email assembly
- `maintenanceQueue`: cache refresh + stale cleanup

## Phasing

- Phase 1: auth shell, dashboard MVP, schema, RSS/news ingestion, basic scoring, packet generation
- Phase 2: Reddit, YouTube, Trends connectors, personalization, digests, richer score explanations
- Phase 3: calendar, exports, analytics, admin tuning, team workflows
