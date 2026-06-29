import React, { useState, useEffect, useRef } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// ─── Pre-computed 5×5 Warnsdorff solution ────────────────────────────────────
// Each entry is [row, col], forming a valid 25-move knight's tour on a 5×5 board

const TOUR = [
  [0,0],[1,2],[0,4],[2,3],[4,4],[3,2],[4,0],[2,1],[0,2],[1,0],
  [3,1],[4,3],[2,4],[0,3],[1,1],[3,0],[4,2],[3,4],[1,3],[0,1],
  [2,0],[4,1],[3,3],[1,4],[2,2]
];

function generateSteps() {
  const steps = [];
  const board = Array.from({ length: 5 }, () => Array(5).fill(0));

  steps.push({
    board: board.map(r => [...r]),
    move: 0,
    pos: null,
    message: "Knight's Tour on 5×5 board using Warnsdorff's heuristic. 25 moves.",
  });

  for (let m = 0; m < TOUR.length; m++) {
    const [r, c] = TOUR[m];
    board[r][c] = m + 1;
    steps.push({
      board: board.map(row => [...row]),
      move: m + 1,
      pos: [r, c],
      prev: m > 0 ? TOUR[m - 1] : null,
      message: `Move ${m + 1}: Knight to (${r},${c})${m + 1 === 25 ? ' — Tour complete!' : ''}`,
      done: m + 1 === 25,
    });
  }
  return steps;
}

// ─── Theory & Code ────────────────────────────────────────────────────────────

