import React from 'react';
import { PlayerStats, GameSettings } from '../types/game';
import { LEVEL_THRESHOLDS } from '../utils/storage';
import { sound } from '../utils/audio';
import { 
  Sparkles, 
  Flame, 
  Star, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  Bot, 
  Settings, 
  Compass, 
  BookOpen, 
  Calendar,
  Layers
} from 'lucide-react';

interface NavbarProps {
  stats: PlayerStats;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onOpenAiTutor: () => void;
  onOpenSettings: () => void;
  activeView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  settings,
  onUpdateSettings,
  onOpenAiTutor,
  onOpenSettings,
  activeView,
  onNavigate,
}) => {
  const currentThreshold = LEVEL_THRESHOLDS[stats.level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[stats.level] || 1500;
  const xpProgress = Math.min(
    100,
    Math.max(0, Math.round(((stats.xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100))
  );

  const totalStars = Object.values(stats.completedLevels).reduce((acc, curr) => acc + (curr.stars || 0), 0);

  const toggleSound = () => {
    const nextVal = !settings.soundEnabled;
    sound.setEnabled(nextVal);
    onUpdateSettings({ soundEnabled: nextVal });
    if (nextVal) sound.playClick();
  };

  const toggleDarkMode = () => {
    sound.playClick();
    onUpdateSettings({ darkMode: !settings.darkMode });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Slogan */}
          <div 
            onClick={() => {
              sound.playClick();
              onNavigate('home');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 9.5V14M14 14L8 18M14 14L20 18" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="14" cy="6" r="3.5" fill="#34d399" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="7" cy="20" r="3" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="21" cy="20" r="3" fill="#a78bfa" stroke="#ffffff" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
                  TREEBOUND
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                  Bài 7
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Master the Tree. Master the Algorithm.
              </p>
            </div>
          </div>

          {/* Player Stats (XP, Level, Streak, Stars) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Level & XP bar */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                {stats.level}
              </div>
              <div className="flex flex-col min-w-[90px]">
                <div className="flex justify-between items-center text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                  <span>Level {stats.level}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{stats.xp} XP</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/60 text-xs font-bold">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{stats.streak} Ngày</span>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 border border-yellow-200/70 dark:border-yellow-900/60 text-xs font-bold">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
              <span>{totalStars}</span>
            </div>
          </div>

          {/* Quick Nav & Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* View Switching tabs */}
            <nav className="flex items-center gap-1 mr-1">
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate('map');
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeView === 'map' || activeView.startsWith('level_')
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Bản đồ màn chơi"
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Play</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate('learn');
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeView === 'learn'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Bài học lý thuyết & mini challenge"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Learn</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate('daily');
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeView === 'daily'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Thử thách hàng ngày"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Daily</span>
              </button>
            </nav>

            {/* AI Tutor button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenAiTutor();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-semibold text-xs shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
              title="Mở AI Tree Mentor"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden md:inline">Tree Mentor</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={settings.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              aria-label="Toggle Sound"
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Chuyển chế độ Sáng / Tối"
              aria-label="Toggle Dark Mode"
            >
              {settings.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Settings Modal Button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenSettings();
              }}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Cài đặt game"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
