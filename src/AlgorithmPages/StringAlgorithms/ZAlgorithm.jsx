import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateSteps(text, pattern) {
  const steps = [];
  const combined = pattern + '$' + text;
  const n = combined.length;
  const Z = Array(n).fill(0);
  let l = 0, r = 0;
  const matches = [];

  steps.push({ combined, Z: [...Z], l, r, i: 0, pattern, text, matches: [], phase: 'init', message: `Combined string: "${combined}". Computing Z-array (Z[i] = length of prefix match at position i)` });

  for (let i = 1; i < n; i++) {
    if (i < r) {
      Z[i] = Math.min(r - i, Z[i - l]);
      steps.push({ combined, Z: [...Z], l, r, i, pattern, text, matches: [...matches], phase: 'mirror', message: `i=${i} inside Z-box [${l},${r}). Mirror: Z[${i}] = min(${r - i}, Z[${i - l}]=${Z[i - l]}) = ${Z[i]}` });
    }
    while (i + Z[i] < n && combined[Z[i]] === combined[i + Z[i]]) {
      Z[i]++;
    }
    if (Z[i] > 0 && i + Z[i] > r) {
      l = i; r = i + Z[i];
    }
    const isMatch = Z[i] === pattern.length;
    if (isMatch) {
      const textIdx = i - pattern.length - 1;
      matches.push(textIdx);
    }
    steps.push({ combined, Z: [...Z], l, r, i, pattern, text, matches: [...matches], phase: Z[i] > 0 ? 'expand' : 'skip', isMatch, message: isMatch ? `Z[${i}]=${Z[i]} == pattern.length=${pattern.length} → Match at text[${i - pattern.length - 1}]!` : `Z[${i}]=${Z[i]}${Z[i] > 0 ? `. Z-box extends to [${l},${r})` : ''}` });
  }

  steps.push({ combined, Z: [...Z], l, r, i: -1, pattern, text, matches: [...matches], done: true, message: `Done! Z-array complete. Found ${matches.length} match(es) at text index: [${matches.join(', ') || 'none'}]` });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="Z-Array Definition">
      <p>For a string S, <strong>Z[i]</strong> is the length of the longest substring starting at position i that also matches a prefix of S. Z[0] is typically defined as 0 or |S|.</p>
      <p className="mt-2">For pattern matching: concatenate <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">pattern + '$' + text</code>. Any position where Z[i] == |pattern| is a match location.</p>
    </TheorySection>
    <TheorySection title="Z-Box Optimization">
      <p>Maintain a Z-box [l, r) representing the rightmost interval we've matched so far. For any i inside the box, we can initialize Z[i] = min(r-i, Z[i-l]) using the mirror position, then extend. This prevents redundant character comparisons.</p>
      <p className="mt-2">This gives us O(n) overall — each position is part of at most one "extension" operation.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['All cases', 'O(n + m)', 'O(n + m)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `vector<int> zAlgorithm(string s) {
    int n = s.size();
    vector<int> Z(n, 0);
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        if (i < r) Z[i] = min(r - i, Z[i - l]);
        while (i + Z[i] < n && s[Z[i]] == s[i + Z[i]]) Z[i]++;
        if (i + Z[i] > r) { l = i; r = i + Z[i]; }
    }
    return Z;
}

vector<int> search(string text, string pattern) {
    string s = pattern + "$" + text;
    auto Z = zAlgorithm(s);
    vector<int> matches;
    int m = pattern.size();
    for (int i = m + 1; i < Z.size(); i++)
        if (Z[i] == m) matches.push_back(i - m - 1);
    return matches;
}`,
    'Python': `def z_function(s):
    n = len(s)
    Z = [0] * n
    l = r = 0
    for i in range(1, n):
        if i < r:
            Z[i] = min(r - i, Z[i - l])
        while i + Z[i] < n and s[Z[i]] == s[i + Z[i]]:
            Z[i] += 1
        if i + Z[i] > r:
            l, r = i, i + Z[i]
    return Z

