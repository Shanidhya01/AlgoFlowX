import React, { useState, useEffect, useRef } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// ─── Trie logic ───────────────────────────────────────────────────────────────
function buildTrieSteps() {
  const words = ['apple', 'app', 'apt', 'bat', 'ball', 'cat'];
  const steps = [];
  const root = { children: {}, isEnd: false, char: '' };

  const cloneTrie = (node) => ({
    ...node,
    children: Object.fromEntries(Object.entries(node.children).map(([k, v]) => [k, cloneTrie(v)])),
  });

  steps.push({ trie: cloneTrie(root), highlight: [], searchWord: null, searchResult: null, message: 'Starting Trie — empty tree' });

  for (const word of words) {
    let cur = root;
    const path = [];
    for (const ch of word) {
      if (!cur.children[ch]) cur.children[ch] = { children: {}, isEnd: false, char: ch };
      cur = cur.children[ch];
      path.push(ch);
      steps.push({ trie: cloneTrie(root), highlight: [...path], searchWord: null, searchResult: null, message: `Inserting "${word}" — at node "${ch}"` });
    }
    cur.isEnd = true;
    steps.push({ trie: cloneTrie(root), highlight: [...path], searchWord: null, searchResult: null, message: `"${word}" fully inserted (end-of-word marked)` });
  }

  // Search "app" — found
  {
    const target = 'app';
    let cur = root;
    const path = [];
    let found = true;
    for (const ch of target) {
      if (!cur.children[ch]) { found = false; break; }
      cur = cur.children[ch];
      path.push(ch);
      steps.push({ trie: cloneTrie(root), highlight: [...path], searchWord: target, searchResult: null, message: `Search "${target}" — traversing "${ch}"` });
    }
    steps.push({ trie: cloneTrie(root), highlight: [...path], searchWord: target, searchResult: found && cur.isEnd ? 'found' : 'not-found', message: `Search "${target}" — ${found && cur.isEnd ? 'FOUND' : 'NOT FOUND'}` });
  }

  // Search "ape" — not found
  {
    const target = 'ape';
    let cur = root;
    const path = [];
    let found = true;
    for (const ch of target) {
      if (!cur.children[ch]) { found = false; break; }
      cur = cur.children[ch];
      path.push(ch);
      steps.push({ trie: cloneTrie(root), highlight: [...path], searchWord: target, searchResult: null, message: `Search "${target}" — traversing "${ch}"` });
    }
    if (!found) path.push('?');
    steps.push({ trie: cloneTrie(root), highlight: [...path], searchWord: target, searchResult: 'not-found', message: `Search "${target}" — NOT FOUND (no path for 'e' after 'ap')`, done: true });
  }

  return steps;
}

const STEPS = buildTrieSteps();

// ─── SVG Trie renderer ────────────────────────────────────────────────────────
function layoutTrieNode(node, depth = 0, counter = { v: 0 }) {
  const children = Object.entries(node.children).map(([ch, child]) => ({
    ch,
    subtree: layoutTrieNode(child, depth + 1, counter),
  }));
  const x = counter.v++;
  return { ...node, x, depth, children };
}

function collectTrieNodes(node, nodes = [], edges = []) {
  nodes.push(node);
  for (const { ch, subtree } of node.children) {
    edges.push({ parent: node, child: subtree, ch });
    collectTrieNodes(subtree, nodes, edges);
  }
  return { nodes, edges };
}

