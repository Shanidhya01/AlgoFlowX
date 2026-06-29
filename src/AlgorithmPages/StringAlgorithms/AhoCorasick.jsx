import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// Build Aho-Corasick trie + failure links
function buildAC(patterns) {
  const trie = [{ children: {}, fail: 0, output: [] }];
  // Insert patterns
  for (const pat of patterns) {
    let cur = 0;
    for (const c of pat) {
      if (!(c in trie[cur].children)) {
        trie.push({ children: {}, fail: 0, output: [] });
        trie[cur].children[c] = trie.length - 1;
      }
      cur = trie[cur].children[c];
    }
    trie[cur].output.push(pat);
  }
  // BFS to build failure links
  const queue = [];
  for (const c in trie[0].children) {
    const child = trie[0].children[c];
    trie[child].fail = 0;
    queue.push(child);
  }
  while (queue.length) {
    const u = queue.shift();
    for (const c in trie[u].children) {
      const v = trie[u].children[c];
      let f = trie[u].fail;
      while (f !== 0 && !(c in trie[f].children)) f = trie[f].fail;
      trie[v].fail = (trie[f].children[c] && trie[f].children[c] !== v) ? trie[f].children[c] : 0;
      trie[v].output = [...trie[v].output, ...trie[trie[v].fail].output];
      queue.push(v);
    }
  }
  return trie;
}

function generateSteps(text, patterns) {
  const steps = [];
  const trie = buildAC(patterns);
  const matches = [];
  let state = 0;

  steps.push({ text, patterns, trie, state: 0, i: -1, matches: [], phase: 'built', message: `Trie built with ${trie.length} nodes and failure links computed. Starting search on "${text}".` });

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    let prevState = state;
    while (state !== 0 && !(c in trie[state].children)) state = trie[state].fail;
    state = trie[state].children[c] ?? 0;
    const found = trie[state].output;
    if (found.length > 0) {
      found.forEach(pat => matches.push({ pattern: pat, endIdx: i, startIdx: i - pat.length + 1 }));
      steps.push({ text, patterns, trie, state, i, matches: [...matches], phase: 'match', found, message: `text[${i}]='${c}': state ${prevState} → ${state}. Match(es) found: ${found.join(', ')}!` });
    } else {
      steps.push({ text, patterns, trie, state, i, matches: [...matches], phase: 'search', message: `text[${i}]='${c}': state ${prevState} → ${state}` });
    }
  }

  steps.push({ text, patterns, trie, state: 0, i: text.length, matches: [...matches], done: true, message: `Done! Found ${matches.length} match(es): ${matches.map(m => `"${m.pattern}" at ${m.startIdx}`).join(', ') || 'none'}` });
  return steps;
}

const PATTERNS = ['he', 'she', 'his', 'hers'];
const TEXT = 'ahishers';

