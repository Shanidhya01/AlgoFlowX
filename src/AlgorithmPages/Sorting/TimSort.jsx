import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const MIN_RUN = 8;

function insertionSortRun(arr, left, right, steps, runIdx) {
  for (let i = left + 1; i <= right; i++) {
    const temp = arr[i];
    let j = i - 1;
    while (j >= left && arr[j] > temp) {
      arr[j + 1] = arr[j];
      j--;
      steps.push({ array: [...arr], phase: 'sort-run', highlight: [j + 1, j + 2], mergeRange: [left, right], run: runIdx, runCount: Math.ceil(arr.length / MIN_RUN), message: `Insertion sort run ${runIdx}: shifting arr[${j + 2}]=${arr[j + 2]}` });
    }
    arr[j + 1] = temp;
    steps.push({ array: [...arr], phase: 'sort-run', highlight: [j + 1], mergeRange: [left, right], run: runIdx, runCount: Math.ceil(arr.length / MIN_RUN), message: `Insertion sort run ${runIdx}: placed ${temp} at index ${j + 1}` });
  }
}

function merge(arr, left, mid, right, steps, runCount) {
  const leftArr = arr.slice(left, mid + 1);
  const rightArr = arr.slice(mid + 1, right + 1);
  let i = 0, j = 0, k = left;
  while (i < leftArr.length && j < rightArr.length) {
    if (leftArr[i] <= rightArr[j]) {
      arr[k] = leftArr[i++];
    } else {
      arr[k] = rightArr[j++];
    }
    steps.push({ array: [...arr], phase: 'merge', highlight: [k], mergeRange: [left, right], run: -1, runCount, message: `Merge [${left}-${mid}] + [${mid + 1}-${right}]: placed ${arr[k]} at ${k}` });
    k++;
  }
  while (i < leftArr.length) { arr[k] = leftArr[i++]; steps.push({ array: [...arr], phase: 'merge', highlight: [k], mergeRange: [left, right], run: -1, runCount, message: `Merge: copy left remainder ${arr[k]} at ${k}` }); k++; }
  while (j < rightArr.length) { arr[k] = rightArr[j++]; steps.push({ array: [...arr], phase: 'merge', highlight: [k], mergeRange: [left, right], run: -1, runCount, message: `Merge: copy right remainder ${arr[k]} at ${k}` }); k++; }
}

function generateTimSortSteps(inputArr) {
  const arr = [...inputArr];
  const steps = [];
  const n = arr.length;
  const runCount = Math.ceil(n / MIN_RUN);

  steps.push({ array: [...arr], phase: 'init', highlight: [], mergeRange: [], run: 0, runCount, message: `Tim Sort: MIN_RUN=${MIN_RUN}. Array of ${n} elements → ${runCount} runs.` });

  // Phase 1: Sort each run with insertion sort
  for (let runIdx = 0, left = 0; left < n; left += MIN_RUN, runIdx++) {
    const right = Math.min(left + MIN_RUN - 1, n - 1);
    steps.push({ array: [...arr], phase: 'find-run', highlight: Array.from({ length: right - left + 1 }, (_, i) => left + i), mergeRange: [left, right], run: runIdx, runCount, message: `Run ${runIdx + 1}/${runCount}: indices [${left}, ${right}] — apply Insertion Sort` });
    insertionSortRun(arr, left, right, steps, runIdx + 1);
  }

  steps.push({ array: [...arr], phase: 'merge-start', highlight: [], mergeRange: [], run: -1, runCount, message: `All ${runCount} runs sorted! Starting merge phase...` });

  // Phase 2: Merge sorted runs
  for (let size = MIN_RUN; size < n; size *= 2) {
    for (let left = 0; left < n; left += 2 * size) {
      const mid = Math.min(left + size - 1, n - 1);
      const right = Math.min(left + 2 * size - 1, n - 1);
      if (mid < right) {
        steps.push({ array: [...arr], phase: 'merge', highlight: Array.from({ length: right - left + 1 }, (_, i) => left + i), mergeRange: [left, right], run: -1, runCount, message: `Merge runs: [${left}-${mid}] with [${mid + 1}-${right}]` });
        merge(arr, left, mid, right, steps, runCount);
      }
    }
  }

  steps.push({ array: [...arr], phase: 'done', highlight: [], mergeRange: [], run: runCount, runCount, message: `✅ Tim Sort Complete! Array sorted in O(n log n) time.`, done: true });
  return steps;
}

