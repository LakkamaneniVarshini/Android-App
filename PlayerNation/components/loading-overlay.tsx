import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppColors, Radius, Spacing } from '@/constants/colors';
import type { ReportGenerationStatus } from '@/types/match';

const STATUS_MESSAGES: Record<Exclude<ReportGenerationStatus, 'idle' | 'complete' | 'error'>, string> = {
  'loading-events': 'Downloading match events…',
  processing: 'Analyzing 3,000+ events…',
  generating: 'Writing your coach report…',
};

interface LoadingOverlayProps {
  status: ReportGenerationStatus;
}

export function LoadingOverlay({ status }: LoadingOverlayProps) {
  if (status === 'idle' || status === 'complete' || status === 'error') {
    return null;
  }

  const message = STATUS_MESSAGES[status];

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.iconRow}>
          <Ionicons name="football" size={28} color={AppColors.accent} />
          <ActivityIndicator size="large" color={AppColors.accent} style={styles.spinner} />
        </View>
        <Text style={styles.title}>Building Match Report</Text>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.hint}>This usually takes 10–20 seconds</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 13, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  spinner: {
    marginLeft: Spacing.md,
  },
  title: {
    color: AppColors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  message: {
    color: AppColors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  hint: {
    color: AppColors.textMuted,
    fontSize: 13,
  },
});
