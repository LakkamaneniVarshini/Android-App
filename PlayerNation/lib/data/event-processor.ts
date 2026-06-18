import type {
  KeyMoment,
  MatchSummary,
  PlayerStats,
  ProcessedMatchData,
  TeamStats,
  WyscoutEvent,
  WyscoutMatchData,
} from '@/types/match';

const TAG = {
  GOAL: 101,
  OWN_GOAL: 102,
  ASSIST: 301,
  KEY_PASS: 302,
  OPPORTUNITY: 201,
  INTERCEPTION: 1401,
  CLEARANCE: 1501,
  DANGEROUS_BALL_LOST: 2001,
  COUNTER_ATTACK: 1901,
  YELLOW_CARD: 1701,
  RED_CARD: 1702,
} as const;

function hasTag(event: WyscoutEvent, tagId: number): boolean {
  return event.tags?.some((t) => t.id === tagId) ?? false;
}

function formatMinute(period: string, eventSec: number): string {
  const base = period === '2H' ? 45 : period === 'E1' ? 90 : period === 'E2' ? 105 : 0;
  const minute = Math.min(120, Math.floor(base + eventSec / 60));
  return `${minute}'`;
}

function periodLabel(period: string): string {
  switch (period) {
    case '1H':
      return 'First Half';
    case '2H':
      return 'Second Half';
    case 'E1':
      return 'Extra Time 1';
    case 'E2':
      return 'Extra Time 2';
    default:
      return period;
  }
}

function resolveTeams(
  events: WyscoutEvent[],
  match: MatchSummary
): { homeTeamId: number; awayTeamId: number; teamNames: Record<number, string> } {
  const teamCounts = new Map<number, number>();
  for (const e of events) {
    teamCounts.set(e.teamId, (teamCounts.get(e.teamId) ?? 0) + 1);
  }

  const sorted = [...teamCounts.entries()].sort((a, b) => b[1] - a[1]);
  const teamIds = sorted.map(([id]) => id);

  // First team in label is home; map by event volume order is unreliable alone,
  // so we use goal-scorer team alignment when possible.
  let homeTeamId = teamIds[0];
  let awayTeamId = teamIds[1] ?? teamIds[0];

  const homeGoalsFromLabel = match.homeScore;
  const awayGoalsFromLabel = match.awayScore;

  if (teamIds.length >= 2) {
    const goalsByTeam = new Map<number, number>();
    for (const e of events) {
      if (e.eventName === 'Shot' && hasTag(e, TAG.GOAL)) {
        goalsByTeam.set(e.teamId, (goalsByTeam.get(e.teamId) ?? 0) + 1);
      }
    }

    const [a, b] = teamIds;
    const aGoals = goalsByTeam.get(a) ?? 0;
    const bGoals = goalsByTeam.get(b) ?? 0;

    if (aGoals === homeGoalsFromLabel && bGoals === awayGoalsFromLabel) {
      homeTeamId = a;
      awayTeamId = b;
    } else if (bGoals === homeGoalsFromLabel && aGoals === awayGoalsFromLabel) {
      homeTeamId = b;
      awayTeamId = a;
    }
  }

  return {
    homeTeamId,
    awayTeamId,
    teamNames: {
      [homeTeamId]: match.homeTeam,
      [awayTeamId]: match.awayTeam,
    },
  };
}

