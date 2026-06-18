import { StyleSheet, Text, View } from 'react-native';

import { AppColors, Radius, Spacing } from '@/constants/colors';

interface ReportSectionProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
}

export function ReportSection({ title, children }: ReportSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

export function ReportParagraph({ text }: { text: string }) {
  return <Text style={styles.paragraph}>{text}</Text>;
}

export function ReportBulletList({ items }: { items: string[] }) {
  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <View key={`${index}-${item.slice(0, 20)}`} style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function InsightCard({ insight, index }: { insight: string; index: number }) {
  return (
    <View style={styles.insightCard}>
      <View style={styles.insightBadge}>
        <Text style={styles.insightBadgeText}>{index + 1}</Text>
      </View>
      <Text style={styles.insightText}>{insight}</Text>
    </View>
  );
}

export function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
  },
  title: {
    color: AppColors.accent,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  content: {
    backgroundColor: AppColors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  paragraph: {
    color: AppColors.text,
    fontSize: 16,
    lineHeight: 26,
  },
  list: {
    gap: Spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    color: AppColors.accent,
    fontSize: 16,
    marginRight: Spacing.sm,
    lineHeight: 24,
  },
  listText: {
    flex: 1,
    color: AppColors.text,
    fontSize: 15,
    lineHeight: 24,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: AppColors.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: 'flex-start',
  },
  insightBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  insightBadgeText: {
    color: AppColors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  insightText: {
    flex: 1,
    color: AppColors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  statPill: {
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    minWidth: 72,
  },
  statValue: {
    color: AppColors.gold,
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: AppColors.textMuted,
    fontSize: 11,
    marginTop: 2,
    textTransform: 'uppercase',
  },
});
