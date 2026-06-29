import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// ─── AVL Tree logic ────────────────────────────────────────────────────────────
function height(node) { return node ? node.h : 0; }
function bf(node) { return node ? height(node.left) - height(node.right) : 0; }
function upd(node) { node.h = 1 + Math.max(height(node.left), height(node.right)); }

function rotateRight(y) {
  const x = y.left;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  upd(y); upd(x);
  return x;
}
function rotateLeft(x) {
  const y = x.right;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  upd(x); upd(y);
  return y;
}

function cloneTree(node) {
  if (!node) return null;
  return { ...node, left: cloneTree(node.left), right: cloneTree(node.right) };
}

function insert(root, val, steps) {
  function _ins(node, val) {
    if (!node) return { val, left: null, right: null, h: 1 };
    if (val < node.val) node.left = _ins(node.left, val);
    else if (val > node.val) node.right = _ins(node.right, val);
    else return node;
    upd(node);
    const b = bf(node);
    let rotType = null;
    if (b > 1 && val < node.left.val)  { rotType = 'LL'; node = rotateRight(node); }
    else if (b < -1 && val > node.right.val) { rotType = 'RR'; node = rotateLeft(node); }
    else if (b > 1 && val > node.left.val)  { rotType = 'LR'; node.left = rotateLeft(node.left); node = rotateRight(node); }
    else if (b < -1 && val < node.right.val) { rotType = 'RL'; node.right = rotateRight(node.right); node = rotateLeft(node); }
    if (rotType) {
      steps.push({ tree: cloneTree(node), rotType, rotNode: node.val, message: `Rotation ${rotType} at node ${node.val} to rebalance` });
    }
    return node;
  }
  steps.push({ tree: cloneTree(root), rotType: null, rotNode: null, insertingVal: val, message: `Inserting ${val}` });
  const newRoot = _ins(cloneTree(root), val);
  steps.push({ tree: cloneTree(newRoot), rotType: null, rotNode: null, message: `Inserted ${val}, tree rebalanced` });
  return newRoot;
}

function generateSteps() {
  const sequence = [30, 20, 40, 10, 25, 35, 50, 5, 15];
  const steps = [];
  let root = null;
  steps.push({ tree: null, rotType: null, rotNode: null, message: 'Starting AVL Tree insertion sequence: [30,20,40,10,25,35,50,5,15]' });
  for (const v of sequence) {
    root = insert(root, v, steps);
  }
  steps[steps.length - 1].done = true;
  return steps;
}

// ─── SVG Tree renderer ────────────────────────────────────────────────────────
const NODE_R = 22;
const H_SEP = 50;
const V_SEP = 60;

function layoutTree(node, depth = 0, counter = { v: 0 }) {
  if (!node) return null;
  const left = layoutTree(node.left, depth + 1, counter);
  const x = counter.v++;
  const right = layoutTree(node.right, depth + 1, counter);
  return { ...node, x, y: depth, left, right };
}

function collectNodes(node, nodes = [], edges = []) {
  if (!node) return;
  nodes.push(node);
  if (node.left) { edges.push([node, node.left]); collectNodes(node.left, nodes, edges); }
  if (node.right) { edges.push([node, node.right]); collectNodes(node.right, nodes, edges); }
}

