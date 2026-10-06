import React, { useState, useMemo } from 'react';
import { PlayerStats } from '../types/game';
import { TreeViewer } from '../components/TreeViewer';
import { getDailyChallenge, getPreOrderSequence, getInOrderSequence, getPostOrderSequence } from '../utils/treeEngine';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Calendar, Flame, Sparkles, CheckCircle2, XCircle, ArrowRight, Trophy } from 'lucide-react';

interface DailyChallengeViewProps {
  stats: PlayerStats;
  onCompleteDaily: (earnedXp: number) => void;
  onBackToMap: () => void;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  stats,
  onCompleteDaily,
  onBackToMap,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const isAlreadyDoneToday = stats.dailyCompletedDates.includes(todayStr);

  const dailyData = useMemo(() => {
    return getDailyChallenge(todayStr);
  }, [todayStr]);

  // Generate question options based on challengeType
  const { questionPrompt, options, correctIndex, explanation } = useMemo(() => {
    const preSeq = getPreOrderSequence(dailyData.tree).join(' ');
    const inSeq = getInOrderSequence(dailyData.tree).join(' ');
    const postSeq = getPostOrderSequence(dailyData.tree).join(' ');

    if (dailyData.challengeType === 'preorder') {
      return {
        questionPrompt: `[DAILY TREE] Xác định dãy duyệt PREORDER (N-L-R) của cây ngày hôm nay:`,
        options: [inSeq, preSeq, postSeq, preSeq.split(' ').reverse().join(' ')],
        correctIndex: 1,
        explanation: `PreOrder duyệt từ Node gốc trước, sau đó duyệt cây con trái rồi cây con phải: ${preSeq}`,
      };
    } else if (dailyData.challengeType === 'inorder') {
      return {
        questionPrompt: `[DAILY TREE] Xác định dãy duyệt INORDER (L-N-R) của cây ngày hôm nay:`,
        options: [preSeq, postSeq, inSeq, inSeq.split(' ').reverse().join(' ')],
        correctIndex: 2,
        explanation: `InOrder duyệt cây con trái trước, sau đó đến Node gốc, cuối cùng là cây con phải: ${inSeq}`,
      };
    } else {
      return {
        questionPrompt: `[DAILY TREE] Xác định dãy duyệt POSTORDER (L-R-N) của cây ngày hôm nay:`,
        options: [postSeq, inSeq, preSeq, postSeq.split(' ').reverse().join(' ')],
        correctIndex: 0,
        explanation: `PostOrder duyệt xong cây con trái và phải rồi mới thăm Node gốc: ${postSeq}`,
      };
    }
  }, [dailyData]);

  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(isAlreadyDoneToday);
  const [isVictory, setIsVictory] = useState<boolean>(false);

  const handleSelectOption = (idx: number) => {
    if (submitted) return;
    sound.playClick();
    setSelectedOpt(idx);
    setSubmitted(true);

    if (idx === correctIndex) {
      sound.playVictory();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setIsVictory(true);
      onCompleteDaily(150);
    } else {
      sound.playError();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>DAILY TREE CHALLENGE • NGÀY {todayStr}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Thử Thách Cây Hàng Ngày
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Giải câu đố cây ngẫu nhiên mỗi ngày để duy trì chuỗi Streak và nhận +150 XP!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 font-bold text-xs">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>Streak: {stats.streak} Ngày</span>
          </div>

          <button
            onClick={onBackToMap}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            Bản đồ
          </button>
        </div>
      </div>

      {/* Challenge Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs mb-5 space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
          {questionPrompt}
        </h3>

        {/* Tree Render */}
        <TreeViewer root={dailyData.tree} height={300} />

        {/* 4 Choices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {options.map((opt, idx) => {
            const isSelected = selectedOpt === idx;
            const isCorrect = idx === correctIndex;
            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={submitted}
                className={`p-4 rounded-2xl border text-left font-mono text-xs sm:text-sm font-bold transition-all shadow-xs active:scale-98 ${
                  submitted
                    ? isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                      : isSelected
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200'
                      : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-slate-50 text-slate-800 dark:text-slate-100'
                }`}
              >
                <span className="text-xs font-sans text-slate-400 mr-2">
                  {String.fromCharCode(65 + idx)}.
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback message */}
        {submitted && (
          <div
            className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5 ${
              selectedOpt === correctIndex || isAlreadyDoneToday
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            {selectedOpt === correctIndex || isAlreadyDoneToday ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">
                {selectedOpt === correctIndex || isAlreadyDoneToday
                  ? 'Tuyệt vời! Đã hoàn thành thử thách hôm nay.'
                  : 'Chưa chính xác!'}
              </p>
              <p className="mt-0.5 opacity-90">{explanation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
