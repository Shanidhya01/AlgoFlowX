import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const DEFAULT_INPUT = 'BBABCBCAB';

function generateLPSSteps(s) {
  const steps = [];
  const n = s.length;
  // dp[i][j] = LPS length for s[i..j]
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  const active = { i: -1, j: -1 };

  // Base: single chars
  for (let i = 0; i < n; i++) dp[i][i] = 1;

  steps.push({
    dp: dp.map(r => [...r]), active: { i: -1, j: -1 }, phase: 'init', s,
    message: `Initialize: every single character is a palindrome of length 1. String: "${s}"`
  });

  // Fill by length
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      steps.push({
        dp: dp.map(r => [...r]), active: { i, j }, phase: 'compare', s,
        message: `Compute dp[${i}][${j}] for s[${i}..${j}]="${s.slice(i, j + 1)}". s[${i}]='${s[i]}' vs s[${j}]='${s[j]}'`
      });
      if (s[i] === s[j]) {
        dp[i][j] = (len === 2 ? 2 : dp[i + 1][j - 1] + 2);
        steps.push({
          dp: dp.map(r => [...r]), active: { i, j }, phase: 'match', s,
          message: `Match! s[${i}]='${s[i]}'=s[${j}]='${s[j]}'. dp[${i}][${j}] = ${len === 2 ? '2' : `dp[${i+1}][${j-1}] + 2 = ${dp[i+1][j-1]+2}`} → ${dp[i][j]}`
        });
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
        steps.push({
          dp: dp.map(r => [...r]), active: { i, j }, phase: 'nomatch', s,
          message: `No match. dp[${i}][${j}] = max(dp[${i+1}][${j}]=${dp[i+1][j]}, dp[${i}][${j-1}]=${dp[i][j-1]}) = ${dp[i][j]}`
        });
      }
    }
  }

  steps.push({
    dp: dp.map(r => [...r]), active: { i: 0, j: n - 1 }, phase: 'done', s,
    message: `Done! LPS of "${s}" has length ${dp[0][n - 1]}.`,
    done: true
  });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="Longest Palindromic Subsequence">
      <p>Given a string <code>s</code>, find the length of the longest subsequence that reads the same forward and backward.</p>
      <p>We build a 2D table where <code>dp[i][j]</code> = LPS length for <code>s[i..j]</code>:</p>
      <ul className="list-disc pl-4 space-y-1 font-mono text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
        <li>if s[i] == s[j]: dp[i][j] = dp[i+1][j-1] + 2</li>
        <li>else: dp[i][j] = max(dp[i+1][j], dp[i][j-1])</li>
        <li>base: dp[i][i] = 1 (single char)</li>
      </ul>
      <p>The table is filled diagonally (by substring length), from length 2 up to n.</p>
    </TheorySection>
    <TheorySection title="Relationship to LCS">
      <p>LPS(s) = LCS(s, reverse(s)). The DP formulation here is equivalent and runs in the same O(n²) time and space.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Time', 'O(n²)', 'O(n²)'],
      ['Space', 'O(n²)', 'O(n) optimized'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `int longestPalinSubseq(string s) {
    int n = s.size();
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int i = 0; i < n; i++) dp[i][i] = 1;
    for (int len = 2; len <= n; len++)
        for (int i = 0; i <= n - len; i++) {
            int j = i + len - 1;
            if (s[i] == s[j]) dp[i][j] = (len==2?2:dp[i+1][j-1]+2);
            else dp[i][j] = max(dp[i+1][j], dp[i][j-1]);
        }
    return dp[0][n-1];
}`,
    'Python': `def longestPalinSubseq(s):
    n = len(s)
    dp = [[0]*n for _ in range(n)]
    for i in range(n): dp[i][i] = 1
    for length in range(2, n+1):
        for i in range(n-length+1):
            j = i + length - 1
            if s[i] == s[j]:
                dp[i][j] = (2 if length==2 else dp[i+1][j-1]+2)
            else:
                dp[i][j] = max(dp[i+1][j], dp[i][j-1])
    return dp[0][n-1]`,
    'JavaScript': `function longestPalinSubseq(s) {
    const n = s.length;
    const dp = Array.from({length:n}, ()=>new Array(n).fill(0));
    for (let i = 0; i < n; i++) dp[i][i] = 1;
    for (let len = 2; len <= n; len++)
        for (let i = 0; i <= n-len; i++) {
            const j = i + len - 1;
            if (s[i] === s[j]) dp[i][j] = len===2 ? 2 : dp[i+1][j-1]+2;
            else dp[i][j] = Math.max(dp[i+1][j], dp[i][j-1]);
        }
    return dp[0][n-1];
}`,
    'Java': `public int longestPalinSubseq(String s) {
    int n = s.length();
    int[][] dp = new int[n][n];
    for (int i = 0; i < n; i++) dp[i][i] = 1;
    for (int len = 2; len <= n; len++)
        for (int i = 0; i <= n-len; i++) {
            int j = i + len - 1;
            if (s.charAt(i) == s.charAt(j))
                dp[i][j] = (len==2)?2:dp[i+1][j-1]+2;
            else dp[i][j] = Math.max(dp[i+1][j], dp[i][j-1]);
        }
    return dp[0][n-1];
}`,
  }} />
);

