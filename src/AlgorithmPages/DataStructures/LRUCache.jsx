import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const CAPACITY = 4;
const OPERATIONS = [
  { op: 'put', key: 1, val: 'A' },
  { op: 'put', key: 2, val: 'B' },
  { op: 'get', key: 1 },
  { op: 'put', key: 3, val: 'C' },
  { op: 'get', key: 2 },   // MISS
  { op: 'put', key: 4, val: 'D' },
  { op: 'put', key: 5, val: 'E' }, // evicts LRU
];

function generateLRUSteps() {
  const steps = [];
  // list = [MRU, ..., LRU] (head = most recent)
  let list = []; // [{key, val}]
  let map = {};  // key -> val
  let hits = 0, misses = 0;

  steps.push({
    list: [...list], map: { ...map }, lastOp: null, evicted: null,
    hits, misses, capacity: CAPACITY, phase: 'init',
    message: `LRU Cache with capacity=${CAPACITY}. Operations: put(k,v) and get(k)`,
    done: false,
  });

  for (let i = 0; i < OPERATIONS.length; i++) {
    const { op, key, val } = OPERATIONS[i];

    if (op === 'put') {
      let evicted = null;
      if (map[key] !== undefined) {
        // update existing — move to front
        list = list.filter(n => n.key !== key);
      } else if (list.length >= CAPACITY) {
        // evict LRU (tail)
        evicted = list[list.length - 1];
        delete map[evicted.key];
        list = list.slice(0, list.length - 1);
      }
      list = [{ key, val }, ...list];
      map[key] = val;

      steps.push({
        list: list.map(n => ({ ...n })), map: { ...map },
        lastOp: { op: 'put', key, val, evicted }, evicted,
        hits, misses, capacity: CAPACITY, phase: 'put',
        message: evicted
          ? `put(${key}, ${val}): cache full → evict LRU key=${evicted.key} (${evicted.val}), insert ${key}=${val} at head`
          : `put(${key}, ${val}): insert at head (MRU)`,
        done: false,
      });
    } else {
      // get
      if (map[key] !== undefined) {
        hits++;
        const foundVal = map[key];
        list = [{ key, val: foundVal }, ...list.filter(n => n.key !== key)];
        steps.push({
          list: list.map(n => ({ ...n })), map: { ...map },
          lastOp: { op: 'get', key, val: foundVal, hit: true }, evicted: null,
          hits, misses, capacity: CAPACITY, phase: 'get_hit',
          message: `get(${key}) → HIT! val=${foundVal}. Move key ${key} to head (MRU).`,
          done: false,
        });
      } else {
        misses++;
        steps.push({
          list: list.map(n => ({ ...n })), map: { ...map },
          lastOp: { op: 'get', key, val: -1, hit: false }, evicted: null,
          hits, misses, capacity: CAPACITY, phase: 'get_miss',
          message: `get(${key}) → MISS! Key not in cache. Return -1.`,
          done: false,
        });
      }
    }
  }

  steps.push({
    list: list.map(n => ({ ...n })), map: { ...map },
    lastOp: null, evicted: null,
    hits, misses, capacity: CAPACITY, phase: 'done',
    message: `Done! ${hits} cache hits, ${misses} cache misses. Hit rate: ${((hits / (hits + misses)) * 100).toFixed(0)}%`,
    done: true,
  });

  return steps;
}

const theory = (
  <div>
    <TheorySection title="LRU Cache">
      <p>The LRU (Least Recently Used) cache evicts the least recently accessed item when capacity is full. It combines a doubly linked list (order) with a hash map (O(1) access):</p>
      <ul className="list-disc pl-4 space-y-1 mt-2">
        <li>List head = Most Recently Used (MRU)</li>
        <li>List tail = Least Recently Used (LRU)</li>
        <li>Hash map: key → node pointer</li>
        <li>get/put both move accessed node to head in O(1)</li>
      </ul>
    </TheorySection>
    <TheorySection title="Why Doubly Linked List?">
      <p>A doubly linked list allows O(1) removal from any position (given a pointer). The hash map gives O(1) node lookup. Together they achieve O(1) for all operations.</p>
    </TheorySection>
    <TheorySection title="Variants">
      <ul className="list-disc pl-4 space-y-1">
        <li>LFU (Least Frequently Used): evict least accessed</li>
        <li>MRU (Most Recently Used): evict most recent (for sequential scans)</li>
        <li>ARC (Adaptive Replacement Cache): combines LRU and LFU</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['get', 'O(1)', 'O(capacity)'],
      ['put', 'O(1)', 'O(capacity)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `class LRUCache {
    int cap;
    list<pair<int,int>> lst; // {key, val}
    unordered_map<int, list<pair<int,int>>::iterator> mp;
public:
    LRUCache(int capacity) : cap(capacity) {}
    int get(int key) {
        if (!mp.count(key)) return -1;
        lst.splice(lst.begin(), lst, mp[key]); // move to front
        return mp[key]->second;
    }
    void put(int key, int val) {
        if (mp.count(key)) lst.erase(mp[key]);
        else if ((int)lst.size() == cap) {
            mp.erase(lst.back().first);
            lst.pop_back();
        }
        lst.push_front({key, val});
        mp[key] = lst.begin();
    }
};`,
    'Python': `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = OrderedDict()

    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)  # MRU
        return self.cache[key]

    def put(self, key, val):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = val
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)  # evict LRU`,
    'JavaScript': `class LRUCache {
    constructor(capacity) {
        this.cap = capacity;
        this.cache = new Map(); // Map preserves insertion order
    }
    get(key) {
        if (!this.cache.has(key)) return -1;
        const val = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, val); // move to end (MRU)
        return val;
    }
    put(key, val) {
        if (this.cache.has(key)) this.cache.delete(key);
        else if (this.cache.size >= this.cap)
            this.cache.delete(this.cache.keys().next().value); // LRU
        this.cache.set(key, val);
    }
}`,
    'Java': `class LRUCache extends LinkedHashMap<Integer,Integer> {
    private int cap;
    LRUCache(int capacity) {
        super(capacity, 0.75f, true); // accessOrder=true
        this.cap = capacity;
    }
    public int get(int key) {
        return super.getOrDefault(key, -1);
    }
    public void put(int key, int value) {
        super.put(key, value);
    }
    protected boolean removeEldestEntry(Map.Entry e) {
        return size() > cap;
    }
}`,
  }} />
);

