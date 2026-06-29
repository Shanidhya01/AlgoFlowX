import React, { useState, useEffect, useRef } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

// ─── Step Generator ───────────────────────────────────────────────────────────

const INPUT = [1, 2, 3];

function generateSteps() {
  const steps = [];
  const found = [];
  const arr = [...INPUT];

  steps.push({
    arr: [...arr],
    position: -1,
    swapI: -1,
    swapJ: -1,
    found: [],
    status: 'init',
    message: `Generate all permutations of [${INPUT.join(', ')}] using backtracking with swaps.`,
  });

  function backtrack(pos) {
    if (pos === arr.length) {
      found.push([...arr]);
      steps.push({
        arr: [...arr],
        position: pos,
        swapI: -1,
        swapJ: -1,
        found: found.map(f => [...f]),
        status: 'found',
        message: `Found permutation: [${arr.join(', ')}]`,
      });
      return;
    }

    for (let i = pos; i < arr.length; i++) {
      // Swap pos <-> i
      steps.push({
        arr: [...arr],
        position: pos,
        swapI: pos,
        swapJ: i,
        found: found.map(f => [...f]),
        status: 'swap',
        message: `Position ${pos}: swap arr[${pos}]=${arr[pos]} ↔ arr[${i}]=${arr[i]}`,
      });
      [arr[pos], arr[i]] = [arr[i], arr[pos]];
      steps.push({
        arr: [...arr],
        position: pos,
        swapI: pos,
        swapJ: i,
        found: found.map(f => [...f]),
        status: 'fixing',
        message: `Fixed position ${pos} = ${arr[pos]}. Recurse to position ${pos + 1}.`,
      });

      backtrack(pos + 1);

      // Restore
      [arr[pos], arr[i]] = [arr[i], arr[pos]];
      steps.push({
        arr: [...arr],
        position: pos,
        swapI: pos,
        swapJ: i,
        found: found.map(f => [...f]),
        status: 'restore',
        message: `Restore: swap back arr[${pos}] ↔ arr[${i}]. arr=[${arr.join(', ')}]`,
      });
    }
  }

  backtrack(0);

  steps.push({
    arr: [...INPUT],
    position: -1,
    swapI: -1,
    swapJ: -1,
    found: found.map(f => [...f]),
    status: 'done',
    message: `All ${found.length} permutations generated!`,
    done: true,
  });

  return steps;
}

// ─── Theory & Code ────────────────────────────────────────────────────────────

