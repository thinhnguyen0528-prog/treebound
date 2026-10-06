import React, { useState } from 'react';
import { TreeNode, PlayerStats, NodeState } from '../types/game';
import { TreeViewer } from '../components/TreeViewer';
import { insertBSTWithHistory, cloneTree } from '../utils/treeEngine';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Swords, ArrowLeft, ArrowRight, CheckCircle2, Trophy, HelpCircle, CornerDownLeft, CornerDownRight, RotateCcw } from 'lucide-react';

interface Level4BSTArenaProps {
  stats: PlayerStats;
  onCompleteLevel: (stars: number, earnedXp: number, score: number) => void;
  onOpenAiTutorWithContext: (ctx: any) => void;
  onBackToMap: () => void;
}

export const Level4BSTArena: React.FC<Level4BSTArenaProps> = ({
  stats,
  onCompleteLevel,
  onOpenAiTutorWithContext,
  onBackToMap,
}) => {
  // Sequence of numbers to insert into BST
  const numberQueue = [50, 30, 70, 20, 40, 60, 80];

  // Current insertion progress
  const [insertIdx, setInsertIdx] = useState<number>(0);
  const [bstRoot, setBstRoot] = useState<TreeNode | null>(null);

  // Active path and comparison history
  const [activePathIds, setActivePathIds] = useState<string[]>([]);
  const [comparisonSteps, setComparisonSteps] = useState<string[]>([]);
  const [customStates, setCustomStates] = useState<Record<string, NodeState>>({});

  // Interactive step-by-step decision when inserting
  // When inserting nextVal, player must choose LEFT or RIGHT at current node!
  const [currComparingNode, setCurrComparingNode] = useState<TreeNode | null>(null);
  const [isGuidingStep, setIsGuidingStep] = useState<boolean>(false);

  const [score, setScore] = useState<number>(100);
  const [mistakes, setMistakes] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isError: boolean; text: string } | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const currentInsertingVal = insertIdx < numberQueue.length ? numberQueue[insertIdx] : null;

  // Start inserting the next number
  const handleStartInsert = () => {
    if (currentInsertingVal === null) return;

    sound.playClick();
    setFeedback(null);

    // If tree is empty, place immediately as Root
    if (!bstRoot) {
      const newNode: TreeNode = { id: `n_${currentInsertingVal}`, val: currentInsertingVal };
      setBstRoot(newNode);
      setActivePathIds([newNode.id]);
      setCustomStates({ [newNode.id]: 'correct' });
      setComparisonSteps([`Cây rỗng: Đặt (${currentInsertingVal}) làm Root.`]);
      sound.playNodeSelect(520);
      setInsertIdx((prev) => prev + 1);
      return;
    }

    // Begin traversing from Root
    setIsGuidingStep(true);
    setCurrComparingNode(bstRoot);
    setActivePathIds([bstRoot.id]);
    setCustomStates({ [bstRoot.id]: 'checking' });
    setComparisonSteps([
      `Bắt đầu so sánh từ Node gốc (${bstRoot.val}) với số cần chèn (${currentInsertingVal})...`,
    ]);
  };

  // Player decides to go LEFT or RIGHT at currComparingNode
  const handlePlayerChoice = (direction: 'LEFT' | 'RIGHT') => {
    if (!currComparingNode || currentInsertingVal === null) return;

    const currVal = Number(currComparingNode.val);
    const expectedDirection = currentInsertingVal < currVal ? 'LEFT' : 'RIGHT';

    if (direction !== expectedDirection) {
      sound.playError();
      setMistakes((m) => m + 1);
      setScore((s) => Math.max(20, s - 15));
      setFeedback({
        isError: true,
        text: `Sai quy tắc BST! Vì ${currentInsertingVal} ${
          expectedDirection === 'LEFT' ? '<' : '>'
        } ${currVal}, bạn phải đi sang ${expectedDirection === 'LEFT' ? 'TRÁI' : 'PHẢI'}.`,
      });
      return;
    }

    // Correct direction chosen!
    sound.playCorrect();
    setFeedback({
      isError: false,
      text: `Chính xác! ${currentInsertingVal} ${
        expectedDirection === 'LEFT' ? '<' : '>'
      } ${currVal} → Đi sang ${expectedDirection === 'LEFT' ? 'TRÁI' : 'PHẢI'}.`,
    });

    const nextNode = expectedDirection === 'LEFT' ? currComparingNode.left : currComparingNode.right;

    if (nextNode) {
      // Continue traversing down
      setCurrComparingNode(nextNode);
      setActivePathIds((prev) => [...prev, nextNode.id]);
      setCustomStates((prev) => ({
        ...prev,
        [currComparingNode.id]: 'visited',
        [nextNode.id]: 'checking',
      }));
      setComparisonSteps((prev) => [
        ...prev,
        `Di chuyển xuống node (${nextNode.val}) để so sánh tiếp...`,
      ]);
    } else {
      // Empty slot reached! Place the new node here!
      const cloned = cloneTree(bstRoot)!;

      const valToInsert = currentInsertingVal!;

      // Find the parent in cloned tree and attach
      function attach(node: TreeNode | null | undefined): boolean {
        if (!node) return false;
        if (node.id === currComparingNode!.id) {
          const newNode: TreeNode = { id: `n_${valToInsert}`, val: valToInsert };
          if (expectedDirection === 'LEFT') node.left = newNode;
          else node.right = newNode;
          return true;
        }
        return attach(node.left) || attach(node.right);
      }

      attach(cloned);
      setBstRoot(cloned);
      setIsGuidingStep(false);
      setCurrComparingNode(null);

      const newNodeId = `n_${currentInsertingVal}`;
      setActivePathIds((prev) => [...prev, newNodeId]);
      setCustomStates((prev) => ({
        ...prev,
        [newNodeId]: 'correct',
      }));

      setComparisonSteps((prev) => [
        ...prev,
        `🎉 Đã tìm thấy vị trí lá! Chèn (${currentInsertingVal}) thành công!`,
      ]);

      const nextInsertIdx = insertIdx + 1;
      setInsertIdx(nextInsertIdx);

      // Check if all numbers placed
      if (nextInsertIdx >= numberQueue.length) {
        sound.playVictory();
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        let stars = 3;
        if (mistakes > 2) stars = 1;
        else if (mistakes > 0) stars = 2;
        setIsCompleted(true);
        onCompleteLevel(stars, 250, score);
      }
    }
  };

  const handleResetArena = () => {
    sound.playClick();
    setInsertIdx(0);
    setBstRoot(null);
    setActivePathIds([]);
    setComparisonSteps([]);
    setCustomStates({});
    setIsGuidingStep(false);
    setCurrComparingNode(null);
    setFeedback(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            04 — BST ARENA • BINARY SEARCH TREE
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Đấu Trường Cây Tìm Kiếm Nhị Phân
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onOpenAiTutorWithContext({
                currentLevel: '04 — BST Arena',
                currentInsertingVal,
                currComparingNode,
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

      {/* BST Golden Rule Indicator */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-emerald-600">LUẬT VÀNG BST:</span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900">
            TRÁI (LEFT): value ≤ current node
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-900">
            PHẢI (RIGHT): value &gt; current node
          </span>
        </div>

        <button
          onClick={handleResetArena}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Làm lại</span>
        </button>
      </div>

      {/* Number Queue Sequence */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs mb-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
          <span>DÃY SỐ CẦN CHÈN VÀO BST:</span>
          <span className="text-emerald-600 font-mono">
            {insertIdx} / {numberQueue.length} đã xong
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto p-1">
          {numberQueue.map((num, idx) => {
            const isInserted = idx < insertIdx;
            const isCurrent = idx === insertIdx;
            return (
              <div
                key={num}
                className={`w-10 h-10 rounded-xl font-mono font-bold text-xs flex items-center justify-center transition-all ${
                  isInserted
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : isCurrent
                    ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-400/30 scale-110'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {num}
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Tree with Active Traversal Path */}
      <div className="mb-4">
        <TreeViewer
          root={bstRoot}
          activePathIds={activePathIds}
          customNodeStates={customStates}
          height={320}
        />
      </div>

      {/* Interactive Insertion Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        {!isGuidingStep ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Số tiếp theo cần chèn:</p>
              <p className="text-lg font-black font-mono text-slate-900 dark:text-white">
                {currentInsertingVal !== null ? `Số (${currentInsertingVal})` : 'Đã chèn xong toàn bộ!'}
              </p>
            </div>

            {currentInsertingVal !== null && (
              <button
                onClick={handleStartInsert}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>Bắt đầu chèn {currentInsertingVal}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Đang so sánh tại đỉnh:
                </span>
                <p className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                  Target ({currentInsertingVal}) vs Node hiện tại ({currComparingNode?.val})
                </p>
              </div>

              {/* Decision Choice Buttons: Left vs Right */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlayerChoice('LEFT')}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
                >
                  <CornerDownLeft className="w-4 h-4" />
                  <span>Rẽ TRÁI (LEFT)</span>
                </button>

                <button
                  onClick={() => handlePlayerChoice('RIGHT')}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  <span>Rẽ PHẢI (RIGHT)</span>
                  <CornerDownRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Path logs */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 font-mono text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
              {comparisonSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-slate-400 select-none">›</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback message banner */}
        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
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
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 text-center border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              CHIẾN THẮNG BST ARENA!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Bạn đã nắm trọn nguyên lý cây tìm kiếm nhị phân và xây dựng thành công toàn bộ BST!
            </p>

            <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-around">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Điểm số</span>
                <p className="text-xl font-black text-slate-900 dark:text-white">{score}</p>
              </div>
              <div className="border-r border-slate-200 dark:border-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Phần thưởng</span>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">+250 XP</p>
              </div>
            </div>

            {/* What you just learned */}
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left text-xs space-y-1">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-emerald-700 dark:text-emerald-300 block">
                📖 WHAT YOU JUST LEARNED
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                • <strong>Quy tắc BST</strong>: Nhánh trái luôn chứa các giá trị ≤ node hiện tại, nhánh phải chứa các giá trị &gt; node hiện tại.
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                • <strong>Tính chất sắp xếp</strong>: Phép duyệt InOrder trên một cây BST hợp lệ luôn sinh ra dãy số có thứ tự tăng dần.
              </p>
            </div>

            <button
              onClick={onBackToMap}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              Tiến đến 05 — Search Cave
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
