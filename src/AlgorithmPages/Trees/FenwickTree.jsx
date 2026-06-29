import React, { useState, useEffect, useRef } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// ─── Fenwick Tree logic ───────────────────────────────────────────────────────
const ARR = [1, 3, 5, 7, 9, 11];

function lowbit(i) { return i & (-i); }

function buildFenwick(arr) {
  const n = arr.length;
  const bit = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    bit[i] += arr[i - 1];
    const j = i + lowbit(i);
    if (j <= n) bit[j] += bit[i];
  }
  return bit;
}

function generateSteps() {
  const arr = [...ARR];
  const n = arr.length;
  const steps = [];
  const bit = new Array(n + 1).fill(0);

  steps.push({ bit: [...bit], arr: [...arr], highlight: [], queryPath: [], prefixSum: null, phase: 'build', message: 'Building Fenwick Tree from [1,3,5,7,9,11]' });

  // Build step by step
  for (let i = 1; i <= n; i++) {
    bit[i] += arr[i - 1];
    let j = i + lowbit(i);
    const hl = [i];
    if (j <= n) {
      bit[j] += bit[i];
      hl.push(j);
    }
    steps.push({ bit: [...bit], arr: [...arr], highlight: hl, queryPath: [], prefixSum: null, phase: 'build', message: `Update index ${i}: BIT[${i}]=${bit[i]}${j <= n ? `, propagate to BIT[${j}]=${bit[j]}` : ''}; lowbit(${i})=${lowbit(i)}` });
  }

  steps.push({ bit: [...bit], arr: [...arr], highlight: [], queryPath: [], prefixSum: null, phase: 'built', message: 'Fenwick Tree built. Now querying prefix sum(4) = sum of arr[0..3]' });

  // Query prefix sum up to index 4 (1-indexed)
  let idx = 4;
  let sum = 0;
  const qPath = [];
  let cur = idx;
  while (cur > 0) {
    qPath.push(cur);
    sum += bit[cur];
    steps.push({ bit: [...bit], arr: [...arr], highlight: [cur], queryPath: [...qPath], prefixSum: sum, phase: 'query', message: `Query: add BIT[${cur}]=${bit[cur]}, move to ${cur - lowbit(cur)}; running sum=${sum}` });
    cur -= lowbit(cur);
  }
  steps.push({ bit: [...bit], arr: [...arr], highlight: [], queryPath: qPath, prefixSum: sum, phase: 'result', message: `Prefix sum(0..3) = ${sum}  (1+3+5+7=${sum})`, done: true });

  return steps;
}

const STEPS = generateSteps();
const N = ARR.length;

