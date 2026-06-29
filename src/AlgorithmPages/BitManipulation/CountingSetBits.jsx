import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function toBinary8(n) {
  return (n >>> 0).toString(2).padStart(8, '0');
}

function findLowestSetBit(n) {
  if (n === 0) return -1;
  for (let i = 0; i < 8; i++) {
    if ((n >> i) & 1) return i;
  }
  return -1;
}

function generateKernighanSteps(n) {
  const steps = [];
  let current = n;
  let count = 0;

  steps.push({
    n: current,
    binary: toBinary8(current),
    lowestSetBit: findLowestSetBit(current),
    count,
    phase: 'kernighan',
    naivePos: -1,
    message: `Start: n = ${current} (${toBinary8(current)}) — find all set bits using Brian Kernighan's algorithm.`,
    done: false,
  });

  while (current !== 0) {
    const lsb = findLowestSetBit(current);
    steps.push({
      n: current,
      binary: toBinary8(current),
      lowestSetBit: lsb,
      count,
      phase: 'kernighan',
      naivePos: -1,
      message: `n = ${current} — lowest set bit is at position ${lsb} (bit value ${1 << lsb}). Apply n = n & (n-1).`,
      done: false,
    });
    current = current & (current - 1);
    count++;
    steps.push({
      n: current,
      binary: toBinary8(current),
      lowestSetBit: findLowestSetBit(current),
      count,
      phase: 'kernighan',
      naivePos: -1,
      message: `After clearing: n = ${current} (${toBinary8(current)}). Set bits counted so far: ${count}.`,
      done: current === 0,
    });
  }

  steps.push({
    n: 0,
    binary: toBinary8(0),
    lowestSetBit: -1,
    count,
    phase: 'kernighan',
    naivePos: -1,
    message: `Done! Total set bits in ${n} = ${count}. Used only ${count} iteration(s) — one per set bit!`,
    done: true,
  });

  return steps;
}

function generateNaiveSteps(n) {
  const steps = [];
  let count = 0;

  steps.push({
    n,
    binary: toBinary8(n),
    lowestSetBit: -1,
    count: 0,
    phase: 'naive',
    naivePos: -1,
    message: `Naive approach: check each of the 8 bits one by one.`,
    done: false,
  });

  for (let i = 7; i >= 0; i--) {
    const bit = (n >> i) & 1;
    if (bit) count++;
    steps.push({
      n,
      binary: toBinary8(n),
      lowestSetBit: -1,
      count,
      phase: 'naive',
      naivePos: i,
      message: `Checking bit ${i}: value = ${bit}. ${bit ? 'It is set! Count → ' + count : 'Not set.'}`,
      done: false,
    });
  }

  steps.push({
    n,
    binary: toBinary8(n),
    lowestSetBit: -1,
    count,
    phase: 'naive',
    naivePos: -1,
    message: `Done (Naive)! Total set bits = ${count}. Checked all 8 bits (O(log n) iterations).`,
    done: true,
  });

  return steps;
}

function BitCells({ binary, lowestSetBit, naivePos, phase }) {
  return (
    <div className="flex flex-row gap-1.5 justify-center">
      {binary.split('').map((bit, idx) => {
        const bitPos = 7 - idx;
        let cellClass = 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
        if (phase === 'kernighan' && bitPos === lowestSetBit && lowestSetBit !== -1) {
          cellClass = 'bg-amber-400 text-white';
        } else if (phase === 'naive' && bitPos === naivePos) {
          cellClass = 'bg-amber-400 text-white';
        } else if (bit === '1') {
          cellClass = 'bg-blue-500 text-white';
        }
        return (
          <div
            key={idx}
            className={`inline-flex items-center justify-center w-8 h-8 rounded font-mono font-bold text-sm transition-all duration-300 ${cellClass}`}
          >
            {bit}
          </div>
        );
      })}
    </div>
  );
}

