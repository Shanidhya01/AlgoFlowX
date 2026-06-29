import React, { useState, useEffect, useRef } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// ─── Step Generator ───────────────────────────────────────────────────────────

const CANDIDATES = [2, 3, 5, 7];
const TARGET = 8;

function generateSteps() {
  const steps = [];
  const found = [];

  steps.push({
    path: [],
    sum: 0,
    found: [],
    status: 'init',
    message: `Combination Sum: candidates=[${CANDIDATES}], target=${TARGET}. Find all combinations summing to ${TARGET}.`,
  });

  function backtrack(start, path, sum) {
    if (sum === TARGET) {
      found.push([...path]);
      steps.push({
        path: [...path],
        sum,
        found: found.map(f => [...f]),
        status: 'found',
        message: `Found: [${path.join(', ')}] = ${sum} ✓`,
      });
      return;
    }
    for (let i = start; i < CANDIDATES.length; i++) {
      const c = CANDIDATES[i];
      if (sum + c > TARGET) {
        steps.push({
          path: [...path, c],
          sum: sum + c,
          found: found.map(f => [...f]),
          status: 'prune',
          candidate: c,
          message: `Prune: [${[...path, c].join(', ')}] = ${sum + c} > ${TARGET}`,
        });
        break; // candidates are sorted, no point continuing
      }
      path.push(c);
      steps.push({
        path: [...path],
        sum: sum + c,
        found: found.map(f => [...f]),
        status: 'try',
        candidate: c,
        message: `Try: [${path.join(', ')}] = ${sum + c} (target=${TARGET})`,
      });
      backtrack(i, path, sum + c);
      path.pop();
      steps.push({
        path: [...path],
        sum,
        found: found.map(f => [...f]),
        status: 'backtrack',
        candidate: c,
        message: `Backtrack: remove ${c}, path=[${path.join(', ')}], sum=${sum}`,
      });
    }
  }

  backtrack(0, [], 0);

  steps.push({
    path: [],
    sum: 0,
    found: found.map(f => [...f]),
    status: 'done',
    message: `Done! Found ${found.length} combinations.`,
    done: true,
  });

  return steps;
}

// ─── Theory & Code ────────────────────────────────────────────────────────────

