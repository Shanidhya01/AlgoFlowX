import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateIntroSortSteps(inputArr) {
  const arr = [...inputArr];
  const steps = [];
  const n = arr.length;
  const maxDepth = Math.floor(2 * Math.log2(n));
  let comparisons = 0;

  steps.push({ array: [...arr], active: [0, n - 1], comparing: [], algorithm: 'QuickSort', depth: 0, maxDepth, comparisons, message: `Intro Sort: n=${n}, maxDepth=${maxDepth}. Starting with QuickSort.` });

  function heapify(a, n, i, offset, depth) {
    let largest = i, l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && a[offset + l] > a[offset + largest]) largest = l;
    if (r < n && a[offset + r] > a[offset + largest]) largest = r;
    if (largest !== i) {
      [a[offset + i], a[offset + largest]] = [a[offset + largest], a[offset + i]];
      comparisons++;
      steps.push({ array: [...a], active: [offset, offset + n - 1], comparing: [offset + i, offset + largest], algorithm: 'HeapSort', depth, maxDepth, comparisons, message: `HeapSort: heapify swap at ${offset + i} ↔ ${offset + largest}` });
      heapify(a, n, largest, offset, depth);
    }
  }

  function heapSort(a, lo, hi, depth) {
    const size = hi - lo + 1;
    for (let i = Math.floor(size / 2) - 1; i >= 0; i--) heapify(a, size, i, lo, depth);
    for (let i = size - 1; i > 0; i--) {
      [a[lo], a[lo + i]] = [a[lo + i], a[lo]];
      comparisons++;
      steps.push({ array: [...a], active: [lo, hi], comparing: [lo, lo + i], algorithm: 'HeapSort', depth, maxDepth, comparisons, message: `HeapSort: extract max ${a[lo + i]} to position ${lo + i}` });
      heapify(a, i, 0, lo, depth);
    }
  }

  function insertionSort(a, lo, hi, depth) {
    for (let i = lo + 1; i <= hi; i++) {
      const key = a[i];
      let j = i - 1;
      while (j >= lo && a[j] > key) {
        a[j + 1] = a[j];
        comparisons++;
        steps.push({ array: [...a], active: [lo, hi], comparing: [j, j + 1], algorithm: 'InsertionSort', depth, maxDepth, comparisons, message: `InsertionSort (size≤16): shifting ${a[j + 1]} at [${j + 1}]` });
        j--;
      }
      a[j + 1] = key;
    }
  }

  function partition(a, lo, hi, depth) {
    const pivot = a[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      comparisons++;
      if (a[j] <= pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        steps.push({ array: [...a], active: [lo, hi], comparing: [i, j], algorithm: 'QuickSort', depth, maxDepth, comparisons, message: `QuickSort: pivot=${pivot}, swap arr[${i}]=${a[i]} ↔ arr[${j}]=${a[j]}` });
      } else {
        steps.push({ array: [...a], active: [lo, hi], comparing: [i + 1, j], algorithm: 'QuickSort', depth, maxDepth, comparisons, message: `QuickSort: pivot=${pivot}, arr[${j}]=${a[j]} > pivot, no swap` });
      }
    }
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    steps.push({ array: [...a], active: [lo, hi], comparing: [i + 1, hi], algorithm: 'QuickSort', depth, maxDepth, comparisons, message: `QuickSort: pivot=${pivot} placed at index ${i + 1}` });
    return i + 1;
  }

  function introSortHelper(a, lo, hi, depth) {
    const size = hi - lo + 1;
    if (size <= 1) return;

    if (size <= 16) {
      steps.push({ array: [...a], active: [lo, hi], comparing: [], algorithm: 'InsertionSort', depth, maxDepth, comparisons, message: `Size=${size} ≤ 16 → switch to InsertionSort for [${lo}, ${hi}]` });
      insertionSort(a, lo, hi, depth);
      return;
    }

    if (depth > maxDepth) {
      steps.push({ array: [...a], active: [lo, hi], comparing: [], algorithm: 'HeapSort', depth, maxDepth, comparisons, message: `Depth=${depth} > maxDepth=${maxDepth} → switch to HeapSort for [${lo}, ${hi}]` });
      heapSort(a, lo, hi, depth);
      return;
    }

    steps.push({ array: [...a], active: [lo, hi], comparing: [], algorithm: 'QuickSort', depth, maxDepth, comparisons, message: `QuickSort partition [${lo}, ${hi}] at depth ${depth}` });
    const p = partition(a, lo, hi, depth);
    introSortHelper(a, lo, p - 1, depth + 1);
    introSortHelper(a, p + 1, hi, depth + 1);
  }

  introSortHelper(arr, 0, n - 1, 0);
  steps.push({ array: [...arr], active: [0, n - 1], comparing: [], algorithm: 'Done', depth: 0, maxDepth, comparisons, message: `✅ Intro Sort Complete! Comparisons: ${comparisons}. Hybrid approach ensured O(n log n) in all cases.`, done: true });
  return steps;
}

