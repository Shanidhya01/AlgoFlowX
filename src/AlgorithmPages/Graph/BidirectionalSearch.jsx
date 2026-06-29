import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const ROWS = 12, COLS = 12;
const SOURCE = [0, 0];
const TARGET = [ROWS - 1, COLS - 1];

function generateEmptyGrid() {
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  // Add some walls
  const walls = [
    [1,2],[1,3],[1,4],[2,4],[3,4],[3,5],[3,6],[4,6],[5,6],[5,7],[6,7],[7,7],[7,8],[7,9],[8,9],[9,9],[10,9],[10,10],
  ];
  walls.forEach(([r, c]) => {
    if (!(r === 0 && c === 0) && !(r === ROWS - 1 && c === COLS - 1)) grid[r][c] = 1;
  });
  return grid;
}

const key = (r, c) => `${r},${c}`;
const parse = k => k.split(',').map(Number);

function generateSteps(grid) {
  const steps = [];
  const [sr, sc] = SOURCE;
  const [er, ec] = TARGET;

  const fwd = new Map([[key(sr, sc), null]]);
  const bwd = new Map([[key(er, ec), null]]);
  const fwdFrontier = [key(sr, sc)];
  const bwdFrontier = [key(er, ec)];

  steps.push({
    message: `Bidirectional BFS: forward from ${SOURCE} (blue), backward from ${TARGET} (red).`,
    fwd: new Map(fwd), bwd: new Map(bwd),
    fwdFrontier: [...fwdFrontier], bwdFrontier: [...bwdFrontier],
    path: [], meet: null, done: false,
  });

  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];

  function reconstructPath(meet) {
    const path = [];
    // Forward path: from meet back to source
    let k = meet;
    while (k !== null) { path.unshift(k); k = fwd.get(k); }
    // Backward path: from meet to target
    k = bwd.get(meet);
    while (k !== null) { path.push(k); k = bwd.get(k); }
    return path;
  }

  let found = false;
  while (fwdFrontier.length > 0 || bwdFrontier.length > 0) {
    // Expand smaller frontier
    const expandFwd = fwdFrontier.length <= bwdFrontier.length;
    const frontier = expandFwd ? fwdFrontier : bwdFrontier;
    const visited = expandFwd ? fwd : bwd;
    const otherVisited = expandFwd ? bwd : fwd;
    const nextFrontier = [];

    for (const k of [...frontier]) {
      const [r, c] = parse(k);
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        if (grid[nr][nc] === 1) continue;
        const nk = key(nr, nc);
        if (!visited.has(nk)) {
          visited.set(nk, k);
          nextFrontier.push(nk);
          if (otherVisited.has(nk)) {
            // Intersection found!
            const path = reconstructPath(nk);
            steps.push({
              message: `Frontiers meet at (${nr},${nc})! Reconstructing path of length ${path.length - 1}.`,
              fwd: new Map(fwd), bwd: new Map(bwd),
              fwdFrontier: [], bwdFrontier: [],
              path, meet: nk, done: true,
            });
            found = true;
            break;
          }
        }
      }
      if (found) break;
    }
    if (found) break;

    frontier.length = 0;
    frontier.push(...nextFrontier);

    if (expandFwd) {
      steps.push({
        message: `Expanded forward frontier: ${nextFrontier.length} new cells. Forward visited: ${fwd.size}, Backward visited: ${bwd.size}.`,
        fwd: new Map(fwd), bwd: new Map(bwd),
        fwdFrontier: [...fwdFrontier], bwdFrontier: [...bwdFrontier],
        path: [], meet: null, done: false,
      });
    } else {
      steps.push({
        message: `Expanded backward frontier: ${nextFrontier.length} new cells. Forward visited: ${fwd.size}, Backward visited: ${bwd.size}.`,
        fwd: new Map(fwd), bwd: new Map(bwd),
        fwdFrontier: [...fwdFrontier], bwdFrontier: [...bwdFrontier],
        path: [], meet: null, done: false,
      });
    }
  }

  if (!found) {
    steps.push({
      message: 'No path found between source and target.',
      fwd: new Map(fwd), bwd: new Map(bwd),
      fwdFrontier: [], bwdFrontier: [], path: [], meet: null, done: true,
    });
  }

  return steps;
}

