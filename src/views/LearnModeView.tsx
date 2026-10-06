import React, { useState, useMemo } from 'react';
import { TreeNode, LearnTopic, NodeState } from '../types/game';
import { TreeViewer } from '../components/TreeViewer';
import { 
  createStandardSampleTree, 
  buildBSTFromArray, 
  deleteNodeFromBST, 
  isLeafNode,
  getNodeDegree,
  getTreeHeight,
  getLeafNodes
} from '../utils/treeEngine';
import { sound } from '../utils/audio';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  HelpCircle,
  Play
} from 'lucide-react';

interface LearnModeViewProps {
  onOpenAiTutorWithContext: (ctx: any) => void;
  onBackToMap: () => void;
}

export const LEARN_TOPICS: LearnTopic[] = [
  {
    id: 't01',
    num: '01',
    title: 'Khái Niệm Cây (Tree Basics)',
    subtitle: 'Root, Leaf, Node, Branch, Parent & Child',
    summary: 'Cây là cấu trúc dữ liệu phân cấp (hierarchical) gồm một tập hợp các nút (nodes) liên kết với nhau bằng các cạnh (edges/branches).',
    details: [
      '• Root (Gốc): Node duy nhất không có cha, là đỉnh khởi đầu của cây.',
      '• Leaf (Lá): Node không có bất kỳ nút con nào (bậc = 0).',
      '• Branch (Cành/Cạnh): Đoạn nối giữa nút cha và nút con.',
      '• Degree (Bậc của node): Số lượng node con trực tiếp của node đó.',
      '• Height (Chiều cao cây): Số mức từ gốc tới node lá xa nhất.',
      '• Subtree (Cây con): Cây con gốc tại một nút con, gồm nút đó và tất cả con cháu của nó.',
      '• Rừng (Forest): Tập hợp các cây rời nhau. Khi ngắt bỏ node gốc, các cây con còn lại tạo thành một rừng.',
    ],
    keyRules: [
      'Cây không được chứa chu trình (cycle).',
      'Nếu cây có N node thì luôn có đúng N - 1 cạnh liên kết.',
      'Bỏ node gốc của cây sẽ thu được một rừng các cây con.',
    ],
    initialTree: createStandardSampleTree(),
    interactiveAction: 'highlight_leaves',
    miniQuiz: {
      question: 'Node lá (Leaf) là node có đặc điểm nào sau đây?',
      options: [
        'Là node có nhiều con nhất',
        'Là node không có nút con nào (bậc = 0)',
        'Là node nằm ở đỉnh cao nhất',
        'Là node có bậc = 2',
      ],
      correctIndex: 1,
      explanation: 'Node lá là node không có bất kỳ nút con nào nối xuống dưới (Degree = 0).',
    },
  },
  {
    id: 't02',
    num: '02',
    title: 'Cây Nhị Phân & Các Dạng (Binary Tree)',
    subtitle: 'Full, Complete & Perfect Binary Tree',
    summary: 'Cây nhị phân là cây mà mỗi node có tối đa 2 con (Cây con trái - Left Child và Cây con phải - Right Child).',
    details: [
      '• Cây nhị phân đầy đủ (Full / Strictly Binary Tree): Mỗi node đều có đúng 0 hoặc 2 con (không có node nào có 1 con).',
      '• Cây nhị phân hoàn chỉnh (Complete Binary Tree): Mọi mức đều được điền đầy đủ ngoại trừ mức cuối, và mức cuối các node được lấp đầy từ trái sang phải.',
      '• Cây nhị phân gần đầy (Almost Complete Binary Tree): Tương đương cây hoàn chỉnh, các tầng 1..h-1 đầy đủ, tầng đáy điền liên tục từ trái sang phải.',
      '• Cây nhị phân hoàn hảo (Perfect Binary Tree): Tất cả các node trung gian đều có 2 con và tất cả các lá đều nằm ở cùng một mức đáy.',
    ],
    keyRules: [
      'Bậc của bất kỳ node nào trong cây nhị phân chỉ có thể là 0, 1 hoặc 2.',
      'Số node tối đa ở mức k (với Root ở mức 1) là 2^(k-1).',
    ],
    initialTree: createStandardSampleTree(),
    interactiveAction: 'highlight_root',
    miniQuiz: {
      question: 'Cây nhị phân đầy đủ (Full Binary Tree) là cây có đặc điểm gì?',
      options: [
        'Mỗi node chỉ có duy nhất 1 con',
        'Mọi node đều có đúng 0 hoặc 2 con',
        'Mọi mức đều đầy đủ node',
        'Chỉ có tối đa 3 node',
      ],
      correctIndex: 1,
      explanation: 'Trong Full Binary Tree, không có node nào có đúng 1 con; mọi node chỉ có 0 con (node lá) hoặc 2 con.',
    },
  },
  {
    id: 't03',
    num: '03',
    title: 'Biểu Diễn Cây (Tree Representation)',
    subtitle: 'Con trỏ liên kết & Mảng (Array representation)',
    summary: 'Cây nhị phân thường được cài đặt bằng con trỏ liên kết động (Dynamic Linked Nodes) hoặc mảng 1 chiều.',
    details: [
      '• Cấu trúc Node liên kết: Mỗi node gồm 3 thành phần: data (giá trị), left (con trỏ trỏ tới con trái), right (con trỏ trỏ tới con phải).',
      '• Biểu diễn bằng mảng (Heap index): Node tại vị trí i thì con trái ở 2*i + 1, con phải ở 2*i + 2 (nếu bắt đầu từ index 0).',
    ],
    keyRules: [
      'struct Node { int data; Node* left; Node* right; };',
      'Khởi tạo node mới thì cả left và right ban đầu đều trỏ tới NULL (nullptr).',
    ],
    initialTree: createStandardSampleTree(),
    miniQuiz: {
      question: 'Trong biểu diễn danh sách liên kết, một node cây nhị phân chứa mấy con trỏ?',
      options: ['1 con trỏ', '2 con trỏ (trái và phải)', '3 con trỏ', 'Không cần con trỏ'],
      correctIndex: 1,
      explanation: 'Mỗi node cây nhị phân chứa 2 con trỏ: trỏ đến cây con trái và cây con phải.',
    },
  },
  {
    id: 't04',
    num: '04',
    title: 'Tạo Node Mới (Create Node)',
    subtitle: 'Cấp phát bộ nhớ động & Khởi tạo giá trị',
    summary: 'Thao tác cơ bản nhất: Tạo một vùng nhớ mới trên Heap chứa giá trị cần lưu và gán 2 con trỏ trái, phải bằng NULL.',
    details: [
      '• C++: Node* newNode = new Node(val); newNode->left = nullptr; newNode->right = nullptr;',
      '• C: Node* p = (Node*)malloc(sizeof(Node)); p->val = val; p->left = p->right = NULL;',
    ],
    keyRules: [
      'Luôn kiểm tra nếu cấp phát thất bại.',
      'Node mới tạo độc lập ban đầu chính là một cây nhị phân có chiều cao 1.',
    ],
    initialTree: { id: 'single_50', val: 50 },
    miniQuiz: {
      question: 'Khi vừa tạo một node mới xong, con trỏ left và right trỏ tới đâu?',
      options: ['Trỏ tới Root', 'Trỏ tới chính nó', 'Trỏ tới NULL / nullptr', 'Tùy ý'],
      correctIndex: 2,
      explanation: 'Node mới tạo chưa liên kết với bất kỳ ai, nên left và right luôn trỏ tới NULL.',
    },
  },
  {
    id: 't05',
    num: '05',
    title: 'Chèn Node Vào Cây (Insert Node)',
    subtitle: 'Xác định vị trí & Thiết lập liên kết cha-con',
    summary: 'Để chèn một node, ta duyệt từ gốc xuống để tìm vị trí còn trống (NULL) thỏa mãn yêu cầu bài toán, sau đó gán con trỏ cha tới node mới.',
    details: [
      '• Kiểm tra cây rỗng: nếu rỗng, node mới trở thành Root.',
      '• Duyệt tìm vị trí lá thích hợp.',
      '• Gán con trỏ left hoặc right của nút cha tới địa chỉ node mới.',
    ],
    keyRules: [
      'Không gán đè lên nhánh đã có con mà không xử lý cây con cũ.',
      'Cập nhật chiều cao cây nếu cần.',
    ],
    initialTree: createStandardSampleTree(),
    miniQuiz: {
      question: 'Nếu node cha đã có con trái, ta chèn thêm con trái mới bằng cách nào?',
      options: [
        'Ghi đè trực tiếp làm mất cây con cũ',
        'Không thể chèn trực tiếp vào vị trí đó, phải chèn xuống sâu hơn hoặc báo lỗi',
        'Tạo nhánh thứ 3',
        'Xóa luôn node cha',
      ],
      correctIndex: 1,
      explanation: 'Cây nhị phân chỉ cho phép tối đa 1 con trái cho mỗi node.',
    },
  },
  {
    id: 't06',
    num: '06',
    title: 'Thuật Toán Duyệt Cây (Tree Traversal)',
    subtitle: 'PreOrder, InOrder & PostOrder',
    summary: 'Duyệt cây là hành trình đi qua tất cả các đỉnh của cây đúng một lần theo một thứ tự xác định.',
    details: [
      '• PreOrder (N-L-R): Thăm Node gốc → Cây con trái → Cây con phải.',
      '• InOrder (L-N-R): Cây con trái → Thăm Node gốc → Cây con phải.',
      '• PostOrder (L-R-N): Cây con trái → Cây con phải → Thăm Node gốc.',
    ],
    keyRules: [
      'Cả 3 phương pháp đều sử dụng đệ quy tự nhiên hoặc ngăn xếp (Stack).',
      'Độ phức tạp thời gian luôn là O(N) vì mỗi node được thăm đúng 1 lần.',
    ],
    initialTree: createStandardSampleTree(),
    interactiveAction: 'traverse',
    miniQuiz: {
      question: 'Thứ tự duyệt của InOrder là gì?',
      options: [
        'Node → Left → Right (NLR)',
        'Left → Node → Right (LNR)',
        'Left → Right → Node (LRN)',
        'Right → Node → Left (RNL)',
      ],
      correctIndex: 1,
      explanation: 'InOrder (Trung thứ tự) là Left → Node → Right (LNR).',
    },
  },
  {
    id: 't07',
    num: '07',
    title: 'Cây Tìm Kiếm Nhị Phân (BST)',
    subtitle: 'Binary Search Tree & Tính chất sắp xếp',
    summary: 'BST là cây nhị phân đặc biệt, trong đó với mọi node X: Mọi giá trị ở cây con trái < X và mọi giá trị ở cây con phải > X.',
    details: [
      '• Tính chất cốt lõi: Left Subtree < Node < Right Subtree.',
      '• Khi duyệt InOrder trên BST, ta luôn nhận được dãy số được sắp xếp TĂNG DẦN.',
      '• Khắc phục nhược điểm tìm kiếm O(N) của mảng thông thường xuống còn O(log N) trong trường hợp cân bằng.',
    ],
    keyRules: [
      'Không chứa giá trị trùng lặp (hoặc quy ước bằng thì sang phải/trái).',
      'Trường hợp xấu nhất cây bị suy biến thành danh sách liên kết thì độ phức tạp là O(N).',
    ],
    initialTree: createStandardSampleTree(),
    interactiveAction: 'bst_rule',
    miniQuiz: {
      question: 'Khi duyệt InOrder trên một Cây tìm kiếm nhị phân (BST), dãy kết quả nhận được sẽ như thế nào?',
      options: [
        'Dãy số ngẫu nhiên',
        'Dãy số giảm dần',
        'Dãy số được sắp xếp tăng dần',
        'Chỉ gồm các số chẵn',
      ],
      correctIndex: 2,
      explanation: 'Đây là tính chất kinh điển của BST: Duyệt InOrder luôn tạo ra dãy tăng dần.',
    },
  },
  {
    id: 't08',
    num: '08',
    title: 'Tìm Kiếm Trong BST (Search in BST)',
    subtitle: 'Thuật toán tìm kiếm nhị phân trên đồ thị cây',
    summary: 'Tìm kiếm phần tử X bằng cách so sánh X với node hiện tại: nếu nhỏ hơn thì rẽ trái, nếu lớn hơn thì rẽ phải, nếu bằng thì dừng lại.',
    details: [
      '• if (target == root->val) return root;',
      '• if (target < root->val) return search(root->left, target);',
      '• if (target > root->val) return search(root->right, target);',
    ],
    keyRules: [
      'Độ phức tạp trung bình: O(log N).',
      'Mỗi phép so sánh loại bỏ được khoảng một nửa số node còn lại.',
    ],
    initialTree: createStandardSampleTree(),
    miniQuiz: {
      question: 'Nếu cần tìm giá trị 25 trong BST có root là 50, ta sẽ rẽ sang nhánh nào trước?',
      options: [
        'Rẽ sang nhánh Phải',
        'Rẽ sang nhánh Trái (vì 25 < 50)',
        'Dừng lại ngay',
        'Tìm kiếm ngẫu nhiên',
      ],
      correctIndex: 1,
      explanation: 'Vì 25 < 50, theo quy tắc BST ta bắt buộc phải rẽ sang cây con trái.',
    },
  },
  {
    id: 't09',
    num: '09',
    title: 'Xóa Node Trong BST (Delete in BST)',
    subtitle: '3 Trường hợp: Xóa lá, Xóa 1 con, Xóa 2 con',
    summary: 'Xóa node là thao tác phức tạp nhất trên BST và chia thành 3 trường hợp rõ rệt.',
    details: [
      '• Trường hợp 1: Node cần xóa là NODE LÁ (bậc 0) → Giải phóng và gán liên kết cha = NULL.',
      '• Trường hợp 2: Node cần xóa có ĐÚNG 1 CON → Nối trực tiếp con đó lên thay thế vị trí cha.',
      '• Trường hợp 3: Node cần xóa có CẢ 2 CON → Tìm node nhỏ nhất ở cây con phải (In-order Successor) hoặc lớn nhất ở cây con trái (In-order Predecessor) để thế chỗ, sau đó xóa node thế chỗ đó.',
    ],
    keyRules: [
      'Bảo toàn tính chất BST sau khi xóa.',
      'Thuật toán chạy trong thời gian O(h) với h là chiều cao cây.',
    ],
    initialTree: createStandardSampleTree(),
    interactiveAction: 'delete_demo',
    miniQuiz: {
      question: 'Khi xóa một node có cả 2 con trong BST, ta thay thế giá trị của nó bằng node nào?',
      options: [
        'Node bất kỳ',
        'Node nhỏ nhất ở cây con phải (hoặc lớn nhất cây con trái)',
        'Node gốc của cây',
        'Xóa luôn cả hai cây con bên dưới',
      ],
      correctIndex: 1,
      explanation: 'Ta lấy phần tử nhỏ nhất của cây con phải (In-order successor) hoặc lớn nhất của cây con trái để thay thế mà vẫn giữ nguyên thứ tự sắp xếp của BST.',
    },
  },
];

