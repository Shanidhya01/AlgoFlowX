import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const DEFAULT_INPUT = [10, 9, 2, 5, 3, 7, 101, 18];

function generateLISSteps(arr) {
  const steps = [];
  const n = arr.length;
  const dp = new Array(n).fill(1);
  const parent = new Array(n).fill(-1);

  steps.push({
    arr: [...arr], dp: [...dp], parent: [...parent],
    i: -1, j: -1, phase: 'init', lisLen: 1,
    message: `Initialize dp[i]=1 for all i (LIS of length 1 ending at each element). Array: [${arr.join(', ')}]`
  });

  let maxLen = 1;
  let maxIdx = 0;

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      steps.push({
        arr: [...arr], dp: [...dp], parent: [...parent],
        i, j, phase: 'compare', lisLen: maxLen,
        message: `Compare arr[${j}]=${arr[j]} < arr[${i}]=${arr[i]}? ${arr[j] < arr[i] ? 'Yes' : 'No'}. dp[${j}]+1=${dp[j]+1} vs dp[${i}]=${dp[i]}`
      });
      if (arr[j] < arr[i] && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1;
        parent[i] = j;
        if (dp[i] > maxLen) { maxLen = dp[i]; maxIdx = i; }
        steps.push({
          arr: [...arr], dp: [...dp], parent: [...parent],
          i, j, phase: 'update', lisLen: maxLen,
          message: `Updated dp[${i}] = ${dp[i]} (extended LIS from index ${j})`
        });
      }
    }
  }

  // Reconstruct LIS
  const lis = [];
  let cur = maxIdx;
  while (cur !== -1) { lis.unshift(cur); cur = parent[cur]; }

  steps.push({
    arr: [...arr], dp: [...dp], parent: [...parent],
    i: -1, j: -1, phase: 'done', lisLen: maxLen, lisIndices: lis,
    message: `LIS length = ${maxLen}. Sequence: [${lis.map(idx => arr[idx]).join(', ')}]`,
    done: true
  });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="Longest Increasing Subsequence (O(n²) DP)">
      <p>LIS finds the longest subsequence of an array where elements are strictly increasing. A subsequence need not be contiguous.</p>
      <p>We define <code>dp[i]</code> = length of the longest increasing subsequence ending at index <code>i</code>. For each pair (j, i) where j &lt; i, if <code>arr[j] &lt; arr[i]</code>, then <code>dp[i] = max(dp[i], dp[j]+1)</code>.</p>
      <p className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-xs">dp[i] = 1 + max(dp[j]) for all j &lt; i where arr[j] &lt; arr[i]</p>
    </TheorySection>
    <TheorySection title="Optimization">
      <ul className="list-disc pl-4 space-y-1">
        <li>O(n²) DP is simple but can be improved to O(n log n) using binary search + patience sorting</li>
        <li>Parent tracking enables reconstruction of the actual subsequence</li>
        <li>The answer is max(dp[0..n-1])</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['DP (this)', 'O(n²)', 'O(n)'],
      ['Optimized', 'O(n log n)', 'O(n)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `int lengthOfLIS(vector<int>& nums) {
    int n = nums.size();
    vector<int> dp(n, 1);
    int maxLen = 1;
    for (int i = 1; i < n; i++)
        for (int j = 0; j < i; j++)
            if (nums[j] < nums[i])
                dp[i] = max(dp[i], dp[j] + 1);
    for (int x : dp) maxLen = max(maxLen, x);
    return maxLen;
}`,
    'Python': `def lengthOfLIS(nums):
    n = len(nums)
    dp = [1] * n
    for i in range(1, n):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`,
    'JavaScript': `function lengthOfLIS(nums) {
    const n = nums.length;
    const dp = new Array(n).fill(1);
    for (let i = 1; i < n; i++)
        for (let j = 0; j < i; j++)
            if (nums[j] < nums[i])
                dp[i] = Math.max(dp[i], dp[j] + 1);
    return Math.max(...dp);
}`,
    'Java': `public int lengthOfLIS(int[] nums) {
    int n = nums.length;
    int[] dp = new int[n];
    Arrays.fill(dp, 1);
    int max = 1;
    for (int i = 1; i < n; i++)
        for (int j = 0; j < i; j++)
            if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) {
                dp[i] = dp[j] + 1;
                max = Math.max(max, dp[i]);
            }
    return max;
}`,
  }} />
);

export default function LISPage() {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState('');
  const timerRef = useRef(null);

  const initSteps = useCallback((arr) => {
    const s = generateLISSteps(arr);
    setSteps(s); setCurrentStep(0); setIsRunning(false);
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
    const n = 6 + Math.floor(Math.random() * 4);
    const arr = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 20));
    initSteps(arr);
    setCustomInput(''); setInputError('');
  }, [initSteps]);

  const handleCustomInput = useCallback((val) => {
    setCustomInput(val);
    const arr = val.split(',').map(Number);
    if (arr.some(isNaN) || arr.length < 2 || arr.length > 12) {
      setInputError('Enter 2-12 comma-separated numbers');
      return;
    }
    setInputError('');
    initSteps(arr);
  }, [initSteps]);

  const step = steps[currentStep] || {};
  const arr = step.arr || DEFAULT_INPUT;
  const dp = step.dp || new Array(arr.length).fill(1);
  const lisIndices = step.lisIndices || [];

  return (
    <AlgorithmPageShell
      title="Longest Increasing Subsequence"
      description="Find the longest strictly increasing subsequence using O(n²) dynamic programming"
      category="Dynamic Programming"
      difficulty="Medium"
      steps={steps} currentStep={currentStep} isRunning={isRunning}
      onPlay={() => setIsRunning(true)} onPause={() => setIsRunning(false)}
      onReset={() => { setIsRunning(false); setCurrentStep(0); }}
      onStepForward={() => setCurrentStep(p => Math.min(p + 1, steps.length - 1))}
      onStepBack={() => setCurrentStep(p => Math.max(p - 1, 0))}
      speed={speed} onSpeedChange={setSpeed} onRandomize={handleRandomize}
      customInput={customInput} onCustomInput={handleCustomInput} inputError={inputError}
      inputPlaceholder="10,9,2,5,3,7,101,18" inputLabel="Array (comma-sep)" showInput={true}
      stats={{ n: arr.length, lis: step.lisLen || 1, current: step.i >= 0 ? `dp[${step.i}]` : '-' }}
      message={step.message || ''} done={step.done || false}
      theory={theory} code={code}
      advantages={[
        'Simple O(n²) approach easy to understand and implement',
        'Enables full subsequence reconstruction via parent array',
        'Works for any comparable data type',
      ]}
      disadvantages={[
        'O(n²) is slow for large arrays; O(n log n) alternative preferred',
        'Only finds one LIS (multiple may exist with same length)',
        'Strictly increasing — does not handle non-decreasing variant directly',
      ]}
      applications={[
        'Longest chain of compatible activities',
        'Stock price trend analysis',
        'Patience sorting card game',
        'Bioinformatics sequence alignment',
      ]}
      interviewTips={[
        'LIS length = length of shortest stack decomposition (patience sorting)',
        'O(n log n) uses binary search: tails[] array, bisect_left',
        'For non-decreasing variant, change < to <=',
        'Number of LIS is a harder variant — uses additional count[] array',
      ]}
      relatedAlgos={[
        { title: 'LCS', route: '/dp/lcs' },
        { title: 'Longest Palindromic Subsequence', route: '/dp/longest-palindromic-subsequence' },
        { title: 'Edit Distance', route: '/dp/edit-distance' },
      ]}
      practiceProblems={[
        { name: 'Longest Increasing Subsequence', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
        { name: 'Number of Longest Increasing Subsequence', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-longest-increasing-subsequence/' },
        { name: 'Russian Doll Envelopes', difficulty: 'Hard', url: 'https://leetcode.com/problems/russian-doll-envelopes/' },
      ]}
    >
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        <span className="text-amber-500 font-semibold">amber border</span> = i (outer),&nbsp;
        <span className="text-sky-500 font-semibold">sky border</span> = j (inner),&nbsp;
        <span className="text-emerald-500 font-semibold">green</span> = LIS element
      </p>

      {/* Array elements with dp bars below */}
      <div className="flex justify-center gap-3 items-end mb-2">
        {arr.map((v, idx) => {
          const isI = step.i === idx;
          const isJ = step.j === idx;
          const isLIS = lisIndices.includes(idx);
          const barH = dp[idx] ? dp[idx] * 18 : 18;
          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              {/* Value box */}
              <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                isLIS && step.done ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-400 text-emerald-700 dark:text-emerald-200 scale-110' :
                isI ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-400 text-amber-700 dark:text-amber-200' :
                isJ ? 'bg-sky-100 dark:bg-sky-900/50 border-sky-400 text-sky-700 dark:text-sky-200' :
                'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {v}
              </div>
              {/* DP bar */}
              <div
                className={`w-6 rounded-t-sm transition-all duration-300 ${
                  isLIS && step.done ? 'bg-emerald-400 dark:bg-emerald-500' :
                  isI ? 'bg-amber-400 dark:bg-amber-500' :
                  'bg-indigo-300 dark:bg-indigo-600'
                }`}
                style={{ height: `${barH}px` }}
              />
              <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">{dp[idx]}</span>
              <span className="text-[9px] text-gray-400">[{idx}]</span>
            </div>
          );
        })}
      </div>

      {/* LIS result */}
      {step.done && lisIndices.length > 0 && (
        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Longest Increasing Subsequence:</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {lisIndices.map((idx, i) => (
              <span key={i} className="px-3 py-1.5 rounded-xl bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold text-sm border border-emerald-300 dark:border-emerald-700">{arr[idx]}</span>
            ))}
          </div>
        </div>
      )}
    </AlgorithmPageShell>
  );
}
