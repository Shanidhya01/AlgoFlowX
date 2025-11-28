import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, Backpack, Plus, Trash2, Settings } from 'lucide-react';

function Knapsack() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [showInputPanel, setShowInputPanel] = useState(true);

  const [items, setItems] = useState([
    { id: 0, weight: 2, value: 3, selected: false },
    { id: 1, weight: 3, value: 4, selected: false },
    { id: 2, weight: 4, value: 5, selected: false },
    { id: 3, weight: 5, value: 6, selected: false }
  ]);

  const [capacity, setCapacity] = useState(8);
  const [newItemWeight, setNewItemWeight] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const [newCapacity, setNewCapacity] = useState('8');
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

  const addItem = () => {
    const weight = parseInt(newItemWeight);
    const value = parseInt(newItemValue);

    if (isNaN(weight) || isNaN(value) || weight <= 0 || value <= 0) {
      alert('Please enter valid positive numbers for weight and value');
      return;
    }

    const newItem = {
      id: items.length,
      weight: weight,
      value: value,
      selected: false
    };

    setItems([...items, newItem]);
    setNewItemWeight('');
    setNewItemValue('');
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateCapacity = () => {
    const newCap = parseInt(newCapacity);
    if (isNaN(newCap) || newCap <= 0) {
      alert('Please enter a valid positive number for capacity');
      return;
    }
    setCapacity(newCap);
  };

  const resetToDefault = () => {
    setItems([
      { id: 0, weight: 2, value: 3, selected: false },
      { id: 1, weight: 3, value: 4, selected: false },
      { id: 2, weight: 4, value: 5, selected: false },
      { id: 3, weight: 5, value: 6, selected: false }
    ]);
    setCapacity(8);
    setNewCapacity('8');
    resetAnimation();
  };

  const runAlgorithm = () => {
    const operationSteps = knapsackAlgorithm();
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
    setDp([]);
    setSelectedItems([]);
    setTotalWeight(0);
    setTotalValue(0);
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
      setDp(step.dp || []);
      setSelectedItems(step.selectedItems || []);
      setTotalWeight(step.totalWeight || 0);
      setTotalValue(step.totalValue || 0);
      setCurrentCell(step.currentCell);
      setMessage(step.message || '');
    }
  }, [currentStep, steps]);

  const InputPanel = () => (
    <div className="bg-white/90 rounded-lg p-6 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold flex items-center gap-2">
          <Settings className="text-blue-600" size={28} />
          Configure Problem
        </h3>
        <button
          onClick={() => setShowInputPanel(!showInputPanel)}
          className="text-gray-600 hover:text-gray-900 font-semibold"
        >
          {showInputPanel ? '▼' : '▶'}
        </button>
      </div>

      {showInputPanel && (
        <div className="space-y-6">
          {/* Capacity Section */}
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">Knapsack Capacity</h4>
            <div className="flex gap-2">
              <input
                type="number"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                placeholder="Enter capacity"
                className="flex-1 px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
              <button
                onClick={updateCapacity}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Set
              </button>
            </div>
            <p className="text-sm text-blue-700 mt-2">Current capacity: <span className="font-bold">{capacity}</span></p>
          </div>

          {/* Items Section */}
          <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
            <h4 className="font-semibold text-green-900 mb-3">Add New Item</h4>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newItemWeight}
                  onChange={(e) => setNewItemWeight(e.target.value)}
                  placeholder="Weight"
                  className="flex-1 px-4 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="1"
                />
                <input
                  type="number"
                  value={newItemValue}
                  onChange={(e) => setNewItemValue(e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-4 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="1"
                />
              </div>
              <button
                onClick={addItem}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add Item
              </button>
            </div>
          </div>

          {/* Current Items List */}
          <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-3">Current Items ({items.length})</h4>
            {items.length === 0 ? (
              <p className="text-gray-600 text-sm">No items yet. Add some items to get started!</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="font-semibold text-purple-700">Item {item.id + 1}</span>
                      <span className="text-sm text-gray-600">W: <span className="font-mono font-bold">{item.weight}</span></span>
                      <span className="text-sm text-gray-600">V: <span className="font-mono font-bold">{item.value}</span></span>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reset Button */}
          <button
            onClick={resetToDefault}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
          >
            Reset to Default
          </button>
        </div>
      )}
    </div>
  );

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
  item = items[i-1]
  for w = 1 to capacity:
    // Option 1: Don't take item
    dont_take = dp[w]
    
    // Option 2: Take item (if it fits)
    take = -INFINITY
    if item.weight <= w:
      take = dp[w - item.weight] + item.value
    
    // Choose better option
    dp[w] = max(dont_take, take)`}</code>
          </pre>
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
            0/1 Knapsack Visualizer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Build the DP table step-by-step and see how the optimal set of items is chosen under a capacity constraint.
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

        {/* Visualizer Controls and Inputs */}
        {tab === 'visualizer' && (
          <>
            <InputPanel />

            <div className="bg-white/80 rounded-lg p-6 shadow-lg mb-6">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <button
                  onClick={toggleAnimation}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  {isRunning ? <Pause size={18} /> : <Play size={18} />}
                  {isRunning ? 'Pause' : 'Play'}
                </button>

                <button
                  onClick={stepForward}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
                  disabled={currentStep >= steps.length - 1 && steps.length > 0}
                >
                  <StepForward size={18} /> Step
                </button>

                <button
                  onClick={() => { resetAnimation(); runAlgorithm(); }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  <RotateCcw size={18} /> Reset
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm font-medium">Speed:</span>
                  <select
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                    className="p-2 border rounded-lg text-sm"
                  >
                    <option value={2000}>Slow</option>
                    <option value={800}>Normal</option>
                    <option value={400}>Fast</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Step {steps.length > 0 ? currentStep + 1 : 0} of {steps.length}</span>
                  <span className="font-semibold">{steps[currentStep]?.type || 'Not Started'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        {tab === 'visualizer' && renderVisualizer()}
        {tab === 'theory' && <div className="mt-6"><TheorySection /></div>}
        {tab === 'pseudocode' && <div className="mt-6"><PseudocodeSection /></div>}

        {/* Step Information */}
        {tab === 'visualizer' && message && (
          <div className="bg-white/90 rounded-lg p-6 shadow-lg mt-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-2">Current Step:</h3>
            <p className="text-gray-700 text-lg">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Knapsack;