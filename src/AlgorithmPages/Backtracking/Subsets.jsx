import React, { useState, useEffect, useRef } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// ─── Step Generator ───────────────────────────────────────────────────────────

const INPUT = [1, 2, 3, 4];

function generateSteps() {
  const steps = [];
  const found = [];

  steps.push({
    current: [],
    index: -1,
    decision: null,
    found: [],
    status: 'init',
    message: `Power Set of [${INPUT.join(', ')}]: find all 2^4 = 16 subsets.`,
  });

  function backtrack(idx, current) {
    // Record this subset (every node in the tree is a valid subset)
    found.push([...current]);
    steps.push({
      current: [...current],
      index: idx,
      decision: null,
      found: found.map(f => [...f]),
      status: 'found',
      message: `Subset: [${current.length ? current.join(', ') : '∅'}] added. Total: ${found.length}`,
    });

    if (idx === INPUT.length) return;

    for (let i = idx; i < INPUT.length; i++) {
      // Include INPUT[i]
      steps.push({
        current: [...current],
        index: i,
        decision: 'include',
        found: found.map(f => [...f]),
        status: 'decide',
        element: INPUT[i],
        message: `Index ${i}: include ${INPUT[i]} → [${[...current, INPUT[i]].join(', ')}]`,
      });
      current.push(INPUT[i]);
      backtrack(i + 1, current);
      current.pop();
      steps.push({
        current: [...current],
        index: i,
        decision: 'backtrack',
        found: found.map(f => [...f]),
        status: 'backtrack',
        element: INPUT[i],
        message: `Backtrack: remove ${INPUT[i]}, current=[${current.length ? current.join(', ') : '∅'}]`,
      });
    }
  }

  backtrack(0, []);

  steps.push({
    current: [],
    index: INPUT.length,
    decision: null,
    found: found.map(f => [...f]),
    status: 'done',
    message: `All 16 subsets generated!`,
    done: true,
  });

  return steps;
}

// ─── Theory & Code ────────────────────────────────────────────────────────────

