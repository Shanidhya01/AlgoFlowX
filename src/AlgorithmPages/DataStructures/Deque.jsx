import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// Demo: sliding window maximum for array [3,1,2,5,4,8,7,6], k=3
const WINDOW_ARR = [3, 1, 2, 5, 4, 8, 7, 6];
const WINDOW_K = 3;

function generateDequeSteps() {
  const steps = [];
  let deque = []; // stores indices for sliding window max
  const arr = WINDOW_ARR;
  const k = WINDOW_K;
  const results = [];

  steps.push({
    deque: [], arr, k, windowStart: -1, windowEnd: -1, results: [],
    phase: 'init', frontVal: null, rearVal: null, size: 0,
    message: `Deque Sliding Window Maximum. Array=[${arr.join(',')}], k=${k}. Find max in each window of size ${k}.`,
    done: false,
  });

  for (let i = 0; i < arr.length; i++) {
    // Remove elements outside window
    while (deque.length > 0 && deque[0] < i - k + 1) {
      steps.push({
        deque: [...deque], arr, k,
        windowStart: Math.max(0, i - k + 1), windowEnd: i, results: [...results],
        phase: 'popFront', frontVal: arr[deque[0]], rearVal: deque.length > 0 ? arr[deque[deque.length - 1]] : null, size: deque.length,
        message: `Index ${deque[0]} is out of window [${Math.max(0, i - k + 1)}..${i}] → popFront`,
        done: false,
      });
      deque.shift();
    }

    // Remove smaller elements from back
    while (deque.length > 0 && arr[deque[deque.length - 1]] <= arr[i]) {
      steps.push({
        deque: [...deque], arr, k,
        windowStart: Math.max(0, i - k + 1), windowEnd: i, results: [...results],
        phase: 'popBack', frontVal: deque.length > 0 ? arr[deque[0]] : null, rearVal: arr[deque[deque.length - 1]], size: deque.length,
        message: `arr[${deque[deque.length - 1]}]=${arr[deque[deque.length - 1]]} ≤ arr[${i}]=${arr[i]} → popBack (smaller, useless)`,
        done: false,
      });
      deque.pop();
    }

    // Push current index to back
    deque.push(i);
    steps.push({
      deque: [...deque], arr, k,
      windowStart: Math.max(0, i - k + 1), windowEnd: i, results: [...results],
      phase: 'pushBack', frontVal: arr[deque[0]], rearVal: arr[deque[deque.length - 1]], size: deque.length,
      message: `pushBack index ${i} (arr[${i}]=${arr[i]})`,
      done: false,
    });

    // Record window max when window is full
    if (i >= k - 1) {
      const windowMax = arr[deque[0]];
      results.push(windowMax);
      steps.push({
        deque: [...deque], arr, k,
        windowStart: i - k + 1, windowEnd: i, results: [...results],
        phase: 'record', frontVal: arr[deque[0]], rearVal: arr[deque[deque.length - 1]], size: deque.length,
        message: `Window [${i - k + 1}..${i}] = [${arr.slice(i - k + 1, i + 1).join(',')}] → max = ${windowMax} (front of deque)`,
        done: false,
      });
    }
  }

  steps.push({
    deque: [], arr, k,
    windowStart: arr.length - k, windowEnd: arr.length - 1, results: [...results],
    phase: 'done', frontVal: null, rearVal: null, size: 0,
    message: `Done! Window maximums: [${results.join(', ')}]`,
    done: true,
  });

  return steps;
}

