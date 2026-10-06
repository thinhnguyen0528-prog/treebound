import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TreeNode, PlayerStats, NodeState } from '../types/game';
import { TreeViewer } from '../components/TreeViewer';
import { 
  createStandardSampleTree, 
  buildBSTFromArray, 
  getLeafNodes, 
  getTreeHeight, 
  getPreOrderSequence, 
  getInOrderSequence, 
  getPostOrderSequence,
  isLeafNode 
} from '../utils/treeEngine';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Crown, Timer, Flame, Star, Trophy, HelpCircle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface Level6TreeMasterProps {
  stats: PlayerStats;
  onCompleteLevel: (stars: number, earnedXp: number, score: number) => void;
  onOpenAiTutorWithContext: (ctx: any) => void;
  onBackToMap: () => void;
}

interface BossMission {
  id: number;
  stageName: string;
  question: string;
  instruction: string;
  type: 'click_node' | 'multiple_choice';
  options?: { text: string; isCorrect: boolean }[];
  validateClick?: (node: TreeNode) => { isCorrect: boolean; explanation: string };
  explanation: string;
}

export const Level6TreeMaster: React.FC<Level6TreeMasterProps> = ({
  stats,
  onCompleteLevel,
  onOpenAiTutorWithContext,
  onBackToMap,
}) => {
  const tree = useMemo(() => createStandardSampleTree(), []);

  // Timer
  const [secondsLeft, setSecondsLeft] = useState<number>(180); // 3 minutes boss challenge
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Combo & Score
  const [combo, setCombo] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);

  // Boss missions (comprehensive 9-step challenge)
  const missions: BossMission[] = useMemo(() => [
    {
      id: 1,
      stageName: 'GIAI ĐOẠN 1: ROOT IDENTIFICATION',
      question: 'Nhấp vào NODE GỐC (ROOT) của cây để kích hoạt đấu trường:',
      instruction: 'Click trực tiếp vào Root trên hình cây',
      type: 'click_node',
      validateClick: (node) => ({
        isCorrect: node.val === 50,
        explanation: node.val === 50 ? 'Gốc (50) đã kích hoạt!' : 'Đây chưa phải là Node gốc (không có nút cha).',
      }),
      explanation: 'Node gốc là 50 (nằm ở đỉnh cao nhất).',
    },
    {
      id: 2,
      stageName: 'GIAI ĐOẠN 2: LEAF DETECTION',
      question: 'Nhấp vào một NODE LÁ (LEAF) của cây:',
      instruction: 'Click vào một node có bậc 0 (không có con)',
      type: 'click_node',
      validateClick: (node) => ({
        isCorrect: isLeafNode(node),
        explanation: isLeafNode(node) ? `Chính xác! (${node.val}) là node lá.` : `(${node.val}) vẫn có con!`,
      }),
      explanation: 'Các node lá gồm: 20, 40, 60, 80.',
    },
    {
      id: 3,
      stageName: 'GIAI ĐOẠN 3: TREE HEIGHT',
      question: 'CHIỀU CAO (HEIGHT) của cây nhị phân này là bao nhiêu?',
      instruction: 'Chọn số mức tính từ Root',
      type: 'multiple_choice',
      options: [
        { text: '2 mức', isCorrect: false },
        { text: '3 mức (Mức 1: 50 | Mức 2: 30, 70 | Mức 3: 20, 40, 60, 80)', isCorrect: true },
        { text: '4 mức', isCorrect: false },
        { text: '7 mức', isCorrect: false },
      ],
      explanation: 'Cây có 3 mức chiều cao.',
    },
    {
      id: 4,
      stageName: 'GIAI ĐOẠN 4: PREORDER MASTERY',
      question: 'Dãy duyệt PREORDER (NLR) chính xác của cây là gì?',
      instruction: 'Node -> Left -> Right',
      type: 'multiple_choice',
      options: [
        { text: '50 30 20 40 70 60 80', isCorrect: true },
        { text: '20 30 40 50 60 70 80', isCorrect: false },
        { text: '20 40 30 60 80 70 50', isCorrect: false },
        { text: '50 70 80 60 30 40 20', isCorrect: false },
      ],
      explanation: 'PreOrder: 50 -> (30, 20, 40) -> (70, 60, 80).',
    },
    {
      id: 5,
      stageName: 'GIAI ĐOẠN 5: INORDER MASTERY',
      question: 'Dãy duyệt INORDER (LNR) chính xác của cây là gì?',
      instruction: 'Left -> Node -> Right',
      type: 'multiple_choice',
      options: [
        { text: '50 30 20 40 70 60 80', isCorrect: false },
        { text: '20 30 40 50 60 70 80', isCorrect: true },
        { text: '20 40 30 60 80 70 50', isCorrect: false },
        { text: '80 70 60 50 40 30 20', isCorrect: false },
      ],
      explanation: 'InOrder trên BST luôn cho dãy tăng dần: 20 30 40 50 60 70 80.',
    },
    {
      id: 6,
      stageName: 'GIAI ĐOẠN 6: POSTORDER MASTERY',
      question: 'Dãy duyệt POSTORDER (LRN) chính xác của cây là gì?',
      instruction: 'Left -> Right -> Node',
      type: 'multiple_choice',
      options: [
        { text: '20 40 30 60 80 70 50', isCorrect: true },
        { text: '20 30 40 50 60 70 80', isCorrect: false },
        { text: '50 30 20 40 70 60 80', isCorrect: false },
        { text: '80 60 70 40 20 30 50', isCorrect: false },
      ],
      explanation: 'PostOrder: (20, 40, 30) -> (60, 80, 70) -> 50.',
    },
    {
      id: 7,
      stageName: 'GIAI ĐOẠN 7: SEARCH TARGET',
      question: 'Để TÌM NODE (40) trong cây BST, ta đi theo lộ trình nào?',
      instruction: 'Bắt đầu từ Root 50',
      type: 'multiple_choice',
      options: [
        { text: '50 → Rẽ PHẢI (70) → Rẽ TRÁI (40)', isCorrect: false },
        { text: '50 → Rẽ TRÁI (30) → Rẽ PHẢI (40)', isCorrect: true },
        { text: '50 → Rẽ TRÁI (30) → Rẽ TRÁI (40)', isCorrect: false },
        { text: '50 → Rẽ PHẢI (70) → Rẽ PHẢI (40)', isCorrect: false },
      ],
      explanation: 'Vì 40 < 50 (rẽ trái đến 30), sau đó 40 > 30 (rẽ phải đến 40).',
    },
    {
      id: 8,
      stageName: 'GIAI ĐOẠN 8: BST VERIFICATION',
      question: 'Cây hiện tại có phải là Cây Tìm Kiếm Nhị Phân (BST) hợp lệ không?',
      instruction: 'Kiểm tra: Mọi node cây trái < Root, mọi node cây phải > Root',
      type: 'multiple_choice',
      options: [
        { text: 'HỢP LỆ: Mọi node nhánh trái < node hiện tại < mọi node nhánh phải', isCorrect: true },
        { text: 'KHÔNG HỢP LỆ: Có node vi phạm quy tắc', isCorrect: false },
      ],
      explanation: 'Cây này thỏa mãn tính chất BST tại tất cả các đỉnh.',
    },
    {
      id: 9,
      stageName: 'GIAI ĐOẠN 9: COMPLETE & FULL TREE',
      question: 'Cây trên màn hình thuộc dạng cây nhị phân nào?',
      instruction: 'Kiểm tra tính chất Đầy Đủ (Full) và Hoàn Chỉnh (Complete)',
      type: 'multiple_choice',
      options: [
        { text: 'Chỉ là Cây nhị phân lệch', isCorrect: false },
        { text: 'Vừa là Full Binary Tree, vừa là Complete Binary Tree (và là Perfect)', isCorrect: true },
        { text: 'Chỉ là Full nhưng không Complete', isCorrect: false },
        { text: 'Không phải cây nhị phân', isCorrect: false },
      ],
      explanation: 'Mọi node không phải lá đều có đúng 2 con (Full), và mọi lá ở cùng mức 3 (Complete & Perfect)!',
    },
  ], []);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeStates, setNodeStates] = useState<Record<string, NodeState>>({});
  const [feedback, setFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    text: string;
  }>({ show: false, isCorrect: false, text: '' });

  const [isVictory, setIsVictory] = useState<boolean>(false);

  const currentMission = missions[currentIdx];

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft]);

  // Handle node click
  const handleNodeClick = (node: TreeNode) => {
    if (feedback.show && feedback.isCorrect) return;
    if (currentMission.type !== 'click_node' || !currentMission.validateClick) return;

    setSelectedNodeId(node.id);
    const res = currentMission.validateClick(node);

    if (res.isCorrect) {
      sound.playCorrect();
      setCombo((c) => c + 1);
      const earnedPoints = 100 + (secondsLeft > 100 ? 50 : 20) + (combo + 1) * 10;
      setScore((s) => s + earnedPoints);
      setNodeStates({ [node.id]: 'correct' });
      setFeedback({ show: true, isCorrect: true, text: res.explanation });
    } else {
      sound.playError();
      setCombo(0);
      setMistakes((m) => m + 1);
      setScore((s) => Math.max(0, s - 25));
      setNodeStates({ [node.id]: 'wrong' });
      setFeedback({ show: true, isCorrect: false, text: res.explanation });
    }
  };

  // Handle multiple choice
  const handleOptionClick = (opt: { text: string; isCorrect: boolean }) => {
    if (feedback.show && feedback.isCorrect) return;

    if (opt.isCorrect) {
      sound.playCorrect();
      setCombo((c) => c + 1);
      const earnedPoints = 100 + (secondsLeft > 100 ? 50 : 20) + (combo + 1) * 10;
      setScore((s) => s + earnedPoints);
      setFeedback({ show: true, isCorrect: true, text: currentMission.explanation });
    } else {
      sound.playError();
      setCombo(0);
      setMistakes((m) => m + 1);
      setScore((s) => Math.max(0, s - 25));
      setFeedback({
        show: true,
        isCorrect: false,
        text: `Chưa chính xác! ${currentMission.explanation}`,
      });
    }
  };

  const handleNextMission = () => {
    sound.playClick();
    setSelectedNodeId(null);
    setNodeStates({});
    setFeedback({ show: false, isCorrect: false, text: '' });

    if (currentIdx + 1 < missions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Completed Tree Master Boss!
      setIsTimerRunning(false);
      sound.playVictory();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });

      let stars = 1;
      if (mistakes <= 1 && secondsLeft >= 60) stars = 3;
      else if (mistakes <= 3) stars = 2;

      setIsVictory(true);
      onCompleteLevel(stars, 400, score);
    }
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Boss Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              06 — TREEBOUND • FINAL MASTER CHALLENGE
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              TREEBOUND: Thử Thách Vô Địch
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timer HUD */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs border border-slate-700">
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span className={secondsLeft < 30 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}>
              {formatTimer(secondsLeft)}
            </span>
          </div>

          {/* Combo HUD */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30 font-bold text-xs">
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            <span>Combo x{combo}</span>
          </div>

          <button
            onClick={() =>
              onOpenAiTutorWithContext({
                currentLevel: '06 — TREEBOUND',
                mission: currentMission.stageName,
                question: currentMission.question,
                mistakes,
              })
            }
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mentor</span>
          </button>
        </div>
      </div>

      {/* Mission Prompt Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs mb-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
          <span className="text-amber-500 font-extrabold">{currentMission.stageName}</span>
          <span className="text-emerald-600 font-mono">Điểm: {score}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / missions.length) * 100}%` }}
          />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
          {currentMission.question}
        </h3>
        <p className="text-xs text-slate-400 mt-1 italic">
          👉 {currentMission.instruction}
        </p>
      </div>

      {/* Visual Tree */}
      <div className="mb-4">
        <TreeViewer
          root={tree}
          onNodeClick={handleNodeClick}
          selectedNodeId={selectedNodeId}
          customNodeStates={nodeStates}
          height={320}
        />
      </div>

      {/* Multiple choice options */}
      {currentMission.type === 'multiple_choice' && currentMission.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {currentMission.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(opt)}
              disabled={feedback.show && feedback.isCorrect}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 hover:bg-amber-50/40 dark:hover:bg-slate-800 text-left text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-xs transition-all active:scale-98"
            >
              <span className="text-xs text-slate-400 font-bold mr-2">
                {String.fromCharCode(65 + idx)}.
              </span>
              <span>{opt.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Feedback Banner */}
      {feedback.show && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 animate-fade-in ${
            feedback.isCorrect
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {feedback.isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs sm:text-sm font-bold">
                {feedback.isCorrect ? 'Xuất sắc!' : 'Chưa đúng!'}
              </p>
              <p className="text-xs mt-0.5 leading-relaxed opacity-90">{feedback.text}</p>
            </div>
          </div>

          {feedback.isCorrect && (
            <button
              onClick={handleNextMission}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex-shrink-0"
            >
              <span>{currentIdx + 1 === missions.length ? 'Xưng Vương' : 'Chặng tiếp'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Victory Modal */}
      {isVictory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 text-center border-2 border-amber-500/60 shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-500/30 shadow-lg shadow-amber-500/20">
              <Crown className="w-10 h-10 animate-bounce-subtle" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              BẠN LÀ TREEBOUND MASTER!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Chúc mừng bạn đã chinh phục trọn vẹn toàn bộ 6 cấp độ của TREEBOUND! Bạn đã làm chủ lý thuyết cây nhị phân, thuật toán duyệt NLR/LNR/LRN và cấu trúc BST.
            </p>

            <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-around">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Tổng điểm</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{score}</p>
              </div>
              <div className="border-r border-slate-200 dark:border-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Thời gian còn</span>
                <p className="text-2xl font-black text-amber-500">{formatTimer(secondsLeft)}</p>
              </div>
              <div className="border-r border-slate-200 dark:border-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Phần thưởng</span>
                <p className="text-2xl font-black text-emerald-500">+400 XP</p>
              </div>
            </div>

            {/* What you just learned */}
            <div className="mb-6 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-left text-xs space-y-1">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-300 block">
                👑 MASTER RECAP — TOÀN BỘ KIẾN THỨC BÀI 7
              </span>
              <p className="text-slate-700 dark:text-slate-300">
                • <strong>Cây & Cây nhị phân</strong>: Cấu trúc phân cấp, bậc tối đa 2, phân biệt Full, Complete, Perfect.
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                • <strong>Duyệt cây</strong>: PreOrder (N-L-R), InOrder (L-N-R), PostOrder (L-R-N) với độ phức tạp O(N).
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                • <strong>Cây tìm kiếm nhị phân (BST)</strong>: Thao tác Chèn (Insert), Tìm kiếm (Search) trong O(log N) và Xóa (Delete) bảo toàn tính chất sắp xếp.
              </p>
            </div>

            <button
              onClick={onBackToMap}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
            >
              Về Bản Đồ & Vinh Danh Chiến Tích
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