const theory = (
  <div>
    <TheorySection title="Combination Sum">
      <p>Given a set of candidate numbers (each usable unlimited times) and a target, find all unique combinations that sum to the target.</p>
      <p><strong>Backtracking:</strong> At each step, try adding each candidate (from current index onwards to avoid duplicates). If sum equals target, record it. If sum exceeds target, prune. Otherwise recurse.</p>
    </TheorySection>
    <TheorySection title="Key Observations">
      <ul className="list-disc pl-4 space-y-1">
        <li>Candidates can be reused — start recursive call at same index</li>
        <li>Sort candidates to enable early pruning</li>
        <li>Number of combinations can be exponential</li>
        <li>Variant (Combination Sum II): each candidate used once — start at i+1</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Time', 'O(N^(T/M))', 'O(T/M)'],
      ['Space', '—', 'O(T/M)'],
    ]} />
    <p className="text-xs text-gray-400 mt-2">N = candidates, T = target, M = smallest candidate</p>
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `#include <vector>
#include <algorithm>
using namespace std;

void backtrack(vector<int>& cands, int target,
               int start, vector<int>& path,
               vector<vector<int>>& res) {
    if (target == 0) { res.push_back(path); return; }
    for (int i = start; i < cands.size(); i++) {
        if (cands[i] > target) break; // sorted: prune
        path.push_back(cands[i]);
        backtrack(cands, target - cands[i], i, path, res);
        path.pop_back();
    }
}

vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
    sort(candidates.begin(), candidates.end());
    vector<vector<int>> res;
    vector<int> path;
    backtrack(candidates, target, 0, path, res);
    return res;
}`,
    'Python': `def combination_sum(candidates, target):
    candidates.sort()
    result = []

    def backtrack(start, path, remaining):
        if remaining == 0:
            result.append(list(path))
            return
        for i in range(start, len(candidates)):
            c = candidates[i]
            if c > remaining:
                break
            path.append(c)
            backtrack(i, path, remaining - c)
            path.pop()

    backtrack(0, [], target)
    return result`,
    'JavaScript': `function combinationSum(candidates, target) {
  candidates.sort((a, b) => a - b);
  const result = [];

  function backtrack(start, path, remaining) {
    if (remaining === 0) { result.push([...path]); return; }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) break;
      path.push(candidates[i]);
      backtrack(i, path, remaining - candidates[i]);
      path.pop();
    }
  }

  backtrack(0, [], target);
  return result;
}`,
    'Java': `import java.util.*;

public class CombinationSum {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        Arrays.sort(candidates);
        List<List<Integer>> res = new ArrayList<>();
        backtrack(candidates, target, 0, new ArrayList<>(), res);
        return res;
    }

    void backtrack(int[] cands, int rem, int start,
                   List<Integer> path, List<List<Integer>> res) {
        if (rem == 0) { res.add(new ArrayList<>(path)); return; }
        for (int i = start; i < cands.length; i++) {
            if (cands[i] > rem) break;
            path.add(cands[i]);
            backtrack(cands, rem - cands[i], i, path, res);
            path.remove(path.size() - 1);
        }
    }
}`,
  }} />
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function CombinationSum() {
  const [steps] = useState(() => generateSteps());
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

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

  const statusColor = step.status === 'found' ? 'text-emerald-400' :
    step.status === 'prune' ? 'text-red-400' :
    step.status === 'backtrack' ? 'text-amber-400' :
    step.status === 'done' ? 'text-emerald-400' : 'text-indigo-400';

  const pathGlow = step.status === 'found'
    ? 'shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-500'
    : step.status === 'prune'
    ? 'shadow-lg shadow-red-500/40 ring-2 ring-red-500'
    : 'ring-1 ring-indigo-600/40';

  return (
    <AlgorithmPageShell
      title="Combination Sum"
      description="Find all combinations from [2,3,5,7] that sum to 8 using backtracking with pruning"
      category="Backtracking"
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
      showInput={false}
      stats={{
        current: `[${(step.path || []).join(',')}]`,
        sum: step.sum || 0,
        found: (step.found || []).length,
        target: TARGET,
      }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Pruning avoids exploring over-target branches',
        'Sorting enables early break out of loops',
        'Finds all solutions, not just one',
        'Clean recursive structure maps directly to code',
      ]}
      disadvantages={[
        'Exponential number of solutions possible',
        'Stack depth can reach T/minCandidate',
        'Backtracking overhead for large search spaces',
      ]}
      applications={[
        'Coin change (count ways)',
        'Word break problem',
        'Partition equal subset sum',
        'Knapsack problem variants',
      ]}
      interviewTips={[
        'LeetCode 39 (Combination Sum) vs 40 (unique candidates, each used once)',
        'Sort first to enable pruning and avoid duplicates',
        'For Combination Sum II: skip duplicates at same recursion level with i>start && cands[i]==cands[i-1]',
        'This is also solvable with DP: count ways = coin change variant',
      ]}
      relatedAlgos={[
        { title: 'Subsets', route: '/backtracking/subsets' },
        { title: 'Permutations', route: '/backtracking/permutations' },
        { title: 'N-Queens', route: '/backtracking/n-queens' },
      ]}
      practiceProblems={[
        { name: 'Combination Sum', difficulty: 'Medium', url: 'https://leetcode.com/problems/combination-sum/' },
        { name: 'Combination Sum II', difficulty: 'Medium', url: 'https://leetcode.com/problems/combination-sum-ii/' },
        { name: 'Combination Sum III', difficulty: 'Medium', url: 'https://leetcode.com/problems/combination-sum-iii/' },
        { name: 'Coin Change 2', difficulty: 'Medium', url: 'https://leetcode.com/problems/coin-change-ii/' },
      ]}
    >
      {/* Current path */}
      <div className={`bg-gray-900/50 rounded-xl p-3 border mb-4 transition-all duration-300 ${pathGlow}`}>
        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Current Path</p>
        <div className="flex flex-wrap gap-2 items-center min-h-[36px]">
          {(step.path || []).length === 0 ? (
            <span className="text-gray-600 text-sm">[ empty ]</span>
          ) : (
            (step.path || []).map((v, i) => (
              <span key={i} className={`px-3 py-1 rounded-full text-sm font-bold border transition-all duration-200 ${
                step.status === 'found' ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300' :
                step.status === 'prune' && i === step.path.length - 1 ? 'bg-red-900/60 border-red-500 text-red-300' :
                'bg-indigo-900/50 border-indigo-600 text-indigo-200'
              }`}>
                {v}
              </span>
            ))
          )}
          <span className={`ml-2 text-sm font-bold ${statusColor}`}>
            = {step.sum || 0}
            {step.status === 'found' && ' ✓'}
            {step.status === 'prune' && ` > ${TARGET} ✗`}
          </span>
        </div>
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  (step.sum || 0) > TARGET ? 'bg-red-500' :
                  step.status === 'found' ? 'bg-emerald-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(((step.sum || 0) / TARGET) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{step.sum || 0}/{TARGET}</span>
          </div>
        </div>
      </div>

      {/* Found combinations grid */}
      <div className="bg-gray-900/30 rounded-xl p-3 border border-gray-700/30">
        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-2">
          Found Combinations ({(step.found || []).length})
        </p>
        {(step.found || []).length === 0 ? (
          <p className="text-gray-600 text-xs">None yet...</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(step.found || []).map((combo, i) => (
              <div key={i} className="flex items-center gap-1 bg-emerald-900/30 border border-emerald-700/50 rounded-lg px-2 py-1">
                <span className="text-emerald-300 text-xs font-mono">[{combo.join(', ')}]</span>
                <span className="text-emerald-500 text-[10px]">={TARGET}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AlgorithmPageShell>
  );
}
