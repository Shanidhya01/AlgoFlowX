import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, Network } from 'lucide-react';

function UnionFind() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  const [n, setN] = useState(8);
  const [parent, setParent] = useState([]);
  const [rank, setRank] = useState([]);
  const [operations, setOperations] = useState([]);
  const [currentNode, setCurrentNode] = useState(-1);
  const [highlightNodes, setHighlightNodes] = useState([]);
  const [pathCompressionSteps, setPathCompressionSteps] = useState([]);

  const initializeUnionFind = useCallback((size) => {
    const p = Array.from({ length: size }, (_, i) => i);
    const r = Array(size).fill(0);
    setParent(p);
    setRank(r);
    setSteps([]);
    setCurrentStep(0);
    setOperations([]);
    setCurrentNode(-1);
    setHighlightNodes([]);
    setPathCompressionSteps([]);
  }, []);

  useEffect(() => {
    initializeUnionFind(n);
  }, [n, initializeUnionFind]);

  const find = useCallback((x, p) => {
    if (p[x] !== x) {
      p[x] = find(p[x], p);
    }
    return p[x];
  }, []);

  const generateOperations = useCallback(() => {
    const operationSteps = [];
    const newParent = Array.from(parent);
    const newRank = Array.from(rank);

    // Generate operations based on array size
    const ops = n === 4 ? [
      { type: 'union', a: 0, b: 1 },
      { type: 'union', a: 2, b: 3 },
      { type: 'union', a: 0, b: 2 },
      { type: 'find', a: 3 }
    ] : n === 6 ? [
      { type: 'union', a: 0, b: 1 },
      { type: 'union', a: 2, b: 3 },
      { type: 'union', a: 4, b: 5 },
      { type: 'union', a: 0, b: 2 },
      { type: 'find', a: 5 }
    ] : n === 8 ? [
      { type: 'union', a: 0, b: 1 },
      { type: 'union', a: 2, b: 3 },
      { type: 'union', a: 0, b: 2 },
      { type: 'union', a: 4, b: 5 },
      { type: 'union', a: 6, b: 7 },
      { type: 'union', a: 0, b: 4 },
      { type: 'find', a: 1 },
      { type: 'union', a: 0, b: 6 },
      { type: 'find', a: 7 }
    ] : n === 10 ? [
      { type: 'union', a: 0, b: 1 },
      { type: 'union', a: 2, b: 3 },
      { type: 'union', a: 4, b: 5 },
      { type: 'union', a: 6, b: 7 },
      { type: 'union', a: 8, b: 9 },
      { type: 'union', a: 0, b: 2 },
      { type: 'union', a: 4, b: 6 },
      { type: 'union', a: 0, b: 4 },
      { type: 'find', a: 5 }
    ] : [
      { type: 'union', a: 0, b: 1 },
      { type: 'union', a: 2, b: 3 },
      { type: 'union', a: 4, b: 5 },
      { type: 'union', a: 6, b: 7 },
      { type: 'union', a: 8, b: 9 },
      { type: 'union', a: 10, b: 11 },
      { type: 'union', a: 0, b: 2 },
      { type: 'union', a: 4, b: 6 },
      { type: 'union', a: 0, b: 4 },
      { type: 'find', a: 11 }
    ];

    operationSteps.push({
      type: 'initialize',
      message: `Initialize Union-Find with ${n} elements. Each element is its own parent (root). Rank of each element is 0.`,
      parent: Array.from(newParent),
      rank: Array.from(newRank),
      currentNode: -1,
      highlightNodes: [],
      pathCompressionSteps: [],
      operationCount: 0
    });

    ops.forEach((op, opIdx) => {
      if (op.type === 'union') {
        operationSteps.push({
          type: 'find_a',
          message: `Operation ${opIdx + 1}: UNION(${op.a}, ${op.b}) - Finding root of element ${op.a}...`,
          parent: Array.from(newParent),
          rank: Array.from(newRank),
          currentNode: op.a,
          highlightNodes: [op.a],
          pathCompressionSteps: [],
          operationCount: opIdx + 1,
          op: op
        });

        const rootA = find(op.a, newParent);

        operationSteps.push({
          type: 'find_b',
          message: `Root of ${op.a} is ${rootA}. Now finding root of element ${op.b}...`,
          parent: Array.from(newParent),
          rank: Array.from(newRank),
          currentNode: op.b,
          highlightNodes: [op.a, op.b, rootA],
          pathCompressionSteps: [],
          operationCount: opIdx + 1,
          op: op
        });

        const rootB = find(op.b, newParent);

        operationSteps.push({
          type: 'roots_found',
          message: `Root of ${op.b} is ${rootB}. Comparing roots: ${rootA} and ${rootB}`,
          parent: Array.from(newParent),
          rank: Array.from(newRank),
          currentNode: -1,
          highlightNodes: [rootA, rootB],
          pathCompressionSteps: [],
          operationCount: opIdx + 1,
          op: op
        });

        if (rootA !== rootB) {
          if (newRank[rootA] < newRank[rootB]) {
            newParent[rootA] = rootB;
            operationSteps.push({
              type: 'union_perform',
              message: `Rank comparison: rank[${rootA}]=${newRank[rootA]} < rank[${rootB}]=${newRank[rootB]}. Attaching ${rootA} to ${rootB} (smaller tree under larger).`,
              parent: Array.from(newParent),
              rank: Array.from(newRank),
              currentNode: -1,
              highlightNodes: [rootA, rootB],
              pathCompressionSteps: [],
              operationCount: opIdx + 1,
              op: op
            });
          } else if (newRank[rootA] > newRank[rootB]) {
            newParent[rootB] = rootA;
            operationSteps.push({
              type: 'union_perform',
              message: `Rank comparison: rank[${rootA}]=${newRank[rootA]} > rank[${rootB}]=${newRank[rootB]}. Attaching ${rootB} to ${rootA} (smaller tree under larger).`,
              parent: Array.from(newParent),
              rank: Array.from(newRank),
              currentNode: -1,
              highlightNodes: [rootA, rootB],
              pathCompressionSteps: [],
              operationCount: opIdx + 1,
              op: op
            });
          } else {
            newParent[rootB] = rootA;
            newRank[rootA]++;
            operationSteps.push({
              type: 'union_perform',
              message: `Ranks are equal: rank[${rootA}]=${newRank[rootA]-1} = rank[${rootB}]=${newRank[rootB]}. Attaching ${rootB} to ${rootA} and incrementing rank to ${newRank[rootA]}.`,
              parent: Array.from(newParent),
              rank: Array.from(newRank),
              currentNode: -1,
              highlightNodes: [rootA, rootB],
              pathCompressionSteps: [],
              operationCount: opIdx + 1,
              op: op
            });
          }
        } else {
          operationSteps.push({
            type: 'union_perform',
            message: `Elements ${op.a} and ${op.b} already in same set (root: ${rootA}). No changes needed.`,
            parent: Array.from(newParent),
            rank: Array.from(newRank),
            currentNode: -1,
            highlightNodes: [rootA],
            pathCompressionSteps: [],
            operationCount: opIdx + 1,
            op: op
          });
        }
      } else if (op.type === 'find') {
        const pathSteps = [];
        let current = op.a;
        while (newParent[current] !== current) {
          pathSteps.push(current);
          current = newParent[current];
        }
        pathSteps.push(current);

        operationSteps.push({
          type: 'find_operation',
          message: `Operation ${opIdx + 1}: FIND(${op.a}) - Traversing path to root: ${pathSteps.join(' → ')}`,
          parent: Array.from(newParent),
          rank: Array.from(newRank),
          currentNode: -1,
          highlightNodes: pathSteps,
          pathCompressionSteps: [],
          operationCount: opIdx + 1,
          op: op
        });

        operationSteps.push({
          type: 'path_compression',
          message: `Applying path compression: All nodes on path will point directly to root ${current}`,
          parent: Array.from(newParent),
          rank: Array.from(newRank),
          currentNode: -1,
          highlightNodes: pathSteps,
          pathCompressionSteps: pathSteps,
          operationCount: opIdx + 1,
          op: op
        });

        // Apply path compression
        let y = op.a;
        while (y !== current) {
          const nextY = newParent[y];
          newParent[y] = current;
          y = nextY;
        }

        operationSteps.push({
          type: 'find_complete',
          message: `FIND(${op.a}) = ${current}. Path compression complete! All nodes now directly reference the root.`,
          parent: Array.from(newParent),
          rank: Array.from(newRank),
          currentNode: -1,
          highlightNodes: [current],
          pathCompressionSteps: [],
          operationCount: opIdx + 1,
          op: op
        });
      }
    });

    operationSteps.push({
      type: 'complete',
      message: `All ${ops.length} operations complete! Union-Find demonstrates efficient set operations with union by rank and path compression optimizations.`,
      parent: Array.from(newParent),
      rank: Array.from(newRank),
      currentNode: -1,
      highlightNodes: [],
      pathCompressionSteps: [],
      operationCount: ops.length
    });

    return operationSteps;
  }, [parent, rank, n, find]);

  const runAlgorithm = () => {
    const operationSteps = generateOperations();
    setSteps(operationSteps);
    setCurrentStep(0);
  };

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  const resetAnimation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    initializeUnionFind(n);
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  useEffect(() => {
    if (isRunning && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, animationSpeed);
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length - 1) {
      setIsRunning(false);
    }
  }, [isRunning, currentStep, steps.length, animationSpeed]);

  useEffect(() => {
    if (steps[currentStep]) {
      const step = steps[currentStep];
      setParent(step.parent || []);
      setRank(step.rank || []);
      setCurrentNode(step.currentNode || -1);
      setHighlightNodes(step.highlightNodes || []);
      setPathCompressionSteps(step.pathCompressionSteps || []);
    }
  }, [currentStep, steps]);

  const renderVisualizer = () => (
    <div className="space-y-6">
      {/* Union-Find Structure Visualization */}
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Network className="text-blue-600" size={28} />
          Union-Find Structure
        </h3>

        <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-gray-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Node Information Table */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4 text-lg">Element Details</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Array.from({ length: n }).map((_, i) => {
                  const isHighlighted = highlightNodes.includes(i);
                  const isPathCompression = pathCompressionSteps.includes(i);
                  const isRoot = parent[i] === i;
                  
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                        isPathCompression
                          ? 'bg-orange-200 border-orange-500 scale-105 shadow-lg'
                          : isHighlighted
                          ? 'bg-yellow-200 border-yellow-500 scale-105 shadow-lg'
                          : isRoot
                          ? 'bg-green-100 border-green-400'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center font-mono text-sm md:text-base">
                        <div className="font-bold">
                          Element <span className="text-lg text-blue-600">{i}</span>
                        </div>
                        <div className="space-x-4 text-xs md:text-sm">
                          <span>Parent: <span className="font-bold text-blue-600">{parent[i]}</span></span>
                          <span>Rank: <span className="font-bold text-purple-600">{rank[i]}</span></span>
                          {isRoot && <span className="bg-green-500 text-white px-2 py-1 rounded">ROOT</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tree Visualization */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4 text-lg">Forest Structure</h4>
              <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                <svg width="100%" height="350" className="border border-gray-300 rounded bg-gray-50">
                  {/* Draw edges from non-root to root */}
                  {parent.map((p, i) => {
                    if (p === i) return null;
                    const fromX = 30 + i * (320 / n);
                    const fromY = 250;
                    const toX = 30 + p * (320 / n);
                    const toY = 80;

                    const isHighlighted = highlightNodes.includes(i) && highlightNodes.includes(p);
                    return (
                      <g key={`edge-${i}-${p}`}>
                        <line
                          x1={fromX}
                          y1={fromY}
                          x2={toX}
                          y2={toY}
                          stroke={isHighlighted ? '#f59e0b' : '#d1d5db'}
                          strokeWidth={isHighlighted ? 3 : 2}
                          markerEnd="url(#arrowhead)"
                          className="transition-all duration-300"
                        />
                      </g>
                    );
                  })}

                  {/* Arrow marker */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3, 0 6" fill="#d1d5db" />
                    </marker>
                  </defs>

                  {/* Draw nodes */}
                  {Array.from({ length: n }).map((_, i) => {
                    const isHighlighted = highlightNodes.includes(i);
                    const isRoot = parent[i] === i;
                    const x = 30 + i * (320 / n);
                    const y = isRoot ? 80 : 250;

                    return (
                      <g key={`node-${i}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r="20"
                          fill={
                            isHighlighted
                              ? '#fbbf24'
                              : isRoot
                              ? '#10b981'
                              : '#e5e7eb'
                          }
                          stroke={isHighlighted ? '#f59e0b' : '#6b7280'}
                          strokeWidth="2"
                          className="transition-all duration-300"
                        />
                        <text
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dy="0.3em"
                          className="text-xs md:text-sm font-bold pointer-events-none"
                          fill={isHighlighted || isRoot ? 'white' : 'black'}
                        >
                          {i}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <p className="text-xs text-gray-600 mt-2 space-y-1">
                  <span><span className="inline-block w-4 h-4 bg-green-500 rounded mr-2 align-middle"></span>Root nodes (parent = self)</span>
                  <span className="block"><span className="inline-block w-4 h-4 bg-gray-300 rounded mr-2 align-middle"></span>Non-root nodes (point to parent)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded p-4 border-l-4 border-blue-500">
            <div className="text-sm font-medium text-gray-600">Total Elements</div>
            <div className="text-3xl font-bold text-blue-600">{n}</div>
          </div>
          <div className="bg-green-50 rounded p-4 border-l-4 border-green-500">
            <div className="text-sm font-medium text-gray-600">Root Nodes (Sets)</div>
            <div className="text-3xl font-bold text-green-600">
              {parent.filter((p, i) => p === i).length}
            </div>
          </div>
          <div className="bg-purple-50 rounded p-4 border-l-4 border-purple-500">
            <div className="text-sm font-medium text-gray-600">Max Rank</div>
            <div className="text-3xl font-bold text-purple-600">{Math.max(...rank, 0)}</div>
          </div>
          <div className="bg-yellow-50 rounded p-4 border-l-4 border-yellow-500">
            <div className="text-sm font-medium text-gray-600">Connected Components</div>
            <div className="text-3xl font-bold text-yellow-600">
              {new Set(parent.map((_, i) => {
                let root = i;
                while (parent[root] !== root) {
                  root = parent[root];
                }
                return root;
              })).size}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TheorySection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Union-Find (DSU) Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">What is Union-Find (DSU)?</h3>
          <p className="text-gray-700">
            Union-Find, also known as Disjoint Set Union (DSU), is a data structure that efficiently handles two fundamental operations on sets: finding which set an element belongs to and merging two sets together. It's essential for solving problems involving connectivity, cycle detection, and Minimum Spanning Trees.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700">Core Operations</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
              <li><span className="font-semibold">MAKE-SET(x):</span> Create a singleton set containing only x</li>
              <li><span className="font-semibold">FIND(x):</span> Return the representative (root) of x's set</li>
              <li><span className="font-semibold">UNION(x, y):</span> Merge the sets containing x and y into one</li>
              <li>All operations run in nearly O(1) amortized time with optimizations</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700">Real-World Applications</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
              <li>Kruskal's Minimum Spanning Tree algorithm</li>
              <li>Cycle detection in undirected graphs</li>
              <li>Finding connected components</li>
              <li>Network connectivity verification</li>
              <li>Bipartite graph checking</li>
              <li>Social network analysis (friend groups)</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-purple-900">Two Key Optimizations</h4>
          <div className="space-y-4">
            <div className="bg-white p-3 rounded border-l-4 border-purple-500">
              <p className="font-semibold text-purple-900">1. Union by Rank 📊</p>
              <p className="text-gray-700 text-sm mt-1">
                Always attach the tree with smaller rank (height) under the tree with larger rank. This keeps the trees shallow and ensures quick lookups. Without this, we might create a long chain that takes O(n) to traverse.
              </p>
            </div>
            <div className="bg-white p-3 rounded border-l-4 border-blue-500">
              <p className="font-semibold text-blue-900">2. Path Compression 🗜️</p>
              <p className="text-gray-700 text-sm mt-1">
                During FIND(x), make every node on the path point directly to the root. This flattens the tree structure over time, making subsequent FIND operations extremely fast. Future searches won't have to traverse as many nodes.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-orange-900">Time Complexity Analysis</h4>
          <div className="space-y-2 text-gray-700 text-sm font-mono">
            <p><span className="font-semibold">Without optimizations:</span> O(n) per operation</p>
            <p><span className="font-semibold">With union by rank only:</span> O(log n) per operation</p>
            <p><span className="font-semibold">With both optimizations:</span> O(α(n)) ≈ O(1) amortized</p>
            <p className="text-xs text-gray-600 mt-2">
              Where α(n) is the inverse Ackermann function - practically a constant (always &lt; 5 for all reasonable n)
            </p>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-red-900">Why Not Just Use Arrays?</h4>
          <p className="text-gray-700 text-sm">
            Arrays would require O(n) time to find connected components. Union-Find achieves nearly constant time with smart optimizations. For a graph with 1 million vertices and edges, Union-Find completes in microseconds while naive approaches take seconds!
          </p>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg space-y-4">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
        Complete Implementation Guide
      </h2>

      <div className="bg-gray-50 rounded-lg p-4 border">
        <h4 className="font-semibold mb-3 text-lg text-gray-900">Core Union-Find Operations</h4>
        <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
          <code>{`// Global arrays
parent = array of size n    // parent[i] stores parent of element i
rank = array of size n      // rank[i] stores rank (height) of element i

MAKE-SET(x):
  parent[x] = x            // x is its own parent (root)
  rank[x] = 0              // Initial rank is 0

FIND(x):                   // With path compression
  if parent[x] != x:
    parent[x] = FIND(parent[x])    // Recursive call, compress path
  return parent[x]

UNION(x, y):               // Union by rank strategy
  root_x = FIND(x)         // Find roots of both elements
  root_y = FIND(y)
  
  if root_x == root_y:
    return                 // Already in same set
  
  // Attach smaller rank tree under larger rank tree
  if rank[root_x] < rank[root_y]:
    parent[root_x] = root_y
  else if rank[root_x] > rank[root_y]:
    parent[root_y] = root_x
  else:                    // Equal ranks
    parent[root_y] = root_x
    rank[root_x] += 1      // Increase rank of new root`}</code>
        </pre>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-semibold mb-2 text-yellow-900">Kruskal's MST Algorithm</h4>
          <pre className="bg-white text-gray-900 rounded p-3 text-xs overflow-auto border border-yellow-200 font-mono">
            <code>{`// Find Minimum Spanning Tree
edges.sort() // By weight (ascending)

for each edge (u, v, weight):
  if FIND(u) != FIND(v):
    add edge to MST
    UNION(u, v)

return MST  // V-1 edges`}</code>
          </pre>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold mb-2 text-blue-900">Cycle Detection</h4>
          <pre className="bg-white text-gray-900 rounded p-3 text-xs overflow-auto border border-blue-200 font-mono">
            <code>{`// Detect if graph has cycle
has_cycle = false

for each edge (u, v):
  if FIND(u) == FIND(v):
    has_cycle = true
    break
  else:
    UNION(u, v)

return has_cycle`}</code>
          </pre>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold mb-2 text-green-900">Connected Components</h4>
          <pre className="bg-white text-gray-900 rounded p-3 text-xs overflow-auto border border-green-200 font-mono">
            <code>{`// Count connected components
component_count = 0
seen_roots = empty set

for each vertex v:
  root = FIND(v)
  if root not in seen_roots:
    component_count += 1
    seen_roots.add(root)

return component_count`}</code>
          </pre>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">
            Union-Find / Disjoint Set Visualizer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore union-by-rank and path compression optimizations that make Union-Find nearly constant time.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 rounded-lg p-3 shadow-lg mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'visualizer', label: 'Visualizer', icon: Network },
              { id: 'theory', label: 'Theory', icon: BookOpen },
              { id: 'pseudocode', label: 'Pseudocode', icon: Code }
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    tab === t.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <Icon size={18} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        {tab === 'visualizer' && (
          <div className="bg-white/80 rounded-lg p-6 shadow-lg mb-6 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={runAlgorithm}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
              >
                Generate Ops
              </button>
              <button
                onClick={toggleAnimation}
                disabled={steps.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors font-medium"
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} />}
                {isRunning ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={stepForward}
                disabled={currentStep >= steps.length - 1 || steps.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors font-medium"
              >
                <StepForward size={18} /> Step
              </button>
              <button
                onClick={resetAnimation}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <RotateCcw size={18} /> Reset
              </button>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm font-medium">Size:</span>
                <select
                  value={n}
                  onChange={(e) => setN(parseInt(e.target.value))}
                  className="p-2 border rounded-lg text-sm"
                >
                  {[4,6,8,10,12].map(size => <option key={size} value={size}>{size}</option>)}
                </select>
                <span className="text-sm font-medium">Speed:</span>
                <select
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                  className="p-2 border rounded-lg text-sm"
                >
                  <option value={1500}>Slow</option>
                  <option value={900}>Normal</option>
                  <option value={300}>Fast</option>
                </select>
              </div>
            </div>

            {steps.length > 0 && (
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Step {currentStep + 1} of {steps.length}</span>
                  <span className="font-semibold">{steps[currentStep]?.type || 'Not Started'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        {tab === 'visualizer' && renderVisualizer()}
        {tab === 'theory' && <div className="mt-6"><TheorySection /></div>}
        {tab === 'pseudocode' && <div className="mt-6"><PseudocodeSection /></div>}

        {/* Step Information */}
        {tab === 'visualizer' && steps[currentStep] && (
          <div className="bg-white/90 rounded-lg p-6 shadow-lg mt-6 border-l-4 border-indigo-500">
            <h3 className="text-lg font-semibold mb-2">Current Step:</h3>
            <p className="text-gray-700 text-lg">{steps[currentStep].message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UnionFind;