import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateCocktailSteps(inputArr) {
  const arr = [...inputArr];
  const steps = [];
  const n = arr.length;
  let swaps = 0;
  let pass = 0;
  let left = 0, right = n - 1;

  steps.push({ array: [...arr], comparing: [], swapped: [], left, right, direction: 'right', pass, swaps, message: `Cocktail Shaker Sort. Initial bounds: left=${left}, right=${right}` });

  while (left < right) {
    let swappedThisPass = false;
    pass++;

    // Left to right
    steps.push({ array: [...arr], comparing: [], swapped: [], left, right, direction: 'right', pass, swaps, message: `Pass ${pass} → (left to right). Bounds: [${left}, ${right}]` });
    for (let i = left; i < right; i++) {
      steps.push({ array: [...arr], comparing: [i, i + 1], swapped: [], left, right, direction: 'right', pass, swaps, message: `→ Compare arr[${i}]=${arr[i]} and arr[${i + 1}]=${arr[i + 1]}` });
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swaps++;
        swappedThisPass = true;
        steps.push({ array: [...arr], comparing: [], swapped: [i, i + 1], left, right, direction: 'right', pass, swaps, message: `→ Swapped! Max bubbling right. Total swaps: ${swaps}` });
      }
    }
    right--;

    if (!swappedThisPass) {
      steps.push({ array: [...arr], comparing: [], swapped: [], left, right, direction: 'done', pass, swaps, message: `No swaps in pass ${pass}. Array is sorted!`, done: true });
      return steps;
    }

    swappedThisPass = false;
    pass++;

    // Right to left
    steps.push({ array: [...arr], comparing: [], swapped: [], left, right, direction: 'left', pass, swaps, message: `Pass ${pass} ← (right to left). Bounds: [${left}, ${right}]` });
    for (let i = right; i > left; i--) {
      steps.push({ array: [...arr], comparing: [i - 1, i], swapped: [], left, right, direction: 'left', pass, swaps, message: `← Compare arr[${i - 1}]=${arr[i - 1]} and arr[${i}]=${arr[i]}` });
      if (arr[i - 1] > arr[i]) {
        [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
        swaps++;
        swappedThisPass = true;
        steps.push({ array: [...arr], comparing: [], swapped: [i - 1, i], left, right, direction: 'left', pass, swaps, message: `← Swapped! Min bubbling left. Total swaps: ${swaps}` });
      }
    }
    left++;

    if (!swappedThisPass) {
      steps.push({ array: [...arr], comparing: [], swapped: [], left, right, direction: 'done', pass, swaps, message: `No swaps in pass ${pass}. Array is sorted!`, done: true });
      return steps;
    }
  }

  steps.push({ array: [...arr], comparing: [], swapped: [], left, right, direction: 'done', pass, swaps, message: `✅ Cocktail Sort Complete! Total swaps: ${swaps}`, done: true });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="How Cocktail Shaker Sort Works">
      <p>Cocktail Shaker Sort (Bidirectional Bubble Sort) extends Bubble Sort by sorting in both directions each pass. The forward pass moves the maximum element to the right; the backward pass moves the minimum element to the left.</p>
      <p>This eliminates both "rabbits" (large elements at the right) and "turtles" (small elements at the left) simultaneously, making it roughly twice as fast as standard Bubble Sort.</p>
    </TheorySection>
    <TheorySection title="Why It's Better Than Bubble Sort">
      <ul className="list-disc pl-4 space-y-1">
        <li>Processes both ends simultaneously — halves the passes needed</li>
        <li>Bounds shrink from both ends each full pass</li>
        <li>Detects sorted state faster with bidirectional checking</li>
        <li>Still stable and in-place like Bubble Sort</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Best', 'O(n)', 'O(1)'],
      ['Average', 'O(n²)', 'O(1)'],
      ['Worst', 'O(n²)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `void cocktailSort(int arr[], int n) {
    int left = 0, right = n - 1;
    while (left < right) {
        bool swapped = false;
        for (int i = left; i < right; i++)
            if (arr[i] > arr[i+1]) { swap(arr[i], arr[i+1]); swapped = true; }
        right--;
        if (!swapped) break;
        swapped = false;
        for (int i = right; i > left; i--)
            if (arr[i-1] > arr[i]) { swap(arr[i-1], arr[i]); swapped = true; }
        left++;
        if (!swapped) break;
    }
}`,
    'Python': `def cocktail_sort(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        swapped = False
        for i in range(left, right):
            if arr[i] > arr[i + 1]:
                arr[i], arr[i+1] = arr[i+1], arr[i]; swapped = True
        right -= 1
        if not swapped: break
        swapped = False
        for i in range(right, left, -1):
            if arr[i-1] > arr[i]:
                arr[i-1], arr[i] = arr[i], arr[i-1]; swapped = True
        left += 1
        if not swapped: break
    return arr`,
    'JavaScript': `function cocktailSort(arr) {
    let left = 0, right = arr.length - 1;
    while (left < right) {
        let swapped = false;
        for (let i = left; i < right; i++)
            if (arr[i] > arr[i+1]) { [arr[i], arr[i+1]] = [arr[i+1], arr[i]]; swapped = true; }
        right--;
        if (!swapped) break;
        swapped = false;
        for (let i = right; i > left; i--)
            if (arr[i-1] > arr[i]) { [arr[i-1], arr[i]] = [arr[i], arr[i-1]]; swapped = true; }
        left++;
        if (!swapped) break;
    }
    return arr;
}`,
    'Java': `public static void cocktailSort(int[] arr) {
    int left = 0, right = arr.length - 1;
    while (left < right) {
        boolean swapped = false;
        for (int i = left; i < right; i++)
            if (arr[i] > arr[i+1]) { int t=arr[i]; arr[i]=arr[i+1]; arr[i+1]=t; swapped=true; }
        right--;
        if (!swapped) break;
        swapped = false;
        for (int i = right; i > left; i--)
            if (arr[i-1] > arr[i]) { int t=arr[i-1]; arr[i-1]=arr[i]; arr[i]=t; swapped=true; }
        left++;
        if (!swapped) break;
    }
}`,
  }} />
);

export default function CocktailSort() {
  const randomArray = () => Array.from({ length: 14 }, () => Math.floor(Math.random() * 90) + 10);

  const [initArr] = useState(randomArray);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const handleRandomize = useCallback(() => {
    const newArr = Array.from({ length: 14 }, () => Math.floor(Math.random() * 90) + 10);
    setSteps(generateCocktailSteps(newArr));
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    setSteps(generateCocktailSteps(initArr));
    setCurrentStep(0);
  }, [initArr]);

  const currentSteps = steps;
  const step = currentSteps[currentStep] || { array: initArr, comparing: [], swapped: [], left: 0, right: initArr.length - 1, direction: 'right', pass: 0, swaps: 0, message: '' };
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
      title="Cocktail Shaker Sort"
      description="Bidirectional Bubble Sort — sort left-to-right then right-to-left, shrinking bounds each pass"
      category="Sorting"
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
      showInput={false}
      stats={{ pass: step.pass, direction: step.direction === 'right' ? '→' : step.direction === 'left' ? '←' : '✓', swaps: step.swaps }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Roughly 2x faster than Bubble Sort',
        'Stable sorting algorithm',
        'In-place (O(1) extra space)',
        'Better for nearly sorted arrays',
      ]}
      disadvantages={[
        'Still O(n²) worst case',
        'More complex than Bubble Sort',
        'Not suitable for large datasets',
        'Outperformed by O(n log n) algorithms',
      ]}
      applications={[
        'Small datasets or nearly sorted arrays',
        'Educational illustration of bidirectional passes',
        'When stable sort with O(1) space is needed for small n',
      ]}
      interviewTips={[
        'Also known as: Bidirectional Bubble Sort, Shaker Sort, Shuttle Sort',
        'Best case O(n) when array is already sorted',
        'Two pointers (left, right) shrink inward each full pass',
        'Early termination when no swaps occur in a pass',
      ]}
      relatedAlgos={[
        { title: 'Bubble Sort', route: '/sorting/bubble-sort' },
        { title: 'Comb Sort', route: '/sorting/comb-sort' },
        { title: 'Insertion Sort', route: '/sorting/insertion-sort' },
      ]}
      practiceProblems={[
        { name: 'Sort Colors', difficulty: 'Medium', url: 'https://leetcode.com/problems/sort-colors/' },
        { name: 'Move Zeroes', difficulty: 'Easy', url: 'https://leetcode.com/problems/move-zeroes/' },
      ]}
    >
      {/* Bound markers */}
      <div className="flex gap-1 justify-center mb-1 text-[10px]" style={{ paddingLeft: 4, paddingRight: 4 }}>
        {(step.array || initArr).map((_, i) => (
          <div key={i} className="flex-1 text-center" style={{ maxWidth: 40 }}>
            {i === step.left && <span className="text-blue-500 font-bold">L</span>}
            {i === step.right && <span className="text-orange-500 font-bold">R</span>}
            {i !== step.left && i !== step.right && <span className="opacity-0">·</span>}
          </div>
        ))}
      </div>
      <div className="flex items-end gap-1 justify-center h-40 mb-2">
        {(step.array || initArr).map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1" style={{ maxWidth: 40 }}>
            <div
              className={`w-full rounded-t-sm transition-all duration-200 ${
                step.swapped?.includes(i) ? 'bg-red-400 dark:bg-red-500' :
                step.comparing?.includes(i) ? 'bg-amber-400 dark:bg-amber-500' :
                (i < step.left || i > step.right) ? 'bg-emerald-400 dark:bg-emerald-500' :
                step.done ? 'bg-emerald-400 dark:bg-emerald-500' :
                'bg-sky-400 dark:bg-sky-500'
              }`}
              style={{ height: `${(v / maxVal) * 130}px` }}
            />
            <span className="text-[9px] text-gray-500 dark:text-gray-400">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 justify-center text-xs mt-1 flex-wrap">
        {[['bg-amber-400', 'Comparing'], ['bg-red-400', 'Swapped'], ['bg-sky-400', 'Unsorted'], ['bg-emerald-400', 'Sorted boundary']].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${c} inline-block`} />{l}
          </span>
        ))}
      </div>
    </AlgorithmPageShell>
  );
}
