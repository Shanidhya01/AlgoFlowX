import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateGCDSteps(a, b) {
  const steps = [];
  const pairs = [];
  let ca = a, cb = b;

  steps.push({
    a: ca, b: cb, quotient: null, remainder: null, equation: null,
    pairs: [], phase: 'init', gcd: null,
    message: `Start: gcd(${a}, ${b}). Apply Euclidean algorithm: gcd(a,b) = gcd(b, a mod b)`,
    done: false,
  });

  while (cb !== 0) {
    const q = Math.floor(ca / cb);
    const r = ca % cb;
    pairs.push({ a: ca, b: cb, q, r });
    steps.push({
      a: ca, b: cb, quotient: q, remainder: r,
      equation: `${ca} = ${q} × ${cb} + ${r}`,
      pairs: [...pairs], phase: 'divide', gcd: null,
      message: `${ca} = ${q} × ${cb} + ${r}  →  gcd(${ca}, ${cb}) = gcd(${cb}, ${r})`,
      done: false,
    });
    ca = cb;
    cb = r;
  }

  steps.push({
    a: ca, b: cb, quotient: null, remainder: 0,
    equation: `gcd = ${ca}`,
    pairs: [...pairs], phase: 'done', gcd: ca,
    message: `b = 0, so GCD(${a}, ${b}) = ${ca}`,
    done: true,
  });

  return steps;
}

const theory = (
  <div>
    <TheorySection title="How Euclidean GCD Works">
      <p>The Euclidean algorithm is based on the property: <strong>gcd(a, b) = gcd(b, a mod b)</strong>. Repeatedly apply this until the remainder is 0 — the last non-zero value is the GCD.</p>
      <p>It is one of the oldest algorithms (circa 300 BC) and remains one of the most efficient for computing greatest common divisors.</p>
    </TheorySection>
    <TheorySection title="Extended Euclidean Algorithm">
      <p>The Extended Euclidean algorithm additionally finds integers x and y (Bezout coefficients) such that:</p>
      <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 rounded p-2 mt-1">ax + by = gcd(a, b)</p>
      <p>These coefficients are essential for computing modular inverses in cryptography (RSA, Diffie-Hellman).</p>
    </TheorySection>
    <TheorySection title="Key Properties">
      <ul className="list-disc pl-4 space-y-1">
        <li>gcd(a, 0) = a (base case)</li>
        <li>gcd(a, b) = gcd(b, a mod b) (recursive step)</li>
        <li>Number of steps is O(log(min(a,b)))</li>
        <li>The remainders decrease by at least half every two steps (Fibonacci worst case)</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Best', 'O(1)', 'O(1)'],
      ['Average', 'O(log min(a,b))', 'O(1)'],
      ['Worst', 'O(log min(a,b))', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `// Euclidean GCD
int gcd(int a, int b) {
    while (b != 0) {
        int r = a % b;
        a = b;
        b = r;
    }
    return a;  // or: return b == 0 ? a : gcd(b, a % b);
}

// Extended Euclidean (Bezout coefficients)
int extGCD(int a, int b, int &x, int &y) {
    if (b == 0) { x = 1; y = 0; return a; }
    int x1, y1;
    int g = extGCD(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}`,
    'Python': `def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

# Extended Euclidean
def ext_gcd(a, b):
    if b == 0:
        return a, 1, 0
    g, x1, y1 = ext_gcd(b, a % b)
    return g, y1, x1 - (a // b) * y1

# Usage: g, x, y = ext_gcd(35, 15)
# => g=5, 35x + 15y = 5`,
    'JavaScript': `function gcd(a, b) {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}

function extGcd(a, b) {
    if (b === 0) return [a, 1, 0];
    const [g, x1, y1] = extGcd(b, a % b);
    return [g, y1, x1 - Math.floor(a / b) * y1];
}`,
    'Java': `public static int gcd(int a, int b) {
    while (b != 0) {
        int r = a % b;
        a = b; b = r;
    }
    return a;
}

public static int[] extGcd(int a, int b) {
    if (b == 0) return new int[]{a, 1, 0};
    int[] res = extGcd(b, a % b);
    return new int[]{res[0], res[2],
        res[1] - (a / b) * res[2]};
}`,
  }} />
);

