import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const ROWS = 14, COLS = 20;

const manhattan = (r1, c1, r2, c2) => Math.abs(r1 - r2) + Math.abs(c1 - c2);

function generateAStarSteps(grid, start, end) {
  const steps = [];
  const gScore = Array.from({ length: ROWS }, () => Array(COLS).fill(Infinity));
  const fScore = Array.from({ length: ROWS }, () => Array(COLS).fill(Infinity));
  const cameFrom = {};
  const open = new Set();
  const closed = new Set();

  const key = (r, c) => `${r},${c}`;
  const [sr, sc] = start;
  const [er, ec] = end;

  gScore[sr][sc] = 0;
  fScore[sr][sc] = manhattan(sr, sc, er, ec);
  open.add(key(sr, sc));

  steps.push({ open: new Set(open), closed: new Set(closed), current: null, path: [], done: false, message: `A* pathfinding from (${sr},${sc}) to (${er},${ec}). h = Manhattan distance.` });

  while (open.size > 0) {
    let minF = Infinity, curr = null;
    for (const k of open) {
      const [r, c] = k.split(',').map(Number);
      if (fScore[r][c] < minF) { minF = fScore[r][c]; curr = [r, c]; }
    }
    const [cr, cc] = curr;

    if (cr === er && cc === ec) {
      const path = [];
      let k = key(cr, cc);
      while (k) { path.unshift(k); k = cameFrom[k]; }
      steps.push({ open: new Set(open), closed: new Set(closed), current: key(cr, cc), path, done: true, message: `✅ Path found! Length = ${path.length - 1} steps.` });
      return steps;
    }

    open.delete(key(cr, cc));
    closed.add(key(cr, cc));

    steps.push({ open: new Set(open), closed: new Set(closed), current: key(cr, cc), path: [], done: false, message: `Expanding (${cr},${cc}) — f=${minF.toFixed(1)}, g=${gScore[cr][cc]}, h=${manhattan(cr, cc, er, ec)}` });

    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nr = cr + dr, nc = cc + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      if (grid[nr][nc] === 1) continue;
      const nk = key(nr, nc);
      if (closed.has(nk)) continue;
      const tentG = gScore[cr][cc] + 1;
      if (tentG < gScore[nr][nc]) {
        cameFrom[nk] = key(cr, cc);
        gScore[nr][nc] = tentG;
        fScore[nr][nc] = tentG + manhattan(nr, nc, er, ec);
        open.add(nk);
      }
    }
  }

  steps.push({ open: new Set(), closed: new Set(closed), current: null, path: [], done: true, message: '❌ No path found!' });
  return steps;
}

function generateRandomGrid() {
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  // Add random walls (~25%)
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (Math.random() < 0.25 && !(r === 0 && c === 0) && !(r === ROWS-1 && c === COLS-1))
        grid[r][c] = 1;
  return grid;
}

