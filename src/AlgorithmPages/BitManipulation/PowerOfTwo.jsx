import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function toBinary8(n) {
  return (n >>> 0).toString(2).padStart(8, '0');
}

function generateSteps(n) {
  const steps = [];
  const isPow2 = n > 0 && (n & (n - 1)) === 0;
  const nMinus1 = n - 1;
  const andResult = n & nMinus1;
  const nBin = toBinary8(n);
  const nm1Bin = toBinary8(nMinus1);
  const andBin = toBinary8(andResult);

  steps.push({
    phase: 'show_n',
    n,
    nMinus1,
    andResult,
    nBin,
    nm1Bin,
    andBin,
    activeRow: 'n',
    isPow2,
    message: `n = ${n} in binary: ${nBin}. Let's check if it's a power of two.`,
    done: false,
  });

  steps.push({
    phase: 'show_nm1',
    n,
    nMinus1,
    andResult,
    nBin,
    nm1Bin,
    andBin,
    activeRow: 'nm1',
    isPow2,
    message: `n - 1 = ${nMinus1} in binary: ${nm1Bin}. Notice how bits flip below and including the lowest set bit.`,
    done: false,
  });

  steps.push({
    phase: 'show_and',
    n,
    nMinus1,
    andResult,
    nBin,
    nm1Bin,
    andBin,
    activeRow: 'and',
    isPow2,
    message: `n & (n-1) = ${n} & ${nMinus1} = ${andResult} (${andBin}). ${andResult === 0 ? 'Result is zero!' : 'Result is non-zero.'}`,
    done: false,
  });

  steps.push({
    phase: 'result',
    n,
    nMinus1,
    andResult,
    nBin,
    nm1Bin,
    andBin,
    activeRow: 'result',
    isPow2,
    message: isPow2
      ? `${n} IS a power of two! n > 0 and n & (n-1) == 0, so exactly one bit is set.`
      : `${n} is NOT a power of two. n & (n-1) = ${andResult} ≠ 0, so more than one bit was set.`,
    done: true,
  });

  return steps;
}

const POWERS_OF_TWO = [1, 2, 4, 8, 16, 32, 64, 128];

