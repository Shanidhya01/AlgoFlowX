import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

class BSTNode {
  constructor(val) { this.val = val; this.left = null; this.right = null; }
}

function insertBST(root, val) {
  if (!root) return new BSTNode(val);
  if (val < root.val) root.left = insertBST(root.left, val);
  else if (val > root.val) root.right = insertBST(root.right, val);
  return root;
}

function buildTree(vals) {
  let root = null;
  for (const v of vals) root = insertBST(root, v);
  return root;
}

function assignPositions(node, depth = 0, pos = 0, positions = {}, width = 1) {
  if (!node) return { positions, maxWidth: width };
  positions[`${depth}_${node.val}`] = { x: pos, y: depth, val: node.val };
  const spread = Math.max(2, 8 / (depth + 1));
  assignPositions(node.left, depth + 1, pos - spread, positions, width);
  assignPositions(node.right, depth + 1, pos + spread, positions, width);
  return { positions };
}

function generateInsertSteps(values) {
  const steps = [];
  let root = null;
  const inserted = [];

  steps.push({ root: null, highlight: [], comparison: null, inserted: [], message: 'Empty BST — ready to insert values.' });

  for (const val of values) {
    const path = [];
    let node = root;
    while (node) {
      path.push(node.val);
      steps.push({ root: JSON.parse(JSON.stringify(root)), highlight: [node.val], comparison: val, inserted: [...inserted], message: `Inserting ${val}: comparing with ${node.val} → go ${val < node.val ? 'left' : 'right'}` });
      if (val < node.val) node = node.left;
      else if (val > node.val) node = node.right;
      else break;
    }
    root = insertBST(root, val);
    inserted.push(val);
    steps.push({ root: JSON.parse(JSON.stringify(root)), highlight: [val], comparison: null, inserted: [...inserted], message: `Inserted ${val} into BST. Total nodes: ${inserted.length}` });
  }

  steps.push({ root: JSON.parse(JSON.stringify(root)), highlight: [], comparison: null, inserted: [...inserted], done: true, message: `✅ BST built with ${inserted.length} nodes. In-order traversal gives sorted order!` });
  return steps;
}

