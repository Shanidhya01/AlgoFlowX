import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmPageShell, TheorySection, ComplexityTable, MultiLangCode } from '../../components/AlgorithmPageShell';

function toGray(i) {
  return i ^ (i >> 1);
}

function toBinaryN(n, bits) {
  return (n >>> 0).toString(2).padStart(bits, '0');
}

function findChangedBit(prev, curr, bits) {
  const diff = prev ^ curr;
  for (let i = bits - 1; i >= 0; i--) {
    if ((diff >> i) & 1) return bits - 1 - i; // index from left
  }
  return -1;
}

function generateSteps(nBits) {
  const total = 1 << nBits;
  const steps = [];

  steps.push({
    n: nBits,
    total,
    currentIdx: -1,
    currentGray: null,
    currentBin: null,
    changedBitIdx: -1,
    message: `Gray code for n=${nBits} bits: ${total} codes (0 to ${total - 1}). Each consecutive code differs by exactly 1 bit.`,
    done: false,
  });

  let prevGray = null;
  for (let i = 0; i < total; i++) {
    const gray = toGray(i);
    const grayBin = toBinaryN(gray, nBits);
    const iBin = toBinaryN(i, nBits);
    const changedBitIdx = prevGray !== null ? findChangedBit(prevGray, gray, nBits) : -1;

    steps.push({
      n: nBits,
      total,
      currentIdx: i,
      currentGray: gray,
      currentGrayBin: grayBin,
      currentBin: iBin,
      changedBitIdx,
      message: i === 0
        ? `Index 0: Gray(0) = 0 ^ (0 >> 1) = ${gray} (${grayBin}). Starting code.`
        : `Index ${i}: Gray(${i}) = ${i} ^ ${i >> 1} = ${gray} (${grayBin}). Changed bit at position ${changedBitIdx} (from left).`,
      done: i === total - 1,
    });

    prevGray = gray;
  }

  return steps;
}

function BitCells({ binary, changedBitIdx }) {
  return (
    <div className="flex gap-1">
      {binary.split('').map((bit, idx) => {
        let cellClass = bit === '1'
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
        if (idx === changedBitIdx) cellClass = 'bg-amber-400 text-white';
        return (
          <div
            key={idx}
            className={`inline-flex items-center justify-center w-8 h-8 rounded font-mono font-bold text-sm transition-all duration-300 ${cellClass}`}
          >
            {bit}
          </div>
        );
      })}
    </div>
  );
}