const theory = (
  <div>
    <TheorySection title="Power Set (All Subsets)">
      <p>The power set of a set S with n elements contains 2^n subsets (including ∅ and S itself). Using backtracking, we build subsets incrementally: at each index, we either include or exclude the element, then recurse.</p>
      <p><strong>Key insight:</strong> Every node in the recursion tree represents a valid subset — so we record it immediately before recursing further.</p>
    </TheorySection>
    <TheorySection title="Two Approaches">
      <ul className="list-disc pl-4 space-y-1">
        <li><strong>Backtracking:</strong> Build subsets incrementally, include/exclude at each step</li>
        <li><strong>Bit manipulation:</strong> For each integer 0..2^n−1, bit i=1 means include element i</li>
        <li>Both are O(n × 2^n) time (n elements per subset, 2^n subsets)</li>
        <li>For duplicates (Subsets II): sort first, skip same element at same level</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Time', 'O(n × 2^n)', 'O(n × 2^n)'],
      ['Subsets count', '2^n', '—'],
      ['Space (stack)', '—', 'O(n)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `#include <vector>
using namespace std;

void backtrack(vector<int>& nums, int start,
               vector<int>& curr,
               vector<vector<int>>& res) {
    res.push_back(curr);
    for (int i = start; i < nums.size(); i++) {
        curr.push_back(nums[i]);
        backtrack(nums, i + 1, curr, res);
        curr.pop_back();
    }
}

vector<vector<int>> subsets(vector<int>& nums) {
    vector<vector<int>> res;
    vector<int> curr;
    backtrack(nums, 0, curr, res);
    return res;
}

// Bit manipulation approach
vector<vector<int>> subsetsBit(vector<int>& nums) {
    int n = nums.size();
    vector<vector<int>> res;
    for (int mask = 0; mask < (1 << n); mask++) {
        vector<int> subset;
        for (int i = 0; i < n; i++)
            if (mask & (1 << i)) subset.push_back(nums[i]);
        res.push_back(subset);
    }
    return res;
}`,
    'Python': `def subsets(nums):
    result = []

    def backtrack(start, curr):
        result.append(list(curr))
        for i in range(start, len(nums)):
            curr.append(nums[i])
            backtrack(i + 1, curr)
            curr.pop()

    backtrack(0, [])
    return result

# Bit manipulation approach
def subsets_bit(nums):
    n = len(nums)
    return [
        [nums[i] for i in range(n) if mask & (1 << i)]
        for mask in range(1 << n)
    ]`,
    'JavaScript': `function subsets(nums) {
  const result = [];

  function backtrack(start, curr) {
    result.push([...curr]);
    for (let i = start; i < nums.length; i++) {
      curr.push(nums[i]);
      backtrack(i + 1, curr);
      curr.pop();
    }
  }

  backtrack(0, []);
  return result;
}

// Bit manipulation approach
function subsetsBit(nums) {
  const n = nums.length;
  const result = [];
  for (let mask = 0; mask < (1 << n); mask++) {
    result.push(nums.filter((_, i) => mask & (1 << i)));
  }
  return result;
}`,
    'Java': `import java.util.*;

public class Subsets {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), res);
        return res;
    }

    void backtrack(int[] nums, int start, List<Integer> curr,
                   List<List<Integer>> res) {
        res.add(new ArrayList<>(curr));
        for (int i = start; i < nums.length; i++) {
            curr.add(nums[i]);
            backtrack(nums, i + 1, curr, res);
            curr.remove(curr.size() - 1);
        }
    }
}`,
  }} />
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function Subsets() {
  const [steps] = useState(() => generateSteps());
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
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

  const current = step.current || [];
  const found = step.found || [];

  return (
    <AlgorithmPageShell
      title="Subsets (Power Set)"
      description="Generate all 16 subsets of [1,2,3,4] using backtracking include/exclude decisions"
      category="Backtracking"
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
      showInput={false}
      stats={{
        index: step.index >= 0 ? step.index : '—',
        current: current.length ? `[${current.join(',')}]` : '∅',
        found: found.length,
        total: 16,
      }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Generates all 2^n subsets correctly',
        'Natural recursive tree structure',
        'Easy to understand include/exclude paradigm',
        'Bit manipulation alternative is iterative and avoids recursion',
      ]}
      disadvantages={[
        'Exponential output: 2^n subsets, each up to n elements',
        'Not feasible for large n (n>20 is ~1M subsets)',
        'Recursion stack depth O(n)',
      ]}
      applications={[
        'Power set enumeration',
        'Feature selection in ML',
        'Partition problems (equal subset sum)',
        'Network reliability analysis',
        'Generating all test cases',
      ]}
      interviewTips={[
        'Every node in the backtracking tree is a valid subset — record before recursing',
        'Subsets II (duplicates): sort first, skip if i>start && nums[i]==nums[i-1]',
        'Bit mask approach: iterate 0..2^n-1, bit i set → include nums[i]',
        'Partition Equal Subset Sum is a subset problem solvable with DP in O(n×target)',
      ]}
      relatedAlgos={[
        { title: 'Combination Sum', route: '/backtracking/combination-sum' },
        { title: 'Permutations', route: '/backtracking/permutations' },
        { title: 'N-Queens', route: '/backtracking/n-queens' },
      ]}
      practiceProblems={[
        { name: 'Subsets', difficulty: 'Medium', url: 'https://leetcode.com/problems/subsets/' },
        { name: 'Subsets II', difficulty: 'Medium', url: 'https://leetcode.com/problems/subsets-ii/' },
        { name: 'Partition Equal Subset Sum', difficulty: 'Medium', url: 'https://leetcode.com/problems/partition-equal-subset-sum/' },
        { name: 'Count of Subsets with Given Sum', difficulty: 'Medium', url: 'https://practice.geeksforgeeks.org/problems/perfect-sum-problem5633/1' },
      ]}
    >
      {/* Current building subset */}
      <div className={`bg-gray-900/50 rounded-xl p-3 border mb-4 transition-all duration-300 ${
        step.status === 'found' ? 'border-emerald-600/60 ring-1 ring-emerald-500/40' :
        step.status === 'backtrack' ? 'border-amber-600/40' :
        'border-gray-700/40'
      }`}>
        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Building Subset</p>
        <div className="flex flex-wrap gap-2 items-center min-h-[40px]">
          {current.length === 0 ? (
            <span className="text-gray-500 text-sm font-mono">∅ (empty set)</span>
          ) : (
            current.map((v, i) => (
              <span key={i} className={`px-3 py-1 rounded-full text-sm font-bold border transition-all duration-200 ${
                step.status === 'found' ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300' :
                step.decision === 'include' && i === current.length - 1 ? 'bg-indigo-900/60 border-indigo-400 text-indigo-200 scale-110' :
                'bg-indigo-900/40 border-indigo-700 text-indigo-300'
              }`}>
                {v}
              </span>
            ))
          )}
          {step.status === 'found' && (
            <span className="text-emerald-400 text-sm font-bold ml-1">✓ recorded</span>
          )}
        </div>

        {/* Decision indicator */}
        {step.decision && step.element !== undefined && (
          <div className={`mt-2 flex items-center gap-2 text-xs font-semibold ${
            step.decision === 'include' ? 'text-indigo-400' :
            step.decision === 'backtrack' ? 'text-amber-400' : 'text-gray-400'
          }`}>
            <span>{step.decision === 'include' ? '→ Include' : '← Backtrack'}</span>
            <span className="px-2 py-0.5 bg-gray-800 rounded-full font-mono">{step.element}</span>
          </div>
        )}
      </div>

      {/* Input elements showing current index */}
      <div className="flex gap-2 justify-center mb-4">
        {INPUT.map((v, i) => (
          <div key={i} className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border-2 text-sm font-bold transition-all duration-200 ${
            step.index === i ? 'border-indigo-400 bg-indigo-900/50 text-indigo-200 scale-110' :
            step.index > i ? 'border-gray-600 bg-gray-800/50 text-gray-400' :
            'border-gray-700 bg-gray-900/30 text-gray-500'
          }`}>
            {v}
            {step.index === i && <span className="text-[8px] text-indigo-400 mt-0.5">idx</span>}
          </div>
        ))}
      </div>

      {/* Found subsets grid */}
      <div className="bg-gray-900/30 rounded-xl p-3 border border-gray-700/30">
        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-2">
          Found Subsets ({found.length} / 16)
        </p>
        {found.length === 0 ? (
          <p className="text-gray-600 text-xs">None yet...</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {found.map((subset, i) => (
              <div key={i} className={`border rounded-lg px-2 py-1 transition-all duration-200 ${
                i === found.length - 1 && step.status === 'found'
                  ? 'bg-emerald-900/40 border-emerald-600/70'
                  : 'bg-gray-800/50 border-gray-700/50'
              }`}>
                <span className={`text-xs font-mono ${
                  i === found.length - 1 && step.status === 'found' ? 'text-emerald-300' : 'text-gray-400'
                }`}>
                  {subset.length ? `{${subset.join(',')}}` : '∅'}
                </span>
              </div>
            ))}
          </div>
        )}
        {/* Progress bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-gray-800 rounded-full h-1.5">
            <div className="h-1.5 bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${(found.length / 16) * 100}%` }} />
          </div>
          <span className="text-[10px] text-gray-500">{Math.round((found.length / 16) * 100)}%</span>
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
