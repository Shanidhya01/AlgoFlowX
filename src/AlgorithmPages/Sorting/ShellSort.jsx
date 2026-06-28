import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateShellSortSteps(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  let gap = Math.floor(n / 2);

  steps.push({
    array: [...a],
    comparing: [],
    sorted: [],
    swapped: [],
    gap,
    message: `Starting Shell Sort with gap = ${gap}`,
  });

  while (gap > 0) {
    for (let i = gap; i < n; i++) {
      const temp = a[i];
      let j = i;

      steps.push({
        array: [...a],
        comparing: [i, i - gap],
        sorted: [],
        swapped: [],
        gap,
        message: `Gap=${gap}: Comparing a[${i}]=${a[i]} with a[${i - gap}]=${a[i - gap]}`,
      });

      while (j >= gap && a[j - gap] > temp) {
        a[j] = a[j - gap];
        steps.push({
          array: [...a],
          comparing: [],
          sorted: [],
          swapped: [j, j - gap],
          gap,
          message: `Gap=${gap}: Shifted a[${j - gap}]=${a[j - gap]} → position ${j}`,
        });
        j -= gap;
      }
      a[j] = temp;
    }

    gap = Math.floor(gap / 2);
    if (gap > 0) {
      steps.push({
        array: [...a],
        comparing: [],
        sorted: [],
        swapped: [],
        gap,
        message: `Gap reduced to ${gap}`,
      });
    }
  }

  steps.push({
    array: [...a],
    comparing: [],
    sorted: a.map((_, i) => i),
    swapped: [],
    gap: 0,
    message: '✅ Array sorted!',
    done: true,
  });

  return steps;
}

const theory = (
  <div>
    <TheorySection title="How Shell Sort Works">
      <p>Shell Sort is a generalization of Insertion Sort. Instead of comparing adjacent elements, it compares elements that are far apart (separated by a gap). The gap starts large and shrinks by half each pass, making the array progressively more sorted until gap=1, which is a final Insertion Sort pass.</p>
      <p>The key insight is that Insertion Sort is fast on nearly-sorted arrays. By doing wide-gap passes first, we bring elements close to their final position quickly, so the final pass does very little work.</p>
    </TheorySection>
    <TheorySection title="Gap Sequence">
      <p>The original Shell (1959) sequence: n/2, n/4, ..., 1. More optimal sequences (Hibbard, Knuth, Sedgewick) give better theoretical performance. The choice of gap sequence determines the algorithm's complexity.</p>
      <ul className="list-disc pl-4 space-y-1 mt-2">
        <li><strong>Shell:</strong> O(n²) worst case</li>
        <li><strong>Hibbard:</strong> O(n^1.5) worst case</li>
        <li><strong>Knuth:</strong> O(n^1.5) empirical</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Best', 'O(n log n)', 'O(1)'],
      ['Average', 'O(n log² n)', 'O(1)'],
      ['Worst', 'O(n²)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `void shellSort(int arr[], int n) {
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int temp = arr[i];
            int j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
        }
    }
}`,
    'Java': `static void shellSort(int[] arr) {
    int n = arr.length;
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int temp = arr[i];
            int j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
        }
    }
}`,
    'Python': `def shell_sort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2`,
    'JavaScript': `function shellSort(arr) {
    const n = arr.length;
    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        for (let i = gap; i < n; i++) {
            const temp = arr[i];
            let j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
        }
    }
}`,
  }} />
);

export default function ShellSort() {
  const randomArray = () => Array.from({ length: 14 }, () => Math.floor(Math.random() * 90) + 10);
  const [inputVal, setInputVal] = useState('');
  const [inputError, setInputError] = useState('');
  const [steps, setSteps] = useState(() => generateShellSortSteps(randomArray()));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleRandomize = useCallback(() => {
    const arr = randomArray();
    setInputVal(arr.join(', '));
    setSteps(generateShellSortSteps(arr));
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  const handleCustomInput = (val) => {
    setInputVal(val);
    const nums = val.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (nums.length < 2) { setInputError('Enter at least 2 numbers'); return; }
    if (nums.length > 20) { setInputError('Max 20 numbers'); return; }
    setInputError('');
    setSteps(generateShellSortSteps(nums));
    setCurrentStep(0);
    setIsRunning(false);
  };

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

  const maxVal = Math.max(...step.array, 1);
  const barColors = step.array.map((_, i) => {
    if (step.done || step.sorted?.includes(i)) return 'bg-emerald-400 dark:bg-emerald-500';
    if (step.swapped?.includes(i)) return 'bg-red-400 dark:bg-red-500';
    if (step.comparing?.includes(i)) return 'bg-amber-400 dark:bg-amber-500';
    return 'bg-blue-400 dark:bg-blue-500';
  });

  return (
    <AlgorithmPageShell
      title="Shell Sort"
      description="Gap-based insertion sort that progressively sorts elements at decreasing intervals"
      category="Sorting"
      difficulty="Medium"
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
      customInput={inputVal}
      onCustomInput={handleCustomInput}
      inputError={inputError}
      inputPlaceholder="e.g. 64, 34, 25, 12, 22"
      inputLabel="Array (comma-separated)"
      stats={{ gap: step.gap || 0, step: `${currentStep + 1}/${steps.length}` }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
    >
      <div className="flex items-end justify-center gap-1.5 h-52 px-2">
        {step.array.map((val, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{val}</span>
            <div
              className={`w-full rounded-t-lg transition-all duration-200 ${barColors[i]}`}
              style={{ height: `${(val / maxVal) * 160}px` }}
            />
            <span className="text-xs text-gray-400 dark:text-gray-500">{i}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-3 justify-center flex-wrap text-xs">
        {[['bg-blue-400', 'Unsorted'], ['bg-amber-400', 'Comparing'], ['bg-red-400', 'Shifting'], ['bg-emerald-400', 'Sorted']].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${c} inline-block`} />{l}
          </span>
        ))}
      </div>
    </AlgorithmPageShell>
  );
}
