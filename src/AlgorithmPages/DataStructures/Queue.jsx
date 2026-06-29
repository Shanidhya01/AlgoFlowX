import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// ─── Step Generator ─────────────────────────────────────────────────────────

function generateSteps(enqueueValues) {
  const steps = [];
  let queue = [];
  let opCount = 0;

  steps.push({ queue: [], operation: null, value: null, message: 'Queue initialized — empty FIFO structure ready.', done: false });

  const ops = [
    { type: 'enqueue', value: enqueueValues[0] },
    { type: 'enqueue', value: enqueueValues[1] },
    { type: 'enqueue', value: enqueueValues[2] },
    { type: 'enqueue', value: enqueueValues[3] },
    { type: 'dequeue' },
    { type: 'peek' },
    { type: 'enqueue', value: enqueueValues[4] || enqueueValues[0] },
    { type: 'dequeue' },
    { type: 'dequeue' },
  ];

  for (const op of ops) {
    opCount++;
    if (op.type === 'enqueue') {
      queue = [...queue, op.value];
      steps.push({ queue: [...queue], operation: 'enqueue', value: op.value, message: `ENQUEUE ${op.value} → added to rear. Size: ${queue.length}`, done: false });
    } else if (op.type === 'dequeue') {
      if (queue.length === 0) continue;
      const front = queue[0];
      steps.push({ queue: [...queue], operation: 'dequeue-highlight', value: front, message: `DEQUEUE → removing ${front} from front...`, done: false });
      queue = queue.slice(1);
      steps.push({ queue: [...queue], operation: 'dequeue', value: front, message: `DEQUEUE ${front} → removed. Size: ${queue.length}`, done: false });
    } else if (op.type === 'peek') {
      if (queue.length === 0) continue;
      const front = queue[0];
      steps.push({ queue: [...queue], operation: 'peek', value: front, message: `PEEK → front element is ${front} (not removed). Size: ${queue.length}`, done: false });
    }
  }

  steps.push({ queue: [...queue], operation: 'done', value: null, message: `✅ Queue demo complete! Remaining elements: ${queue.length}. FIFO ordering maintained throughout.`, done: true });
  return steps;
}

// ─── Visualization ───────────────────────────────────────────────────────────

function BFSPanel() {
  // Static 5-node graph layout
  const nodes = [
    { id: 'A', x: 60,  y: 60  },
    { id: 'B', x: 160, y: 30  },
    { id: 'C', x: 160, y: 90  },
    { id: 'D', x: 260, y: 30  },
    { id: 'E', x: 260, y: 90  },
  ];
  const edges = [['A','B'],['A','C'],['B','D'],['C','E'],['B','C']];
  const bfsOrder = ['A','B','C','D','E'];
  const colors = ['bg-amber-400','bg-blue-400','bg-blue-400','bg-green-400','bg-green-400'];

  return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">BFS uses a Queue — visits nodes level by level</p>
      <div className="flex items-center gap-4">
        <svg width="320" height="130" viewBox="0 0 320 130" className="flex-shrink-0">
          {edges.map(([a, b], i) => {
            const na = nodes.find(n => n.id === a);
            const nb = nodes.find(n => n.id === b);
            return <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />;
          })}
          {nodes.map((n, i) => (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r="18" className={`${i === 0 ? 'fill-amber-200 stroke-amber-400' : 'fill-blue-100 dark:fill-blue-900 stroke-blue-400 dark:stroke-blue-600'}`} strokeWidth="2" />
              <text x={n.x} y={n.y + 4} textAnchor="middle" className="fill-gray-800 dark:fill-gray-200 font-bold text-xs" fontSize="12">{n.id}</text>
            </g>
          ))}
        </svg>
        <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
          <div>Queue starts: <span className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">[A]</span></div>
          <div>Dequeue A → enqueue B,C: <span className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 rounded">[B,C]</span></div>
          <div>Dequeue B → enqueue D: <span className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 rounded">[C,D]</span></div>
          <div>Level-order: <span className="font-mono font-bold">A → B,C → D,E</span></div>
        </div>
      </div>
    </div>
  );
}

