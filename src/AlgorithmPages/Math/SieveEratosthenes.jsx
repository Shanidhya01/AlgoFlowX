import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateSieveSteps(limit) {
  const steps = [];
  const sieve = Array(limit + 1).fill(true);
  sieve[0] = sieve[1] = false;

  steps.push({ sieve: [...sieve], current: -1, marking: -1, primes: [], message: `Sieve initialized for n = ${limit}. All numbers marked as prime.` });

  const primesSoFar = [];

  for (let p = 2; p * p <= limit; p++) {
    if (!sieve[p]) continue;

    primesSoFar.push(p);
    steps.push({ sieve: [...sieve], current: p, marking: -1, primes: [...primesSoFar], message: `${p} is prime — marking all multiples of ${p} as composite` });

    for (let mul = p * p; mul <= limit; mul += p) {
      sieve[mul] = false;
      steps.push({ sieve: [...sieve], current: p, marking: mul, primes: [...primesSoFar], message: `Marking ${mul} = ${p} × ${mul / p} as composite` });
    }
  }

  const allPrimes = [];
  for (let i = 2; i <= limit; i++) if (sieve[i]) allPrimes.push(i);

  steps.push({ sieve: [...sieve], current: -1, marking: -1, primes: allPrimes, done: true, message: `✅ Found ${allPrimes.length} primes up to ${limit}: ${allPrimes.join(', ')}` });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="How the Sieve Works">
      <p>The Sieve of Eratosthenes finds all primes up to n by starting with 2 (the smallest prime) and marking all its multiples as composite. Then it moves to the next unmarked number (which must be prime) and repeats.</p>
      <p>Key optimization: we only need to mark multiples starting from p², because all smaller multiples of p would have already been marked by a smaller prime.</p>
      <p>We only need to check primes up to √n because any composite number ≤ n must have a factor ≤ √n.</p>
    </TheorySection>
    <TheorySection title="Applications">
      <ul className="list-disc pl-4 space-y-1">
        <li>Cryptography — RSA key generation</li>
        <li>Number theory problems in competitive programming</li>
        <li>Finding prime factorizations quickly</li>
        <li>Goldbach's conjecture verification</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['All cases', 'O(n log log n)', 'O(n)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `vector<bool> sieve(int n) {
    vector<bool> is_prime(n + 1, true);
    is_prime[0] = is_prime[1] = false;
    for (int p = 2; p * p <= n; p++) {
        if (is_prime[p]) {
            for (int mul = p * p; mul <= n; mul += p)
                is_prime[mul] = false;
        }
    }
    return is_prime; // is_prime[i] = true means i is prime
}`,
    'Python': `def sieve_of_eratosthenes(n):
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    p = 2
    while p * p <= n:
        if is_prime[p]:
            for multiple in range(p * p, n + 1, p):
                is_prime[multiple] = False
        p += 1
    return [i for i in range(2, n + 1) if is_prime[i]]`,
    'JavaScript': `function sieve(n) {
    const isPrime = new Array(n + 1).fill(true);
    isPrime[0] = isPrime[1] = false;
    for (let p = 2; p * p <= n; p++) {
        if (isPrime[p]) {
            for (let mul = p * p; mul <= n; mul += p)
                isPrime[mul] = false;
        }
    }
    return isPrime.map((v, i) => v ? i : null).filter(Boolean);
}`,
  }} />
);

export default function SieveEratosthenes() {
  const [limitVal, setLimitVal] = useState('60');
  const [inputError, setInputError] = useState('');
  const [steps, setSteps] = useState(() => generateSieveSteps(60));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(300);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleCustomInput = (val) => {
    setLimitVal(val);
    const n = parseInt(val.trim());
    if (isNaN(n) || n < 5) { setInputError('Enter a number ≥ 5'); return; }
    if (n > 150) { setInputError('Max 150 for visualization'); return; }
    setInputError('');
    setSteps(generateSieveSteps(n));
    setCurrentStep(0);
    setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const n = [50, 60, 80, 100][Math.floor(Math.random() * 4)];
    setLimitVal(String(n));
    setSteps(generateSieveSteps(n));
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

  const limit = parseInt(limitVal) || 60;

  return (
    <AlgorithmPageShell
      title="Sieve of Eratosthenes"
      description="Find all primes up to n by iteratively marking multiples of each prime as composite"
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
      customInput={limitVal}
      onCustomInput={handleCustomInput}
      inputError={inputError}
      inputPlaceholder="e.g. 60"
      inputLabel="Limit (n)"
      stats={{ limit, primesFound: step.primes?.length || 0, current: step.current >= 0 ? `p=${step.current}` : '—' }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
    >
      <div className="flex flex-wrap gap-1.5 justify-center">
        {Array.from({ length: limit + 1 }, (_, i) => i).filter(i => i >= 2).map(i => {
          const isPrime = step.sieve[i];
          const isCurrent = step.current === i;
          const isMarking = step.marking === i;
          return (
            <div
              key={i}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold border transition-all duration-150 ${
                step.done && isPrime ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-700 dark:text-emerald-300' :
                isMarking ? 'bg-red-100 dark:bg-red-950 border-red-400 text-red-700 dark:text-red-400 scale-110' :
                isCurrent ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 text-amber-700 dark:text-amber-300 scale-105' :
                isPrime ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-300' :
                'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 line-through opacity-50'
              }`}
            >
              {i}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-3 justify-center flex-wrap text-xs">
        {[['bg-blue-300', 'Prime'], ['bg-amber-400', 'Current p'], ['bg-red-400', 'Marking composite'], ['bg-emerald-400', 'Confirmed prime'], ['bg-gray-200 dark:bg-gray-700', 'Composite']].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${c} inline-block`} />{l}
          </span>
        ))}
      </div>
    </AlgorithmPageShell>
  );
}