const theory = (
  <div>
    <TheorySection title="Bidirectional BFS">
      <p>Bidirectional BFS runs two simultaneous BFS searches — one forward from the source and one backward from the target — until the frontiers meet.</p>
      <p className="mt-2"><strong>Key advantage:</strong> Reduces time from O(b^d) to O(b^(d/2)), where b is the branching factor and d is the distance. This is exponentially faster!</p>
      <ul className="list-disc pl-4 space-y-1 mt-2">
        <li>At each step, expand the <em>smaller</em> frontier (better balance)</li>
        <li>When any cell is found in <em>both</em> visited sets, the path is found</li>
        <li>Reconstruct path: forward path to meeting point + backward path to target</li>
      </ul>
    </TheorySection>
    <TheorySection title="When to Use">
      <ul className="list-disc pl-4 space-y-1">
        <li>Both source and target are known in advance</li>
        <li>Large state spaces (AI, game trees, word ladders)</li>
        <li>Unweighted graphs where BFS finds shortest path</li>
        <li>Alternative: A* with bidirectional variant for weighted graphs</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Unidirectional BFS', 'O(b^d)', 'O(b^d)'],
      ['Bidirectional BFS', 'O(b^(d/2))', 'O(b^(d/2))'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `#include <bits/stdc++.h>
using namespace std;

int bidirectionalBFS(vector<vector<int>>& grid, pair<int,int> src, pair<int,int> dst) {
    int R = grid.size(), C = grid[0].size();
    auto key = [C](int r, int c) { return r * C + c; };
    set<int> fwd, bwd;
    queue<pair<pair<int,int>,int>> qF, qB;
    qF.push({src, 0}); fwd.insert(key(src.first, src.second));
    qB.push({dst, 0}); bwd.insert(key(dst.first, dst.second));
    int dirs[4][2] = {{-1,0},{1,0},{0,-1},{0,1}};
    while (!qF.empty() && !qB.empty()) {
        auto& q = qF.size() <= qB.size() ? qF : qB;
        auto& vis = qF.size() <= qB.size() ? fwd : bwd;
        auto& other = qF.size() <= qB.size() ? bwd : fwd;
        auto [pos, dist] = q.front(); q.pop();
        for (auto& d : dirs) {
            int nr = pos.first+d[0], nc = pos.second+d[1];
            if (nr<0||nr>=R||nc<0||nc>=C||grid[nr][nc]) continue;
            int k = key(nr,nc);
            if (other.count(k)) return dist + 1;
            if (!vis.count(k)) { vis.insert(k); q.push({{nr,nc},dist+1}); }
        }
    }
    return -1; // no path
}`,
    'Python': `from collections import deque

def bidirectional_bfs(grid, src, dst):
    rows, cols = len(grid), len(grid[0])
    fwd = {src: None}
    bwd = {dst: None}
    fwd_q = deque([src])
    bwd_q = deque([dst])
    dirs = [(-1,0),(1,0),(0,-1),(0,1)]

    def expand(q, visited, other):
        for _ in range(len(q)):
            r, c = q.popleft()
            for dr, dc in dirs:
                nr, nc = r+dr, c+dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0:
                    nk = (nr, nc)
                    if nk not in visited:
                        visited[nk] = (r,c)
                        q.append(nk)
                    if nk in other:
                        return nk
        return None

    while fwd_q or bwd_q:
        if len(fwd_q) <= len(bwd_q):
            meet = expand(fwd_q, fwd, bwd)
        else:
            meet = expand(bwd_q, bwd, fwd)
        if meet: return reconstruct(fwd, bwd, meet)
    return None`,
    'JavaScript': `function bidirectionalBFS(grid, src, dst) {
  const rows = grid.length, cols = grid[0].length;
  const key = (r, c) => \`\${r},\${c}\`;
  const fwd = new Map([[key(...src), null]]);
  const bwd = new Map([[key(...dst), null]]);
  let fwdQ = [src], bwdQ = [dst];
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];

  while (fwdQ.length || bwdQ.length) {
    const [q, vis, other] = fwdQ.length <= bwdQ.length
      ? [fwdQ, fwd, bwd] : [bwdQ, bwd, fwd];
    const nextQ = [];
    for (const [r, c] of q) {
      for (const [dr, dc] of dirs) {
        const nr = r+dr, nc = c+dc, nk = key(nr, nc);
        if (nr<0||nr>=rows||nc<0||nc>=cols||grid[nr][nc]) continue;
        if (!vis.has(nk)) { vis.set(nk, key(r,c)); nextQ.push([nr,nc]); }
        if (other.has(nk)) return reconstructPath(fwd, bwd, nk);
      }
    }
    q.length = 0; q.push(...nextQ);
  }
  return null;
}`,
    'Java': `import java.util.*;

public class BidirectionalBFS {
    static int solve(int[][] grid, int[] src, int[] dst) {
        int R = grid.length, C = grid[0].length;
        Set<Integer> fwd = new HashSet<>(), bwd = new HashSet<>();
        Queue<int[]> qF = new LinkedList<>(), qB = new LinkedList<>();
        fwd.add(src[0]*C+src[1]); qF.add(src);
        bwd.add(dst[0]*C+dst[1]); qB.add(dst);
        int[][] dirs = {{-1,0},{1,0},{0,-1},{0,1}};
        while (!qF.isEmpty() && !qB.isEmpty()) {
            Queue<int[]> q = qF.size()<=qB.size() ? qF : qB;
            Set<Integer> vis = qF.size()<=qB.size() ? fwd : bwd;
            Set<Integer> other = qF.size()<=qB.size() ? bwd : fwd;
            int[] cur = q.poll();
            for (int[] d : dirs) {
                int nr=cur[0]+d[0], nc=cur[1]+d[1];
                if (nr<0||nr>=R||nc<0||nc>=C||grid[nr][nc]!=0) continue;
                int k = nr*C+nc;
                if (other.contains(k)) return 1; // found
                if (vis.add(k)) q.add(new int[]{nr,nc});
            }
        }
        return -1;
    }
}`,
  }} />
);

