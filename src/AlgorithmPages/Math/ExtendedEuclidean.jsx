import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateExtGCDSteps(a, b) {
  const steps = [];
  // Forward pass: collect (a, b, q, r) rows
  const rows = [];
  let ca = a, cb = b;

  steps.push({
    rows: [], backRows: [], phase: 'init', highlightRow: -1,
    gcd: null, x: null, y: null,
    message: `Extended Euclidean: find x, y such that ${a}x + ${b}y = gcd(${a}, ${b})`,
    done: false,
  });

  while (cb !== 0) {
    const q = Math.floor(ca / cb);
    const r = ca % cb;
    rows.push({ a: ca, b: cb, q, r });
    steps.push({
      rows: [...rows], backRows: [], phase: 'forward', highlightRow: rows.length - 1,
      gcd: null, x: null, y: null,
      message: `Forward: ${ca} = ${q}×${cb} + ${r}`,
      done: false,
    });
    ca = cb;
    cb = r;
  }

  const gcdVal = ca;
  steps.push({
    rows: [...rows], backRows: [], phase: 'found_gcd', highlightRow: -1,
    gcd: gcdVal, x: null, y: null,
    message: `GCD found = ${gcdVal}. Now back-substitute for Bezout coefficients.`,
    done: false,
  });

  // Back substitution
  let x = 1, y = 0, xp = 0, yp = 1;
  const backRows = [];
  for (let i = rows.length - 1; i >= 0; i--) {
    const { a: ra, b: rb, q } = rows[i];
    // gcd = x*ra - q*xp*rb ... simplified: track x,y for current pair
    const nx = xp;
    const ny = x - q * xp;
    backRows.push({ expr: `${gcdVal} = ${x}×${ra} + (${xp})×${rb} via row ${i + 1}`, x, y: xp });
    steps.push({
      rows: [...rows], backRows: [...backRows], phase: 'back', highlightRow: i,
      gcd: gcdVal, x: null, y: null,
      message: `Back-sub row ${i + 1}: ${gcdVal} = ${x}×${ra} + (${xp})×${rb}`,
      done: false,
    });
    x = nx; xp = ny;
  }

  // Final bezout coefs — recompute correctly
  let bx = 1, by = 0;
  ca = a; cb = b;
  const stack = [];
  while (cb !== 0) {
    stack.push({ q: Math.floor(ca / cb) });
    const r = ca % cb;
    ca = cb; cb = r;
  }
  for (let i = stack.length - 1; i >= 0; i--) {
    const tmp = bx - stack[i].q * by;
    bx = by; by = tmp;
  }
  // bx,by might be swapped depending on direction — verify
  let finalX = bx, finalY = by;
  // swap if needed
  if (a * finalX + b * finalY !== gcdVal) { finalX = by; finalY = bx; }

  steps.push({
    rows: [...rows], backRows: [...backRows], phase: 'done',
    highlightRow: -1, gcd: gcdVal, x: finalX, y: finalY,
    message: `Done! gcd(${a},${b})=${gcdVal}, x=${finalX}, y=${finalY}  ⟹  ${a}×${finalX} + ${b}×${finalY} = ${a * finalX + b * finalY}`,
    done: true,
  });

  return steps;
}

const theory = (
  <div>
    <TheorySection title="Extended Euclidean Algorithm">
      <p>Beyond finding the GCD, the Extended Euclidean Algorithm computes integers x and y (Bezout coefficients) satisfying:</p>
      <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 rounded p-2 my-2">ax + by = gcd(a, b)</p>
      <p>It does this in two passes: a forward Euclidean pass to find the GCD, then a back-substitution pass to express the GCD as a linear combination of a and b.</p>
    </TheorySection>
    <TheorySection title="Modular Inverse">
      <p>If gcd(a, m) = 1, then x from ax + my = 1 gives the modular inverse of a mod m:</p>
      <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 rounded p-2 my-2">a × x ≡ 1 (mod m)</p>
      <p>This is critical for RSA decryption, elliptic curve cryptography, and Chinese Remainder Theorem.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Best', 'O(1)', 'O(1)'],
      ['Average', 'O(log min(a,b))', 'O(log min(a,b))'],
      ['Worst', 'O(log min(a,b))', 'O(log min(a,b))'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `// Returns gcd; x,y are Bezout coefficients: a*x + b*y = gcd
int extGCD(int a, int b, int &x, int &y) {
    if (b == 0) { x = 1; y = 0; return a; }
    int x1, y1;
    int g = extGCD(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

// Modular inverse of a mod m (requires gcd(a,m)=1)
int modInverse(int a, int m) {
    int x, y;
    int g = extGCD(a, m, x, y);
    if (g != 1) return -1;  // no inverse
    return (x % m + m) % m;
}`,
    'Python': `def ext_gcd(a, b):
    if b == 0:
        return a, 1, 0
    g, x1, y1 = ext_gcd(b, a % b)
    return g, y1, x1 - (a // b) * y1

# Iterative version (no recursion)
def ext_gcd_iter(a, b):
    x, y, u, v = 1, 0, 0, 1
    while b:
        q = a // b
        x, u = u, x - q * u
        y, v = v, y - q * v
        a, b = b, a - q * b
    return a, x, y  # gcd, x, y`,
    'JavaScript': `function extGcd(a, b) {
    if (b === 0) return [a, 1, 0];
    const [g, x1, y1] = extGcd(b, a % b);
    return [g, y1, x1 - Math.floor(a / b) * y1];
}

// Iterative
function extGcdIter(a, b) {
    let [x, y, u, v] = [1, 0, 0, 1];
    while (b) {
        const q = Math.floor(a / b);
        [x, u] = [u, x - q * u];
        [y, v] = [v, y - q * v];
        [a, b] = [b, a - q * b];
    }
    return [a, x, y];
}`,
    'Java': `public static int[] extGcd(int a, int b) {
    if (b == 0) return new int[]{a, 1, 0};
    int[] res = extGcd(b, a % b);
    int g = res[0], x1 = res[1], y1 = res[2];
    return new int[]{g, y1, x1 - (a/b)*y1};
}

public static int modInverse(int a, int m) {
    int[] res = extGcd(a, m);
    if (res[0] != 1) return -1;
    return ((res[1] % m) + m) % m;
}`,
  }} />
);

