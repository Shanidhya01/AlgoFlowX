import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateExponentialSteps(arr, target) {
  const steps = [];
  const n = arr.length;

  steps.push({ array: arr, phase: 'doubling', probe: -1, lo: -1, hi: -1, found: -1, bound: 0, message: `Exponential Search for ${target}. Starting doubling phase...` });

  if (arr[0] === target) {
    steps.push({ array: arr, phase: 'found', probe: 0, lo: -1, hi: -1, found: 0, bound: 0, message: `✅ Found ${target} at index 0!`, done: true });
    return steps;
  }

  let bound = 1;
  while (bound < n && arr[bound] < target) {
    steps.push({ array: arr, phase: 'doubling', probe: bound, lo: -1, hi: -1, found: -1, bound, message: `arr[${bound}]=${arr[bound]} < ${target}. Double bound: ${bound} → ${bound * 2}` });
    bound *= 2;
  }

  const lo = Math.floor(bound / 2);
  const hi = Math.min(bound, n - 1);
  steps.push({ array: arr, phase: 'binary', probe: -1, lo, hi, found: -1, bound, message: `Range found! Binary search in [${lo}, ${hi}]` });

  let left = lo, right = hi;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    steps.push({ array: arr, phase: 'binary', probe: mid, lo: left, hi: right, found: -1, bound, message: `Binary: mid=${mid}, arr[${mid}]=${arr[mid]} vs ${target}` });
    if (arr[mid] === target) {
      steps.push({ array: arr, phase: 'found', probe: mid, lo: left, hi: right, found: mid, bound, message: `✅ Found ${target} at index ${mid}!`, done: true });
      return steps;
    } else if (arr[mid] < target) {
      left = mid + 1;
      steps.push({ array: arr, phase: 'binary', probe: -1, lo: left, hi: right, found: -1, bound, message: `arr[${mid}]=${arr[mid]} < ${target}. Move left to ${left}` });
    } else {
      right = mid - 1;
      steps.push({ array: arr, phase: 'binary', probe: -1, lo: left, hi: right, found: -1, bound, message: `arr[${mid}]=${arr[mid]} > ${target}. Move right to ${right}` });
    }
  }

  steps.push({ array: arr, phase: 'done', probe: -1, lo: -1, hi: -1, found: -1, bound, message: `❌ ${target} not found in array.`, done: true });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="How Exponential Search Works">
      <p>Exponential Search finds a range where the target element might be present, then performs binary search in that range. It starts with subarray of size 1 and exponentially increases the size until the element is found or exceeds the target.</p>
      <p>Phase 1 (Doubling): Start at index 1, double (1→2→4→8→16...) until arr[bound] ≥ target. Phase 2 (Binary): Binary search in [bound/2, bound].</p>
    </TheorySection>
    <TheorySection title="When to Use Exponential Search">
      <ul className="list-disc pl-4 space-y-1">
        <li>Sorted arrays of unbounded or infinite size</li>
        <li>Target is near the beginning of the array</li>
        <li>Better than binary search when range is unknown</li>
        <li>Useful for unbounded search problems</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Best', 'O(1)', 'O(1)'],
      ['Average', 'O(log n)', 'O(1)'],
      ['Worst', 'O(log n)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `int exponentialSearch(int arr[], int n, int target) {
    if (arr[0] == target) return 0;
    int bound = 1;
    while (bound < n && arr[bound] < target)
        bound *= 2;
    int lo = bound / 2, hi = min(bound, n - 1);
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
    'Python': `def exponential_search(arr, target):
    n = len(arr)
    if arr[0] == target:
        return 0
    bound = 1
    while bound < n and arr[bound] < target:
        bound *= 2
    lo, hi = bound // 2, min(bound, n - 1)
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
    'JavaScript': `function exponentialSearch(arr, target) {
    const n = arr.length;
    if (arr[0] === target) return 0;
    let bound = 1;
    while (bound < n && arr[bound] < target) bound *= 2;
    let lo = Math.floor(bound / 2), hi = Math.min(bound, n - 1);
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
    'Java': `public static int exponentialSearch(int[] arr, int target) {
    int n = arr.length;
    if (arr[0] == target) return 0;
    int bound = 1;
    while (bound < n && arr[bound] < target) bound *= 2;
    int lo = bound / 2, hi = Math.min(bound, n - 1);
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
  }} />
);

export default function ExponentialSearch() {
  const randomSortedArray = () => {
    const set = new Set();
    while (set.size < 16) set.add(Math.floor(Math.random() * 60) + 1);
    return [...set].sort((a, b) => a - b);
  };

  const [arr] = useState(randomSortedArray);
  const [targetVal, setTargetVal] = useState('');
  const [inputError, setInputError] = useState('');
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(700);
  const timerRef = useRef(null);

  const handleCustomInput = (val) => {
    setTargetVal(val);
    const n = parseInt(val.trim());
    if (isNaN(n)) { setInputError('Enter a valid number'); return; }
    setInputError('');
    setSteps(generateExponentialSteps(arr, n));
    setCurrentStep(0);
    setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const t = arr[Math.floor(Math.random() * arr.length)];
    setTargetVal(String(t));
    setSteps(generateExponentialSteps(arr, t));
    setCurrentStep(0);
    setIsRunning(false);
  }, [arr]);

  useEffect(() => { handleRandomize(); }, [handleRandomize]);

  const currentSteps = steps || [];
  const step = currentSteps[currentStep] || { array: arr, phase: '', probe: -1, lo: -1, hi: -1, found: -1, bound: 0, message: 'Enter a target to search.' };

  useEffect(() => {
    if (!isRunning) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= currentSteps.length - 1) { setIsRunning(false); return prev; }
        return prev + 1;
      });
    }, speed);
    return () => clearInterval(timerRef.current);
  }, [isRunning, speed, currentSteps.length]);

  return (
    <AlgorithmPageShell
      title="Exponential Search"
      description="Search sorted arrays by doubling the bound to find a range, then binary searching within it"
      category="Searching"
      difficulty="Medium"
      steps={currentSteps}
      currentStep={currentStep}
      isRunning={isRunning}
      onPlay={() => setIsRunning(true)}
      onPause={() => setIsRunning(false)}
      onReset={() => { setIsRunning(false); setCurrentStep(0); }}
      onStepForward={() => setCurrentStep(p => Math.min(p + 1, currentSteps.length - 1))}
      onStepBack={() => setCurrentStep(p => Math.max(p - 1, 0))}
      speed={speed}
      onSpeedChange={setSpeed}
      onRandomize={handleRandomize}
      customInput={targetVal}
      onCustomInput={handleCustomInput}
      inputError={inputError}
      inputPlaceholder="e.g. 23"
      inputLabel="Target value"
      stats={{ bound: step.bound, lo: step.lo >= 0 ? step.lo : '—', hi: step.hi >= 0 ? step.hi : '—', target: targetVal || '—' }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(log n) time complexity',
        'Works well for unbounded/infinite arrays',
        'Better than binary search when target is near the start',
        'Only forward traversal needed',
      ]}
      disadvantages={[
        'Requires sorted array',
        'Not better than binary search for bounded arrays',
        'Overhead of doubling phase',
      ]}
      applications={[
        'Searching in unbounded sorted lists',
        'Database index searching',
        'Finding range in sorted streams',
      ]}
      interviewTips={[
        'Key insight: doubling phase is O(log n), binary search phase is O(log n)',
        'If target is at index k, exponential search takes O(log k) — better than O(log n)',
        'Can be applied to unbounded arrays where binary search cannot',
        'Remember to handle arr[0] == target edge case',
      ]}
      relatedAlgos={[
        { title: 'Binary Search', route: '/searching/binary-search' },
        { title: 'Jump Search', route: '/searching/jump-search' },
        { title: 'Fibonacci Search', route: '/searching/fibonacci-search' },
      ]}
      practiceProblems={[
        { name: 'Search in Rotated Sorted Array', difficulty: 'Medium', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
        { name: 'Find First and Last Position', difficulty: 'Medium', url: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/' },
      ]}
    >
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
        Phase: <span className={`font-semibold ${step.phase === 'doubling' ? 'text-yellow-500' : step.phase === 'binary' ? 'text-blue-500' : 'text-emerald-500'}`}>
          {step.phase === 'doubling' ? 'Doubling' : step.phase === 'binary' ? 'Binary Search' : step.phase === 'found' ? 'Found!' : 'Done'}
        </span>
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {arr.map((v, i) => {
          const inRange = step.lo >= 0 && step.hi >= 0 && i >= step.lo && i <= step.hi;
          return (
            <div key={i} className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl font-bold text-sm border-2 transition-all duration-200 ${
              step.found === i ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 text-emerald-700 dark:text-emerald-300 scale-110' :
              step.probe === i ? 'bg-yellow-100 dark:bg-yellow-950/60 border-yellow-400 text-yellow-700 dark:text-yellow-300 scale-105' :
              inRange ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' :
              'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <span>{v}</span>
              <span className="text-[9px] text-gray-400 dark:text-gray-500">{i}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-4 justify-center flex-wrap text-xs">
        {[['bg-yellow-400', 'Probe'], ['bg-blue-300 dark:bg-blue-700', 'Search range'], ['bg-emerald-400', 'Found']].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${c} inline-block`} />{l}
          </span>
        ))}
      </div>
    </AlgorithmPageShell>
  );
}
