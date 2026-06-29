import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// Undirected graph where all nodes have even degree → Eulerian circuit exists
// Nodes: 6, all even degree
const NODES = [
  { id: 0, label: 'A', x: 150, y: 60  },
  { id: 1, label: 'B', x: 320, y: 60  },
  { id: 2, label: 'C', x: 430, y: 170 },
  { id: 3, label: 'D', x: 320, y: 280 },
  { id: 4, label: 'E', x: 150, y: 280 },
  { id: 5, label: 'F', x: 60,  y: 170 },
];

// Undirected edges — each listed once; algorithm uses adjacency list
const EDGES = [
  [0,1],[0,5],[0,4],
  [1,2],[1,3],
  [2,3],[2,4],
  [3,4],
  [4,5],[5,3],
];

function buildAdj() {
  const adj = {};
  for (let i = 0; i < NODES.length; i++) adj[i] = [];
  EDGES.forEach(([u, v]) => { adj[u].push(v); adj[v].push(u); });
  return adj;
}

// Edge key (undirected) — always smaller first
const eKey = (u, v) => `${Math.min(u, v)}-${Math.max(u, v)}`;

function generateSteps() {
  const steps = [];
  // Build mutable adjacency sets
  const adj = {};
  for (let i = 0; i < NODES.length; i++) adj[i] = new Set();
  EDGES.forEach(([u, v]) => { adj[u].add(v); adj[v].add(u); });

  const usedEdges = new Set();
  const circuit = [0];
  const path = [0]; // stack for DFS-like traversal

  steps.push({
    message: 'Start Hierholzer\'s algorithm from node A. Build initial circuit by following edges until we return to start.',
    circuit: [...circuit], path: [...path], usedEdges: new Set(), current: 0, done: false,
  });

  // Hierholzer's algorithm
  while (path.length > 0) {
    const v = path[path.length - 1];
    // Find any unused neighbor
    const neighbors = [...adj[v]];
    if (neighbors.length > 0) {
      const w = neighbors[0];
      adj[v].delete(w);
      adj[w].delete(v);
      usedEdges.add(eKey(v, w));
      path.push(w);
      steps.push({
        message: `Follow edge ${NODES[v].label}→${NODES[w].label} (using it up). Current path: [${path.map(x => NODES[x].label).join('→')}]`,
        circuit: [...circuit], path: [...path], usedEdges: new Set(usedEdges), current: w, done: false,
      });
    } else {
      // Dead end — add to circuit
      circuit.unshift(path.pop());
      steps.push({
        message: `No more edges at ${NODES[v].label}. Add it to circuit front. Circuit so far: [${circuit.map(x => NODES[x].label).join('→')}]`,
        circuit: [...circuit], path: [...path], usedEdges: new Set(usedEdges),
        current: path.length > 0 ? path[path.length - 1] : -1, done: false,
      });
    }
  }

  steps.push({
    message: `Eulerian circuit found! (${circuit.length - 1} edges) → ${circuit.map(x => NODES[x].label).join(' → ')}`,
    circuit: [...circuit], path: [], usedEdges: new Set(usedEdges), current: -1, done: true,
  });

  return steps;
}

