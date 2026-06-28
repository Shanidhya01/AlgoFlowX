import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateJumpSteps(arr, target) {
  const steps = [];
  const n = arr.length;
  const step = Math.floor(Math.sqrt(n));
  let prev = 0;
  let found = -1;

  steps.push({ array: arr, pointer: -1, block: [], found: -1, message: `Searching for ${target} in sorted array. Step size = √${n} ≈ ${step}` });

  let block = Math.min(step, n) - 1;
  while (block < n && arr[block] < target) {
    steps.push({ array: arr, pointer: block, block: Array.from({ length: block - prev + 1 }, (_, i) => prev + i), found: -1, message: `a[${block}]=${arr[block]} < ${target}, jump ahead...` });
    prev = block + 1;
    block += step;
    if (block >= n) block = n - 1;
  }

  steps.push({ array: arr, pointer: block, block: Array.from({ length: Math.min(block, n - 1) - prev + 1 }, (_, i) => prev + i), found: -1, message: `a[${Math.min(block, n - 1)}]=${arr[Math.min(block, n - 1)]} ≥ ${target}. Linear search in block [${prev}..${Math.min(block, n - 1)}]` });

  for (let i = prev; i <= Math.min(block, n - 1); i++) {
    if (arr[i] === target) {
      found = i;
      steps.push({ array: arr, pointer: i, block: [], found: i, message: `✅ Found ${target} at index ${i}!`, done: true });
      return steps;
    }
    steps.push({ array: arr, pointer: i, block: Array.from({ length: Math.min(block, n - 1) - i }, (_, k) => i + k + 1), found: -1, message: `a[${i}]=${arr[i]} ≠ ${target}, continue...` });
  }

  steps.push({ array: arr, pointer: -1, block: [], found: -1, message: `❌ ${target} not found in array.`, done: true });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="How Jump Search Works">
      <p>Jump Search works on sorted arrays by jumping ahead by √n steps at a time. Once a block is found where the target could exist (arr[block] ≥ target), it performs a linear search within that block.</p>
      <p>This gives O(√n) performance — better than linear O(n) but not as fast as binary O(log n). However, it accesses elements in increasing order, making it better for arrays stored on tape or block devices.</p>
    </TheorySection>
    <TheorySection title="When to Use Jump Search">
      <ul className="list-disc pl-4 space-y-1">
        <li>Sorted arrays where backward traversal is costly</li>
        <li>When elements are stored sequentially on external storage</li>
        <li>When binary search is not available (e.g., no random access)</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Best', 'O(1)', 'O(1)'],
      ['Average', 'O(√n)', 'O(1)'],
      ['Worst', 'O(√n)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `int jumpSearch(int arr[], int n, int target) {
    int step = sqrt(n);
    int prev = 0;
    while (arr[min(step, n) - 1] < target) {
        prev = step;
        step += sqrt(n);
        if (prev >= n) return -1;
    }
    while (arr[prev] < target) {
        prev++;
        if (prev == min(step, n)) return -1;
    }
    return (arr[prev] == target) ? prev : -1;
}`,
    'Python': `import math
def jump_search(arr, target):
    n = len(arr)
    step = int(math.sqrt(n))
    prev = 0
    while arr[min(step, n) - 1] < target:
        prev = step
        step += int(math.sqrt(n))
        if prev >= n:
            return -1
    while arr[prev] < target:
        prev += 1
        if prev == min(step, n):
            return -1
    return prev if arr[prev] == target else -1`,
    'JavaScript': `function jumpSearch(arr, target) {
    const n = arr.length;
    const step = Math.floor(Math.sqrt(n));
    let prev = 0, curr = step;
    while (curr < n && arr[curr] < target) {
        prev = curr;
        curr += step;
    }
    for (let i = prev; i <= Math.min(curr, n - 1); i++) {
        if (arr[i] === target) return i;
    }
    return -1;
}`,
  }} />
);

export default function JumpSearch() {
  const randomSortedArray = () => {
    const arr = Array.from({ length: 16 }, () => Math.floor(Math.random() * 40) + 1);
    return [...new Set(arr)].sort((a, b) => a - b).slice(0, 16);
  };

  const [arr] = useState(randomSortedArray);
  const [targetVal, setTargetVal] = useState('');
  const [inputError, setInputError] = useState('');
  const [steps, setSteps] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(700);
  const timerRef = useRef(null);

  const handleCustomInput = (val) => {
    setTargetVal(val);
    const n = parseInt(val.trim());
    if (isNaN(n)) { setInputError('Enter a valid number'); return; }
    setInputError('');
    setSteps(generateJumpSteps(arr, n));
    setCurrentStep(0);
    setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const t = arr[Math.floor(Math.random() * arr.length)];
    setTargetVal(String(t));
    setSteps(generateJumpSteps(arr, t));
    setCurrentStep(0);
    setIsRunning(false);
  }, [arr]);

  useEffect(() => { handleRandomize(); }, [handleRandomize]);

  const currentSteps = steps || [];
  const step = currentSteps[currentStep] || currentSteps[0] || { array: arr, pointer: -1, block: [], found: -1, message: 'Enter a target to search.' };

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
      title="Jump Search"
      description="Search sorted arrays by jumping √n steps then linear searching the identified block"
      category="Searching"
      difficulty="Easy"
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
      stats={{ target: targetVal || '—', found: step.found >= 0 ? `index ${step.found}` : '—' }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
    >
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Sorted array (read-only):</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {arr.map((v, i) => (
          <div key={i} className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl font-bold text-sm border-2 transition-all duration-200 ${
            step.found === i ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 text-emerald-700 dark:text-emerald-300 scale-110' :
            step.pointer === i ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-700 dark:text-amber-300 scale-105' :
            step.block?.includes(i) ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' :
            'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            <span>{v}</span>
            <span className="text-[9px] text-gray-400 dark:text-gray-500">{i}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-4 justify-center flex-wrap text-xs">
        {[['bg-amber-400', 'Jump pointer'], ['bg-blue-300 dark:bg-blue-700', 'Current block'], ['bg-emerald-400', 'Found']].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${c} inline-block`} />{l}
          </span>
        ))}
      </div>
    </AlgorithmPageShell>
  );
}
