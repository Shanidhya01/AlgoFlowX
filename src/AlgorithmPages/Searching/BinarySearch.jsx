import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, Search } from 'lucide-react';

function BinarySearch() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  const [array, setArray] = useState([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29]);
  const [target, setTarget] = useState('');
  const [customArrayInput, setCustomArrayInput] = useState('1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [left, setLeft] = useState(-1);
  const [right, setRight] = useState(-1);
  const [mid, setMid] = useState(-1);
  const [found, setFound] = useState(false);
  const [result, setResult] = useState('');
  const [comparisons, setComparisons] = useState(0);

  const binarySearchAlgorithm = useCallback(() => {
    const searchSteps = [];
    const searchTarget = parseInt(target);
    let left = 0;
    let right = array.length - 1;
    let comparisonCount = 0;

    searchSteps.push({
      type: 'initialize',
      message: `Initialize: left = 0, right = ${array.length - 1}. Searching for ${searchTarget}`,
      left: 0,
      right: array.length - 1,
      mid: -1,
      found: false,
      result: '',
      comparisons: 0
    });

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      comparisonCount++;

      searchSteps.push({
        type: 'calculate_mid',
        message: `Calculate mid: (${left} + ${right}) / 2 = ${mid}. Compare array[${mid}] = ${array[mid]} with target ${searchTarget}`,
        left: left,
        right: right,
        mid: mid,
        found: false,
        result: '',
        comparisons: comparisonCount
      });

      if (array[mid] === searchTarget) {
        searchSteps.push({
          type: 'found',
          message: `✓ Found! array[${mid}] = ${searchTarget}. Target found at index ${mid}`,
          left: left,
          right: right,
          mid: mid,
          found: true,
          result: `Found ${searchTarget} at index ${mid}`,
          comparisons: comparisonCount
        });
        return searchSteps;
      } else if (array[mid] < searchTarget) {
        searchSteps.push({
          type: 'go_right',
          message: `${array[mid]} < ${searchTarget}: Target is in right half. Set left = ${mid + 1}`,
          left: left,
          right: right,
          mid: mid,
          found: false,
          result: '',
          comparisons: comparisonCount
        });
        left = mid + 1;
      } else {
        searchSteps.push({
          type: 'go_left',
          message: `${array[mid]} > ${searchTarget}: Target is in left half. Set right = ${mid - 1}`,
          left: left,
          right: right,
          mid: mid,
          found: false,
          result: '',
          comparisons: comparisonCount
        });
        right = mid - 1;
      }
    }

    searchSteps.push({
      type: 'not_found',
      message: `✗ Not Found! Left pointer (${left}) > right pointer (${right}). Target ${searchTarget} is not in the array.`,
      left: -1,
      right: -1,
      mid: -1,
      found: false,
      result: `${searchTarget} not found in array`,
      comparisons: comparisonCount
    });

    return searchSteps;
  }, [array, target]);

  const runAlgorithm = () => {
    if (!target) return;
    const algorithmSteps = binarySearchAlgorithm();
    setSteps(algorithmSteps);
    setCurrentStep(0);
  };

  const handleCustomArrayInput = (input) => {
    setCustomArrayInput(input);
    try {
      const newArray = input.split(',').map(num => {
        const parsed = parseInt(num.trim(), 10);
        if (isNaN(parsed)) throw new Error('Invalid number');
        return parsed;
      });

      if (newArray.length === 0) throw new Error('Array cannot be empty');

      for (let i = 1; i < newArray.length; i++) {
        if (newArray[i] < newArray[i - 1]) {
          throw new Error('Array must be sorted in ascending order');
        }
      }

      setArray(newArray);
      setErrorMessage('');
    } catch (e) {
      setErrorMessage(e.message);
    }
  };

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  const resetAnimation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setLeft(-1);
    setRight(-1);
    setMid(-1);
    setFound(false);
    setResult('');
    setComparisons(0);
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const generateDefaultArray = () => {
    const defaultArray = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29];
    setArray(defaultArray);
    setCustomArrayInput(defaultArray.join(', '));
    setErrorMessage('');
    resetAnimation();
  };

  const generateNewSortedArray = () => {
    const newArray = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100))
      .sort((a, b) => a - b);
    setArray(newArray);
    setCustomArrayInput(newArray.join(', '));
    setErrorMessage('');
    resetAnimation();
    setTarget('');
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
      const step = steps[currentStep];
      setLeft(step.left || -1);
      setRight(step.right || -1);
      setMid(step.mid || -1);
      setFound(step.found || false);
      setResult(step.result || '');
      setComparisons(step.comparisons || 0);
    }
  }, [currentStep, steps]);

  const renderVisualizer = () => (
    <div className="space-y-6">
      {/* Array Visualization */}
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Search className="text-blue-600" size={28} />
          Array Visualization
        </h3>

        <div className="mb-8">
          <div className="flex justify-center gap-1 flex-wrap mb-8">
            {array.map((num, index) => {
              const isInRange = left >= 0 && right >= 0 && index >= left && index <= right;
              const isMid = mid === index;
              let bgColor = 'bg-gray-300';
              let textColor = 'text-gray-900';
              let borderColor = 'border-gray-400';

              if (isMid && found) {
                bgColor = 'bg-green-500';
                textColor = 'text-white';
                borderColor = 'border-green-600';
              } else if (isMid) {
                bgColor = 'bg-yellow-400';
                textColor = 'text-gray-900';
                borderColor = 'border-yellow-600';
              } else if (isInRange) {
                bgColor = 'bg-blue-300';
                textColor = 'text-white';
                borderColor = 'border-blue-500';
              } else if (found && index < mid) {
                bgColor = 'bg-gray-400';
                textColor = 'text-gray-700';
                borderColor = 'border-gray-500';
              } else if (found && index > mid) {
                bgColor = 'bg-gray-400';
                textColor = 'text-gray-700';
                borderColor = 'border-gray-500';
              }

              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="h-6 mb-1 text-xs font-bold">
                    {index === left && <span className="text-blue-600">L</span>}
                    {index === right && <span className="text-red-600">R</span>}
                    {index === mid && <span className="text-yellow-600">M</span>}
                  </div>
                  <div
                    className={`w-16 h-16 flex items-center justify-center rounded-lg font-bold text-lg transition-all duration-300 border-2 ${bgColor} ${textColor} ${borderColor} ${
                      isMid ? 'scale-110 shadow-lg' : ''
                    }`}
                  >
                    {num}
                  </div>
                  <div className="text-xs mt-1 text-gray-600">[{index}]</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded p-4 border-l-4 border-blue-500">
              <div className="text-sm font-medium text-gray-600">Left Pointer</div>
              <div className="text-2xl font-bold text-blue-600">{left >= 0 ? left : '-'}</div>
            </div>
            <div className="bg-red-50 rounded p-4 border-l-4 border-red-500">
              <div className="text-sm font-medium text-gray-600">Right Pointer</div>
              <div className="text-2xl font-bold text-red-600">{right >= 0 ? right : '-'}</div>
            </div>
            <div className="bg-yellow-50 rounded p-4 border-l-4 border-yellow-500">
              <div className="text-sm font-medium text-gray-600">Mid Index</div>
              <div className="text-2xl font-bold text-yellow-600">{mid >= 0 ? mid : '-'}</div>
            </div>
            <div className="bg-green-50 rounded p-4 border-l-4 border-green-500">
              <div className="text-sm font-medium text-gray-600">Comparisons</div>
              <div className="text-2xl font-bold text-green-600">{comparisons}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className={`rounded-lg p-6 shadow-lg text-center text-xl font-semibold ${
          found
            ? 'bg-green-50 text-green-700 border-2 border-green-500'
            : 'bg-red-50 text-red-700 border-2 border-red-500'
        }`}>
          {result}
        </div>
      )}

      {/* Search Statistics */}
      {steps.length > 0 && (
        <div className="bg-white/90 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold mb-4">Search Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Array Size</p>
              <p className="text-xl font-bold text-gray-900">{array.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Target Value</p>
              <p className="text-xl font-bold text-gray-900">{target || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Comparisons</p>
              <p className="text-xl font-bold text-gray-900">{comparisons}</p>
            </div>
            <div>
              <p className="text-gray-600">Time Complexity</p>
              <p className="text-xl font-bold text-gray-900">O(log n)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const TheorySection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Binary Search Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">Overview</h3>
          <p className="text-gray-700">
            Binary search is an efficient algorithm for finding a target value in a sorted array. It works by repeatedly dividing the search interval in half, eliminating half of the remaining elements with each comparison.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700">Key Characteristics</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>Requires sorted array</li>
              <li>Divide and conquer approach</li>
              <li>Very efficient searching</li>
              <li>Logarithmic time complexity</li>
              <li>Time: O(log n)</li>
              <li>Space: O(1)</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700">Applications</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>Large sorted datasets</li>
              <li>Dictionary lookups</li>
              <li>Database indexing</li>
              <li>Library catalogs</li>
              <li>Version control systems</li>
              <li>Game AI pathfinding</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">How It Works</h4>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>Set left pointer to start, right pointer to end</li>
            <li>Calculate mid point: mid = (left + right) / 2</li>
            <li>Compare array[mid] with target:</li>
            <li className="ml-4">If equal &rarr; element found, return mid</li>
            <li className="ml-4">If array[mid] &lt; target &rarr; search right half (left = mid + 1)</li>
            <li className="ml-4">If array[mid] &gt; target &rarr; search left half (right = mid - 1)</li>
            <li>Repeat until element found or search space is empty</li>
          </ol>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Why Must Array Be Sorted?</h4>
          <p className="text-gray-700 text-sm">
            Binary search relies on eliminating half of the search space with each comparison. This is only possible because we know that if the target is less than mid, it must be in the left half, and if it's greater, it must be in the right half. This property only holds for sorted arrays.
          </p>
        </div>

        <div className="bg-blue-100 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-blue-900">Efficiency Comparison</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <p><span className="font-semibold">Linear Search:</span> O(n) - checks each element sequentially</p>
            <p><span className="font-semibold">Binary Search:</span> O(log n) - eliminates half with each step</p>
            <p>For array of 1,000,000 elements: Linear needs ~500,000 comparisons, Binary needs ~20</p>
          </div>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
        Pseudocode
      </h2>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-semibold mb-3 text-lg">Binary Search Algorithm</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-auto text-sm font-mono leading-relaxed">
            <code>{`BINARY-SEARCH(array, target):
  left = 0
  right = array.length - 1

  // Continue searching while range is valid
  while left <= right:
    // Calculate mid point
    mid = floor((left + right) / 2)

    // Check if target found
    if array[mid] == target:
      return mid            // Element found
    
    // Eliminate left or right half
    else if array[mid] < target:
      left = mid + 1        // Search right half
    else:
      right = mid - 1       // Search left half

  // Target not found
  return -1`}</code>
          </pre>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-semibold mb-2 text-yellow-900">Complexity Analysis</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold">Time Complexity</p>
              <p className="text-gray-600">O(log n)</p>
              <p className="text-xs mt-1">Each iteration eliminates half of elements</p>
            </div>
            <div>
              <p className="font-semibold">Space Complexity</p>
              <p className="text-gray-600">O(1)</p>
              <p className="text-xs mt-1">Only uses constant extra space</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold mb-2 text-blue-900">Algorithm Steps</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <p><span className="font-semibold">Step 1:</span> Initialize left and right pointers</p>
            <p><span className="font-semibold">Step 2:</span> Calculate middle index</p>
            <p><span className="font-semibold">Step 3:</span> Compare middle element with target</p>
            <p><span className="font-semibold">Step 4:</span> Move pointers to search appropriate half</p>
            <p><span className="font-semibold">Step 5:</span> Repeat until found or search space empty</p>
          </div>
        </div>

        <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
          <h4 className="font-semibold mb-2 text-pink-900">Recurrence Relation</h4>
          <p className="font-mono font-semibold text-gray-800 text-center bg-white p-3 rounded border border-pink-200">
            T(n) = T(n/2) + O(1)
          </p>
          <p className="text-sm text-gray-700 mt-2">Master Theorem: T(n) = O(log n)</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold mb-2 text-green-900">Variants</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <p><span className="font-semibold">Recursive Binary Search:</span> Uses function recursion instead of loops</p>
            <p><span className="font-semibold">Lower Bound Search:</span> Finds first position where element could be inserted</p>
            <p><span className="font-semibold">Upper Bound Search:</span> Finds last position where element could be inserted</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
            Binary Search Visualizer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Visualize how binary search efficiently finds elements in sorted arrays by repeatedly dividing the search space.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 rounded-lg p-3 shadow-lg mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'visualizer', label: 'Visualizer', icon: Search },
              { id: 'theory', label: 'Theory', icon: BookOpen },
              { id: 'pseudocode', label: 'Pseudocode', icon: Code }
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    tab === t.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
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
          <div className="bg-white/80 rounded-lg p-6 shadow-lg mb-6 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Enter number to search"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={runAlgorithm}
                disabled={!target || steps.length > 0}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors font-medium"
              >
                <Search size={18} /> Search
              </button>

              <button
                onClick={toggleAnimation}
                disabled={steps.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium"
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} />}
                {isRunning ? 'Pause' : 'Play'}
              </button>

              <button
                onClick={stepForward}
                disabled={currentStep >= steps.length - 1 || steps.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors font-medium"
              >
                <StepForward size={18} /> Step
              </button>

              <button
                onClick={resetAnimation}
                disabled={steps.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors font-medium"
              >
                <RotateCcw size={18} /> Reset
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Array (comma-separated, sorted):</label>
                <input
                  type="text"
                  value={customArrayInput}
                  onChange={(e) => handleCustomArrayInput(e.target.value)}
                  placeholder="Enter sorted array"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={generateDefaultArray}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Reset to Default Array
                </button>

                <button
                  onClick={generateNewSortedArray}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium"
                >
                  Generate New Array
                </button>
              </div>
            </div>

            {steps.length > 0 && (
              <div>
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

                <div className="flex items-center gap-2 mt-4">
                  <span className="text-sm font-medium">Speed:</span>
                  <select
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                    className="p-2 border rounded-lg text-sm"
                  >
                    <option value={1500}>Slow</option>
                    <option value={1000}>Normal</option>
                    <option value={300}>Fast</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        {tab === 'visualizer' && renderVisualizer()}
        {tab === 'theory' && <div className="mt-6"><TheorySection /></div>}
        {tab === 'pseudocode' && <div className="mt-6"><PseudocodeSection /></div>}

        {/* Step Information */}
        {tab === 'visualizer' && steps[currentStep] && (
          <div className="bg-white/90 rounded-lg p-6 shadow-lg mt-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-2">Current Step:</h3>
            <p className="text-gray-700 text-lg">{steps[currentStep].message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BinarySearch;