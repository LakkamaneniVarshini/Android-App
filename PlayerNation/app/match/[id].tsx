import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingOverlay } from '@/components/loading-overlay';
import {
  InsightCard,
  ReportBulletList,
  ReportParagraph,
  ReportSection,
  StatPill,
} from '@/components/report-section';
import { AppColors, Radius, Spacing } from '@/constants/colors';
import { getMatchById } from '@/lib/data/match-loader';
import { useMatchReport } from '@/hooks/use-match-report';

export default function MatchReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const matchId = parseInt(id ?? '0', 10);
  const match = getMatchById(matchId);
  const { status, report, processedData, error, generate } = useMatchReport();

  useEffect(() => {
    if (matchId) {
      generate(matchId);
    }
  }, [matchId, generate]);

  const handleRetry = useCallback(() => {
    if (matchId) generate(matchId);
  }, [matchId, generate]);

  if (!match) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Match not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <LoadingOverlay status={status} />

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {match.homeTeam} vs {match.awayTeam}
          </Text>
          <Text style={styles.topBarScore}>
            {match.homeScore} - {match.awayScore}
          </Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {error && status === 'error' && (
        <View style={styles.errorBox}>
          <Ionicons name="warning" size={24} color={AppColors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      )}

      {report && processedData && (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.summary}>{report.summary}</Text>

          {processedData.teamStats.length === 2 && (
            <View style={styles.statsRow}>
              <StatPill
                label="Possession"
                value={`${processedData.teamStats[0].possessionEstimate}%`}
              />
              <StatPill label="Shots" value={processedData.teamStats[0].shots} />
              <StatPill label="Pass %" value={`${processedData.teamStats[0].passAccuracy}%`} />
              <StatPill
                label="Possession"
                value={`${processedData.teamStats[1].possessionEstimate}%`}
              />
            </View>
          )}

          <ReportSection title="Match Story">
            <ReportParagraph text={report.narrative} />
          </ReportSection>

          {report.keyMoments.length > 0 && (
            <ReportSection title="Key Moments">
              {report.keyMoments.map((moment, i) => (
                <View key={`${moment.minute}-${i}`} style={styles.momentRow}>
                  <View style={styles.minuteBadge}>
                    <Text style={styles.minuteText}>{moment.minute}</Text>
                  </View>
                  <View style={styles.momentContent}>
                    <Text style={styles.momentTitle}>{moment.title}</Text>
                    <Text style={styles.momentDesc}>{moment.description}</Text>
                  </View>
                </View>
              ))}
            </ReportSection>
          )}

          {report.standoutPlayers.length > 0 && (
            <ReportSection title="Standout Players">
              {report.standoutPlayers.map((player, i) => (
                <View key={`${player.name}-${i}`} style={styles.playerRow}>
                  <View style={styles.playerAvatar}>
                    <Ionicons name="person" size={20} color={AppColors.accent} />
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>
                      {player.name} · {player.team}
                    </Text>
                    <Text style={styles.playerPerf}>{player.performance}</Text>
                  </View>
                </View>
              ))}
            </ReportSection>
          )}

          <ReportSection title="Team Analysis">
            <Text style={styles.teamLabel}>{match.homeTeam}</Text>
            <Text style={styles.analysisSub}>Strengths</Text>
            <ReportBulletList items={report.teamAnalysis.home.strengths} />
            <Text style={[styles.analysisSub, { marginTop: Spacing.sm }]}>Weaknesses</Text>
            <ReportBulletList items={report.teamAnalysis.home.weaknesses} />

            <Text style={[styles.teamLabel, { marginTop: Spacing.md }]}>{match.awayTeam}</Text>
            <Text style={styles.analysisSub}>Strengths</Text>
            <ReportBulletList items={report.teamAnalysis.away.strengths} />
            <Text style={[styles.analysisSub, { marginTop: Spacing.sm }]}>Weaknesses</Text>
            <ReportBulletList items={report.teamAnalysis.away.weaknesses} />
          </ReportSection>

          <ReportSection title="Patterns">
            <Text style={styles.patternLabel}>Possession</Text>
            <ReportParagraph text={report.patterns.possession} />
            <Text style={[styles.patternLabel, { marginTop: Spacing.md }]}>Attacking</Text>
            <ReportParagraph text={report.patterns.attacking} />
            <Text style={[styles.patternLabel, { marginTop: Spacing.md }]}>Defensive</Text>
            <ReportParagraph text={report.patterns.defensive} />
          </ReportSection>

          {report.actionableInsights.length > 0 && (
            <ReportSection title="Coaching Insights">
              {report.actionableInsights.map((insight, i) => (
                <InsightCard key={i} insight={insight} index={i} />
              ))}
            </ReportSection>
          )}

          <Text style={styles.footer}>
            Generated from {processedData.totalEvents.toLocaleString()} events · {match.stage}
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  topBarTitle: {
    color: AppColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  topBarScore: {
    color: AppColors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  scroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },
  reportTitle: {
    color: AppColors.text,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: Spacing.sm,
  },
  summary: {
    color: AppColors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  momentRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  minuteBadge: {
    backgroundColor: AppColors.primaryLight,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginRight: Spacing.sm,
    alignSelf: 'flex-start',
  },
  minuteText: {
    color: AppColors.gold,
    fontWeight: '700',
    fontSize: 13,
  },
  momentContent: {
    flex: 1,
  },
  momentTitle: {
    color: AppColors.text,
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 2,
  },
  momentDesc: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  playerRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: AppColors.text,
    fontWeight: '600',
    fontSize: 15,
  },
  playerPerf: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  teamLabel: {
    color: AppColors.text,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: Spacing.sm,
  },
  analysisSub: {
    color: AppColors.accent,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  patternLabel: {
    color: AppColors.accent,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  footer: {
    color: AppColors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  errorBox: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: AppColors.surface,
    borderRadius: Radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.error,
  },
  errorText: {
    color: AppColors.text,
    fontSize: 15,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  retryButton: {
    marginTop: Spacing.md,
    backgroundColor: AppColors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  retryText: {
    color: AppColors.primary,
    fontWeight: '700',
  },
});
