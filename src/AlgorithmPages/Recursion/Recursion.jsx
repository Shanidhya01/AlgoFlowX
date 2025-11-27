import React, { useState } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, GitBranch } from 'lucide-react';

function Recursion() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [number, setNumber] = useState(5);
  const [steps, setSteps] = useState([]);
  const [customInput, setCustomInput] = useState('5');
  const [errorMessage, setErrorMessage] = useState('');

  const maxSteps = number * 2;

  const calculateFactorial = (n) => {
    if (n <= 1) return 1;
    return n * calculateFactorial(n - 1);
  };

  const generateSteps = () => {
    const stepsList = [];
    
    // Going down the recursion tree
    for (let i = 0; i < number; i++) {
      stepsList.push({
        type: 'descending',
        message: `Calling factorial(${number - i}). Current value: ${number - i}`,
        depth: i + 1,
        currentCall: number - i,
        stackFrames: Array.from({ length: i + 1 }, (_, j) => ({
          n: number - j,
          result: null,
          status: j === i ? 'active' : 'waiting'
        }))
      });
    }

    // Going back up the recursion tree
    for (let i = 0; i < number; i++) {
      const currentN = i + 1;
      stepsList.push({
        type: 'ascending',
        message: `Returning from factorial(${currentN}). Result: ${calculateFactorial(currentN)}`,
        depth: number - i,
        currentCall: currentN,
        stackFrames: Array.from({ length: number - i }, (_, j) => ({
          n: number - j,
          result: calculateFactorial(number - j),
          status: j === 0 ? 'returning' : 'waiting'
        }))
      });
    }

    return stepsList;
  };

  const handleSort = () => {
    const newSteps = generateSteps();
    setSteps(newSteps);
    setCurrentStep(0);
    setIsRunning(false);
  };

  const handleNumberChange = (value) => {
    const newNum = Math.min(7, Math.max(1, parseInt(value) || 1));
    setNumber(newNum);
    setCurrentStep(0);
    setSteps([]);
    setIsRunning(false);
  };

  const handleCustomInput = (input) => {
    setCustomInput(input);
    try {
      const newNum = parseInt(input.trim(), 10);
      if (isNaN(newNum)) throw new Error('Invalid number');
      if (newNum < 1 || newNum > 7) throw new Error('Number must be between 1 and 7');
      setNumber(newNum);
      setErrorMessage('');
      setIsRunning(false);
      setCurrentStep(0);
      setSteps([]);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const toggleAnimation = () => {
    if (steps.length === 0) return;
    setIsRunning(!isRunning);
  };

  const resetAnimation = () => {
    setIsRunning(false);
    setCurrentStep(0);
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  React.useEffect(() => {
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
          <GitBranch className="text-blue-600" size={28} />
          Recursion Tree Visualization
        </h3>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left side - Tree */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Recursion Tree (factorial({number}))</h4>
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enter number (1-7):</label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={number}
                  onChange={(e) => handleNumberChange(e.target.value)}
                  className="px-3 py-2 w-20 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex flex-col items-center mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg w-full max-h-96 overflow-auto">
                {renderTreeNodes(number, currentStepData)}
              </div>
            </div>
          </div>

          {/* Right side - Statistics and Stack */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-700">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Statistics</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Stack Depth</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentStepData.depth || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Call</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">factorial({currentStepData.currentCall || 0})</p>
                </div>
                {currentStep === steps.length - 1 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Final Result</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{calculateFactorial(number)}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-600">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Legend</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-yellow-400 dark:bg-yellow-600"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Active Call</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-purple-400 dark:bg-purple-600"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Waiting</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-green-400 dark:bg-green-600"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Returning</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4 border-2 border-orange-300 dark:border-orange-700">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Call Stack</h4>
              <div className="space-y-1">
                {currentStepData.stackFrames?.map((frame, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded text-sm font-mono transition-all ${
                      frame.status === 'active'
                        ? 'bg-yellow-400 dark:bg-yellow-600 text-gray-900 dark:text-white'
                        : frame.status === 'returning'
                        ? 'bg-green-400 dark:bg-green-600 text-gray-900 dark:text-white'
                        : 'bg-purple-300 dark:bg-purple-600 text-gray-900 dark:text-white'
                    }`}
                  >
                    factorial({frame.n}) {frame.result && `→ ${frame.result}`}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTreeNodes = (value, stepData) => {
    if (value <= 0) return null;

    const isActive = stepData.currentCall === value;
    const isCompleted = currentStep > (number - value);

    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <div
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-white font-bold text-sm transition-all ${
              isActive
                ? 'bg-yellow-400 dark:bg-yellow-600 border-yellow-600 dark:border-yellow-700 scale-110'
                : isCompleted
                ? 'bg-green-400 dark:bg-green-600 border-green-600 dark:border-green-700'
                : 'bg-purple-400 dark:bg-purple-600 border-purple-600 dark:border-purple-700'
            }`}
          >
            {value}
          </div>
          {value > 1 && (
            <div className="absolute w-[2px] h-6 bg-gray-400 dark:bg-gray-500 left-1/2 -translate-x-1/2 -bottom-6" />
          )}
        </div>
        {value > 1 && (
          <div className="mt-8">
            {renderTreeNodes(value - 1, stepData)}
          </div>
        )}
      </div>
    );
  };

  const TheorySection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Recursion Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">What is Recursion?</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Recursion is a programming technique where a function calls itself to solve a larger problem by breaking it down into smaller, similar sub-problems. Each recursive call works on a smaller instance until a base case is reached.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Key Components</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Base Case: Condition to stop recursion</li>
              <li>Recursive Case: Function calls itself</li>
              <li>Progress toward Base Case</li>
              <li>Call Stack management</li>
              <li>Return values combine results</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">How It Works</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Call stack grows as recursion deepens</li>
              <li>Base case triggers return phase</li>
              <li>Results propagate back up</li>
              <li>Each frame cleaned up after return</li>
              <li>Final result computed</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Recursion vs Iteration</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
            <p><span className="font-bold">Recursion:</span> Elegant, intuitive for tree-like problems, can use more memory</p>
            <p><span className="font-bold">Iteration:</span> More efficient, less memory overhead, but sometimes less readable</p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Complexity Analysis</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm font-mono">
            <p>Factorial - Time: <span className="font-bold">O(n)</span></p>
            <p>Factorial - Space: <span className="font-bold">O(n)</span> (call stack depth)</p>
          </div>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
        Recursion Implementation
      </h2>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
        <h4 className="font-semibold mb-3 text-lg">Factorial Function</h4>
        <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
          <code>{`function factorial(n):
  // Base case: when to stop recursion
  if n <= 1:
    return 1
  
  // Recursive case: function calls itself
  return n * factorial(n - 1)

// Example: factorial(5)
// = 5 * factorial(4)
// = 5 * (4 * factorial(3))
// = 5 * (4 * (3 * factorial(2)))
// = 5 * (4 * (3 * (2 * factorial(1))))
// = 5 * (4 * (3 * (2 * 1)))
// = 120`}</code>
        </pre>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Advantages</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Elegant and intuitive</li>
            <li>Naturally fits tree problems</li>
            <li>Divides problem into subproblems</li>
            <li>Cleaner, more readable code</li>
            <li>Easier to understand logic</li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <h4 className="font-semibold mb-2 text-green-900 dark:text-green-300">Disadvantages</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Uses more memory (call stack)</li>
            <li>Slower than iteration</li>
            <li>Risk of stack overflow</li>
            <li>Harder to debug</li>
            <li>Need careful base case design</li>
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
            Recursion Visualizer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Watch how recursion builds the call stack and then returns values as it unwinds, using factorial as an example.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 shadow-lg mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'visualizer', label: 'Visualizer', icon: GitBranch },
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
                <GitBranch size={18} /> Visualize
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
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{steps[currentStep]?.type?.toUpperCase()}</span>
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
                Enter Number (1-7) to Calculate Factorial:
              </label>
              <input
                type="number"
                value={customInput}
                onChange={(e) => handleCustomInput(e.target.value)}
                placeholder="Enter a number between 1 and 7"
                min="1"
                max="7"
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              {errorMessage && (
                <p className="text-red-600 dark:text-red-400 text-sm font-semibold mb-2">⚠️ {errorMessage}</p>
              )}
              <button
                onClick={() => handleCustomInput(Math.floor(Math.random() * 7) + 1)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Random Number (1-7)
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

        {/* Footer */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 text-center shadow-lg">
          <h3 className="text-xl font-bold mb-2">Master Recursion! 🔄</h3>
          <p>Recursion is a powerful technique for solving problems that have a recursive structure. Understanding the call stack is key to mastering recursion.</p>
        </div>
      </div>
    </div>
  );
}

export default Recursion;