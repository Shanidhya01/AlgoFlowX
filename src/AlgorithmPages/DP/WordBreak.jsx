import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const DEFAULT_S = 'leetcode';
const DEFAULT_DICT = ['leet', 'code', 'lee', 't'];

function generateWordBreakSteps(s, dict) {
  const steps = [];
  const n = s.length;
  const wordSet = new Set(dict);
  const dp = new Array(n + 1).fill(false);
  const wordUsed = new Array(n + 1).fill('');
  dp[0] = true;

  steps.push({
    dp: [...dp], s, dict, phase: 'init', i: -1, j: -1, word: '',
    message: `dp[0]=true (empty string). Check if "${s}" can be segmented using [${dict.map(w => `"${w}"`).join(', ')}]`
  });

  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      const sub = s.slice(j, i);
      const inDict = wordSet.has(sub);
      steps.push({
        dp: [...dp], s, dict, phase: 'check', i, j, word: sub,
        message: `dp[${i}]: check if dp[${j}]=${dp[j]} && "${sub}" in dict → ${dp[j] && inDict ? 'YES!' : 'no'}`
      });
      if (dp[j] && inDict) {
        dp[i] = true;
        wordUsed[i] = sub;
        steps.push({
          dp: [...dp], s, dict, phase: 'found', i, j, word: sub,
          message: `Set dp[${i}]=true! s[${j}..${i-1}]="${sub}" is in dictionary and dp[${j}] is reachable.`
        });
        break;
      }
    }
  }

  // Reconstruct segmentation
  const segments = [];
  if (dp[n]) {
    let pos = n;
    while (pos > 0 && wordUsed[pos]) {
      segments.unshift(wordUsed[pos]);
      pos -= wordUsed[pos].length;
    }
  }

  steps.push({
    dp: [...dp], s, dict, phase: 'done', i: -1, j: -1, word: '', segments,
    message: dp[n]
      ? `Can break! "${s}" → ${segments.map(w => `"${w}"`).join(' + ')}`
      : `Cannot break "${s}" using given dictionary.`,
    done: true
  });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="Word Break Problem">
      <p>Given a string <code>s</code> and a dictionary, determine if <code>s</code> can be segmented into a space-separated sequence of dictionary words.</p>
      <p><code>dp[i]</code> = true if <code>s[0..i-1]</code> can be segmented. For each position i, try all j &lt; i:</p>
      <p className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-xs">dp[i] = true if dp[j] && s[j..i-1] ∈ dict, for any j</p>
      <p>Base case: <code>dp[0] = true</code> (empty string is always valid).</p>
    </TheorySection>
    <TheorySection title="Reconstruction">
      <p>To find the actual segmentation, we store which word was used to reach each position. We then backtrack from position n to 0 following the <code>wordUsed[]</code> array.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Time', 'O(n² × m)', 'O(n)'],
      ['Space', 'O(n + dict)', 'O(n)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `bool wordBreak(string s, vector<string>& wordDict) {
    unordered_set<string> dict(wordDict.begin(), wordDict.end());
    int n = s.size();
    vector<bool> dp(n + 1, false);
    dp[0] = true;
    for (int i = 1; i <= n; i++)
        for (int j = 0; j < i; j++)
            if (dp[j] && dict.count(s.substr(j, i - j))) {
                dp[i] = true; break;
            }
    return dp[n];
}`,
    'Python': `def wordBreak(s, wordDict):
    word_set = set(wordDict)
    n = len(s)
    dp = [False] * (n + 1)
    dp[0] = True
    for i in range(1, n + 1):
        for j in range(i):
            if dp[j] and s[j:i] in word_set:
                dp[i] = True
                break
    return dp[n]`,
    'JavaScript': `function wordBreak(s, wordDict) {
    const dict = new Set(wordDict);
    const n = s.length;
    const dp = new Array(n + 1).fill(false);
    dp[0] = true;
    for (let i = 1; i <= n; i++)
        for (let j = 0; j < i; j++)
            if (dp[j] && dict.has(s.slice(j, i))) {
                dp[i] = true; break;
            }
    return dp[n];
}`,
    'Java': `public boolean wordBreak(String s, List<String> wordDict) {
    Set<String> dict = new HashSet<>(wordDict);
    int n = s.length();
    boolean[] dp = new boolean[n + 1];
    dp[0] = true;
    for (int i = 1; i <= n; i++)
        for (int j = 0; j < i; j++)
            if (dp[j] && dict.contains(s.substring(j, i))) {
                dp[i] = true; break;
            }
    return dp[n];
}`,
  }} />
);

export default function WordBreakPage() {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState('');
  const timerRef = useRef(null);

  const initSteps = useCallback((s, dict) => {
    const st = generateWordBreakSteps(s, dict);
    setSteps(st); setCurrentStep(0); setIsRunning(false);
  }, []);

  useEffect(() => { initSteps(DEFAULT_S, DEFAULT_DICT); }, [initSteps]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) { setIsRunning(false); return prev; }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, speed, steps.length]);

  const handleRandomize = useCallback(() => {
    const examples = [
      { s: 'applepenapple', dict: ['apple', 'pen'] },
      { s: 'catsandog', dict: ['cats', 'dog', 'sand', 'and', 'cat'] },
      { s: 'cars', dict: ['car', 'ca', 'rs'] },
    ];
    const pick = examples[Math.floor(Math.random() * examples.length)];
    initSteps(pick.s, pick.dict);
    setCustomInput(''); setInputError('');
  }, [initSteps]);

  const handleCustomInput = useCallback((val) => {
    setCustomInput(val);
    const parts = val.split(';');
    if (parts.length !== 2) { setInputError('Format: string;word1,word2,...'); return; }
    const s = parts[0].trim().toLowerCase();
    const dict = parts[1].split(',').map(w => w.trim()).filter(Boolean);
    if (!s || dict.length === 0 || s.length > 15) { setInputError('String max 15 chars; at least one dict word'); return; }
    setInputError('');
    initSteps(s, dict);
  }, [initSteps]);

  const step = steps[currentStep] || {};
  const s = step.s || DEFAULT_S;
  const dp = step.dp || new Array(s.length + 1).fill(false);
  const dict = step.dict || DEFAULT_DICT;

  return (
    <AlgorithmPageShell
      title="Word Break"
      description="Determine if a string can be segmented into dictionary words using 1D boolean DP"
      category="Dynamic Programming"
      difficulty="Medium"
      steps={steps} currentStep={currentStep} isRunning={isRunning}
      onPlay={() => setIsRunning(true)} onPause={() => setIsRunning(false)}
      onReset={() => { setIsRunning(false); setCurrentStep(0); }}
      onStepForward={() => setCurrentStep(p => Math.min(p + 1, steps.length - 1))}
      onStepBack={() => setCurrentStep(p => Math.max(p - 1, 0))}
      speed={speed} onSpeedChange={setSpeed} onRandomize={handleRandomize}
      customInput={customInput} onCustomInput={handleCustomInput} inputError={inputError}
      inputPlaceholder="leetcode;leet,code" inputLabel="string;dict words" showInput={true}
      stats={{ length: s.length, canBreak: dp[s.length] ? 'Yes' : 'No', wordsUsed: step.segments?.length || 0 }}
      message={step.message || ''} done={step.done || false}
      theory={theory} code={code}
      advantages={[
        'Clear boolean DP formulation — easy to understand',
        'Handles all edge cases including overlapping words',
        'Can be extended to find all valid segmentations',
      ]}
      disadvantages={[
        'O(n²) inner loop — hash-set lookup helps but worst case still quadratic',
        'Finding all segmentations requires backtracking (exponential)',
        'Trie can speed up dictionary lookups',
      ]}
      applications={[
        'Natural language processing tokenization',
        'Compiler lexical analysis',
        'URL parsing and segmentation',
        'Text prediction and autocorrect systems',
      ]}
      interviewTips={[
        'Key insight: dp[0]=true (empty prefix always valid)',
        'Word Break II (all segmentations) uses DFS + memoization',
        'Trie + DP reduces time to O(n × maxWordLen)',
        'If asked for count of ways — use dp[i] += dp[j] instead of boolean',
      ]}
      relatedAlgos={[
        { title: 'Coin Change', route: '/dp/coin-change' },
        { title: 'Partition Equal Subset', route: '/dp/partition-subset' },
      ]}
      practiceProblems={[
        { name: 'Word Break', difficulty: 'Medium', url: 'https://leetcode.com/problems/word-break/' },
        { name: 'Word Break II', difficulty: 'Hard', url: 'https://leetcode.com/problems/word-break-ii/' },
        { name: 'Concatenated Words', difficulty: 'Hard', url: 'https://leetcode.com/problems/concatenated-words/' },
      ]}
    >
      {/* Dictionary */}
      <div className="flex flex-wrap gap-1.5 mb-4 justify-center">
        <span className="text-xs text-gray-400 mr-1 self-center">Dict:</span>
        {dict.map((w, i) => (
          <span key={i} className={`px-2 py-1 rounded-lg text-xs font-semibold border ${
            step.word === w && (step.phase === 'found')
              ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-400 text-emerald-700 dark:text-emerald-300'
              : step.word === w
              ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-400 text-amber-700 dark:text-amber-300'
              : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
          }`}>{w}</span>
        ))}
      </div>

      {/* String with current window highlighted */}
      <div className="flex justify-center gap-0.5 mb-3">
        {s.split('').map((c, idx) => {
          const inWindow = step.j !== -1 && step.i !== -1 && idx >= step.j && idx < step.i;
          return (
            <div key={idx} className={`w-8 h-8 border-2 flex items-center justify-center text-sm font-bold rounded-lg transition-all duration-200 ${
              inWindow && step.phase === 'found'
                ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-400 text-emerald-700 dark:text-emerald-200'
                : inWindow
                ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-400 text-amber-700 dark:text-amber-200'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              {c}
            </div>
          );
        })}
      </div>

      {/* DP boolean array */}
      <div className="flex justify-center gap-1 mb-4">
        {dp.map((val, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all duration-200 ${
              val
                ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600'
            }`}>
              {val ? 'T' : 'F'}
            </div>
            <span className="text-[9px] text-gray-400 mt-0.5">{idx}</span>
          </div>
        ))}
      </div>

      {/* Final segmentation */}
      {step.done && step.segments && step.segments.length > 0 && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Segmentation:</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {step.segments.map((seg, i) => (
              <React.Fragment key={i}>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold text-sm border border-emerald-300 dark:border-emerald-700">{seg}</span>
                {i < step.segments.length - 1 && <span className="text-gray-400 self-center">+</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
      {step.done && !dp[s.length] && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800 text-center text-red-700 dark:text-red-300 text-sm font-semibold">
          Cannot segment "{s}" with the given dictionary
        </div>
      )}
    </AlgorithmPageShell>
  );
}
