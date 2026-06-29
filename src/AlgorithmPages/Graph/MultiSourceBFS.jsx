import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const ROWS = 8, COLS = 8;

// Fixed initial grid: 0 = source, -1 = not-yet-computed, walls kept minimal
function generateInitialGrid() {
  return [
    [ 0, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1,  0, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1,  0, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1,  0, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1],
  ];
}

function generateRandomGrid() {
  const g = Array.from({ length: ROWS }, () => Array(COLS).fill(-1));
  const sources = [];
  const count = 3 + Math.floor(Math.random() * 3);
  while (sources.length < count) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (g[r][c] !== 0) { g[r][c] = 0; sources.push([r, c]); }
  }
  return g;
}

function generateSteps(initGrid) {
  const steps = [];
  const dist = initGrid.map(row => [...row]);
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  const queue = [];

  // Enqueue all 0-cells
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (dist[r][c] === 0) queue.push([r, c]);
    }
  }

  steps.push({
    message: `Multi-Source BFS: Initialize queue with all ${queue.length} source cells (value=0). Propagate distance outward.`,
    dist: dist.map(row => [...row]), queued: queue.length, processed: 0, maxDist: 0, done: false,
  });

  let processed = 0;
  let maxDist = 0;

  while (queue.length > 0) {
    const waveFront = [...queue];
    queue.length = 0;
    let waveLabel = -1;

    for (const [r, c] of waveFront) {
      processed++;
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        if (dist[nr][nc] !== -1) continue;
        dist[nr][nc] = dist[r][c] + 1;
        maxDist = Math.max(maxDist, dist[nr][nc]);
        waveLabel = dist[nr][nc];
        queue.push([nr, nc]);
      }
    }

    if (waveLabel > 0) {
      steps.push({
        message: `Wave: distance ${waveLabel} front — ${queue.length} cells. Max distance so far: ${maxDist}.`,
        dist: dist.map(row => [...row]), queued: queue.length, processed, maxDist, done: false,
        waveDist: waveLabel,
      });
    }
  }

  steps.push({
    message: `Multi-Source BFS complete! Maximum distance to nearest 0 = ${maxDist}. All ${ROWS * COLS} cells have their minimum distances.`,
    dist: dist.map(row => [...row]), queued: 0, processed, maxDist, done: true,
  });

  return steps;
}

// Color gradient based on distance
function getDistColor(d, maxDist) {
  if (d === 0) return '#1d4ed8'; // source: deep blue
  if (d === -1) return '#ffffff';
  // Gradient from sky to orange-red
  const ratio = d / Math.max(maxDist, 1);
  const r = Math.round(56 + ratio * 199);
  const g = Math.round(189 - ratio * 150);
  const b = Math.round(248 - ratio * 240);
  return `rgb(${r},${g},${b})`;
}

