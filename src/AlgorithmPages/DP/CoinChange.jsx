import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const DEFAULT_COINS = [1, 2, 5];
const DEFAULT_AMOUNT = 11;

function generateCoinChangeSteps(coins, amount) {
  const steps = [];
  const dp = new Array(amount + 1).fill(Infinity);
  const from = new Array(amount + 1).fill(-1);
  dp[0] = 0;

  steps.push({
    dp: [...dp], from: [...from], phase: 'init', current: -1, coinTry: -1,
    message: `Initialize dp[0]=0, all others=∞. Find min coins for amount ${amount} using coins [${coins.join(', ')}].`
  });

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        steps.push({
          dp: [...dp], from: [...from], phase: 'compare', current: i, coinTry: coin,
          message: `dp[${i}]: try coin ${coin} → dp[${i - coin}] + 1 = ${dp[i - coin] === Infinity ? '∞' : dp[i - coin] + 1} vs current dp[${i}]=${dp[i] === Infinity ? '∞' : dp[i]}`
        });
        if (dp[i - coin] + 1 < dp[i]) {
          dp[i] = dp[i - coin] + 1;
          from[i] = coin;
          steps.push({
            dp: [...dp], from: [...from], phase: 'update', current: i, coinTry: coin,
            message: `Updated dp[${i}] = ${dp[i]} (using coin ${coin})`
          });
        }
      }
    }
  }

  // Reconstruct path
  const path = [];
  let rem = amount;
  while (rem > 0 && from[rem] !== -1) {
    path.push(from[rem]);
    rem -= from[rem];
  }

  steps.push({
    dp: [...dp], from: [...from], phase: 'done', current: -1, coinTry: -1, path,
    message: dp[amount] === Infinity
      ? `No solution: amount ${amount} cannot be formed with coins [${coins.join(', ')}].`
      : `Done! Min coins for ${amount} = ${dp[amount]}. Path: ${path.join(' + ')} = ${amount}`,
    done: true
  });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="How Coin Change Works">
      <p>Coin Change uses bottom-up Dynamic Programming. We maintain an array <code>dp[0..amount]</code> where <code>dp[i]</code> is the minimum number of coins needed to make amount <code>i</code>.</p>
      <p>For each amount <code>i</code>, we try every coin <code>c</code>. If <code>c ≤ i</code> and <code>dp[i-c] + 1 &lt; dp[i]</code>, we update <code>dp[i]</code>. The recurrence is:</p>
      <p className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-xs">dp[i] = min(dp[i - c] + 1) for each coin c ≤ i</p>
      <p>Base case: <code>dp[0] = 0</code> (zero coins needed to make amount 0).</p>
    </TheorySection>
    <TheorySection title="Key Insight">
      <ul className="list-disc pl-4 space-y-1">
        <li>The problem has optimal substructure — optimal solution for amount i uses optimal solution for amount i-c</li>
        <li>Overlapping subproblems make it suitable for DP</li>
        <li>Greedy fails for arbitrary coin sets (e.g., coins [1,3,4], amount 6)</li>
        <li>Reconstruction traces back through the <code>from[]</code> array</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Time', 'O(amount × coins)', 'O(amount)'],
      ['Space', 'O(amount)', 'O(amount)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, INT_MAX);
    dp[0] = 0;
    for (int i = 1; i <= amount; i++)
        for (int c : coins)
            if (c <= i && dp[i - c] != INT_MAX)
                dp[i] = min(dp[i], dp[i - c] + 1);
    return dp[amount] == INT_MAX ? -1 : dp[amount];
}`,
    'Python': `def coinChange(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for c in coins:
            if c <= i and dp[i - c] + 1 < dp[i]:
                dp[i] = dp[i - c] + 1
    return dp[amount] if dp[amount] != float('inf') else -1`,
    'JavaScript': `function coinChange(coins, amount) {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    for (let i = 1; i <= amount; i++)
        for (const c of coins)
            if (c <= i && dp[i - c] + 1 < dp[i])
                dp[i] = dp[i - c] + 1;
    return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    'Java': `public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, Integer.MAX_VALUE);
    dp[0] = 0;
    for (int i = 1; i <= amount; i++)
        for (int c : coins)
            if (c <= i && dp[i - c] != Integer.MAX_VALUE)
                dp[i] = Math.min(dp[i], dp[i - c] + 1);
    return dp[amount] == Integer.MAX_VALUE ? -1 : dp[amount];
}`,
  }} />
);

