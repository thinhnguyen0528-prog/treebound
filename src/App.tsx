import React, { useState, useEffect } from 'react';
import { PlayerStats, GameSettings } from './types/game';
import { 
  loadPlayerStats, 
  savePlayerStats, 
  loadGameSettings, 
  saveGameSettings, 
  calculatePlayerLevel 
} from './utils/storage';
import { sound } from './utils/audio';

import { Navbar } from './components/Navbar';
import { AiTutorModal } from './components/AiTutorModal';
import { SettingsModal } from './views/SettingsModal';

import { HomeView } from './views/HomeView';
import { LevelMap } from './components/LevelMap';
import { Level1Explorer } from './views/Level1Explorer';
import { Level2Builder } from './views/Level2Builder';
import { Level3Traversal } from './views/Level3Traversal';
import { Level4BSTArena } from './views/Level4BSTArena';
import { Level5SearchHunter } from './views/Level5SearchHunter';
import { Level6TreeMaster } from './views/Level6TreeMaster';
import { LearnModeView } from './views/LearnModeView';
import { DailyChallengeView } from './views/DailyChallengeView';

export default function App() {
  const [stats, setStats] = useState<PlayerStats>(loadPlayerStats);
  const [settings, setSettings] = useState<GameSettings>(loadGameSettings);
  const [activeView, setActiveView] = useState<string>('home');

  // AI Tutor Modal & Context
  const [isAiTutorOpen, setIsAiTutorOpen] = useState<boolean>(false);
  const [aiTutorContext, setAiTutorContext] = useState<any>(null);

  // Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Sync dark mode class on HTML root element
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Sync audio enabled state
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Save settings whenever changed
  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveGameSettings(updated);
      return updated;
    });
  };

  // Save stats helper
  const updateStats = (modifier: (prev: PlayerStats) => PlayerStats) => {
    setStats((prev) => {
      const updated = modifier(prev);
      savePlayerStats(updated);
      return updated;
    });
  };

  // Level Completion Handler
  const handleCompleteLevel = (levelId: number, stars: number, earnedXp: number, score: number) => {
    updateStats((prev) => {
      const nextXp = prev.xp + earnedXp;
      const nextLevel = calculatePlayerLevel(nextXp);
      const prevLevelRecord = prev.completedLevels[levelId];
      const bestStars = Math.max(prevLevelRecord?.stars || 0, stars);
      const bestLevelScore = Math.max(prevLevelRecord?.highscore || 0, score);

      return {
        ...prev,
        xp: nextXp,
        level: nextLevel,
        bestScore: Math.max(prev.bestScore, score),
        completedLevels: {
          ...prev.completedLevels,
          [levelId]: {
            stars: bestStars,
            highscore: bestLevelScore,
          },
        },
      };
    });
  };

  // Daily Challenge Completion Handler
  const handleCompleteDaily = (earnedXp: number) => {
    const today = new Date().toISOString().split('T')[0];
    updateStats((prev) => {
      if (prev.dailyCompletedDates.includes(today)) return prev;

      const nextXp = prev.xp + earnedXp;
      const nextLevel = calculatePlayerLevel(nextXp);

      return {
        ...prev,
        xp: nextXp,
        level: nextLevel,
        dailyCompletedDates: [...prev.dailyCompletedDates, today],
      };
    });
  };

  const handleOpenAiTutorWithContext = (ctx: any) => {
    setAiTutorContext(ctx);
    setIsAiTutorOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Header Navigation */}
      <Navbar
        stats={stats}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenAiTutor={() => {
          setAiTutorContext(null);
          setIsAiTutorOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 flex flex-col">
        {activeView === 'home' && (
          <HomeView
            stats={stats}
            settings={settings}
            onNavigate={(view) => setActiveView(view)}
            onOpenAiTutor={() => setIsAiTutorOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeView === 'map' && (
          <LevelMap
            stats={stats}
            onSelectLevel={(levelId) => setActiveView(`level_${levelId}`)}
          />
        )}

        {activeView === 'level_1' && (
          <Level1Explorer
            stats={stats}
            onCompleteLevel={(stars, xp, score) => handleCompleteLevel(1, stars, xp, score)}
            onOpenAiTutorWithContext={handleOpenAiTutorWithContext}
            onBackToMap={() => setActiveView('map')}
          />
        )}

        {activeView === 'level_2' && (
          <Level2Builder
            stats={stats}
            onCompleteLevel={(stars, xp, score) => handleCompleteLevel(2, stars, xp, score)}
            onOpenAiTutorWithContext={handleOpenAiTutorWithContext}
            onBackToMap={() => setActiveView('map')}
          />
        )}

        {activeView === 'level_3' && (
          <Level3Traversal
            stats={stats}
            onCompleteLevel={(stars, xp, score) => handleCompleteLevel(3, stars, xp, score)}
            onOpenAiTutorWithContext={handleOpenAiTutorWithContext}
            onBackToMap={() => setActiveView('map')}
          />
        )}

        {activeView === 'level_4' && (
          <Level4BSTArena
            stats={stats}
            onCompleteLevel={(stars, xp, score) => handleCompleteLevel(4, stars, xp, score)}
            onOpenAiTutorWithContext={handleOpenAiTutorWithContext}
            onBackToMap={() => setActiveView('map')}
          />
        )}

        {activeView === 'level_5' && (
          <Level5SearchHunter
            stats={stats}
            onCompleteLevel={(stars, xp, score) => handleCompleteLevel(5, stars, xp, score)}
            onOpenAiTutorWithContext={handleOpenAiTutorWithContext}
            onBackToMap={() => setActiveView('map')}
          />
        )}

        {activeView === 'level_6' && (
          <Level6TreeMaster
            stats={stats}
            onCompleteLevel={(stars, xp, score) => handleCompleteLevel(6, stars, xp, score)}
            onOpenAiTutorWithContext={handleOpenAiTutorWithContext}
            onBackToMap={() => setActiveView('map')}
          />
        )}

        {activeView === 'learn' && (
          <LearnModeView
            onOpenAiTutorWithContext={handleOpenAiTutorWithContext}
            onBackToMap={() => setActiveView('map')}
          />
        )}

        {activeView === 'daily' && (
          <DailyChallengeView
            stats={stats}
            onCompleteDaily={handleCompleteDaily}
            onBackToMap={() => setActiveView('map')}
          />
        )}
      </main>

      {/* Modern Game Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-4 px-6 text-center text-xs text-slate-400 dark:text-slate-500 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xs">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-700 dark:text-slate-300 tracking-tight">TREEBOUND</span>
            <span>•</span>
            <span className="italic font-medium">Master the Tree. Master the Algorithm.</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Bài 7: Cây Nhị Phân – Duyệt Cây</span>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-emerald-500 transition-colors cursor-pointer"
            >
              Cài đặt
            </button>
          </div>
        </div>
      </footer>

      {/* AI Tutor Modal */}
      <AiTutorModal
        isOpen={isAiTutorOpen}
        onClose={() => setIsAiTutorOpen(false)}
        gameContext={aiTutorContext}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetStats={() => setStats(loadPlayerStats())}
      />
    </div>
  );
}
