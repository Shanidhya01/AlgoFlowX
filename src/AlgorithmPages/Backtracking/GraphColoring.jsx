import React, { useState, useEffect, useRef } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// ─── Graph definition ─────────────────────────────────────────────────────────
// 6 nodes, edges: 0-1,0-2,1-2,1-3,2-4,3-4,3-5,4-5
const EDGES = [[0,1],[0,2],[1,2],[1,3],[2,4],[3,4],[3,5],[4,5]];
const N = 6;
const COLORS = [null, '#ef4444', '#3b82f6', '#22c55e']; // index 0 = uncolored
const COLOR_NAMES = ['uncolored', 'red', 'blue', 'green'];

// Circle layout positions (cx, cy) for 6 nodes in SVG 260×220
const NODE_POS = [
  [130, 30],  // 0 top
  [50,  90],  // 1 upper-left
  [210, 90],  // 2 upper-right
  [50,  175], // 3 lower-left
  [210, 175], // 4 lower-right
  [130, 200], // 5 bottom
];

function isAdjacent(u, v) {
  return EDGES.some(([a, b]) => (a === u && b === v) || (a === v && b === u));
}

function isSafe(coloring, node, color) {
  for (let nb = 0; nb < N; nb++) {
    if (coloring[nb] === color && isAdjacent(node, nb)) return false;
  }
  return true;
}

// ─── Step Generator ───────────────────────────────────────────────────────────

function generateSteps() {
  const steps = [];
  const coloring = new Array(N).fill(0);
  let backtracks = 0;
  let conflict = -1;

  const snapshot = (node, color, msg, conf = -1, done = false) => {
    steps.push({
      coloring: [...coloring],
      node,
      color,
      conflict: conf,
      backtracks,
      message: msg,
      done,
    });
  };

  snapshot(-1, 0, 'Graph Coloring with 3 colors. 6 nodes, 8 edges.');

  function backtrack(node) {
    if (node === N) {
      snapshot(-1, 0, `Solution found! ${backtracks} backtrack(s).`, -1, true);
      return true;
    }
    for (let color = 1; color <= 3; color++) {
      if (isSafe(coloring, node, color)) {
        coloring[node] = color;
        snapshot(node, color, `Node ${node}: try ${COLOR_NAMES[color]}. Safe — assign.`);
        if (backtrack(node + 1)) return true;
        snapshot(node, color, `Node ${node}: backtrack — ${COLOR_NAMES[color]} leads to conflict`, node);
        backtracks++;
        coloring[node] = 0;
        snapshot(node, 0, `Node ${node}: uncolor. Backtracks: ${backtracks}`);
      } else {
        const conf = EDGES.find(([a, b]) => {
          const u = a === node ? b : (b === node ? a : -1);
          return u !== -1 && coloring[u] === color;
        });
        const confNode = conf ? (conf[0] === node ? conf[1] : conf[0]) : -1;
        snapshot(node, color, `Node ${node}: ${COLOR_NAMES[color]} conflicts with node ${confNode}`, confNode);
      }
    }
    return false;
  }

  backtrack(0);
  return steps;
}

// ─── SVG Graph ────────────────────────────────────────────────────────────────

