import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const DEMO_OPS = [
  { op: 'insertHead', val: 10, desc: 'Insert 10 at head' },
  { op: 'insertTail', val: 20, desc: 'Insert 20 at tail' },
  { op: 'insertHead', val: 5, desc: 'Insert 5 at head' },
  { op: 'insertTail', val: 30, desc: 'Insert 30 at tail' },
  { op: 'insertAt', val: 15, pos: 2, desc: 'Insert 15 at position 2' },
  { op: 'delete', val: 20, desc: 'Delete node with value 20' },
  { op: 'insertTail', val: 25, desc: 'Insert 25 at tail' },
];

function generateDLLSteps() {
  const steps = [];
  let nodes = []; // [{id, val}]
  let idCounter = 0;

  steps.push({
    nodes: [], activeIdx: -1, newIdx: -1, deletedVal: null,
    operation: 'init', size: 0,
    message: 'Doubly Linked List. Each node has prev ← [val] → next pointers.',
    done: false,
  });

  for (const { op, val, pos, desc } of DEMO_OPS) {
    let activeIdx = -1, newIdx = -1, deletedVal = null;

    if (op === 'insertHead') {
      nodes = [{ id: idCounter++, val }, ...nodes];
      newIdx = 0;
    } else if (op === 'insertTail') {
      nodes = [...nodes, { id: idCounter++, val }];
      newIdx = nodes.length - 1;
    } else if (op === 'insertAt') {
      const p = Math.min(pos, nodes.length);
      nodes = [...nodes.slice(0, p), { id: idCounter++, val }, ...nodes.slice(p)];
      newIdx = p;
      activeIdx = p;
    } else if (op === 'delete') {
      const idx = nodes.findIndex(n => n.val === val);
      if (idx !== -1) {
        deletedVal = val;
        activeIdx = idx;
        steps.push({
          nodes: nodes.map(n => ({ ...n })), activeIdx, newIdx: -1, deletedVal,
          operation: 'delete_highlight', size: nodes.length,
          message: `Highlighting node ${val} to delete — unlink prev and next`,
          done: false,
        });
        nodes = nodes.filter(n => n.val !== val);
      }
    }

    steps.push({
      nodes: nodes.map(n => ({ ...n })), activeIdx: newIdx !== -1 ? newIdx : activeIdx, newIdx, deletedVal,
      operation: op, size: nodes.length,
      message: desc + (op === 'delete' ? ` — removed, list relinked` : ''),
      done: false,
    });
  }

  steps.push({
    nodes: nodes.map(n => ({ ...n })), activeIdx: -1, newIdx: -1, deletedVal: null,
    operation: 'done', size: nodes.length,
    message: `Final list: [${nodes.map(n => n.val).join(' ⇄ ')}]`,
    done: true,
  });

  return steps;
}

