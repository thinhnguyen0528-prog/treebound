import React, { useState, useMemo } from 'react';
import { TreeNode, NodeState, PlayerStats } from '../../src/types/game';
import { TreeViewer } from '../components/TreeViewer';
import { 
  createStandardSampleTree, 
  getNodeDegree, 
  isLeafNode, 
  getLeafNodes, 
  getTreeHeight, 
  getNodeLevel 
} from '../utils/treeEngine';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2, XCircle, ArrowRight, HelpCircle, Trophy, RefreshCw } from 'lucide-react';

interface Level1ExplorerProps {
  stats: PlayerStats;
  onCompleteLevel: (stars: number, earnedXp: number, score: number) => void;
  onOpenAiTutorWithContext: (ctx: any) => void;
  onBackToMap: () => void;
}

interface ExplorerQuestion {
  id: number;
  type: 'click_node' | 'multiple_choice';
  prompt: string;
  targetConcept: string;
  // For click_node
  validateClick?: (node: TreeNode) => { isCorrect: boolean; explanation: string };
  // For multiple_choice
  options?: { label: string; isCorrect: boolean }[];
  explanation: string;
  hint: string;
}

export const Level1Explorer: React.FC<Level1ExplorerProps> = ({
  stats,
  onCompleteLevel,
  onOpenAiTutorWithContext,
  onBackToMap,
}) => {
  const tree = useMemo(() => createStandardSampleTree(), []);

  const questions: ExplorerQuestion[] = useMemo(() => [
    {
      id: 1,
      type: 'click_node',
      prompt: 'Hãy nhấp vào NODE GỐC (ROOT) của cây trên màn hình:',
      targetConcept: 'Root Node',
      validateClick: (node) => {
        const isCorrect = node.val === 50;
        return {
          isCorrect,
          explanation: isCorrect
            ? 'Chính xác! Node (50) là Node gốc (Root) vì nó không có nút cha nào phía trên.'
            : `Chưa đúng! Bạn vừa chọn (${node.val}). Node gốc là đỉnh cao nhất của cây (không có cha).`,
        };
      },
      explanation: 'Node Gốc (Root) là điểm khởi đầu duy nhất của cây, không có bất kỳ nút cha nào.',
      hint: 'Hãy nhìn vào nút ở tầng cao nhất của cây (đỉnh kim tự tháp).',
    },
    {
      id: 2,
      type: 'click_node',
      prompt: 'Hãy nhấp vào một NODE LÁ (LEAF) bất kỳ của cây:',
      targetConcept: 'Leaf Node',
      validateClick: (node) => {
        const isCorrect = isLeafNode(node);
        return {
          isCorrect,
          explanation: isCorrect
            ? `Chính xác! Node (${node.val}) là node lá vì nó có bậc bằng 0 (không có con trái lẫn con phải).`
            : `Chưa đúng! Node (${node.val}) vẫn có con nối bên dưới, nên không phải là node lá!`,
        };
      },
      explanation: 'Node Lá (Leaf) là nút có bậc bằng 0, nghĩa là không có bất kỳ nút con nào (20, 40, 60, 80).',
      hint: 'Node lá nằm ở tầng dưới cùng, không có bất kỳ đường nối rẽ xuống nào nữa.',
    },
    {
      id: 3,
      type: 'multiple_choice',
      prompt: 'Node (30) có BẬC (DEGREE) là bao nhiêu?',
      targetConcept: 'Degree of Node',
      options: [
        { label: 'Bậc 0', isCorrect: false },
        { label: 'Bậc 1', isCorrect: false },
        { label: 'Bậc 2 (Có 2 con: 20 và 40)', isCorrect: true },
        { label: 'Bậc 3', isCorrect: false },
      ],
      explanation: 'Bậc của một node trong cây nhị phân là số con trực tiếp của nó. Node 30 có 2 con là 20 và 40 nên có bậc bằng 2.',
      hint: 'Đếm số lượng nhánh xuất phát trực tiếp từ node 30 xuống dưới.',
    },
    {
      id: 4,
      type: 'multiple_choice',
      prompt: 'CHIỀU CAO (HEIGHT) của cây nhị phân này là bao nhiêu?',
      targetConcept: 'Tree Height',
      options: [
        { label: '2 mức', isCorrect: false },
        { label: '3 mức (Mức 1: 50, Mức 2: 30, 70, Mức 3: 20, 40, 60, 80)', isCorrect: true },
        { label: '4 mức', isCorrect: false },
        { label: '7 mức', isCorrect: false },
      ],
      explanation: 'Chiều cao của cây là số mức từ gốc đến lá xa nhất. Ở đây Root ở Mức 1, con ở Mức 2, cháu ở Mức 3. Vậy Chiều cao = 3.',
      hint: 'Đếm số tầng của cây từ trên xuống dưới.',
    },
    {
      id: 5,
      type: 'click_node',
      prompt: 'Hãy nhấp vào một node nằm ở MỨC 2 (LEVEL 2):',
      targetConcept: 'Node Level',
      validateClick: (node) => {
        const level = getNodeLevel(tree, node.id);
        const isCorrect = level === 2;
        return {
          isCorrect,
          explanation: isCorrect
            ? `Chính xác! Node (${node.val}) nằm ở Mức 2 (ngay dưới Node gốc mức 1).`
            : `Chưa đúng! Node (${node.val}) đang nằm ở Mức ${level}.`,
        };
      },
      explanation: 'Mức của một node: Root ở Mức 1, các con trực tiếp của Root (30 và 70) nằm ở Mức 2.',
      hint: 'Tìm một node là con trực tiếp của Root (50).',
    },
    {
      id: 6,
      type: 'click_node',
      prompt: 'Hãy nhấp vào NÚT CHA (PARENT) của hai node 20 và 40:',
      targetConcept: 'Parent Node',
      validateClick: (node) => {
        const isCorrect = node.val === 30;
        return {
          isCorrect,
          explanation: isCorrect
            ? 'Chính xác! Node (30) là nút cha trực tiếp quản lý hai con 20 (con trái) và 40 (con phải).'
            : `Chưa đúng! Node (${node.val}) không phải là nút cha trực tiếp của 20 và 40.`,
        };
      },
      explanation: 'Nút cha (Parent) là node cấp trên có nhánh nối trực tiếp xuống các node con bên dưới.',
      hint: 'Quan sát node nằm ngay phía trên nối với 20 và 40.',
    },
    {
      id: 7,
      type: 'click_node',
      prompt: 'Hãy nhấp vào CON PHẢI (RIGHT CHILD) trực tiếp của Node gốc (50):',
      targetConcept: 'Right Child',
      validateClick: (node) => {
        const isCorrect = node.val === 70;
        return {
          isCorrect,
          explanation: isCorrect
            ? 'Chính xác! Node (70) là con phải trực tiếp của Root (50).'
            : `Chưa đúng! Node (${node.val}) không phải là con phải của Root (50).`,
        };
      },
      explanation: 'Cây nhị phân phân nhánh thành Cây con trái (Left) và Cây con phải (Right).',
      hint: 'Tìm node nằm ở nhánh rẽ bên phải xuất phát từ 50.',
    },
    {
      id: 8,
      type: 'multiple_choice',
      prompt: 'Cây trên có 7 node. Cây này có bao nhiêu NHÁNH (BRANCH / CẠNH) liên kết?',
      targetConcept: 'Branches / Edges',
      options: [
        { label: '5 nhánh', isCorrect: false },
        { label: '6 nhánh (Quy tắc: Cây N node luôn có đúng N - 1 cạnh)', isCorrect: true },
        { label: '7 nhánh', isCorrect: false },
        { label: '8 nhánh', isCorrect: false },
      ],
      explanation: 'Định lý cấu trúc cây: Một cây gồm N đỉnh thì luôn luôn có đúng N - 1 cạnh liên kết.',
      hint: 'Đếm các đường nối giữa các hình tròn trên màn hình (hoặc lấy 7 - 1).',
    },
  ], [tree]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeStates, setNodeStates] = useState<Record<string, NodeState>>({});
  const [feedback, setFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    text: string;
  }>({ show: false, isCorrect: false, text: '' });
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = questions[currentIdx];

  const handleNodeClick = (node: TreeNode) => {
    if (feedback.show && feedback.isCorrect) return; // Wait to proceed
    if (currentQ.type !== 'click_node' || !currentQ.validateClick) return;

    setSelectedNodeId(node.id);
    const result = currentQ.validateClick(node);

    if (result.isCorrect) {
      sound.playCorrect();
      setNodeStates({ [node.id]: 'correct' });
      setScore((prev) => prev + 100);
      setFeedback({ show: true, isCorrect: true, text: result.explanation });
    } else {
      sound.playError();
      setNodeStates({ [node.id]: 'wrong' });
      setMistakes((prev) => prev + 1);
      setFeedback({ show: true, isCorrect: false, text: result.explanation });
    }
  };

  const handleOptionSelect = (option: { label: string; isCorrect: boolean }) => {
    if (feedback.show && feedback.isCorrect) return;

    if (option.isCorrect) {
      sound.playCorrect();
      setScore((prev) => prev + 100);
      setFeedback({ show: true, isCorrect: true, text: currentQ.explanation });
    } else {
      sound.playError();
      setMistakes((prev) => prev + 1);
      setFeedback({
        show: true,
        isCorrect: false,
        text: `Chưa chính xác! ${currentQ.explanation}`,
      });
    }
  };

  const handleNextQuestion = () => {
    sound.playClick();
    setNodeStates({});
    setSelectedNodeId(null);
    setFeedback({ show: false, isCorrect: false, text: '' });

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Completed Level 1!
      finishLevel();
    }
  };

  const finishLevel = () => {
    let earnedStars = 3;
    if (mistakes > 2) earnedStars = 1;
    else if (mistakes > 0) earnedStars = 2;

    const earnedXp = 100;
    sound.playVictory();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setIsCompleted(true);
    onCompleteLevel(earnedStars, earnedXp, score);
  };

  const handleAskMentor = () => {
    sound.playClick();
    onOpenAiTutorWithContext({
      currentLevel: 'Level 1: Tree Explorer',
      question: currentQ.prompt,
      targetConcept: currentQ.targetConcept,
      mistakes,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            01 — ROOT GROVE • TREE BASICS
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Khám Phá Các Thành Phần Của Cây
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAskMentor}
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

      {/* Progress & Question Prompt Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs mb-4">
        <div className="flex items-center justify-between mb-2 text-xs font-semibold text-slate-500">
          <span>Câu {currentIdx + 1} / {questions.length}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Điểm: {score}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
          {currentQ.prompt}
        </h3>
        {currentQ.type === 'click_node' && (
          <p className="text-xs text-slate-400 mt-1 italic">
            👉 Nhấp trực tiếp vào một hình tròn (node) trên cây bên dưới để trả lời
          </p>
        )}
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

      {/* Multiple choice options (if current question is MC) */}
      {currentQ.type === 'multiple_choice' && currentQ.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(opt)}
              disabled={feedback.show && feedback.isCorrect}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-slate-800 text-left text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-xs transition-all active:scale-98"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Immediate Feedback Banner */}
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
                {feedback.isCorrect ? 'Tuyệt vời!' : 'Chưa chính xác!'}
              </p>
              <p className="text-xs mt-0.5 leading-relaxed opacity-90">{feedback.text}</p>
            </div>
          </div>

          {feedback.isCorrect && (
            <button
              onClick={handleNextQuestion}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex-shrink-0"
            >
              <span>{currentIdx + 1 === questions.length ? 'Hoàn thành' : 'Câu tiếp'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Completion Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 text-center border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              CỬA ẢI 1 HOÀN TẤT!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Bạn đã nắm rõ Root, Leaf, Bậc của node và Chiều cao cây nhị phân!
            </p>

            <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-around">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Điểm số</span>
                <p className="text-xl font-black text-slate-900 dark:text-white">{score}</p>
              </div>
              <div className="border-r border-slate-200 dark:border-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Phần thưởng</span>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">+100 XP</p>
              </div>
            </div>

            {/* What you just learned */}
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left text-xs space-y-1">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-emerald-700 dark:text-emerald-300 block">
                📖 WHAT YOU JUST LEARNED
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                • <strong>Root</strong>: Node duy nhất không có cha, đỉnh khởi đầu của cây.
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                • <strong>Leaf</strong>: Các node có bậc bằng 0 (không có con nào).
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                • <strong>Bậc (Degree)</strong>: Số con trực tiếp của node.
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                • <strong>Chiều cao (Height)</strong>: Số mức từ gốc đến lá sâu nhất.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onBackToMap}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                Tiếp tục hành trình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
