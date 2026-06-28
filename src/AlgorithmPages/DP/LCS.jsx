import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateLCSSteps(s1, s2) {
  const steps = [];
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  const filled = Array.from({ length: m + 1 }, () => Array(n + 1).fill(false));

  steps.push({ dp: dp.map(r => [...r]), filled: filled.map(r => [...r]), i: -1, j: -1, message: `LCS of "${s1}" and "${s2}". Building DP table (${m+1}×${n+1}).` });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        steps.push({ dp: dp.map(r => [...r]), filled: filled.map(r => [...r]), i, j, match: true, message: `s1[${i-1}]='${s1[i-1]}' == s2[${j-1}]='${s2[j-1]}' → dp[${i}][${j}] = dp[${i-1}][${j-1}]+1 = ${dp[i][j]}` });
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        steps.push({ dp: dp.map(r => [...r]), filled: filled.map(r => [...r]), i, j, match: false, message: `s1[${i-1}]='${s1[i-1]}' ≠ s2[${j-1}]='${s2[j-1]}' → dp[${i}][${j}] = max(${dp[i-1][j]},${dp[i][j-1]}) = ${dp[i][j]}` });
      }
      filled[i][j] = true;
    }
  }

  // Traceback
  let lcs = '';
  let i = m, j = n;
  const trace = [];
  while (i > 0 && j > 0) {
    if (s1[i - 1] === s2[j - 1]) {
      lcs = s1[i - 1] + lcs;
      trace.push([i, j]);
      i--; j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  steps.push({ dp: dp.map(r => [...r]), filled: filled.map(r => [...r]), i: -1, j: -1, trace, done: true, lcs, message: `✅ LCS length = ${dp[m][n]}. LCS = "${lcs}"` });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="What is LCS?">
      <p>The Longest Common Subsequence finds the longest sequence of characters that appear in both strings in the same order (not necessarily contiguous). For example, LCS("ABCBDAB", "BDCABA") = "BCBA" (length 4).</p>
    </TheorySection>
    <TheorySection title="Recurrence Relation">
      <div className="font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded-xl text-sm space-y-1">
        <div>dp[i][j] = dp[i-1][j-1] + 1,       if s1[i] == s2[j]</div>
        <div>dp[i][j] = max(dp[i-1][j], dp[i][j-1]), otherwise</div>
        <div>dp[0][*] = dp[*][0] = 0             (base cases)</div>
      </div>
    </TheorySection>
    <TheorySection title="Applications">
      <ul className="list-disc pl-4 space-y-1">
        <li><strong>git diff</strong> — showing differences between files</li>
        <li><strong>DNA sequencing</strong> — comparing genetic sequences</li>
        <li><strong>Plagiarism detection</strong></li>
        <li><strong>Spell checkers</strong> — finding nearest word</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['All cases', 'O(m × n)', 'O(m × n)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `int lcs(string s1, string s2) {
    int m = s1.size(), n = s2.size();
    vector<vector<int>> dp(m+1, vector<int>(n+1, 0));
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            if (s1[i-1] == s2[j-1])
                dp[i][j] = dp[i-1][j-1] + 1;
            else
                dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
    return dp[m][n];
}`,
    'Python': `def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]`,
    'JavaScript': `function lcs(s1, s2) {
    const m = s1.length, n = s2.length;
    const dp = Array.from({length: m+1}, () => Array(n+1).fill(0));
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = s1[i-1] === s2[j-1]
                ? dp[i-1][j-1] + 1
                : Math.max(dp[i-1][j], dp[i][j-1]);
    return dp[m][n];
}`,
  }} />
);

export default function LCS() {
  const [s1, setS1] = useState('ABCBDAB');
  const [s2, setS2] = useState('BDCABA');
  const [inputVal, setInputVal] = useState('ABCBDAB, BDCABA');
  const [inputError, setInputError] = useState('');
  const [steps, setSteps] = useState(() => generateLCSSteps('ABCBDAB', 'BDCABA'));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(300);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleCustomInput = (val) => {
    setInputVal(val);
    const parts = val.split(',').map(s => s.trim().toUpperCase());
    if (parts.length < 2 || !parts[0] || !parts[1]) { setInputError('Enter two strings: "ABC, DEF"'); return; }
    if (parts[0].length > 10 || parts[1].length > 10) { setInputError('Max 10 chars each'); return; }
    setInputError('');
    setS1(parts[0]); setS2(parts[1]);
    setSteps(generateLCSSteps(parts[0], parts[1]));
    setCurrentStep(0);
    setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const opts = [['AGGTAB', 'GXTXAYB'], ['ABCBDAB', 'BDCABA'], ['STONE', 'LONGEST'], ['HELLO', 'WORLD']];
    const [a, b] = opts[Math.floor(Math.random() * opts.length)];
    setS1(a); setS2(b); setInputVal(`${a}, ${b}`);
    setSteps(generateLCSSteps(a, b));
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

  const dp = step.dp;
  const traceSet = new Set((step.trace || []).map(([r, c]) => `${r},${c}`));

  return (
    <AlgorithmPageShell
      title="Longest Common Subsequence"
      description="DP table filling to find the longest sequence common to two strings"
      category="Dynamic Programming"
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
      inputPlaceholder='e.g. ABCBD, BDCAB'
      inputLabel='Two strings (comma-separated)'
      stats={{ s1, s2, lcsLen: dp[s1.length]?.[s2.length] ?? 0, lcs: step.lcs || '—' }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
    >
      <div className="overflow-x-auto">
        <table className="text-sm border-separate border-spacing-0.5">
          <thead>
            <tr>
              <td className="w-8 h-8" />
              <td className="w-8 h-8 text-center font-bold text-gray-400 dark:text-gray-500">ε</td>
              {s2.split('').map((c, j) => (
                <td key={j} className={`w-8 h-8 text-center font-bold ${step.j === j + 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{c}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {dp.map((row, i) => (
              <tr key={i}>
                <td className={`w-8 h-8 text-center font-bold ${step.i === i ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {i === 0 ? 'ε' : s1[i - 1]}
                </td>
                {row.map((val, j) => {
                  const isActive = step.i === i && step.j === j;
                  const isTrace = traceSet.has(`${i},${j}`);
                  return (
                    <td key={j} className={`w-8 h-8 text-center font-bold rounded-lg transition-all duration-150 ${
                      isTrace ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200' :
                      isActive && step.match ? 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 scale-110' :
                      isActive ? 'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100' :
                      val > 0 ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' :
                      'bg-gray-50 dark:bg-gray-850 text-gray-400 dark:text-gray-600'
                    }`}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {step.lcs && (
        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl">
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">LCS = </span>
          {step.lcs.split('').map((c, i) => (
            <span key={i} className="inline-block mx-0.5 px-2 py-0.5 bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 rounded font-bold">{c}</span>
          ))}
        </div>
      )}
    </AlgorithmPageShell>
  );
}
