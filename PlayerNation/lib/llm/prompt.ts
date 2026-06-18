import type { MatchReport } from '@/types/match';

export const SYSTEM_PROMPT = `You are an expert football analyst writing match reports for players and coaches at PlayerNation.
Your reports must be grounded ONLY in the structured match data provided — do not invent events, scores, or statistics.
Write in clear, engaging prose like a professional coach debriefing the squad.
Return valid JSON only, no markdown fences, matching the exact schema requested.`;

export function buildUserPrompt(matchPayload: string): string {
  return `Analyze this FIFA World Cup 2018 match data and produce a coach-style match report.

STRUCTURED MATCH DATA:
${matchPayload}

Return JSON with this exact structure:
{
  "title": "string — compelling headline for the match",
  "summary": "string — 2-3 sentence overview",
  "narrative": "string — 3-5 paragraph match story covering flow, turning points, and outcome",
  "keyMoments": [
    { "minute": "string", "title": "string", "description": "string" }
  ],
  "standoutPlayers": [
    { "name": "string — use playerId as 'Player #12345' if name unknown, or well-known name if obvious", "team": "string", "performance": "string" }
  ],
  "teamAnalysis": {
    "home": { "strengths": ["string"], "weaknesses": ["string"] },
    "away": { "strengths": ["string"], "weaknesses": ["string"] }
  },
  "patterns": {
    "possession": "string — who controlled the ball and how",
    "attacking": "string — how chances were created",
    "defensive": "string — how teams defended"
  },
  "actionableInsights": ["string — 2 specific coaching takeaways"]
}

Rules:
- Include 4-6 keyMoments drawn from the data (prioritize goals, big chances, cards)
- Include 3-4 standoutPlayers from topPlayers data
- Each teamAnalysis side needs 2-3 strengths and 2-3 weaknesses
- actionableInsights must be specific and practical, not generic
- Do not fabricate statistics not present in the data`;
}

export function parseMatchReport(raw: string): MatchReport {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');

  const parsed = JSON.parse(cleaned) as MatchReport;

  if (!parsed.title || !parsed.summary || !parsed.narrative) {
    throw new Error('LLM response missing required report fields.');
  }

  return {
    title: parsed.title,
    summary: parsed.summary,
    narrative: parsed.narrative,
    keyMoments: parsed.keyMoments ?? [],
    standoutPlayers: parsed.standoutPlayers ?? [],
    teamAnalysis: parsed.teamAnalysis ?? {
      home: { strengths: [], weaknesses: [] },
      away: { strengths: [], weaknesses: [] },
    },
    patterns: parsed.patterns ?? {
      possession: '',
      attacking: '',
      defensive: '',
    },
    actionableInsights: parsed.actionableInsights ?? [],
  };
}
