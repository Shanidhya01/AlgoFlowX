import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// ─── Helpers ────────────────────────────────────────────────────────────────

let _idCounter = 1;
function mkId() { return _idCounter++; }

function makeAddr(id) {
  return '0x' + (id * 0x1A4 + 0x100).toString(16).toUpperCase().padStart(4, '0');
}

function buildNodes(vals) {
  return vals.map(v => ({ val: v, id: mkId(), addr: makeAddr(mkId()) }));
}

function cloneNodes(nodes) {
  return nodes.map(n => ({ ...n }));
}

// ─── Step Generator ─────────────────────────────────────────────────────────

function generateSteps(initVals) {
  _idCounter = 1;
  const steps = [];
  let nodes = [];
  let head = null;

  const snap = (highlighted = [], pointerHighlight = [], operation = null, message = '') => {
    steps.push({ nodes: cloneNodes(nodes), head, highlighted: [...highlighted], pointerHighlight: [...pointerHighlight], operation, message, done: false });
  };

  snap([], [], null, 'Linked list initialized — empty. Each node holds a value and a next pointer.');

  // insertHead(1)
  const n1 = { val: 1, id: mkId(), addr: makeAddr(mkId()) };
  nodes = [n1];
  head = n1.id;
  snap([n1.id], [], 'insertHead', `insertHead(1) → Node(1) created. Head now points to node 1.`);

  // insertTail(2)
  const n2 = { val: 2, id: mkId(), addr: makeAddr(mkId()) };
  nodes = [...nodes, n2];
  snap([n2.id], [], 'insertTail', `insertTail(2) → Traversed to tail, appended Node(2). List: 1 → 2`);

  // insertTail(3)
  const n3 = { val: 3, id: mkId(), addr: makeAddr(mkId()) };
  nodes = [...nodes, n3];
  snap([n3.id], [], 'insertTail', `insertTail(3) → Traversed to tail, appended Node(3). List: 1 → 2 → 3`);

  // insertHead(0)
  const n0 = { val: 0, id: mkId(), addr: makeAddr(mkId()) };
  nodes = [n0, ...nodes];
  head = n0.id;
  snap([n0.id], [], 'insertHead', `insertHead(0) → Node(0) points to old head. Head updated. List: 0 → 1 → 2 → 3`);

  // insertAt(2, 99)
  const n99 = { val: 99, id: mkId(), addr: makeAddr(mkId()) };
  // Find position 2 (0-indexed), insert before index 2
  nodes = [nodes[0], nodes[1], n99, ...nodes.slice(2)];
  snap([n99.id], [nodes[1].id], 'insertAt', `insertAt(index=2, val=99) → Node(99) inserted. prev.next = Node(99), Node(99).next = old[2]. List: 0 → 1 → 99 → 2 → 3`);

  // delete(99)
  snap([n99.id], [], 'delete-highlight', `delete(99) → Searching for node with value 99...`);
  nodes = nodes.filter(n => n.val !== 99);
  snap([], [nodes[1].id], 'delete', `delete(99) → Node(99) removed. prev.next reconnected to Node(2). List: 0 → 1 → 2 → 3`);

  // search(3)
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    snap([n.id], [], 'search', `search(3) → Checking node ${n.val}... ${n.val === 3 ? 'FOUND!' : 'not 3, continue →'}`);
    if (n.val === 3) break;
  }

  // reverse
  snap([], [], 'reverse-start', `reverse() → Will flip all next pointers. Starting with prev=null, curr=head`);
  const reversed = [...nodes].reverse();
  head = reversed[0].id;
  snap([], [], 'reverse', `reverse() → All pointers flipped! List now: ${reversed.map(n => n.val).join(' → ')}. Head = ${reversed[0].val}`);
  nodes = reversed;
  snap([], [], 'reverse-done', `Reversal complete! List: ${nodes.map(n => n.val).join(' → ')} → null`);

  steps.push({ nodes: cloneNodes(nodes), head, highlighted: [], pointerHighlight: [], operation: 'done', message: `✅ All linked list operations complete! Final list: ${nodes.map(n => n.val).join(' → ')} → NULL`, done: true });
  return steps;
}