const theory = (
  <div>
    <TheorySection title="Hierholzer's Eulerian Circuit">
      <p>An <strong>Eulerian circuit</strong> is a cycle that visits every edge exactly once and returns to the starting vertex.</p>
      <p className="mt-2"><strong>Existence condition:</strong> Every vertex must have even degree.</p>
      <p className="mt-2">Hierholzer's algorithm builds the circuit efficiently in O(E) by:</p>
      <ol className="list-decimal pl-4 space-y-1 mt-1">
        <li>Start from any vertex, follow edges (removing them) until stuck</li>
        <li>Splice sub-tours back into the main circuit</li>
        <li>Repeat until all edges are used</li>
      </ol>
    </TheorySection>
    <TheorySection title="Eulerian Path vs Circuit">
      <ul className="list-disc pl-4 space-y-1">
        <li><strong>Circuit:</strong> All vertices even degree → starts and ends at same node</li>
        <li><strong>Path:</strong> Exactly two vertices odd degree → starts at one odd, ends at other</li>
        <li>No Eulerian path exists if more than 2 vertices have odd degree</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['All cases', 'O(E)', 'O(V + E)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `#include <bits/stdc++.h>
using namespace std;

vector<int> hierholzer(int n, vector<vector<int>>& adj) {
    // Check all degrees are even
    for (int i = 0; i < n; i++)
        if (adj[i].size() % 2 != 0) return {}; // No Eulerian circuit

    vector<int> circuit;
    stack<int> path;
    path.push(0);

    while (!path.empty()) {
        int v = path.top();
        if (adj[v].empty()) {
            circuit.push_back(v);
            path.pop();
        } else {
            int w = adj[v].back();
            adj[v].pop_back();
            // Remove reverse edge
            adj[w].erase(find(adj[w].begin(), adj[w].end(), v));
            path.push(w);
        }
    }
    reverse(circuit.begin(), circuit.end());
    return circuit;
}`,
    'Python': `from collections import defaultdict

def hierholzer(n, edges):
    adj = defaultdict(list)
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)

    # Check Eulerian condition
    if any(len(adj[i]) % 2 != 0 for i in range(n)):
        return []  # No Eulerian circuit

    circuit = []
    path = [0]

    while path:
        v = path[-1]
        if adj[v]:
            w = adj[v].pop()
            adj[w].remove(v)
            path.append(w)
        else:
            circuit.append(path.pop())

    return circuit[::-1]`,
    'JavaScript': `function hierholzer(n, edges) {
  const adj = Array.from({length: n}, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }

  if (adj.some(a => a.length % 2 !== 0)) return []; // No Eulerian circuit

  const circuit = [];
  const path = [0];

  while (path.length) {
    const v = path[path.length - 1];
    if (adj[v].length) {
      const w = adj[v].pop();
      adj[w].splice(adj[w].indexOf(v), 1);
      path.push(w);
    } else {
      circuit.push(path.pop());
    }
  }
  return circuit.reverse();
}`,
    'Java': `import java.util.*;

public class Hierholzer {
    static List<Integer> eulerCircuit(int n, List<int[]> edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }

        for (int i = 0; i < n; i++)
            if (adj.get(i).size() % 2 != 0) return Collections.emptyList();

        Deque<Integer> path = new ArrayDeque<>();
        List<Integer> circuit = new ArrayList<>();
        path.push(0);
        while (!path.isEmpty()) {
            int v = path.peek();
            if (adj.get(v).isEmpty()) { circuit.add(v); path.pop(); }
            else {
                int w = adj.get(v).remove(adj.get(v).size() - 1);
                adj.get(w).remove(Integer.valueOf(v));
                path.push(w);
            }
        }
        Collections.reverse(circuit);
        return circuit;
    }
}`,
  }} />
);

export default function Hierholzer() {
  const [steps] = useState(generateSteps);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(700);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];
  const usedSet = step.usedEdges || new Set();
  const pathSet = new Set(step.path || []);

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

  return (
    <AlgorithmPageShell
      title="Hierholzer's Eulerian Circuit"
      description="Find an Eulerian circuit (visiting every edge exactly once) using iterative path-building"
      category="Graph"
      difficulty="Medium"
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
        circuitLen: step.circuit ? step.circuit.length - 1 : 0,
        unusedEdges: EDGES.length - usedSet.size,
        pathLen: step.path ? step.path.length : 0,
      }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Optimal O(E) time complexity',
        'Works on any Eulerian graph (all even degrees)',
        'Simple iterative implementation with a stack',
        'Can be extended to find Eulerian path (two odd-degree nodes)',
      ]}
      disadvantages={[
        'Only works when Eulerian circuit/path exists',
        'Cannot find Hamiltonian circuits (NP-hard)',
        'Requires connected graph (or all edges in one component)',
      ]}
      applications={[
        'Chinese Postman Problem (route inspection)',
        'Circuit board etching (drawing without lifting pen)',
        'DNA fragment assembly',
        'Network routing (covering all links)',
        'Garbage collection routes',
        'Puzzle solving (Königsberg bridges)',
      ]}
      interviewTips={[
        'First check existence: all vertices even degree → circuit; exactly 2 odd → path',
        'The stack-based implementation is more efficient than recursive',
        'Distinguish Eulerian (edges) from Hamiltonian (vertices) — very different complexity',
        'Mention the Königsberg bridge problem as historical context',
      ]}
      relatedAlgos={[
        { title: 'Depth First Search', route: '/depth-first-search' },
        { title: 'Breadth First Search', route: '/breadth-first-search' },
        { title: "Tarjan's SCC", route: '/tarjan-scc' },
      ]}
      practiceProblems={[
        { name: 'Reconstruct Itinerary', difficulty: 'Hard', url: 'https://leetcode.com/problems/reconstruct-itinerary/' },
        { name: 'Valid Arrangement of Pairs', difficulty: 'Hard', url: 'https://leetcode.com/problems/valid-arrangement-of-pairs/' },
        { name: 'Eulerian Circuit (CSES)', difficulty: 'Medium', url: 'https://cses.fi/problemset/task/1691' },
      ]}
    >
      <div className="flex gap-6 flex-col md:flex-row">
        <div className="flex-1">
          <svg width="100%" viewBox="0 0 500 340" className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            {EDGES.map(([u, v]) => {
              const f = NODES[u], t = NODES[v];
              const key = eKey(u, v);
              const used = usedSet.has(key);
              const inCircuit = step.done;
              return (
                <line key={key}
                  x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                  stroke={used ? (inCircuit ? '#10b981' : '#d1d5db') : '#3b82f6'}
                  strokeWidth={used ? (inCircuit ? 3 : 1.5) : 2.5}
                  strokeDasharray={used && !inCircuit ? '5,3' : undefined}
                  opacity={used && !inCircuit ? 0.4 : 1}
                />
              );
            })}
            {NODES.map(node => {
              const isCurrent = step.current === node.id;
              const inPath = pathSet.has(node.id);
              const inCircuit = (step.circuit || []).includes(node.id);
              const bg = isCurrent ? '#f59e0b' : inPath ? '#60a5fa' : inCircuit && step.done ? '#10b981' : '#e5e7eb';
              return (
                <g key={node.id}>
                  <circle cx={node.x} cy={node.y} r={24} fill={bg} stroke="#fff" strokeWidth="2" />
                  <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold"
                    fill={bg === '#e5e7eb' ? '#111827' : '#ffffff'}>
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="mt-3 flex gap-3 flex-wrap text-xs">
            {[['#3b82f6', 'Unused edge'], ['#d1d5db', 'Used edge (gray)'], ['#f59e0b', 'Current node'], ['#60a5fa', 'In path stack'], ['#10b981', 'Circuit complete']].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1">
                <span className="w-3 h-3 rounded inline-block" style={{ background: c }} />
                <span className="text-gray-500 dark:text-gray-400">{l}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="md:w-52 flex-shrink-0 space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Circuit (built)</p>
            <div className="flex flex-wrap gap-1">
              {(step.circuit || []).map((nodeId, i) => (
                <span key={i} className="flex items-center gap-0.5">
                  <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold">{NODES[nodeId].label}</span>
                  {i < step.circuit.length - 1 && <span className="text-gray-400 text-xs">→</span>}
                </span>
              ))}
              {(!step.circuit || step.circuit.length === 0) && (
                <span className="text-xs text-gray-400 dark:text-gray-500 italic">empty</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Path Stack</p>
            <div className="flex flex-wrap gap-1">
              {(step.path || []).map((nodeId, i) => (
                <span key={i} className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold">{NODES[nodeId].label}</span>
              ))}
              {(!step.path || step.path.length === 0) && (
                <span className="text-xs text-gray-400 dark:text-gray-500 italic">empty</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
