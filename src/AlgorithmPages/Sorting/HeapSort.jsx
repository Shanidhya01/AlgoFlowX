import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  RotateCcw,
  Code,
  BookOpen,
  RefreshCw,
} from "lucide-react";

// UI Components (same style as your BinarySearch)
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

function Input({ type, placeholder, onChange, className = "", value }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      className={`px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
}

function Card({ children, className = "" }) {
  return <div className={`bg-white shadow-md rounded-lg ${className}`}>{children}</div>;
}

// -----------------------------
// PSEUDOCODE
// -----------------------------
function PseudoCode() {
  return (
    <div className="mt-4 bg-white shadow-md rounded-lg dark:bg-gray-800">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">Heap Sort Pseudocode</h3>
        <pre className="text-sm bg-gray-100 p-4 rounded-md overflow-x-auto dark:bg-gray-700 dark:text-white">
{`function heapSort(arr):
    buildMaxHeap(arr)

    for i from n-1 down to 1:
        swap(arr[0], arr[i])
        heapify(arr, 0, i)

function heapify(arr, i, heapSize):
    largest = i
    left = 2*i + 1
    right = 2*i + 2

    if left < heapSize and arr[left] > arr[largest]:
        largest = left

    if right < heapSize and arr[right] > arr[largest]:
        largest = right

    if largest != i:
        swap(arr[i], arr[largest])
        heapify(arr, largest, heapSize)
`}
        </pre>
      </div>
    </div>
  );
}

// -----------------------------
// THEORY
// -----------------------------
function Theory() {
  return (
    <div className="mt-4 bg-white shadow-md rounded-lg dark:bg-gray-800">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2 dark:text-white">Heap Sort Theory</h3>
        <p className="mb-2 dark:text-white">
          Heap Sort is a comparison-based sorting technique based on a binary heap structure.
        </p>

        <h4 className="font-semibold mt-3 dark:text-white">Why is Heap Sort efficient?</h4>
        <ul className="list-disc pl-5 space-y-1 dark:text-white">
          <li>Time Complexity: O(n log n)</li>
          <li>Uses heap data structure</li>
          <li>No extra memory required (in-place)</li>
        </ul>

        <h4 className="font-semibold mt-3 dark:text-white">Steps:</h4>
        <ol className="list-decimal pl-5 space-y-1 dark:text-white">
          <li>Build a Max Heap from the array</li>
          <li>Swap the root with the last element</li>
          <li>Reduce heap size and heapify again</li>
          <li>Repeat until fully sorted</li>
        </ol>
      </div>
    </div>
  );
}

// =======================================================
// MAIN COMPONENT
// =======================================================
export default function HeapSort() {
  const [array, setArray] = useState([]);
  const [steps, setSteps] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [customArrayInput, setCustomArrayInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [showPseudoCode, setShowPseudoCode] = useState(false);
  const [showTheory, setShowTheory] = useState(false);

  // Generate default array
  useEffect(() => {
    const arr = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 99 + 1)
    );
    setArray(arr);
    setCustomArrayInput(arr.join(", "));
  }, []);

  // -----------------------------
  // VALIDATE CUSTOM ARRAY
  // -----------------------------
  const handleCustomArrayInput = (input) => {
    setCustomArrayInput(input);

    try {
      const newArray = input.split(",").map((num) => {
        const parsed = parseInt(num.trim(), 10);
        if (isNaN(parsed)) throw new Error("Invalid number");
        return parsed;
      });

      if (newArray.length === 0) throw new Error("Array cannot be empty");

      setArray(newArray);
      setErrorMessage("");
    } catch (e) {
      setErrorMessage(e.message);
    }
  };

  // -----------------------------
  // HEAP SORT SIMULATION
  // -----------------------------
  const recordStep = (arr, desc, highlight = {}) => {
    setSteps((prev) => [...prev, { arr: [...arr], highlight }]);
    setDescriptions((prev) => [...prev, desc]);
  };

  const heapify = (arr, i, size) => {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < size && arr[left] > arr[largest]) largest = left;
    if (right < size && arr[right] > arr[largest]) largest = right;

    recordStep(arr, `Checking children of index ${i}`, { i, left, right });

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      recordStep(arr, `Swapped ${arr[i]} with ${arr[largest]}`, { i, largest });
      heapify(arr, largest, size);
    }
  };

  const runHeapSort = () => {
    const arr = [...array];
    setSteps([]);
    setDescriptions([]);
    setCurrentStep(0);

    const n = arr.length;

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      recordStep(arr, `Heapifying index ${i}`, { i });
      heapify(arr, i, n);
    }

    // Extract elements
    for (let i = n - 1; i >= 1; i--) {
      [arr[0], arr[i]] = [arr[i], arr[0]];
      recordStep(arr, `Swapped max element with index ${i}`, { i, root: 0 });
      heapify(arr, 0, i);
    }
  };

  const current = steps[currentStep] || {};

  return (
    <Card className="w-full max-w-4xl mx-auto dark:bg-gray-800">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center dark:text-white">
          Heap Sort Visualization
        </h2>

        {/* Controls */}
        <div className="flex flex-col space-y-4 mt-6 mb-4">
          <Input
            type="text"
            value={customArrayInput}
            onChange={(e) => handleCustomArrayInput(e.target.value)}
            placeholder="Enter array (comma-separated)"
            className="dark:bg-gray-700 dark:text-white"
          />

          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

          <Button onClick={runHeapSort}>
            <Search className="mr-2 h-4 w-4" /> Start Heap Sort
          </Button>

          <Button onClick={() => window.location.reload()} className="text-sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Reset Array
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
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {(current.arr || array).map((num, idx) => {
            const isHighlight = current.highlight && Object.values(current.highlight).includes(idx);
            return (
              <motion.div
                key={idx}
                className={`w-12 h-12 flex items-center justify-center border rounded 
                  ${isHighlight ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                animate={{ scale: isHighlight ? 1.1 : 1 }}
              >
                {num}
              </motion.div>
            );
          })}
        </div>

        {/* Step Navigation */}
        {steps.length > 0 && (
          <div className="flex justify-center space-x-4 my-4">
            <Button disabled={currentStep <= 0}
              onClick={() => setCurrentStep((prev) => prev - 1)}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Prev
            </Button>

            <Button disabled={currentStep >= steps.length - 1}
              onClick={() => setCurrentStep((prev) => prev + 1)}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {currentStep >= 0 && (
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
            <p className="dark:text-white">{descriptions[currentStep]}</p>
          </div>
        )}

        {showPseudoCode && <PseudoCode />}
        {showTheory && <Theory />}
      </div>
    </Card>
  );
}
