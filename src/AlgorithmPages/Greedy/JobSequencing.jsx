import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const COLORS = ['bg-blue-400', 'bg-violet-400', 'bg-pink-400', 'bg-amber-400', 'bg-emerald-400', 'bg-teal-400', 'bg-red-400', 'bg-orange-400'];

function generateSteps(rawJobs) {
  const steps = [];
  const jobs = rawJobs.map((j, i) => ({ ...j, id: i })).sort((a, b) => b.profit - a.profit);
  const maxDeadline = Math.max(...jobs.map(j => j.deadline));
  const slots = Array(maxDeadline).fill(null);
  let totalProfit = 0, done = 0, rejected = 0;
  const rejectedIds = [];

  steps.push({ jobs, slots: [...slots], totalProfit, done, rejected, considering: -1, maxDeadline, message: `Sorted ${jobs.length} jobs by profit (descending). Finding latest available slot for each.` });

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    steps.push({ jobs, slots: [...slots], totalProfit, done, rejected, considering: i, maxDeadline, rejectedIds: [...rejectedIds], message: `Job "${job.name}" (profit=${job.profit}, deadline=${job.deadline}): searching slot ${job.deadline - 1} → 0` });

    let placed = false;
    for (let s = job.deadline - 1; s >= 0; s--) {
      if (slots[s] === null) {
        slots[s] = job;
        totalProfit += job.profit;
        done++;
        placed = true;
        steps.push({ jobs, slots: [...slots], totalProfit, done, rejected, considering: i, maxDeadline, rejectedIds: [...rejectedIds], placedAt: s, message: `Placed "${job.name}" in slot ${s + 1} (time ${s}–${s + 1}). Profit +${job.profit} → Total: ${totalProfit}` });
        break;
      }
    }
    if (!placed) {
      rejected++;
      rejectedIds.push(job.id);
      steps.push({ jobs, slots: [...slots], totalProfit, done, rejected, considering: i, maxDeadline, rejectedIds: [...rejectedIds], message: `Rejected "${job.name}" — no available slot before deadline ${job.deadline}` });
    }
  }

  steps.push({ jobs, slots: [...slots], totalProfit, done, rejected, considering: -1, maxDeadline, rejectedIds: [...rejectedIds], done2: true, message: `Done! Jobs scheduled: ${done}, Rejected: ${rejected}, Total profit: ${totalProfit}` });
  return steps;
}

const DEFAULT_JOBS = [
  { name: 'J1', deadline: 2, profit: 100 },
  { name: 'J2', deadline: 1, profit: 19 },
  { name: 'J3', deadline: 2, profit: 27 },
  { name: 'J4', deadline: 1, profit: 25 },
  { name: 'J5', deadline: 3, profit: 15 },
];

