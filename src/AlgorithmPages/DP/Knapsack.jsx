import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, Backpack } from 'lucide-react';

function Knapsack() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(800);

  const [items, setItems] = useState([
    { id: 0, weight: 2, value: 3, selected: false },
    { id: 1, weight: 3, value: 4, selected: false },
    { id: 2, weight: 4, value: 5, selected: false },
    { id: 3, weight: 5, value: 6, selected: false }
  ]);

  const [capacity, setCapacity] = useState(8);
  const [dp, setDp] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentCell, setCurrentCell] = useState(null);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [message, setMessage] = useState('');

  const knapsackAlgorithm = useCallback(() => {
    const operationSteps = [];
    const n = items.length;
    const w = capacity;

    // Initialize DP table
    const dpTable = Array(n + 1)
      .fill(null)
      .map(() => Array(w + 1).fill(0));

    operationSteps.push({
      type: 'initialize',
      message: `Initialize ${n + 1} × ${w + 1} DP table. Each cell [i][w] represents max value using first i items with capacity w.`,
      dp: dpTable.map(row => [...row]),
      items: items,
      capacity: w,
      currentCell: null,
      selectedItems: [],
      totalWeight: 0,
      totalValue: 0
    });

    // Fill DP table
    for (let i = 1; i <= n; i++) {
      const item = items[i - 1];

      for (let j = 0; j <= w; j++) {
        operationSteps.push({
          type: 'check_cell',
          message: `Checking item ${i} (weight=${item.weight}, value=${item.value}) with capacity ${j}`,
          dp: dpTable.map(row => [...row]),
          items: items,
          capacity: w,
          currentCell: [i, j],
          currentItem: i - 1,
          selectedItems: [],
          totalWeight: 0,
          totalValue: 0
        });

        if (item.weight <= j) {
          const includeValue = dpTable[i - 1][j - item.weight] + item.value;
          const excludeValue = dpTable[i - 1][j];

          if (includeValue > excludeValue) {
            dpTable[i][j] = includeValue;
            operationSteps.push({
              type: 'include_item',
              message: `Item ${i} fits! Including it gives value ${includeValue} (was ${excludeValue}). Update DP[${i}][${j}] = ${includeValue}`,
              dp: dpTable.map(row => [...row]),
              items: items,
              capacity: w,
              currentCell: [i, j],
              currentItem: i - 1,
              selectedItems: [],
              totalWeight: 0,
              totalValue: 0
            });
          } else {
            dpTable[i][j] = excludeValue;
            operationSteps.push({
              type: 'exclude_item',
              message: `Excluding item ${i} is better. Value ${excludeValue} >= ${includeValue}. DP[${i}][${j}] = ${excludeValue}`,
              dp: dpTable.map(row => [...row]),
              items: items,
              capacity: w,
              currentCell: [i, j],
              currentItem: i - 1,
              selectedItems: [],
              totalWeight: 0,
              totalValue: 0
            });
          }
        } else {
          dpTable[i][j] = dpTable[i - 1][j];
          operationSteps.push({
            type: 'item_too_heavy',
            message: `Item ${i} too heavy (${item.weight} > ${j}). Cannot include. Copy value from previous: DP[${i}][${j}] = ${dpTable[i][j]}`,
            dp: dpTable.map(row => [...row]),
            items: items,
            capacity: w,
            currentCell: [i, j],
            currentItem: i - 1,
            selectedItems: [],
            totalWeight: 0,
            totalValue: 0
          });
        }
      }
    }

    const maxValue = dpTable[n][w];

    operationSteps.push({
      type: 'table_complete',
      message: `DP table complete! Maximum value achievable: ${maxValue}. Now backtracking to find selected items...`,
      dp: dpTable.map(row => [...row]),
      items: items,
      capacity: w,
      currentCell: null,
      selectedItems: [],
      totalWeight: 0,
      totalValue: 0
    });

    // Backtrack to find items
    let i = n;
    let j = w;
    const selected = [];
    let tempWeight = 0;
    let tempValue = 0;

    while (i > 0 && j > 0) {
      operationSteps.push({
        type: 'backtrack',
        message: `Backtracking: Checking if item ${i} was included (DP[${i}][${j}]=${dpTable[i][j]} vs DP[${i - 1}][${j}]=${dpTable[i - 1][j]})`,
        dp: dpTable.map(row => [...row]),
        items: items,
        capacity: w,
        currentCell: [i, j],
        currentItem: i - 1,
        selectedItems: selected.map(idx => ({ ...items[idx], selected: true })),
        totalWeight: tempWeight,
        totalValue: tempValue
      });

      if (dpTable[i][j] !== dpTable[i - 1][j]) {
        const item = items[i - 1];
        selected.push(i - 1);
        tempWeight += item.weight;
        tempValue += item.value;

        operationSteps.push({
          type: 'item_included',
          message: `✓ Item ${i} (weight=${item.weight}, value=${item.value}) was included in optimal solution!`,
          dp: dpTable.map(row => [...row]),
          items: items,
          capacity: w,
          currentCell: [i, j],
          currentItem: i - 1,
          selectedItems: selected.map(idx => ({ ...items[idx], selected: true })),
          totalWeight: tempWeight,
          totalValue: tempValue
        });

        j -= item.weight;
      } else {
        operationSteps.push({
          type: 'item_excluded',
          message: `✗ Item ${i} was not included in optimal solution.`,
          dp: dpTable.map(row => [...row]),
          items: items,
          capacity: w,
          currentCell: [i, j],
          currentItem: i - 1,
          selectedItems: selected.map(idx => ({ ...items[idx], selected: true })),
          totalWeight: tempWeight,
          totalValue: tempValue
        });
      }
      i--;
    }

    operationSteps.push({
      type: 'complete',
      message: `✓ Optimal solution found! Selected ${selected.length} items with total weight ${tempWeight} and value ${tempValue}.`,
      dp: dpTable.map(row => [...row]),
      items: items,
      capacity: w,
      currentCell: null,
      selectedItems: selected.map(idx => ({ ...items[idx], selected: true })),
      totalWeight: tempWeight,
      totalValue: tempValue
    });

    return operationSteps;
  }, [items, capacity]);

  const runAlgorithm = () => {
    const operationSteps = knapsackAlgorithm();
    setSteps(operationSteps);
    setCurrentStep(0);
  };

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  const resetAnimation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setDp([]);
    setSelectedItems([]);
    setTotalWeight(0);
    setTotalValue(0);
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
      setDp(step.dp || []);
      setSelectedItems(step.selectedItems || []);
      setTotalWeight(step.totalWeight || 0);
      setTotalValue(step.totalValue || 0);
      setCurrentCell(step.currentCell);
      setMessage(step.message || '');
    }
  }, [currentStep, steps]);

  const renderVisualizer = () => (
    <div className="space-y-6">
      {/* DP Table Visualization */}
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Backpack className="text-blue-600" size={28} />
          Dynamic Programming Table
        </h3>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm md:text-base">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-purple-500">
                <th className="border-2 border-gray-400 p-2 text-white">i/W</th>
                {Array(capacity + 1)
                  .fill(null)
                  .map((_, w) => (
                    <th key={w} className="border-2 border-gray-400 p-2 text-white font-mono">
                      {w}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {dp.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border-2 border-gray-400 p-2 font-bold text-blue-600">{i}</td>
                  {row.map((cell, w) => {
                    const isCurrentCell =
                      currentCell && currentCell[0] === i && currentCell[1] === w;
                    return (
                      <td
                        key={`${i}-${w}`}
                        className={`border-2 border-gray-400 p-2 text-center font-mono font-semibold transition-all duration-200 ${
                          isCurrentCell ? 'bg-yellow-300 scale-110' : 'bg-white'
                        }`}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Items List */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Available Items</h4>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedItems.some(s => s.id === item.id)
                      ? 'border-green-500 bg-green-100'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Item {item.id + 1}</span>
                    {selectedItems.some(s => s.id === item.id) && <span className="text-green-600 font-bold">✓</span>}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Weight: <span className="font-mono font-bold">{item.weight}</span> | Value:{' '}
                    <span className="font-mono font-bold">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solution Summary */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Solution</h4>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                <p className="text-sm text-gray-600">Selected Items</p>
                <p className="text-3xl font-bold text-green-600">{selectedItems.length}/{items.length}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-300">
                <p className="text-sm text-gray-600">Total Weight</p>
                <p className="text-3xl font-bold text-blue-600">
                  {totalWeight}/{capacity}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-300">
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-3xl font-bold text-purple-600">{totalValue}</p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
                <p className="text-sm font-semibold text-gray-700">Efficiency</p>
                <p className="text-lg font-bold text-yellow-600">
                  {totalWeight > 0 ? (totalValue / totalWeight).toFixed(2) : 0} val/weight
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Items Visualization */}
      {selectedItems.length > 0 && (
        <div className="bg-white/90 rounded-lg p-6 shadow-lg">
          <h3 className="text-2xl font-semibold mb-4">Optimal Selection</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedItems.map((item) => (
              <div key={item.id} className="bg-green-50 p-4 rounded-lg border-2 border-green-500 text-center">
                <div className="text-3xl mb-2">📦</div>
                <p className="font-bold text-green-700">Item {item.id + 1}</p>
                <p className="text-sm text-gray-600">W: {item.weight}</p>
                <p className="text-sm text-gray-600">V: {item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const TheorySection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        0/1 Knapsack Problem Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">What is the Knapsack Problem?</h3>
          <p className="text-gray-700">
            The 0/1 Knapsack problem is a classic optimization problem where you have a knapsack with limited capacity and a set of items, each with a weight and value. The goal is to select items to maximize total value while keeping total weight within the capacity. "0/1" means each item can be either taken or not taken (no fractions).
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700">Problem Definition</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>Given: n items with weights and values</li>
              <li>Given: Knapsack capacity W</li>
              <li>Find: Subset of items maximizing value</li>
              <li>Constraint: Total weight ≤ W</li>
              <li>Each item: take or leave (binary choice)</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700">Real-World Applications</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>Portfolio optimization</li>
              <li>Cargo loading optimization</li>
              <li>Resource allocation</li>
              <li>Investment decisions</li>
              <li>Database backup selection</li>
              <li>Memory management</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Dynamic Programming Approach</h4>
          <div className="space-y-2 text-gray-700 text-sm">
            <p>
              <span className="font-semibold">State Definition:</span> dp[i][w] = maximum value using first i items with
              capacity w
            </p>
            <p>
              <span className="font-semibold">Recurrence Relation:</span>
            </p>
            <p className="font-mono bg-white p-2 rounded text-xs">
              dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i])
            </p>
            <p className="text-xs text-gray-600">Either exclude item i or include it if it fits</p>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Complexity Analysis</h4>
          <div className="space-y-2 text-gray-700 text-sm">
            <p>
              <span className="font-semibold">Time Complexity:</span> O(n × W) where n = items, W = capacity
            </p>
            <p>
              <span className="font-semibold">Space Complexity:</span> O(n × W) for DP table (can be optimized to O(W))
            </p>
            <p className="text-xs text-gray-600">
              Pseudo-polynomial: runtime depends on capacity value, not just input size
            </p>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Why DP Works Here</h4>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
            <li><span className="font-semibold">Optimal Substructure:</span> Optimal solution contains optimal solutions to subproblems</li>
            <li><span className="font-semibold">Overlapping Subproblems:</span> Same capacity/items considered multiple times</li>
            <li><span className="font-semibold">Memoization:</span> Store results to avoid recalculation</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg space-y-4">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
        Knapsack Implementation
      </h2>

      <div className="bg-gray-50 rounded-lg p-4 border">
        <h4 className="font-semibold mb-3 text-lg">Main Algorithm</h4>
        <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
          <code>{`KNAPSACK-01(items, capacity):
  n = items.length
  // Create DP table: (n+1) × (capacity+1)
  dp = create array[n+1][capacity+1]
  
  // Initialize first row and column to 0
  for i = 0 to n:
    dp[i][0] = 0
  for w = 0 to capacity:
    dp[0][w] = 0
  
  // Fill DP table
  for i = 1 to n:
    item = items[i-1]
    for w = 1 to capacity:
      // Option 1: Don't take item
      dont_take = dp[i-1][w]
      
      // Option 2: Take item (if it fits)
      take = -INFINITY
      if item.weight <= w:
        take = dp[i-1][w - item.weight] + item.value
      
      // Choose better option
      dp[i][w] = max(dont_take, take)
  
  // Backtrack to find selected items
  selected = []
  i = n, w = capacity
  while i > 0 and w > 0:
    if dp[i][w] != dp[i-1][w]:
      selected.append(items[i-1])
      w = w - items[i-1].weight
    i = i - 1
  
  return {
    maxValue: dp[n][capacity],
    selectedItems: selected
  }`}</code>
        </pre>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold mb-2 text-blue-900">Space Optimization</h4>
          <pre className="bg-white text-gray-900 rounded p-3 text-xs overflow-auto border border-blue-200 font-mono">
            <code>{`// Use 1D array instead of 2D
dp = create array[capacity+1]

for i = 0 to n:
  // Traverse right-to-left to avoid
  // using updated values in same iteration
  for w = capacity down to weight[i]:
    dp[w] = max(dp[w],
                dp[w-weight[i]]+value[i])`}</code>
          </pre>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold mb-2 text-green-900">Backtracking to Find Items</h4>
          <pre className="bg-white text-gray-900 rounded p-3 text-xs overflow-auto border border-green-200 font-mono">
            <code>{`selected = []
i = n, w = capacity

while i > 0 and w > 0:
  // Check if item was included
  if dp[i][w] != dp[i-1][w]:
    selected.append(items[i-1])
    // Reduce capacity by item weight
    w -= items[i-1].weight
  
  i -= 1

return selected`}</code>
          </pre>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 md:col-span-2">
          <h4 className="font-semibold mb-2 text-purple-900">DP Table Interpretation</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              • <span className="font-semibold">dp[i][w]:</span> Maximum value considering first i items with capacity w
            </p>
            <p>
              • <span className="font-semibold">dp[i][w] = dp[i-1][w]:</span> Item i not taken (value unchanged)
            </p>
            <p>
              • <span className="font-semibold">dp[i][w] {'>'} dp[i-1][w]:</span> Item i was taken (value increased)
            </p>
            <p>
              • <span className="font-semibold">Last cell dp[n][W]:</span> Optimal solution value
            </p>
          </div>
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
            0/1 Knapsack Problem Visualizer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Master dynamic programming by visualizing how the knapsack algorithm optimally selects items to maximize value.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 rounded-lg p-3 shadow-lg mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'visualizer', label: 'Visualizer', icon: Backpack },
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
              <button
                onClick={runAlgorithm}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
              >
                <Backpack size={18} /> Solve
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
                  <option value={1500}>Slow</option>
                  <option value={800}>Normal</option>
                  <option value={300}>Fast</option>
                </select>
              </div>
            </div>

            {steps.length > 0 && (
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>
                    Step <span className="font-bold text-blue-600">{currentStep + 1}</span> of{' '}
                    <span className="font-bold">{steps.length}</span>
                  </span>
                  <span className="font-semibold text-purple-600">{steps[currentStep]?.type?.toUpperCase() || 'READY'}</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
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
          <div className="bg-white/90 rounded-lg p-6 shadow-lg mt-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Current Step</h3>
            <p className="text-gray-700 text-base leading-relaxed">{message}</p>
          </div>
        )}


      </div>
    </div>
  );
}

export default Knapsack;