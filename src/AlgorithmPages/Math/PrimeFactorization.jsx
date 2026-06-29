import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generatePrimeFactorSteps(n) {
  const steps = [];
  let remaining = n;
  const factors = [];

  steps.push({
    n, remaining, factors: [], currentDivisor: 2, phase: 'init',
    message: `Prime Factorization of ${n}. Start with divisor = 2.`,
    done: false,
  });

  let d = 2;
  while (d * d <= remaining) {
    if (remaining % d === 0) {
      factors.push(d);
      remaining = Math.floor(remaining / d);
      steps.push({
        n, remaining, factors: [...factors], currentDivisor: d, phase: 'divide',
        message: `${remaining * d} ÷ ${d} = ${remaining}  →  factor ${d} found!`,
        done: false,
      });
    } else {
      const nextD = d + (d === 2 ? 1 : 2);
      steps.push({
        n, remaining, factors: [...factors], currentDivisor: d, phase: 'skip',
        message: `${remaining} is not divisible by ${d}. Try ${nextD}.`,
        done: false,
      });
      d = nextD;
    }
  }

  if (remaining > 1) {
    factors.push(remaining);
    steps.push({
      n, remaining: 1, factors: [...factors], currentDivisor: remaining, phase: 'last',
      message: `Remaining ${remaining} is prime  →  factor ${remaining} found!`,
      done: false,
    });
  }

  // Format result
  const countMap = {};
  factors.forEach(f => { countMap[f] = (countMap[f] || 0) + 1; });
  const formatted = Object.entries(countMap).map(([p, c]) => c > 1 ? `${p}^${c}` : `${p}`).join(' × ');

  steps.push({
    n, remaining: 1, factors: [...factors], currentDivisor: -1, phase: 'done',
    message: `Done! ${n} = ${formatted}`,
    countMap, formatted,
    done: true,
  });

  return steps;
}