def z_search(text, pattern):
    s = pattern + '$' + text
    Z = z_function(s)
    m = len(pattern)
    return [i - m - 1 for i in range(m + 1, len(s)) if Z[i] == m]`,
    'JavaScript': `function zFunction(s) {
    const n = s.length, Z = new Array(n).fill(0);
    let l = 0, r = 0;
    for (let i = 1; i < n; i++) {
        if (i < r) Z[i] = Math.min(r - i, Z[i - l]);
        while (i + Z[i] < n && s[Z[i]] === s[i + Z[i]]) Z[i]++;
        if (i + Z[i] > r) { l = i; r = i + Z[i]; }
    }
    return Z;
}
function zSearch(text, pattern) {
    const s = pattern + '$' + text;
    const Z = zFunction(s), m = pattern.length;
    return Z.slice(m + 1).reduce((acc, z, i) => z === m ? [...acc, i] : acc, []);
}`,
  }} />
);

const PRESETS = [
  ['AABXAA', 'AA'],
  ['GEEKSFORGEEKS', 'GEEK'],
  ['AAABAAAA', 'AAA'],
  ['ABCABCABC', 'ABC'],
];

export default function ZAlgorithm() {
  const [textVal, setTextVal] = useState('AABXAA');
  const [patVal, setPatVal] = useState('AA');
  const [inputVal, setInputVal] = useState('AABXAA, AA');
  const [inputError, setInputError] = useState('');
  const [steps, setSteps] = useState(() => generateSteps('AABXAA', 'AA'));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleCustomInput = (val) => {
    setInputVal(val);
    const parts = val.split(',').map(s => s.trim().toUpperCase());
    if (parts.length < 2 || !parts[0] || !parts[1]) { setInputError('Enter: text, pattern'); return; }
    if (parts[0].length > 30) { setInputError('Text max 30 chars'); return; }
    if (parts[1].length > parts[0].length) { setInputError('Pattern longer than text'); return; }
    setInputError('');
    setTextVal(parts[0]); setPatVal(parts[1]);
    setSteps(generateSteps(parts[0], parts[1]));
    setCurrentStep(0); setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const [t, p] = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    setTextVal(t); setPatVal(p); setInputVal(`${t}, ${p}`);
    setSteps(generateSteps(t, p)); setCurrentStep(0); setIsRunning(false);
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

  const { combined, Z, l, r, i: curI, matches, isMatch } = step;
  const plen = patVal.length;

  return (
    <AlgorithmPageShell
      title="Z Algorithm"
      description="Linear-time string matching via Z-array prefix matching with Z-box optimization"
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
      stats={{ l, r, matches: matches?.length || 0 }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={['True O(n+m) linear time', 'Simple implementation', 'No separate preprocessing step', 'Works on any alphabet']}
      disadvantages={['Requires concatenated string — extra memory', 'Z-array size is n+m+1', 'Less intuitive than KMP for some']}
      applications={['Pattern matching in competitive programming', 'Finding periods of a string', 'Distinct substrings counting', 'String compression']}
      interviewTips={['Know Z[i] = 0 for characters that differ from prefix', 'The Z-box trick is key — explain it clearly', 'Pattern matching via "$" separator is the classic trick', 'Draw the Z-array for "aabxaa" to illustrate']}
      relatedAlgos={['KMP Pattern Matcher', 'Boyer-Moore Algorithm', 'Rabin-Karp Algorithm', 'Suffix Array']}
      practiceProblems={[
        { name: 'Implement strStr() / needle in haystack', difficulty: 'Easy' },
        { name: 'Shortest palindrome (Z-algo approach)', difficulty: 'Hard' },
        { name: 'Count occurrences of a word in text', difficulty: 'Easy' },
      ]}
    >
      <div className="space-y-5">
        {/* Combined string cells */}
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Combined: pattern + "$" + text</p>
          <div className="flex flex-wrap gap-1">
            {combined && combined.split('').map((c, idx) => {
              const inZBox = idx >= l && idx < r && idx !== curI;
              const isCurrent = idx === curI;
              const isPatSep = idx === plen;
              const isMatchCell = isMatch && idx === curI;
              return (
                <div key={idx} className="flex flex-col items-center gap-0.5">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm border-2 transition-all duration-150 ${
                    isMatchCell ? 'bg-emerald-200 dark:bg-emerald-900 border-emerald-500 text-emerald-800 dark:text-emerald-200 scale-110' :
                    isCurrent ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 text-amber-700 dark:text-amber-300 scale-110' :
                    inZBox ? 'bg-blue-100 dark:bg-blue-950 border-blue-400 text-blue-700 dark:text-blue-300' :
                    isPatSep ? 'bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600 text-gray-500' :
                    idx < plen ? 'bg-violet-100 dark:bg-violet-950 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300' :
                    'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>{c}</div>
                  <div className="text-[9px] font-mono text-center">
                    <div className="text-gray-400">{idx}</div>
                    <div className={`font-bold ${Z && Z[idx] > 0 ? (Z[idx] === plen ? 'text-emerald-500' : 'text-blue-500') : 'text-gray-300 dark:text-gray-600'}`}>
                      {Z ? Z[idx] : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 mt-2 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-violet-200 dark:bg-violet-900 border border-violet-400 inline-block" /> pattern</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-200 dark:bg-blue-900 border border-blue-400 inline-block" /> Z-box</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-200 dark:bg-amber-900 border border-amber-400 inline-block" /> current i</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-900 border border-emerald-400 inline-block" /> match</span>
          </div>
        </div>

        {/* Z-box info */}
        <div className="flex gap-4 flex-wrap text-xs">
          <div className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
            <span className="font-bold text-blue-600 dark:text-blue-400">Z-box: </span>
            <span className="font-mono text-gray-700 dark:text-gray-300">[{l}, {r})</span>
          </div>
          {curI >= 0 && (
            <div className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
              <span className="font-bold text-amber-600 dark:text-amber-400">i: </span>
              <span className="font-mono text-gray-700 dark:text-gray-300">{curI}</span>
              {Z && Z[curI] > 0 && <span className="font-mono ml-2 text-blue-600 dark:text-blue-400">Z[{curI}]={Z[curI]}</span>}
            </div>
          )}
        </div>

        {/* Matches */}
        {matches?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase">Matches at text index:</span>
            {matches.map(mi => (
              <span key={mi} className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold">{mi}</span>
            ))}
          </div>
        )}
      </div>
    </AlgorithmPageShell>
  );
}
