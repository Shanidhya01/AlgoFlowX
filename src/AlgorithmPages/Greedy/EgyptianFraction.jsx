import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

function generateEgyptianSteps(numIn, denIn) {
  const steps = [];
  let num = numIn, den = denIn;

  steps.push({
    num, den, terms: [], step: 0, phase: 'init',
    bar: num / den, remaining: num / den,
    message: `Egyptian Fraction: decompose ${num}/${den} into unit fractions (1/k)`,
    done: false,
  });

  const terms = [];
  let iter = 0;
  while (num !== 0 && iter < 20) {
    iter++;
    // Smallest unit fraction ≤ num/den is 1/ceil(den/num)
    const unitDen = Math.ceil(den / num);
    terms.push(unitDen);

    // Subtract: num/den - 1/unitDen = (num*unitDen - den) / (den*unitDen)
    const newNum = num * unitDen - den;
    const newDen = den * unitDen;
    const g = gcd(newNum, newDen);
    const prevNum = num, prevDen = den;
    num = newNum / g;
    den = newDen / g;

    steps.push({
      num, den, terms: [...terms], step: iter, phase: iter === 0 ? 'done' : 'subtract',
      bar: numIn / denIn,
      remaining: num === 0 ? 0 : num / den,
      message: `${prevNum}/${prevDen} − 1/${unitDen} = ${num === 0 ? '0' : `${num}/${den}`}`,
      done: false,
    });

    if (num === 0) break;
  }

  const expr = terms.map(d => `1/${d}`).join(' + ');
  steps.push({
    num: 0, den: 1, terms: [...terms], step: iter, phase: 'done',
    bar: numIn / denIn, remaining: 0,
    message: `Done! ${numIn}/${denIn} = ${expr}`,
    expr,
    done: true,
  });

  return steps;
}

const theory = (
  <div>
    <TheorySection title="Egyptian Fraction Decomposition">
      <p>Ancient Egyptians (2000 BC) expressed all fractions as sums of distinct unit fractions (1/n). The greedy algorithm, attributed to Fibonacci (1202 AD), finds the decomposition:</p>
      <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 rounded p-2 my-2">At each step: take the largest unit fraction ≤ remaining, subtract it</p>
      <p>The unit fraction is 1/⌈denominator/numerator⌉.</p>
    </TheorySection>
    <TheorySection title="Termination">
      <p>The algorithm always terminates because after each step, the numerator of the remainder strictly decreases. The number of terms is at most O(n) for n/d, but in practice very small.</p>
    </TheorySection>
    <TheorySection title="Fibonacci-Sylvester Series">
      <p>A related decomposition (Sylvester sequence) generates a series where each term's denominator is one more than the product of all previous denominators, giving extremely fast convergence.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Steps', 'O(n) worst case', 'O(n)'],
      ['Termination', 'Always (numerator decreases)', '—'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `#include <bits/stdc++.h>
void egyptianFraction(int num, int den) {
    vector<pair<int,int>> terms;
    while (num != 0) {
        int unitDen = (den + num - 1) / num; // ceil(den/num)
        terms.push_back({1, unitDen});
        int newNum = num * unitDen - den;
        int newDen = den * unitDen;
        int g = __gcd(newNum, newDen);
        num = newNum / g;
        den = newDen / g;
    }
    for (auto [n, d] : terms)
        cout << n << "/" << d << " ";
}`,
    'Python': `from math import gcd, ceil

def egyptian_fraction(num, den):
    terms = []
    while num != 0:
        unit_den = ceil(den / num)
        terms.append((1, unit_den))
        num = num * unit_den - den
        den = den * unit_den
        g = gcd(num, den)
        num //= g; den //= g
    return terms

# Example: egyptian_fraction(7, 12)
# → [(1,2), (1,12)]  since 7/12 = 1/2 + 1/12`,
    'JavaScript': `function egyptianFraction(num, den) {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const terms = [];
    while (num !== 0) {
        const unitDen = Math.ceil(den / num);
        terms.push([1, unitDen]);
        const newNum = num * unitDen - den;
        const newDen = den * unitDen;
        const g = gcd(newNum, newDen);
        num = newNum / g;
        den = newDen / g;
    }
    return terms;
}`,
    'Java': `import java.util.*;
public static List<int[]> egyptianFraction(int num, int den) {
    List<int[]> terms = new ArrayList<>();
    while (num != 0) {
        int unitDen = (den + num - 1) / num;
        terms.add(new int[]{1, unitDen});
        int newNum = num * unitDen - den;
        int newDen = den * unitDen;
        int g = gcd(newNum, newDen);
        num = newNum / g; den = newDen / g;
    }
    return terms;
}`,
  }} />
);

const EXAMPLES = [
  { num: 7, den: 12 },
  { num: 2, den: 3 },
  { num: 5, den: 6 },
  { num: 3, den: 7 },
  { num: 4, den: 5 },
];