const ALG_COLORS = {
  QuickSort: 'bg-violet-500 dark:bg-violet-400 text-white',
  HeapSort: 'bg-red-500 dark:bg-red-400 text-white',
  InsertionSort: 'bg-amber-500 dark:bg-amber-400 text-white',
  Done: 'bg-emerald-500 dark:bg-emerald-400 text-white',
};

const BAR_COLORS = {
  QuickSort: 'bg-violet-400 dark:bg-violet-500',
  HeapSort: 'bg-red-400 dark:bg-red-500',
  InsertionSort: 'bg-amber-400 dark:bg-amber-500',
  Done: 'bg-emerald-400 dark:bg-emerald-500',
};

const theory = (
  <div>
    <TheorySection title="How Intro Sort Works">
      <p>Intro Sort (Introspective Sort) is a hybrid algorithm that starts with QuickSort but switches to HeapSort when the recursion depth exceeds 2·log₂(n), and to Insertion Sort for small subarrays (size ≤ 16).</p>
      <p>This combines QuickSort's practical speed with HeapSort's O(n log n) worst-case guarantee. Insertion Sort handles small subarrays efficiently due to cache locality and low overhead.</p>
    </TheorySection>
    <TheorySection title="When Each Algorithm Activates">
      <ul className="list-disc pl-4 space-y-1">
        <li><span className="text-violet-500 font-semibold">QuickSort</span>: depth ≤ 2·log₂(n) and size &gt; 16</li>
        <li><span className="text-red-500 font-semibold">HeapSort</span>: depth &gt; 2·log₂(n) (prevents O(n²) worst case)</li>
        <li><span className="text-amber-500 font-semibold">InsertionSort</span>: subarray size ≤ 16 (fast for tiny arrays)</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Best', 'O(n log n)', 'O(log n)'],
      ['Average', 'O(n log n)', 'O(log n)'],
      ['Worst', 'O(n log n)', 'O(log n)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `// std::sort in C++ uses IntroSort!
void introSort(int* arr, int lo, int hi, int depthLimit) {
    while (hi - lo > 16) {
        if (depthLimit == 0) {
            make_heap(arr+lo, arr+hi+1);
            sort_heap(arr+lo, arr+hi+1);
            return;
        }
        --depthLimit;
        int p = partition(arr, lo, hi); // median-of-3
        introSort(arr, p+1, hi, depthLimit);
        hi = p - 1;
    }
    insertionSort(arr, lo, hi);
}
void sort(int* arr, int n) {
    introSort(arr, 0, n-1, 2*log2(n));
}`,
    'Python': `import math
def intro_sort(arr, lo, hi, depth_limit):
    size = hi - lo + 1
    if size <= 16:
        insertion_sort(arr, lo, hi)
        return
    if depth_limit == 0:
        heap_sort(arr, lo, hi)
        return
    p = partition(arr, lo, hi)
    intro_sort(arr, lo, p - 1, depth_limit - 1)
    intro_sort(arr, p + 1, hi, depth_limit - 1)

def sort(arr):
    n = len(arr)
    intro_sort(arr, 0, n - 1, 2 * int(math.log2(n)))`,
    'JavaScript': `function introSort(arr, lo, hi, depthLimit) {
    const size = hi - lo + 1;
    if (size <= 16) { insertionSort(arr, lo, hi); return; }
    if (depthLimit === 0) { heapSort(arr, lo, hi); return; }
    const p = partition(arr, lo, hi);
    introSort(arr, lo, p - 1, depthLimit - 1);
    introSort(arr, p + 1, hi, depthLimit - 1);
}
function sort(arr) {
    const maxDepth = 2 * Math.floor(Math.log2(arr.length));
    introSort(arr, 0, arr.length - 1, maxDepth);
}`,
    'Java': `// Java Arrays.sort() for primitives uses Dual-Pivot QuickSort (variant of IntroSort)
void introSort(int[] arr, int lo, int hi, int depthLimit) {
    if (hi - lo <= 16) { insertionSort(arr, lo, hi); return; }
    if (depthLimit == 0) { heapSort(arr, lo, hi); return; }
    int p = partition(arr, lo, hi);
    introSort(arr, lo, p - 1, depthLimit - 1);
    introSort(arr, p + 1, hi, depthLimit - 1);
}
public void sort(int[] arr) {
    int maxDepth = 2 * (int)(Math.log(arr.length) / Math.log(2));
    introSort(arr, 0, arr.length - 1, maxDepth);
}`,
  }} />
);

export default function IntroSort() {
  const randomArray = () => Array.from({ length: 18 }, () => Math.floor(Math.random() * 90) + 10);

  const [initArr] = useState(randomArray);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(300);
  const timerRef = useRef(null);

  const handleRandomize = useCallback(() => {
    const arr = Array.from({ length: 18 }, () => Math.floor(Math.random() * 90) + 10);
    setSteps(generateIntroSortSteps(arr));
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    setSteps(generateIntroSortSteps(initArr));
    setCurrentStep(0);
  }, [initArr]);

  const currentSteps = steps;
  const step = currentSteps[currentStep] || { array: initArr, active: [0, initArr.length - 1], comparing: [], algorithm: 'QuickSort', depth: 0, maxDepth: 0, comparisons: 0, message: '' };
  const maxVal = Math.max(...(step.array || initArr));

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
      title="Intro Sort"
      description="Hybrid QuickSort + HeapSort + InsertionSort — guaranteed O(n log n) with QuickSort's practical speed"
      category="Sorting"
      difficulty="Hard"
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
      showInput={false}
      stats={{ depth: step.depth, maxDepth: step.maxDepth, algorithm: step.algorithm, comparisons: step.comparisons }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(n log n) worst case guaranteed',
        'QuickSort speed in practice',
        'In-place with O(log n) stack space',
        'Used in C++ std::sort, .NET Array.Sort',
      ]}
      disadvantages={[
        'Not stable',
        'Complex implementation (three algorithms combined)',
        'Not as cache-friendly as pure merge sort',
      ]}
      applications={[
        'C++ std::sort() — uses IntroSort',
        '.NET Array.Sort() — uses IntroSort',
        'General-purpose production sorting',
        'When worst-case O(n log n) is required with QuickSort performance',
      ]}
      interviewTips={[
        'C++ std::sort uses IntroSort — mention this in interviews',
        'Key threshold: depth > 2·log₂(n) → switch to HeapSort',
        'Key threshold: size ≤ 16 → switch to InsertionSort',
        'Combines the best of all three: speed, worst-case, cache locality',
      ]}
      relatedAlgos={[
        { title: 'Quick Sort', route: '/sorting/quick-sort' },
        { title: 'Heap Sort', route: '/sorting/heap-sort' },
        { title: 'Tim Sort', route: '/sorting/tim-sort' },
      ]}
      practiceProblems={[
        { name: 'Sort an Array', difficulty: 'Medium', url: 'https://leetcode.com/problems/sort-an-array/' },
        { name: 'Kth Largest Element', difficulty: 'Medium', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
      ]}
    >
      {/* Algorithm badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${ALG_COLORS[step.algorithm] || 'bg-gray-400 text-white'}`}>
          {step.algorithm}
        </span>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>Depth: <span className={`font-bold ${step.depth > step.maxDepth ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>{step.depth}</span>/{step.maxDepth}</span>
          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full transition-all ${step.depth > step.maxDepth ? 'bg-red-500' : 'bg-violet-500'}`} style={{ width: `${Math.min((step.depth / Math.max(step.maxDepth, 1)) * 100, 100)}%` }} />
          </div>
        </div>
      </div>
      <div className="flex items-end gap-1 justify-center h-36 mb-4">
        {(step.array || initArr).map((v, i) => {
          const isActive = step.active && i >= step.active[0] && i <= step.active[1];
          const isComparing = step.comparing?.includes(i);
          const barColor = isComparing ? 'bg-white dark:bg-white' :
            step.done ? 'bg-emerald-400 dark:bg-emerald-500' :
            isActive ? (BAR_COLORS[step.algorithm] || 'bg-gray-400') :
            'bg-gray-300 dark:bg-gray-600';
          return (
            <div key={i} className="flex flex-col items-center gap-0.5 flex-1" style={{ maxWidth: 28 }}>
              <div
                className={`w-full rounded-t-sm transition-all duration-150 ${barColor}`}
                style={{ height: `${(v / maxVal) * 125}px` }}
              />
              <span className="text-[8px] text-gray-400 dark:text-gray-500">{v}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 justify-center text-xs flex-wrap">
        {[
          ['bg-violet-400', 'QuickSort region'],
          ['bg-red-400', 'HeapSort region'],
          ['bg-amber-400', 'InsertionSort region'],
          ['bg-white border border-gray-300', 'Comparing'],
          ['bg-emerald-400', 'Sorted'],
        ].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${c} inline-block`} />{l}
          </span>
        ))}
      </div>
    </AlgorithmPageShell>
  );
}