// ─── Theory / Code ────────────────────────────────────────────────────────────
const theory = (
  <div>
    <TheorySection title="What is a Fenwick Tree (BIT)?">
      <p>A Fenwick Tree (Binary Indexed Tree) stores partial sums such that each index i is responsible for elements from i - lowbit(i) + 1 to i, where lowbit(i) = i AND (-i).</p>
      <p>This allows prefix sums and point updates in O(log n) with just a 1D array — no tree structure needed in memory.</p>
    </TheorySection>
    <TheorySection title="Key Insight: lowbit(i)">
      <p>lowbit(i) = i & (-i) extracts the lowest set bit. For update: propagate i → i + lowbit(i). For query: walk i → i - lowbit(i) until 0.</p>
      <ul className="list-disc pl-4 space-y-1 mt-2">
        <li>lowbit(1) = 1 → BIT[1] covers 1 element</li>
        <li>lowbit(2) = 2 → BIT[2] covers 2 elements</li>
        <li>lowbit(4) = 4 → BIT[4] covers 4 elements</li>
        <li>lowbit(6) = 2 → BIT[6] covers 2 elements</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Build', 'O(n)', 'O(n)'],
      ['Point Update', 'O(log n)', 'O(1)'],
      ['Prefix Query', 'O(log n)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `class BIT {
    vector<int> t; int n;
public:
    BIT(int n): n(n), t(n+1,0){}
    void update(int i, int delta){
        for(; i<=n; i+=i&(-i)) t[i]+=delta;
    }
    int query(int i){
        int s=0;
        for(; i>0; i-=i&(-i)) s+=t[i];
        return s;
    }
    int range(int l, int r){ return query(r)-query(l-1); }
};`,
    'Python': `class BIT:
    def __init__(self, n):
        self.n = n; self.t = [0]*(n+1)
    def update(self, i, delta):
        while i <= self.n:
            self.t[i] += delta; i += i & (-i)
    def query(self, i):
        s = 0
        while i > 0:
            s += self.t[i]; i -= i & (-i)
        return s
    def range_sum(self, l, r):
        return self.query(r) - self.query(l-1)`,
    'JavaScript': `class BIT {
  constructor(n){ this.n=n; this.t=new Array(n+1).fill(0); }
  update(i,delta){ for(;i<=this.n;i+=i&(-i)) this.t[i]+=delta; }
  query(i){ let s=0; for(;i>0;i-=i&(-i)) s+=this.t[i]; return s; }
  range(l,r){ return this.query(r)-this.query(l-1); }
}`,
    'Java': `class BIT {
    int[] t; int n;
    BIT(int n){ this.n=n; t=new int[n+1]; }
    void update(int i, int delta){ for(;i<=n;i+=i&(-i)) t[i]+=delta; }
    int query(int i){ int s=0; for(;i>0;i-=i&(-i)) s+=t[i]; return s; }
    int range(int l, int r){ return query(r)-query(l-1); }
}`,
  }} />
);

export default function FenwickTree() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);
  const step = STEPS[currentStep] || STEPS[0];

  useEffect(() => {
    if (!isRunning) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= STEPS.length - 1) { setIsRunning(false); return prev; }
        return prev + 1;
      });
    }, speed);
    return () => clearInterval(timerRef.current);
  }, [isRunning, speed]);

  const maxBit = Math.max(...step.bit.slice(1), 1);

  return (
    <AlgorithmPageShell
      title="Fenwick Tree (BIT)"
      description="Binary Indexed Tree for O(log n) prefix sums and point updates"
      category="Trees"
      difficulty="Medium"
      steps={STEPS}
      currentStep={currentStep}
      isRunning={isRunning}
      onPlay={() => setIsRunning(true)}
      onPause={() => setIsRunning(false)}
      onReset={() => { setIsRunning(false); setCurrentStep(0); }}
      onStepForward={() => setCurrentStep(p => Math.min(p + 1, STEPS.length - 1))}
      onStepBack={() => setCurrentStep(p => Math.max(p - 1, 0))}
      speed={speed}
      onSpeedChange={setSpeed}
      onRandomize={() => { setCurrentStep(0); setIsRunning(false); }}
      showInput={false}
      stats={{ step: `${currentStep + 1}/${STEPS.length}`, phase: step.phase, prefixSum: step.prefixSum ?? '-' }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Simpler and faster than Segment Tree for prefix sums',
        'O(n) space — just a 1D array',
        'Cache-friendly due to array layout',
        'Easy to extend to 2D (Fenwick 2D)',
      ]}
      disadvantages={[
        'Only works for invertible operations (sum, XOR — not min/max)',
        'Range updates require additional techniques',
        'Less intuitive than Segment Tree',
      ]}
      applications={['Order statistics', 'Inversion count', 'Frequency tables', 'Competitive programming']}
      interviewTips={[
        'Master the lowbit trick: i & (-i)',
        'Update propagates forward (i += lowbit(i)); query walks backward (i -= lowbit(i))',
        'BIT is 1-indexed — always shift input by +1',
        'For range update + range query, use two BITs',
      ]}
      relatedAlgos={[
        { title: 'Segment Tree', route: '/segment-tree' },
        { title: 'Binary Heap', route: '/binary-heap' },
      ]}
      practiceProblems={[
        { name: 'Range Sum Query - Mutable', difficulty: 'Medium', url: 'https://leetcode.com/problems/range-sum-query-mutable/' },
        { name: 'Count of Smaller Numbers After Self', difficulty: 'Hard', url: 'https://leetcode.com/problems/count-of-smaller-numbers-after-self/' },
        { name: 'Reverse Pairs', difficulty: 'Hard', url: 'https://leetcode.com/problems/reverse-pairs/' },
      ]}
    >
      <div className="flex flex-col gap-6">
        {/* Original array */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Original Array (0-indexed)</p>
          <div className="flex gap-2">
            {step.arr.map((v, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-12 h-10 flex items-center justify-center rounded-lg font-bold text-sm border-2
                  ${step.queryPath.includes(i + 1) ? 'bg-blue-100 dark:bg-blue-950/50 border-blue-400 text-blue-700 dark:text-blue-300' :
                    'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>
                  {v}
                </div>
                <span className="text-xs text-gray-400">{i}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BIT array with bar chart */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">BIT Array (1-indexed) — bar height = BIT[i] value</p>
          <div className="flex items-end gap-2 h-36">
            {step.bit.slice(1).map((v, i) => {
              const idx1 = i + 1;
              const isHL = step.highlight.includes(idx1);
              const isQuery = step.queryPath.includes(idx1);
              const lb = lowbit(idx1);
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{v}</span>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${isQuery ? 'bg-blue-500' : isHL ? 'bg-amber-400' : 'bg-violet-500'}`}
                    style={{ height: `${v > 0 ? Math.max((v / maxBit) * 96, 8) : 4}px` }}
                  />
                  <div className="text-center">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{idx1}</span>
                    <div className="text-xs text-gray-400">lb={lb}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {step.prefixSum !== null && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
            <span className="text-blue-700 dark:text-blue-300 text-sm font-bold">Running prefix sum: {step.prefixSum}</span>
          </div>
        )}

        <div className="flex gap-4 text-xs flex-wrap">
          {[['bg-violet-500', 'BIT cell'], ['bg-amber-400', 'Build update'], ['bg-blue-500', 'Query path']].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded ${c} inline-block`} />{l}
            </span>
          ))}
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
