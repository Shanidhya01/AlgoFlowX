import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, Zap } from 'lucide-react';

function SelectionSort() {
  const [tab, setTab] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(500);

  const initialArray = [64, 34, 25, 12, 22, 11, 90, 88, 45, 50];
  const [array, setArray] = useState(initialArray);
  const [originalArray, setOriginalArray] = useState(initialArray);
  const [customInput, setCustomInput] = useState(initialArray.join(', '));
  const [errorMessage, setErrorMessage] = useState('');

  const selectionSort = useCallback(() => {
    const operationSteps = [];
    const arr = [...array];
    const n = arr.length;
    let comparisons = 0;
    let swaps = 0;

    operationSteps.push({
      type: 'initialize',
      message: `Starting Selection Sort with array: [${arr.join(', ')}]`,
      array: [...arr],
      comparing: [],
      minIndex: null,
      stats: { comparisons: 0, swaps: 0, pass: 0 }
    });

    for (let i = 0; i < n - 1; i++) {
      let minIndex = i;

      operationSteps.push({
        type: 'pass_start',
        message: `Pass ${i + 1}: Finding minimum element from index ${i} onwards`,
        array: [...arr],
        comparing: [i],
        minIndex: i,
        stats: { comparisons, swaps, pass: i + 1 }
      });

      for (let j = i + 1; j < n; j++) {
        comparisons++;

        operationSteps.push({
          type: 'comparing',
          message: `Comparing arr[${j}]=${arr[j]} with current minimum arr[${minIndex}]=${arr[minIndex]}`,
          array: [...arr],
          comparing: [j, minIndex],
          minIndex: minIndex,
          stats: { comparisons, swaps, pass: i + 1 }
        });

        if (arr[j] < arr[minIndex]) {
          minIndex = j;

          operationSteps.push({
            type: 'new_min',
            message: `Found new minimum: arr[${minIndex}]=${arr[minIndex]}`,
            array: [...arr],
            comparing: [minIndex],
            minIndex: minIndex,
            stats: { comparisons, swaps, pass: i + 1 }
          });
        }
      }

      if (minIndex !== i) {
        [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        swaps++;

        operationSteps.push({
          type: 'swapping',
          message: `Swapped arr[${i}]=${arr[minIndex]} with arr[${minIndex}]=${arr[i]}. Total swaps: ${swaps}`,
          array: [...arr],
          comparing: [i, minIndex],
          minIndex: null,
          stats: { comparisons, swaps, pass: i + 1 }
        });
      }
    }

    operationSteps.push({
      type: 'complete',
      message: `✓ Selection Sort Complete! Total comparisons: ${comparisons}, Total swaps: ${swaps}`,
      array: [...arr],
      comparing: [],
      minIndex: null,
      stats: { comparisons, swaps, pass: n - 1 }
    });

    return operationSteps;
  }, [array]);

  const handleSort = () => {
    const operationSteps = selectionSort();
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
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
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

  useEffect(() => {
    if (steps[currentStep]) {
      setArray(steps[currentStep].array || []);
    }
  }, [currentStep, steps]);

  const currentStepData = steps[currentStep] || {};

  const handleCustomInput = (input) => {
    setCustomInput(input);
    try {
      const newArray = input.split(',').map(num => {
        const parsed = parseInt(num.trim(), 10);
        if (isNaN(parsed)) throw new Error('Invalid number');
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
    const newArray = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 1);
    setArray(newArray);
    setOriginalArray(newArray);
    setCustomInput(newArray.join(', '));
    setErrorMessage('');
    setIsRunning(false);
    setCurrentStep(0);
    setSteps([]);
  };

  const render = () => (
    <div className="space-y-6">
      <div className="bg-white/90 dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Zap className="text-blue-600" size={28} />
          Selection Sort Visualization
        </h3>

        <div className="grid lg:grid-cols-3 gap-8 mb-6">
          {/* Array Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 flex flex-wrap justify-center gap-2 min-h-64">
              {array.map((num, idx) => {
                const isComparing = currentStepData.comparing?.includes(idx);
                const isMinIndex = currentStepData.minIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`w-14 h-14 flex items-center justify-center rounded-lg font-bold text-lg transition-all transform ${
                      isMinIndex
                        ? 'bg-red-400 dark:bg-red-600 scale-110 shadow-lg'
                        : isComparing
                        ? 'bg-yellow-400 dark:bg-yellow-600 scale-110 shadow-lg'
                        : 'bg-blue-500 dark:bg-blue-700 shadow-md'
                    } text-white border-2 border-gray-300 dark:border-gray-600`}
                  >
                    {num}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Comparisons</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentStepData.stats?.comparisons || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Swaps</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{currentStepData.stats?.swaps || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Pass</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{currentStepData.stats?.pass || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-600">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Legend</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-500 dark:bg-blue-700"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-yellow-400 dark:bg-yellow-600"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Comparing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-red-400 dark:bg-red-600"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Min Element</span>
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
        Selection Sort Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">What is Selection Sort?</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Selection Sort is a simple comparison-based sorting algorithm that repeatedly selects the smallest element from the unsorted portion of the list and places it at the beginning. It divides the array into sorted and unsorted portions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Algorithm Steps</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Find the minimum element</li>
              <li>Place it at the beginning</li>
              <li>Move to next unsorted element</li>
              <li>Repeat finding minimum</li>
              <li>Continue until sorted</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">Characteristics</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Time Complexity: O(n²)</li>
              <li>Space Complexity: O(1)</li>
              <li>Not stable</li>
              <li>In-place sorting</li>
              <li>Good for small datasets</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">How It Works Visually</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
            <p>In each iteration:</p>
            <p className="ml-4">• Divide array into sorted and unsorted sections</p>
            <p className="ml-4">• Find minimum in unsorted section</p>
            <p className="ml-4">• Swap minimum with first unsorted element</p>
            <p className="ml-4">• Move boundary between sections</p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Complexity Analysis</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm font-mono">
            <p>Time: <span className="font-bold">O(n²)</span></p>
            <p className="text-xs">Best/Worst/Average: O(n²)</p>
            <p>Space: <span className="font-bold">O(1)</span></p>
          </div>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
        Selection Sort Implementation
      </h2>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
        <h4 className="font-semibold mb-3 text-lg">Algorithm</h4>
        <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
          <code>{`function selectionSort(arr):
  n = arr.length
  
  for i from 0 to n-1:
    minIndex = i
    
    for j from i+1 to n:
      if arr[j] < arr[minIndex]:
        minIndex = j
    
    if minIndex != i:
      swap arr[i] and arr[minIndex]
  
  return arr`}</code>
        </pre>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Advantages</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Simple to understand</li>
            <li>Easy to implement</li>
            <li>No extra space needed</li>
            <li>Predictable behavior</li>
            <li>Good for learning</li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <h4 className="font-semibold mb-2 text-green-900 dark:text-green-300">Disadvantages</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>O(n²) time complexity</li>
            <li>Not efficient for large data</li>
            <li>Not stable algorithm</li>
            <li>Many comparisons needed</li>
            <li>Mostly educational use</li>
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
            Selection Sort 
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Watch the algorithm repeatedly find the minimum element and place it at the beginning of the unsorted section.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 shadow-lg mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: '', label: '', icon: Zap },
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
        {tab === '' && (
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

            {/* Custom Input Section */}
            <div className="mt-4 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Enter Custom Array (comma-separated):
              </label>
              <input
                type="text"
                value={customInput}
                onChange={(e) => handleCustomInput(e.target.value)}
                placeholder="e.g., 64, 34, 25, 12, 22"
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
        {tab === '' && render()}
        {tab === 'theory' && <div className="mt-6"><TheorySection /></div>}
        {tab === 'pseudocode' && <div className="mt-6"><PseudocodeSection /></div>}

        {/* Step Information */}
        {tab === '' && steps[currentStep] && (
          <div className="bg-white/90 dark:bg-gray-800 rounded-lg p-6 shadow-lg mt-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Current Step</h3>
            <p className="text-gray-700 dark:text-gray-300">{currentStepData.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SelectionSort;