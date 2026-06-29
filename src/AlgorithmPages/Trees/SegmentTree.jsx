import React, { useState, useEffect, useRef } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// ─── Segment Tree logic ───────────────────────────────────────────────────────
const ARR = [1, 3, 5, 7, 9, 11];
const N = ARR.length;

function buildSeg(arr) {
  const size = arr.length;
  const tree = new Array(4 * size).fill(0);
  function build(node, start, end) {
    if (start === end) { tree[node] = arr[start]; return; }
    const mid = Math.floor((start + end) / 2);
    build(2 * node, start, mid);
    build(2 * node + 1, mid + 1, end);
    tree[node] = tree[2 * node] + tree[2 * node + 1];
  }
  build(1, 0, size - 1);
  return tree;
}

function generateSteps() {
  const arr = [...ARR];
  const steps = [];
  let tree = buildSeg(arr);

  const cloneState = (highlight, queryRange, updateIdx, label) => ({
    tree: [...tree],
    arr: [...arr],
    highlight: [...highlight],
    queryRange,
    updateIdx,
    label,
  });

  steps.push({ ...cloneState([], null, null, 'build'), message: 'Building Segment Tree for [1,3,5,7,9,11]' });

  // Show build with highlights
  function showBuild(node, start, end, hl) {
    hl.push(node);
    steps.push({ ...cloneState([...hl], null, null, 'build'), message: `Build: node ${node} covers [${start},${end}] = ${tree[node]}` });
    if (start === end) { hl.pop(); return; }
    const mid = Math.floor((start + end) / 2);
    showBuild(2 * node, start, mid, hl);
    showBuild(2 * node + 1, mid + 1, end, hl);
    hl.pop();
  }
  showBuild(1, 0, N - 1, []);

  // Query(1,3)
  steps.push({ ...cloneState([], [1, 3], null, 'query'), message: 'Query sum(1,3) — finding nodes covering [1,3]' });
  function showQuery(node, start, end, l, r, hl) {
    if (r < start || end < l) return 0;
    hl.push(node);
    steps.push({ ...cloneState([...hl], [l, r], null, 'query'), message: `Query: checking node ${node} [${start},${end}] vs query [${l},${r}]` });
    if (l <= start && end <= r) { hl.pop(); return tree[node]; }
    const mid = Math.floor((start + end) / 2);
    const left = showQuery(2 * node, start, mid, l, r, hl);
    const right = showQuery(2 * node + 1, mid + 1, end, l, r, hl);
    hl.pop();
    return left + right;
  }
  const sum1 = showQuery(1, 0, N - 1, 1, 3, []);
  steps.push({ ...cloneState([], [1, 3], null, 'result'), message: `Query result: sum(1,3) = ${sum1}` });

  // Update index 1 → value 10
  steps.push({ ...cloneState([], null, 1, 'update'), message: 'Update: arr[1] = 10 (was 3)' });
  function updateSeg(node, start, end, idx, val) {
    if (start === end) { tree[node] = val; return; }
    const mid = Math.floor((start + end) / 2);
    if (idx <= mid) updateSeg(2 * node, start, mid, idx, val);
    else updateSeg(2 * node + 1, mid + 1, end, idx, val);
    tree[node] = tree[2 * node] + tree[2 * node + 1];
  }
  function showUpdate(node, start, end, idx, val, hl) {
    hl.push(node);
    steps.push({ ...cloneState([...hl], null, idx, 'update'), message: `Update: visiting node ${node} [${start},${end}]` });
    if (start === end) { tree[node] = val; arr[idx] = val; hl.pop(); return; }
    const mid = Math.floor((start + end) / 2);
    if (idx <= mid) showUpdate(2 * node, start, mid, idx, val, hl);
    else showUpdate(2 * node + 1, mid + 1, end, idx, val, hl);
    tree[node] = tree[2 * node] + tree[2 * node + 1];
    hl.pop();
  }
  showUpdate(1, 0, N - 1, 1, 10, []);
  steps.push({ ...cloneState([], null, null, 'updated'), message: 'Update done: arr[1] = 10, tree recalculated' });

  // Query(1,3) again
  steps.push({ ...cloneState([], [1, 3], null, 'query'), message: 'Query sum(1,3) again after update' });
  const sum2 = showQuery(1, 0, N - 1, 1, 3, []);
  steps.push({ ...cloneState([], [1, 3], null, 'result'), message: `Query result: sum(1,3) = ${sum2} (updated)`, done: true });

  return steps;
}

