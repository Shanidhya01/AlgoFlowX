import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function toBinary8(n) {
  return (n >>> 0).toString(2).padStart(8, '0');
}

// ── Trick 1: Find single non-duplicate ──────────────────────────────────────
function generateSingleNumberSteps(arr) {
  const steps = [];
  let xorVal = 0;

  steps.push({
    trick: 'single',
    arr,
    xorVal,
    xorBinary: toBinary8(0),
    activeIdx: -1,
    a: null, b: null, aBin: null, bBin: null,
    diffBits: null,
    message: 'XOR all elements — duplicates will cancel out (a ^ a = 0).',
    done: false,
  });

  for (let i = 0; i < arr.length; i++) {
    const prev = xorVal;
    xorVal = xorVal ^ arr[i];
    steps.push({
      trick: 'single',
      arr,
      xorVal,
      xorBinary: toBinary8(xorVal),
      activeIdx: i,
      a: null, b: null, aBin: null, bBin: null,
      diffBits: null,
      message: `XOR with ${arr[i]}: ${prev} ^ ${arr[i]} = ${xorVal} (${toBinary8(xorVal)}).`,
      done: false,
    });
  }

  steps.push({
    trick: 'single',
    arr,
    xorVal,
    xorBinary: toBinary8(xorVal),
    activeIdx: -1,
    a: null, b: null, aBin: null, bBin: null,
    diffBits: null,
    message: `Done! Result = ${xorVal} — the single non-duplicate element. All pairs cancelled to 0.`,
    done: true,
  });

  return steps;
}

// ── Trick 2: Swap without temp ───────────────────────────────────────────────
function generateSwapSteps(a, b) {
  const steps = [];

  steps.push({
    trick: 'swap',
    arr: [], xorVal: 0, xorBinary: '', activeIdx: -1,
    a, b, aBin: toBinary8(a), bBin: toBinary8(b),
    swapPhase: 0,
    diffBits: null,
    message: `Start: A = ${a} (${toBinary8(a)}), B = ${b} (${toBinary8(b)}). We'll swap without a temp variable.`,
    done: false,
  });

  // a ^= b
  const a1 = a ^ b;
  steps.push({
    trick: 'swap',
    arr: [], xorVal: 0, xorBinary: '', activeIdx: -1,
    a: a1, b, aBin: toBinary8(a1), bBin: toBinary8(b),
    swapPhase: 1,
    diffBits: null,
    message: `Step 1: A ^= B → A = ${a} ^ ${b} = ${a1} (${toBinary8(a1)}). A now encodes both values.`,
    done: false,
  });

  // b ^= a
  const b1 = b ^ a1;
  steps.push({
    trick: 'swap',
    arr: [], xorVal: 0, xorBinary: '', activeIdx: -1,
    a: a1, b: b1, aBin: toBinary8(a1), bBin: toBinary8(b1),
    swapPhase: 2,
    diffBits: null,
    message: `Step 2: B ^= A → B = ${b} ^ ${a1} = ${b1} (${toBinary8(b1)}). B now holds original A!`,
    done: false,
  });

  // a ^= b
  const a2 = a1 ^ b1;
  steps.push({
    trick: 'swap',
    arr: [], xorVal: 0, xorBinary: '', activeIdx: -1,
    a: a2, b: b1, aBin: toBinary8(a2), bBin: toBinary8(b1),
    swapPhase: 3,
    diffBits: null,
    message: `Step 3: A ^= B → A = ${a1} ^ ${b1} = ${a2} (${toBinary8(a2)}). A now holds original B!`,
    done: true,
  });

  return steps;
}

