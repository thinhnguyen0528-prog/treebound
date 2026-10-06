import React, { useState, useRef, useMemo, useEffect } from 'react';
import { TreeNode, NodeState } from '../types/game';
import { layoutTree } from '../utils/treeEngine';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

interface TreeViewerProps {
  root: TreeNode | null;
  onNodeClick?: (node: TreeNode) => void;
  selectedNodeId?: string | null;
  activePathIds?: string[];
  customNodeStates?: Record<string, NodeState>;
  customNodeBadges?: Record<string, string | number>;
  height?: number | string;
  interactive?: boolean;
  showCoordinatesHelp?: boolean;
}

export const TreeViewer: React.FC<TreeViewerProps> = ({
  root,
  onNodeClick,
  selectedNodeId,
  activePathIds = [],
  customNodeStates = {},
  customNodeBadges = {},
  height = 420,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Calculate layout coordinates
  const { layoutedRoot, maxX, maxY } = useMemo(() => {
    return layoutTree(root, 640, 55, 75);
  }, [root]);

  // Reset viewport when root drastically changes
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => Math.max(0.5, Math.min(2.2, Number((prev + delta).toFixed(2)))));
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(0.5, Math.min(2.2, Number((prev + delta).toFixed(2)))));
  };

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    // Don't drag if clicking directly on a node button
    if ((e.target as HTMLElement).tagName === 'circle' || (e.target as HTMLElement).tagName === 'text') {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !interactive) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!interactive || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !interactive || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  // Flatten nodes and edges for SVG rendering
  const { nodesList, edgesList } = useMemo(() => {
    const nodes: TreeNode[] = [];
    const edges: { from: TreeNode; to: TreeNode; isLeft: boolean; inPath: boolean }[] = [];

    function traverse(node: TreeNode | null | undefined) {
      if (!node) return;
      nodes.push(node);

      if (node.left) {
        const inPath = activePathIds.includes(node.id) && activePathIds.includes(node.left.id);
        edges.push({ from: node, to: node.left, isLeft: true, inPath });
        traverse(node.left);
      }
      if (node.right) {
        const inPath = activePathIds.includes(node.id) && activePathIds.includes(node.right.id);
        edges.push({ from: node, to: node.right, isLeft: false, inPath });
        traverse(node.right);
      }
    }

    traverse(layoutedRoot);
    return { nodesList: nodes, edgesList: edges };
  }, [layoutedRoot, activePathIds]);

  // Color styles based on node state
  const getNodeStyle = (node: TreeNode) => {
    const state: NodeState =
      customNodeStates[node.id] ||
      (node.id === selectedNodeId ? 'selected' : (node.state || 'normal'));

    switch (state) {
      case 'current':
        return {
          fill: '#0284c7', // Sky-600
          stroke: '#38bdf8', // Sky-400
          textFill: '#ffffff',
          filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.9))',
          ringColor: '#38bdf8',
        };
      case 'checking':
        return {
          fill: '#d97706', // Amber-600
          stroke: '#fbbf24', // Amber-400
          textFill: '#ffffff',
          filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.9))',
          ringColor: '#fbbf24',
        };
      case 'correct':
        return {
          fill: '#059669', // Emerald-600
          stroke: '#34d399', // Emerald-400
          textFill: '#ffffff',
          filter: 'drop-shadow(0 0 10px rgba(52, 211, 153, 0.85))',
          ringColor: '#34d399',
        };
      case 'wrong':
        return {
          fill: '#e11d48', // Rose-600
          stroke: '#fb7185', // Rose-400
          textFill: '#ffffff',
          filter: 'drop-shadow(0 0 10px rgba(244, 63, 94, 0.85))',
          ringColor: '#fb7185',
        };
      case 'visited':
        return {
          fill: '#0d9488', // Teal-600
          stroke: '#2dd4bf', // Teal-400
          textFill: '#ffffff',
          filter: 'drop-shadow(0 0 6px rgba(45, 212, 191, 0.5))',
          ringColor: '#2dd4bf',
        };
      case 'target':
        return {
          fill: '#7c3aed', // Violet-600
          stroke: '#a78bfa', // Violet-400
          textFill: '#ffffff',
          filter: 'drop-shadow(0 0 10px rgba(167, 139, 250, 0.85))',
          ringColor: '#a78bfa',
        };
      case 'selected':
        return {
          fill: '#2563eb', // Blue-600
          stroke: '#60a5fa', // Blue-400
          textFill: '#ffffff',
          filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.8))',
          ringColor: '#60a5fa',
        };
      case 'normal':
      default:
        return {
          fill: 'var(--node-fill, #1e293b)',
          stroke: 'var(--node-stroke, #64748b)',
          textFill: 'var(--node-text, #f8fafc)',
          filter: 'none',
          ringColor: 'transparent',
        };
    }
  };

  if (!root) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-8 text-center"
        style={{ height }}
      >
        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <RotateCcw className="w-5 h-5 animate-spin-slow" />
        </div>
        <p className="font-semibold text-slate-600 dark:text-slate-300">Cây hiện đang trống</p>
        <p className="text-xs text-slate-400 mt-1">Chèn phần tử hoặc chọn mẫu cây để bắt đầu tương tác</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/90 shadow-sm backdrop-blur-sm overflow-hidden select-none"
      style={{ height }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* Zoom / Pan Floating Toolbar */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-medium text-slate-600 dark:text-slate-300">
        <button
          onClick={() => handleZoom(0.15)}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg active:scale-95 transition-all"
          title="Phóng to (+)"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-0.15)}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg active:scale-95 transition-all"
          title="Thu nhỏ (-)"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg active:scale-95 transition-all"
          title="Căn vừa màn hình (Fit Tree)"
          aria-label="Fit tree"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg active:scale-95 transition-all text-slate-500"
          title="Đặt lại góc nhìn (Reset View)"
          aria-label="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1 border-l border-slate-200 dark:border-slate-700">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* SVG Canvas */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing"
        viewBox={`0 0 ${maxX} ${maxY}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          style={{ transformOrigin: 'center center', transition: isDragging ? 'none' : 'transform 0.15s ease-out' }}
        >
          {/* Edges */}
          {edgesList.map(({ from, to, isLeft, inPath }, idx) => {
            const x1 = from.x ?? 0;
            const y1 = from.y ?? 0;
            const x2 = to.x ?? 0;
            const y2 = to.y ?? 0;

            // Curved cubic bezier edge for smooth, organic tree look
            const midY = (y1 + y2) / 2;
            const pathData = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

            return (
              <g key={`edge_${from.id}_${to.id}_${idx}`}>
                {/* Background glow for active traversal path */}
                {inPath && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="7"
                    strokeLinecap="round"
                    opacity="0.4"
                    className="animate-pulse"
                  />
                )}
                {/* Main line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={inPath ? '#0284c7' : '#94a3b8'}
                  strokeWidth={inPath ? '3.5' : '2'}
                  strokeLinecap="round"
                  className="transition-colors duration-200 dark:stroke-slate-600"
                />
                {/* Subtree direction indicators (L/R) for educational clarity */}
                <text
                  x={(x1 + x2) / 2 + (isLeft ? -10 : 10)}
                  y={(y1 + y2) / 2 - 2}
                  fontSize="9"
                  fontWeight="700"
                  fill="#94a3b8"
                  textAnchor="middle"
                  className="select-none pointer-events-none dark:fill-slate-500"
                >
                  {isLeft ? 'L' : 'R'}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodesList.map((node) => {
            const x = node.x ?? 0;
            const y = node.y ?? 0;
            const style = getNodeStyle(node);
            const badge = customNodeBadges[node.id] ?? node.badge;
            const isTargetOrCurrent =
              customNodeStates[node.id] === 'current' ||
              customNodeStates[node.id] === 'checking' ||
              customNodeStates[node.id] === 'target';
            const isWrong = customNodeStates[node.id] === 'wrong';
            const isCorrect = customNodeStates[node.id] === 'correct';

            return (
              <g
                key={node.id}
                transform={`translate(${x}, ${y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeClick?.(node);
                }}
                className={`transition-all duration-200 ${
                  isWrong ? 'animate-shake' : ''
                } ${isCorrect ? 'scale-105' : ''} ${
                  onNodeClick ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'
                }`}
              >
                {/* Pulsing ring for active current node */}
                {isTargetOrCurrent && (
                  <circle
                    r="28"
                    fill="none"
                    stroke={style.ringColor}
                    strokeWidth="2.5"
                    className="node-pulse-ring"
                    opacity="0.75"
                  />
                )}

                {/* Node Outer Drop shadow / Glow */}
                <circle
                  r="22"
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth="2.5"
                  style={{ filter: style.filter }}
                  className="transition-all duration-300"
                />

                {/* Node Value Label */}
                <text
                  textAnchor="middle"
                  dy=".35em"
                  fontSize="13"
                  fontWeight="700"
                  fill={style.textFill}
                  className="select-none pointer-events-none font-mono"
                >
                  {node.val}
                </text>

                {/* Badge indicator (Order sequence or degree) */}
                {badge !== undefined && (
                  <g transform="translate(14, -14)">
                    <circle
                      r="9"
                      fill="#f59e0b"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="shadow-sm"
                    />
                    <text
                      textAnchor="middle"
                      dy=".35em"
                      fontSize="9"
                      fontWeight="800"
                      fill="#ffffff"
                      className="font-mono select-none pointer-events-none"
                    >
                      {badge}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