function computeTeamStats(
  events: WyscoutEvent[],
  teamId: number,
  teamName: string,
  allTeamIds: number[]
): TeamStats {
  const teamEvents = events.filter((e) => e.teamId === teamId);
  const passes = teamEvents.filter((e) => e.eventName === 'Pass');
  const successfulPasses = passes.filter((e) => (e.positions?.length ?? 0) >= 2);
  const shots = teamEvents.filter((e) => e.eventName === 'Shot');
  const goals = shots.filter((e) => hasTag(e, TAG.GOAL)).length;
  const shotsOnTarget = shots.filter((e) => hasTag(e, TAG.OPPORTUNITY) || hasTag(e, TAG.GOAL)).length;
  const fouls = teamEvents.filter((e) => e.eventName === 'Foul').length;
  const duels = teamEvents.filter((e) => e.eventName === 'Duel');
  const duelsWon = duels.filter((e) => e.subEventName?.includes('Won') || hasTag(e, 703)).length;

  const totalTeamEvents = events.filter((e) => allTeamIds.includes(e.teamId)).length;
  const possessionEstimate = totalTeamEvents
    ? Math.round((teamEvents.length / totalTeamEvents) * 100)
    : 50;

  const finalThirdEntries = teamEvents.filter((e) => {
    const x = e.positions?.[0]?.x ?? 0;
    return x >= 66;
  }).length;

  return {
    teamId,
    teamName,
    passes: passes.length,
    passAccuracy: passes.length ? Math.round((successfulPasses.length / passes.length) * 100) : 0,
    shots: shots.length,
    shotsOnTarget,
    goals,
    fouls,
    duelsWon,
    duelsTotal: duels.length,
    interceptions: teamEvents.filter((e) => hasTag(e, TAG.INTERCEPTION)).length,
    clearances: teamEvents.filter((e) => hasTag(e, TAG.CLEARANCE)).length,
    keyPasses: teamEvents.filter((e) => hasTag(e, TAG.KEY_PASS)).length,
    dangerousBallLost: teamEvents.filter((e) => hasTag(e, TAG.DANGEROUS_BALL_LOST)).length,
    possessionEstimate,
    finalThirdEntries,
    counterAttacks: teamEvents.filter((e) => hasTag(e, TAG.COUNTER_ATTACK)).length,
  };
}

function computePlayerStats(
  events: WyscoutEvent[],
  teamNames: Record<number, string>
): PlayerStats[] {
  const byPlayer = new Map<number, WyscoutEvent[]>();

  for (const e of events) {
    if (!e.playerId) continue;
    const list = byPlayer.get(e.playerId) ?? [];
    list.push(e);
    byPlayer.set(e.playerId, list);
  }

  const stats: PlayerStats[] = [];

  for (const [playerId, playerEvents] of byPlayer) {
    const teamId = playerEvents[0].teamId;
    const passes = playerEvents.filter((e) => e.eventName === 'Pass');
    const successfulPasses = passes.filter((e) => (e.positions?.length ?? 0) >= 2);
    const shots = playerEvents.filter((e) => e.eventName === 'Shot');
    const goals = shots.filter((e) => hasTag(e, TAG.GOAL)).length;
    const assists = playerEvents.filter((e) => hasTag(e, TAG.ASSIST)).length;
    const keyPasses = playerEvents.filter((e) => hasTag(e, TAG.KEY_PASS)).length;
    const duelsWon = playerEvents.filter(
      (e) => e.eventName === 'Duel' && (e.subEventName?.includes('Won') || hasTag(e, 703))
    ).length;
    const interceptions = playerEvents.filter((e) => hasTag(e, TAG.INTERCEPTION)).length;
    const fouls = playerEvents.filter((e) => e.eventName === 'Foul').length;

    const involvementScore =
      passes.length * 0.3 +
      keyPasses * 4 +
      goals * 10 +
      assists * 8 +
      shots.length * 2 +
      duelsWon * 1.5 +
      interceptions * 2;

    stats.push({
      playerId,
      teamId,
      teamName: teamNames[teamId] ?? `Team ${teamId}`,
      passes: passes.length,
      passAccuracy: passes.length ? Math.round((successfulPasses.length / passes.length) * 100) : 0,
      shots: shots.length,
      goals,
      assists,
      keyPasses,
      duelsWon,
      interceptions,
      fouls,
      involvementScore: Math.round(involvementScore),
    });
  }

  return stats.sort((a, b) => b.involvementScore - a.involvementScore).slice(0, 12);
}