// ─── Visualization ───────────────────────────────────────────────────────────

function LinkedListViz({ step }) {
  const { nodes, head, highlighted, pointerHighlight, operation } = step;

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[160px] text-gray-400 dark:text-gray-500 text-sm gap-2">
        <div className="font-mono">HEAD → NULL</div>
        <div className="text-xs">Empty linked list</div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center gap-0 min-w-max mx-auto px-4 py-8">
        {/* HEAD label */}
        <div className="flex flex-col items-center mr-2">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 rounded-lg">HEAD</span>
          <div className="w-0.5 h-4 bg-emerald-400 mx-auto" />
          <span className="text-emerald-400 text-sm">↓</span>
        </div>

        {nodes.map((node, i) => {
          const isHL = highlighted.includes(node.id);
          const isPtrHL = pointerHighlight.includes(node.id);
          const isHead = node.id === head;
          const isDelete = (operation === 'delete-highlight' || operation === 'delete') && isHL;
          const isSearch = operation === 'search' && isHL;
          const isInsert = (operation === 'insertHead' || operation === 'insertTail' || operation === 'insertAt') && isHL;
          const isReverse = operation === 'reverse' || operation === 'reverse-done';

          return (
            <React.Fragment key={node.id}>
              {/* Node box */}
              <div className={`flex rounded-xl overflow-hidden border-2 transition-all duration-300 select-none shadow-sm
                ${isDelete ? 'border-red-400 scale-105' :
                  isSearch ? 'border-amber-400 scale-105' :
                  isInsert ? 'border-green-400 scale-105' :
                  isPtrHL ? 'border-purple-400' :
                  isReverse ? 'border-blue-500' :
                  'border-blue-300 dark:border-blue-700'
                }`}>
                {/* Value part */}
                <div className={`flex flex-col items-center justify-center px-3 py-2 min-w-[52px]
                  ${isDelete ? 'bg-red-100 dark:bg-red-900/40' :
                    isSearch ? 'bg-amber-100 dark:bg-amber-900/40' :
                    isInsert ? 'bg-green-100 dark:bg-green-900/40' :
                    'bg-blue-100 dark:bg-blue-900/40'
                  }`}>
                  <span className={`text-lg font-bold leading-none
                    ${isDelete ? 'text-red-700 dark:text-red-300' :
                      isSearch ? 'text-amber-700 dark:text-amber-300' :
                      isInsert ? 'text-green-700 dark:text-green-300' :
                      'text-blue-800 dark:text-blue-200'
                    }`}>{node.val}</span>
                  <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500 mt-0.5">{node.addr}</span>
                </div>
                {/* Pointer part */}
                <div className="flex items-center justify-center px-2 py-2 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 min-w-[36px]">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">next</span>
                </div>
              </div>

              {/* Arrow or NULL */}
              {i < nodes.length - 1 ? (
                <div className="flex items-center mx-0.5">
                  <div className={`h-0.5 w-6 ${isReverse ? 'bg-blue-400' : 'bg-gray-400 dark:bg-gray-500'}`} />
                  <span className={`text-sm ${isReverse ? 'text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>→</span>
                </div>
              ) : (
                <div className="flex items-center ml-1 gap-1">
                  <div className="h-0.5 w-4 bg-gray-300 dark:bg-gray-600" />
                  <span className="text-xs font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 rounded">NULL</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ─── Theory & Code ───────────────────────────────────────────────────────────

const theory = (
  <div>
    <TheorySection title="What is a Linked List?">
      <p>A <strong>singly linked list</strong> is a sequence of nodes where each node holds a value and a pointer to the next node. Unlike arrays, nodes are <em>not</em> stored contiguously in memory — they can be anywhere in the heap, connected by pointers.</p>
    </TheorySection>
    <TheorySection title="Array vs Linked List">
      <ul className="list-disc pl-4 space-y-1">
        <li><strong>Array:</strong> O(1) random access, O(n) insert/delete in middle, fixed or costly resize</li>
        <li><strong>Linked List:</strong> O(n) access by index, O(1) insert at head, O(1) delete with pointer, dynamic size</li>
        <li>Linked lists are cache-unfriendly; arrays are cache-friendly (contiguous memory)</li>
      </ul>
    </TheorySection>
    <TheorySection title="Key Operations">
      <ul className="list-disc pl-4 space-y-1">
        <li><strong>insertHead:</strong> Create node, set its next = old head, update head — O(1)</li>
        <li><strong>insertTail:</strong> Traverse to last node, set its next = new node — O(n) (O(1) with tail pointer)</li>
        <li><strong>delete(val):</strong> Find node, update prev.next to skip it — O(n) find + O(1) delete</li>
        <li><strong>reverse:</strong> Three-pointer technique — prev, curr, next — O(n)</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Insert at head', 'O(1)', 'O(1)'],
      ['Insert at tail', 'O(n)', 'O(1)'],
      ['Delete by value', 'O(n)', 'O(1)'],
      ['Search', 'O(n)', 'O(1)'],
      ['Reverse', 'O(n)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `struct Node {
    int val;
    Node* next;
    Node(int v) : val(v), next(nullptr) {}
};

class LinkedList {
    Node* head = nullptr;
public:
    void insertHead(int val) {
        Node* node = new Node(val);
        node->next = head;
        head = node;
    }
    void insertTail(int val) {
        Node* node = new Node(val);
        if (!head) { head = node; return; }
        Node* cur = head;
        while (cur->next) cur = cur->next;
        cur->next = node;
    }
    void deleteVal(int val) {
        if (!head) return;
        if (head->val == val) { Node* tmp = head; head = head->next; delete tmp; return; }
        Node* cur = head;
        while (cur->next && cur->next->val != val) cur = cur->next;
        if (cur->next) { Node* tmp = cur->next; cur->next = tmp->next; delete tmp; }
    }
    void reverse() {
        Node* prev = nullptr; Node* cur = head;
        while (cur) { Node* next = cur->next; cur->next = prev; prev = cur; cur = next; }
        head = prev;
    }
};`,
    'Python': `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def insert_head(self, val):
        node = Node(val)
        node.next = self.head
        self.head = node

    def insert_tail(self, val):
        node = Node(val)
        if not self.head:
            self.head = node
            return
        cur = self.head
        while cur.next:
            cur = cur.next
        cur.next = node

    def delete(self, val):
        if not self.head: return
        if self.head.val == val:
            self.head = self.head.next
            return
        cur = self.head
        while cur.next and cur.next.val != val:
            cur = cur.next
        if cur.next:
            cur.next = cur.next.next

    def reverse(self):
        prev, cur = None, self.head
        while cur:
            nxt = cur.next
            cur.next = prev
            prev = cur
            cur = nxt
        self.head = prev`,
    'JavaScript': `class Node {
    constructor(val) { this.val = val; this.next = null; }
}

class LinkedList {
    constructor() { this.head = null; }

    insertHead(val) {
        const node = new Node(val);
        node.next = this.head;
        this.head = node;
    }

    insertTail(val) {
        const node = new Node(val);
        if (!this.head) { this.head = node; return; }
        let cur = this.head;
        while (cur.next) cur = cur.next;
        cur.next = node;
    }

    delete(val) {
        if (!this.head) return;
        if (this.head.val === val) { this.head = this.head.next; return; }
        let cur = this.head;
        while (cur.next && cur.next.val !== val) cur = cur.next;
        if (cur.next) cur.next = cur.next.next;
    }

    reverse() {
        let prev = null, cur = this.head;
        while (cur) {
            const next = cur.next;
            cur.next = prev;
            prev = cur; cur = next;
        }
        this.head = prev;
    }
}`,
    'Java': `public class LinkedList {
    static class Node {
        int val; Node next;
        Node(int val) { this.val = val; }
    }
    Node head;

    public void insertHead(int val) {
        Node node = new Node(val);
        node.next = head;
        head = node;
    }

    public void insertTail(int val) {
        Node node = new Node(val);
        if (head == null) { head = node; return; }
        Node cur = head;
        while (cur.next != null) cur = cur.next;
        cur.next = node;
    }

    public void delete(int val) {
        if (head == null) return;
        if (head.val == val) { head = head.next; return; }
        Node cur = head;
        while (cur.next != null && cur.next.val != val) cur = cur.next;
        if (cur.next != null) cur.next = cur.next.next;
    }

    public void reverse() {
        Node prev = null, cur = head;
        while (cur != null) {
            Node next = cur.next;
            cur.next = prev;
            prev = cur; cur = next;
        }
        head = prev;
    }
}`,
  }} />
);

// ─── Default Export ───────────────────────────────────────────────────────────

export default function LinkedListPage() {
  const [steps, setSteps] = useState(() => generateSteps([1, 2, 3]));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(700);
  const [customInput, setCustomInput] = useState('1, 2, 3');
  const [inputError, setInputError] = useState('');
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleCustomInput = (val) => {
    setCustomInput(val);
    const nums = val.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (nums.length < 1) { setInputError('Enter at least 1 number'); return; }
    if (nums.length > 6) { setInputError('Max 6 initial values'); return; }
    setInputError('');
    setSteps(generateSteps(nums));
    setCurrentStep(0);
    setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const vals = Array.from({ length: 3 }, () => Math.floor(Math.random() * 20) + 1);
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

  const headNode = step.nodes.find(n => n.id === step.head);

  return (
    <AlgorithmPageShell
      title="Linked List"
      description="Singly linked list with insert, delete, search and reverse operations"
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
      inputPlaceholder="e.g. 1, 2, 3"
      inputLabel="Initial values (comma-separated, max 6)"
      showInput={true}
      stats={{ size: step.nodes.length, head: headNode ? headNode.val : 'None', operation: step.operation || '—' }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Dynamic size — no pre-allocation needed',
        'O(1) insertion at head',
        'No wasted memory — nodes allocated on demand',
        'Efficient insertion/deletion when you have a pointer to the node',
      ]}
      disadvantages={[
        'No random access — must traverse from head O(n)',
        'Extra memory per node for the next pointer',
        'Cache-unfriendly — nodes scattered in memory',
        'No backward traversal without doubly linked list',
      ]}
      applications={[
        'LRU Cache implementation (doubly linked list)',
        'Polynomial arithmetic',
        'Hash table chaining (collision resolution)',
        'Music playlist (circular linked list)',
        'Undo/redo via doubly linked list',
        'Adjacency list in graph representations',
      ]}
      interviewTips={[
        'Runner technique: slow/fast pointers to find middle or detect cycle',
        'Always draw pointer diagrams before coding',
        'Reverse a linked list in-place using 3 pointers: prev, curr, next',
        "Detect cycle with Floyd's algorithm — O(1) space",
        'Dummy head node simplifies edge cases (delete head, empty list)',
        'Merge two sorted lists by comparing front nodes and advancing pointers',
      ]}
      relatedAlgos={[
        { title: 'Doubly Linked List', route: '/doubly-linked-list' },
        { title: 'Stack', route: '/stack' },
        { title: 'LRU Cache', route: '/lru-cache' },
      ]}
      practiceProblems={[
        { name: 'Reverse Linked List', difficulty: 'Easy', url: 'https://leetcode.com/problems/reverse-linked-list/' },
        { name: 'Linked List Cycle', difficulty: 'Easy', url: 'https://leetcode.com/problems/linked-list-cycle/' },
        { name: 'Merge Two Sorted Lists', difficulty: 'Easy', url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
        { name: 'Remove Nth Node From End of List', difficulty: 'Medium', url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
      ]}
    >
      <LinkedListViz step={step} />
    </AlgorithmPageShell>
  );
}
