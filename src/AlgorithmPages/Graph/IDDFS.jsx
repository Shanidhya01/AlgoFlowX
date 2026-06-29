import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// Binary tree — 4 levels (0..14), root=0, target=9
// Layout: level 0: node 0; level 1: 1,2; level 2: 3,4,5,6; level 3: 7,8,9,10,11,12,13,14
const NODES = [];
const nodeX = (level, index) => {
  const total = Math.pow(2, level);
  const spacing = 620 / (total + 1);
  return spacing * (index + 1);
};
const nodeY = level => 50 + level * 75;

for (let level = 0; level < 4; level++) {
  const count = Math.pow(2, level);
  for (let i = 0; i < count; i++) {
    const id = Math.pow(2, level) - 1 + i;
    NODES.push({ id, label: String(id), x: nodeX(level, i), y: nodeY(level), level, index: i });
  }
}

const TARGET_NODE = 9;

// Edges: parent = Math.floor((child-1)/2)
const EDGES = [];
for (let i = 1; i < NODES.length; i++) {
  const parent = Math.floor((i - 1) / 2);
  EDGES.push([parent, i]);
}

function generateSteps() {
  const steps = [];
  let totalVisited = 0;
  let iteration = 0;
  let found = false;

  steps.push({
    message: 'IDDFS: Start with depth limit = 0. Increase limit each iteration.',
    currentNode: -1, visitedThisIter: new Set(), depthLimit: 0,
    nodesVisited: 0, iteration: 0, done: false, path: [],
  });

  for (let limit = 0; limit <= 4 && !found; limit++) {
    iteration++;
    const visitedThisIter = new Set();

    steps.push({
      message: `Iteration ${iteration}: DFS with depth limit = ${limit}.`,
      currentNode: -1, visitedThisIter: new Set(), depthLimit: limit,
      nodesVisited: totalVisited, iteration, done: false, path: [],
    });

    function dls(node, depth, path) {
      visitedThisIter.add(node);
      totalVisited++;
      const currentPath = [...path, node];

      steps.push({
        message: `Visit node ${NODES[node].label} (depth ${depth}/${limit}).${node === TARGET_NODE ? ' TARGET FOUND!' : ''}`,
        currentNode: node, visitedThisIter: new Set(visitedThisIter), depthLimit: limit,
        nodesVisited: totalVisited, iteration, done: false, path: currentPath,
      });

      if (node === TARGET_NODE) {
        found = true;
        steps.push({
          message: `Target node ${TARGET_NODE} found at depth ${depth}! Path: ${currentPath.map(n => NODES[n].label).join('→')}`,
          currentNode: node, visitedThisIter: new Set(visitedThisIter), depthLimit: limit,
          nodesVisited: totalVisited, iteration, done: true, path: currentPath,
        });
        return true;
      }

      if (depth >= limit) {
        steps.push({
          message: `Node ${NODES[node].label}: depth limit ${limit} reached, backtrack.`,
          currentNode: node, visitedThisIter: new Set(visitedThisIter), depthLimit: limit,
          nodesVisited: totalVisited, iteration, done: false, path: currentPath,
        });
        return false;
      }

      // Children: 2*node+1 and 2*node+2
      const left = 2 * node + 1, right = 2 * node + 2;
      if (left < NODES.length) {
        if (dls(left, depth + 1, currentPath)) return true;
        if (found) return true;
      }
      if (right < NODES.length) {
        if (dls(right, depth + 1, currentPath)) return true;
        if (found) return true;
      }
      return false;
    }

    dls(0, 0, []);

    if (!found) {
      steps.push({
        message: `Depth ${limit} exhausted without finding target. Increasing limit to ${limit + 1}.`,
        currentNode: -1, visitedThisIter: new Set(visitedThisIter), depthLimit: limit,
        nodesVisited: totalVisited, iteration, done: false, path: [],
      });
    }
  }

  return steps;
}