export default function EuclideanGCD() {
  const [inputA, setInputA] = useState(48);
  const [inputB, setInputB] = useState(18);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(800);
  const timerRef = useRef(null);

  const buildSteps = useCallback((a, b) => {
    setSteps(generateGCDSteps(a, b));
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  useEffect(() => { buildSteps(48, 18); }, [buildSteps]);

  const handleRandomize = useCallback(() => {
    const a = 20 + Math.floor(Math.random() * 80);
    const b = 5 + Math.floor(Math.random() * 50);
    setInputA(a); setInputB(b);
    buildSteps(a, b);
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

  const step = steps[currentStep] || { a: 48, b: 18, pairs: [], phase: 'init', message: '', done: false };

  return (
    <AlgorithmPageShell
      title="Euclidean GCD"
      description="Compute the Greatest Common Divisor using the Euclidean algorithm — gcd(a,b) = gcd(b, a mod b)"
      category="Math"
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
      stats={{ a: step.a, b: step.b, gcd: step.gcd ?? '?', steps: currentStep }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(log min(a,b)) time — extremely fast',
        'O(1) space — iterative version needs no stack',
        'Numerically stable, no overflow risk with modulo',
        'Extended version solves ax+by=gcd for cryptography',
      ]}
      disadvantages={[
        'Only works for integers',
        'Does not directly give prime factorization',
        'Recursive version can stack overflow for very large inputs',
      ]}
      applications={[
        'Simplifying fractions',
        'RSA key generation (modular inverse via Extended GCD)',
        'LCM computation: lcm(a,b) = a*b / gcd(a,b)',
        'Cryptographic protocols',
        'Synchronization and scheduling problems',
      ]}
      interviewTips={[
        'Know both recursive and iterative versions',
        'LCM = (a * b) / gcd(a, b) — watch for overflow with large numbers',
        'Extended GCD is used to find modular inverse: a^-1 mod m',
        'Fibonacci numbers are the worst case for Euclidean algorithm',
        'Python has math.gcd() built in since 3.5',
      ]}
      relatedAlgos={[
        { title: 'Extended Euclidean', route: '/math/extended-euclidean' },
        { title: 'Prime Factorization', route: '/math/prime-factorization' },
        { title: 'Sieve of Eratosthenes', route: '/math/sieve-eratosthenes' },
      ]}
      practiceProblems={[
        { name: 'Find GCD of Array', difficulty: 'Easy', url: 'https://leetcode.com/problems/find-greatest-common-divisor-of-array/' },
        { name: 'Smallest Even Multiple', difficulty: 'Easy', url: 'https://leetcode.com/problems/smallest-even-multiple/' },
        { name: 'Water and Jug Problem', difficulty: 'Medium', url: 'https://leetcode.com/problems/water-and-jug-problem/' },
      ]}
    >
      {/* Two number boxes */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 font-bold text-2xl transition-all duration-300 ${
          step.phase === 'divide' ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
        }`}>
          <span className="text-xs font-normal text-gray-400 mb-1">a</span>
          {step.a}
        </div>
        <div className="text-2xl text-gray-400 font-bold">mod</div>
        <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 font-bold text-2xl transition-all duration-300 ${
          step.phase === 'divide' ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
        }`}>
          <span className="text-xs font-normal text-gray-400 mb-1">b</span>
          {step.b}
        </div>
        {step.gcd != null && (
          <>
            <div className="text-2xl text-gray-400 font-bold">=</div>
            <div className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold text-2xl">
              <span className="text-xs font-normal text-gray-400 mb-1">GCD</span>
              {step.gcd}
            </div>
          </>
        )}
      </div>

      {/* Current equation */}
      {step.equation && (
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 font-mono text-sm text-gray-700 dark:text-gray-300">
            {step.equation}
          </span>
        </div>
      )}

      {/* Staircase of (a,b) pairs */}
      {step.pairs && step.pairs.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">Division staircase:</p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {step.pairs.map((p, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono transition-all duration-200 ${
                i === step.pairs.length - 1 ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400'
              }`}>
                <span className="text-gray-400 text-xs w-4">{i + 1}.</span>
                <span>{p.a} = {p.q} × {p.b} + <strong className="text-amber-600 dark:text-amber-400">{p.r}</strong></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AlgorithmPageShell>
  );
}