export default function CoinChangePage() {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState('');
  const timerRef = useRef(null);

  const initSteps = useCallback((coins, amount) => {
    const s = generateCoinChangeSteps(coins, amount);
    setSteps(s);
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  useEffect(() => { initSteps(DEFAULT_COINS, DEFAULT_AMOUNT); }, [initSteps]);

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
    const amount = 8 + Math.floor(Math.random() * 10);
    const allCoins = [1, 2, 3, 5, 7, 10];
    const coins = allCoins.slice(0, 2 + Math.floor(Math.random() * 3)).sort((a, b) => a - b);
    initSteps(coins, amount);
    setCustomInput('');
    setInputError('');
  }, [initSteps]);

  const handleCustomInput = useCallback((val) => {
    setCustomInput(val);
    // parse "coins; amount" e.g. "1,2,5; 11"
    const parts = val.split(';');
    if (parts.length !== 2) { setInputError('Format: coins (comma-sep); amount  e.g. 1,2,5;11'); return; }
    const coins = parts[0].split(',').map(Number).filter(n => n > 0 && Number.isInteger(n));
    const amount = parseInt(parts[1].trim(), 10);
    if (coins.length === 0 || isNaN(amount) || amount < 1 || amount > 30) {
      setInputError('Coins must be positive integers; amount 1-30');
      return;
    }
    setInputError('');
    initSteps(coins, amount);
  }, [initSteps]);

  const step = steps[currentStep] || {};
  const dp = step.dp || new Array(DEFAULT_AMOUNT + 1).fill(Infinity);
  const amount = dp.length - 1;

  return (
    <AlgorithmPageShell
      title="Coin Change"
      description="Find the minimum number of coins needed to reach a target amount — classic DP"
      category="Dynamic Programming"
      difficulty="Medium"
      steps={steps} currentStep={currentStep} isRunning={isRunning}
      onPlay={() => setIsRunning(true)} onPause={() => setIsRunning(false)}
      onReset={() => { setIsRunning(false); setCurrentStep(0); }}
      onStepForward={() => setCurrentStep(p => Math.min(p + 1, steps.length - 1))}
      onStepBack={() => setCurrentStep(p => Math.max(p - 1, 0))}
      speed={speed} onSpeedChange={setSpeed} onRandomize={handleRandomize}
      customInput={customInput} onCustomInput={handleCustomInput} inputError={inputError}
      inputPlaceholder="1,2,5;11" inputLabel="Coins; Amount" showInput={true}
      stats={{ amount, coins: DEFAULT_COINS.join(','), result: dp[amount] === Infinity ? '∞' : dp[amount] }}
      message={step.message || ''} done={step.done || false}
      theory={theory} code={code}
      advantages={[
        'Guaranteed optimal solution via exhaustive DP',
        'Works for any coin denomination set',
        'Bottom-up approach avoids recursion stack overhead',
      ]}
      disadvantages={[
        'O(amount × |coins|) time may be slow for large amounts',
        'Does not handle negative coin values',
        'Returns -1 (no solution) without explanation of unreachable amounts',
      ]}
      applications={[
        'ATM cash dispensing systems',
        'Vending machine change calculation',
        'Currency exchange optimization',
        'Resource allocation in budgeting',
      ]}
      interviewTips={[
        'Common mistake: greedy (always pick largest coin) fails for coin sets like [1,3,4]',
        'Coin Change 2 asks for number of ways — uses similar DP but += not min',
        'Initialization with Infinity (not 0) is critical; dp[0]=0 is the base case',
        'Time complexity: O(S·n) where S = amount, n = number of coins',
      ]}
      relatedAlgos={[
        { title: 'Knapsack 0/1', route: '/dp/knapsack' },
        { title: 'Partition Equal Subset', route: '/dp/partition-subset' },
        { title: 'Rod Cutting', route: '/dp/rod-cutting' },
      ]}
      practiceProblems={[
        { name: 'Coin Change', difficulty: 'Medium', url: 'https://leetcode.com/problems/coin-change/' },
        { name: 'Coin Change II', difficulty: 'Medium', url: 'https://leetcode.com/problems/coin-change-ii/' },
        { name: 'Perfect Squares', difficulty: 'Medium', url: 'https://leetcode.com/problems/perfect-squares/' },
      ]}
    >
      {/* DP array visualization */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 font-medium">
        dp[i] = minimum coins for amount i &nbsp;|&nbsp;
        <span className="text-amber-500">amber = computing</span> &nbsp;
        <span className="text-emerald-500">green = done</span>
      </p>
      <div className="flex flex-wrap gap-1.5 justify-center mb-4">
        {dp.map((v, i) => {
          const isCurrent = step.current === i;
          const isDone = step.done;
          const isPath = step.path && step.path.length > 0 && (() => {
            // highlight reconstructed amounts
            const pathAmounts = [];
            let rem = amount;
            if (step.from) {
              while (rem > 0 && step.from[rem] !== -1) {
                pathAmounts.push(rem);
                rem -= step.from[rem];
              }
              pathAmounts.push(0);
            }
            return pathAmounts.includes(i);
          })();
          return (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                isDone && isPath ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-400 text-emerald-700 dark:text-emerald-300 scale-110' :
                isCurrent ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-400 text-amber-700 dark:text-amber-300 scale-110' :
                v === Infinity ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400' :
                'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
              }`}>
                {v === Infinity ? '∞' : v}
              </div>
              <span className="text-[9px] text-gray-400 mt-0.5">{i}</span>
            </div>
          );
        })}
      </div>

      {/* Coin being tried */}
      {step.coinTry > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 justify-center mb-3">
          <span>Trying coin:</span>
          <span className="px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold border border-amber-300">{step.coinTry}</span>
          <span>for amount <span className="font-bold">{step.current}</span></span>
        </div>
      )}

      {/* Reconstruction path */}
      {step.done && step.path && step.path.length > 0 && (
        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Optimal coins used:</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {step.path.map((coin, i) => (
              <span key={i} className="px-3 py-1.5 rounded-xl bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold text-sm border border-emerald-300 dark:border-emerald-700">{coin}</span>
            ))}
          </div>
        </div>
      )}
    </AlgorithmPageShell>
  );
}
