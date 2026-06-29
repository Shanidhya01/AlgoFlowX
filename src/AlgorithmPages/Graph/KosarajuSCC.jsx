import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const NODES = [
  { id: 0, label: 'A', x: 100, y: 80 },
  { id: 1, label: 'B', x: 220, y: 40 },
  { id: 2, label: 'C', x: 220, y: 140 },
  { id: 3, label: 'D', x: 360, y: 60 },
  { id: 4, label: 'E', x: 360, y: 160 },
  { id: 5, label: 'F', x: 490, y: 50 },
  { id: 6, label: 'G', x: 490, y: 150 },
  { id: 7, label: 'H', x: 590, y: 100 },
];

// Original directed graph
const ADJ = {
  0: [1], 1: [2], 2: [0, 3], 3: [4], 4: [3, 5], 5: [6], 6: [7], 7: [5],
};

// Transposed graph
const ADJ_T = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
Object.entries(ADJ).forEach(([u, neighbors]) => {
  neighbors.forEach(v => { ADJ_T[v].push(parseInt(u)); });
});

const SCC_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

function generateSteps() {
  const steps = [];
  const n = NODES.length;
  const visited = new Array(n).fill(false);
  const finishOrder = [];
  const sccs = [];

  steps.push({
    message: 'Kosaraju\'s Pass 1: DFS on original graph to record finish order.',
    pass: 1, visited: [...visited], finishOrder: [], sccs: [],
    current: -1, neighbor: -1, done: false, showTransposed: false,
  });

  // Pass 1
  function dfs1(u) {
    visited[u] = true;
    steps.push({
      message: `Pass 1 — Visit ${NODES[u].label}.`,
      pass: 1, visited: [...visited], finishOrder: [...finishOrder], sccs: [],
      current: u, neighbor: -1, done: false, showTransposed: false,
    });
    for (const v of ADJ[u]) {
      if (!visited[v]) {
        steps.push({
          message: `Pass 1 — ${NODES[u].label}→${NODES[v].label}: unvisited, recurse.`,
          pass: 1, visited: [...visited], finishOrder: [...finishOrder], sccs: [],
          current: u, neighbor: v, done: false, showTransposed: false,
        });
        dfs1(v);
      }
    }
    finishOrder.push(u);
    steps.push({
      message: `Pass 1 — Finish ${NODES[u].label}. Push to finish stack. Order so far: [${finishOrder.map(x => NODES[x].label).join(',')}]`,
      pass: 1, visited: [...visited], finishOrder: [...finishOrder], sccs: [],
      current: u, neighbor: -1, done: false, showTransposed: false,
    });
  }

  for (let i = 0; i < n; i++) {
    if (!visited[i]) dfs1(i);
  }

  steps.push({
    message: `Pass 1 complete. Finish order: [${finishOrder.map(x => NODES[x].label).join(' → ')}]. Now DFS on transposed graph in reverse finish order.`,
    pass: 2, visited: [...visited], finishOrder: [...finishOrder], sccs: [],
    current: -1, neighbor: -1, done: false, showTransposed: true,
  });

  // Pass 2 on transposed graph
  const visited2 = new Array(n).fill(false);
  let currentSCC = [];

  function dfs2(u) {
    visited2[u] = true;
    currentSCC.push(u);
    steps.push({
      message: `Pass 2 (transposed) — Visit ${NODES[u].label}, add to current SCC.`,
      pass: 2, visited: visited2.map((v, i) => v || visited[i]), finishOrder: [...finishOrder],
      sccs: sccs.map(s => [...s]), currentSCC: [...currentSCC],
      current: u, neighbor: -1, done: false, showTransposed: true,
    });
    for (const v of ADJ_T[u]) {
      if (!visited2[v]) {
        steps.push({
          message: `Pass 2 — ${NODES[u].label}→${NODES[v].label} (transposed): recurse.`,
          pass: 2, visited: visited2.map((v2, i) => v2 || visited[i]), finishOrder: [...finishOrder],
          sccs: sccs.map(s => [...s]), currentSCC: [...currentSCC],
          current: u, neighbor: v, done: false, showTransposed: true,
        });
        dfs2(v);
      }
    }
  }

  for (let i = finishOrder.length - 1; i >= 0; i--) {
    const u = finishOrder[i];
    if (!visited2[u]) {
      currentSCC = [];
      dfs2(u);
      sccs.push([...currentSCC]);
      steps.push({
        message: `SCC found: {${currentSCC.map(x => NODES[x].label).join(', ')}}. Total SCCs: ${sccs.length}`,
        pass: 2, visited: visited2.map((v2, i2) => v2 || visited[i2]), finishOrder: [...finishOrder],
        sccs: sccs.map(s => [...s]), currentSCC: [],
        current: -1, neighbor: -1, done: false, showTransposed: true,
      });
    }
  }

  steps.push({
    message: `Done! Found ${sccs.length} SCCs: ${sccs.map((s, i) => `{${s.map(x => NODES[x].label).join(',')}}`).join(' | ')}`,
    pass: 2, visited: new Array(n).fill(true), finishOrder: [...finishOrder],
    sccs: sccs.map(s => [...s]), currentSCC: [],
    current: -1, neighbor: -1, done: true, showTransposed: true,
  });

  return steps;
}

