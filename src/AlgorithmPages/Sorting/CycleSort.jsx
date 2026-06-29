import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateCycleSteps(inputArr) {
  const arr = [...inputArr];
  const steps = [];
  const n = arr.length;
  let writes = 0;
  let cycles = 0;

  steps.push({ array: [...arr], cycleStart: -1, target: -1, current: -1, writes, cycles, message: `Cycle Sort: minimizes array writes. Each element placed exactly at its correct position.` });

  for (let cycleStart = 0; cycleStart < n - 1; cycleStart++) {
    let item = arr[cycleStart];
    steps.push({ array: [...arr], cycleStart, target: -1, current: cycleStart, writes, cycles, message: `Cycle ${cycles + 1}: item=${item} at index ${cycleStart}` });

    // Count smaller elements to find correct position
    let pos = cycleStart;
    for (let i = cycleStart + 1; i < n; i++) {
      if (arr[i] < item) pos++;
    }

    if (pos === cycleStart) {
      steps.push({ array: [...arr], cycleStart, target: cycleStart, current: cycleStart, writes, cycles, message: `item=${item} already at correct position ${pos}. Skip.` });
      continue;
    }

    cycles++;

    // Skip duplicates
    while (item === arr[pos]) pos++;

    // Place item
    [arr[pos], item] = [item, arr[pos]];
    writes++;
    steps.push({ array: [...arr], cycleStart, target: pos, current: cycleStart, writes, cycles, message: `Place ${arr[pos]} at position ${pos}. Write #${writes}. Now item=${item}` });

    // Rotate rest of the cycle
    while (pos !== cycleStart) {
      pos = cycleStart;
      for (let i = cycleStart + 1; i < n; i++) {
        if (arr[i] < item) pos++;
      }
      while (item === arr[pos]) pos++;
      [arr[pos], item] = [item, arr[pos]];
      writes++;
      steps.push({ array: [...arr], cycleStart, target: pos, current: cycleStart, writes, cycles, message: `Rotate: place ${arr[pos]} at ${pos}. Write #${writes}. item=${item}` });
    }
  }

  steps.push({ array: [...arr], cycleStart: -1, target: -1, current: -1, writes, cycles, message: `✅ Cycle Sort Complete! Total writes: ${writes}, Cycles: ${cycles}`, done: true });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="How Cycle Sort Works">
      <p>Cycle Sort is unique because it minimizes the number of memory writes. It decomposes the permutation into cycles and then rotates each cycle to produce a sorted array. The number of writes is exactly n minus the number of cycles.</p>
      <p>For each element, count how many elements are smaller — that gives the element's correct position. Then rotate the cycle, placing each element directly at its destination.</p>
    </TheorySection>
    <TheorySection title="Why Minimize Writes?">
      <ul className="list-disc pl-4 space-y-1">
        <li>Flash memory has limited write cycles — minimizing writes extends lifespan</li>
        <li>Useful for write-once memory or EEPROM</li>
        <li>Optimal in terms of writes: O(n) writes total</li>
        <li>Trade-off: O(n²) reads to determine positions</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Best', 'O(n²)', 'O(1)'],
      ['Average', 'O(n²)', 'O(1)'],
      ['Worst', 'O(n²)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `void cycleSort(int arr[], int n) {
    int writes = 0;
    for (int start = 0; start < n - 1; start++) {
        int item = arr[start], pos = start;
        for (int i = start + 1; i < n; i++)
            if (arr[i] < item) pos++;
        if (pos == start) continue;
        while (item == arr[pos]) pos++;
        swap(arr[pos], item); writes++;
        while (pos != start) {
            pos = start;
            for (int i = start + 1; i < n; i++)
                if (arr[i] < item) pos++;
            while (item == arr[pos]) pos++;
            swap(arr[pos], item); writes++;
        }
    }
}`,
    'Python': `def cycle_sort(arr):
    writes = 0
    for start in range(len(arr) - 1):
        item = arr[start]
        pos = start
        for i in range(start + 1, len(arr)):
            if arr[i] < item: pos += 1
        if pos == start: continue
        while item == arr[pos]: pos += 1
        arr[pos], item = item, arr[pos]; writes += 1
        while pos != start:
            pos = start
            for i in range(start + 1, len(arr)):
                if arr[i] < item: pos += 1
            while item == arr[pos]: pos += 1
            arr[pos], item = item, arr[pos]; writes += 1
    return writes`,
    'JavaScript': `function cycleSort(arr) {
    let writes = 0;
    for (let start = 0; start < arr.length - 1; start++) {
        let item = arr[start], pos = start;
        for (let i = start + 1; i < arr.length; i++)
            if (arr[i] < item) pos++;
        if (pos === start) continue;
        while (item === arr[pos]) pos++;
        [arr[pos], item] = [item, arr[pos]]; writes++;
        while (pos !== start) {
            pos = start;
            for (let i = start + 1; i < arr.length; i++)
                if (arr[i] < item) pos++;
            while (item === arr[pos]) pos++;
            [arr[pos], item] = [item, arr[pos]]; writes++;
        }
    }
    return writes;
}`,
    'Java': `public static int cycleSort(int[] arr) {
    int writes = 0, n = arr.length;
    for (int start = 0; start < n - 1; start++) {
        int item = arr[start], pos = start;
        for (int i = start + 1; i < n; i++) if (arr[i] < item) pos++;
        if (pos == start) continue;
        while (item == arr[pos]) pos++;
        int t = arr[pos]; arr[pos] = item; item = t; writes++;
        while (pos != start) {
            pos = start;
            for (int i = start + 1; i < n; i++) if (arr[i] < item) pos++;
            while (item == arr[pos]) pos++;
            t = arr[pos]; arr[pos] = item; item = t; writes++;
        }
    }
    return writes;
}`,
  }} />
);

export default function CycleSort() {
  const randomArray = () => {
    const arr = [];
    while (arr.length < 12) {
      const v = Math.floor(Math.random() * 50) + 5;
      if (!arr.includes(v)) arr.push(v);
    }
    return arr;
  };

  const [initArr] = useState(randomArray);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const handleRandomize = useCallback(() => {
    const arr = [];
    while (arr.length < 12) {
      const v = Math.floor(Math.random() * 50) + 5;
      if (!arr.includes(v)) arr.push(v);
    }
    setSteps(generateCycleSteps(arr));
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    setSteps(generateCycleSteps(initArr));
    setCurrentStep(0);
  }, [initArr]);

  const currentSteps = steps;
  const step = currentSteps[currentStep] || { array: initArr, cycleStart: -1, target: -1, current: -1, writes: 0, cycles: 0, message: '' };
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
      title="Cycle Sort"
      description="Minimize array writes by placing each element directly at its correct position via cycle rotation"
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
      stats={{ writes: step.writes, cycles: step.cycles }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Minimum number of writes: O(n) total',
        'In-place (O(1) extra space)',
        'Optimal for write-expensive memory (flash, EEPROM)',
        'Interesting theoretical properties',
      ]}
      disadvantages={[
        'O(n²) comparisons — not efficient for large datasets',
        'Not stable',
        'Complex implementation',
        'Not commonly used in practice',
      ]}
      applications={[
        'Flash memory sorting (minimize write cycles)',
        'EEPROM sorting',
        'Theoretical interest in minimum-write sorting',
      ]}
      interviewTips={[
        'Key property: number of writes = n - number of cycles in permutation',
        'Time O(n²) but write complexity is O(n) which is optimal',
        'Count smaller elements to find each element\'s correct position',
        'Think of each "cycle" as a group of elements that swap among themselves',
      ]}
      relatedAlgos={[
        { title: 'Selection Sort', route: '/sorting/selection-sort' },
        { title: 'Counting Sort', route: '/sorting/counting-sort' },
        { title: 'Pigeonhole Sort', route: '/sorting/pigeonhole-sort' },
      ]}
      practiceProblems={[
        { name: 'Find All Duplicates in Array', difficulty: 'Medium', url: 'https://leetcode.com/problems/find-all-duplicates-in-an-array/' },
        { name: 'Missing Number', difficulty: 'Easy', url: 'https://leetcode.com/problems/missing-number/' },
      ]}
    >
      <div className="flex items-end gap-1 justify-center h-40 mb-4">
        {(step.array || initArr).map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1" style={{ maxWidth: 48 }}>
            <div
              className={`w-full rounded-t-sm transition-all duration-200 ${
                step.done ? 'bg-emerald-400 dark:bg-emerald-500' :
                step.target === i ? 'bg-amber-400 dark:bg-amber-500' :
                step.current === i || step.cycleStart === i ? 'bg-violet-500 dark:bg-violet-400' :
                'bg-slate-400 dark:bg-slate-500'
              }`}
              style={{ height: `${(v / maxVal) * 130}px` }}
            />
            <span className="text-[9px] text-gray-500 dark:text-gray-400">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 justify-center text-xs mt-2 flex-wrap">
        {[['bg-violet-500', 'Element being placed'], ['bg-amber-400', 'Target position'], ['bg-slate-400', 'Normal'], ['bg-emerald-400', 'Sorted']].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${c} inline-block`} />{l}
          </span>
        ))}
      </div>
    </AlgorithmPageShell>
  );
}
