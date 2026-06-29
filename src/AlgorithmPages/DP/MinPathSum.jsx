import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const DEFAULT_GRID = [
  [1, 3, 1, 2],
  [1, 5, 1, 0],
  [4, 2, 1, 3],
  [2, 1, 3, 1],
];

function generateMinPathSteps(grid) {
  const steps = [];
  const rows = grid.length;
  const cols = grid[0].length;
  const dp = Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => grid[i][j]));
  const path = [];

  steps.push({
    dp: dp.map(r => [...r]), grid, rows, cols, ci: -1, cj: -1, path: [], phase: 'init',
    message: `Min Path Sum in ${rows}×${cols} grid. Move only right or down. Fill dp[i][j] = min cost to reach (i,j).`
  });

  // Fill first row
  for (let j = 1; j < cols; j++) {
    dp[0][j] = dp[0][j - 1] + grid[0][j];
    steps.push({
      dp: dp.map(r => [...r]), grid, rows, cols, ci: 0, cj: j, path: [], phase: 'fill_row',
      message: `dp[0][${j}] = dp[0][${j-1}] + grid[0][${j}] = ${dp[0][j-1]} + ${grid[0][j]} = ${dp[0][j]} (first row, only from left)`
    });
  }

  // Fill first col
  for (let i = 1; i < rows; i++) {
    dp[i][0] = dp[i - 1][0] + grid[i][0];
    steps.push({
      dp: dp.map(r => [...r]), grid, rows, cols, ci: i, cj: 0, path: [], phase: 'fill_col',
      message: `dp[${i}][0] = dp[${i-1}][0] + grid[${i}][0] = ${dp[i-1][0]} + ${grid[i][0]} = ${dp[i][0]} (first col, only from above)`
    });
  }

  // Fill rest
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      dp[i][j] = grid[i][j] + Math.min(dp[i - 1][j], dp[i][j - 1]);
      steps.push({
        dp: dp.map(r => [...r]), grid, rows, cols, ci: i, cj: j, path: [], phase: 'fill',
        message: `dp[${i}][${j}] = grid[${i}][${j}] + min(dp[${i-1}][${j}]=${dp[i-1][j]}, dp[${i}][${j-1}]=${dp[i][j-1]}) = ${dp[i][j]}`
      });
    }
  }

  // Trace path
  let r = rows - 1, c = cols - 1;
  const tracedPath = [[r, c]];
  while (r > 0 || c > 0) {
    if (r === 0) c--;
    else if (c === 0) r--;
    else if (dp[r - 1][c] < dp[r][c - 1]) r--;
    else c--;
    tracedPath.unshift([r, c]);
  }

  steps.push({
    dp: dp.map(r => [...r]), grid, rows, cols, ci: -1, cj: -1, path: tracedPath, phase: 'done',
    message: `Min path sum = ${dp[rows - 1][cols - 1]}. Path traced from (0,0) to (${rows-1},${cols-1}).`,
    done: true
  });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="Minimum Path Sum">
      <p>Given an m×n grid with non-negative numbers, find a path from top-left to bottom-right that minimizes the sum of all numbers along the path. You can only move right or down.</p>
      <p className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-xs">dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])</p>
      <p>Base cases: first row cells only reachable from left; first column cells only reachable from above.</p>
    </TheorySection>
    <TheorySection title="Path Reconstruction">
      <p>Trace back from dp[m-1][n-1] to dp[0][0]: at each cell, move to whichever neighbor (up or left) has the smaller dp value.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Time', 'O(m × n)', 'O(m × n)'],
      ['Space', 'O(m × n) or O(n)', 'O(m × n) or O(n)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `int minPathSum(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++) {
            if (i == 0 && j == 0) continue;
            else if (i == 0) grid[i][j] += grid[i][j-1];
            else if (j == 0) grid[i][j] += grid[i-1][j];
            else grid[i][j] += min(grid[i-1][j], grid[i][j-1]);
        }
    return grid[m-1][n-1];
}`,
    'Python': `def minPathSum(grid):
    m, n = len(grid), len(grid[0])
    for i in range(m):
        for j in range(n):
            if i == j == 0: continue
            elif i == 0: grid[i][j] += grid[i][j-1]
            elif j == 0: grid[i][j] += grid[i-1][j]
            else: grid[i][j] += min(grid[i-1][j], grid[i][j-1])
    return grid[m-1][n-1]`,
    'JavaScript': `function minPathSum(grid) {
    const m = grid.length, n = grid[0].length;
    for (let i = 0; i < m; i++)
        for (let j = 0; j < n; j++) {
            if (i === 0 && j === 0) continue;
            else if (i === 0) grid[i][j] += grid[i][j-1];
            else if (j === 0) grid[i][j] += grid[i-1][j];
            else grid[i][j] += Math.min(grid[i-1][j], grid[i][j-1]);
        }
    return grid[m-1][n-1];
}`,
    'Java': `public int minPathSum(int[][] grid) {
    int m = grid.length, n = grid[0].length;
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++) {
            if (i==0&&j==0) continue;
            else if (i==0) grid[i][j]+=grid[i][j-1];
            else if (j==0) grid[i][j]+=grid[i-1][j];
            else grid[i][j]+=Math.min(grid[i-1][j],grid[i][j-1]);
        }
    return grid[m-1][n-1];
}`,
  }} />
);

export default function MinPathSumPage() {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(400);
  const timerRef = useRef(null);

  const initSteps = useCallback((g) => {
    const st = generateMinPathSteps(g);
    setSteps(st); setCurrentStep(0); setIsRunning(false);
  }, []);

  useEffect(() => { initSteps(DEFAULT_GRID); }, [initSteps]);

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
    const r = 3 + Math.floor(Math.random() * 2);
    const c = 3 + Math.floor(Math.random() * 2);
    const g = Array.from({ length: r }, () => Array.from({ length: c }, () => Math.floor(Math.random() * 9) + 1));
    initSteps(g);
  }, [initSteps]);

  const step = steps[currentStep] || {};
  const grid = step.grid || DEFAULT_GRID;
  const dp = step.dp || DEFAULT_GRID.map(r => [...r]);
  const rows = grid.length;
  const cols = grid[0].length;
  const pathSet = new Set((step.path || []).map(([r, c]) => `${r},${c}`));

  return (
    <AlgorithmPageShell
      title="Minimum Path Sum"
      description="Find the path from top-left to bottom-right with minimum sum — 2D DP"
      category="Dynamic Programming"
      difficulty="Medium"
      steps={steps} currentStep={currentStep} isRunning={isRunning}
      onPlay={() => setIsRunning(true)} onPause={() => setIsRunning(false)}
      onReset={() => { setIsRunning(false); setCurrentStep(0); }}
      onStepForward={() => setCurrentStep(p => Math.min(p + 1, steps.length - 1))}
      onStepBack={() => setCurrentStep(p => Math.max(p - 1, 0))}
      speed={speed} onSpeedChange={setSpeed} onRandomize={handleRandomize}
      showInput={false}
      stats={{ rows, cols, result: dp[rows - 1] ? dp[rows - 1][cols - 1] : '-' }}
      message={step.message || ''} done={step.done || false}
      theory={theory} code={code}
      advantages={[
        'Simple O(m×n) DP, modifiable in-place',
        'Can be reduced to O(n) space using single row array',
        'Template for all grid path problems',
      ]}
      disadvantages={[
        'Only right/down movement — cannot handle arbitrary directions',
        'Modifies input grid unless separate dp array used',
        'With obstacles, requires special handling',
      ]}
      applications={[
        'Robot path planning on grids',
        'Packet routing in grid networks',
        'Image seam carving',
        'Game pathfinding with costs',
      ]}
      interviewTips={[
        'In-place modification saves O(mn) extra space',
        'To reduce to O(n) space: use 1D dp array, update left-to-right',
        'Variant: count paths → use addition instead of min',
        'With obstacles: dp[i][j] = 0 if grid[i][j] is blocked',
      ]}
      relatedAlgos={[
        { title: 'Unique Paths', route: '/dp/unique-paths' },
        { title: 'Egg Dropping', route: '/dp/egg-dropping' },
        { title: 'Matrix Chain', route: '/dp/matrix-chain' },
      ]}
      practiceProblems={[
        { name: 'Minimum Path Sum', difficulty: 'Medium', url: 'https://leetcode.com/problems/minimum-path-sum/' },
        { name: 'Unique Paths', difficulty: 'Medium', url: 'https://leetcode.com/problems/unique-paths/' },
        { name: 'Triangle', difficulty: 'Medium', url: 'https://leetcode.com/problems/triangle/' },
      ]}
    >
      <div className="flex gap-6 justify-center flex-wrap">
        {/* Original grid */}
        <div>
          <p className="text-xs text-gray-400 mb-2 text-center font-medium">Original Grid</p>
          <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {grid.map((row, i) => row.map((v, j) => (
              <div key={`${i}-${j}`} className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-bold ${
                pathSet.has(`${i},${j}`) ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-400 text-emerald-700 dark:text-emerald-200' :
                'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
              }`}>{v}</div>
            )))}
          </div>
        </div>

        {/* DP grid */}
        <div>
          <p className="text-xs text-gray-400 mb-2 text-center font-medium">DP Values (min cost)</p>
          <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {dp.map((row, i) => row.map((v, j) => {
              const isActive = step.ci === i && step.cj === j;
              const isPath = pathSet.has(`${i},${j}`);
              return (
                <div key={`${i}-${j}`} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xs font-bold font-mono transition-all duration-200 ${
                  isPath && step.done ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-400 text-emerald-700 dark:text-emerald-200 scale-110' :
                  isActive ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-400 text-amber-700 dark:text-amber-200 scale-110' :
                  v > 0 ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' :
                  'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400'
                }`}>{v || ''}</div>
              );
            }))}
          </div>
        </div>
      </div>

      {step.done && (
        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            Min path sum = <span className="text-lg">{dp[rows - 1][cols - 1]}</span>
            &nbsp; (green cells show optimal path)
          </p>
        </div>
      )}
    </AlgorithmPageShell>
  );
}
