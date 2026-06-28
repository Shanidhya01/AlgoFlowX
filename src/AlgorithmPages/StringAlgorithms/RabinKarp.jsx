import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const BASE = 31, MOD = 1e9 + 9;

function computeHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * BASE + str.charCodeAt(i)) % MOD;
  return h;
}

function generateSteps(text, pattern) {
  const steps = [];
  const n = text.length, m = pattern.length;
  const patHash = computeHash(pattern);
  let winHash = computeHash(text.slice(0, m));
  const matches = [];

  let pow = 1;
  for (let i = 0; i < m - 1; i++) pow = (pow * BASE) % MOD;

  steps.push({ text, pattern, window: 0, match: -1, matches: [], patHash: Math.round(patHash), winHash: Math.round(winHash), spurious: false, message: `Pattern hash = ${Math.round(patHash)}. Window hash (pos 0) = ${Math.round(winHash)}` });

  for (let i = 0; i <= n - m; i++) {
    const hashMatch = Math.round(winHash) === Math.round(patHash);
    const charMatch = text.slice(i, i + m) === pattern;

    if (hashMatch && charMatch) {
      matches.push(i);
      steps.push({ text, pattern, window: i, match: i, matches: [...matches], patHash: Math.round(patHash), winHash: Math.round(winHash), spurious: false, message: `✅ Hash match + char match at index ${i}! "${pattern}" found.` });
    } else if (hashMatch && !charMatch) {
      steps.push({ text, pattern, window: i, match: -1, matches: [...matches], patHash: Math.round(patHash), winHash: Math.round(winHash), spurious: true, message: `⚠️ Hash collision at ${i} — hashes match but strings differ (spurious hit). Continue...` });
    } else {
      steps.push({ text, pattern, window: i, match: -1, matches: [...matches], patHash: Math.round(patHash), winHash: Math.round(winHash), spurious: false, message: `Index ${i}: window hash ≠ pattern hash → skip` });
    }

    if (i < n - m) {
      winHash = ((winHash - text.charCodeAt(i) * pow % MOD + MOD) * BASE + text.charCodeAt(i + m)) % MOD;
    }
  }

  steps.push({ text, pattern, window: -1, match: -1, matches: [...matches], patHash: Math.round(patHash), winHash: 0, spurious: false, done: true, message: `✅ Done! Found ${matches.length} match${matches.length !== 1 ? 'es' : ''} at index: ${matches.join(', ') || 'none'}` });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="Rolling Hash Magic">
      <p>Rabin-Karp avoids re-computing the hash of each window from scratch. Instead, it uses a <strong>rolling hash</strong>: remove the contribution of the leftmost character and add the new rightmost character in O(1).</p>
      <div className="font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded-xl text-sm mt-2">
        <div>new_hash = (old_hash - text[i] × BASE^(m-1)) × BASE + text[i+m]</div>
      </div>
    </TheorySection>
    <TheorySection title="Hash Collisions">
      <p>Two different strings can produce the same hash (collision). When hashes match, Rabin-Karp verifies with a character-by-character check. This makes worst case O(nm) but average case O(n+m).</p>
      <p className="mt-2">Using a large prime modulus (10⁹+9) keeps collision probability extremely low.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Best/Average', 'O(n + m)', 'O(1)'],
      ['Worst (all collisions)', 'O(nm)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `vector<int> rabinKarp(string text, string pat) {
    int n = text.size(), m = pat.size();
    const long long BASE = 31, MOD = 1e9 + 9;
    long long patHash = 0, winHash = 0, pow = 1;

    for (int i = 0; i < m - 1; i++) pow = pow * BASE % MOD;
    for (int i = 0; i < m; i++) {
        patHash = (patHash * BASE + pat[i]) % MOD;
        winHash = (winHash * BASE + text[i]) % MOD;
    }

    vector<int> matches;
    for (int i = 0; i <= n - m; i++) {
        if (winHash == patHash && text.substr(i, m) == pat)
            matches.push_back(i);
        if (i < n - m)
            winHash = ((winHash - text[i]*pow%MOD+MOD)*BASE + text[i+m]) % MOD;
    }
    return matches;
}`,
    'Python': `def rabin_karp(text, pattern):
    n, m = len(text), len(pattern)
    BASE, MOD = 31, 10**9 + 9
    pow_m = pow(BASE, m - 1, MOD)

    pat_hash = sum(ord(c) * pow(BASE, m-1-i, MOD) for i, c in enumerate(pattern)) % MOD
    win_hash = sum(ord(text[i]) * pow(BASE, m-1-i, MOD) for i in range(m)) % MOD

    matches = []
    for i in range(n - m + 1):
        if win_hash == pat_hash and text[i:i+m] == pattern:
            matches.append(i)
        if i < n - m:
            win_hash = (win_hash - ord(text[i]) * pow_m) * BASE % MOD
            win_hash = (win_hash + ord(text[i + m])) % MOD
    return matches`,
    'JavaScript': `function rabinKarp(text, pattern) {
    const [n, m, BASE, MOD] = [text.length, pattern.length, 31, 1e9 + 9];
    let pow = 1n, patHash = 0n, winHash = 0n;
    const B = BigInt(BASE), M = BigInt(MOD);

    for (let i = 0; i < m - 1; i++) pow = pow * B % M;
    for (let i = 0; i < m; i++) {
        patHash = (patHash * B + BigInt(pattern.charCodeAt(i))) % M;
        winHash = (winHash * B + BigInt(text.charCodeAt(i))) % M;
    }

    const matches = [];
    for (let i = 0; i <= n - m; i++) {
        if (winHash === patHash && text.slice(i, i + m) === pattern) matches.push(i);
        if (i < n - m)
            winHash = ((winHash - BigInt(text.charCodeAt(i)) * pow % M + M) * B + BigInt(text.charCodeAt(i + m))) % M;
    }
    return matches;
}`,
  }} />
);

export default function RabinKarp() {
  const [textVal, setTextVal] = useState('AABAACAADAABAABA');
  const [patVal, setPatVal] = useState('AABA');
  const [inputVal, setInputVal] = useState('AABAACAADAABAABA, AABA');
  const [inputError, setInputError] = useState('');
  const [steps, setSteps] = useState(() => generateSteps('AABAACAADAABAABA', 'AABA'));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleCustomInput = (val) => {
    setInputVal(val);
    const parts = val.split(',').map(s => s.trim().toUpperCase());
    if (parts.length < 2 || !parts[0] || !parts[1]) { setInputError('Enter text, pattern'); return; }
    if (parts[0].length > 40) { setInputError('Text max 40 chars'); return; }
    if (parts[1].length > parts[0].length) { setInputError('Pattern longer than text'); return; }
    setInputError('');
    setTextVal(parts[0]); setPatVal(parts[1]);
    setSteps(generateSteps(parts[0], parts[1]));
    setCurrentStep(0);
    setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const opts = [['AABAACAADAABAABA', 'AABA'], ['GEEKSFORGEEKS', 'GEEK'], ['ABCABCABC', 'ABC'], ['MISSISSIPPI', 'ISS']];
    const [t, p] = opts[Math.floor(Math.random() * opts.length)];
    setTextVal(t); setPatVal(p); setInputVal(`${t}, ${p}`);
    setSteps(generateSteps(t, p));
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

  const { window: win, match, matches, spurious } = step;
  const m = patVal.length;

  return (
    <AlgorithmPageShell
      title="Rabin-Karp Algorithm"
      description="Rolling hash string search — O(n+m) average with hash collision detection"
      category="String Algorithms"
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
      customInput={inputVal}
      onCustomInput={handleCustomInput}
      inputError={inputError}
      inputPlaceholder="text, pattern"
      inputLabel="Text and Pattern"
      stats={{ matches: matches?.length || 0, patHash: step.patHash || 0, winHash: step.winHash || 0 }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
    >
      <div className="space-y-4">
        {/* Pattern row */}
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Pattern</p>
          <div className="flex gap-1">
            {patVal.split('').map((c, i) => (
              <div key={i} className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950 border-2 border-violet-400 dark:border-violet-600 text-violet-700 dark:text-violet-300 font-bold text-sm">{c}</div>
            ))}
          </div>
        </div>

        {/* Text row */}
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Text</p>
          <div className="flex flex-wrap gap-1">
            {textVal.split('').map((c, i) => {
              const inWindow = win >= 0 && i >= win && i < win + m;
              const isMatch = matches?.includes(i - (matches?.find(m => m <= i && i < m + patVal.length) ?? -99) + (matches?.find(m => m <= i && i < m + patVal.length) ?? 0)) || (step.done && matches?.some(mi => i >= mi && i < mi + m));
              const inFinalMatch = step.done && matches?.some(mi => i >= mi && i < mi + m);
              return (
                <div key={i} className={`w-8 h-8 flex flex-col items-center justify-center rounded-lg font-bold text-sm border-2 transition-all duration-150 ${
                  inFinalMatch ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-700 dark:text-emerald-300' :
                  spurious && inWindow ? 'bg-orange-100 dark:bg-orange-950 border-orange-400 text-orange-700 dark:text-orange-300' :
                  match >= 0 && inWindow ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-700 dark:text-emerald-300' :
                  inWindow ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 text-amber-700 dark:text-amber-300' :
                  'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <span>{c}</span>
                  <span className="text-[8px] text-gray-400">{i}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hash comparison */}
        <div className="flex gap-4 flex-wrap">
          <div className="px-3 py-2 rounded-xl bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 text-xs">
            <span className="font-bold text-violet-600 dark:text-violet-400">Pattern hash: </span>
            <span className="font-mono text-gray-700 dark:text-gray-300">{step.patHash}</span>
          </div>
          {win >= 0 && (
            <div className={`px-3 py-2 rounded-xl text-xs border ${
              spurious ? 'bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800' :
              match >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800' :
              'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'
            }`}>
              <span className="font-bold text-amber-600 dark:text-amber-400">Window hash: </span>
              <span className="font-mono text-gray-700 dark:text-gray-300">{step.winHash}</span>
            </div>
          )}
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
