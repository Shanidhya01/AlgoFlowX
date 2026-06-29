import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateFastExpSteps(base, exp, mod) {
  const steps = [];
  const bits = exp.toString(2).split('').map(Number);

  steps.push({
    bits, currentBit: -1, result: 1, currentBase: base % mod,
    powerChain: [], phase: 'init',
    message: `Fast Exponentiation: ${base}^${exp} mod ${mod}. Binary of ${exp} = ${bits.join('')}`,
    done: false,
  });

  // Build power chain: base^1, base^2, base^4 ...
  const powerChain = [];
  let pw = base % mod;
  for (let i = 0; i < bits.length; i++) {
    powerChain.push({ power: Math.pow(2, i), value: pw });
    pw = (pw * pw) % mod;
  }
  // Reverse bits for LSB-first processing
  const reversedBits = [...bits].reverse();
  let result = 1;
  let curBase = base % mod;

  for (let i = 0; i < reversedBits.length; i++) {
    const bit = reversedBits[i];
    const prevResult = result;
    if (bit === 1) {
      result = (result * curBase) % mod;
    }
    const squaredBase = (curBase * curBase) % mod;
    steps.push({
      bits, currentBit: bits.length - 1 - i, result,
      currentBase: curBase, squaredBase,
      powerChain: powerChain.slice(0, i + 1),
      phase: 'process',
      bitActive: bit,
      message: bit === 1
        ? `Bit=${bit}: result = ${prevResult} × ${curBase} mod ${mod} = ${result}; then square base: ${curBase}² mod ${mod} = ${squaredBase}`
        : `Bit=${bit}: skip multiply; square base: ${curBase}² mod ${mod} = ${squaredBase}`,
      done: false,
    });
    curBase = squaredBase;
  }

  steps.push({
    bits, currentBit: -1, result, currentBase: curBase,
    powerChain, phase: 'done',
    message: `Done! ${base}^${exp} mod ${mod} = ${result}`,
    done: true,
  });

  return steps;
}

const theory = (
  <div>
    <TheorySection title="Fast Modular Exponentiation">
      <p>Also called <strong>binary exponentiation</strong> or <strong>exponentiation by squaring</strong>. Instead of multiplying base exp times, it uses the binary representation of exp:</p>
      <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 rounded p-2 my-2">base^exp = (base^(exp/2))² if exp is even</p>
      <p>This reduces O(exp) multiplications to O(log exp) by squaring at each bit.</p>
    </TheorySection>
    <TheorySection title="Why Modular?">
      <p>In cryptography, exponents are enormous (e.g., 2^1024). Taking mod at each step keeps numbers small and prevents overflow while preserving the mathematical result.</p>
    </TheorySection>
    <TheorySection title="Algorithm">
      <ul className="list-disc pl-4 space-y-1">
        <li>Convert exponent to binary</li>
        <li>Start result=1, iterate bits from LSB to MSB</li>
        <li>For each bit=1: multiply result by current power of base</li>
        <li>Always: square current base (base = base² mod m)</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Best', 'O(log exp)', 'O(1)'],
      ['Average', 'O(log exp)', 'O(1)'],
      ['Worst', 'O(log exp)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `// Fast modular exponentiation: base^exp mod m
long long fastPow(long long base, long long exp, long long mod) {
    long long result = 1;
    base %= mod;
    while (exp > 0) {
        if (exp & 1) result = result * base % mod;
        base = base * base % mod;
        exp >>= 1;
    }
    return result;
}`,
    'Python': `def fast_pow(base, exp, mod):
    result = 1
    base %= mod
    while exp > 0:
        if exp & 1:
            result = result * base % mod
        base = base * base % mod
        exp >>= 1
    return result

# Python built-in: pow(base, exp, mod)  # same thing!`,
    'JavaScript': `function fastPow(base, exp, mod) {
    let result = 1n;
    base = BigInt(base) % BigInt(mod);
    exp = BigInt(exp);
    mod = BigInt(mod);
    while (exp > 0n) {
        if (exp & 1n) result = result * base % mod;
        base = base * base % mod;
        exp >>= 1n;
    }
    return Number(result);
}`,
    'Java': `public static long fastPow(long base, long exp, long mod) {
    long result = 1;
    base %= mod;
    while (exp > 0) {
        if ((exp & 1) == 1) result = result * base % mod;
        base = base * base % mod;
        exp >>= 1;
    }
    return result;
}`,
  }} />
);

