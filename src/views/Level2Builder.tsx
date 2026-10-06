import React, { useState } from 'react';
import { TreeNode, PlayerStats } from '../types/game';
import { TreeViewer } from '../components/TreeViewer';
import { cloneTree, findNodeById, createId } from '../utils/treeEngine';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { RotateCcw, Undo2, CheckCircle2, ArrowLeft, HelpCircle, Trophy, ArrowRight, CornerDownLeft, CornerDownRight } from 'lucide-react';

interface Level2BuilderProps {
  stats: PlayerStats;
  onCompleteLevel: (stars: number, earnedXp: number, score: number) => void;
  onOpenAiTutorWithContext: (ctx: any) => void;
  onBackToMap: () => void;
}

export const Level2Builder: React.FC<Level2BuilderProps> = ({
  stats,
  onCompleteLevel,
  onOpenAiTutorWithContext,
  onBackToMap,
}) => {
  // Target tree to build:
  //        50
  //       /  \
  //     30    70
  //    / \    / \
  //   20 40  60 80
  const targetValues = [50, 30, 70, 20, 40, 60, 80];

  // Available pool of values to place
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([30, 70, 20, 40, 60, 80]);
  const [selectedNum, setSelectedNum] = useState<number | null>(null);

  // The tree user is building, initialized with Root (50)
  const [userTree, setUserTree] = useState<TreeNode>({
    id: 'n_50',
    val: 50,
  });

  // History stack for UNDO
  const [historyStack, setHistoryStack] = useState<{ tree: TreeNode; available: number[] }[]>([]);

  // Selected parent node in tree where player wants to attach child
  const [targetParentNode, setTargetParentNode] = useState<TreeNode | null>(null);

  // Feedback banner
  const [statusMessage, setStatusMessage] = useState<{
    type: 'info' | 'error' | 'success';
    text: string;
  }>({
    type: 'info',
    text: 'Bước 1: Chọn một số từ danh sách bên dưới, sau đó nhấp vào một node trên cây và chọn gắn vào TRÁI (LEFT) hoặc PHẢI (RIGHT).',
  });

  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(100);
  const [mistakes, setMistakes] = useState(0);

  // Handle clicking a node on the tree
  const handleTreeNodeClick = (node: TreeNode) => {
    sound.playClick();
    setTargetParentNode(node);
  };

  // Attach selected number to left or right of targetParentNode
  const handleAttachNode = (side: 'left' | 'right') => {
    if (selectedNum === null) {
      sound.playError();
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng chọn một số từ danh sách trước khi gắn vào cây!',
      });
      return;
    }

    if (!targetParentNode) {
      sound.playError();
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng nhấp chọn một node cha trên cây để gắn con!',
      });
      return;
    }

    // Save history for UNDO
    setHistoryStack((prev) => [
      ...prev,
      { tree: cloneTree(userTree)!, available: [...availableNumbers] },
    ]);

    const cloned = cloneTree(userTree)!;
    const parentInTree = findNodeById(cloned, targetParentNode.id);

    if (!parentInTree) return;

    if (side === 'left') {
      if (parentInTree.left) {
        sound.playError();
        setMistakes((m) => m + 1);
        setStatusMessage({
          type: 'error',
          text: `Node (${parentInTree.val}) đã có con trái (${parentInTree.left.val}). Một node nhị phân chỉ có tối đa 1 con trái!`,
        });
        return;
      }
      parentInTree.left = {
        id: createId(`node_${selectedNum}`),
        val: selectedNum,
      };
    } else {
      if (parentInTree.right) {
        sound.playError();
        setMistakes((m) => m + 1);
        setStatusMessage({
          type: 'error',
          text: `Node (${parentInTree.val}) đã có con phải (${parentInTree.right.val}). Một node nhị phân chỉ có tối đa 1 con phải!`,
        });
        return;
      }
      parentInTree.right = {
        id: createId(`node_${selectedNum}`),
        val: selectedNum,
      };
    }

    sound.playNodeCreated();
    setUserTree(cloned);
    setAvailableNumbers((prev) => prev.filter((n) => n !== selectedNum));
    setSelectedNum(null);
    setTargetParentNode(null);

    setStatusMessage({
      type: 'info',
      text: `Đã gắn node (${selectedNum}) vào bên ${side === 'left' ? 'TRÁI' : 'PHẢI'} của node (${parentInTree.val})!`,
    });
  };

  // UNDO last action
  const handleUndo = () => {
    if (historyStack.length === 0) return;
    sound.playClick();
    const last = historyStack[historyStack.length - 1];
    setUserTree(last.tree);
    setAvailableNumbers(last.available);
    setHistoryStack((prev) => prev.slice(0, -1));
    setSelectedNum(null);
    setTargetParentNode(null);
    setStatusMessage({
      type: 'info',
      text: 'Đã hoàn tác bước vừa rồi.',
    });
  };

  // RESET tree to initial root 50
  const handleReset = () => {
    sound.playClick();
    setUserTree({ id: 'n_50', val: 50 });
    setAvailableNumbers([30, 70, 20, 40, 60, 80]);
    setHistoryStack([]);
    setSelectedNum(null);
    setTargetParentNode(null);
    setStatusMessage({
      type: 'info',
      text: 'Đã làm mới cây. Hãy bắt đầu xây dựng lại từ Root (50).',
    });
  };

  // Check if current tree matches target structure
  const handleCheckSolution = () => {
    // Target validation:
    // Root = 50
    // Left = 30 (left = 20, right = 40)
    // Right = 70 (left = 60, right = 80)
    const t30 = userTree.left;
    const t70 = userTree.right;

    const isMatch =
      userTree.val === 50 &&
      t30?.val === 30 &&
      t30?.left?.val === 20 &&
      t30?.right?.val === 40 &&
      t70?.val === 70 &&
      t70?.left?.val === 60 &&
      t70?.right?.val === 80 &&
      !t30?.left?.left &&
      !t30?.left?.right &&
      !t30?.right?.left &&
      !t30?.right?.right &&
      !t70?.left?.left &&
      !t70?.left?.right &&
      !t70?.right?.left &&
      !t70?.right?.right;

    if (isMatch) {
      sound.playVictory();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      let stars = 3;
      if (mistakes > 2) stars = 1;
      else if (mistakes > 0) stars = 2;

      setIsCompleted(true);
      onCompleteLevel(stars, 150, score);
    } else {
      sound.playError();
      setMistakes((m) => m + 1);
      setScore((s) => Math.max(20, s - 20));
      setStatusMessage({
        type: 'error',
        text: 'Cấu trúc cây chưa khớp với mẫu mục tiêu! Hãy xem lại vị trí của 30 (con trái 50), 70 (con phải 50), và các lá 20, 40, 60, 80.',
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Level Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            02 — BINARY FORGE • BUILD BINARY TREES
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Xây Dựng Cây Nhị Phân Hoàn Chỉnh
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onOpenAiTutorWithContext({
                currentLevel: 'Level 2: Binary Builder',
                treeState: userTree,
                mistakes,
                question: 'Làm sao xây cây nhị phân đúng mẫu 50 -> (30, 70) -> (20, 40, 60, 80)?',
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

      {/* Target Tree Goal Spec */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Mục tiêu màn chơi (Build this tree):
          </span>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
            Gốc: 50 | Cây con trái: 30 (chứa 20, 40) | Cây con phải: 70 (chứa 60, 80)
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold font-mono px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          <span>50 → [30, 70] → [20, 40, 60, 80]</span>
        </div>
      </div>

      {/* Interactive Tree View */}
      <div className="mb-4">
        <TreeViewer
          root={userTree}
          onNodeClick={handleTreeNodeClick}
          selectedNodeId={targetParentNode?.id}
          height={320}
        />
      </div>

      {/* Action Controls & Available Numbers */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Available Numbers to Place */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
            1. Chọn số cần gắn vào cây:
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {availableNumbers.length === 0 ? (
              <span className="text-xs text-emerald-600 font-semibold italic">
                Đã đặt hết các số! Hãy nhấp nút KIỂM TRA (CHECK) bên dưới.
              </span>
            ) : (
              availableNumbers.map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    sound.playClick();
                    setSelectedNum(num);
                  }}
                  className={`w-11 h-11 rounded-2xl font-mono font-bold text-sm transition-all shadow-xs flex items-center justify-center ${
                    selectedNum === num
                      ? 'bg-blue-600 text-white scale-110 ring-4 ring-blue-400/30 shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {num}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Target Parent Selection & Direction Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-slate-400 font-medium">Node cha đã chọn: </span>
            <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {targetParentNode ? `Node (${targetParentNode.val})` : '(Hãy click vào một node trên cây)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAttachNode('left')}
              disabled={selectedNum === null || !targetParentNode}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
            >
              <CornerDownLeft className="w-4 h-4" />
              <span>Gắn TRÁI (Left)</span>
            </button>

            <button
              onClick={() => handleAttachNode('right')}
              disabled={selectedNum === null || !targetParentNode}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <span>Gắn PHẢI (Right)</span>
              <CornerDownRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Utility Actions: Undo, Reset, Check */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={historyStack.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>UNDO</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>
          </div>

          <button
            onClick={handleCheckSolution}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>KIỂM TRA (CHECK)</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      <div
        className={`mt-4 p-3.5 rounded-2xl border text-xs leading-relaxed transition-all ${
          statusMessage.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            : statusMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
        }`}
      >
        {statusMessage.text}
      </div>

      {/* Completion Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 text-center border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              CÂY NHỊ PHÂN HOÀN THÀNH!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Bạn đã xây dựng cây nhị phân chính xác 100% theo đúng cấu trúc yêu cầu!
            </p>

            <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-around">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Điểm số</span>
                <p className="text-xl font-black text-slate-900 dark:text-white">{score}</p>
              </div>
              <div className="border-r border-slate-200 dark:border-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Phần thưởng</span>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">+150 XP</p>
              </div>
            </div>

            {/* What you just learned */}
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left text-xs space-y-1">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-emerald-700 dark:text-emerald-300 block">
                📖 WHAT YOU JUST LEARNED
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                • <strong>Cây nhị phân (Binary Tree)</strong>: Mỗi node có tối đa 2 con (nhánh Left và Right).
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                • <strong>Đặc điểm cấu trúc</strong>: Cây nhị phân không bao giờ có node bậc 3 trở lên.
              </p>
            </div>

            <button
              onClick={onBackToMap}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              Tiến lên Level 03
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
