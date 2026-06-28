import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateSteps(maze) {
  const steps = [];
  const n = maze.length;
  const visited = Array.from({ length: n }, () => Array(n).fill(0));
  const path = [];
  let solutionFound = false;

  function solve(r, c) {
    if (r < 0 || r >= n || c < 0 || c >= n || maze[r][c] === 0 || visited[r][c]) return false;
    visited[r][c] = 2; // in path
    path.push([r, c]);

    steps.push({
      maze, visited: visited.map(row => [...row]), path: [...path],
      current: [r, c],
      message: `Visiting (${r},${c}) — ${r === n-1 && c === n-1 ? '✅ Reached destination!' : 'Exploring...'}`,
      done: r === n-1 && c === n-1,
    });

    if (r === n - 1 && c === n - 1) { solutionFound = true; return true; }

    const dirs = [[1,0],[0,1],[-1,0],[0,-1]];
    for (const [dr, dc] of dirs) {
      if (solve(r + dr, c + dc)) return true;
    }

    path.pop();
    visited[r][c] = 3; // backtracked
    steps.push({
      maze, visited: visited.map(row => [...row]), path: [...path],
      current: [r, c],
      message: `Backtracking from (${r},${c}) — no valid path found from here`,
    });
    return false;
  }

  steps.push({ maze, visited: visited.map(row => [...row]), path: [], current: null, message: 'Starting Rat in a Maze. Rat starts at (0,0), must reach bottom-right.' });
  solve(0, 0);

  if (!solutionFound) {
    steps.push({ maze, visited: visited.map(row => [...row]), path: [], current: null, message: '❌ No path exists from (0,0) to destination.', done: true });
  }

  return steps;
}

const MAZES = [
  [[1,0,0,0],[1,1,0,1],[0,1,0,0],[0,1,1,1]],
  [[1,1,0,0,1],[1,0,1,0,1],[1,1,1,0,1],[0,1,0,1,0],[0,1,1,1,1]],
  [[1,0,0,0,0],[1,1,0,0,0],[0,1,0,0,0],[0,1,1,0,0],[0,0,1,1,1]],
];

