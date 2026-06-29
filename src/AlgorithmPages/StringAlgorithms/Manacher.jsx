import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function preprocess(s) {
  return '#' + s.split('').join('#') + '#';
}

function generateSteps(original) {
  const s = preprocess(original);
  const n = s.length;
  const P = Array(n).fill(0);
  let C = 0, R = 0;
  const steps = [];

  steps.push({ s, P: [...P], C, R, i: -1, original, message: `Preprocessed: "${s}" (# separators allow uniform handling of even/odd palindromes)` });

  for (let i = 1; i < n - 1; i++) {
    const mirror = 2 * C - i;
    let usedMirror = false;
    if (i < R) {
      P[i] = Math.min(R - i, P[mirror]);
      usedMirror = true;
    }
    while (i + P[i] + 1 < n && i - P[i] - 1 >= 0 && s[i + P[i] + 1] === s[i - P[i] - 1]) {
      P[i]++;
    }
    if (i + P[i] > R) {
      C = i; R = i + P[i];
    }
    steps.push({ s, P: [...P], C, R, i, original, usedMirror, message: usedMirror ? `i=${i}: inside boundary R=${R}. Used mirror P[${mirror}]=${P[mirror]} as start → P[${i}]=${P[i]}` : `i=${i}: outside boundary. Expanded directly → P[${i}]=${P[i]}` });
  }

  const maxIdx = P.indexOf(Math.max(...P));
  const maxLen = P[maxIdx];
  const start = Math.floor((maxIdx - maxLen) / 2);
  const longest = original.slice(start, start + maxLen);

  steps.push({ s, P: [...P], C, R, i: -1, original, done: true, maxIdx, maxLen, longest, message: `Done! Longest palindrome: "${longest}" (length ${maxLen}) at position ${start}` });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="Preprocessing with Separators">
      <p>Insert '#' between characters: "abc" → "#a#b#c#". This converts both odd and even palindromes to the same odd-length form. Now every palindrome in the original string has a center '#' or character in the transformed string.</p>
    </TheorySection>
    <TheorySection title="Center and Right Boundary">
      <p><strong>C</strong> is the center of the rightmost palindrome found so far. <strong>R</strong> is its right boundary. For any i &lt; R, we can initialize P[i] using its mirror position (2C - i) without re-scanning characters already covered by R.</p>
      <p className="mt-2">This amortized argument gives O(n) total: each character is added to R at most once.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['All cases', 'O(n)', 'O(n)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `string manacher(string s) {
    string t = "#";
    for (char c : s) t += c, t += '#';
    int n = t.size();
    vector<int> P(n, 0);
    int C = 0, R = 0;
    for (int i = 1; i < n - 1; i++) {
        int mirror = 2 * C - i;
        if (i < R) P[i] = min(R - i, P[mirror]);
        while (i + P[i] + 1 < n && i - P[i] - 1 >= 0 && t[i+P[i]+1] == t[i-P[i]-1]) P[i]++;
        if (i + P[i] > R) { C = i; R = i + P[i]; }
    }
    int maxLen = *max_element(P.begin(), P.end());
    int center = max_element(P.begin(), P.end()) - P.begin();
    int start = (center - maxLen) / 2;
    return s.substr(start, maxLen);
}`,
    'Python': `def manacher(s):
    t = '#' + '#'.join(s) + '#'
    n = len(t)
    P = [0] * n
    C = R = 0
    for i in range(1, n - 1):
        mirror = 2 * C - i
        if i < R:
            P[i] = min(R - i, P[mirror])
        while i + P[i] + 1 < n and i - P[i] - 1 >= 0 and t[i+P[i]+1] == t[i-P[i]-1]:
            P[i] += 1
        if i + P[i] > R:
            C, R = i, i + P[i]
    max_len = max(P)
    center = P.index(max_len)
    start = (center - max_len) // 2
    return s[start:start + max_len]`,
    'JavaScript': `function manacher(s) {
    const t = '#' + s.split('').join('#') + '#';
    const n = t.length, P = new Array(n).fill(0);
    let C = 0, R = 0;
    for (let i = 1; i < n - 1; i++) {
        const mirror = 2 * C - i;
        if (i < R) P[i] = Math.min(R - i, P[mirror]);
        while (i + P[i] + 1 < n && i - P[i] - 1 >= 0 && t[i+P[i]+1] === t[i-P[i]-1]) P[i]++;
        if (i + P[i] > R) { C = i; R = i + P[i]; }
    }
    const maxLen = Math.max(...P), center = P.indexOf(maxLen);
    const start = (center - maxLen) >> 1;
    return s.slice(start, start + maxLen);
}`,
  }} />
);

const PRESETS = ['babad', 'cbbd', 'racecar', 'abacaba', 'aaaa'];

export default function Manacher() {
  const [original, setOriginal] = useState('babad');
  const [inputVal, setInputVal] = useState('babad');
  const [inputError, setInputError] = useState('');
  const [steps, setSteps] = useState(() => generateSteps('babad'));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleCustomInput = (val) => {
    setInputVal(val);
    const s = val.trim().toLowerCase().replace(/[^a-z]/g, '');
    if (!s) { setInputError('Enter a string'); return; }
    if (s.length > 20) { setInputError('Max 20 characters'); return; }
    setInputError('');
    setOriginal(s);
    setSteps(generateSteps(s));
    setCurrentStep(0); setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const s = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    setOriginal(s); setInputVal(s);
    setSteps(generateSteps(s)); setCurrentStep(0); setIsRunning(false);
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

  const { s, P, C, R, i: curI, maxIdx, maxLen, longest } = step;
  const maxP = P ? Math.max(...P, 0) : 1;

  return (
    <AlgorithmPageShell
      title="Manacher's Algorithm"
      description="Find longest palindromic substring in O(n) using mirror optimization"
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
      inputPlaceholder="e.g. babad"
      inputLabel="Input String"
      stats={{ center: C, right: R, maxLen: maxLen || (P ? Math.max(...P) : 0), longestPalindrome: longest || '?' }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={['Optimal O(n) time — linear', 'Single pass algorithm', 'Handles even and odd palindromes uniformly', 'No divide and conquer complexity']}
      disadvantages={['# insertion doubles string size', 'Non-trivial to understand the mirror logic', 'Overkill for short strings', 'P-array requires O(n) space']}
      applications={['Longest palindromic substring (LeetCode 5)', 'DNA sequence analysis', 'Text processing', 'Competitive programming']}
      interviewTips={['Know the # separator trick', 'Be able to explain why mirror works', 'The key invariant: i < R means we can use mirror', 'P[i] is palindrome radius in transformed string']}
      relatedAlgos={['Z Algorithm', 'KMP Pattern Matcher', 'Suffix Array', 'Dynamic Programming (O(n²) palindrome DP)']}
      practiceProblems={[
        { name: 'Longest Palindromic Substring', difficulty: 'Medium' },
        { name: 'Palindromic Substrings (count)', difficulty: 'Medium' },
        { name: 'Shortest Palindrome', difficulty: 'Hard' },
      ]}
    >
      <div className="space-y-5">
        {/* Transformed string cells with P values */}
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Transformed string (P[i] = palindrome radius)</p>
          <div className="flex flex-wrap gap-1 items-end">
            {s && s.split('').map((c, idx) => {
              const isCurrent = idx === curI;
              const inBoundary = idx > C - R + (C - C) && idx >= C - (R - C) && idx <= R && idx !== curI;
              const isCenter = idx === C;
              const isLongest = step.done && maxIdx !== undefined && Math.abs(idx - maxIdx) <= maxLen;
              const pVal = P ? P[idx] : 0;
              const barH = maxP > 0 ? Math.max(4, Math.round((pVal / maxP) * 48)) : 4;
              return (
                <div key={idx} className="flex flex-col items-center gap-0.5">
                  {/* P[i] bar */}
                  <div className="flex flex-col-reverse" style={{ height: 52 }}>
                    {pVal > 0 && (
                      <div className={`w-7 rounded-t transition-all duration-200 ${
                        isLongest ? 'bg-emerald-400 dark:bg-emerald-600' :
                        isCurrent ? 'bg-amber-400 dark:bg-amber-600' :
                        isCenter ? 'bg-blue-400 dark:bg-blue-600' :
                        'bg-violet-300 dark:bg-violet-700'
                      }`} style={{ height: barH }} />
                    )}
                  </div>
                  {/* P value label */}
                  <div className={`text-[9px] font-bold font-mono ${pVal > 0 ? 'text-violet-600 dark:text-violet-400' : 'text-gray-300 dark:text-gray-600'}`}>{pVal || ''}</div>
                  {/* Character cell */}
                  <div className={`w-7 h-7 flex items-center justify-center rounded font-bold text-xs border-2 transition-all duration-150 ${
                    isLongest && step.done ? 'bg-emerald-200 dark:bg-emerald-900 border-emerald-500 text-emerald-800 dark:text-emerald-200' :
                    isCurrent ? 'bg-amber-200 dark:bg-amber-900 border-amber-500 text-amber-800 dark:text-amber-200 scale-110' :
                    isCenter ? 'bg-blue-200 dark:bg-blue-900 border-blue-500 text-blue-800 dark:text-blue-200' :
                    inBoundary ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' :
                    c === '#' ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600' :
                    'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>{c}</div>
                  <div className="text-[8px] text-gray-400">{idx}</div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 mt-2 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-200 dark:bg-blue-900 border border-blue-400 inline-block" /> center C</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-200 dark:bg-amber-900 border border-amber-400 inline-block" /> current i</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-900 border border-emerald-400 inline-block" /> longest palindrome</span>
          </div>
        </div>

        {/* Center / Right boundary info */}
        <div className="flex gap-4 flex-wrap text-xs">
          <div className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
            <span className="font-bold text-blue-600 dark:text-blue-400">Center C: </span>
            <span className="font-mono text-gray-700 dark:text-gray-300">{C}</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800">
            <span className="font-bold text-violet-600 dark:text-violet-400">Right R: </span>
            <span className="font-mono text-gray-700 dark:text-gray-300">{R}</span>
          </div>
          {step.done && longest && (
            <div className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Longest: </span>
              <span className="font-mono font-bold text-gray-700 dark:text-gray-300">"{longest}" (len {maxLen})</span>
            </div>
          )}
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
