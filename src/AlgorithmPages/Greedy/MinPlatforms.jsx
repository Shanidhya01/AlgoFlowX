import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const TRAIN_COLORS = ['bg-blue-400', 'bg-violet-400', 'bg-pink-400', 'bg-amber-400', 'bg-emerald-400', 'bg-teal-400', 'bg-red-400', 'bg-orange-400'];

function generateSteps(trains) {
  const steps = [];
  const arr = trains.map(t => t.arrival).sort((a, b) => a - b);
  const dep = trains.map(t => t.departure).sort((a, b) => a - b);
  const n = arr.length;
  let platforms = 0, maxPlatforms = 0;
  let i = 0, j = 0;

  steps.push({ trains, arr, dep, i, j, platforms, maxPlatforms, phase: 'init', message: `Sorted arrivals: [${arr.join(', ')}]. Sorted departures: [${dep.join(', ')}]. Two-pointer sweep.` });

  while (i < n && j < n) {
    if (arr[i] <= dep[j]) {
      platforms++;
      if (platforms > maxPlatforms) maxPlatforms = platforms;
      steps.push({ trains, arr, dep, i, j, platforms, maxPlatforms, phase: 'arrive', message: `arr[${i}]=${arr[i]} ≤ dep[${j}]=${dep[j]}: Train arrives → platforms=${platforms} (max=${maxPlatforms})` });
      i++;
    } else {
      platforms--;
      steps.push({ trains, arr, dep, i, j, platforms, maxPlatforms, phase: 'depart', message: `arr[${i}]=${arr[i]} > dep[${j}]=${dep[j]}: Train departs → platforms=${platforms}` });
      j++;
    }
  }

  steps.push({ trains, arr, dep, i, j, platforms, maxPlatforms, done: true, message: `Done! Minimum platforms needed: ${maxPlatforms}` });
  return steps;
}

const DEFAULT_TRAINS = [
  { name: 'T1', arrival: 900, departure: 940 },
  { name: 'T2', arrival: 940, departure: 1200 },
  { name: 'T3', arrival: 950, departure: 1120 },
  { name: 'T4', arrival: 1100, departure: 1130 },
  { name: 'T5', arrival: 1500, departure: 1900 },
  { name: 'T6', arrival: 1800, departure: 2000 },
];

