import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function modPow(base, exp, mod) {
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
}

function generateMillerRabinSteps(n) {
  const steps = [];

  if (n < 2) {
    steps.push({ n, r: 0, d: 0, witnesses: [], phase: 'done', isPrime: false, round: 0, message: `${n} < 2, not prime`, done: true });
    return steps;
  }

  steps.push({ n, r: 0, d: 0, witnesses: [], phase: 'init', isPrime: null, round: 0, message: `Miller-Rabin primality test for n = ${n}`, done: false });

  // Small primes
  const smallPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23];
  if (smallPrimes.includes(n)) {
    steps.push({ n, r: 0, d: 0, witnesses: [], phase: 'done', isPrime: true, round: 0, message: `${n} is in the known prime list → PRIME`, done: true });
    return steps;
  }
  if (n % 2 === 0) {
    steps.push({ n, r: 0, d: 0, witnesses: [], phase: 'done', isPrime: false, round: 0, message: `${n} is even → COMPOSITE`, done: true });
    return steps;
  }

  // Write n-1 = 2^r * d
  let r = 0, d = n - 1;
  while (d % 2 === 0) { d = Math.floor(d / 2); r++; }

  steps.push({
    n, r, d, witnesses: [], phase: 'decompose', isPrime: null, round: 0,
    message: `n-1 = ${n - 1} = 2^${r} × ${d}`,
    done: false,
  });

  // Deterministic witnesses for n < 3,215,031,751
  const witnessSet = [2, 3, 5, 7].filter(w => w < n);
  const witnessResults = [];

  for (let wi = 0; wi < witnessSet.length; wi++) {
    const a = witnessSet[wi];
    let x = modPow(a, d, n);
    const roundSteps = [{ x, desc: `a^d mod n = ${a}^${d} mod ${n} = ${x}` }];

    let composite = false;
    if (x !== 1 && x !== n - 1) {
      let passed = false;
      for (let s = 0; s < r - 1; s++) {
        x = modPow(x, 2, n);
        roundSteps.push({ x, desc: `Square: x = ${x}` });
        if (x === n - 1) { passed = true; break; }
      }
      if (!passed) composite = true;
    }

    const result = composite ? 'COMPOSITE' : 'PASS';
    witnessResults.push({ a, result, roundSteps });

    steps.push({
      n, r, d, witnesses: [...witnessResults], phase: 'witness', isPrime: composite ? false : null,
      round: wi + 1,
      message: `Witness a=${a}: ${result === 'PASS' ? 'passed' : 'COMPOSITE DETECTED — not prime!'}`,
      done: composite,
    });

    if (composite) return steps;
  }

  steps.push({
    n, r, d, witnesses: [...witnessResults], phase: 'done', isPrime: true,
    round: witnessSet.length,
    message: `All ${witnessSet.length} witnesses passed → ${n} is PRIME (deterministic for n < 3.2B)`,
    done: true,
  });

  return steps;
}

