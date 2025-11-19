import React, { useState, useEffect, useCallback } from 'react';
import { FaPlay, FaPause, FaUndo, FaStepForward, FaCode, FaBookOpen, FaProjectDiagram } from 'react-icons/fa';

function Prims() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  // Graph nodes and edges
  const [nodes] = useState([
    { id: 0, label: 'A', x: 100, y: 100 },
    { id: 1, label: 'B', x: 300, y: 80 },
    { id: 2, label: 'C', x: 500, y: 100 },
    { id: 3, label: 'D', x: 200, y: 250 },
    { id: 4, label: 'E', x: 400, y: 280 },
    { id: 5, label: 'F', x: 100, y: 350 }
  ]);

  const [edges] = useState([
    { id: 0, from: 0, to: 1, weight: 4 },
    { id: 1, from: 0, to: 3, weight: 2 },
    { id: 2, from: 1, to: 2, weight: 1 },
    { id: 3, from: 1, to: 3, weight: 5 },
    { id: 4, from: 2, to: 4, weight: 8 },
    { id: 5, from: 3, to: 4, weight: 10 },
    { id: 6, from: 3, to: 5, weight: 7 },
    { id: 7, from: 4, to: 5, weight: 6 }
  ]);

  const [visitedNodes, setVisitedNodes] = useState([]);
  const [mstEdges, setMSTEdges] = useState([]);
  const [currentEdge, setCurrentEdge] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);

  const primsAlgorithm = useCallback(() => {
    const steps = [];
    const inMST = new Set([0]); // Start from node 0
    const mstEdges = [];
    const edgeSet = new Set();

    steps.push({
      type: 'start',
      message: 'Starting Prim\'s Algorithm from node A',
      visitedNodes: [0],
      mstEdges: [],
      currentNode: 0,
      currentEdge: null
    });

    while (inMST.size < nodes.length) {
      let minEdge = null;
      let minWeight = Infinity;
      let nextNode = null;

      // Find minimum weight edge connecting MST to non-MST node
      for (let edge of edges) {
        const fromInMST = inMST.has(edge.from);
        const toInMST = inMST.has(edge.to);

        // Edge connects MST to non-MST
        if ((fromInMST && !toInMST) || (!fromInMST && toInMST)) {
          if (edge.weight < minWeight) {
            minWeight = edge.weight;
            minEdge = edge;
            nextNode = fromInMST ? edge.to : edge.from;
          }
        }
      }

      if (minEdge === null) break;

      steps.push({
        type: 'examine',
        message: `Examining edges from MST nodes. Found edge ${nodes[minEdge.from].label}-${nodes[minEdge.to].label} with weight ${minEdge.weight}`,
        visitedNodes: Array.from(inMST),
        mstEdges: [...mstEdges],
        currentNode: nextNode,
        currentEdge: minEdge
      });

      mstEdges.push(minEdge);
      inMST.add(nextNode);

      steps.push({
        type: 'add',
        message: `Added edge ${nodes[minEdge.from].label}-${nodes[minEdge.to].label} (weight: ${minEdge.weight}) and node ${nodes[nextNode].label} to MST`,
        visitedNodes: Array.from(inMST),
        mstEdges: [...mstEdges],
        currentNode: nextNode,
        currentEdge: minEdge
      });
    }

    const totalWeight = mstEdges.reduce((sum, e) => sum + e.weight, 0);

    steps.push({
      type: 'complete',
      message: `MST Complete! Total weight: ${totalWeight}. Edges in MST: ${mstEdges.length}`,
      visitedNodes: Array.from(inMST),
      mstEdges: [...mstEdges],
      currentNode: null,
      currentEdge: null,
      totalWeight
    });

    return { steps, result: { mstEdges, totalWeight } };
  }, [nodes, edges]);

  const runAlgorithm = () => {
    const algorithmResult = primsAlgorithm();
    setSteps(algorithmResult.steps);
    setCurrentStep(0);
  };

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  const resetAnimation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setVisitedNodes([]);
    setMSTEdges([]);
    setCurrentEdge(null);
    setCurrentNode(null);
    runAlgorithm();
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  useEffect(() => {
    runAlgorithm();
  }, [primsAlgorithm]);

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
      setVisitedNodes(step.visitedNodes || []);
      setMSTEdges(step.mstEdges || []);
      setCurrentEdge(step.currentEdge || null);
      setCurrentNode(step.currentNode !== undefined ? step.currentNode : null);
    }
  }, [currentStep, steps]);

  const renderGraph = () => (
    <div className="space-y-6">
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <FaProjectDiagram className="text-blue-600" />
          Graph Visualization
        </h3>

        <svg width="100%" height="500" className="border-2 border-gray-300 rounded-lg bg-gray-50">
          {/* Draw edges */}
          {edges.map((edge) => {
            const fromNode = nodes[edge.from];
            const toNode = nodes[edge.to];
            const isInMST = mstEdges.some(e => 
              (e.from === edge.from && e.to === edge.to) || 
              (e.from === edge.to && e.to === edge.from)
            );
            const isCurrent = currentEdge && 
              ((currentEdge.from === edge.from && currentEdge.to === edge.to) ||
               (currentEdge.from === edge.to && currentEdge.to === edge.from));

            return (
              <g key={`edge-${edge.id}`}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={isCurrent ? '#FCD34D' : isInMST ? '#10B981' : '#D1D5DB'}
                  strokeWidth={isCurrent ? 4 : isInMST ? 3 : 2}
                  className={isCurrent ? 'animate-pulse' : ''}
                />
                {/* Edge weight label */}
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2 - 8}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-gray-700 pointer-events-none"
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
            const isCurrent = currentNode === node.id;

            return (
              <g key={`node-${node.id}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={30}
                  fill={isCurrent ? '#FCD34D' : isVisited ? '#10B981' : '#E5E7EB'}
                  stroke={isCurrent ? '#F59E0B' : isVisited ? '#059669' : '#9CA3AF'}
                  strokeWidth="3"
                  className={isCurrent ? 'animate-pulse' : ''}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dy="0.3em"
                  className="text-lg font-bold pointer-events-none select-none"
                  fill={isCurrent || isVisited ? 'white' : 'black'}
                  fontSize="18"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-50 rounded p-3 border-l-4 border-green-500">
            <div className="text-sm font-medium text-gray-600">MST Nodes</div>
            <div className="text-2xl font-bold text-green-600">{visitedNodes.length}</div>
          </div>
          <div className="bg-blue-50 rounded p-3 border-l-4 border-blue-500">
            <div className="text-sm font-medium text-gray-600">MST Edges</div>
            <div className="text-2xl font-bold text-blue-600">{mstEdges.length}</div>
          </div>
          <div className="bg-purple-50 rounded p-3 border-l-4 border-purple-500">
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
                <tr className="bg-gray-100 border-b-2">
                  <th className="px-4 py-2 text-left">From</th>
                  <th className="px-4 py-2 text-left">To</th>
                  <th className="px-4 py-2 text-left">Weight</th>
                </tr>
              </thead>
              <tbody>
                {mstEdges.map((edge, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-semibold">{nodes[edge.from].label}</td>
                    <td className="px-4 py-2 font-semibold">{nodes[edge.to].label}</td>
                    <td className="px-4 py-2">{edge.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic">No edges selected yet</p>
        )}
      </div>
    </div>
  );

  const TheorySection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
        Prim's Algorithm Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">Overview</h3>
          <p className="text-gray-700">
            Prim's algorithm is a greedy algorithm that finds a Minimum Spanning Tree (MST) for a weighted undirected graph. It starts from an arbitrary node and grows the tree one edge at a time, always selecting the minimum weight edge that connects the current tree to a new node.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700">Key Characteristics</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Greedy algorithm</li>
              <li>Works on weighted graphs</li>
              <li>Finds minimum spanning tree</li>
              <li>Deterministic</li>
              <li>Time: O(E log V)</li>
              <li>Space: O(V)</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700">Applications</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Network design</li>
              <li>Clustering algorithms</li>
              <li>Image processing</li>
              <li>Circuit design</li>
              <li>Maze generation</li>
              <li>Road/utility networks</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>Start with a single node (arbitrary)</li>
            <li>Mark it as part of the MST</li>
            <li>Find the minimum weight edge connecting a MST node to a non-MST node</li>
            <li>Add both the edge and new node to the MST</li>
            <li>Repeat steps 3-4 until all nodes are in the MST</li>
          </ol>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600 mb-6">
        Pseudocode
      </h2>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-semibold mb-3 text-lg">Prim's Algorithm</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-auto text-sm font-mono">
            <code>{`PRIMS(Graph G, Start vertex v):
  MST = empty set
  inMST = {v}
  
  while inMST.size < G.vertices:
    minEdge = null
    minWeight = infinity
    
    for each edge in G.edges:
      if edge connects inMST to non-inMST:
        if edge.weight < minWeight:
          minWeight = edge.weight
          minEdge = edge
    
    if minEdge is null:
      break
    
    add minEdge to MST
    add minEdge.otherNode to inMST
  
  return MST`}</code>
          </pre>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-semibold mb-2 text-yellow-900">Complexity Analysis</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold">Time Complexity</p>
              <p>O(E log V) with binary heap</p>
              <p>O(V²) with simple implementation</p>
            </div>
            <div>
              <p className="font-semibold">Space Complexity</p>
              <p>O(V) for visited set</p>
              <p>O(E) for edge storage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 mb-3">
            Prim's Algorithm Visualizer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Visualize how Prim's algorithm finds the Minimum Spanning Tree by greedily selecting minimum weight edges.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 rounded-lg p-3 shadow-lg mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'visualizer', label: 'Visualizer', icon: FaProjectDiagram },
              { id: 'theory', label: 'Theory', icon: FaBookOpen },
              { id: 'pseudocode', label: 'Pseudocode', icon: FaCode }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  tab === t.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                <t.icon /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        {tab === 'visualizer' && (
          <div className="bg-white/80 rounded-lg p-6 shadow-lg mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={toggleAnimation}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                {isRunning ? <FaPause /> : <FaPlay />}
                {isRunning ? 'Pause' : 'Play'}
              </button>

              <button
                onClick={stepForward}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
                disabled={currentStep >= steps.length - 1}
              >
                <FaStepForward /> Step
              </button>

              <button
                onClick={resetAnimation}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <FaUndo /> Reset
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

            <div className="mt-4">
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
          <div className="bg-white/90 rounded-lg p-6 shadow-lg mt-6">
            <h3 className="text-lg font-semibold mb-2">Current Step:</h3>
            <p className="text-gray-700">{steps[currentStep].message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Prims;