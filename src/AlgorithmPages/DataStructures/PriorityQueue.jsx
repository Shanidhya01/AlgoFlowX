import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// ─── Heap helpers ────────────────────────────────────────────────────────────
function parent(i) { return Math.floor((i - 1) / 2); }
function left(i)   { return 2 * i + 1; }
function right(i)  { return 2 * i + 2; }

function generateSteps(insertVals) {
  const steps = [];
  let heap = [];
  let opCount = 0;

  const snap = (extra) =>
    steps.push({ heap: [...heap], highlightIdx: [], ...extra });

  snap({ operation: 'init', message: 'Min-Heap ready. Elements are stored so parent ≤ children.', done: false });

  for (const val of insertVals) {
    opCount++;
    heap.push(val);
    let i = heap.length - 1;
    snap({ operation: 'insert', insertedVal: val, highlightIdx: [i], message: `Insert ${val}: added at index ${i} (end of array).`, done: false });

    // bubble up
    while (i > 0 && heap[parent(i)] > heap[i]) {
      const p = parent(i);
      steps.push({ heap: [...heap], highlightIdx: [i, p], operation: 'bubbleUp', insertedVal: val,
        message: `Bubble-up: heap[${p}]=${heap[p]} > heap[${i}]=${heap[i]} → swap.`, done: false });
      [heap[i], heap[p]] = [heap[p], heap[i]];
      i = p;
      steps.push({ heap: [...heap], highlightIdx: [i], operation: 'bubbleUp', insertedVal: val,
        message: `Swapped. ${val} is now at index ${i}.`, done: false });
    }
    snap({ operation: 'insertDone', insertedVal: val, highlightIdx: [i],
      message: `Insert ${val} complete. Min is ${heap[0]}.`, done: false });
  }

  // extractMin sequence
  const extractTimes = 3;
  for (let e = 0; e < extractTimes && heap.length > 0; e++) {
    opCount++;
    const minVal = heap[0];
    steps.push({ heap: [...heap], highlightIdx: [0], operation: 'extractMin', extractedVal: minVal,
      message: `Extract-Min: root is ${minVal}. Swap with last element (${heap[heap.length - 1]}).`, done: false });
    heap[0] = heap[heap.length - 1];
    heap.pop();
    steps.push({ heap: [...heap], highlightIdx: [0], operation: 'extractMin', extractedVal: minVal,
      message: `Removed ${minVal}. Now sift-down the new root.`, done: false });

    let i = 0;
    while (true) {
      const l = left(i), r = right(i);
      let smallest = i;
      if (l < heap.length && heap[l] < heap[smallest]) smallest = l;
      if (r < heap.length && heap[r] < heap[smallest]) smallest = r;
      if (smallest === i) break;
      steps.push({ heap: [...heap], highlightIdx: [i, smallest], operation: 'siftDown', extractedVal: minVal,
        message: `Sift-down: heap[${i}]=${heap[i]} > child heap[${smallest}]=${heap[smallest]} → swap.`, done: false });
      [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
      i = smallest;
    }
    snap({ operation: 'extractDone', extractedVal: minVal, highlightIdx: i < heap.length ? [i] : [],
      message: `Extracted ${minVal}. Heap restored. Min is now ${heap[0] ?? '—'}.`, done: false });
  }

  steps.push({ heap: [...heap], highlightIdx: [], operation: 'done',
    message: `Done! Final heap has ${heap.length} elements. Min = ${heap[0] ?? '—'}.`, done: true });
  return steps;
}

// ─── SVG Tree View ───────────────────────────────────────────────────────────
function HeapTree({ heap, highlightIdx }) {
  if (!heap.length) return <div className="text-gray-400 text-center py-6">Empty heap</div>;

  const nodes = [];
  const edges = [];

  function place(i, x, y, spread) {
    if (i >= heap.length) return;
    nodes.push({ i, val: heap[i], x, y });
    const l = left(i), r = right(i);
    if (l < heap.length) {
      edges.push({ x1: x, y1: y, x2: x - spread, y2: y + 55 });
      place(l, x - spread, y + 55, spread / 2);
    }
    if (r < heap.length) {
      edges.push({ x1: x, y1: y, x2: x + spread, y2: y + 55 });
      place(r, x + spread, y + 55, spread / 2);
    }
  }

  const svgW = 560;
  place(0, svgW / 2, 30, 120);

  const maxY = Math.max(...nodes.map(n => n.y)) + 40;

  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${Math.max(maxY, 80)}`} style={{ overflow: 'visible' }}>
      {edges.map((e, k) => (
        <line key={k} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
          className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="1.5" />
      ))}
      {nodes.map(({ i, val, x, y }) => {
        const isHL = highlightIdx.includes(i);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="20"
              className={`transition-all duration-200 ${
                isHL ? 'fill-amber-200 stroke-amber-500' : 'fill-blue-100 dark:fill-blue-900 stroke-blue-400 dark:stroke-blue-600'
              }`} strokeWidth="2" />
            <text x={x} y={y + 5} textAnchor="middle" fontSize="11"
              className={`font-bold ${isHL ? 'fill-amber-800' : 'fill-blue-800 dark:fill-blue-200'}`}>
              {val}
            </text>
            <text x={x} y={y + 36} textAnchor="middle" fontSize="9"
              className="fill-gray-400">
              [{i}]
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Array View ──────────────────────────────────────────────────────────────
function HeapArray({ heap, highlightIdx }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-2">
      {heap.map((val, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold text-sm border-2 transition-all duration-200 ${
            highlightIdx.includes(i)
              ? 'bg-amber-200 border-amber-500 text-amber-900'
              : 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100'
          }`}>{val}</div>
          <span className="text-[10px] text-gray-400 mt-0.5">[{i}]</span>
        </div>
      ))}
      {heap.length === 0 && <span className="text-gray-400 text-sm">Empty heap</span>}
    </div>
  );
}

