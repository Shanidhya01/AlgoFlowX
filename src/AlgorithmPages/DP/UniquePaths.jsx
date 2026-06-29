import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const DEFAULT_M = 5;
const DEFAULT_N = 5;

function generateUniquePathsSteps(m, n) {
  const steps = [];
  const dp = Array.from({ length: m }, () => new Array(n).fill(0));

  // Init first row and col to 1
  for (let i = 0; i < m; i++) dp[i][0] = 1;
  for (let j = 0; j < n; j++) dp[0][j] = 1;

  steps.push({
    dp: dp.map(r => [...r]), ci: -1, cj: -1, m, n, phase: 'init',
    message: `Initialize: all cells in first row and column have exactly 1 path (only straight movement). Grid: ${m}×${n}.`
  });

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      steps.push({
        dp: dp.map(r => [...r]), ci: i, cj: j, m, n, phase: 'compare',
        message: `dp[${i}][${j}] = dp[${i-1}][${j}] + dp[${i}][${j-1}] = ${dp[i-1][j]} + ${dp[i][j-1]}`
      });
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
      steps.push({
        dp: dp.map(r => [...r]), ci: i, cj: j, m, n, phase: 'update',
        message: `dp[${i}][${j}] = ${dp[i][j]} paths reach this cell (from above: ${dp[i-1][j]}, from left: ${dp[i][j-1]})`
      });
    }
  }

  steps.push({
    dp: dp.map(r => [...r]), ci: m - 1, cj: n - 1, m, n, phase: 'done',
    message: `Total unique paths from (0,0) to (${m-1},${n-1}) = ${dp[m-1][n-1]}`,
    done: true
  });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="Unique Paths">
      <p>Count the number of unique paths from top-left to bottom-right of an m×n grid, moving only right or down.</p>
      <p>Each cell (i,j) can be reached from (i-1,j) [above] or (i,j-1) [left]. So the number of paths to (i,j) equals the sum of paths to its neighbors:</p>
      <p className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-xs">dp[i][j] = dp[i-1][j] + dp[i][j-1]</p>
      <p>This produces Pascal's triangle rotated 45°. The answer is C(m+n-2, m-1).</p>
    </TheorySection>
    <TheorySection title="Combinatorial Solution">
      <p>You need exactly (m-1) down moves and (n-1) right moves in any order. The answer is the binomial coefficient:</p>
      <p className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-xs">C(m+n-2, m-1) = (m+n-2)! / ((m-1)! × (n-1)!)</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['DP', 'O(m × n)', 'O(m × n) or O(n)'],
      ['Math', 'O(min(m,n))', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `int uniquePaths(int m, int n) {
    vector<vector<int>> dp(m, vector<int>(n, 1));
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            dp[i][j] = dp[i-1][j] + dp[i][j-1];
    return dp[m-1][n-1];
}`,
    'Python': `def uniquePaths(m, n):
    dp = [[1]*n for _ in range(m)]
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
    return dp[m-1][n-1]`,
    'JavaScript': `function uniquePaths(m, n) {
    const dp = Array.from({length:m}, ()=>new Array(n).fill(1));
    for (let i = 1; i < m; i++)
        for (let j = 1; j < n; j++)
            dp[i][j] = dp[i-1][j] + dp[i][j-1];
    return dp[m-1][n-1];
}`,
    'Java': `public int uniquePaths(int m, int n) {
    int[][] dp = new int[m][n];
    for (int[] row : dp) Arrays.fill(row, 1);
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            dp[i][j] = dp[i-1][j] + dp[i][j-1];
    return dp[m-1][n-1];
}`,
  }} />
);

