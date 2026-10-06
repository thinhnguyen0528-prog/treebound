import { TreeNode, TraversalType, TraversalStep } from '../types/game';

// Helper to generate unique IDs
let idCounter = 1;
export function createId(prefix: string = 'node'): string {
  return `${prefix}_${Date.now()}_${idCounter++}`;
}

// Deep clone a tree
export function cloneTree(node: TreeNode | null | undefined): TreeNode | null {
  if (!node) return null;
  return {
    ...node,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
}

// Build standard sample tree:
//        50
//       /  \
//     30    70
//    /  \  /  \
//   20  40 60  80
export function createStandardSampleTree(): TreeNode {
  return {
    id: 'n_50',
    val: 50,
    left: {
      id: 'n_30',
      val: 30,
      left: { id: 'n_20', val: 20 },
      right: { id: 'n_40', val: 40 },
    },
    right: {
      id: 'n_70',
      val: 70,
      left: { id: 'n_60', val: 60 },
      right: { id: 'n_80', val: 80 },
    },
  };
}

// Calculate subtree width & assign visual coordinates (SVG layout)
export function layoutTree(
  root: TreeNode | null | undefined,
  canvasWidth: number = 700,
  topMargin: number = 60,
  levelGap: number = 75
): { layoutedRoot: TreeNode | null; maxX: number; maxY: number } {
  if (!root) return { layoutedRoot: null, maxX: canvasWidth, maxY: 300 };

  const cloned = cloneTree(root)!;
  let maxFoundY = topMargin;
  let minFoundX = Infinity;
  let maxFoundX = -Infinity;

  // Compute depth and assign initial horizontal coordinates based on in-order traversal index
  let inOrderIndex = 0;
  const inOrderPositions: { id: string; index: number; depth: number }[] = [];

  function recordPositions(node: TreeNode | null | undefined, depth: number) {
    if (!node) return;
    recordPositions(node.left, depth + 1);
    inOrderPositions.push({ id: node.id, index: inOrderIndex++, depth });
    recordPositions(node.right, depth + 1);
  }

  recordPositions(cloned, 0);

  const totalNodes = inOrderPositions.length;
  // Node horizontal spacing
  const stepX = Math.max(70, Math.min(100, (canvasWidth - 120) / (totalNodes > 1 ? totalNodes - 1 : 1)));
  const startX = Math.max(60, (canvasWidth - (totalNodes - 1) * stepX) / 2);

  const posMap = new Map<string, { x: number; y: number }>();
  inOrderPositions.forEach((item) => {
    const x = startX + item.index * stepX;
    const y = topMargin + item.depth * levelGap;
    posMap.set(item.id, { x, y });
    if (y > maxFoundY) maxFoundY = y;
    if (x < minFoundX) minFoundX = x;
    if (x > maxFoundX) maxFoundX = x;
  });

  function applyCoords(node: TreeNode | null | undefined) {
    if (!node) return;
    const pos = posMap.get(node.id);
    if (pos) {
      node.x = pos.x;
      node.y = pos.y;
    }
    applyCoords(node.left);
    applyCoords(node.right);
  }

  applyCoords(cloned);

  return {
    layoutedRoot: cloned,
    maxX: Math.max(canvasWidth, maxFoundX + 80),
    maxY: maxFoundY + 90,
  };
}

// Find a node by ID
export function findNodeById(root: TreeNode | null | undefined, id: string): TreeNode | null {
  if (!root) return null;
  if (root.id === id) return root;
  const leftFound = findNodeById(root.left, id);
  if (leftFound) return leftFound;
  return findNodeById(root.right, id);
}

// Find parent of a node
export function findParent(
  root: TreeNode | null | undefined,
  childId: string
): { parent: TreeNode | null; side: 'left' | 'right' | null } {
  if (!root) return { parent: null, side: null };
  if (root.left?.id === childId) return { parent: root, side: 'left' };
  if (root.right?.id === childId) return { parent: root, side: 'right' };

  const leftSearch = findParent(root.left, childId);
  if (leftSearch.parent) return leftSearch;

  return findParent(root.right, childId);
}

// Degree of a node (0, 1, or 2)
export function getNodeDegree(node: TreeNode | null | undefined): number {
  if (!node) return 0;
  let degree = 0;
  if (node.left) degree++;
  if (node.right) degree++;
  return degree;
}

// Is Leaf
export function isLeafNode(node: TreeNode | null | undefined): boolean {
  if (!node) return false;
  return !node.left && !node.right;
}

// Get all leaf nodes
export function getLeafNodes(root: TreeNode | null | undefined): TreeNode[] {
  if (!root) return [];
  const leaves: TreeNode[] = [];
  function traverse(n: TreeNode | null | undefined) {
    if (!n) return;
    if (isLeafNode(n)) {
      leaves.push(n);
    }
    traverse(n.left);
    traverse(n.right);
  }
  traverse(root);
  return leaves;
}

// Height of tree (number of levels: empty=0, single root=1)
export function getTreeHeight(root: TreeNode | null | undefined): number {
  if (!root) return 0;
  return 1 + Math.max(getTreeHeight(root.left), getTreeHeight(root.right));
}

// Level of a node (1-indexed: root is level 1)
export function getNodeLevel(root: TreeNode | null | undefined, targetId: string, currentLevel: number = 1): number {
  if (!root) return 0;
  if (root.id === targetId) return currentLevel;
  const inLeft = getNodeLevel(root.left, targetId, currentLevel + 1);
  if (inLeft > 0) return inLeft;
  return getNodeLevel(root.right, targetId, currentLevel + 1);
}

// Degree of tree (max degree among all nodes)
export function getTreeDegree(root: TreeNode | null | undefined): number {
  if (!root) return 0;
  let maxDegree = 0;
  function traverse(n: TreeNode | null | undefined) {
    if (!n) return;
    const deg = getNodeDegree(n);
    if (deg > maxDegree) maxDegree = deg;
    traverse(n.left);
    traverse(n.right);
  }
  traverse(root);
  return maxDegree;
}

// Total nodes count
export function countNodes(root: TreeNode | null | undefined): number {
  if (!root) return 0;
  return 1 + countNodes(root.left) + countNodes(root.right);
}

// Check if tree is Full Binary Tree (Strictly binary: every node has 0 or 2 children)
export function isFullBinaryTree(root: TreeNode | null | undefined): boolean {
  if (!root) return true;
  if (!root.left && !root.right) return true;
  if (root.left && root.right) {
    return isFullBinaryTree(root.left) && isFullBinaryTree(root.right);
  }
  return false;
}

// Check if tree is Complete Binary Tree
export function isCompleteBinaryTree(root: TreeNode | null | undefined): boolean {
  if (!root) return true;
  const queue: (TreeNode | null)[] = [root];
  let seenNull = false;

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === null) {
      seenNull = true;
    } else {
      if (seenNull) return false;
      queue.push(current.left || null);
      queue.push(current.right || null);
    }
  }
  return true;
}