function extractKeyMoments(
  events: WyscoutEvent[],
  teamNames: Record<number, string>
): KeyMoment[] {
  const moments: KeyMoment[] = [];

  for (const e of events) {
    const minute = formatMinute(e.matchPeriod, e.eventSec);
    const period = periodLabel(e.matchPeriod);
    const teamName = teamNames[e.teamId] ?? `Team ${e.teamId}`;

    if (e.eventName === 'Shot' && hasTag(e, TAG.GOAL)) {
      moments.push({
        minute,
        period,
        type: 'Goal',
        description: `Goal scored (${e.subEventName})`,
        teamName,
        playerId: e.playerId,
      });
    } else if (e.eventName === 'Shot' && hasTag(e, TAG.OPPORTUNITY)) {
      moments.push({
        minute,
        period,
        type: 'Big Chance',
        description: `High-quality chance created (${e.subEventName})`,
        teamName,
        playerId: e.playerId,
      });
    } else if (hasTag(e, TAG.RED_CARD)) {
      moments.push({
        minute,
        period,
        type: 'Red Card',
        description: 'Player sent off',
        teamName,
        playerId: e.playerId,
      });
    } else if (hasTag(e, TAG.YELLOW_CARD)) {
      moments.push({
        minute,
        period,
        type: 'Yellow Card',
        description: 'Booking',
        teamName,
        playerId: e.playerId,
      });
    } else if (e.eventName === 'Penalty') {
      moments.push({
        minute,
        period,
        type: 'Penalty',
        description: e.subEventName,
        teamName,
        playerId: e.playerId,
      });
    }
  }

  // Deduplicate noisy consecutive similar events and cap list
  const seen = new Set<string>();
  const filtered: KeyMoment[] = [];
  for (const m of moments) {
    const key = `${m.minute}-${m.type}-${m.teamName}-${m.playerId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    filtered.push(m);
  }

  return filtered.slice(0, 20);
}

function computeHalfTimeGoals(
  events: WyscoutEvent[],
  homeTeamId: number,
  awayTeamId: number
) {
  const isGoal = (e: WyscoutEvent) => e.eventName === 'Shot' && hasTag(e, TAG.GOAL);

  const count = (teamId: number, periods: string[]) =>
    events.filter((e) => e.teamId === teamId && isGoal(e) && periods.includes(e.matchPeriod)).length;

  return {
    homeGoals: {
      firstHalf: count(homeTeamId, ['1H']),
      secondHalf: count(homeTeamId, ['2H', 'E1', 'E2']),
    },
    awayGoals: {
      firstHalf: count(awayTeamId, ['1H']),
      secondHalf: count(awayTeamId, ['2H', 'E1', 'E2']),
    },
  };
}

export function processMatchEvents(
  data: WyscoutMatchData,
  match: MatchSummary
): ProcessedMatchData {
  const events = data.events;
  const { homeTeamId, awayTeamId, teamNames } = resolveTeams(events, match);
  const allTeamIds = [homeTeamId, awayTeamId];

  const homeStats = computeTeamStats(events, homeTeamId, match.homeTeam, allTeamIds);
  const awayStats = computeTeamStats(events, awayTeamId, match.awayTeam, allTeamIds);

  return {
    matchId: match.id,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    date: match.date,
    stage: match.stage,
    totalEvents: events.length,
    teamStats: [homeStats, awayStats],
    topPlayers: computePlayerStats(events, teamNames),
    keyMoments: extractKeyMoments(events, teamNames),
    halfTimeSplit: computeHalfTimeGoals(events, homeTeamId, awayTeamId),
  };
}

export function processedDataToPromptPayload(data: ProcessedMatchData): string {
  return JSON.stringify(
    {
      match: {
        id: data.matchId,
        date: data.date,
        stage: data.stage,
        scoreline: `${data.homeTeam} ${data.homeScore} - ${data.awayScore} ${data.awayTeam}`,
        totalEventsAnalyzed: data.totalEvents,
      },
      halfTimeGoals: data.halfTimeSplit,
      teamStats: data.teamStats.map((t) => ({
        team: t.teamName,
        possessionEstimatePct: t.possessionEstimate,
        passes: t.passes,
        passAccuracyPct: t.passAccuracy,
        shots: t.shots,
        shotsOnTarget: t.shotsOnTarget,
        goals: t.goals,
        keyPasses: t.keyPasses,
        fouls: t.fouls,
        duelsWon: t.duelsWon,
        interceptions: t.interceptions,
        clearances: t.clearances,
        finalThirdEntries: t.finalThirdEntries,
        counterAttacks: t.counterAttacks,
        dangerousBallLost: t.dangerousBallLost,
      })),
      topPlayers: data.topPlayers.map((p, i) => ({
        rank: i + 1,
        playerId: p.playerId,
        team: p.teamName,
        passes: p.passes,
        passAccuracyPct: p.passAccuracy,
        shots: p.shots,
        goals: p.goals,
        assists: p.assists,
        keyPasses: p.keyPasses,
        duelsWon: p.duelsWon,
        interceptions: p.interceptions,
        involvementScore: p.involvementScore,
      })),
      keyMoments: data.keyMoments,
      note: 'Player names are not in the dataset; refer to top players by playerId and team, or infer likely stars from team/country context only when historically obvious (e.g. Ronaldo for Portugal).',
    },
    null,
    2
  );
}