const theory = (
  <div>
    <TheorySection title="Deque (Double-Ended Queue)">
      <p>A deque supports O(1) insertion and deletion from both ends:</p>
      <ul className="list-disc pl-4 space-y-1 mt-2">
        <li><strong>pushFront / pushBack</strong> — add to either end</li>
        <li><strong>popFront / popBack</strong> — remove from either end</li>
        <li><strong>peekFront / peekBack</strong> — view without removing</li>
      </ul>
      <p className="mt-2">Implemented as a doubly linked list or a circular buffer array.</p>
    </TheorySection>
    <TheorySection title="Sliding Window Maximum">
      <p>Classic deque application: find the maximum in every window of size k in O(n) total time.</p>
      <ul className="list-disc pl-4 space-y-1">
        <li>Deque stores indices in decreasing order of their array values</li>
        <li>Front = index of current window maximum</li>
        <li>popFront when index falls out of window</li>
        <li>popBack when new element is larger (old elements become useless)</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['pushFront/pushBack', 'O(1)', 'O(n)'],
      ['popFront/popBack', 'O(1)', 'O(n)'],
      ['Sliding Window Max (n elements, k window)', 'O(n)', 'O(k)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `#include <deque>
// Sliding window maximum
vector<int> maxSlidingWindow(vector<int>& arr, int k) {
    deque<int> dq; // stores indices
    vector<int> result;
    for (int i = 0; i < arr.size(); i++) {
        // remove out-of-window indices
        while (!dq.empty() && dq.front() < i - k + 1)
            dq.pop_front();
        // remove smaller elements from back
        while (!dq.empty() && arr[dq.back()] <= arr[i])
            dq.pop_back();
        dq.push_back(i);
        if (i >= k - 1)
            result.push_back(arr[dq.front()]);
    }
    return result;
}`,
    'Python': `from collections import deque

def max_sliding_window(arr, k):
    dq = deque()  # stores indices
    result = []
    for i, val in enumerate(arr):
        # remove out-of-window
        while dq and dq[0] < i - k + 1:
            dq.popleft()
        # remove smaller from back
        while dq and arr[dq[-1]] <= val:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            result.append(arr[dq[0]])
    return result`,
    'JavaScript': `function maxSlidingWindow(arr, k) {
    const dq = []; // stores indices (acts as deque)
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        while (dq.length && dq[0] < i - k + 1)
            dq.shift(); // popFront
        while (dq.length && arr[dq[dq.length-1]] <= arr[i])
            dq.pop(); // popBack
        dq.push(i);
        if (i >= k - 1)
            result.push(arr[dq[0]]); // front = max
    }
    return result;
}`,
    'Java': `public static int[] maxSlidingWindow(int[] arr, int k) {
    ArrayDeque<Integer> dq = new ArrayDeque<>();
    int[] result = new int[arr.length - k + 1];
    int ri = 0;
    for (int i = 0; i < arr.length; i++) {
        while (!dq.isEmpty() && dq.peekFirst() < i - k + 1)
            dq.pollFirst();
        while (!dq.isEmpty() && arr[dq.peekLast()] <= arr[i])
            dq.pollLast();
        dq.offerLast(i);
        if (i >= k - 1)
            result[ri++] = arr[dq.peekFirst()];
    }
    return result;
}`,
  }} />
);

export default function Deque() {
  const [steps] = useState(() => generateDequeSteps());
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(700);
  const timerRef = useRef(null);

  const handleRandomize = useCallback(() => {
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

  const step = steps[currentStep] || {
    deque: [], arr: WINDOW_ARR, k: WINDOW_K, windowStart: -1, windowEnd: -1, results: [],
    phase: 'init', frontVal: null, rearVal: null, size: 0, message: '', done: false,
  };

  const phaseColor = {
    pushBack: 'text-emerald-600 dark:text-emerald-400',
    popFront: 'text-red-500 dark:text-red-400',
    popBack: 'text-amber-600 dark:text-amber-400',
    record: 'text-indigo-600 dark:text-indigo-400',
  };

  return (
    <AlgorithmPageShell
      title="Deque"
      description="Double-ended queue with O(1) push/pop from both ends — classic sliding window maximum"
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
      stats={{ size: step.size, front: step.frontVal ?? '-', rear: step.rearVal ?? '-', results: step.results?.length ?? 0 }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(1) push/pop from both ends',
        'Sliding window max/min in O(n) using deque',
        'More flexible than queue or stack',
        'Monotonic deque is a powerful competitive programming tool',
      ]}
      disadvantages={[
        'More complex than simple queue/stack',
        'Slightly higher constant factor than pure queue',
        'Array-based deque needs careful wraparound logic',
      ]}
      applications={[
        'Sliding window maximum/minimum',
        'Palindrome checking (add to both ends, remove from both ends)',
        'BFS with priority using 0-1 BFS (deque + edge weights 0 or 1)',
        'Task scheduling with both ends accessible',
        'Undo/redo stacks',
      ]}
      interviewTips={[
        'Sliding window max: maintain decreasing deque of indices',
        'The deque front always holds the max of current window',
        'popBack removes elements smaller than the new element (they can never be max)',
        'ArrayDeque in Java, collections.deque in Python, std::deque in C++',
        '0-1 BFS: push to front if edge weight 0, push to back if weight 1',
      ]}
      relatedAlgos={[
        { title: 'Queue', route: '/data-structures/queue' },
        { title: 'Stack', route: '/data-structures/stack' },
        { title: 'Doubly Linked List', route: '/data-structures/doubly-linked-list' },
      ]}
      practiceProblems={[
        { name: 'Sliding Window Maximum', difficulty: 'Hard', url: 'https://leetcode.com/problems/sliding-window-maximum/' },
        { name: 'Design Circular Deque', difficulty: 'Medium', url: 'https://leetcode.com/problems/design-circular-deque/' },
        { name: 'Jump Game VI', difficulty: 'Medium', url: 'https://leetcode.com/problems/jump-game-vi/' },
        { name: 'Shortest Subarray with Sum at Least K', difficulty: 'Hard', url: 'https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/' },
      ]}
    >
      {/* Array with window highlight */}
      <div className="mb-5">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">
          Array (window size k={WINDOW_K}):
        </p>
        <div className="flex gap-1.5 justify-center flex-wrap">
          {step.arr.map((v, i) => {
            const inWindow = step.windowStart >= 0 && i >= step.windowStart && i <= step.windowEnd;
            const inDeque = step.deque.includes(i);
            const isFront = step.deque[0] === i;
            return (
              <div key={i} className={`flex flex-col items-center gap-1`}>
                <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                  isFront ? 'border-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 scale-110' :
                  inDeque ? 'border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300' :
                  inWindow ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' :
                  'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>{v}</div>
                <span className="text-[9px] text-gray-400">{i}</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 mt-2 justify-center text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border-2 border-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 inline-block" /> front (max)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border-2 border-sky-300 bg-sky-50 dark:bg-sky-900/30 inline-block" /> in deque</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border-2 border-amber-300 bg-amber-50 dark:bg-amber-900/20 inline-block" /> in window</span>
        </div>
      </div>

      {/* Deque visualization */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">FRONT (max)</span>
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">REAR</span>
        </div>
        <div className={`flex items-center gap-2 p-3 rounded-xl border-2 min-h-[52px] transition-all ${
          step.phase === 'pushBack' ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10' :
          step.phase === 'popFront' || step.phase === 'popBack' ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' :
          step.phase === 'record' ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/10' :
          'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
        }`}>
          {step.deque && step.deque.length > 0 ? (
            step.deque.map((idx, i) => (
              <React.Fragment key={idx}>
                <div className={`flex flex-col items-center justify-center w-12 h-10 rounded-lg border font-bold text-sm transition-all ${
                  i === 0 ? 'border-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' :
                  'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  {step.arr[idx]}
                  <span className="text-[8px] text-gray-400 font-normal">[{idx}]</span>
                </div>
                {i < step.deque.length - 1 && <span className="text-gray-400 text-xs">|</span>}
              </React.Fragment>
            ))
          ) : (
            <span className="text-gray-400 text-xs italic mx-auto">deque empty</span>
          )}
        </div>
        {step.phase && phaseColor[step.phase] && (
          <div className="text-center mt-1">
            <span className={`text-xs font-semibold ${phaseColor[step.phase]}`}>
              {step.phase === 'pushBack' ? 'pushBack' : step.phase === 'popFront' ? 'popFront' : step.phase === 'popBack' ? 'popBack' : 'Window max recorded'}
            </span>
          </div>
        )}
      </div>

      {/* Results */}
      {step.results && step.results.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">Window maximums so far:</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {step.results.map((r, i) => (
              <div key={i} className={`px-3 py-1.5 rounded-lg font-bold text-sm transition-all ${
                i === step.results.length - 1 && step.phase === 'record'
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 border-2 border-indigo-400 text-indigo-700 dark:text-indigo-300 scale-110'
                  : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}>{r}</div>
            ))}
          </div>
        </div>
      )}
    </AlgorithmPageShell>
  );
}