const theory = (
  <div>
    <TheorySection title="Brian Kernighan's Algorithm">
      <p>
        The key insight: <strong>n &amp; (n-1)</strong> always clears the lowest set bit of n.
        Why? Subtracting 1 from n flips the lowest set bit and all bits below it.
        ANDing with n masks out those changed bits, leaving everything above intact but clearing the lowest set bit.
      </p>
      <p className="mt-2">
        For example: n = 12 (1100). n-1 = 11 (1011). n &amp; (n-1) = 1000 = 8.
        The lowest set bit (bit 2, value 4) was cleared.
      </p>
    </TheorySection>
    <TheorySection title="Naive Approach">
      <p>
        Check each bit position from 0 to log₂(n). For an 8-bit number, always 8 iterations.
        Use <code>(n &gt;&gt; i) &amp; 1</code> to test bit i. Time: O(log n).
      </p>
    </TheorySection>
    <TheorySection title="Isolating the Lowest Set Bit">
      <p>
        Related trick: <strong>n &amp; (-n)</strong> isolates (keeps only) the lowest set bit.
        This is because -n in two's complement equals ~n + 1, so n &amp; (-n) leaves only the trailing 1.
      </p>
    </TheorySection>
    <TheorySection title="Hardware Popcount">
      <p>
        Modern CPUs have a dedicated POPCNT instruction. In C++: <code>__builtin_popcount(n)</code>.
        In Java: <code>Integer.bitCount(n)</code>. These run in O(1) hardware time.
      </p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Brian Kernighan', 'O(set bits)', 'O(1)'],
      ['Naive approach', 'O(log n)', 'O(1)'],
      ['Hardware (popcount)', 'O(1)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `// Brian Kernighan's Algorithm
int countSetBits(int n) {
    int count = 0;
    while (n) {
        n = n & (n - 1); // clears lowest set bit
        count++;
    }
    return count;
}

// Hardware instruction (fastest)
int countSetBitsHW(int n) {
    return __builtin_popcount(n);
}

// Naive approach
int countSetBitsNaive(int n) {
    int count = 0;
    while (n) {
        count += (n & 1);
        n >>= 1;
    }
    return count;
}`,
    'Python': `def count_set_bits(n: int) -> int:
    """Brian Kernighan's algorithm."""
    count = 0
    while n:
        n = n & (n - 1)  # clear lowest set bit
        count += 1
    return count

def count_set_bits_builtin(n: int) -> int:
    return bin(n).count('1')

def count_set_bits_naive(n: int) -> int:
    count = 0
    while n:
        count += n & 1
        n >>= 1
    return count`,
    'JavaScript': `function countSetBits(n) {
    // Brian Kernighan's Algorithm
    let count = 0;
    while (n) {
        n = n & (n - 1); // clear lowest set bit
        count++;
    }
    return count;
}

// Using built-in
function countSetBitsBuiltin(n) {
    return n.toString(2).split('').filter(b => b === '1').length;
}`,
    'Java': `public class CountSetBits {
    // Brian Kernighan's Algorithm
    public static int countSetBits(int n) {
        int count = 0;
        while (n != 0) {
            n = n & (n - 1); // clear lowest set bit
            count++;
        }
        return count;
    }

    // Built-in
    public static int countSetBitsBuiltin(int n) {
        return Integer.bitCount(n);
    }
}`,
  }} />
);

const DEFAULT_N = 45;

export default function CountingSetBits() {
  const [mode, setMode] = useState('kernighan');
  const [inputVal, setInputVal] = useState(String(DEFAULT_N));
  const [inputError, setInputError] = useState('');
  const [n, setN] = useState(DEFAULT_N);
  const [steps, setSteps] = useState(() => generateKernighanSteps(DEFAULT_N));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const regenerate = useCallback((num, m) => {
    const s = m === 'kernighan' ? generateKernighanSteps(num) : generateNaiveSteps(num);
    setSteps(s);
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  const switchMode = (m) => {
    setMode(m);
    regenerate(n, m);
  };

  const handleCustomInput = (val) => {
    setInputVal(val);
    const num = parseInt(val.trim(), 10);
    if (isNaN(num) || num < 1 || num > 255) {
      setInputError('Enter a number between 1 and 255');
      return;
    }
    setInputError('');
    setN(num);
    regenerate(num, mode);
  };

  const handleRandomize = useCallback(() => {
    const num = Math.floor(Math.random() * 254) + 1;
    setInputVal(String(num));
    setN(num);
    setInputError('');
    regenerate(num, mode);
  }, [mode, regenerate]);

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
      title="Counting Set Bits"
      description="Brian Kernighan's algorithm: n & (n-1) removes the lowest set bit in O(set bits) time"
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
      customInput={inputVal}
      onCustomInput={handleCustomInput}
      inputError={inputError}
      inputPlaceholder="e.g. 45"
      inputLabel="Number (1–255)"
      showInput={true}
      stats={{ n: step.n, setBits: step.count, steps: currentStep }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(k) where k = number of set bits — much faster than naive for sparse numbers',
        'No branching on each bit — uses arithmetic and bitwise ops only',
        'Widely used in competitive programming and low-level systems code',
      ]}
      disadvantages={[
        'Still O(log n) in the worst case when all bits are set (e.g. n = 255)',
        'Slightly less readable than naive approach without prior knowledge of the trick',
      ]}
      applications={[
        'Network subnet masks — count host bits',
        'Chess bitboards — count pieces on the board',
        'Cryptography — Hamming weight calculations',
        'Compiler optimizations using POPCNT intrinsics',
        'Competitive programming — popcount in bitmask DP',
        'Error correction codes — parity checking',
      ]}
      interviewTips={[
        'Know that n & (n-1) clears the lowest set bit — this is Brian Kernighan\'s trick',
        'Know that n & (-n) isolates (keeps only) the lowest set bit',
        'In C++, prefer __builtin_popcount(n) in production; mention it even if asked to code manually',
        'In Java, use Integer.bitCount(n)',
        'Can extend to count bits in an array with DP in O(n) — see LeetCode "Counting Bits"',
      ]}
      relatedAlgos={[
        { title: 'Power of Two', route: '/power-of-two' },
        { title: 'XOR Tricks', route: '/xor-tricks' },
        { title: 'Subset Generation (Bitmask)', route: '/subset-bitmask' },
      ]}
      practiceProblems={[
        { name: 'Number of 1 Bits', difficulty: 'Easy', url: 'https://leetcode.com/problems/number-of-1-bits/' },
        { name: 'Counting Bits', difficulty: 'Easy', url: 'https://leetcode.com/problems/counting-bits/' },
        { name: 'Hamming Distance', difficulty: 'Easy', url: 'https://leetcode.com/problems/hamming-distance/' },
      ]}
    >
      {/* Mode toggle */}
      <div className="flex justify-center gap-2 mb-5">
        <button
          onClick={() => switchMode('kernighan')}
          className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all duration-150 ${
            mode === 'kernighan'
              ? 'bg-blue-600 text-white border-blue-600 shadow'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Brian Kernighan
        </button>
        <button
          onClick={() => switchMode('naive')}
          className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all duration-150 ${
            mode === 'naive'
              ? 'bg-blue-600 text-white border-blue-600 shadow'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Naive (Check Each Bit)
        </button>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Binary display */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 w-full max-w-md">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">
            {mode === 'kernighan' ? "Brian Kernighan's Method" : 'Naive Bit Scan'}
          </p>
          <div className="flex justify-center mb-2">
            <span className="font-mono text-xs text-gray-400 dark:text-gray-500 mr-1">Bit:</span>
            <div className="flex gap-1.5">
              {[7,6,5,4,3,2,1,0].map(b => (
                <div key={b} className="w-8 text-center font-mono text-xs text-gray-400 dark:text-gray-500">{b}</div>
              ))}
            </div>
          </div>
          <BitCells
            binary={step.binary}
            lowestSetBit={step.lowestSetBit}
            naivePos={step.naivePos}
            phase={step.phase}
          />
          <div className="mt-3 text-center">
            <span className="font-mono text-lg font-bold text-gray-700 dark:text-gray-300">
              n = {step.n}
            </span>
            <span className="ml-2 text-sm text-gray-400">({step.binary}₂)</span>
          </div>
        </div>

        {/* Operation display */}
        {mode === 'kernighan' && (
          <div className="bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 px-6 py-3 text-center">
            <p className="font-mono text-sm text-blue-700 dark:text-blue-300">
              n = n &amp; (n - 1)
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
              Clears the lowest set bit each iteration
            </p>
          </div>
        )}

        {/* Count badge */}
        <div className="flex items-center justify-center gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-8 py-4 text-center">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Set Bits Count</p>
            <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{step.count}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded bg-blue-500"></span> Set bit (1)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded bg-amber-400"></span>
            {mode === 'kernighan' ? 'Lowest set bit (being cleared)' : 'Current bit (being checked)'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded bg-gray-200 dark:bg-gray-700"></span> Zero bit (0)
          </span>
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