function BitRow({ binary, label, highlight, activeRow, rowKey }) {
  const isActive = activeRow === rowKey;
  return (
    <div className={`flex items-center gap-3 p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-50 dark:bg-blue-950/40' : ''}`}>
      <span className={`text-xs font-mono w-20 text-right font-bold ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
        {label}
      </span>
      <div className="flex gap-1.5">
        {binary.split('').map((bit, idx) => {
          let cellClass = bit === '1'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
          if (highlight && bit === '1') cellClass = 'bg-amber-400 text-white';
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
    </div>
  );
}

const theory = (
  <div>
    <TheorySection title="Why Powers of Two Have Exactly One Set Bit">
      <p>
        A power of two in binary always looks like: 1, 10, 100, 1000, etc. — exactly one bit is 1.
        Subtracting 1 from such a number flips all bits up to and including that single set bit:
        e.g., 8 = 1000, 8-1 = 0111. ANDing them gives 0000.
      </p>
    </TheorySection>
    <TheorySection title="The Check: n &gt; 0 &amp;&amp; (n &amp; (n-1)) == 0">
      <p>
        The condition <code>n &amp; (n-1) == 0</code> is true when n has exactly one set bit.
        We must also check <code>n &gt; 0</code> because 0 satisfies the bitwise condition but is NOT a power of two.
      </p>
    </TheorySection>
    <TheorySection title="Edge Cases">
      <ul className="list-disc pl-4 space-y-1">
        <li><strong>n = 0:</strong> 0 & -1 = 0 but 0 is not a power of two — always check n &gt; 0.</li>
        <li><strong>Negative numbers:</strong> In two's complement, negative numbers have many set bits, so the check correctly returns false.</li>
        <li><strong>n = 1:</strong> 1 &amp; 0 = 0 — yes, 2⁰ = 1 is a power of two.</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Check isPow2', 'O(1)', 'O(1)'],
      ['List all pow2 up to N', 'O(log N)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `bool isPowerOfTwo(int n) {
    return n > 0 && (n & (n - 1)) == 0;
}

// List all powers of 2 up to limit
void listPowers(int limit) {
    for (int p = 1; p <= limit; p <<= 1) {
        cout << p << " ";
    }
}`,
    'Python': `def is_power_of_two(n: int) -> bool:
    return n > 0 and (n & (n - 1)) == 0

# List all powers of 2 up to limit
def list_powers(limit: int):
    p = 1
    while p <= limit:
        print(p, end=' ')
        p <<= 1`,
    'JavaScript': `function isPowerOfTwo(n) {
    return n > 0 && (n & (n - 1)) === 0;
}

function listPowers(limit) {
    const result = [];
    for (let p = 1; p <= limit; p <<= 1) {
        result.push(p);
    }
    return result;
}`,
    'Java': `public class PowerOfTwo {
    public static boolean isPowerOfTwo(int n) {
        return n > 0 && (n & (n - 1)) == 0;
    }

    public static List<Integer> listPowers(int limit) {
        List<Integer> result = new ArrayList<>();
        for (int p = 1; p <= limit; p <<= 1) {
            result.add(p);
        }
        return result;
    }
}`,
  }} />
);

const DEFAULT_N = 16;

export default function PowerOfTwo() {
  const [inputVal, setInputVal] = useState(String(DEFAULT_N));
  const [inputError, setInputError] = useState('');
  const [steps, setSteps] = useState(() => generateSteps(DEFAULT_N));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleCustomInput = (val) => {
    setInputVal(val);
    const num = parseInt(val.trim(), 10);
    if (isNaN(num) || num < 1 || num > 255) {
      setInputError('Enter a number between 1 and 255');
      return;
    }
    setInputError('');
    setSteps(generateSteps(num));
    setCurrentStep(0);
    setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const num = Math.floor(Math.random() * 254) + 1;
    setInputVal(String(num));
    setInputError('');
    setSteps(generateSteps(num));
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

  return (
    <AlgorithmPageShell
      title="Power of Two"
      description="Detect if a number is a power of two using the bit trick: n > 0 && (n & (n-1)) == 0"
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
      inputPlaceholder="e.g. 16"
      inputLabel="Number (1–255)"
      showInput={true}
      stats={{ n: step.n, binary: step.nBin, isPowerOfTwo: step.isPow2 ? 'Yes' : 'No' }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(1) constant time — single bitwise AND operation',
        'No loops or division required',
        'Works for any word size without modification',
      ]}
      disadvantages={[
        'Edge case: n = 0 must be handled explicitly (0 & -1 == 0 but 0 is not a power of 2)',
        'Does not directly find which power of two n is (need log₂ for that)',
      ]}
      applications={[
        'Memory allocators check alignment (must be power of 2)',
        'Hash table sizing — capacity kept as power of 2 for fast modulo',
        'Texture sizes in graphics (OpenGL requires power-of-2 textures in older versions)',
        'Network packet sizes and buffer allocation',
        'Loop unrolling and vectorization boundary checks',
      ]}
      interviewTips={[
        'The trick n & (n-1) == 0 is O(1) and should be your go-to answer',
        'Always mention the n > 0 edge case — interviewers watch for it',
        'Can also use n > 0 && (n & -n) == n (isolate lowest bit, equals n means only one bit)',
        'Power of Four: additionally check n % 3 == 1 or use the mask 0x55555555',
        'log2(n) approach also works but is floating-point and slower',
      ]}
      relatedAlgos={[
        { title: 'Counting Set Bits', route: '/counting-set-bits' },
        { title: 'XOR Tricks', route: '/xor-tricks' },
      ]}
      practiceProblems={[
        { name: 'Power of Two', difficulty: 'Easy', url: 'https://leetcode.com/problems/power-of-two/' },
        { name: 'Power of Four', difficulty: 'Easy', url: 'https://leetcode.com/problems/power-of-four/' },
        { name: 'Power of Three', difficulty: 'Easy', url: 'https://leetcode.com/problems/power-of-three/' },
      ]}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Bit rows */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 w-full max-w-lg">
          <div className="flex items-center gap-3 mb-1 pl-2">
            <span className="text-xs font-mono w-20 text-right text-gray-400">Bit:</span>
            <div className="flex gap-1.5">
              {[7,6,5,4,3,2,1,0].map(b => (
                <div key={b} className="w-8 text-center font-mono text-xs text-gray-400 dark:text-gray-500">{b}</div>
              ))}
            </div>
          </div>

          <BitRow
            binary={step.nBin}
            label={`n = ${step.n}`}
            highlight={false}
            activeRow={step.activeRow}
            rowKey="n"
          />

          {step.phase !== 'show_n' && (
            <BitRow
              binary={step.nm1Bin}
              label={`n-1 = ${step.nMinus1}`}
              highlight={false}
              activeRow={step.activeRow}
              rowKey="nm1"
            />
          )}

          {(step.phase === 'show_and' || step.phase === 'result') && (
            <>
              <div className="flex items-center gap-3 px-2 py-1">
                <span className="text-xs font-mono w-20 text-right text-gray-300 dark:text-gray-600">──────</span>
                <div className="flex gap-1.5">
                  {Array(8).fill(null).map((_, i) => (
                    <div key={i} className="w-8 text-center font-mono text-xs text-gray-400">&amp;</div>
                  ))}
                </div>
              </div>
              <BitRow
                binary={step.andBin}
                label={`n&(n-1) = ${step.andResult}`}
                highlight={step.andResult !== 0}
                activeRow={step.activeRow}
                rowKey="and"
              />
            </>
          )}
        </div>

        {/* Result */}
        {step.phase === 'result' && (
          <div className={`rounded-2xl border px-8 py-4 text-center ${
            step.isPow2
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800'
          }`}>
            <p className={`text-2xl font-bold ${step.isPow2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {step.isPow2 ? 'IS Power of Two' : 'NOT Power of Two'}
            </p>
            <p className={`text-sm mt-1 ${step.isPow2 ? 'text-emerald-500' : 'text-red-500'}`}>
              {step.n} {step.isPow2 ? `= 2^${Math.log2(step.n)}` : 'has multiple set bits'}
            </p>
          </div>
        )}

        {/* Reference grid */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 w-full max-w-lg">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">Powers of 2 Reference</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {POWERS_OF_TWO.map((p) => {
              const isN = p === step.n;
              return (
                <div
                  key={p}
                  className={`flex flex-col items-center rounded-xl border px-3 py-2 transition-all duration-200 ${
                    isN
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <span className="font-bold text-sm">{p}</span>
                  <span className="font-mono text-xs opacity-70">{toBinary8(p).replace(/^0+/, '') || '0'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