const theory = (
  <div>
    <TheorySection title="Miller-Rabin Primality Test">
      <p>A probabilistic primality test based on Fermat's little theorem. For a prime p and witness a:</p>
      <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 rounded p-2 my-2">Either a^d ≡ 1 (mod n)  OR  a^(2^r × d) ≡ -1 (mod n) for some r</p>
      <p>If these conditions fail for any witness, n is definitely composite. With enough witnesses, we get a highly confident (or deterministic) primality proof.</p>
    </TheorySection>
    <TheorySection title="Deterministic Version">
      <p>For n &lt; 3,215,031,751: witnesses {'{2, 3, 5, 7}'} suffice for a deterministic result.</p>
      <p>For n &lt; 3.3×10^24: witnesses {'{2, 3, 5, 7, 11, 13, 17, 19, 23}'} work deterministically.</p>
    </TheorySection>
    <TheorySection title="Algorithm Steps">
      <ul className="list-disc pl-4 space-y-1">
        <li>Write n-1 = 2^r × d (factor out powers of 2)</li>
        <li>For each witness a: compute x = a^d mod n</li>
        <li>If x ≠ 1 and x ≠ n-1: square r-1 times, if still ≠ n-1 → composite</li>
        <li>If all witnesses pass → probably prime</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Deterministic', 'O(k log²n log log n)', 'O(1)'],
      ['Probabilistic', 'O(k log²n)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `typedef long long ll;
ll mulmod(ll a, ll b, ll m) { return (__int128)a * b % m; }
ll powmod(ll a, ll b, ll m) {
    ll res = 1; a %= m;
    for (; b > 0; b >>= 1) {
        if (b & 1) res = mulmod(res, a, m);
        a = mulmod(a, a, m);
    }
    return res;
}
bool millerTest(ll n, ll a) {
    if (n % a == 0) return n == a;
    ll d = n - 1; int r = 0;
    while (d % 2 == 0) { d /= 2; r++; }
    ll x = powmod(a, d, n);
    if (x == 1 || x == n - 1) return true;
    for (int s = 0; s < r - 1; s++) {
        x = mulmod(x, x, n);
        if (x == n - 1) return true;
    }
    return false;
}
bool isPrime(ll n) {
    if (n < 2) return false;
    for (ll a : {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37})
        if (!millerTest(n, a)) return false;
    return true;
}`,
    'Python': `def miller_rabin(n, a):
    if n % a == 0: return n == a
    d, r = n - 1, 0
    while d % 2 == 0:
        d //= 2; r += 1
    x = pow(a, d, n)
    if x in (1, n - 1): return True
    for _ in range(r - 1):
        x = x * x % n
        if x == n - 1: return True
    return False

def is_prime(n):
    if n < 2: return False
    for a in [2, 3, 5, 7, 11, 13, 17, 19, 23]:
        if n == a: return True
        if not miller_rabin(n, a): return False
    return True`,
    'JavaScript': `function modPow(base, exp, mod) {
    let result = 1n;
    base = BigInt(base) % BigInt(mod);
    mod = BigInt(mod);
    exp = BigInt(exp);
    while (exp > 0n) {
        if (exp & 1n) result = result * base % mod;
        base = base * base % mod;
        exp >>= 1n;
    }
    return result;
}
function isPrime(n) {
    if (n < 2) return false;
    const witnesses = [2,3,5,7,11,13,17,19,23];
    let d = n - 1, r = 0;
    while (d % 2 === 0) { d >>= 1; r++; }
    outer: for (const a of witnesses) {
        if (a >= n) continue;
        let x = modPow(a, d, n);
        if (x === 1n || x === BigInt(n-1)) continue;
        for (let s = 0; s < r - 1; s++) {
            x = x * x % BigInt(n);
            if (x === BigInt(n-1)) continue outer;
        }
        return false;
    }
    return true;
}`,
    'Java': `public static boolean millerTest(long n, long a) {
    if (n % a == 0) return n == a;
    long d = n - 1; int r = 0;
    while (d % 2 == 0) { d /= 2; r++; }
    long x = modPow(a, d, n);
    if (x == 1 || x == n - 1) return true;
    for (int s = 0; s < r - 1; s++) {
        x = x * x % n;
        if (x == n - 1) return true;
    }
    return false;
}
public static boolean isPrime(long n) {
    for (long a : new long[]{2,3,5,7,11,13,17,19,23})
        if (n != a && !millerTest(n, a)) return false;
    return n >= 2;
}`,
  }} />
);

export default function MillerRabin() {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(900);
  const timerRef = useRef(null);

  const buildSteps = useCallback((n) => {
    setSteps(generateMillerRabinSteps(n));
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  useEffect(() => { buildSteps(97); }, [buildSteps]);

  const handleRandomize = useCallback(() => {
    const ns = [97, 91, 53, 77, 101, 143, 211, 221, 37, 49];
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

  const step = steps[currentStep] || { n: 97, r: 0, d: 0, witnesses: [], phase: 'init', isPrime: null, round: 0, message: '', done: false };

  return (
    <AlgorithmPageShell
      title="Miller-Rabin"
      description="Deterministic primality test using witnesses — O(k log²n)"
      category="Math"
      difficulty="Hard"
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
      stats={{ n: step.n, isPrime: step.isPrime == null ? '?' : step.isPrime ? 'YES' : 'NO', round: step.round }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(k log²n) vs O(√n) trial division',
        'Deterministic with fixed witness sets for bounded n',
        'Handles n up to 3.3×10^24 with 9 witnesses',
        'Foundation of probabilistic primality testing',
      ]}
      disadvantages={[
        'More complex than trial division',
        'Requires BigInt arithmetic in JavaScript/Java for large n',
        'Probabilistic version can give false positives (Carmichael numbers)',
      ]}
      applications={[
        'RSA key generation — finding large primes',
        'Cryptographic protocol setup',
        'Number theory research',
        'Competitive programming with large prime checks',
      ]}
      interviewTips={[
        'n-1 = 2^r × d decomposition is the key setup step',
        'Witnesses [2,3,5,7] are enough for n < 3.2 billion',
        'Python pow(a,d,n) uses fast modular exponentiation',
        'Understand difference: probabilistic (random witnesses) vs deterministic (fixed witnesses)',
      ]}
      relatedAlgos={[
        { title: 'Fast Exponentiation', route: '/math/fast-exponentiation' },
        { title: 'Prime Factorization', route: '/math/prime-factorization' },
        { title: 'Sieve of Eratosthenes', route: '/math/sieve-eratosthenes' },
      ]}
      practiceProblems={[
        { name: 'Count Primes', difficulty: 'Medium', url: 'https://leetcode.com/problems/count-primes/' },
        { name: 'Closest Prime Numbers in Range', difficulty: 'Medium', url: 'https://leetcode.com/problems/closest-prime-numbers-in-range/' },
      ]}
    >
      {/* n display */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className={`flex flex-col items-center justify-center w-28 h-24 rounded-2xl border-2 font-bold text-3xl transition-all ${
          step.isPrime === true ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
          step.isPrime === false ? 'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
          'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
        }`}>
          {step.n}
          <span className="text-xs font-normal text-gray-400 mt-1">n</span>
        </div>
        {step.r > 0 && (
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Decomposition</p>
            <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300">
              n-1 = 2<sup>{step.r}</sup> × {step.d}
            </p>
          </div>
        )}
        {step.done && (
          <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 font-bold text-lg ${
            step.isPrime ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
            'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}>
            {step.isPrime ? 'PRIME' : 'COMPOSITE'}
          </div>
        )}
      </div>

      {/* Witness result cards */}
      {step.witnesses && step.witnesses.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">Witness test results:</p>
          <div className="grid grid-cols-2 gap-2">
            {step.witnesses.map((w, i) => (
              <div key={i} className={`p-3 rounded-xl border-2 text-sm font-semibold text-center transition-all ${
                w.result === 'PASS'
                  ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                <div className="text-lg">a = {w.a}</div>
                <div className={`text-xs mt-1 font-bold ${w.result === 'PASS' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {w.result === 'PASS' ? '✓ PASS' : '✗ COMPOSITE'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AlgorithmPageShell>
  );
}
