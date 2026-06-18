import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, Radius, Spacing } from '@/constants/colors';
import type { MatchSummary } from '@/types/match';

interface MatchCardProps {
  match: MatchSummary;
  onPress: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function MatchCard({ match, onPress }: MatchCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${match.homeTeam} versus ${match.awayTeam}`}>
      <View style={styles.header}>
        <Text style={styles.stage}>{match.stage}</Text>
        <Text style={styles.date}>{formatDate(match.date)}</Text>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.teamBlock}>
          <Text style={styles.teamName} numberOfLines={1}>
            {match.homeTeam}
          </Text>
        </View>
        <View style={styles.scoreBlock}>
          <Text style={styles.score}>
            {match.homeScore} - {match.awayScore}
          </Text>
        </View>
        <View style={styles.teamBlock}>
          <Text style={[styles.teamName, styles.teamRight]} numberOfLines={1}>
            {match.awayTeam}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Tap to generate AI report</Text>
        <Ionicons name="chevron-forward" size={16} color={AppColors.accent} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  stage: {
    color: AppColors.accent,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  date: {
    color: AppColors.textMuted,
    fontSize: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  teamBlock: {
    flex: 1,
  },
  teamName: {
    color: AppColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  teamRight: {
    textAlign: 'right',
  },
  scoreBlock: {
    paddingHorizontal: Spacing.md,
  },
  score: {
    color: AppColors.gold,
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  footerText: {
    color: AppColors.textSecondary,
    fontSize: 13,
  },
});
