import React, { useState } from 'react';
import { GameSettings } from '../types/game';
import { sound } from '../utils/audio';
import { resetGameProgress } from '../utils/storage';
import { X, Moon, Sun, Volume2, VolumeX, Gauge, Globe, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetStats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetStats,
}) => {
  const [resetConfirm, setResetConfirm] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleTestGemini = async () => {
    setIsTesting(true);
    setTestStatus('Đang kiểm tra kết nối API...');
    sound.playClick();
    try {
      const res = await fetch('/api/gemini/test', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTestStatus('Kết nối Gemini AI thành công!');
        sound.playCorrect();
      } else {
        setTestStatus(data.message || 'Chưa cấu hình GEMINI_API_KEY (Đang dùng Smart Offline Tutor).');
        sound.playError();
      }
    } catch {
      setTestStatus('Chưa kết nối API (Đang dùng Smart Offline Tutor).');
      sound.playError();
    } finally {
      setIsTesting(false);
    }
  };

  const handleResetData = () => {
    sound.playError();
    resetGameProgress();
    onResetStats();
    setResetConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
            CÀI ĐẶT TRÒ CHƠI
          </h3>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings rows */}
        <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.darkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>Giao diện Tối (Dark Mode)</span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onUpdateSettings({ darkMode: !settings.darkMode });
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.darkMode ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span>Âm thanh hiệu ứng (Sound Effects)</span>
            </div>
            <button
              onClick={() => {
                const nextVal = !settings.soundEnabled;
                sound.setEnabled(nextVal);
                onUpdateSettings({ soundEnabled: nextVal });
                if (nextVal) sound.playClick();
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.soundEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          {/* Animation Speed */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-500" />
              <span>Tốc độ duyệt cây (Animation)</span>
            </div>
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
              {(['slow', 'normal', 'fast'] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => {
                    sound.playClick();
                    onUpdateSettings({ animationSpeed: spd });
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold capitalize transition-all ${
                    settings.animationSpeed === spd
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {spd}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="flex items-center justify-between">
            <span>Độ khó thử thách</span>
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    sound.playClick();
                    onUpdateSettings({ difficulty: diff });
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold capitalize transition-all ${
                    settings.difficulty === diff
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Gemini AI Status Test */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span>Trạng thái kết nối Gemini AI Tutor</span>
              <button
                onClick={handleTestGemini}
                disabled={isTesting}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold hover:bg-emerald-100 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Kiểm tra kết nối</span>
              </button>
            </div>
            {testStatus && (
              <p className="text-[11px] text-slate-500 italic mt-1 leading-snug">
                {testStatus}
              </p>
            )}
          </div>

          {/* Reset Progress */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            {!resetConfirm ? (
              <button
                onClick={() => setResetConfirm(true)}
                className="w-full py-2.5 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors"
              >
                Làm mới toàn bộ tiến trình chơi (Reset Progress)
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-center space-y-2">
                <p className="text-xs text-rose-700 dark:text-rose-300 font-bold">
                  Bạn có chắc chắn muốn xóa XP, sao và tất cả cấp độ đã mở khóa?
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={handleResetData}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs"
                  >
                    Xác nhận xóa
                  </button>
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
