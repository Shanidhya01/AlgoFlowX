import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// ─── Step Generator ───────────────────────────────────────────────────────────

function generateHeapSteps() {
  const steps = [];
  const heap = [];
  const insertSeq = [15, 10, 20, 5, 8, 3, 12];
  let totalSwaps = 0;

  const snapshot = (phase, operation, swapPath, message, done = false) => {
    steps.push({
      heap: [...heap],
      phase,
      operation,
      swapPath: swapPath ? [...swapPath] : [],
      swaps: totalSwaps,
      message,
      done,
    });
  };

  snapshot('init', 'idle', [], 'Min Binary Heap: insert sequence [15,10,20,5,8,3,12]');

  // ── Insert Phase ─────────────────────────────────────────────────────────
  for (const val of insertSeq) {
    heap.push(val);
    snapshot('insert', 'insert', [], `Insert ${val} at index ${heap.length - 1}`);

    let i = heap.length - 1;
    const path = [i];
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[parent] > heap[i]) {
        path.push(parent);
        snapshot('sift-up', 'insert', path, `Sift-up: swap heap[${parent}]=${heap[parent]} with heap[${i}]=${heap[i]}`);
        [heap[parent], heap[i]] = [heap[i], heap[parent]];
        totalSwaps++;
        i = parent;
        snapshot('sift-up', 'insert', [i], `After swap → heap[${i}]=${heap[i]}, swaps=${totalSwaps}`);
      } else {
        break;
      }
    }
    snapshot('insert', 'insert', [], `Inserted ${val}. min=${heap[0]}, size=${heap.length}`);
  }

  snapshot('extract-ready', 'idle', [], 'All inserts done. Now extract-min 3 times.');

  // ── Extract-Min Phase ────────────────────────────────────────────────────
  for (let ex = 0; ex < 3; ex++) {
    const minVal = heap[0];
    snapshot('extract', 'extract', [0], `Extract-min: remove heap[0]=${minVal}`);
    heap[0] = heap.pop();
    if (heap.length === 0) break;
    snapshot('sift-down', 'extract', [0], `Move last element ${heap[0]} to root, sift-down starts`);

    let i = 0;
    while (true) {
      const l = 2 * i + 1, r = 2 * i + 2;
      let smallest = i;
      if (l < heap.length && heap[l] < heap[smallest]) smallest = l;
      if (r < heap.length && heap[r] < heap[smallest]) smallest = r;
      if (smallest === i) break;
      snapshot('sift-down', 'extract', [i, smallest], `Sift-down: swap heap[${i}]=${heap[i]} with heap[${smallest}]=${heap[smallest]}`);
      [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
      totalSwaps++;
      i = smallest;
      snapshot('sift-down', 'extract', [i], `After swap → heap[${i}]=${heap[i]}, swaps=${totalSwaps}`);
    }
    snapshot('extract', 'extract', [], `Extracted ${minVal}. New min=${heap[0] ?? 'empty'}, size=${heap.length}`);
  }

  snapshot('done', 'idle', [], `Done! Total swaps: ${totalSwaps}`, true);
  return steps;
}

// ─── SVG Tree View ────────────────────────────────────────────────────────────

