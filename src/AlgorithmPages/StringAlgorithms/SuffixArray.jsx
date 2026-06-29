import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function buildSuffixArray(s) {
  const n = s.length;
  const suffixes = Array.from({ length: n }, (_, i) => ({ idx: i, suffix: s.slice(i) }));
  const steps = [];

  steps.push({ suffixes: suffixes.map(x => ({ ...x })), sorted: false, comparing: [-1, -1], lcp: [], message: `All ${n} suffixes of "${s}" listed. Now sorting lexicographically.` });

  // Simple insertion sort with steps for visualization
  const arr = [...suffixes];
  for (let i = 1; i < arr.length; i++) {
    let j = i;
    while (j > 0) {
      steps.push({ suffixes: arr.map(x => ({ ...x })), sorted: false, comparing: [j - 1, j], lcp: [], message: `Comparing suffix[${arr[j-1].idx}] "${arr[j-1].suffix}" vs suffix[${arr[j].idx}] "${arr[j].suffix}"` });
      if (arr[j].suffix < arr[j - 1].suffix) {
        [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]];
        steps.push({ suffixes: arr.map(x => ({ ...x })), sorted: false, comparing: [j - 1, j], swapped: true, lcp: [], message: `Swapped! "${arr[j].suffix}" comes before "${arr[j-1].suffix}"` });
        j--;
      } else {
        break;
      }
    }
  }

  // Compute LCP array
  const lcp = [0];
  for (let i = 1; i < arr.length; i++) {
    let k = 0;
    while (k < arr[i].suffix.length && k < arr[i - 1].suffix.length && arr[i].suffix[k] === arr[i - 1].suffix[k]) k++;
    lcp.push(k);
  }

  steps.push({ suffixes: arr.map(x => ({ ...x })), sorted: true, comparing: [-1, -1], lcp, done: true, message: `Sorted! Suffix array: [${arr.map(x => x.idx).join(', ')}]. LCP array computed.` });
  return steps;
}

