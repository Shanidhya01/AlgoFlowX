import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// 8-node directed graph with 3 SCCs
// SCC1: 0,1,2  SCC2: 3,4  SCC3: 5,6,7
const NODES = [
  { id: 0, label: 'A', x: 100, y: 80 },
  { id: 1, label: 'B', x: 220, y: 40 },
  { id: 2, label: 'C', x: 220, y: 140 },
  { id: 3, label: 'D', x: 370, y: 60 },
  { id: 4, label: 'E', x: 370, y: 160 },
  { id: 5, label: 'F', x: 510, y: 50 },
  { id: 6, label: 'G', x: 510, y: 150 },
  { id: 7, label: 'H', x: 610, y: 100 },
];

const ADJ = {
  0: [1],
  1: [2],
  2: [0, 3],
  3: [4],
  4: [3, 5],
  5: [6],
  6: [7],
  7: [5],
};

function generateSteps() {
  const steps = [];
  const n = NODES.length;
  const disc = new Array(n).fill(-1);
  const low = new Array(n).fill(-1);
  const onStack = new Array(n).fill(false);
  const stack = [];
  const sccs = [];
  let timer = 0;

  steps.push({
    message: 'Starting Tarjan\'s SCC. We\'ll use DFS with discovery time and low-link values.',
    disc: [...disc], low: [...low], onStack: [...onStack],
    stack: [], sccs: [], current: -1, neighbor: -1, done: false,
  });

  function dfs(u) {
    disc[u] = low[u] = timer++;
    stack.push(u);
    onStack[u] = true;

    steps.push({
      message: `Visit node ${NODES[u].label}: disc[${NODES[u].label}]=${disc[u]}, low[${NODES[u].label}]=${low[u]}. Push ${NODES[u].label} onto stack.`,
      disc: [...disc], low: [...low], onStack: [...onStack],
      stack: [...stack], sccs: sccs.map(s => [...s]), current: u, neighbor: -1, done: false,
    });

    for (const v of ADJ[u]) {
      if (disc[v] === -1) {
        steps.push({
          message: `Edge ${NODES[u].label}→${NODES[v].label}: ${NODES[v].label} unvisited, recurse.`,
          disc: [...disc], low: [...low], onStack: [...onStack],
          stack: [...stack], sccs: sccs.map(s => [...s]), current: u, neighbor: v, done: false,
        });
        dfs(v);
        low[u] = Math.min(low[u], low[v]);
        steps.push({
          message: `Back at ${NODES[u].label}: update low[${NODES[u].label}] = min(${low[u]}, ${low[v]}) = ${low[u]}.`,
          disc: [...disc], low: [...low], onStack: [...onStack],
          stack: [...stack], sccs: sccs.map(s => [...s]), current: u, neighbor: v, done: false,
        });
      } else if (onStack[v]) {
        low[u] = Math.min(low[u], disc[v]);
        steps.push({
          message: `Edge ${NODES[u].label}→${NODES[v].label}: back edge (${NODES[v].label} on stack). low[${NODES[u].label}] = ${low[u]}.`,
          disc: [...disc], low: [...low], onStack: [...onStack],
          stack: [...stack], sccs: sccs.map(s => [...s]), current: u, neighbor: v, done: false,
        });
      } else {
        steps.push({
          message: `Edge ${NODES[u].label}→${NODES[v].label}: ${NODES[v].label} already fully processed, skip.`,
          disc: [...disc], low: [...low], onStack: [...onStack],
          stack: [...stack], sccs: sccs.map(s => [...s]), current: u, neighbor: v, done: false,
        });
      }
    }

    if (low[u] === disc[u]) {
      const scc = [];
      let w;
      do {
        w = stack.pop();
        onStack[w] = false;
        scc.push(w);
      } while (w !== u);
      sccs.push(scc);
      steps.push({
        message: `low[${NODES[u].label}] == disc[${NODES[u].label}] = ${disc[u]}. SCC found: {${scc.map(x => NODES[x].label).join(', ')}}`,
        disc: [...disc], low: [...low], onStack: [...onStack],
        stack: [...stack], sccs: sccs.map(s => [...s]), current: u, neighbor: -1, done: false,
      });
    }
  }

  for (let i = 0; i < n; i++) {
    if (disc[i] === -1) dfs(i);
  }

  steps.push({
    message: `Done! Found ${sccs.length} Strongly Connected Components: ${sccs.map((s, i) => `SCC${i + 1}={${s.map(x => NODES[x].label).join(',')}}`).join(' | ')}`,
    disc: [...disc], low: [...low], onStack: [...onStack],
    stack: [], sccs: sccs.map(s => [...s]), current: -1, neighbor: -1, done: true,
  });

  return steps;
}