function QueueViz({ step }) {
  const { queue, operation, value } = step;

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-4 min-h-[200px]">
        {/* Main queue display */}
        <div className="flex items-center gap-1 flex-wrap justify-center">
          {/* FRONT label */}
          {queue.length > 0 && (
            <div className="flex flex-col items-center mr-1">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">FRONT</span>
              <span className="text-emerald-500 text-sm">→</span>
            </div>
          )}

          {queue.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl px-8 py-3 text-gray-400 dark:text-gray-500 text-sm">
              empty queue
            </div>
          ) : (
            queue.map((v, i) => {
              const isFront = i === 0;
              const isRear = i === queue.length - 1;
              const isDequeue = (operation === 'dequeue-highlight' || operation === 'dequeue') && isFront && (operation === 'dequeue-highlight');
              const isEnqueue = operation === 'enqueue' && isRear;
              const isPeek = operation === 'peek' && isFront;
              return (
                <div key={`${v}-${i}`} className={`w-14 h-14 flex items-center justify-center rounded-xl text-base font-bold border-2 transition-all duration-300 select-none
                  ${isDequeue ? 'bg-red-100 dark:bg-red-900/40 border-red-400 text-red-700 dark:text-red-300 scale-105' :
                    isEnqueue ? 'bg-green-100 dark:bg-green-900/40 border-green-400 text-green-700 dark:text-green-300 scale-105' :
                    isPeek ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-400 text-amber-700 dark:text-amber-300' :
                    'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200'
                  }`}>
                  {v}
                </div>
              );
            })
          )}

          {/* REAR label */}
          {queue.length > 0 && (
            <div className="flex flex-col items-center ml-1">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">REAR</span>
              <span className="text-purple-500 text-sm">←</span>
            </div>
          )}
        </div>

        <div className="flex gap-6 text-xs text-gray-500 dark:text-gray-400">
          <span>← Dequeue from FRONT</span>
          <span>Enqueue to REAR →</span>
        </div>
      </div>

      <BFSPanel />
    </div>
  );
}

// ─── Theory & Code ───────────────────────────────────────────────────────────