function TreeSVG({ tree, rotNode }) {
  if (!tree) return <text x="200" y="60" textAnchor="middle" className="fill-gray-400 text-sm">Empty tree</text>;
  const laid = layoutTree(tree);
  const nodes = [], edges = [];
  collectNodes(laid, nodes, edges);
  const xs = nodes.map(n => n.x);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const W = Math.max((maxX - minX + 1) * H_SEP + 40, 300);
  const maxDepth = Math.max(...nodes.map(n => n.y));
  const H = (maxDepth + 1) * V_SEP + 40;
  const px = n => (n.x - minX) * H_SEP + 20 + (W - (maxX - minX) * H_SEP - 40) / 2;
  const py = n => n.y * V_SEP + 30;

  return (
    <svg width={W} height={H} className="overflow-visible">
      {edges.map(([p, c], i) => (
        <line key={i} x1={px(p)} y1={py(p)} x2={px(c)} y2={py(c)}
          stroke="#6b7280" strokeWidth="1.5" />
      ))}
      {nodes.map((n, i) => {
        const isRot = n.val === rotNode;
        const fill = isRot ? '#ef4444' : '#3b82f6';
        return (
          <g key={i} transform={`translate(${px(n)},${py(n)})`}>
            <circle r={NODE_R} fill={fill} stroke={isRot ? '#dc2626' : '#2563eb'} strokeWidth="2" />
            <text textAnchor="middle" dy="-4" fontSize="12" fontWeight="bold" fill="white">{n.val}</text>
            <text textAnchor="middle" dy="10" fontSize="9" fill={isRot ? '#fecaca' : '#bfdbfe'}>
              bf={bf(n)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Theory / Code ────────────────────────────────────────────────────────────
const theory = (
  <div>
    <TheorySection title="What is an AVL Tree?">
      <p>An AVL tree is a self-balancing binary search tree where the difference between heights of left and right subtrees (balance factor) cannot be more than 1 for any node. Named after inventors Adelson-Velsky and Landis (1962).</p>
      <p>When an insertion or deletion causes imbalance, one of four rotations (LL, RR, LR, RL) is performed to restore the balance invariant.</p>
    </TheorySection>
    <TheorySection title="Rotations">
      <ul className="list-disc pl-4 space-y-1">
        <li><strong>LL (Right rotation):</strong> Left-heavy, left child is left-heavy</li>
        <li><strong>RR (Left rotation):</strong> Right-heavy, right child is right-heavy</li>
        <li><strong>LR (Left-Right):</strong> Left-heavy, left child is right-heavy</li>
        <li><strong>RL (Right-Left):</strong> Right-heavy, right child is left-heavy</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Search', 'O(log n)', 'O(log n)'],
      ['Insert', 'O(log n)', 'O(log n)'],
      ['Delete', 'O(log n)', 'O(log n)'],
      ['Space', '-', 'O(n)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `struct Node {
    int val, height;
    Node *left, *right;
    Node(int v): val(v), height(1), left(nullptr), right(nullptr){}
};
int height(Node* n){ return n ? n->height : 0; }
int bf(Node* n){ return n ? height(n->left)-height(n->right) : 0; }
void upd(Node* n){ n->height = 1+max(height(n->left),height(n->right)); }

Node* rotR(Node* y){ auto x=y->left; y->left=x->right; x->right=y; upd(y); upd(x); return x; }
Node* rotL(Node* x){ auto y=x->right; x->right=y->left; y->left=x; upd(x); upd(y); return y; }

Node* insert(Node* n, int v){
    if(!n) return new Node(v);
    if(v<n->val) n->left=insert(n->left,v);
    else if(v>n->val) n->right=insert(n->right,v);
    else return n;
    upd(n);
    int b=bf(n);
    if(b>1 && v<n->left->val) return rotR(n);
    if(b<-1 && v>n->right->val) return rotL(n);
    if(b>1 && v>n->left->val){ n->left=rotL(n->left); return rotR(n); }
    if(b<-1 && v<n->right->val){ n->right=rotR(n->right); return rotL(n); }
    return n;
}`,
    'Python': `class Node:
    def __init__(self, v):
        self.val = v; self.h = 1; self.left = self.right = None

def h(n): return n.h if n else 0
def bf(n): return h(n.left) - h(n.right) if n else 0
def upd(n): n.h = 1 + max(h(n.left), h(n.right))

def rotR(y):
    x = y.left; y.left = x.right; x.right = y
    upd(y); upd(x); return x

def rotL(x):
    y = x.right; x.right = y.left; y.left = x
    upd(x); upd(y); return y

def insert(n, v):
    if not n: return Node(v)
    if v < n.val: n.left = insert(n.left, v)
    elif v > n.val: n.right = insert(n.right, v)
    else: return n
    upd(n); b = bf(n)
    if b > 1 and v < n.left.val: return rotR(n)
    if b < -1 and v > n.right.val: return rotL(n)
    if b > 1 and v > n.left.val: n.left = rotL(n.left); return rotR(n)
    if b < -1 and v < n.right.val: n.right = rotR(n.right); return rotL(n)
    return n`,
    'JavaScript': `class Node {
  constructor(v){ this.val=v; this.h=1; this.left=this.right=null; }
}
const h = n => n ? n.h : 0;
const bf = n => n ? h(n.left)-h(n.right) : 0;
const upd = n => { n.h = 1 + Math.max(h(n.left), h(n.right)); };
function rotR(y){ const x=y.left; y.left=x.right; x.right=y; upd(y); upd(x); return x; }
function rotL(x){ const y=x.right; x.right=y.left; y.left=x; upd(x); upd(y); return y; }
function insert(n, v){
  if(!n) return new Node(v);
  if(v<n.val) n.left=insert(n.left,v);
  else if(v>n.val) n.right=insert(n.right,v);
  else return n;
  upd(n); const b=bf(n);
  if(b>1&&v<n.left.val) return rotR(n);
  if(b<-1&&v>n.right.val) return rotL(n);
  if(b>1&&v>n.left.val){ n.left=rotL(n.left); return rotR(n); }
  if(b<-1&&v<n.right.val){ n.right=rotR(n.right); return rotL(n); }
  return n;
}`,
    'Java': `class Node { int val,h; Node left,right; Node(int v){val=v;h=1;} }
int h(Node n){ return n==null?0:n.h; }
int bf(Node n){ return n==null?0:h(n.left)-h(n.right); }
void upd(Node n){ n.h=1+Math.max(h(n.left),h(n.right)); }
Node rotR(Node y){ Node x=y.left; y.left=x.right; x.right=y; upd(y); upd(x); return x; }
Node rotL(Node x){ Node y=x.right; x.right=y.left; y.left=x; upd(x); upd(y); return y; }
Node insert(Node n, int v){
    if(n==null) return new Node(v);
    if(v<n.val) n.left=insert(n.left,v);
    else if(v>n.val) n.right=insert(n.right,v);
    else return n;
    upd(n); int b=bf(n);
    if(b>1&&v<n.left.val) return rotR(n);
    if(b<-1&&v>n.right.val) return rotL(n);
    if(b>1&&v>n.left.val){ n.left=rotL(n.left); return rotR(n); }
    if(b<-1&&v<n.right.val){ n.right=rotR(n.right); return rotL(n); }
    return n;
}`,
  }} />
);

const STEPS = generateSteps();

export default function AVLTree() {
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
      title="AVL Tree"
      description="Self-balancing BST maintaining height balance via LL/RR/LR/RL rotations"
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
      stats={{ step: `${currentStep + 1}/${STEPS.length}`, rotation: step.rotType || 'none' }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Guaranteed O(log n) for search, insert, delete',
        'Strictly balanced — height never exceeds 1.44 log n',
        'Better search performance than Red-Black trees',
      ]}
      disadvantages={[
        'More rotations than Red-Black tree on insert/delete',
        'Extra space for height/balance-factor per node',
        'Implementation is complex',
      ]}
      applications={['Databases (indexed lookup)', 'In-memory ordered sets', 'Geometric algorithms', 'File systems']}
      interviewTips={[
        'Know all 4 rotation cases and when each applies',
        'Balance factor = height(left) - height(right)',
        'AVL height is O(log n); Red-Black is also O(log n) but with larger constant',
        'Deletion also requires rotations — interview often asks about this',
      ]}
      relatedAlgos={[
        { title: 'Binary Heap', route: '/binary-heap' },
        { title: 'Segment Tree', route: '/segment-tree' },
        { title: 'Trie', route: '/trie' },
      ]}
      practiceProblems={[
        { name: 'Balance a BST', difficulty: 'Medium', url: 'https://leetcode.com/problems/balance-a-binary-search-tree/' },
        { name: 'Height of Binary Tree', difficulty: 'Easy', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
        { name: 'Check if BST is balanced', difficulty: 'Easy', url: 'https://leetcode.com/problems/balanced-binary-tree/' },
      ]}
    >
      <div className="flex flex-col items-center gap-4 min-h-64 overflow-x-auto">
        {step.rotType && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-700">
            <span className="text-red-700 dark:text-red-300 font-bold text-sm">Rotation: {step.rotType}</span>
            <span className="text-red-500 dark:text-red-400 text-xs">at node {step.rotNode}</span>
          </div>
        )}
        <div className="overflow-x-auto w-full flex justify-center">
          <TreeSVG tree={step.tree} rotNode={step.rotNode} />
        </div>
        <div className="flex gap-4 text-xs mt-2">
          {[['bg-blue-500', 'Normal node'], ['bg-red-500', 'Rotation pivot']].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full ${c} inline-block`} />{l}
            </span>
          ))}
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
