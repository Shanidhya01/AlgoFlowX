import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const COLORS = ['bg-blue-400', 'bg-violet-400', 'bg-pink-400', 'bg-amber-400', 'bg-emerald-400', 'bg-teal-400', 'bg-red-400', 'bg-orange-400'];
const BORDER_COLORS = ['border-blue-500', 'border-violet-500', 'border-pink-500', 'border-amber-500', 'border-emerald-500', 'border-teal-500', 'border-red-500', 'border-orange-500'];

function generateSteps(rawItems, capacity) {
  const steps = [];
  const items = rawItems.map((item, i) => ({ ...item, ratio: item.value / item.weight, id: i }))
    .sort((a, b) => b.ratio - a.ratio);

  steps.push({ items, taken: [], capacity, filled: 0, totalValue: 0, considering: -1, message: `Sorted ${items.length} items by value/weight ratio (descending). Capacity = ${capacity}.` });

  const taken = [];
  let filled = 0, totalValue = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    steps.push({ items, taken: [...taken], capacity, filled, totalValue, considering: i, message: `Considering item ${item.id + 1}: weight=${item.weight}, value=${item.value}, ratio=${item.ratio.toFixed(2)}. Remaining capacity: ${(capacity - filled).toFixed(1)}` });

    if (filled >= capacity) {
      steps.push({ items, taken: [...taken], capacity, filled, totalValue, considering: i, rejected: true, message: `Knapsack full! Skipping item ${item.id + 1}.` });
      continue;
    }

    const remaining = capacity - filled;
    if (item.weight <= remaining) {
      taken.push({ ...item, fraction: 1, takenWeight: item.weight, takenValue: item.value });
      filled += item.weight;
      totalValue += item.value;
      steps.push({ items, taken: [...taken], capacity, filled, totalValue, considering: i, full: true, message: `Took item ${item.id + 1} FULLY (${item.weight}/${item.weight}). Value gained: ${item.value}. Total: ${totalValue.toFixed(2)}` });
    } else {
      const fraction = remaining / item.weight;
      const gainedValue = fraction * item.value;
      taken.push({ ...item, fraction, takenWeight: remaining, takenValue: gainedValue });
      filled = capacity;
      totalValue += gainedValue;
      steps.push({ items, taken: [...taken], capacity, filled, totalValue, considering: i, partial: true, fraction, message: `Took item ${item.id + 1} PARTIALLY (${remaining.toFixed(1)}/${item.weight} = ${(fraction * 100).toFixed(0)}%). Value: ${gainedValue.toFixed(2)}` });
    }
  }

  steps.push({ items, taken: [...taken], capacity, filled, totalValue, considering: -1, done: true, message: `Done! Total value: ${totalValue.toFixed(2)} with ${filled.toFixed(1)}/${capacity} capacity used.` });
  return steps;
}

const DEFAULT_ITEMS = [
  { weight: 10, value: 60 },
  { weight: 20, value: 100 },
  { weight: 30, value: 120 },
];
const DEFAULT_CAPACITY = 50;