const theory = (
  <div>
    <TheorySection title="Kosaraju's SCC Algorithm">
      <p>Kosaraju's algorithm finds all SCCs in two DFS passes over the graph and its transpose.</p>
      <ol className="list-decimal pl-4 space-y-1 mt-2">
        <li><strong>Pass 1:</strong> DFS on the <em>original</em> graph. Push each node to a stack when it finishes.</li>
        <li><strong>Transpose:</strong> Reverse all edge directions.</li>
        <li><strong>Pass 2:</strong> Process nodes from the stack (reverse finish order). Each DFS tree on the transposed graph = one SCC.</li>
      </ol>
      <p className="mt-2">Key insight: nodes in the same SCC can reach each other in both the original and transposed graphs.</p>
    </TheorySection>
    <TheorySection title="Why Two Passes?">
      <ul className="list-disc pl-4 space-y-1">
        <li>Pass 1 orders nodes by reachability</li>
        <li>Transposing reverses reachability between SCCs</li>
        <li>Pass 2 in reverse finish order isolates each SCC perfectly</li>
        <li>Comparable to Tarjan's but easier to understand conceptually</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['All cases', 'O(V + E)', 'O(V)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `#include <bits/stdc++.h>
using namespace std;

void dfs1(int u, vector<vector<int>>& adj, vector<bool>& vis, stack<int>& st) {
    vis[u] = true;
    for (int v : adj[u]) if (!vis[v]) dfs1(v, adj, vis, st);
    st.push(u);
}

void dfs2(int u, vector<vector<int>>& radj, vector<bool>& vis, vector<int>& comp) {
    vis[u] = true; comp.push_back(u);
    for (int v : radj[u]) if (!vis[v]) dfs2(v, radj, vis, comp);
}

vector<vector<int>> kosarajuSCC(int n, vector<vector<int>>& adj) {
    stack<int> st;
    vector<bool> vis(n, false);
    for (int i = 0; i < n; i++) if (!vis[i]) dfs1(i, adj, vis, st);

    vector<vector<int>> radj(n);
    for (int u = 0; u < n; u++) for (int v : adj[u]) radj[v].push_back(u);

    fill(vis.begin(), vis.end(), false);
    vector<vector<int>> sccs;
    while (!st.empty()) {
        int u = st.top(); st.pop();
        if (!vis[u]) {
            vector<int> comp;
            dfs2(u, radj, vis, comp);
            sccs.push_back(comp);
        }
    }
    return sccs;
}`,
    'Python': `def kosaraju_scc(graph, n):
    visited = [False] * n
    finish_order = []

    def dfs1(u):
        visited[u] = True
        for v in graph[u]:
            if not visited[v]: dfs1(v)
        finish_order.append(u)

    for i in range(n):
        if not visited[i]: dfs1(i)

    # Build transposed graph
    trans = [[] for _ in range(n)]
    for u in range(n):
        for v in graph[u]:
            trans[v].append(u)

    visited2 = [False] * n
    sccs = []

    def dfs2(u, comp):
        visited2[u] = True
        comp.append(u)
        for v in trans[u]:
            if not visited2[v]: dfs2(v, comp)

    for u in reversed(finish_order):
        if not visited2[u]:
            comp = []
            dfs2(u, comp)
            sccs.append(comp)
    return sccs`,
    'JavaScript': `function kosarajuSCC(adj, n) {
  const visited = new Array(n).fill(false);
  const order = [];
  const dfs1 = u => {
    visited[u] = true;
    for (const v of adj[u]) if (!visited[v]) dfs1(v);
    order.push(u);
  };
  for (let i = 0; i < n; i++) if (!visited[i]) dfs1(i);

  const trans = Array.from({length: n}, () => []);
  for (let u = 0; u < n; u++) for (const v of adj[u]) trans[v].push(u);

  const vis2 = new Array(n).fill(false);
  const sccs = [];
  const dfs2 = (u, comp) => {
    vis2[u] = true; comp.push(u);
    for (const v of trans[u]) if (!vis2[v]) dfs2(v, comp);
  };
  for (let i = order.length - 1; i >= 0; i--) {
    if (!vis2[order[i]]) {
      const comp = [];
      dfs2(order[i], comp);
      sccs.push(comp);
    }
  }
  return sccs;
}`,
    'Java': `import java.util.*;

public class KosarajuSCC {
    static void dfs1(int u, List<Integer>[] adj, boolean[] vis, Deque<Integer> st) {
        vis[u] = true;
        for (int v : adj[u]) if (!vis[v]) dfs1(v, adj, vis, st);
        st.push(u);
    }
    static void dfs2(int u, List<Integer>[] adj, boolean[] vis, List<Integer> comp) {
        vis[u] = true; comp.add(u);
        for (int v : adj[u]) if (!vis[v]) dfs2(v, adj, vis, comp);
    }
    static List<List<Integer>> solve(int n, List<Integer>[] adj) {
        Deque<Integer> st = new ArrayDeque<>();
        boolean[] vis = new boolean[n];
        for (int i = 0; i < n; i++) if (!vis[i]) dfs1(i, adj, vis, st);

        List<Integer>[] trans = new List[n];
        for (int i = 0; i < n; i++) trans[i] = new ArrayList<>();
        for (int u = 0; u < n; u++) for (int v : adj[u]) trans[v].add(u);

        Arrays.fill(vis, false);
        List<List<Integer>> sccs = new ArrayList<>();
        while (!st.isEmpty()) {
            int u = st.pop();
            if (!vis[u]) {
                List<Integer> comp = new ArrayList<>();
                dfs2(u, trans, vis, comp);
                sccs.add(comp);
            }
        }
        return sccs;
    }
}`,
  }} />
);