const theory = (
  <div>
    <TheorySection title="Aho-Corasick Overview">
      <p>Aho-Corasick extends a KMP-like failure function to a Trie of multiple patterns. Instead of searching each pattern separately in O(n×m), it processes all patterns simultaneously in O(n + m + z) where z is the number of matches.</p>
      <p className="mt-2"><strong>Build phase:</strong> Construct a trie, then BFS to compute failure links (like KMP failure function) and output links (dictionary links) that propagate matches from fail chain.</p>
    </TheorySection>
    <TheorySection title="Failure Links">
      <p>The failure link of node v points to the longest proper suffix of the path from root to v that is also a prefix of some pattern. During mismatch, we follow failure links instead of restarting from root.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Build trie', 'O(Σm)', 'O(Σm × σ)'],
      ['Build failures', 'O(Σm × σ)', 'O(Σm)'],
      ['Search', 'O(n + z)', 'O(1) per step'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `struct AhoCorasick {
    vector<array<int,26>> go;
    vector<int> fail, out;
    int newNode() { go.push_back({}); go.back().fill(-1); fail.push_back(0); out.push_back(0); return go.size()-1; }
    AhoCorasick() { newNode(); }

    void addPattern(string& s, int id) {
        int cur = 0;
        for (char c : s) {
            if (go[cur][c-'a'] == -1) go[cur][c-'a'] = newNode();
            cur = go[cur][c-'a'];
        }
        out[cur] |= (1 << id);
    }
    void build() {
        queue<int> q;
        for (int c = 0; c < 26; c++) {
            if (go[0][c] == -1) go[0][c] = 0;
            else { fail[go[0][c]] = 0; q.push(go[0][c]); }
        }
        while (!q.empty()) {
            int u = q.front(); q.pop();
            out[u] |= out[fail[u]];
            for (int c = 0; c < 26; c++) {
                if (go[u][c] == -1) go[u][c] = go[fail[u]][c];
                else { fail[go[u][c]] = go[fail[u]][c]; q.push(go[u][c]); }
            }
        }
    }
};`,
    'Python': `from collections import deque

def build_aho_corasick(patterns):
    trie = [{'ch': {}, 'fail': 0, 'out': []}]
    for pat in patterns:
        cur = 0
        for c in pat:
            if c not in trie[cur]['ch']:
                trie.append({'ch': {}, 'fail': 0, 'out': []})
                trie[cur]['ch'][c] = len(trie) - 1
            cur = trie[cur]['ch'][c]
        trie[cur]['out'].append(pat)

    q = deque()
    for child in trie[0]['ch'].values():
        trie[child]['fail'] = 0
        q.append(child)
    while q:
        u = q.popleft()
        for c, v in trie[u]['ch'].items():
            f = trie[u]['fail']
            while f and c not in trie[f]['ch']: f = trie[f]['fail']
            trie[v]['fail'] = trie[f]['ch'].get(c, 0) if trie[f]['ch'].get(c, 0) != v else 0
            trie[v]['out'] += trie[trie[v]['fail']]['out']
            q.append(v)
    return trie`,
    'JavaScript': `function buildAC(patterns) {
    const trie = [{ ch: {}, fail: 0, out: [] }];
    for (const pat of patterns) {
        let cur = 0;
        for (const c of pat) {
            if (!(c in trie[cur].ch)) { trie.push({ ch: {}, fail: 0, out: [] }); trie[cur].ch[c] = trie.length - 1; }
            cur = trie[cur].ch[c];
        }
        trie[cur].out.push(pat);
    }
    const queue = [];
    for (const c in trie[0].ch) { trie[trie[0].ch[c]].fail = 0; queue.push(trie[0].ch[c]); }
    while (queue.length) {
        const u = queue.shift();
        for (const c in trie[u].ch) {
            const v = trie[u].ch[c];
            let f = trie[u].fail;
            while (f && !(c in trie[f].ch)) f = trie[f].fail;
            trie[v].fail = (trie[f].ch[c] && trie[f].ch[c] !== v) ? trie[f].ch[c] : 0;
            trie[v].out = [...trie[v].out, ...trie[trie[v].fail].out];
            queue.push(v);
        }
    }
    return trie;
}`,
  }} />
);

