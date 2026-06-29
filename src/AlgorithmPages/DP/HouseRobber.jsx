import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const DEFAULT_INPUT = [2, 7, 9, 3, 1, 6, 5];

function generateHouseRobberSteps(houses) {
  const steps = [];
  const n = houses.length;
  const dp = new Array(n).fill(0);
  const robbed = new Array(n).fill(false);

  if (n === 0) return steps;
  dp[0] = houses[0];

  steps.push({
    dp: [...dp], houses: [...houses], robbed: [...robbed], current: 0, phase: 'init',
    message: `House Robber: [${houses.join(', ')}]. dp[0]=${houses[0]} (rob first house).`
  });

  if (n > 1) {
    dp[1] = Math.max(houses[0], houses[1]);
    steps.push({
      dp: [...dp], houses: [...houses], robbed: [...robbed], current: 1, phase: 'base',
      message: `dp[1] = max(houses[0]=${houses[0]}, houses[1]=${houses[1]}) = ${dp[1]}`
    });
  }

  for (let i = 2; i < n; i++) {
    const opt1 = dp[i - 1]; // skip house i
    const opt2 = dp[i - 2] + houses[i]; // rob house i
    steps.push({
      dp: [...dp], houses: [...houses], robbed: [...robbed], current: i, phase: 'compare',
      message: `dp[${i}]: skip=${dp[i-1]} vs rob=dp[${i-2}]+houses[${i}]=${dp[i-2]}+${houses[i]}=${opt2}`
    });
    dp[i] = Math.max(opt1, opt2);
    steps.push({
      dp: [...dp], houses: [...houses], robbed: [...robbed], current: i, phase: 'update',
      message: `dp[${i}] = ${dp[i]} (${dp[i] === opt2 ? 'rob' : 'skip'} house ${i})`
    });
  }

  // Reconstruct which houses were robbed
  const robbedIdx = [];
  let i = n - 1;
  while (i >= 0) {
    if (i === 0 || dp[i] !== dp[i - 1]) {
      robbedIdx.push(i);
      robbed[i] = true;
      i -= 2;
    } else {
      i -= 1;
    }
  }

  steps.push({
    dp: [...dp], houses: [...houses], robbed: [...robbed], current: -1, phase: 'done',
    message: `Max money = ${dp[n - 1]}. Robbed houses at indices: [${robbedIdx.sort((a,b)=>a-b).join(', ')}]`,
    done: true
  });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="House Robber">
      <p>You cannot rob two adjacent houses. Find the maximum money you can rob without alerting the police.</p>
      <p>At each house i, you choose to rob it or skip it:</p>
      <p className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-xs">dp[i] = max(dp[i-1], dp[i-2] + houses[i])</p>
      <ul className="list-disc pl-4 space-y-1 mt-2">
        <li><code>dp[i-1]</code>: skip house i, carry max from i-1</li>
        <li><code>dp[i-2] + houses[i]</code>: rob house i, add to max from i-2</li>
      </ul>
    </TheorySection>
    <TheorySection title="Space Optimization">
      <p>Since dp[i] only depends on dp[i-1] and dp[i-2], we can reduce space to O(1) using two variables <code>prev2</code> and <code>prev1</code>.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Time', 'O(n)', 'O(n) or O(1)'],
      ['Space', 'O(n) DP / O(1) opt', 'O(1) optimized'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `int rob(vector<int>& nums) {
    int n = nums.size();
    if (n == 1) return nums[0];
    int prev2 = nums[0], prev1 = max(nums[0], nums[1]);
    for (int i = 2; i < n; i++) {
        int cur = max(prev1, prev2 + nums[i]);
        prev2 = prev1; prev1 = cur;
    }
    return prev1;
}`,
    'Python': `def rob(nums):
    if len(nums) == 1: return nums[0]
    prev2, prev1 = nums[0], max(nums[0], nums[1])
    for i in range(2, len(nums)):
        prev2, prev1 = prev1, max(prev1, prev2 + nums[i])
    return prev1`,
    'JavaScript': `function rob(nums) {
    const n = nums.length;
    if (n === 1) return nums[0];
    let prev2 = nums[0], prev1 = Math.max(nums[0], nums[1]);
    for (let i = 2; i < n; i++) {
        [prev2, prev1] = [prev1, Math.max(prev1, prev2 + nums[i])];
    }
    return prev1;
}`,
    'Java': `public int rob(int[] nums) {
    int n = nums.length;
    if (n == 1) return nums[0];
    int prev2 = nums[0], prev1 = Math.max(nums[0], nums[1]);
    for (int i = 2; i < n; i++) {
        int cur = Math.max(prev1, prev2 + nums[i]);
        prev2 = prev1; prev1 = cur;
    }
    return prev1;
}`,
  }} />
);

