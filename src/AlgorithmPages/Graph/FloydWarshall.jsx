import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, Grid3x3 } from 'lucide-react';

function FloydWarshall() {
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
    { from: 0, to: 1, weight: 4 },
    { from: 0, to: 3, weight: 2 },
    { from: 1, to: 2, weight: 5 },
    { from: 1, to: 3, weight: 1 },
    { from: 2, to: 4, weight: 2 },
    { from: 3, to: 4, weight: 8 },
    { from: 3, to: 2, weight: 6 },
    { from: 4, to: 1, weight: 3 }
  ];

  const [nodes, setNodes] = useState(DEFAULT_NODES);
  const [edges, setEdges] = useState(DEFAULT_EDGES);
  const [nodesInput, setNodesInput] = useState('A, B, C, D, E');
  const [edgesInput, setEdgesInput] = useState('A-B:4, A-D:2, B-C:5, B-D:1, C-E:2, D-E:8, D-C:6, E-B:3');
  const [errorMessage, setErrorMessage] = useState('');

  const [distMatrix, setDistMatrix] = useState({});
  const [currentK, setCurrentK] = useState(-1);
  const [currentI, setCurrentI] = useState(-1);
  const [currentJ, setCurrentJ] = useState(-1);
  const [highlightedEdge, setHighlightedEdge] = useState(null);
  const [updated, setUpdated] = useState(false);

  // Preset examples
  const examples = [
    { name: 'Default', nodes: 'A, B, C, D, E', edges: 'A-B:4, A-D:2, B-C:5, B-D:1, C-E:2, D-E:8, D-C:6, E-B:3' },
    { name: 'Simple', nodes: 'A, B, C, D', edges: 'A-B:3, A-C:8, B-C:2, B-D:5, C-D:1' },
    { name: 'Small', nodes: 'A, B, C', edges: 'A-B:4, B-C:3, A-C:10' }
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
      if (nodeLabels.length > 8) {
        setErrorMessage('Maximum 8 nodes allowed for optimal visualization (Floyd-Warshall has O(V³) complexity).');
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
          
          if (isNaN(weight)) {
            setErrorMessage(`Invalid weight in edge "${edgePairs[i]}". Weight must be a number.`);
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
    const nodeCount = 3 + Math.floor(Math.random() * 3); // 3-5 nodes (smaller for Floyd-Warshall)
    const labels = [];
    for (let i = 0; i < nodeCount; i++) {
      labels.push(String.fromCharCode(65 + i));
    }

    // Create random edges with random weights
    const edges = [];
    const edgeCount = nodeCount + Math.floor(Math.random() * (nodeCount + 1)); // moderate number of edges
    
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
    setEdgesInput('A-B:4, A-D:2, B-C:5, B-D:1, C-E:2, D-E:8, D-C:6, E-B:3');
    setNodes(DEFAULT_NODES);
    setEdges(DEFAULT_EDGES);
    setErrorMessage('');
  };

  const initializeMatrix = useCallback(() => {
    const matrix = {};
    const n = nodes.length;

    // Initialize with infinity
    for (let i = 0; i < n; i++) {
      matrix[i] = {};
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 0;
        } else {
          matrix[i][j] = Infinity;
        }
      }
    }

    // Add direct edges
    for (let edge of edges) {
      matrix[edge.from][edge.to] = edge.weight;
    }

    return matrix;
  }, [nodes, edges]);

  const floydWarshallAlgorithm = useCallback(() => {
    const steps = [];
    const matrix = initializeMatrix();
    const n = nodes.length;

    steps.push({
      type: 'initialize',
      message: 'Initialize distance matrix with direct edges and infinity for non-connected vertices',
      matrix: JSON.parse(JSON.stringify(matrix)),
      k: -1,
      i: -1,
      j: -1,
      highlightedEdge: null,
      updated: false
    });

    // Floyd-Warshall main algorithm
    for (let k = 0; k < n; k++) {
      steps.push({
        type: 'k_start',
        message: `Iteration k=${k}: Using ${nodes[k].label} as intermediate vertex`,
        matrix: JSON.parse(JSON.stringify(matrix)),
        k: k,
        i: -1,
        j: -1,
        highlightedEdge: null,
        updated: false
      });

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const oldDist = matrix[i][j];
          const newDist = matrix[i][k] + matrix[k][j];

          steps.push({
            type: 'check',
            message: `Check path: dist[${nodes[i].label}][${nodes[j].label}] vs dist[${nodes[i].label}][${nodes[k].label}] + dist[${nodes[k].label}][${nodes[j].label}] = ${matrix[i][k]} + ${matrix[k][j]}`,
            matrix: JSON.parse(JSON.stringify(matrix)),
            k: k,
            i: i,
            j: j,
            highlightedEdge: null,
            updated: false
          });

          if (newDist < oldDist) {
            matrix[i][j] = newDist;

            steps.push({
              type: 'update',
              message: `Updated: dist[${nodes[i].label}][${nodes[j].label}] = ${newDist} (was ${oldDist === Infinity ? '∞' : oldDist})`,
              matrix: JSON.parse(JSON.stringify(matrix)),
              k: k,
              i: i,
              j: j,
              highlightedEdge: null,
              updated: true
            });
          }
        }
      }

      steps.push({
        type: 'k_complete',
        message: `Completed iteration k=${k}. All shortest paths using ${nodes[k].label} as intermediate found.`,
        matrix: JSON.parse(JSON.stringify(matrix)),
        k: k,
        i: -1,
        j: -1,
        highlightedEdge: null,
        updated: false
      });
    }

    steps.push({
      type: 'complete',
      message: 'Algorithm Complete! All-pairs shortest paths computed.',
      matrix: JSON.parse(JSON.stringify(matrix)),
      k: -1,
      i: -1,
      j: -1,
      highlightedEdge: null,
      updated: false
    });

    return steps;
  }, [nodes, edges, initializeMatrix]);

  const runAlgorithm = () => {
    const algorithmSteps = floydWarshallAlgorithm();
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
  }, [floydWarshallAlgorithm]);

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
      setDistMatrix(step.matrix || {});
      setCurrentK(step.k || -1);
      setCurrentI(step.i || -1);
      setCurrentJ(step.j || -1);
      setUpdated(step.updated || false);
    }
  }, [currentStep, steps]);

  const renderGraph = () => (
    <div className="space-y-6">
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Grid3x3 className="text-blue-600" size={28} />
          Graph Visualization
        </h3>

        <svg width="100%" height="450" className="border-2 border-gray-300 rounded-lg bg-gray-50">
          {/* Draw edges */}
          {edges.map((edge, idx) => {
            const fromNode = nodes[edge.from];
            const toNode = nodes[edge.to];

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#D1D5DB"
                  strokeWidth="2"
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
            const isK = currentK === node.id;
            let fillColor = '#E5E7EB';
            let strokeColor = '#9CA3AF';

            if (isK) {
              fillColor = '#8B5CF6';
              strokeColor = '#6D28D9';
            }

            return (
              <g key={`node-${node.id}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={28}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="3"
                  className={isK ? 'animate-pulse' : ''}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dy="0.3em"
                  className="text-lg font-bold pointer-events-none select-none"
                  fill={isK ? 'white' : 'black'}
                  fontSize="18"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-purple-50 rounded p-4 border-l-4 border-purple-500">
            <div className="text-sm font-medium text-gray-600">Intermediate Vertex (k)</div>
            <div className="text-2xl font-bold text-purple-600">{currentK >= 0 ? nodes[currentK].label : '-'}</div>
          </div>
          <div className="bg-blue-50 rounded p-4 border-l-4 border-blue-500">
            <div className="text-sm font-medium text-gray-600">From (i)</div>
            <div className="text-2xl font-bold text-blue-600">{currentI >= 0 ? nodes[currentI].label : '-'}</div>
          </div>
          <div className="bg-green-50 rounded p-4 border-l-4 border-green-500">
            <div className="text-sm font-medium text-gray-600">To (j)</div>
            <div className="text-2xl font-bold text-green-600">{currentJ >= 0 ? nodes[currentJ].label : '-'}</div>
          </div>
        </div>
      </div>

      {/* Distance Matrix */}
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h4 className="text-lg font-semibold mb-4">Distance Matrix</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 to-purple-100">
                <th className="px-4 py-3 text-center font-semibold border border-gray-300">From/To</th>
                {nodes.map(n => (
                  <th key={n.id} className="px-4 py-3 text-center font-semibold border border-gray-300">{n.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nodes.map(fromNode => (
                <tr key={`row-${fromNode.id}`}>
                  <td className="px-4 py-3 text-center font-semibold border border-gray-300 bg-gray-50">{fromNode.label}</td>
                  {nodes.map(toNode => {
                    const value = distMatrix[fromNode.id]?.[toNode.id];
                    const isHighlighted = currentI === fromNode.id && currentJ === toNode.id;
                    const bgColor = isHighlighted 
                      ? updated ? 'bg-green-200' : 'bg-yellow-200'
                      : 'bg-white';

                    return (
                      <td 
                        key={`cell-${fromNode.id}-${toNode.id}`}
                        className={`px-4 py-3 text-center font-mono font-bold border border-gray-300 ${bgColor}`}
                      >
                        {value === Infinity ? '∞' : value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const TheorySection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Floyd-Warshall Algorithm Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">Overview</h3>
          <p className="text-gray-700">
            Floyd-Warshall is a dynamic programming algorithm that solves the all-pairs shortest path problem. It computes the shortest paths between all pairs of vertices in a weighted graph, including graphs with negative edge weights (but no negative cycles).
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700">Key Characteristics</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>All-pairs shortest paths</li>
              <li>Dynamic programming approach</li>
              <li>Handles negative weights</li>
              <li>Cannot handle negative cycles</li>
              <li>Time: O(V³)</li>
              <li>Space: O(V²)</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700">Applications</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>Network routing optimization</li>
              <li>Transitive closure</li>
              <li>Invitation delivery networks</li>
              <li>Game theory</li>
              <li>Robot motion planning</li>
              <li>Distance metrics</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Dynamic Programming Approach</h4>
          <p className="text-gray-700 text-sm mb-3">
            Floyd-Warshall uses the recurrence relation to compute shortest paths by considering intermediate vertices:
          </p>
          <p className="font-mono font-semibold text-gray-800 text-center bg-white p-3 rounded border border-purple-200">
            dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">How It Works (Three Nested Loops)</h4>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700 text-sm">
            <li><span className="font-semibold">k loop:</span> Consider each vertex k as an intermediate vertex</li>
            <li><span className="font-semibold">i loop:</span> For each source vertex i</li>
            <li><span className="font-semibold">j loop:</span> For each destination vertex j, check if path through k is shorter</li>
            <li>Update dist[i][j] if shorter path is found through intermediate vertex k</li>
          </ol>
        </div>

        <div className="bg-blue-100 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-blue-900">Why All-Pairs?</h4>
          <p className="text-gray-700 text-sm">
            Unlike Dijkstra (single-source) or Bellman-Ford (single-source), Floyd-Warshall computes shortest paths for ALL pairs simultaneously. This makes it ideal when you need a complete distance matrix.
          </p>
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
          <h4 className="font-semibold mb-3 text-lg">Floyd-Warshall Algorithm</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-auto text-sm font-mono leading-relaxed">
            <code>{`FLOYD-WARSHALL(G, w):
  n = |G.vertices|
  
  // Initialize distance matrix
  for i = 1 to n:
    for j = 1 to n:
      if i == j:
        dist[i][j] = 0
      else if (i,j) in G.edges:
        dist[i][j] = w(i, j)
      else:
        dist[i][j] = INFINITY
  
  // Three nested loops - k, i, j
  for k = 1 to n:               // Intermediate vertex
    for i = 1 to n:             // Source vertex
      for j = 1 to n:           // Destination vertex
        dist[i][j] = min(dist[i][j],
                         dist[i][k] + dist[k][j])
  
  return dist`}</code>
          </pre>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-semibold mb-2 text-yellow-900">Complexity Analysis</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold">Time Complexity</p>
              <p className="text-gray-600">O(V³)</p>
              <p className="text-xs mt-1">Three nested loops over V vertices</p>
            </div>
            <div>
              <p className="font-semibold">Space Complexity</p>
              <p className="text-gray-600">O(V²)</p>
              <p className="text-xs mt-1">Distance matrix storage</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold mb-2 text-blue-900">Key Insight</h4>
          <p className="text-sm text-gray-700">
            The k loop must be the outermost loop. This ensures that by the time we consider vertex k, we've already computed shortest paths using vertices 0 to k-1 as intermediates.
          </p>
        </div>

        <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
          <h4 className="font-semibold mb-2 text-pink-900">Algorithm Evolution</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <p><span className="font-semibold">After k=0:</span> Shortest paths using vertex 0 as intermediate</p>
            <p><span className="font-semibold">After k=1:</span> Shortest paths using vertices 0,1 as intermediates</p>
            <p><span className="font-semibold">After k=n-1:</span> All-pairs shortest paths computed</p>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold mb-2 text-green-900">Comparison with Other Algorithms</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <p><span className="font-semibold">Floyd-Warshall:</span> All-pairs, O(V³), handles negative weights</p>
            <p><span className="font-semibold">Dijkstra:</span> Single-source, O((V+E)log V), non-negative only</p>
            <p><span className="font-semibold">Bellman-Ford:</span> Single-source, O(V×E), handles negative weights</p>
          </div>
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
            Floyd-Warshall Algorithm Visualizer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Visualize how Floyd-Warshall computes all-pairs shortest paths using dynamic programming.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 rounded-lg p-3 shadow-lg mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'visualizer', label: 'Visualizer', icon: Grid3x3 },
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
                  <label className="block text-sm font-medium mb-2">Nodes (comma-separated, max 8):</label>
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
                    <li>• Edges: Format A-B:weight (directed edges from A to B)</li>
                    <li>• Max 8 nodes (algorithm is O(V³), larger graphs slow)</li>
                    <li>• Negative weights allowed (but no negative cycles)</li>
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

export default FloydWarshall;