import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateFibonacciSteps(arr, target) {
  const steps = [];
  const n = arr.length;

  // Build fibonacci numbers up to >= n
  let fibM2 = 0, fibM1 = 1, fibM = 1;
  while (fibM < n) {
    fibM2 = fibM1;
    fibM1 = fibM;
    fibM = fibM1 + fibM2;
  }

  steps.push({ array: arr, probe: -1, found: -1, offset: -1, fibM, fibM1, fibM2, message: `Fibonacci Search for ${target}. Starting with fibM=${fibM} (first Fibonacci ≥ n=${n})` });

  let offset = -1;

  while (fibM > 1) {
    const i = Math.min(offset + fibM2, n - 1);
    steps.push({ array: arr, probe: i, found: -1, offset, fibM, fibM1, fibM2, message: `Probe at index ${i} (offset=${offset}, fibM2=${fibM2}): arr[${i}]=${arr[i]} vs ${target}` });

    if (arr[i] < target) {
      fibM = fibM1;
      fibM1 = fibM2;
      fibM2 = fibM - fibM1;
      offset = i;
      steps.push({ array: arr, probe: -1, found: -1, offset, fibM, fibM1, fibM2, message: `arr[${i}]=${arr[i]} < ${target}. Move offset to ${i}, shrink to fibM=${fibM}` });
    } else if (arr[i] > target) {
      fibM = fibM2;
      fibM1 = fibM1 - fibM2;
      fibM2 = fibM - fibM1;
      steps.push({ array: arr, probe: -1, found: -1, offset, fibM, fibM1, fibM2, message: `arr[${i}]=${arr[i]} > ${target}. Shrink left to fibM=${fibM}` });
    } else {
      steps.push({ array: arr, probe: i, found: i, offset, fibM, fibM1, fibM2, message: `✅ Found ${target} at index ${i}!`, done: true });
      return steps;
    }
  }

  if (fibM1 && offset + 1 < n && arr[offset + 1] === target) {
    const idx = offset + 1;
    steps.push({ array: arr, probe: idx, found: idx, offset, fibM, fibM1, fibM2, message: `✅ Found ${target} at index ${idx}!`, done: true });
    return steps;
  }

  steps.push({ array: arr, probe: -1, found: -1, offset, fibM, fibM1, fibM2, message: `❌ ${target} not found in array.`, done: true });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="How Fibonacci Search Works">
      <p>Fibonacci Search uses Fibonacci numbers to divide the array. It finds the smallest Fibonacci number F(k) ≥ n, then uses F(k-2) as the probe distance from an offset. After each comparison, it eliminates roughly one-third of the remaining elements.</p>
      <p>Unlike binary search which divides by 2, Fibonacci search divides in Fibonacci ratios (≈ 0.618 and 0.382), which can be advantageous on systems where division is expensive (uses only addition/subtraction).</p>
    </TheorySection>
    <TheorySection title="Key Variables">
      <ul className="list-disc pl-4 space-y-1">
        <li><strong>fibM</strong>: Current Fibonacci number (search space size)</li>
        <li><strong>fibM1</strong>: F(k-1) — one smaller</li>
        <li><strong>fibM2</strong>: F(k-2) — two smaller (used as probe offset)</li>
        <li><strong>offset</strong>: Left boundary of remaining search space</li>
        <li>Probe index = min(offset + fibM2, n-1)</li>
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
    'C++': `int fibonacciSearch(int arr[], int n, int target) {
    int fibM2 = 0, fibM1 = 1, fibM = 1;
    while (fibM < n) {
        fibM2 = fibM1; fibM1 = fibM; fibM = fibM1 + fibM2;
    }
    int offset = -1;
    while (fibM > 1) {
        int i = min(offset + fibM2, n - 1);
        if (arr[i] < target) {
            fibM = fibM1; fibM1 = fibM2; fibM2 = fibM - fibM1;
            offset = i;
        } else if (arr[i] > target) {
            fibM = fibM2; fibM1 = fibM1 - fibM2; fibM2 = fibM - fibM1;
        } else return i;
    }
    if (fibM1 && arr[offset + 1] == target) return offset + 1;
    return -1;
}`,
    'Python': `def fibonacci_search(arr, target):
    n = len(arr)
    fibM2, fibM1, fibM = 0, 1, 1
    while fibM < n:
        fibM2, fibM1, fibM = fibM1, fibM, fibM1 + fibM
    offset = -1
    while fibM > 1:
        i = min(offset + fibM2, n - 1)
        if arr[i] < target:
            fibM, fibM1, fibM2 = fibM1, fibM2, fibM1 - fibM2
            offset = i
        elif arr[i] > target:
            fibM, fibM1, fibM2 = fibM2, fibM1 - fibM2, fibM - fibM1
        else:
            return i
    if fibM1 and arr[offset + 1] == target:
        return offset + 1
    return -1`,
    'JavaScript': `function fibonacciSearch(arr, target) {
    const n = arr.length;
    let fibM2 = 0, fibM1 = 1, fibM = 1;
    while (fibM < n) { [fibM2, fibM1, fibM] = [fibM1, fibM, fibM1 + fibM]; }
    let offset = -1;
    while (fibM > 1) {
        const i = Math.min(offset + fibM2, n - 1);
        if (arr[i] < target) {
            [fibM, fibM1, fibM2] = [fibM1, fibM2, fibM1 - fibM2];
            offset = i;
        } else if (arr[i] > target) {
            [fibM, fibM1, fibM2] = [fibM2, fibM1 - fibM2, fibM - fibM1];
        } else return i;
    }
    if (fibM1 && arr[offset + 1] === target) return offset + 1;
    return -1;
}`,
    'Java': `public static int fibonacciSearch(int[] arr, int target) {
    int n = arr.length;
    int fibM2 = 0, fibM1 = 1, fibM = 1;
    while (fibM < n) { int t = fibM; fibM = fibM1 + fibM2; fibM2 = fibM1; fibM1 = t; }
    int offset = -1;
    while (fibM > 1) {
        int i = Math.min(offset + fibM2, n - 1);
        if (arr[i] < target) { fibM = fibM1; fibM1 = fibM2; fibM2 = fibM - fibM1; offset = i; }
        else if (arr[i] > target) { fibM = fibM2; fibM1 -= fibM2; fibM2 = fibM - fibM1; }
        else return i;
    }
    if (fibM1 == 1 && arr[offset + 1] == target) return offset + 1;
    return -1;
}`,
  }} />
);