const SCC_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const theory = (
  <div>
    <TheorySection title="Tarjan's Strongly Connected Components">
      <p>Tarjan's algorithm finds all Strongly Connected Components (SCCs) of a directed graph in a single DFS pass in linear time O(V+E).</p>
      <p className="mt-2">A <strong>Strongly Connected Component</strong> is a maximal set of vertices such that there is a path from each vertex to every other vertex in the set.</p>
      <ul className="list-disc pl-4 space-y-1 mt-2">
        <li><strong>disc[u]</strong> — discovery time of node u</li>
        <li><strong>low[u]</strong> — lowest discovery time reachable from u's subtree</li>
        <li><strong>Stack</strong> — tracks nodes in the current DFS path</li>
        <li>When <code>low[u] == disc[u]</code>, u is the root of an SCC — pop the stack until u</li>
      </ul>
    </TheorySection>
    <TheorySection title="Algorithm Steps">
      <ol className="list-decimal pl-4 space-y-1">
        <li>DFS from each unvisited node</li>
        <li>Assign discovery time and low-link value on entry</li>
        <li>Push node onto stack</li>
        <li>For each neighbor: recurse if unvisited; update low via back-edges to stack nodes</li>
        <li>After processing all neighbors: if low[u] == disc[u], pop stack → SCC</li>
      </ol>
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

int n, timer_val = 0;
vector<int> adj[100], disc(100,-1), low(100,-1);
bool onStack[100];
stack<int> stk;
vector<vector<int>> sccs;

void dfs(int u) {
    disc[u] = low[u] = timer_val++;
    stk.push(u);
    onStack[u] = true;
    for (int v : adj[u]) {
        if (disc[v] == -1) {
            dfs(v);
            low[u] = min(low[u], low[v]);
        } else if (onStack[v]) {
            low[u] = min(low[u], disc[v]);
        }
    }
    if (low[u] == disc[u]) {
        vector<int> scc;
        int w;
        do {
            w = stk.top(); stk.pop();
            onStack[w] = false;
            scc.push_back(w);
        } while (w != u);
        sccs.push_back(scc);
    }
}

void tarjanSCC(int n) {
    for (int i = 0; i < n; i++)
        if (disc[i] == -1) dfs(i);
}`,
    'Python': `def tarjan_scc(graph, n):
    disc = [-1] * n
    low = [-1] * n
    on_stack = [False] * n
    stack = []
    sccs = []
    timer = [0]

    def dfs(u):
        disc[u] = low[u] = timer[0]; timer[0] += 1
        stack.append(u); on_stack[u] = True
        for v in graph[u]:
            if disc[v] == -1:
                dfs(v)
                low[u] = min(low[u], low[v])
            elif on_stack[v]:
                low[u] = min(low[u], disc[v])
        if low[u] == disc[u]:
            scc = []
            while True:
                w = stack.pop()
                on_stack[w] = False
                scc.append(w)
                if w == u: break
            sccs.append(scc)

    for i in range(n):
        if disc[i] == -1: dfs(i)
    return sccs`,
    'JavaScript': `function tarjanSCC(adj, n) {
  const disc = new Array(n).fill(-1);
  const low = new Array(n).fill(-1);
  const onStack = new Array(n).fill(false);
  const stack = [];
  const sccs = [];
  let timer = 0;

  function dfs(u) {
    disc[u] = low[u] = timer++;
    stack.push(u); onStack[u] = true;
    for (const v of adj[u]) {
      if (disc[v] === -1) {
        dfs(v);
        low[u] = Math.min(low[u], low[v]);
      } else if (onStack[v]) {
        low[u] = Math.min(low[u], disc[v]);
      }
    }
    if (low[u] === disc[u]) {
      const scc = [];
      let w;
      do { w = stack.pop(); onStack[w] = false; scc.push(w); }
      while (w !== u);
      sccs.push(scc);
    }
  }

  for (let i = 0; i < n; i++)
    if (disc[i] === -1) dfs(i);
  return sccs;
}`,
    'Java': `import java.util.*;

public class TarjanSCC {
    int[] disc, low;
    boolean[] onStack;
    Deque<Integer> stack;
    List<List<Integer>> sccs;
    List<Integer>[] adj;
    int timer = 0;

    void dfs(int u) {
        disc[u] = low[u] = timer++;
        stack.push(u); onStack[u] = true;
        for (int v : adj[u]) {
            if (disc[v] == -1) {
                dfs(v);
                low[u] = Math.min(low[u], low[v]);
            } else if (onStack[v]) {
                low[u] = Math.min(low[u], disc[v]);
            }
        }
        if (low[u] == disc[u]) {
            List<Integer> scc = new ArrayList<>();
            int w;
            do { w = stack.pop(); onStack[w] = false; scc.add(w); }
            while (w != u);
            sccs.add(scc);
        }
    }
}`,
  }} />
);

export default function TarjanSCC() {
  const [steps] = useState(generateSteps);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  // Map each node to its SCC index (-1 if none yet)
  const nodeToSCC = {};
  step.sccs.forEach((scc, idx) => scc.forEach(n => { nodeToSCC[n] = idx; }));

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

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setCurrentStep(0);
  }, []);

  const getNodeColor = (id) => {
    if (step.current === id) return '#f59e0b';
    if (step.neighbor === id) return '#a78bfa';
    if (nodeToSCC[id] !== undefined) return SCC_COLORS[nodeToSCC[id] % SCC_COLORS.length];
    if (step.onStack[id]) return '#60a5fa';
    if (step.disc[id] !== -1) return '#6b7280';
    return '#e5e7eb';
  };

  const getNodeTextColor = (id) => {
    const c = getNodeColor(id);
    return c === '#e5e7eb' ? '#111827' : '#ffffff';
  };

  return (
    <AlgorithmPageShell
      title="Tarjan's SCC"
      description="Find all Strongly Connected Components in one DFS pass using discovery time and low-link values"
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
        SCCs: step.sccs.length,
        stack: step.stack.map(i => NODES[i].label).join(',') || '∅',
        current: step.current >= 0 ? NODES[step.current].label : '—',
      }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Finds all SCCs in a single DFS pass — O(V+E)',
        'Works on directed graphs including disconnected ones',
        'Low-link values elegantly identify SCC roots',
        'Stack memory efficient vs multi-pass approaches',
      ]}
      disadvantages={[
        'Recursive DFS can cause stack overflow on very deep graphs',
        'More complex to implement than Kosaraju\'s',
        'Requires careful handling of back-edges vs cross-edges',
      ]}
      applications={[
        'Compiler analysis (finding circular dependencies)',
        'Social network analysis (tight-knit communities)',
        '2-SAT problem solving',
        'Deadlock detection in OS',
        'Web graph analysis (strongly connected web clusters)',
        'Game state analysis',
      ]}
      interviewTips={[
        'Know the difference: disc[u] is fixed at entry; low[u] updates during DFS',
        'SCC root condition: low[u] == disc[u] — unique property of the root',
        'Only update low via nodes on the stack (back-edges), not all visited nodes',
        'Compare with Kosaraju\'s: Tarjan uses one pass, Kosaraju uses two',
        'Can be adapted to find bridges and articulation points',
      ]}
      relatedAlgos={[
        { title: "Kosaraju's SCC", route: '/kosaraju-scc' },
        { title: 'Depth First Search', route: '/depth-first-search' },
        { title: 'Topological Sort', route: '/topological-sort' },
      ]}
      practiceProblems={[
        { name: 'Number of Provinces', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-provinces/' },
        { name: 'Critical Connections in a Network', difficulty: 'Hard', url: 'https://leetcode.com/problems/critical-connections-in-a-network/' },
        { name: 'Strongly Connected Components (SPOJ)', difficulty: 'Hard', url: 'https://www.spoj.com/problems/BOTTOM/' },
      ]}
    >
      <div className="flex gap-6 flex-col md:flex-row">
        {/* SVG Graph */}
        <div className="flex-1">
          <svg width="100%" viewBox="0 0 680 220" className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            {/* Edges */}
            {Object.entries(ADJ).map(([from, tos]) =>
              tos.map(to => {
                const f = NODES[parseInt(from)];
                const t = NODES[to];
                const dx = t.x - f.x, dy = t.y - f.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                const ux = dx / len, uy = dy / len;
                const r = 22;
                const x1 = f.x + ux * r, y1 = f.y + uy * r;
                const x2 = t.x - ux * r, y2 = t.y - uy * r;
                const isActive = step.current === parseInt(from) && step.neighbor === to;
                return (
                  <g key={`${from}-${to}`}>
                    <defs>
                      <marker id={`arr-${from}-${to}`} markerWidth="6" markerHeight="6" refX="4" refY="2" orient="auto">
                        <path d="M0,0 L0,4 L6,2 z" fill={isActive ? '#f59e0b' : '#9ca3af'} />
                      </marker>
                    </defs>
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={isActive ? '#f59e0b' : '#9ca3af'}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      markerEnd={`url(#arr-${from}-${to})`}
                    />
                  </g>
                );
              })
            )}
            {/* Nodes */}
            {NODES.map(node => (
              <g key={node.id}>
                <circle cx={node.x} cy={node.y} r={22} fill={getNodeColor(node.id)} stroke="#fff" strokeWidth="2" />
                <text x={node.x} y={node.y - 4} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="bold" fill={getNodeTextColor(node.id)}>{node.label}</text>
                {step.disc[node.id] !== -1 && (
                  <text x={node.x} y={node.y + 9} textAnchor="middle" fontSize="9" fill={getNodeTextColor(node.id)}>
                    d:{step.disc[node.id]} l:{step.low[node.id]}
                  </text>
                )}
              </g>
            ))}
          </svg>
          {/* Legend */}
          <div className="mt-3 flex gap-3 flex-wrap text-xs">
            {[['#f59e0b', 'Current'], ['#a78bfa', 'Neighbor'], ['#60a5fa', 'On Stack'], ['#6b7280', 'Visited']].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: c }} />
                <span className="text-gray-500 dark:text-gray-400">{l}</span>
              </span>
            ))}
            {SCC_COLORS.slice(0, 3).map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: c }} />
                <span className="text-gray-500 dark:text-gray-400">SCC {i + 1}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Stack sidebar */}
        <div className="md:w-40 flex-shrink-0">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Stack (top→)</p>
          <div className="space-y-1">
            {[...step.stack].reverse().map((nodeId, i) => (
              <div key={i} className="px-3 py-1.5 rounded-lg text-sm font-mono font-semibold text-white text-center"
                style={{ background: SCC_COLORS[nodeId % SCC_COLORS.length] }}>
                {NODES[nodeId].label}
              </div>
            ))}
            {step.stack.length === 0 && (
              <div className="px-3 py-1.5 rounded-lg text-xs text-gray-400 dark:text-gray-500 border border-dashed border-gray-300 dark:border-gray-600 text-center">empty</div>
            )}
          </div>

          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-4 mb-2 uppercase tracking-wider">SCCs Found</p>
          <div className="space-y-1">
            {step.sccs.map((scc, i) => (
              <div key={i} className="px-2 py-1 rounded-lg text-xs font-semibold text-white"
                style={{ background: SCC_COLORS[i % SCC_COLORS.length] }}>
                {'{' + scc.map(x => NODES[x].label).join(',') + '}'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