// Check if tree is Valid BST
export function isValidBST(root: TreeNode | null | undefined, minVal: number = -Infinity, maxVal: number = Infinity): boolean {
  if (!root) return true;
  const val = Number(root.val);
  if (val <= minVal || val >= maxVal) return false;
  return isValidBST(root.left, minVal, val) && isValidBST(root.right, val, maxVal);
}

// PreOrder Traversal (Node -> Left -> Right)
export function getPreOrderSequence(root: TreeNode | null | undefined): (number | string)[] {
  if (!root) return [];
  const res: (number | string)[] = [];
  function traverse(node: TreeNode | null | undefined) {
    if (!node) return;
    res.push(node.val);
    traverse(node.left);
    traverse(node.right);
  }
  traverse(root);
  return res;
}

// InOrder Traversal (Left -> Node -> Right)
export function getInOrderSequence(root: TreeNode | null | undefined): (number | string)[] {
  if (!root) return [];
  const res: (number | string)[] = [];
  function traverse(node: TreeNode | null | undefined) {
    if (!node) return;
    traverse(node.left);
    res.push(node.val);
    traverse(node.right);
  }
  traverse(root);
  return res;
}

// PostOrder Traversal (Left -> Right -> Node)
export function getPostOrderSequence(root: TreeNode | null | undefined): (number | string)[] {
  if (!root) return [];
  const res: (number | string)[] = [];
  function traverse(node: TreeNode | null | undefined) {
    if (!node) return;
    traverse(node.left);
    traverse(node.right);
    res.push(node.val);
  }
  traverse(root);
  return res;
}

