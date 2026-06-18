# PlayerNation — AI Match Reports

React Native (Expo) app that turns raw Wyscout event data from FIFA World Cup 2018 into coach-style match reports using Groq's free LLM tier.

## Features

- Browse all 64 FIFA World Cup 2018 matches
- Search by team or stage
- Download event data on-demand from the Wyscout dataset
- Aggregate thousands of events into structured team/player stats
- Generate narrative match reports via Groq (Llama 3.3 70B)
- Polished dark football-themed UI

## Prerequisites

- Node.js 18+
- npm
- [Expo Go](https://expo.dev/go) for quick testing, or Android Studio for emulator
- Free [Groq API key](https://console.groq.com) (no credit card)

## Setup

```bash
cd PlayerNation
npm install
cp .env.example .env
# Edit .env and add your Groq API key
```

Alternatively, enter your API key in the in-app **Settings** tab (stored securely on device).

## Run locally

```bash
npx expo start
```

Press `a` for Android emulator, or scan the QR code with Expo Go.

## Build APK

### Option A: EAS Build (recommended)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

When the build completes, download the APK from the Expo dashboard link.

### Option B: Local build

```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

APK output: `android/app/build/outputs/apk/release/app-release.apk`

## Install APK on device

1. Enable **Install from unknown sources** on your Android device
2. Transfer the APK (USB, email, or cloud link)
3. Open the APK file and tap **Install**
4. Open **PlayerNation**, add your Groq API key in Settings if not baked into the build
5. Select a match and wait ~15 seconds for the report

## Architecture

```
Match List → Fetch Events (GitHub) → Event Processor → Groq LLM → Report UI
```

| Layer | Location | Purpose |
|-------|----------|---------|
| Data index | `assets/data/world-cup-index.json` | Bundled match metadata (64 matches) |
| Event fetch | `lib/data/match-loader.ts` | Downloads raw JSON per match |
| Preprocessing | `lib/data/event-processor.ts` | Aggregates stats, key moments, top players |
| LLM | `lib/llm/groq-client.ts` | Structured JSON report generation |
| UI | `app/(tabs)/`, `app/match/[id].tsx` | Match picker + report display |

See [TECHNICAL_WRITEUP.md](./TECHNICAL_WRITEUP.md) for detailed design decisions.

## LLM configuration

- **Provider:** [Groq](https://groq.com) free tier
- **Model:** `llama-3.3-70b-versatile`
- **Cost:** $0 (free tier limits apply)
- **Key:** Set `EXPO_PUBLIC_GROQ_API_KEY` in `.env` or via in-app Settings

## Dataset

[FIFA World Cup 2018](https://github.com/koenvo/wyscout-soccer-match-event-dataset) from the Wyscout open event dataset (CC BY 4.0).

## Project structure

```
app/                  Expo Router screens
assets/data/          Bundled World Cup match index
components/           UI components
hooks/                useMatchReport hook
lib/data/             Match loading + event processing
lib/llm/              Groq client + prompts
types/                TypeScript interfaces
scripts/              Index generation script
```

## Regenerate match index

```bash
node scripts/generate-world-cup-index.js
```

## License

App code: MIT. Match data: CC BY 4.0 (Wyscout/Figshare).
