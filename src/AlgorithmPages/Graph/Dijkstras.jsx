import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, GitBranch } from 'lucide-react';

function Dijkstra() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  const [nodes] = useState([
    { id: 0, label: 'A', x: 80, y: 100 },
    { id: 1, label: 'B', x: 250, y: 60 },
    { id: 2, label: 'C', x: 420, y: 100 },
    { id: 3, label: 'D', x: 150, y: 250 },
    { id: 4, label: 'E', x: 350, y: 280 }
  ]);

  const [edges] = useState([
    { id: 0, from: 0, to: 1, weight: 4 },
    { id: 1, from: 0, to: 3, weight: 2 },
    { id: 2, from: 1, to: 2, weight: 5 },
    { id: 3, from: 1, to: 3, weight: 1 },
    { id: 4, from: 2, to: 4, weight: 2 },
    { id: 5, from: 3, to: 4, weight: 8 },
    { id: 6, from: 3, to: 2, weight: 6 }
  ]);

  const [distances, setDistances] = useState({});
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [unvisitedNodes, setUnvisitedNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [currentEdge, setCurrentEdge] = useState(null);
  const [source, setSource] = useState(0);

  const dijkstraAlgorithm = useCallback(() => {
    const steps = [];
    const dist = {};
    const visited = new Set();
    const unvisited = new Set();
    
    nodes.forEach(n => {
      dist[n.id] = n.id === source ? 0 : Infinity;
      unvisited.add(n.id);
    });

    steps.push({
      type: 'initialize',
      message: `Initialize: dist[${nodes[source].label}] = 0, all others = ∞. Add all nodes to unvisited set.`,
      distances: { ...dist },
      visitedNodes: Array.from(visited),
      unvisitedNodes: Array.from(unvisited),
      currentNode: null,
      currentEdge: null
    });

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let minNode = null;
      let minDist = Infinity;

      for (let nodeId of unvisited) {
        if (dist[nodeId] < minDist) {
          minDist = dist[nodeId];
          minNode = nodeId;
        }
      }

      if (minNode === null || minDist === Infinity) break;

      steps.push({
        type: 'select_min',
        message: `Select minimum distance unvisited node: ${nodes[minNode].label} (distance: ${minDist})`,
        distances: { ...dist },
        visitedNodes: Array.from(visited),
        unvisitedNodes: Array.from(unvisited),
        currentNode: minNode,
        currentEdge: null
      });

      visited.add(minNode);
      unvisited.delete(minNode);

      steps.push({
        type: 'visit',
        message: `Visit node ${nodes[minNode].label}`,
        distances: { ...dist },
        visitedNodes: Array.from(visited),
        unvisitedNodes: Array.from(unvisited),
        currentNode: minNode,
        currentEdge: null
      });

      // Relax edges from current node
      for (let edge of edges) {
        if (edge.from === minNode && unvisited.has(edge.to)) {
          steps.push({
            type: 'examine_edge',
            message: `Examine edge ${nodes[edge.from].label}→${nodes[edge.to].label} (weight: ${edge.weight})`,
            distances: { ...dist },
            visitedNodes: Array.from(visited),
            unvisitedNodes: Array.from(unvisited),
            currentNode: minNode,
            currentEdge: edge
          });

          const newDist = dist[edge.from] + edge.weight;
          if (newDist < dist[edge.to]) {
            const oldDist = dist[edge.to];
            dist[edge.to] = newDist;

            steps.push({
              type: 'relax',
              message: `Relaxed: dist[${nodes[edge.to].label}] = ${newDist} (was ${oldDist === Infinity ? '∞' : oldDist})`,
              distances: { ...dist },
              visitedNodes: Array.from(visited),
              unvisitedNodes: Array.from(unvisited),
              currentNode: minNode,
              currentEdge: edge
            });
          } else {
            steps.push({
              type: 'no_relax',
              message: `No update needed: ${dist[minNode]} + ${edge.weight} ≥ ${dist[edge.to]}`,
              distances: { ...dist },
              visitedNodes: Array.from(visited),
              unvisitedNodes: Array.from(unvisited),
              currentNode: minNode,
              currentEdge: edge
            });
          }
        }
      }
    }

    steps.push({
      type: 'complete',
      message: 'Algorithm Complete! All nodes visited and shortest paths found.',
      distances: { ...dist },
      visitedNodes: Array.from(visited),
      unvisitedNodes: new Set(),
      currentNode: null,
      currentEdge: null
    });

    return steps;
  }, [nodes, edges, source]);

  const runAlgorithm = () => {
    const algorithmSteps = dijkstraAlgorithm();
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
  }, [source, dijkstraAlgorithm]);

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
      setDistances(step.distances || {});
      setVisitedNodes(step.visitedNodes || []);
      setUnvisitedNodes(step.unvisitedNodes || []);
      setCurrentNode(step.currentNode || null);
      setCurrentEdge(step.currentEdge || null);
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

            return (
              <g key={`edge-${edge.id}`}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={isCurrent ? '#FBBF24' : '#D1D5DB'}
                  strokeWidth={isCurrent ? 4 : 2}
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
            const isSource = node.id === source;
            const isVisited = visitedNodes.includes(node.id);
            const isCurrent = currentNode === node.id;

            let fillColor = '#E5E7EB';
            let strokeColor = '#9CA3AF';

            if (isCurrent) {
              fillColor = '#FBBF24';
              strokeColor = '#F59E0B';
            } else if (isVisited) {
              fillColor = '#10B981';
              strokeColor = '#059669';
            } else if (isSource) {
              fillColor = '#3B82F6';
              strokeColor = '#1E40AF';
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
                  className={isCurrent ? 'animate-pulse' : ''}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dy="0.3em"
                  className="text-lg font-bold pointer-events-none select-none"
                  fill={isCurrent || isVisited || isSource ? 'white' : 'black'}
                  fontSize="18"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded p-4 border-l-4 border-blue-500">
            <div className="text-sm font-medium text-gray-600">Source Node</div>
            <div className="text-2xl font-bold text-blue-600">{nodes[source].label}</div>
          </div>
          <div className="bg-green-50 rounded p-4 border-l-4 border-green-500">
            <div className="text-sm font-medium text-gray-600">Visited</div>
            <div className="text-2xl font-bold text-green-600">{visitedNodes.length}</div>
          </div>
          <div className="bg-gray-50 rounded p-4 border-l-4 border-gray-500">
            <div className="text-sm font-medium text-gray-600">Unvisited</div>
            <div className="text-2xl font-bold text-gray-600">{unvisitedNodes.length}</div>
          </div>
          <div className="bg-yellow-50 rounded p-4 border-l-4 border-yellow-500">
            <div className="text-sm font-medium text-gray-600">Total Nodes</div>
            <div className="text-2xl font-bold text-yellow-600">{nodes.length}</div>
          </div>
        </div>
      </div>

      {/* Distances Table */}
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h4 className="text-lg font-semibold mb-4">Shortest Distances from {nodes[source].label}</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 to-purple-100 border-b-2">
                <th className="px-4 py-3 text-left font-semibold">Node</th>
                {nodes.map(n => (
                  <th key={n.id} className="px-4 py-3 text-center font-semibold">{n.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold">Distance</td>
                {nodes.map(n => (
                  <td key={n.id} className="px-4 py-3 text-center font-mono font-bold">
                    <span className="text-lg">{distances[n.id] === Infinity ? '∞' : distances[n.id]}</span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const TheorySection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Dijkstra's Algorithm Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">Overview</h3>
          <p className="text-gray-700">
            Dijkstra's algorithm is a greedy algorithm that solves the single-source shortest path problem for graphs with non-negative edge weights. It maintains a set of unvisited nodes and repeatedly selects the unvisited node with the minimum distance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700">Key Characteristics</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>Single-source shortest path</li>
              <li>Greedy algorithm</li>
              <li>Non-negative weights only</li>
              <li>Always finds optimal path</li>
              <li>Time: O((V + E) log V) with heap</li>
              <li>Space: O(V)</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700">Applications</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>GPS navigation systems</li>
              <li>Network routing (OSPF)</li>
              <li>Flight price finding</li>
              <li>Social network analysis</li>
              <li>Game AI pathfinding</li>
              <li>Telephone networks</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">How It Works</h4>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700 text-sm">
            <li>Initialize distance to source as 0, all others as infinity</li>
            <li>Select the unvisited node with minimum distance</li>
            <li>Mark it as visited</li>
            <li>For each unvisited neighbor, relax the edge (update distance if shorter path found)</li>
            <li>Repeat steps 2-4 until all nodes are visited</li>
          </ol>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Why Non-Negative Weights?</h4>
          <p className="text-gray-700 text-sm">
            Once a node is visited, its shortest distance is finalized. If negative weights exist, this assumption breaks because a later path through a negative edge could be shorter. Use Bellman-Ford for negative weights.
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
          <h4 className="font-semibold mb-3 text-lg">Dijkstra's Algorithm</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-auto text-sm font-mono leading-relaxed">
            <code>{`DIJKSTRA(G, w, source):
  // Initialize distances and unvisited set
  for each vertex v in G.vertices:
    dist[v] = INFINITY
    prev[v] = NULL
  dist[source] = 0
  unvisited = all vertices
  
  // Process nodes while unvisited set is not empty
  while unvisited is not empty:
    // Find unvisited vertex with minimum distance
    u = vertex in unvisited with min dist[u]
    
    if dist[u] == INFINITY:
      break  // Unreachable nodes
    
    // Mark u as visited
    remove u from unvisited
    
    // Relax edges from u
    for each edge (u, v) with weight w(u, v):
      if v in unvisited:
        if dist[u] + w(u, v) < dist[v]:
          dist[v] = dist[u] + w(u, v)
          prev[v] = u
  
  return dist, prev`}</code>
          </pre>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-semibold mb-2 text-yellow-900">Complexity Analysis</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold">Time Complexity</p>
              <p className="text-gray-600">O((V + E) log V)</p>
              <p className="text-xs mt-1">With binary heap; O(V²) with array</p>
            </div>
            <div>
              <p className="font-semibold">Space Complexity</p>
              <p className="text-gray-600">O(V)</p>
              <p className="text-xs mt-1">For distance, previous, and visited sets</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold mb-2 text-blue-900">Comparison with Bellman-Ford</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <p><span className="font-semibold">Dijkstra:</span> Faster, only non-negative weights</p>
            <p><span className="font-semibold">Bellman-Ford:</span> Slower, handles negative weights</p>
          </div>
        </div>

        <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
          <h4 className="font-semibold mb-2 text-pink-900">Relaxation Process</h4>
          <p className="text-sm text-gray-700">
            For each edge (u, v), check if path through u is shorter: <span className="font-mono font-semibold">if dist[u] + weight(u,v) &lt; dist[v]</span>, update dist[v]
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
            Dijkstra's Algorithm Visualizer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Visualize how Dijkstra's algorithm finds the shortest paths from a source vertex using a greedy approach.
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

              <div className="flex items-center gap-3 ml-auto">
                <label className="text-sm font-medium">Source:</label>
                <select
                  value={source}
                  onChange={(e) => setSource(parseInt(e.target.value))}
                  disabled={isRunning}
                  className="p-2 border rounded-lg text-sm"
                >
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>Node {n.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
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

export default Dijkstra;