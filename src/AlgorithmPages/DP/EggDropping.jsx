import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const DEFAULT_EGGS = 3;
const DEFAULT_FLOORS = 10;

function generateEggDropSteps(eggs, floors) {
  const steps = [];
  // dp[e][f] = min trials with e eggs, f floors
  const dp = Array.from({ length: eggs + 1 }, () => new Array(floors + 1).fill(0));

  // Base cases
  for (let e = 1; e <= eggs; e++) {
    dp[e][0] = 0;
    dp[e][1] = 1;
  }
  for (let f = 1; f <= floors; f++) {
    dp[1][f] = f;
  }

  steps.push({
    dp: dp.map(r => [...r]), phase: 'init', ae: -1, af: -1, ak: -1, eggs, floors,
    message: `Init: dp[1][f]=f (1 egg → linear search), dp[e][1]=1 (1 floor → 1 trial), dp[e][0]=0.`
  });

  for (let e = 2; e <= eggs; e++) {
    for (let f = 2; f <= floors; f++) {
      let best = Infinity;
      let bestK = 1;
      for (let k = 1; k <= f; k++) {
        const worstCase = 1 + Math.max(dp[e - 1][k - 1], dp[e][f - k]);
        steps.push({
          dp: dp.map(r => [...r]), phase: 'compare', ae: e, af: f, ak: k, eggs, floors,
          message: `dp[${e}][${f}]: try floor k=${k} → 1 + max(dp[${e-1}][${k-1}]=${dp[e-1][k-1]}, dp[${e}][${f-k}]=${dp[e][f-k]}) = ${worstCase}`
        });
        if (worstCase < best) { best = worstCase; bestK = k; }
      }
      dp[e][f] = best;
      steps.push({
        dp: dp.map(r => [...r]), phase: 'update', ae: e, af: f, ak: bestK, eggs, floors,
        message: `Set dp[${e}][${f}] = ${best} (optimal drop floor: ${bestK})`
      });
    }
  }

  steps.push({
    dp: dp.map(r => [...r]), phase: 'done', ae: eggs, af: floors, ak: -1, eggs, floors,
    message: `With ${eggs} eggs and ${floors} floors, minimum trials in worst case = ${dp[eggs][floors]}.`,
    done: true
  });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="Egg Dropping Problem">
      <p>Given <code>e</code> eggs and <code>f</code> floors, find the minimum number of trials needed to determine the critical floor (the highest safe floor) in the worst case.</p>
      <p>At each state <code>dp[e][f]</code>, we try each floor k from 1 to f. Dropping from k:</p>
      <ul className="list-disc pl-4 space-y-1 text-xs font-mono">
        <li>Egg breaks → search below: dp[e-1][k-1]</li>
        <li>Egg survives → search above: dp[e][f-k]</li>
      </ul>
      <p className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-xs mt-2">dp[e][f] = 1 + min over k of max(dp[e-1][k-1], dp[e][f-k])</p>
    </TheorySection>
    <TheorySection title="Base Cases">
      <ul className="list-disc pl-4 space-y-1">
        <li><code>dp[1][f] = f</code>: 1 egg → must try every floor from 1 to f</li>
        <li><code>dp[e][0] = 0</code>: 0 floors → no trials needed</li>
        <li><code>dp[e][1] = 1</code>: 1 floor → 1 trial</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Time (DP)', 'O(e × f²)', 'O(e × f)'],
      ['Time (Binary Search opt)', 'O(e × f × log f)', 'O(e × f)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `int eggDrop(int e, int f) {
    vector<vector<int>> dp(e+1, vector<int>(f+1, 0));
    for (int i=1; i<=e; i++) { dp[i][0]=0; dp[i][1]=1; }
    for (int j=1; j<=f; j++) dp[1][j]=j;
    for (int i=2; i<=e; i++)
        for (int j=2; j<=f; j++) {
            dp[i][j] = INT_MAX;
            for (int k=1; k<=j; k++)
                dp[i][j] = min(dp[i][j], 1+max(dp[i-1][k-1], dp[i][j-k]));
        }
    return dp[e][f];
}`,
    'Python': `def eggDrop(e, f):
    dp = [[0]*(f+1) for _ in range(e+1)]
    for i in range(1, e+1): dp[i][0]=0; dp[i][1]=1
    for j in range(1, f+1): dp[1][j] = j
    for i in range(2, e+1):
        for j in range(2, f+1):
            dp[i][j] = float('inf')
            for k in range(1, j+1):
                dp[i][j] = min(dp[i][j], 1+max(dp[i-1][k-1], dp[i][j-k]))
    return dp[e][f]`,
    'JavaScript': `function eggDrop(e, f) {
    const dp = Array.from({length:e+1},()=>new Array(f+1).fill(0));
    for (let i=1;i<=e;i++){dp[i][0]=0;dp[i][1]=1;}
    for (let j=1;j<=f;j++) dp[1][j]=j;
    for (let i=2;i<=e;i++)
        for (let j=2;j<=f;j++) {
            dp[i][j]=Infinity;
            for(let k=1;k<=j;k++)
                dp[i][j]=Math.min(dp[i][j],1+Math.max(dp[i-1][k-1],dp[i][j-k]));
        }
    return dp[e][f];
}`,
    'Java': `public int eggDrop(int e, int f) {
    int[][] dp = new int[e+1][f+1];
    for (int i=1;i<=e;i++){dp[i][0]=0;dp[i][1]=1;}
    for (int j=1;j<=f;j++) dp[1][j]=j;
    for (int i=2;i<=e;i++)
        for (int j=2;j<=f;j++) {
            dp[i][j]=Integer.MAX_VALUE;
            for(int k=1;k<=j;k++)
                dp[i][j]=Math.min(dp[i][j],1+Math.max(dp[i-1][k-1],dp[i][j-k]));
        }
    return dp[e][f];
}`,
  }} />
);

export default function EggDroppingPage() {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(400);
  const timerRef = useRef(null);

  const initSteps = useCallback((e, f) => {
    const st = generateEggDropSteps(e, f);
    setSteps(st); setCurrentStep(0); setIsRunning(false);
  }, []);

  useEffect(() => { initSteps(DEFAULT_EGGS, DEFAULT_FLOORS); }, [initSteps]);

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
    const e = 2 + Math.floor(Math.random() * 2);
    const f = 6 + Math.floor(Math.random() * 6);
    initSteps(e, f);
  }, [initSteps]);

  const step = steps[currentStep] || {};
  const eggs = step.eggs || DEFAULT_EGGS;
  const floors = step.floors || DEFAULT_FLOORS;
  const dp = step.dp || Array.from({ length: eggs + 1 }, () => new Array(floors + 1).fill(0));
  const ae = step.ae || -1;
  const af = step.af || -1;

  return (
    <AlgorithmPageShell
      title="Egg Dropping Problem"
      description="Find minimum trials to determine critical floor in worst case with e eggs and f floors"
      category="Dynamic Programming"
      difficulty="Hard"
      steps={steps} currentStep={currentStep} isRunning={isRunning}
      onPlay={() => setIsRunning(true)} onPause={() => setIsRunning(false)}
      onReset={() => { setIsRunning(false); setCurrentStep(0); }}
      onStepForward={() => setCurrentStep(p => Math.min(p + 1, steps.length - 1))}
      onStepBack={() => setCurrentStep(p => Math.max(p - 1, 0))}
      speed={speed} onSpeedChange={setSpeed} onRandomize={handleRandomize}
      showInput={false}
      stats={{ eggs, floors, result: dp[eggs] ? dp[eggs][floors] : '-' }}
      message={step.message || ''} done={step.done || false}
      theory={theory} code={code}
      advantages={[
        'Guarantees optimal worst-case number of trials',
        '2D DP covers all sub-problems systematically',
        'Can be optimized to O(e × f × log f) using binary search over k',
      ]}
      disadvantages={[
        'O(e × f²) naive is slow for large f',
        'Conceptually tricky — worst case vs expected case confusion',
        'Real-world egg problems typically have different constraints',
      ]}
      applications={[
        'Software version testing (binary threshold search)',
        'Structural stress testing',
        'Network threshold detection',
        'Game theory and adversarial search',
      ]}
      interviewTips={[
        'Classic interview problem — understand it deeply before coding',
        'Key insight: at each floor, two outcomes (break/survive) reduce the problem',
        'Optimize with binary search: find k where dp[e-1][k-1] ≈ dp[e][f-k]',
        'Alternative DP: dp[t][e] = max floors testable in t trials with e eggs',
      ]}
      relatedAlgos={[
        { title: 'Min Path Sum', route: '/dp/min-path-sum' },
        { title: 'Matrix Chain', route: '/dp/matrix-chain' },
      ]}
      practiceProblems={[
        { name: 'Super Egg Drop', difficulty: 'Hard', url: 'https://leetcode.com/problems/super-egg-drop/' },
        { name: 'Egg Drop Problem (GFG)', difficulty: 'Hard', url: '#' },
      ]}
    >
      {/* 2D DP grid — eggs (rows) x floors (cols) */}
      <p className="text-xs text-gray-400 mb-3">dp[eggs][floors] — rows=eggs, cols=floors &nbsp;|&nbsp;
        <span className="text-amber-500">amber</span>=active &nbsp;
        <span className="text-sky-500">sky</span>=helpers
      </p>
      <div className="overflow-x-auto">
        <table className="mx-auto text-xs border-collapse">
          <thead>
            <tr>
              <th className="w-10 h-7 text-gray-400 text-right pr-2">e\f</th>
              {Array.from({ length: floors + 1 }, (_, f) => (
                <th key={f} className={`w-8 h-7 text-center font-bold ${f === af ? 'text-amber-500' : 'text-gray-500 dark:text-gray-400'}`}>{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dp.map((row, e) => (
              <tr key={e}>
                <td className={`text-right pr-2 font-bold text-xs ${e === ae ? 'text-amber-500' : 'text-gray-500 dark:text-gray-400'}`}>{e}🥚</td>
                {row.map((val, f) => {
                  const isActive = e === ae && f === af;
                  const isHelper = e === ae - 1 || (e === ae && f !== af && step.ak > 0);
                  return (
                    <td key={f} className={`w-8 h-8 text-center font-mono font-semibold border rounded transition-all duration-200 ${
                      isActive ? 'bg-amber-200 dark:bg-amber-800/60 border-amber-400 text-amber-800 dark:text-amber-200 scale-105' :
                      step.done && e === eggs && f === floors ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-400 text-emerald-700 dark:text-emerald-200' :
                      val > 0 ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' :
                      'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400'
                    }`}>
                      {val || ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AlgorithmPageShell>
  );
}
