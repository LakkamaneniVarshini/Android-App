export interface MatchSummary {
  id: number;
  label: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  stage: string;
}

export interface WyscoutEvent {
  id: number;
  eventId: number;
  eventName: string;
  subEventName: string;
  subEventId: number;
  matchId: number;
  matchPeriod: string;
  eventSec: number;
  playerId: number;
  teamId: number;
  positions: { x: number; y: number }[];
  tags: { id: number }[];
}

export interface WyscoutMatchData {
  events: WyscoutEvent[];
}

export interface TeamStats {
  teamId: number;
  teamName: string;
  passes: number;
  passAccuracy: number;
  shots: number;
  shotsOnTarget: number;
  goals: number;
  fouls: number;
  duelsWon: number;
  duelsTotal: number;
  interceptions: number;
  clearances: number;
  keyPasses: number;
  dangerousBallLost: number;
  possessionEstimate: number;
  finalThirdEntries: number;
  counterAttacks: number;
}

export interface PlayerStats {
  playerId: number;
  teamId: number;
  teamName: string;
  passes: number;
  passAccuracy: number;
  shots: number;
  goals: number;
  assists: number;
  keyPasses: number;
  duelsWon: number;
  interceptions: number;
  fouls: number;
  involvementScore: number;
}

export interface KeyMoment {
  minute: string;
  period: string;
  type: string;
  description: string;
  teamName: string;
  playerId?: number;
}

export interface ProcessedMatchData {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  stage: string;
  totalEvents: number;
  teamStats: [TeamStats, TeamStats];
  topPlayers: PlayerStats[];
  keyMoments: KeyMoment[];
  halfTimeSplit: {
    homeGoals: { firstHalf: number; secondHalf: number };
    awayGoals: { firstHalf: number; secondHalf: number };
  };
}

export interface MatchReport {
  title: string;
  summary: string;
  narrative: string;
  keyMoments: { minute: string; title: string; description: string }[];
  standoutPlayers: { name: string; team: string; performance: string }[];
  teamAnalysis: {
    home: { strengths: string[]; weaknesses: string[] };
    away: { strengths: string[]; weaknesses: string[] };
  };
  patterns: {
    possession: string;
    attacking: string;
    defensive: string;
  };
  actionableInsights: string[];
}

export type ReportGenerationStatus =
  | 'idle'
  | 'loading-events'
  | 'processing'
  | 'generating'
  | 'complete'
  | 'error';