const theory = (
  <div>
    <TheorySection title="How A* Works">
      <p>A* is an informed search that finds the shortest path using: <strong>f(n) = g(n) + h(n)</strong></p>
      <ul className="list-disc pl-4 space-y-1 mt-2">
        <li><strong>g(n)</strong> — actual cost from start to node n</li>
        <li><strong>h(n)</strong> — heuristic estimate from n to goal (Manhattan distance)</li>
        <li><strong>f(n)</strong> — total estimated cost through n</li>
      </ul>
      <p className="mt-2">Always expands the node with lowest f-score. Guaranteed optimal if heuristic is admissible (never overestimates).</p>
    </TheorySection>
    <TheorySection title="A* vs Dijkstra's">
      <ul className="list-disc pl-4 space-y-1">
        <li>Dijkstra's: h=0, explores all directions equally</li>
        <li>A*: uses heuristic to guide towards goal — much faster in practice</li>
        <li>Both guarantee optimal path with admissible heuristic</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Best (no obstacles)', 'O(E log V)', 'O(V)'],
      ['Worst', 'O(E log V)', 'O(V)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'Python': `from heapq import heappush, heappop

def astar(grid, start, end):
    rows, cols = len(grid), len(grid[0])
    h = lambda r, c: abs(r-end[0]) + abs(c-end[1])

    open_set = [(h(*start), 0, start, [])]
    visited = set()

    while open_set:
        f, g, (r, c), path = heappop(open_set)
        if (r, c) in visited: continue
        visited.add((r, c))
        path = path + [(r, c)]

        if (r, c) == end:
            return path

        for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
            nr, nc = r+dr, c+dc
            if 0 <= nr < rows and 0 <= nc < cols:
                if grid[nr][nc] == 0 and (nr,nc) not in visited:
                    ng = g + 1
                    heappush(open_set, (ng + h(nr,nc), ng, (nr,nc), path))
    return None`,
    'JavaScript': `function aStar(grid, start, end) {
    const h = (r, c) => Math.abs(r - end[0]) + Math.abs(c - end[1]);
    const key = (r, c) => \`\${r},\${c}\`;
    const open = new Map([[key(...start), {g:0, r:start[0], c:start[1]}]]);
    const closed = new Set();
    const cameFrom = {};

    while (open.size) {
        const [k, node] = [...open].reduce((a, b) =>
            (a[1].g + h(a[1].r, a[1].c)) < (b[1].g + h(b[1].r, b[1].c)) ? a : b);
        open.delete(k);
        if (node.r === end[0] && node.c === end[1]) return reconstructPath(cameFrom, k);
        closed.add(k);
        for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
            const nr = node.r + dr, nc = node.c + dc;
            const nk = key(nr, nc);
            if (nr < 0 || nr >= grid.length || nc < 0 || nc >= grid[0].length) continue;
            if (grid[nr][nc] === 1 || closed.has(nk)) continue;
            const ng = node.g + 1;
            if (!open.has(nk) || open.get(nk).g > ng) {
                cameFrom[nk] = k;
                open.set(nk, {g: ng, r: nr, c: nc});
            }
        }
    }
    return null;
}`,
  }} />
);

export default function AStar() {
  const [grid, setGrid] = useState(generateRandomGrid);
  const start = [0, 0];
  const end = [ROWS - 1, COLS - 1];

  const [steps, setSteps] = useState(() => generateAStarSteps(generateRandomGrid(), start, end));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(80);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];
  const pathSet = new Set(step.path || []);

  const handleRandomize = useCallback(() => {
    const g = generateRandomGrid();
    setGrid(g);
    setSteps(generateAStarSteps(g, start, end));
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

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

  return (
    <AlgorithmPageShell
      title="A* Pathfinding"
      description="Heuristic-guided shortest path using f(n) = g(n) + h(n) with Manhattan distance"
      category="Graph"
      difficulty="Hard"
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
      stats={{ open: step.open?.size || 0, closed: step.closed?.size || 0, pathLen: step.path?.length ? step.path.length - 1 : '—' }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
    >
      <div className="overflow-x-auto">
        <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
          {grid.map((row, r) => row.map((cell, c) => {
            const k = `${r},${c}`;
            const isStart = r === 0 && c === 0;
            const isEnd = r === ROWS - 1 && c === COLS - 1;
            const isCurrent = step.current === k;
            const inPath = pathSet.has(k);
            const inOpen = step.open?.has(k);
            const inClosed = step.closed?.has(k);
            return (
              <div key={k} className={`w-5 h-5 sm:w-6 sm:h-6 rounded-sm transition-all duration-75 flex items-center justify-center text-[8px] ${
                cell === 1 ? 'bg-gray-800 dark:bg-gray-950' :
                isStart ? 'bg-violet-500' :
                isEnd ? 'bg-emerald-500' :
                isCurrent ? 'bg-amber-400' :
                inPath ? 'bg-blue-500' :
                inOpen ? 'bg-sky-200 dark:bg-sky-800' :
                inClosed ? 'bg-gray-300 dark:bg-gray-700' :
                'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
              }`}>
                {isStart ? '▶' : isEnd ? '🎯' : ''}
              </div>
            );
          }))}
        </div>
      </div>
      <div className="mt-3 flex gap-3 justify-center flex-wrap text-xs">
        {[['bg-violet-500', 'Start'], ['bg-emerald-500', 'End'], ['bg-amber-400', 'Current'], ['bg-blue-500', 'Path'], ['bg-sky-200', 'Open'], ['bg-gray-300', 'Closed'], ['bg-gray-800', 'Wall']].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1">
            <span className={`w-3 h-3 rounded ${c} inline-block`} />
            <span className="text-gray-500 dark:text-gray-400">{l}</span>
          </span>
        ))}
      </div>
    </AlgorithmPageShell>
  );
}