const theory = (
  <div>
    <TheorySection title="Knight's Tour Problem">
      <p>A Knight's Tour is a sequence of knight moves such that the knight visits every square on a chessboard exactly once. On an n×n board, finding such a tour is an instance of the Hamiltonian path problem.</p>
      <p><strong>Warnsdorff's Heuristic:</strong> At each step, move the knight to the square from which it has the fewest onward moves. This greedy heuristic finds tours efficiently without full backtracking on large boards.</p>
    </TheorySection>
    <TheorySection title="Key Concepts">
      <ul className="list-disc pl-4 space-y-1">
        <li>Knight moves in an L-shape: 2 squares in one direction + 1 square perpendicular</li>
        <li>Closed tour: returns to starting square; Open tour: ends elsewhere</li>
        <li>Warnsdorff's rule is a heuristic — not always optimal but practically excellent</li>
        <li>5×5 board has many valid open tours but no closed tour</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Backtracking (naive)', 'O(8^(n²))', 'O(n²)'],
      ["Warnsdorff's heuristic", 'O(n²)', 'O(n²)'],
      ['Space (board)', '—', 'O(n²)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `#include <vector>
#include <algorithm>
using namespace std;

const int dx[] = {2,1,-1,-2,-2,-1,1,2};
const int dy[] = {1,2,2,1,-1,-2,-2,-1};

int degree(vector<vector<int>>& b, int x, int y, int n) {
    int cnt = 0;
    for (int i = 0; i < 8; i++) {
        int nx = x+dx[i], ny = y+dy[i];
        if (nx>=0&&nx<n&&ny>=0&&ny<n&&b[nx][ny]==0) cnt++;
    }
    return cnt;
}

bool knightsTour(int n) {
    vector<vector<int>> board(n, vector<int>(n, 0));
    int x = 0, y = 0;
    board[x][y] = 1;
    for (int move = 2; move <= n*n; move++) {
        int best = 9, bx = -1, by = -1;
        for (int i = 0; i < 8; i++) {
            int nx = x+dx[i], ny = y+dy[i];
            if (nx>=0&&nx<n&&ny>=0&&ny<n&&board[nx][ny]==0) {
                int d = degree(board, nx, ny, n);
                if (d < best) { best=d; bx=nx; by=ny; }
            }
        }
        if (bx == -1) return false;
        board[bx][by] = move; x=bx; y=by;
    }
    return true;
}`,
    'Python': `def knights_tour(n):
    dx = [2,1,-1,-2,-2,-1,1,2]
    dy = [1,2,2,1,-1,-2,-2,-1]

    def degree(board, x, y):
        return sum(1 for i in range(8)
                   if 0<=x+dx[i]<n and 0<=y+dy[i]<n
                   and board[x+dx[i]][y+dy[i]] == 0)

    board = [[0]*n for _ in range(n)]
    x, y = 0, 0
    board[x][y] = 1

    for move in range(2, n*n+1):
        best, bx, by = 9, -1, -1
        for i in range(8):
            nx, ny = x+dx[i], y+dy[i]
            if 0<=nx<n and 0<=ny<n and board[nx][ny] == 0:
                d = degree(board, nx, ny)
                if d < best:
                    best, bx, by = d, nx, ny
        if bx == -1:
            return False
        board[bx][by] = move
        x, y = bx, by
    return True`,
    'JavaScript': `function knightsTour(n) {
  const dx = [2,1,-1,-2,-2,-1,1,2];
  const dy = [1,2,2,1,-1,-2,-2,-1];
  const board = Array.from({length:n}, () => Array(n).fill(0));

  const degree = (x, y) =>
    dx.reduce((cnt, _, i) => {
      const nx = x+dx[i], ny = y+dy[i];
      return (nx>=0&&nx<n&&ny>=0&&ny<n&&!board[nx][ny]) ? cnt+1 : cnt;
    }, 0);

  let x = 0, y = 0;
  board[x][y] = 1;

  for (let move = 2; move <= n*n; move++) {
    let best = 9, bx = -1, by = -1;
    for (let i = 0; i < 8; i++) {
      const nx = x+dx[i], ny = y+dy[i];
      if (nx>=0&&nx<n&&ny>=0&&ny<n&&!board[nx][ny]) {
        const d = degree(nx, ny);
        if (d < best) { best=d; bx=nx; by=ny; }
      }
    }
    if (bx === -1) return false;
    board[bx][by] = move; x=bx; y=by;
  }
  return true;
}`,
    'Java': `public class KnightsTour {
    static int[] dx = {2,1,-1,-2,-2,-1,1,2};
    static int[] dy = {1,2,2,1,-1,-2,-2,-1};

    static int degree(int[][] b, int x, int y, int n) {
        int cnt = 0;
        for (int i = 0; i < 8; i++) {
            int nx=x+dx[i], ny=y+dy[i];
            if (nx>=0&&nx<n&&ny>=0&&ny<n&&b[nx][ny]==0) cnt++;
        }
        return cnt;
    }

    static boolean solve(int n) {
        int[][] board = new int[n][n];
        int x = 0, y = 0; board[x][y] = 1;
        for (int move = 2; move <= n*n; move++) {
            int best=9, bx=-1, by=-1;
            for (int i = 0; i < 8; i++) {
                int nx=x+dx[i], ny=y+dy[i];
                if (nx>=0&&nx<n&&ny>=0&&ny<n&&board[nx][ny]==0) {
                    int d = degree(board,nx,ny,n);
                    if (d < best) { best=d; bx=nx; by=ny; }
                }
            }
            if (bx==-1) return false;
            board[bx][by]=move; x=bx; y=by;
        }
        return true;
    }
}`,
  }} />
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function KnightsTour() {
  const [steps] = useState(() => generateSteps());
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

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

  const board = step.board || Array.from({ length: 5 }, () => Array(5).fill(0));
  const curPos = step.pos;
  const prevPos = step.prev;

  // Build SVG lines connecting consecutive visited positions
  const CELL = 56;
  const PAD = 28;

  return (
    <AlgorithmPageShell
      title="Knight's Tour"
      description="Visit every square on a 5×5 board exactly once using Warnsdorff's heuristic — O(n²)"
      category="Backtracking"
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
      showInput={false}
      stats={{
        move: step.move,
        position: curPos ? `[${curPos[0]},${curPos[1]}]` : '—',
        remaining: 25 - step.move,
      }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        "Warnsdorff's heuristic is near-linear in practice",
        'Classic example of constraint-guided backtracking',
        'Works for any board size ≥ 5×5',
        'Open tours exist for all n≥5 boards',
      ]}
      disadvantages={[
        'Naive backtracking is exponential O(8^(n²))',
        'No closed tour exists on a 5×5 board',
        "Warnsdorff's heuristic may fail on some starting positions",
        'Complexity analysis of heuristic is non-trivial',
      ]}
      applications={[
        'Hamiltonian path algorithms',
        'Graph traversal techniques',
        'CPU cache line traversal patterns',
        'Puzzle and game AI',
      ]}
      interviewTips={[
        'Always mention Warnsdorff\'s rule when asked about optimization',
        'This is a Hamiltonian path problem — NP-complete in general',
        'For large boards, the heuristic is effectively O(n²)',
        'Tie-breaking in Warnsdorff\'s: pick square closest to board center',
      ]}
      relatedAlgos={[
        { title: 'N-Queens', route: '/backtracking/n-queens' },
        { title: 'Graph Coloring', route: '/backtracking/graph-coloring' },
        { title: 'Rat in a Maze', route: '/backtracking/rat-maze' },
      ]}
      practiceProblems={[
        { name: 'N-Queens', difficulty: 'Hard', url: 'https://leetcode.com/problems/n-queens/' },
        { name: 'Word Search', difficulty: 'Medium', url: 'https://leetcode.com/problems/word-search/' },
        { name: 'Sudoku Solver', difficulty: 'Hard', url: 'https://leetcode.com/problems/sudoku-solver/' },
      ]}
    >
      {/* Chess Board */}
      <div className="flex flex-col items-center">
        <svg
          viewBox={`0 0 ${5 * CELL + PAD * 2} ${5 * CELL + PAD * 2}`}
          className="w-full"
          style={{ maxWidth: 340 }}
        >
          {/* Board squares */}
          {Array.from({ length: 5 }, (_, r) =>
            Array.from({ length: 5 }, (_, c) => {
              const isLight = (r + c) % 2 === 0;
              const isCurrent = curPos && curPos[0] === r && curPos[1] === c;
              const val = board[r][c];
              const isVisited = val > 0;

              return (
                <g key={`${r}-${c}`}>
                  <rect
                    x={PAD + c * CELL} y={PAD + r * CELL}
                    width={CELL} height={CELL}
                    fill={isCurrent ? '#22c55e' :
                          isVisited ? (isLight ? '#bfdbfe' : '#93c5fd') :
                          isLight ? '#f3f4f6' : '#6b7280'}
                    rx="2"
                    className="transition-all duration-300"
                  />
                  {isVisited && !isCurrent && (
                    <text
                      x={PAD + c * CELL + CELL / 2}
                      y={PAD + r * CELL + CELL / 2 + 5}
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="bold"
                      fill="#1d4ed8"
                    >
                      {val}
                    </text>
                  )}
                  {isCurrent && (
                    <text
                      x={PAD + c * CELL + CELL / 2}
                      y={PAD + r * CELL + CELL / 2 + 8}
                      textAnchor="middle"
                      fontSize="22"
                    >
                      ♞
                    </text>
                  )}
                </g>
              );
            })
          )}

          {/* Lines connecting consecutive moves */}
          {TOUR.slice(0, step.move - 1).map((pos, i) => {
            const next = TOUR[i + 1];
            return (
              <line
                key={i}
                x1={PAD + pos[1] * CELL + CELL / 2}
                y1={PAD + pos[0] * CELL + CELL / 2}
                x2={PAD + next[1] * CELL + CELL / 2}
                y2={PAD + next[0] * CELL + CELL / 2}
                stroke="#6366f1"
                strokeWidth="1.5"
                opacity="0.5"
                strokeDasharray="4 2"
              />
            );
          })}
        </svg>

        <div className="flex gap-4 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-500 inline-block" /> Current
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-300 inline-block" /> Visited
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-400 inline-block" /> Unvisited
          </span>
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