export default function FibonacciSearch() {
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
    setSteps(generateFibonacciSteps(arr, n));
    setCurrentStep(0);
    setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const t = arr[Math.floor(Math.random() * arr.length)];
    setTargetVal(String(t));
    setSteps(generateFibonacciSteps(arr, t));
    setCurrentStep(0);
    setIsRunning(false);
  }, [arr]);

  useEffect(() => { handleRandomize(); }, [handleRandomize]);

  const currentSteps = steps || [];
  const step = currentSteps[currentStep] || { array: arr, probe: -1, found: -1, offset: -1, fibM: 0, fibM1: 0, fibM2: 0, message: 'Enter a target to search.' };

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
      title="Fibonacci Search"
      description="Use Fibonacci numbers to probe sorted arrays — avoids division, only addition/subtraction"
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
      stats={{ fibM: step.fibM, fibM1: step.fibM1, probe: step.probe >= 0 ? step.probe : '—', offset: step.offset }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(log n) time complexity like binary search',
        'Uses only addition/subtraction (no division)',
        'Better cache performance due to smaller jumps',
        'Works well on systems where division is costly',
      ]}
      disadvantages={[
        'More complex implementation than binary search',
        'Requires sorted array',
        'Not significantly faster than binary search in practice',
        'Overhead of computing Fibonacci numbers',
      ]}
      applications={[
        'Systems where division is expensive',
        'Memory-mapped files and disk I/O optimization',
        'Classic algorithm education and interviews',
      ]}
      interviewTips={[
        'Key insight: probe at offset + fibM2, not the midpoint',
        'Fibonacci ratios approximate the golden ratio (≈ 0.618)',
        'Only uses +/- operations, making it hardware-friendly',
        'Time complexity O(log n) same as binary, different constant',
      ]}
      relatedAlgos={[
        { title: 'Binary Search', route: '/searching/binary-search' },
        { title: 'Exponential Search', route: '/searching/exponential-search' },
        { title: 'Jump Search', route: '/searching/jump-search' },
      ]}
      practiceProblems={[
        { name: 'Search a 2D Matrix', difficulty: 'Medium', url: 'https://leetcode.com/problems/search-a-2d-matrix/' },
        { name: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
      ]}
    >
      <div className="mb-3 flex gap-4 text-xs text-gray-500 dark:text-gray-400 justify-center flex-wrap">
        <span>fibM = <span className="font-bold text-indigo-500">{step.fibM}</span></span>
        <span>fibM1 = <span className="font-bold text-sky-500">{step.fibM1}</span></span>
        <span>fibM2 = <span className="font-bold text-teal-500">{step.fibM2}</span></span>
        <span>offset = <span className="font-bold text-gray-600 dark:text-gray-300">{step.offset}</span></span>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {arr.map((v, i) => {
          const isEliminated = step.offset >= 0 && i <= step.offset;
          return (
            <div key={i} className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl font-bold text-sm border-2 transition-all duration-200 ${
              step.found === i ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 text-emerald-700 dark:text-emerald-300 scale-110' :
              step.probe === i ? 'bg-yellow-100 dark:bg-yellow-950/60 border-yellow-400 text-yellow-700 dark:text-yellow-300 scale-105' :
              isEliminated ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 opacity-40' :
              'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <span>{v}</span>
              <span className="text-[9px] text-gray-400 dark:text-gray-500">{i}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-4 justify-center flex-wrap text-xs">
        {[['bg-yellow-400', 'Probe (fibM2 from offset)'], ['bg-gray-300 dark:bg-gray-600 opacity-50', 'Eliminated'], ['bg-emerald-400', 'Found']].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${c} inline-block`} />{l}
          </span>
        ))}
      </div>
    </AlgorithmPageShell>
  );
}
