import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, Grid3x3 } from 'lucide-react';

function NQueens() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(800);

  const [n, setN] = useState(4);
  const [board, setBoard] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState(0);
  const [attackedCells, setAttackedCells] = useState([]);
  const [placedQueens, setPlacedQueens] = useState([]);
  const [validPlacement, setValidPlacement] = useState(true);
  const [message, setMessage] = useState('');

  // Initialize board
  useEffect(() => {
    const newBoard = Array(n).fill(null).map(() => Array(n).fill(0));
    setBoard(newBoard);
    setSolutions([]);
    setCurrentSolutionIndex(0);
    setSteps([]);
    setCurrentStep(0);
    setPlacedQueens([]);
    setAttackedCells([]);
  }, [n]);

  // Check if position is safe (not under attack)
  const isSafe = useCallback((board, row, col) => {
    // Check left direction
    for (let i = col - 1; i >= 0; i--) {
      if (board[row][i] === 1) return false;
    }

    // Check upper-left diagonal
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 1) return false;
    }

    // Check lower-left diagonal
    for (let i = row + 1, j = col - 1; i < n && j >= 0; i++, j--) {
      if (board[i][j] === 1) return false;
    }

    return true;
  }, [n]);

  // Get attacked cells for visualization
  const getAttackedCells = useCallback((boardState, queenPos) => {
    const attacked = [];
    queenPos.forEach(([row, col]) => {
      // Horizontal
      for (let j = 0; j < n; j++) {
        if (j !== col) attacked.push([row, j]);
      }
      // Vertical
      for (let i = 0; i < n; i++) {
        if (i !== row) attacked.push([i, col]);
      }
      // Diagonals
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (Math.abs(i - row) === Math.abs(j - col) && (i !== row || j !== col)) {
            attacked.push([i, j]);
          }
        }
      }
    });
    return attacked;
  }, [n]);

  // Solve N-Queens with backtracking
  const solveNQueens = useCallback(() => {
    const operationSteps = [];
    const foundSolutions = [];
    const tempBoard = Array(n).fill(null).map(() => Array(n).fill(0));

    operationSteps.push({
      type: 'initialize',
      message: `Starting N-Queens solver for n=${n}. Place ${n} queens on ${n}×${n} board such that no two queens attack each other.`,
      board: tempBoard.map(row => [...row]),
      queens: [],
      attacked: [],
      valid: true,
      solutionCount: 0
    });

    let stepCount = 0;

    const backtrack = (col, queens) => {
      stepCount++;

      // Base case: all queens placed
      if (col === n) {
        const solution = queens.map(q => [...q]);
        foundSolutions.push(solution);
        operationSteps.push({
          type: 'solution_found',
          message: `✓ Solution ${foundSolutions.length} found! All ${n} queens placed successfully.`,
          board: tempBoard.map(row => [...row]),
          queens: solution,
          attacked: [],
          valid: true,
          solutionCount: foundSolutions.length
        });
        return;
      }

      // Try placing queen in each row of current column
      for (let row = 0; row < n; row++) {
        operationSteps.push({
          type: 'check_position',
          message: `Column ${col}: Checking if queen can be placed at position (${row}, ${col})...`,
          board: tempBoard.map(r => [...r]),
          queens: queens,
          attacked: getAttackedCells(tempBoard, queens),
          valid: true,
          solutionCount: foundSolutions.length,
          checkingPos: [row, col]
        });

        // Check if position is safe
        const safe = isSafe(tempBoard, row, col);

        if (safe) {
          // Place queen
          tempBoard[row][col] = 1;
          queens.push([row, col]);

          operationSteps.push({
            type: 'place_queen',
            message: `✓ Safe! Placed queen at (${row}, ${col}). Moving to column ${col + 1}...`,
            board: tempBoard.map(r => [...r]),
            queens: queens.map(q => [...q]),
            attacked: getAttackedCells(tempBoard, queens),
            valid: true,
            solutionCount: foundSolutions.length
          });

          // Recursively solve for next column
          backtrack(col + 1, queens);

          // Backtrack
          tempBoard[row][col] = 0;
          queens.pop();

          operationSteps.push({
            type: 'backtrack',
            message: `Backtracking from (${row}, ${col}). Trying next position in column ${col}...`,
            board: tempBoard.map(r => [...r]),
            queens: queens.map(q => [...q]),
            attacked: getAttackedCells(tempBoard, queens),
            valid: true,
            solutionCount: foundSolutions.length
          });
        } else {
          operationSteps.push({
            type: 'invalid_position',
            message: `✗ Not safe! Position (${row}, ${col}) is under attack. Trying next row...`,
            board: tempBoard.map(r => [...r]),
            queens: queens,
            attacked: getAttackedCells(tempBoard, queens),
            valid: false,
            solutionCount: foundSolutions.length,
            checkingPos: [row, col]
          });
        }
      }
    };

    backtrack(0, []);

    operationSteps.push({
      type: 'complete',
      message: `Complete! Found ${foundSolutions.length} solution(s) for ${n}-Queens problem. Total steps: ${stepCount}.`,
      board: Array(n).fill(null).map(() => Array(n).fill(0)),
      queens: [],
      attacked: [],
      valid: true,
      solutionCount: foundSolutions.length
    });

    return { steps: operationSteps, solutions: foundSolutions };
  }, [n, isSafe, getAttackedCells]);

  const runAlgorithm = () => {
    const { steps: newSteps, solutions: newSolutions } = solveNQueens();
    setSteps(newSteps);
    setSolutions(newSolutions);
    setCurrentStep(0);
    setCurrentSolutionIndex(0);
  };

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  const resetAnimation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setCurrentSolutionIndex(0);
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
      setBoard(step.board || []);
      setPlacedQueens(step.queens || []);
      setAttackedCells(step.attacked || []);
      setValidPlacement(step.valid !== false);
      setMessage(step.message || '');
    }
  }, [currentStep, steps]);

  const renderBoard = () => {
    return (
      <div className="inline-block">
        <div className="border-4 border-gray-800 bg-gray-100">
          {board.map((row, rowIdx) => (
            <div key={rowIdx} className="flex">
              {row.map((cell, colIdx) => {
                const isQueenCell = placedQueens.some(([r, c]) => r === rowIdx && c === colIdx);
                const isAttacked = attackedCells.some(([r, c]) => r === rowIdx && c === colIdx);
                const isCheckingPos = steps[currentStep]?.checkingPos && 
                  steps[currentStep].checkingPos[0] === rowIdx && 
                  steps[currentStep].checkingPos[1] === colIdx;

                const bgColor = isQueenCell 
                  ? 'bg-green-500' 
                  : isAttacked 
                  ? 'bg-red-300' 
                  : isCheckingPos
                  ? 'bg-yellow-300'
                  : (rowIdx + colIdx) % 2 === 0 
                  ? 'bg-white' 
                  : 'bg-gray-300';

                return (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center border border-gray-400 ${bgColor} transition-all duration-200 text-2xl md:text-4xl font-bold`}
                  >
                    {isQueenCell && '👑'}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderVisualizer = () => (
    <div className="space-y-6">
      {/* Board and Info */}
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Grid3x3 className="text-blue-600" size={28} />
          {n}-Queens Chessboard
        </h3>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Board */}
          <div className="flex justify-center">
            {renderBoard()}
          </div>

          {/* Statistics */}
          <div className="space-y-4 flex-1">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-gray-300">
              <h4 className="font-semibold text-gray-800 mb-3">Current State</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Board Size</p>
                  <p className="text-2xl font-bold text-blue-600">{n} × {n}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Queens Placed</p>
                  <p className="text-2xl font-bold text-green-600">{placedQueens.length}/{n}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Attacked Cells</p>
                  <p className="text-2xl font-bold text-red-600">{attackedCells.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Solutions Found</p>
                  <p className="text-2xl font-bold text-purple-600">{solutions.length}</p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-lg p-4 border-2 border-gray-300">
              <h4 className="font-semibold text-gray-800 mb-3">Legend</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500"></div>
                  <span className="text-sm text-gray-700">Queen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-300"></div>
                  <span className="text-sm text-gray-700">Under Attack</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-300"></div>
                  <span className="text-sm text-gray-700">Being Checked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white border border-gray-400"></div>
                  <span className="text-sm text-gray-700">Safe Cell</span>
                </div>
              </div>
            </div>

            {/* Queen Positions */}
            {placedQueens.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-300">
                <h4 className="font-semibold text-gray-800 mb-2">Queen Positions</h4>
                <div className="flex flex-wrap gap-2">
                  {placedQueens.map((pos, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-mono">
                      ({pos[0]}, {pos[1]})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Solutions Display */}
      {solutions.length > 0 && (
        <div className="bg-white/90 rounded-lg p-6 shadow-lg">
          <h3 className="text-2xl font-semibold mb-4">All Solutions ({solutions.length} found)</h3>
          
          <div className="flex flex-wrap gap-4 mb-4">
            {solutions.map((solution, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSolutionIndex(idx)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  currentSolutionIndex === idx
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Solution {idx + 1}
              </button>
            ))}
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-gray-300">
            <h4 className="font-semibold text-gray-800 mb-4">Solution {currentSolutionIndex + 1}</h4>
            <div className="inline-block">
              <div className="border-4 border-gray-800 bg-gray-100">
                {Array(n).fill(null).map((_, rowIdx) => (
                  <div key={rowIdx} className="flex">
                    {Array(n).fill(null).map((_, colIdx) => {
                      const hasQueen = solutions[currentSolutionIndex].some(
                        ([r, c]) => r === rowIdx && c === colIdx
                      );
                      return (
                        <div
                          key={`sol-${rowIdx}-${colIdx}`}
                          className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center border border-gray-400 ${
                            hasQueen ? 'bg-green-500' : (rowIdx + colIdx) % 2 === 0 ? 'bg-white' : 'bg-gray-300'
                          } text-2xl md:text-4xl font-bold`}
                        >
                          {hasQueen && '👑'}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const TheorySection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        N-Queens Problem Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">What is the N-Queens Problem?</h3>
          <p className="text-gray-700">
            The N-Queens problem is a classic constraint satisfaction problem where you must place N queens on an N×N chessboard such that no two queens threaten each other. Queens can attack horizontally, vertically, and diagonally. It's one of the most famous backtracking problems in computer science.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700">Problem Constraints</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>Exactly N queens on N×N board</li>
              <li>No two queens on same row</li>
              <li>No two queens on same column</li>
              <li>No two queens on same diagonal</li>
              <li>Find all valid placements</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700">Number of Solutions</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>4-Queens: 2 solutions</li>
              <li>8-Queens: 92 solutions</li>
              <li>10-Queens: 724 solutions</li>
              <li>12-Queens: 14,200 solutions</li>
              <li>Grows exponentially with N</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">How Backtracking Works</h4>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700 text-sm">
            <li>Place queen in leftmost column</li>
            <li>Move to next column and try each row</li>
            <li>Check if position is safe (not under attack)</li>
            <li>If safe, place queen and continue recursively</li>
            <li>If complete row filled with all queens, found solution</li>
            <li>If no valid position, backtrack and try different row</li>
            <li>Repeat until all possibilities explored</li>
          </ol>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Complexity Analysis</h4>
          <div className="space-y-2 text-gray-700 text-sm">
            <p><span className="font-semibold">Time Complexity:</span> O(N!) - worst case checks all permutations</p>
            <p><span className="font-semibold">Space Complexity:</span> O(N) - for recursion depth</p>
            <p><span className="font-semibold">Pruning:</span> Backtracking prunes ~99% of search space</p>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Key Insights</h4>
          <div className="space-y-2 text-gray-700 text-sm">
            <p>• <span className="font-semibold">Column-by-column placement:</span> Each column gets exactly one queen (guarantees no column conflicts)</p>
            <p>• <span className="font-semibold">Early pruning:</span> Checking conflicts early eliminates many branches</p>
            <p>• <span className="font-semibold">Diagonal checking:</span> For position (r,c) and queen (qr,qc): |r-qr| = |c-qc| means same diagonal</p>
          </div>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg space-y-4">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
        N-Queens Implementation
      </h2>

      <div className="bg-gray-50 rounded-lg p-4 border">
        <h4 className="font-semibold mb-3 text-lg">Main Algorithm</h4>
        <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
          <code>{`SOLVE-N-QUEENS(n):
  solutions = []
  board = create n×n empty board
  
  BACKTRACK(0, [])
  
  return solutions

BACKTRACK(col, queens):
  // Base case: placed all queens
  if col == n:
    add queens to solutions
    return
  
  // Try placing queen in each row of current column
  for row = 0 to n-1:
    if IS-SAFE(board, row, col):
      // Place queen
      board[row][col] = 1
      queens.append([row, col])
      
      // Recursively solve next column
      BACKTRACK(col + 1, queens)
      
      // Backtrack: remove queen
      board[row][col] = 0
      queens.pop()

IS-SAFE(board, row, col):
  // Check left direction
  for j = col - 1 down to 0:
    if board[row][j] == 1:
      return false
  
  // Check upper-left diagonal
  for i = row - 1, j = col - 1:
    if i >= 0 && j >= 0:
      if board[i][j] == 1:
        return false
  
  // Check lower-left diagonal
  for i = row + 1, j = col - 1:
    if i < n && j >= 0:
      if board[i][j] == 1:
        return false
  
  return true`}</code>
        </pre>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold mb-2 text-blue-900">Safe Position Check</h4>
          <p className="text-sm text-gray-700 mb-2">A position (row, col) is safe if:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            <li>No queen in same row (left)</li>
            <li>No queen in upper-left diagonal</li>
            <li>No queen in lower-left diagonal</li>
            <li>Only check left (already placed)</li>
          </ul>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold mb-2 text-green-900">Optimization Tips</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            <li>Use 1D array instead of 2D board</li>
            <li>Pre-calculate attacked positions</li>
            <li>Use bit manipulation for sets</li>
            <li>Memoization for repeated states</li>
            <li>Parallel processing for large N</li>
          </ul>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 md:col-span-2">
          <h4 className="font-semibold mb-2 text-purple-900">Backtracking Principle</h4>
          <p className="text-sm text-gray-700">
            Backtracking explores the solution space systematically. When a dead end is reached (no valid position for queen), it backtracks to the previous decision point and tries alternative choices. This intelligent search dramatically reduces the search space compared to brute force.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
            N-Queens Problem Visualizer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Master the classic backtracking algorithm by visualizing how queens are placed on the board while satisfying all constraints.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 rounded-lg p-3 shadow-lg mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'visualizer', label: 'Visualizer', icon: Grid3x3 },
              { id: 'theory', label: 'Theory', icon: BookOpen },
              { id: 'pseudocode', label: 'Pseudocode', icon: Code }
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    tab === t.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
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
          <div className="bg-white/80 rounded-lg p-6 shadow-lg mb-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Board Size (N):</label>
                <select
                  value={n}
                  onChange={(e) => setN(parseInt(e.target.value))}
                  disabled={isRunning || steps.length > 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num}-Queens</option>
                  ))}
                </select>
              </div>

              <button
                onClick={runAlgorithm}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
              >
                <Grid3x3 size={18} /> Solve
              </button>

              <button
                onClick={toggleAnimation}
                disabled={steps.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors font-medium"
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} />}
                {isRunning ? 'Pause' : 'Play'}
              </button>

              <button
                onClick={stepForward}
                disabled={currentStep >= steps.length - 1 || steps.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors font-medium"
              >
                <StepForward size={18} /> Step
              </button>

              <button
                onClick={resetAnimation}
                disabled={steps.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors font-medium"
              >
                <RotateCcw size={18} /> Reset
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm font-medium">Speed:</span>
                <select
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[100, 200, 300, 400, 500].map(speed => (
                    <option key={speed} value={speed}>{speed}ms</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {tab === 'visualizer' && renderVisualizer()}
        {tab === 'theory' && <div className="mt-6"><TheorySection /></div>}
        {tab === 'pseudocode' && <div className="mt-6"><PseudocodeSection /></div>}
      </div>    
    </div>
  );
}

export default NQueens;