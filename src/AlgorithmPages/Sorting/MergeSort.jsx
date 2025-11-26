import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, Zap } from 'lucide-react';

function MergeSort() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(800);

  const initialArray = [38, 27, 43, 3, 9, 82, 10];
  const [array, setArray] = useState(initialArray);
  const [originalArray, setOriginalArray] = useState(initialArray);
  const [customInput, setCustomInput] = useState(initialArray.join(', '));
  const [errorMessage, setErrorMessage] = useState('');

  const mergeSort = useCallback(() => {
    const operationSteps = [];
    const arr = [...array];

    operationSteps.push({
      type: 'initialize',
      message: `Starting Merge Sort with array: [${arr.join(', ')}]`,
      array: [...arr],
      divisions: [],
      merging: null,
      sorted: false,
      stats: { comparisons: 0, merges: 0, step: 'Initialize' }
    });

    let comparisonCount = 0;
    let mergeCount = 0;

    const mergeSortRecursive = (arr, start, end, depth = 0) => {
      if (end - start <= 1) return arr.slice(start, end);

      const mid = Math.floor((start + end) / 2);
      
      // Divide phase
      operationSteps.push({
        type: 'divide',
        message: `Dividing array [${start}:${end}] at index ${mid}`,
        array: [...array],
        divisions: [{ start, mid, end, depth }],
        merging: null,
        sorted: false,
        highlightRange: { start, end },
        stats: { comparisons: comparisonCount, merges: mergeCount, step: 'Dividing' }
      });

      const left = mergeSortRecursive(arr, start, mid, depth + 1);
      const right = mergeSortRecursive(arr, mid, end, depth + 1);

      // Merge phase
      const merged = [];
      let i = 0, j = 0;

      operationSteps.push({
        type: 'merge_start',
        message: `Merging [${left.join(', ')}] and [${right.join(', ')}]`,
        array: [...array],
        divisions: [],
        merging: { left: [...left], right: [...right], merged: [], leftIdx: 0, rightIdx: 0 },
        sorted: false,
        stats: { comparisons: comparisonCount, merges: mergeCount, step: 'Merging' }
      });

      while (i < left.length && j < right.length) {
        comparisonCount++;
        if (left[i] <= right[j]) {
          merged.push(left[i]);
          operationSteps.push({
            type: 'merge_compare',
            message: `Comparing ${left[i]} ≤ ${right[j]}, taking ${left[i]} from left`,
            array: [...array],
            divisions: [],
            merging: { left: [...left], right: [...right], merged: [...merged], leftIdx: i, rightIdx: j },
            sorted: false,
            stats: { comparisons: comparisonCount, merges: mergeCount, step: 'Comparing' }
          });
          i++;
        } else {
          merged.push(right[j]);
          operationSteps.push({
            type: 'merge_compare',
            message: `Comparing ${left[i]} > ${right[j]}, taking ${right[j]} from right`,
            array: [...array],
            divisions: [],
            merging: { left: [...left], right: [...right], merged: [...merged], leftIdx: i, rightIdx: j },
            sorted: false,
            stats: { comparisons: comparisonCount, merges: mergeCount, step: 'Comparing' }
          });
          j++;
        }
      }

      while (i < left.length) {
        merged.push(left[i]);
        operationSteps.push({
          type: 'merge_remaining',
          message: `Appending remaining element ${left[i]} from left`,
          array: [...array],
          divisions: [],
          merging: { left: [...left], right: [...right], merged: [...merged], leftIdx: i, rightIdx: j },
          sorted: false,
          stats: { comparisons: comparisonCount, merges: mergeCount, step: 'Appending' }
        });
        i++;
      }

      while (j < right.length) {
        merged.push(right[j]);
        operationSteps.push({
          type: 'merge_remaining',
          message: `Appending remaining element ${right[j]} from right`,
          array: [...array],
          divisions: [],
          merging: { left: [...left], right: [...right], merged: [...merged], leftIdx: i, rightIdx: j },
          sorted: false,
          stats: { comparisons: comparisonCount, merges: mergeCount, step: 'Appending' }
        });
        j++;
      }

      mergeCount++;
      operationSteps.push({
        type: 'merge_complete',
        message: `Merged result: [${merged.join(', ')}]`,
        array: [...array],
        divisions: [],
        merging: { left: [...left], right: [...right], merged: [...merged], leftIdx: i, rightIdx: j },
        sorted: false,
        stats: { comparisons: comparisonCount, merges: mergeCount, step: 'Merge Complete' }
      });

      return merged;
    };

    const sortedArray = mergeSortRecursive(arr, 0, arr.length);

    operationSteps.push({
      type: 'complete',
      message: `✓ Merge Sort Complete! Sorted array: [${sortedArray.join(', ')}]`,
      array: sortedArray,
      divisions: [],
      merging: null,
      sorted: true,
      stats: { comparisons: comparisonCount, merges: mergeCount, step: 'Complete' }
    });

    return operationSteps;
  }, [array]);

  const handleSort = () => {
    const operationSteps = mergeSort();
    setSteps(operationSteps);
    setCurrentStep(0);
    setIsRunning(false);
  };

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  const resetAnimation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setArray(originalArray);
    setSteps([]);
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCustomInput = (input) => {
    setCustomInput(input);
    try {
      const newArray = input.split(',').map(num => {
        const parsed = parseInt(num.trim(), 10);
        if (isNaN(parsed)) throw new Error('Invalid number');
        return parsed;
      });
      if (newArray.length === 0) throw new Error('Array is empty');
      if (newArray.length > 15) throw new Error('Maximum 15 elements allowed');
      if (newArray.length < 2) throw new Error('Minimum 2 elements required');
      setArray(newArray);
      setOriginalArray(newArray);
      setErrorMessage('');
      setIsRunning(false);
      setCurrentStep(0);
      setSteps([]);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const generateRandomArray = () => {
    const newArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 50) + 1);
    setArray(newArray);
    setOriginalArray(newArray);
    setCustomInput(newArray.join(', '));
    setErrorMessage('');
    setIsRunning(false);
    setCurrentStep(0);
    setSteps([]);
  };

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

  const currentStepData = steps[currentStep] || {};

  const renderVisualizer = () => (
    <div className="space-y-6">
      <div className="bg-white/90 dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Zap className="text-blue-600" size={28} />
          Merge Sort Visualization
        </h3>

        <div className="grid lg:grid-cols-3 gap-8 mb-6">
          {/* Array Visualization */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Array State */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                {currentStepData.sorted ? 'Sorted Array' : 'Current State'}
              </h4>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex flex-wrap gap-2">
                {currentStepData.array?.map((num, idx) => (
                  <div
                    key={idx}
                    className={`w-14 h-14 flex items-center justify-center rounded-lg font-bold text-lg transition-all transform ${
                      currentStepData.sorted
                        ? 'bg-green-500 dark:bg-green-700'
                        : 'bg-blue-500 dark:bg-blue-700'
                    } text-white shadow-md border-2 border-gray-300 dark:border-gray-600`}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>

            {/* Merge Visualization */}
            {currentStepData.merging && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-gray-800 dark:text-white">Left Array</h4>
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3 flex flex-wrap gap-2">
                      {currentStepData.merging.left.map((num, idx) => (
                        <div
                          key={idx}
                          className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-sm ${
                            idx === currentStepData.merging.leftIdx
                              ? 'bg-yellow-400 dark:bg-yellow-600 scale-110'
                              : 'bg-yellow-200 dark:bg-yellow-700'
                          } text-gray-900 dark:text-white shadow-md border border-gray-300 dark:border-gray-600`}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-gray-800 dark:text-white">Right Array</h4>
                    <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 flex flex-wrap gap-2">
                      {currentStepData.merging.right.map((num, idx) => (
                        <div
                          key={idx}
                          className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-sm ${
                            idx === currentStepData.merging.rightIdx
                              ? 'bg-purple-400 dark:bg-purple-600 scale-110'
                              : 'bg-purple-200 dark:bg-purple-700'
                          } text-gray-900 dark:text-white shadow-md border border-gray-300 dark:border-gray-600`}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-gray-800 dark:text-white">Merged Result</h4>
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 flex flex-wrap gap-2">
                    {currentStepData.merging.merged.map((num, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-12 flex items-center justify-center bg-green-500 dark:bg-green-700 text-white rounded-lg font-bold text-sm shadow-md border border-gray-300 dark:border-gray-600"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-700">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Statistics</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Comparisons</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentStepData.stats?.comparisons || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Merges</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{currentStepData.stats?.merges || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Step</p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{currentStepData.stats?.step || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-600">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Legend</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-500 dark:bg-blue-700"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Original</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-yellow-400 dark:bg-yellow-600"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Left Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-purple-400 dark:bg-purple-600"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Right Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-green-500 dark:bg-green-700"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Merged/Sorted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TheorySection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Merge Sort Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">What is Merge Sort?</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Merge Sort is a divide-and-conquer algorithm that divides the input array into two halves, recursively sorts them, and then merges the sorted halves. It's one of the most efficient sorting algorithms with guaranteed O(n log n) time complexity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Algorithm Steps</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Divide array into two halves</li>
              <li>Recursively sort each half</li>
              <li>Merge sorted halves</li>
              <li>Compare elements from both halves</li>
              <li>Build merged sorted array</li>
              <li>Return sorted result</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">Characteristics</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Time: O(n log n) all cases</li>
              <li>Space: O(n)</li>
              <li>Stable sorting algorithm</li>
              <li>Divide-and-conquer approach</li>
              <li>Predictable performance</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">When to Use Merge Sort</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
            <p>Merge Sort is ideal when:</p>
            <p className="ml-4">• Guaranteed O(n log n) performance needed</p>
            <p className="ml-4">• Stability is required</p>
            <p className="ml-4">• Sorting linked lists</p>
            <p className="ml-4">• External sorting (large datasets on disk)</p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Complexity Analysis</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm font-mono">
            <p>Time: <span className="font-bold">O(n log n)</span></p>
            <p className="text-xs">Always divides in half (log n) and merges in linear time (n)</p>
            <p>Space: <span className="font-bold">O(n)</span></p>
            <p className="text-xs">Requires temporary arrays for merging</p>
          </div>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
        Merge Sort Implementation
      </h2>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
        <h4 className="font-semibold mb-3 text-lg">Algorithm</h4>
        <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
          <code>{`function mergeSort(arr):
  if arr.length <= 1:
    return arr
  
  mid = arr.length / 2
  left = mergeSort(arr[0...mid])
  right = mergeSort(arr[mid...end])
  
  return merge(left, right)

function merge(left, right):
  result = []
  i = 0
  j = 0
  
  while i < left.length AND j < right.length:
    if left[i] <= right[j]:
      result.push(left[i])
      i++
    else:
      result.push(right[j])
      j++
  
  // Append remaining elements
  while i < left.length:
    result.push(left[i])
    i++
  
  while j < right.length:
    result.push(right[j])
    j++
  
  return result`}</code>
        </pre>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Advantages</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Guaranteed O(n log n)</li>
            <li>Stable sorting</li>
            <li>Predictable performance</li>
            <li>Good for linked lists</li>
            <li>Parallelizable</li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <h4 className="font-semibold mb-2 text-green-900 dark:text-green-300">Disadvantages</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Extra space O(n) needed</li>
            <li>Not in-place sorting</li>
            <li>Slower for small arrays</li>
            <li>Overhead from recursion</li>
            <li>Not cache-friendly</li>
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
            Merge Sort Visualizer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Watch the divide-and-conquer algorithm split arrays recursively and merge them back in sorted order.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 shadow-lg mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'visualizer', label: 'Visualizer', icon: Zap },
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
                onClick={handleSort}
                disabled={isRunning}
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
                  <option value={1500}>Slow</option>
                  <option value={800}>Normal</option>
                  <option value={300}>Fast</option>
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

            {/* Custom Input Section */}
            <div className="mt-4 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Enter Custom Array (comma-separated integers):
              </label>
              <input
                type="text"
                value={customInput}
                onChange={(e) => handleCustomInput(e.target.value)}
                placeholder="e.g., 38, 27, 43, 3, 9, 82, 10"
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              {errorMessage && (
                <p className="text-red-600 dark:text-red-400 text-sm font-semibold mb-2">⚠️ {errorMessage}</p>
              )}
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
}

export default MergeSort;

