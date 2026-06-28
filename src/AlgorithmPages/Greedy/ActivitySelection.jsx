import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function generateSteps(activities) {
  const steps = [];
  const sorted = [...activities].sort((a, b) => a.end - b.end);
  const selected = [];
  let lastEnd = -Infinity;

  steps.push({ activities: sorted, selected: [], considering: -1, lastEnd: -Infinity, message: `Sort ${sorted.length} activities by finish time. Greedy: always pick the earliest-finishing compatible activity.` });

  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i];
    steps.push({ activities: sorted, selected: [...selected], considering: i, lastEnd, message: `Considering activity ${a.name}: [${a.start}, ${a.end}). Last end = ${lastEnd === -Infinity ? '—' : lastEnd}` });

    if (a.start >= lastEnd) {
      selected.push(i);
      lastEnd = a.end;
      steps.push({ activities: sorted, selected: [...selected], considering: i, lastEnd, message: `✓ Selected ${a.name} — starts at ${a.start} ≥ ${lastEnd === a.end ? 'prev end' : lastEnd}. New last end = ${a.end}` });
    } else {
      steps.push({ activities: sorted, selected: [...selected], considering: -1, lastEnd, rejected: i, message: `✗ Rejected ${a.name} — starts at ${a.start} < last end ${lastEnd} (overlaps)` });
    }
  }

  steps.push({ activities: sorted, selected: [...selected], considering: -1, lastEnd, done: true, message: `✅ Optimal selection: ${selected.length} activities selected — ${selected.map(i => sorted[i].name).join(', ')}` });
  return steps;
}

const SAMPLE = [
  { name: 'A', start: 0, end: 6 },
  { name: 'B', start: 1, end: 4 },
  { name: 'C', start: 3, end: 5 },
  { name: 'D', start: 5, end: 7 },
  { name: 'E', start: 5, end: 9 },
  { name: 'F', start: 8, end: 9 },
];

const theory = (
  <div>
    <TheorySection title="Activity Selection Problem">
      <p>Given n activities each with a start and finish time, select the maximum number of non-overlapping activities a single person can attend.</p>
      <p><strong>Greedy Strategy:</strong> Always select the activity with the earliest finish time that doesn't conflict with the last selected activity. This greedy choice is optimal because it leaves the most room for future activities.</p>
    </TheorySection>
    <TheorySection title="Proof of Optimality">
      <p>If we select the earliest-finishing activity, the remaining time window is maximized for future activities. Any other choice (a later-finishing activity at the same start) would leave strictly less time, potentially blocking more activities. This is an exchange argument proof.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Sorting', 'O(n log n)', 'O(1)'],
      ['Selection', 'O(n)', 'O(1)'],
      ['Total', 'O(n log n)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `// activities = sorted by finish time
vector<int> activitySelection(vector<pair<int,int>>& acts) {
    vector<int> selected;
    int lastEnd = -1;
    for (int i = 0; i < acts.size(); i++) {
        if (acts[i].first >= lastEnd) {
            selected.push_back(i);
            lastEnd = acts[i].second;
        }
    }
    return selected;
}`,
    'Python': `def activity_selection(activities):
    # Sort by finish time
    acts = sorted(activities, key=lambda x: x[1])
    selected = [acts[0]]
    last_end = acts[0][1]
    for start, end in acts[1:]:
        if start >= last_end:
            selected.append((start, end))
            last_end = end
    return selected`,
    'JavaScript': `function activitySelection(activities) {
    const sorted = [...activities].sort((a, b) => a.end - b.end);
    const selected = [sorted[0]];
    let lastEnd = sorted[0].end;
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].start >= lastEnd) {
            selected.push(sorted[i]);
            lastEnd = sorted[i].end;
        }
    }
    return selected;
}`,
  }} />
);

const COLORS = ['bg-blue-400', 'bg-violet-400', 'bg-pink-400', 'bg-amber-400', 'bg-emerald-400', 'bg-teal-400', 'bg-red-400', 'bg-orange-400'];

export default function ActivitySelection() {
  const [steps, setSteps] = useState(() => generateSteps(SAMPLE));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(700);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];
  const maxTime = Math.max(...step.activities.map(a => a.end)) + 1;

  const handleRandomize = useCallback(() => {
    const names = 'ABCDEFGHIJ'.split('');
    const count = 5 + Math.floor(Math.random() * 4);
    const acts = names.slice(0, count).map(name => {
      const start = Math.floor(Math.random() * 10);
      const end = start + 1 + Math.floor(Math.random() * 5);
      return { name, start, end };
    });
    setSteps(generateSteps(acts));
    setCurrentStep(0);
    setIsRunning(false);
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

  return (
    <AlgorithmPageShell
      title="Activity Selection"
      description="Greedily select maximum non-overlapping activities by earliest finish time"
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
      stats={{ selected: step.selected.length, total: step.activities.length }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
    >
      <div className="space-y-3">
        {/* Timeline header */}
        <div className="flex items-center gap-2">
          <div className="w-6" />
          <div className="flex-1 relative h-5">
            {Array.from({ length: maxTime + 1 }, (_, i) => (
              <span key={i} className="absolute text-xs text-gray-400 dark:text-gray-500" style={{ left: `${(i / maxTime) * 100}%`, transform: 'translateX(-50%)' }}>{i}</span>
            ))}
          </div>
        </div>

        {/* Activity bars */}
        {step.activities.map((a, i) => {
          const isSelected = step.selected.includes(i);
          const isConsidering = step.considering === i;
          const isRejected = step.rejected === i;
          return (
            <div key={a.name} className={`flex items-center gap-2 transition-all duration-300 ${isConsidering ? 'scale-[1.02]' : ''}`}>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${COLORS[i % COLORS.length]}`}>
                {a.name}
              </div>
              <div className="flex-1 relative h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <div
                  className={`absolute top-1 bottom-1 rounded-md transition-all duration-300 flex items-center justify-center text-xs font-bold text-white ${
                    isRejected ? 'opacity-30 bg-gray-400' :
                    isSelected ? 'opacity-100 ring-2 ring-offset-1 ring-emerald-500 ' + COLORS[i % COLORS.length] :
                    isConsidering ? 'opacity-80 ring-2 ring-amber-400 ' + COLORS[i % COLORS.length] :
                    'opacity-40 ' + COLORS[i % COLORS.length]
                  }`}
                  style={{
                    left: `${(a.start / maxTime) * 100}%`,
                    width: `${((a.end - a.start) / maxTime) * 100}%`,
                  }}
                >
                  {a.start}–{a.end}
                </div>
              </div>
              <div className="w-8 flex items-center justify-center">
                {isSelected && <span className="text-emerald-500 text-lg">✓</span>}
                {isRejected && <span className="text-red-400 text-sm">✗</span>}
              </div>
            </div>
          );
        })}
      </div>
    </AlgorithmPageShell>
  );
}
