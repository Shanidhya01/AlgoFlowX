import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function buildBadChar(pattern) {
  const table = {};
  for (let i = 0; i < pattern.length; i++) table[pattern[i]] = i;
  return table;
}

function generateSteps(text, pattern) {
  const steps = [];
  const n = text.length, m = pattern.length;
  if (m === 0 || m > n) return [{ text, pattern, shift: 0, j: -1, matches: [], comparisons: 0, shifts: 0, done: true, message: 'Invalid input.' }];

  const badChar = buildBadChar(pattern);
  let comparisons = 0, shifts = 0;
  const matches = [];
  let s = 0;

  steps.push({ text, pattern, shift: s, j: -1, matches: [], comparisons, shifts, badChar, message: `Bad character table built. Starting alignment at position 0.` });

  while (s <= n - m) {
    let j = m - 1;
    steps.push({ text, pattern, shift: s, j, matches: [...matches], comparisons, shifts, badChar, comparing: true, message: `Aligned pattern at shift ${s}. Comparing right-to-left from j=${j}` });

    while (j >= 0 && pattern[j] === text[s + j]) {
      comparisons++;
      steps.push({ text, pattern, shift: s, j, matches: [...matches], comparisons, shifts, badChar, match: true, message: `text[${s + j}]='${text[s + j]}' == pattern[${j}]='${pattern[j]}' ✓` });
      j--;
    }

    if (j < 0) {
      matches.push(s);
      steps.push({ text, pattern, shift: s, j: -1, matches: [...matches], comparisons, shifts, badChar, fullMatch: true, message: `Match found at index ${s}!` });
      const skip = m - (badChar[text[s + m]] ?? -1) - 1;
      s += Math.max(1, skip);
      shifts++;
    } else {
      comparisons++;
      const bc = badChar[text[s + j]] ?? -1;
      const skip = Math.max(1, j - bc);
      steps.push({ text, pattern, shift: s, j, matches: [...matches], comparisons, shifts, badChar, mismatch: true, skip, bcVal: bc, message: `Mismatch: text[${s + j}]='${text[s + j]}' ≠ pattern[${j}]='${pattern[j]}'. Bad char '${text[s + j]}' last at ${bc}. Skip by ${skip}.` });
      s += skip;
      shifts++;
    }
  }

  steps.push({ text, pattern, shift: -1, j: -1, matches: [...matches], comparisons, shifts, badChar, done: true, message: `Done! Found ${matches.length} match(es) at: [${matches.join(', ') || 'none'}]. Comparisons: ${comparisons}, Shifts: ${shifts}.` });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="Bad Character Heuristic">
      <p>When a mismatch occurs at text[s+j] with pattern[j], Boyer-Moore looks up the last occurrence of text[s+j] in the pattern. If the character doesn't exist in the pattern at all, we can skip the entire pattern length.</p>
      <div className="font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded-xl text-sm mt-2">
        skip = max(1, j - badChar[text[s+j]])
      </div>
    </TheorySection>
    <TheorySection title="Right-to-Left Comparison">
      <p>Unlike KMP which scans left-to-right, Boyer-Moore compares right-to-left. This enables larger jumps — when the rightmost character of the window doesn't match and isn't in the pattern, the entire window can be skipped.</p>
      <p className="mt-2">The full Boyer-Moore also uses the <strong>good suffix heuristic</strong>, but even the bad character rule alone gives sub-linear average performance on typical text.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Preprocessing', 'O(m + σ)', 'O(σ)'],
      ['Best/Average', 'O(n/m)', 'O(m + σ)'],
      ['Worst Case', 'O(nm)', 'O(m + σ)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `vector<int> boyerMoore(string text, string pat) {
    int n = text.size(), m = pat.size();
    // Bad character table
    vector<int> bc(256, -1);
    for (int i = 0; i < m; i++) bc[(int)pat[i]] = i;

    vector<int> matches;
    int s = 0;
    while (s <= n - m) {
        int j = m - 1;
        while (j >= 0 && pat[j] == text[s + j]) j--;
        if (j < 0) {
            matches.push_back(s);
            s += (s + m < n) ? m - bc[(int)text[s + m]] : 1;
        } else {
            s += max(1, j - bc[(int)text[s + j]]);
        }
    }
    return matches;
}`,
    'Python': `def boyer_moore(text, pattern):
    n, m = len(text), len(pattern)
    # Bad character table
    bc = {c: i for i, c in enumerate(pattern)}

    matches = []
    s = 0
    while s <= n - m:
        j = m - 1
        while j >= 0 and pattern[j] == text[s + j]:
            j -= 1
        if j < 0:
            matches.append(s)
            s += m - bc.get(text[s + m], -1) if s + m < n else 1
        else:
            s += max(1, j - bc.get(text[s + j], -1))
    return matches`,
    'JavaScript': `function boyerMoore(text, pattern) {
    const n = text.length, m = pattern.length;
    const bc = {};
    for (let i = 0; i < m; i++) bc[pattern[i]] = i;

    const matches = [];
    let s = 0;
    while (s <= n - m) {
        let j = m - 1;
        while (j >= 0 && pattern[j] === text[s + j]) j--;
        if (j < 0) {
            matches.push(s);
            s += (s + m < n) ? m - (bc[text[s + m]] ?? -1) : 1;
        } else {
            s += Math.max(1, j - (bc[text[s + j]] ?? -1));
        }
    }
    return matches;
}`,
  }} />
);

const PRESETS = [
  ['AABAACAADAABAABA', 'AABA'],
  ['GEEKSFORGEEKS', 'GEEK'],
  ['ABCABCABCABC', 'ABC'],
  ['MISSISSIPPI', 'ISS'],
];

export default function BoyerMoore() {
  const [textVal, setTextVal] = useState('GEEKSFORGEEKS');
  const [patVal, setPatVal] = useState('GEEK');
  const [inputVal, setInputVal] = useState('GEEKSFORGEEKS, GEEK');
  const [inputError, setInputError] = useState('');
  const [steps, setSteps] = useState(() => generateSteps('GEEKSFORGEEKS', 'GEEK'));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleCustomInput = (val) => {
    setInputVal(val);
    const parts = val.split(',').map(s => s.trim().toUpperCase());
    if (parts.length < 2 || !parts[0] || !parts[1]) { setInputError('Enter: text, pattern'); return; }
    if (parts[0].length > 40) { setInputError('Text max 40 chars'); return; }
    if (parts[1].length > parts[0].length) { setInputError('Pattern longer than text'); return; }
    setInputError('');
    setTextVal(parts[0]); setPatVal(parts[1]);
    setSteps(generateSteps(parts[0], parts[1]));
    setCurrentStep(0); setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const [t, p] = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    setTextVal(t); setPatVal(p); setInputVal(`${t}, ${p}`);
    setSteps(generateSteps(t, p));
    setCurrentStep(0); setIsRunning(false);
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

  const { shift, j, matches, mismatch, fullMatch, skip } = step;
  const m = patVal.length;

  return (
    <AlgorithmPageShell
      title="Boyer-Moore Algorithm"
      description="Right-to-left string search with bad character heuristic — O(n/m) average"
      category="String Algorithms"
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
      customInput={inputVal}
      onCustomInput={handleCustomInput}
      inputError={inputError}
      inputPlaceholder="text, pattern"
      inputLabel="Text and Pattern"
      stats={{ comparisons: step.comparisons || 0, shifts: step.shifts || 0, matches: matches?.length || 0 }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={['Sub-linear best/average case O(n/m)', 'Highly efficient for large alphabets', 'Most practical string search in real applications', 'Works especially well with long patterns']}
      disadvantages={['Worst case O(nm) on repetitive patterns', 'Complex implementation with full good-suffix rule', 'Pre-processing overhead for short texts', 'Cache unfriendly due to backward scan']}
      applications={['Text editors (grep, find/replace)', 'Antivirus signature scanning', 'DNA sequence matching', 'Intrusion detection systems', 'Search engines']}
      interviewTips={['Understand bad character vs good suffix rules', 'Know why right-to-left scanning enables bigger jumps', 'Be able to trace through the bad character table', 'Mention that simplified version is commonly asked']}
      relatedAlgos={['KMP Pattern Matcher', 'Rabin-Karp Algorithm', 'Z Algorithm', 'Aho-Corasick']}
      practiceProblems={[
        { name: 'Find All Occurrences of Pattern', difficulty: 'Medium' },
        { name: 'Implement strStr()', difficulty: 'Easy' },
        { name: 'Repeated Substring Pattern', difficulty: 'Easy' },
      ]}
    >
      <div className="space-y-5">
        {/* Text row */}
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Text</p>
          <div className="flex flex-wrap gap-1">
            {textVal.split('').map((c, i) => {
              const inWindow = shift >= 0 && i >= shift && i < shift + m;
              const isCurrent = shift >= 0 && j >= 0 && i === shift + j;
              const inFinalMatch = step.done && matches?.some(mi => i >= mi && i < mi + m);
              const inMatch = fullMatch && inWindow;
              return (
                <div key={i} className={`relative w-8 h-10 flex flex-col items-center justify-center rounded-lg font-bold text-sm border-2 transition-all duration-150 ${
                  inFinalMatch ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-700 dark:text-emerald-300' :
                  inMatch ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-700 dark:text-emerald-300' :
                  isCurrent && mismatch ? 'bg-red-100 dark:bg-red-950 border-red-400 text-red-700 dark:text-red-300 scale-110' :
                  isCurrent ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 text-amber-700 dark:text-amber-300 scale-110' :
                  inWindow ? 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' :
                  'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <span>{c}</span>
                  <span className="text-[8px] text-gray-400">{i}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pattern row aligned under text */}
        {shift >= 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Pattern (shift={shift})</p>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: shift }, (_, i) => (
                <div key={`pad-${i}`} className="w-8 h-10 opacity-0" />
              ))}
              {patVal.split('').map((c, pi) => {
                const isCurrent = pi === j;
                const matched = j < 0 || pi > j;
                return (
                  <div key={pi} className={`w-8 h-10 flex flex-col items-center justify-center rounded-lg font-bold text-sm border-2 transition-all duration-150 ${
                    fullMatch ? 'bg-emerald-200 dark:bg-emerald-900 border-emerald-500 text-emerald-800 dark:text-emerald-200' :
                    isCurrent && mismatch ? 'bg-red-200 dark:bg-red-900 border-red-500 text-red-800 dark:text-red-200 scale-110' :
                    isCurrent ? 'bg-amber-200 dark:bg-amber-900 border-amber-500 text-amber-800 dark:text-amber-200 scale-110' :
                    matched ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-300 text-emerald-700 dark:text-emerald-400' :
                    'bg-violet-100 dark:bg-violet-950 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300'
                  }`}>
                    <span>{c}</span>
                    <span className="text-[8px] text-gray-400">{pi}</span>
                  </div>
                );
              })}
              {mismatch && skip && (
                <div className="ml-2 flex items-center text-xs font-bold text-orange-500 dark:text-orange-400">
                  → skip {skip}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bad char table */}
        {step.badChar && (
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Bad Character Table</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(step.badChar).map(([ch, idx]) => (
                <div key={ch} className={`px-2 py-1 rounded-lg text-xs border font-mono ${
                  shift >= 0 && j >= 0 && textVal[shift + j] === ch
                    ? 'bg-orange-100 dark:bg-orange-950 border-orange-300 text-orange-700 dark:text-orange-300 font-bold'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  '{ch}' → {idx}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Match list */}
        {matches?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase">Matches:</span>
            {matches.map(mi => (
              <span key={mi} className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold">index {mi}</span>
            ))}
          </div>
        )}
      </div>
    </AlgorithmPageShell>
  );
}
