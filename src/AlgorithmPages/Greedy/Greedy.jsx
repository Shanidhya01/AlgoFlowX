import React, { useState, useEffect, useCallback } from 'react';
import { FaPlay, FaPause, FaUndo, FaStepForward, FaCoins, FaClock, FaWeight, FaBookOpen, FaCode, FaProjectDiagram } from 'react-icons/fa';

function Greedy() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('coinChange');
  const [tab, setTab] = useState('visualizer'); // visualizer | theory | pseudocode
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  // Coin Change Problem
  const [targetAmount, setTargetAmount] = useState(67);
  const [coinDenominations] = useState([25, 10, 5, 1]);
  const [selectedCoins, setSelectedCoins] = useState([]);

  // Activity Selection Problem
  const [activities] = useState([
    { id: 1, start: 1, end: 4, name: 'Activity A' },
    { id: 2, start: 3, end: 5, name: 'Activity B' },
    { id: 3, start: 0, end: 6, name: 'Activity C' },
    { id: 4, start: 5, end: 7, name: 'Activity D' },
    { id: 5, start: 8, end: 9, name: 'Activity E' },
    { id: 6, start: 5, end: 9, name: 'Activity F' }
  ]);
  const [selectedActivities, setSelectedActivities] = useState([]);

  // Fractional Knapsack Problem
  const [items] = useState([
    { id: 1, weight: 10, value: 60, name: 'Item A' },
    { id: 2, weight: 20, value: 100, name: 'Item B' },
    { id: 3, weight: 30, value: 120, name: 'Item C' }
  ]);
  const [knapsackCapacity] = useState(50);
  const [knapsackItems, setKnapsackItems] = useState([]);

  // Coin Change Algorithm
  const coinChangeAlgorithm = useCallback(() => {
    const steps = [];
    const coins = [];
    let remaining = targetAmount;
    
    steps.push({
      type: 'start',
      message: `Starting coin change for amount: ${targetAmount}`,
      remaining,
      coins: [...coins],
      currentCoin: null
    });

    for (let coin of coinDenominations) {
      while (remaining >= coin) {
        coins.push(coin);
        remaining -= coin;
        steps.push({
          type: 'select',
          message: `Selected coin: ${coin}, Remaining: ${remaining}`,
          remaining,
          coins: [...coins],
          currentCoin: coin
        });
      }
    }

    steps.push({
      type: 'complete',
      message: `Complete! Used ${coins.length} coins: ${coins.join(', ')}`,
      remaining,
      coins: [...coins],
      currentCoin: null
    });

    return { steps, result: coins };
  }, [targetAmount, coinDenominations]);

  // Activity Selection Algorithm
  const activitySelectionAlgorithm = useCallback(() => {
    const steps = [];
    const selected = [];
    const sortedActivities = [...activities].sort((a, b) => a.end - b.end);
    let lastEndTime = 0;

    steps.push({
      type: 'start',
      message: 'Starting activity selection (sorted by end time)',
      activities: sortedActivities,
      selected: [...selected],
      lastEndTime
    });

    for (let activity of sortedActivities) {
      if (activity.start >= lastEndTime) {
        selected.push(activity);
        lastEndTime = activity.end;
        steps.push({
          type: 'select',
          message: `Selected ${activity.name} (${activity.start}-${activity.end})`,
          activities: sortedActivities,
          selected: [...selected],
          lastEndTime,
          currentActivity: activity
        });
      } else {
        steps.push({
          type: 'reject',
          message: `Rejected ${activity.name} (conflicts with previous selection)`,
          activities: sortedActivities,
          selected: [...selected],
          lastEndTime,
          currentActivity: activity
        });
      }
    }

    steps.push({
      type: 'complete',
      message: `Complete! Selected ${selected.length} activities`,
      activities: sortedActivities,
      selected: [...selected],
      lastEndTime
    });

    return { steps, result: selected };
  }, [activities]);

  // Fractional Knapsack Algorithm
  const fractionalKnapsackAlgorithm = useCallback(() => {
    const steps = [];
    const knapsackItems = [];
    let remainingCapacity = knapsackCapacity;
    
    const itemsWithRatio = items.map(item => ({
      ...item,
      ratio: item.value / item.weight
    })).sort((a, b) => b.ratio - a.ratio);

    steps.push({
      type: 'start',
      message: `Starting fractional knapsack (capacity: ${knapsackCapacity})`,
      items: itemsWithRatio,
      knapsackItems: [...knapsackItems],
      remainingCapacity
    });

    for (let item of itemsWithRatio) {
      if (remainingCapacity >= item.weight) {
        // Take full item
        knapsackItems.push({ ...item, fraction: 1, takenWeight: item.weight });
        remainingCapacity -= item.weight;
        steps.push({
          type: 'select',
          message: `Took full ${item.name} (weight: ${item.weight}, value: ${item.value})`,
          items: itemsWithRatio,
          knapsackItems: [...knapsackItems],
          remainingCapacity,
          currentItem: item
        });
      } else if (remainingCapacity > 0) {
        // Take fractional item
        const fraction = remainingCapacity / item.weight;
        const value = item.value * fraction;
        knapsackItems.push({ 
          ...item, 
          fraction, 
          takenWeight: remainingCapacity,
          fractionalValue: value 
        });
        steps.push({
          type: 'partial',
          message: `Took ${(fraction * 100).toFixed(1)}% of ${item.name} (weight: ${remainingCapacity}, value: ${value.toFixed(1)})`,
          items: itemsWithRatio,
          knapsackItems: [...knapsackItems],
          remainingCapacity: 0,
          currentItem: item
        });
        remainingCapacity = 0;
      } else {
        steps.push({
          type: 'reject',
          message: `Knapsack full, cannot take ${item.name}`,
          items: itemsWithRatio,
          knapsackItems: [...knapsackItems],
          remainingCapacity,
          currentItem: item
        });
      }
    }

    const totalValue = knapsackItems.reduce((sum, item) => 
      sum + (item.fractionalValue || item.value), 0
    );

    steps.push({
      type: 'complete',
      message: `Complete! Total value: ${totalValue.toFixed(1)}`,
      items: itemsWithRatio,
      knapsackItems: [...knapsackItems],
      remainingCapacity,
      totalValue
    });

    return { steps, result: { items: knapsackItems, totalValue } };
  }, [items, knapsackCapacity]);

  const runAlgorithm = () => {
    let algorithmResult;
    
    switch (selectedAlgorithm) {
      case 'coinChange':
        algorithmResult = coinChangeAlgorithm();
        break;
      case 'activitySelection':
        algorithmResult = activitySelectionAlgorithm();
        break;
      case 'fractionalKnapsack':
        algorithmResult = fractionalKnapsackAlgorithm();
        break;
      default:
        return;
    }

    setSteps(algorithmResult.steps);
    setResult(algorithmResult.result);
    setCurrentStep(0);
  };

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  const resetAnimation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setSelectedCoins([]);
    setSelectedActivities([]);
    setKnapsackItems([]);
    runAlgorithm();
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  useEffect(() => {
    runAlgorithm();
  }, [selectedAlgorithm, coinChangeAlgorithm, activitySelectionAlgorithm, fractionalKnapsackAlgorithm]);

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
      switch (selectedAlgorithm) {
        case 'coinChange':
          setSelectedCoins(step.coins || []);
          break;
        case 'activitySelection':
          setSelectedActivities(step.selected || []);
          break;
        case 'fractionalKnapsack':
          setKnapsackItems(step.knapsackItems || []);
          break;
      }
    }
  }, [currentStep, steps, selectedAlgorithm]);

  const renderCoinChange = () => (
    <div className="space-y-6">
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaCoins className="text-yellow-500" />
          Coin Change Problem
        </h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Target Amount:</label>
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(parseInt(e.target.value) || 0)}
            className="w-full p-2 border rounded-lg"
            disabled={isRunning}
          />
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          {coinDenominations.map(coin => (
            <div
              key={coin}
              className={`text-center p-4 rounded-lg border-2 transition-all ${
                steps[currentStep]?.currentCoin === coin
                  ? 'border-green-500 bg-green-100 scale-110'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="text-2xl font-bold">{coin}</div>
              <div className="text-sm text-gray-600">cents</div>
              <div className="text-xs mt-1">
                Used: {selectedCoins.filter(c => c === coin).length} times
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Selected Coins:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedCoins.map((coin, index) => (
              <span
                key={index}
                className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm"
              >
                {coin}¢
              </span>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Total coins: {selectedCoins.length} | 
            Remaining: {steps[currentStep]?.remaining || targetAmount}¢
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivitySelection = () => (
    <div className="space-y-6">
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaClock className="text-blue-500" />
          Activity Selection Problem
        </h3>
        
        <div className="space-y-3">
          {activities.map(activity => {
            const isSelected = selectedActivities.some(a => a.id === activity.id);
            const isCurrent = steps[currentStep]?.currentActivity?.id === activity.id;
            
            return (
              <div
                key={activity.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCurrent
                    ? 'border-yellow-500 bg-yellow-100 scale-105'
                    : isSelected
                    ? 'border-green-500 bg-green-100'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">{activity.name}</span>
                    <span className="ml-2 text-gray-600">
                      ({activity.start} - {activity.end})
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    isSelected ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isSelected ? 'Selected' : 'Not Selected'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Timeline:</h4>
          <div className="relative h-12 bg-white rounded border">
            {selectedActivities.map(activity => (
              <div
                key={activity.id}
                className="absolute h-8 bg-green-400 rounded text-white text-xs flex items-center justify-center top-2"
                style={{
                  left: `${activity.start * 10}%`,
                  width: `${(activity.end - activity.start) * 10}%`
                }}
              >
                {activity.name}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(time => (
              <span key={time}>{time}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFractionalKnapsack = () => (
    <div className="space-y-6">
      <div className="bg-white/90 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaWeight className="text-purple-500" />
          Fractional Knapsack Problem
        </h3>
        
        <div className="mb-4 bg-gray-100 rounded-lg p-4">
          <div className="text-lg font-semibold">
            Knapsack Capacity: {knapsackCapacity} kg
          </div>
          <div className="text-sm text-gray-600">
            Remaining: {steps[currentStep]?.remainingCapacity || knapsackCapacity} kg
          </div>
        </div>

        <div className="space-y-3">
          {items.map(item => {
            const knapsackItem = knapsackItems.find(ki => ki.id === item.id);
            const isCurrent = steps[currentStep]?.currentItem?.id === item.id;
            const ratio = (item.value / item.weight).toFixed(2);
            
            return (
              <div
                key={item.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCurrent
                    ? 'border-yellow-500 bg-yellow-100 scale-105'
                    : knapsackItem
                    ? 'border-green-500 bg-green-100'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">{item.name}</span>
                    <div className="text-sm text-gray-600">
                      Weight: {item.weight}kg | Value: {item.value} | Ratio: {ratio}
                    </div>
                  </div>
                  <div>
                    {knapsackItem && (
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          {knapsackItem.fraction === 1 
                            ? 'Full item taken' 
                            : `${(knapsackItem.fraction * 100).toFixed(1)}% taken`
                          }
                        </div>
                        <div className="text-xs text-gray-600">
                          Weight: {knapsackItem.takenWeight}kg | 
                          Value: {(knapsackItem.fractionalValue || knapsackItem.value).toFixed(1)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {knapsackItem && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(knapsackItem.fraction || 0) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {result && selectedAlgorithm === 'fractionalKnapsack' && (
          <div className="mt-4 bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Knapsack Summary:</h4>
            <div className="text-lg font-bold text-green-600">
              Total Value: {result.totalValue?.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              Items: {result.items?.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // --- Theory & Pseudocode Sections ---
  const TheorySection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Theory
      </h2>

      {/* General Greedy Overview */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">What is a Greedy Algorithm?</h3>
        <p className="text-gray-700 mb-3">
          Greedy algorithms build a solution step by step by always choosing the option that looks best at the moment.
          They rely on two key properties: the <span className="font-semibold">greedy-choice property</span> (a global optimum can be
          reached by a series of locally optimal choices) and <span className="font-semibold">optimal substructure</span> (an optimal
          solution contains optimal solutions to subproblems).
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-semibold mb-2">When does Greedy work?</h4>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Greedy-choice property holds (exchange argument can prove it)</li>
              <li>Problem exhibits optimal substructure</li>
              <li>Constraints form a matroid or similar structure (often sufficient)</li>
              <li>Counterexamples exist when these properties fail (e.g., non-canonical coin systems)</li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-semibold mb-2">Complexities (high level)</h4>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Coin Change (greedy): O(C + K) time, O(K) space</li>
              <li>Activity Selection: O(n log n) time (sort) + O(n), O(1) space</li>
              <li>Fractional Knapsack: O(n log n) time (sort), O(1) space</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Algorithm-specific notes */}
      {selectedAlgorithm === 'coinChange' && (
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Coin Change (Greedy)</h3>
          <p className="text-gray-700">
            Works optimally for <span className="font-semibold">canonical coin systems</span> (like 1,5,10,25). May fail for others (e.g., [1,3,4] with amount 6).
          </p>
        </div>
      )}

      {selectedAlgorithm === 'activitySelection' && (
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Activity Selection</h3>
          <p className="text-gray-700">
            Greedy rule: pick the activity that finishes earliest, then the next compatible one. This maximizes the count of activities.
          </p>
        </div>
      )}

      {selectedAlgorithm === 'fractionalKnapsack' && (
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Fractional Knapsack</h3>
          <p className="text-gray-700">
            Greedy by value/weight ratio is optimal when fractions are allowed. For 0/1 knapsack, this greedy rule is not optimal.
          </p>
        </div>
      )}
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Pseudocode
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-semibold mb-2">Generic Greedy Template</h4>
          <pre className="bg-gray-900 text-gray-100 rounded-md p-3 overflow-auto text-sm"><code>{`
Greedy(A):
  S <- empty solution
  while not finished(A):
    c <- bestCandidate(A)
    if feasible(S, c):
      S <- S ∪ {c}
    mark c as considered
  return S`}</code></pre>
        </div>

        {selectedAlgorithm === 'coinChange' && (
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-semibold mb-2">Coin Change</h4>
            <pre className="bg-gray-900 text-gray-100 rounded-md p-3 overflow-auto text-sm"><code>{`
GreedyCoinChange(amount, coins sorted desc):
  result <- []
  for coin in coins:
    while amount >= coin:
      append(result, coin)
      amount <- amount - coin
  return result`}</code></pre>
          </div>
        )}

        {selectedAlgorithm === 'activitySelection' && (
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-semibold mb-2">Activity Selection</h4>
            <pre className="bg-gray-900 text-gray-100 rounded-md p-3 overflow-auto text-sm"><code>{`
ActivitySelection(activities):
  sort activities by end time ascending
  selected <- []
  lastEnd <- -inf
  for a in activities:
    if a.start >= lastEnd:
      append(selected, a)
      lastEnd <- a.end
  return selected`}</code></pre>
          </div>
        )}

        {selectedAlgorithm === 'fractionalKnapsack' && (
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-semibold mb-2">Fractional Knapsack</h4>
            <pre className="bg-gray-900 text-gray-100 rounded-md p-3 overflow-auto text-sm"><code>{`
FractionalKnapsack(items, capacity):
  for each item: item.ratio <- item.value / item.weight
  sort items by ratio descending
  value <- 0
  remaining <- capacity
  for item in items and remaining > 0:
    if item.weight <= remaining:
      take full item; remaining -= item.weight; value += item.value
    else:
      take fraction = remaining / item.weight
      value += item.value * fraction
      remaining <- 0
  return value`}</code></pre>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Greedy Algorithm Visualizer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore different greedy algorithms and see how they make locally optimal choices
            to find globally optimal solutions.
          </p>
        </div>

        {/* Top Tabs */}
        <div className="bg-white/80 rounded-lg p-3 shadow-lg mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setTab('visualizer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                tab === 'visualizer' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <FaProjectDiagram /> Visualizer
            </button>
            <button
              onClick={() => setTab('theory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                tab === 'theory' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <FaBookOpen /> Theory
            </button>
            <button
              onClick={() => setTab('pseudocode')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                tab === 'pseudocode' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <FaCode /> Pseudocode
            </button>
          </div>
        </div>

        {/* Algorithm Selection */}
        <div className="bg-white/80 rounded-lg p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Choose Algorithm:</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'coinChange', name: 'Coin Change', icon: FaCoins, color: 'yellow' },
              { id: 'activitySelection', name: 'Activity Selection', icon: FaClock, color: 'blue' },
              { id: 'fractionalKnapsack', name: 'Fractional Knapsack', icon: FaWeight, color: 'purple' }
            ].map(algo => (
              <button
                key={algo.id}
                onClick={() => setSelectedAlgorithm(algo.id)}
                className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  selectedAlgorithm === algo.id
                    ? `border-${algo.color}-500 bg-${algo.color}-100`
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <algo.icon className={`text-${algo.color}-500 text-xl`} />
                <span className="font-medium">{algo.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls (only for visualizer) */}
        {tab === 'visualizer' && (
        <div className="bg-white/80 rounded-lg p-6 shadow-lg mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={toggleAnimation}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {isRunning ? <FaPause /> : <FaPlay />}
              {isRunning ? 'Pause' : 'Play'}
            </button>
            
            <button
              onClick={stepForward}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              disabled={currentStep >= steps.length - 1}
            >
              <FaStepForward />
              Step
            </button>
            
            <button
              onClick={resetAnimation}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <FaUndo />
              Reset
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm">Speed:</span>
              <select
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                className="p-2 border rounded-lg"
              >
                <option value={2000}>Slow</option>
                <option value={1000}>Normal</option>
                <option value={500}>Fast</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{steps[currentStep]?.type || 'Not Started'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        )}

        {/* Main Content by Tab */}
        {tab === 'visualizer' && (
          <div className="space-y-6">
            {selectedAlgorithm === 'coinChange' && renderCoinChange()}
            {selectedAlgorithm === 'activitySelection' && renderActivitySelection()}
            {selectedAlgorithm === 'fractionalKnapsack' && renderFractionalKnapsack()}
          </div>
        )}

        {tab === 'theory' && (
          <div className="mt-6">
            <TheorySection />
          </div>
        )}

        {tab === 'pseudocode' && (
          <div className="mt-6">
            <PseudocodeSection />
          </div>
        )}

        {/* Step Information */}
        {tab === 'visualizer' && steps[currentStep] && (
          <div className="bg-white/90 rounded-lg p-6 shadow-lg mt-6">
            <h3 className="text-lg font-semibold mb-2">Current Step:</h3>
            <p className="text-gray-700">{steps[currentStep].message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Greedy;