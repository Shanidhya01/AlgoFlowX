import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

const TABLE_SIZE = 7;
const INSERT_SEQ = [14, 7, 21, 18, 3, 10, 26];

function hashFn(k) { return k % TABLE_SIZE; }

function generateHashSteps() {
  const steps = [];
  // table[i] = array of keys in bucket i
  const table = Array.from({ length: TABLE_SIZE }, () => []);
  let collisions = 0;

  steps.push({
    table: table.map(b => [...b]), insertSeq: [...INSERT_SEQ],
    current: null, hashSlot: -1, phase: 'init',
    collisions, loadFactor: '0.00',
    message: `Hash Table with Separate Chaining. Size=${TABLE_SIZE}, hash(k) = k % ${TABLE_SIZE}`,
    done: false,
  });

  for (let i = 0; i < INSERT_SEQ.length; i++) {
    const key = INSERT_SEQ[i];
    const slot = hashFn(key);
    const isCollision = table[slot].length > 0;
    if (isCollision) collisions++;

    steps.push({
      table: table.map(b => [...b]), insertSeq: INSERT_SEQ.slice(i),
      current: key, hashSlot: slot, phase: 'hash',
      collisions, loadFactor: ((i) / TABLE_SIZE).toFixed(2),
      message: `hash(${key}) = ${key} % ${TABLE_SIZE} = ${slot}${isCollision ? ` ← COLLISION! Slot already has [${table[slot].join(', ')}]` : ' (empty slot)'}`,
      done: false,
    });

    table[slot].push(key);

    steps.push({
      table: table.map(b => [...b]), insertSeq: INSERT_SEQ.slice(i + 1),
      current: key, hashSlot: slot, phase: 'insert',
      collisions, loadFactor: ((i + 1) / TABLE_SIZE).toFixed(2),
      message: `Inserted ${key} at slot ${slot}. Chain: [${table[slot].join(' → ')}]`,
      done: false,
    });
  }

  steps.push({
    table: table.map(b => [...b]), insertSeq: [],
    current: null, hashSlot: -1, phase: 'done',
    collisions, loadFactor: (INSERT_SEQ.length / TABLE_SIZE).toFixed(2),
    message: `Done! ${INSERT_SEQ.length} keys inserted. ${collisions} collisions. Load factor = ${(INSERT_SEQ.length / TABLE_SIZE).toFixed(2)}`,
    done: true,
  });

  return steps;
}