export default function HouseRobberPage() {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState('');
  const timerRef = useRef(null);

  const initSteps = useCallback((arr) => {
    const st = generateHouseRobberSteps(arr);
    setSteps(st); setCurrentStep(0); setIsRunning(false);
  }, []);

  useEffect(() => { initSteps(DEFAULT_INPUT); }, [initSteps]);

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
    const arr = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 15));
    initSteps(arr);
    setCustomInput(''); setInputError('');
  }, [initSteps]);

  const handleCustomInput = useCallback((val) => {
    setCustomInput(val);
    const arr = val.split(',').map(Number);
    if (arr.some(isNaN) || arr.length < 1 || arr.length > 10 || arr.some(v => v < 0)) {
      setInputError('Enter 1-10 non-negative comma-separated integers');
      return;
    }
    setInputError('');
    initSteps(arr);
  }, [initSteps]);

  const step = steps[currentStep] || {};
  const houses = step.houses || DEFAULT_INPUT;
  const dp = step.dp || new Array(houses.length).fill(0);
  const robbed = step.robbed || new Array(houses.length).fill(false);
  const maxVal = Math.max(...houses, 1);

  return (
    <AlgorithmPageShell
      title="House Robber"
      description="Rob non-adjacent houses to maximize money — classic 1D DP with O(1) space optimization"
      category="Dynamic Programming"
      difficulty="Easy"
      steps={steps} currentStep={currentStep} isRunning={isRunning}
      onPlay={() => setIsRunning(true)} onPause={() => setIsRunning(false)}
      onReset={() => { setIsRunning(false); setCurrentStep(0); }}
      onStepForward={() => setCurrentStep(p => Math.min(p + 1, steps.length - 1))}
      onStepBack={() => setCurrentStep(p => Math.max(p - 1, 0))}
      speed={speed} onSpeedChange={setSpeed} onRandomize={handleRandomize}
      customInput={customInput} onCustomInput={handleCustomInput} inputError={inputError}
      inputPlaceholder="2,7,9,3,1,6,5" inputLabel="House values" showInput={true}
      stats={{ n: houses.length, maxMoney: dp[houses.length - 1] || 0, robbedHouses: robbed.filter(Boolean).length }}
      message={step.message || ''} done={step.done || false}
      theory={theory} code={code}
      advantages={[
        'Linear O(n) time — very efficient',
        'Can be reduced to O(1) space with two variables',
        'Template for many "skip adjacent" DP problems',
      ]}
      disadvantages={[
        'Constraint of no adjacent houses may not fit all real scenarios',
        'Reconstruction requires O(n) dp array (cannot use O(1) space)',
        'House Robber II (circular) requires two separate passes',
      ]}
      applications={[
        'Maximum sum with no two adjacent elements',
        'Scheduling jobs with cooldown periods',
        'Resource allocation with constraints',
        'Stock trading with cooldown',
      ]}
      interviewTips={[
        'Space-optimize: use two variables prev2=dp[i-2], prev1=dp[i-1]',
        'House Robber II: circular array — solve twice (exclude first or last)',
        'House Robber III: on binary tree — use DFS with rob/skip states',
        'Recognize the pattern: dp[i] = max(dp[i-1], dp[i-2] + val[i])',
      ]}
      relatedAlgos={[
        { title: 'Coin Change', route: '/dp/coin-change' },
        { title: 'Partition Subset', route: '/dp/partition-subset' },
        { title: 'LIS', route: '/dp/lis' },
      ]}
      practiceProblems={[
        { name: 'House Robber', difficulty: 'Medium', url: 'https://leetcode.com/problems/house-robber/' },
        { name: 'House Robber II', difficulty: 'Medium', url: 'https://leetcode.com/problems/house-robber-ii/' },
        { name: 'House Robber III', difficulty: 'Medium', url: 'https://leetcode.com/problems/house-robber-iii/' },
      ]}
    >
      {/* Houses visualization */}
      <div className="flex gap-2 justify-center items-end mb-4">
        {houses.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            {/* House icon + value */}
            <div className={`w-12 h-12 rounded-xl border-2 flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 ${
              robbed[i] && step.done ? 'bg-yellow-100 dark:bg-yellow-900/60 border-yellow-400 text-yellow-700 dark:text-yellow-200 scale-110' :
              step.current === i ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-400 text-amber-700 dark:text-amber-200' :
              'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <span>{robbed[i] && step.done ? '🏚️' : '🏠'}</span>
              <span className="text-[10px]">${v}</span>
            </div>
            {/* DP value */}
            <div className={`w-10 h-7 rounded-lg border flex items-center justify-center text-xs font-mono font-bold transition-all duration-200 ${
              step.current === i ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-700 dark:text-amber-300' :
              dp[i] > 0 ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' :
              'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400'
            }`}>
              {dp[i]}
            </div>
            <span className="text-[9px] text-gray-400">[{i}]</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center text-xs text-gray-400 mb-2">
        <span><span className="text-yellow-500">🏚️</span> Robbed</span>
        <span><span className="text-gray-400">🏠</span> Skipped</span>
        <span className="text-indigo-500">dp[i] shown below</span>
      </div>

      {/* Result */}
      {step.done && (
        <div className="mt-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            Maximum loot: <span className="text-lg">${dp[houses.length - 1]}</span>
          </p>
        </div>
      )}
    </AlgorithmPageShell>
  );
}
