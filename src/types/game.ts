export type NodeState = 
  | 'normal' 
  | 'selected' 
  | 'checking' 
  | 'correct' 
  | 'wrong' 
  | 'visited' 
  | 'target' 
  | 'current';

export interface TreeNode {
  id: string;
  val: number | string;
  left?: TreeNode | null;
  right?: TreeNode | null;
  // Visual layout coordinates
  x?: number;
  y?: number;
  state?: NodeState;
  badge?: string | number; // Traversal order or degree label
}

export type TraversalType = 'preorder' | 'inorder' | 'postorder';

export interface TraversalStep {
  nodeId: string;
  val: number | string;
  action: 'visit' | 'go_left' | 'go_right' | 'backtrack';
  codeLine: number; // Line number in pseudocode
  explanation: string;
  visitedOrder: (number | string)[];
}

export interface PlayerStats {
  xp: number;
  level: number;
  streak: number;
  lastPlayedDate: string;
  bestScore: number;
  completedLevels: Record<number, { stars: number; highscore: number }>;
  dailyCompletedDates: string[];
}

export interface GameSettings {
  darkMode: boolean;
  soundEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  difficulty: 'easy' | 'medium' | 'hard';
  language: 'vi' | 'en';
}

export interface LevelInfo {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  xpReward: number;
  targetStars: number;
  isUnlocked: boolean;
  stars: number;
  badgeIcon: string;
}

export interface LearnTopic {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  summary: string;
  details: string[];
  keyRules: string[];
  initialTree: TreeNode;
  interactiveAction?: 'highlight_leaves' | 'highlight_root' | 'traverse' | 'insert_demo' | 'bst_rule' | 'delete_demo';
  miniQuiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}
