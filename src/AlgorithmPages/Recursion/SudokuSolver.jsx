import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, Grid3x3 } from 'lucide-react';

function SudokuSolver() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(500);

  const [board, setBoard] = useState([]);
  const [originalBoard, setOriginalBoard] = useState([]);
  const [currentCell, setCurrentCell] = useState(null);
  const [message, setMessage] = useState('');
  const [backtracks, setBacktracks] = useState(0);
  const [filledCells, setFilledCells] = useState(0);
  const [candidates, setCandidates] = useState({});

  // Initial Sudoku puzzle (0 = empty)
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

  useEffect(() => {
    const boardCopy = initialPuzzle.map(row => [...row]);
    setBoard(boardCopy);
    setOriginalBoard(boardCopy);
    setFilledCells(boardCopy.flat().filter(cell => cell !== 0).length);
  }, []);

  // Get candidates for a cell
  const getCandidates = (board, row, col) => {
    if (board[row][col] !== 0) return [];
    
    const candidates = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    
    // Check row
    for (let i = 0; i < 9; i++) {
      candidates.delete(board[row][i]);
    }
    
    // Check column
    for (let i = 0; i < 9; i++) {
      candidates.delete(board[i][col]);
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = boxRow; i < boxRow + 3; i++) {
      for (let j = boxCol; j < boxCol + 3; j++) {
        candidates.delete(board[i][j]);
      }
    }
    
    return Array.from(candidates);
  };

  // Find next empty cell
  const findEmptyCell = (board) => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === 0) {
          return [i, j];
        }
      }
    }
    return null;
  };

  const solveSudoku = useCallback(() => {
    const operationSteps = [];
    const boardCopy = initialPuzzle.map(row => [...row]);
    let backtrackCount = 0;
    let cellsFilled = initialPuzzle.flat().filter(cell => cell !== 0).length;

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
      let found = false;
      for (let i = row; i < 9; i++) {
        for (let j = (i === row ? col : 0); j < 9; j++) {
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
          filledCells: 81
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
      message: `✓ Complete! Backtracked ${backtrackCount} times. Time: O(9^(n*m)) where n,m are empty cells.`,
      board: boardCopy.map(b => [...b]),
      currentCell: null,
      candidates: {},
      backtracks: backtrackCount,
      filledCells: 81
    });

    return operationSteps;
  }, [initialPuzzle]);

  const runAlgorithm = () => {
    const operationSteps = solveSudoku();
    setSteps(operationSteps);
    setCurrentStep(0);
  };

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  const resetAnimation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setBoard(initialPuzzle.map(row => [...row]));
    setCurrentCell(null);
    setBacktracks(0);
    setFilledCells(initialPuzzle.flat().filter(cell => cell !== 0).length);
    setCandidates({});
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
                    (rowIdx + 1) % 3 === 0 && rowIdx !== 8 ? 'border-b-4' : ''
                  } ${
                    (colIdx + 1) % 3 === 0 && colIdx !== 8 ? 'border-r-4' : ''
                  }`}
                  style={{
                    borderBottomWidth: (rowIdx + 1) % 3 === 0 && rowIdx !== 8 ? '4px' : '1px',
                    borderRightWidth: (colIdx + 1) % 3 === 0 && colIdx !== 8 ? '4px' : '1px'
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
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{filledCells}/81</p>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(filledCells / 81) * 100}%` }}
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
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Current Step</h3>
            <p className="text-gray-700 dark:text-gray-300">{message}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 text-center shadow-lg">
          <h3 className="text-xl font-bold mb-2">Master Constraint Satisfaction! 🧩</h3>
          <p>Sudoku solvers demonstrate how backtracking efficiently navigates massive solution spaces through smart pruning and constraint satisfaction.</p>
        </div>
      </div>
    </div>
  );
}

export default SudokuSolver;