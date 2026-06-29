import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const ELEMENTS = ['A', 'B', 'C', 'D'];
const N = ELEMENTS.length;
const TOTAL = 1 << N; // 16

function generateSubsetSteps() {
  const steps = [];
  const found = [];

  steps.push({
    mask: -1, binary: '----', subset: [], found: [], total: TOTAL,
    phase: 'init',
    message: `Subset Generation with Bitmask. ${N} elements → 2^${N} = ${TOTAL} subsets (masks 0 to ${TOTAL - 1})`,
    done: false,
  });

  for (let mask = 0; mask < TOTAL; mask++) {
    const binary = mask.toString(2).padStart(N, '0');
    const subset = [];
    for (let i = 0; i < N; i++) {
      if (mask & (1 << (N - 1 - i))) subset.push(ELEMENTS[i]);
    }
    found.push({ mask, binary, subset: [...subset] });

    steps.push({
      mask, binary, subset: [...subset], found: [...found], total: TOTAL,
      phase: 'process',
      message: mask === 0
        ? `mask=0 (${binary}): empty subset {}`
        : `mask=${mask} (${binary}): subset {${subset.join(', ') || '∅'}}`,
      done: false,
    });
  }

  steps.push({
    mask: TOTAL, binary: '----', subset: [], found: [...found], total: TOTAL,
    phase: 'done',
    message: `Done! All ${TOTAL} subsets generated for {${ELEMENTS.join(', ')}}`,
    done: true,
  });

  return steps;
}

const theory = (
  <div>
    <TheorySection title="Bitmask Subset Generation">
      <p>For a set of n elements, iterate over all integers from 0 to 2^n - 1. Each integer's binary representation acts as a mask — bit i being 1 means element i is in the subset.</p>
      <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 rounded p-2 my-2">mask = 0101  →  elements at positions 1 and 3 are included</p>
    </TheorySection>
    <TheorySection title="Checking if Bit is Set">
      <ul className="list-disc pl-4 space-y-1">
        <li><code className="font-mono text-sm">mask & (1 &lt;&lt; i)</code> — check if bit i is set</li>
        <li><code className="font-mono text-sm">mask | (1 &lt;&lt; i)</code> — set bit i</li>
        <li><code className="font-mono text-sm">mask & ~(1 &lt;&lt; i)</code> — clear bit i</li>
        <li><code className="font-mono text-sm">mask ^ (1 &lt;&lt; i)</code> — toggle bit i</li>
      </ul>
    </TheorySection>
    <TheorySection title="Iterating Over Set Bits">
      <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 rounded p-2">for (int sub = mask; sub; sub = (sub-1) & mask)</p>
      <p>This enumerates all subsets of a mask efficiently — crucial in bitmask DP.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Enumerate subsets', 'O(2^n)', 'O(n)'],
      ['Enumerate subsets of mask', 'O(3^n) total', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `// Generate all subsets of array using bitmask
void generateSubsets(vector<int>& arr) {
    int n = arr.size();
    for (int mask = 0; mask < (1 << n); mask++) {
        vector<int> subset;
        for (int i = 0; i < n; i++)
            if (mask & (1 << i))
                subset.push_back(arr[i]);
        // process subset
    }
}

// Enumerate all subsets of a given mask
void subsetsOfMask(int mask) {
    for (int sub = mask; sub > 0; sub = (sub - 1) & mask)
        // process sub
}`,
    'Python': `def generate_subsets(arr):
    n = len(arr)
    subsets = []
    for mask in range(1 << n):
        subset = [arr[i] for i in range(n) if mask & (1 << i)]
        subsets.append(subset)
    return subsets

# Enumerate subsets of a mask
def subsets_of(mask):
    sub = mask
    while sub:
        yield sub
        sub = (sub - 1) & mask`,
    'JavaScript': `function generateSubsets(arr) {
    const n = arr.length;
    const result = [];
    for (let mask = 0; mask < (1 << n); mask++) {
        const subset = [];
        for (let i = 0; i < n; i++)
            if (mask & (1 << i)) subset.push(arr[i]);
        result.push(subset);
    }
    return result;
}

// Subsets of mask (bitmask DP pattern)
function* subsetsOf(mask) {
    for (let sub = mask; sub > 0; sub = (sub - 1) & mask)
        yield sub;
}`,
    'Java': `public static List<List<Integer>> generateSubsets(int[] arr) {
    int n = arr.length;
    List<List<Integer>> result = new ArrayList<>();
    for (int mask = 0; mask < (1 << n); mask++) {
        List<Integer> subset = new ArrayList<>();
        for (int i = 0; i < n; i++)
            if ((mask & (1 << i)) != 0)
                subset.add(arr[i]);
        result.add(subset);
    }
    return result;
}`,
  }} />
);