const theory = (
  <div>
    <TheorySection title="Generating All Permutations">
      <p>To generate all permutations of an array, use backtracking with in-place swapping. At each position, try placing every remaining element by swapping it to the current position, recursing for the rest, then swapping back (restoring state).</p>
      <p>For n distinct elements, there are n! permutations. The swap-based approach avoids extra memory for tracking used elements.</p>
    </TheorySection>
    <TheorySection title="Alternative Approaches">
      <ul className="list-disc pl-4 space-y-1">
        <li><strong>Swap approach:</strong> Fix each element at current position via swap, recurse, swap back</li>
        <li><strong>Used-array approach:</strong> Track which elements are used; build permutation in a separate array</li>
        <li><strong>Next permutation:</strong> Iteratively generate the lexicographically next permutation in O(n)</li>
        <li>For duplicates: sort first, skip duplicate values at same recursion level</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Time', 'O(n × n!)', 'O(n)'],
      ['Permutations count', 'n!', '—'],
      ['Space (stack)', '—', 'O(n)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `#include <vector>
using namespace std;

void backtrack(vector<int>& nums, int pos,
               vector<vector<int>>& res) {
    if (pos == nums.size()) { res.push_back(nums); return; }
    for (int i = pos; i < nums.size(); i++) {
        swap(nums[pos], nums[i]);
        backtrack(nums, pos + 1, res);
        swap(nums[pos], nums[i]); // restore
    }
}

vector<vector<int>> permute(vector<int>& nums) {
    vector<vector<int>> res;
    backtrack(nums, 0, res);
    return res;
}`,
    'Python': `def permute(nums):
    result = []

    def backtrack(pos):
        if pos == len(nums):
            result.append(nums[:])
            return
        for i in range(pos, len(nums)):
            nums[pos], nums[i] = nums[i], nums[pos]
            backtrack(pos + 1)
            nums[pos], nums[i] = nums[i], nums[pos]

    backtrack(0)
    return result`,
    'JavaScript': `function permute(nums) {
  const result = [];

  function backtrack(pos) {
    if (pos === nums.length) { result.push([...nums]); return; }
    for (let i = pos; i < nums.length; i++) {
      [nums[pos], nums[i]] = [nums[i], nums[pos]];
      backtrack(pos + 1);
      [nums[pos], nums[i]] = [nums[i], nums[pos]];
    }
  }

  backtrack(0);
  return result;
}`,
    'Java': `import java.util.*;

public class Permutations {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        backtrack(nums, 0, res);
        return res;
    }

    void backtrack(int[] nums, int pos, List<List<Integer>> res) {
        if (pos == nums.length) {
            List<Integer> list = new ArrayList<>();
            for (int n : nums) list.add(n);
            res.add(list); return;
        }
        for (int i = pos; i < nums.length; i++) {
            swap(nums, pos, i);
            backtrack(nums, pos + 1, res);
            swap(nums, pos, i);
        }
    }

    void swap(int[] arr, int i, int j) {
        int tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
}`,
  }} />
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function Permutations() {
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

  const arr = step.arr || [...INPUT];

  return (
    <AlgorithmPageShell
      title="Permutations"
      description="Generate all 6 permutations of [1,2,3] using backtracking with in-place swapping"
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
        position: step.position >= 0 ? step.position : '—',
        current: `[${arr.join(',')}]`,
        found: (step.found || []).length,
      }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'In-place: O(n) extra space (only recursion stack)',
        'Simple and elegant swap-based approach',
        'Generates all n! permutations correctly',
        'Easy to extend with pruning for duplicates',
      ]}
      disadvantages={[
        'Output size is n! — grows very fast',
        'Not lexicographic order by default (swap-based)',
        'For lexicographic order, use used-array approach',
      ]}
      applications={[
        'Brute-force search over orderings',
        'Traveling Salesman Problem (small n)',
        'Anagram generation',
        'Scheduling and assignment problems',
      ]}
      interviewTips={[
        'Permutations II (duplicates): sort first, skip same value at same level',
        'Next Permutation (LeetCode 31): find rightmost ascent, swap with next larger, reverse suffix',
        'Permutation in String (LeetCode 567): sliding window + frequency count',
        'n! grows fast: feasible brute-force only for n ≤ 10–12',
      ]}
      relatedAlgos={[
        { title: 'Subsets', route: '/backtracking/subsets' },
        { title: 'Combination Sum', route: '/backtracking/combination-sum' },
        { title: "Knight's Tour", route: '/backtracking/knights-tour' },
      ]}
      practiceProblems={[
        { name: 'Permutations', difficulty: 'Medium', url: 'https://leetcode.com/problems/permutations/' },
        { name: 'Permutations II', difficulty: 'Medium', url: 'https://leetcode.com/problems/permutations-ii/' },
        { name: 'Next Permutation', difficulty: 'Medium', url: 'https://leetcode.com/problems/next-permutation/' },
        { name: 'Permutation in String', difficulty: 'Medium', url: 'https://leetcode.com/problems/permutation-in-string/' },
      ]}
    >
      {/* Array boxes */}
      <div className="bg-gray-900/40 rounded-xl p-4 border border-gray-700/40 mb-4">
        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-3">Current Array</p>
        <div className="flex gap-3 justify-center">
          {arr.map((v, i) => {
            const isFixed = step.position >= 0 && i < step.position;
            const isSwapI = step.swapI === i;
            const isSwapJ = step.swapJ === i;
            const isCurrent = step.position === i;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-14 h-14 flex items-center justify-center rounded-xl text-xl font-bold border-2 transition-all duration-300 ${
                  step.status === 'found' ? 'bg-emerald-900/60 border-emerald-500 text-emerald-200 scale-110' :
                  isSwapI || isSwapJ ? 'bg-amber-900/60 border-amber-400 text-amber-200 scale-110' :
                  isFixed ? 'bg-indigo-900/50 border-indigo-500 text-indigo-200' :
                  isCurrent ? 'bg-purple-900/50 border-purple-500 text-purple-200' :
                  'bg-gray-800 border-gray-600 text-gray-300'
                }`}>
                  {v}
                </div>
                <span className={`text-[10px] font-semibold ${
                  isFixed ? 'text-indigo-400' :
                  isCurrent ? 'text-purple-400' :
                  isSwapI || isSwapJ ? 'text-amber-400' :
                  'text-gray-600'
                }`}>
                  {isFixed ? 'fixed' : isCurrent ? 'pos' : `[${i}]`}
                </span>
              </div>
            );
          })}
        </div>
        {(step.swapI !== -1 && step.swapJ !== -1 && step.swapI !== step.swapJ) && (
          <p className="text-center mt-2 text-amber-400 text-xs font-semibold">
            ↕ Swapping [{step.swapI}] and [{step.swapJ}]
          </p>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-xs text-gray-400 justify-center mb-4">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-600 inline-block" /> fixed</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-600 inline-block" /> current pos</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-600 inline-block" /> swapping</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-600 inline-block" /> found</span>
      </div>

      {/* Found permutations grid */}
      <div className="bg-gray-900/30 rounded-xl p-3 border border-gray-700/30">
        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-2">
          Found Permutations ({(step.found || []).length} / 6)
        </p>
        {(step.found || []).length === 0 ? (
          <p className="text-gray-600 text-xs">None yet...</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(step.found || []).map((perm, i) => (
              <div key={i} className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg px-2 py-1">
                <span className="text-emerald-300 text-xs font-mono">[{perm.join(', ')}]</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AlgorithmPageShell>
  );
}
