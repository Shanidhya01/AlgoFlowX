import React, { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, Zap } from "lucide-react";

export default function HeapSort() {
  const [array, setArray] = useState([]);
  const [originalArray, setOriginalArray] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [customInput, setCustomInput] = useState("");
  const [activeTab, setActiveTab] = useState("visualizer");

  // Generate initial array
  useEffect(() => {
    generateRandomArray();
  }, []);

  const generateRandomArray = () => {
    const newArray = Array.from({ length: 8 }, () => 
      Math.floor(Math.random() * 99) + 1
    );
    setArray(newArray);
    setOriginalArray(newArray);
    setSteps([]);
    setCurrentStepIndex(0);
    setIsRunning(false);
  };

  const handleCustomInput = (input) => {
    setCustomInput(input);
    try {
      const parsed = input
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      
      if (parsed.length > 0 && parsed.length <= 20) {
        setArray(parsed);
        setOriginalArray(parsed);
        setSteps([]);
        setCurrentStepIndex(0);
        setIsRunning(false);
      }
    } catch (error) {
      console.error("Invalid input");
    }
  };

  // Heap Sort Algorithm
  const heapSort = useCallback(() => {
    const arr = [...array];
    const newSteps = [];
    let heapifyCount = 0;
    let swapCount = 0;
    const n = arr.length;

    newSteps.push({
      array: [...arr],
      message: "Starting Heap Sort - Building Max Heap",
      heapifyCount,
      swapCount,
      currentStep: "initialize",
    });

    // Heapify helper function
    const heapify = (arr, n, i, depth = 0) => {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      newSteps.push({
        array: [...arr],
        message: `Heapifying at index ${i} (value: ${arr[i]})`,
        heapifyCount: ++heapifyCount,
        swapCount,
        currentStep: "heapify",
        heapifyIndex: i,
        leftChild: left < n ? left : null,
        rightChild: right < n ? right : null,
      });

      if (left < n && arr[left] > arr[largest]) {
        largest = left;
      }

      if (right < n && arr[right] > arr[largest]) {
        largest = right;
      }

      if (largest !== i) {
        newSteps.push({
          array: [...arr],
          message: `Swapping ${arr[i]} (index ${i}) with ${arr[largest]} (index ${largest})`,
          heapifyCount,
          swapCount: ++swapCount,
          currentStep: "swap",
          swapping: [i, largest],
        });

        [arr[i], arr[largest]] = [arr[largest], arr[i]];

        newSteps.push({
          array: [...arr],
          message: `After swap, continue heapifying at index ${largest}`,
          heapifyCount,
          swapCount,
          currentStep: "heapify",
          heapifyIndex: largest,
        });

        heapify(arr, n, largest, depth + 1);
      }
    };

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      newSteps.push({
        array: [...arr],
        message: `Building heap: heapifying subtree at index ${i}`,
        heapifyCount,
        swapCount,
        currentStep: "build_heap",
        buildingAt: i,
      });
      heapify(arr, n, i);
    }

    newSteps.push({
      array: [...arr],
      message: "Max Heap built! Now extracting elements one by one",
      heapifyCount,
      swapCount,
      currentStep: "heap_built",
    });

    // Extract elements from heap
    for (let i = n - 1; i > 0; i--) {
      newSteps.push({
        array: [...arr],
        message: `Extracting max element: moving ${arr[0]} to position ${i}`,
        heapifyCount,
        swapCount: ++swapCount,
        currentStep: "extract",
        extracting: [0, i],
      });

      [arr[0], arr[i]] = [arr[i], arr[0]];

      newSteps.push({
        array: [...arr],
        message: `After extraction, sorted portion: [${i}, ${n-1}]. Heapifying remaining heap`,
        heapifyCount,
        swapCount,
        currentStep: "extracted",
        sortedFrom: i,
      });

      heapify(arr, i, 0);
    }

    newSteps.push({
      array: [...arr],
      message: "Heap Sort complete! All elements are sorted.",
      heapifyCount,
      swapCount,
      currentStep: "complete",
      sorted: true,
    });

    setSteps(newSteps);
    setCurrentStepIndex(0);
  }, [array]);

  // Animation control
  useEffect(() => {
    if (!isRunning || currentStepIndex >= steps.length - 1) {
      setIsRunning(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => prev + 1);
    }, animationSpeed);

    return () => clearTimeout(timer);
  }, [isRunning, currentStepIndex, steps.length, animationSpeed]);

  const handleSort = () => {
    if (steps.length === 0) {
      heapSort();
    }
    setIsRunning(true);
  };

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  const stepForward = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const resetAnimation = () => {
    setArray(originalArray);
    setSteps([]);
    setCurrentStepIndex(0);
    setIsRunning(false);
  };

  const currentStepData = steps[currentStepIndex] || {};
  const displayArray = currentStepData.array || array;

  // Render Array Visualization
  const renderVisualizer = () => {
    return (
      <div className="space-y-6">
        {/* Array Display */}
        <div className="flex flex-wrap justify-center gap-3">
          {displayArray.map((value, idx) => {
            let bgColor = "bg-blue-500 dark:bg-blue-700";
            
            if (currentStepData.sorted || (currentStepData.sortedFrom !== undefined && idx >= currentStepData.sortedFrom)) {
              bgColor = "bg-green-500 dark:bg-green-700";
            } else if (currentStepData.heapifyIndex === idx) {
              bgColor = "bg-purple-500 dark:bg-purple-700";
            } else if (currentStepData.swapping?.includes(idx)) {
              bgColor = "bg-yellow-400 dark:bg-yellow-600";
            } else if (currentStepData.extracting?.includes(idx)) {
              bgColor = "bg-orange-400 dark:bg-orange-600";
            } else if (currentStepData.buildingAt === idx) {
              bgColor = "bg-pink-400 dark:bg-pink-600";
            } else if (currentStepData.leftChild === idx || currentStepData.rightChild === idx) {
              bgColor = "bg-cyan-400 dark:bg-cyan-600";
            }

            return (
              <div
                key={idx}
                className={`${bgColor} text-white font-bold rounded-lg shadow-lg 
                  flex items-center justify-center transition-all duration-300 w-14 h-14 text-lg`}
              >
                {value}
              </div>
            );
          })}
        </div>

        {/* Statistics */}
        {steps.length > 0 && (
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Heapify Calls</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {currentStepData.heapifyCount || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Swaps</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {currentStepData.swapCount || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Step</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {currentStepIndex + 1} / {steps.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        {currentStepData.message && (
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <p className="text-center text-gray-800 dark:text-white font-medium">
              {currentStepData.message}
            </p>
          </div>
        )}

        {/* Color Legend */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Color Legend
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 italic">
            Colors appear during sorting animation
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 dark:bg-blue-700 rounded border border-gray-400"></div>
              <span className="text-gray-700 dark:text-gray-300">Unsorted elements</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 dark:bg-purple-700 rounded border border-gray-400"></div>
              <span className="text-gray-700 dark:text-gray-300">Heapifying at index</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 dark:bg-yellow-600 rounded border border-gray-400"></div>
              <span className="text-gray-700 dark:text-gray-300">Swapping elements</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-400 dark:bg-orange-600 rounded border border-gray-400"></div>
              <span className="text-gray-700 dark:text-gray-300">Extracting max</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-cyan-400 dark:bg-cyan-600 rounded border border-gray-400"></div>
              <span className="text-gray-700 dark:text-gray-300">Child nodes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 dark:bg-green-700 rounded border border-gray-400"></div>
              <span className="text-gray-700 dark:text-gray-300">Sorted elements</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Theory Section
  const renderTheory = () => {
    return (
      <div className="prose dark:prose-invert max-w-none">
        <h3 className="text-xl font-bold mb-4">What is Heap Sort?</h3>
        <p className="mb-4">
          Heap Sort is a comparison-based sorting algorithm that uses a binary heap data structure. 
          It divides its input into a sorted and an unsorted region, and iteratively shrinks the unsorted 
          region by extracting the largest element and moving it to the sorted region.
        </p>

        <h4 className="text-lg font-semibold mt-6 mb-3">Key Characteristics:</h4>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>In-place sorting:</strong> Uses only a constant amount of extra space</li>
          <li><strong>Not stable:</strong> May change the relative order of equal elements</li>
          <li><strong>Comparison-based:</strong> Works by comparing elements</li>
          <li><strong>Heap structure:</strong> Uses complete binary tree property</li>
        </ul>

        <h4 className="text-lg font-semibold mt-6 mb-3">How It Works:</h4>
        <ol className="list-decimal pl-6 space-y-2">
          <li><strong>Build Max Heap:</strong> Convert the array into a max heap where parent nodes are greater than children</li>
          <li><strong>Extract Maximum:</strong> Swap the root (maximum element) with the last element</li>
          <li><strong>Heapify:</strong> Restore the heap property for the reduced heap</li>
          <li><strong>Repeat:</strong> Continue until all elements are sorted</li>
        </ol>

        <h4 className="text-lg font-semibold mt-6 mb-3">When to Use Heap Sort:</h4>
        <ul className="list-disc pl-6 space-y-2">
          <li>When consistent O(n log n) performance is required</li>
          <li>When in-place sorting is necessary (limited memory)</li>
          <li>When you need to find the k largest/smallest elements</li>
          <li>For priority queue implementations</li>
        </ul>

        <h4 className="text-lg font-semibold mt-6 mb-3">Time Complexity:</h4>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Best Case:</strong> O(n log n)</li>
          <li><strong>Average Case:</strong> O(n log n)</li>
          <li><strong>Worst Case:</strong> O(n log n)</li>
        </ul>

        <h4 className="text-lg font-semibold mt-6 mb-3">Space Complexity:</h4>
        <p>O(1) - Sorts in place with only constant extra space for variables</p>
      </div>
    );
  };

  // Pseudocode Section
  const renderPseudocode = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold mb-4">Heap Sort Pseudocode</h3>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
{`function heapSort(arr):
    n = length of arr
    
    // Build max heap
    for i from floor(n/2) - 1 down to 0:
        heapify(arr, n, i)
    
    // Extract elements from heap one by one
    for i from n-1 down to 1:
        swap(arr[0], arr[i])  // Move current root to end
        heapify(arr, i, 0)     // Heapify reduced heap

function heapify(arr, heapSize, rootIndex):
    largest = rootIndex
    leftChild = 2 * rootIndex + 1
    rightChild = 2 * rootIndex + 2
    
    // Check if left child is larger than root
    if leftChild < heapSize and arr[leftChild] > arr[largest]:
        largest = leftChild
    
    // Check if right child is larger than largest so far
    if rightChild < heapSize and arr[rightChild] > arr[largest]:
        largest = rightChild
    
    // If largest is not root, swap and continue heapifying
    if largest != rootIndex:
        swap(arr[rootIndex], arr[largest])
        heapify(arr, heapSize, largest)`}
        </pre>

        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mt-4">
          <h4 className="font-semibold mb-2">Advantages:</h4>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Guaranteed O(n log n) performance in all cases</li>
            <li>In-place sorting with O(1) space complexity</li>
            <li>No worst-case quadratic behavior like Quick Sort</li>
            <li>Good for systems with limited memory</li>
          </ul>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Disadvantages:</h4>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Not stable - equal elements may be rearranged</li>
            <li>Generally slower than Quick Sort in practice</li>
            <li>Poor cache locality compared to other O(n log n) algorithms</li>
            <li>More complex to understand and implement than simpler sorts</li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
            Heap Sort
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Watch the algorithm build a max heap and extract elements one by one to achieve sorted order.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 shadow-lg mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: "visualizer", label: "Visualizer", icon: Zap },
              { id: "theory", label: "Theory", icon: BookOpen },
              { id: "pseudocode", label: "Algorithm", icon: Code }
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    activeTab === t.id
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <Icon size={18} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        {activeTab === "visualizer" && (
          <div className="bg-white/80 dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <button
                onClick={handleSort}
                disabled={isRunning || steps.length > 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                <Zap size={18} /> Sort
              </button>

              <button
                onClick={toggleAnimation}
                disabled={steps.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} />}
                {isRunning ? "Pause" : "Play"}
              </button>

              <button
                onClick={stepForward}
                disabled={currentStepIndex >= steps.length - 1 || steps.length === 0}
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
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1500}>Slow</option>
                  <option value={800}>Normal</option>
                  <option value={300}>Fast</option>
                  <option value={100}>Very Fast</option>
                </select>
              </div>
            </div>

            {steps.length > 0 && (
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Step {currentStepIndex + 1} of {steps.length}</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{currentStepData.currentStep?.toUpperCase().replace(/_/g, ' ')}</span>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Custom Input Section */}
            <div className="mt-4 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Enter Custom Array (comma-separated, max 20 numbers):
              </label>
              <input
                type="text"
                value={customInput}
                onChange={(e) => handleCustomInput(e.target.value)}
                placeholder="e.g., 64, 34, 25, 12, 22, 11, 90"
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <button
                onClick={generateRandomArray}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Generate Random Array
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {activeTab === "visualizer" && (
          <div className="space-y-6">
            <div className="bg-white/90 dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Zap className="text-blue-600" size={28} />
                Heap Sort Visualization
              </h3>

              <div className="grid lg:grid-cols-3 gap-8 mb-6">
                {/* Array Visualization */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 flex flex-wrap justify-center gap-2 min-h-64">
                    {displayArray.map((value, idx) => {
                      let bgColor = "bg-blue-500 dark:bg-blue-700";
                      let scale = "";
                      
                      if (currentStepData.sorted || (currentStepData.sortedFrom !== undefined && idx >= currentStepData.sortedFrom)) {
                        bgColor = "bg-green-500 dark:bg-green-700";
                      } else if (currentStepData.heapifyIndex === idx) {
                        bgColor = "bg-purple-500 dark:bg-purple-700";
                        scale = "scale-110";
                      } else if (currentStepData.swapping?.includes(idx)) {
                        bgColor = "bg-yellow-400 dark:bg-yellow-600";
                        scale = "scale-110";
                      } else if (currentStepData.extracting?.includes(idx)) {
                        bgColor = "bg-orange-400 dark:bg-orange-600";
                        scale = "scale-110";
                      } else if (currentStepData.buildingAt === idx) {
                        bgColor = "bg-pink-400 dark:bg-pink-600";
                        scale = "scale-110";
                      } else if (currentStepData.leftChild === idx || currentStepData.rightChild === idx) {
                        bgColor = "bg-cyan-400 dark:bg-cyan-600";
                        scale = "scale-110";
                      }

                      return (
                        <div
                          key={idx}
                          className={`w-14 h-14 flex items-center justify-center rounded-lg font-bold text-lg transition-all transform ${bgColor} ${scale} text-white border-2 border-gray-300 dark:border-gray-600 shadow-md`}
                        >
                          {value}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Statistics */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-700">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Statistics</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Heapify Calls</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentStepData.heapifyCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Swaps</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{currentStepData.swapCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Current Step</p>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{currentStepIndex + 1} / {steps.length || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-600">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Legend</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 italic">
                      Colors appear during sorting animation
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-blue-500 dark:bg-blue-700"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Unsorted</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-purple-500 dark:bg-purple-700"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Heapifying</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-yellow-400 dark:bg-yellow-600"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Swapping</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-orange-400 dark:bg-orange-600"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Extracting</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-cyan-400 dark:bg-cyan-600"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Child Nodes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-green-500 dark:bg-green-700"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Sorted</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "theory" && (
          <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Heap Sort Theory
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">What is Heap Sort?</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Heap Sort is a comparison-based sorting algorithm that uses a binary heap data structure. 
                  It divides its input into a sorted and an unsorted region, and iteratively shrinks the unsorted 
                  region by extracting the largest element and moving it to the sorted region.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border-l-4 border-blue-500">
                  <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Algorithm Steps</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                    <li>Build a max heap from array</li>
                    <li>Extract maximum element</li>
                    <li>Place at end of array</li>
                    <li>Heapify remaining elements</li>
                    <li>Repeat until sorted</li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border-l-4 border-green-500">
                  <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">Characteristics</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                    <li>Time Complexity: O(n log n)</li>
                    <li>Space Complexity: O(1)</li>
                    <li>Not stable</li>
                    <li>In-place sorting</li>
                    <li>Consistent performance</li>
                  </ul>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
                <h4 className="font-semibold mb-3">How It Works Visually</h4>
                <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <p>Heap Sort works in two phases:</p>
                  <p className="ml-4">• Build Phase: Convert array into max heap structure</p>
                  <p className="ml-4">• Sort Phase: Extract max, swap with last, heapify</p>
                  <p className="ml-4">• Heap Property: Parent ≥ children at all times</p>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Complexity Analysis</h4>
                <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm font-mono">
                  <p>Time: <span className="font-bold">O(n log n)</span></p>
                  <p className="text-xs">Best/Worst/Average: O(n log n)</p>
                  <p>Space: <span className="font-bold">O(1)</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "pseudocode" && (
          <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
              Heap Sort Implementation
            </h2>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
              <h4 className="font-semibold mb-3 text-lg">Algorithm</h4>
              <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
                <code>{`function heapSort(arr):
  n = arr.length
  
  // Build max heap
  for i from floor(n/2) - 1 down to 0:
    heapify(arr, n, i)
  
  // Extract elements from heap
  for i from n-1 down to 1:
    swap arr[0] and arr[i]
    heapify(arr, i, 0)
  
  return arr

function heapify(arr, heapSize, rootIndex):
  largest = rootIndex
  leftChild = 2 * rootIndex + 1
  rightChild = 2 * rootIndex + 2
  
  if leftChild < heapSize and arr[leftChild] > arr[largest]:
    largest = leftChild
  
  if rightChild < heapSize and arr[rightChild] > arr[largest]:
    largest = rightChild
  
  if largest != rootIndex:
    swap arr[rootIndex] and arr[largest]
    heapify(arr, heapSize, largest)`}</code>
              </pre>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Advantages</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>Guaranteed O(n log n) performance</li>
                  <li>In-place sorting (O(1) space)</li>
                  <li>No worst-case quadratic time</li>
                  <li>Good for memory-constrained systems</li>
                  <li>Predictable behavior</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <h4 className="font-semibold mb-2 text-green-900 dark:text-green-300">Disadvantages</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>Not stable algorithm</li>
                  <li>Generally slower than Quick Sort</li>
                  <li>Poor cache locality</li>
                  <li>Complex to implement</li>
                  <li>Not adaptive to input</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step Information */}
        {activeTab === "visualizer" && steps[currentStepIndex] && (
          <div className="bg-white/90 dark:bg-gray-800 rounded-lg p-6 shadow-lg mt-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Current Step</h3>
            <p className="text-gray-700 dark:text-gray-300">{currentStepData.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