const theory = (
  <div>
    <TheorySection title="Doubly Linked List">
      <p>Each node contains a value, a <strong>next</strong> pointer (to the next node), and a <strong>prev</strong> pointer (to the previous node). This allows O(1) insertion and deletion at any node when you have a reference to it.</p>
    </TheorySection>
    <TheorySection title="Advantages over Singly Linked List">
      <ul className="list-disc pl-4 space-y-1">
        <li>O(1) deletion given a node pointer (no need to traverse to predecessor)</li>
        <li>Bidirectional traversal</li>
        <li>Enables efficient implementation of LRU cache, deque</li>
      </ul>
    </TheorySection>
    <TheorySection title="Sentinel Nodes (Dummy Head/Tail)">
      <p>Adding dummy head and tail nodes eliminates edge cases for empty lists and end insertions, simplifying the implementation significantly.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Insert at head/tail', 'O(1)', 'O(n)'],
      ['Insert at position k', 'O(k)', 'O(n)'],
      ['Delete (given node)', 'O(1)', 'O(1)'],
      ['Search', 'O(n)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `struct Node {
    int val;
    Node *prev, *next;
    Node(int v) : val(v), prev(nullptr), next(nullptr) {}
};

class DoublyLinkedList {
    Node *head, *tail;
    int size;
public:
    DoublyLinkedList() : head(nullptr), tail(nullptr), size(0) {}

    void insertHead(int val) {
        Node* node = new Node(val);
        if (!head) { head = tail = node; }
        else { node->next = head; head->prev = node; head = node; }
        size++;
    }
    void insertTail(int val) {
        Node* node = new Node(val);
        if (!tail) { head = tail = node; }
        else { tail->next = node; node->prev = tail; tail = node; }
        size++;
    }
    void deleteNode(Node* node) {
        if (node->prev) node->prev->next = node->next;
        else head = node->next;
        if (node->next) node->next->prev = node->prev;
        else tail = node->prev;
        delete node; size--;
    }
};`,
    'Python': `class Node:
    def __init__(self, val):
        self.val = val
        self.prev = self.next = None

class DoublyLinkedList:
    def __init__(self):
        # Sentinel nodes simplify edge cases
        self.head = Node(0)
        self.tail = Node(0)
        self.head.next = self.tail
        self.tail.prev = self.head
        self.size = 0

    def _insert_after(self, node, new_node):
        new_node.prev = node
        new_node.next = node.next
        node.next.prev = new_node
        node.next = new_node
        self.size += 1

    def insert_front(self, val):
        self._insert_after(self.head, Node(val))

    def insert_back(self, val):
        self._insert_after(self.tail.prev, Node(val))

    def remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev
        self.size -= 1`,
    'JavaScript': `class Node {
    constructor(val) {
        this.val = val;
        this.prev = this.next = null;
    }
}
class DoublyLinkedList {
    constructor() {
        this.head = this.tail = null;
        this.size = 0;
    }
    insertHead(val) {
        const node = new Node(val);
        if (!this.head) { this.head = this.tail = node; }
        else { node.next = this.head; this.head.prev = node; this.head = node; }
        this.size++;
    }
    insertTail(val) {
        const node = new Node(val);
        if (!this.tail) { this.head = this.tail = node; }
        else { this.tail.next = node; node.prev = this.tail; this.tail = node; }
        this.size++;
    }
    delete(node) {
        if (node.prev) node.prev.next = node.next; else this.head = node.next;
        if (node.next) node.next.prev = node.prev; else this.tail = node.prev;
        this.size--;
    }
}`,
    'Java': `class Node {
    int val; Node prev, next;
    Node(int v) { val = v; }
}
class DoublyLinkedList {
    Node head, tail; int size;

    void insertHead(int val) {
        Node node = new Node(val);
        if (head == null) { head = tail = node; }
        else { node.next = head; head.prev = node; head = node; }
        size++;
    }
    void insertTail(int val) {
        Node node = new Node(val);
        if (tail == null) { head = tail = node; }
        else { tail.next = node; node.prev = tail; tail = node; }
        size++;
    }
    void delete(Node node) {
        if (node.prev != null) node.prev.next = node.next; else head = node.next;
        if (node.next != null) node.next.prev = node.prev; else tail = node.prev;
        size--;
    }
}`,
  }} />
);

export default function DoublyLinkedList() {
  const [steps] = useState(() => generateDLLSteps());
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

  const step = steps[currentStep] || { nodes: [], activeIdx: -1, newIdx: -1, deletedVal: null, operation: 'init', size: 0, message: '', done: false };

  const head = step.nodes?.[0]?.val ?? 'null';
  const tail = step.nodes?.[step.nodes?.length - 1]?.val ?? 'null';

  return (
    <AlgorithmPageShell
      title="Doubly Linked List"
      description="Bidirectional linked list with O(1) insert/delete at head, tail, or given node"
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
      showInput={false}
      stats={{ size: step.size, head, tail, operation: step.operation }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(1) insert/delete at head and tail',
        'O(1) delete given a node pointer',
        'Bidirectional traversal',
        'Foundation for LRU cache, deque, browser history',
      ]}
      disadvantages={[
        'Extra memory per node for prev pointer',
        'O(n) search (no random access)',
        'More complex pointer manipulation than singly linked list',
        'Not cache-friendly (scattered memory)',
      ]}
      applications={[
        'LRU/LFU cache implementation',
        'Browser forward/back navigation',
        'Undo/redo in editors',
        'Music/playlist navigation',
        'Operating system scheduler (ready queue)',
      ]}
      interviewTips={[
        'Always handle head=null and tail=null edge cases',
        'Sentinel (dummy) head and tail eliminate many edge cases',
        'For delete: update both neighbors before freeing the node',
        'Draw the pointer updates step by step in interviews',
        'Java LinkedList and Python deque are doubly linked lists',
      ]}
      relatedAlgos={[
        { title: 'LRU Cache', route: '/data-structures/lru-cache' },
        { title: 'Deque', route: '/data-structures/deque' },
        { title: 'Linked List', route: '/data-structures/linked-list' },
      ]}
      practiceProblems={[
        { name: 'Design Linked List', difficulty: 'Medium', url: 'https://leetcode.com/problems/design-linked-list/' },
        { name: 'Reverse Linked List', difficulty: 'Easy', url: 'https://leetcode.com/problems/reverse-linked-list/' },
        { name: 'LRU Cache', difficulty: 'Medium', url: 'https://leetcode.com/problems/lru-cache/' },
      ]}
    >
      {/* Operation badge */}
      <div className="text-center mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
          step.operation === 'insertHead' || step.operation === 'insertTail' || step.operation === 'insertAt'
            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
            : step.operation === 'delete' || step.operation === 'delete_highlight'
              ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
        }`}>
          {step.operation.replace('_', ' ')}
        </span>
      </div>

      {/* Node list visualization */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-1 min-w-max mx-auto justify-center">
          <span className="text-xs text-gray-400 font-semibold">NULL</span>
          <span className="text-gray-400 text-sm">←</span>
          {step.nodes && step.nodes.length > 0 ? (
            step.nodes.map((node, i) => (
              <React.Fragment key={node.id}>
                <div className={`flex flex-col items-center border-2 rounded-xl overflow-hidden transition-all duration-300 ${
                  step.newIdx === i
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 scale-110'
                    : step.activeIdx === i
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/30 scale-105'
                      : step.done
                        ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                }`}>
                  <div className="flex text-[9px] text-gray-400 border-b border-gray-200 dark:border-gray-700 w-full">
                    <span className="flex-1 text-center py-0.5 border-r border-gray-200 dark:border-gray-700">←prev</span>
                    <span className="flex-1 text-center py-0.5">next→</span>
                  </div>
                  <div className={`px-3 py-2 font-bold text-base ${
                    step.newIdx === i ? 'text-emerald-700 dark:text-emerald-300' :
                    step.activeIdx === i ? 'text-amber-700 dark:text-amber-300' :
                    'text-gray-700 dark:text-gray-300'
                  }`}>{node.val}</div>
                </div>
                {i < step.nodes.length - 1 && <span className="text-gray-400 text-xs">⇄</span>}
              </React.Fragment>
            ))
          ) : (
            <span className="text-gray-400 text-sm italic px-4">list is empty</span>
          )}
          <span className="text-gray-400 text-sm">→</span>
          <span className="text-xs text-gray-400 font-semibold">NULL</span>
        </div>
      </div>

      {/* Head / Tail indicators */}
      {step.nodes && step.nodes.length > 0 && (
        <div className="flex justify-between mt-2 px-2">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">HEAD → {step.nodes[0]?.val}</span>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">TAIL → {step.nodes[step.nodes.length - 1]?.val}</span>
        </div>
      )}
    </AlgorithmPageShell>
  );
}
