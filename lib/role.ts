// App role — the SAME APK serves both phones:
//   'dashboard' → phone 1 (the admin/manager panel)
//   'agent'     → phone 2 (reports its status to phone 1)
// The role is chosen once on the welcome screen and persisted; it can be
// changed later from inside the app.

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppRole = 'dashboard' | 'agent';

const ROLE_KEY = 'app_role';

let memoryRole: AppRole | null = null;

export async function getSavedRole(): Promise<AppRole | null> {
  try {
    const raw = Platform.OS === 'web' ? localStorage.getItem(ROLE_KEY) : await AsyncStorage.getItem(ROLE_KEY);
    if (raw === 'dashboard' || raw === 'agent') {
      memoryRole = raw;
      return raw;
    }
    return memoryRole;
  } catch {
    return memoryRole;
  }
}

export async function saveRole(role: AppRole): Promise<void> {
  memoryRole = role;
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(ROLE_KEY, role);
      return;
    }
    await AsyncStorage.setItem(ROLE_KEY, role);
  } catch {
    // in-memory copy is enough for this session
  }
}

export async function clearRole(): Promise<void> {
  memoryRole = null;
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(ROLE_KEY);
      return;
    }
    await AsyncStorage.removeItem(ROLE_KEY);
  } catch {
    // ignore
  }
}