const theory = (
  <div>
    <TheorySection title="What is a Suffix Array?">
      <p>A suffix array SA is a sorted array of all suffixes of a string. SA[i] = starting index of the i-th lexicographically smallest suffix. For "banana" the suffixes sorted are: a, ana, anana, banana, na, nana.</p>
      <p className="mt-2">The LCP (Longest Common Prefix) array stores the LCP between consecutive suffixes in the sorted order, enabling efficient string operations.</p>
    </TheorySection>
    <TheorySection title="Efficient Construction">
      <p>Naive O(n² log n) sorts all n suffixes each of length up to n. Prefix doubling (DC3/SA-IS) achieves O(n log n) or even O(n) by ranking suffixes by length-2^k prefixes and doubling k each round.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Naive sort', 'O(n² log n)', 'O(n)'],
      ['Prefix doubling', 'O(n log n)', 'O(n)'],
      ['SA-IS', 'O(n)', 'O(n)'],
      ['Pattern search', 'O(m log n)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `// O(n log^2 n) prefix doubling
vector<int> buildSA(string s) {
    int n = s.size();
    vector<int> sa(n), rank_(n), tmp(n);
    iota(sa.begin(), sa.end(), 0);
    for (int i = 0; i < n; i++) rank_[i] = s[i];

    for (int gap = 1; gap < n; gap <<= 1) {
        auto cmp = [&](int a, int b) {
            if (rank_[a] != rank_[b]) return rank_[a] < rank_[b];
            int ra = a + gap < n ? rank_[a + gap] : -1;
            int rb = b + gap < n ? rank_[b + gap] : -1;
            return ra < rb;
        };
        sort(sa.begin(), sa.end(), cmp);
        tmp[sa[0]] = 0;
        for (int i = 1; i < n; i++)
            tmp[sa[i]] = tmp[sa[i-1]] + (cmp(sa[i-1], sa[i]) ? 1 : 0);
        rank_ = tmp;
    }
    return sa;
}`,
    'Python': `def build_suffix_array(s):
    n = len(s)
    sa = sorted(range(n), key=lambda i: s[i:])
    return sa

def build_lcp(s, sa):
    n = len(s)
    rank = [0] * n
    for i, v in enumerate(sa): rank[v] = i
    lcp = [0] * n
    k = 0
    for i in range(n):
        if rank[i] == 0:
            k = 0
            continue
        j = sa[rank[i] - 1]
        while i + k < n and j + k < n and s[i+k] == s[j+k]:
            k += 1
        lcp[rank[i]] = k
        if k: k -= 1
    return lcp`,
    'JavaScript': `function buildSuffixArray(s) {
    const n = s.length;
    const sa = Array.from({length: n}, (_, i) => i);
    sa.sort((a, b) => s.slice(a) < s.slice(b) ? -1 : 1);
    return sa;
}

function buildLCP(s, sa) {
    const n = s.length, rank = new Array(n);
    sa.forEach((v, i) => rank[v] = i);
    const lcp = new Array(n).fill(0);
    let k = 0;
    for (let i = 0; i < n; i++) {
        if (rank[i] === 0) { k = 0; continue; }
        let j = sa[rank[i] - 1];
        while (i + k < n && j + k < n && s[i+k] === s[j+k]) k++;
        lcp[rank[i]] = k;
        if (k) k--;
    }
    return lcp;
}`,
  }} />
);

const PRESETS = ['banana', 'mississippi', 'abacaba', 'aabaa'];

export default function SuffixArray() {
  const [input, setInput] = useState('banana');
  const [inputVal, setInputVal] = useState('banana');
  const [inputError, setInputError] = useState('');
  const [steps, setSteps] = useState(() => buildSuffixArray('banana'));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleCustomInput = (val) => {
    setInputVal(val);
    const s = val.trim().toLowerCase().replace(/[^a-z]/g, '');
    if (!s) { setInputError('Enter a string'); return; }
    if (s.length > 12) { setInputError('Max 12 characters'); return; }
    setInputError('');
    setInput(s); setSteps(buildSuffixArray(s));
    setCurrentStep(0); setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const s = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    setInput(s); setInputVal(s);
    setSteps(buildSuffixArray(s)); setCurrentStep(0); setIsRunning(false);
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

  const { suffixes, sorted, comparing, lcp } = step;
  const [c1, c2] = comparing || [-1, -1];

  return (
    <AlgorithmPageShell
      title="Suffix Array"
      description="Sort all suffixes lexicographically + compute LCP array"
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
      customInput={inputVal}
      onCustomInput={handleCustomInput}
      inputError={inputError}
      inputPlaceholder="e.g. banana"
      inputLabel="Input String"
      stats={{ suffixes: input.length, sorted: sorted ? 'yes' : 'no' }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={['Enables O(m log n) pattern search', 'Space-efficient vs suffix trees', 'LCP array enables many string queries', 'Foundation for many string algorithms']}
      disadvantages={['Construction O(n log² n) or complex O(n)', 'LCP array needs extra computation', 'Less powerful than suffix trees alone']}
      applications={['Bioinformatics — genome search', 'Data compression (BWT)', 'String matching', 'Longest repeated substring', 'Number of distinct substrings']}
      interviewTips={['SA[i] is the starting index of i-th sorted suffix', 'LCP[i] = common prefix length between SA[i] and SA[i-1]', 'Pattern search via binary search on SA in O(m log n)', 'Mention DC3 / SA-IS for O(n) construction']}
      relatedAlgos={['Z Algorithm', 'KMP Pattern Matcher', 'Manacher\'s Algorithm', 'Suffix Tree']}
      practiceProblems={[
        { name: 'Longest Duplicate Substring', difficulty: 'Hard' },
        { name: 'Number of Distinct Substrings', difficulty: 'Hard' },
        { name: 'Longest Common Substring', difficulty: 'Medium' },
      ]}
    >
      <div className="space-y-4">
        {/* Suffix table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-xs text-gray-400 dark:text-gray-500 uppercase">
                <th className="text-left py-1 px-2 w-8">Rank</th>
                <th className="text-left py-1 px-2 w-12">SA[i]</th>
                <th className="text-left py-1 px-2">Suffix</th>
                {sorted && lcp?.length > 0 && <th className="text-left py-1 px-2 w-14">LCP</th>}
              </tr>
            </thead>
            <tbody>
              {suffixes?.map((sf, idx) => {
                const isComparing = idx === c1 || idx === c2;
                const isSwapped = step.swapped && isComparing;
                return (
                  <tr key={idx} className={`border-t border-gray-100 dark:border-gray-800 transition-all duration-200 ${
                    isSwapped ? 'bg-amber-50 dark:bg-amber-950/30' :
                    isComparing ? 'bg-blue-50 dark:bg-blue-950/30' :
                    sorted ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                  }`}>
                    <td className="py-1.5 px-2 text-gray-400 font-mono text-xs">{idx}</td>
                    <td className="py-1.5 px-2">
                      <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-xs ${
                        sorted ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300' :
                        isComparing ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>{sf.idx}</span>
                    </td>
                    <td className="py-1.5 px-2 font-mono">
                      <div className="flex gap-0.5 flex-wrap">
                        {sf.suffix.split('').map((c, ci) => (
                          <span key={ci} className={`inline-block w-5 h-5 text-center text-xs rounded ${
                            sorted && lcp?.[idx] > 0 && ci < lcp[idx]
                              ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>{c}</span>
                        ))}
                      </div>
                    </td>
                    {sorted && lcp?.length > 0 && (
                      <td className="py-1.5 px-2">
                        <span className={`px-1.5 py-0.5 rounded font-mono text-xs font-bold ${
                          lcp[idx] > 0 ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300' : 'text-gray-400'
                        }`}>{lcp[idx]}</span>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sorted && lcp?.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-3 h-3 rounded bg-teal-200 dark:bg-teal-900 inline-block" />
            Teal = shared LCP prefix with the row above
          </div>
        )}
      </div>
    </AlgorithmPageShell>
  );
}