const theory = (
  <div>
    <TheorySection title="Two-Pointer Sweep">
      <p>Sort arrival and departure arrays separately. Use two pointers i (arrival) and j (departure):</p>
      <ul className="list-disc pl-5 mt-2 space-y-1">
        <li>If arr[i] ≤ dep[j]: a train arrives before the earliest departing train leaves → need one more platform. Increment i and platforms.</li>
        <li>Else: the earliest train departs first → free up a platform. Increment j and decrement platforms.</li>
      </ul>
      <p className="mt-2">Track max platforms seen — that's the answer.</p>
    </TheorySection>
    <TheorySection title="Why Sort Separately?">
      <p>We don't need to track which train departs from which platform — just whether a platform is free. Sorting arrivals and departures independently gives us a sweep line over all events.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Sort', 'O(n log n)', 'O(n)'],
      ['Two-pointer', 'O(n)', 'O(1)'],
      ['Total', 'O(n log n)', 'O(n)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `int minPlatforms(vector<int>& arr, vector<int>& dep) {
    sort(arr.begin(), arr.end());
    sort(dep.begin(), dep.end());
    int n = arr.size(), platforms = 0, maxP = 0;
    int i = 0, j = 0;
    while (i < n && j < n) {
        if (arr[i] <= dep[j]) { platforms++; maxP = max(maxP, platforms); i++; }
        else { platforms--; j++; }
    }
    return maxP;
}`,
    'Python': `def min_platforms(arr, dep):
    arr.sort(); dep.sort()
    n, platforms, max_p = len(arr), 0, 0
    i = j = 0
    while i < n and j < n:
        if arr[i] <= dep[j]:
            platforms += 1
            max_p = max(max_p, platforms)
            i += 1
        else:
            platforms -= 1
            j += 1
    return max_p`,
    'JavaScript': `function minPlatforms(arr, dep) {
    arr = [...arr].sort((a, b) => a - b);
    dep = [...dep].sort((a, b) => a - b);
    const n = arr.length;
    let platforms = 0, maxP = 0, i = 0, j = 0;
    while (i < n && j < n) {
        if (arr[i] <= dep[j]) { platforms++; maxP = Math.max(maxP, platforms); i++; }
        else { platforms--; j++; }
    }
    return maxP;
}`,
  }} />
);

export default function MinPlatforms() {
  const [steps, setSteps] = useState(() => generateSteps(DEFAULT_TRAINS));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(700);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];

  const handleRandomize = useCallback(() => {
    const n = 4 + Math.floor(Math.random() * 4);
    const trains = Array.from({ length: n }, (_, i) => {
      const arr = 600 + Math.floor(Math.random() * 800);
      return { name: `T${i + 1}`, arrival: arr, departure: arr + 20 + Math.floor(Math.random() * 180) };
    });
    setSteps(generateSteps(trains)); setCurrentStep(0); setIsRunning(false);
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

  const { trains, arr, dep, i: pi, j: pj, platforms, maxPlatforms, phase } = step;
  const minTime = trains ? Math.min(...trains.map(t => t.arrival)) : 600;
  const maxTime = trains ? Math.max(...trains.map(t => t.departure)) : 2000;
  const span = maxTime - minTime || 1;

  return (
    <AlgorithmPageShell
      title="Minimum Platforms Required"
      description="Two-pointer sweep on sorted arrivals & departures — O(n log n)"
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
      stats={{ platforms: platforms || 0, maxPlatforms: maxPlatforms || 0, pointer: `i=${pi ?? 0},j=${pj ?? 0}` }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={['O(n log n) efficient', 'O(1) extra space after sorting', 'Simple two-pointer logic', 'Works with any time units']}
      disadvantages={['Requires sorting both arrays', 'Does not tell which specific trains share a platform', 'Assumes no instantaneous transfers']}
      applications={['Railway platform scheduling', 'Airport gate allocation', 'Meeting room scheduling (LeetCode 253)', 'Resource allocation with intervals']}
      interviewTips={['Same idea as "merge two sorted arrays"', 'Arrivals sorted separately from departures — key insight', 'At any time t, platforms = arrivals before t minus departures before t', 'Similar to interval scheduling / meeting rooms']}
      relatedAlgos={['Activity Selection', 'Job Sequencing', 'Interval Scheduling', 'Meeting Rooms II']}
      practiceProblems={[
        { name: 'Meeting Rooms II (LeetCode 253)', difficulty: 'Medium' },
        { name: 'Non-Overlapping Intervals', difficulty: 'Medium' },
        { name: 'Minimum Number of Platforms', difficulty: 'Medium' },
      ]}
    >
      <div className="space-y-5">
        {/* Train Gantt chart */}
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Train Timeline</p>
          <div className="relative">
            {/* Time axis */}
            <div className="flex items-center mb-1 ml-10">
              {[0, 0.25, 0.5, 0.75, 1].map(f => (
                <div key={f} className="text-[10px] text-gray-400 absolute" style={{ left: `calc(40px + ${f * (100 - 40 / (f === 1 ? 1 : 1))}%)` }}>
                  {Math.round(minTime + f * span)}
                </div>
              ))}
            </div>
            <div className="space-y-2 mt-4">
              {trains?.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-8 text-xs font-bold text-gray-500 text-right">{t.name}</div>
                  <div className="flex-1 relative h-7 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <div
                      className={`absolute top-0.5 bottom-0.5 rounded-md flex items-center justify-center text-[10px] font-bold text-white ${TRAIN_COLORS[idx % TRAIN_COLORS.length]}`}
                      style={{
                        left: `${((t.arrival - minTime) / span) * 100}%`,
                        width: `${((t.departure - t.arrival) / span) * 100}%`,
                      }}
                    >
                      {t.arrival}–{t.departure}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Two-pointer state */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-bold text-blue-500 uppercase mb-2">Sorted Arrivals</p>
            <div className="flex flex-wrap gap-1">
              {arr?.map((a, idx) => (
                <span key={idx} className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                  idx === pi ? 'bg-amber-200 dark:bg-amber-900 border-amber-400 text-amber-800 dark:text-amber-200 scale-110' :
                  idx < (pi ?? 0) ? 'bg-blue-100 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-500 opacity-50' :
                  'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {a}
                  {idx === pi && <span className="ml-0.5 text-amber-600">↑i</span>}
                </span>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800">
            <p className="text-xs font-bold text-violet-500 uppercase mb-2">Sorted Departures</p>
            <div className="flex flex-wrap gap-1">
              {dep?.map((d, idx) => (
                <span key={idx} className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                  idx === pj ? 'bg-violet-200 dark:bg-violet-900 border-violet-400 text-violet-800 dark:text-violet-200 scale-110' :
                  idx < (pj ?? 0) ? 'bg-violet-100 dark:bg-violet-950 border-violet-200 dark:border-violet-800 text-violet-500 opacity-50' :
                  'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {d}
                  {idx === pj && <span className="ml-0.5 text-violet-600">↑j</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Platform counter */}
        <div className="flex gap-4">
          <div className={`flex-1 p-3 rounded-xl border text-center transition-all duration-300 ${
            phase === 'arrive' ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300' :
            phase === 'depart' ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300' :
            'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{platforms}</div>
            <div className="text-xs text-gray-500 font-bold uppercase">Current Platforms</div>
          </div>
          <div className="flex-1 p-3 rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 text-center">
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{maxPlatforms}</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-500 font-bold uppercase">Max Platforms</div>
          </div>
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
