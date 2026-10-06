import React from 'react';
import { PlayerStats, LevelInfo } from '../types/game';
import { sound } from '../utils/audio';
import { Lock, Star, Check, Sparkles, ChevronRight, Compass } from 'lucide-react';

interface LevelMapProps {
  stats: PlayerStats;
  onSelectLevel: (levelId: number) => void;
}

export const LEVELS_CONFIG: Omit<LevelInfo, 'isUnlocked' | 'stars'>[] = [
  {
    id: 1,
    title: 'LEVEL 01 — Tree Explorer',
    subtitle: 'Cấu trúc & Khái niệm cây',
    description: 'Khám phá thế giới cây: Nhận diện Root, Node, Leaf, Branch, Parent/Child, Bậc và Chiều cao cây.',
    xpReward: 100,
    targetStars: 3,
    badgeIcon: '🌱',
  },
  {
    id: 2,
    title: 'LEVEL 02 — Binary Builder',
    subtitle: 'Xây dựng cây nhị phân',
    description: 'Xưởng rèn nhị phân: Tự tay chèn và bố trí các node Left / Right theo đúng cấu trúc tiêu chuẩn.',
    xpReward: 150,
    targetStars: 3,
    badgeIcon: '⚒️',
  },
  {
    id: 3,
    title: 'LEVEL 03 — Traversal Academy',
    subtitle: 'Học viện duyệt cây',
    description: 'Làm chủ 3 thuật toán kinh điển: PreOrder (NLR), InOrder (LNR), PostOrder (LRN) & Thử thách ghép chuỗi.',
    xpReward: 200,
    targetStars: 3,
    badgeIcon: '🧭',
  },
  {
    id: 4,
    title: 'LEVEL 04 — BST Arena',
    subtitle: 'Đấu trường cây tìm kiếm',
    description: 'Cây tìm kiếm nhị phân BST: Áp dụng quy tắc vàng (Left < Node < Right) để chèn các phần tử vào đúng nhánh.',
    xpReward: 250,
    targetStars: 3,
    badgeIcon: '⚔️',
  },
  {
    id: 5,
    title: 'LEVEL 05 — Search Hunter',
    subtitle: 'Thợ săn tìm kiếm BST',
    description: 'Truy vết mục tiêu trong BST: Phán đoán hướng rẽ trái/phải từng bước với chi phí tối ưu O(log N).',
    xpReward: 300,
    targetStars: 3,
    badgeIcon: '🎯',
  },
  {
    id: 6,
    title: 'LEVEL 06 — Tree Master',
    subtitle: 'Trùm cuối thử thách tổng hợp',
    description: 'Trận chiến đỉnh cao: Vượt qua 9 chặng liên hoàn kiểm tra toàn diện mọi kiến thức về Cây nhị phân và Duyệt cây.',
    xpReward: 400,
    targetStars: 3,
    badgeIcon: '👑',
  },
];

export const LevelMap: React.FC<LevelMapProps> = ({ stats, onSelectLevel }) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
          <Compass className="w-3.5 h-3.5" />
          <span>HÀNH TRÌNH CHINH PHỤC CÂY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          TREEBOUND EXPEDITION
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
          6 Vùng đất thuật toán được liên kết chặt chẽ. Hoàn thành từng cửa ải để mở lối đi tiếp theo trên bản đồ!
        </p>
      </div>

      {/* Level Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LEVELS_CONFIG.map((lvl) => {
          // Level 1 is always unlocked. Next levels unlock if previous level is completed.
          const isUnlocked = lvl.id === 1 || !!stats.completedLevels[lvl.id - 1];
          const levelStats = stats.completedLevels[lvl.id];
          const earnedStars = levelStats?.stars || 0;
          const isCompleted = earnedStars > 0;
          const isCurrentActive = isUnlocked && !isCompleted;

          return (
            <div
              key={lvl.id}
              onClick={() => {
                if (isUnlocked) {
                  sound.playClick();
                  onSelectLevel(lvl.id);
                } else {
                  sound.playError();
                }
              }}
              className={`relative rounded-3xl p-6 transition-all duration-300 border flex flex-col justify-between ${
                isCurrentActive
                  ? 'bg-white dark:bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/30 cursor-pointer hover:-translate-y-1'
                  : isUnlocked
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-md cursor-pointer hover:-translate-y-0.5'
                  : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Top row: Badge icon & Lock/Stars/Check */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                    isUnlocked 
                      ? 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {lvl.badgeIcon}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {lvl.title}
                    </span>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">
                      {lvl.subtitle}
                    </h3>
                  </div>
                </div>

                {/* Status Badges */}
                <div>
                  {!isUnlocked ? (
                    <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                  ) : isCompleted ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((starIdx) => (
                          <Star
                            key={starIdx}
                            className={`w-3.5 h-3.5 ${
                              starIdx <= earnedStars
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse">
                      Hiện tại
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 dark:text-slate-400 my-4 leading-relaxed">
                {lvl.description}
              </p>

              {/* Bottom stats & Action */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+{lvl.xpReward} XP</span>
                </div>

                {isUnlocked ? (
                  <button
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                    }`}
                  >
                    <span>{isCompleted ? 'Chơi lại' : 'Bắt đầu'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Khóa
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