// ─── Theory ──────────────────────────────────────────────────────────────────
const theory = (
  <div>
    <TheorySection title="Min-Heap Property">
      <p>A min-heap is a complete binary tree where every parent node is less than or equal to its children. The minimum element is always at the root, enabling O(1) peek.</p>
    </TheorySection>
    <TheorySection title="Array Representation">
      <p>A heap is stored compactly in an array. For a node at index <code>i</code>: parent = <code>⌊(i-1)/2⌋</code>, left child = <code>2i+1</code>, right child = <code>2i+2</code>. No pointers needed — very cache-friendly.</p>
    </TheorySection>
    <TheorySection title="Heapify-Up (Insert)">
      <p>Insert at the end, then repeatedly swap with parent while parent &gt; current. Takes O(log n) swaps in the worst case (height of tree).</p>
    </TheorySection>
    <TheorySection title="Heapify-Down (Extract Min)">
      <p>Swap root with last element, remove last, then push new root down by swapping with the smaller child until heap property is restored. Also O(log n).</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Insert', 'O(log n)', 'O(n)'],
      ['Extract Min', 'O(log n)', 'O(n)'],
      ['Peek Min', 'O(1)', 'O(n)'],
      ['Build Heap', 'O(n)', 'O(n)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `#include <vector>
#include <stdexcept>
using namespace std;

class MinHeap {
    vector<int> h;
    int par(int i) { return (i-1)/2; }
    int lc(int i)  { return 2*i+1; }
    int rc(int i)  { return 2*i+2; }
public:
    void insert(int val) {
        h.push_back(val);
        int i = h.size()-1;
        while (i > 0 && h[par(i)] > h[i]) {
            swap(h[i], h[par(i)]);
            i = par(i);
        }
    }
    int extractMin() {
        if (h.empty()) throw runtime_error("empty");
        int mn = h[0];
        h[0] = h.back(); h.pop_back();
        int i = 0;
        while (true) {
            int s = i, l = lc(i), r = rc(i);
            if (l < h.size() && h[l] < h[s]) s = l;
            if (r < h.size() && h[r] < h[s]) s = r;
            if (s == i) break;
            swap(h[i], h[s]); i = s;
        }
        return mn;
    }
    int peek() { return h[0]; }
};`,
    'Python': `import heapq

class MinHeap:
    def __init__(self):
        self._h = []

    def insert(self, val):
        heapq.heappush(self._h, val)

    def extract_min(self):
        return heapq.heappop(self._h)

    def peek(self):
        return self._h[0]

    def __len__(self):
        return len(self._h)

# Manual implementation
class MinHeapManual:
    def __init__(self):
        self.h = []

    def insert(self, val):
        self.h.append(val)
        i = len(self.h) - 1
        while i > 0:
            p = (i - 1) // 2
            if self.h[p] > self.h[i]:
                self.h[p], self.h[i] = self.h[i], self.h[p]
                i = p
            else:
                break

    def extract_min(self):
        h = self.h
        h[0] = h[-1]; h.pop()
        i = 0
        while True:
            l, r, s = 2*i+1, 2*i+2, i
            if l < len(h) and h[l] < h[s]: s = l
            if r < len(h) and h[r] < h[s]: s = r
            if s == i: break
            h[i], h[s] = h[s], h[i]; i = s`,
    'JavaScript': `class MinHeap {
  constructor() { this.h = []; }
  #par(i) { return Math.floor((i-1)/2); }
  #lc(i)  { return 2*i+1; }
  #rc(i)  { return 2*i+2; }

  insert(val) {
    this.h.push(val);
    let i = this.h.length - 1;
    while (i > 0 && this.h[this.#par(i)] > this.h[i]) {
      [this.h[i], this.h[this.#par(i)]] = [this.h[this.#par(i)], this.h[i]];
      i = this.#par(i);
    }
  }

  extractMin() {
    const min = this.h[0];
    this.h[0] = this.h.at(-1);
    this.h.pop();
    let i = 0;
    while (true) {
      let s = i, l = this.#lc(i), r = this.#rc(i);
      if (l < this.h.length && this.h[l] < this.h[s]) s = l;
      if (r < this.h.length && this.h[r] < this.h[s]) s = r;
      if (s === i) break;
      [this.h[i], this.h[s]] = [this.h[s], this.h[i]];
      i = s;
    }
    return min;
  }

  peek() { return this.h[0]; }
}`,
    'Java': `import java.util.PriorityQueue;

// Java's built-in min-heap
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.offer(5);
pq.offer(2);
int min = pq.poll(); // 2

// Manual implementation
class MinHeap {
    private int[] h;
    private int size;
    MinHeap(int cap) { h = new int[cap]; size = 0; }

    void insert(int val) {
        h[size] = val;
        int i = size++;
        while (i > 0 && h[(i-1)/2] > h[i]) {
            int p = (i-1)/2;
            int tmp = h[i]; h[i] = h[p]; h[p] = tmp;
            i = p;
        }
    }

    int extractMin() {
        int mn = h[0];
        h[0] = h[--size];
        int i = 0;
        while (true) {
            int l=2*i+1, r=2*i+2, s=i;
            if (l<size && h[l]<h[s]) s=l;
            if (r<size && h[r]<h[s]) s=r;
            if (s==i) break;
            int tmp=h[i]; h[i]=h[s]; h[s]=tmp; i=s;
        }
        return mn;
    }
}`,
  }} />
);

const DEFAULT_INSERTS = [5, 2, 8, 1, 6, 3, 7, 4];

export default function PriorityQueue() {
  const [steps, setSteps] = useState(() => generateSteps(DEFAULT_INSERTS));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [customInput, setCustomInput] = useState(DEFAULT_INSERTS.join(', '));
  const [inputError, setInputError] = useState('');
  const [view, setView] = useState('both'); // 'array' | 'tree' | 'both'
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleCustomInput = (val) => {
    setCustomInput(val);
    const nums = val.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (nums.length < 2) { setInputError('Enter at least 2 numbers'); return; }
    if (nums.length > 12) { setInputError('Max 12 values'); return; }
    setInputError('');
    setSteps(generateSteps(nums));
    setCurrentStep(0);
    setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const vals = Array.from({ length: 8 }, () => Math.floor(Math.random() * 30) + 1);
    setCustomInput(vals.join(', '));
    setSteps(generateSteps(vals));
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

  return (
    <AlgorithmPageShell
      title="Priority Queue (Min-Heap)"
      description="Visualize heap insert with bubble-up and extract-min with sift-down"
      category="Data Structures"
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
      customInput={customInput}
      onCustomInput={handleCustomInput}
      inputError={inputError}
      inputPlaceholder="e.g. 5, 2, 8, 1, 6"
      inputLabel="Values to insert (comma-separated)"
      showInput={true}
      stats={{ size: step.heap.length, min: step.heap[0] ?? '—', operations: steps.filter(s => s.operation === 'insertDone' || s.operation === 'extractDone').filter((_, i) => i <= currentStep).length }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(log n) insert and extract-min',
        'O(1) peek at minimum',
        'Array-based storage — cache-friendly',
        'No balancing logic needed (unlike BST)',
      ]}
      disadvantages={[
        'No O(1) arbitrary access by value',
        'Not a sorted structure — only min is accessible quickly',
        'Decreasing a key requires knowing the index',
      ]}
      applications={[
        "Dijkstra's shortest path algorithm",
        'Huffman encoding / compression',
        'Task scheduling by priority',
        'Event-driven simulation',
        'A* pathfinding',
        'Merge K sorted lists',
      ]}
      interviewTips={[
        'Python heapq is a min-heap by default; negate values for max-heap',
        'Java PriorityQueue is also a min-heap',
        "Know heapify-up (insert) vs heapify-down (extract) — they're different",
        'Build heap from array in O(n) by sifting down from n/2-1 to 0',
        'Heap sort uses a max-heap and runs in O(n log n) in-place',
      ]}
      relatedAlgos={[
        { title: 'Queue', route: '/queue' },
        { title: 'Heap Sort', route: '/heap-sort' },
        { title: 'Dijkstra Algorithm', route: '/dijkstras' },
      ]}
      practiceProblems={[
        { name: 'Kth Largest Element', difficulty: 'Medium', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
        { name: 'Find Median from Data Stream', difficulty: 'Hard', url: 'https://leetcode.com/problems/find-median-from-data-stream/' },
        { name: 'Merge K Sorted Lists', difficulty: 'Hard', url: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
        { name: 'Task Scheduler', difficulty: 'Medium', url: 'https://leetcode.com/problems/task-scheduler/' },
      ]}
    >
      {/* View toggle */}
      <div className="flex gap-2 mb-4 justify-center">
        {['array', 'tree', 'both'].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
              view === v ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}>
            {v === 'both' ? 'Both Views' : v === 'array' ? 'Array View' : 'Tree View'}
          </button>
        ))}
      </div>

      {/* Operation badge */}
      {step.operation && step.operation !== 'init' && step.operation !== 'done' && (
        <div className={`text-center mb-3 text-xs font-semibold px-3 py-1 rounded-full inline-block mx-auto ${
          step.operation.includes('extract') || step.operation === 'siftDown'
            ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
            : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
        }`}>
          {step.operation.includes('extract') || step.operation === 'siftDown'
            ? `Extract-Min: removing ${step.extractedVal}`
            : `Insert: ${step.insertedVal}`}
        </div>
      )}

      {(view === 'array' || view === 'both') && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-center">Array Representation</h3>
          <HeapArray heap={step.heap} highlightIdx={step.highlightIdx || []} />
          <p className="text-center text-xs text-gray-400 mt-2">
            Parent(i) = ⌊(i-1)/2⌋ &nbsp;|&nbsp; Left(i) = 2i+1 &nbsp;|&nbsp; Right(i) = 2i+2
          </p>
        </div>
      )}

      {(view === 'tree' || view === 'both') && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-center">Tree View</h3>
          <HeapTree heap={step.heap} highlightIdx={step.highlightIdx || []} />
        </div>
      )}
    </AlgorithmPageShell>
  );
}
