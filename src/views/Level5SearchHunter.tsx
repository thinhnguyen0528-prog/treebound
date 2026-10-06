import React, { useState, useMemo } from 'react';
import { TreeNode, PlayerStats, NodeState } from '../types/game';
import { TreeViewer } from '../components/TreeViewer';
import { createStandardSampleTree } from '../utils/treeEngine';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Target, CornerDownLeft, CornerDownRight, CheckCircle2, Trophy, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface Level5SearchHunterProps {
  stats: PlayerStats;
  onCompleteLevel: (stars: number, earnedXp: number, score: number) => void;
  onOpenAiTutorWithContext: (ctx: any) => void;
  onBackToMap: () => void;
}

interface SearchRound {
  id: number;
  targetVal: number;
  expectedPath: number[]; // e.g. [50, 70, 60]
}

export const Level5SearchHunter: React.FC<Level5SearchHunterProps> = ({
  stats,
  onCompleteLevel,
  onOpenAiTutorWithContext,
  onBackToMap,
}) => {
  const tree = useMemo(() => createStandardSampleTree(), []);

  const rounds: SearchRound[] = useMemo(() => [
    { id: 1, targetVal: 60, expectedPath: [50, 70, 60] },
    { id: 2, targetVal: 20, expectedPath: [50, 30, 20] },
    { id: 3, targetVal: 40, expectedPath: [50, 30, 40] },
    { id: 4, targetVal: 80, expectedPath: [50, 70, 80] },
  ], []);

  const [currentRoundIdx, setCurrentRoundIdx] = useState<number>(0);
  const currentRound = rounds[currentRoundIdx];

  // Current node player is inspecting in the tree
  const [currentNode, setCurrentNode] = useState<TreeNode>(tree);
  const [pathVisitedIds, setPathVisitedIds] = useState<string[]>([tree.id]);
  const [historySteps, setHistorySteps] = useState<
    { currentNodeVal: number; targetVal: number; comparison: string; decision: string }[]
  >([]);

  const [score, setScore] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isError: boolean; text: string } | null>(null);
  const [isLevelFinished, setIsLevelFinished] = useState<boolean>(false);

  // Compute visual node states
  const nodeStates: Record<string, NodeState> = useMemo(() => {
    const states: Record<string, NodeState> = {};
    pathVisitedIds.forEach((id) => {
      states[id] = 'visited';
    });
    if (currentNode) {
      states[currentNode.id] = 'checking';
    }
    return states;
  }, [pathVisitedIds, currentNode]);

  const handleDecision = (decision: 'LEFT' | 'RIGHT' | 'FOUND') => {
    const currVal = Number(currentNode.val);
    const target = currentRound.targetVal;

    let correctDecision: 'LEFT' | 'RIGHT' | 'FOUND' = 'FOUND';
    if (target === currVal) correctDecision = 'FOUND';
    else if (target < currVal) correctDecision = 'LEFT';
    else correctDecision = 'RIGHT';

    // Record step in history
    const comparisonStr =
      target === currVal ? `${target} == ${currVal}` : target < currVal ? `${target} < ${currVal}` : `${target} > ${currVal}`;

    if (decision !== correctDecision) {
      sound.playError();
      setMistakes((m) => m + 1);
      setFeedback({
        isError: true,
        text: `Sai rồi! Vì ${comparisonStr}, theo quy tắc BST bạn cần chọn "${
          correctDecision === 'FOUND'
            ? 'ĐÃ TÌM THẤY (FOUND)'
            : correctDecision === 'LEFT'
            ? 'Rẽ TRÁI (LEFT)'
            : 'Rẽ PHẢI (RIGHT)'
        }".`,
      });
      return;
    }

    // Correct decision!
    sound.playCorrect();
    setHistorySteps((prev) => [
      ...prev,
      {
        currentNodeVal: currVal,
        targetVal: target,
        comparison: comparisonStr,
        decision,
      },
    ]);

    if (decision === 'FOUND') {
      sound.playVictory();
      setScore((s) => s + 100);
      setFeedback({
        isError: false,
        text: `Tuyệt vời! Đã tìm thấy node (${target}) chính xác qua lộ trình BST!`,
      });

      // Proceed to next round or finish
      setTimeout(() => {
        if (currentRoundIdx + 1 < rounds.length) {
          const nextR = currentRoundIdx + 1;
          setCurrentRoundIdx(nextR);
          setCurrentNode(tree);
          setPathVisitedIds([tree.id]);
          setHistorySteps([]);
          setFeedback(null);
        } else {
          // Completed Level 5!
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
          let stars = 3;
          if (mistakes > 2) stars = 1;
          else if (mistakes > 0) stars = 2;
          setIsLevelFinished(true);
          onCompleteLevel(stars, 300, score + 100);
        }
      }, 1000);
    } else {
      const nextNode = decision === 'LEFT' ? currentNode.left : currentNode.right;
      if (nextNode) {
        setCurrentNode(nextNode);
        setPathVisitedIds((prev) => [...prev, nextNode.id]);
        setFeedback({
          isError: false,
          text: `Đúng! Rẽ sang ${decision === 'LEFT' ? 'TRÁI' : 'PHẢI'} đến node (${nextNode.val}).`,
        });
      } else {
        setFeedback({
          isError: true,
          text: `Nhánh con rỗng! Không tìm thấy phần tử ${target} trong cây.`,
        });
      }
    }
  };

  const handleResetRound = () => {
    sound.playClick();
    setCurrentNode(tree);
    setPathVisitedIds([tree.id]);
    setHistorySteps([]);
    setFeedback(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Level Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            05 — SEARCH CAVE • SEARCH ALGORITHMS
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Hang Động Tìm Kiếm Trong Cây BST
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onOpenAiTutorWithContext({
                currentLevel: '05 — Search Cave',
                targetVal: currentRound.targetVal,
                currentNodeVal: currentNode.val,
                mistakes,
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Hỏi Mentor</span>
          </button>
          <button
            onClick={onBackToMap}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            Bản đồ
          </button>
        </div>
      </div>

      {/* Target Mission Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Vòng {currentRoundIdx + 1} / {rounds.length} • Mục tiêu săn lùng:
            </span>
            <p className="text-lg font-black text-slate-900 dark:text-white font-mono">
              TÌM KIẾM NODE: <span className="text-purple-600 dark:text-purple-400 font-extrabold">{currentRound.targetVal}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleResetRound}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Bắt đầu lại vòng</span>
        </button>
      </div>

      {/* Interactive Tree View */}
      <div className="mb-4">
        <TreeViewer
          root={tree}
          activePathIds={pathVisitedIds}
          customNodeStates={nodeStates}
          height={320}
        />
      </div>

      {/* Decision HUD Dashboard */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Status Indicators Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Node hiện tại</span>
            <span className="text-base font-black font-mono text-blue-600 dark:text-blue-400">{currentNode.val}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Mục tiêu (Target)</span>
            <span className="text-base font-black font-mono text-purple-600 dark:text-purple-400">{currentRound.targetVal}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Phép so sánh</span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {currentRound.targetVal} {currentRound.targetVal === Number(currentNode.val) ? '==' : currentRound.targetVal < Number(currentNode.val) ? '<' : '>'} {currentNode.val}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Quyết định</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Chọn 1 trong 3 nút</span>
          </div>
        </div>

        {/* Action Choice Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => handleDecision('LEFT')}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
          >
            <CornerDownLeft className="w-4 h-4" />
            <span>RẼ TRÁI (LEFT)</span>
          </button>

          <button
            onClick={() => handleDecision('FOUND')}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ĐÃ TÌM THẤY (FOUND)</span>
          </button>

          <button
            onClick={() => handleDecision('RIGHT')}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <span>RẼ PHẢI (RIGHT)</span>
            <CornerDownRight className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs font-semibold ${
              feedback.isError
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
            }`}
          >
            {feedback.text}
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {isLevelFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 text-center border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              CHIẾN CÔNG SEARCH HUNTER!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Bạn đã thành thạo thuật toán tìm kiếm trên cây BST với độ phức tạp tối ưu O(log N)!
            </p>

            <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-around">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Điểm số</span>
                <p className="text-xl font-black text-slate-900 dark:text-white">{score}</p>
              </div>
              <div className="border-r border-slate-200 dark:border-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Phần thưởng</span>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">+300 XP</p>
              </div>
            </div>

            {/* What you just learned */}
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left text-xs space-y-1">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-emerald-700 dark:text-emerald-300 block">
                📖 WHAT YOU JUST LEARNED
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                • <strong>Tìm kiếm BST (Binary Search)</strong>: So sánh Target với Node hiện tại: nếu nhỏ hơn thì rẽ trái, nếu lớn hơn thì rẽ phải, nếu bằng thì dừng lại.
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                • <strong>Độ phức tạp</strong>: Trung bình chỉ mất O(log N) phép so sánh để tìm thấy mục tiêu.
              </p>
            </div>

            <button
              onClick={onBackToMap}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              Mở Khóa Trùm Cuối: 06 — TREEBOUND (Final Boss)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
