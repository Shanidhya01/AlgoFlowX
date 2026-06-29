import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const DEFAULT_PRICES = [0, 1, 5, 8, 9, 10, 17, 17, 20];
const DEFAULT_LENGTH = 8;

function generateRodCuttingSteps(prices, n) {
  const steps = [];
  const dp = new Array(n + 1).fill(0);
  const cutChoice = new Array(n + 1).fill(0);

  steps.push({
    dp: [...dp], cutChoice: [...cutChoice], prices, n, phase: 'init', cur: -1, cut: -1,
    message: `Rod Cutting: maximize revenue for rod of length ${n}. Prices: [${prices.slice(1).join(', ')}]`
  });

  for (let i = 1; i <= n; i++) {
    for (let cut = 1; cut <= i; cut++) {
      const val = prices[cut] + dp[i - cut];
      steps.push({
        dp: [...dp], cutChoice: [...cutChoice], prices, n, phase: 'compare', cur: i, cut,
        message: `dp[${i}]: try cut=${cut} → price[${cut}]=${prices[cut]} + dp[${i-cut}]=${dp[i-cut]} = ${val} vs dp[${i}]=${dp[i]}`
      });
      if (val > dp[i]) {
        dp[i] = val;
        cutChoice[i] = cut;
        steps.push({
          dp: [...dp], cutChoice: [...cutChoice], prices, n, phase: 'update', cur: i, cut,
          message: `Updated dp[${i}] = ${dp[i]} (best cut so far: ${cut})`
        });
      }
    }
  }

  // Reconstruct cuts
  const cuts = [];
  let rem = n;
  while (rem > 0) {
    cuts.push(cutChoice[rem]);
    rem -= cutChoice[rem];
  }

  steps.push({
    dp: [...dp], cutChoice: [...cutChoice], prices, n, phase: 'done', cur: -1, cut: -1, cuts,
    message: `Max revenue for length ${n} = ${dp[n]}. Cuts: [${cuts.join(', ')}]`,
    done: true
  });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="Rod Cutting Problem">
      <p>Given a rod of length n and a price table where <code>price[i]</code> is the value of a piece of length i, find the maximum revenue obtainable by cutting the rod into pieces.</p>
      <p>Recurrence:</p>
      <p className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-xs">dp[i] = max(price[j] + dp[i-j]) for j = 1 to i</p>
      <p>This is equivalent to the unbounded knapsack problem — each piece length can be reused.</p>
    </TheorySection>
    <TheorySection title="Key Insight">
      <ul className="list-disc pl-4 space-y-1">
        <li>Cutting length j from rod of length i leaves a sub-rod of length i-j</li>
        <li>Each sub-rod is itself solved optimally (optimal substructure)</li>
        <li>Reconstruction: repeatedly apply <code>cutChoice[]</code> until rod is fully cut</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Time', 'O(n²)', 'O(n)'],
      ['Space', 'O(n)', 'O(n)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `int rodCutting(int price[], int n) {
    vector<int> dp(n + 1, 0);
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= i; j++)
            dp[i] = max(dp[i], price[j] + dp[i - j]);
    return dp[n];
}`,
    'Python': `def rod_cutting(price, n):
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        for j in range(1, i + 1):
            dp[i] = max(dp[i], price[j] + dp[i - j])
    return dp[n]`,
    'JavaScript': `function rodCutting(price, n) {
    const dp = new Array(n + 1).fill(0);
    for (let i = 1; i <= n; i++)
        for (let j = 1; j <= i; j++)
            dp[i] = Math.max(dp[i], price[j] + dp[i - j]);
    return dp[n];
}`,
    'Java': `public int rodCutting(int[] price, int n) {
    int[] dp = new int[n + 1];
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= i; j++)
            dp[i] = Math.max(dp[i], price[j] + dp[i - j]);
    return dp[n];
}`,
  }} />
);

export default function RodCuttingPage() {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState('');
  const timerRef = useRef(null);

  const initSteps = useCallback((prices, n) => {
    const st = generateRodCuttingSteps(prices, n);
    setSteps(st); setCurrentStep(0); setIsRunning(false);
  }, []);

  useEffect(() => { initSteps(DEFAULT_PRICES, DEFAULT_LENGTH); }, [initSteps]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) { setIsRunning(false); return prev; }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, speed, steps.length]);

  const handleRandomize = useCallback(() => {
    const n = 5 + Math.floor(Math.random() * 4);
    const prices = [0];
    for (let i = 1; i <= n; i++) prices.push(prices[i - 1] + 1 + Math.floor(Math.random() * 5));
    initSteps(prices, n);
    setCustomInput(''); setInputError('');
  }, [initSteps]);

  const step = steps[currentStep] || {};
  const dp = step.dp || new Array(DEFAULT_LENGTH + 1).fill(0);
  const prices = step.prices || DEFAULT_PRICES;
  const n = step.n || DEFAULT_LENGTH;
  const maxDp = Math.max(...dp.slice(1), 1);

  return (
    <AlgorithmPageShell
      title="Rod Cutting"
      description="Maximize revenue by cutting a rod into pieces — unbounded knapsack style DP"
      category="Dynamic Programming"
      difficulty="Medium"
      steps={steps} currentStep={currentStep} isRunning={isRunning}
      onPlay={() => setIsRunning(true)} onPause={() => setIsRunning(false)}
      onReset={() => { setIsRunning(false); setCurrentStep(0); }}
      onStepForward={() => setCurrentStep(p => Math.min(p + 1, steps.length - 1))}
      onStepBack={() => setCurrentStep(p => Math.max(p - 1, 0))}
      speed={speed} onSpeedChange={setSpeed} onRandomize={handleRandomize}
      customInput={customInput} onCustomInput={setCustomInput} inputError={inputError}
      inputPlaceholder="1,5,8,9,10;8" inputLabel="prices (1..n); length" showInput={false}
      stats={{ length: n, maxRevenue: dp[n], cuts: step.cuts ? step.cuts.join('+') : '-' }}
      message={step.message || ''} done={step.done || false}
      theory={theory} code={code}
      advantages={[
        'Optimal solution guaranteed for any price table',
        'Unbounded cutting — each length usable multiple times',
        'Clean recurrence identical to unbounded knapsack',
      ]}
      disadvantages={[
        'O(n²) time — grows with rod length',
        'Requires complete price table up to rod length',
        'Does not account for cutting costs or kerf loss',
      ]}
      applications={[
        'Lumber and metal stock cutting optimization',
        'Memory allocation chunking',
        'Network bandwidth segmentation',
        'Financial portfolio decomposition',
      ]}
      interviewTips={[
        'Rod Cutting = Unbounded Knapsack where weight == value index',
        'Compare with 0/1 Knapsack: here each length can be cut multiple times',
        'Reconstruction: follow cutChoice[] array until rod length = 0',
        'If cutting has a fixed cost k, change: dp[i] = max(price[j] + dp[i-j] - k)',
      ]}
      relatedAlgos={[
        { title: 'Coin Change', route: '/dp/coin-change' },
        { title: 'Knapsack 0/1', route: '/dp/knapsack' },
        { title: 'Partition Subset', route: '/dp/partition-subset' },
      ]}
      practiceProblems={[
        { name: 'Rod Cutting (GFG)', difficulty: 'Medium', url: '#' },
        { name: 'Integer Break', difficulty: 'Medium', url: 'https://leetcode.com/problems/integer-break/' },
        { name: 'Decode Ways', difficulty: 'Medium', url: 'https://leetcode.com/problems/decode-ways/' },
      ]}
    >
      {/* Price table */}
      <p className="text-xs text-gray-400 mb-3 font-medium">Prices for each length (1 to {n}):</p>
      <div className="flex gap-1.5 justify-center mb-4">
        {prices.slice(1).map((p, i) => (
          <div key={i} className={`flex flex-col items-center ${step.cut === i + 1 ? 'scale-110' : ''} transition-all duration-200`}>
            <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-sm font-bold ${
              step.cut === i + 1 ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-400 text-amber-700 dark:text-amber-200' :
              'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
            }`}>{p}</div>
            <span className="text-[9px] text-gray-400 mt-0.5">len {i + 1}</span>
          </div>
        ))}
      </div>

      {/* DP bar chart */}
      <p className="text-xs text-gray-400 mb-2 font-medium">dp[i] = max revenue for length i:</p>
      <div className="flex items-end gap-1.5 justify-center h-24 mb-1">
        {dp.slice(1).map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5 flex-1" style={{ maxWidth: 44 }}>
            <span className="text-[9px] font-mono text-gray-500">{v}</span>
            <div
              className={`w-full rounded-t-sm transition-all duration-300 ${
                step.done ? 'bg-emerald-400 dark:bg-emerald-500' :
                step.cur === i + 1 ? 'bg-amber-400 dark:bg-amber-500' :
                'bg-indigo-400 dark:bg-indigo-500'
              }`}
              style={{ height: `${Math.max(4, (v / maxDp) * 72)}px` }}
            />
            <span className="text-[9px] text-gray-400">{i + 1}</span>
          </div>
        ))}
      </div>

      {/* Cut reconstruction */}
      {step.done && step.cuts && step.cuts.length > 0 && (
        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Optimal cuts (lengths):</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {step.cuts.map((c, i) => (
              <React.Fragment key={i}>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold text-sm border border-emerald-300 dark:border-emerald-700">
                  len {c} (₹{prices[c]})
                </span>
                {i < step.cuts.length - 1 && <span className="text-gray-400 self-center">+</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </AlgorithmPageShell>
  );
}
