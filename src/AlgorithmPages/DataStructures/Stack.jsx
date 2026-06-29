import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// ─── Step Generator ─────────────────────────────────────────────────────────

function generateSteps(pushValues) {
  const steps = [];
  let stack = [];
  let opCount = 0;

  steps.push({ stack: [], operation: null, value: null, matched: null, message: 'Stack initialized — empty LIFO structure ready.', done: false });

  for (const v of pushValues) {
    opCount++;
    stack = [...stack, v];
    steps.push({ stack: [...stack], operation: 'push', value: v, matched: null, message: `PUSH ${v} → placed on top of stack. Size: ${stack.length}`, done: false });
  }

  // pop twice
  for (let i = 0; i < 2 && stack.length > 0; i++) {
    const top = stack[stack.length - 1];
    opCount++;
    steps.push({ stack: [...stack], operation: 'pop-highlight', value: top, matched: null, message: `POP → removing ${top} from top...`, done: false });
    stack = stack.slice(0, -1);
    steps.push({ stack: [...stack], operation: 'pop', value: top, matched: null, message: `POP ${top} → removed. Size: ${stack.length}`, done: false });
  }

  // peek
  if (stack.length > 0) {
    const top = stack[stack.length - 1];
    opCount++;
    steps.push({ stack: [...stack], operation: 'peek', value: top, matched: null, message: `PEEK → top element is ${top} (not removed). Size: ${stack.length}`, done: false });
  }

  // bracket matching demo
  const expr = '(()())';
  let matchStack = [];
  let matched = true;
  for (const ch of expr) {
    opCount++;
    if (ch === '(') {
      matchStack = [...matchStack, ch];
      steps.push({ stack: [...stack], operation: 'match', value: ch, matchStack: [...matchStack], expr, matched: null, message: `Bracket '${ch}' → push to match stack. Match stack size: ${matchStack.length}`, done: false });
    } else {
      if (matchStack.length === 0) { matched = false; break; }
      matchStack = matchStack.slice(0, -1);
      steps.push({ stack: [...stack], operation: 'match', value: ch, matchStack: [...matchStack], expr, matched: null, message: `Bracket '${ch}' → pop from match stack (found pair). Match stack size: ${matchStack.length}`, done: false });
    }
  }
  matched = matchStack.length === 0;

  steps.push({ stack: [...stack], operation: 'match-done', value: null, matchStack: [], expr, matched, message: matched ? '✅ "(()())" is BALANCED — all brackets matched!' : '❌ Unbalanced brackets!', done: true });
  return steps;
}

// ─── Visualization ───────────────────────────────────────────────────────────