export default function BidirectionalSearch() {
  const [grid] = useState(generateEmptyGrid);
  const [steps] = useState(() => generateSteps(generateEmptyGrid()));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(400);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];
  const pathSet = new Set(step.path || []);

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

  const handleReset = useCallback(() => { setIsRunning(false); setCurrentStep(0); }, []);

  const getCellStyle = (r, c) => {
    const k = key(r, c);
    const isSource = r === SOURCE[0] && c === SOURCE[1];
    const isTarget = r === TARGET[0] && c === TARGET[1];
    if (grid[r][c] === 1) return 'bg-gray-800 dark:bg-gray-950';
    if (isSource) return 'bg-violet-500';
    if (isTarget) return 'bg-emerald-500';
    if (pathSet.has(k)) return 'bg-purple-500';
    if (step.meet === k) return 'bg-yellow-400';
    const inFwd = step.fwd?.has(k);
    const inBwd = step.bwd?.has(k);
    if (inFwd && inBwd) return 'bg-purple-400';
    if (inFwd) return 'bg-sky-300 dark:bg-sky-700';
    if (inBwd) return 'bg-rose-300 dark:bg-rose-700';
    return 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700';
  };

  const fwdSize = step.fwd?.size || 0;
  const bwdSize = step.bwd?.size || 0;

  return (
    <AlgorithmPageShell
      title="Bidirectional BFS"
      description="Two simultaneous BFS searches from source and target, meeting in the middle for O(b^(d/2)) complexity"
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
      onRandomize={handleReset}
      showInput={false}
      stats={{
        forwardVisited: fwdSize,
        backwardVisited: bwdSize,
        totalVisited: fwdSize + bwdSize,
      }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Exponentially reduces search space: O(b^(d/2)) vs O(b^d)',
        'Particularly powerful in large, dense graphs',
        'Natural fit when both source and target are known',
        'Can be combined with A* heuristics (Bidirectional A*)',
      ]}
      disadvantages={[
        'More complex to implement correctly',
        'Path reconstruction requires careful bookkeeping',
        'Only works when the goal state is fully defined upfront',
        'Memory doubles compared to unidirectional BFS',
      ]}
      applications={[
        'Google Maps and navigation (meet-in-middle routing)',
        'Social network "degrees of separation" queries',
        'Word ladder problems',
        'Chess engine move search',
        'Protein folding state space search',
        '6-degrees of Kevin Bacon problem',
      ]}
      interviewTips={[
        'Always expand the smaller frontier — keeps the search balanced',
        'Intersection detection: check if newly added cell exists in the other visited set',
        'Path reconstruction is trickier — practice beforehand',
        'In unweighted graphs this always finds the shortest path',
        'For weighted: must handle the meeting-point optimization carefully (use BFS not Dijkstra naively)',
      ]}
      relatedAlgos={[
        { title: 'Breadth First Search', route: '/breadth-first-search' },
        { title: 'A* Pathfinding', route: '/a-star' },
        { title: 'Depth First Search', route: '/depth-first-search' },
      ]}
      practiceProblems={[
        { name: 'Word Ladder', difficulty: 'Hard', url: 'https://leetcode.com/problems/word-ladder/' },
        { name: 'Word Ladder II', difficulty: 'Hard', url: 'https://leetcode.com/problems/word-ladder-ii/' },
        { name: 'Minimum Genetic Mutation', difficulty: 'Medium', url: 'https://leetcode.com/problems/minimum-genetic-mutation/' },
      ]}
    >
      <div>
        <div className="overflow-x-auto">
          <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
            {grid.map((row, r) => row.map((_, c) => {
              const isSource = r === SOURCE[0] && c === SOURCE[1];
              const isTarget = r === TARGET[0] && c === TARGET[1];
              return (
                <div key={`${r}-${c}`}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-sm transition-all duration-100 flex items-center justify-center text-[9px] font-bold ${getCellStyle(r, c)}`}
                >
                  {isSource ? '▶' : isTarget ? '★' : ''}
                </div>
              );
            }))}
          </div>
        </div>
        <div className="mt-3 flex gap-3 justify-center flex-wrap text-xs">
          {[['bg-violet-500', 'Source'], ['bg-emerald-500', 'Target'], ['bg-sky-300', 'Forward BFS'], ['bg-rose-300', 'Backward BFS'], ['bg-purple-500', 'Path'], ['bg-yellow-400', 'Meeting point'], ['bg-gray-800', 'Wall']].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded ${c} inline-block`} />
              <span className="text-gray-500 dark:text-gray-400">{l}</span>
            </span>
          ))}
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
