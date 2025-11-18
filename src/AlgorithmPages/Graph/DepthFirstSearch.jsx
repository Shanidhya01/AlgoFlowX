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

// Pseudocode Component
function PseudoCode() {
  return (
    <div className="mt-4 bg-white shadow-md rounded-lg dark:bg-gray-800">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">DFS Pseudocode</h3>
        <pre className="text-sm bg-gray-100 p-4 rounded-md dark:bg-gray-700 dark:text-white overflow-x-auto">
{`function DFS(graph, start):
    stack = [start]
    visited = {}

    while stack not empty:
        node = stack.pop()
        if not visited[node]:
            visit(node)
            for neighbor in reverse(graph[node]):
                if not visited[neighbor]:
                    stack.push(neighbor)
`}
        </pre>
      </div>
    </div>
  );
}

// Theory Component
function Theory() {
  return (
    <div className="mt-4 bg-white shadow-md rounded-lg dark:bg-gray-800">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">DFS Theory</h3>

        <p className="dark:text-gray-300 mb-2">
          Depth First Search (DFS) explores as far as possible along each branch before backtracking.
        </p>

        <h4 className="font-semibold mt-3 dark:text-white">Applications</h4>
        <ul className="list-disc pl-5 space-y-1 dark:text-gray-300">
          <li>Cycle detection</li>
          <li>Solving mazes</li>
          <li>Topological sorting</li>
          <li>Connected components</li>
        </ul>

        <h4 className="font-semibold mt-3 dark:text-white">Time Complexity</h4>
        <p className="dark:text-gray-300">O(V + E)</p>
      </div>
    </div>
  );
}

// MAIN COMPONENT — DFS Visualization
export default function DFS() {
  const [adjListInput, setAdjListInput] = useState(
    "0:1,2\n1:3\n2:3\n3:"
  );
  const [startNode, setStartNode] = useState("0");

  const [steps, setSteps] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);

  const [showPseudoCode, setShowPseudoCode] = useState(false);
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

  // FULLY FIXED DFS
  const handleDFS = () => {
    const graph = parseGraph();
    if (!graph) return;

    if (!graph[startNode]) {
      setErrorMessage("Start node does not exist.");
      return;
    }

    setErrorMessage("");

    const localSteps = [];
    const localDescriptions = [];

    const record = (visited, stack, current) => {
      localSteps.push({
        visited: [...visited],
        stack: [...stack],
        current,
      });
    };

    const visited = new Set();
    const stack = [startNode];

    record(visited, stack, null);
    localDescriptions.push("Initialized stack with start node");

    while (stack.length > 0) {
      const node = stack.pop();
      record(visited, stack, node);
      localDescriptions.push(`Popped node ${node} from stack`);

      if (!visited.has(node)) {
        visited.add(node);
        record(visited, stack, node);
        localDescriptions.push(`Visited node ${node}`);

        const neighbors = graph[node];
        for (let i = neighbors.length - 1; i >= 0; i--) {
          if (!visited.has(neighbors[i])) {
            stack.push(neighbors[i]);
            record(visited, stack, node);
            localDescriptions.push(`Pushed neighbor ${neighbors[i]} onto stack`);
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
        <h2 className="text-2xl font-bold text-center dark:text-white">DFS Visualization</h2>

        {/* Input Section */}
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

          <Button onClick={handleDFS}>
            <Search className="mr-2 h-4 w-4" /> Start DFS
          </Button>

          <Button onClick={() => window.location.reload()} className="text-sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Reset
          </Button>

          <div className="flex gap-2">
            <Button onClick={() => setShowPseudoCode(!showPseudoCode)}>
              <Code className="mr-2 h-4 w-4" /> {showPseudoCode ? "Hide Code" : "Show Code"}
            </Button>

            <Button onClick={() => setShowTheory(!showTheory)}>
              <BookOpen className="mr-2 h-4 w-4" /> {showTheory ? "Hide Theory" : "Show Theory"}
            </Button>
          </div>
        </div>

        {/* Visualization */}
        {currentStep >= 0 && (
          <>
            {/* VISITED */}
            <h3 className="mt-6 text-lg font-semibold dark:text-white">Visited Nodes</h3>
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

            {/* ENHANCED STACK */}
            <h3 className="mt-6 text-lg font-semibold dark:text-white">Stack (Top → Bottom)</h3>

            <div className="flex justify-center mt-2">
              <div className="flex flex-col-reverse items-center bg-gray-200 dark:bg-gray-700 p-4 rounded-lg shadow-lg border border-gray-400">
                <AnimatePresence>
                  {current.stack?.length === 0 && (
                    <div className="text-gray-500 dark:text-gray-300 text-sm">
                      Empty Stack
                    </div>
                  )}

                  {current.stack?.map((item, index) => {
                    const isTop = index === current.stack.length - 1;
                    const justPushed =
                      currentStep > 0 &&
                      !steps[currentStep - 1].stack.includes(item);

                    const justPopped =
                      currentStep > 0 &&
                      steps[currentStep - 1].stack.includes(item) &&
                      !current.stack.includes(item);

                    return (
                      <motion.div
                        key={item}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`w-20 h-10 flex items-center justify-center mb-2 rounded-md border text-white 
                          ${
                            isTop
                              ? "bg-blue-700 border-blue-300"
                              : "bg-blue-500 border-blue-200"
                          }
                          ${
                            justPushed
                              ? "ring-2 ring-green-400"
                              : justPopped
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
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
              <p className="dark:text-white">{descriptions[currentStep]}</p>
            </div>

            {/* Navigation */}
            <div className="flex justify-center space-x-4 my-4">
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

        {showPseudoCode && <PseudoCode />}
        {showTheory && <Theory />}
      </div>
    </Card>
  );
}
