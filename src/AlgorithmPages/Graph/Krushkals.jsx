import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, GitBranch } from 'lucide-react';

function Kruskals() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  const DEFAULT_NODES = [
    { id: 0, label: 'A', x: 80, y: 100 },
    { id: 1, label: 'B', x: 250, y: 60 },
    { id: 2, label: 'C', x: 420, y: 100 },
    { id: 3, label: 'D', x: 150, y: 250 },
    { id: 4, label: 'E', x: 350, y: 280 }
  ];

  const DEFAULT_EDGES = [
    { id: 0, from: 0, to: 1, weight: 4 },
    { id: 1, from: 0, to: 3, weight: 2 },
    { id: 2, from: 1, to: 2, weight: 5 },
    { id: 3, from: 1, to: 3, weight: 1 },
    { id: 4, from: 2, to: 4, weight: 2 },
    { id: 5, from: 3, to: 4, weight: 8 },
    { id: 6, from: 3, to: 2, weight: 6 }
  ];

  const [nodes, setNodes] = useState(DEFAULT_NODES);
  const [edges, setEdges] = useState(DEFAULT_EDGES);
  const [nodesInput, setNodesInput] = useState('A, B, C, D, E');
  const [edgesInput, setEdgesInput] = useState('A-B:4, A-D:2, B-C:5, B-D:1, C-E:2, D-E:8, D-C:6');
  const [errorMessage, setErrorMessage] = useState('');

  const [mstEdges, setMSTEdges] = useState([]);
  const [currentEdge, setCurrentEdge] = useState(null);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [edgesInMST, setEdgesInMST] = useState(new Set());
  const [rejectedEdges, setRejectedEdges] = useState(new Set());

  // Preset examples
  const examples = [
    { name: 'Default', nodes: 'A, B, C, D, E', edges: 'A-B:4, A-D:2, B-C:5, B-D:1, C-E:2, D-E:8, D-C:6' },
    { name: 'Simple', nodes: 'A, B, C, D', edges: 'A-B:1, A-C:4, B-C:2, B-D:5, C-D:1' },
    { name: 'Complex', nodes: 'A, B, C, D, E, F', edges: 'A-B:2, A-C:4, B-C:1, B-D:7, C-E:3, D-E:2, D-F:1, E-F:5' }
  ];

  const loadExample = (exampleName) => {
    const example = examples.find(ex => ex.name === exampleName);
    if (example) {
      setNodesInput(example.nodes);
      setEdgesInput(example.edges);
      parseCustomGraph(example.nodes, example.edges);
    }
  };

  const parseCustomGraph = (nodesStr, edgesStr) => {
    try {
      setErrorMessage('');
      
      // Parse nodes
      const nodeLabels = nodesStr.split(',').map(n => n.trim()).filter(n => n.length > 0);
      if (nodeLabels.length === 0) {
        setErrorMessage('Please enter at least one node.');
        return false;
      }
      if (nodeLabels.length > 12) {
        setErrorMessage('Maximum 12 nodes allowed for optimal visualization.');
        return false;
      }

      // Check for duplicate nodes
      const uniqueNodes = new Set(nodeLabels);
      if (uniqueNodes.size !== nodeLabels.length) {
        setErrorMessage('Duplicate node labels found.');
        return false;
      }

      // Create node objects with grid positioning
      const cols = Math.ceil(Math.sqrt(nodeLabels.length));
      const spacingX = 150;
      const spacingY = 120;
      const offsetX = 80;
      const offsetY = 80;
      
      const newNodes = nodeLabels.map((label, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        return {
          id: index,
          label: label,
          x: offsetX + col * spacingX,
          y: offsetY + row * spacingY
        };
      });

      // Parse edges
      const newEdges = [];
      if (edgesStr.trim().length > 0) {
        const edgePairs = edgesStr.split(',').map(e => e.trim()).filter(e => e.length > 0);
        
        for (let i = 0; i < edgePairs.length; i++) {
          const parts = edgePairs[i].split(':');
          if (parts.length !== 2) {
            setErrorMessage(`Invalid edge format: "${edgePairs[i]}". Use format: A-B:weight`);
            return false;
          }
          
          const [connection, weightStr] = parts;
          const weight = parseInt(weightStr);
          
          if (isNaN(weight) || weight <= 0) {
            setErrorMessage(`Invalid weight in edge "${edgePairs[i]}". Weight must be a positive number.`);
            return false;
          }

          const nodeParts = connection.split('-').map(p => p.trim());
          if (nodeParts.length !== 2) {
            setErrorMessage(`Invalid edge format: "${edgePairs[i]}". Use format: A-B:weight`);
            return false;
          }

          const [from, to] = nodeParts;
          const fromIdx = nodeLabels.indexOf(from);
          const toIdx = nodeLabels.indexOf(to);

          if (fromIdx === -1) {
            setErrorMessage(`Node "${from}" in edge "${edgePairs[i]}" does not exist.`);
            return false;
          }
          if (toIdx === -1) {
            setErrorMessage(`Node "${to}" in edge "${edgePairs[i]}" does not exist.`);
            return false;
          }

          newEdges.push({
            id: i,
            from: fromIdx,
            to: toIdx,
            weight: weight
          });
        }
      }

      // Update state
      setNodes(newNodes);
      setEdges(newEdges);
      setErrorMessage('');
      return true;
    } catch (error) {
      setErrorMessage(`Error parsing graph: ${error.message}`);
      return false;
    }
  };

  const applyCustomGraph = () => {
    parseCustomGraph(nodesInput, edgesInput);
  };

  const generateRandomGraph = () => {
    const nodeCount = 4 + Math.floor(Math.random() * 4); // 4-7 nodes
    const labels = [];
    for (let i = 0; i < nodeCount; i++) {
      labels.push(String.fromCharCode(65 + i));
    }

    // Create random edges with random weights
    const edges = [];
    const edgeCount = nodeCount + Math.floor(Math.random() * nodeCount); // nodeCount to 2*nodeCount edges
    
    for (let i = 0; i < edgeCount; i++) {
      const from = Math.floor(Math.random() * nodeCount);
      let to = Math.floor(Math.random() * nodeCount);
      
      // Avoid self-loops
      while (to === from) {
        to = Math.floor(Math.random() * nodeCount);
      }
      
      const weight = 1 + Math.floor(Math.random() * 9); // 1-9
      edges.push(`${labels[from]}-${labels[to]}:${weight}`);
    }

    setNodesInput(labels.join(', '));
    setEdgesInput(edges.join(', '));
    parseCustomGraph(labels.join(', '), edges.join(', '));
  };

  const resetToDefault = () => {
    setNodesInput('A, B, C, D, E');
    setEdgesInput('A-B:4, A-D:2, B-C:5, B-D:1, C-E:2, D-E:8, D-C:6');
    setNodes(DEFAULT_NODES);
    setEdges(DEFAULT_EDGES);
    setErrorMessage('');
  };

  // Union-Find (Disjoint Set Union) implementation
  class UnionFind {
    constructor(n) {
      this.parent = Array(n).fill(0).map((_, i) => i);
      this.rank = Array(n).fill(0);
    }

    find(x) {
      if (this.parent[x] !== x) {
        this.parent[x] = this.find(this.parent[x]);
      }
      return this.parent[x];
    }

    union(x, y) {
      const px = this.find(x);
      const py = this.find(y);

      if (px === py) return false;

      if (this.rank[px] < this.rank[py]) {
        this.parent[px] = py;
      } else if (this.rank[px] > this.rank[py]) {
        this.parent[py] = px;
      } else {
        this.parent[py] = px;
        this.rank[px]++;
      }
      return true;
    }
  }

  const kruskalsAlgorithm = useCallback(() => {
    const steps = [];
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    const uf = new UnionFind(nodes.length);
    const mst = [];
    const visitedNodesSet = new Set();
    const addedEdges = new Set();
    const rejectedEdgesSet = new Set();

    steps.push({
      type: 'initialize',
      message: 'Initialize: Create disjoint sets for each vertex. Sort edges by weight.',
      mstEdges: [],
      visitedNodes: Array.from(nodes.map(n => n.id)),
      currentEdge: null,
      edgesInMST: new Set(),
      rejectedEdges: new Set(),
      sortedEdges: sortedEdges
    });

    sortedEdges.forEach((edge, idx) => {
      steps.push({
        type: 'examine',
        message: `Examine edge ${nodes[edge.from].label}-${nodes[edge.to].label} (weight: ${edge.weight})`,
        mstEdges: [...mst],
        visitedNodes: Array.from(visitedNodesSet),
        currentEdge: edge,
        edgesInMST: new Set(addedEdges),
        rejectedEdges: new Set(rejectedEdgesSet),
        sortedEdges: sortedEdges,
        sortedIndex: idx
      });

      const canUnion = uf.find(edge.from) !== uf.find(edge.to);

      if (canUnion) {
        uf.union(edge.from, edge.to);
        mst.push(edge);
        addedEdges.add(edge.id);
        visitedNodesSet.add(edge.from);
        visitedNodesSet.add(edge.to);

        steps.push({
          type: 'add',
          message: `Added edge ${nodes[edge.from].label}-${nodes[edge.to].label} (weight: ${edge.weight}) to MST. Sets merged.`,
          mstEdges: [...mst],
          visitedNodes: Array.from(visitedNodesSet),
          currentEdge: edge,
          edgesInMST: new Set(addedEdges),
          rejectedEdges: new Set(rejectedEdgesSet),
          sortedEdges: sortedEdges,
          sortedIndex: idx
        });
      } else {
        rejectedEdgesSet.add(edge.id);

        steps.push({
          type: 'reject',
          message: `Rejected edge ${nodes[edge.from].label}-${nodes[edge.to].label} (weight: ${edge.weight}). Vertices already connected.`,
          mstEdges: [...mst],
          visitedNodes: Array.from(visitedNodesSet),
          currentEdge: edge,
          edgesInMST: new Set(addedEdges),
          rejectedEdges: new Set(rejectedEdgesSet),
          sortedEdges: sortedEdges,
          sortedIndex: idx
        });
      }
    });

    const totalWeight = mst.reduce((sum, e) => sum + e.weight, 0);

    steps.push({
      type: 'complete',
      message: `MST Complete! Total weight: ${totalWeight}. Edges in MST: ${mst.length}`,
      mstEdges: [...mst],
      visitedNodes: Array.from(nodes.map(n => n.id)),
      currentEdge: null,
      edgesInMST: new Set(addedEdges),
      rejectedEdges: new Set(rejectedEdgesSet),
      sortedEdges: sortedEdges,
      totalWeight
    });

    return steps;
  }, [nodes, edges]);

  const runAlgorithm = () => {
    const algorithmSteps = kruskalsAlgorithm();
    setSteps(algorithmSteps);
    setCurrentStep(0);
  };

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  const resetAnimation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    runAlgorithm();
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  useEffect(() => {
    runAlgorithm();
  }, [kruskalsAlgorithm]);

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
      setMSTEdges(step.mstEdges || []);
      setVisitedNodes(step.visitedNodes || []);
      setCurrentEdge(step.currentEdge || null);
      setEdgesInMST(step.edgesInMST || new Set());
      setRejectedEdges(step.rejectedEdges || new Set());
    }
  }, [currentStep, steps]);

  const renderGraph = () => (
    <div className="space-y-6">
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <GitBranch className="text-blue-600" size={28} />
          Graph Visualization
        </h3>

        <svg width="100%" height="450" className="border-2 border-gray-300 rounded-lg bg-gray-50">
          {/* Draw edges */}
          {edges.map((edge) => {
            const fromNode = nodes[edge.from];
            const toNode = nodes[edge.to];
            const isCurrent = currentEdge && currentEdge.id === edge.id;
            const isInMST = edgesInMST.has(edge.id);
            const isRejected = rejectedEdges.has(edge.id);

            let strokeColor = '#D1D5DB';
            let strokeWidth = 2;

            if (isCurrent) {
              strokeColor = '#FBBF24';
              strokeWidth = 4;
            } else if (isInMST) {
              strokeColor = '#10B981';
              strokeWidth = 3;
            } else if (isRejected) {
              strokeColor = '#EF4444';
              strokeWidth = 2;
            }

            return (
              <g key={`edge-${edge.id}`}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  className={isCurrent ? 'animate-pulse' : ''}
                />
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2 - 10}
                  textAnchor="middle"
                  className="text-sm font-bold fill-gray-700 pointer-events-none"
                  fontSize="14"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Draw nodes */}
          {nodes.map((node) => {
            const isVisited = visitedNodes.includes(node.id);

            return (
              <g key={`node-${node.id}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={28}
                  fill={isVisited ? '#10B981' : '#E5E7EB'}
                  stroke={isVisited ? '#059669' : '#9CA3AF'}
                  strokeWidth="3"
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dy="0.3em"
                  className="text-lg font-bold pointer-events-none select-none"
                  fill={isVisited ? 'white' : 'black'}
                  fontSize="18"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded p-4 border-l-4 border-green-500">
            <div className="text-sm font-medium text-gray-600">MST Edges</div>
            <div className="text-2xl font-bold text-green-600">{mstEdges.length}</div>
          </div>
          <div className="bg-red-50 rounded p-4 border-l-4 border-red-500">
            <div className="text-sm font-medium text-gray-600">Rejected</div>
            <div className="text-2xl font-bold text-red-600">{rejectedEdges.size}</div>
          </div>
          <div className="bg-purple-50 rounded p-4 border-l-4 border-purple-500">
            <div className="text-sm font-medium text-gray-600">Total Weight</div>
            <div className="text-2xl font-bold text-purple-600">
              {mstEdges.reduce((sum, e) => sum + e.weight, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* MST Edges Table */}
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h4 className="text-lg font-semibold mb-4">Minimum Spanning Tree Edges</h4>
        {mstEdges.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-green-100 to-emerald-100 border-b-2">
                  <th className="px-4 py-3 text-left font-semibold">From</th>
                  <th className="px-4 py-3 text-left font-semibold">To</th>
                  <th className="px-4 py-3 text-left font-semibold">Weight</th>
                </tr>
              </thead>
              <tbody>
                {mstEdges.map((edge, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{nodes[edge.from].label}</td>
                    <td className="px-4 py-3 font-semibold">{nodes[edge.to].label}</td>
                    <td className="px-4 py-3">{edge.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic">No edges selected yet</p>
        )}
      </div>

      {/* Sorted Edges Table */}
      {steps[currentStep]?.sortedEdges && (
        <div className="bg-white/90 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold mb-4">Edges (Sorted by Weight)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-100 to-indigo-100 border-b-2">
                  <th className="px-4 py-3 text-left font-semibold">From</th>
                  <th className="px-4 py-3 text-left font-semibold">To</th>
                  <th className="px-4 py-3 text-left font-semibold">Weight</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {steps[currentStep].sortedEdges.map((edge, idx) => {
                  const isInMST = edgesInMST.has(edge.id);
                  const isRejected = rejectedEdges.has(edge.id);
                  const isCurrent = currentEdge && currentEdge.id === edge.id;
                  const bgColor = isCurrent ? 'bg-yellow-100' : isInMST ? 'bg-green-50' : isRejected ? 'bg-red-50' : 'bg-white';
                  const statusText = isCurrent ? '⏳ Examining' : isInMST ? '✓ Added' : isRejected ? '✗ Rejected' : '-';

                  return (
                    <tr key={idx} className={`border-b hover:opacity-75 ${bgColor}`}>
                      <td className="px-4 py-3 font-semibold">{nodes[edge.from].label}</td>
                      <td className="px-4 py-3 font-semibold">{nodes[edge.to].label}</td>
                      <td className="px-4 py-3">{edge.weight}</td>
                      <td className="px-4 py-3 font-semibold">{statusText}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const TheorySection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Kruskal's Algorithm Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">Overview</h3>
          <p className="text-gray-700">
            Kruskal's algorithm is a greedy algorithm that finds a Minimum Spanning Tree (MST) for a weighted undirected graph. Unlike Prim's algorithm, it works by sorting all edges by weight and adding them to the MST if they don't form a cycle.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700">Key Characteristics</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>Greedy algorithm</li>
              <li>Works on weighted graphs</li>
              <li>Finds minimum spanning tree</li>
              <li>Uses Union-Find (DSU)</li>
              <li>Time: O(E log E)</li>
              <li>Space: O(V)</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700">Applications</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>Network design</li>
              <li>Cluster analysis</li>
              <li>Maze generation</li>
              <li>Circuit design</li>
              <li>Handwriting recognition</li>
              <li>Transportation networks</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">How It Works</h4>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>Sort all edges by weight in ascending order</li>
            <li>Initialize a disjoint set for each vertex</li>
            <li>For each edge in sorted order:</li>
            <li className="ml-4">If the edge connects two vertices in different sets, add it to MST</li>
            <li className="ml-4">Union the two sets</li>
            <li>Repeat until MST has V-1 edges</li>
          </ol>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Union-Find (Disjoint Set Union)</h4>
          <p className="text-gray-700 text-sm mb-2">
            A data structure that efficiently manages disjoint sets and performs two operations:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
            <li><span className="font-semibold">Find:</span> Determine which set an element belongs to</li>
            <li><span className="font-semibold">Union:</span> Merge two sets containing different elements</li>
            <li>Both operations are nearly O(1) with path compression</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
        Pseudocode
      </h2>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-semibold mb-3 text-lg">Kruskal's Algorithm</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-auto text-sm font-mono leading-relaxed">
            <code>{`KRUSKAL(Graph G, Weight w):
  MST = empty set
  
  // Sort edges by weight
  edges = sort(G.edges) by w ascending
  
  // Initialize Union-Find
  for each vertex v in G.vertices:
    MAKE-SET(v)
  
  // Process edges in sorted order
  for each edge (u, v) in edges:
    if FIND(u) != FIND(v):        // Different sets
      add (u, v) to MST
      UNION(u, v)                 // Merge sets
      
      if |MST| == |G.vertices| - 1:
        break
  
  return MST

// Union-Find Operations:
MAKE-SET(x):
  parent[x] = x
  rank[x] = 0

FIND(x):
  if parent[x] != x:
    parent[x] = FIND(parent[x])   // Path compression
  return parent[x]

UNION(x, y):
  x_root = FIND(x)
  y_root = FIND(y)
  
  if rank[x_root] < rank[y_root]:
    parent[x_root] = y_root
  else if rank[x_root] > rank[y_root]:
    parent[y_root] = x_root
  else:
    parent[y_root] = x_root
    rank[x_root] += 1`}</code>
          </pre>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-semibold mb-2 text-yellow-900">Complexity Analysis</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold">Time Complexity</p>
              <p className="text-gray-600">O(E log E)</p>
              <p className="text-xs mt-1">Dominated by sorting edges</p>
            </div>
            <div>
              <p className="font-semibold">Space Complexity</p>
              <p className="text-gray-600">O(V + E)</p>
              <p className="text-xs mt-1">For edges and Union-Find structure</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold mb-2 text-blue-900">Cycle Detection</h4>
          <p className="text-sm text-gray-700">
            An edge (u, v) creates a cycle if u and v are already in the same connected component. Union-Find efficiently checks this with Find operation.
          </p>
        </div>

        <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
          <h4 className="font-semibold mb-2 text-pink-900">Comparison with Prim's Algorithm</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <p><span className="font-semibold">Kruskal:</span> Sorts edges, uses Union-Find, O(E log E)</p>
            <p><span className="font-semibold">Prim:</span> Expands tree, uses priority queue, O((V+E) log V)</p>
            <p><span className="font-semibold">Both find same MST weight, different approach</span></p>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold mb-2 text-green-900">Greedy Choice Property</h4>
          <p className="text-sm text-gray-700">
            Kruskal's greedy choice to always pick the minimum weight edge that doesn't form a cycle is guaranteed to produce an MST. This works because of the Cut Property in graph theory.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
            Kruskal's Algorithm Visualizer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Visualize how Kruskal's algorithm finds the Minimum Spanning Tree by sorting edges and using Union-Find to detect cycles.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 rounded-lg p-3 shadow-lg mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'visualizer', label: 'Visualizer', icon: GitBranch },
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
                      ? 'bg-blue-600 text-white border-blue-600'
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
          <div className="bg-white/80 rounded-lg p-6 shadow-lg mb-6">
            {/* Custom Graph Input */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <h4 className="font-semibold mb-3">Custom Graph Input</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Nodes (comma-separated, max 12):</label>
                  <input
                    type="text"
                    value={nodesInput}
                    onChange={(e) => setNodesInput(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="e.g., A, B, C, D"
                    disabled={isRunning}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Edges (format: A-B:weight, comma-separated):</label>
                  <input
                    type="text"
                    value={edgesInput}
                    onChange={(e) => setEdgesInput(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="e.g., A-B:4, B-C:2, C-D:3"
                    disabled={isRunning}
                  />
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                    <p className="text-red-700 text-sm">⚠️ {errorMessage}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={applyCustomGraph}
                    disabled={isRunning}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    Apply Custom Graph
                  </button>
                  <button
                    onClick={generateRandomGraph}
                    disabled={isRunning}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    🎲 Generate Random
                  </button>
                  <button
                    onClick={resetToDefault}
                    disabled={isRunning}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    Reset to Default
                  </button>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Quick Examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {examples.map(example => (
                      <button
                        key={example.name}
                        onClick={() => loadExample(example.name)}
                        disabled={isRunning}
                        className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 font-medium"
                      >
                        {example.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-800 text-sm mb-1">💡 Tips:</p>
                  <ul className="text-blue-700 text-xs space-y-1 ml-4">
                    <li>• Nodes: Single letters or numbers, comma-separated</li>
                    <li>• Edges: Format A-B:weight (undirected edges)</li>
                    <li>• Weights must be positive for MST calculation</li>
                    <li>• Max 12 nodes for optimal visualization</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Animation Controls */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <button
                onClick={toggleAnimation}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} />}
                {isRunning ? 'Pause' : 'Play'}
              </button>

              <button
                onClick={stepForward}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
                disabled={currentStep >= steps.length - 1}
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
                <span className="text-sm font-medium">Speed:</span>
                <select
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                  className="p-2 border rounded-lg text-sm"
                >
                  <option value={2000}>Slow</option>
                  <option value={1000}>Normal</option>
                  <option value={500}>Fast</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span className="font-semibold">{steps[currentStep]?.type || 'Not Started'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {tab === 'visualizer' && renderGraph()}
        {tab === 'theory' && <div className="mt-6"><TheorySection /></div>}
        {tab === 'pseudocode' && <div className="mt-6"><PseudocodeSection /></div>}

        {/* Step Information */}
        {tab === 'visualizer' && steps[currentStep] && (
          <div className="bg-white/90 rounded-lg p-6 shadow-lg mt-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-2">Current Step:</h3>
            <p className="text-gray-700 text-lg">{steps[currentStep].message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Kruskals;