export default function ExtendedEuclidean() {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(900);
  const timerRef = useRef(null);

  const buildSteps = useCallback((a, b) => {
    setSteps(generateExtGCDSteps(a, b));
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  useEffect(() => { buildSteps(35, 15); }, [buildSteps]);

  const handleRandomize = useCallback(() => {
    const a = 20 + Math.floor(Math.random() * 80);
    const b = 5 + Math.floor(Math.random() * 40);
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

  const step = steps[currentStep] || { rows: [], backRows: [], phase: 'init', message: '', done: false, gcd: null, x: null, y: null };

  return (
    <AlgorithmPageShell
      title="Extended Euclidean"
      description="Find Bezout coefficients x, y such that ax + by = gcd(a, b)"
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
      stats={{ gcd: step.gcd ?? '?', x: step.x ?? '?', y: step.y ?? '?' }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Same O(log min(a,b)) complexity as regular GCD',
        'Gives modular inverse directly',
        'Used in Chinese Remainder Theorem',
        'Foundation of RSA and elliptic curve cryptography',
      ]}
      disadvantages={[
        'More complex to implement than basic GCD',
        'Coefficients can be negative',
        'Not needed if only GCD is required',
      ]}
      applications={[
        'RSA key generation — computing private exponent',
        'Modular inverse for Fermat little theorem',
        'Solving linear Diophantine equations',
        'Chinese Remainder Theorem (CRT)',
        'Competitive programming modular arithmetic',
      ]}
      interviewTips={[
        'ax + by = gcd(a,b) always has integer solutions (Bezout identity)',
        'Modular inverse of a mod m exists iff gcd(a,m)=1',
        'The iterative version avoids recursion stack issues',
        'Know that x and y can be negative — normalize with (x%m+m)%m',
      ]}
      relatedAlgos={[
        { title: 'Euclidean GCD', route: '/math/euclidean-gcd' },
        { title: 'Miller-Rabin', route: '/math/miller-rabin' },
        { title: 'Fast Exponentiation', route: '/math/fast-exponentiation' },
      ]}
      practiceProblems={[
        { name: 'Water and Jug Problem', difficulty: 'Medium', url: 'https://leetcode.com/problems/water-and-jug-problem/' },
        { name: 'X of a Kind in a Deck', difficulty: 'Easy', url: 'https://leetcode.com/problems/x-of-a-kind-in-a-deck-of-cards/' },
      ]}
    >
      {/* Phase indicator */}
      <div className="flex gap-2 mb-4 justify-center">
        {['forward', 'found_gcd', 'back', 'done'].map(ph => (
          <span key={ph} className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-all ${
            step.phase === ph ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
          }`}>{ph === 'found_gcd' ? 'GCD Found' : ph === 'back' ? 'Back-Sub' : ph.charAt(0).toUpperCase() + ph.slice(1)}</span>
        ))}
      </div>

      {/* Forward table */}
      {step.rows && step.rows.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">Forward pass (Euclidean divisions):</p>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">a</th>
                  <th className="px-3 py-2 text-left">b</th>
                  <th className="px-3 py-2 text-left">q</th>
                  <th className="px-3 py-2 text-left">r = a mod b</th>
                </tr>
              </thead>
              <tbody>
                {step.rows.map((r, i) => (
                  <tr key={i} className={`border-t border-gray-100 dark:border-gray-700 transition-all ${
                    step.highlightRow === i ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    <td className="px-3 py-1.5">{i + 1}</td>
                    <td className="px-3 py-1.5">{r.a}</td>
                    <td className="px-3 py-1.5">{r.b}</td>
                    <td className="px-3 py-1.5">{r.q}</td>
                    <td className="px-3 py-1.5 font-bold text-amber-600 dark:text-amber-400">{r.r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Back substitution */}
      {step.backRows && step.backRows.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">Back-substitution (Bezout coefficients):</p>
          <div className="space-y-1">
            {step.backRows.map((r, i) => (
              <div key={i} className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${
                i === step.backRows.length - 1 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}>{r.expr}</div>
            ))}
          </div>
        </div>
      )}

      {/* Final result */}
      {step.done && step.x != null && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-center">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            gcd = {step.gcd} &nbsp;|&nbsp; x = {step.x} &nbsp;|&nbsp; y = {step.y}
          </p>
        </div>
      )}
    </AlgorithmPageShell>
  );
}
