import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// dims[i] x dims[i+1] = matrix i
const DEFAULT_DIMS = [30, 35, 15, 5, 10, 20]; // A(30x35) B(35x15) C(15x5) D(5x10) E(10x20)

function generateMCMSteps(dims) {
  const n = dims.length - 1; // number of matrices
  const steps = [];
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  const split = Array.from({ length: n }, () => new Array(n).fill(0));

  const matNames = Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i));

  steps.push({
    dp: dp.map(r => [...r]), split: split.map(r => [...r]),
    dims, n, phase: 'init', ci: -1, cj: -1, ck: -1, matNames,
    message: `Matrix Chain: ${matNames.map((m, i) => `${m}(${dims[i]}×${dims[i+1]})`).join(', ')}. Find min multiplications.`
  });

  // Fill diagonally by chain length
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      dp[i][j] = Infinity;
      for (let k = i; k < j; k++) {
        const cost = dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1];
        steps.push({
          dp: dp.map(r => [...r]), split: split.map(r => [...r]),
          dims, n, phase: 'compare', ci: i, cj: j, ck: k, matNames,
          message: `dp[${i}][${j}] (${matNames[i]}..${matNames[j]}): split at k=${k} → dp[${i}][${k}]+dp[${k+1}][${j}]+${dims[i]}×${dims[k+1]}×${dims[j+1]} = ${cost}`
        });
        if (cost < dp[i][j]) {
          dp[i][j] = cost;
          split[i][j] = k;
          steps.push({
            dp: dp.map(r => [...r]), split: split.map(r => [...r]),
            dims, n, phase: 'update', ci: i, cj: j, ck: k, matNames,
            message: `Updated dp[${i}][${j}] = ${cost} (split at ${matNames[k]}|${matNames[k+1]})`
          });
        }
      }
    }
  }

  // Build parenthesization
  function buildParen(i, j) {
    if (i === j) return matNames[i];
    const k = split[i][j];
    return `(${buildParen(i, k)} × ${buildParen(k + 1, j)})`;
  }

  const paren = buildParen(0, n - 1);

  steps.push({
    dp: dp.map(r => [...r]), split: split.map(r => [...r]),
    dims, n, phase: 'done', ci: 0, cj: n - 1, ck: -1, matNames, paren,
    message: `Min operations = ${dp[0][n - 1]}. Optimal: ${paren}`,
    done: true
  });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="Matrix Chain Multiplication">
      <p>Given n matrices A₁,A₂,...,Aₙ, find the optimal parenthesization that minimizes the total scalar multiplications.</p>
      <p>For matrices Aᵢ(pᵢ×pᵢ₊₁), the cost of multiplying Aᵢ..Aⱼ split at k is:</p>
      <p className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-xs">dp[i][j] = min over i≤k&lt;j of (dp[i][k] + dp[k+1][j] + p[i]·p[k+1]·p[j+1])</p>
      <p>The table is filled diagonally by chain length (len=2 to n).</p>
    </TheorySection>
    <TheorySection title="Key Insight">
      <ul className="list-disc pl-4 space-y-1">
        <li>Parenthesization doesn't change the matrices — only the order of operations</li>
        <li>Multiplying A(p×q) by B(q×r) costs p·q·r multiplications</li>
        <li>Optimal substructure: optimal split of subchain i..j uses optimal i..k and k+1..j</li>
        <li>n matrices → n-1 possible splits → exponential brute force, O(n³) DP</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Time', 'O(n³)', 'O(n²)'],
      ['Space', 'O(n²)', 'O(n²)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `int matrixChain(vector<int>& p) {
    int n = p.size() - 1;
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int len = 2; len <= n; len++)
        for (int i = 0; i <= n-len; i++) {
            int j = i + len - 1;
            dp[i][j] = INT_MAX;
            for (int k = i; k < j; k++)
                dp[i][j] = min(dp[i][j],
                    dp[i][k] + dp[k+1][j] + p[i]*p[k+1]*p[j+1]);
        }
    return dp[0][n-1];
}`,
    'Python': `def matrixChain(p):
    n = len(p) - 1
    dp = [[0]*n for _ in range(n)]
    for length in range(2, n+1):
        for i in range(n-length+1):
            j = i + length - 1
            dp[i][j] = float('inf')
            for k in range(i, j):
                cost = dp[i][k] + dp[k+1][j] + p[i]*p[k+1]*p[j+1]
                dp[i][j] = min(dp[i][j], cost)
    return dp[0][n-1]`,
    'JavaScript': `function matrixChain(p) {
    const n = p.length - 1;
    const dp = Array.from({length:n},()=>new Array(n).fill(0));
    for (let len=2;len<=n;len++)
        for (let i=0;i<=n-len;i++) {
            const j = i+len-1;
            dp[i][j]=Infinity;
            for(let k=i;k<j;k++)
                dp[i][j]=Math.min(dp[i][j],
                    dp[i][k]+dp[k+1][j]+p[i]*p[k+1]*p[j+1]);
        }
    return dp[0][n-1];
}`,
    'Java': `public int matrixChain(int[] p) {
    int n = p.length - 1;
    int[][] dp = new int[n][n];
    for (int len=2;len<=n;len++)
        for (int i=0;i<=n-len;i++) {
            int j = i+len-1;
            dp[i][j] = Integer.MAX_VALUE;
            for(int k=i;k<j;k++) {
                int cost = dp[i][k]+dp[k+1][j]+p[i]*p[k+1]*p[j+1];
                dp[i][j] = Math.min(dp[i][j], cost);
            }
        }
    return dp[0][n-1];
}`,
  }} />
);

export default function MatrixChainPage() {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(400);
  const timerRef = useRef(null);

  const initSteps = useCallback((dims) => {
    const st = generateMCMSteps(dims);
    setSteps(st); setCurrentStep(0); setIsRunning(false);
  }, []);

  useEffect(() => { initSteps(DEFAULT_DIMS); }, [initSteps]);

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
    const n = 4 + Math.floor(Math.random() * 2);
    const dims = Array.from({ length: n + 1 }, () => 5 + Math.floor(Math.random() * 30));
    initSteps(dims);
  }, [initSteps]);

  const step = steps[currentStep] || {};
  const dims = step.dims || DEFAULT_DIMS;
  const n = step.n || dims.length - 1;
  const dp = step.dp || Array.from({ length: n }, () => new Array(n).fill(0));
  const matNames = step.matNames || Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i));
  const ci = step.ci ?? -1;
  const cj = step.cj ?? -1;

  return (
    <AlgorithmPageShell
      title="Matrix Chain Multiplication"
      description="Find optimal parenthesization to minimize scalar multiplications — interval DP"
      category="Dynamic Programming"
      difficulty="Hard"
      steps={steps} currentStep={currentStep} isRunning={isRunning}
      onPlay={() => setIsRunning(true)} onPause={() => setIsRunning(false)}
      onReset={() => { setIsRunning(false); setCurrentStep(0); }}
      onStepForward={() => setCurrentStep(p => Math.min(p + 1, steps.length - 1))}
      onStepBack={() => setCurrentStep(p => Math.max(p - 1, 0))}
      speed={speed} onSpeedChange={setSpeed} onRandomize={handleRandomize}
      showInput={false}
      stats={{ n, result: dp[0]?.[n - 1] === Infinity ? '∞' : dp[0]?.[n - 1] || 0, parenthesization: step.paren || '-' }}
      message={step.message || ''} done={step.done || false}
      theory={theory} code={code}
      advantages={[
        'O(n³) vs naive Catalan number exponential brute force',
        'Reveals optimal structure of matrix multiplication order',
        'Template for all interval DP problems',
      ]}
      disadvantages={[
        'O(n²) space for the DP table',
        'Does not account for cache effects or BLAS-level optimizations in practice',
        'Assumes matrix dimensions are fixed and known upfront',
      ]}
      applications={[
        'Compiler expression optimization',
        'Scientific computing — chain matrix products',
        'Deep learning computation graph optimization',
        'Database query plan optimization',
      ]}
      interviewTips={[
        'Interval DP pattern: dp[i][j] computed from dp[i][k] and dp[k+1][j]',
        'Fill by increasing chain length (len=2,3,...,n) not row by row',
        'Cost of A(p×q)·B(q×r) = p·q·r multiplications',
        'Reconstruction uses split[][] array — recursively build parenthesization',
      ]}
      relatedAlgos={[
        { title: 'Longest Palindromic Subsequence', route: '/dp/longest-palindromic-subsequence' },
        { title: 'Egg Dropping', route: '/dp/egg-dropping' },
        { title: 'Min Path Sum', route: '/dp/min-path-sum' },
      ]}
      practiceProblems={[
        { name: 'Strange Printer', difficulty: 'Hard', url: 'https://leetcode.com/problems/strange-printer/' },
        { name: 'Burst Balloons', difficulty: 'Hard', url: 'https://leetcode.com/problems/burst-balloons/' },
        { name: 'Minimum Cost to Merge Stones', difficulty: 'Hard', url: 'https://leetcode.com/problems/minimum-cost-to-merge-stones/' },
      ]}
    >
      {/* Matrix dimensions legend */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {matNames.map((m, i) => (
          <div key={i} className={`px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all duration-200 ${
            (ci === i || (ci <= i && i <= cj)) && step.phase !== 'init'
              ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-400 text-amber-700 dark:text-amber-200'
              : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
          }`}>
            {m}({dims[i]}×{dims[i + 1]})
          </div>
        ))}
      </div>

      {/* Upper triangular DP table */}
      <p className="text-xs text-gray-400 mb-2 text-center">dp[i][j] = min multiplications for matrices i..j (upper triangle)</p>
      <div className="overflow-x-auto">
        <table className="mx-auto text-xs border-collapse">
          <thead>
            <tr>
              <th className="w-8 h-7"></th>
              {matNames.map((m, j) => (
                <th key={j} className={`w-14 h-7 text-center font-bold ${j === cj ? 'text-amber-500' : 'text-gray-500 dark:text-gray-400'}`}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dp.map((row, i) => (
              <tr key={i}>
                <td className={`text-right pr-2 font-bold text-xs ${i === ci ? 'text-amber-500' : 'text-gray-500 dark:text-gray-400'}`}>{matNames[i]}</td>
                {row.map((val, j) => {
                  const isActive = i === ci && j === cj;
                  const isUpperTri = j >= i;
                  const isDone = step.done && i === 0 && j === n - 1;
                  return (
                    <td key={j} className={`w-14 h-8 text-center font-mono text-xs font-semibold border rounded transition-all duration-200 ${
                      !isUpperTri ? 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-200 dark:text-gray-700' :
                      isDone ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-400 text-emerald-700 dark:text-emerald-200 scale-105' :
                      isActive ? 'bg-amber-100 dark:bg-amber-800/60 border-amber-400 text-amber-800 dark:text-amber-200' :
                      val === Infinity || val === 0 && i !== j ? 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400' :
                      i === j ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 font-bold' :
                      'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                    }`}>
                      {isUpperTri ? (val === Infinity ? '∞' : val === 0 && i === j ? '0' : val || '') : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {step.done && step.paren && (
        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">Optimal Parenthesization:</p>
          <p className="font-mono text-sm text-emerald-800 dark:text-emerald-200 font-bold">{step.paren}</p>
        </div>
      )}
    </AlgorithmPageShell>
  );
}
