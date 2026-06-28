import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateRadixSteps(arr) {
  const steps = [];
  const a = [...arr];
  const max = Math.max(...a);

  steps.push({ array: [...a], buckets: Array.from({ length: 10 }, () => []), highlight: [], digit: null, message: 'Starting Radix Sort — sort by each digit from LSD to MSD.' });

  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const buckets = Array.from({ length: 10 }, () => []);
    const digitLabel = exp === 1 ? 'ones' : exp === 10 ? 'tens' : exp === 100 ? 'hundreds' : `${exp}s`;

    for (let i = 0; i < a.length; i++) {
      const digit = Math.floor(a[i] / exp) % 10;
      buckets[digit].push(a[i]);
      const bCopy = buckets.map(b => [...b]);
      steps.push({ array: [...a], buckets: bCopy, highlight: [i], digit: digitLabel, message: `Placing ${a[i]} into bucket ${digit} (${digitLabel} digit)` });
    }

    steps.push({ array: [...a], buckets: buckets.map(b => [...b]), highlight: [], digit: digitLabel, message: `Collecting from buckets after sorting by ${digitLabel} digit...` });

    let idx = 0;
    for (let b = 0; b < 10; b++) {
      for (const v of buckets[b]) {
        a[idx++] = v;
      }
    }

    steps.push({ array: [...a], buckets: Array.from({ length: 10 }, () => []), highlight: [], digit: digitLabel, message: `After ${digitLabel} pass: [${a.join(', ')}]` });
  }

  steps.push({ array: [...a], buckets: Array.from({ length: 10 }, () => []), highlight: a.map((_, i) => i), digit: null, done: true, message: '✅ Array sorted!' });
  return steps;
}

const BUCKET_COLORS = ['bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-yellow-400', 'bg-lime-400', 'bg-emerald-400', 'bg-teal-400', 'bg-cyan-400', 'bg-blue-400', 'bg-violet-400'];

const theory = (
  <div>
    <TheorySection title="How Radix Sort Works">
      <p>Radix Sort processes integers digit by digit, from the least significant digit (LSD) to the most significant digit (MSD). For each digit position, it uses a stable sort (counting sort) to arrange elements based on that digit, placing them into 10 buckets (0-9).</p>
      <p>After all digit positions are processed, the elements are collected from buckets in order. The result is a sorted array without any element comparisons.</p>
    </TheorySection>
    <TheorySection title="Why It's Fast">
      <ul className="list-disc pl-4 space-y-1">
        <li>Non-comparative — avoids O(n log n) comparison barrier</li>
        <li>Linear time when key length k is constant</li>
        <li>Stable sort — relative order of equal elements preserved</li>
        <li>Ideal for integers, fixed-length strings, dates</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['All cases', 'O(nk)', 'O(n + k)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `void countSort(int arr[], int n, int exp) {
    int output[n], count[10] = {0};
    for (int i = 0; i < n; i++) count[(arr[i] / exp) % 10]++;
    for (int i = 1; i < 10; i++) count[i] += count[i-1];
    for (int i = n-1; i >= 0; i--) {
        output[--count[(arr[i] / exp) % 10]] = arr[i];
    }
    for (int i = 0; i < n; i++) arr[i] = output[i];
}
void radixSort(int arr[], int n) {
    int max = *max_element(arr, arr+n);
    for (int exp = 1; max/exp > 0; exp *= 10)
        countSort(arr, n, exp);
}`,
    'Python': `def counting_sort(arr, exp):
    n = len(arr)
    output = [0] * n
    count = [0] * 10
    for num in arr:
        count[(num // exp) % 10] += 1
    for i in range(1, 10):
        count[i] += count[i - 1]
    for i in range(n - 1, -1, -1):
        idx = (arr[i] // exp) % 10
        output[count[idx] - 1] = arr[i]
        count[idx] -= 1
    return output

def radix_sort(arr):
    max_val = max(arr)
    exp = 1
    while max_val // exp > 0:
        arr = counting_sort(arr, exp)
        exp *= 10
    return arr`,
    'JavaScript': `function radixSort(arr) {
    const max = Math.max(...arr);
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        const buckets = Array.from({ length: 10 }, () => []);
        for (const num of arr) {
            buckets[Math.floor(num / exp) % 10].push(num);
        }
        arr = [].concat(...buckets);
    }
    return arr;
}`,
  }} />
);

export default function RadixSort() {
  const randomArray = () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 900) + 10);
  const [inputVal, setInputVal] = useState('');
  const [inputError, setInputError] = useState('');
  const [steps, setSteps] = useState(() => generateRadixSteps(randomArray()));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleRandomize = useCallback(() => {
    const arr = randomArray();
    setInputVal(arr.join(', '));
    setSteps(generateRadixSteps(arr));
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  const handleCustomInput = (val) => {
    setInputVal(val);
    const nums = val.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
    if (nums.length < 2) { setInputError('Enter at least 2 positive numbers'); return; }
    if (nums.length > 12) { setInputError('Max 12 numbers'); return; }
    setInputError('');
    setSteps(generateRadixSteps(nums));
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

  return (
    <AlgorithmPageShell
      title="Radix Sort"
      description="Non-comparative sort processing digits from LSD to MSD using bucket placement"
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
      inputPlaceholder="e.g. 170, 45, 75, 90, 802"
      inputLabel="Array (positive integers)"
      stats={{ digit: step.digit || '—', step: `${currentStep + 1}/${steps.length}` }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
    >
      <div className="space-y-4">
        {/* Array bar chart */}
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Current Array</p>
          <div className="flex gap-2 flex-wrap">
            {step.array.map((v, i) => (
              <div key={i} className={`px-3 py-2 rounded-xl font-bold text-sm border-2 transition-all duration-200 ${
                step.done || step.highlight?.includes(i)
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {v}
              </div>
            ))}
          </div>
        </div>

        {/* Buckets */}
        {step.digit && (
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Buckets ({step.digit} digit)</p>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {step.buckets.map((bucket, b) => (
                <div key={b} className="min-h-[60px]">
                  <div className={`text-center text-xs font-bold py-0.5 rounded-t-lg text-white ${BUCKET_COLORS[b]}`}>{b}</div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-b-lg p-1 min-h-[44px] bg-gray-50 dark:bg-gray-800">
                    {bucket.map((v, vi) => (
                      <div key={vi} className="text-center text-xs font-semibold text-gray-700 dark:text-gray-300 leading-5">{v}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AlgorithmPageShell>
  );
}