const theory = (
  <div>
    <TheorySection title="FIFO Principle">
      <p>A Queue follows <strong>First-In, First-Out (FIFO)</strong>: elements are added at the rear (enqueue) and removed from the front (dequeue). Think of a line of customers — first to arrive is first to be served.</p>
    </TheorySection>
    <TheorySection title="Core Operations">
      <ul className="list-disc pl-4 space-y-1">
        <li><strong>enqueue(x):</strong> Add element x to the rear — O(1)</li>
        <li><strong>dequeue():</strong> Remove and return front element — O(1)</li>
        <li><strong>peek():</strong> Return front without removing — O(1)</li>
        <li><strong>isEmpty():</strong> Check if queue is empty — O(1)</li>
      </ul>
    </TheorySection>
    <TheorySection title="Circular Queue Optimization">
      <p>A naive array queue wastes space as front advances. A <strong>circular queue</strong> wraps indices modulo capacity, reusing space. Both enqueue and dequeue remain O(1) without memory waste.</p>
    </TheorySection>
    <TheorySection title="BFS and Queues">
      <p>Breadth-First Search uses a queue to visit nodes level by level. Start node is enqueued; each dequeued node's unvisited neighbors are enqueued. This guarantees shortest path in unweighted graphs.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Enqueue', 'O(1)', 'O(1)'],
      ['Dequeue', 'O(1)', 'O(1)'],
      ['Peek', 'O(1)', 'O(1)'],
      ['Search', 'O(n)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `#include <queue>
#include <iostream>
using namespace std;

int main() {
    queue<char> q;
    // Enqueue
    q.push('A'); q.push('B'); q.push('C');
    // Peek
    cout << "Front: " << q.front() << endl; // A
    // Dequeue
    q.pop();
    cout << "After dequeue, front: " << q.front() << endl; // B
    cout << "Rear: " << q.back() << endl;   // C
    cout << "Size: " << q.size() << endl;
    return 0;
}

// BFS using queue
void bfs(int start, vector<vector<int>>& adj) {
    vector<bool> visited(adj.size(), false);
    queue<int> q;
    q.push(start);
    visited[start] = true;
    while (!q.empty()) {
        int node = q.front(); q.pop();
        cout << node << " ";
        for (int nb : adj[node])
            if (!visited[nb]) { visited[nb] = true; q.push(nb); }
    }
}`,
    'Python': `from collections import deque

class Queue:
    def __init__(self):
        self._data = deque()

    def enqueue(self, x):
        self._data.append(x)

    def dequeue(self):
        if self.is_empty():
            raise IndexError("dequeue from empty queue")
        return self._data.popleft()

    def peek(self):
        return self._data[0]

    def is_empty(self):
        return len(self._data) == 0

    def size(self):
        return len(self._data)

def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nb in graph[node]:
            if nb not in visited:
                visited.add(nb)
                queue.append(nb)
    return order`,
    'JavaScript': `class Queue {
    constructor() { this._data = []; this._head = 0; }

    enqueue(x) { this._data.push(x); }

    dequeue() {
        if (this.isEmpty()) throw new Error('Queue underflow');
        return this._data[this._head++];
    }

    peek() { return this._data[this._head]; }

    isEmpty() { return this._head >= this._data.length; }

    get size() { return this._data.length - this._head; }
}

function bfs(graph, start) {
    const visited = new Set([start]);
    const queue = new Queue();
    queue.enqueue(start);
    const order = [];
    while (!queue.isEmpty()) {
        const node = queue.dequeue();
        order.push(node);
        for (const nb of graph[node] || []) {
            if (!visited.has(nb)) {
                visited.add(nb);
                queue.enqueue(nb);
            }
        }
    }
    return order;
}`,
    'Java': `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Queue<T> {
    private final Deque<T> data = new ArrayDeque<>();

    public void enqueue(T x) { data.addLast(x); }

    public T dequeue() {
        if (isEmpty()) throw new RuntimeException("Queue underflow");
        return data.removeFirst();
    }

    public T peek() { return data.peekFirst(); }

    public boolean isEmpty() { return data.isEmpty(); }

    public int size() { return data.size(); }
}

// BFS
public static List<Integer> bfs(Map<Integer, List<Integer>> graph, int start) {
    Set<Integer> visited = new HashSet<>();
    Deque<Integer> queue = new ArrayDeque<>();
    List<Integer> order = new ArrayList<>();
    queue.add(start); visited.add(start);
    while (!queue.isEmpty()) {
        int node = queue.poll();
        order.add(node);
        for (int nb : graph.getOrDefault(node, List.of()))
            if (visited.add(nb)) queue.add(nb);
    }
    return order;
}`,
  }} />
);

// ─── Default Export ───────────────────────────────────────────────────────────

const DEFAULT_VALUES = ['A', 'B', 'C', 'D', 'E'];

export default function Queue() {
  const [steps, setSteps] = useState(() => generateSteps(DEFAULT_VALUES));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [customInput, setCustomInput] = useState(DEFAULT_VALUES.join(', '));
  const [inputError, setInputError] = useState('');
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleCustomInput = (val) => {
    setCustomInput(val);
    const parts = val.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length < 1) { setInputError('Enter at least 1 value'); return; }
    if (parts.length > 8) { setInputError('Max 8 values'); return; }
    setInputError('');
    setSteps(generateSteps(parts));
    setCurrentStep(0);
    setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const letters = 'ABCDEFGHIJ';
    const vals = Array.from({ length: 5 }, (_, i) => letters[i]);
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

  const frontVal = step.queue.length > 0 ? step.queue[0] : '—';
  const rearVal = step.queue.length > 0 ? step.queue[step.queue.length - 1] : '—';

  return (
    <AlgorithmPageShell
      title="Queue"
      description="FIFO data structure with enqueue, dequeue, peek operations and BFS connection"
      category="Data Structures"
      difficulty="Easy"
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
      inputPlaceholder="e.g. A, B, C, D"
      inputLabel="Enqueue values (comma-separated, max 8)"
      showInput={true}
      stats={{ size: step.queue.length, front: frontVal, rear: rearVal }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(1) enqueue and dequeue operations',
        'Natural FIFO ordering for fairness',
        'Simple implementation using arrays or linked lists',
        'Essential for level-order traversal (BFS)',
      ]}
      disadvantages={[
        'No random access — only front and rear accessible',
        'Array-based queue wastes space (use circular queue)',
        'No priority handling (use priority queue instead)',
      ]}
      applications={[
        'Breadth-First Search (BFS) graph traversal',
        'Printer and job spooling',
        'CPU scheduling (Round Robin)',
        'Network packet buffering',
        'Level-order tree traversal',
        'Producer-consumer problem',
        'Sliding window problems (with deque)',
      ]}
      interviewTips={[
        'Know circular queue to avoid O(n) dequeue in array impl',
        'Use deque for sliding window maximum — O(n) solution',
        'BFS always uses a queue — know the template cold',
        'Distinguish queue from priority queue (heap-based, not FIFO)',
        'Implement Queue using two Stacks is a classic interview question',
        'Level-order tree traversal is just BFS on a tree — same pattern',
      ]}
      relatedAlgos={[
        { title: 'Stack', route: '/stack' },
        { title: 'Circular Queue', route: '/circular-queue' },
        { title: 'Priority Queue', route: '/priority-queue' },
      ]}
      practiceProblems={[
        { name: 'Number of Islands', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-islands/' },
        { name: 'Implement Queue using Stacks', difficulty: 'Easy', url: 'https://leetcode.com/problems/implement-queue-using-stacks/' },
        { name: 'Walls and Gates', difficulty: 'Medium', url: '#' },
        { name: 'Rotting Oranges', difficulty: 'Medium', url: 'https://leetcode.com/problems/rotting-oranges/' },
      ]}
    >
      <QueueViz step={step} />
    </AlgorithmPageShell>
  );
}
