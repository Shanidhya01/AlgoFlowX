import React, { useState, useEffect, useCallback } from 'react';
import { FaPlay, FaPause, FaUndo, FaStepForward, FaCode, FaBookOpen, FaProjectDiagram } from 'react-icons/fa';

function BFS() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  // Default graph configuration
  const DEFAULT_NODES = [
    { id: 0, label: 'A', x: 100, y: 100 },
    { id: 1, label: 'B', x: 300, y: 50 },
    { id: 2, label: 'C', x: 500, y: 100 },
    { id: 3, label: 'D', x: 200, y: 250 },
    { id: 4, label: 'E', x: 400, y: 280 },
    { id: 5, label: 'F', x: 100, y: 350 }
  ];

  const DEFAULT_ADJACENCY_LIST = {
    0: [1, 3],      // A -> B, D
    1: [0, 2, 3],   // B -> A, C, D
    2: [1, 4],      // C -> B, E
    3: [0, 1, 5],   // D -> A, B, F
    4: [2, 5],      // E -> C, F
    5: [3, 4]       // F -> D, E
  };

  // Graph nodes
  const [nodes, setNodes] = useState(DEFAULT_NODES);

  // Adjacency list representation
  const [adjacencyList, setAdjacencyList] = useState(DEFAULT_ADJACENCY_LIST);

  // Custom input states
  const [nodesInput, setNodesInput] = useState('A, B, C, D, E, F');
  const [edgesInput, setEdgesInput] = useState('A-B, A-D, B-C, B-D, C-E, D-F, E-F');
  const [startNodeInput, setStartNodeInput] = useState('A');
  const [errorMessage, setErrorMessage] = useState('');
  const [startNode, setStartNode] = useState(0);

  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [traversalOrder, setTraversalOrder] = useState([]);
  const [queue, setQueue] = useState([]);
  const [discoveredEdges, setDiscoveredEdges] = useState([]);
  const [levelMap, setLevelMap] = useState({});

  const parseCustomGraph = useCallback(() => {
    try {
      setErrorMessage('');
      
      // Parse nodes
      const nodeLabels = nodesInput
        .split(',')
        .map(n => n.trim())
        .filter(n => n.length > 0);
      
      if (nodeLabels.length === 0) {
        setErrorMessage('Please enter at least one node.');
        return;
      }
      
      if (nodeLabels.length > 12) {
        setErrorMessage('Maximum 12 nodes allowed for optimal visualization.');
        return;
      }
      
      // Check for duplicate nodes
      const uniqueNodes = new Set(nodeLabels);
      if (uniqueNodes.size !== nodeLabels.length) {
        setErrorMessage('Duplicate node labels found. Each node must have a unique label.');
        return;
      }
      
      // Create node objects with grid positioning
      const cols = Math.ceil(Math.sqrt(nodeLabels.length));
      const rows = Math.ceil(nodeLabels.length / cols);
      const spacingX = 150;
      const spacingY = 120;
      const offsetX = 100;
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
      const newAdjacencyList = {};
      nodeLabels.forEach((_, idx) => {
        newAdjacencyList[idx] = [];
      });
      
      if (edgesInput.trim().length > 0) {
        const edgePairs = edgesInput
          .split(',')
          .map(e => e.trim())
          .filter(e => e.length > 0);
        
        for (const edge of edgePairs) {
          const parts = edge.split('-').map(p => p.trim());
          if (parts.length !== 2) {
            setErrorMessage(`Invalid edge format: "${edge}". Use format: A-B`);
            return;
          }
          
          const [from, to] = parts;
          const fromIdx = nodeLabels.indexOf(from);
          const toIdx = nodeLabels.indexOf(to);
          
          if (fromIdx === -1) {
            setErrorMessage(`Node "${from}" in edge "${edge}" does not exist in nodes list.`);
            return;
          }
          if (toIdx === -1) {
            setErrorMessage(`Node "${to}" in edge "${edge}" does not exist in nodes list.`);
            return;
          }
          
          // Add bidirectional edges (undirected graph)
          if (!newAdjacencyList[fromIdx].includes(toIdx)) {
            newAdjacencyList[fromIdx].push(toIdx);
          }
          if (!newAdjacencyList[toIdx].includes(fromIdx)) {
            newAdjacencyList[toIdx].push(fromIdx);
          }
        }
      }
      
      // Validate start node
      const startLabel = startNodeInput.trim();
      const startIdx = nodeLabels.indexOf(startLabel);
      if (startIdx === -1) {
        setErrorMessage(`Start node "${startLabel}" does not exist in nodes list.`);
        return;
      }
      
      // Update state
      setNodes(newNodes);
      setAdjacencyList(newAdjacencyList);
      setStartNode(startIdx);
      setErrorMessage('');
      
      // Reset animation
      setIsRunning(false);
      setCurrentStep(0);
      setVisitedNodes([]);
      setCurrentNode(null);
      setTraversalOrder([]);
      setQueue([]);
      setDiscoveredEdges([]);
      setLevelMap({});
      
    } catch (error) {
      setErrorMessage(`Error parsing graph: ${error.message}`);
    }
  }, [nodesInput, edgesInput, startNodeInput]);

  const generateRandomGraph = () => {
    const nodeCount = 4 + Math.floor(Math.random() * 4); // 4-7 nodes
    const labels = [];
    for (let i = 0; i < nodeCount; i++) {
      labels.push(String.fromCharCode(65 + i)); // A, B, C, ...
    }
    
    // Create a connected graph with random edges
    const edges = [];
    // First, create a path to ensure connectivity
    for (let i = 0; i < nodeCount - 1; i++) {
      edges.push(`${labels[i]}-${labels[i + 1]}`);
    }
    
    // Add some random edges
    const extraEdges = Math.floor(Math.random() * nodeCount);
    for (let i = 0; i < extraEdges; i++) {
      const from = Math.floor(Math.random() * nodeCount);
      let to = Math.floor(Math.random() * nodeCount);
      if (from !== to) {
        edges.push(`${labels[from]}-${labels[to]}`);
      }
    }
    
    setNodesInput(labels.join(', '));
    setEdgesInput(edges.join(', '));
    setStartNodeInput(labels[0]);
    setErrorMessage('');
  };

  const resetToDefault = () => {
    setNodesInput('A, B, C, D, E, F');
    setEdgesInput('A-B, A-D, B-C, B-D, C-E, D-F, E-F');
    setStartNodeInput('A');
    setNodes(DEFAULT_NODES);
    setAdjacencyList(DEFAULT_ADJACENCY_LIST);
    setStartNode(0);
    setErrorMessage('');
    
    // Reset animation
    setIsRunning(false);
    setCurrentStep(0);
    setVisitedNodes([]);
    setCurrentNode(null);
    setTraversalOrder([]);
    setQueue([]);
    setDiscoveredEdges([]);
    setLevelMap({});
  };

  const bfsAlgorithm = useCallback(() => {
    const steps = [];
    const visited = new Set();
    const traversalOrder = [];
    const queue = [];
    const discoveredEdges = [];
    const levelMap = {};

    steps.push({
      type: 'initialize',
      message: `Initializing BFS from node ${nodes[startNode].label}. Adding ${nodes[startNode].label} to queue.`,
      visitedNodes: Array.from(visited),
      currentNode: null,
      traversalOrder: [],
      queue: [startNode],
      discoveredEdges: [],
      levelMap: { [startNode]: 0 }
    });

    visited.add(startNode);
    queue.push(startNode);
    traversalOrder.push(startNode);
    levelMap[startNode] = 0;

    while (queue.length > 0) {
      const node = queue.shift();

      steps.push({
        type: 'dequeue',
        message: `Dequeued node ${nodes[node].label}. Checking neighbors: ${adjacencyList[node].map(n => nodes[n].label).join(', ')}`,
        visitedNodes: Array.from(visited),
        currentNode: node,
        traversalOrder: [...traversalOrder],
        queue: [...queue],
        discoveredEdges: [...discoveredEdges],
        levelMap: { ...levelMap }
      });

      for (let neighbor of adjacencyList[node]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          traversalOrder.push(neighbor);
          queue.push(neighbor);
          levelMap[neighbor] = levelMap[node] + 1;
          discoveredEdges.push({ from: node, to: neighbor });

          steps.push({
            type: 'discover',
            message: `Found unvisited neighbor ${nodes[neighbor].label} from ${nodes[node].label}. Adding to queue at level ${levelMap[neighbor]}.`,
            visitedNodes: Array.from(visited),
            currentNode: node,
            neighborNode: neighbor,
            traversalOrder: [...traversalOrder],
            queue: [...queue],
            discoveredEdges: [...discoveredEdges],
            levelMap: { ...levelMap }
          });
        } else {
          steps.push({
            type: 'skip',
            message: `Neighbor ${nodes[neighbor].label} already visited.`,
            visitedNodes: Array.from(visited),
            currentNode: node,
            neighborNode: neighbor,
            traversalOrder: [...traversalOrder],
            queue: [...queue],
            discoveredEdges: [...discoveredEdges],
            levelMap: { ...levelMap }
          });
        }
      }

      steps.push({
        type: 'process',
        message: `Finished processing node ${nodes[node].label}.`,
        visitedNodes: Array.from(visited),
        currentNode: null,
        traversalOrder: [...traversalOrder],
        queue: [...queue],
        discoveredEdges: [...discoveredEdges],
        levelMap: { ...levelMap }
      });
    }

    steps.push({
      type: 'complete',
      message: `BFS Complete! Traversal order: ${traversalOrder.map(n => nodes[n].label).join(' → ')}`,
      visitedNodes: Array.from(visited),
      currentNode: null,
      traversalOrder: [...traversalOrder],
      queue: [],
      discoveredEdges: [...discoveredEdges],
      levelMap: { ...levelMap }
    });

    return { steps, result: { traversalOrder, discoveredEdges, levelMap } };
  }, [nodes, adjacencyList]);

  const runAlgorithm = () => {
    const algorithmResult = bfsAlgorithm();
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
    setCurrentNode(null);
    setTraversalOrder([]);
    setQueue([]);
    setDiscoveredEdges([]);
    setLevelMap({});
    runAlgorithm();
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  useEffect(() => {
    runAlgorithm();
  }, [bfsAlgorithm, nodes, adjacencyList, startNode]);

  useEffect(() => {
    if (isRunning && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, animationSpeed);
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length - 1) {
      isRunning && setIsRunning(false);
    }
  }, [isRunning, currentStep, steps.length, animationSpeed]);

  useEffect(() => {
    if (steps[currentStep]) {
      const step = steps[currentStep];
      setVisitedNodes(step.visitedNodes || []);
      setCurrentNode(step.currentNode !== undefined ? step.currentNode : null);
      setTraversalOrder(step.traversalOrder || []);
      setQueue(step.queue || []);
      setDiscoveredEdges(step.discoveredEdges || []);
      setLevelMap(step.levelMap || {});
    }
  }, [currentStep, steps]);

  const renderGraph = () => (
    <div className="space-y-6">
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <FaProjectDiagram className="text-blue-600" />
          Graph Visualization
        </h3>

        <svg width="100%" height="450" className="border-2 border-gray-300 rounded-lg bg-gray-50">
          {/* Draw edges */}
          {Object.entries(adjacencyList).map(([from, toList]) => 
            toList.map((to) => {
              if (parseInt(from) < to) {
                const fromNode = nodes[parseInt(from)];
                const toNode = nodes[to];
                const isDiscovered = discoveredEdges.some(e => 
                  (e.from === parseInt(from) && e.to === to) ||
                  (e.from === to && e.to === parseInt(from))
                );

                return (
                  <g key={`edge-${from}-${to}`}>
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={isDiscovered ? '#3B82F6' : '#D1D5DB'}
                      strokeWidth={isDiscovered ? 3 : 2}
                      className={isDiscovered ? 'animate-pulse' : ''}
                    />
                  </g>
                );
              }
              return null;
            })
          )}

          {/* Draw nodes */}
          {nodes.map((node) => {
            const isVisited = visitedNodes.includes(node.id);
            const isCurrent = currentNode === node.id;
            const level = levelMap[node.id];
            const visitOrder = traversalOrder.indexOf(node.id) + 1;

            return (
              <g key={`node-${node.id}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={35}
                  fill={isCurrent ? '#FCD34D' : isVisited ? '#10B981' : '#E5E7EB'}
                  stroke={isCurrent ? '#F59E0B' : isVisited ? '#059669' : '#9CA3AF'}
                  strokeWidth="3"
                  className={isCurrent ? 'animate-pulse' : ''}
                />
                <text
                  x={node.x}
                  y={node.y - 5}
                  textAnchor="middle"
                  dy="0.3em"
                  className="text-lg font-bold pointer-events-none select-none"
                  fill={isCurrent || isVisited ? 'white' : 'black'}
                  fontSize="20"
                >
                  {node.label}
                </text>
                {isVisited && (
                  <text
                    x={node.x}
                    y={node.y + 12}
                    textAnchor="middle"
                    className="text-xs font-semibold pointer-events-none select-none"
                    fill={isCurrent ? 'white' : 'white'}
                    fontSize="12"
                  >
                    #{visitOrder}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded p-3 border-l-4 border-blue-500">
            <div className="text-sm font-medium text-gray-600">Visited Nodes</div>
            <div className="text-2xl font-bold text-blue-600">{visitedNodes.length}</div>
          </div>
          <div className="bg-green-50 rounded p-3 border-l-4 border-green-500">
            <div className="text-sm font-medium text-gray-600">Discovered Edges</div>
            <div className="text-2xl font-bold text-green-600">{discoveredEdges.length}</div>
          </div>
          <div className="bg-purple-50 rounded p-3 border-l-4 border-purple-500">
            <div className="text-sm font-medium text-gray-600">Queue Size</div>
            <div className="text-2xl font-bold text-purple-600">{queue.length}</div>
          </div>
          <div className="bg-orange-50 rounded p-3 border-l-4 border-orange-500">
            <div className="text-sm font-medium text-gray-600">Max Level</div>
            <div className="text-2xl font-bold text-orange-600">
              {Object.keys(levelMap).length > 0 ? Math.max(...Object.values(levelMap)) : 0}
            </div>
          </div>
        </div>
      </div>

      {/* Traversal Order */}
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h4 className="text-lg font-semibold mb-4">Traversal Order (Level by Level)</h4>
        <div className="space-y-3">
          {Object.keys(levelMap).length > 0 ? (
            Array.from({ length: Math.max(...Object.values(levelMap)) + 1 }).map((_, level) => {
              const nodesAtLevel = Object.entries(levelMap)
                .filter(([_, l]) => l === level)
                .map(([nodeId, _]) => parseInt(nodeId));
              
              return (
                <div key={level} className="flex items-center gap-3">
                  <div className="bg-gray-700 text-white px-3 py-1 rounded-lg font-semibold text-sm min-w-20 text-center">
                    Level {level}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nodesAtLevel.map(nodeId => (
                      <div
                        key={nodeId}
                        className="bg-blue-500 text-white px-3 py-1 rounded-lg font-semibold"
                      >
                        {nodes[nodeId].label}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <span className="text-gray-500 italic">No nodes visited yet</span>
          )}
        </div>
      </div>

      {/* Full Traversal Order */}
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h4 className="text-lg font-semibold mb-4">Full Traversal Sequence</h4>
        <div className="flex flex-wrap gap-3">
          {traversalOrder.length > 0 ? (
            traversalOrder.map((nodeId, idx) => (
              <div key={idx} className="flex items-center">
                <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-lg">
                  {nodes[nodeId].label}
                </div>
                {idx < traversalOrder.length - 1 && (
                  <div className="mx-2 text-2xl text-gray-400">→</div>
                )}
              </div>
            ))
          ) : (
            <span className="text-gray-500 italic">No nodes visited yet</span>
          )}
        </div>
      </div>

      {/* Queue State */}
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h4 className="text-lg font-semibold mb-4">Queue State (FIFO)</h4>
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
          {queue.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 mb-2">Front → Rear</div>
              <div className="flex gap-2 flex-wrap">
                {queue.map((nodeId, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded font-semibold text-white ${
                      idx === 0 ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
                    }`}
                  >
                    {nodes[nodeId].label}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <span className="text-gray-500 italic">Queue is empty</span>
          )}
        </div>
      </div>

      {/* Edges Analysis */}
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h4 className="text-lg font-semibold mb-4">Tree Edges (BFS Edges)</h4>
        {discoveredEdges.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {discoveredEdges.map((edge, idx) => (
              <div key={idx} className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
                <div className="text-sm">
                  <span className="font-semibold">{nodes[edge.from].label}</span>
                  <span className="text-gray-500"> → </span>
                  <span className="font-semibold">{nodes[edge.to].label}</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Level: {levelMap[edge.from]} → {levelMap[edge.to]}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-gray-500 italic">No edges discovered yet</span>
        )}
      </div>
    </div>
  );

  const TheorySection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
        Breadth-First Search (BFS) Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">Overview</h3>
          <p className="text-gray-700">
            Breadth-First Search (BFS) is a graph traversal algorithm that explores all nodes at the present depth level before moving to nodes at the next depth level. It uses a queue (FIFO - First In First Out) data structure to maintain the order of nodes to visit. BFS is particularly useful for finding shortest paths in unweighted graphs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700">Key Characteristics</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>Graph traversal algorithm</li>
              <li>Uses queue (FIFO) data structure</li>
              <li>Explores breadth/level-by-level</li>
              <li>Always finds shortest path</li>
              <li>Time: O(V + E)</li>
              <li>Space: O(V)</li>
            </ul>
          </div>

          <div className="bg-cyan-50 rounded-lg p-4 border-l-4 border-cyan-500">
            <h4 className="font-semibold mb-2 text-cyan-700">Shortest Path Property</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>Finds shortest path in unweighted graphs</li>
              <li>Visits nodes by distance level</li>
              <li>Level = shortest distance from source</li>
              <li>Cannot handle weighted graphs</li>
              <li>Use Dijkstra for weighted graphs</li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700">Applications</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>Shortest path in unweighted graphs</li>
              <li>Level-order tree traversal</li>
              <li>Social network analysis</li>
              <li>Peer-to-peer networks</li>
              <li>Web crawling</li>
              <li>Connected components</li>
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
            <h4 className="font-semibold mb-2 text-yellow-700">BFS vs DFS</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>BFS: Uses queue (FIFO)</li>
              <li>DFS: Uses stack (LIFO)</li>
              <li>BFS: Broad exploration</li>
              <li>DFS: Deep exploration</li>
              <li>BFS: Better for shortest paths</li>
              <li>DFS: Better for topological sort</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">How BFS Works</h4>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700 text-sm">
            <li>Start from a source node and mark it as visited</li>
            <li>Enqueue the source node into the queue</li>
            <li>While queue is not empty:
              <ol className="list-alpha pl-5 mt-1">
                <li>Dequeue a node from the front</li>
                <li>Process the node</li>
                <li>For each unvisited neighbor, enqueue it</li>
              </ol>
            </li>
            <li>Repeat until queue is empty</li>
            <li>All nodes at level N are processed before level N+1</li>
          </ol>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 mb-6">
        Pseudocode
      </h2>

      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-semibold mb-3 text-lg">BFS - Using Queue</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-auto text-sm font-mono">
            <code>{`BFS(Graph G, Start vertex v):
  visited = empty set
  queue = empty queue
  traversal = empty list
  
  add v to visited
  enqueue(queue, v)
  
  while queue is not empty:
    node = dequeue(queue)
    add node to traversal
    
    for each neighbor of node:
      if neighbor not in visited:
        add neighbor to visited
        enqueue(queue, neighbor)
  
  return traversal`}</code>
          </pre>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-semibold mb-3 text-lg">BFS with Distance/Level Tracking</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-auto text-sm font-mono">
            <code>{`BFS_DISTANCE(Graph G, Start vertex v):
  visited = {v}
  queue = [v]
  distance = {v: 0}
  
  while queue is not empty:
    node = dequeue(queue)
    
    for each neighbor of node:
      if neighbor not in visited:
        add neighbor to visited
        distance[neighbor] = distance[node] + 1
        enqueue(queue, neighbor)
  
  return distance`}</code>
          </pre>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-semibold mb-3 text-lg">Shortest Path Using BFS</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-auto text-sm font-mono">
            <code>{`BFS_SHORTEST_PATH(Graph G, Start s, End t):
  visited = {s}
  queue = [s]
  parent = {s: null}
  
  while queue is not empty:
    node = dequeue(queue)
    
    if node == t:
      return RECONSTRUCT_PATH(parent, t)
    
    for each neighbor of node:
      if neighbor not in visited:
        add neighbor to visited
        parent[neighbor] = node
        enqueue(queue, neighbor)
  
  return "No path found"`}</code>
          </pre>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-semibold mb-2 text-yellow-900">Complexity Analysis</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold">Time Complexity: O(V + E)</p>
              <p className="text-xs mt-1">- V: vertices, E: edges</p>
              <p className="text-xs">- Each vertex & edge visited once</p>
            </div>
            <div>
              <p className="font-semibold">Space Complexity: O(V)</p>
              <p className="text-xs mt-1">- Visited set: O(V)</p>
              <p className="text-xs">- Queue: O(V) in worst case</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 mb-3">
            BFS Algorithm Visualizer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore how Breadth-First Search traverses a graph level by level to find the shortest path in unweighted graphs.
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

            {/* Custom Graph Input */}
            <div className="pt-4 border-t-2 border-gray-300 mt-4">
              <h4 className="font-semibold text-lg mb-3">Custom Graph Input</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nodes (comma-separated, max 12):
                  </label>
                  <input
                    type="text"
                    value={nodesInput}
                    onChange={(e) => setNodesInput(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="e.g., A, B, C, D"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Edges (format: A-B, comma-separated):
                  </label>
                  <input
                    type="text"
                    value={edgesInput}
                    onChange={(e) => setEdgesInput(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="e.g., A-B, B-C, C-D"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Node:
                  </label>
                  <input
                    type="text"
                    value={startNodeInput}
                    onChange={(e) => setStartNodeInput(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="e.g., A"
                  />
                </div>

                {errorMessage && (
                  <p className="text-red-600 text-sm">⚠️ {errorMessage}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={parseCustomGraph}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium text-sm"
                  >
                    Apply Custom Graph
                  </button>
                  <button
                    onClick={generateRandomGraph}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                  >
                    Generate Random
                  </button>
                  <button
                    onClick={resetToDefault}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
                  >
                    Reset to Default
                  </button>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <p className="font-semibold text-blue-800 mb-1">💡 Tips:</p>
                  <ul className="text-blue-700 space-y-1 ml-4">
                    <li>• Nodes: Single letters or numbers, comma-separated (e.g., A, B, C)</li>
                    <li>• Edges: Undirected format A-B creates bidirectional connection</li>
                    <li>• Max 12 nodes for optimal visualization</li>
                    <li>• Start node must be one of the defined nodes</li>
                  </ul>
                </div>
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

export default BFS;