export default function LRUCache() {
  const [steps] = useState(() => generateLRUSteps());
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(800);
  const timerRef = useRef(null);

  const handleRandomize = useCallback(() => {
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

  const step = steps[currentStep] || { list: [], map: {}, lastOp: null, evicted: null, hits: 0, misses: 0, capacity: CAPACITY, phase: 'init', message: '', done: false };

  return (
    <AlgorithmPageShell
      title="LRU Cache"
      description="Least Recently Used cache using HashMap + Doubly Linked List — O(1) get/put"
      category="Data Structures"
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
      stats={{ capacity: CAPACITY, size: step.list?.length ?? 0, hits: step.hits, misses: step.misses, lastOp: step.lastOp?.op ?? '-' }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(1) get and put operations',
        'Simple eviction policy based on recency',
        'Easy to implement with OrderedDict in Python / LinkedHashMap in Java',
        'Widely used in OS page replacement, CPU caches',
      ]}
      disadvantages={[
        'Does not account for access frequency (use LFU for that)',
        'Evicts recently inserted items if immediately unused',
        'Not ideal for scan-heavy workloads (entire cache gets flushed)',
      ]}
      applications={[
        'Browser cache / DNS cache',
        'CPU cache replacement policy',
        'Database buffer pool management',
        'CDN content caching',
        'Redis / Memcached eviction policy',
      ]}
      interviewTips={[
        'Classic interview question — know the HashMap + DLL combination',
        'Python: use OrderedDict with move_to_end()',
        'Java: extend LinkedHashMap with removeEldestEntry()',
        'JavaScript: Map preserves insertion order — use delete+re-insert to move to end',
        'Always draw the linked list + hash map side by side in interviews',
      ]}
      relatedAlgos={[
        { title: 'Hash Table', route: '/data-structures/hash-table' },
        { title: 'Doubly Linked List', route: '/data-structures/doubly-linked-list' },
        { title: 'Priority Queue', route: '/data-structures/priority-queue' },
      ]}
      practiceProblems={[
        { name: 'LRU Cache', difficulty: 'Medium', url: 'https://leetcode.com/problems/lru-cache/' },
        { name: 'LFU Cache', difficulty: 'Hard', url: 'https://leetcode.com/problems/lfu-cache/' },
        { name: 'All O(1) Data Structure', difficulty: 'Hard', url: 'https://leetcode.com/problems/all-oone-data-structure/' },
      ]}
    >
      {/* Operation indicator */}
      {step.lastOp && (
        <div className={`text-center mb-4 px-4 py-2 rounded-xl text-sm font-semibold ${
          step.phase === 'get_hit' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' :
          step.phase === 'get_miss' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700' :
          'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
        }`}>
          {step.lastOp.op === 'put'
            ? `put(${step.lastOp.key}, ${step.lastOp.val})`
            : `get(${step.lastOp.key}) → ${step.lastOp.hit ? step.lastOp.val : 'MISS (-1)'}`}
          {step.evicted && <span className="ml-2 text-red-500">  Evicted: {step.evicted.key}={step.evicted.val}</span>}
        </div>
      )}

      {/* MRU → LRU list */}
      <div className="mb-4">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">MRU (head)</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs font-semibold text-red-500 dark:text-red-400">LRU (tail)</span>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {step.list && step.list.length > 0 ? (
            step.list.map((node, i) => (
              <React.Fragment key={node.key}>
                <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 font-bold transition-all duration-300 ${
                  step.lastOp?.key === node.key
                    ? step.phase === 'get_hit' || step.phase === 'put'
                      ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 scale-110'
                      : 'border-amber-400 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    : i === 0
                      ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  <span className="text-xs text-gray-400">k={node.key}</span>
                  <span className="text-base">{node.val}</span>
                </div>
                {i < step.list.length - 1 && <span className="text-gray-400 text-sm">⇄</span>}
              </React.Fragment>
            ))
          ) : (
            <span className="text-gray-400 text-sm italic">cache empty</span>
          )}
        </div>
      </div>

      {/* Hash map side */}
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">Hash map (key → value):</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(step.map || {}).map(([k, v]) => (
            <div key={k} className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              step.lastOp?.key === parseInt(k)
                ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}>
              {k} → {v}
            </div>
          ))}
          {Object.keys(step.map || {}).length === 0 && (
            <span className="text-xs text-gray-400 italic">empty</span>
          )}
        </div>
      </div>
    </AlgorithmPageShell>
  );
}
