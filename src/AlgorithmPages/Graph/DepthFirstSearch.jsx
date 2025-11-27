import React, { useState, useEffect, useCallback } from 'react';
import { FaPlay, FaPause, FaUndo, FaStepForward, FaCode, FaBookOpen, FaProjectDiagram } from 'react-icons/fa';

function DFS() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  // Default graph setup
  const defaultNodes = [
    { id: 0, label: 'A', x: 100, y: 100 },
    { id: 1, label: 'B', x: 300, y: 50 },
    { id: 2, label: 'C', x: 500, y: 100 },
    { id: 3, label: 'D', x: 200, y: 250 },
    { id: 4, label: 'E', x: 400, y: 280 },
    { id: 5, label: 'F', x: 100, y: 350 }
  ];

  const defaultAdjacencyList = {
    0: [1, 3],      // A -> B, D
    1: [0, 2, 3],   // B -> A, C, D
    2: [1, 4],      // C -> B, E
    3: [0, 1, 5],   // D -> A, B, F
    4: [2, 5],      // E -> C, F
    5: [3, 4]       // F -> D, E
  };

  // Graph nodes
  const [nodes, setNodes] = useState(defaultNodes);
  const [adjacencyList, setAdjacencyList] = useState(defaultAdjacencyList);
  const [startNode, setStartNode] = useState(0);

  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [traversalOrder, setTraversalOrder] = useState([]);
  const [stack, setStack] = useState([]);
  const [discoveredEdges, setDiscoveredEdges] = useState([]);
  const [backEdges, setBackEdges] = useState([]);

  // Custom input states
  const [nodesInput, setNodesInput] = useState('A, B, C, D, E, F');
  const [edgesInput, setEdgesInput] = useState('A-B, A-D, B-C, B-D, C-E, D-F, E-F');
  const [startNodeInput, setStartNodeInput] = useState('A');
  const [errorMessage, setErrorMessage] = useState('');

  const parseCustomGraph = useCallback(() => {
    try {
      // Parse nodes
      const nodeLabels = nodesInput
        .split(',')
        .map(n => n.trim())
        .filter(n => n.length > 0);

      if (nodeLabels.length === 0) {
        throw new Error('Please enter at least one node');
      }

      if (nodeLabels.length > 12) {
        throw new Error('Maximum 12 nodes allowed');
      }

      // Check for duplicate nodes
      const uniqueNodes = new Set(nodeLabels);
      if (uniqueNodes.size !== nodeLabels.length) {
        throw new Error('Duplicate nodes found');
      }

      // Create node objects with positions
      const cols = Math.ceil(Math.sqrt(nodeLabels.length));
      const newNodes = nodeLabels.map((label, idx) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        return {
          id: idx,
          label: label,
          x: 100 + col * 180,
          y: 100 + row * 150
        };
      });

      // Parse edges
      const newAdjacencyList = {};
      nodeLabels.forEach((_, idx) => {
        newAdjacencyList[idx] = [];
      });

      if (edgesInput.trim().length > 0) {
        const edgePairs = edgesInput.split(',').map(e => e.trim());
        for (const pair of edgePairs) {
          const match = pair.match(/^([A-Za-z0-9]+)\s*-\s*([A-Za-z0-9]+)$/);
          if (!match) {
            throw new Error(`Invalid edge format: "${pair}". Use format: A-B`);
          }
          const [, from, to] = match;
          const fromIdx = nodeLabels.indexOf(from);
          const toIdx = nodeLabels.indexOf(to);

          if (fromIdx === -1) {
            throw new Error(`Node "${from}" not found in nodes list`);
          }
          if (toIdx === -1) {
            throw new Error(`Node "${to}" not found in nodes list`);
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

      // Parse start node
      const startIdx = nodeLabels.indexOf(startNodeInput.trim());
      if (startIdx === -1) {
        throw new Error(`Start node "${startNodeInput}" not found in nodes list`);
      }

      setNodes(newNodes);
      setAdjacencyList(newAdjacencyList);
      setStartNode(startIdx);
      setErrorMessage('');
      setSteps([]);
      setCurrentStep(0);
      setIsRunning(false);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }, [nodesInput, edgesInput, startNodeInput]);

  const generateRandomGraph = () => {
    const nodeCount = Math.floor(Math.random() * 4) + 4; // 4-7 nodes
    const nodeLabels = Array.from({ length: nodeCount }, (_, i) => 
      String.fromCharCode(65 + i)
    );

    // Generate random edges
    const edges = [];
    const edgeSet = new Set();
    
    // Ensure connected graph - create a path
    for (let i = 0; i < nodeCount - 1; i++) {
      edges.push(`${nodeLabels[i]}-${nodeLabels[i + 1]}`);
      edgeSet.add(`${i}-${i+1}`);
    }

    // Add random additional edges
    const extraEdges = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < extraEdges; i++) {
      const from = Math.floor(Math.random() * nodeCount);
      const to = Math.floor(Math.random() * nodeCount);
      if (from !== to && !edgeSet.has(`${from}-${to}`) && !edgeSet.has(`${to}-${from}`)) {
        edges.push(`${nodeLabels[from]}-${nodeLabels[to]}`);
        edgeSet.add(`${from}-${to}`);
      }
    }

    setNodesInput(nodeLabels.join(', '));
    setEdgesInput(edges.join(', '));
    setStartNodeInput(nodeLabels[0]);
    setErrorMessage('');
  };

  const resetToDefault = () => {
    setNodes(defaultNodes);
    setAdjacencyList(defaultAdjacencyList);
    setStartNode(0);
    setNodesInput('A, B, C, D, E, F');
    setEdgesInput('A-B, A-D, B-C, B-D, C-E, D-F, E-F');
    setStartNodeInput('A');
    setErrorMessage('');
    setSteps([]);
    setCurrentStep(0);
    setIsRunning(false);
  };

  const dfsAlgorithm = useCallback(() => {
    const steps = [];
    const visited = new Set();
    const traversalOrder = [];
    const stack = [];
    const discoveredEdges = [];
    const backEdges = [];

    const startNodeLabel = nodes.find(n => n.id === startNode)?.label || 'A';

    steps.push({
      type: 'initialize',
      message: `Initializing DFS from node ${startNodeLabel}. Pushing ${startNodeLabel} to stack.`,
      visitedNodes: Array.from(visited),
      currentNode: null,
      traversalOrder: [],
      stack: [startNode],
      discoveredEdges: [],
      backEdges: []
    });

    stack.push(startNode);

    while (stack.length > 0) {
      const node = stack[stack.length - 1];

      steps.push({
        type: 'visit',
        message: `Visiting node ${nodes[node].label}. Checking neighbors: ${adjacencyList[node].map(n => nodes[n].label).join(', ')}`,
        visitedNodes: Array.from(visited),
        currentNode: node,
        traversalOrder: [...traversalOrder],
        stack: [...stack],
        discoveredEdges: [...discoveredEdges],
        backEdges: [...backEdges]
      });

      if (!visited.has(node)) {
        visited.add(node);
        traversalOrder.push(node);

        steps.push({
          type: 'mark',
          message: `Marked node ${nodes[node].label} as visited (Visit order: ${traversalOrder.length})`,
          visitedNodes: Array.from(visited),
          currentNode: node,
          traversalOrder: [...traversalOrder],
          stack: [...stack],
          discoveredEdges: [...discoveredEdges],
          backEdges: [...backEdges]
        });
      }

      let foundUnvisited = false;

      for (let neighbor of adjacencyList[node]) {
        if (!visited.has(neighbor)) {
          foundUnvisited = true;

          steps.push({
            type: 'discover',
            message: `Found unvisited neighbor ${nodes[neighbor].label} from ${nodes[node].label}. Pushing to stack.`,
            visitedNodes: Array.from(visited),
            currentNode: node,
            neighborNode: neighbor,
            traversalOrder: [...traversalOrder],
            stack: [...stack, neighbor],
            discoveredEdges: [...discoveredEdges, { from: node, to: neighbor }],
            backEdges: [...backEdges]
          });

          discoveredEdges.push({ from: node, to: neighbor });
          stack.push(neighbor);
          break;
        } else {
          steps.push({
            type: 'skip',
            message: `Neighbor ${nodes[neighbor].label} already visited (back edge).`,
            visitedNodes: Array.from(visited),
            currentNode: node,
            neighborNode: neighbor,
            traversalOrder: [...traversalOrder],
            stack: [...stack],
            discoveredEdges: [...discoveredEdges],
            backEdges: [...backEdges, { from: node, to: neighbor }]
          });

          backEdges.push({ from: node, to: neighbor });
        }
      }

      if (!foundUnvisited) {
        stack.pop();

        steps.push({
          type: 'backtrack',
          message: `No unvisited neighbors from ${nodes[node].label}. Backtracking (popping from stack).`,
          visitedNodes: Array.from(visited),
          currentNode: null,
          traversalOrder: [...traversalOrder],
          stack: [...stack],
          discoveredEdges: [...discoveredEdges],
          backEdges: [...backEdges]
        });
      }
    }

    steps.push({
      type: 'complete',
      message: `DFS Complete! Traversal order: ${traversalOrder.map(n => nodes[n].label).join(' → ')}`,
      visitedNodes: Array.from(visited),
      currentNode: null,
      traversalOrder: [...traversalOrder],
      stack: [],
      discoveredEdges: [...discoveredEdges],
      backEdges: [...backEdges]
    });

    return { steps, result: { traversalOrder, discoveredEdges, backEdges } };
  }, [nodes, adjacencyList]);

  const runAlgorithm = () => {
    const algorithmResult = dfsAlgorithm();
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
    setStack([]);
    setDiscoveredEdges([]);
    setBackEdges([]);
    runAlgorithm();
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  useEffect(() => {
    runAlgorithm();
  }, [dfsAlgorithm]);

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
      setCurrentNode(step.currentNode !== undefined ? step.currentNode : null);
      setTraversalOrder(step.traversalOrder || []);
      setStack(step.stack || []);
      setDiscoveredEdges(step.discoveredEdges || []);
      setBackEdges(step.backEdges || []);
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
            toList.map((to, idx) => {
              if (parseInt(from) < to) {
                const fromNode = nodes[parseInt(from)];
                const toNode = nodes[to];
                const isDiscovered = discoveredEdges.some(e => 
                  (e.from === parseInt(from) && e.to === to) ||
                  (e.from === to && e.to === parseInt(from))
                );
                const isBack = backEdges.some(e =>
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
                      stroke={isBack ? '#EF4444' : isDiscovered ? '#10B981' : '#D1D5DB'}
                      strokeWidth={isBack || isDiscovered ? 3 : 2}
                      strokeDasharray={isBack ? '5,5' : '0'}
                      className={isDiscovered || isBack ? 'animate-pulse' : ''}
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
          <div className="bg-red-50 rounded p-3 border-l-4 border-red-500">
            <div className="text-sm font-medium text-gray-600">Back Edges</div>
            <div className="text-2xl font-bold text-red-600">{backEdges.length}</div>
          </div>
          <div className="bg-purple-50 rounded p-3 border-l-4 border-purple-500">
            <div className="text-sm font-medium text-gray-600">Stack Size</div>
            <div className="text-2xl font-bold text-purple-600">{stack.length}</div>
          </div>
        </div>
      </div>

      {/* Traversal Order */}
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h4 className="text-lg font-semibold mb-4">Traversal Order</h4>
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

      {/* Stack State */}
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h4 className="text-lg font-semibold mb-4">Stack State (LIFO)</h4>
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
          {stack.length > 0 ? (
            <div className="space-y-2">
              {[...stack].reverse().map((nodeId, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded text-white font-semibold text-center ${
                    idx === 0 ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
                  }`}
                >
                  {nodes[nodeId].label}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-gray-500 italic">Stack is empty</span>
          )}
        </div>
      </div>

      {/* Edge Analysis */}
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h4 className="text-lg font-semibold mb-4">Edge Analysis</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <h5 className="font-semibold mb-3 text-green-700">Discovered Edges (Tree Edges)</h5>
            {discoveredEdges.length > 0 ? (
              <div className="space-y-2">
                {discoveredEdges.map((edge, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-semibold">{nodes[edge.from].label}</span>
                    <span className="text-gray-500"> → </span>
                    <span className="font-semibold">{nodes[edge.to].label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-gray-500 italic text-sm">No edges discovered yet</span>
            )}
          </div>

          <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
            <h5 className="font-semibold mb-3 text-red-700">Back Edges</h5>
            {backEdges.length > 0 ? (
              <div className="space-y-2">
                {backEdges.map((edge, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-semibold">{nodes[edge.from].label}</span>
                    <span className="text-gray-500"> ⤴ </span>
                    <span className="font-semibold">{nodes[edge.to].label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-gray-500 italic text-sm">No back edges yet</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const TheorySection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Depth-First Search (DFS) Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">Overview</h3>
          <p className="text-gray-700">
            Depth-First Search (DFS) is a graph traversal algorithm that explores as far as possible along each branch before backtracking. It uses a stack (LIFO - Last In First Out) data structure to keep track of nodes to visit. DFS starts from a source node and explores each neighbor deeply before exploring other branches.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700">Key Characteristics</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>Graph traversal algorithm</li>
              <li>Uses stack data structure</li>
              <li>Explores depth first</li>
              <li>Can be recursive or iterative</li>
              <li>Time: O(V + E)</li>
              <li>Space: O(V)</li>
            </ul>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
            <h4 className="font-semibold mb-2 text-purple-700">Edge Types</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li><span className="font-semibold">Tree Edge</span>: Leads to unvisited node</li>
              <li><span className="font-semibold">Back Edge</span>: Leads to ancestor</li>
              <li><span className="font-semibold">Forward Edge</span>: Leads to descendant</li>
              <li><span className="font-semibold">Cross Edge</span>: Other connections</li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700">Applications</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>Topological sorting</li>
              <li>Cycle detection</li>
              <li>Path finding</li>
              <li>Maze solving</li>
              <li>Strongly connected components</li>
              <li>Backtracking problems</li>
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
            <h4 className="font-semibold mb-2 text-yellow-700">vs BFS</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>DFS: Uses stack (LIFO)</li>
              <li>BFS: Uses queue (FIFO)</li>
              <li>DFS: Deep exploration</li>
              <li>BFS: Broad exploration</li>
              <li>DFS: Uses less memory initially</li>
              <li>BFS: Better for shortest path</li>
            </ul>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">How DFS Works</h4>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700 text-sm">
            <li>Start from a source node and mark it as visited</li>
            <li>Push the source node onto the stack</li>
            <li>While stack is not empty:
              <ol className="list-alpha pl-5 mt-1">
                <li>Pop a node from the stack</li>
                <li>For each unvisited neighbor, push it to the stack</li>
                <li>If no unvisited neighbors, backtrack</li>
              </ol>
            </li>
            <li>Repeat until stack is empty</li>
          </ol>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
        Pseudocode
      </h2>

      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-semibold mb-3 text-lg">DFS - Iterative (Using Stack)</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-auto text-sm font-mono">
            <code>{`DFS_ITERATIVE(Graph G, Start vertex v):
  visited = empty set
  stack = empty stack
  traversal = empty list
  
  push(stack, v)
  
  while stack is not empty:
    node = pop(stack)
    
    if node not in visited:
      add node to visited
      add node to traversal
      
      for each neighbor of node:
        if neighbor not in visited:
          push(stack, neighbor)
  
  return traversal`}</code>
          </pre>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-semibold mb-3 text-lg">DFS - Recursive</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-auto text-sm font-mono">
            <code>{`DFS_RECURSIVE(Graph G, Vertex v, visited set):
  add v to visited
  process(v)  // or add to traversal list
  
  for each neighbor u of v:
    if u not in visited:
      DFS_RECURSIVE(G, u, visited)

MAIN:
  visited = empty set
  DFS_RECURSIVE(G, start_vertex, visited)`}</code>
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
              <p className="text-xs">- Recursion/Stack: O(h) where h = height</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
            DFS Algorithm Visualizer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore how Depth-First Search traverses a graph by going as deep as possible before backtracking.
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

export default DFS;