const theory = (
  <div>
    <TheorySection title="Problem Statement">
      <p>A rat starts at position (0,0) of an n×n maze and must reach the bottom-right (n-1, n-1). Cells with value 1 are open paths; cells with 0 are walls. The rat can move in 4 directions: down, right, up, left.</p>
    </TheorySection>
    <TheorySection title="Backtracking Approach">
      <ul className="list-disc pl-4 space-y-1">
        <li>Try to move to a neighbor cell</li>
        <li>Mark the cell as visited (in current path)</li>
        <li>Recurse from that cell</li>
        <li>If recursion fails, <strong>backtrack</strong> — unmark the cell and try other directions</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Best', 'O(n²)', 'O(n²)'],
      ['Worst', 'O(2^(n²))', 'O(n²)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `bool solveMaze(int maze[][N], int sol[][N], int r, int c) {
    if (r == N-1 && c == N-1) { sol[r][c] = 1; return true; }
    if (r < 0 || r >= N || c < 0 || c >= N) return false;
    if (maze[r][c] == 0 || sol[r][c] == 1) return false;
    sol[r][c] = 1;
    if (solveMaze(maze, sol, r+1, c)) return true;
    if (solveMaze(maze, sol, r, c+1)) return true;
    if (solveMaze(maze, sol, r-1, c)) return true;
    if (solveMaze(maze, sol, r, c-1)) return true;
    sol[r][c] = 0; // backtrack
    return false;
}`,
    'Python': `def solve_maze(maze, r, c, path):
    n = len(maze)
    if r < 0 or r >= n or c < 0 or c >= n:
        return False
    if maze[r][c] == 0 or (r, c) in path:
        return False
    path.add((r, c))
    if r == n-1 and c == n-1:
        return True
    for dr, dc in [(1,0),(0,1),(-1,0),(0,-1)]:
        if solve_maze(maze, r+dr, c+dc, path):
            return True
    path.remove((r, c))  # backtrack
    return False`,
    'JavaScript': `function solveMaze(maze, r, c, visited) {
    const n = maze.length;
    if (r < 0 || r >= n || c < 0 || c >= n) return false;
    if (maze[r][c] === 0 || visited[r][c]) return false;
    visited[r][c] = true;
    if (r === n-1 && c === n-1) return true;
    for (const [dr, dc] of [[1,0],[0,1],[-1,0],[0,-1]]) {
        if (solveMaze(maze, r+dr, c+dc, visited)) return true;
    }
    visited[r][c] = false; // backtrack
    return false;
}`,
  }} />
);

export default function RatMaze() {
  const [mazeIdx, setMazeIdx] = useState(0);
  const [steps, setSteps] = useState(() => generateSteps(MAZES[0]));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(300);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];
  const n = MAZES[mazeIdx].length;

  const handleRandomize = useCallback(() => {
    const idx = (mazeIdx + 1) % MAZES.length;
    setMazeIdx(idx);
    setSteps(generateSteps(MAZES[idx]));
    setCurrentStep(0);
    setIsRunning(false);
  }, [mazeIdx]);

  useEffect(() => {
    if (!isRunning) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) { setIsRunning(false); return prev; }
        return prev + 1;
      });
    }, speed);
    return () => clearInterval(timerRef.current);
  }, [isRunning, speed, steps.length]);

  const pathSet = new Set((step.path || []).map(([r, c]) => `${r},${c}`));

  return (
    <AlgorithmPageShell
      title="Rat in a Maze"
      description="Backtracking pathfinding — explore, mark visited, backtrack when stuck"
      category="Backtracking"
      difficulty="Medium"
      steps={steps}
      currentStep={currentStep}
      isRunning={isRunning}
      onPlay={() => setIsRunning(true)}
      onPause={() => setIsRunning(false)}
      onReset={() => { setIsRunning(false); setCurrentStep(0); }}
      onStepForward={() => setCurrentStep(p => Math.min(p + 1, steps.length - 1))}
      onStepBack={() => setCurrentStep(p => Math.max(p - 1, 0))}
      speed={speed}
      onSpeedChange={setSpeed}
      onRandomize={handleRandomize}
      showInput={false}
      stats={{ size: `${n}×${n}`, pathLen: step.path?.length || 0 }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
    >
      <div className="flex flex-col items-center gap-1">
        {MAZES[mazeIdx].map((row, r) => (
          <div key={r} className="flex gap-1">
            {row.map((cell, c) => {
              const key = `${r},${c}`;
              const isCurrent = step.current?.[0] === r && step.current?.[1] === c;
              const inPath = pathSet.has(key);
              const isBacktracked = step.visited?.[r]?.[c] === 3;
              const isStart = r === 0 && c === 0;
              const isEnd = r === n - 1 && c === n - 1;
              return (
                <div key={c} className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl text-lg font-bold border-2 transition-all duration-200 ${
                  cell === 0 ? 'bg-gray-800 dark:bg-gray-950 border-gray-700 dark:border-gray-800 text-gray-600' :
                  isCurrent ? 'bg-amber-400 dark:bg-amber-500 border-amber-300 text-white scale-110' :
                  isEnd && inPath ? 'bg-emerald-400 dark:bg-emerald-500 border-emerald-300 text-white' :
                  inPath ? 'bg-blue-400 dark:bg-blue-500 border-blue-300 text-white' :
                  isBacktracked ? 'bg-red-100 dark:bg-red-950/70 border-red-300 dark:border-red-800 text-red-400' :
                  isStart ? 'bg-violet-100 dark:bg-violet-950 border-violet-300 text-violet-700' :
                  isEnd ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 text-emerald-600' :
                  'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                }`}>
                  {cell === 0 ? '■' : isStart ? '🐀' : isEnd ? '🏁' : isCurrent ? '🐀' : inPath ? '•' : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-3 justify-center flex-wrap text-xs">
        {[['bg-blue-400', 'Current path'], ['bg-amber-400', 'Rat'], ['bg-red-200', 'Backtracked'], ['bg-gray-800', 'Wall']].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${c} inline-block`} />{l}
          </span>
        ))}
      </div>
    </AlgorithmPageShell>
  );
}