const theory = (
  <div>
    <TheorySection title="Greedy Approach">
      <p>Sort jobs by profit in descending order. For each job, find the latest available time slot before its deadline. If a slot exists, schedule it; otherwise discard.</p>
      <p className="mt-2">The key insight: scheduling each job as late as possible (just before its deadline) preserves earlier slots for potentially profitable jobs with tighter deadlines.</p>
    </TheorySection>
    <TheorySection title="DSU Optimization">
      <p>With Union-Find (DSU), we can find the latest available slot in nearly O(1). The DSU parent[i] = latest free slot ≤ i. After placing a job in slot i, union it with slot i-1. This gives O(n log n) total.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Sort', 'O(n log n)', 'O(1)'],
      ['Naive slot search', 'O(n²)', 'O(n)'],
      ['With DSU', 'O(n log n)', 'O(n)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `struct Job { string id; int deadline, profit; };
vector<Job> jobSequencing(vector<Job>& jobs, int maxDeadline) {
    sort(jobs.begin(), jobs.end(), [](auto& a, auto& b) { return a.profit > b.profit; });
    vector<int> slots(maxDeadline, -1);
    vector<Job> result;
    for (auto& job : jobs) {
        for (int s = job.deadline - 1; s >= 0; s--) {
            if (slots[s] == -1) {
                slots[s] = job.profit;
                result.push_back(job);
                break;
            }
        }
    }
    return result;
}`,
    'Python': `def job_sequencing(jobs, max_deadline):
    jobs.sort(key=lambda x: -x['profit'])
    slots = [None] * max_deadline
    result = []
    for job in jobs:
        for s in range(job['deadline'] - 1, -1, -1):
            if slots[s] is None:
                slots[s] = job
                result.append(job)
                break
    return result`,
    'JavaScript': `function jobSequencing(jobs, maxDeadline) {
    const sorted = [...jobs].sort((a, b) => b.profit - a.profit);
    const slots = new Array(maxDeadline).fill(null);
    const result = [];
    for (const job of sorted) {
        for (let s = job.deadline - 1; s >= 0; s--) {
            if (slots[s] === null) {
                slots[s] = job;
                result.push(job);
                break;
            }
        }
    }
    return result;
}`,
  }} />
);

export default function JobSequencing() {
  const [steps, setSteps] = useState(() => generateSteps(DEFAULT_JOBS));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(700);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleRandomize = useCallback(() => {
    const n = 4 + Math.floor(Math.random() * 3);
    const jobs = Array.from({ length: n }, (_, i) => ({
      name: `J${i + 1}`,
      deadline: 1 + Math.floor(Math.random() * 4),
      profit: 10 + Math.floor(Math.random() * 90),
    }));
    setSteps(generateSteps(jobs)); setCurrentStep(0); setIsRunning(false);
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

  const { jobs, slots, totalProfit, done, rejected, considering, maxDeadline, rejectedIds } = step;

  return (
    <AlgorithmPageShell
      title="Job Sequencing with Deadlines"
      description="Schedule jobs to maximize profit — greedy by profit with latest-slot heuristic"
      category="Greedy"
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
      showInput={false}
      stats={{ totalProfit, jobsDone: done || 0, jobsRejected: rejected || 0 }}
      message={step.message}
      done={!!step.done2}
      theory={theory}
      code={code}
      advantages={['Simple greedy approach', 'Optimal solution provable by exchange argument', 'O(n log n) with DSU optimization', 'Classic interview problem']}
      disadvantages={['Naive slot search is O(n²)', 'Only one job per time unit', 'Does not consider varying execution times']}
      applications={['OS process scheduling', 'Task management systems', 'Deadline-constrained project planning', 'Manufacturing job shop']}
      interviewTips={['Sort by profit descending, not deadline', 'Always assign to latest available slot before deadline', 'DSU optimization makes it O(n log n)', 'Exchange argument proves greedy optimality']}
      relatedAlgos={['Activity Selection', 'Fractional Knapsack', 'Huffman Coding Tree', 'Minimum Platforms']}
      practiceProblems={[
        { name: 'Job Sequencing Problem', difficulty: 'Medium' },
        { name: 'Task Scheduler', difficulty: 'Medium' },
        { name: 'Minimum Number of Arrows to Burst Balloons', difficulty: 'Medium' },
      ]}
    >
      <div className="space-y-5">
        {/* Timeline slots */}
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Timeline Slots (1 unit each)</p>
          <div className="flex gap-2">
            {Array.from({ length: maxDeadline || 1 }, (_, i) => {
              const slotJob = slots?.[i];
              return (
                <div key={i} className="flex-1 min-w-[60px]">
                  <div className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 ${
                    slotJob
                      ? `${COLORS[slotJob.id % COLORS.length]} text-white border-transparent`
                      : 'bg-gray-100 dark:bg-gray-800 border-dashed border-gray-300 dark:border-gray-600 text-gray-400'
                  }`}>
                    {slotJob ? (
                      <>
                        <span className="text-sm">{slotJob.name}</span>
                        <span className="text-[10px] opacity-90">${slotJob.profit}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">empty</span>
                    )}
                  </div>
                  <div className="text-center text-xs text-gray-400 mt-1">t={i+1}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Jobs sorted by profit */}
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Jobs (sorted by profit ↓)</p>
          <div className="space-y-1.5">
            {jobs?.map((job, idx) => {
              const isConsidering = idx === considering;
              const isRejected = rejectedIds?.includes(job.id);
              const isPlaced = slots?.some(s => s?.id === job.id);
              return (
                <div key={job.id} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 ${
                  isConsidering ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30 scale-[1.01]' :
                  isRejected ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 opacity-60' :
                  isPlaced ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20' :
                  'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${COLORS[job.id % COLORS.length]}`}>
                    {job.name}
                  </div>
                  <div className="flex-1 text-sm">
                    <span className="font-bold text-gray-800 dark:text-gray-200">${job.profit}</span>
                    <span className="text-gray-400 ml-2">deadline: {job.deadline}</span>
                  </div>
                  <div className="text-xs font-bold">
                    {isPlaced && <span className="text-emerald-600 dark:text-emerald-400">✓ Slot {(slots?.findIndex(s => s?.id === job.id) ?? -1) + 1}</span>}
                    {isRejected && <span className="text-red-500">✗ Rejected</span>}
                    {isConsidering && !isPlaced && !isRejected && <span className="text-amber-600 dark:text-amber-400">⟵ now</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 flex-wrap">
          <div className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-sm">
            <span className="font-bold text-emerald-700 dark:text-emerald-300">Total Profit: </span>
            <span className="font-mono font-bold text-emerald-800 dark:text-emerald-200">{totalProfit}</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm">
            <span className="font-bold text-red-700 dark:text-red-300">Rejected: </span>
            <span className="font-mono font-bold text-red-800 dark:text-red-200">{rejected}</span>
          </div>
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
