import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateCombSteps(inputArr) {
  const arr = [...inputArr];
  const steps = [];
  const n = arr.length;
  let gap = n;
  let swaps = 0;
  let comparisons = 0;
  const SHRINK = 1.3;
  let sorted = false;

  steps.push({ array: [...arr], comparing: [], swapped: [], gap, swaps, comparisons, message: `Comb Sort start. Initial gap = ${n}` });

  while (gap > 1 || !sorted) {
    gap = Math.max(1, Math.floor(gap / SHRINK));
    sorted = true;

    steps.push({ array: [...arr], comparing: [], swapped: [], gap, swaps, comparisons, message: `New gap = ${gap} (shrink by 1.3)` });

    for (let i = 0; i + gap < n; i++) {
      comparisons++;
      steps.push({ array: [...arr], comparing: [i, i + gap], swapped: [], gap, swaps, comparisons, message: `Compare arr[${i}]=${arr[i]} and arr[${i + gap}]=${arr[i + gap]} (gap=${gap})` });

      if (arr[i] > arr[i + gap]) {
        [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
        swaps++;
        sorted = false;
        steps.push({ array: [...arr], comparing: [], swapped: [i, i + gap], gap, swaps, comparisons, message: `Swapped arr[${i}] and arr[${i + gap}]. Total swaps: ${swaps}` });
      }
    }

    if (gap === 1 && sorted) {
      steps.push({ array: [...arr], comparing: [], swapped: [], gap, swaps, comparisons, message: `Gap=1 pass complete with no swaps. Array is sorted!`, done: true });
      return steps;
    }
  }

  steps.push({ array: [...arr], comparing: [], swapped: [], gap, swaps, comparisons, message: `✅ Comb Sort Complete! Swaps: ${swaps}, Comparisons: ${comparisons}`, done: true });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="How Comb Sort Works">
      <p>Comb Sort improves on Bubble Sort by eliminating "turtles" — small values near the end of the list that slow bubble sort dramatically. It starts with a large gap and shrinks it by a factor of 1.3 each pass.</p>
      <p>When the gap reaches 1, it behaves like bubble sort. The shrink factor of 1.3 was experimentally determined to give the best average performance.</p>
    </TheorySection>
    <TheorySection title="Key Insight">
      <ul className="list-disc pl-4 space-y-1">
        <li>Gap starts at n and shrinks by 1.3 each pass</li>
        <li>Large gaps move elements far from their correct position quickly</li>
        <li>Final passes with gap=1 clean up remaining inversions</li>
        <li>Similar to Shell Sort but uses 1.3 as shrink factor</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Best', 'O(n log n)', 'O(1)'],
      ['Average', 'O(n²/2^p)', 'O(1)'],
      ['Worst', 'O(n²)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `void combSort(int arr[], int n) {
    int gap = n;
    bool sorted = false;
    while (gap != 1 || !sorted) {
        gap = max(1, (int)(gap / 1.3));
        sorted = true;
        for (int i = 0; i + gap < n; i++) {
            if (arr[i] > arr[i + gap]) {
                swap(arr[i], arr[i + gap]);
                sorted = false;
            }
        }
    }
}`,
    'Python': `def comb_sort(arr):
    n = len(arr)
    gap = n
    sorted_ = False
    while gap != 1 or not sorted_:
        gap = max(1, int(gap / 1.3))
        sorted_ = True
        for i in range(n - gap):
            if arr[i] > arr[i + gap]:
                arr[i], arr[i + gap] = arr[i + gap], arr[i]
                sorted_ = False
    return arr`,
    'JavaScript': `function combSort(arr) {
    const n = arr.length;
    let gap = n, sorted = false;
    while (gap !== 1 || !sorted) {
        gap = Math.max(1, Math.floor(gap / 1.3));
        sorted = true;
        for (let i = 0; i + gap < n; i++) {
            if (arr[i] > arr[i + gap]) {
                [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
                sorted = false;
            }
        }
    }
    return arr;
}`,
    'Java': `public static void combSort(int[] arr) {
    int n = arr.length, gap = n;
    boolean sorted = false;
    while (gap != 1 || !sorted) {
        gap = Math.max(1, (int)(gap / 1.3));
        sorted = true;
        for (int i = 0; i + gap < n; i++) {
            if (arr[i] > arr[i + gap]) {
                int t = arr[i]; arr[i] = arr[i+gap]; arr[i+gap] = t;
                sorted = false;
            }
        }
    }
}`,
  }} />
);

export default function CombSort() {
  const randomArray = () => Array.from({ length: 14 }, () => Math.floor(Math.random() * 90) + 10);

  const [arr] = useState(randomArray);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const handleRandomize = useCallback(() => {
    const newArr = Array.from({ length: 14 }, () => Math.floor(Math.random() * 90) + 10);
    const s = generateCombSteps(newArr);
    setSteps(s);
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    const s = generateCombSteps(arr);
    setSteps(s);
    setCurrentStep(0);
  }, [arr]);

  const currentSteps = steps;
  const step = currentSteps[currentStep] || { array: arr, comparing: [], swapped: [], gap: arr.length, swaps: 0, comparisons: 0, message: '' };
  const maxVal = Math.max(...(step.array || arr));

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
      title="Comb Sort"
      description="Improve Bubble Sort by using a shrinking gap (÷1.3 each pass) to eliminate turtles efficiently"
      category="Sorting"
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
      showInput={false}
      stats={{ gap: step.gap, swaps: step.swaps, comparisons: step.comparisons }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Much faster than Bubble Sort in practice',
        'Simple to implement',
        'In-place sorting (O(1) space)',
        'Eliminates turtles efficiently',
      ]}
      disadvantages={[
        'O(n²) worst case',
        'Not stable',
        'Shrink factor 1.3 is empirical, not mathematically optimal',
        'Not as fast as O(n log n) algorithms',
      ]}
      applications={[
        'Simple in-place sorting where O(n log n) is not required',
        'Educational purposes demonstrating gap-based sorting',
        'When implementation simplicity matters over performance',
      ]}
      interviewTips={[
        'Comb Sort is an extension of Bubble Sort with a gap',
        'Shrink factor of 1.3 is key — smaller converges slowly, larger misses "turtles"',
        'Similar concept to Shell Sort but different gap sequence',
        'Average case is O(n²/2^p) where p is number of increments',
      ]}
      relatedAlgos={[
        { title: 'Bubble Sort', route: '/sorting/bubble-sort' },
        { title: 'Shell Sort', route: '/sorting/shell-sort' },
        { title: 'Cocktail Sort', route: '/sorting/cocktail-sort' },
      ]}
      practiceProblems={[
        { name: 'Sort an Array', difficulty: 'Medium', url: 'https://leetcode.com/problems/sort-an-array/' },
        { name: 'Largest Number', difficulty: 'Medium', url: 'https://leetcode.com/problems/largest-number/' },
      ]}
    >
      <div className="flex items-end gap-1 justify-center h-40 mb-4">
        {(step.array || arr).map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1" style={{ width: `${Math.floor(100 / (step.array || arr).length)}%`, maxWidth: 40 }}>
            <div
              className={`w-full rounded-t-sm transition-all duration-200 ${
                step.swapped?.includes(i) ? 'bg-red-400 dark:bg-red-500' :
                step.comparing?.includes(i) ? 'bg-amber-400 dark:bg-amber-500' :
                step.done ? 'bg-emerald-400 dark:bg-emerald-500' :
                'bg-indigo-400 dark:bg-indigo-500'
              }`}
              style={{ height: `${(v / maxVal) * 130}px` }}
            />
            <span className="text-[9px] text-gray-500 dark:text-gray-400">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 justify-center text-xs mt-2 flex-wrap">
        {[['bg-amber-400', 'Comparing'], ['bg-red-400', 'Swapped'], ['bg-indigo-400', 'Normal'], ['bg-emerald-400', 'Sorted']].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${c} inline-block`} />{l}
          </span>
        ))}
      </div>
    </AlgorithmPageShell>
  );
}
