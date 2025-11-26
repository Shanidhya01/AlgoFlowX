import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, Zap } from 'lucide-react';

function CountingSort() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(800);

  const initialArray = [4, 2, 8, 3, 1, 9, 6, 5, 7];
  const [array, setArray] = useState(initialArray);
  const [originalArray, setOriginalArray] = useState(initialArray);
  const [customInput, setCustomInput] = useState(initialArray.join(', '));
  const [errorMessage, setErrorMessage] = useState('');

  const countingSort = useCallback(() => {
    const operationSteps = [];
    const arr = [...array];
    const maxVal = Math.max(...arr);
    const minVal = Math.min(...arr);
    const range = maxVal - minVal + 1;

    operationSteps.push({
      type: 'initialize',
      message: `Starting Counting Sort with array: [${arr.join(', ')}]. Range: ${minVal} to ${maxVal}`,
      array: [...arr],
      countArray: [],
      sortedArray: [],
      stats: { maxVal, minVal, range, step: 'Initialize' }
    });

    // Step 1: Initialize count array
    const countArray = new Array(range).fill(0);
    operationSteps.push({
      type: 'count_init',
      message: `Initialized count array of size ${range} with zeros`,
      array: [...arr],
      countArray: [...countArray],
      sortedArray: [],
      stats: { maxVal, minVal, range, step: 'Count Array Initialized' }
    });

    // Step 2: Count occurrences
    arr.forEach((num, idx) => {
      countArray[num - minVal]++;
      operationSteps.push({
        type: 'counting',
        message: `Counted element ${num} at index ${idx}. Count[${num - minVal}] = ${countArray[num - minVal]}`,
        array: [...arr],
        countArray: [...countArray],
        sortedArray: [],
        currentIndex: idx,
        stats: { maxVal, minVal, range, step: `Counting: ${num}` }
      });
    });

    operationSteps.push({
      type: 'count_complete',
      message: `Count array complete: [${countArray.join(', ')}]`,
      array: [...arr],
      countArray: [...countArray],
      sortedArray: [],
      stats: { maxVal, minVal, range, step: 'Counting Complete' }
    });

    // Step 3: Calculate cumulative counts
    for (let i = 1; i < countArray.length; i++) {
      countArray[i] += countArray[i - 1];
      operationSteps.push({
        type: 'cumulative',
        message: `Cumulative sum at index ${i}: ${countArray[i]}`,
        array: [...arr],
        countArray: [...countArray],
        sortedArray: [],
        stats: { maxVal, minVal, range, step: 'Cumulative Sum' }
      });
    }

    // Step 4: Build sorted array
    const sortedArray = new Array(arr.length);
    for (let i = arr.length - 1; i >= 0; i--) {
      const num = arr[i];
      const index = countArray[num - minVal] - 1;
      sortedArray[index] = num;
      countArray[num - minVal]--;
      
      operationSteps.push({
        type: 'placing',
        message: `Placing ${num} at position ${index} in sorted array`,
        array: [...arr],
        countArray: [...countArray],
        sortedArray: [...sortedArray],
        currentIndex: i,
        stats: { maxVal, minVal, range, step: `Placing: ${num}` }
      });
    }

    operationSteps.push({
      type: 'complete',
      message: `✓ Counting Sort Complete! Sorted array: [${sortedArray.join(', ')}]`,
      array: [...arr],
      countArray: [...countArray],
      sortedArray: sortedArray,
      stats: { maxVal, minVal, range, step: 'Complete' }
    });

    return operationSteps;
  }, [array]);

  const handleSort = () => {
    const operationSteps = countingSort();
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
        if (parsed < 0) throw new Error('Numbers must be non-negative');
        return parsed;
      });
      if (newArray.length === 0) throw new Error('Array is empty');
      if (newArray.length > 20) throw new Error('Maximum 20 elements allowed');
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
    const newArray = Array.from({ length: 10 }, () => Math.floor(Math.random() * 20) + 1);
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
          Counting Sort Visualization
        </h3>

        <div className="grid lg:grid-cols-3 gap-8 mb-6">
          {/* Array Visualization */}
          <div className="lg:col-span-2 space-y-6">
            {/* Original Array */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Original Array</h4>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex flex-wrap gap-2">
                {currentStepData.array?.map((num, idx) => (
                  <div
                    key={idx}
                    className={`w-14 h-14 flex items-center justify-center rounded-lg font-bold text-lg transition-all transform ${
                      currentStepData.currentIndex === idx
                        ? 'bg-yellow-400 dark:bg-yellow-600 scale-110 shadow-lg'
                        : 'bg-blue-500 dark:bg-blue-700 shadow-md'
                    } text-white border-2 border-gray-300 dark:border-gray-600`}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>

            {/* Count Array */}
            {currentStepData.countArray && currentStepData.countArray.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Count Array</h4>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex flex-wrap gap-2">
                  {currentStepData.countArray.map((count, idx) => (
                    <div
                      key={idx}
                      className="w-14 h-14 flex flex-col items-center justify-center bg-yellow-500 dark:bg-yellow-700 text-white rounded-lg font-bold shadow-md border-2 border-gray-300 dark:border-gray-600"
                    >
                      <div className="text-xs">[{idx}]</div>
                      <div>{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sorted Array */}
            {currentStepData.sortedArray && currentStepData.sortedArray.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Sorted Array</h4>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex flex-wrap gap-2">
                  {currentStepData.sortedArray.map((num, idx) => (
                    <div
                      key={idx}
                      className="w-14 h-14 flex items-center justify-center bg-green-500 dark:bg-green-700 text-white rounded-lg font-bold text-lg shadow-md border-2 border-gray-300 dark:border-gray-600"
                    >
                      {num}
                    </div>
                  ))}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Max Value</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentStepData.stats?.maxVal || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Range</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{currentStepData.stats?.range || 0}</p>
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
                  <span className="text-sm text-gray-700 dark:text-gray-300">Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-yellow-500 dark:bg-yellow-700"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Count Array</span>
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
  );

  const TheorySection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Counting Sort Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">What is Counting Sort?</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Counting Sort is a non-comparison based sorting algorithm that works by counting the number of occurrences of each unique element in the array. It then uses this count information to place elements directly in their sorted positions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Algorithm Steps</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Find min and max values</li>
              <li>Create count array</li>
              <li>Count each element</li>
              <li>Calculate cumulative sum</li>
              <li>Place elements in sorted order</li>
              <li>Return sorted array</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">Characteristics</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Time Complexity: O(n + k)</li>
              <li>Space Complexity: O(k)</li>
              <li>Stable sorting algorithm</li>
              <li>Non-comparison based</li>
              <li>Best for limited range integers</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">When to Use Counting Sort</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
            <p>Counting Sort is ideal when:</p>
            <p className="ml-4">• Range (k) is not significantly larger than n</p>
            <p className="ml-4">• Sorting integers or items mapped to integers</p>
            <p className="ml-4">• Stability is required</p>
            <p className="ml-4">• Need linear time complexity</p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Complexity Analysis</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm font-mono">
            <p>Time: <span className="font-bold">O(n + k)</span></p>
            <p className="text-xs">where n = array size, k = range of values</p>
            <p>Space: <span className="font-bold">O(k)</span> for count array</p>
          </div>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
        Counting Sort Implementation
      </h2>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
        <h4 className="font-semibold mb-3 text-lg">Algorithm</h4>
        <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
          <code>{`function countingSort(arr):
  n = arr.length
  maxVal = max(arr)
  minVal = min(arr)
  range = maxVal - minVal + 1
  
  // Create and initialize count array
  count = new Array(range).fill(0)
  
  // Count occurrences
  for i from 0 to n-1:
    count[arr[i] - minVal]++
  
  // Calculate cumulative counts
  for i from 1 to range-1:
    count[i] += count[i-1]
  
  // Build sorted array (backwards for stability)
  output = new Array(n)
  for i from n-1 to 0:
    val = arr[i]
    index = count[val - minVal] - 1
    output[index] = val
    count[val - minVal]--
  
  return output`}</code>
        </pre>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Advantages</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Linear time O(n+k)</li>
            <li>Stable algorithm</li>
            <li>No comparisons needed</li>
            <li>Predictable performance</li>
            <li>Good for limited range</li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <h4 className="font-semibold mb-2 text-green-900 dark:text-green-300">Disadvantages</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Extra space O(k) needed</li>
            <li>Not suitable for large ranges</li>
            <li>Works only with integers</li>
            <li>Space inefficient if k {'>>'} n</li>
            <li>Not in-place sorting</li>
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
            Counting Sort Visualizer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Watch the non-comparison based algorithm count and place elements directly in their sorted positions.
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
                Enter Custom Array (comma-separated, non-negative integers):
              </label>
              <input
                type="text"
                value={customInput}
                onChange={(e) => handleCustomInput(e.target.value)}
                placeholder="e.g., 4, 2, 8, 3, 1, 9, 6, 5, 7"
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

export default CountingSort;