const theory = (
  <div>
    <TheorySection title="Multi-Source BFS">
      <p>Multi-Source BFS runs a standard BFS but starts simultaneously from <strong>multiple source nodes</strong> instead of just one.</p>
      <p className="mt-2">Classic problem: <em>"01 Matrix"</em> — find the distance of each cell to the nearest 0-cell.</p>
      <ol className="list-decimal pl-4 space-y-1 mt-2">
        <li>Initialize a queue with <em>all</em> 0-cells at distance 0</li>
        <li>Run BFS: each cell's distance = its neighbor's distance + 1</li>
        <li>The BFS wave naturally computes the minimum distance to any source</li>
      </ol>
    </TheorySection>
    <TheorySection title="Why Not Single-Source BFS?">
      <ul className="list-disc pl-4 space-y-1">
        <li>Naively: for each cell, run BFS to find nearest 0 → O(V²) total</li>
        <li>Multi-source BFS: reverse the thinking — BFS from all 0s at once → O(V)</li>
        <li>Same trick works for: "nearest building", "nearest water", "fire spreading"</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Multi-Source BFS', 'O(V + E)', 'O(V)'],
      ['Naive approach', 'O(V² + VE)', 'O(V)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `#include <bits/stdc++.h>
using namespace std;

vector<vector<int>> updateMatrix(vector<vector<int>>& mat) {
    int m = mat.size(), n = mat[0].size();
    vector<vector<int>> dist(m, vector<int>(n, INT_MAX));
    queue<pair<int,int>> q;

    // Initialize with all 0-cells
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            if (mat[r][c] == 0) { dist[r][c] = 0; q.push({r,c}); }

    int dirs[4][2] = {{-1,0},{1,0},{0,-1},{0,1}};
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (auto& d : dirs) {
            int nr = r+d[0], nc = c+d[1];
            if (nr<0||nr>=m||nc<0||nc>=n) continue;
            if (dist[nr][nc] > dist[r][c] + 1) {
                dist[nr][nc] = dist[r][c] + 1;
                q.push({nr,nc});
            }
        }
    }
    return dist;
}`,
    'Python': `from collections import deque

def update_matrix(mat):
    rows, cols = len(mat), len(mat[0])
    dist = [[float('inf')] * cols for _ in range(rows)]
    q = deque()

    for r in range(rows):
        for c in range(cols):
            if mat[r][c] == 0:
                dist[r][c] = 0
                q.append((r, c))

    for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
        pass  # handled in BFS below

    while q:
        r, c = q.popleft()
        for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
            nr, nc = r+dr, c+dc
            if 0 <= nr < rows and 0 <= nc < cols:
                if dist[nr][nc] > dist[r][c] + 1:
                    dist[nr][nc] = dist[r][c] + 1
                    q.append((nr, nc))
    return dist`,
    'JavaScript': `function updateMatrix(mat) {
  const rows = mat.length, cols = mat[0].length;
  const dist = Array.from({length: rows}, () => new Array(cols).fill(Infinity));
  const queue = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (mat[r][c] === 0) { dist[r][c] = 0; queue.push([r, c]); }

  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  let head = 0;
  while (head < queue.length) {
    const [r, c] = queue[head++];
    for (const [dr, dc] of dirs) {
      const nr = r+dr, nc = c+dc;
      if (nr<0||nr>=rows||nc<0||nc>=cols) continue;
      if (dist[nr][nc] > dist[r][c] + 1) {
        dist[nr][nc] = dist[r][c] + 1;
        queue.push([nr, nc]);
      }
    }
  }
  return dist;
}`,
    'Java': `import java.util.*;

public class MultiSourceBFS {
    public int[][] updateMatrix(int[][] mat) {
        int m = mat.length, n = mat[0].length;
        int[][] dist = new int[m][n];
        boolean[][] visited = new boolean[m][n];
        Queue<int[]> q = new LinkedList<>();

        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++)
                if (mat[r][c] == 0) {
                    dist[r][c] = 0; visited[r][c] = true; q.add(new int[]{r, c});
                } else dist[r][c] = Integer.MAX_VALUE;

        int[][] dirs = {{-1,0},{1,0},{0,-1},{0,1}};
        while (!q.isEmpty()) {
            int[] cur = q.poll();
            for (int[] d : dirs) {
                int nr = cur[0]+d[0], nc = cur[1]+d[1];
                if (nr>=0&&nr<m&&nc>=0&&nc<n&&!visited[nr][nc]) {
                    dist[nr][nc] = dist[cur[0]][cur[1]] + 1;
                    visited[nr][nc] = true; q.add(new int[]{nr, nc});
                }
            }
        }
        return dist;
    }
}`,
  }} />
);

export default function MultiSourceBFS() {
  const [initGrid, setInitGrid] = useState(generateInitialGrid);
  const [steps, setSteps] = useState(() => generateSteps(generateInitialGrid()));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];
  const dist = step.dist;
  const maxDist = step.maxDist || 1;

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

  const handleRandomize = useCallback(() => {
    const g = generateRandomGrid();
    setInitGrid(g);
    setSteps(generateSteps(g));
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => { setIsRunning(false); setCurrentStep(0); }, []);

  return (
    <AlgorithmPageShell
      title="Multi-Source BFS"
      description="BFS starting simultaneously from all source cells to compute minimum distance to nearest source"
      category="Graph"
      difficulty="Medium"
      steps={steps}
      currentStep={currentStep}
      isRunning={isRunning}
      onPlay={() => setIsRunning(true)}
      onPause={() => setIsRunning(false)}
      onReset={handleReset}
      onStepForward={() => setCurrentStep(p => Math.min(p + 1, steps.length - 1))}
      onStepBack={() => setCurrentStep(p => Math.max(p - 1, 0))}
      speed={speed}
      onSpeedChange={setSpeed}
      onRandomize={handleRandomize}
      showInput={false}
      stats={{
        queued: step.queued,
        processed: step.processed,
        maxDist: step.maxDist,
      }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Linear O(V+E) vs O(V²) naive approach',
        'Elegant reduction: reverse the problem direction',
        'Works for any "nearest source" variant',
        'Direct extension of standard BFS',
      ]}
      disadvantages={[
        'Requires all source cells to be identified upfront',
        'Grid-specific; graph generalization needs adjacency list',
        'Not applicable when sources are discovered dynamically',
      ]}
      applications={[
        'LeetCode 542: 01 Matrix (nearest 0)',
        'Fire spreading simulation',
        'Nearest facility on a map',
        'Shortest distance to nearest enemy in games',
        'Voronoi diagrams (approximate)',
        'Flood fill with multiple sources',
      ]}
      interviewTips={[
        'Classic trick: when asked "distance to nearest X", BFS from all X simultaneously',
        'Initialize the queue with ALL sources at distance 0 before starting BFS',
        'Avoid the common mistake of doing separate BFS per source — O(V²)',
        'This technique generalizes to weighted graphs with 0-1 BFS',
        'LeetCode 542 is the canonical problem — solve it in every language',
      ]}
      relatedAlgos={[
        { title: 'Breadth First Search', route: '/breadth-first-search' },
        { title: 'Bidirectional Search', route: '/bidirectional-search' },
        { title: 'A* Pathfinding', route: '/a-star' },
      ]}
      practiceProblems={[
        { name: '01 Matrix', difficulty: 'Medium', url: 'https://leetcode.com/problems/01-matrix/' },
        { name: 'As Far from Land as Possible', difficulty: 'Medium', url: 'https://leetcode.com/problems/as-far-from-land-as-possible/' },
        { name: 'Rotting Oranges', difficulty: 'Medium', url: 'https://leetcode.com/problems/rotting-oranges/' },
        { name: 'Map of Highest Peak', difficulty: 'Medium', url: 'https://leetcode.com/problems/map-of-highest-peak/' },
      ]}
    >
      <div>
        <div className="overflow-x-auto">
          <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
            {dist.map((row, r) => row.map((d, c) => {
              const isSource = initGrid[r][c] === 0;
              const bg = d === -1 ? '#f3f4f6' : getDistColor(d, maxDist);
              const textColor = d === 0 ? '#ffffff' : d > maxDist * 0.6 ? '#7f1d1d' : '#1e3a5f';
              return (
                <div
                  key={`${r}-${c}`}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm flex items-center justify-center text-xs font-bold transition-all duration-200"
                  style={{ background: bg, color: textColor, border: isSource ? '2px solid #1d4ed8' : '1px solid #e5e7eb' }}
                >
                  {d === -1 ? '' : d}
                </div>
              );
            }))}
          </div>
        </div>
        <div className="mt-3 flex gap-4 flex-wrap text-xs items-center justify-center">
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded inline-block border-2 border-blue-700" style={{ background: '#1d4ed8' }} />
            <span className="text-gray-500 dark:text-gray-400">Source (0)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded inline-block" style={{ background: getDistColor(2, 8) }} />
            <span className="text-gray-500 dark:text-gray-400">Near</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded inline-block" style={{ background: getDistColor(7, 8) }} />
            <span className="text-gray-500 dark:text-gray-400">Far</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded inline-block bg-gray-100 border border-gray-300" />
            <span className="text-gray-500 dark:text-gray-400">Not yet computed</span>
          </span>
          <span className="text-gray-400 dark:text-gray-500 text-xs">Numbers = distance to nearest source</span>
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
