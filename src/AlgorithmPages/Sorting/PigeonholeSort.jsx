import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generatePigeonholeSteps(inputArr) {
  const steps = [];
  const arr = [...inputArr];
  const n = arr.length;
  const minVal = Math.min(...arr);
  const maxVal = Math.max(...arr);
  const range = maxVal - minVal + 1;
  const holes = new Array(range).fill(0);

  steps.push({
    array: [...arr], holes: [...holes], phase: 'init', activeIdx: -1, filled: 0,
    minVal, maxVal, range,
    message: `Pigeonhole Sort. Range: [${minVal}, ${maxVal}] = ${range} holes needed.`
  });

  // Distribute phase
  for (let i = 0; i < n; i++) {
    const holeIdx = arr[i] - minVal;
    holes[holeIdx]++;
    const filled = holes.filter(h => h > 0).length;
    steps.push({
      array: [...arr], holes: [...holes], phase: 'distribute', activeIdx: i, holeActive: holeIdx, filled,
      minVal, maxVal, range,
      message: `Distribute arr[${i}]=${arr[i]} → hole[${holeIdx}] (value ${arr[i]}). Count: ${holes[holeIdx]}`
    });
  }

  // Collect phase
  const result = [...arr];
  let pos = 0;
  const sortedArr = [...arr];
  for (let h = 0; h < range; h++) {
    while (holes[h] > 0) {
      sortedArr[pos] = h + minVal;
      steps.push({
        array: [...sortedArr], holes: [...holes], phase: 'collect', activeIdx: pos, holeActive: h, filled: range,
        minVal, maxVal, range,
        message: `Collect hole[${h}] = value ${h + minVal} → arr[${pos}]`
      });
      holes[h]--;
      pos++;
    }
  }

  steps.push({
    array: [...sortedArr], holes: new Array(range).fill(0), phase: 'done', activeIdx: -1, holeActive: -1, filled: range,
    minVal, maxVal, range,
    message: `✅ Pigeonhole Sort Complete! Sorted ${n} elements in O(n + range) = O(${n + range}) steps.`,
    done: true
  });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="How Pigeonhole Sort Works">
      <p>Pigeonhole Sort creates one "pigeonhole" (bucket) for each value in the range [min, max]. It then distributes each element into its corresponding hole, and finally collects elements back in order.</p>
      <p>It runs in O(n + range) time, making it excellent when the range is small relative to n. Unlike counting sort, it is stable and works with duplicate values.</p>
    </TheorySection>
    <TheorySection title="When to Use Pigeonhole Sort">
      <ul className="list-disc pl-4 space-y-1">
        <li>When range of values is comparable to n</li>
        <li>Integer or enumerable data only</li>
        <li>Data in a known, bounded range</li>
        <li>When stability matters and range is small</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Best', 'O(n + range)', 'O(n + range)'],
      ['Average', 'O(n + range)', 'O(n + range)'],
      ['Worst', 'O(n + range)', 'O(n + range)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `void pigeonholeSort(int arr[], int n) {
    int minVal = *min_element(arr, arr + n);
    int maxVal = *max_element(arr, arr + n);
    int range = maxVal - minVal + 1;
    vector<int> holes(range, 0);
    for (int i = 0; i < n; i++) holes[arr[i] - minVal]++;
    int idx = 0;
    for (int h = 0; h < range; h++)
        while (holes[h]-- > 0) arr[idx++] = h + minVal;
}`,
    'Python': `def pigeonhole_sort(arr):
    min_val, max_val = min(arr), max(arr)
    size = max_val - min_val + 1
    holes = [0] * size
    for x in arr: holes[x - min_val] += 1
    i = 0
    for h in range(size):
        while holes[h] > 0:
            arr[i] = h + min_val
            i += 1; holes[h] -= 1
    return arr`,
    'JavaScript': `function pigeonholeSort(arr) {
    const min = Math.min(...arr), max = Math.max(...arr);
    const range = max - min + 1;
    const holes = new Array(range).fill(0);
    for (const x of arr) holes[x - min]++;
    let idx = 0;
    for (let h = 0; h < range; h++)
        while (holes[h]-- > 0) arr[idx++] = h + min;
    return arr;
}`,
    'Java': `public static void pigeonholeSort(int[] arr) {
    int min = Arrays.stream(arr).min().getAsInt();
    int max = Arrays.stream(arr).max().getAsInt();
    int range = max - min + 1;
    int[] holes = new int[range];
    for (int x : arr) holes[x - min]++;
    int idx = 0;
    for (int h = 0; h < range; h++)
        while (holes[h]-- > 0) arr[idx++] = h + min;
}`,
  }} />
);

export default function PigeonholeSort() {
  const randomArray = () => {
    const base = 10 + Math.floor(Math.random() * 10);
    return Array.from({ length: 10 }, () => base + Math.floor(Math.random() * 15));
  };

  const [initArr] = useState(randomArray);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const handleRandomize = useCallback(() => {
    const base = 10 + Math.floor(Math.random() * 10);
    const arr = Array.from({ length: 10 }, () => base + Math.floor(Math.random() * 15));
    setSteps(generatePigeonholeSteps(arr));
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    setSteps(generatePigeonholeSteps(initArr));
    setCurrentStep(0);
  }, [initArr]);

  const currentSteps = steps;
  const step = currentSteps[currentStep] || {
    array: initArr, holes: [], phase: 'init', activeIdx: -1, holeActive: -1, filled: 0,
    minVal: Math.min(...initArr), maxVal: Math.max(...initArr), range: 0, message: ''
  };

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

  const arr = step.array || initArr;
  const maxArr = Math.max(...initArr);

  return (
    <AlgorithmPageShell
      title="Pigeonhole Sort"
      description="Distribute elements into value-indexed buckets, then collect in order — O(n + range)"
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
      stats={{ range: step.range, filled: `${step.holes?.filter(h => h > 0).length || 0}/${step.range}` }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(n + range) time — linear when range is small',
        'Stable sort',
        'Simple to implement',
        'Excellent for bounded integer data',
      ]}
      disadvantages={[
        'Only works for integer (or enumerable) data',
        'O(range) extra space',
        'Inefficient when range >> n',
        'Not suitable for floating point or complex data',
      ]}
      applications={[
        'Sorting ages, scores, or grades',
        'Postal code sorting',
        'Character/ASCII sorting',
        'Any bounded integer domain',
      ]}
      interviewTips={[
        'Difference from Counting Sort: pigeonhole holds lists, counting sort holds counts',
        'Effective when n ≈ range (e.g., sorting 1000 scores in range 0-100)',
        'Space complexity is O(n + range): n for output, range for holes',
        'Can be adapted into bucket sort for floating point data',
      ]}
      relatedAlgos={[
        { title: 'Counting Sort', route: '/sorting/counting-sort' },
        { title: 'Radix Sort', route: '/sorting/radix-sort' },
        { title: 'Bucket Sort', route: '/sorting/bucket-sort' },
      ]}
      practiceProblems={[
        { name: 'Sort Array by Increasing Frequency', difficulty: 'Easy', url: 'https://leetcode.com/problems/sort-array-by-increasing-frequency/' },
        { name: 'Relative Sort Array', difficulty: 'Easy', url: 'https://leetcode.com/problems/relative-sort-array/' },
      ]}
    >
      {/* Original array */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">
        Phase: <span className={`font-bold ${step.phase === 'distribute' ? 'text-amber-500' : step.phase === 'collect' ? 'text-emerald-500' : 'text-indigo-400'}`}>
          {step.phase === 'distribute' ? 'Distributing to holes' : step.phase === 'collect' ? 'Collecting from holes' : step.done ? 'Complete' : 'Initializing'}
        </span>
      </p>
      {/* Array bars */}
      <div className="flex items-end gap-2 justify-center h-28 mb-4">
        {arr.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1" style={{ maxWidth: 44 }}>
            <div
              className={`w-full rounded-t-sm transition-all duration-200 ${
                step.done ? 'bg-emerald-400 dark:bg-emerald-500' :
                step.activeIdx === i ? 'bg-amber-400 dark:bg-amber-500' :
                'bg-indigo-400 dark:bg-indigo-500'
              }`}
              style={{ height: `${(v / maxArr) * 90}px` }}
            />
            <span className="text-[9px] text-gray-500 dark:text-gray-400">{v}</span>
          </div>
        ))}
      </div>
      {/* Pigeonhole grid */}
      {step.holes && step.holes.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Pigeonholes (value → count):</p>
          <div className="flex flex-wrap gap-1 justify-center">
            {step.holes.map((count, h) => (
              <div key={h} className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg border text-xs font-bold transition-all duration-200 ${
                step.holeActive === h ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-400 text-amber-700 dark:text-amber-300 scale-110' :
                count > 0 ? 'bg-sky-100 dark:bg-sky-900/40 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300' :
                'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600'
              }`}>
                <span>{count}</span>
                <span className="text-[8px] font-normal text-gray-400">{h + (step.minVal || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AlgorithmPageShell>
  );
}
