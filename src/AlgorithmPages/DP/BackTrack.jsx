import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, GitBranch } from 'lucide-react';

function BacktrackingVisualizer() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(800);

  const [problem, setProblem] = useState('subset');
  const [n, setN] = useState(3);
  const [currentPath, setCurrentPath] = useState([]);
  const [allSolutions, setAllSolutions] = useState([]);
  const [message, setMessage] = useState('');

  // Subset Generation
  const subsetBacktrack = useCallback(() => {
    const operationSteps = [];
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    const solutions = [];

    operationSteps.push({
      type: 'initialize',
      message: `Generate all subsets of [${arr.join(', ')}] using backtracking.`,
      currentPath: [],
      allSolutions: [],
    });

    const backtrack = (index, current) => {
      operationSteps.push({
        type: 'visit',
        message: `Visiting: Current subset = [${current.join(', ')}], Index = ${index}`,
        currentPath: [...current],
        allSolutions: [...solutions],
      });

      if (index === arr.length) {
        solutions.push([...current]);
        operationSteps.push({
          type: 'solution_found',
          message: `✓ Found solution: [${current.join(', ')}]`,
          currentPath: [...current],
          allSolutions: [...solutions],
        });
        return;
      }

      // Include current element
      operationSteps.push({
        type: 'include',
        message: `Include ${arr[index]}: [${[...current, arr[index]].join(', ')}]`,
        currentPath: [...current, arr[index]],
        allSolutions: [...solutions],
      });

      current.push(arr[index]);
      backtrack(index + 1, current);
      current.pop();

      operationSteps.push({
        type: 'backtrack',
        message: `Backtrack from ${arr[index]}: Remove it, continue exploring`,
        currentPath: [...current],
        allSolutions: [...solutions],
      });

      // Exclude current element
      operationSteps.push({
        type: 'exclude',
        message: `Exclude ${arr[index]}: Skip to next element`,
        currentPath: [...current],
        allSolutions: [...solutions],
      });

      backtrack(index + 1, current);
    };

    backtrack(0, []);

    operationSteps.push({
      type: 'complete',
      message: `✓ Complete! Generated ${solutions.length} subsets. Time: O(2^n)`,
      currentPath: [],
      allSolutions: [...solutions],
    });

    return operationSteps;
  }, [n]);

  // Permutation Generation
  const permutationBacktrack = useCallback(() => {
    const operationSteps = [];
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    const solutions = [];

    operationSteps.push({
      type: 'initialize',
      message: `Generate all permutations of [${arr.join(', ')}] using backtracking.`,
      currentPath: [],
      allSolutions: [],
    });

    const backtrack = (current, remaining) => {
      if (remaining.length === 0) {
        solutions.push([...current]);
        operationSteps.push({
          type: 'solution_found',
          message: `✓ Found permutation: [${current.join(', ')}]`,
          currentPath: [...current],
          allSolutions: [...solutions],
        });
        return;
      }

      for (let i = 0; i < remaining.length; i++) {
        const num = remaining[i];
        operationSteps.push({
          type: 'try_choice',
          message: `Try: Add ${num} to [${current.join(', ')}]`,
          currentPath: [...current, num],
          allSolutions: [...solutions],
        });

        const newRemaining = remaining.filter((_, idx) => idx !== i);
        backtrack([...current, num], newRemaining);

        operationSteps.push({
          type: 'backtrack',
          message: `Backtrack from ${num}: Remove it, try next choice`,
          currentPath: [...current],
          allSolutions: [...solutions],
        });
      }
    };

    backtrack([], arr);

    operationSteps.push({
      type: 'complete',
      message: `✓ Complete! Generated ${solutions.length} permutations. Time: O(n!)`,
      currentPath: [],
      allSolutions: [...solutions],
    });

    return operationSteps;
  }, [n]);

  // Combinations Generation
  const combinationBacktrack = useCallback(() => {
    const operationSteps = [];
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    const k = Math.ceil(n / 2);
    const solutions = [];

    operationSteps.push({
      type: 'initialize',
      message: `Generate all ${k}-combinations of [${arr.join(', ')}] using backtracking.`,
      currentPath: [],
      allSolutions: [],
    });

    const backtrack = (start, current) => {
      if (current.length === k) {
        solutions.push([...current]);
        operationSteps.push({
          type: 'solution_found',
          message: `✓ Found ${k}-combination: [${current.join(', ')}]`,
          currentPath: [...current],
          allSolutions: [...solutions],
        });
        return;
      }

      for (let i = start; i < arr.length; i++) {
        operationSteps.push({
          type: 'try_choice',
          message: `Try: Add ${arr[i]} to [${current.join(', ')}]`,
          currentPath: [...current, arr[i]],
          allSolutions: [...solutions],
        });

        current.push(arr[i]);
        backtrack(i + 1, current);
        current.pop();

        operationSteps.push({
          type: 'backtrack',
          message: `Backtrack from ${arr[i]}: Remove it, try next element`,
          currentPath: [...current],
          allSolutions: [...solutions],
        });
      }
    };

    backtrack(0, []);

    operationSteps.push({
      type: 'complete',
      message: `✓ Complete! Generated ${solutions.length} ${k}-combinations.`,
      currentPath: [],
      allSolutions: [...solutions],
    });

    return operationSteps;
  }, [n]);

  const runAlgorithm = () => {
    let operationSteps = [];

    if (problem === 'subset') {
      operationSteps = subsetBacktrack();
    } else if (problem === 'permutation') {
      operationSteps = permutationBacktrack();
    } else if (problem === 'combination') {
      operationSteps = combinationBacktrack();
    }

    setSteps(operationSteps);
    setCurrentStep(0);
  };

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  const resetAnimation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setCurrentPath([]);
    setAllSolutions([]);
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
      const step = steps[currentStep];
      setCurrentPath(step.currentPath || []);
      setAllSolutions(step.allSolutions || []);
      setMessage(step.message || '');
    }
  }, [currentStep, steps]);

  const renderVisualizer = () => (
    <div className="space-y-6">
      {/* Main Visualization */}
      <div className="bg-white/90 dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <GitBranch className="text-blue-600" size={28} />
          Backtracking Exploration
        </h3>

        {/* Current Path Display */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 p-4 rounded-lg mb-6 border-2 border-blue-200 dark:border-blue-700">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Current Path</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
              [{currentPath.join(', ')}]
            </span>
            {currentPath.length > 0 && (
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                Length: {currentPath.length}
              </span>
            )}
          </div>
        </div>

        {/* Solutions Found */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Solutions Found ({allSolutions.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {allSolutions.map((solution, idx) => (
              <div
                key={idx}
                className="bg-green-100 dark:bg-green-900 border-2 border-green-500 rounded-lg p-2 text-center"
              >
                <p className="text-sm font-mono font-bold text-green-900 dark:text-green-300">
                  [{solution.join(',')}]
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Solutions</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{allSolutions.length}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 dark:text-gray-400">Steps Taken</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{currentStep + 1}/{steps.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg border-l-4 border-green-500">
            <p className="text-sm text-gray-600 dark:text-gray-400">Current Depth</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{currentPath.length}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const TheorySection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Backtracking Algorithm Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">What is Backtracking?</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Backtracking is a problem-solving technique that incrementally builds solutions and abandons a solution as soon as it determines the solution cannot be completed. It's particularly useful for constraint satisfaction problems and exhaustive search problems.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Core Concept</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Build solution incrementally</li>
              <li>Explore each choice recursively</li>
              <li>Backtrack when no valid choice</li>
              <li>Prune invalid branches early</li>
              <li>Find all/optimal solutions</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">Common Problems</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>N-Queens Problem</li>
              <li>Sudoku Solver</li>
              <li>Permutations & Combinations</li>
              <li>Subset Generation</li>
              <li>Word Search</li>
              <li>Graph Coloring</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">General Backtracking Pattern</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
            <p>1. <span className="font-semibold">Choose:</span> Pick a candidate</p>
            <p>2. <span className="font-semibold">Explore:</span> Recursively solve with this choice</p>
            <p>3. <span className="font-semibold">Unchoose:</span> Backtrack if invalid/complete</p>
            <p>4. <span className="font-semibold">Repeat:</span> Try next candidate</p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Time Complexity</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm font-mono">
            <p>Subsets: <span className="font-bold">O(2^n)</span></p>
            <p>Permutations: <span className="font-bold">O(n!)</span></p>
            <p>Combinations: <span className="font-bold">O(C(n,k))</span></p>
          </div>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
        Backtracking Pattern
      </h2>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
        <h4 className="font-semibold mb-3 text-lg">General Pattern</h4>
        <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
          <code>{`BACKTRACK(candidates):
  if is_complete(candidates):
    add candidates to solutions
    return
  
  for each choice in get_choices(candidates):
    if is_valid(candidates, choice):
      # Choose
      candidates.add(choice)
      
      # Explore
      BACKTRACK(candidates)
      
      # Unchoose (backtrack)
      candidates.remove(choice)`}</code>
        </pre>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
        <h4 className="font-semibold mb-3 text-lg">Subset Generation Example</h4>
        <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
          <code>{`SUBSETS(arr, index, current):
  if index == arr.length:
    solutions.push(current)
    return
  
  # Include current element
  current.push(arr[index])
  SUBSETS(arr, index+1, current)
  current.pop()  // Backtrack
  
  # Exclude current element
  SUBSETS(arr, index+1, current)`}</code>
        </pre>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Key Optimizations</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Early pruning</li>
            <li>Constraint checking</li>
            <li>Memoization for subproblems</li>
            <li>Eliminate duplicates</li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <h4 className="font-semibold mb-2 text-green-900 dark:text-green-300">When to Use</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Find all solutions</li>
            <li>Exhaustive search</li>
            <li>Constraint satisfaction</li>
            <li>Combinatorial problems</li>
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
            Backtracking Algorithm Visualizer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Master backtracking by exploring recursive solutions, pruning invalid branches, and finding all valid combinations.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 shadow-lg mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'visualizer', label: 'Visualizer', icon: GitBranch },
              { id: 'theory', label: 'Theory', icon: BookOpen },
              { id: 'pseudocode', label: 'Patterns', icon: Code }
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Problem:</label>
                <select
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  disabled={isRunning || steps.length > 0}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="subset">Subsets</option>
                  <option value="permutation">Permutations</option>
                  <option value="combination">Combinations</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Size (N):</label>
                <input
                  type="number"
                  value={n}
                  onChange={(e) => setN(parseInt(e.target.value))}
                  disabled={isRunning || steps.length > 0}
                  min="2"
                  max="5"
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              <button
                onClick={runAlgorithm}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                <GitBranch size={18} /> Explore
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
            <p className="text-gray-700 dark:text-gray-300">{message}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 text-center shadow-lg">
          <h3 className="text-xl font-bold mb-2">Master Backtracking! 🔙</h3>
          <p>Backtracking explores the solution space intelligently, pruning invalid paths and finding all valid solutions efficiently.</p>
        </div>
      </div>
    </div>
  );
}

export default BacktrackingVisualizer;