function TreeViz({ root, highlight, done }) {
  if (!root) return <div className="text-gray-400 dark:text-gray-500 text-center py-10">Empty tree</div>;

  const nodes = [];
  const edges = [];

  function traverse(node, x, y, parentX, parentY, depth) {
    if (!node) return;
    const gap = Math.max(30, 120 / (depth + 1));
    nodes.push({ val: node.val, x, y });
    if (parentX !== undefined) edges.push({ x1: parentX, y1: parentY, x2: x, y2: y });
    traverse(node.left, x - gap, y + 60, x, y, depth + 1);
    traverse(node.right, x + gap, y + 60, x, y, depth + 1);
  }

  traverse(root, 280, 30, undefined, undefined, 0);

  const minX = Math.min(...nodes.map(n => n.x)) - 30;
  const maxX = Math.max(...nodes.map(n => n.x)) + 30;
  const maxY = Math.max(...nodes.map(n => n.y)) + 50;
  const width = Math.max(560, maxX - minX);

  return (
    <svg width="100%" viewBox={`${minX} 0 ${width} ${maxY}`} style={{ overflow: 'visible' }}>
      {edges.map((e, i) => (
        <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="1.5" />
      ))}
      {nodes.map((n, i) => {
        const isHL = highlight.includes(n.val);
        const isDone = done;
        return (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r="18" className={`transition-all duration-200 ${
              isDone ? 'fill-emerald-200 stroke-emerald-500' :
              isHL ? 'fill-amber-200 stroke-amber-500' :
              'fill-blue-100 dark:fill-blue-900 stroke-blue-400 dark:stroke-blue-600'
            }`} strokeWidth="2" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" className={`text-[11px] font-bold fill-current ${
              isDone ? 'fill-emerald-800' :
              isHL ? 'fill-amber-800' :
              'fill-blue-800 dark:fill-blue-200'
            }`} fontSize="11">
              {n.val}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const DEFAULT_VALUES = [50, 30, 70, 20, 40, 60, 80, 10, 25];

const theory = (
  <div>
    <TheorySection title="Binary Search Tree Property">
      <p>For every node n: all values in the left subtree are less than n.val, and all values in the right subtree are greater. This property enables efficient search, insertion, and deletion.</p>
    </TheorySection>
    <TheorySection title="Key Operations">
      <ul className="list-disc pl-4 space-y-1">
        <li><strong>Search:</strong> Compare and go left/right — O(log n) average</li>
        <li><strong>Insert:</strong> Search for position, insert as leaf — O(log n)</li>
        <li><strong>Delete:</strong> 3 cases: leaf, one child, two children — O(log n)</li>
        <li><strong>In-order traversal:</strong> Visits nodes in sorted order — O(n)</li>
      </ul>
    </TheorySection>
    <TheorySection title="Degenerate Case">
      <p>If values are inserted in sorted order, the BST degrades into a linked list with O(n) operations. AVL trees and Red-Black trees solve this with auto-balancing.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Search (avg)', 'O(log n)', 'O(n)'],
      ['Insert (avg)', 'O(log n)', 'O(n)'],
      ['Delete (avg)', 'O(log n)', 'O(n)'],
      ['Worst case (sorted input)', 'O(n)', 'O(n)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `struct Node { int val; Node *left, *right; };

Node* insert(Node* root, int val) {
    if (!root) return new Node{val, nullptr, nullptr};
    if (val < root->val) root->left = insert(root->left, val);
    else if (val > root->val) root->right = insert(root->right, val);
    return root;
}

Node* search(Node* root, int val) {
    if (!root || root->val == val) return root;
    return val < root->val ? search(root->left, val) : search(root->right, val);
}`,
    'Python': `class BST:
    def __init__(self, val):
        self.val = val
        self.left = self.right = None

    def insert(self, val):
        if val < self.val:
            if self.left: self.left.insert(val)
            else: self.left = BST(val)
        elif val > self.val:
            if self.right: self.right.insert(val)
            else: self.right = BST(val)

    def search(self, val):
        if val == self.val: return self
        if val < self.val: return self.left.search(val) if self.left else None
        return self.right.search(val) if self.right else None`,
    'JavaScript': `class BST {
    constructor(val) {
        this.val = val;
        this.left = this.right = null;
    }
    insert(val) {
        if (val < this.val) {
            if (this.left) this.left.insert(val);
            else this.left = new BST(val);
        } else if (val > this.val) {
            if (this.right) this.right.insert(val);
            else this.right = new BST(val);
        }
    }
    search(val) {
        if (val === this.val) return this;
        if (val < this.val) return this.left?.search(val) ?? null;
        return this.right?.search(val) ?? null;
    }
}`,
  }} />
);

export default function BST() {
  const [inputVal, setInputVal] = useState(DEFAULT_VALUES.join(', '));
  const [inputError, setInputError] = useState('');
  const [steps, setSteps] = useState(() => generateInsertSteps(DEFAULT_VALUES));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleCustomInput = (val) => {
    setInputVal(val);
    const nums = [...new Set(val.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)))];
    if (nums.length < 2) { setInputError('Enter at least 2 numbers'); return; }
    if (nums.length > 15) { setInputError('Max 15 values'); return; }
    setInputError('');
    setSteps(generateInsertSteps(nums));
    setCurrentStep(0);
    setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const vals = [...new Set(Array.from({ length: 9 }, () => Math.floor(Math.random() * 90) + 10))].slice(0, 9);
    setInputVal(vals.join(', '));
    setSteps(generateInsertSteps(vals));
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
      title="Binary Search Tree"
      description="Interactive BST insertion with step-by-step traversal highlighting"
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
      onRandomize={handleRandomize}
      customInput={inputVal}
      onCustomInput={handleCustomInput}
      inputError={inputError}
      inputPlaceholder="e.g. 50, 30, 70, 20, 40"
      inputLabel="Values (comma-separated)"
      stats={{ nodes: step.inserted?.length || 0, comparing: step.highlight[0] ?? '—' }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
    >
      <TreeViz root={step.root} highlight={step.highlight || []} done={!!step.done} />
    </AlgorithmPageShell>
  );
}
