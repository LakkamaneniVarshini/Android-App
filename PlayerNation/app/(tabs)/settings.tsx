import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  clearApiKey,
  getStoredApiKey,
  hasEnvApiKey,
  saveApiKey,
} from '@/lib/config/api-key';
import { AppColors, Radius, Spacing } from '@/constants/colors';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [envConfigured, setEnvConfigured] = useState(false);

  useEffect(() => {
    setEnvConfigured(hasEnvApiKey());
    getStoredApiKey()
      .then((key) => {
        if (key) setApiKey(key);
      })
      .catch(() => {
        Alert.alert('Key load failed', 'Could not read the saved Groq API key on this device.');
      });
  }, []);

  const handleSave = useCallback(async () => {
    if (!apiKey.trim()) {
      Alert.alert('Missing key', 'Please enter your Groq API key.');
      return;
    }
    try {
      await saveApiKey(apiKey.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      Alert.alert('Save failed', 'Could not save the Groq API key. Please try again.');
    }
  }, [apiKey]);

  const handleClear = useCallback(async () => {
    try {
      await clearApiKey();
      setApiKey('');
      Alert.alert('Cleared', 'API key removed from device storage.');
    } catch {
      Alert.alert('Clear failed', 'Could not remove the saved Groq API key.');
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ title: 'Settings', headerShown: false }} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Groq API Key</Text>
          <Text style={styles.cardDesc}>
            Reports are generated via Groq&apos;s free tier (Llama 3.3 70B). Get a free key at
            console.groq.com — no credit card required.
          </Text>

          {envConfigured && (
            <View style={styles.envBanner}>
              <Ionicons name="checkmark-circle" size={18} color={AppColors.accent} />
              <Text style={styles.envText}>Key loaded from EXPO_PUBLIC_GROQ_API_KEY</Text>
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="gsk_..."
            placeholderTextColor={AppColors.textMuted}
            value={apiKey}
            onChangeText={setApiKey}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            editable={!envConfigured}
          />

          {!envConfigured && (
            <View style={styles.buttonRow}>
              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{saved ? 'Saved!' : 'Save Key'}</Text>
              </Pressable>
              <Pressable style={styles.clearButton} onPress={handleClear}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How it works</Text>
          <Text style={styles.step}>1. Select a World Cup 2018 match</Text>
          <Text style={styles.step}>2. App downloads ~3,000 events from GitHub</Text>
          <Text style={styles.step}>3. Events are aggregated into team & player stats</Text>
          <Text style={styles.step}>4. Groq LLM writes a structured coach report</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data source</Text>
          <Text style={styles.cardDesc}>
            Wyscout event dataset (FIFA World Cup 2018, 64 matches). Match events are fetched
            on-demand; only the match index is bundled in the app.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    color: AppColors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  cardTitle: {
    color: AppColors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  cardDesc: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  envBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primaryLight,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  envText: {
    color: AppColors.accent,
    fontSize: 13,
    flex: 1,
  },
  input: {
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: AppColors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  saveButton: {
    flex: 1,
    backgroundColor: AppColors.accent,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: AppColors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  clearButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  clearButtonText: {
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  step: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 4,
  },
});