const theory = (
  <div>
    <TheorySection title="Greedy Strategy">
      <p>Unlike 0/1 Knapsack (which requires DP), the fractional version allows taking a fraction of an item. The greedy choice: always take the item with the highest value-per-unit-weight ratio first.</p>
      <p className="mt-2"><strong>Proof of optimality:</strong> If we had a better solution, we could swap the fraction of some lower-ratio item for a higher-ratio item, strictly improving value — contradiction.</p>
    </TheorySection>
    <TheorySection title="vs 0/1 Knapsack">
      <p>Fractional Knapsack: greedy O(n log n). Optimal because fractions are allowed.</p>
      <p>0/1 Knapsack: greedy fails (counterexample: items (10,60), (20,100), (30,120), cap=50 → greedy by ratio picks 60/10=6, 120/30=4, but optimal is 100+120=220 with 20+30). DP is required: O(nW).</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Sort by ratio', 'O(n log n)', 'O(1)'],
      ['Greedy fill', 'O(n)', 'O(n)'],
      ['Total', 'O(n log n)', 'O(n)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `double fractionalKnapsack(int W, vector<pair<int,int>>& items) {
    // items = {weight, value}
    sort(items.begin(), items.end(), [](auto& a, auto& b) {
        return (double)a.second/a.first > (double)b.second/b.first;
    });
    double total = 0;
    for (auto& [w, v] : items) {
        if (W <= 0) break;
        if (w <= W) { total += v; W -= w; }
        else { total += (double)v * W / w; W = 0; }
    }
    return total;
}`,
    'Python': `def fractional_knapsack(capacity, items):
    # items = [(weight, value), ...]
    items.sort(key=lambda x: x[1]/x[0], reverse=True)
    total = 0.0
    for weight, value in items:
        if capacity <= 0:
            break
        if weight <= capacity:
            total += value
            capacity -= weight
        else:
            total += value * capacity / weight
            capacity = 0
    return total`,
    'JavaScript': `function fractionalKnapsack(capacity, items) {
    // items = [{weight, value}]
    const sorted = [...items].sort((a, b) => b.value/b.weight - a.value/a.weight);
    let total = 0;
    for (const {weight, value} of sorted) {
        if (capacity <= 0) break;
        if (weight <= capacity) {
            total += value;
            capacity -= weight;
        } else {
            total += value * capacity / weight;
            capacity = 0;
        }
    }
    return total;
}`,
  }} />
);

export default function FractionalKnapsack() {
  const [steps, setSteps] = useState(() => generateSteps(DEFAULT_ITEMS, DEFAULT_CAPACITY));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(700);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleRandomize = useCallback(() => {
    const n = 3 + Math.floor(Math.random() * 3);
    const items = Array.from({ length: n }, () => ({
      weight: 5 + Math.floor(Math.random() * 25),
      value: 10 + Math.floor(Math.random() * 90),
    }));
    const cap = 30 + Math.floor(Math.random() * 30);
    setSteps(generateSteps(items, cap));
    setCurrentStep(0); setIsRunning(false);
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

  const { items, taken, capacity, filled, totalValue, considering } = step;
  const fillPct = capacity > 0 ? Math.min(100, (filled / capacity) * 100) : 0;

  return (
    <AlgorithmPageShell
      title="Fractional Knapsack"
      description="Greedily take items by value/weight ratio — O(n log n), provably optimal"
      category="Greedy"
      difficulty="Easy"
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
      stats={{ capacity: `${filled?.toFixed(1)}/${capacity}`, filled: `${fillPct.toFixed(0)}%`, totalValue: totalValue?.toFixed(2) || 0 }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={['Provably optimal for fractional case', 'Simple greedy O(n log n)', 'No DP table needed', 'Works with real-valued weights']}
      disadvantages={['Does NOT work for 0/1 knapsack', 'Fractions may not be practical (e.g., gold bars vs items)', 'Requires sorting first']}
      applications={['Resource allocation (CPU time, bandwidth)', 'Loading fractional cargo', 'Investment portfolio optimization', 'Task scheduling with partial completion']}
      interviewTips={['Greedy works here because fractions are allowed — always explain this', 'Know the counterexample where greedy fails for 0/1', 'Exchange argument proves optimality', 'Sort descending by value/weight']}
      relatedAlgos={['0/1 Knapsack (DP)', 'Activity Selection', 'Job Sequencing', 'Huffman Coding Tree']}
      practiceProblems={[
        { name: 'Fractional Knapsack Problem', difficulty: 'Easy' },
        { name: '0-1 Knapsack (contrast)', difficulty: 'Medium' },
        { name: 'Maximum Units on a Truck', difficulty: 'Easy' },
      ]}
    >
      <div className="space-y-5">
        {/* Capacity bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-gray-500 dark:text-gray-400 uppercase">Knapsack Capacity</span>
            <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{filled?.toFixed(1)}/{capacity} ({fillPct.toFixed(0)}%)</span>
          </div>
          <div className="h-8 rounded-xl bg-gray-200 dark:bg-gray-800 overflow-hidden border border-gray-300 dark:border-gray-700 relative">
            <div className="h-full flex transition-all duration-500">
              {taken?.map((t, idx) => (
                <div
                  key={idx}
                  className={`h-full flex items-center justify-center text-[9px] font-bold text-white transition-all duration-500 ${COLORS[t.id % COLORS.length]}`}
                  style={{ width: `${(t.takenWeight / capacity) * 100}%` }}
                  title={`Item ${t.id + 1}: ${t.fraction < 1 ? `${(t.fraction * 100).toFixed(0)}% of ` : ''}w=${t.weight}`}
                >
                  {t.fraction < 1 ? `${(t.fraction * 100).toFixed(0)}%` : `I${t.id + 1}`}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Items sorted by ratio */}
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Items (sorted by ratio)</p>
          <div className="space-y-2">
            {items?.map((item, idx) => {
              const isConsidering = idx === considering;
              const takenInfo = taken?.find(t => t.id === item.id);
              const isFullyTaken = takenInfo?.fraction === 1;
              const isPartiallyTaken = takenInfo && takenInfo.fraction < 1;
              return (
                <div key={item.id} className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  isConsidering ? `border-amber-400 bg-amber-50 dark:bg-amber-950/30 scale-[1.01]` :
                  isFullyTaken ? `${BORDER_COLORS[item.id % BORDER_COLORS.length]} bg-emerald-50 dark:bg-emerald-950/20` :
                  isPartiallyTaken ? `border-teal-400 bg-teal-50 dark:bg-teal-950/20` :
                  'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${COLORS[item.id % COLORS.length]}`}>
                      {item.id + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">w=<span className="font-bold text-gray-800 dark:text-gray-200">{item.weight}</span></span>
                        <span className="text-gray-600 dark:text-gray-400">v=<span className="font-bold text-gray-800 dark:text-gray-200">{item.value}</span></span>
                        <span className="text-violet-600 dark:text-violet-400 font-bold">ratio={item.ratio.toFixed(2)}</span>
                      </div>
                      {takenInfo && (
                        <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                          {isFullyTaken ? `✓ Fully taken (+${takenInfo.takenValue.toFixed(1)} value)` : `◑ ${(takenInfo.fraction * 100).toFixed(0)}% taken (+${takenInfo.takenValue.toFixed(1)} value)`}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-xs font-mono text-gray-500">
                      {isFullyTaken ? '✅' : isPartiallyTaken ? '◑' : isConsidering ? '👁' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total value */}
        <div className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Total Value</span>
          <span className="font-mono font-bold text-emerald-800 dark:text-emerald-200 text-lg">{totalValue?.toFixed(2)}</span>
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
