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

  const [graph, setGraph] = useState(initialGraph);
  const [nodesInput, setNodesInput] = useState('A, B, C, D, E, F');
  const [edgesInput, setEdgesInput] = useState('A->B, A->C, B->D, C->D, D->E, E->F');
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleCustomGraph = () => {
    try {
      // Parse nodes
      const nodes = nodesInput
        .split(',')
        .map(n => n.trim())
        .filter(n => n.length > 0);

      if (nodes.length === 0) {
        throw new Error('Please enter at least one node');
      }

      if (nodes.length > 10) {
        throw new Error('Maximum 10 nodes allowed');
      }

      // Check for duplicate nodes
      const uniqueNodes = new Set(nodes);
      if (uniqueNodes.size !== nodes.length) {
        throw new Error('Duplicate nodes found');
      }

      // Parse edges
      const edges = [];
      if (edgesInput.trim().length > 0) {
        const edgePairs = edgesInput.split(',').map(e => e.trim());
        for (const pair of edgePairs) {
          const match = pair.match(/^(\w+)\s*->\s*(\w+)$/);
          if (!match) {
            throw new Error(`Invalid edge format: "${pair}". Use format: A->B`);
          }
          const [, from, to] = match;
          if (!nodes.includes(from)) {
            throw new Error(`Node "${from}" not found in nodes list`);
          }
          if (!nodes.includes(to)) {
            throw new Error(`Node "${to}" not found in nodes list`);
          }
          edges.push([from, to]);
        }
      }

      setGraph({ nodes, edges });
      setErrorMessage('');
      setSteps([]);
      setCurrentStep(0);
      setIsRunning(false);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const generateRandomGraph = () => {
    const nodeCount = Math.floor(Math.random() * 3) + 4; // 4-6 nodes
    const nodes = Array.from({ length: nodeCount }, (_, i) => 
      String.fromCharCode(65 + i)
    );

    // Generate random edges ensuring DAG structure
    const edges = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const edgeCount = Math.floor(Math.random() * 2) + 1;
      for (let j = 0; j < edgeCount && i + j + 1 < nodes.length; j++) {
        const targetIndex = i + Math.floor(Math.random() * (nodes.length - i - 1)) + 1;
        edges.push([nodes[i], nodes[targetIndex]]);
      }
    }

    setGraph({ nodes, edges });
    setNodesInput(nodes.join(', '));
    setEdgesInput(edges.map(([from, to]) => `${from}->${to}`).join(', '));
    setErrorMessage('');
    setSteps([]);
    setCurrentStep(0);
    setIsRunning(false);
  };

  const resetToDefault = () => {
    setGraph(initialGraph);
    setNodesInput('A, B, C, D, E, F');
    setEdgesInput('A->B, A->C, B->D, C->D, D->E, E->F');
    setErrorMessage('');
    setSteps([]);
    setCurrentStep(0);
    setIsRunning(false);
  };

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
    // Generate better layout based on graph structure
    const nodeCount = graph.nodes.length;
    const nodePositions = {};
    
    // Calculate levels based on topological dependencies
    const levels = {};
    const inDegree = {};
    const adjList = {};
    
    // Initialize
    graph.nodes.forEach(node => {
      adjList[node] = [];
      inDegree[node] = 0;
      levels[node] = 0;
    });
    
    // Build adjacency list and in-degrees
    graph.edges.forEach(([from, to]) => {
      adjList[from].push(to);
      inDegree[to]++;
    });
    
    // Calculate levels using BFS-like approach
    const queue = graph.nodes.filter(node => inDegree[node] === 0);
    const levelGroups = {};
    
    while (queue.length > 0) {
      const node = queue.shift();
      const level = levels[node];
      
      if (!levelGroups[level]) levelGroups[level] = [];
      levelGroups[level].push(node);
      
      adjList[node].forEach(neighbor => {
        levels[neighbor] = Math.max(levels[neighbor], level + 1);
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      });
    }
    
    // Position nodes based on levels
    const maxLevel = Math.max(...Object.values(levels));
    const levelWidth = 200;
    const nodeSpacing = 100;
    
    Object.entries(levelGroups).forEach(([level, nodes]) => {
      const levelNum = parseInt(level);
      const nodesInLevel = nodes.length;
      const startY = 150 - (nodesInLevel - 1) * nodeSpacing / 2;
      
      nodes.forEach((node, idx) => {
        nodePositions[node] = {
          x: 120 + levelNum * levelWidth,
          y: startY + idx * nodeSpacing
        };
      });
    });
    
    const svgWidth = Math.max(1000, (maxLevel + 1) * levelWidth + 200);
    const svgHeight = Math.max(350, Math.max(...Object.values(levelGroups).map(g => g.length)) * nodeSpacing + 100);

    const isNodeProcessed = currentStepData.processedNodes?.includes;
    const isNodeInQueue = currentStepData.queue?.includes;
    const isCurrentNode = (node) => currentStepData.currentNode === node;

    return (
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 w-full overflow-x-auto">
        <svg width={svgWidth} height={svgHeight} className="mx-auto">
          {/* Arrow marker definitions */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="12"
              markerHeight="12"
              refX="11"
              refY="6"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M 0 0 L 12 6 L 0 12 z" fill="#6b7280" />
            </marker>
            <marker
              id="arrowhead-active"
              markerWidth="12"
              markerHeight="12"
              refX="11"
              refY="6"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M 0 0 L 12 6 L 0 12 z" fill="#3b82f6" />
            </marker>
          </defs>

          {/* Draw edges */}
          {graph.edges.map((edge, idx) => {
            const [from, to] = edge;
            const fromPos = nodePositions[from];
            const toPos = nodePositions[to];
            
            if (!fromPos || !toPos) return null;
            
            const isVisitedEdge = currentStepData.visitedEdges?.some(
              e => e[0] === from && e[1] === to
            );

            // Calculate edge positions (from edge of circle to edge of circle)
            const dx = toPos.x - fromPos.x;
            const dy = toPos.y - fromPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Unit vector
            const ux = dx / distance;
            const uy = dy / distance;
            
            // Start and end points at circle edges (radius = 30)
            const x1 = fromPos.x + ux * 32;
            const y1 = fromPos.y + uy * 32;
            const x2 = toPos.x - ux * 42;
            const y2 = toPos.y - uy * 42;

            // Use curved path for better visualization
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            
            // Add slight curve for parallel edges
            const curvature = 0.15;
            const perpX = -uy * distance * curvature;
            const perpY = ux * distance * curvature;

            return (
              <g key={`${from}-${to}-${idx}`}>
                <path
                  d={`M ${x1} ${y1} Q ${midX + perpX * 0.2} ${midY + perpY * 0.2} ${x2} ${y2}`}
                  stroke={isVisitedEdge ? '#3b82f6' : '#6b7280'}
                  strokeWidth={isVisitedEdge ? 3.5 : 2.5}
                  fill="none"
                  markerEnd={isVisitedEdge ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                  className="transition-all duration-300"
                  strokeLinecap="round"
                />
              </g>
            );
          })}

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
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentStepData.stats?.nodesProcessed}/{graph.nodes.length}</p>
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

            {/* Custom Graph Input Section */}
            <div className="mt-4 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Custom Graph Input</h4>
              
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nodes (comma-separated, max 10):
              </label>
              <input
                type="text"
                value={nodesInput}
                onChange={(e) => setNodesInput(e.target.value)}
                placeholder="e.g., A, B, C, D"
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Edges (format: A-&gt;B, comma-separated):
              </label>
              <input
                type="text"
                value={edgesInput}
                onChange={(e) => setEdgesInput(e.target.value)}
                placeholder="e.g., A->B, B->C, A->C"
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />

              {errorMessage && (
                <p className="text-red-600 dark:text-red-400 text-sm font-semibold mb-3">⚠️ {errorMessage}</p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCustomGraph}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Apply Custom Graph
                </button>
                <button
                  onClick={generateRandomGraph}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                >
                  Random Graph
                </button>
                <button
                  onClick={resetToDefault}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                >
                  Reset to Default
                </button>
              </div>

              <div className="mt-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Tips:</strong> Enter nodes as single letters or words. Use -&gt; for directed edges (A-&gt;B means A points to B). 
                  Graph must be acyclic (DAG) for topological sort to work.
                </p>
              </div>
            </div>
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
      </div>
    </div>
  );
};

export default TopologicalSort;

