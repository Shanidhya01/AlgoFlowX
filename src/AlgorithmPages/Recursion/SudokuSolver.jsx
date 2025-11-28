import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, Grid3x3, Sparkles, ListChecks } from 'lucide-react';

function SudokuSolver() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [base, setBase] = useState(3); // subgrid size; board N = base*base

  const [board, setBoard] = useState([]);
  const [originalBoard, setOriginalBoard] = useState([]);
  const [currentCell, setCurrentCell] = useState(null);
  const [message, setMessage] = useState('');
  const [backtracks, setBacktracks] = useState(0);
  const [filledCells, setFilledCells] = useState(0);
  const [candidates, setCandidates] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [puzzleInput, setPuzzleInput] = useState('');
  const [cluesCount, setCluesCount] = useState(30);

  // Default 9x9 example (0 = empty)
  const initialPuzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ];
  const makeEmptyBoard = (N) => Array.from({ length: N }, () => Array(N).fill(0));

  useEffect(() => {
    const N = base * base;
    const initial = base === 3 ? initialPuzzle : makeEmptyBoard(N);
    const boardCopy = initial.map(row => [...row]);
    setBoard(boardCopy);
    setOriginalBoard(boardCopy);
    setFilledCells(boardCopy.flat().filter(cell => cell !== 0).length);
    setPuzzleInput(formatBoard(initial));
    setSteps([]);
    setCurrentStep(0);
    setIsRunning(false);
    setErrorMessage('');
  }, [base]);

  const formatBoard = (b) => b.map(r => r.join(' ')).join('\n');

  const parsePuzzle = (text) => {
    const N = base * base;
    const rows = text.trim().split(/\n+/);
    if (rows.length !== N) throw new Error(`Puzzle must have ${N} lines`);
    const grid = rows.map((line) => {
      const vals = line.trim().split(/\s+/).map(v => v === '.' ? '0' : v);
      if (vals.length !== N) throw new Error(`Each line must have ${N} numbers`);
      const nums = vals.map(v => {
        const n = parseInt(v, 10);
        if (isNaN(n) || n < 0 || n > N) throw new Error(`Only integers 0..${N} (or . for empty)`);
        return n;
      });
      return nums;
    });
    return grid;
  };

  const isSafe = (b, r, c, val) => {
    const N = base * base;
    for (let i = 0; i < N; i++) {
      if (b[r][i] === val || b[i][c] === val) return false;
    }
    const br = Math.floor(r / base) * base;
    const bc = Math.floor(c / base) * base;
    for (let i = br; i < br + base; i++) {
      for (let j = bc; j < bc + base; j++) {
        if (b[i][j] === val) return false;
      }
    }
    return true;
  };

  const validateNoConflicts = (b) => {
    const N = base * base;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const val = b[r][c];
        if (val === 0) continue;
        b[r][c] = 0;
        if (!isSafe(b, r, c, val)) {
          b[r][c] = val;
          return false;
        }
        b[r][c] = val;
      }
    }
    return true;
  };

  const shuffled = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const generateSolvedGrid = () => {
    const N = base * base;
    const g = Array.from({ length: N }, () => Array(N).fill(0));
    const digits = Array.from({ length: N }, (_, i) => i + 1);
    const fill = (r = 0, c = 0) => {
      if (r === N) return true;
      const nr = c === N - 1 ? r + 1 : r;
      const nc = c === N - 1 ? 0 : c + 1;
      for (const d of shuffled(digits)) {
        if (isSafe(g, r, c, d)) {
          g[r][c] = d;
          if (fill(nr, nc)) return true;
          g[r][c] = 0;
        }
      }
      return false;
    };
    fill();
    return g;
  };

  const generateRandomPuzzle = () => {
    setErrorMessage('');
    const solved = generateSolvedGrid();
    const N = base * base;
    const total = N * N;
    const clampClues = Math.max(0, Math.min(total, cluesCount));
    const toRemove = Math.max(0, total - clampClues);
    const cells = Array.from({ length: total }, (_, i) => i);
    for (let k = 0; k < toRemove; k++) {
      const idx = Math.floor(Math.random() * cells.length);
      const pos = cells.splice(idx, 1)[0];
      const r = Math.floor(pos / N), c = pos % N;
      solved[r][c] = 0;
    }
    setOriginalBoard(solved.map(row => [...row]));
    setBoard(solved.map(row => [...row]));
    setFilledCells(solved.flat().filter(x => x !== 0).length);
    setPuzzleInput(formatBoard(solved));
    setSteps([]);
    setCurrentStep(0);
    setIsRunning(false);
  };

  const applyCustomPuzzle = () => {
    setErrorMessage('');
    try {
      const parsed = parsePuzzle(puzzleInput);
      const copy = parsed.map(r => [...r]);
      if (!validateNoConflicts(copy)) {
        setErrorMessage('Invalid puzzle: row/column/box conflict detected.');
        return;
      }
      setOriginalBoard(copy);
      setBoard(copy.map(r => [...r]));
      setFilledCells(copy.flat().filter(x => x !== 0).length);
      setSteps([]);
      setCurrentStep(0);
      setIsRunning(false);
    } catch (e) {
      setErrorMessage(e.message || 'Invalid puzzle format.');
    }
  };

  // Get candidates for a cell
  const getCandidates = (board, row, col) => {
    const N = base * base;
    if (board[row][col] !== 0) return [];
    const candidates = new Set(Array.from({ length: N }, (_, i) => i + 1));
    for (let i = 0; i < N; i++) {
      candidates.delete(board[row][i]);
      candidates.delete(board[i][col]);
    }
    const boxRow = Math.floor(row / base) * base;
    const boxCol = Math.floor(col / base) * base;
    for (let i = boxRow; i < boxRow + base; i++) {
      for (let j = boxCol; j < boxCol + base; j++) {
        candidates.delete(board[i][j]);
      }
    }
    return Array.from(candidates);
  };

  // Find next empty cell
  const findEmptyCell = (board) => {
    const N = base * base;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (board[i][j] === 0) {
          return [i, j];
        }
      }
    }
    return null;
  };

  const solveSudoku = useCallback(() => {
    const operationSteps = [];
    const boardCopy = originalBoard.map(row => [...row]);
    let backtrackCount = 0;
    let cellsFilled = originalBoard.flat().filter(cell => cell !== 0).length;

    operationSteps.push({
      type: 'initialize',
      message: 'Starting Sudoku solver using backtracking algorithm.',
      board: boardCopy.map(row => [...row]),
      currentCell: null,
      candidates: {},
      backtracks: 0,
      filledCells: cellsFilled
    });

    const backtrack = (board, row = 0, col = 0) => {
      // Find next empty cell
      const N = base * base;
      let found = false;
      for (let i = row; i < N; i++) {
        for (let j = (i === row ? col : 0); j < N; j++) {
          if (board[i][j] === 0) {
            row = i;
            col = j;
            found = true;
            break;
          }
        }
        if (found) break;
      }

      if (!found) {
        operationSteps.push({
          type: 'solved',
          message: '✓ Sudoku solved! All cells filled correctly.',
          board: boardCopy.map(b => [...b]),
          currentCell: null,
          candidates: {},
          backtracks: backtrackCount,
          filledCells: (base*base)*(base*base)
        });
        return true;
      }

      operationSteps.push({
        type: 'select_cell',
        message: `Selected cell at row ${row + 1}, col ${col + 1}. Finding candidates...`,
        board: boardCopy.map(b => [...b]),
        currentCell: [row, col],
        candidates: {},
        backtracks: backtrackCount,
        filledCells: cellsFilled
      });

      const cands = getCandidates(board, row, col);

      operationSteps.push({
        type: 'candidates_found',
        message: `Found ${cands.length} possible values: [${cands.join(', ')}]`,
        board: boardCopy.map(b => [...b]),
        currentCell: [row, col],
        candidates: { [`${row}-${col}`]: cands },
        backtracks: backtrackCount,
        filledCells: cellsFilled
      });

      for (let num of cands) {
        operationSteps.push({
          type: 'try_number',
          message: `Trying number ${num} at row ${row + 1}, col ${col + 1}...`,
          board: boardCopy.map(b => [...b]),
          currentCell: [row, col],
          candidates: { [`${row}-${col}`]: [num] },
          backtracks: backtrackCount,
          filledCells: cellsFilled
        });

        board[row][col] = num;
        cellsFilled++;

        operationSteps.push({
          type: 'place_number',
          message: `Placed ${num}. Continuing to next cell...`,
          board: boardCopy.map(b => [...b]),
          currentCell: [row, col],
          candidates: {},
          backtracks: backtrackCount,
          filledCells: cellsFilled
        });

        if (backtrack(board, row, col + 1)) {
          return true;
        }

        operationSteps.push({
          type: 'backtrack',
          message: `Backtracking from ${num} at row ${row + 1}, col ${col + 1}. No solution found.`,
          board: boardCopy.map(b => [...b]),
          currentCell: [row, col],
          candidates: {},
          backtracks: ++backtrackCount,
          filledCells: cellsFilled - 1
        });

        board[row][col] = 0;
        cellsFilled--;
      }

      return false;
    };

    backtrack(boardCopy);

    operationSteps.push({
      type: 'complete',
      message: `✓ Complete! Backtracked ${backtrackCount} times.`,
      board: boardCopy.map(b => [...b]),
      currentCell: null,
      candidates: {},
      backtracks: backtrackCount,
      filledCells: (base*base)*(base*base)
    });

    return operationSteps;
  }, [originalBoard, base]);

  const runAlgorithm = () => {
    setErrorMessage('');
    const operationSteps = solveSudoku();
    setSteps(operationSteps);
    setCurrentStep(0);
  };

  const toggleAnimation = () => {
    if (!isRunning && steps.length === 0) {
      runAlgorithm();
    }
    setIsRunning(!isRunning);
  };

  const resetAnimation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    const N = base*base;
    const init = base === 3 ? initialPuzzle : makeEmptyBoard(N);
    setBoard(init.map(row => [...row]));
    setCurrentCell(null);
    setBacktracks(0);
    setFilledCells(init.flat().filter(cell => cell !== 0).length);
    setCandidates({});
  };

  const stepForward = () => {
    if (steps.length === 0) {
      runAlgorithm();
      return;
    }
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
      setCurrentCell(step.currentCell);
      setCandidates(step.candidates || {});
      setMessage(step.message || '');
      setBacktracks(step.backtracks || 0);
      setFilledCells(step.filledCells || 0);
    }
  }, [currentStep, steps]);

  const renderBoard = () => (
    <div className="inline-block">
      <div className="border-4 border-gray-900 bg-gray-100">
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className="flex">
            {row.map((cell, colIdx) => {
              const isCurrentCell = currentCell && currentCell[0] === rowIdx && currentCell[1] === colIdx;
              const isOriginal = originalBoard[rowIdx][colIdx] !== 0;
              const isCandidate = candidates[`${rowIdx}-${colIdx}`]?.length > 0;

              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center border border-gray-400 font-bold text-lg md:text-xl transition-all ${
                    isCurrentCell
                      ? 'bg-yellow-300 scale-110 shadow-lg'
                      : isCandidate
                      ? 'bg-blue-200'
                      : isOriginal
                      ? 'bg-gray-200 text-gray-900'
                      : cell !== 0
                      ? 'bg-green-100 text-green-900'
                      : 'bg-white'
                  } ${
                    (rowIdx + 1) % base === 0 && rowIdx !== (base*base - 1) ? 'border-b-4' : ''
                  } ${
                    (colIdx + 1) % base === 0 && colIdx !== (base*base - 1) ? 'border-r-4' : ''
                  }`}
                  style={{
                    borderBottomWidth: (rowIdx + 1) % base === 0 && rowIdx !== (base*base - 1) ? '4px' : '1px',
                    borderRightWidth: (colIdx + 1) % base === 0 && colIdx !== (base*base - 1) ? '4px' : '1px'
                  }}
                >
                  {cell !== 0 ? cell : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  const renderVisualizer = () => (
    <div className="space-y-6">
      {/* Sudoku Board */}
      <div className="bg-white/90 dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Grid3x3 className="text-blue-600" size={28} />
          Sudoku Board
        </h3>

        <div className="flex flex-col lg:flex-row gap-8 mb-6">
          {/* Board */}
          <div className="flex justify-center">
            {renderBoard()}
          </div>

          {/* Statistics */}
          <div className="space-y-4 flex-1">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-700">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Statistics</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cells Filled</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{filledCells}/{(base*base)*(base*base)}</p>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(filledCells / ((base*base)*(base*base))) * 100}%` }}
                  ></div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Backtracks</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{backtracks}</p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-600">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Legend</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 border border-gray-400"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Original (Given)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 border border-gray-400"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Filled by Solver</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-300 border border-gray-400"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Current Cell</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-200 border border-gray-400"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Candidates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TheorySection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Sudoku Solver Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">What is Sudoku?</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Sudoku is a constraint satisfaction problem where you fill a 9×9 grid with digits 1-9 such that each row, column, and 3×3 box contains all digits exactly once. It's an excellent example of backtracking algorithm application.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Constraints</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Each row has digits 1-9</li>
              <li>Each column has digits 1-9</li>
              <li>Each 3×3 box has digits 1-9</li>
              <li>No digit repeats in row/column/box</li>
              <li>All 81 cells must be filled</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">Algorithm Steps</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Find next empty cell</li>
              <li>Find valid candidates</li>
              <li>Try each candidate</li>
              <li>Recursively solve</li>
              <li>Backtrack if no solution</li>
              <li>Return when solved</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Finding Candidates</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
            <p>For each empty cell, candidates are digits 1-9 excluding:</p>
            <p className="ml-4">• Digits already in the same row</p>
            <p className="ml-4">• Digits already in the same column</p>
            <p className="ml-4">• Digits already in the same 3×3 box</p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Complexity Analysis</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm font-mono">
            <p>Time: <span className="font-bold">O(9^(n×m))</span></p>
            <p className="text-xs">where n×m is the number of empty cells</p>
            <p>Space: <span className="font-bold">O(81)</span> for the board</p>
          </div>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
        Sudoku Solver Implementation
      </h2>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
        <h4 className="font-semibold mb-3 text-lg">Main Algorithm</h4>
        <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
          <code>{`SOLVE-SUDOKU(board):
  empty_cell = find_empty_cell(board)
  
  if empty_cell is null:
    return true  // Solved
  
  row, col = empty_cell
  candidates = get_candidates(board, row, col)
  
  for num in candidates:
    board[row][col] = num
    
    if SOLVE-SUDOKU(board):
      return true
    
    board[row][col] = 0  // Backtrack
  
  return false

GET-CANDIDATES(board, row, col):
  candidates = {1, 2, 3, 4, 5, 6, 7, 8, 9}
  
  // Remove digits in row
  for each cell in board[row]:
    candidates.remove(cell)
  
  // Remove digits in column
  for each row in board:
    candidates.remove(board[row][col])
  
  // Remove digits in 3x3 box
  box_row = (row // 3) * 3
  box_col = (col // 3) * 3
  for i in [box_row, box_row+3):
    for j in [box_col, box_col+3):
      candidates.remove(board[i][j])
  
  return candidates`}</code>
        </pre>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Optimizations</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Choose cell with fewest candidates</li>
            <li>Use constraint propagation</li>
            <li>Cache candidate sets</li>
            <li>Early termination checks</li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <h4 className="font-semibold mb-2 text-green-900 dark:text-green-300">Key Points</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Pure backtracking solution</li>
            <li>Works for all valid puzzles</li>
            <li>Pruning reduces search space</li>
            <li>Most puzzles solved quickly</li>
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
            Sudoku Solver Visualizer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Watch the backtracking algorithm solve Sudoku puzzles by finding valid candidates and intelligently exploring solutions.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 shadow-lg mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'visualizer', label: 'Visualizer', icon: Grid3x3 },
              { id: 'theory', label: 'Theory', icon: BookOpen },
              { id: 'pseudocode', label: 'Algorithm', icon: Code }
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
                <Grid3x3 size={18} /> Solve
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
                  <option value={1000}>Slow</option>
                  <option value={500}>Normal</option>
                  <option value={100}>Fast</option>
                  <option value={10}>Very Fast</option>
                </select>
                <span className="text-sm font-medium ml-4">Base:</span>
                <input
                  type="number"
                  min={2}
                  max={4}
                  value={base}
                  onChange={(e)=>setBase(Math.max(2, Math.min(4, parseInt(e.target.value)||3)))}
                  className="w-20 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
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
            {errorMessage && (
              <div className="mt-4 p-3 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            {/* Input & Presets Panel */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="text-blue-600" size={18} />
                <h4 className="font-semibold">Examples</h4>
              </div>
              {base === 3 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {["530070000 600195000 098000060 800060003 400803001 700020006 060000280 000419005 000080079",
                  "003020600 900305001 001806400 008102900 700000008 006708200 002609500 800203009 005010300",
                  "000260701 680070090 190004500 820100040 004602900 050003028 009300074 040050036 703018000"].map((s, idx) => (
                  <button key={idx}
                    onClick={() => { setPuzzleInput(s.split(' ').map(r=>r.split('').join(' ')).join('\n')); setErrorMessage(''); }}
                    className="px-3 py-1 text-sm rounded-full border border-gray-300 hover:border-gray-500">
                    Puzzle {idx+1}
                  </button>
                ))}
              </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Puzzle ({base*base} lines, use 0 or . for empty)</label>
                  <textarea
                    rows={Math.min(12, base*base)}
                    value={puzzleInput}
                    onChange={(e)=>setPuzzleInput(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">Tip: Separate by spaces is okay. Each line must have {base*base} numbers.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Clues (given cells)</label>
                  <input type="number" min={1} max={(base*base)*(base*base)} value={cluesCount}
                    onChange={(e)=>setCluesCount(parseInt(e.target.value)||30)}
                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg"/>
                  <div className="flex flex-col gap-2 mt-3">
                    <button onClick={generateRandomPuzzle}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                      <Sparkles size={18}/> Random Puzzle
                    </button>
                    <button onClick={applyCustomPuzzle}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                      Apply Puzzle
                    </button>
                    <button onClick={() => {
                        const N = base*base;
                        const init = base === 3 ? initialPuzzle : Array.from({ length: N }, () => Array(N).fill(0));
                        const boardCopy = init.map(r=>[...r]);
                        setOriginalBoard(boardCopy);
                        setBoard(boardCopy);
                        setFilledCells(boardCopy.flat().filter(x=>x!==0).length);
                        setPuzzleInput(formatBoard(boardCopy));
                        setSteps([]); setCurrentStep(0); setIsRunning(false); setErrorMessage('');
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg">
                      <RotateCcw size={18}/> Reset to Default
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 p-3 rounded-lg text-sm text-blue-900 dark:text-blue-200">
                <p className="font-semibold mb-1">Tips</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Provide {base*base} lines, each with {base*base} integers (0 or . for empty).</li>
                  <li>Random puzzle removes cells from a valid solved grid based on clues.</li>
                  <li>Validation checks basic conflicts; not all custom puzzles are guaranteed solvable.</li>
                </ul>
              </div>
            </div>
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
      </div>
    </div>
  );
}

export default SudokuSolver;