export default function LPSPage() {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(400);
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState('');
  const timerRef = useRef(null);

  const initSteps = useCallback((s) => {
    const st = generateLPSSteps(s);
    setSteps(st); setCurrentStep(0); setIsRunning(false);
  }, []);

  useEffect(() => { initSteps(DEFAULT_INPUT); }, [initSteps]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) { setIsRunning(false); return prev; }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, speed, steps.length]);

  const handleRandomize = useCallback(() => {
    const chars = 'ABCDE';
    const len = 5 + Math.floor(Math.random() * 4);
    const s = Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    initSteps(s);
    setCustomInput(''); setInputError('');
  }, [initSteps]);

  const handleCustomInput = useCallback((val) => {
    setCustomInput(val);
    const s = val.trim().toUpperCase();
    if (s.length < 2 || s.length > 10) { setInputError('String must be 2-10 characters'); return; }
    if (!/^[A-Z]+$/.test(s)) { setInputError('Only letters A-Z allowed'); return; }
    setInputError('');
    initSteps(s);
  }, [initSteps]);

  const step = steps[currentStep] || {};
  const s = step.s || DEFAULT_INPUT;
  const dp = step.dp || Array.from({ length: s.length }, (_, i) => Array.from({ length: s.length }, (_, j) => i === j ? 1 : 0));
  const n = s.length;
  const activeI = step.active?.i ?? -1;
  const activeJ = step.active?.j ?? -1;

  return (
    <AlgorithmPageShell
      title="Longest Palindromic Subsequence"
      description="Find the longest subsequence that reads the same forwards and backwards using 2D DP"
      category="Dynamic Programming"
      difficulty="Medium"
      steps={steps} currentStep={currentStep} isRunning={isRunning}
      onPlay={() => setIsRunning(true)} onPause={() => setIsRunning(false)}
      onReset={() => { setIsRunning(false); setCurrentStep(0); }}
      onStepForward={() => setCurrentStep(p => Math.min(p + 1, steps.length - 1))}
      onStepBack={() => setCurrentStep(p => Math.max(p - 1, 0))}
      speed={speed} onSpeedChange={setSpeed} onRandomize={handleRandomize}
      customInput={customInput} onCustomInput={handleCustomInput} inputError={inputError}
      inputPlaceholder="BBABCBCAB" inputLabel="String (letters only)" showInput={true}
      stats={{ n: s.length, result: dp[0] ? dp[0][n - 1] : 1 }}
      message={step.message || ''} done={step.done || false}
      theory={theory} code={code}
      advantages={[
        'Clean O(n²) DP formulation with clear recurrence',
        'Works for any alphabet',
        'Forms the basis for many palindrome-related problems',
      ]}
      disadvantages={[
        'O(n²) space — can be optimized to O(n) with rolling array',
        'Does not directly reconstruct the actual palindromic subsequence without backtracking',
        'Diagonal filling order is less intuitive than row-by-row',
      ]}
      applications={[
        'DNA sequence analysis and palindrome detection',
        'Natural language processing (finding palindromes)',
        'String compression and encoding',
        'Bioinformatics gene analysis',
      ]}
      interviewTips={[
        'LPS(s) = LCS(s, reverse(s)) — alternate formulation',
        'Minimum deletions to make palindrome = n - LPS(s)',
        'Filling diagonally by length avoids dependency issues',
        'For reconstruction, backtrack: if s[i]==s[j] go to (i+1,j-1), else go to max of (i+1,j),(i,j-1)',
      ]}
      relatedAlgos={[
        { title: 'LCS', route: '/dp/lcs' },
        { title: 'LIS', route: '/dp/lis' },
        { title: 'Edit Distance', route: '/dp/edit-distance' },
      ]}
      practiceProblems={[
        { name: 'Longest Palindromic Subsequence', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-palindromic-subsequence/' },
        { name: 'Minimum Insertions to Make String Palindrome', difficulty: 'Hard', url: 'https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/' },
        { name: 'Palindromic Substrings', difficulty: 'Medium', url: 'https://leetcode.com/problems/palindromic-substrings/' },
      ]}
    >
      {/* String header */}
      <div className="flex justify-center gap-1 mb-3">
        {s.split('').map((c, i) => (
          <div key={i} className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-bold ${
            i === activeI || i === activeJ ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-400 text-amber-700 dark:text-amber-200' :
            'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            {c}
          </div>
        ))}
      </div>

      {/* 2D DP table */}
      <div className="overflow-x-auto">
        <table className="mx-auto text-xs border-collapse">
          <thead>
            <tr>
              <th className="w-7 h-7"></th>
              {s.split('').map((c, j) => (
                <th key={j} className={`w-8 h-7 font-bold text-center ${j === activeJ ? 'text-amber-600 dark:text-amber-300' : 'text-gray-500 dark:text-gray-400'}`}>
                  {c}<sub>{j}</sub>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dp.map((row, i) => (
              <tr key={i}>
                <td className={`w-7 h-8 font-bold text-center ${i === activeI ? 'text-amber-600 dark:text-amber-300' : 'text-gray-500 dark:text-gray-400'}`}>
                  {s[i]}<sub>{i}</sub>
                </td>
                {row.map((val, j) => {
                  const isActive = i === activeI && j === activeJ;
                  const isHelper = step.phase === 'match' || step.phase === 'nomatch'
                    ? (i === activeI + 1 && j === activeJ) || (i === activeI && j === activeJ - 1) || (i === activeI + 1 && j === activeJ - 1)
                    : false;
                  const isUpperTri = j >= i;
                  return (
                    <td key={j} className={`w-8 h-8 text-center font-mono font-semibold border transition-all duration-200 rounded ${
                      !isUpperTri ? 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-700' :
                      isActive ? 'bg-amber-200 dark:bg-amber-800/60 border-amber-400 text-amber-800 dark:text-amber-200 scale-110' :
                      isHelper ? 'bg-sky-100 dark:bg-sky-900/40 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300' :
                      val > 0 ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' :
                      'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400'
                    }`}>
                      {isUpperTri ? val : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-center text-gray-400 mt-2">
        <span className="text-amber-500">amber</span> = active cell &nbsp;
        <span className="text-sky-500">sky</span> = helper cells &nbsp;
        <span className="text-indigo-500">indigo</span> = filled
      </p>
    </AlgorithmPageShell>
  );
}
