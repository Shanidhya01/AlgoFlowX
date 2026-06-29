import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// 6-node flow network: S=0, T=5, known max flow = 9
const NODES = [
  { id: 0, label: 'S', x: 60,  y: 130 },
  { id: 1, label: 'A', x: 200, y: 60  },
  { id: 2, label: 'B', x: 200, y: 200 },
  { id: 3, label: 'C', x: 360, y: 60  },
  { id: 4, label: 'D', x: 360, y: 200 },
  { id: 5, label: 'T', x: 500, y: 130 },
];

// [from, to, capacity]
const INIT_EDGES = [
  [0,1,10], [0,2,8],
  [1,3,5],  [1,4,7],
  [2,1,3],  [2,4,6],
  [3,5,8],  [4,5,9],
];

function buildCapacity() {
  const cap = {};
  for (let i = 0; i < 6; i++) cap[i] = {};
  INIT_EDGES.forEach(([u, v, c]) => {
    cap[u][v] = (cap[u][v] || 0) + c;
    if (!cap[v][u]) cap[v][u] = 0;
  });
  return cap;
}

function cloneCap(cap) {
  return Object.fromEntries(Object.entries(cap).map(([k, v]) => [k, { ...v }]));
}

function generateSteps() {
  const steps = [];
  const cap = buildCapacity();
  const flow = {};
  for (let i = 0; i < 6; i++) flow[i] = {};
  INIT_EDGES.forEach(([u, v]) => { flow[u][v] = 0; flow[v][u] = 0; });

  let maxFlow = 0;
  let augPaths = 0;

  steps.push({
    message: 'Ford-Fulkerson: Find augmenting paths S→T via DFS and push flow along each.',
    cap: cloneCap(cap), flow: JSON.parse(JSON.stringify(flow)),
    augPath: [], bottleneck: 0, maxFlow, augPaths, done: false,
  });

  const S = 0, T = 5;

  // DFS to find augmenting path
  function dfs(u, visited, parent) {
    if (u === T) return true;
    visited[u] = true;
    const neighbors = Object.keys(cap[u]).map(Number).sort();
    for (const v of neighbors) {
      if (!visited[v] && cap[u][v] > 0) {
        parent[v] = u;
        if (dfs(v, visited, parent)) return true;
      }
    }
    return false;
  }

  while (true) {
    const visited = {};
    const parent = { [S]: -1 };
    if (!dfs(S, visited, parent)) break;

    // Reconstruct path
    const path = [];
    let cur = T;
    while (cur !== S) { path.unshift(cur); cur = parent[cur]; }
    path.unshift(S);

    // Find bottleneck
    let bn = Infinity;
    for (let i = 0; i < path.length - 1; i++) {
      bn = Math.min(bn, cap[path[i]][path[i + 1]]);
    }

    augPaths++;
    steps.push({
      message: `Augmenting path found: ${path.map(x => NODES[x].label).join('→')} | Bottleneck = ${bn}`,
      cap: cloneCap(cap), flow: JSON.parse(JSON.stringify(flow)),
      augPath: [...path], bottleneck: bn, maxFlow, augPaths, done: false,
    });

    // Update capacities and flow
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i], v = path[i + 1];
      cap[u][v] -= bn;
      cap[v][u] += bn;
      flow[u][v] = (flow[u][v] || 0) + bn;
      flow[v][u] = (flow[v][u] || 0) - bn;
    }
    maxFlow += bn;

    steps.push({
      message: `Updated residual capacities. Max flow so far = ${maxFlow}.`,
      cap: cloneCap(cap), flow: JSON.parse(JSON.stringify(flow)),
      augPath: [...path], bottleneck: bn, maxFlow, augPaths, done: false,
    });
  }

  steps.push({
    message: `Ford-Fulkerson complete! Maximum flow S→T = ${maxFlow} (found via ${augPaths} augmenting paths).`,
    cap: cloneCap(cap), flow: JSON.parse(JSON.stringify(flow)),
    augPath: [], bottleneck: 0, maxFlow, augPaths, done: true,
  });

  return steps;
}