const PHASE_COLORS = { 'find-run': 'text-purple-500', 'sort-run': 'text-amber-500', 'merge': 'text-sky-500', 'done': 'text-emerald-500' };
const PHASE_LABELS = { 'find-run': 'Finding Runs', 'sort-run': 'Sorting Run', 'merge': 'Merging', 'merge-start': 'Merge Phase', 'done': 'Complete' };

const RUN_COLORS = ['bg-rose-400', 'bg-orange-400', 'bg-amber-400', 'bg-lime-400', 'bg-emerald-400', 'bg-teal-400', 'bg-sky-400', 'bg-blue-400', 'bg-violet-400', 'bg-purple-400'];

const theory = (
  <div>
    <TheorySection title="How Tim Sort Works">
      <p>Tim Sort is a hybrid sorting algorithm derived from Merge Sort and Insertion Sort. It divides the array into small chunks called "runs" (size MIN_RUN, typically 32-64), sorts each run with Insertion Sort (which is fast on small arrays), then merges the sorted runs with Merge Sort.</p>
      <p>It is the default sorting algorithm in Python (since 2.3), Java (for object arrays since Java 7), and many other languages because of its excellent real-world performance on partially sorted data.</p>
    </TheorySection>
    <TheorySection title="Why Tim Sort?">
      <ul className="list-disc pl-4 space-y-1">
        <li>Insertion sort is fast for small arrays (MIN_RUN = 8-64)</li>
        <li>Merge sort guarantees O(n log n) worst case</li>
        <li>Exploits natural runs in real-world data</li>
        <li>Stable sort — maintains relative order of equal elements</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Best', 'O(n)', 'O(n)'],
      ['Average', 'O(n log n)', 'O(n)'],
      ['Worst', 'O(n log n)', 'O(n)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `const int MIN_RUN = 32;
void insertionSort(int arr[], int l, int r) {
    for (int i = l + 1; i <= r; i++) {
        int temp = arr[i]; int j = i - 1;
        while (j >= l && arr[j] > temp) { arr[j+1] = arr[j]; j--; }
        arr[j+1] = temp;
    }
}
void merge(int arr[], int l, int m, int r) {
    vector<int> left(arr+l,arr+m+1), right(arr+m+1,arr+r+1);
    int i=0,j=0,k=l;
    while(i<left.size()&&j<right.size()) arr[k++]=(left[i]<=right[j])?left[i++]:right[j++];
    while(i<left.size()) arr[k++]=left[i++];
    while(j<right.size()) arr[k++]=right[j++];
}
void timSort(int arr[], int n) {
    for(int i=0;i<n;i+=MIN_RUN) insertionSort(arr,i,min(i+MIN_RUN-1,n-1));
    for(int size=MIN_RUN;size<n;size*=2)
        for(int l=0;l<n;l+=2*size) {
            int m=min(l+size-1,n-1), r=min(l+2*size-1,n-1);
            if(m<r) merge(arr,l,m,r);
        }
}`,
    'Python': `MIN_RUN = 32
def insertion_sort(arr, l, r):
    for i in range(l + 1, r + 1):
        temp = arr[i]; j = i - 1
        while j >= l and arr[j] > temp:
            arr[j+1] = arr[j]; j -= 1
        arr[j+1] = temp

def merge(arr, l, m, r):
    left, right = arr[l:m+1], arr[m+1:r+1]
    i = j = 0; k = l
    while i < len(left) and j < len(right):
        if left[i] <= right[j]: arr[k] = left[i]; i += 1
        else: arr[k] = right[j]; j += 1
        k += 1
    arr[k:r+1] = left[i:] + right[j:]

def tim_sort(arr):
    n = len(arr)
    for i in range(0, n, MIN_RUN):
        insertion_sort(arr, i, min(i + MIN_RUN - 1, n - 1))
    size = MIN_RUN
    while size < n:
        for l in range(0, n, 2 * size):
            m = min(l + size - 1, n - 1)
            r = min(l + 2 * size - 1, n - 1)
            if m < r: merge(arr, l, m, r)
        size *= 2`,
    'JavaScript': `const MIN_RUN = 32;
function insertionSort(arr, l, r) {
    for (let i = l + 1; i <= r; i++) {
        const temp = arr[i]; let j = i - 1;
        while (j >= l && arr[j] > temp) { arr[j+1] = arr[j]; j--; }
        arr[j+1] = temp;
    }
}
function merge(arr, l, m, r) {
    const left = arr.slice(l, m+1), right = arr.slice(m+1, r+1);
    let [i,j,k] = [0,0,l];
    while (i < left.length && j < right.length)
        arr[k++] = left[i] <= right[j] ? left[i++] : right[j++];
    while (i < left.length) arr[k++] = left[i++];
    while (j < right.length) arr[k++] = right[j++];
}
function timSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n; i += MIN_RUN)
        insertionSort(arr, i, Math.min(i + MIN_RUN - 1, n - 1));
    for (let size = MIN_RUN; size < n; size *= 2)
        for (let l = 0; l < n; l += 2 * size) {
            const m = Math.min(l + size - 1, n - 1);
            const r = Math.min(l + 2 * size - 1, n - 1);
            if (m < r) merge(arr, l, m, r);
        }
}`,
    'Java': `static final int MIN_RUN = 32;
