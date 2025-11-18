import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Code,
  BookOpen,
  RefreshCw,
  Search,
} from "lucide-react";

// UI COMPONENTS
function Button({ onClick, disabled, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 bg-black text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${className}`}
    >
      {children}
    </button>
  );
}

function Input({ type = "text", placeholder, onChange, className = "", value }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
}

function Card({ children, className = "" }) {
  return <div className={`bg-white shadow-md rounded-lg ${className}`}>{children}</div>;
}

// PSEUDOCODE
function PseudoCode() {
  return (
    <div className="mt-6 bg-white shadow-md rounded-lg dark:bg-gray-800">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">BFS Pseudocode</h3>
        <pre className="text-sm bg-gray-100 p-4 rounded-md dark:bg-gray-700 dark:text-white overflow-x-auto">
{`function BFS(graph, start):
    create empty queue
    enqueue(start)
    mark start as visited

    while queue not empty:
        node = queue.dequeue()
        process(node)

        for each neighbor of node:
            if not visited:
                enqueue(neighbor)
                mark visited
`}
        </pre>
      </div>
    </div>
  );
}

// THEORY
function Theory() {
  return (
    <div className="mt-6 bg-white shadow-md rounded-lg dark:bg-gray-800">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">BFS Theory</h3>
        <p className="dark:text-gray-300">
          BFS (Breadth First Search) explores the graph level-by-level using a queue (FIFO).
        </p>

        <h4 className="font-semibold mt-3 dark:text-white">Applications</h4>
        <ul className="list-disc pl-5 space-y-1 dark:text-gray-300">
          <li>Shortest path in unweighted graphs</li>
          <li>Tree level order traversal</li>
          <li>Connected components</li>
          <li>Network broadcast simulation</li>
        </ul>

        <h4 className="font-semibold mt-3 dark:text-white">Time Complexity</h4>
        <p className="dark:text-gray-300">O(V + E)</p>
      </div>
    </div>
  );
}

// MAIN COMPONENT
export default function BFS() {
  const [adjListInput, setAdjListInput] = useState(
    "0:1,2\n1:3\n2:4\n3:\n4:"
  );
  const [startNode, setStartNode] = useState("0");

  const [steps, setSteps] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);

  const [showPseudo, setShowPseudo] = useState(false);
  const [showTheory, setShowTheory] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Parse adjacency list
  const parseGraph = () => {
    try {
      const lines = adjListInput.split("\n");
      const graph = {};

      lines.forEach((line) => {
        const [node, neighbors] = line.split(":");
        graph[node.trim()] = neighbors
          ? neighbors.split(",").map((n) => n.trim()).filter((x) => x !== "")
          : [];
      });

      return graph;
    } catch {
      setErrorMessage("Invalid adjacency list format.");
      return null;
    }
  };

  // BFS Implementation
  const handleBFS = () => {
    const graph = parseGraph();
    if (!graph) return;

    if (!graph[startNode]) {
      setErrorMessage("Start node does not exist.");
      return;
    }

    setErrorMessage("");

    const localSteps = [];
    const localDescriptions = [];

    const record = (visited, queue, current) => {
      localSteps.push({
        visited: [...visited],
        queue: [...queue],
        current,
      });
    };

    const visited = new Set();
    const queue = [startNode];

    record(visited, queue, null);
    localDescriptions.push(`Enqueued start node ${startNode}`);

    while (queue.length > 0) {
      const node = queue.shift();
      record(visited, queue, node);
      localDescriptions.push(`Dequeued node ${node}`);

      if (!visited.has(node)) {
        visited.add(node);
        record(visited, queue, node);
        localDescriptions.push(`Visited node ${node}`);

        for (let nbr of graph[node]) {
          if (!visited.has(nbr)) {
            queue.push(nbr);
            record(visited, queue, node);
            localDescriptions.push(`Enqueued neighbor ${nbr}`);
          }
        }
      }
    }

    setSteps(localSteps);
    setDescriptions(localDescriptions);
    setCurrentStep(0);
  };

  const current = steps[currentStep] || {};

  return (
    <Card className="w-full max-w-3xl mx-auto dark:bg-gray-800 mt-6">
      <div className="p-6">

        <h2 className="text-2xl font-bold text-center dark:text-white">
          Breadth First Search (BFS) Visualization
        </h2>

        {/* INPUT SECTION */}
        <div className="mt-6 space-y-3">
          <label className="dark:text-white text-sm font-semibold">
            Adjacency List (Format: node:neighbors)
          </label>

          <textarea
            value={adjListInput}
            onChange={(e) => setAdjListInput(e.target.value)}
            rows={4}
            className="w-full p-3 border rounded dark:bg-gray-700 dark:text-white"
          />

          <Input
            placeholder="Start Node"
            value={startNode}
            onChange={(e) => setStartNode(e.target.value)}
            className="dark:bg-gray-700 dark:text-white"
          />

          {errorMessage && <p className="text-red-500">{errorMessage}</p>}

          <Button onClick={handleBFS}>
            <Search className="mr-2 h-4 w-4" /> Start BFS
          </Button>

          <Button onClick={() => window.location.reload()} className="text-sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Reset
          </Button>

          <div className="flex gap-3">
            <Button onClick={() => setShowPseudo(!showPseudo)}>
              <Code className="mr-2 h-4 w-4" /> {showPseudo ? "Hide Code" : "Show Code"}
            </Button>

            <Button onClick={() => setShowTheory(!showTheory)}>
              <BookOpen className="mr-2 h-4 w-4" /> {showTheory ? "Hide Theory" : "Show Theory"}
            </Button>
          </div>
        </div>

        {/* VISUALIZATION */}
        {currentStep >= 0 && (
          <>
            {/* VISITED SECTION */}
            <h3 className="mt-6 text-lg font-semibold dark:text-white">
              Visited Nodes
            </h3>

            <div className="flex flex-wrap gap-2 mt-2">
              {current.visited?.map((v) => (
                <motion.div
                  key={v}
                  className="w-10 h-10 bg-green-600 text-white flex items-center justify-center rounded"
                  animate={{ scale: 1.1 }}
                >
                  {v}
                </motion.div>
              ))}
            </div>

            {/* HORIZONTAL QUEUE */}
            <h3 className="mt-6 text-lg font-semibold dark:text-white">
              Queue (Front → Back)
            </h3>

            <div className="flex justify-center mt-4">
              <div className="flex flex-row items-center bg-gray-200 dark:bg-gray-700 p-4 rounded-lg shadow border border-gray-400 min-h-[70px] min-w-[100px]">

                <AnimatePresence>
                  {current.queue?.length === 0 && (
                    <div className="text-gray-500 dark:text-gray-300 text-sm">
                      Empty Queue
                    </div>
                  )}

                  {current.queue?.map((item, index) => {
                    const isFront = index === 0;
                    const isBack = index === current.queue.length - 1;

                    const justEnqueued =
                      currentStep > 0 &&
                      !steps[currentStep - 1].queue.includes(item);

                    const justDequeued =
                      currentStep > 0 &&
                      steps[currentStep - 1].queue.includes(item) &&
                      !current.queue.includes(item);

                    return (
                      <motion.div
                        key={item}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`w-16 h-10 mx-2 flex items-center justify-center rounded-md border text-white
                          ${
                            isFront
                              ? "bg-purple-700 border-purple-300"
                              : isBack
                              ? "bg-purple-600 border-purple-300"
                              : "bg-purple-500 border-purple-200"
                          }
                          ${
                            justEnqueued
                              ? "ring-2 ring-green-400"
                              : justDequeued
                              ? "ring-2 ring-red-400"
                              : ""
                          }
                        `}
                      >
                        {item}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <p className="dark:text-white">{descriptions[currentStep]}</p>
            </div>

            {/* NAVIGATION */}
            <div className="flex justify-center gap-4 my-4">
              <Button
                disabled={currentStep <= 0}
                onClick={() => setCurrentStep((p) => p - 1)}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>

              <Button
                disabled={currentStep >= steps.length - 1}
                onClick={() => setCurrentStep((p) => p + 1)}
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {showPseudo && <PseudoCode />}
        {showTheory && <Theory />}
      </div>
    </Card>
  );
}
