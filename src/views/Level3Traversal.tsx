import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TreeNode, TraversalType, TraversalStep, PlayerStats, NodeState } from '../types/game';
import { TreeViewer } from '../components/TreeViewer';
import { CodeViewer } from '../components/CodeViewer';
import { 
  createStandardSampleTree, 
  generateTraversalSteps, 
  getPreOrderSequence, 
  getInOrderSequence, 
  getPostOrderSequence 
} from '../utils/treeEngine';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Sparkles, 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Gauge,
  Undo2,
  Trash2,
  Check
} from 'lucide-react';

interface Level3TraversalProps {
  stats: PlayerStats;
  onCompleteLevel: (stars: number, earnedXp: number, score: number) => void;
  onOpenAiTutorWithContext: (ctx: any) => void;
  onBackToMap: () => void;
}

type SpeedMultiplier = '0.5x' | '1x' | '1.5x' | '2x';

export const Level3Traversal: React.FC<Level3TraversalProps> = ({
  stats,
  onCompleteLevel,
  onOpenAiTutorWithContext,
  onBackToMap,
}) => {
  // Mode: Learning Animation vs Puzzle Challenge
  const [activeTab, setActiveTab] = useState<'academy' | 'puzzle'>('academy');
  const [traversalType, setTraversalType] = useState<TraversalType>('preorder');

  // Traversal Animation State
  const tree = useMemo(() => createStandardSampleTree(), []);
  const steps: TraversalStep[] = useMemo(() => {
    return generateTraversalSteps(tree, traversalType);
  }, [tree, traversalType]);

  const [currentStepIdx, setCurrentStepIdx] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<SpeedMultiplier>('1x');

  const speedMs = useMemo(() => {
    switch (speedMultiplier) {
      case '0.5x': return 1600;
      case '1x': return 900;
      case '1.5x': return 600;
      case '2x': return 400;
      default: return 900;
    }
  }, [speedMultiplier]);

  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Active step info
  const currentStep = currentStepIdx >= 0 && currentStepIdx < steps.length ? steps[currentStepIdx] : null;

  // Node states and badges for rendering in Academy
  const { nodeStates, nodeBadges, visitedSequence } = useMemo(() => {
    const states: Record<string, NodeState> = {};
    const badges: Record<string, number> = {};
    const seq: (number | string)[] = [];

    if (currentStepIdx >= 0) {
      for (let i = 0; i <= currentStepIdx; i++) {
        const s = steps[i];
        if (s.action === 'visit') {
          if (!seq.includes(s.val)) {
            seq.push(s.val);
            badges[s.nodeId] = seq.length; // 1-indexed order badge
          }
          states[s.nodeId] = i === currentStepIdx ? 'current' : 'visited';
        } else if (i === currentStepIdx) {
          states[s.nodeId] = 'checking';
        }
      }
    }

    return { nodeStates: states, nodeBadges: badges, visitedSequence: seq };
  }, [currentStepIdx, steps]);

  // Step advancement
  const handleNextStep = () => {
    if (currentStepIdx + 1 < steps.length) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      const s = steps[nextIdx];
      if (s.action === 'visit') {
        sound.playNodeSelect(520 + (nextIdx % 7) * 40);
      } else {
        sound.playClick();
      }
    } else {
      setIsPlaying(false);
    }
  };

  // Play/Pause effect loop
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setTimeout(() => {
        if (currentStepIdx + 1 < steps.length) {
          handleNextStep();
        } else {
          setIsPlaying(false);
        }
      }, speedMs);
    }
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, currentStepIdx, steps.length, speedMs]);

  const handleResetAnimation = () => {
    setIsPlaying(false);
    setCurrentStepIdx(-1);
    sound.playClick();
  };

  const handleTogglePlay = () => {
    sound.playClick();
    if (currentStepIdx >= steps.length - 1) {
      setCurrentStepIdx(-1);
    }
    setIsPlaying(!isPlaying);
  };

  // --- TRAVERSAL PUZZLE (SECTION 14 UPGRADE) ---
  const [puzzleType, setPuzzleType] = useState<TraversalType>('preorder');
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [errorIndex, setErrorIndex] = useState<number | null>(null);
  const [puzzleFeedback, setPuzzleFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    text: string;
  }>({ show: false, isCorrect: false, text: '' });
  const [puzzleScore, setPuzzleScore] = useState<number>(0);
  const [puzzleMistakes, setPuzzleMistakes] = useState<number>(0);
  const [puzzleRound, setPuzzleRound] = useState<number>(1); // Round 1: PreOrder, Round 2: InOrder, Round 3: PostOrder
  const [isLevelFinished, setIsLevelFinished] = useState<boolean>(false);

  // Available selectable nodes for the puzzle
  const allNodesList = [50, 30, 70, 20, 40, 60, 80];

  // Expected sequence for current puzzle type
  const targetSequence = useMemo(() => {
    if (puzzleType === 'preorder') return getPreOrderSequence(tree).map(Number);
    if (puzzleType === 'inorder') return getInOrderSequence(tree).map(Number);
    return getPostOrderSequence(tree).map(Number);
  }, [tree, puzzleType]);

  const handleAddNodeToSequence = (num: number) => {
    if (puzzleFeedback.show && puzzleFeedback.isCorrect) return;
    if (userSequence.includes(num)) return; // already added

    sound.playClick();
    setErrorIndex(null);
    setPuzzleFeedback({ show: false, isCorrect: false, text: '' });
    setUserSequence((prev) => [...prev, num]);
  };

  const handleUndoSequence = () => {
    if (userSequence.length === 0) return;
    sound.playClick();
    setUserSequence((prev) => prev.slice(0, -1));
    setErrorIndex(null);
    setPuzzleFeedback({ show: false, isCorrect: false, text: '' });
  };

  const handleClearSequence = () => {
    sound.playClick();
    setUserSequence([]);
    setErrorIndex(null);
    setPuzzleFeedback({ show: false, isCorrect: false, text: '' });
  };

  const handleCheckSequence = () => {
    if (userSequence.length === 0) return;

    // Check step by step
    for (let i = 0; i < userSequence.length; i++) {
      if (userSequence[i] !== targetSequence[i]) {
        sound.playError();
        setErrorIndex(i);
        setPuzzleMistakes((m) => m + 1);
        const ruleName =
          puzzleType === 'preorder'
            ? 'PreOrder (Node → Left → Right)'
            : puzzleType === 'inorder'
            ? 'InOrder (Left → Node → Right)'
            : 'PostOrder (Left → Right → Node)';

        setPuzzleFeedback({
          show: true,
          isCorrect: false,
          text: `Bước ${i + 1}: Bạn chọn (${userSequence[i]}) chưa chính xác! Trong ${ruleName}, đỉnh cần duyệt tiếp theo là (${targetSequence[i]}). Hãy bấm "UNDO" để sửa lại!`,
        });
        return;
      }
    }

    // If incomplete sequence
    if (userSequence.length < targetSequence.length) {
      sound.playClick();
      setPuzzleFeedback({
        show: true,
        isCorrect: false,
        text: `Các đỉnh đã chọn (${userSequence.join(' → ')}) đều ĐÚNG! Bạn cần chọn thêm ${targetSequence.length - userSequence.length} đỉnh nữa để hoàn thành.`,
      });
      return;
    }

    // 100% complete and correct!
    sound.playCorrect();
    setErrorIndex(null);
    setPuzzleScore((s) => s + 100);
    setPuzzleFeedback({
      show: true,
      isCorrect: true,
      text: `Perfect traversal! Bạn đã xây dựng chính xác 100% chuỗi ${puzzleType.toUpperCase()}!`,
    });
  };

  const handleNextPuzzleRound = () => {
    sound.playClick();
    setUserSequence([]);
    setErrorIndex(null);
    setPuzzleFeedback({ show: false, isCorrect: false, text: '' });

    if (puzzleRound === 1) {
      setPuzzleRound(2);
      setPuzzleType('inorder');
    } else if (puzzleRound === 2) {
      setPuzzleRound(3);
      setPuzzleType('postorder');
    } else {
      // Completed all 3 rounds!
      sound.playVictory();
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      let stars = 3;
      if (puzzleMistakes > 2) stars = 1;
      else if (puzzleMistakes > 0) stars = 2;

      setIsLevelFinished(true);
      onCompleteLevel(stars, 200, puzzleScore);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      {/* Level Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            03 — TRAVERSAL PATH • DUYỆT CÂY
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            PreOrder, InOrder & PostOrder
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Academy vs Puzzle Tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('academy');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'academy'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              1. Visual Execution
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('puzzle');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'puzzle'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              2. Traversal Puzzle
            </button>
          </div>

          <button
            onClick={() =>
              onOpenAiTutorWithContext({
                currentLevel: '03 — Traversal Path',
                traversalType: activeTab === 'academy' ? traversalType : puzzleType,
                activeTab,
                currentStep,
                userSequence,
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

      {/* --- TAB 1: ACADEMY (SIMULATION & CODE EXECUTION VISUALIZER) --- */}
      {activeTab === 'academy' && (
        <div className="space-y-4">
          {/* Traversal Mode Select Buttons & HUD */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2">
              {(['preorder', 'inorder', 'postorder'] as TraversalType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    sound.playClick();
                    setTraversalType(t);
                    handleResetAnimation();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs ${
                    traversalType === t
                      ? 'bg-emerald-600 text-white shadow-emerald-600/20 ring-2 ring-emerald-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {t === 'preorder' && 'PreOrder (NLR)'}
                  {t === 'inorder' && 'InOrder (LNR)'}
                  {t === 'postorder' && 'PostOrder (LRN)'}
                </button>
              ))}
            </div>

            {/* Playback Controls & Speed Multipliers */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleTogglePlay}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Tạm dừng' : 'Chạy (Play)'}</span>
              </button>

              <button
                onClick={handleNextStep}
                disabled={isPlaying || currentStepIdx >= steps.length - 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                title="Bước kế tiếp (Step)"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Từng bước</span>
              </button>

              <button
                onClick={handleResetAnimation}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                title="Làm lại từ đầu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Speed Multiplier Selectors: 0.5x, 1x, 1.5x, 2x */}
              <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
                {(['0.5x', '1x', '1.5x', '2x'] as SpeedMultiplier[]).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      sound.playClick();
                      setSpeedMultiplier(spd);
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                      speedMultiplier === spd
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Execution State HUD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Node</span>
              <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                {currentStep ? currentStep.val : '—'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Execution Step</span>
              <span className="text-base font-black font-mono text-blue-600 dark:text-blue-400">
                {currentStepIdx >= 0 ? `${currentStepIdx + 1} / ${steps.length}` : 'Chưa bắt đầu'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs sm:col-span-2 text-left px-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Quy tắc duyệt</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {traversalType === 'preorder' && 'PREORDER: Node → Left → Right (NLR)'}
                {traversalType === 'inorder' && 'INORDER: Left → Node → Right (LNR)'}
                {traversalType === 'postorder' && 'POSTORDER: Left → Right → Node (LRN)'}
              </span>
            </div>
          </div>

          {/* Main Visual Arena Grid: Tree on Left, Code & Sequence on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 flex flex-col gap-3">
              <TreeViewer
                root={tree}
                customNodeStates={nodeStates}
                customNodeBadges={nodeBadges}
                height={350}
              />

              {/* Traversal Sequence Ribbon */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                  <span>THỨ TỰ ĐÃ DUYỆT (VISITED SEQUENCE):</span>
                  <span className="text-emerald-600 font-mono">
                    {visitedSequence.length} / 7 Đỉnh
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto min-h-[46px] p-1">
                  {visitedSequence.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      Nhấn "Chạy (Play)" hoặc "Từng bước" để quan sát thứ tự các đỉnh được thăm...
                    </span>
                  ) : (
                    visitedSequence.map((v, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-mono font-extrabold text-xs shadow-xs animate-scale-up"
                      >
                        <span className="text-[10px] text-emerald-500 font-sans">#{i + 1}</span>
                        <span>{v}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-3">
              {/* Synchronized Pseudocode Visualizer */}
              <CodeViewer
                traversalType={traversalType}
                activeLine={currentStep?.codeLine}
              />

              {/* Step Explanation Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-xs leading-relaxed">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                  💡 GIẢI THÍCH BƯỚC HIỆN TẠI (CODE → TREE):
                </span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {currentStep
                    ? currentStep.explanation
                    : 'Cây nhị phân đang ở trạng thái ban đầu. Bấm nút "Chạy" hoặc "Từng bước" để quan sát dòng code thực thi tương ứng.'}
                </p>
              </div>

              {/* Call to Action Button to Traversal Puzzle */}
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('puzzle');
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Vào Thử Thách Ghép Chuỗi (Traversal Puzzle)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: TRAVERSAL PUZZLE (BUILD SEQUENCE DIRECTLY) --- */}
      {activeTab === 'puzzle' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Mission Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span className="font-bold text-emerald-600 uppercase">
                Vòng {puzzleRound} / 3: {puzzleType.toUpperCase()}
              </span>
              <span className="text-emerald-600 font-bold font-mono">Điểm: {puzzleScore}</span>
            </div>

            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${(puzzleRound / 3) * 100}%` }}
              />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
              Hãy nhấp chọn các node theo đúng thứ tự duyệt {puzzleType.toUpperCase()} của cây:
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Quy tắc: <strong>{puzzleType === 'preorder' ? 'Node → Left → Right' : puzzleType === 'inorder' ? 'Left → Node → Right' : 'Left → Right → Node'}</strong>
            </p>
          </div>

          {/* Interactive Reference Tree */}
          <TreeViewer
            root={tree}
            onNodeClick={(node) => handleAddNodeToSequence(Number(node.val))}
            height={260}
          />

          {/* User Assembled Sequence Tray */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>CHUỖI BẠN ĐÃ TẠO (CLICK HOẶC CHỌN SỐ BÊN DƯỚI):</span>
              <span className="font-mono text-emerald-600">{userSequence.length} / 7 Đỉnh</span>
            </div>

            {/* Sequence Chips */}
            <div className="flex items-center gap-2 overflow-x-auto min-h-[50px] p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
              {userSequence.length === 0 ? (
                <span className="text-xs text-slate-400 italic">
                  Chưa có node nào. Hãy nhấp vào các số bên dưới hoặc nhấp trực tiếp vào hình cây...
                </span>
              ) : (
                userSequence.map((val, idx) => {
                  const isThisError = errorIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-xs shadow-xs animate-scale-up transition-all ${
                        isThisError
                          ? 'bg-rose-500 text-white ring-4 ring-rose-400/40 animate-shake'
                          : 'bg-emerald-600 text-white shadow-emerald-600/20'
                      }`}
                    >
                      <span className="text-[10px] opacity-75 font-sans">#{idx + 1}</span>
                      <span>{val}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Available clickable node buttons */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                Các node chưa chọn:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {allNodesList.map((num) => {
                  const isUsed = userSequence.includes(num);
                  return (
                    <button
                      key={num}
                      onClick={() => handleAddNodeToSequence(num)}
                      disabled={isUsed}
                      className={`w-11 h-11 rounded-2xl font-mono font-bold text-sm transition-all shadow-xs flex items-center justify-center ${
                        isUsed
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 active:scale-95'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sequence Action Buttons: Check, Undo, Clear */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUndoSequence}
                  disabled={userSequence.length === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>UNDO</span>
                </button>

                <button
                  onClick={handleClearSequence}
                  disabled={userSequence.length === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>CLEAR</span>
                </button>
              </div>

              <button
                onClick={handleCheckSequence}
                disabled={userSequence.length === 0}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>KIỂM TRA (CHECK)</span>
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {puzzleFeedback.show && (
            <div
              className={`p-4 rounded-2xl border flex items-start justify-between gap-3 animate-fade-in ${
                puzzleFeedback.isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {puzzleFeedback.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-xs sm:text-sm font-bold">
                    {puzzleFeedback.isCorrect ? 'Tuyệt vời!' : 'Có bước chưa chính xác!'}
                  </p>
                  <p className="text-xs mt-0.5 leading-relaxed opacity-90">{puzzleFeedback.text}</p>
                </div>
              </div>

              {puzzleFeedback.isCorrect && (
                <button
                  onClick={handleNextPuzzleRound}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex-shrink-0"
                >
                  <span>{puzzleRound === 3 ? 'Hoàn thành' : 'Vòng tiếp theo'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Level Complete Modal */}
          {isLevelFinished && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 text-center border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  LÀM CHỦ TRAVERSAL PATH!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Bạn đã tự tay xây dựng thành công trọn vẹn cả 3 chuỗi duyệt cây: PreOrder, InOrder và PostOrder!
                </p>

                <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-around">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Điểm puzzle</span>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{puzzleScore}</p>
                  </div>
                  <div className="border-r border-slate-200 dark:border-slate-700" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Phần thưởng</span>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">+200 XP</p>
                  </div>
                </div>

                {/* What you just learned recap banner */}
                <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left text-xs space-y-1">
                  <span className="font-extrabold uppercase tracking-wider text-[10px] text-emerald-700 dark:text-emerald-300 block">
                    📖 WHAT YOU JUST LEARNED
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">
                    • <strong>PreOrder (N-L-R)</strong>: Thăm Node gốc trước, rồi đến cây trái, rồi cây phải.
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    • <strong>InOrder (L-N-R)</strong>: Cây trái trước, rồi gốc, rồi cây phải (cho dãy tăng dần trên BST).
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    • <strong>PostOrder (L-R-N)</strong>: Duyệt xong hai cây con rồi mới thăm gốc (xóa cây, tính kích thước).
                  </p>
                </div>

                <button
                  onClick={onBackToMap}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  Mở Khóa Đấu Trường BST Arena
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
