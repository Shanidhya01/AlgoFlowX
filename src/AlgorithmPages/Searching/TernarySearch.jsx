import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateTernarySteps(arr, target) {
  const steps = [];
  const n = arr.length;

  steps.push({ array: arr, lo: 0, hi: n - 1, mid1: -1, mid2: -1, found: -1, message: `Ternary Search for ${target}. Initial range [0, ${n - 1}]` });

  let lo = 0, hi = n - 1;
  while (lo <= hi) {
    const mid1 = lo + Math.floor((hi - lo) / 3);
    const mid2 = hi - Math.floor((hi - lo) / 3);

    steps.push({ array: arr, lo, hi, mid1, mid2, found: -1, message: `Range [${lo}, ${hi}]. mid1=${mid1} (arr=${arr[mid1]}), mid2=${mid2} (arr=${arr[mid2]})` });

    if (arr[mid1] === target) {
      steps.push({ array: arr, lo, hi, mid1, mid2, found: mid1, message: `✅ Found ${target} at index ${mid1}!`, done: true });
      return steps;
    }
    if (arr[mid2] === target) {
      steps.push({ array: arr, lo, hi, mid1, mid2, found: mid2, message: `✅ Found ${target} at index ${mid2}!`, done: true });
      return steps;
    }

    if (target < arr[mid1]) {
      hi = mid1 - 1;
      steps.push({ array: arr, lo, hi, mid1: -1, mid2: -1, found: -1, message: `${target} < arr[mid1]=${arr[mid1]}. Search left third: [${lo}, ${hi}]` });
    } else if (target > arr[mid2]) {
      lo = mid2 + 1;
      steps.push({ array: arr, lo, hi, mid1: -1, mid2: -1, found: -1, message: `${target} > arr[mid2]=${arr[mid2]}. Search right third: [${lo}, ${hi}]` });
    } else {
      lo = mid1 + 1;
      hi = mid2 - 1;
      steps.push({ array: arr, lo, hi, mid1: -1, mid2: -1, found: -1, message: `${target} is in middle third: [${lo}, ${hi}]` });
    }
  }

  steps.push({ array: arr, lo: -1, hi: -1, mid1: -1, mid2: -1, found: -1, message: `❌ ${target} not found in array.`, done: true });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="How Ternary Search Works">
      <p>Ternary Search divides the search space into three equal parts using two midpoints: mid1 = lo + (hi-lo)/3 and mid2 = hi - (hi-lo)/3. Each iteration eliminates one third of the remaining search space.</p>
      <p>If target equals arr[mid1] or arr[mid2], we found it. Otherwise, we determine which third contains the target and recurse/iterate on that third only.</p>
    </TheorySection>
    <TheorySection title="Ternary vs Binary Search">
      <ul className="list-disc pl-4 space-y-1">
        <li>Both are O(log n) but ternary has a larger constant</li>
        <li>Ternary makes more comparisons per iteration (2 vs 1)</li>
        <li>Binary search is usually preferred in practice</li>
        <li>Ternary search shines for unimodal functions (finding peak)</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Best', 'O(1)', 'O(1)'],
      ['Average', 'O(log₃ n)', 'O(1)'],
      ['Worst', 'O(log₃ n)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `int ternarySearch(int arr[], int lo, int hi, int target) {
    while (lo <= hi) {
        int mid1 = lo + (hi - lo) / 3;
        int mid2 = hi - (hi - lo) / 3;
        if (arr[mid1] == target) return mid1;
        if (arr[mid2] == target) return mid2;
        if (target < arr[mid1]) hi = mid1 - 1;
        else if (target > arr[mid2]) lo = mid2 + 1;
        else { lo = mid1 + 1; hi = mid2 - 1; }
    }
    return -1;
}`,
    'Python': `def ternary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid1 = lo + (hi - lo) // 3
        mid2 = hi - (hi - lo) // 3
        if arr[mid1] == target: return mid1
        if arr[mid2] == target: return mid2
        if target < arr[mid1]: hi = mid1 - 1
        elif target > arr[mid2]: lo = mid2 + 1
        else: lo, hi = mid1 + 1, mid2 - 1
    return -1`,
    'JavaScript': `function ternarySearch(arr, target) {
    let lo = 0, hi = arr.length - 1;
    while (lo <= hi) {
        const mid1 = lo + Math.floor((hi - lo) / 3);
        const mid2 = hi - Math.floor((hi - lo) / 3);
        if (arr[mid1] === target) return mid1;
        if (arr[mid2] === target) return mid2;
        if (target < arr[mid1]) hi = mid1 - 1;
        else if (target > arr[mid2]) lo = mid2 + 1;
        else { lo = mid1 + 1; hi = mid2 - 1; }
    }
    return -1;
}`,
    'Java': `public static int ternarySearch(int[] arr, int target) {
    int lo = 0, hi = arr.length - 1;
    while (lo <= hi) {
        int mid1 = lo + (hi - lo) / 3;
        int mid2 = hi - (hi - lo) / 3;
        if (arr[mid1] == target) return mid1;
        if (arr[mid2] == target) return mid2;
        if (target < arr[mid1]) hi = mid1 - 1;
        else if (target > arr[mid2]) lo = mid2 + 1;
        else { lo = mid1 + 1; hi = mid2 - 1; }
    }
    return -1;
}`,
  }} />
);

export default function TernarySearch() {
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
    setSteps(generateTernarySteps(arr, n));
    setCurrentStep(0);
    setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const t = arr[Math.floor(Math.random() * arr.length)];
    setTargetVal(String(t));
    setSteps(generateTernarySteps(arr, t));
    setCurrentStep(0);
    setIsRunning(false);
  }, [arr]);

  useEffect(() => { handleRandomize(); }, [handleRandomize]);

  const currentSteps = steps || [];
  const step = currentSteps[currentStep] || { array: arr, lo: 0, hi: arr.length - 1, mid1: -1, mid2: -1, found: -1, message: 'Enter a target to search.' };

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
      title="Ternary Search"
      description="Divide sorted array into three equal parts and eliminate one third each iteration"
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
      stats={{ lo: step.lo >= 0 ? step.lo : '—', hi: step.hi >= 0 ? step.hi : '—', mid1: step.mid1 >= 0 ? step.mid1 : '—', mid2: step.mid2 >= 0 ? step.mid2 : '—' }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Eliminates one third per iteration',
        'Works on sorted arrays',
        'Useful for unimodal function optimization',
        'Simple recursive/iterative implementation',
      ]}
      disadvantages={[
        'More comparisons than binary search per step',
        'O(log₃ n) is still O(log n) but with a larger constant',
        'Requires sorted array',
        'Not commonly used in practice over binary search',
      ]}
      applications={[
        'Finding peak of unimodal function',
        'Competitive programming problems',
        'Optimization problems with convex/concave functions',
      ]}
      interviewTips={[
        'Ternary search on sorted arrays is less efficient than binary (2 comparisons vs 1 per step)',
        'Best use case is finding min/max of unimodal functions',
        'Time complexity: O(log₃ n) = O(log n / log 3)',
        'Remember: mid1 = lo + (hi-lo)/3, mid2 = hi - (hi-lo)/3',
      ]}
      relatedAlgos={[
        { title: 'Binary Search', route: '/searching/binary-search' },
        { title: 'Exponential Search', route: '/searching/exponential-search' },
        { title: 'Jump Search', route: '/searching/jump-search' },
      ]}
      practiceProblems={[
        { name: 'Find Peak Element', difficulty: 'Medium', url: 'https://leetcode.com/problems/find-peak-element/' },
        { name: 'Peak Index in a Mountain Array', difficulty: 'Medium', url: 'https://leetcode.com/problems/peak-index-in-a-mountain-array/' },
      ]}
    >
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Sorted array — three-way division per step:</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {arr.map((v, i) => {
          const inRange = step.lo >= 0 && step.hi >= 0 && i >= step.lo && i <= step.hi;
          return (
            <div key={i} className={`w-12 h-14 flex flex-col items-center justify-center rounded-xl font-bold text-sm border-2 transition-all duration-200 ${
              step.found === i ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 text-emerald-700 dark:text-emerald-300 scale-110' :
              step.mid1 === i ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-400 text-purple-700 dark:text-purple-300 scale-105' :
              step.mid2 === i ? 'bg-orange-100 dark:bg-orange-950/60 border-orange-400 text-orange-700 dark:text-orange-300 scale-105' :
              inRange ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' :
              'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600'
            }`}>
              <span>{v}</span>
              <span className="text-[9px] text-gray-400 dark:text-gray-500">{i}</span>
              {step.mid1 === i && <span className="text-[8px] font-normal text-purple-500">m1</span>}
              {step.mid2 === i && <span className="text-[8px] font-normal text-orange-500">m2</span>}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-4 justify-center flex-wrap text-xs">
        {[['bg-blue-300 dark:bg-blue-700', 'Active range'], ['bg-purple-400', 'mid1'], ['bg-orange-400', 'mid2'], ['bg-emerald-400', 'Found']].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${c} inline-block`} />{l}
          </span>
        ))}
      </div>
    </AlgorithmPageShell>
  );
}