const STEPS = generateSteps();

// ─── SVG Segment Tree renderer ────────────────────────────────────────────────
function SegTreeSVG({ step }) {
  const { tree, highlight, arr } = step;

  // Draw up to depth 4 (enough for 6 elements)
  const nodePos = {};
  const totalW = 640;
  function computePos(node, depth, left, right) {
    if (node >= tree.length || tree[node] === 0 && node > 1) return;
    const x = (left + right) / 2;
    const y = depth * 58 + 30;
    nodePos[node] = { x, y, depth };
    if (2 * node < tree.length) {
      computePos(2 * node, depth + 1, left, (left + right) / 2);
      computePos(2 * node + 1, depth + 1, (left + right) / 2, right);
    }
  }
  computePos(1, 0, 0, totalW);

  const maxDepth = Math.max(...Object.values(nodePos).map(p => p.depth));
  const H = (maxDepth + 1) * 58 + 40;

  // Build range labels per node
  function getRanges(node, start, end, ranges) {
    if (!nodePos[node]) return;
    ranges[node] = [start, end];
    if (start === end) return;
    const mid = Math.floor((start + end) / 2);
    getRanges(2 * node, start, mid, ranges);
    getRanges(2 * node + 1, mid + 1, end, ranges);
  }
  const ranges = {};
  getRanges(1, 0, N - 1, ranges);

  return (
    <svg width={totalW} height={H} className="overflow-visible">
      {Object.entries(nodePos).map(([node, { x, y }]) => {
        const n = parseInt(node);
        const parent = Math.floor(n / 2);
        if (parent >= 1 && nodePos[parent]) {
          return (
            <line key={`e${n}`} x1={nodePos[parent].x} y1={nodePos[parent].y}
              x2={x} y2={y} stroke="#6b7280" strokeWidth="1.5" />
          );
        }
        return null;
      })}
      {Object.entries(nodePos).map(([node, { x, y }]) => {
        const n = parseInt(node);
        const isHL = highlight.includes(n);
        const isQuery = step.label === 'query' && isHL;
        const isUpdate = step.label === 'update' && isHL;
        const fill = isQuery ? '#3b82f6' : isUpdate ? '#f59e0b' : isHL ? '#8b5cf6' : '#374151';
        const rng = ranges[n] || [0, 0];
        return (
          <g key={`n${n}`} transform={`translate(${x},${y})`}>
            <rect x="-28" y="-18" width="56" height="36" rx="8" fill={fill} stroke={isHL ? '#fff' : '#4b5563'} strokeWidth="1.5" />
            <text textAnchor="middle" dy="-4" fontSize="12" fontWeight="bold" fill="white">{tree[n]}</text>
            <text textAnchor="middle" dy="10" fontSize="9" fill={isHL ? '#ddd6fe' : '#9ca3af'}>[{rng[0]},{rng[1]}]</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Theory / Code ────────────────────────────────────────────────────────────
const theory = (
  <div>
    <TheorySection title="What is a Segment Tree?">
      <p>A Segment Tree is a tree data structure for storing information about intervals or segments. Each node stores the aggregate (sum, min, max, gcd) over a range of the array. It allows efficient range queries and point updates in O(log n) time.</p>
      <p>The tree is built bottom-up: leaf nodes hold individual elements; internal nodes hold merged values of their children's ranges.</p>
    </TheorySection>
    <TheorySection title="Key Operations">
      <ul className="list-disc pl-4 space-y-1">
        <li><strong>Build:</strong> O(n) — fill leaves, compute parents bottom-up</li>
        <li><strong>Query(l,r):</strong> O(log n) — split range into O(log n) pre-computed segments</li>
        <li><strong>Update(i, val):</strong> O(log n) — update leaf, recompute ancestors</li>
        <li><strong>Lazy Propagation:</strong> enables O(log n) range updates</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Build', 'O(n)', 'O(n)'],
      ['Query', 'O(log n)', 'O(log n)'],
      ['Update', 'O(log n)', 'O(log n)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `class SegTree {
    vector<int> tree;
    int n;
public:
    SegTree(vector<int>& a): n(a.size()), tree(4*a.size()) { build(a,1,0,n-1); }
    void build(vector<int>& a, int node, int s, int e){
        if(s==e){ tree[node]=a[s]; return; }
        int m=(s+e)/2;
        build(a,2*node,s,m); build(a,2*node+1,m+1,e);
        tree[node]=tree[2*node]+tree[2*node+1];
    }
    int query(int node, int s, int e, int l, int r){
        if(r<s||e<l) return 0;
        if(l<=s&&e<=r) return tree[node];
        int m=(s+e)/2;
        return query(2*node,s,m,l,r)+query(2*node+1,m+1,e,l,r);
    }
    void update(int node, int s, int e, int idx, int val){
        if(s==e){ tree[node]=val; return; }
        int m=(s+e)/2;
        if(idx<=m) update(2*node,s,m,idx,val);
        else update(2*node+1,m+1,e,idx,val);
        tree[node]=tree[2*node]+tree[2*node+1];
    }
    int query(int l,int r){ return query(1,0,n-1,l,r); }
    void update(int i,int v){ update(1,0,n-1,i,v); }
};`,
    'Python': `class SegTree:
    def __init__(self, a):
        self.n = len(a); self.t = [0]*(4*self.n); self.build(a,1,0,self.n-1)
    def build(self,a,nd,s,e):
        if s==e: self.t[nd]=a[s]; return
        m=(s+e)//2; self.build(a,2*nd,s,m); self.build(a,2*nd+1,m+1,e)
        self.t[nd]=self.t[2*nd]+self.t[2*nd+1]
    def query(self,nd,s,e,l,r):
        if r<s or e<l: return 0
        if l<=s and e<=r: return self.t[nd]
        m=(s+e)//2
        return self.query(2*nd,s,m,l,r)+self.query(2*nd+1,m+1,e,l,r)
    def update(self,nd,s,e,i,v):
        if s==e: self.t[nd]=v; return
        m=(s+e)//2
        if i<=m: self.update(2*nd,s,m,i,v)
        else: self.update(2*nd+1,m+1,e,i,v)
        self.t[nd]=self.t[2*nd]+self.t[2*nd+1]`,
    'JavaScript': `class SegTree {
  constructor(a){ this.n=a.length; this.t=new Array(4*this.n).fill(0); this.build(a,1,0,this.n-1); }
  build(a,nd,s,e){ if(s===e){this.t[nd]=a[s];return;} const m=(s+e)>>1; this.build(a,2*nd,s,m); this.build(a,2*nd+1,m+1,e); this.t[nd]=this.t[2*nd]+this.t[2*nd+1]; }
  query(nd,s,e,l,r){ if(r<s||e<l)return 0; if(l<=s&&e<=r)return this.t[nd]; const m=(s+e)>>1; return this.query(2*nd,s,m,l,r)+this.query(2*nd+1,m+1,e,l,r); }
  update(nd,s,e,i,v){ if(s===e){this.t[nd]=v;return;} const m=(s+e)>>1; if(i<=m)this.update(2*nd,s,m,i,v); else this.update(2*nd+1,m+1,e,i,v); this.t[nd]=this.t[2*nd]+this.t[2*nd+1]; }
}`,
    'Java': `class SegTree {
    int[] t; int n;
    SegTree(int[] a){ n=a.length; t=new int[4*n]; build(a,1,0,n-1); }
    void build(int[] a,int nd,int s,int e){ if(s==e){t[nd]=a[s];return;} int m=(s+e)/2; build(a,2*nd,s,m); build(a,2*nd+1,m+1,e); t[nd]=t[2*nd]+t[2*nd+1]; }
    int query(int nd,int s,int e,int l,int r){ if(r<s||e<l)return 0; if(l<=s&&e<=r)return t[nd]; int m=(s+e)/2; return query(2*nd,s,m,l,r)+query(2*nd+1,m+1,e,l,r); }
    void update(int nd,int s,int e,int i,int v){ if(s==e){t[nd]=v;return;} int m=(s+e)/2; if(i<=m)update(2*nd,s,m,i,v); else update(2*nd+1,m+1,e,i,v); t[nd]=t[2*nd]+t[2*nd+1]; }
}`,
  }} />
);

export default function SegmentTree() {
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

  return (
    <AlgorithmPageShell
      title="Segment Tree"
      description="Tree for O(log n) range sum queries and point updates"
      category="Trees"
      difficulty="Hard"
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
      stats={{ step: `${currentStep + 1}/${STEPS.length}`, phase: step.label || '-' }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(log n) range queries and point updates',
        'Versatile: works for sum, min, max, gcd, etc.',
        'Can be extended with lazy propagation for range updates',
      ]}
      disadvantages={[
        'O(4n) space usage',
        'More complex than prefix sums for static arrays',
        'Lazy propagation adds significant code complexity',
      ]}
      applications={['Range sum / min / max queries', 'Interval scheduling', 'Computational geometry', 'Competitive programming']}
      interviewTips={[
        'Always ask if updates are needed — if not, prefix sums suffice',
        'Node indices: root=1, left=2i, right=2i+1',
        'Size the array as 4*n to be safe',
        'Merge operation defines what the tree computes (sum/min/max/etc.)',
      ]}
      relatedAlgos={[
        { title: 'Fenwick Tree', route: '/fenwick-tree' },
        { title: 'AVL Tree', route: '/avl-tree' },
      ]}
      practiceProblems={[
        { name: 'Range Sum Query - Mutable', difficulty: 'Medium', url: 'https://leetcode.com/problems/range-sum-query-mutable/' },
        { name: 'Count of Range Sum', difficulty: 'Hard', url: 'https://leetcode.com/problems/count-of-range-sum/' },
        { name: 'My Calendar III', difficulty: 'Hard', url: 'https://leetcode.com/problems/my-calendar-iii/' },
      ]}
    >
      <div className="flex flex-col items-center gap-3 overflow-x-auto">
        {/* Array view */}
        <div className="flex gap-2 mb-2">
          {step.arr.map((v, i) => (
            <div key={i} className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm border-2
              ${step.queryRange && i >= step.queryRange[0] && i <= step.queryRange[1] ? 'bg-blue-100 dark:bg-blue-950/50 border-blue-400 text-blue-700 dark:text-blue-300' :
                step.updateIdx === i ? 'bg-amber-100 dark:bg-amber-950/50 border-amber-400 text-amber-700 dark:text-amber-300' :
                'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>
              {v}
            </div>
          ))}
        </div>
        <div className="overflow-x-auto w-full">
          <SegTreeSVG step={step} />
        </div>
        <div className="flex gap-4 text-xs flex-wrap justify-center">
          {[['bg-blue-500', 'Query node'], ['bg-amber-500', 'Update node'], ['bg-purple-500', 'Build node'], ['bg-gray-700', 'Unvisited']].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded ${c} inline-block`} />{l}
            </span>
          ))}
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