function GraphSVG({ coloring, activeNode, conflictNode }) {
  const R = 20;
  return (
    <svg viewBox="0 0 260 230" className="w-full" style={{ maxHeight: 230 }}>
      {/* Edges */}
      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={NODE_POS[a][0]} y1={NODE_POS[a][1]}
          x2={NODE_POS[b][0]} y2={NODE_POS[b][1]}
          stroke="#6b7280" strokeWidth="2" opacity="0.5"
        />
      ))}
      {/* Nodes */}
      {Array.from({ length: N }, (_, i) => {
        const [cx, cy] = NODE_POS[i];
        const col = coloring[i];
        const isActive = activeNode === i;
        const isConflict = conflictNode === i;
        const fill = col > 0 ? COLORS[col] : '#4b5563';
        return (
          <g key={i} className="transition-all duration-300">
            {isConflict && (
              <circle cx={cx} cy={cy} r={R + 6} fill="none" stroke="#ef4444" strokeWidth="3" opacity="0.8"
                className="animate-pulse" />
            )}
            {isActive && !isConflict && (
              <circle cx={cx} cy={cy} r={R + 5} fill="none" stroke="#fbbf24" strokeWidth="2.5" opacity="0.9" />
            )}
            <circle cx={cx} cy={cy} r={R} fill={fill} opacity="0.85" className="transition-all duration-300" />
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">{i}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Theory & Code ────────────────────────────────────────────────────────────

const theory = (
  <div>
    <TheorySection title="Graph Coloring Problem">
      <p>Graph coloring assigns a color to each vertex such that no two adjacent vertices share the same color, using at most k colors. This is NP-complete for general graphs.</p>
      <p><strong>Backtracking approach:</strong> Assign colors one node at a time. If a color assignment is safe (no adjacent node has the same color), recurse to the next node. If no color works, backtrack.</p>
    </TheorySection>
    <TheorySection title="Chromatic Number">
      <ul className="list-disc pl-4 space-y-1">
        <li>The minimum number of colors needed is the chromatic number χ(G)</li>
        <li>Bipartite graphs: χ = 2; Triangle: χ = 3; Planar graphs: χ ≤ 4 (Four Color Theorem)</li>
        <li>This graph has χ = 3 (contains triangles 0-1-2 and 3-4-5)</li>
        <li>A graph is k-colorable if and only if it contains no (k+1)-clique</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Time', 'O(k^V)', 'O(V + E)'],
      ['Space (stack)', '—', 'O(V)'],
      ['Chromatic number', 'NP-hard', '—'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `#include <vector>
using namespace std;

const int N = 6, K = 3;
int color[N];
vector<pair<int,int>> edges = {{0,1},{0,2},{1,2},{1,3},{2,4},{3,4},{3,5},{4,5}};

bool isSafe(int node, int c) {
    for (auto [a,b] : edges) {
        int nb = (a==node)?b:(b==node?a:-1);
        if (nb != -1 && color[nb] == c) return false;
    }
    return true;
}

bool solve(int node) {
    if (node == N) return true;
    for (int c = 1; c <= K; c++) {
        if (isSafe(node, c)) {
            color[node] = c;
            if (solve(node + 1)) return true;
            color[node] = 0;
        }
    }
    return false;
}`,
    'Python': `def graph_coloring(adj, k, n):
    color = [0] * n

    def is_safe(node, c):
        return all(color[nb] != c for nb in adj[node])

    def solve(node):
        if node == n:
            return True
        for c in range(1, k + 1):
            if is_safe(node, c):
                color[node] = c
                if solve(node + 1):
                    return True
                color[node] = 0
        return False

    return solve(0), color

# Example usage:
adj = [[1,2],[0,2,3],[0,4],[1,4,5],[2,3,5],[3,4]]
found, coloring = graph_coloring(adj, 3, 6)`,
    'JavaScript': `function graphColoring(adj, k, n) {
  const color = new Array(n).fill(0);

  const isSafe = (node, c) =>
    !adj[node].some(nb => color[nb] === c);

  function solve(node) {
    if (node === n) return true;
    for (let c = 1; c <= k; c++) {
      if (isSafe(node, c)) {
        color[node] = c;
        if (solve(node + 1)) return true;
        color[node] = 0;
      }
    }
    return false;
  }

  return { found: solve(0), color };
}

const adj = [[1,2],[0,2,3],[0,4],[1,4,5],[2,3,5],[3,4]];
const { found, color } = graphColoring(adj, 3, 6);`,
    'Java': `public class GraphColoring {
    static int N = 6, K = 3;
    static int[] color = new int[N];
    static int[][] adj = {{1,2},{0,2,3},{0,4},{1,4,5},{2,3,5},{3,4}};

    static boolean isSafe(int node, int c) {
        for (int nb : adj[node])
            if (color[nb] == c) return false;
        return true;
    }

    static boolean solve(int node) {
        if (node == N) return true;
        for (int c = 1; c <= K; c++) {
            if (isSafe(node, c)) {
                color[node] = c;
                if (solve(node + 1)) return true;
                color[node] = 0;
            }
        }
        return false;
    }
}`,
  }} />
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function GraphColoring() {
  const [steps] = useState(() => generateSteps());
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  useEffect(() => {
    if (!isRunning) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) { setIsRunning(false); return prev; }
        return prev + 1;
      });
    }, speed);
    return () => clearInterval(timerRef.current);
  }, [isRunning, speed, steps.length]);

  return (
    <AlgorithmPageShell
      title="Graph Coloring"
      description="Color a 6-node graph with 3 colors using backtracking so no two adjacent nodes share a color"
      category="Backtracking"
      difficulty="Medium"
      steps={steps}
      currentStep={currentStep}
      isRunning={isRunning}
      onPlay={() => setIsRunning(true)}
      onPause={() => setIsRunning(false)}
      onReset={() => { setIsRunning(false); setCurrentStep(0); }}
      onStepForward={() => setCurrentStep(p => Math.min(p + 1, steps.length - 1))}
      onStepBack={() => setCurrentStep(p => Math.max(p - 1, 0))}
      speed={speed}
      onSpeedChange={setSpeed}
      showInput={false}
      stats={{
        node: step.node >= 0 ? step.node : '—',
        color: step.color > 0 ? COLOR_NAMES[step.color] : '—',
        backtracks: step.backtracks,
      }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Simple and correct for any graph',
        'Can find chromatic number by trying k=1,2,3,...',
        'Easily extended to constraint satisfaction problems',
        'Pruning (isSafe check) avoids most bad branches',
      ]}
      disadvantages={[
        'Exponential worst case O(k^V)',
        'Not polynomial unless P=NP',
        'Chromatic number determination is NP-hard',
        'Requires entire graph in memory',
      ]}
      applications={[
        'Register allocation in compilers',
        'Scheduling (time slot assignment)',
        'Map coloring',
        'Frequency assignment in wireless networks',
        'Sudoku (a special case of graph coloring)',
      ]}
      interviewTips={[
        'Chromatic number of a bipartite graph is always ≤ 2',
        'Four Color Theorem: any planar map needs ≤ 4 colors',
        'Register allocation: variables are nodes, edges = simultaneous liveness',
        'Greedy coloring gives at most Δ+1 colors (Δ = max degree)',
      ]}
      relatedAlgos={[
        { title: "Knight's Tour", route: '/backtracking/knights-tour' },
        { title: 'N-Queens', route: '/backtracking/n-queens' },
        { title: 'Tarjan SCC', route: '/graph/tarjan-scc' },
      ]}
      practiceProblems={[
        { name: 'Possible Bipartition', difficulty: 'Medium', url: 'https://leetcode.com/problems/possible-bipartition/' },
        { name: 'Is Graph Bipartite?', difficulty: 'Medium', url: 'https://leetcode.com/problems/is-graph-bipartite/' },
        { name: 'Flower Planting With No Adjacent', difficulty: 'Medium', url: 'https://leetcode.com/problems/flower-planting-with-no-adjacent/' },
      ]}
    >
      {/* Color legend */}
      <div className="flex gap-3 mb-3 justify-center">
        {[1, 2, 3].map(c => (
          <span key={c} className="flex items-center gap-1.5 text-xs text-gray-300">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: COLORS[c] }} />
            {COLOR_NAMES[c]}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-full bg-gray-600 inline-block" /> uncolored
        </span>
      </div>

      {/* SVG Graph */}
      <div className="bg-gray-900/40 rounded-xl p-3 border border-gray-700/40 mb-3">
        <GraphSVG
          coloring={step.coloring || new Array(N).fill(0)}
          activeNode={step.node}
          conflictNode={step.conflict}
        />
      </div>

      {/* Node color chips */}
      <div className="flex gap-2 justify-center flex-wrap">
        {Array.from({ length: N }, (_, i) => {
          const c = (step.coloring || [])[i] || 0;
          const isActive = step.node === i;
          const isConflict = step.conflict === i;
          return (
            <div key={i} className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg border text-xs font-bold transition-all duration-200 ${
              isConflict ? 'border-red-500 ring-2 ring-red-500 animate-pulse' :
              isActive ? 'border-amber-400 ring-2 ring-amber-400' :
              c > 0 ? 'border-indigo-600' : 'border-gray-700'
            }`}
              style={{ background: c > 0 ? COLORS[c] + '33' : undefined }}
            >
              <span style={{ color: c > 0 ? COLORS[c] : '#9ca3af' }}>{i}</span>
              <span className="text-[8px] text-gray-500">{c > 0 ? COLOR_NAMES[c].slice(0, 3) : 'none'}</span>
            </div>
          );
        })}
      </div>
    </AlgorithmPageShell>
  );
}
