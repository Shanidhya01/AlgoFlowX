import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, Zap } from 'lucide-react';

function QuickSort() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(800);

  const initialArray = [64, 34, 25, 12, 22, 11, 90];
  const [array, setArray] = useState(initialArray);
  const [originalArray, setOriginalArray] = useState(initialArray);
  const [customInput, setCustomInput] = useState(initialArray.join(', '));
  const [errorMessage, setErrorMessage] = useState('');

  const quickSort = useCallback(() => {
    const operationSteps = [];
    const arr = [...array];

    operationSteps.push({
      type: 'initialize',
      message: `Starting Quick Sort with array: [${arr.join(', ')}]`,
      array: [...arr],
      pivot: null,
      left: null,
      right: null,
      comparing: [],
      stats: { comparisons: 0, swaps: 0, partitions: 0, step: 'Initialize' }
    });

    let comparisonCount = 0;
    let swapCount = 0;
    let partitionCount = 0;

    const partition = (arr, low, high) => {
      const pivot = arr[high];
      const pivotIndex = high;
      partitionCount++;

      operationSteps.push({
        type: 'select_pivot',
        message: `Selected pivot: ${pivot} at index ${high}`,
        array: [...arr],
        pivot: pivotIndex,
        left: null,
        right: null,
        comparing: [],
        range: { low, high },
        stats: { comparisons: comparisonCount, swaps: swapCount, partitions: partitionCount, step: 'Select Pivot' }
      });

      let i = low - 1;

      for (let j = low; j < high; j++) {
        comparisonCount++;
        operationSteps.push({
          type: 'compare',
          message: `Comparing ${arr[j]} with pivot ${pivot}`,
          array: [...arr],
          pivot: pivotIndex,
          left: i >= low ? i : null,
          right: j,
          comparing: [j],
          range: { low, high },
          stats: { comparisons: comparisonCount, swaps: swapCount, partitions: partitionCount, step: 'Comparing' }
        });

        if (arr[j] < pivot) {
          i++;
          if (i !== j) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            swapCount++;
            operationSteps.push({
              type: 'swap',
              message: `Swapping ${arr[j]} and ${arr[i]} (both smaller than pivot)`,
              array: [...arr],
              pivot: pivotIndex,
              left: i,
              right: j,
              comparing: [i, j],
              range: { low, high },
              stats: { comparisons: comparisonCount, swaps: swapCount, partitions: partitionCount, step: 'Swapping' }
            });
          }
        }
      }

      // Place pivot in correct position
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      swapCount++;
      operationSteps.push({
        type: 'pivot_placed',
        message: `Placing pivot ${pivot} at its correct position (index ${i + 1})`,
        array: [...arr],
        pivot: i + 1,
        left: null,
        right: null,
        comparing: [i + 1],
        range: { low, high },
        stats: { comparisons: comparisonCount, swaps: swapCount, partitions: partitionCount, step: 'Pivot Placed' }
      });

      return i + 1;
    };

    const quickSortRecursive = (arr, low, high) => {
      if (low < high) {
        operationSteps.push({
          type: 'partition_start',
          message: `Partitioning subarray from index ${low} to ${high}`,
          array: [...arr],
          pivot: null,
          left: null,
          right: null,
          comparing: [],
          range: { low, high },
          stats: { comparisons: comparisonCount, swaps: swapCount, partitions: partitionCount, step: 'Partition Start' }
        });

        const pi = partition(arr, low, high);

        operationSteps.push({
          type: 'partition_complete',
          message: `Partition complete. Elements ≤ ${arr[pi]} are on left, elements > ${arr[pi]} are on right`,
          array: [...arr],
          pivot: pi,
          left: null,
          right: null,
          comparing: [],
          range: { low, high },
          stats: { comparisons: comparisonCount, swaps: swapCount, partitions: partitionCount, step: 'Partition Complete' }
        });

        quickSortRecursive(arr, low, pi - 1);
        quickSortRecursive(arr, pi + 1, high);
      }
    };

    quickSortRecursive(arr, 0, arr.length - 1);

    operationSteps.push({
      type: 'complete',
      message: `✓ Quick Sort Complete! Sorted array: [${arr.join(', ')}]`,
      array: arr,
      pivot: null,
      left: null,
      right: null,
      comparing: [],
      sorted: true,
      stats: { comparisons: comparisonCount, swaps: swapCount, partitions: partitionCount, step: 'Complete' }
    });

    return operationSteps;
  }, [array]);

  const handleSort = () => {
    const operationSteps = quickSort();
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
          Quick Sort Visualization
        </h3>

        <div className="grid lg:grid-cols-3 gap-8 mb-6">
          {/* Array Visualization */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                {currentStepData.sorted ? 'Sorted Array' : 'Current State'}
              </h4>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex flex-wrap gap-2">
                {currentStepData.array?.map((num, idx) => {
                  let bgColor = 'bg-blue-500 dark:bg-blue-700';
                  if (currentStepData.sorted) {
                    bgColor = 'bg-green-500 dark:bg-green-700';
                  } else if (currentStepData.pivot === idx) {
                    bgColor = 'bg-red-500 dark:bg-red-700';
                  } else if (currentStepData.comparing?.includes(idx)) {
                    bgColor = 'bg-yellow-400 dark:bg-yellow-600';
                  } else if (currentStepData.left === idx) {
                    bgColor = 'bg-purple-400 dark:bg-purple-600';
                  } else if (currentStepData.right === idx) {
                    bgColor = 'bg-orange-400 dark:bg-orange-600';
                  }

                  return (
                    <div
                      key={idx}
                      className={`w-14 h-14 flex items-center justify-center rounded-lg font-bold text-lg transition-all transform ${bgColor} text-white shadow-md border-2 border-gray-300 dark:border-gray-600`}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Partition Range Indicator */}
            {currentStepData.range && (
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-800 dark:text-white">Current Partition Range</h4>
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="font-mono bg-purple-200 dark:bg-purple-700 px-2 py-1 rounded">Low: {currentStepData.range.low}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-mono bg-purple-200 dark:bg-purple-700 px-2 py-1 rounded">High: {currentStepData.range.high}</span>
                  </div>
                  {currentStepData.pivot !== null && (
                    <div className="text-sm">
                      <span className="font-mono bg-red-200 dark:bg-red-700 px-2 py-1 rounded">Pivot: {currentStepData.array[currentStepData.pivot]}</span>
                    </div>
                  )}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Swaps</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{currentStepData.stats?.swaps || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Partitions</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{currentStepData.stats?.partitions || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Step</p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{currentStepData.stats?.step || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-600">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Color Legend</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 italic">Colors appear during sorting animation</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-500 dark:bg-blue-700 border border-gray-400"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Unsorted elements</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-red-500 dark:bg-red-700 border border-gray-400"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Pivot element</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-yellow-400 dark:bg-yellow-600 border border-gray-400"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Comparing with pivot</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-purple-400 dark:bg-purple-600 border border-gray-400"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Left pointer (i)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-orange-400 dark:bg-orange-600 border border-gray-400"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Right pointer (j)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-green-500 dark:bg-green-700 border border-gray-400"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Fully sorted</span>
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
        Quick Sort Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">What is Quick Sort?</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Quick Sort is a highly efficient divide-and-conquer sorting algorithm that works by selecting a 'pivot' element and partitioning the array around it. Elements smaller than the pivot go to the left, and larger elements go to the right. This process is repeated recursively.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Algorithm Steps</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Choose a pivot element</li>
              <li>Partition array around pivot</li>
              <li>Move smaller elements left</li>
              <li>Move larger elements right</li>
              <li>Recursively sort subarrays</li>
              <li>Combine sorted parts</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">Characteristics</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Average Time: O(n log n)</li>
              <li>Worst Time: O(n²)</li>
              <li>Space: O(log n)</li>
              <li>In-place sorting</li>
              <li>Cache-efficient</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">When to Use Quick Sort</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
            <p>Quick Sort is ideal when:</p>
            <p className="ml-4">• Average O(n log n) performance is acceptable</p>
            <p className="ml-4">• In-place sorting is required (low memory)</p>
            <p className="ml-4">• Cache efficiency matters</p>
            <p className="ml-4">• Internal sorting (all data fits in memory)</p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Complexity Analysis</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm font-mono">
            <p>Best/Average Time: <span className="font-bold">O(n log n)</span></p>
            <p className="text-xs">Good pivot selection divides array evenly</p>
            <p>Worst Time: <span className="font-bold">O(n²)</span></p>
            <p className="text-xs">Occurs with already sorted array (poor pivot)</p>
            <p>Space: <span className="font-bold">O(log n)</span></p>
            <p className="text-xs">Recursion stack depth</p>
          </div>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
        Quick Sort Implementation
      </h2>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
        <h4 className="font-semibold mb-3 text-lg">Algorithm</h4>
        <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
          <code>{`function quickSort(arr, low, high):
  if low < high:
    // Partition and get pivot index
    pi = partition(arr, low, high)
    
    // Recursively sort left and right
    quickSort(arr, low, pi - 1)
    quickSort(arr, pi + 1, high)

function partition(arr, low, high):
  pivot = arr[high]  // Choose last element
  i = low - 1        // Index of smaller element
  
  for j from low to high - 1:
    if arr[j] < pivot:
      i++
      swap arr[i] with arr[j]
  
  // Place pivot in correct position
  swap arr[i + 1] with arr[high]
  return i + 1`}</code>
        </pre>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Advantages</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Fast average O(n log n)</li>
            <li>In-place sorting</li>
            <li>Cache-efficient</li>
            <li>Low memory overhead</li>
            <li>Good practical performance</li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <h4 className="font-semibold mb-2 text-green-900 dark:text-green-300">Disadvantages</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Worst case O(n²)</li>
            <li>Not stable (default)</li>
            <li>Poor on sorted data</li>
            <li>Pivot selection critical</li>
            <li>Recursive overhead</li>
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
            Quick Sort Visualizer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Watch the efficient partition-based algorithm select pivots and recursively sort subarrays.
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
                placeholder="e.g., 64, 34, 25, 12, 22, 11, 90"
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

export default QuickSort;