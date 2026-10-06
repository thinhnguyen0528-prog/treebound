import React, { useState } from 'react';
import { TraversalType } from '../types/game';
import { Code, Copy, Check } from 'lucide-react';

interface CodeViewerProps {
  traversalType: TraversalType;
  activeLine?: number; // 1-indexed line number in the current snippet
  title?: string;
}

const PSEUDO_CODE: Record<TraversalType, { lines: string[]; explanation: string }> = {
  preorder: {
    lines: [
      '// PreOrder: Node -> Left -> Right (NLR)',
      'function PreOrder(root):',
      '    if root != NULL:',
      '        visit(root)            // 1. Thăm Node gốc',
      '        PreOrder(root->left)   // 2. Đi sang Cây con Trái',
      '        PreOrder(root->right)  // 3. Đi sang Cây con Phải',
    ],
    explanation: 'Duyệt nút gốc trước, sau đó duyệt đệ quy cây con trái rồi cây con phải.',
  },
  inorder: {
    lines: [
      '// InOrder: Left -> Node -> Right (LNR)',
      'function InOrder(root):',
      '    if root != NULL:',
      '        InOrder(root->left)    // 1. Duyệt Cây con Trái trước',
      '        visit(root)            // 2. Thăm Node hiện tại',
      '        InOrder(root->right)   // 3. Đi sang Cây con Phải',
    ],
    explanation: 'Duyệt cây con trái trước, rồi đến nút gốc, sau cùng là cây con phải. (Với BST, InOrder cho thứ tự tăng dần!)',
  },
  postorder: {
    lines: [
      '// PostOrder: Left -> Right -> Node (LRN)',
      'function PostOrder(root):',
      '    if root != NULL:',
      '        PostOrder(root->left)  // 1. Duyệt xong Cây con Trái',
      '        PostOrder(root->right) // 2. Duyệt xong Cây con Phải',
      '        visit(root)            // 3. Mới thăm Node gốc',
    ],
    explanation: 'Duyệt xong toàn bộ hai cây con trái và phải rồi mới thăm nút gốc (thường dùng khi giải phóng bộ nhớ / xóa cây).',
  },
};

const CPP_CODE: Record<TraversalType, string> = {
  preorder: `void preOrder(Node* root) {
    if (root == nullptr) return;
    cout << root->val << " "; // Visit Node
    preOrder(root->left);     // Left Subtree
    preOrder(root->right);    // Right Subtree
}`,
  inorder: `void inOrder(Node* root) {
    if (root == nullptr) return;
    inOrder(root->left);      // Left Subtree
    cout << root->val << " "; // Visit Node
    inOrder(root->right);     // Right Subtree
}`,
  postorder: `void postOrder(Node* root) {
    if (root == nullptr) return;
    postOrder(root->left);     // Left Subtree
    postOrder(root->right);    // Right Subtree
    cout << root->val << " "; // Visit Node
}`,
};

export const CodeViewer: React.FC<CodeViewerProps> = ({
  traversalType,
  activeLine,
  title = 'SEE THE CODE: Pseudocode & Implementation',
}) => {
  const [tab, setTab] = useState<'pseudo' | 'cpp'>('pseudo');
  const [copied, setCopied] = useState(false);

  const snippet = PSEUDO_CODE[traversalType];

  const handleCopy = () => {
    const textToCopy = tab === 'pseudo' ? snippet.lines.join('\n') : CPP_CODE[traversalType];
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 shadow-md overflow-hidden font-mono text-xs">
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/70 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
          <Code className="w-4 h-4 text-emerald-400" />
          <span>{title}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-slate-900 p-0.5 border border-slate-800">
            <button
              onClick={() => setTab('pseudo')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                tab === 'pseudo'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pseudocode
            </button>
            <button
              onClick={() => setTab('cpp')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                tab === 'cpp'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              C++ Code
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Code Display */}
      <div className="p-3.5 overflow-x-auto leading-relaxed">
        {tab === 'pseudo' ? (
          <div className="space-y-0.5">
            {snippet.lines.map((line, idx) => {
              const lineNum = idx + 1;
              const isActive = activeLine === lineNum;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-2 py-0.5 rounded transition-colors ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-l-2 border-emerald-400 font-bold'
                      : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <span className="w-5 text-right text-slate-600 select-none text-[10px]">
                    {lineNum}
                  </span>
                  <span className="font-mono">{line}</span>
                </div>
              );
            })}
            <p className="mt-2 text-[11px] text-slate-400 italic border-t border-slate-800/80 pt-2 font-sans">
              💡 {snippet.explanation}
            </p>
          </div>
        ) : (
          <pre className="text-slate-200 text-xs py-1">
            <code>{CPP_CODE[traversalType]}</code>
          </pre>
        )}
      </div>
    </div>
  );
};