export default function AhoCorasick() {
  const [steps, setSteps] = useState(() => generateSteps(TEXT, PATTERNS));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(700);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleRandomize = useCallback(() => {
    const opts = [
      { text: 'ahishers', patterns: ['he', 'she', 'his', 'hers'] },
      { text: 'GEEKSFORGEEKS', patterns: ['GEEK', 'FOR', 'GEEKS'] },
      { text: 'abcabc', patterns: ['ab', 'bc', 'abc'] },
    ];
    const { text, patterns } = opts[Math.floor(Math.random() * opts.length)];
    setSteps(generateSteps(text, patterns));
    setCurrentStep(0); setIsRunning(false);
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

  const { text, patterns, trie, state: curState, i: curI, matches } = step;

  // Build simple trie layout for display
  function renderTrie() {
    if (!trie) return null;
    // BFS layout
    const levels = [];
    const queue = [{ id: 0, depth: 0, label: 'root', parentId: null, edgeChar: '' }];
    const nodeDepth = {};
    nodeDepth[0] = 0;
    while (queue.length) {
      const { id, depth } = queue.shift();
      if (!levels[depth]) levels[depth] = [];
      levels[depth].push(id);
      for (const [c, child] of Object.entries(trie[id].children || {})) {
        nodeDepth[child] = depth + 1;
        queue.push({ id: child, depth: depth + 1, edgeChar: c });
      }
    }
    return (
      <div className="overflow-x-auto">
        <div className="space-y-4 min-w-max p-2">
          {levels.map((levelNodes, depth) => (
            <div key={depth} className="flex gap-4 justify-center items-center">
              {levelNodes.map(nodeId => {
                const node = trie[nodeId];
                const isActive = nodeId === curState;
                const hasOutput = node && node.output && node.output.length > 0;
                return (
                  <div key={nodeId} className={`relative flex flex-col items-center gap-1`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isActive ? 'bg-amber-300 dark:bg-amber-700 border-amber-500 text-amber-900 dark:text-amber-100 scale-125 shadow-lg' :
                      hasOutput ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-300 dark:ring-emerald-700' :
                      nodeId === 0 ? 'bg-violet-100 dark:bg-violet-950 border-violet-400 text-violet-700 dark:text-violet-300' :
                      'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    }`}>
                      {nodeId}
                    </div>
                    {hasOutput && (
                      <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold text-center max-w-12 leading-tight">
                        {node.output.join(',')}
                      </div>
                    )}
                    {/* Failure link indicator */}
                    {nodeId !== 0 && node && node.fail !== undefined && (
                      <div className="text-[8px] text-red-400 font-mono">f→{node.fail}</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <AlgorithmPageShell
      title="Aho-Corasick Algorithm"
      description="Multi-pattern string matching with trie + failure links — O(n + m + z)"
      category="String Algorithms"
      difficulty="Hard"
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
      stats={{ matches: matches?.length || 0, currentState: curState ?? 0, patterns: patterns?.length || 0 }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={['Searches all patterns simultaneously', 'O(n + m + z) — independent of number of patterns', 'Used in real intrusion detection systems', 'Handles overlapping patterns naturally']}
      disadvantages={['Complex build phase', 'High memory usage O(m × σ) for large alphabets', 'Overkill for single-pattern search', 'Trie can be large for many patterns']}
      applications={['Antivirus / malware signature scanning', 'DNS firewall filtering', 'Network intrusion detection (Snort)', 'Bioinformatics multi-genome search']}
      interviewTips={['Explain that it is KMP generalized to a trie', 'Failure links are the key insight — same as KMP fail array', 'Output/dictionary links propagate suffix matches', 'Building failure links is done in BFS order']}
      relatedAlgos={['KMP Pattern Matcher', 'Rabin-Karp Algorithm', 'Z Algorithm', 'Trie']}
      practiceProblems={[
        { name: 'Multi Pattern Search', difficulty: 'Hard' },
        { name: 'Word Search II (Trie + DFS)', difficulty: 'Hard' },
        { name: 'Stream of Characters', difficulty: 'Hard' },
      ]}
    >
      <div className="space-y-5">
        {/* Patterns */}
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Patterns</p>
          <div className="flex flex-wrap gap-2">
            {patterns?.map(p => (
              <span key={p} className="px-3 py-1 rounded-lg bg-violet-100 dark:bg-violet-950 border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 text-sm font-bold">"{p}"</span>
            ))}
          </div>
        </div>

        {/* Text scanning */}
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Text</p>
          <div className="flex gap-1 flex-wrap">
            {text && text.split('').map((c, idx) => {
              const isCurrent = idx === curI;
              const inMatch = matches?.some(m => idx >= m.startIdx && idx <= m.endIdx);
              return (
                <div key={idx} className={`w-8 h-10 flex flex-col items-center justify-center rounded-lg font-bold text-sm border-2 transition-all duration-150 ${
                  isCurrent && step.phase === 'match' ? 'bg-emerald-200 dark:bg-emerald-900 border-emerald-500 text-emerald-800 dark:text-emerald-200 scale-110' :
                  isCurrent ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 text-amber-700 dark:text-amber-300 scale-110' :
                  inMatch && step.done ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-600 dark:text-emerald-400' :
                  'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <span>{c}</span>
                  <span className="text-[8px] text-gray-400">{idx}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trie */}
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Trie (active state highlighted, double-border = output node, f→n = fail link)</p>
          {renderTrie()}
        </div>

        {/* Matches */}
        {matches?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase">Matches:</span>
            {matches.map((m, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold">"{m.pattern}" @{m.startIdx}</span>
            ))}
          </div>
        )}
      </div>
    </AlgorithmPageShell>
  );
}
