import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, Search } from 'lucide-react';

function LinearSearch() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  
  const [array, setArray] = useState([45, 23, 67, 12, 89, 34, 56, 78, 90, 11]);
  const [target, setTarget] = useState('');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [visitedIndices, setVisitedIndices] = useState([]);
  const [found, setFound] = useState(false);
  const [result, setResult] = useState('');

  const linearSearchAlgorithm = useCallback(() => {
    const searchSteps = [];
    const searchTarget = parseInt(target);
    
    searchSteps.push({
      type: 'initialize',
      message: `Initialize: Start searching for ${searchTarget} in the array`,
      currentIndex: -1,
      visitedIndices: [],
      found: false,
      result: ''
    });

    for (let i = 0; i < array.length; i++) {
      searchSteps.push({
        type: 'check',
        message: `Check index ${i}: array[${i}] = ${array[i]}, comparing with target ${searchTarget}`,
        currentIndex: i,
        visitedIndices: Array.from({length: i}, (_, idx) => idx),
        found: false,
        result: ''
      });

      if (array[i] === searchTarget) {
        searchSteps.push({
          type: 'found',
          message: `✓ Found! ${searchTarget} is at index ${i}`,
          currentIndex: i,
          visitedIndices: Array.from({length: i + 1}, (_, idx) => idx),
          found: true,
          result: `Found ${searchTarget} at index ${i}`
        });
        return searchSteps;
      }
    }

    searchSteps.push({
      type: 'not_found',
      message: `✗ Not Found! ${searchTarget} is not in the array after checking all ${array.length} elements`,
      currentIndex: -1,
      visitedIndices: Array.from({length: array.length}, (_, idx) => idx),
      found: false,
      result: `${searchTarget} not found in the array`
    });

    return searchSteps;
  }, [array, target]);

  const runAlgorithm = () => {
    if (!target) return;
    const algorithmSteps = linearSearchAlgorithm();
    setSteps(algorithmSteps);
    setCurrentStep(0);
  };

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  const resetAnimation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setCurrentIndex(-1);
    setVisitedIndices([]);
    setFound(false);
    setResult('');
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const generateNewArray = () => {
    const newArray = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100));
    setArray(newArray);
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
      setCurrentIndex(step.currentIndex || -1);
      setVisitedIndices(step.visitedIndices || []);
      setFound(step.found || false);
      setResult(step.result || '');
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

        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {array.map((num, index) => {
            const isCurrent = currentIndex === index;
            const isVisited = visitedIndices.includes(index);
            let bgColor = 'bg-gray-300';
            let textColor = 'text-gray-900';

            if (isCurrent && found) {
              bgColor = 'bg-green-500';
              textColor = 'text-white';
            } else if (isCurrent) {
              bgColor = 'bg-yellow-400';
              textColor = 'text-gray-900';
            } else if (isVisited) {
              bgColor = 'bg-blue-300';
              textColor = 'text-white';
            }

            return (
              <div
                key={index}
                className={`w-16 h-16 flex flex-col items-center justify-center rounded-lg font-bold text-lg transition-all duration-300 ${bgColor} ${textColor} ${
                  isCurrent ? 'scale-110 shadow-lg' : ''
                }`}
              >
                <span>{num}</span>
                <span className="text-xs mt-1">[{index}]</span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-yellow-50 rounded p-4 border-l-4 border-yellow-500">
            <div className="text-sm font-medium text-gray-600">Current Index</div>
            <div className="text-2xl font-bold text-yellow-600">{currentIndex >= 0 ? currentIndex : '-'}</div>
          </div>
          <div className="bg-blue-50 rounded p-4 border-l-4 border-blue-500">
            <div className="text-sm font-medium text-gray-600">Visited Elements</div>
            <div className="text-2xl font-bold text-blue-600">{visitedIndices.length}</div>
          </div>
          <div className="bg-green-50 rounded p-4 border-l-4 border-green-500">
            <div className="text-sm font-medium text-gray-600">Status</div>
            <div className="text-2xl font-bold text-green-600">{found ? '✓ Found' : 'Searching'}</div>
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
              <p className="text-gray-600">Elements Checked</p>
              <p className="text-xl font-bold text-gray-900">{visitedIndices.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Time Complexity</p>
              <p className="text-xl font-bold text-gray-900">O(n)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const TheorySection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Linear Search Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">Overview</h3>
          <p className="text-gray-700">
            Linear search is the simplest searching algorithm that sequentially checks each element of a list until a match is found or the whole list is searched. It works on both sorted and unsorted arrays.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700">Key Characteristics</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>Simple and straightforward</li>
              <li>Works on unsorted arrays</li>
              <li>Sequential comparison</li>
              <li>No preprocessing needed</li>
              <li>Time: O(n)</li>
              <li>Space: O(1)</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700">Applications</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>Small unsorted datasets</li>
              <li>Finding first occurrence</li>
              <li>Linked lists search</li>
              <li>Database queries</li>
              <li>File searching</li>
              <li>Learning basics</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">How It Works</h4>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>Start from the first element</li>
            <li>Compare the current element with the target value</li>
            <li>If they match, return the index</li>
            <li>If no match, move to the next element</li>
            <li>Repeat until the element is found or list ends</li>
            <li>If not found after checking all elements, return -1</li>
          </ol>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Best vs Worst Case</h4>
          <div className="space-y-2 text-gray-700 text-sm">
            <p><span className="font-semibold">Best Case:</span> O(1) - Element at first position</p>
            <p><span className="font-semibold">Average Case:</span> O(n/2) ≈ O(n) - Element in middle</p>
            <p><span className="font-semibold">Worst Case:</span> O(n) - Element at end or not found</p>
          </div>
        </div>

        <div className="bg-blue-100 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-blue-900">Why Use Linear Search?</h4>
          <p className="text-gray-700 text-sm">
            Despite being slower than binary search, linear search is useful for small arrays, unsorted data, or finding multiple matches. It's also the only option when data is unsorted.
          </p>
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
          <h4 className="font-semibold mb-3 text-lg">Linear Search Algorithm</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-auto text-sm font-mono leading-relaxed">
            <code>{`LINEAR-SEARCH(array, target):
  // Iterate through each element
  for i = 0 to array.length - 1:
    // Check if current element matches target
    if array[i] == target:
      return i              // Element found
  
  // Target not found in array
  return -1`}</code>
          </pre>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-semibold mb-2 text-yellow-900">Complexity Analysis</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold">Time Complexity</p>
              <p className="text-gray-600">O(n)</p>
              <p className="text-xs mt-1">Linear with respect to array size</p>
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
            <p><span className="font-semibold">Step 1:</span> Initialize loop counter to 0</p>
            <p><span className="font-semibold">Step 2:</span> Compare array[i] with target value</p>
            <p><span className="font-semibold">Step 3:</span> If match found, immediately return index</p>
            <p><span className="font-semibold">Step 4:</span> Increment counter and continue</p>
            <p><span className="font-semibold">Step 5:</span> If loop ends, return -1</p>
          </div>
        </div>

        <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
          <h4 className="font-semibold mb-2 text-pink-900">Comparison with Binary Search</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <p><span className="font-semibold">Linear Search:</span> O(n), unsorted arrays, simpler</p>
            <p><span className="font-semibold">Binary Search:</span> O(log n), sorted arrays only, faster</p>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold mb-2 text-green-900">Implementation Variants</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <p><span className="font-semibold">Sentinel Linear Search:</span> Add target at end to avoid bound checking</p>
            <p><span className="font-semibold">Reverse Linear Search:</span> Search from end to beginning</p>
            <p><span className="font-semibold">Find All:</span> Collect all indices where target occurs</p>
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
            Linear Search Visualizer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Visualize how linear search sequentially checks elements until the target is found or the list is exhausted.
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
          <div className="bg-white/80 rounded-lg p-6 shadow-lg mb-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Enter number to search"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={runAlgorithm}
                disabled={!target || isRunning}
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

              <button
                onClick={generateNewArray}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium ml-auto"
              >
                Generate New Array
              </button>
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
              </div>
            )}

            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm font-medium">Speed:</span>
              <select
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                className="p-2 border rounded-lg text-sm"
              >
                <option value={1500}>Slow</option>
                <option value={800}>Normal</option>
                <option value={300}>Fast</option>
              </select>
            </div>
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

export default LinearSearch;