const theory = (
  <div>
    <TheorySection title="Iterative Deepening DFS (IDDFS)">
      <p>IDDFS combines the <strong>space efficiency of DFS</strong> with the <strong>completeness of BFS</strong> by running depth-limited DFS with increasing depth limits.</p>
      <ol className="list-decimal pl-4 space-y-1 mt-2">
        <li>Run DFS with depth_limit = 0</li>
        <li>If not found, run DFS with depth_limit = 1</li>
        <li>Continue increasing until target found or all nodes exhausted</li>
      </ol>
      <p className="mt-2">Despite revisiting nodes in earlier iterations, the total work is still O(b^d) due to exponential growth.</p>
    </TheorySection>
    <TheorySection title="Why IDDFS is Optimal">
      <ul className="list-disc pl-4 space-y-1">
        <li><strong>Complete:</strong> Always finds the target if it exists</li>
        <li><strong>Optimal:</strong> Finds the shallowest solution first (like BFS)</li>
        <li><strong>Memory:</strong> O(bd) like DFS — much less than BFS's O(b^d)</li>
        <li><strong>Time:</strong> O(b^d) — overhead of re-visiting is small (about b/(b-1) factor)</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Time', 'O(b^d)', '—'],
      ['Space', 'O(bd)', '—'],
      ['vs BFS Space', 'O(b^d)', 'O(b^d)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `#include <bits/stdc++.h>
using namespace std;

bool dls(int node, int target, int depth, int limit, vector<vector<int>>& tree) {
    if (node == target) return true;
    if (depth >= limit) return false;
    for (int child : tree[node])
        if (dls(child, target, depth + 1, limit, tree)) return true;
    return false;
}

bool iddfs(int root, int target, int maxDepth, vector<vector<int>>& tree) {
    for (int limit = 0; limit <= maxDepth; limit++) {
        if (dls(root, target, 0, limit, tree)) {
            cout << "Found at depth " << limit << endl;
            return true;
        }
    }
    return false;
}`,
    'Python': `def iddfs(tree, root, target, max_depth):
    def dls(node, depth, limit):
        if node == target: return True
        if depth >= limit: return False
        return any(dls(child, depth+1, limit) for child in tree[node])

    for limit in range(max_depth + 1):
        if dls(root, 0, limit):
            print(f"Found at depth {limit}")
            return True
    return False`,
    'JavaScript': `function iddfs(tree, root, target, maxDepth) {
  function dls(node, depth, limit) {
    if (node === target) return true;
    if (depth >= limit) return false;
    return (tree[node] || []).some(child => dls(child, depth + 1, limit));
  }
  for (let limit = 0; limit <= maxDepth; limit++) {
    if (dls(root, 0, limit)) {
      console.log("Found at depth", limit);
      return true;
    }
  }
  return false;
}`,
    'Java': `import java.util.*;

public class IDDFS {
    static boolean dls(int node, int target, int depth, int limit, List<Integer>[] tree) {
        if (node == target) return true;
        if (depth >= limit) return false;
        for (int child : tree[node])
            if (dls(child, target, depth + 1, limit, tree)) return true;
        return false;
    }

    static boolean iddfs(int root, int target, int maxDepth, List<Integer>[] tree) {
        for (int limit = 0; limit <= maxDepth; limit++)
            if (dls(root, target, 0, limit, tree)) {
                System.out.println("Found at depth " + limit);
                return true;
            }
        return false;
    }
}`,
  }} />
);

export default function IDDFS() {
  const [steps] = useState(generateSteps);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];
  const visitedSet = step.visitedThisIter || new Set();
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

  const getNodeColor = (node) => {
    if (node.id === step.currentNode) return '#f59e0b';
    if (node.id === TARGET_NODE && step.done) return '#10b981';
    if (node.id === TARGET_NODE) return '#6366f1';
    if (pathSet.has(node.id)) return '#3b82f6';
    if (visitedSet.has(node.id)) return '#60a5fa';
    if (node.level > step.depthLimit) return '#f3f4f6';
    return '#e5e7eb';
  };

  return (
    <AlgorithmPageShell
      title="Iterative Deepening DFS"
      description="Combines DFS space efficiency with BFS completeness by running depth-limited DFS with increasing limits"
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
        depthLimit: step.depthLimit,
        nodesVisited: step.nodesVisited,
        iteration: step.iteration,
      }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(bd) space — far better than BFS\'s O(b^d)',
        'Complete and optimal like BFS',
        'Simple recursive implementation',
        'Preferred for large search spaces with unknown depth',
      ]}
      disadvantages={[
        'Revisits nodes from earlier iterations (though overhead is small)',
        'Slower than BFS if the goal is shallow',
        'Not ideal if the search tree has many shallow solutions',
      ]}
      applications={[
        'Game playing (chess, checkers) with depth-limited search',
        'Puzzle solving (15-puzzle, Rubik\'s cube)',
        'AI planning and theorem proving',
        'Compiler symbol table lookup in nested scopes',
        'Filesystem search with depth constraints',
      ]}
      interviewTips={[
        'IDDFS is the preferred uninformed search algorithm for most competitive programming',
        'Space complexity O(bd) vs BFS O(b^d) — explain the exponential gap',
        'Total nodes visited: N(b,d) = b + b² + ... + b^d ≈ b^d × b/(b-1) — constant overhead',
        'When asked to choose between BFS and DFS: if memory is limited, use IDDFS',
      ]}
      relatedAlgos={[
        { title: 'Depth First Search', route: '/depth-first-search' },
        { title: 'Breadth First Search', route: '/breadth-first-search' },
        { title: 'Bidirectional Search', route: '/bidirectional-search' },
      ]}
      practiceProblems={[
        { name: 'Minimum Depth of Binary Tree', difficulty: 'Easy', url: 'https://leetcode.com/problems/minimum-depth-of-binary-tree/' },
        { name: 'Word Search', difficulty: 'Medium', url: 'https://leetcode.com/problems/word-search/' },
        { name: 'N-Queens', difficulty: 'Hard', url: 'https://leetcode.com/problems/n-queens/' },
      ]}
    >
      <div>
        <svg width="100%" viewBox="0 0 640 340" className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {/* Depth limit line */}
          {step.depthLimit < 4 && (
            <line
              x1={10} y1={nodeY(step.depthLimit) + 40}
              x2={630} y2={nodeY(step.depthLimit) + 40}
              stroke="#f59e0b" strokeWidth="2" strokeDasharray="8,4"
            />
          )}
          {step.depthLimit < 4 && (
            <text x={15} y={nodeY(step.depthLimit) + 35} fontSize="10" fill="#f59e0b" fontWeight="bold">depth limit={step.depthLimit}</text>
          )}

          {/* Edges */}
          {EDGES.map(([u, v]) => {
            const fu = NODES[u], tv = NODES[v];
            const inPath = pathSet.has(u) && pathSet.has(v);
            return (
              <line key={`${u}-${v}`}
                x1={fu.x} y1={fu.y} x2={tv.x} y2={tv.y}
                stroke={inPath ? '#3b82f6' : tv.level <= step.depthLimit ? '#9ca3af' : '#e5e7eb'}
                strokeWidth={inPath ? 2.5 : 1.5}
              />
            );
          })}

          {/* Nodes */}
          {NODES.map(node => {
            const fill = getNodeColor(node);
            const textColor = ['#e5e7eb', '#f3f4f6'].includes(fill) ? '#111827' : '#ffffff';
            const isTarget = node.id === TARGET_NODE;
            return (
              <g key={node.id}>
                <circle cx={node.x} cy={node.y} r={isTarget ? 22 : 18}
                  fill={fill} stroke={isTarget ? '#6366f1' : '#fff'} strokeWidth={isTarget ? 3 : 1.5}
                />
                <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="middle"
                  fontSize={isTarget ? 12 : 10} fontWeight="bold" fill={textColor}>
                  {node.label}{isTarget ? '★' : ''}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-3 flex gap-3 flex-wrap text-xs justify-center">
          {[['#f59e0b', 'Current'], ['#3b82f6', 'Current path'], ['#60a5fa', 'Visited this iter'], ['#6366f1', 'Target'], ['#10b981', 'Found!'], ['#f3f4f6', 'Beyond depth limit']].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full inline-block border border-gray-300" style={{ background: c }} />
              <span className="text-gray-500 dark:text-gray-400">{l}</span>
            </span>
          ))}
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
