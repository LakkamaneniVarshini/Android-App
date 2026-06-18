import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchCard } from '@/components/match-card';
import { AppColors, Radius, Spacing } from '@/constants/colors';
import { searchMatches } from '@/lib/data/match-loader';
import type { MatchSummary } from '@/types/match';

export default function MatchesScreen() {
  const [query, setQuery] = useState('');
  const matches = useMemo(() => searchMatches(query), [query]);

  const handleSelect = useCallback((match: MatchSummary) => {
    router.push(`/match/${match.id}`);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Ionicons name="football" size={28} color={AppColors.accent} />
          <View style={styles.brandText}>
            <Text style={styles.appName}>PlayerNation</Text>
            <Text style={styles.tagline}>FIFA World Cup 2018</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          Select a match to generate an AI-powered coach report from raw event data.
        </Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={AppColors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search teams or stage…"
          placeholderTextColor={AppColors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={AppColors.textMuted} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <MatchCard match={item} onPress={() => handleSelect(item)} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>No matches found for &quot;{query}&quot;</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  brandText: {
    marginLeft: Spacing.sm,
  },
  appName: {
    color: AppColors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  tagline: {
    color: AppColors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  subtitle: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: AppColors.border,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: AppColors.text,
    fontSize: 16,
    paddingVertical: Spacing.md,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  empty: {
    color: AppColors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
    fontSize: 15,
  },
});