// Generate animated step-by-step traversal steps with code line linkage
export function generateTraversalSteps(
  root: TreeNode | null | undefined,
  type: TraversalType
): TraversalStep[] {
  const steps: TraversalStep[] = [];
  const visitedAcc: (number | string)[] = [];

  function preOrderHelper(node: TreeNode | null | undefined) {
    if (!node) return;
    // Line 2: if (root != NULL)
    // Line 3: visit(root)
    visitedAcc.push(node.val);
    steps.push({
      nodeId: node.id,
      val: node.val,
      action: 'visit',
      codeLine: 3,
      explanation: `PreOrder: Thăm Node (${node.val}). [Thứ tự: Node → Left → Right]`,
      visitedOrder: [...visitedAcc],
    });

    if (node.left) {
      steps.push({
        nodeId: node.left.id,
        val: node.left.val,
        action: 'go_left',
        codeLine: 4,
        explanation: `Gọi đệ quy PreOrder(node->left) sang con trái (${node.left.val})`,
        visitedOrder: [...visitedAcc],
      });
      preOrderHelper(node.left);
    }

    if (node.right) {
      steps.push({
        nodeId: node.right.id,
        val: node.right.val,
        action: 'go_right',
        codeLine: 5,
        explanation: `Gọi đệ quy PreOrder(node->right) sang con phải (${node.right.val})`,
        visitedOrder: [...visitedAcc],
      });
      preOrderHelper(node.right);
    }
  }

  function inOrderHelper(node: TreeNode | null | undefined) {
    if (!node) return;
    if (node.left) {
      steps.push({
        nodeId: node.left.id,
        val: node.left.val,
        action: 'go_left',
        codeLine: 3,
        explanation: `Gọi đệ quy InOrder(node->left) sang con trái (${node.left.val}) trước`,
        visitedOrder: [...visitedAcc],
      });
      inOrderHelper(node.left);
    }

    // Line 4: visit(root)
    visitedAcc.push(node.val);
    steps.push({
      nodeId: node.id,
      val: node.val,
      action: 'visit',
      codeLine: 4,
      explanation: `InOrder: Thăm Node (${node.val}). [Thứ tự: Left → Node → Right]`,
      visitedOrder: [...visitedAcc],
    });

    if (node.right) {
      steps.push({
        nodeId: node.right.id,
        val: node.right.val,
        action: 'go_right',
        codeLine: 5,
        explanation: `Gọi đệ quy InOrder(node->right) sang con phải (${node.right.val})`,
        visitedOrder: [...visitedAcc],
      });
      inOrderHelper(node.right);
    }
  }

  function postOrderHelper(node: TreeNode | null | undefined) {
    if (!node) return;
    if (node.left) {
      steps.push({
        nodeId: node.left.id,
        val: node.left.val,
        action: 'go_left',
        codeLine: 3,
        explanation: `Gọi đệ quy PostOrder(node->left) duyệt hết nhánh trái (${node.left.val})`,
        visitedOrder: [...visitedAcc],
      });
      postOrderHelper(node.left);
    }

    if (node.right) {
      steps.push({
        nodeId: node.right.id,
        val: node.right.val,
        action: 'go_right',
        codeLine: 4,
        explanation: `Gọi đệ quy PostOrder(node->right) duyệt hết nhánh phải (${node.right.val})`,
        visitedOrder: [...visitedAcc],
      });
      postOrderHelper(node.right);
    }

    // Line 5: visit(root)
    visitedAcc.push(node.val);
    steps.push({
      nodeId: node.id,
      val: node.val,
      action: 'visit',
      codeLine: 5,
      explanation: `PostOrder: Thăm Node (${node.val}). [Thứ tự: Left → Right → Node]`,
      visitedOrder: [...visitedAcc],
    });
  }

  if (type === 'preorder') preOrderHelper(root);
  else if (type === 'inorder') inOrderHelper(root);
  else if (type === 'postorder') postOrderHelper(root);

  return steps;
}

// Insert into BST with step-by-step route tracking
export function insertBSTWithHistory(
  root: TreeNode | null,
  val: number
): { newRoot: TreeNode; pathIds: string[]; comparisonLog: string[] } {
  const pathIds: string[] = [];
  const comparisonLog: string[] = [];

  const newNode: TreeNode = {
    id: `bst_${val}_${Date.now()}`,
    val,
  };

  if (!root) {
    pathIds.push(newNode.id);
    comparisonLog.push(`Cây rỗng: Đặt ${val} làm Root.`);
    return { newRoot: newNode, pathIds, comparisonLog };
  }

  const cloned = cloneTree(root)!;
  let curr: TreeNode = cloned;

  while (true) {
    pathIds.push(curr.id);
    const currVal = Number(curr.val);

    if (val < currVal) {
      comparisonLog.push(`${val} < ${currVal} → Đi sang TRÁI (LEFT)`);
      if (!curr.left) {
        curr.left = newNode;
        pathIds.push(newNode.id);
        comparisonLog.push(`Tìm thấy vị trí lá: Chèn ${val} vào bên TRÁI của ${currVal}.`);
        break;
      }
      curr = curr.left;
    } else {
      comparisonLog.push(`${val} >= ${currVal} → Đi sang PHẢI (RIGHT)`);
      if (!curr.right) {
        curr.right = newNode;
        pathIds.push(newNode.id);
        comparisonLog.push(`Tìm thấy vị trí lá: Chèn ${val} vào bên PHẢI của ${currVal}.`);
        break;
      }
      curr = curr.right;
    }
  }

  return { newRoot: cloned, pathIds, comparisonLog };
}