function TrieSVG({ trie, highlight }) {
  const laid = layoutTrieNode(trie);
  const { nodes, edges } = collectTrieNodes(laid);
  const xs = nodes.map(n => n.x);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const W = Math.max((maxX - minX + 1) * 44 + 40, 300);
  const maxDepth = Math.max(...nodes.map(n => n.depth));
  const H = (maxDepth + 1) * 58 + 30;
  const px = n => (n.x - minX) * 44 + 20;
  const py = n => n.depth * 58 + 24;

  // Build highlight path chars
  const hlSet = new Set(highlight);

  return (
    <svg width={W} height={H} className="overflow-visible">
      {edges.map(({ parent, child, ch }, i) => {
        const isHL = highlight.length > 0 && highlight[child.depth - 1] === ch;
        return (
          <g key={i}>
            <line x1={px(parent)} y1={py(parent)} x2={px(child)} y2={py(child)}
              stroke={isHL ? '#f59e0b' : '#6b7280'} strokeWidth={isHL ? 2.5 : 1.5} />
            <text x={(px(parent) + px(child)) / 2 + 7} y={(py(parent) + py(child)) / 2}
              fontSize="11" fontWeight="bold" fill={isHL ? '#d97706' : '#9ca3af'} textAnchor="middle">{ch}</text>
          </g>
        );
      })}
      {nodes.map((n, i) => {
        const isHL = n.depth > 0 && highlight[n.depth - 1] === n.char;
        const fill = isHL ? '#f59e0b' : n.depth === 0 ? '#6b7280' : '#3b82f6';
        const r = 16;
        return (
          <g key={i} transform={`translate(${px(n)},${py(n)})`}>
            <circle r={r} fill={fill} stroke={n.isEnd ? '#fff' : 'transparent'} strokeWidth={n.isEnd ? 3 : 0} />
            {n.isEnd && <circle r={r + 4} fill="none" stroke={isHL ? '#fbbf24' : '#60a5fa'} strokeWidth="2" strokeDasharray="3 2" />}
            <text textAnchor="middle" dy="4" fontSize="11" fontWeight="bold" fill="white">
              {n.depth === 0 ? 'root' : n.char}
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
    <TheorySection title="What is a Trie?">
      <p>A Trie (prefix tree or digital tree) is a tree data structure used to store strings where keys are usually characters. Each node represents a single character, and paths from root to marked nodes represent stored words.</p>
      <p>Unlike a hash table, a trie supports prefix queries natively and avoids hash collisions entirely.</p>
    </TheorySection>
    <TheorySection title="Key Operations">
      <ul className="list-disc pl-4 space-y-1">
        <li><strong>Insert:</strong> Walk down (creating nodes), mark last as end-of-word</li>
        <li><strong>Search:</strong> Walk down; true only if path exists AND last node is end-of-word</li>
        <li><strong>StartsWith:</strong> Walk down; true if path exists regardless of end mark</li>
        <li><strong>Delete:</strong> Unmark end node; prune dead branches</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Insert', 'O(L)', 'O(L)'],
      ['Search', 'O(L)', 'O(1)'],
      ['Space', '-', 'O(ALPHABET × N × L)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `struct TrieNode {
    TrieNode* ch[26]{};
    bool isEnd = false;
};
struct Trie {
    TrieNode* root = new TrieNode();
    void insert(string w){
        auto* cur = root;
        for(char c : w){ int i=c-'a'; if(!cur->ch[i]) cur->ch[i]=new TrieNode(); cur=cur->ch[i]; }
        cur->isEnd = true;
    }
    bool search(string w){
        auto* cur = root;
        for(char c : w){ int i=c-'a'; if(!cur->ch[i]) return false; cur=cur->ch[i]; }
        return cur->isEnd;
    }
    bool startsWith(string p){
        auto* cur = root;
        for(char c : p){ int i=c-'a'; if(!cur->ch[i]) return false; cur=cur->ch[i]; }
        return true;
    }
};`,
    'Python': `class TrieNode:
    def __init__(self): self.ch = {}; self.is_end = False

class Trie:
    def __init__(self): self.root = TrieNode()
    def insert(self, w):
        cur = self.root
        for c in w:
            if c not in cur.ch: cur.ch[c] = TrieNode()
            cur = cur.ch[c]
        cur.is_end = True
    def search(self, w):
        cur = self.root
        for c in w:
            if c not in cur.ch: return False
            cur = cur.ch[c]
        return cur.is_end
    def starts_with(self, p):
        cur = self.root
        for c in p:
            if c not in cur.ch: return False
            cur = cur.ch[c]
        return True`,
    'JavaScript': `class TrieNode { constructor(){ this.ch={}; this.isEnd=false; } }
class Trie {
  constructor(){ this.root = new TrieNode(); }
  insert(w){ let cur=this.root; for(const c of w){ if(!cur.ch[c]) cur.ch[c]=new TrieNode(); cur=cur.ch[c]; } cur.isEnd=true; }
  search(w){ let cur=this.root; for(const c of w){ if(!cur.ch[c]) return false; cur=cur.ch[c]; } return cur.isEnd; }
  startsWith(p){ let cur=this.root; for(const c of p){ if(!cur.ch[c]) return false; cur=cur.ch[c]; } return true; }
}`,
    'Java': `class Trie {
    private TrieNode root = new TrieNode();
    static class TrieNode { TrieNode[] ch = new TrieNode[26]; boolean isEnd; }
    public void insert(String w){
        TrieNode cur = root;
        for(char c : w.toCharArray()){ int i=c-'a'; if(cur.ch[i]==null) cur.ch[i]=new TrieNode(); cur=cur.ch[i]; }
        cur.isEnd = true;
    }
    public boolean search(String w){
        TrieNode cur = root;
        for(char c : w.toCharArray()){ int i=c-'a'; if(cur.ch[i]==null) return false; cur=cur.ch[i]; }
        return cur.isEnd;
    }
}`,
  }} />
);

export default function Trie() {
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

  const resultColor = step.searchResult === 'found' ? 'text-emerald-600 dark:text-emerald-400' : step.searchResult === 'not-found' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400';

  return (
    <AlgorithmPageShell
      title="Trie (Prefix Tree)"
      description="Character-keyed tree for efficient string insert, search and prefix queries"
      category="Trees"
      difficulty="Medium"
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
      stats={{ step: `${currentStep + 1}/${STEPS.length}`, searching: step.searchWord || '-' }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(L) search where L = word length, independent of number of words',
        'Prefix queries are natural and fast',
        'No hash collisions',
        'Can enumerate all words with a given prefix',
      ]}
      disadvantages={[
        'High memory usage for large alphabets',
        'Slower than hash map for exact lookups',
        'Not cache-friendly due to pointer chasing',
      ]}
      applications={['Autocomplete / search suggestions', 'Spell checkers', 'IP routing tables', 'Word games (Boggle, Scrabble AI)']}
      interviewTips={[
        'Always ask whether input is lowercase only — determines node array size',
        'For space optimization mention compressed trie (Patricia tree)',
        'Trie vs HashMap: use trie when prefix queries matter',
        'Common LC patterns: word search II, autocomplete, replace words',
      ]}
      relatedAlgos={[
        { title: 'AVL Tree', route: '/avl-tree' },
        { title: 'Segment Tree', route: '/segment-tree' },
      ]}
      practiceProblems={[
        { name: 'Implement Trie (Prefix Tree)', difficulty: 'Medium', url: 'https://leetcode.com/problems/implement-trie-prefix-tree/' },
        { name: 'Word Search II', difficulty: 'Hard', url: 'https://leetcode.com/problems/word-search-ii/' },
        { name: 'Replace Words', difficulty: 'Medium', url: 'https://leetcode.com/problems/replace-words/' },
        { name: 'Search Suggestions System', difficulty: 'Medium', url: 'https://leetcode.com/problems/search-suggestions-system/' },
      ]}
    >
      <div className="flex flex-col items-center gap-3 min-h-64 overflow-x-auto">
        {step.searchWord && (
          <div className={`px-4 py-2 rounded-xl border font-semibold text-sm ${resultColor} ${step.searchResult === 'found' ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700' : step.searchResult === 'not-found' ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-700' : 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700'}`}>
            Searching: "{step.searchWord}" {step.searchResult === 'found' ? '— FOUND' : step.searchResult === 'not-found' ? '— NOT FOUND' : '...'}
          </div>
        )}
        <div className="overflow-x-auto w-full flex justify-center">
          <TrieSVG trie={step.trie} highlight={step.highlight} />
        </div>
        <div className="flex gap-4 text-xs mt-1 flex-wrap justify-center">
          {[['bg-blue-500', 'Node'], ['bg-amber-500', 'Highlighted path'], ['text-blue-400 border border-blue-400 rounded-full', 'End-of-word (dashed ring)']].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full ${c} inline-block`} />{l}
            </span>
          ))}
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