static void insertionSort(int[] arr, int l, int r) {
    for (int i = l+1; i <= r; i++) {
        int temp = arr[i]; int j = i - 1;
        while (j >= l && arr[j] > temp) { arr[j+1] = arr[j]; j--; }
        arr[j+1] = temp;
    }
}
static void merge(int[] arr, int l, int m, int r) {
    int[] left = Arrays.copyOfRange(arr,l,m+1), right = Arrays.copyOfRange(arr,m+1,r+1);
    int i=0,j=0,k=l;
    while(i<left.length&&j<right.length) arr[k++]=left[i]<=right[j]?left[i++]:right[j++];
    while(i<left.length) arr[k++]=left[i++];
    while(j<right.length) arr[k++]=right[j++];
}
static void timSort(int[] arr, int n) {
    for(int i=0;i<n;i+=MIN_RUN) insertionSort(arr,i,Math.min(i+MIN_RUN-1,n-1));
    for(int size=MIN_RUN;size<n;size*=2)
        for(int l=0;l<n;l+=2*size){
            int m=Math.min(l+size-1,n-1),r=Math.min(l+2*size-1,n-1);
            if(m<r) merge(arr,l,m,r);
        }
}`,
  }} />
);

export default function TimSort() {
  const randomArray = () => Array.from({ length: 24 }, () => Math.floor(Math.random() * 90) + 10);

  const [initArr] = useState(randomArray);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(150);
  const timerRef = useRef(null);

  const handleRandomize = useCallback(() => {
    const arr = Array.from({ length: 24 }, () => Math.floor(Math.random() * 90) + 10);
    setSteps(generateTimSortSteps(arr));
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    setSteps(generateTimSortSteps(initArr));
    setCurrentStep(0);
  }, [initArr]);

  const currentSteps = steps;
  const step = currentSteps[currentStep] || { array: initArr, phase: 'init', highlight: [], mergeRange: [], run: 0, runCount: 0, message: '' };
  const maxVal = Math.max(...(step.array || initArr));
  const n = (step.array || initArr).length;

  // Determine run index for color
  const getRunColor = (i) => {
    const runIdx = Math.floor(i / MIN_RUN);
    return RUN_COLORS[runIdx % RUN_COLORS.length];
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

  return (
    <AlgorithmPageShell
      title="Tim Sort"
      description="Hybrid Insertion Sort + Merge Sort: sort MIN_RUN-sized chunks, then merge them efficiently"
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
      stats={{ phase: PHASE_LABELS[step.phase] || step.phase, run: step.run >= 0 ? `${step.run}/${step.runCount}` : '—', runCount: step.runCount }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(n log n) worst case, O(n) best case',
        'Stable sort',
        'Adaptive — fast for partially sorted data',
        'Default sort in Python, Java, Swift',
      ]}
      disadvantages={[
        'O(n) extra space for merging',
        'More complex than simple sorts',
        'Implementation overhead',
        'Not in-place',
      ]}
      applications={[
        'Python list.sort() and sorted()',
        'Java Arrays.sort() for objects',
        'Android and Swift default sort',
        'General-purpose production sorting',
      ]}
      interviewTips={[
        'Tim Sort was designed by Tim Peters in 2002 for Python',
        'MIN_RUN chosen as 32-64 to match CPU cache behavior',
        'Detects and exploits natural runs in data',
        'Stable: equal elements maintain their original relative order',
      ]}
      relatedAlgos={[
        { title: 'Merge Sort', route: '/sorting/merge-sort' },
        { title: 'Insertion Sort', route: '/sorting/insertion-sort' },
        { title: 'Intro Sort', route: '/sorting/intro-sort' },
      ]}
      practiceProblems={[
        { name: 'Sort an Array', difficulty: 'Medium', url: 'https://leetcode.com/problems/sort-an-array/' },
        { name: 'Merge Sorted Array', difficulty: 'Easy', url: 'https://leetcode.com/problems/merge-sorted-array/' },
      ]}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className={`text-xs font-semibold ${PHASE_COLORS[step.phase] || 'text-gray-400'}`}>
          {PHASE_LABELS[step.phase] || step.phase}
        </span>
        {step.phase !== 'merge' && step.run >= 0 && (
          <span className="text-xs text-gray-400">Run {step.run}/{step.runCount}</span>
        )}
      </div>
      <div className="flex items-end gap-1 justify-center h-36 mb-2">
        {(step.array || initArr).map((v, i) => {
          const isHighlighted = step.highlight?.includes(i);
          const inMerge = step.mergeRange?.length === 2 && i >= step.mergeRange[0] && i <= step.mergeRange[1];
          return (
            <div key={i} className="flex flex-col items-center gap-0.5 flex-1" style={{ maxWidth: 22 }}>
              <div
                className={`w-full rounded-t-sm transition-all duration-100 ${
                  step.done ? 'bg-emerald-400 dark:bg-emerald-500' :
                  isHighlighted ? 'bg-white dark:bg-white opacity-90' :
                  step.phase === 'merge' && inMerge ? 'bg-sky-400 dark:bg-sky-500' :
                  getRunColor(i)
                }`}
                style={{ height: `${(v / maxVal) * 120}px` }}
              />
            </div>
          );
        })}
      </div>
      {/* Run legend */}
      <div className="flex flex-wrap gap-2 justify-center mt-2 text-xs">
        {Array.from({ length: Math.ceil(n / MIN_RUN) }, (_, ri) => (
          <span key={ri} className="flex items-center gap-1">
            <span className={`w-3 h-3 rounded ${RUN_COLORS[ri % RUN_COLORS.length]} inline-block`} />
            Run {ri + 1} [{ri * MIN_RUN}–{Math.min((ri + 1) * MIN_RUN - 1, n - 1)}]
          </span>
        ))}
        {step.phase === 'merge' && <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-sky-400 inline-block" /> Merging</span>}
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white border border-gray-300 inline-block" /> Active</span>
      </div>
    </AlgorithmPageShell>
  );
}
