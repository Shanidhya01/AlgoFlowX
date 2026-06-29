import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const DEFAULT_INPUT = [1, 5, 11, 5];

function generatePartitionSteps(nums) {
  const steps = [];
  const total = nums.reduce((a, b) => a + b, 0);

  if (total % 2 !== 0) {
    steps.push({
      dp: [true], nums, total, target: -1, phase: 'impossible', elem: -1, j: -1,
      message: `Sum = ${total} is odd → cannot partition into equal subsets.`,
      done: true
    });
    return steps;
  }

  const target = total / 2;
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;

  steps.push({
    dp: [...dp], nums, total, target, phase: 'init', elem: -1, j: -1,
    message: `Sum = ${total}, target = ${total/2}. dp[0]=true. Find if any subset sums to ${target}.`
  });

  for (let numIdx = 0; numIdx < nums.length; numIdx++) {
    const num = nums[numIdx];
    // Traverse right to left to avoid reusing same element
    for (let j = target; j >= num; j--) {
      steps.push({
        dp: [...dp], nums, total, target, phase: 'check', elem: numIdx, j,
        message: `elem=${num}: dp[${j}] |= dp[${j}-${num}]=dp[${j-num}]=${dp[j-num]}. Currently dp[${j}]=${dp[j]}`
      });
      if (!dp[j] && dp[j - num]) {
        dp[j] = true;
        steps.push({
          dp: [...dp], nums, total, target, phase: 'flip', elem: numIdx, j,
          message: `Flipped dp[${j}] = true (can reach ${j} using element ${num})`
        });
      }
    }
  }

  steps.push({
    dp: [...dp], nums, total, target, phase: 'done', elem: -1, j: -1,
    message: dp[target]
      ? `Yes! Can partition [${nums.join(', ')}] into two equal subsets (sum=${target} each).`
      : `No! Cannot partition [${nums.join(', ')}] into two equal subsets.`,
    done: true
  });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="Partition Equal Subset Sum">
      <p>Given an array, determine if it can be partitioned into two subsets with equal sum. This reduces to: "can any subset sum to total/2?"</p>
      <p>We use a 1D boolean DP array where <code>dp[j]</code> = true means we can form sum j using some subset:</p>
      <p className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-xs">dp[j] |= dp[j - num]  (for each num in array)</p>
      <p>Traverse j from target down to num to avoid reusing the same element (0/1 knapsack style).</p>
    </TheorySection>
    <TheorySection title="Key Observations">
      <ul className="list-disc pl-4 space-y-1">
        <li>If total is odd → impossible immediately</li>
        <li>If dp[target] = true → one subset has sum=target, the other also has sum=target</li>
        <li>Right-to-left traversal ensures each element used at most once</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Time', 'O(n × target)', 'O(target)'],
      ['Space', 'O(target)', 'O(target)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `bool canPartition(vector<int>& nums) {
    int total = accumulate(nums.begin(), nums.end(), 0);
    if (total % 2) return false;
    int target = total / 2;
    vector<bool> dp(target + 1, false);
    dp[0] = true;
    for (int num : nums)
        for (int j = target; j >= num; j--)
            dp[j] = dp[j] || dp[j - num];
    return dp[target];
}`,
    'Python': `def canPartition(nums):
    total = sum(nums)
    if total % 2: return False
    target = total // 2
    dp = [False] * (target + 1)
    dp[0] = True
    for num in nums:
        for j in range(target, num-1, -1):
            dp[j] = dp[j] or dp[j-num]
    return dp[target]`,
    'JavaScript': `function canPartition(nums) {
    const total = nums.reduce((a,b)=>a+b,0);
    if (total % 2) return false;
    const target = total >> 1;
    const dp = new Array(target+1).fill(false);
    dp[0] = true;
    for (const num of nums)
        for (let j = target; j >= num; j--)
            dp[j] = dp[j] || dp[j-num];
    return dp[target];
}`,
    'Java': `public boolean canPartition(int[] nums) {
    int total = Arrays.stream(nums).sum();
    if (total % 2 != 0) return false;
    int target = total / 2;
    boolean[] dp = new boolean[target + 1];
    dp[0] = true;
    for (int num : nums)
        for (int j = target; j >= num; j--)
            dp[j] = dp[j] || dp[j - num];
    return dp[target];
}`,
  }} />
);

export default function PartitionSubsetPage() {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState('');
  const timerRef = useRef(null);

  const initSteps = useCallback((arr) => {
    const st = generatePartitionSteps(arr);
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
    const n = 4 + Math.floor(Math.random() * 3);
    const arr = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 10));
    initSteps(arr);
    setCustomInput(''); setInputError('');
  }, [initSteps]);

  const handleCustomInput = useCallback((val) => {
    setCustomInput(val);
    const arr = val.split(',').map(Number);
    if (arr.some(isNaN) || arr.length < 2 || arr.length > 10 || arr.some(v => v < 1)) {
      setInputError('Enter 2-10 positive comma-separated integers');
      return;
    }
    setInputError('');
    initSteps(arr);
  }, [initSteps]);

  const step = steps[currentStep] || {};
  const nums = step.nums || DEFAULT_INPUT;
  const dp = step.dp || [true];
  const target = step.target || 0;
  const total = step.total || nums.reduce((a, b) => a + b, 0);

  return (
    <AlgorithmPageShell
      title="Partition Equal Subset Sum"
      description="Check if an array can be split into two equal-sum subsets — 0/1 knapsack DP"
      category="Dynamic Programming"
      difficulty="Medium"
      steps={steps} currentStep={currentStep} isRunning={isRunning}
      onPlay={() => setIsRunning(true)} onPause={() => setIsRunning(false)}
      onReset={() => { setIsRunning(false); setCurrentStep(0); }}
      onStepForward={() => setCurrentStep(p => Math.min(p + 1, steps.length - 1))}
      onStepBack={() => setCurrentStep(p => Math.max(p - 1, 0))}
      speed={speed} onSpeedChange={setSpeed} onRandomize={handleRandomize}
      customInput={customInput} onCustomInput={handleCustomInput} inputError={inputError}
      inputPlaceholder="1,5,11,5" inputLabel="Array values" showInput={true}
      stats={{ n: nums.length, sum: total, target: target > 0 ? target : 'N/A', canPartition: dp[target] ? 'Yes' : 'No' }}
      message={step.message || ''} done={step.done || false}
      theory={theory} code={code}
      advantages={[
        'O(n × target) — efficient for moderate sums',
        '1D dp array (space-optimized vs 2D knapsack)',
        'Right-to-left sweep naturally enforces 0/1 constraint',
      ]}
      disadvantages={[
        'Pseudopolynomial — exponential in input size bits',
        'Large sums require large dp arrays',
        'Only tells if partition exists, not which elements form it',
      ]}
      applications={[
        'Fair job scheduling across processors',
        'Load balancing between two servers',
        'Equal division of tasks or resources',
        'Financial portfolio balancing',
      ]}
      interviewTips={[
        'This is 0/1 Knapsack in disguise — target = sum/2, weight=value=each element',
        'Right-to-left traversal is the key to avoiding element reuse',
        'Early exit: if dp[target] becomes true, return immediately',
        'Subset sum count variant: use integers instead of booleans and add instead of OR',
      ]}
      relatedAlgos={[
        { title: 'Coin Change', route: '/dp/coin-change' },
        { title: 'Word Break', route: '/dp/word-break' },
        { title: 'Rod Cutting', route: '/dp/rod-cutting' },
      ]}
      practiceProblems={[
        { name: 'Partition Equal Subset Sum', difficulty: 'Medium', url: 'https://leetcode.com/problems/partition-equal-subset-sum/' },
        { name: 'Target Sum', difficulty: 'Medium', url: 'https://leetcode.com/problems/target-sum/' },
        { name: 'Last Stone Weight II', difficulty: 'Medium', url: 'https://leetcode.com/problems/last-stone-weight-ii/' },
      ]}
    >
      {/* Elements as cards */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {nums.map((v, i) => (
          <div key={i} className={`px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all duration-200 ${
            step.elem === i ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-400 text-amber-700 dark:text-amber-200 scale-110' :
            'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            {v}
          </div>
        ))}
        <div className="px-3 py-2 rounded-xl border-2 text-sm font-bold bg-violet-100 dark:bg-violet-900/40 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300">
          target={target}
        </div>
      </div>

      {/* Boolean DP array */}
      <p className="text-xs text-gray-400 mb-2 text-center">dp[j] = can we form sum j?</p>
      <div className="flex flex-wrap gap-1 justify-center">
        {dp.map((val, j) => (
          <div key={j} className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all duration-200 ${
              j === target ? (val ? 'bg-emerald-200 dark:bg-emerald-800 border-emerald-500 text-emerald-800 dark:text-emerald-100 scale-110' : 'bg-violet-100 dark:bg-violet-900/40 border-violet-400 text-violet-700 dark:text-violet-300') :
              step.j === j ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-400 text-amber-700 dark:text-amber-200 scale-110' :
              val ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' :
              'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
            }`}>
              {val ? 'T' : 'F'}
            </div>
            <span className="text-[8px] text-gray-400 mt-0.5">{j}</span>
          </div>
        ))}
      </div>

      {step.done && (
        <div className={`mt-4 p-3 rounded-xl border text-center text-sm font-bold ${
          dp[target]
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          {dp[target] ? `Can partition! Two subsets each with sum = ${target}` : `Cannot partition into equal subsets`}
        </div>
      )}
    </AlgorithmPageShell>
  );
}