// Build BST from array of numbers
export function buildBSTFromArray(nums: number[]): TreeNode | null {
  if (nums.length === 0) return null;
  let root: TreeNode | null = null;
  for (const n of nums) {
    const res = insertBSTWithHistory(root, n);
    root = res.newRoot;
  }
  return root;
}

// Delete node from BST
export function deleteNodeFromBST(root: TreeNode | null, val: number): TreeNode | null {
  if (!root) return null;
  const cloned = cloneTree(root)!;

  function remove(curr: TreeNode | null | undefined, key: number): TreeNode | null {
    if (!curr) return null;
    const cVal = Number(curr.val);

    if (key < cVal) {
      curr.left = remove(curr.left, key);
      return curr;
    } else if (key > cVal) {
      curr.right = remove(curr.right, key);
      return curr;
    } else {
      // Node found
      // Case 1: Leaf
      if (!curr.left && !curr.right) {
        return null;
      }
      // Case 2: Only 1 child
      if (!curr.left) return curr.right || null;
      if (!curr.right) return curr.left || null;

      // Case 3: 2 children - find minimum in right subtree (in-order successor)
      let succ = curr.right;
      while (succ.left) {
        succ = succ.left;
      }
      curr.val = succ.val;
      curr.right = remove(curr.right, Number(succ.val));
      return curr;
    }
  }

  return remove(cloned, val);
}

// Search path generator for Level 5 Search Hunter
export interface SearchStep {
  nodeId: string;
  nodeVal: number;
  targetVal: number;
  comparison: string;
  decision: 'LEFT' | 'RIGHT' | 'FOUND' | 'NOT_FOUND';
  explanation: string;
}

export function generateSearchSteps(root: TreeNode | null, targetVal: number): SearchStep[] {
  const steps: SearchStep[] = [];
  if (!root) return steps;

  let curr: TreeNode | null | undefined = root;

  while (curr) {
    const cVal = Number(curr.val);
    if (targetVal === cVal) {
      steps.push({
        nodeId: curr.id,
        nodeVal: cVal,
        targetVal,
        comparison: `${targetVal} == ${cVal}`,
        decision: 'FOUND',
        explanation: `Tuyệt vời! ${targetVal} khớp với node hiện tại ${cVal}. Đã tìm thấy node!`,
      });
      break;
    } else if (targetVal < cVal) {
      steps.push({
        nodeId: curr.id,
        nodeVal: cVal,
        targetVal,
        comparison: `${targetVal} < ${cVal}`,
        decision: 'LEFT',
        explanation: `Vì ${targetVal} < ${cVal}, theo quy tắc BST ta phải rẽ sang TRÁI (LEFT).`,
      });
      curr = curr.left;
    } else {
      steps.push({
        nodeId: curr.id,
        nodeVal: cVal,
        targetVal,
        comparison: `${targetVal} > ${cVal}`,
        decision: 'RIGHT',
        explanation: `Vì ${targetVal} > ${cVal}, theo quy tắc BST ta phải rẽ sang PHẢI (RIGHT).`,
      });
      curr = curr.right;
    }
  }

  return steps;
}

// Daily challenge generator based on date string
export function getDailyChallenge(dateStr?: string) {
  const today = dateStr || new Date().toISOString().split('T')[0];
  // Simple deterministic hash
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash * 31 + today.charCodeAt(i)) % 100000;
  }

  const types = ['preorder', 'inorder', 'postorder', 'search', 'bst_check'] as const;
  const challengeType = types[hash % types.length];

  // Pools of sample number sets
  const numberSets = [
    [50, 25, 75, 12, 37, 62, 88],
    [40, 20, 60, 10, 30, 50, 70],
    [55, 33, 88, 22, 44, 77, 99],
    [60, 35, 80, 20, 45, 70, 95],
  ];

  const nums = numberSets[hash % numberSets.length];
  const tree = buildBSTFromArray(nums);

  return {
    date: today,
    challengeType,
    nums,
    tree,
    targetSearch: nums[Math.floor((hash / 7) % nums.length)],
  };
}

// Generate validated difficulty trees
export function generateDifficultyTree(difficulty: 'easy' | 'medium' | 'hard'): { nums: number[]; tree: TreeNode } {
  let pool: number[];
  if (difficulty === 'easy') {
    pool = [40, 20, 60, 10, 30];
  } else if (difficulty === 'hard') {
    pool = [50, 25, 75, 12, 37, 62, 88, 6, 30, 95];
  } else {
    // medium default
    pool = [50, 30, 70, 20, 40, 60, 80];
  }

  const tree = buildBSTFromArray(pool)!;
  return { nums: pool, tree };
}