const theory = (
  <div>
    <TheorySection title="Ford-Fulkerson Max Flow">
      <p>Ford-Fulkerson computes the maximum flow from a source <strong>s</strong> to a sink <strong>t</strong> in a directed flow network.</p>
      <ul className="list-disc pl-4 space-y-1 mt-2">
        <li><strong>Augmenting path:</strong> A path from s to t with positive residual capacity on each edge</li>
        <li><strong>Residual capacity:</strong> cap[u][v] - flow[u][v] (remaining sendable flow)</li>
        <li><strong>Bottleneck:</strong> Minimum residual capacity along the augmenting path</li>
        <li>Repeat until no augmenting path exists — current flow is maximum</li>
      </ul>
    </TheorySection>
    <TheorySection title="Max-Flow Min-Cut Theorem">
      <p>Maximum flow equals the minimum cut capacity. A <strong>cut</strong> partitions V into S-side (containing source) and T-side (containing sink). The minimum cut is the bottleneck of the network.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Ford-Fulkerson (DFS)', 'O(E × max_flow)', 'O(V + E)'],
      ['Edmonds-Karp (BFS)', 'O(VE²)', 'O(V + E)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `#include <bits/stdc++.h>
using namespace std;

bool dfs(int u, int t, vector<vector<int>>& cap, vector<int>& parent, vector<bool>& vis) {
    vis[u] = true;
    if (u == t) return true;
    for (int v = 0; v < cap.size(); v++) {
        if (!vis[v] && cap[u][v] > 0) {
            parent[v] = u;
            if (dfs(v, t, cap, parent, vis)) return true;
        }
    }
    return false;
}

int fordFulkerson(int n, int s, int t, vector<vector<int>> cap) {
    int maxFlow = 0;
    while (true) {
        vector<int> parent(n, -1);
        vector<bool> vis(n, false);
        parent[s] = s;
        if (!dfs(s, t, cap, parent, vis)) break;
        int flow = INT_MAX;
        for (int v = t; v != s; v = parent[v])
            flow = min(flow, cap[parent[v]][v]);
        for (int v = t; v != s; v = parent[v]) {
            cap[parent[v]][v] -= flow;
            cap[v][parent[v]] += flow;
        }
        maxFlow += flow;
    }
    return maxFlow;
}`,
    'Python': `from collections import defaultdict

def ford_fulkerson(graph, source, sink, n):
    cap = defaultdict(lambda: defaultdict(int))
    for u, v, c in graph:
        cap[u][v] += c

    def dfs(u, visited, parent):
        if u == sink: return True
        visited.add(u)
        for v in range(n):
            if v not in visited and cap[u][v] > 0:
                parent[v] = u
                if dfs(v, visited, parent): return True
        return False

    max_flow = 0
    while True:
        parent = {source: None}
        if not dfs(source, set(), parent): break
        # Find bottleneck
        flow, v = float('inf'), sink
        while v != source:
            u = parent[v]
            flow = min(flow, cap[u][v])
            v = u
        # Update capacities
        v = sink
        while v != source:
            u = parent[v]
            cap[u][v] -= flow
            cap[v][u] += flow
            v = u
        max_flow += flow
    return max_flow`,
    'JavaScript': `function fordFulkerson(n, edges, s, t) {
  const cap = Array.from({length: n}, () => new Array(n).fill(0));
  for (const [u, v, c] of edges) { cap[u][v] += c; }

  const dfs = (u, visited, parent) => {
    if (u === t) return true;
    visited[u] = true;
    for (let v = 0; v < n; v++) {
      if (!visited[v] && cap[u][v] > 0) {
        parent[v] = u;
        if (dfs(v, visited, parent)) return true;
      }
    }
    return false;
  };

  let maxFlow = 0;
  while (true) {
    const parent = new Array(n).fill(-1);
    parent[s] = s;
    if (!dfs(s, new Array(n).fill(false), parent)) break;
    let flow = Infinity;
    for (let v = t; v !== s; v = parent[v])
      flow = Math.min(flow, cap[parent[v]][v]);
    for (let v = t; v !== s; v = parent[v]) {
      cap[parent[v]][v] -= flow;
      cap[v][parent[v]] += flow;
    }
    maxFlow += flow;
  }
  return maxFlow;
}`,
    'Java': `import java.util.*;

public class FordFulkerson {
    static int n;
    static int[][] cap;

    static boolean dfs(int u, int t, int[] parent, boolean[] vis) {
        vis[u] = true;
        if (u == t) return true;
        for (int v = 0; v < n; v++) {
            if (!vis[v] && cap[u][v] > 0) {
                parent[v] = u;
                if (dfs(v, t, parent, vis)) return true;
            }
        }
        return false;
    }

    static int maxFlow(int s, int t) {
        int flow = 0;
        while (true) {
            int[] parent = new int[n]; Arrays.fill(parent, -1);
            parent[s] = s;
            if (!dfs(s, t, parent, new boolean[n])) break;
            int f = Integer.MAX_VALUE;
            for (int v = t; v != s; v = parent[v]) f = Math.min(f, cap[parent[v]][v]);
            for (int v = t; v != s; v = parent[v]) { cap[parent[v]][v] -= f; cap[v][parent[v]] += f; }
            flow += f;
        }
        return flow;
    }
}`,
  }} />
);

export default function FordFulkerson() {
  const [steps] = useState(generateSteps);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(800);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];
  const augPathSet = new Set();
  for (let i = 0; i < (step.augPath || []).length - 1; i++) {
    augPathSet.add(`${step.augPath[i]}-${step.augPath[i + 1]}`);
  }

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

  // Compute original capacities for display
  const origCap = {};
  INIT_EDGES.forEach(([u, v, c]) => { origCap[`${u}-${v}`] = (origCap[`${u}-${v}`] || 0) + c; });

  const getEdgeFlow = (u, v) => {
    const f = (step.flow[u] || {})[v] || 0;
    return f > 0 ? f : 0;
  };

  return (
    <AlgorithmPageShell
      title="Ford-Fulkerson Max Flow"
      description="Find maximum flow in a network by augmenting along DFS paths until no path remains"
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
        maxFlow: step.maxFlow,
        augPaths: step.augPaths,
        bottleneck: step.bottleneck || '—',
      }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Simple to understand and implement',
        'Works with any method to find augmenting paths',
        'Directly extends to min-cut computation',
        'Flexible — can use DFS, BFS, or other path-finding',
      ]}
      disadvantages={[
        'With DFS: O(E × max_flow) — can be slow for large capacities',
        'May not terminate with irrational capacities',
        'Edmonds-Karp (BFS variant) is strictly better for integer capacities',
      ]}
      applications={[
        'Network bandwidth allocation',
        'Bipartite matching (job assignment, marriage problem)',
        'Image segmentation (min-cut)',
        'Airline scheduling and crew assignment',
        'Supply chain optimization',
        'Baseball elimination problem',
      ]}
      interviewTips={[
        'Always use Edmonds-Karp (BFS) in interviews for guaranteed polynomial time',
        'Residual graph: edge u→v has cap - flow, reverse edge v→u has flow',
        'Max-flow = min-cut is a key theorem to mention',
        'Bipartite matching reduces to max-flow — know this reduction',
        'For unit capacity graphs, complexity is O(E√V)',
      ]}
      relatedAlgos={[
        { title: 'Breadth First Search', route: '/breadth-first-search' },
        { title: 'Depth First Search', route: '/depth-first-search' },
        { title: "Dijkstra's", route: '/dijkstras' },
      ]}
      practiceProblems={[
        { name: 'Max Flow (SPOJ FASTFLOW)', difficulty: 'Hard', url: 'https://www.spoj.com/problems/FASTFLOW/' },
        { name: 'Bipartite Matching', difficulty: 'Medium', url: 'https://leetcode.com/problems/maximum-matching-of-players-with-trainers/' },
        { name: 'Network Flow', difficulty: 'Hard', url: 'https://cses.fi/problemset/task/1694' },
      ]}
    >
      <div>
        <svg width="100%" viewBox="0 0 580 270" className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {INIT_EDGES.map(([u, v, origC]) => {
            const f = NODES[u], t = NODES[v];
            const dx = t.x - f.x, dy = t.y - f.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const ux = dx / len, uy = dy / len;
            const r = 24;
            const x1 = f.x + ux * r, y1 = f.y + uy * r;
            const x2 = t.x - ux * r, y2 = t.y - uy * r;
            const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
            const key = `${u}-${v}`;
            const isAug = augPathSet.has(key);
            const curFlow = getEdgeFlow(u, v);
            const residual = (step.cap[u] || {})[v] || 0;
            const isSaturated = residual === 0 && curFlow > 0;
            const edgeColor = isAug ? '#3b82f6' : isSaturated ? '#ef4444' : '#9ca3af';
            return (
              <g key={key}>
                <defs>
                  <marker id={`arr-ff-${key}`} markerWidth="6" markerHeight="6" refX="4" refY="2" orient="auto">
                    <path d="M0,0 L0,4 L6,2 z" fill={edgeColor} />
                  </marker>
                </defs>
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={edgeColor} strokeWidth={isAug ? 3 : 1.5}
                  markerEnd={`url(#arr-ff-${key})`}
                />
                <text x={mx - uy * 12} y={my + ux * 12} textAnchor="middle" fontSize="11" fontWeight="bold"
                  fill={isAug ? '#2563eb' : isSaturated ? '#dc2626' : '#4b5563'}>
                  {curFlow}/{origC}
                </text>
              </g>
            );
          })}
          {NODES.map(node => {
            const isSource = node.id === 0, isSink = node.id === 5;
            const inPath = (step.augPath || []).includes(node.id);
            const bg = isSource ? '#6366f1' : isSink ? '#10b981' : inPath ? '#3b82f6' : '#e5e7eb';
            const textCol = bg === '#e5e7eb' ? '#111827' : '#ffffff';
            return (
              <g key={node.id}>
                <circle cx={node.x} cy={node.y} r={24} fill={bg} stroke="#fff" strokeWidth="2" />
                <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold" fill={textCol}>{node.label}</text>
              </g>
            );
          })}
        </svg>
        <div className="mt-3 flex gap-4 flex-wrap text-xs">
          {[['#3b82f6', 'Augmenting path'], ['#ef4444', 'Saturated edge'], ['#6366f1', 'Source (S)'], ['#10b981', 'Sink (T)']].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded inline-block" style={{ background: c }} />
              <span className="text-gray-500 dark:text-gray-400">{l}</span>
            </span>
          ))}
          <span className="text-gray-400 dark:text-gray-500">Edge labels: flow/capacity</span>
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