const theory = (
  <div>
    <TheorySection title="Hash Table with Separate Chaining">
      <p>A hash table maps keys to values via a hash function. With separate chaining, each bucket holds a linked list of all keys that hash to that slot. Collisions are handled by growing the chain.</p>
    </TheorySection>
    <TheorySection title="Load Factor">
      <p>Load factor α = n/m (keys/buckets). Average chain length = α. Operations run in O(1 + α):</p>
      <ul className="list-disc pl-4 space-y-1">
        <li>If α is kept ≤ 1 via rehashing: O(1) average</li>
        <li>Worst case: all keys in one chain → O(n)</li>
      </ul>
    </TheorySection>
    <TheorySection title="Open Addressing Alternative">
      <p>Instead of chaining, probe for an empty slot: linear probe h(k)+i, quadratic probe h(k)+i², double hash h(k)+i×h2(k). No extra allocation needed but requires careful deletion handling.</p>
    </TheorySection>
    <ComplexityTable rows={[
      ['Insert', 'O(1) avg', 'O(n) worst'],
      ['Search', 'O(1) avg', 'O(n) worst'],
      ['Delete', 'O(1) avg', 'O(n) worst'],
      ['Space', 'O(n + m)', '—'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `class HashTable {
    int size;
    vector<list<int>> table;
    int hash(int k) { return k % size; }
public:
    HashTable(int sz) : size(sz), table(sz) {}
    void insert(int key) {
        table[hash(key)].push_back(key);
    }
    bool search(int key) {
        for (int k : table[hash(key)])
            if (k == key) return true;
        return false;
    }
    void remove(int key) {
        table[hash(key)].remove(key);
    }
};`,
    'Python': `class HashTable:
    def __init__(self, size=7):
        self.size = size
        self.table = [[] for _ in range(size)]

    def _hash(self, key):
        return key % self.size

    def insert(self, key):
        self.table[self._hash(key)].append(key)

    def search(self, key):
        return key in self.table[self._hash(key)]

    def delete(self, key):
        bucket = self.table[self._hash(key)]
        if key in bucket:
            bucket.remove(key)`,
    'JavaScript': `class HashTable {
    constructor(size = 7) {
        this.size = size;
        this.table = Array.from({ length: size }, () => []);
    }
    hash(key) { return key % this.size; }
    insert(key) { this.table[this.hash(key)].push(key); }
    search(key) { return this.table[this.hash(key)].includes(key); }
    delete(key) {
        const slot = this.hash(key);
        this.table[slot] = this.table[slot].filter(k => k !== key);
    }
}`,
    'Java': `class HashTable {
    private int size;
    private LinkedList<Integer>[] table;
    @SuppressWarnings("unchecked")
    HashTable(int size) {
        this.size = size;
        table = new LinkedList[size];
        for (int i = 0; i < size; i++)
            table[i] = new LinkedList<>();
    }
    int hash(int key) { return key % size; }
    void insert(int key) { table[hash(key)].add(key); }
    boolean search(int key) { return table[hash(key)].contains(key); }
    void delete(int key) { table[hash(key)].remove((Integer)key); }
}`,
  }} />
);

export default function HashTable() {
  const [steps] = useState(() => generateHashSteps());
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(700);
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

  const step = steps[currentStep] || { table: Array.from({ length: TABLE_SIZE }, () => []), current: null, hashSlot: -1, phase: 'init', collisions: 0, loadFactor: '0.00', message: '', done: false };

  return (
    <AlgorithmPageShell
      title="Hash Table"
      description="Hash table with separate chaining — O(1) average insert/search/delete"
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
      stats={{ size: TABLE_SIZE, collisions: step.collisions, loadFactor: step.loadFactor }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'O(1) average insert/search/delete',
        'Flexible key-value storage',
        'Separate chaining handles high load gracefully',
        'Dynamic resizing keeps load factor low',
      ]}
      disadvantages={[
        'O(n) worst case with bad hash function',
        'Extra memory for pointers in chaining',
        'Not cache-friendly (linked lists)',
        'Hash collisions degrade performance',
      ]}
      applications={[
        'Dictionary / map implementations (HashMap in Java, dict in Python)',
        'Counting frequency of elements',
        'Caching (memcached, Redis)',
        'Database index structures',
        'Compiler symbol tables',
      ]}
      interviewTips={[
        'Load factor α = n/m; rehash when α > 0.75 (Java HashMap)',
        'Java HashMap uses chaining + tree (Red-Black) when chain > 8',
        'Open addressing: linear probe clusters, quadratic probe better, double hash best',
        'Universal hashing prevents worst-case adversarial inputs',
        'Python dicts are open addressing with tombstone deletion',
      ]}
      relatedAlgos={[
        { title: 'LRU Cache', route: '/data-structures/lru-cache' },
        { title: 'Trie', route: '/trees/trie' },
        { title: 'Counting Set Bits', route: '/bit-manipulation/counting-set-bits' },
      ]}
      practiceProblems={[
        { name: 'Two Sum', difficulty: 'Easy', url: 'https://leetcode.com/problems/two-sum/' },
        { name: 'Group Anagrams', difficulty: 'Medium', url: 'https://leetcode.com/problems/group-anagrams/' },
        { name: 'LRU Cache', difficulty: 'Medium', url: 'https://leetcode.com/problems/lru-cache/' },
        { name: 'Design HashMap', difficulty: 'Easy', url: 'https://leetcode.com/problems/design-hashmap/' },
      ]}
    >
      {/* Hash equation */}
      {step.current != null && (
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 font-mono text-sm text-amber-700 dark:text-amber-300">
            hash({step.current}) = {step.current} % {TABLE_SIZE} = {step.hashSlot}
          </span>
        </div>
      )}

      {/* Bucket slots */}
      <div className="space-y-1.5">
        {(step.table || []).map((bucket, i) => (
          <div key={i} className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all duration-200 ${
            step.hashSlot === i
              ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              step.hashSlot === i ? 'bg-amber-400 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>{i}</div>
            <div className="flex items-center gap-1.5 flex-1 min-h-[28px]">
              {bucket.length === 0 ? (
                <span className="text-xs text-gray-300 dark:text-gray-600 italic">empty</span>
              ) : (
                bucket.map((k, j) => (
                  <React.Fragment key={j}>
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      k === step.current && step.hashSlot === i && step.phase === 'insert'
                        ? 'bg-emerald-400 text-white scale-110'
                        : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
                    }`}>{k}</div>
                    {j < bucket.length - 1 && <span className="text-gray-400 text-xs">→</span>}
                  </React.Fragment>
                ))
              )}
            </div>
            {step.hashSlot === i && step.phase === 'hash' && bucket.length > 0 && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex-shrink-0">COLLISION</span>
            )}
          </div>
        ))}
      </div>
    </AlgorithmPageShell>
  );
}