const theory = (
  <div>
    <TheorySection title="Trial Division">
      <p>The simplest factorization method. Divide n by every integer from 2 up to √n. Any factor greater than √n must be prime (there can be at most one such factor).</p>
      <p>Optimization: after checking 2, only check odd numbers — this halves the iterations.</p>
    </TheorySection>
    <TheorySection title="Key Insight">
      <p>If n has no prime factor ≤ √n, then n itself is prime. This gives us both a primality test and factorization in O(√n).</p>
    </TheorySection>
    <TheorySection title="Faster Methods">
      <ul className="list-disc pl-4 space-y-1">
        <li>Pollard's Rho: O(n^(1/4)) — used in practice for large n</li>
        <li>General Number Field Sieve: sub-exponential — used for RSA-scale numbers</li>
        <li>For small n (≤ 10^7): precompute smallest prime factors using sieve</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Best', 'O(1)', 'O(log n)'],
      ['Average', 'O(√n)', 'O(log n)'],
      ['Worst', 'O(√n)', 'O(log n)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `vector<int> primeFactors(int n) {
    vector<int> factors;
    for (int d = 2; (long long)d * d <= n; d += (d == 2 ? 1 : 2)) {
        while (n % d == 0) {
            factors.push_back(d);
            n /= d;
        }
    }
    if (n > 1) factors.push_back(n);
    return factors;
}

// With exponents
map<int,int> factorize(int n) {
    map<int,int> f;
    for (int d = 2; d * d <= n; d++)
        while (n % d == 0) { f[d]++; n /= d; }
    if (n > 1) f[n]++;
    return f;
}`,
    'Python': `def prime_factors(n):
    factors = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors.append(d)
            n //= d
        d += 1
    if n > 1:
        factors.append(n)
    return factors

from collections import Counter
def factorize(n):
    return Counter(prime_factors(n))`,
    'JavaScript': `function primeFactors(n) {
    const factors = [];
    for (let d = 2; d * d <= n; d++) {
        while (n % d === 0) {
            factors.push(d);
            n = Math.floor(n / d);
        }
    }
    if (n > 1) factors.push(n);
    return factors;
}`,
    'Java': `public static List<Integer> primeFactors(int n) {
    List<Integer> factors = new ArrayList<>();
    for (int d = 2; (long)d * d <= n; d++) {
        while (n % d == 0) {
            factors.add(d);
            n /= d;
        }
    }
    if (n > 1) factors.add(n);
    return factors;
}`,
  }} />
);

export default function PrimeFactorization() {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const timerRef = useRef(null);

  const buildSteps = useCallback((n) => {
    setSteps(generatePrimeFactorSteps(n));
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  useEffect(() => { buildSteps(360); }, [buildSteps]);

  const handleRandomize = useCallback(() => {
    const ns = [360, 720, 120, 210, 630, 1260, 180, 504, 2310];
    buildSteps(ns[Math.floor(Math.random() * ns.length)]);
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

  const step = steps[currentStep] || { n: 360, remaining: 360, factors: [], currentDivisor: 2, phase: 'init', message: '', done: false };

  // Count occurrences for display
  const countMap = {};
  (step.factors || []).forEach(f => { countMap[f] = (countMap[f] || 0) + 1; });
  const uniqueFactors = Object.entries(countMap);

  return (
    <AlgorithmPageShell
      title="Prime Factorization"
      description="Decompose a number into its prime factors using trial division — O(√n)"
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
      stats={{ n: step.n, divisor: step.currentDivisor, remaining: step.remaining, factors: step.factors?.length ?? 0 }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Simple O(√n) algorithm, easy to implement',
        'Gives exact prime factorization with exponents',
        'Works for any integer ≥ 2',
        'Can be sped up to O(log n) using a sieve precomputation',
      ]}
      disadvantages={[
        'O(√n) is slow for very large n (e.g., 10^18)',
        'Not suitable for cryptographic-scale numbers',
        'Better algorithms exist: Pollard Rho, GNFS',
      ]}
      applications={[
        'Computing LCM and GCD',
        'Checking if a number is perfect/abundant/deficient',
        'Counting divisors: (e1+1)(e2+1)...',
        'Number theory problems in competitive programming',
        'RSA relies on hardness of factoring large numbers',
      ]}
      interviewTips={[
        'Only iterate to √n — remaining > 1 after loop means it is prime',
        'Optimize: check 2 separately, then only odd numbers',
        'Number of divisors = product of (exponent+1) for each prime factor',
        'Precompute smallest prime factor (SPF) sieve for O(log n) factorization',
      ]}
      relatedAlgos={[
        { title: 'Sieve of Eratosthenes', route: '/math/sieve-eratosthenes' },
        { title: 'Miller-Rabin', route: '/math/miller-rabin' },
        { title: 'Euclidean GCD', route: '/math/euclidean-gcd' },
      ]}
      practiceProblems={[
        { name: 'Count Primes', difficulty: 'Medium', url: 'https://leetcode.com/problems/count-primes/' },
        { name: 'Ugly Number II', difficulty: 'Medium', url: 'https://leetcode.com/problems/ugly-number-ii/' },
        { name: '2 Keys Keyboard', difficulty: 'Medium', url: 'https://leetcode.com/problems/2-keys-keyboard/' },
      ]}
    >
      {/* Large number display */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className={`flex flex-col items-center justify-center w-32 h-24 rounded-2xl border-2 font-bold text-3xl transition-all ${
          step.phase === 'divide' ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
          step.done ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
          'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
        }`}>
          {step.remaining}
          <span className="text-xs font-normal text-gray-400 mt-1">remaining</span>
        </div>
        {step.currentDivisor > 0 && !step.done && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-gray-400 text-sm">÷</span>
            <div className={`w-14 h-14 rounded-xl border-2 font-bold text-lg flex items-center justify-center transition-all ${
              step.phase === 'divide' ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' :
              'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}>{step.currentDivisor}</div>
            <span className="text-xs text-gray-400">divisor</span>
          </div>
        )}
      </div>

      {/* Discovered factors as chips */}
      {uniqueFactors.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">Factors found:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {uniqueFactors.map(([prime, count]) => (
              <div key={prime} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                {prime}{count > 1 && <sup className="text-xs">{count}</sup>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final factorization */}
      {step.done && step.formatted && (
        <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700">
          <p className="text-base font-semibold text-emerald-700 dark:text-emerald-300 font-mono">
            {step.n} = {step.formatted}
          </p>
        </div>
      )}

      {/* Factor list (all occurrences) */}
      {step.factors && step.factors.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium">All prime factors (with repeats):</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {step.factors.map((f, i) => (
              <span key={i} className="px-2 py-0.5 rounded-lg bg-sky-100 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700 text-sky-700 dark:text-sky-300 text-xs font-mono">{f}</span>
            ))}
          </div>
        </div>
      )}
    </AlgorithmPageShell>
  );
}