export default function EgyptianFraction() {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(800);
  const timerRef = useRef(null);

  const buildSteps = useCallback((num, den) => {
    setSteps(generateEgyptianSteps(num, den));
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  useEffect(() => { buildSteps(7, 12); }, [buildSteps]);

  const handleRandomize = useCallback(() => {
    const ex = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
    buildSteps(ex.num, ex.den);
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

  const step = steps[currentStep] || { num: 7, den: 12, terms: [], step: 0, phase: 'init', bar: 7 / 12, remaining: 7 / 12, message: '', done: false };
  const initFrac = steps[0] ? steps[0].bar : 7 / 12;

  // Colors for unit fraction blocks
  const COLORS = ['bg-indigo-400', 'bg-amber-400', 'bg-emerald-400', 'bg-pink-400', 'bg-sky-400', 'bg-violet-400'];

  return (
    <AlgorithmPageShell
      title="Egyptian Fraction"
      description="Decompose any fraction into a sum of distinct unit fractions (1/k) using the greedy algorithm"
      category="Greedy"
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
      stats={{ numerator: step.num, denominator: step.den, terms: step.terms?.length ?? 0, step: step.step }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Simple greedy — always terminates',
        'Produces distinct unit fractions (no repeats)',
        'Small number of terms in practice',
        'Historical significance — matches ancient Egyptian math',
      ]}
      disadvantages={[
        'May not produce the minimal number of terms',
        'Denominators can grow exponentially',
        'O(n) worst case can be very large',
      ]}
      applications={[
        'Ancient Egyptian mathematics',
        'Fractions with distinct unit denominators',
        'Teaching greedy algorithm principles',
        'Number theory and recreational mathematics',
      ]}
      interviewTips={[
        'Unit fraction for p/q: take 1/⌈q/p⌉ (ceiling division)',
        'The numerator strictly decreases each step — guarantees termination',
        'Denominators can grow very fast (Sylvester sequence)',
        'Ask clarifying questions: is distinct required? minimal terms?',
      ]}
      relatedAlgos={[
        { title: 'Fractional Knapsack', route: '/greedy/fractional-knapsack' },
        { title: 'Huffman Coding', route: '/greedy/huffman' },
        { title: 'Euclidean GCD', route: '/math/euclidean-gcd' },
      ]}
      practiceProblems={[
        { name: 'Egyptian Fractions (GFG)', difficulty: 'Medium', url: 'https://www.geeksforgeeks.org/greedy-algorithm-egyptian-fraction/' },
      ]}
    >
      {/* Number line visualization */}
      <div className="mb-6">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">Number line [0, 1]:</p>
        <div className="relative h-10 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Unit fraction blocks */}
          {(step.terms || []).map((d, i) => {
            const w = (1 / d) * 100;
            const left = (step.terms || []).slice(0, i).reduce((sum, dd) => sum + (1 / dd) * 100, 0);
            return (
              <div
                key={i}
                className={`absolute top-0 h-full ${COLORS[i % COLORS.length]} opacity-80 flex items-center justify-center text-white text-xs font-bold transition-all duration-300`}
                style={{ left: `${left}%`, width: `${w}%` }}
              >
                {w > 8 ? `1/${d}` : ''}
              </div>
            );
          })}
          {/* Remaining */}
          {step.remaining > 0.001 && (
            <div
              className="absolute top-0 h-full bg-gray-300 dark:bg-gray-600 opacity-50"
              style={{
                left: `${(1 - step.remaining) * 100}%`,
                width: `${step.remaining * 100}%`,
              }}
            />
          )}
          {/* Target line */}
          <div
            className="absolute top-0 h-full border-r-2 border-dashed border-red-400"
            style={{ left: `${initFrac * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span className="text-red-400">target</span>
          <span>1</span>
        </div>
      </div>

      {/* Current fraction */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="text-center">
          <span className="text-xs text-gray-400">remaining</span>
          <div className={`text-2xl font-bold font-mono mt-1 ${step.remaining < 0.001 ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
            {step.remaining < 0.001 ? '0' : `${step.num}/${step.den}`}
          </div>
        </div>
      </div>

      {/* Unit fraction terms */}
      {step.terms && step.terms.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">Unit fractions found:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {step.terms.map((d, i) => (
              <div key={i} className={`px-3 py-1.5 rounded-full border-2 text-sm font-bold ${COLORS[i % COLORS.length].replace('bg-', 'border-')} bg-opacity-20 text-gray-700 dark:text-gray-300`}>
                1/{d}
              </div>
            ))}
          </div>
          {step.done && step.expr && (
            <div className="mt-3 text-center">
              <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{steps[0]?.bar.toFixed(4) !== undefined ? `${steps[0].num ?? ''}/${steps[0].den ?? ''}` : ''} = </span>
              <span className="text-sm font-mono font-semibold text-emerald-600 dark:text-emerald-400">{step.expr}</span>
            </div>
          )}
        </div>
      )}
    </AlgorithmPageShell>
  );
}
