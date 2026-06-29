import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const CAPACITY = 7;

function generateSteps() {
  const steps = [];
  let buffer = Array(CAPACITY).fill(null);
  let front = 0, rear = 0, count = 0;

  const snap = (extra) =>
    steps.push({ buffer: [...buffer], front, rear, count, overflow: false, underflow: false, ...extra });

  snap({ operation: 'init', message: `Circular Queue initialized. Capacity = ${CAPACITY}. front=0, rear=0, count=0.`, done: false });

  const ops = [
    ['enqueue', 'A'], ['enqueue', 'B'], ['enqueue', 'C'], ['enqueue', 'D'],
    ['enqueue', 'E'], ['dequeue', null], ['dequeue', null],
    ['enqueue', 'F'], ['enqueue', 'G'], ['enqueue', 'H'],
    ['dequeue', null],
    ['enqueue', 'X'], ['enqueue', 'Y'],
  ];

  for (const [op, val] of ops) {
    if (op === 'enqueue') {
      if (count === CAPACITY) {
        snap({ operation: 'overflow', message: `OVERFLOW! Cannot enqueue '${val}' — queue is FULL (count=${count}).`, overflow: true, done: false });
        continue;
      }
      buffer[rear] = val;
      const oldRear = rear;
      rear = (rear + 1) % CAPACITY;
      count++;
      snap({ operation: 'enqueue', enqueuedVal: val, activeIdx: oldRear,
        message: `Enqueue '${val}' at index ${oldRear}. rear = (${oldRear}+1) % ${CAPACITY} = ${rear}. count = ${count}.`, done: false });
    } else {
      if (count === 0) {
        snap({ operation: 'underflow', message: 'UNDERFLOW! Cannot dequeue — queue is EMPTY.', underflow: true, done: false });
        continue;
      }
      const dequeuedVal = buffer[front];
      const oldFront = front;
      buffer[front] = null;
      front = (front + 1) % CAPACITY;
      count--;
      snap({ operation: 'dequeue', dequeuedVal, activeIdx: oldFront,
        message: `Dequeue '${dequeuedVal}' from index ${oldFront}. front = (${oldFront}+1) % ${CAPACITY} = ${front}. count = ${count}.`, done: false });
    }
  }

  snap({ operation: 'done', message: `Demo complete! Circular queue efficiently reuses slots via modular arithmetic.`, done: true });
  return steps;
}

function generateRandomSteps() {
  const steps = [];
  let buffer = Array(CAPACITY).fill(null);
  let front = 0, rear = 0, count = 0;

  const snap = (extra) =>
    steps.push({ buffer: [...buffer], front, rear, count, overflow: false, underflow: false, ...extra });

  snap({ operation: 'init', message: `Circular Queue initialized. Capacity = ${CAPACITY}.`, done: false });

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const ops = [];
  for (let i = 0; i < 14; i++) {
    if (Math.random() < 0.65) {
      ops.push(['enqueue', letters[i % letters.length]]);
    } else {
      ops.push(['dequeue', null]);
    }
  }

  for (const [op, val] of ops) {
    if (op === 'enqueue') {
      if (count === CAPACITY) {
        snap({ operation: 'overflow', message: `OVERFLOW! Queue is FULL.`, overflow: true, done: false });
        continue;
      }
      buffer[rear] = val;
      const oldRear = rear;
      rear = (rear + 1) % CAPACITY;
      count++;
      snap({ operation: 'enqueue', enqueuedVal: val, activeIdx: oldRear,
        message: `Enqueue '${val}' at [${oldRear}]. rear → ${rear}. count=${count}.`, done: false });
    } else {
      if (count === 0) {
        snap({ operation: 'underflow', message: 'UNDERFLOW! Queue is EMPTY.', underflow: true, done: false });
        continue;
      }
      const dv = buffer[front];
      buffer[front] = null;
      const oldFront = front;
      front = (front + 1) % CAPACITY;
      count--;
      snap({ operation: 'dequeue', dequeuedVal: dv, activeIdx: oldFront,
        message: `Dequeue '${dv}' from [${oldFront}]. front → ${front}. count=${count}.`, done: false });
    }
  }

  snap({ operation: 'done', message: 'Random sequence complete!', done: true });
  return steps;
}

