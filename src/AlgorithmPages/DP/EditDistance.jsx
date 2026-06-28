import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateSteps(s1, s2) {
  const steps = [];
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));

  steps.push({ dp: dp.map(r => [...r]), i: -1, j: -1, message: `Edit Distance from "${s1}" → "${s2}". Base cases: row 0 = deletions, col 0 = insertions.` });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
        steps.push({ dp: dp.map(r => [...r]), i, j, op: 'match', message: `s1[${i-1}]='${s1[i-1]}' == s2[${j-1}]='${s2[j-1]}' → no cost, dp[${i}][${j}] = ${dp[i][j]}` });
      } else {
        const ins = dp[i][j - 1] + 1;
        const del = dp[i - 1][j] + 1;
        const rep = dp[i - 1][j - 1] + 1;
        dp[i][j] = Math.min(ins, del, rep);
        const op = dp[i][j] === rep ? 'replace' : dp[i][j] === ins ? 'insert' : 'delete';
        steps.push({ dp: dp.map(r => [...r]), i, j, op, message: `s1[${i-1}]='${s1[i-1]}' ≠ s2[${j-1}]='${s2[j-1]}' → min(ins=${ins}, del=${del}, rep=${rep}) = ${dp[i][j]} (${op})` });
      }
    }
  }

  // Traceback
  const ops = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && s1[i-1] === s2[j-1]) {
      ops.unshift({ op: 'match', char: s1[i-1] });
      i--; j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i-1][j-1] + 1) {
      ops.unshift({ op: 'replace', from: s1[i-1], to: s2[j-1] });
      i--; j--;
    } else if (j > 0 && dp[i][j] === dp[i][j-1] + 1) {
      ops.unshift({ op: 'insert', char: s2[j-1] });
      j--;
    } else {
      ops.unshift({ op: 'delete', char: s1[i-1] });
      i--;
    }
  }

  steps.push({ dp: dp.map(r => [...r]), i: -1, j: -1, ops, done: true, message: `✅ Minimum edit distance = ${dp[m][n]}` });
  return steps;
}

const OP_COLOR = { match: 'bg-gray-100 dark:bg-gray-800', replace: 'bg-amber-100 dark:bg-amber-900', insert: 'bg-emerald-100 dark:bg-emerald-900', delete: 'bg-red-100 dark:bg-red-900' };
const OP_TEXT = { match: 'text-gray-600 dark:text-gray-400', replace: 'text-amber-700 dark:text-amber-300', insert: 'text-emerald-700 dark:text-emerald-300', delete: 'text-red-700 dark:text-red-300' };

const theory = (
  <div>
    <TheorySection title="What is Edit Distance?">
      <p>Edit Distance (Levenshtein Distance) measures how many single-character operations are needed to transform one string into another. Three operations are allowed, each costing 1:</p>
      <ul className="list-disc pl-4 space-y-1 mt-2">
        <li><strong>Insert</strong> a character</li>
        <li><strong>Delete</strong> a character</li>
        <li><strong>Replace</strong> a character with another</li>
      </ul>
    </TheorySection>
    <TheorySection title="Recurrence">
      <div className="font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded-xl text-sm space-y-1">
        <div>dp[i][j] = dp[i-1][j-1]                     if s1[i]==s2[j]</div>
        <div>dp[i][j] = 1 + min(dp[i-1][j-1],            otherwise</div>
        <div>                   dp[i][j-1],</div>
        <div>                   dp[i-1][j])</div>
      </div>
    </TheorySection>
    <ComplexityTable rows={[['All cases', 'O(m × n)', 'O(m × n)']]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `int editDistance(string s1, string s2) {
    int m = s1.size(), n = s2.size();
    vector<vector<int>> dp(m+1, vector<int>(n+1));
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            if (s1[i-1] == s2[j-1]) dp[i][j] = dp[i-1][j-1];
            else dp[i][j] = 1 + min({dp[i-1][j-1], dp[i][j-1], dp[i-1][j]});
    return dp[m][n];
}`,
    'Python': `def edit_distance(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(m+1): dp[i][0] = i
    for j in range(n+1): dp[0][j] = j
    for i in range(1, m+1):
        for j in range(1, n+1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = 1 + min(dp[i-1][j-1], dp[i][j-1], dp[i-1][j])
    return dp[m][n]`,
    'JavaScript': `function editDistance(s1, s2) {
    const m = s1.length, n = s2.length;
    const dp = Array.from({length: m+1}, (_, i) =>
        Array.from({length: n+1}, (_, j) => i === 0 ? j : j === 0 ? i : 0));
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = s1[i-1] === s2[j-1]
                ? dp[i-1][j-1]
                : 1 + Math.min(dp[i-1][j-1], dp[i][j-1], dp[i-1][j]);
    return dp[m][n];
}`,
  }} />
);

export default function EditDistance() {
  const [inputVal, setInputVal] = useState('KITTEN, SITTING');
  const [inputError, setInputError] = useState('');
  const [s1, setS1] = useState('KITTEN');
  const [s2, setS2] = useState('SITTING');
  const [steps, setSteps] = useState(() => generateSteps('KITTEN', 'SITTING'));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(300);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleCustomInput = (val) => {
    setInputVal(val);
    const parts = val.split(',').map(s => s.trim().toUpperCase());
    if (parts.length < 2 || !parts[0] || !parts[1]) { setInputError('Enter two strings: "ABC, DEF"'); return; }
    if (parts[0].length > 9 || parts[1].length > 9) { setInputError('Max 9 chars each'); return; }
    setInputError('');
    setS1(parts[0]); setS2(parts[1]);
    setSteps(generateSteps(parts[0], parts[1]));
    setCurrentStep(0);
    setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const opts = [['KITTEN', 'SITTING'], ['SUNDAY', 'SATURDAY'], ['CAT', 'CUT'], ['INTENTION', 'EXECUTION']];
    const [a, b] = opts[Math.floor(Math.random() * opts.length)];
    setS1(a); setS2(b); setInputVal(`${a}, ${b}`);
    setSteps(generateSteps(a, b));
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

  return (
    <AlgorithmPageShell
      title="Edit Distance"
      description="Minimum single-character operations (insert/delete/replace) to transform one string into another"
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
      inputPlaceholder='e.g. KITTEN, SITTING'
      inputLabel='Two strings (comma-separated)'
      stats={{ distance: dp[s1.length]?.[s2.length] ?? 0 }}
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
              <td className="w-8 h-8 text-center font-bold text-gray-400">ε</td>
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
                  return (
                    <td key={j} className={`w-8 h-8 text-center font-bold rounded-lg transition-all duration-150 ${
                      isActive && step.op === 'match' ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 scale-110' :
                      isActive ? 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 scale-110' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
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

      {step.ops && (
        <div className="mt-4">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Transformation steps</p>
          <div className="flex flex-wrap gap-1.5">
            {step.ops.map((op, i) => (
              <span key={i} className={`px-2 py-1 rounded-lg text-xs font-semibold border ${OP_COLOR[op.op]} ${OP_TEXT[op.op]}`}>
                {op.op === 'match' ? op.char :
                 op.op === 'replace' ? `${op.from}→${op.to}` :
                 op.op === 'insert' ? `+${op.char}` :
                 `-${op.char}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </AlgorithmPageShell>
  );
}
