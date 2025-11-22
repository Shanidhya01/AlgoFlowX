import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, Search } from 'lucide-react';

function KMPPatternMatcher() {
  const [tab, setTab] = useState('visualizer');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(800);

  const [text, setText] = useState('ABABDABACDABABCABAB');
  const [pattern, setPattern] = useState('ABABCABAB');
  const [textIndex, setTextIndex] = useState(-1);
  const [patternIndex, setPatternIndex] = useState(-1);
  const [matches, setMatches] = useState([]);
  const [lps, setLps] = useState([]);
  const [message, setMessage] = useState('');
  const [phase, setPhase] = useState('lps'); // 'lps' or 'search'

  // Build LPS (Longest Proper Prefix which is also Suffix)
  const buildLPS = useCallback((pattern) => {
    const operationSteps = [];
    const n = pattern.length;
    const lpsArray = Array(n).fill(0);

    operationSteps.push({
      type: 'initialize',
      message: `Building LPS array for pattern "${pattern}". LPS[i] stores length of longest proper prefix which is also suffix.`,
      text: '',
      pattern: pattern,
      textIndex: -1,
      patternIndex: -1,
      matches: [],
      lps: lpsArray,
      phase: 'lps',
      currentLpsIndex: -1
    });

    let len = 0;
    let i = 1;

    while (i < n) {
      operationSteps.push({
        type: 'compare_lps',
        message: `Comparing pattern[${len}]='${pattern[len]}' with pattern[${i}]='${pattern[i]}'`,
        text: '',
        pattern: pattern,
        textIndex: -1,
        patternIndex: -1,
        matches: [],
        lps: [...lpsArray],
        phase: 'lps',
        currentLpsIndex: i
      });

      if (pattern[len] === pattern[i]) {
        len++;
        lpsArray[i] = len;

        operationSteps.push({
          type: 'lps_match',
          message: `Match! LPS[${i}] = ${len}. Characters match, incrementing both pointers.`,
          text: '',
          pattern: pattern,
          textIndex: -1,
          patternIndex: -1,
          matches: [],
          lps: [...lpsArray],
          phase: 'lps',
          currentLpsIndex: i
        });

        i++;
      } else {
        if (len !== 0) {
          len = lpsArray[len - 1];

          operationSteps.push({
            type: 'lps_backtrack',
            message: `No match. Backtracking to LPS[${len - 1}] = ${len}`,
            text: '',
            pattern: pattern,
            textIndex: -1,
            patternIndex: -1,
            matches: [],
            lps: [...lpsArray],
            phase: 'lps',
            currentLpsIndex: i
          });
        } else {
          operationSteps.push({
            type: 'lps_zero',
            message: `No match and len=0. LPS[${i}] = 0`,
            text: '',
            pattern: pattern,
            textIndex: -1,
            patternIndex: -1,
            matches: [],
            lps: [...lpsArray],
            phase: 'lps',
            currentLpsIndex: i
          });

          i++;
        }
      }
    }

    operationSteps.push({
      type: 'lps_complete',
      message: `LPS array complete: [${lpsArray.join(', ')}]. Ready for pattern matching.`,
      text: '',
      pattern: pattern,
      textIndex: -1,
      patternIndex: -1,
      matches: [],
      lps: lpsArray,
      phase: 'lps_complete',
      currentLpsIndex: -1
    });

    return { steps: operationSteps, lps: lpsArray };
  }, []);

  // KMP Search
  const kmpSearch = useCallback((text, pattern) => {
    const operationSteps = [];
    const matchPositions = [];
    const { lps: lpsArray } = buildLPS(pattern);

    operationSteps.push({
      type: 'initialize_search',
      message: `Starting KMP search for pattern "${pattern}" in text "${text}"`,
      text: text,
      pattern: pattern,
      textIndex: -1,
      patternIndex: -1,
      matches: [],
      lps: lpsArray,
      phase: 'search',
      currentLpsIndex: -1
    });

    let i = 0; // text index
    let j = 0; // pattern index

    while (i < text.length) {
      operationSteps.push({
        type: 'compare',
        message: `Comparing text[${i}]='${text[i]}' with pattern[${j}]='${pattern[j]}'`,
        text: text,
        pattern: pattern,
        textIndex: i,
        patternIndex: j,
        matches: [...matchPositions],
        lps: lpsArray,
        phase: 'search',
        currentLpsIndex: -1
      });

      if (pattern[j] === text[i]) {
        operationSteps.push({
          type: 'char_match',
          message: `Match! Moving both pointers forward.`,
          text: text,
          pattern: pattern,
          textIndex: i,
          patternIndex: j,
          matches: [...matchPositions],
          lps: lpsArray,
          phase: 'search',
          currentLpsIndex: -1
        });

        i++;
        j++;
      }

      if (j === pattern.length) {
        operationSteps.push({
          type: 'pattern_found',
          message: `✓ Pattern found at index ${i - j}!`,
          text: text,
          pattern: pattern,
          textIndex: i,
          patternIndex: j,
          matches: [...matchPositions, i - j],
          lps: lpsArray,
          phase: 'search',
          currentLpsIndex: -1
        });

        matchPositions.push(i - j);
        j = lpsArray[j - 1];
      } else if (i < text.length && pattern[j] !== text[i]) {
        if (j !== 0) {
          operationSteps.push({
            type: 'use_lps',
            message: `Mismatch! Using LPS to avoid re-scanning. j = LPS[${j - 1}] = ${lpsArray[j - 1]}`,
            text: text,
            pattern: pattern,
            textIndex: i,
            patternIndex: j,
            matches: [...matchPositions],
            lps: lpsArray,
            phase: 'search',
            currentLpsIndex: -1
          });

          j = lpsArray[j - 1];
        } else {
          operationSteps.push({
            type: 'no_match',
            message: `Mismatch at start of pattern. Incrementing text pointer.`,
            text: text,
            pattern: pattern,
            textIndex: i,
            patternIndex: j,
            matches: [...matchPositions],
            lps: lpsArray,
            phase: 'search',
            currentLpsIndex: -1
          });

          i++;
        }
      }
    }

    operationSteps.push({
      type: 'complete',
      message: `Search complete! Found ${matchPositions.length} match${matchPositions.length !== 1 ? 'es' : ''} at position${matchPositions.length !== 1 ? 's' : ''}: ${matchPositions.join(', ')}. Time: O(n+m)`,
      text: text,
      pattern: pattern,
      textIndex: -1,
      patternIndex: -1,
      matches: matchPositions,
      lps: lpsArray,
      phase: 'complete',
      currentLpsIndex: -1
    });

    return operationSteps;
  }, [buildLPS]);

  const runAlgorithm = () => {
    if (!text.trim() || !pattern.trim()) {
      alert('Please enter both text and pattern');
      return;
    }
    const operationSteps = kmpSearch(text.toUpperCase(), pattern.toUpperCase());
    setSteps(operationSteps);
    setCurrentStep(0);
  };

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  const resetAnimation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setTextIndex(-1);
    setPatternIndex(-1);
    setMatches([]);
    setLps([]);
    setPhase('lps');
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  useEffect(() => {
    if (isRunning && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, animationSpeed);
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length - 1) {
      setIsRunning(false);
    }
  }, [isRunning, currentStep, steps.length, animationSpeed]);

  useEffect(() => {
    if (steps[currentStep]) {
      const step = steps[currentStep];
      setTextIndex(step.textIndex ?? -1);
      setPatternIndex(step.patternIndex ?? -1);
      setMatches(step.matches ?? []);
      setLps(step.lps ?? []);
      setMessage(step.message ?? '');
      setPhase(step.phase ?? 'lps');
    }
  }, [currentStep, steps]);

  const renderVisualizer = () => (
    <div className="space-y-6">
      {/* Text and Pattern Input */}
      <div className="bg-white/90 dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Search className="text-blue-600" size={28} />
          KMP Pattern Matching
        </h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Text:</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value.toUpperCase())}
              disabled={isRunning || steps.length > 0}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter text to search in"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Pattern:</label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value.toUpperCase())}
              disabled={isRunning || steps.length > 0}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter pattern to find"
            />
          </div>
        </div>

        {/* Text Visualization */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Text:</p>
          <div className="flex gap-1 flex-wrap">
            {text.split('').map((char, idx) => {
              const isMatch = matches.some(pos => idx >= pos && idx < pos + pattern.length);
              const isCurrentText = idx === textIndex;

              return (
                <div
                  key={idx}
                  className={`w-10 h-10 flex items-center justify-center border-2 font-bold rounded transition-all ${
                    isCurrentText
                      ? 'bg-yellow-300 border-yellow-600 scale-110'
                      : isMatch
                      ? 'bg-green-200 border-green-600'
                      : 'bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500'
                  }`}
                >
                  {char}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pattern Visualization */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Pattern:</p>
          <div className="flex gap-1 flex-wrap">
            {pattern.split('').map((char, idx) => {
              const isCurrentPattern = idx === patternIndex;

              return (
                <div
                  key={idx}
                  className={`w-10 h-10 flex items-center justify-center border-2 font-bold rounded transition-all ${
                    isCurrentPattern
                      ? 'bg-blue-300 border-blue-600 scale-110'
                      : 'bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500'
                  }`}
                >
                  {char}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LPS Array */}
      {lps.length > 0 && (
        <div className="bg-white/90 dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">LPS (Longest Proper Prefix Suffix) Array</h4>
          <div className="space-y-3">
            <div className="flex gap-1 flex-wrap">
              {pattern.split('').map((char, idx) => (
                <div key={`char-${idx}`} className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 font-bold">
                  {char}
                </div>
              ))}
            </div>
            <div className="flex gap-1 flex-wrap">
              {lps.map((val, idx) => (
                <div key={`lps-${idx}`} className="w-10 h-10 flex items-center justify-center border-2 border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900 font-bold text-blue-600 dark:text-blue-300">
                  {val}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Matches */}
      {matches.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-6 shadow-lg border-2 border-green-300 dark:border-green-700">
          <h4 className="text-lg font-semibold mb-4 text-green-900 dark:text-green-300">Matches Found: {matches.length}</h4>
          <div className="flex gap-2 flex-wrap">
            {matches.map((pos, idx) => (
              <span key={idx} className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold">
                Position {pos}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 dark:text-gray-400">Text Length</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{text.length}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg border-l-4 border-purple-500">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pattern Length</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{pattern.length}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg border-l-4 border-green-500">
          <p className="text-sm text-gray-600 dark:text-gray-400">Matches</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{matches.length}</p>
        </div>
      </div>
    </div>
  );

  const TheorySection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        KMP Pattern Matching Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">What is KMP?</h3>
          <p className="text-gray-700 dark:text-gray-300">
            KMP (Knuth-Morris-Pratt) is an efficient string searching algorithm that avoids re-scanning matched characters. It uses a preprocessing step to build an LPS (Longest Proper Prefix which is also Suffix) array that guides the search.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Why KMP is Better</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>No re-scanning of matched text</li>
              <li>Linear time: O(n+m)</li>
              <li>Predictable performance</li>
              <li>Works with repeated patterns</li>
              <li>Better than naive approach</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">Algorithm Steps</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Build LPS array from pattern</li>
              <li>Compare text and pattern chars</li>
              <li>Use LPS on mismatch</li>
              <li>No backtracking in text</li>
              <li>Record all matches</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">LPS Array Explanation</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
            <p>For each position in the pattern, LPS stores the length of the longest prefix that is also a suffix at that position.</p>
            <p className="ml-4">Example: Pattern "ABABCABAB"</p>
            <p className="ml-4 font-mono">Position: 0 1 2 3 4 5 6 7 8</p>
            <p className="ml-4 font-mono">Pattern:  A B A B C A B A B</p>
            <p className="ml-4 font-mono">LPS:      0 0 1 2 0 1 2 3 4</p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Complexity Analysis</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm font-mono">
            <p>Building LPS: <span className="font-bold">O(m)</span> where m = pattern length</p>
            <p>Search: <span className="font-bold">O(n)</span> where n = text length</p>
            <p>Total: <span className="font-bold">O(n+m)</span> - much better than naive O(n×m)</p>
          </div>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
        KMP Implementation
      </h2>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
        <h4 className="font-semibold mb-3 text-lg">Build LPS Array</h4>
        <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
          <code>{`BUILD-LPS(pattern):
  n = pattern.length
  lps = array of size n
  lps[0] = 0
  len = 0
  i = 1
  
  while i < n:
    if pattern[len] == pattern[i]:
      len++
      lps[i] = len
      i++
    else:
      if len != 0:
        len = lps[len - 1]
      else:
        lps[i] = 0
        i++
  
  return lps`}</code>
        </pre>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
        <h4 className="font-semibold mb-3 text-lg">KMP Search</h4>
        <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
          <code>{`KMP-SEARCH(text, pattern):
  lps = BUILD-LPS(pattern)
  matches = []
  i = 0  // text index
  j = 0  // pattern index
  
  while i < text.length:
    if pattern[j] == text[i]:
      i++
      j++
    
    if j == pattern.length:
      matches.push(i - j)
      j = lps[j - 1]
    else if i < text.length AND pattern[j] != text[i]:
      if j != 0:
        j = lps[j - 1]
      else:
        i++
  
  return matches`}</code>
        </pre>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Key Insight</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            When a mismatch occurs, instead of starting over, use LPS to skip positions that we know will fail.
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <h4 className="font-semibold mb-2 text-green-900 dark:text-green-300">Comparison</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Naive: O(n×m) re-scans</li>
            <li>KMP: O(n+m) one pass</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
            KMP Pattern Matching Visualizer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Master the Knuth-Morris-Pratt algorithm by visualizing LPS array construction and efficient pattern matching.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 shadow-lg mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'visualizer', label: 'Visualizer', icon: Search },
              { id: 'theory', label: 'Theory', icon: BookOpen },
              { id: 'pseudocode', label: 'Algorithm', icon: Code }
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    tab === t.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Icon size={18} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        {tab === 'visualizer' && (
          <div className="bg-white/80 dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <button
                onClick={runAlgorithm}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                <Search size={18} /> Search
              </button>

              <button
                onClick={toggleAnimation}
                disabled={steps.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} />}
                {isRunning ? 'Pause' : 'Play'}
              </button>

              <button
                onClick={stepForward}
                disabled={currentStep >= steps.length - 1 || steps.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                <StepForward size={18} /> Step
              </button>

              <button
                onClick={resetAnimation}
                disabled={steps.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                <RotateCcw size={18} /> Reset
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm font-medium">Speed:</span>
                <select
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                  className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1500}>Slow</option>
                  <option value={800}>Normal</option>
                  <option value={300}>Fast</option>
                </select>
              </div>
            </div>

            {steps.length > 0 && (
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Step {currentStep + 1} of {steps.length}</span>
                  <span>Time: {steps[currentStep].time} ms</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">Input:</span>
                  <span className="font-semibold">{steps[currentStep].input}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">Output:</span>
                  <span className="font-semibold">{steps[currentStep].output}</span>
                </div>
              </div>
            )}
          </div>
        )}        
      </div>
    </div>
  );
};

export default KMPPatternMatcher;