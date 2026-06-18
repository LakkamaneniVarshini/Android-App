# PlayerNation — Technical Write-up

## Overview

PlayerNation Match Reports is an Expo (React Native) Android app that transforms raw spatio-temporal football event data into readable, actionable match reports. The core engineering challenge is bridging ~3,000 low-level Wyscout events per match and an LLM that can only reason over a compact, structured summary — not a raw event dump.

## Data Pre-processing Approach

### Source

We use the [Wyscout processed event dataset](https://github.com/koenvo/wyscout-soccer-match-event-dataset), specifically the **FIFA World Cup 2018** subset (64 matches). Each match is a JSON file containing an `events` array with fields like `eventName`, `subEventName`, `playerId`, `teamId`, `matchPeriod`, `eventSec`, `positions`, and `tags`.

### Design principle: aggregate first, narrate second

Raw events (~500 KB JSON, 2,500–4,000 events per match) are unsuitable as direct LLM input: they exceed practical context limits, lack player names, and bury signal in noise. Instead, we run a deterministic preprocessing pipeline (`lib/data/event-processor.ts`) that produces a ~2–4 KB structured payload.

### Aggregations computed

**Team-level stats (per side):**
- Pass count and accuracy (tag 1801 = accurate pass)
- Shots, shots on target (tag 201 = opportunity), goals (tag 101)
- Fouls, duels won, interceptions (1401), clearances (1501)
- Key passes (302), dangerous ball losses (2001), counter-attacks (1901)
- Possession estimate (% of total events)
- Final-third entries (x ≥ 66 on pitch coordinates)

**Player-level stats (top 12 by involvement score):**
Weighted score: passes×0.3 + keyPasses×4 + goals×10 + assists×8 + shots×2 + duels×1.5 + interceptions×2

**Key moments (up to 20):**
Goals, big chances, penalties, yellow/red cards — with minute, period, team, and playerId.

**Half-time split:**
Goals scored in 1H vs 2H/extra time for narrative context.

### Team identification

Events contain `teamId` but not team names. We map IDs to home/away using goal counts aligned with the known scoreline from our bundled match index. This handles edge cases where event volume alone would misidentify home/away.

### Known data limitation

The dataset provides `playerId` but not player names in event files. The LLM is instructed to use `Player #12345` format or infer well-known names only when historically obvious (e.g., Ronaldo for Portugal). With more time, we'd join the Figshare players metadata file for proper names.

## Prompt Design

### Structure

- **System prompt:** Role as expert football analyst; ground answers in provided data only; return valid JSON.
- **User prompt:** Embeds the structured JSON payload + explicit output schema.

### Output schema (JSON)

```json
{
  "title", "summary", "narrative",
  "keyMoments": [{ "minute", "title", "description" }],
  "standoutPlayers": [{ "name", "team", "performance" }],
  "teamAnalysis": { "home": { "strengths", "weaknesses" }, "away": {...} },
  "patterns": { "possession", "attacking", "defensive" },
  "actionableInsights": ["..."]
}
```

### Reliability techniques

1. **`response_format: { type: "json_object" }`** — Groq native JSON mode reduces parse failures.
2. **Low temperature (0.4)** — Balances creativity with factual consistency.
3. **Explicit schema in prompt** — Field names and counts specified (4–6 moments, 3–4 players, 2 insights).
4. **Client-side validation** — `parseMatchReport()` checks required fields and strips markdown fences if present.
5. **Retry logic** — Up to 2 retries with backoff on network errors; respects `Retry-After` on 429 rate limits.

## Architecture & Inference Location

```
┌─────────────┐    fetch     ┌──────────────┐
│  Android    │ ──────────►  │ GitHub CDN   │  (match JSON)
│  App        │              └──────────────┘
│             │    aggregate
│             │ ──────────►  event-processor
│             │    prompt
│             │ ──────────►  Groq API (cloud)
│             │    render
│             └──────────►   Report UI
```

**Decision: direct client → Groq API calls**

| Approach | Pros | Cons |
|----------|------|------|
| On-device model | Offline, private | Too large for mobile; quality poor on small models |
| Self-hosted backend | Key hidden; rate limit control | Hosting cost; extra infra |
| **Direct API (chosen)** | Zero cost; fast (Groq); simplest to ship | API key on device; needs network |

For a take-home with zero budget and APK delivery, direct Groq calls win on pragmatism. Keys can be set via `EXPO_PUBLIC_GROQ_API_KEY` at build time or entered in Settings (stored with `expo-secure-store`).

### State management

- **`useMatchReport` hook** — Orchestrates the pipeline with explicit status: `loading-events → processing → generating → complete | error`.
- **No global store** — Single-match flow doesn't warrant Redux/Zustand.
- **Expo Router** — File-based navigation: tabs for list/settings, dynamic `[id]` route for reports.

### Error handling

- Missing API key → actionable message pointing to Settings
- Network failure on event fetch → retry button
- Groq 429 → automatic retry with backoff
- Malformed LLM JSON → caught by parser with clear error

## UI/UX Decisions

- Dark green football palette (`#0B3D2E` primary, gold accents for scores)
- Match cards show stage, date, scoreline, and clear CTA
- Full-screen loading overlay with stage-specific messages
- Report sections mirror coach debrief structure: story → moments → players → analysis → patterns → insights
- Quick stats pills (possession, shots, pass %) from processed data shown above LLM narrative

## Trade-offs & What I'd Improve

**Shipped now:**
- Working end-to-end pipeline from dataset to APK
- 64 World Cup matches selectable
- Structured, repeatable report format

**With more time:**
1. **Player name enrichment** — Join Figshare players JSON at build time
2. **Report caching** — AsyncStorage keyed by matchId to avoid re-generation
3. **Backend proxy** — Hide API key; add usage quotas
4. **Offline fallback** — Template-based report from processed stats when LLM unavailable
5. **xG integration** — Wyscout shot tags include zone data; could estimate chance quality
6. **Visualizations** — Shot map, possession timeline from event coordinates
7. **Unit tests** — Event processor with fixture JSON; prompt parser tests

## Known Limitations

- Requires internet for event download and LLM inference
- Groq free tier has rate limits (~30 req/min depending on account)
- Player names are approximate without metadata join
- Possession is estimated from event counts, not actual time-on-ball
- First report generation takes 10–20 seconds (network + LLM latency)
- API key in client builds is extractable from APK (acceptable for demo; not for production)

## Build & Delivery

APK built via EAS Build (`preview` profile, `buildType: apk`) or local Gradle after `expo prebuild`. The bundled asset is only the 15 KB match index; event files (~500 KB each) download on demand, keeping APK size small (~30–50 MB).
