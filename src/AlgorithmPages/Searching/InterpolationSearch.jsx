import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateSteps(arr, target) {
  const steps = [];
  let lo = 0, hi = arr.length - 1;

  steps.push({ lo, hi, pos: -1, found: -1, message: `Searching for ${target}. Initial range: [0..${arr.length - 1}]` });

  while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
    if (lo === hi) {
      if (arr[lo] === target) {
        steps.push({ lo, hi, pos: lo, found: lo, message: `✅ Found ${target} at index ${lo}!`, done: true });
      } else {
        steps.push({ lo, hi, pos: lo, found: -1, message: `❌ ${target} not found.`, done: true });
      }
      return steps;
    }

    const pos = lo + Math.floor(((target - arr[lo]) / (arr[hi] - arr[lo])) * (hi - lo));
    steps.push({ lo, hi, pos, found: -1, message: `Probe pos = ${lo} + ⌊(${target}-${arr[lo]})/(${arr[hi]}-${arr[lo]}) × (${hi}-${lo})⌋ = ${pos}, a[${pos}]=${arr[pos]}` });

    if (arr[pos] === target) {
      steps.push({ lo, hi, pos, found: pos, message: `✅ Found ${target} at index ${pos}!`, done: true });
      return steps;
    }

    if (arr[pos] < target) {
      lo = pos + 1;
      steps.push({ lo, hi, pos: -1, found: -1, message: `a[${pos}]=${arr[pos]} < ${target}, search right half [${lo}..${hi}]` });
    } else {
      hi = pos - 1;
      steps.push({ lo, hi, pos: -1, found: -1, message: `a[${pos}]=${arr[pos]} > ${target}, search left half [${lo}..${hi}]` });
    }
  }

  steps.push({ lo, hi, pos: -1, found: -1, message: `❌ ${target} not found.`, done: true });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="How Interpolation Search Works">
      <p>Unlike binary search which always checks the midpoint, interpolation search estimates <em>where</em> the target likely is based on its value relative to the range. The probe position formula:</p>
      <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded-xl text-sm my-2 font-mono">pos = lo + ⌊((target - arr[lo]) / (arr[hi] - arr[lo])) × (hi - lo)⌋</code>
      <p>For uniformly distributed data, this converges extremely fast — O(log log n). For non-uniform data, it degrades to O(n).</p>
    </TheorySection>
    <TheorySection title="When to Use">
      <ul className="list-disc pl-4 space-y-1">
        <li>Sorted arrays with <strong>uniformly distributed</strong> values</li>
        <li>Large datasets where the extra calculation pays off</li>
        <li>When data range is known (e.g., sorted timestamps, IDs)</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Best', 'O(1)', 'O(1)'],
      ['Average (uniform)', 'O(log log n)', 'O(1)'],
      ['Worst (skewed)', 'O(n)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `int interpolationSearch(int arr[], int n, int target) {
    int lo = 0, hi = n - 1;
    while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
        int pos = lo + ((double)(target - arr[lo]) /
                        (arr[hi] - arr[lo])) * (hi - lo);
        if (arr[pos] == target) return pos;
        if (arr[pos] < target) lo = pos + 1;
        else hi = pos - 1;
    }
    return -1;
}`,
    'Python': `def interpolation_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi and arr[lo] <= target <= arr[hi]:
        pos = lo + int((target - arr[lo]) /
              (arr[hi] - arr[lo]) * (hi - lo))
        if arr[pos] == target:
            return pos
        if arr[pos] < target:
            lo = pos + 1
        else:
            hi = pos - 1
    return -1`,
    'JavaScript': `function interpolationSearch(arr, target) {
    let lo = 0, hi = arr.length - 1;
    while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
        const pos = lo + Math.floor(
            (target - arr[lo]) / (arr[hi] - arr[lo]) * (hi - lo));
        if (arr[pos] === target) return pos;
        if (arr[pos] < target) lo = pos + 1;
        else hi = pos - 1;
    }
    return -1;
}`,
  }} />
);

export default function InterpolationSearch() {
  const uniformArray = () => {
    const base = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);
    return base;
  };

  const [arr] = useState(uniformArray);
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
    setSteps(generateSteps(arr, n));
    setCurrentStep(0);
    setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const t = arr[Math.floor(Math.random() * arr.length)];
    setTargetVal(String(t));
    setSteps(generateSteps(arr, t));
    setCurrentStep(0);
    setIsRunning(false);
  }, [arr]);

  useEffect(() => { handleRandomize(); }, [handleRandomize]);

  const step = steps[currentStep] || { lo: 0, hi: arr.length - 1, pos: -1, found: -1, message: 'Enter a target.' };

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
      title="Interpolation Search"
      description="Estimate target position using value-based interpolation — O(log log n) on uniform data"
      category="Searching"
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
      customInput={targetVal}
      onCustomInput={handleCustomInput}
      inputError={inputError}
      inputPlaceholder="e.g. 45"
      inputLabel="Target value"
      stats={{ lo: step.lo, hi: step.hi, probe: step.pos >= 0 ? step.pos : '—' }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
    >
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Uniformly distributed sorted array:</p>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {arr.map((v, i) => (
          <div key={i} className={`w-11 h-11 flex flex-col items-center justify-center rounded-xl text-xs font-bold border-2 transition-all duration-200 ${
            step.found === i ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-700 dark:text-emerald-300 scale-110' :
            step.pos === i ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 text-amber-700 dark:text-amber-300 scale-105' :
            (i >= step.lo && i <= step.hi) ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' :
            'bg-gray-100 dark:bg-gray-800 border-transparent text-gray-500 dark:text-gray-500 opacity-40'
          }`}>
            <span>{v}</span>
            <span className="text-[9px] opacity-60">{i}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-4 justify-center flex-wrap text-xs">
        {[['bg-blue-300', 'Search range'], ['bg-amber-400', 'Probe pos'], ['bg-emerald-400', 'Found']].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${c} inline-block`} />{l}
          </span>
        ))}
      </div>
    </AlgorithmPageShell>
  );
}