// ── Trick 3: Detect differing bits ───────────────────────────────────────────
function generateDiffBitsSteps(a, b) {
  const steps = [];
  const xorResult = a ^ b;
  const diffCount = xorResult.toString(2).split('').filter(c => c === '1').length;

  steps.push({
    trick: 'diff',
    arr: [], xorVal: 0, xorBinary: '', activeIdx: -1,
    a, b, aBin: toBinary8(a), bBin: toBinary8(b),
    diffBits: null,
    swapPhase: 0,
    message: `Compare A = ${a} and B = ${b}. XOR will highlight bits where they differ.`,
    done: false,
  });

  steps.push({
    trick: 'diff',
    arr: [], xorVal: xorResult, xorBinary: toBinary8(xorResult), activeIdx: -1,
    a, b, aBin: toBinary8(a), bBin: toBinary8(b),
    diffBits: toBinary8(xorResult),
    swapPhase: 0,
    message: `A ^ B = ${a} ^ ${b} = ${xorResult} (${toBinary8(xorResult)}). Set bits show differing positions.`,
    done: false,
  });

  steps.push({
    trick: 'diff',
    arr: [], xorVal: xorResult, xorBinary: toBinary8(xorResult), activeIdx: -1,
    a, b, aBin: toBinary8(a), bBin: toBinary8(b),
    diffBits: toBinary8(xorResult),
    swapPhase: 0,
    message: `${diffCount} bit(s) differ between ${a} and ${b}. This is the Hamming distance!`,
    done: true,
  });

  return steps;
}

const TRICKS = [
  { id: 'single', label: 'Find Non-Duplicate' },
  { id: 'swap', label: 'Swap Without Temp' },
  { id: 'diff', label: 'Detect Different Bits' },
];