export const LearnModeView: React.FC<LearnModeViewProps> = ({
  onOpenAiTutorWithContext,
  onBackToMap,
}) => {
  const [activeTopicId, setActiveTopicId] = useState<string>('t01');
  const activeTopic = useMemo(() => {
    return LEARN_TOPICS.find((t) => t.id === activeTopicId) || LEARN_TOPICS[0];
  }, [activeTopicId]);

  // Quiz state for current topic
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Interactive visual sandbox states
  const [sandboxTree, setSandboxTree] = useState<TreeNode>(activeTopic.initialTree);
  const [customNodeStates, setCustomNodeStates] = useState<Record<string, NodeState>>({});

  // Reset sandbox when switching topics
  const handleSelectTopic = (topicId: string) => {
    sound.playClick();
    setActiveTopicId(topicId);
    const nextTopic = LEARN_TOPICS.find((t) => t.id === topicId) || LEARN_TOPICS[0];
    setSandboxTree(nextTopic.initialTree);
    setCustomNodeStates({});
    setSelectedOption(null);
    setQuizSubmitted(false);
  };

  // Interactive sandbox actions
  const triggerSandboxAction = (action: string) => {
    sound.playClick();
    if (action === 'highlight_leaves') {
      const leaves = getLeafNodes(sandboxTree);
      const states: Record<string, NodeState> = {};
      leaves.forEach((l) => (states[l.id] = 'correct'));
      setCustomNodeStates(states);
    } else if (action === 'highlight_root') {
      setCustomNodeStates({ [sandboxTree.id]: 'current' });
    } else if (action === 'bst_rule') {
      const states: Record<string, NodeState> = {};
      if (sandboxTree.left) states[sandboxTree.left.id] = 'checking';
      if (sandboxTree.right) states[sandboxTree.right.id] = 'target';
      setCustomNodeStates(states);
    } else if (action === 'delete_demo') {
      // Demo deleting node 30 or 70
      const next = deleteNodeFromBST(sandboxTree, 30);
      if (next) setSandboxTree(next);
      sound.playNodeSelect(480);
    }
  };

  const handleAnswerMiniQuiz = (idx: number) => {
    if (quizSubmitted) return;
    sound.playClick();
    setSelectedOption(idx);
    setQuizSubmitted(true);

    if (idx === activeTopic.miniQuiz.correctIndex) {
      sound.playCorrect();
    } else {
      sound.playError();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>LEARN MODE • GIÁO TRÌNH CHUẨN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            BÀI 7: CÂY NHỊ PHÂN & DUYỆT CÂY
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Học qua tương tác trực quan: Visual Engine, Quy tắc chuẩn xác & Mini Challenge tương ứng
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onOpenAiTutorWithContext({
                topic: activeTopic.title,
                summary: activeTopic.summary,
              })
            }
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Hỏi Mentor Về Bài Này</span>
          </button>

          <button
            onClick={onBackToMap}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            Bản đồ
          </button>
        </div>
      </div>

      {/* Main Container: Topic Sidebar + Detail Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topic List Navigation (Left) */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 block mb-2">
            Danh mục 9 chuyên đề bài học:
          </span>
          <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
            {LEARN_TOPICS.map((topic) => {
              const isActive = topic.id === activeTopicId;
              return (
                <div
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-mono text-xs font-black px-2 py-0.5 rounded-lg ${
                        isActive
                          ? 'bg-emerald-700/60 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {topic.num}
                    </span>
                    <span className="text-xs font-bold truncate max-w-[200px]">
                      {topic.title}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Topic Content Arena (Right) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Main Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                <span className="font-mono">CHUYÊN ĐỀ {activeTopic.num}</span>
                <span>•</span>
                <span>{activeTopic.subtitle}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {activeTopic.title}
              </h2>
            </div>

            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              {activeTopic.summary}
            </p>

            {/* Key details */}
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeTopic.details.map((d, i) => (
                <p key={i} className="pl-1">
                  {d}
                </p>
              ))}
            </div>

            {/* Key rules banner */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] block text-emerald-700 dark:text-emerald-400">
                ⭐ NGUYÊN TẮC CỐT LÕI CẦN GHI NHỚ:
              </span>
              {activeTopic.keyRules.map((rule, idx) => (
                <p key={idx}>• {rule}</p>
              ))}
            </div>
          </div>

          {/* Interactive Visual Engine Sandbox */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Mô Phỏng Trực Quan (Interactive Sandbox)
                </h3>
              </div>

              {/* Action buttons */}
              {activeTopic.interactiveAction && (
                <button
                  onClick={() => triggerSandboxAction(activeTopic.interactiveAction!)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>
                    {activeTopic.interactiveAction === 'highlight_leaves' && 'Xem các Node Lá'}
                    {activeTopic.interactiveAction === 'highlight_root' && 'Xem Node Gốc (Root)'}
                    {activeTopic.interactiveAction === 'bst_rule' && 'Xem Cây Trái & Phải'}
                    {activeTopic.interactiveAction === 'delete_demo' && 'Mô phỏng Xóa Node 30'}
                    {activeTopic.interactiveAction === 'traverse' && 'Highlight các Node'}
                  </span>
                </button>
              )}
            </div>

            <TreeViewer
              root={sandboxTree}
              customNodeStates={customNodeStates}
              height={280}
            />
          </div>

          {/* Mini Challenge Quiz */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>MINI CHALLENGE KIỂM TRA NHANH:</span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
              {activeTopic.miniQuiz.question}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {activeTopic.miniQuiz.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === activeTopic.miniQuiz.correctIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerMiniQuiz(idx)}
                    disabled={quizSubmitted}
                    className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all active:scale-98 ${
                      quizSubmitted
                        ? isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                          : isSelected
                          ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200'
                          : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    <span className="text-slate-400 font-mono mr-2">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Quiz Feedback */}
            {quizSubmitted && (
              <div
                className={`p-3 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                  selectedOption === activeTopic.miniQuiz.correctIndex
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                }`}
              >
                {selectedOption === activeTopic.miniQuiz.correctIndex ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">
                    {selectedOption === activeTopic.miniQuiz.correctIndex ? 'Chính xác!' : 'Chưa đúng!'}
                  </p>
                  <p className="mt-0.5 opacity-90">{activeTopic.miniQuiz.explanation}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
