import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, Zap } from 'lucide-react';

const BUCKET_COUNT = 10;

function BucketSort() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(800);

  const initialArray = [0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12, 0.23, 0.68];
  const [array, setArray] = useState(initialArray);
  const [originalArray, setOriginalArray] = useState(initialArray);
  const [customInput, setCustomInput] = useState(initialArray.join(', '));
  const [errorMessage, setErrorMessage] = useState('');

  const bucketSort = useCallback(() => {
    const operationSteps = [];
    const arr = [...array];

    operationSteps.push({
      type: 'initialize',
      message: `Starting Bucket Sort with array: [${arr.map(n => n.toFixed(2)).join(', ')}]`,
      array: [...arr],
      buckets: [],
      sortedArray: [],
      stats: { bucketCount: BUCKET_COUNT, step: 'Initialize' }
    });

    // Step 1: Create and fill buckets
    const buckets = Array.from({ length: BUCKET_COUNT }, () => []);
    arr.forEach((num, idx) => {
      const bucketIndex = Math.min(Math.floor(num * BUCKET_COUNT), BUCKET_COUNT - 1);
      buckets[bucketIndex].push(num);
      operationSteps.push({
        type: 'distribute',
        message: `Placing ${num.toFixed(2)} into bucket ${bucketIndex} (range ${(bucketIndex/BUCKET_COUNT).toFixed(1)}-${((bucketIndex+1)/BUCKET_COUNT).toFixed(1)})`,
        array: [...arr],
        buckets: buckets.map(b => [...b]),
        sortedArray: [],
        currentIndex: idx,
        currentBucket: bucketIndex,
        stats: { bucketCount: BUCKET_COUNT, step: `Distributing: ${num.toFixed(2)}` }
      });
    });

    operationSteps.push({
      type: 'distribute_complete',
      message: `Distribution complete. All elements placed into ${BUCKET_COUNT} buckets`,
      array: [...arr],
      buckets: buckets.map(b => [...b]),
      sortedArray: [],
      stats: { bucketCount: BUCKET_COUNT, step: 'Distribution Complete' }
    });

    // Step 2: Sort each bucket
    buckets.forEach((bucket, bucketIdx) => {
      if (bucket.length > 0) {
        bucket.sort((a, b) => a - b);
        operationSteps.push({
          type: 'sort_bucket',
          message: `Sorted bucket ${bucketIdx}: [${bucket.map(n => n.toFixed(2)).join(', ')}]`,
          array: [...arr],
          buckets: buckets.map(b => [...b]),
          sortedArray: [],
          currentBucket: bucketIdx,
          stats: { bucketCount: BUCKET_COUNT, step: `Sorting Bucket ${bucketIdx}` }
        });
      }
    });

    operationSteps.push({
      type: 'sort_complete',
      message: `All buckets sorted individually`,
      array: [...arr],
      buckets: buckets.map(b => [...b]),
      sortedArray: [],
      stats: { bucketCount: BUCKET_COUNT, step: 'Sorting Complete' }
    });

    // Step 3: Concatenate buckets
    const sortedArray = [];
    buckets.forEach((bucket, bucketIdx) => {
      bucket.forEach(num => {
        sortedArray.push(num);
        operationSteps.push({
          type: 'concatenate',
          message: `Taking ${num.toFixed(2)} from bucket ${bucketIdx}`,
          array: [...arr],
          buckets: buckets.map(b => [...b]),
          sortedArray: [...sortedArray],
          currentBucket: bucketIdx,
          stats: { bucketCount: BUCKET_COUNT, step: `Concatenating` }
        });
      });
    });

    operationSteps.push({
      type: 'complete',
      message: `✓ Bucket Sort Complete! Sorted array: [${sortedArray.map(n => n.toFixed(2)).join(', ')}]`,
      array: [...arr],
      buckets: buckets.map(b => [...b]),
      sortedArray: sortedArray,
      stats: { bucketCount: BUCKET_COUNT, step: 'Complete' }
    });

    return operationSteps;
  }, [array]);

  const handleSort = () => {
    const operationSteps = bucketSort();
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
        const parsed = parseFloat(num.trim());
        if (isNaN(parsed)) throw new Error('Invalid number');
        if (parsed < 0 || parsed > 1) throw new Error('Numbers must be between 0 and 1');
        return parsed;
      });
      if (newArray.length === 0) throw new Error('Array is empty');
      if (newArray.length > 15) throw new Error('Maximum 15 elements allowed');
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
    const newArray = Array.from({ length: 10 }, () => parseFloat((Math.random()).toFixed(2)));
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
          Bucket Sort Visualization
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
                    className={`w-16 h-14 flex items-center justify-center rounded-lg font-bold text-sm transition-all transform ${
                      currentStepData.currentIndex === idx
                        ? 'bg-yellow-400 dark:bg-yellow-600 scale-110 shadow-lg'
                        : 'bg-blue-500 dark:bg-blue-700 shadow-md'
                    } text-white border-2 border-gray-300 dark:border-gray-600`}
                  >
                    {num.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>

            {/* Buckets */}
            {currentStepData.buckets && currentStepData.buckets.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Buckets</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {currentStepData.buckets.map((bucket, bucketIdx) => (
                    <div
                      key={bucketIdx}
                      className={`border-2 rounded-lg p-3 transition-all ${
                        currentStepData.currentBucket === bucketIdx
                          ? 'border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">
                        B{bucketIdx} ({(bucketIdx/BUCKET_COUNT).toFixed(1)}-{((bucketIdx+1)/BUCKET_COUNT).toFixed(1)})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {bucket.length > 0 ? bucket.map((num, numIdx) => (
                          <div
                            key={numIdx}
                            className="w-14 h-10 flex items-center justify-center bg-yellow-500 dark:bg-yellow-700 text-white rounded text-xs font-bold"
                          >
                            {num.toFixed(2)}
                          </div>
                        )) : (
                          <div className="text-xs text-gray-400 dark:text-gray-500">Empty</div>
                        )}
                      </div>
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
                      className="w-16 h-14 flex items-center justify-center bg-green-500 dark:bg-green-700 text-white rounded-lg font-bold text-sm shadow-md border-2 border-gray-300 dark:border-gray-600"
                    >
                      {num.toFixed(2)}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bucket Count</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentStepData.stats?.bucketCount || BUCKET_COUNT}</p>
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
                  <span className="text-sm text-gray-700 dark:text-gray-300">In Bucket</span>
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
        Bucket Sort Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">What is Bucket Sort?</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Bucket Sort is a distribution-based sorting algorithm that divides elements into several groups called buckets. Each bucket is then sorted individually, either using a different sorting algorithm or by recursively applying bucket sort. Finally, all buckets are concatenated to produce the sorted array.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Algorithm Steps</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Create empty buckets</li>
              <li>Distribute elements into buckets</li>
              <li>Sort each bucket individually</li>
              <li>Concatenate all buckets</li>
              <li>Return sorted array</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">Characteristics</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Average Time: O(n + k)</li>
              <li>Worst Time: O(n²)</li>
              <li>Space: O(n + k)</li>
              <li>Not in-place</li>
              <li>Best for uniformly distributed data</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">When to Use Bucket Sort</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
            <p>Bucket Sort is ideal when:</p>
            <p className="ml-4">• Input is uniformly distributed over a range</p>
            <p className="ml-4">• Sorting floating point numbers (0 to 1)</p>
            <p className="ml-4">• Need linear average-case time</p>
            <p className="ml-4">• Data can be distributed into buckets easily</p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Complexity Analysis</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm font-mono">
            <p>Average Time: <span className="font-bold">O(n + k)</span></p>
            <p className="text-xs">where n = elements, k = buckets</p>
            <p>Worst Time: <span className="font-bold">O(n²)</span></p>
            <p className="text-xs">when all elements in one bucket</p>
            <p>Space: <span className="font-bold">O(n + k)</span></p>
          </div>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
        Bucket Sort Implementation
      </h2>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
        <h4 className="font-semibold mb-3 text-lg">Algorithm</h4>
        <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
          <code>{`function bucketSort(arr, bucketSize = 10):
  n = arr.length
  if n == 0:
    return arr
  
  // Create empty buckets
  buckets = new Array(bucketSize)
  for i from 0 to bucketSize-1:
    buckets[i] = []
  
  // Distribute elements into buckets
  for i from 0 to n-1:
    bucketIndex = floor(arr[i] * bucketSize)
    buckets[bucketIndex].push(arr[i])
  
  // Sort individual buckets
  for i from 0 to bucketSize-1:
    buckets[i].sort()  // Use insertion sort or any sorting
  
  // Concatenate all buckets
  result = []
  for i from 0 to bucketSize-1:
    for each element in buckets[i]:
      result.push(element)
  
  return result`}</code>
        </pre>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Advantages</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Linear average time O(n+k)</li>
            <li>Simple to implement</li>
            <li>Works well with uniform data</li>
            <li>Parallelizable</li>
            <li>Stable if sorting algorithm is stable</li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <h4 className="font-semibold mb-2 text-green-900 dark:text-green-300">Disadvantages</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Extra space O(n+k) needed</li>
            <li>Not in-place sorting</li>
            <li>Poor for skewed distributions</li>
            <li>Worst case O(n²)</li>
            <li>Requires uniform distribution</li>
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
            Bucket Sort Visualizer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Watch how elements are distributed into buckets, sorted individually, and concatenated to form the sorted array.
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
                Enter Custom Array (comma-separated, numbers between 0 and 1):
              </label>
              <input
                type="text"
                value={customInput}
                onChange={(e) => handleCustomInput(e.target.value)}
                placeholder="e.g., 0.78, 0.17, 0.39, 0.26, 0.72"
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

export default BucketSort;