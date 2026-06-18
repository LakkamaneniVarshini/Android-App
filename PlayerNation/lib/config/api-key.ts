import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_KEY_STORAGE_KEY = 'playernation_groq_api_key';

export function getEnvApiKey(): string | undefined {
  return process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim() || undefined;
}

export async function getStoredApiKey(): Promise<string | null> {
  let fallbackKey: string | null = null;

  try {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(API_KEY_STORAGE_KEY);
    }

    fallbackKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
    return (await SecureStore.getItemAsync(API_KEY_STORAGE_KEY)) ?? fallbackKey;
  } catch {
    return fallbackKey ?? AsyncStorage.getItem(API_KEY_STORAGE_KEY);
  }
}

export async function saveApiKey(key: string): Promise<void> {
  const trimmed = key.trim();
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(API_KEY_STORAGE_KEY, trimmed);
    return;
  }

  await AsyncStorage.setItem(API_KEY_STORAGE_KEY, trimmed);
  await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, trimmed);
}

export async function clearApiKey(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(API_KEY_STORAGE_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
  } catch {
    // Keep clearing the fallback storage even if SecureStore is unavailable.
  } finally {
    await AsyncStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

export async function resolveApiKey(): Promise<string | undefined> {
  const envKey = getEnvApiKey();
  if (envKey) return envKey;
  const stored = await getStoredApiKey();
  return stored?.trim() || undefined;
}

export function hasEnvApiKey(): boolean {
  return Boolean(getEnvApiKey());
}