// ─── SVG Circular Visualization ──────────────────────────────────────────────
function CircularViz({ buffer, front, rear, count, activeIdx, overflow, underflow }) {
  const CX = 170, CY = 170, R = 110, SLOT_R = 24;
  const n = CAPACITY;
  const isFull = count === n;
  const isEmpty = count === 0;

  const slotPos = Array.from({ length: n }, (_, i) => {
    const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle), angle };
  });

  // Arrow from outer rim toward slot center
  const arrowEnd = (idx, gap) => {
    const angle = (idx * 2 * Math.PI / n) - Math.PI / 2;
    const ar = R + gap;
    return {
      x1: CX + ar * Math.cos(angle),
      y1: CY + ar * Math.sin(angle),
      x2: CX + (R - SLOT_R - 4) * Math.cos(angle),
      y2: CY + (R - SLOT_R - 4) * Math.sin(angle),
    };
  };

  return (
    <div className="flex flex-col items-center">
      <svg width="340" height="340" viewBox="0 0 340 340">
        {/* Center label */}
        <text x={CX} y={CY - 14} textAnchor="middle" fontSize="12" className="fill-gray-400 dark:fill-gray-500">CIRCULAR</text>
        <text x={CX} y={CY + 4} textAnchor="middle" fontSize="12" className="fill-gray-400 dark:fill-gray-500">QUEUE</text>
        <text x={CX} y={CY + 20} textAnchor="middle" fontSize="11" className="fill-gray-500">
          {isFull ? 'FULL' : isEmpty ? 'EMPTY' : `${count}/${n}`}
        </text>

        {/* Connecting ring (faint) */}
        <circle cx={CX} cy={CY} r={R} fill="none"
          className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" strokeDasharray="4 4" />

        {/* Slots */}
        {slotPos.map(({ x, y }, i) => {
          const filled = buffer[i] !== null;
          const isActive = i === activeIdx;
          const isFrontSlot = i === front && !isEmpty;
          const isRearSlot = i === (rear === 0 ? n - 1 : rear - 1) && !isEmpty;

          let fillClass = 'fill-gray-100 dark:fill-gray-800 stroke-gray-300 dark:stroke-gray-600';
          if (isActive && filled) fillClass = 'fill-emerald-200 stroke-emerald-500';
          else if (isActive && !filled) fillClass = 'fill-red-100 stroke-red-400';
          else if (filled) fillClass = 'fill-blue-100 dark:fill-blue-900 stroke-blue-400 dark:stroke-blue-600';
          if (overflow && !filled) fillClass = 'fill-orange-100 stroke-orange-400';

          return (
            <g key={i}>
              <circle cx={x} cy={y} r={SLOT_R}
                className={`transition-all duration-300 ${fillClass}`} strokeWidth="2" />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="bold"
                className={filled ? 'fill-blue-800 dark:fill-blue-100' : 'fill-gray-300 dark:fill-gray-600'}>
                {buffer[i] ?? i}
              </text>
              {/* Slot index */}
              <text x={x} y={y + SLOT_R + 12} textAnchor="middle" fontSize="9"
                className="fill-gray-400">[{i}]</text>
            </g>
          );
        })}

        {/* FRONT arrow (green) */}
        {!isEmpty && (() => {
          const a = arrowEnd(front, 28);
          return (
            <g>
              <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
                stroke="#22c55e" strokeWidth="2.5" markerEnd="url(#arrowGreen)" />
              <text x={a.x1} y={a.y1} textAnchor="middle" fontSize="10" fontWeight="bold"
                dy={slotPos[front].y < CY ? -6 : 12} className="fill-emerald-600">F</text>
            </g>
          );
        })()}

        {/* REAR arrow (red) — points to where next insert goes */}
        {!isFull && (() => {
          const a = arrowEnd(rear, 52);
          return (
            <g>
              <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
                stroke="#ef4444" strokeWidth="2.5" markerEnd="url(#arrowRed)" />
              <text x={a.x1} y={a.y1} textAnchor="middle" fontSize="10" fontWeight="bold"
                dy={slotPos[rear].y < CY ? -6 : 12} className="fill-red-500">R</text>
            </g>
          );
        })()}

        {/* Overflow / Underflow warning ring */}
        {(overflow || underflow) && (
          <circle cx={CX} cy={CY} r={R + 10} fill="none"
            stroke={overflow ? '#f97316' : '#ef4444'} strokeWidth="3" strokeDasharray="8 4" opacity="0.6" />
        )}

        <defs>
          <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="4" refY="2" orient="auto">
            <path d="M0,0 L0,4 L6,2 z" fill="#22c55e" />
          </marker>
          <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="4" refY="2" orient="auto">
            <path d="M0,0 L0,4 L6,2 z" fill="#ef4444" />
          </marker>
        </defs>
      </svg>

      {/* Formula */}
      <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400 font-mono space-y-0.5">
        <div>rear = (rear + 1) % {CAPACITY} &nbsp;|&nbsp; front = (front + 1) % {CAPACITY}</div>
        {(overflow || underflow) && (
          <div className={`font-bold mt-1 ${overflow ? 'text-orange-500' : 'text-red-500'}`}>
            {overflow ? '⚠ OVERFLOW — Queue Full!' : '⚠ UNDERFLOW — Queue Empty!'}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Theory ──────────────────────────────────────────────────────────────────
const theory = (
  <div>
    <TheorySection title="Why Circular?">
      <p>A linear queue wastes space: after many enqueue/dequeue cycles, the front pointer drifts forward, leaving empty slots at the start that can never be reused. A circular queue wraps the rear pointer back to index 0 when it reaches the end, using modular arithmetic: <code>rear = (rear + 1) % capacity</code>.</p>
    </TheorySection>
    <TheorySection title="Front & Rear Pointers">
      <p>Front points to the next element to dequeue. Rear points to the slot where the next enqueue will go. The queue is <strong>full</strong> when <code>count === capacity</code> and <strong>empty</strong> when <code>count === 0</code>. Using an explicit <code>count</code> avoids the ambiguity of front === rear meaning either full or empty.</p>
    </TheorySection>
    <TheorySection title="Full vs Empty Disambiguation">
      <p>Without a count variable, one common trick is to sacrifice one slot: the queue is considered full when <code>(rear + 1) % cap === front</code>. The count-based approach wastes no slots and is simpler to reason about.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Enqueue', 'O(1)', 'O(1)'],
      ['Dequeue', 'O(1)', 'O(1)'],
      ['Peek', 'O(1)', 'O(1)'],
      ['isFull / isEmpty', 'O(1)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `class CircularQueue {
    int* buf;
    int front, rear, count, cap;
public:
    CircularQueue(int k) : cap(k), front(0), rear(0), count(0) {
        buf = new int[k];
    }
    bool enqueue(int val) {
        if (count == cap) return false; // full
        buf[rear] = val;
        rear = (rear + 1) % cap;
        count++;
        return true;
    }
    int dequeue() {
        if (count == 0) return -1; // empty
        int val = buf[front];
        front = (front + 1) % cap;
        count--;
        return val;
    }
    int peek()    { return count ? buf[front] : -1; }
    bool isFull() { return count == cap; }
    bool isEmpty(){ return count == 0; }
};`,
    'Python': `class CircularQueue:
    def __init__(self, k: int):
        self.buf = [None] * k
        self.front = self.rear = self.count = 0
        self.cap = k

    def enqueue(self, val) -> bool:
        if self.count == self.cap:
            return False  # full
        self.buf[self.rear] = val
        self.rear = (self.rear + 1) % self.cap
        self.count += 1
        return True

    def dequeue(self):
        if self.count == 0:
            return None  # empty
        val = self.buf[self.front]
        self.buf[self.front] = None
        self.front = (self.front + 1) % self.cap
        self.count -= 1
        return val

    def peek(self):
        return self.buf[self.front] if self.count else None

    def is_full(self):  return self.count == self.cap
    def is_empty(self): return self.count == 0`,
    'JavaScript': `class CircularQueue {
  constructor(k) {
    this.buf = new Array(k).fill(null);
    this.front = this.rear = this.count = 0;
    this.cap = k;
  }
  enqueue(val) {
    if (this.count === this.cap) return false;
    this.buf[this.rear] = val;
    this.rear = (this.rear + 1) % this.cap;
    this.count++;
    return true;
  }
  dequeue() {
    if (this.count === 0) return null;
    const val = this.buf[this.front];
    this.buf[this.front] = null;
    this.front = (this.front + 1) % this.cap;
    this.count--;
    return val;
  }
  peek()    { return this.count ? this.buf[this.front] : null; }
  isFull()  { return this.count === this.cap; }
  isEmpty() { return this.count === 0; }
}`,
    'Java': `class MyCircularQueue {
    private int[] buf;
    private int front, rear, count, cap;

    public MyCircularQueue(int k) {
        buf = new int[k];
        cap = k; front = rear = count = 0;
    }
    public boolean enQueue(int val) {
        if (isFull()) return false;
        buf[rear] = val;
        rear = (rear + 1) % cap;
        count++;
        return true;
    }
    public boolean deQueue() {
        if (isEmpty()) return false;
        front = (front + 1) % cap;
        count--;
        return true;
    }
    public int Front() { return isEmpty() ? -1 : buf[front]; }
    public int Rear()  { return isEmpty() ? -1 : buf[(rear-1+cap)%cap]; }
    public boolean isEmpty() { return count == 0; }
    public boolean isFull()  { return count == cap; }
}`,
  }} />
);

export default function CircularQueue() {
  const [steps, setSteps] = useState(() => generateSteps());
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleRandomize = useCallback(() => {
    setSteps(generateRandomSteps());
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
      title="Circular Queue"
      description="Visualize a fixed-size circular buffer with front/rear pointer wrap-around"
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
      showInput={false}
      stats={{ front: step.front, rear: step.rear, size: step.count, capacity: CAPACITY }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(1) enqueue and dequeue',
        'Reuses memory — no wasted slots after dequeue',
        'No element shifting required',
        'Constant space overhead',
      ]}
      disadvantages={[
        'Fixed capacity — cannot grow dynamically',
        'Tricky full/empty disambiguation (count variable or sacrificed slot)',
        'Random access not supported',
      ]}
      applications={[
        'CPU scheduling — round-robin',
        'Network packet buffers',
        'Audio streaming ring buffers',
        'Keyboard input buffer',
        'Producer-consumer problem',
      ]}
      interviewTips={[
        'Circular queue solves front-drift of a linear array queue',
        'Use a count variable to distinguish full from empty — simpler than the sacrificed-slot trick',
        'rear = (rear + 1) % capacity is the core formula',
        "LeetCode #622 'Design Circular Queue' is a common interview problem",
        'Deque (double-ended queue) generalizes this to both ends',
      ]}
      relatedAlgos={[
        { title: 'Queue', route: '/queue' },
        { title: 'Stack', route: '/stack' },
      ]}
      practiceProblems={[
        { name: 'Design Circular Queue', difficulty: 'Medium', url: 'https://leetcode.com/problems/design-circular-queue/' },
        { name: 'Design Circular Deque', difficulty: 'Medium', url: 'https://leetcode.com/problems/design-circular-deque/' },
        { name: 'Number of Recent Calls', difficulty: 'Easy', url: 'https://leetcode.com/problems/number-of-recent-calls/' },
      ]}
    >
      {/* Operation badge */}
      {step.operation && step.operation !== 'init' && step.operation !== 'done' && (
        <div className={`text-center mb-4 text-xs font-semibold px-4 py-1.5 rounded-full inline-block mx-auto ${
          step.overflow ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' :
          step.underflow ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
          step.operation === 'enqueue' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' :
          'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
        }`}>
          {step.overflow ? 'OVERFLOW' : step.underflow ? 'UNDERFLOW' :
            step.operation === 'enqueue' ? `ENQUEUE '${step.enqueuedVal}'` : `DEQUEUE '${step.dequeuedVal}'`}
        </div>
      )}

      <CircularViz
        buffer={step.buffer}
        front={step.front}
        rear={step.rear}
        count={step.count}
        activeIdx={step.activeIdx ?? -1}
        overflow={!!step.overflow}
        underflow={!!step.underflow}
      />

      {/* Linear representation */}
      <div className="mt-5">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-center">Linear Array View</h3>
        <div className="flex gap-1.5 justify-center flex-wrap">
          {step.buffer.map((val, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm border-2 transition-all duration-200 ${
                i === step.activeIdx && val !== null ? 'bg-emerald-200 border-emerald-500 text-emerald-900' :
                i === step.activeIdx && val === null ? 'bg-red-100 border-red-400 text-red-700' :
                val !== null ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100' :
                'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600'
              }`}>
                {val ?? '·'}
              </div>
              <div className="flex gap-0.5 mt-0.5">
                {i === step.front && step.count > 0 && <span className="text-[9px] font-bold text-emerald-600">F</span>}
                {i === (step.rear === 0 ? CAPACITY - 1 : step.rear - 1) && step.count > 0 &&
                  <span className="text-[9px] font-bold text-red-500">R</span>}
                {i !== step.front && !(i === (step.rear === 0 ? CAPACITY - 1 : step.rear - 1) && step.count > 0) &&
                  <span className="text-[9px] text-gray-400">{i}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