export default function UniquePathsPage() {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(400);
  const timerRef = useRef(null);

  const initSteps = useCallback((m, n) => {
    const st = generateUniquePathsSteps(m, n);
    setSteps(st); setCurrentStep(0); setIsRunning(false);
  }, []);

  useEffect(() => { initSteps(DEFAULT_M, DEFAULT_N); }, [initSteps]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) { setIsRunning(false); return prev; }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, speed, steps.length]);

  const handleRandomize = useCallback(() => {
    const m = 3 + Math.floor(Math.random() * 3);
    const n = 3 + Math.floor(Math.random() * 3);
    initSteps(m, n);
  }, [initSteps]);

  const step = steps[currentStep] || {};
  const m = step.m || DEFAULT_M;
  const n = step.n || DEFAULT_N;
  const dp = step.dp || Array.from({ length: m }, () => new Array(n).fill(0));
  const maxVal = dp[m - 1]?.[n - 1] || 1;

  return (
    <AlgorithmPageShell
      title="Unique Paths"
      description="Count all paths from top-left to bottom-right moving only right or down — Pascal's triangle in a grid"
      category="Dynamic Programming"
      difficulty="Medium"
      steps={steps} currentStep={currentStep} isRunning={isRunning}
      onPlay={() => setIsRunning(true)} onPause={() => setIsRunning(false)}
      onReset={() => { setIsRunning(false); setCurrentStep(0); }}
      onStepForward={() => setCurrentStep(p => Math.min(p + 1, steps.length - 1))}
      onStepBack={() => setCurrentStep(p => Math.max(p - 1, 0))}
      speed={speed} onSpeedChange={setSpeed} onRandomize={handleRandomize}
      showInput={false}
      stats={{ m, n, result: dp[m - 1]?.[n - 1] || 1 }}
      message={step.message || ''} done={step.done || false}
      theory={theory} code={code}
      advantages={[
        'Very clean O(m×n) DP formulation',
        'Combinatorial formula C(m+n-2, m-1) gives O(1) solution',
        'Forms the base of obstacle-version (Unique Paths II)',
      ]}
      disadvantages={[
        'Combinatorial formula overflows for large grids (use BigInteger)',
        'DP approach uses O(m×n) space (reducible to O(n))',
        'Only handles right/down movement',
      ]}
      applications={[
        'Robot navigation counting',
        'Counting distinct binary sequences',
        'Pascal triangle pattern generation',
        'Combinatorics education',
      ]}
      interviewTips={[
        'Answer = C(m+n-2, m-1) — recognize the combinatorial identity',
        'Space optimization: use 1D array, dp[j] += dp[j-1]',
        'Unique Paths II adds obstacles: set dp[i][j]=0 if blocked',
        'Show awareness of overflow for large m,n',
      ]}
      relatedAlgos={[
        { title: 'Min Path Sum', route: '/dp/min-path-sum' },
        { title: 'Egg Dropping', route: '/dp/egg-dropping' },
      ]}
      practiceProblems={[
        { name: 'Unique Paths', difficulty: 'Medium', url: 'https://leetcode.com/problems/unique-paths/' },
        { name: 'Unique Paths II', difficulty: 'Medium', url: 'https://leetcode.com/problems/unique-paths-ii/' },
        { name: 'Minimum Path Sum', difficulty: 'Medium', url: 'https://leetcode.com/problems/minimum-path-sum/' },
      ]}
    >
      {/* Grid visualization */}
      <p className="text-xs text-gray-400 mb-3 text-center">
        Each cell = paths from above + paths from left &nbsp;|&nbsp;
        <span className="text-amber-500">amber</span> = computing &nbsp;
        <span className="text-emerald-500">green</span> = destination
      </p>
      <div className="flex justify-center">
        <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
          {dp.map((row, i) => row.map((v, j) => {
            const isActive = step.ci === i && step.cj === j;
            const isDest = i === m - 1 && j === n - 1;
            const isStart = i === 0 && j === 0;
            const intensity = v > 0 ? Math.min(1, v / maxVal) : 0;
            return (
              <div
                key={`${i}-${j}`}
                className={`w-12 h-12 rounded-xl border-2 flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isActive ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-400 text-amber-700 dark:text-amber-200 scale-110' :
                  isDest && step.done ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-400 text-emerald-700 dark:text-emerald-200 scale-110' :
                  isStart ? 'bg-sky-100 dark:bg-sky-900/40 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-200' :
                  v > 0 ? 'border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-200' :
                  'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                }`}
                style={v > 0 && !isActive && !isDest && !isStart ? {
                  backgroundColor: `rgba(99,102,241,${0.06 + intensity * 0.2})`,
                } : {}}
              >
                <span className="font-mono">{v || ''}</span>
                {isStart && <span className="text-[8px]">START</span>}
                {isDest && step.done && <span className="text-[8px]">END</span>}
              </div>
            );
          }))}
        </div>
      </div>

      {step.done && (
        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            Total unique paths in {m}×{n} grid = <span className="text-lg">{dp[m-1][n-1]}</span>
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            = C({m+n-2}, {m-1}) (combinatorial)
          </p>
        </div>
      )}
    </AlgorithmPageShell>
  );
}