function BitCells({ binary, highlightMask }) {
  return (
    <div className="flex gap-1.5">
      {binary.split('').map((bit, idx) => {
        const isHighlighted = highlightMask && highlightMask[idx] === '1';
        let cellClass = bit === '1'
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
        if (isHighlighted) cellClass = 'bg-amber-400 text-white';
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
    <TheorySection title="XOR Properties">
      <ul className="list-disc pl-4 space-y-1">
        <li><strong>a ^ a = 0:</strong> Any value XORed with itself is 0 — duplicates cancel.</li>
        <li><strong>a ^ 0 = a:</strong> XOR with 0 is identity — doesn't change the value.</li>
        <li><strong>Commutative:</strong> a ^ b = b ^ a</li>
        <li><strong>Associative:</strong> (a ^ b) ^ c = a ^ (b ^ c)</li>
        <li><strong>Self-inverse:</strong> a ^ b ^ b = a — XOR is its own inverse.</li>
      </ul>
    </TheorySection>
    <TheorySection title="Trick 1: Find Single Non-Duplicate">
      <p>XOR all elements. Pairs cancel: <code>x ^ x = 0</code>. The lone element survives since <code>x ^ 0 = x</code>.</p>
    </TheorySection>
    <TheorySection title="Trick 2: Swap Without Temp">
      <p>Three XOR operations swap values: a^=b; b^=a; a^=b. Warning: if a and b refer to the same memory location, the result is 0! Always use a temp variable in production code when pointers might alias.</p>
    </TheorySection>
    <TheorySection title="Trick 3: Hamming Distance">
      <p>a ^ b produces a bitmask where each 1-bit marks a position where a and b differ. Counting set bits in a ^ b gives the Hamming distance — the number of bit positions that differ.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Find non-duplicate (XOR all)', 'O(n)', 'O(1)'],
      ['XOR swap', 'O(1)', 'O(1)'],
      ['Detect different bits', 'O(1)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `// Trick 1: Find single non-duplicate
int singleNumber(vector<int>& nums) {
    int result = 0;
    for (int n : nums) result ^= n;
    return result;
}

// Trick 2: XOR swap (only safe if a != b address)
void xorSwap(int& a, int& b) {
    if (&a != &b) { // IMPORTANT: guard against self-swap
        a ^= b;
        b ^= a;
        a ^= b;
    }
}

// Trick 3: Count differing bits (Hamming distance)
int hammingDistance(int a, int b) {
    return __builtin_popcount(a ^ b);
}`,
    'Python': `# Trick 1: Find single non-duplicate
def single_number(nums):
    result = 0
    for n in nums:
        result ^= n
    return result

# Trick 2: XOR swap (pythonic way: a, b = b, a)
def xor_swap(a, b):
    a ^= b
    b ^= a
    a ^= b
    return a, b  # returns original b, original a

# Trick 3: Hamming distance
def hamming_distance(a, b):
    return bin(a ^ b).count('1')`,
    'JavaScript': `// Trick 1: Find single non-duplicate
function singleNumber(nums) {
    return nums.reduce((acc, n) => acc ^ n, 0);
}

// Trick 2: XOR swap
function xorSwap(a, b) {
    a ^= b; b ^= a; a ^= b;
    return [a, b]; // returns [original b, original a]
}

// Trick 3: Count differing bits
function hammingDistance(a, b) {
    let xor = a ^ b, count = 0;
    while (xor) { xor &= xor - 1; count++; }
    return count;
}`,
    'Java': `public class XORTricks {
    // Trick 1
    public int singleNumber(int[] nums) {
        int result = 0;
        for (int n : nums) result ^= n;
        return result;
    }

    // Trick 2: swap array elements at i and j
    public void xorSwap(int[] arr, int i, int j) {
        if (i != j) {
            arr[i] ^= arr[j];
            arr[j] ^= arr[i];
            arr[i] ^= arr[j];
        }
    }

    // Trick 3
    public int hammingDistance(int x, int y) {
        return Integer.bitCount(x ^ y);
    }
}`,
  }} />
);

const DEFAULT_ARR = [2, 3, 5, 3, 2];
const DEFAULT_A = 42;
const DEFAULT_B = 27;

export default function XORTricks() {
  const [trick, setTrick] = useState('single');
  const [steps, setSteps] = useState(() => generateSingleNumberSteps(DEFAULT_ARR));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const switchTrick = useCallback((t) => {
    setTrick(t);
    setCurrentStep(0);
    setIsRunning(false);
    if (t === 'single') setSteps(generateSingleNumberSteps(DEFAULT_ARR));
    else if (t === 'swap') setSteps(generateSwapSteps(DEFAULT_A, DEFAULT_B));
    else setSteps(generateDiffBitsSteps(DEFAULT_A, DEFAULT_B));
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

  const stats = {
    operation: TRICKS.find(t => t.id === trick)?.label || '',
    result: trick === 'single' ? step.xorVal : trick === 'swap' ? `A=${step.a ?? ''}, B=${step.b ?? ''}` : step.xorVal,
  };

  return (
    <AlgorithmPageShell
      title="XOR Tricks"
      description="Three classic XOR bit manipulation tricks: find non-duplicate, swap without temp, and detect differing bits"
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
      onRandomize={() => switchTrick(trick)}
      showInput={false}
      stats={stats}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'XOR swap uses no extra memory — O(1) space',
        'Single non-duplicate detection in O(n) time, O(1) space — beats sorting/hash approaches',
        'Hamming distance via XOR is O(1) after the XOR operation',
      ]}
      disadvantages={[
        'XOR swap has a critical pitfall: same-address aliasing zeroes the value',
        'XOR tricks are non-obvious — readability suffers without comments',
        'For "Single Number II" (triples), XOR alone is insufficient — need more logic',
      ]}
      applications={[
        'Finding unique elements in datasets with pairs',
        'Cryptographic key exchange (Diffie-Hellman uses XOR-like properties)',
        'Checksum and parity calculation',
        'In-place array reversal and swaps in embedded systems',
        'Error detection in communication protocols',
      ]}
      interviewTips={[
        'XOR all elements to find the single non-duplicate — O(n) time, O(1) space',
        'Know a^a=0 and a^0=a — the two axioms that power most XOR tricks',
        'XOR swap alias bug: if a and b are the same variable, result is 0; always guard with i != j',
        'For "Single Number II" use bit counting mod 3, not XOR',
        'Prefix XOR array enables O(1) range XOR queries',
      ]}
      relatedAlgos={[
        { title: 'Counting Set Bits', route: '/counting-set-bits' },
        { title: 'Gray Code', route: '/gray-code' },
      ]}
      practiceProblems={[
        { name: 'Single Number', difficulty: 'Easy', url: 'https://leetcode.com/problems/single-number/' },
        { name: 'Single Number II', difficulty: 'Medium', url: 'https://leetcode.com/problems/single-number-ii/' },
        { name: 'XOR Queries of a Subarray', difficulty: 'Medium', url: 'https://leetcode.com/problems/xor-queries-of-a-subarray/' },
      ]}
    >
      {/* Trick selector */}
      <div className="flex justify-center gap-2 mb-5 flex-wrap">
        {TRICKS.map(t => (
          <button
            key={t.id}
            onClick={() => switchTrick(t.id)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all duration-150 ${
              trick === t.id
                ? 'bg-blue-600 text-white border-blue-600 shadow'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Trick 1: Single Non-Duplicate */}
      {trick === 'single' && (
        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-wrap justify-center gap-2">
            {step.arr.map((v, i) => (
              <div
                key={i}
                className={`flex flex-col items-center rounded-xl border px-4 py-3 transition-all duration-300 ${
                  i === step.activeIdx
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 shadow-lg scale-110'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                }`}
              >
                <span className="font-bold text-lg text-gray-800 dark:text-gray-200">{v}</span>
                <span className="font-mono text-xs text-gray-400">{toBinary8(v)}</span>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Running XOR Result</p>
            <div className="flex justify-center mb-2">
              <BitCells binary={step.xorBinary} highlightMask={null} />
            </div>
            <p className="font-mono text-2xl font-bold text-blue-600 dark:text-blue-400">{step.xorVal}</p>
          </div>

          {step.done && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-8 py-4 text-center">
              <p className="text-emerald-700 dark:text-emerald-300 font-bold text-xl">Single element: {step.xorVal}</p>
            </div>
          )}
        </div>
      )}

      {/* Trick 2: Swap Without Temp */}
      {trick === 'swap' && (
        <div className="flex flex-col items-center gap-5">
          <div className="flex gap-8 justify-center">
            {[
              { label: 'A', val: step.a, bin: step.aBin, active: step.swapPhase === 1 || step.swapPhase === 3 },
              { label: 'B', val: step.b, bin: step.bBin, active: step.swapPhase === 2 },
            ].map(({ label, val, bin, active }) => (
              <div
                key={label}
                className={`flex flex-col items-center rounded-2xl border p-5 transition-all duration-300 ${
                  active
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 shadow-lg'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                }`}
              >
                <span className="text-xs font-bold text-gray-400 uppercase mb-1">{label}</span>
                <span className="font-bold text-2xl text-gray-800 dark:text-gray-200 mb-2">{val}</span>
                <BitCells binary={bin || toBinary8(0)} highlightMask={null} />
              </div>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl px-6 py-3 text-center">
            {step.swapPhase === 0 && <p className="font-mono text-sm text-blue-700 dark:text-blue-300">A ^= B; B ^= A; A ^= B;</p>}
            {step.swapPhase === 1 && <p className="font-mono text-sm text-amber-700 dark:text-amber-300">→ A ^= B (step 1 of 3)</p>}
            {step.swapPhase === 2 && <p className="font-mono text-sm text-amber-700 dark:text-amber-300">→ B ^= A (step 2 of 3)</p>}
            {step.swapPhase === 3 && <p className="font-mono text-sm text-emerald-700 dark:text-emerald-300">→ A ^= B (step 3 of 3) — Done!</p>}
          </div>
        </div>
      )}

      {/* Trick 3: Detect Different Bits */}
      {trick === 'diff' && (
        <div className="flex flex-col items-center gap-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 w-full max-w-lg">
            {[
              { label: `A = ${step.a}`, bin: step.aBin, mask: step.diffBits },
              { label: `B = ${step.b}`, bin: step.bBin, mask: step.diffBits },
            ].map(({ label, bin, mask }) => (
              <div key={label} className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono w-20 text-right text-gray-400">{label}</span>
                <BitCells binary={bin || toBinary8(0)} highlightMask={mask} />
              </div>
            ))}

            {step.diffBits && (
              <>
                <div className="flex items-center gap-3 px-2 py-1">
                  <span className="text-xs font-mono w-20 text-right text-gray-300 dark:text-gray-600">──────</span>
                  <div className="flex gap-1.5">
                    {Array(8).fill(null).map((_, i) => (
                      <div key={i} className="w-8 text-center font-mono text-xs text-gray-400">^</div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono w-20 text-right text-gray-400">A^B = {step.xorVal}</span>
                  <BitCells binary={step.xorBinary} highlightMask={null} />
                </div>
              </>
            )}
          </div>

          {step.done && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl px-8 py-4 text-center">
              <p className="text-amber-700 dark:text-amber-300 font-bold text-xl">
                {step.xorVal.toString(2).split('').filter(c => c === '1').length} bit(s) differ
              </p>
              <p className="text-xs text-amber-500 mt-1">Hamming distance between {step.a} and {step.b}</p>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 justify-center mt-4">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 rounded bg-blue-500"></span> Bit = 1
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 rounded bg-amber-400"></span> Differs / Active
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 rounded bg-gray-200 dark:bg-gray-700"></span> Bit = 0
        </span>
      </div>
    </AlgorithmPageShell>
  );
}