export default function KosarajuSCC() {
  const [steps] = useState(generateSteps);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];
  const nodeToSCC = {};
  (step.sccs || []).forEach((scc, idx) => scc.forEach(n => { nodeToSCC[n] = idx; }));
  const currentSCCSet = new Set(step.currentSCC || []);

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

  const handleReset = useCallback(() => { setIsRunning(false); setCurrentStep(0); }, []);

  const getNodeColor = (id) => {
    if (step.current === id) return '#f59e0b';
    if (step.neighbor === id) return '#a78bfa';
    if (nodeToSCC[id] !== undefined) return SCC_COLORS[nodeToSCC[id] % SCC_COLORS.length];
    if (currentSCCSet.has(id)) return '#60a5fa';
    if (step.visited && step.visited[id]) return '#6b7280';
    return '#e5e7eb';
  };

  const activeAdj = step.showTransposed ? ADJ_T : ADJ;

  return (
    <AlgorithmPageShell
      title="Kosaraju's SCC"
      description="Two-pass DFS algorithm: finish-order on original graph, then DFS on transposed graph"
      category="Graph"
      difficulty="Hard"
      steps={steps}
      currentStep={currentStep}
      isRunning={isRunning}
      onPlay={() => setIsRunning(true)}
      onPause={() => setIsRunning(false)}
      onReset={handleReset}
      onStepForward={() => setCurrentStep(p => Math.min(p + 1, steps.length - 1))}
      onStepBack={() => setCurrentStep(p => Math.max(p - 1, 0))}
      speed={speed}
      onSpeedChange={setSpeed}
      onRandomize={handleReset}
      showInput={false}
      stats={{
        pass: step.pass || 1,
        SCCs: (step.sccs || []).length,
        finishStack: (step.finishOrder || []).map(x => NODES[x].label).join(',') || '∅',
      }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Conceptually intuitive — two independent DFS passes',
        'Linear time O(V+E)',
        'Easier to understand than Tarjan\'s algorithm',
        'Works on any directed graph',
      ]}
      disadvantages={[
        'Requires two full DFS passes and graph transposition',
        'More memory overhead than Tarjan\'s (needs transpose graph)',
        'Recursive DFS may overflow stack on very large graphs',
      ]}
      applications={[
        'Dependency resolution in build systems',
        'Analyzing call graphs in compilers',
        'Finding reachable states in model checking',
        'Social network cohesion analysis',
        'Circuit analysis in electronics',
      ]}
      interviewTips={[
        'Explain why reverse finish order is crucial for Pass 2',
        'The transpose reverses all SCC "connections" without breaking internal SCC structure',
        'Both Tarjan\'s and Kosaraju\'s are O(V+E) — choose based on simplicity preference',
        'Practice building the transposed graph correctly',
      ]}
      relatedAlgos={[
        { title: "Tarjan's SCC", route: '/tarjan-scc' },
        { title: 'Depth First Search', route: '/depth-first-search' },
        { title: 'Topological Sort', route: '/topological-sort' },
      ]}
      practiceProblems={[
        { name: 'Course Schedule II', difficulty: 'Medium', url: 'https://leetcode.com/problems/course-schedule-ii/' },
        { name: 'Number of Islands', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-islands/' },
        { name: 'Strongly Connected Component (SPOJ)', difficulty: 'Hard', url: 'https://www.spoj.com/problems/BOTTOM/' },
      ]}
    >
      <div>
        <div className="flex gap-2 mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${step.showTransposed ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' : 'bg-blue-600 text-white'}`}>Original Graph</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${step.showTransposed ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>Transposed Graph</span>
        </div>
        <svg width="100%" viewBox="0 0 650 220" className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {Object.entries(activeAdj).map(([from, tos]) =>
            tos.map(to => {
              const f = NODES[parseInt(from)];
              const t = NODES[to];
              const dx = t.x - f.x, dy = t.y - f.y;
              const len = Math.sqrt(dx * dx + dy * dy) || 1;
              const ux = dx / len, uy = dy / len;
              const r = 22;
              const x1 = f.x + ux * r, y1 = f.y + uy * r;
              const x2 = t.x - ux * r, y2 = t.y - uy * r;
              const isActive = step.current === parseInt(from) && step.neighbor === to;
              const edgeKey = `${from}-${to}`;
              return (
                <g key={edgeKey}>
                  <defs>
                    <marker id={`arr-k-${edgeKey}`} markerWidth="6" markerHeight="6" refX="4" refY="2" orient="auto">
                      <path d="M0,0 L0,4 L6,2 z" fill={isActive ? '#f59e0b' : step.showTransposed ? '#a78bfa' : '#9ca3af'} />
                    </marker>
                  </defs>
                  <line x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={isActive ? '#f59e0b' : step.showTransposed ? '#a78bfa' : '#9ca3af'}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    markerEnd={`url(#arr-k-${edgeKey})`}
                  />
                </g>
              );
            })
          )}
          {NODES.map(node => (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} r={22} fill={getNodeColor(node.id)} stroke="#fff" strokeWidth="2" />
              <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="bold"
                fill={getNodeColor(node.id) === '#e5e7eb' ? '#111827' : '#ffffff'}>
                {node.label}
              </text>
            </g>
          ))}
        </svg>
        {/* Finish order */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Finish order:</span>
          {(step.finishOrder || []).map((nodeId, i) => (
            <span key={i} className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{NODES[nodeId].label}</span>
          ))}
        </div>
        {/* SCCs */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">SCCs:</span>
          {(step.sccs || []).map((scc, i) => (
            <span key={i} className="px-2 py-0.5 rounded text-xs font-semibold text-white"
              style={{ background: SCC_COLORS[i % SCC_COLORS.length] }}>
              {'{' + scc.map(x => NODES[x].label).join(',') + '}'}
            </span>
          ))}
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