function StackViz({ step, activeTab }) {
  const { stack, operation, value, matchStack = [], expr = '(()())', matched } = step;

  return (
    <div className="w-full">
      {/* Tab switcher */}
      <div className="flex gap-2 mb-4 justify-center">
        {['Push/Pop Demo', 'Bracket Matching'].map(t => (
          <button
            key={t}
            onClick={() => activeTab.set(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeTab.val === t
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab.val === 'Push/Pop Demo' ? (
        <div className="flex flex-col items-center gap-2 min-h-[260px]">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-mono">TOP ↓</p>
          {stack.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl w-32 h-14 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
              empty
            </div>
          )}
          {[...stack].reverse().map((v, i) => {
            const isTop = i === 0;
            const isPopping = operation === 'pop-highlight' && isTop;
            const isPushed = operation === 'push' && isTop;
            const isPeeked = operation === 'peek' && isTop;
            return (
              <div key={`${v}-${i}`} className="relative flex items-center gap-2">
                {isTop && <span className="text-xs font-bold text-blue-500 absolute -left-12">TOP →</span>}
                <div className={`w-32 h-12 flex items-center justify-center rounded-xl text-base font-bold border-2 transition-all duration-300 select-none
                  ${isPopping ? 'bg-red-100 dark:bg-red-900/40 border-red-400 text-red-700 dark:text-red-300 scale-105' :
                    isPushed ? 'bg-green-100 dark:bg-green-900/40 border-green-400 text-green-700 dark:text-green-300 scale-105' :
                    isPeeked ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-400 text-amber-700 dark:text-amber-300' :
                    'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200'
                  }`}>
                  {v}
                </div>
              </div>
            );
          })}
          <div className="w-32 h-1 bg-gray-400 dark:bg-gray-600 rounded-full mt-1" />
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">─ BOTTOM ─</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 min-h-[260px]">
          {/* Expression characters */}
          <div className="flex gap-1.5">
            {expr.split('').map((ch, i) => {
              const matchedSoFar = step.operation === 'match' || step.operation === 'match-done';
              return (
                <div key={i} className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold border-2 transition-all
                  ${step.value === ch && step.operation === 'match' ? 'bg-amber-200 dark:bg-amber-800 border-amber-400 scale-110' :
                    'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}>
                  {ch}
                </div>
              );
            })}
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">Match Stack (parentheses)</div>
          <div className="flex gap-1.5 items-center">
            {matchStack.length === 0
              ? <div className="text-gray-400 dark:text-gray-500 text-xs border border-dashed border-gray-300 dark:border-gray-600 rounded px-3 py-1">empty</div>
              : matchStack.map((ch, i) => (
                <div key={i} className="w-8 h-8 flex items-center justify-center rounded bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-sm font-bold">
                  {ch}
                </div>
              ))
            }
          </div>
          {step.operation === 'match-done' && (
            <div className={`px-4 py-2 rounded-xl font-semibold text-sm border ${
              matched
                ? 'bg-green-100 dark:bg-green-900/40 border-green-400 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/40 border-red-400 text-red-700 dark:text-red-300'
            }`}>
              {matched ? '✅ BALANCED' : '❌ UNBALANCED'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Theory & Code ───────────────────────────────────────────────────────────

const theory = (
  <div>
    <TheorySection title="LIFO Principle">
      <p>A Stack follows <strong>Last-In, First-Out (LIFO)</strong>: the last element pushed is the first one popped. Think of a stack of plates — you always add or remove from the top.</p>
    </TheorySection>
    <TheorySection title="Core Operations">
      <ul className="list-disc pl-4 space-y-1">
        <li><strong>push(x):</strong> Add element x to the top — O(1)</li>
        <li><strong>pop():</strong> Remove and return the top element — O(1)</li>
        <li><strong>peek():</strong> Return top without removing — O(1)</li>
        <li><strong>isEmpty():</strong> Check if stack is empty — O(1)</li>
      </ul>
    </TheorySection>
    <TheorySection title="Call Stack & Recursion">
      <p>Every function call creates a stack frame. When recursion happens, frames accumulate on the call stack. When a function returns, its frame is popped. Stack overflow occurs when the call stack exceeds its memory limit.</p>
    </TheorySection>
    <TheorySection title="Bracket Matching">
      <p>To check balanced parentheses: push every opening bracket; on closing bracket, pop and check if it matches. If stack is empty at end and no mismatches occur, the expression is balanced. All O(n) time, O(n) space.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Push', 'O(1)', 'O(1)'],
      ['Pop', 'O(1)', 'O(1)'],
      ['Peek', 'O(1)', 'O(1)'],
      ['Search', 'O(n)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `#include <stack>
#include <iostream>
using namespace std;

int main() {
    stack<int> s;
    // Push
    s.push(5); s.push(3); s.push(8);
    // Peek
    cout << "Top: " << s.top() << endl; // 8
    // Pop
    s.pop();
    cout << "After pop, top: " << s.top() << endl; // 3
    cout << "Size: " << s.size() << endl;
    return 0;
}

// Balanced parentheses using stack
bool isBalanced(const string& s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(') st.push(c);
        else if (c == ')') {
            if (st.empty()) return false;
            st.pop();
        }
    }
    return st.empty();
}`,
    'Python': `from collections import deque

class Stack:
    def __init__(self):
        self._data = deque()

    def push(self, x):
        self._data.append(x)

    def pop(self):
        if self.is_empty():
            raise IndexError("pop from empty stack")
        return self._data.pop()

    def peek(self):
        return self._data[-1]

    def is_empty(self):
        return len(self._data) == 0

    def size(self):
        return len(self._data)

def is_balanced(s: str) -> bool:
    stack = Stack()
    for ch in s:
        if ch == '(':
            stack.push(ch)
        elif ch == ')':
            if stack.is_empty():
                return False
            stack.pop()
    return stack.is_empty()`,
    'JavaScript': `class Stack {
    constructor() { this._data = []; }

    push(x) { this._data.push(x); }

    pop() {
        if (this.isEmpty()) throw new Error('Stack underflow');
        return this._data.pop();
    }

    peek() { return this._data[this._data.length - 1]; }

    isEmpty() { return this._data.length === 0; }

    get size() { return this._data.length; }
}

function isBalanced(str) {
    const stack = new Stack();
    for (const ch of str) {
        if (ch === '(') stack.push(ch);
        else if (ch === ')') {
            if (stack.isEmpty()) return false;
            stack.pop();
        }
    }
    return stack.isEmpty();
}

// Usage
const s = new Stack();
s.push(5); s.push(3); s.push(8);
console.log(s.peek());  // 8
s.pop();
console.log(s.peek());  // 3`,
    'Java': `import java.util.ArrayDeque;
import java.util.Deque;

public class Stack<T> {
    private final Deque<T> data = new ArrayDeque<>();

    public void push(T x) { data.push(x); }

    public T pop() {
        if (isEmpty()) throw new RuntimeException("Stack underflow");
        return data.pop();
    }

    public T peek() { return data.peek(); }

    public boolean isEmpty() { return data.isEmpty(); }

    public int size() { return data.size(); }
}

// Balanced parentheses
public static boolean isBalanced(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        if (c == '(') stack.push(c);
        else if (c == ')') {
            if (stack.isEmpty()) return false;
            stack.pop();
        }
    }
    return stack.isEmpty();
}`,
  }} />
);

// ─── Default Export ───────────────────────────────────────────────────────────

const DEFAULT_VALUES = [5, 3, 8, 1];

export default function Stack() {
  const [steps, setSteps] = useState(() => generateSteps(DEFAULT_VALUES));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [customInput, setCustomInput] = useState(DEFAULT_VALUES.join(', '));
  const [inputError, setInputError] = useState('');
  const [activeTab, setActiveTab] = useState('Push/Pop Demo');
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleCustomInput = (val) => {
    setCustomInput(val);
    const nums = val.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (nums.length < 1) { setInputError('Enter at least 1 number'); return; }
    if (nums.length > 8) { setInputError('Max 8 values'); return; }
    setInputError('');
    setSteps(generateSteps(nums));
    setCurrentStep(0);
    setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const vals = Array.from({ length: 5 }, () => Math.floor(Math.random() * 90) + 1);
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

  const topVal = step.stack.length > 0 ? step.stack[step.stack.length - 1] : '—';

  return (
    <AlgorithmPageShell
      title="Stack"
      description="LIFO data structure with push, pop, peek operations and bracket matching demo"
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
      inputPlaceholder="e.g. 5, 3, 8, 1"
      inputLabel="Push values (comma-separated, max 8)"
      showInput={true}
      stats={{ size: step.stack.length, top: topVal, operations: currentStep }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(1) push and pop operations',
        'Simple implementation using arrays or linked lists',
        'Natural support for undo/redo functionality',
        'Inherent reversal capability',
        'Used implicitly in all recursive algorithms',
      ]}
      disadvantages={[
        'No random access — only top element accessible',
        'Array-based stack has fixed capacity (overflow risk)',
        'No searching without popping elements',
        'LIFO ordering may not suit all use cases',
      ]}
      applications={[
        'Function call stack in programming languages',
        'Expression evaluation and syntax parsing',
        'Undo/redo in text editors and applications',
        'Depth-First Search (DFS) iterative implementation',
        'Browser back/forward navigation history',
        'Balanced parentheses / bracket matching',
        'Postfix (RPN) expression evaluation',
      ]}
      interviewTips={[
        'Use a stack for matching brackets — push opens, pop on close, check if empty at end',
        'Monotonic stack solves "next greater element" in O(n) — a must-know pattern',
        'Stack can simulate recursion iteratively (e.g., DFS, in-order traversal)',
        'Min Stack trick: maintain a parallel stack of minimums for O(1) getMin()',
        'Know when to use deque instead (need access from both ends)',
        'For "largest rectangle in histogram" — use monotonic stack pattern',
      ]}
      relatedAlgos={[
        { title: 'Queue', route: '/queue' },
        { title: 'Linked List', route: '/linked-list' },
      ]}
      practiceProblems={[
        { name: 'Valid Parentheses', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-parentheses/' },
        { name: 'Min Stack', difficulty: 'Medium', url: 'https://leetcode.com/problems/min-stack/' },
        { name: 'Daily Temperatures', difficulty: 'Medium', url: 'https://leetcode.com/problems/daily-temperatures/' },
        { name: 'Largest Rectangle in Histogram', difficulty: 'Hard', url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/' },
      ]}
    >
      <StackViz step={step} activeTab={{ val: activeTab, set: setActiveTab }} />
    </AlgorithmPageShell>
  );
}