export default function FastExponentiation() {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(900);
  const timerRef = useRef(null);

  const buildSteps = useCallback((b, e, m) => {
    setSteps(generateFastExpSteps(b, e, m));
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  useEffect(() => { buildSteps(2, 10, 1000); }, [buildSteps]);

  const handleRandomize = useCallback(() => {
    const b = 2 + Math.floor(Math.random() * 8);
    const e = 5 + Math.floor(Math.random() * 20);
    const m = [100, 1000, 97, 1000000007][Math.floor(Math.random() * 4)];
    buildSteps(b, e, m);
  }, [buildSteps]);

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

  const step = steps[currentStep] || { bits: [], currentBit: -1, result: 1, powerChain: [], phase: 'init', message: '', done: false };

  return (
    <AlgorithmPageShell
      title="Fast Exponentiation"
      description="Compute base^exp mod m in O(log exp) using binary exponentiation"
      category="Math"
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
      showInput={false}
      stats={{ result: step.result, step: currentStep, bits: step.bits?.length ?? 0 }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(log exp) multiplications vs O(exp) naive',
        'Works with huge exponents (crypto-scale)',
        'O(1) extra space (iterative version)',
        'Easily extended to matrix exponentiation',
      ]}
      disadvantages={[
        'Requires modular arithmetic for large numbers in JS/Java',
        'Integer overflow risk if mod² > 2^63',
        'More complex than naive for small exponents',
      ]}
      applications={[
        'RSA encryption/decryption',
        'Fermat primality test: a^(p-1) mod p = 1',
        'Miller-Rabin primality test',
        'Fibonacci in O(log n) via matrix exponentiation',
        'Competitive programming modular arithmetic',
      ]}
      interviewTips={[
        'Python pow(b,e,m) is built-in fast exponentiation',
        'Use 1e9+7 as mod to avoid overflow in most problems',
        'Matrix exponentiation: same algorithm with 2×2 matrix multiply',
        'exp & 1 checks last bit (whether exp is odd)',
        'Memorize: result=1, while exp>0 { if exp&1: result*=base; base*=base; exp>>=1 }',
      ]}
      relatedAlgos={[
        { title: 'Miller-Rabin', route: '/math/miller-rabin' },
        { title: 'Extended Euclidean', route: '/math/extended-euclidean' },
        { title: 'Sieve of Eratosthenes', route: '/math/sieve-eratosthenes' },
      ]}
      practiceProblems={[
        { name: 'Pow(x, n)', difficulty: 'Medium', url: 'https://leetcode.com/problems/powx-n/' },
        { name: 'Super Pow', difficulty: 'Medium', url: 'https://leetcode.com/problems/super-pow/' },
        { name: 'Count Good Numbers', difficulty: 'Medium', url: 'https://leetcode.com/problems/count-good-numbers/' },
      ]}
    >
      {/* Binary representation */}
      <div className="mb-4">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">Binary of exponent — process bits right to left:</p>
        <div className="flex gap-1.5 justify-center flex-wrap">
          {(step.bits || []).map((bit, i) => {
            const posFromRight = (step.bits?.length ?? 0) - 1 - i;
            const isActive = step.currentBit === i;
            const isPast = step.currentBit !== -1 && i > step.currentBit;
            return (
              <div key={i} className={`flex flex-col items-center gap-1`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg border-2 transition-all duration-200 ${
                  isActive ? 'border-amber-400 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 scale-110' :
                  isPast ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-600' :
                  bit === 1 ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' :
                  'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>{bit}</div>
                <span className="text-[9px] text-gray-400">2^{posFromRight}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Result box */}
      <div className="flex justify-center gap-6 mb-4">
        <div className={`flex flex-col items-center justify-center w-28 h-20 rounded-2xl border-2 font-bold text-xl transition-all ${
          step.done ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
        }`}>
          <span className="text-xs font-normal text-gray-400 mb-1">result</span>
          {step.result}
        </div>
        <div className="flex flex-col items-center justify-center w-28 h-20 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-xl">
          <span className="text-xs font-normal text-gray-400 mb-1">cur base</span>
          {step.currentBase}
        </div>
      </div>

      {/* Power chain */}
      {step.powerChain && step.powerChain.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">Powers computed by squaring:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {step.powerChain.map((p, i) => (
              <div key={i} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700 text-sky-700 dark:text-sky-300 text-xs font-mono">
                base^{p.power} = {p.value}
              </div>
            ))}
          </div>
        </div>
      )}
    </AlgorithmPageShell>
  );
}
