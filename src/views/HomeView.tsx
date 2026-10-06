import React, { useState, useEffect, useMemo } from 'react';
import { PlayerStats, GameSettings, TreeNode } from '../types/game';
import { TreeViewer } from '../components/TreeViewer';
import { LEVEL_THRESHOLDS } from '../utils/storage';
import { sound } from '../utils/audio';
import { 
  Play, 
  BookOpen, 
  Bot, 
  Calendar, 
  Settings, 
  Sparkles, 
  Flame, 
  Star, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface HomeViewProps {
  stats: PlayerStats;
  settings: GameSettings;
  onNavigate: (view: string) => void;
  onOpenAiTutor: () => void;
  onOpenSettings: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  stats,
  settings,
  onNavigate,
  onOpenAiTutor,
  onOpenSettings,
}) => {
  // Animated Growing Tree State (Root -> Branches -> Leaves)
  const [growthStage, setGrowthStage] = useState<number>(0);

  useEffect(() => {
    // Stage 0: Root only (starts immediately)
    // Stage 1: Branches and Level 2 nodes (at 700ms)
    // Stage 2: Leaves (at 1400ms)
    const timer1 = setTimeout(() => setGrowthStage(1), 600);
    const timer2 = setTimeout(() => setGrowthStage(2), 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Tree representation built dynamically based on growth stage
  const dynamicTree: TreeNode = useMemo(() => {
    if (growthStage === 0) {
      return { id: 'n_50', val: 50 };
    }
    if (growthStage === 1) {
      return {
        id: 'n_50',
        val: 50,
        left: { id: 'n_30', val: 30 },
        right: { id: 'n_70', val: 70 },
      };
    }
    // Stage 2: full tree
    return {
      id: 'n_50',
      val: 50,
      left: {
        id: 'n_30',
        val: 30,
        left: { id: 'n_20', val: 20 },
        right: { id: 'n_40', val: 40 },
      },
      right: {
        id: 'n_70',
        val: 70,
        left: { id: 'n_60', val: 60 },
        right: { id: 'n_80', val: 80 },
      },
    };
  }, [growthStage]);

  const handleReplayGrowth = () => {
    sound.playClick();
    setGrowthStage(0);
    setTimeout(() => setGrowthStage(1), 500);
    setTimeout(() => setGrowthStage(2), 1000);
  };

  const nextThreshold = LEVEL_THRESHOLDS[stats.level] || 1500;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
      {/* Center Branding & Slogan */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
        {/* Minimalist Logo Emblem */}
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-600 flex items-center justify-center text-white shadow-xl shadow-emerald-600/20 mx-auto mb-2 animate-fade-scale">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 9.5V14M14 14L8 18M14 14L20 18" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="14" cy="6" r="3.5" fill="#34d399" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="7" cy="20" r="3" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="21" cy="20" r="3" fill="#a78bfa" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
          TREEBOUND
        </h1>

        <p className="text-base sm:text-lg font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide">
          Master the Tree. Master the Algorithm.
        </p>

        {/* Compact Stats Ribbon */}
        <div className="inline-flex items-center gap-4 px-4 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-xs mt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>LEVEL {stats.level < 10 ? `0${stats.level}` : stats.level}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono">
            <span>XP {stats.xp}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-mono">
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            <span>STREAK {stats.streak}</span>
          </div>
        </div>
      </div>

      {/* Animated Growing Binary Tree Area */}
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-4 shadow-sm backdrop-blur-sm mb-8 relative">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-2 mb-2">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            {growthStage === 0 && 'Root khởi tạo...'}
            {growthStage === 1 && 'Nhánh vươn sang Trái & Phải...'}
            {growthStage === 2 && 'Các lá nở rộ — Cây hoàn chỉnh'}
          </span>
          <button
            onClick={handleReplayGrowth}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Xem lại quá trình lớn của cây"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <TreeViewer
          root={dynamicTree}
          onNodeClick={(node) => {
            sound.playNodeSelect(520);
          }}
          height={280}
        />
      </div>

      {/* Main Play CTA Button */}
      <div className="w-full max-w-md space-y-3">
        <button
          onClick={() => {
            sound.playClick();
            onNavigate('map');
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-black text-lg shadow-xl shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center gap-3 group"
        >
          <Play className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
          <span className="tracking-wide">PLAY</span>
          <ArrowRight className="w-5 h-5 opacity-80 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Secondary Navigation Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('learn');
            }}
            className="py-3 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:shadow-sm active:scale-95 transition-all flex flex-col items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span>LEARN</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('daily');
            }}
            className="py-3 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:shadow-sm active:scale-95 transition-all flex flex-col items-center gap-1.5"
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>CHALLENGES</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenAiTutor();
            }}
            className="py-3 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:shadow-sm active:scale-95 transition-all flex flex-col items-center gap-1.5"
          >
            <Bot className="w-4 h-4 text-teal-500" />
            <span>AI TUTOR</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="py-3 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:shadow-sm active:scale-95 transition-all flex flex-col items-center gap-1.5"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>SETTINGS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