export default function SubsetBitmask() {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(400);
  const timerRef = useRef(null);

  useEffect(() => {
    setSteps(generateSubsetSteps());
    setCurrentStep(0);
  }, []);

  const handleRandomize = useCallback(() => {
    setSteps(generateSubsetSteps());
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

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

  const step = steps[currentStep] || { mask: -1, binary: '0000', subset: [], found: [], total: TOTAL, phase: 'init', message: '', done: false };

  const BIT_COLORS = ['bg-indigo-400', 'bg-amber-400', 'bg-emerald-400', 'bg-pink-400'];
  const EL_COLORS = ['indigo', 'amber', 'emerald', 'pink'];

  return (
    <AlgorithmPageShell
      title="Subset Bitmask"
      description="Generate all 2^n subsets of a set using bitmask iteration — O(2^n × n)"
      category="Bit Manipulation"
      difficulty="Easy"
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
      showInput={false}
      stats={{ mask: step.mask >= 0 ? step.mask : '-', binary: step.binary, found: step.found?.length ?? 0, total: TOTAL }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Simple O(2^n) loop to enumerate all subsets',
        'Each subset in O(n) time',
        'Foundation of bitmask DP (e.g., TSP, set cover)',
        'Compact representation — entire subset fits in one integer',
      ]}
      disadvantages={[
        'Only practical for n ≤ 20-25',
        '2^n grows exponentially',
        'Not suitable for large sets',
      ]}
      applications={[
        'Bitmask DP (Travelling Salesman, Hamiltonian path)',
        'Subset sum enumeration',
        'Power set generation',
        'Graph coloring, set cover problems',
        'State compression in DP',
      ]}
      interviewTips={[
        'mask & (1<<i) checks if element i is in the subset',
        'for (sub=mask; sub; sub=(sub-1)&mask) iterates all subsets of a mask',
        'Bitmask DP: dp[mask] = optimal solution for subset represented by mask',
        'n=20 → 2^20 = ~1M subsets (feasible); n=25 → ~33M (borderline)',
      ]}
      relatedAlgos={[
        { title: 'XOR Tricks', route: '/bit-manipulation/xor-tricks' },
        { title: 'Power of Two', route: '/bit-manipulation/power-of-two' },
        { title: 'Counting Set Bits', route: '/bit-manipulation/counting-set-bits' },
      ]}
      practiceProblems={[
        { name: 'Subsets', difficulty: 'Medium', url: 'https://leetcode.com/problems/subsets/' },
        { name: 'Subsets II', difficulty: 'Medium', url: 'https://leetcode.com/problems/subsets-ii/' },
        { name: 'Maximum AND Sum of Array', difficulty: 'Hard', url: 'https://leetcode.com/problems/maximum-and-sum-of-array/' },
        { name: 'Shortest Path Visiting All Nodes', difficulty: 'Hard', url: 'https://leetcode.com/problems/shortest-path-visiting-all-nodes/' },
      ]}
    >
      {/* Current mask binary display */}
      <div className="mb-5">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">Current mask (4-bit binary):</p>
        <div className="flex gap-2 justify-center">
          {ELEMENTS.map((el, i) => {
            const bitIdx = N - 1 - i;
            const isSet = step.mask >= 0 && (step.mask & (1 << bitIdx)) !== 0;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-12 h-12 rounded-xl border-2 font-bold text-lg flex items-center justify-center transition-all duration-200 ${
                  isSet
                    ? `${BIT_COLORS[i]} text-white border-transparent scale-110`
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-600'
                }`}>
                  {step.mask >= 0 ? (isSet ? '1' : '0') : '-'}
                </div>
                <span className={`text-xs font-bold transition-all ${isSet ? `text-${EL_COLORS[i]}-600 dark:text-${EL_COLORS[i]}-400` : 'text-gray-400'}`}>{el}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current subset chips */}
      <div className="flex items-center justify-center gap-2 mb-5 min-h-[40px]">
        {step.mask >= 0 && (
          step.subset && step.subset.length > 0 ? (
            step.subset.map((el, i) => {
              const elIdx = ELEMENTS.indexOf(el);
              return (
                <div key={i} className={`px-4 py-1.5 rounded-full text-white font-bold text-sm ${BIT_COLORS[elIdx]} shadow-sm`}>
                  {el}
                </div>
              );
            })
          ) : (
            <span className="text-gray-400 text-sm italic">∅ (empty set)</span>
          )
        )}
      </div>

      {/* Grid of found subsets */}
      {step.found && step.found.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">
            Subsets found: {step.found.length}/{TOTAL}
          </p>
          <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
            {step.found.map((f, i) => (
              <div key={i} className={`px-2 py-1 rounded-lg text-xs font-mono text-center transition-all ${
                i === step.found.length - 1
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}>
                {f.subset.length > 0 ? `{${f.subset.join(',')}}` : '∅'}
              </div>
            ))}
          </div>
        </div>
      )}
    </AlgorithmPageShell>
  );
}
