import type { MatchSummary, WyscoutMatchData } from '@/types/match';
import worldCupIndex from '@/assets/data/world-cup-index.json';

const DATASET_BASE_URL =
  'https://raw.githubusercontent.com/koenvo/wyscout-soccer-match-event-dataset/main/processed/files';

export function getWorldCupMatches(): MatchSummary[] {
  return worldCupIndex.matches as MatchSummary[];
}

export function getMatchById(id: number): MatchSummary | undefined {
  return getWorldCupMatches().find((m) => m.id === id);
}

export async function fetchMatchEvents(matchId: number): Promise<WyscoutMatchData> {
  const url = `${DATASET_BASE_URL}/${matchId}.json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load match data (${response.status}). Check your internet connection.`);
  }

  const data = (await response.json()) as WyscoutMatchData;

  if (!data.events?.length) {
    throw new Error('Match file loaded but contained no events.');
  }

  return data;
}

export function searchMatches(query: string): MatchSummary[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return getWorldCupMatches();

  return getWorldCupMatches().filter(
    (m) =>
      m.homeTeam.toLowerCase().includes(normalized) ||
      m.awayTeam.toLowerCase().includes(normalized) ||
      m.label.toLowerCase().includes(normalized) ||
      m.stage.toLowerCase().includes(normalized)
  );
}