// SVG ring of gray codes
function GrayRing({ nBits, currentIdx }) {
  const total = 1 << nBits;
  const cx = 140, cy = 140, r = 100;

  return (
    <svg width="280" height="280" viewBox="0 0 280 280">
      {Array.from({ length: total }, (_, i) => {
        const angle = (2 * Math.PI * i) / total - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        const gray = toGray(i);
        const grayBin = toBinaryN(gray, nBits);
        const isActive = i === currentIdx;

        return (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r={nBits <= 3 ? 20 : 16}
              className={`transition-all duration-300 ${
                isActive
                  ? 'fill-amber-400 stroke-amber-600'
                  : 'fill-blue-100 dark:fill-blue-900 stroke-blue-400 dark:stroke-blue-600'
              }`}
              strokeWidth="1.5"
            />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={nBits <= 3 ? '10' : '8'}
              className={`font-mono font-bold ${isActive ? 'fill-white' : 'fill-blue-800 dark:fill-blue-200'}`}
              fill={isActive ? 'white' : undefined}
            >
              {grayBin}
            </text>
          </g>
        );
      })}
      {/* Lines connecting ring */}
      {Array.from({ length: total }, (_, i) => {
        const a1 = (2 * Math.PI * i) / total - Math.PI / 2;
        const a2 = (2 * Math.PI * ((i + 1) % total)) / total - Math.PI / 2;
        const x1 = cx + (r - (nBits <= 3 ? 20 : 16)) * Math.cos(a1);
        const y1 = cy + (r - (nBits <= 3 ? 20 : 16)) * Math.sin(a1);
        const x2 = cx + (r - (nBits <= 3 ? 20 : 16)) * Math.cos(a2);
        const y2 = cy + (r - (nBits <= 3 ? 20 : 16)) * Math.sin(a2);
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            className="stroke-gray-300 dark:stroke-gray-600"
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}

const theory = (
  <div>
    <TheorySection title="What Is Gray Code?">
      <p>
        Gray code (also called reflected binary code) is a sequence of binary numbers where consecutive values differ by exactly one bit.
        This property is called the "unit distance" property.
      </p>
    </TheorySection>
    <TheorySection title="Formula">
      <p>
        Gray code of integer i: <code>G(i) = i XOR (i &gt;&gt; 1)</code>.
        To decode gray code g back to integer: iterate from MSB, each bit is XOR of itself and the decoded bit above.
      </p>
    </TheorySection>
    <TheorySection title="Applications">
      <ul className="list-disc pl-4 space-y-1">
        <li><strong>Rotary encoders:</strong> Shaft position sensors use Gray code — a 1-bit error only moves one step, never jumps wildly.</li>
        <li><strong>Karnaugh maps:</strong> K-map axes use Gray code order so adjacent cells differ by one variable.</li>
        <li><strong>Error correction:</strong> Minimizes errors in noisy digital transitions.</li>
        <li><strong>Genetic algorithms:</strong> Gray code representation can improve convergence.</li>
      </ul>
    </TheorySection>
    <ComplexityTable rows={[
      ['Generate all codes', 'O(2^n)', 'O(2^n)'],
      ['Encode i to gray', 'O(1)', 'O(1)'],
      ['Decode gray to i', 'O(log n)', 'O(1)'],
    ]} />
  </div>
);

const code = (
  <MultiLangCode implementations={{
    'C++': `// Encode: integer to Gray code
int toGray(int n) {
    return n ^ (n >> 1);
}

// Decode: Gray code to integer
int fromGray(int gray) {
    int n = 0;
    for (; gray; gray >>= 1) n ^= gray;
    return n;
}

// Generate all n-bit Gray codes
vector<int> grayCode(int n) {
    vector<int> result;
    for (int i = 0; i < (1 << n); i++)
        result.push_back(toGray(i));
    return result;
}`,
    'Python': `def to_gray(n: int) -> int:
    """Encode integer to Gray code."""
    return n ^ (n >> 1)

def from_gray(gray: int) -> int:
    """Decode Gray code to integer."""
    n = 0
    while gray:
        n ^= gray
        gray >>= 1
    return n

def gray_code(n: int) -> list[int]:
    """Generate all n-bit Gray codes."""
    return [i ^ (i >> 1) for i in range(1 << n)]`,
    'JavaScript': `function toGray(n) {
    return n ^ (n >> 1);
}

function fromGray(gray) {
    let n = 0;
    for (; gray; gray >>= 1) n ^= gray;
    return n;
}

function grayCode(n) {
    return Array.from({ length: 1 << n }, (_, i) => i ^ (i >> 1));
}`,
    'Java': `public class GrayCode {
    public static int toGray(int n) {
        return n ^ (n >> 1);
    }

    public static int fromGray(int gray) {
        int n = 0;
        for (; gray != 0; gray >>= 1) n ^= gray;
        return n;
    }

    public static List<Integer> grayCode(int n) {
        List<Integer> result = new ArrayList<>();
        for (int i = 0; i < (1 << n); i++)
            result.add(i ^ (i >> 1));
        return result;
    }
}`,
  }} />
);

const DEFAULT_N = 3;

export default function GrayCode() {
  const [nBits, setNBits] = useState(DEFAULT_N);
  const [inputVal, setInputVal] = useState(String(DEFAULT_N));
  const [inputError, setInputError] = useState('');
  const [steps, setSteps] = useState(() => generateSteps(DEFAULT_N));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const timerRef = useRef(null);

  const step = steps[currentStep] || steps[0];
  const total = 1 << nBits;

  // Build full table
  const tableRows = Array.from({ length: total }, (_, i) => {
    const gray = toGray(i);
    const grayBin = toBinaryN(gray, nBits);
    const iBin = toBinaryN(i, nBits);
    const prev = i > 0 ? toGray(i - 1) : null;
    const changedBit = prev !== null ? findChangedBit(prev, gray, nBits) : -1;
    return { i, iBin, gray, grayBin, changedBit };
  });

  const handleCustomInput = (val) => {
    setInputVal(val);
    const n = parseInt(val.trim(), 10);
    if (isNaN(n) || n < 2 || n > 5) {
      setInputError('Enter a number of bits between 2 and 5');
      return;
    }
    setInputError('');
    setNBits(n);
    setSteps(generateSteps(n));
    setCurrentStep(0);
    setIsRunning(false);
  };

  const handleRandomize = useCallback(() => {
    const n = Math.floor(Math.random() * 4) + 2; // 2-5
    setInputVal(String(n));
    setInputError('');
    setNBits(n);
    setSteps(generateSteps(n));
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
      title="Gray Code"
      description="Generate n-bit Gray code where consecutive values differ by exactly one bit: G(i) = i XOR (i >> 1)"
      category="Bit Manipulation"
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
      customInput={inputVal}
      onCustomInput={handleCustomInput}
      inputError={inputError}
      inputPlaceholder="e.g. 3"
      inputLabel="Number of bits (2–5)"
      showInput={true}
      stats={{ n: nBits, total: `2^${nBits} = ${total}`, currentCode: step.currentGrayBin || '—' }}
      message={step.message}
      done={!!step.done}
      theory={theory}
      code={code}
      advantages={[
        'Only 1 bit changes between consecutive values — minimizes glitches in hardware',
        'O(1) encoding and near-O(1) decoding per code',
        'Widely used in K-maps, encoders, and error-correction',
      ]}
      disadvantages={[
        'Arithmetic on Gray codes is non-trivial — must decode first',
        'The sequence wraps around (last to first also differs by 1 bit — it is cyclic)',
      ]}
      applications={[
        'Rotary shaft encoders in motors and robotics',
        'Karnaugh maps in digital logic design',
        'Genetic algorithm chromosome representation',
        'Error correction in digital communication',
        'LeetCode Gray Code problem (generate sequence)',
      ]}
      interviewTips={[
        'Formula: G(i) = i ^ (i >> 1) — memorize this one-liner',
        'Decode: iterate XOR from MSB: n = 0; while (gray) { n ^= gray; gray >>= 1; }',
        'The sequence is cyclic — the last and first codes also differ by exactly 1 bit',
        'For LeetCode: start with [0], then repeatedly prepend 0s and append reversed list with 1s prepended',
      ]}
      relatedAlgos={[
        { title: 'XOR Tricks', route: '/xor-tricks' },
        { title: 'Subset Generation (Bitmask)', route: '/subset-bitmask' },
      ]}
      practiceProblems={[
        { name: 'Gray Code', difficulty: 'Medium', url: 'https://leetcode.com/problems/gray-code/' },
        { name: 'Minimum Bit Flips to Convert Number', difficulty: 'Easy', url: 'https://leetcode.com/problems/minimum-bit-flips-to-convert-number/' },
      ]}
    >
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        {/* Ring visualization */}
        <div className="flex flex-col items-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gray Code Ring</p>
          <GrayRing nBits={nBits} currentIdx={step.currentIdx} />
          <p className="text-xs text-gray-400 mt-1">Amber = current code</p>
        </div>

        {/* Table */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">All {total} Gray Codes</p>
          <div className="overflow-auto max-h-72 rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-bold text-gray-500 dark:text-gray-400 text-xs">Index</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-500 dark:text-gray-400 text-xs">Binary</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-500 dark:text-gray-400 text-xs">Gray Code</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-500 dark:text-gray-400 text-xs">Changed Bit</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(({ i, iBin, gray, grayBin, changedBit }) => {
                  const isActive = i === step.currentIdx;
                  return (
                    <tr
                      key={i}
                      className={`border-t border-gray-100 dark:border-gray-800 transition-all duration-200 ${
                        isActive ? 'bg-amber-50 dark:bg-amber-950/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                      }`}
                    >
                      <td className="px-3 py-1.5 font-mono text-gray-600 dark:text-gray-400">{i}</td>
                      <td className="px-3 py-1.5 font-mono text-gray-600 dark:text-gray-400">{iBin}</td>
                      <td className="px-3 py-1.5">
                        <BitCells binary={grayBin} changedBitIdx={isActive ? changedBit : -1} />
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        {changedBit >= 0 ? (
                          <span className="inline-block bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded px-2 py-0.5 text-xs font-bold">
                            Bit {changedBit}
                          </span>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Current step display */}
      {step.currentIdx >= 0 && (
        <div className="mt-4 flex justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Gray Code</p>
            <div className="flex justify-center gap-1.5 mb-2">
              <BitCells binary={step.currentGrayBin || ''} changedBitIdx={step.changedBitIdx} />
            </div>
            <p className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
              G({step.currentIdx}) = {step.currentGray} ({step.currentGrayBin})
            </p>
          </div>
        </div>
      )}
    </AlgorithmPageShell>
  );
}