function HeapTree({ heap, swapPath }) {
  if (!heap || heap.length === 0) return <p className="text-gray-400 text-xs text-center">Empty heap</p>;

  const W = 320, H = 200;
  const nodeR = 18;
  const levels = Math.ceil(Math.log2(heap.length + 1));

  const positions = heap.map((_, i) => {
    const level = Math.floor(Math.log2(i + 1));
    const posInLevel = i - (Math.pow(2, level) - 1);
    const totalInLevel = Math.pow(2, level);
    const x = ((posInLevel + 0.5) / totalInLevel) * W;
    const y = 24 + level * (H - 30) / Math.max(levels - 1, 1);
    return { x, y };
  });

  const edges = [];
  for (let i = 1; i < heap.length; i++) {
    const p = Math.floor((i - 1) / 2);
    edges.push({ x1: positions[p].x, y1: positions[p].y, x2: positions[i].x, y2: positions[i].y });
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
      {edges.map((e, i) => (
        <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
          stroke="#6366f1" strokeWidth="1.5" opacity="0.5" />
      ))}
      {heap.map((val, i) => {
        const { x, y } = positions[i];
        const inPath = swapPath.includes(i);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={nodeR}
              fill={inPath ? '#ef4444' : i === 0 ? '#10b981' : '#6366f1'}
              opacity={0.85}
              className="transition-all duration-300"
            />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">{val}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Theory & Code ────────────────────────────────────────────────────────────

const theory = (
  <div>
    <TheorySection title="How a Binary Heap Works">
      <p>A Min Binary Heap is a complete binary tree where every node is smaller than or equal to its children. It is typically stored as an array where node <code>i</code> has children at <code>2i+1</code> and <code>2i+2</code>, and parent at <code>⌊(i-1)/2⌋</code>.</p>
      <p><strong>Insert:</strong> Append to the end, then sift-up (swap with parent while parent is larger).</p>
      <p><strong>Extract-Min:</strong> Remove root, move last element to root, then sift-down (swap with smallest child while smaller child exists).</p>
    </TheorySection>
    <TheorySection title="Key Properties">
      <ul className="list-disc pl-4 space-y-1">
        <li>Complete binary tree: all levels full except possibly the last, filled left to right</li>
        <li>Heap property: parent ≤ both children (min-heap)</li>
        <li>Root always holds the minimum element</li>
        <li>Array representation: parent at <code>⌊(i-1)/2⌋</code>, children at <code>2i+1</code>, <code>2i+2</code></li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Insert', 'O(log n)', 'O(1)'],
      ['Extract-Min', 'O(log n)', 'O(1)'],
      ['Peek Min', 'O(1)', 'O(1)'],
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
    void siftUp(int i) {
        while (i > 0) {
            int p = (i - 1) / 2;
            if (h[p] > h[i]) { swap(h[p], h[i]); i = p; }
            else break;
        }
    }
    void siftDown(int i) {
        int n = h.size();
        while (true) {
            int sm = i, l = 2*i+1, r = 2*i+2;
            if (l < n && h[l] < h[sm]) sm = l;
            if (r < n && h[r] < h[sm]) sm = r;
            if (sm == i) break;
            swap(h[i], h[sm]); i = sm;
        }
    }
public:
    void insert(int val) { h.push_back(val); siftUp(h.size()-1); }
    int extractMin() {
        if (h.empty()) throw runtime_error("empty");
        int m = h[0]; h[0] = h.back(); h.pop_back();
        if (!h.empty()) siftDown(0);
        return m;
    }
    int peekMin() { return h[0]; }
};`,
    'Python': `class MinHeap:
    def __init__(self):
        self.h = []

    def insert(self, val):
        self.h.append(val)
        self._sift_up(len(self.h) - 1)

    def extract_min(self):
        if not self.h:
            raise IndexError("empty heap")
        self.h[0], self.h[-1] = self.h[-1], self.h[0]
        val = self.h.pop()
        if self.h:
            self._sift_down(0)
        return val

    def _sift_up(self, i):
        while i > 0:
            p = (i - 1) // 2
            if self.h[p] > self.h[i]:
                self.h[p], self.h[i] = self.h[i], self.h[p]
                i = p
            else:
                break

    def _sift_down(self, i):
        n = len(self.h)
        while True:
            sm, l, r = i, 2*i+1, 2*i+2
            if l < n and self.h[l] < self.h[sm]: sm = l
            if r < n and self.h[r] < self.h[sm]: sm = r
            if sm == i: break
            self.h[i], self.h[sm] = self.h[sm], self.h[i]
            i = sm`,
    'JavaScript': `class MinHeap {
  constructor() { this.h = []; }

  insert(val) {
    this.h.push(val);
    this._siftUp(this.h.length - 1);
  }

  extractMin() {
    const min = this.h[0];
    this.h[0] = this.h.pop();
    if (this.h.length) this._siftDown(0);
    return min;
  }

  _siftUp(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.h[p] > this.h[i]) { [this.h[p], this.h[i]] = [this.h[i], this.h[p]]; i = p; }
      else break;
    }
  }

  _siftDown(i) {
    const n = this.h.length;
    while (true) {
      let sm = i, l = 2*i+1, r = 2*i+2;
      if (l < n && this.h[l] < this.h[sm]) sm = l;
      if (r < n && this.h[r] < this.h[sm]) sm = r;
      if (sm === i) break;
      [this.h[i], this.h[sm]] = [this.h[sm], this.h[i]]; i = sm;
    }
  }
}`,
    'Java': `import java.util.ArrayList;

public class MinHeap {
    private ArrayList<Integer> h = new ArrayList<>();

    public void insert(int val) {
        h.add(val);
        siftUp(h.size() - 1);
    }

    public int extractMin() {
        int min = h.get(0);
        h.set(0, h.remove(h.size() - 1));
        if (!h.isEmpty()) siftDown(0);
        return min;
    }

    private void siftUp(int i) {
        while (i > 0) {
            int p = (i - 1) / 2;
            if (h.get(p) > h.get(i)) {
                int tmp = h.get(p); h.set(p, h.get(i)); h.set(i, tmp);
                i = p;
            } else break;
        }
    }

    private void siftDown(int i) {
        int n = h.size();
        while (true) {
            int sm = i, l = 2*i+1, r = 2*i+2;
            if (l < n && h.get(l) < h.get(sm)) sm = l;
            if (r < n && h.get(r) < h.get(sm)) sm = r;
            if (sm == i) break;
            int tmp = h.get(i); h.set(i, h.get(sm)); h.set(sm, tmp);
            i = sm;
        }
    }
}`,
  }} />
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function BinaryHeap() {
  const [steps] = useState(() => generateHeapSteps());
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

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

  const phaseColor = step.phase === 'sift-up' ? 'text-red-400' :
    step.phase === 'sift-down' || step.phase === 'extract' ? 'text-amber-400' :
    step.phase === 'done' ? 'text-emerald-400' : 'text-indigo-400';

  return (
    <AlgorithmPageShell
      title="Binary Heap"
      description="Min-heap with sift-up on insert and sift-down on extract-min — O(log n) per operation"
      category="Trees"
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
      showInput={false}
      stats={{
        size: step.heap.length,
        min: step.heap[0] ?? '—',
        operation: step.operation,
        swaps: step.swaps,
      }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(log n) insert and extract-min',
        'O(1) peek-min — always at root',
        'O(n) to build from arbitrary array (heapify)',
        'Cache-friendly array representation',
        'Foundation of Heap Sort and Dijkstra\'s algorithm',
      ]}
      disadvantages={[
        'O(n) search for arbitrary element',
        'Not stable',
        'Decrease-key requires knowing the element\'s index',
        'Less cache-friendly than pairing heaps for decrease-key',
      ]}
      applications={[
        'Priority queues',
        'Heap Sort',
        'Dijkstra\'s shortest path',
        'Prim\'s MST algorithm',
        'K smallest/largest elements',
        'Median of a data stream',
      ]}
      interviewTips={[
        'Python heapq is a min-heap by default; negate values for max-heap',
        'Java PriorityQueue is a min-heap',
        'Build heap in O(n) by heapifying from the last non-leaf node downward',
        'Heap Sort uses a max-heap; not stable but in-place O(n log n)',
        'Two heaps technique: balance a max-heap (lower half) + min-heap (upper half) for running median',
      ]}
      relatedAlgos={[
        { title: 'Heap Sort', route: '/sorting/heap-sort' },
        { title: 'Segment Tree', route: '/trees/segment-tree' },
        { title: 'Fenwick Tree', route: '/trees/fenwick-tree' },
      ]}
      practiceProblems={[
        { name: 'Kth Largest Element in an Array', difficulty: 'Medium', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
        { name: 'Find Median from Data Stream', difficulty: 'Hard', url: 'https://leetcode.com/problems/find-median-from-data-stream/' },
        { name: 'K Closest Points to Origin', difficulty: 'Medium', url: 'https://leetcode.com/problems/k-closest-points-to-origin/' },
        { name: 'Merge K Sorted Lists', difficulty: 'Hard', url: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
      ]}
    >
      {/* Phase label */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 font-medium">
        Phase: <span className={`font-bold ${phaseColor}`}>
          {step.phase === 'sift-up' ? 'Sift-Up (insert)' :
           step.phase === 'sift-down' ? 'Sift-Down (extract)' :
           step.phase === 'extract' ? 'Extract-Min' :
           step.phase === 'insert' ? 'Insert' :
           step.phase === 'done' ? 'Complete' : 'Initializing'}
        </span>
        {step.swapPath && step.swapPath.length > 1 && (
          <span className="ml-3 text-red-400 font-bold">↑ sifting up path highlighted</span>
        )}
      </p>

      {/* Two-panel layout: tree + array */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* SVG Tree */}
        <div className="bg-gray-900/40 rounded-xl p-3 border border-gray-700/40">
          <p className="text-[10px] text-gray-500 mb-2 font-semibold uppercase tracking-wider">Tree View</p>
          <HeapTree heap={step.heap} swapPath={step.swapPath} />
          <p className="text-[9px] text-gray-500 mt-1 text-center">
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> root (min)
            </span>
            <span className="inline-flex items-center gap-1 ml-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> swap path
            </span>
          </p>
        </div>

        {/* Array View */}
        <div className="bg-gray-900/40 rounded-xl p-3 border border-gray-700/40">
          <p className="text-[10px] text-gray-500 mb-2 font-semibold uppercase tracking-wider">Array View</p>
          {step.heap.length === 0 ? (
            <p className="text-gray-500 text-xs text-center mt-6">Empty</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {step.heap.map((val, i) => (
                <div key={i} className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg border text-xs font-bold transition-all duration-200 ${
                  step.swapPath.includes(i) ? 'bg-red-900/60 border-red-500 text-red-300 scale-110' :
                  i === 0 ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300' :
                  'bg-indigo-900/40 border-indigo-700 text-indigo-300'
                }`}>
                  <span>{val}</span>
                  <span className="text-[8px] text-gray-500 font-normal">[{i}]</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
