import React, { useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, GitBranch } from 'lucide-react';

function TopologicalSort() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(500);

  // Sample DAG (Directed Acyclic Graph)
  const initialGraph = {
    nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
    edges: [
      ['A', 'B'],
      ['A', 'C'],
      ['B', 'D'],
      ['C', 'D'],
      ['D', 'E'],
      ['E', 'F']
    ]
  };

  const [graph] = useState(initialGraph);

  const topologicalSort = useCallback(() => {
    const operationSteps = [];
    
    // Build adjacency list and in-degree count
    const adjList = {};
    const inDegree = {};
    
    graph.nodes.forEach(node => {
      adjList[node] = [];
      inDegree[node] = 0;
    });

    graph.edges.forEach(([from, to]) => {
      adjList[from].push(to);
      inDegree[to]++;
    });

    operationSteps.push({
      type: 'initialize',
      message: 'Initialized graph with nodes and edges. Building adjacency list and in-degree array.',
      graph,
      adjList,
      inDegree,
      queue: [],
      result: [],
      currentNode: null,
      visitedEdges: [],
      processedNodes: [],
      stats: { nodesProcessed: 0, edgesVisited: 0 }
    });

    operationSteps.push({
      type: 'calculate_indegree',
      message: `Calculated in-degrees: ${Object.entries(inDegree).map(([k, v]) => `${k}(${v})`).join(', ')}`,
      graph,
      adjList,
      inDegree,
      queue: [],
      result: [],
      currentNode: null,
      visitedEdges: [],
      processedNodes: [],
      stats: { nodesProcessed: 0, edgesVisited: 0 }
    });

    // Find all nodes with in-degree 0
    const queue = graph.nodes.filter(node => inDegree[node] === 0);

    operationSteps.push({
      type: 'queue_init',
      message: `Found ${queue.length} nodes with in-degree 0: [${queue.join(', ')}]`,
      graph,
      adjList,
      inDegree,
      queue: [...queue],
      result: [],
      currentNode: null,
      visitedEdges: [],
      processedNodes: [],
      stats: { nodesProcessed: 0, edgesVisited: 0 }
    });

    const result = [];
    const processedNodes = [];
    let edgesVisited = 0;

    while (queue.length > 0) {
      const node = queue.shift();
      result.push(node);
      processedNodes.push(node);

      operationSteps.push({
        type: 'process_node',
        message: `Processing node ${node}. Adding to result.`,
        graph,
        adjList,
        inDegree,
        queue: [...queue],
        result: [...result],
        currentNode: node,
        visitedEdges: [],
        processedNodes: [...processedNodes],
        stats: { nodesProcessed: result.length, edgesVisited }
      });

      const neighbors = adjList[node];
      const edgesForThisNode = [];

      for (let neighbor of neighbors) {
        inDegree[neighbor]--;
        edgesVisited++;
        edgesForThisNode.push([node, neighbor]);

        operationSteps.push({
          type: 'decrement_indegree',
          message: `Decremented in-degree of ${neighbor} to ${inDegree[neighbor]}.`,
          graph,
          adjList,
          inDegree: { ...inDegree },
          queue: [...queue],
          result: [...result],
          currentNode: node,
          visitedEdges: edgesForThisNode,
          processedNodes: [...processedNodes],
          stats: { nodesProcessed: result.length, edgesVisited }
        });

        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);

          operationSteps.push({
            type: 'enqueue_node',
            message: `In-degree of ${neighbor} became 0. Adding to queue.`,
            graph,
            adjList,
            inDegree: { ...inDegree },
            queue: [...queue],
            result: [...result],
            currentNode: node,
            visitedEdges: edgesForThisNode,
            processedNodes: [...processedNodes],
            stats: { nodesProcessed: result.length, edgesVisited }
          });
        }
      }
    }

    if (result.length !== graph.nodes.length) {
      operationSteps.push({
        type: 'cycle_detected',
        message: `⚠ Cycle detected! Only ${result.length} of ${graph.nodes.length} nodes processed. Graph is not a DAG.`,
        graph,
        adjList,
        inDegree,
        queue: [],
        result: [],
        currentNode: null,
        visitedEdges: [],
        processedNodes: [],
        stats: { nodesProcessed: result.length, edgesVisited }
      });
    } else {
      operationSteps.push({
        type: 'complete',
        message: `✓ Complete! Topological order: [${result.join(' → ')}]`,
        graph,
        adjList,
        inDegree,
        queue: [],
        result,
        currentNode: null,
        visitedEdges: [],
        processedNodes,
        stats: { nodesProcessed: result.length, edgesVisited }
      });
    }

    return operationSteps;
  }, [graph]);

  const handleSolve = () => {
    const operationSteps = topologicalSort();
    setSteps(operationSteps);
    setCurrentStep(0);
  };

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  const resetAnimation = () => {
    setIsRunning(false);
    setCurrentStep(0);
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  React.useEffect(() => {
    if (isRunning && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, animationSpeed);
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length - 1) {
      setIsRunning(false);
    }
  }, [isRunning, currentStep, steps.length, animationSpeed]);

  const currentStepData = steps[currentStep] || {};

  const renderGraph = () => {
    const nodePositions = {
      A: { x: 100, y: 100 },
      B: { x: 300, y: 80 },
      C: { x: 300, y: 180 },
      D: { x: 500, y: 130 },
      E: { x: 700, y: 130 },
      F: { x: 900, y: 130 }
    };

    const isNodeProcessed = currentStepData.processedNodes?.includes;
    const isNodeInQueue = currentStepData.queue?.includes;
    const isCurrentNode = (node) => currentStepData.currentNode === node;

    return (
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 w-full overflow-x-auto">
        <svg width="1000" height="280" className="mx-auto">
          {/* Draw edges */}
          {graph.edges.map((edge, idx) => {
            const [from, to] = edge;
            const fromPos = nodePositions[from];
            const toPos = nodePositions[to];
            const isVisitedEdge = currentStepData.visitedEdges?.some(
              e => e[0] === from && e[1] === to
            );

            return (
              <g key={idx}>
                {/* Line */}
                <line
                  x1={fromPos.x + 30}
                  y1={fromPos.y}
                  x2={toPos.x - 30}
                  y2={toPos.y}
                  stroke={isVisitedEdge ? '#3b82f6' : '#d1d5db'}
                  strokeWidth={isVisitedEdge ? 3 : 2}
                  markerEnd="url(#arrowhead)"
                  className="transition-all"
                />
              </g>
            );
          })}

          {/* Arrow marker definition */}
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
          {graph.nodes.map(node => {
            const pos = nodePositions[node];
            const isProcessed = currentStepData.processedNodes?.includes(node);
            const inQueue = currentStepData.queue?.includes(node);
            const isCurrent = isCurrentNode(node);

            let bgColor = '#ffffff';
            let textColor = '#000000';
            let scale = 1;

            if (isCurrent) {
              bgColor = '#fbbf24';
              textColor = '#000000';
              scale = 1.2;
            } else if (isProcessed) {
              bgColor = '#86efac';
              textColor = '#166534';
            } else if (inQueue) {
              bgColor = '#93c5fd';
              textColor = '#1e40af';
            }

            const inDegree = currentStepData.inDegree?.[node] || 0;

            return (
              <g key={node} style={{ transform: `scale(${scale})`, transformOrigin: `${pos.x}px ${pos.y}px` }}>
                {/* Node circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="30"
                  fill={bgColor}
                  stroke={isCurrent ? '#f59e0b' : '#666'}
                  strokeWidth={isCurrent ? 4 : 2}
                  className="transition-all"
                />
                
                {/* Node label */}
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dy="0.3em"
                  fontSize="18"
                  fontWeight="bold"
                  fill={textColor}
                  className="pointer-events-none"
                >
                  {node}
                </text>

                {/* In-degree label */}
                <text
                  x={pos.x}
                  y={pos.y + 45}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#666"
                  className="pointer-events-none"
                >
                  in: {inDegree}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderVisualizer = () => (
    <div className="space-y-6">
      <div className="bg-white/90 dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <GitBranch className="text-blue-600" size={28} />
          Topological Sort Visualization
        </h3>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Graph */}
          <div className="lg:col-span-2">
            {renderGraph()}
          </div>

          {/* Statistics and Legend */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-700">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Statistics</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nodes Processed</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentStepData.stats?.nodesProcessed}/6</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Edges Visited</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{currentStepData.stats?.edgesVisited}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Queue Size</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{currentStepData.queue?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-600">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Legend</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-400"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Unvisited</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-300 border-2 border-blue-600"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">In Queue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-yellow-300 border-2 border-yellow-500"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-300 border-2 border-green-600"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Processed</span>
                </div>
              </div>
            </div>

            {currentStepData.result && currentStepData.result.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border-2 border-green-300 dark:border-green-700">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Result Order</h4>
                <p className="font-mono text-sm text-green-900 dark:text-green-300 break-words">
                  {currentStepData.result.join(' → ')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const TheorySection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Topological Sort Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">What is Topological Sort?</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Topological sorting is a linear ordering of vertices in a directed acyclic graph (DAG) such that for every directed edge from vertex A to B, A comes before B in the ordering. It's used in task scheduling, dependency resolution, build systems, and course prerequisites.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Key Properties</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Works only on DAGs</li>
              <li>Linear ordering of vertices</li>
              <li>Respects edge directions</li>
              <li>Not unique (multiple valid orderings)</li>
              <li>Detects cycles in graphs</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">Algorithm Steps</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Calculate in-degree for each node</li>
              <li>Enqueue all nodes with in-degree 0</li>
              <li>Process node from queue</li>
              <li>Decrease neighbors' in-degrees</li>
              <li>Enqueue nodes reaching in-degree 0</li>
              <li>Repeat until queue is empty</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">In-Degree Approach (Kahn's Algorithm)</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
            <p>The visualizer uses Kahn's algorithm (BFS-based approach):</p>
            <p className="ml-4">• Count incoming edges for each vertex</p>
            <p className="ml-4">• Start with vertices having no dependencies</p>
            <p className="ml-4">• Process vertices and reduce neighbors' in-degrees</p>
            <p className="ml-4">• Add vertices to queue when in-degree becomes 0</p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Complexity Analysis</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm font-mono">
            <p>Time: <span className="font-bold">O(V + E)</span></p>
            <p className="text-xs">where V = vertices, E = edges</p>
            <p>Space: <span className="font-bold">O(V + E)</span> for adjacency list and queue</p>
          </div>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
        Topological Sort Implementation
      </h2>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
        <h4 className="font-semibold mb-3 text-lg">Kahn's Algorithm (In-Degree Approach)</h4>
        <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
          <code>{`TOPOLOGICAL-SORT(graph):
  // Step 1: Initialize in-degree for all vertices
  in_degree = {}
  for each vertex v in graph.vertices:
    in_degree[v] = 0
  
  // Step 2: Count in-degrees
  for each edge (u, v):
    in_degree[v]++
  
  // Step 3: Find all vertices with in-degree 0
  queue = []
  for each vertex v in graph.vertices:
    if in_degree[v] == 0:
      queue.enqueue(v)
  
  // Step 4: Process vertices
  result = []
  while queue is not empty:
    u = queue.dequeue()
    result.append(u)
    
    // Decrease in-degree of neighbors
    for each edge (u, v):
      in_degree[v]--
      
      // If in-degree becomes 0, add to queue
      if in_degree[v] == 0:
        queue.enqueue(v)
  
  // Step 5: Check for cycles
  if result.size() != graph.size():
    return ERROR: Graph has a cycle
  
  return result`}</code>
        </pre>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Alternative: DFS</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Post-order DFS traversal</li>
            <li>Push to stack after visiting</li>
            <li>Pop stack for result</li>
            <li>Detects cycles via backtracking</li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <h4 className="font-semibold mb-2 text-green-900 dark:text-green-300">Real-World Applications</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Task scheduling (project management)</li>
            <li>Build system dependencies (Make, Gradle)</li>
            <li>Course prerequisites ordering</li>
            <li>Dependency resolution (npm, pip)</li>
            <li>Instruction ordering in compilers</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
            Topological Sort Visualizer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Watch Kahn's algorithm find a valid ordering of vertices in a directed acyclic graph based on dependencies and in-degrees.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 shadow-lg mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'visualizer', label: 'Visualizer', icon: GitBranch },
              { id: 'theory', label: 'Theory', icon: BookOpen },
              { id: 'pseudocode', label: 'Algorithm', icon: Code }
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    tab === t.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-400'
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
          <div className="bg-white/80 dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <button
                onClick={handleSolve}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                <GitBranch size={18} /> Sort
              </button>

              <button
                onClick={toggleAnimation}
                disabled={steps.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} />}
                {isRunning ? 'Pause' : 'Play'}
              </button>

              <button
                onClick={stepForward}
                disabled={currentStep >= steps.length - 1 || steps.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                <StepForward size={18} /> Step
              </button>

              <button
                onClick={resetAnimation}
                disabled={steps.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                <RotateCcw size={18} /> Reset
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm font-medium">Speed:</span>
                <select
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                  className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1000}>Slow</option>
                  <option value={500}>Normal</option>
                  <option value={100}>Fast</option>
                  <option value={10}>Very Fast</option>
                </select>
              </div>
            </div>

            {steps.length > 0 && (
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Step {currentStep + 1} of {steps.length}</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{steps[currentStep]?.type?.toUpperCase().replace(/_/g, ' ')}</span>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
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
          <div className="bg-white/90 dark:bg-gray-800 rounded-lg p-6 shadow-lg mt-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Current Step</h3>
            <p className="text-gray-700 dark:text-gray-300">{currentStepData.message}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Explore More Algorithms!</h2>
          <p>Discover and visualize a variety of algorithms in action. Enhance your understanding with interactive demos and detailed explanations.</p>
        </div>
      </div>
    </div>
  );
};

export default TopologicalSort;

