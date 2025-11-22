import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, Zap } from 'lucide-react';

function DynamicProgramming() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  
  const [problem, setProblem] = useState('fibonacci');
  const [n, setN] = useState(6);
  const [dp, setDp] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [result, setResult] = useState(0);
  const [message, setMessage] = useState('');
  const [computedCells, setComputedCells] = useState(new Set());

  // Fibonacci DP
  const fibonacciDP = useCallback(() => {
    const operationSteps = [];
    const memo = Array(n + 1).fill(-1);

    operationSteps.push({
      type: 'initialize',
      message: `Computing Fibonacci(${n}) using Dynamic Programming. Initialize array of size ${n + 1}.`,
      dp: [...memo],
      currentIndex: -1,
      result: 0,
      computed: new Set()
    });

    // Base cases
    memo[0] = 0;
    memo[1] = 1;

    operationSteps.push({
      type: 'base_case',
      message: `Base cases: F(0) = 0, F(1) = 1`,
      dp: [...memo],
      currentIndex: -1,
      result: 0,
      computed: new Set([0, 1])
    });

    // Fill DP table
    for (let i = 2; i <= n; i++) {
      operationSteps.push({
        type: 'compute',
        message: `Computing F(${i}) = F(${i - 1}) + F(${i - 2}) = ${memo[i - 1]} + ${memo[i - 2]}`,
        dp: [...memo],
        currentIndex: i,
        result: 0,
        computed: new Set([...computedCells, i])
      });

      memo[i] = memo[i - 1] + memo[i - 2];

      operationSteps.push({
        type: 'store',
        message: `F(${i}) = ${memo[i]}. Store in dp[${i}]`,
        dp: [...memo],
        currentIndex: -1,
        result: memo[i],
        computed: new Set([...Array(i + 1).keys()])
      });
    }

    operationSteps.push({
      type: 'complete',
      message: `✓ Complete! F(${n}) = ${memo[n]}. Total time: O(n), Space: O(n)`,
      dp: [...memo],
      currentIndex: -1,
      result: memo[n],
      computed: new Set([...Array(n + 1).keys()])
    });

    return operationSteps;
  }, [n, computedCells]);

  // Coin Change DP
  const coinChangeDP = useCallback(() => {
    const operationSteps = [];
    const coins = [1, 2, 5];
    const amount = 10;
    const dp = Array(amount + 1).fill(Infinity);
    dp[0] = 0;

    operationSteps.push({
      type: 'initialize',
      message: `Coin Change Problem: Make amount ${amount} with minimum coins [${coins.join(', ')}]. Initialize dp array.`,
      dp: [...dp],
      currentIndex: -1,
      result: 0,
      computed: new Set([0])
    });

    for (let i = 1; i <= amount; i++) {
      operationSteps.push({
        type: 'check_amount',
        message: `Computing minimum coins for amount ${i}`,
        dp: [...dp],
        currentIndex: i,
        result: 0,
        computed: new Set()
      });

      for (let coin of coins) {
        if (coin <= i && dp[i - coin] !== Infinity) {
          operationSteps.push({
            type: 'try_coin',
            message: `Try coin ${coin}: dp[${i}] = min(${dp[i] === Infinity ? '∞' : dp[i]}, dp[${i - coin}] + 1) = min(${dp[i] === Infinity ? '∞' : dp[i]}, ${dp[i - coin] + 1})`,
            dp: [...dp],
            currentIndex: i,
            result: 0,
            computed: new Set()
          });

          if (dp[i - coin] + 1 < dp[i]) {
            dp[i] = dp[i - coin] + 1;

            operationSteps.push({
              type: 'update',
              message: `Updated: dp[${i}] = ${dp[i]}`,
              dp: [...dp],
              currentIndex: -1,
              result: 0,
              computed: new Set()
            });
          }
        }
      }
    }

    operationSteps.push({
      type: 'complete',
      message: `✓ Complete! Minimum ${dp[amount]} coins needed for amount ${amount}. Coins used: Check backtrack.`,
      dp: [...dp],
      currentIndex: -1,
      result: dp[amount],
      computed: new Set([...Array(amount + 1).keys()])
    });

    return operationSteps;
  }, []);

  // Longest Common Subsequence
  const lcsDP = useCallback(() => {
    const operationSteps = [];
    const str1 = "ABCDGH";
    const str2 = "AEDFHR";
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    operationSteps.push({
      type: 'initialize',
      message: `LCS Problem: Find longest common subsequence of "${str1}" and "${str2}". Initialize (${m + 1}) × (${n + 1}) table.`,
      dp: dp.map(row => [...row]),
      currentIndex: -1,
      result: 0,
      computed: new Set()
    });

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        operationSteps.push({
          type: 'compare',
          message: `Comparing str1[${i - 1}]='${str1[i - 1]}' with str2[${j - 1}]='${str2[j - 1]}'`,
          dp: dp.map(row => [...row]),
          currentIndex: `${i}-${j}`,
          result: 0,
          computed: new Set()
        });

        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;

          operationSteps.push({
            type: 'match',
            message: `Characters match! dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}`,
            dp: dp.map(row => [...row]),
            currentIndex: -1,
            result: 0,
            computed: new Set()
          });
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);

          operationSteps.push({
            type: 'nomatch',
            message: `No match. Take max: dp[${i}][${j}] = max(${dp[i - 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}`,
            dp: dp.map(row => [...row]),
            currentIndex: -1,
            result: 0,
            computed: new Set()
          });
        }
      }
    }

    operationSteps.push({
      type: 'complete',
      message: `✓ Complete! LCS length = ${dp[m][n]}. Time: O(m×n), Space: O(m×n)`,
      dp: dp.map(row => [...row]),
      currentIndex: -1,
      result: dp[m][n],
      computed: new Set()
    });

    return operationSteps;
  }, []);

  const runAlgorithm = () => {
    let operationSteps = [];
    
    if (problem === 'fibonacci') {
      operationSteps = fibonacciDP();
    } else if (problem === 'coinchange') {
      operationSteps = coinChangeDP();
    } else if (problem === 'lcs') {
      operationSteps = lcsDP();
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
    setDp([]);
    setCurrentIndex(-1);
    setResult(0);
    setComputedCells(new Set());
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
      setDp(step.dp || []);
      setCurrentIndex(step.currentIndex || -1);
      setResult(step.result || 0);
      setMessage(step.message || '');
      setComputedCells(step.computed || new Set());
    }
  }, [currentStep, steps]);

  const renderVisualizer = () => (
    <div className="space-y-6">
      {/* DP Table */}
      <div className="bg-white/90 dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Zap className="text-blue-600" size={28} />
          DP Table Visualization
        </h3>

        {/* Problem Selector */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Select Problem:</label>
            <select
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              disabled={isRunning || steps.length > 0}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fibonacci">Fibonacci</option>
              <option value="coinchange">Coin Change</option>
              <option value="lcs">Longest Common Subsequence</option>
            </select>
          </div>

          {problem === 'fibonacci' && (
            <div>
              <label className="block text-sm font-semibold mb-2">N:</label>
              <input
                type="number"
                value={n}
                onChange={(e) => setN(parseInt(e.target.value))}
                disabled={isRunning || steps.length > 0}
                min="2"
                max="15"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* DP Table Display */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {dp.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}>
                  <td className="border-2 border-gray-300 p-2 font-bold text-center bg-blue-100 dark:bg-blue-900 w-12">{i}</td>
                  {(Array.isArray(row) ? row : [row]).map((cell, j) => {
                    const isCurrentCell = currentIndex === i || currentIndex === `${i}-${j}`;
                    return (
                      <td
                        key={`${i}-${j}`}
                        className={`border-2 border-gray-300 p-3 text-center font-mono font-bold transition-all ${
                          isCurrentCell
                            ? 'bg-yellow-300 scale-110'
                            : computedCells.has(i) || computedCells.has(`${i}-${j}`)
                            ? 'bg-green-100 dark:bg-green-900'
                            : 'bg-white dark:bg-gray-800'
                        }`}
                      >
                        {typeof cell === 'number' && cell !== Infinity ? cell : '∞'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Result Display */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 p-6 rounded-lg border-2 border-blue-300 dark:border-blue-700">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Final Result</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{result}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Steps Computed</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{computedCells.size}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Time Complexity</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">O(n)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TheorySection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Dynamic Programming Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">What is Dynamic Programming?</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Dynamic Programming is an optimization technique that solves complex problems by breaking them into simpler subproblems and storing their solutions to avoid recomputation. It uses memoization (top-down) or tabulation (bottom-up) to achieve significant time complexity improvements.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Key Principles</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li><span className="font-semibold">Optimal Substructure:</span> Problem contains optimal solutions to subproblems</li>
              <li><span className="font-semibold">Overlapping Subproblems:</span> Same subproblems computed multiple times</li>
              <li><span className="font-semibold">Memoization:</span> Store computed results to reuse</li>
              <li><span className="font-semibold">Tabulation:</span> Build solutions bottom-up</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">Common Problems</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Fibonacci Sequence</li>
              <li>Coin Change</li>
              <li>Knapsack Problem</li>
              <li>Longest Common Subsequence</li>
              <li>Edit Distance</li>
              <li>Maximum Subarray Sum</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Memoization vs Tabulation</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
            <p><span className="font-semibold">Memoization (Top-Down):</span> Recursion with caching - write natural recursive solution, cache results</p>
            <p><span className="font-semibold">Tabulation (Bottom-Up):</span> Iterative approach - build table from base cases up</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Tabulation is typically faster (no recursion overhead) but requires more code</p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Time Complexity Improvement</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm font-mono">
            <p>Fibonacci: O(2^n) → <span className="font-bold text-green-600 dark:text-green-400">O(n)</span></p>
            <p>Coin Change: O(n^m) → <span className="font-bold text-green-600 dark:text-green-400">O(n×m)</span></p>
            <p>LCS: O(n!) → <span className="font-bold text-green-600 dark:text-green-400">O(m×n)</span></p>
          </div>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
        Implementation Patterns
      </h2>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
        <h4 className="font-semibold mb-3 text-lg">Fibonacci - Memoization Pattern</h4>
        <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
          <code>{`// Top-Down with Memoization
function fib(n, memo = {}) {
  if (n in memo) return memo[n]
  if (n <= 1) return n
  
  memo[n] = fib(n-1, memo) + fib(n-2, memo)
  return memo[n]
}`}</code>
        </pre>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
        <h4 className="font-semibold mb-3 text-lg">Fibonacci - Tabulation Pattern</h4>
        <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
          <code>{`// Bottom-Up with Tabulation
function fib(n) {
  if (n <= 1) return n
  
  const dp = Array(n + 1)
  dp[0] = 0
  dp[1] = 1
  
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i-1] + dp[i-2]
  }
  return dp[n]
}`}</code>
        </pre>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">When to Use DP</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Overlapping subproblems</li>
            <li>Optimal substructure</li>
            <li>Exponential brute force</li>
            <li>Optimization problems</li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <h4 className="font-semibold mb-2 text-green-900 dark:text-green-300">Common State Variables</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>dp[i] = result for size i</li>
            <li>dp[i][j] = result for i,j</li>
            <li>dp[i][j][k] = 3D problem</li>
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
            Dynamic Programming Visualizer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Master DP by visualizing memoization, tabulation, and optimization of classic problems.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 shadow-lg mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'visualizer', label: 'Visualizer', icon: Zap },
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
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <button
                onClick={runAlgorithm}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                <Zap size={18} /> Solve
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
                  className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
            <h3 className="text-lg font-semibold mb-2">Current Step</h3>
            <p className="text-gray-700 dark:text-gray-300">{message}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 text-center shadow-lg">
          <h3 className="text-xl font-bold mb-2">Master Dynamic Programming! 💡</h3>
          <p>DP transforms exponential complexity into polynomial - the power of smart optimization.</p>
        </div>
      </div>
    </div>
  );
}

export default DynamicProgramming;