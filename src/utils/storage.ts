import { PlayerStats, GameSettings } from '../types/game';

const STATS_KEY = 'treebound_stats_v1';
const SETTINGS_KEY = 'treebound_settings_v1';
const LEGACY_STATS_KEY = 'treebound_legacy_stats';
const LEGACY_SETTINGS_KEY = 'treebound_legacy_settings';

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 800, 1200];

export const DEFAULT_STATS: PlayerStats = {
  xp: 0,
  level: 1,
  streak: 1,
  lastPlayedDate: new Date().toISOString().split('T')[0],
  bestScore: 0,
  completedLevels: {},
  dailyCompletedDates: [],
};

export const DEFAULT_SETTINGS: GameSettings = {
  darkMode: false,
  soundEnabled: true,
  animationSpeed: 'normal',
  difficulty: 'medium',
  language: 'vi',
};

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STATS_KEY) || localStorage.getItem(LEGACY_STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    
    // Check streak
    const today = new Date().toISOString().split('T')[0];
    const lastDate = parsed.lastPlayedDate || today;
    
    // If consecutive day, keep or increase streak
    const d1 = new Date(today);
    const d2 = new Date(lastDate);
    const diffDays = Math.round((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));
    
    let currentStreak = parsed.streak || 1;
    if (diffDays === 1) {
      currentStreak += 1;
    } else if (diffDays > 1) {
      currentStreak = 1;
    }

    return {
      ...DEFAULT_STATS,
      ...parsed,
      streak: currentStreak,
      lastPlayedDate: today,
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats', e);
  }
}

export function calculatePlayerLevel(xp: number): number {
  if (xp >= 1200) return 6;
  if (xp >= 800) return 5;
  if (xp >= 500) return 4;
  if (xp >= 250) return 3;
  if (xp >= 100) return 2;
  return 1;
}

export function loadGameSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveGameSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function resetGameProgress(): void {
  localStorage.removeItem(STATS_KEY);
  localStorage.removeItem(LEGACY_STATS_KEY);
}
