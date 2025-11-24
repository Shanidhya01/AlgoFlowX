import React, { useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Code, BookOpen, Zap } from 'lucide-react';

function Huffman() {
  const [tab, setTab] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [inputText, setInputText] = useState('HUFFMAN CODING ALGORITHM');
  const [userInput, setUserInput] = useState('');
  const [showInput, setShowInput] = useState(true);

  const buildHuffmanTree = useCallback((text) => {
    const operationSteps = [];
    
    // Step 1: Count frequencies
    const frequencies = {};
    for (let char of text) {
      frequencies[char] = (frequencies[char] || 0) + 1;
    }

    operationSteps.push({
      type: 'initialize',
      message: `Input text: "${text}" (${text.length} characters)`,
      frequencies,
      tree: null,
      codes: {},
      stats: { originalBits: text.length * 8, compressedBits: 0 }
    });

    // Step 2: Create nodes
    operationSteps.push({
      type: 'frequency_analysis',
      message: `Analyzed frequencies: ${Object.keys(frequencies).length} unique characters found`,
      frequencies,
      tree: null,
      codes: {},
      stats: { originalBits: text.length * 8, compressedBits: 0 }
    });

    // Build tree
    class Node {
      constructor(char = null, freq = 0, left = null, right = null) {
        this.char = char;
        this.freq = freq;
        this.left = left;
        this.right = right;
      }
    }

    let nodes = Object.entries(frequencies).map(([char, freq]) => new Node(char, freq));
    
    operationSteps.push({
      type: 'create_nodes',
      message: `Created ${nodes.length} leaf nodes for each character`,
      frequencies,
      tree: null,
      codes: {},
      stats: { originalBits: text.length * 8, compressedBits: 0 }
    });

    // Build Huffman Tree
    let step = 0;
    while (nodes.length > 1) {
      nodes.sort((a, b) => a.freq - b.freq);
      const left = nodes.shift();
      const right = nodes.shift();
      const parent = new Node(null, left.freq + right.freq, left, right);
      nodes.push(parent);

      operationSteps.push({
        type: 'merge_nodes',
        message: `Merged nodes (${left.freq}) + (${right.freq}) = ${parent.freq}. Remaining: ${nodes.length}`,
        frequencies,
        tree: parent,
        codes: {},
        stats: { originalBits: text.length * 8, compressedBits: 0 }
      });
      
      step++;
    }

    const huffmanTree = nodes[0];

    operationSteps.push({
      type: 'tree_complete',
      message: `Huffman tree built with ${step} merge operations`,
      frequencies,
      tree: huffmanTree,
      codes: {},
      stats: { originalBits: text.length * 8, compressedBits: 0 }
    });

    // Generate codes
    const codes = {};
    const generateCodes = (node, code = '') => {
      if (!node) return;
      if (node.char) {
        codes[node.char] = code || '0';
      } else {
        generateCodes(node.left, code + '0');
        generateCodes(node.right, code + '1');
      }
    };

    generateCodes(huffmanTree);

    // Calculate compressed bits
    let compressedBits = 0;
    for (let char of text) {
      compressedBits += codes[char].length;
    }

    operationSteps.push({
      type: 'codes_generated',
      message: `Generated Huffman codes for all characters`,
      frequencies,
      tree: huffmanTree,
      codes,
      stats: { originalBits: text.length * 8, compressedBits, compressionRatio: ((1 - compressedBits / (text.length * 8)) * 100).toFixed(2) }
    });

    // Encode
    let encoded = '';
    for (let char of text) {
      encoded += codes[char];
    }

    operationSteps.push({
      type: 'encoding_complete',
      message: `Encoding complete: ${encoded.length} bits (was ${text.length * 8} bits)`,
      frequencies,
      tree: huffmanTree,
      codes,
      encoded,
      stats: { originalBits: text.length * 8, compressedBits, compressionRatio: ((1 - compressedBits / (text.length * 8)) * 100).toFixed(2) }
    });

    operationSteps.push({
      type: 'complete',
      message: `✓ Complete! Compression achieved: ${((1 - compressedBits / (text.length * 8)) * 100).toFixed(2)}% reduction`,
      frequencies,
      tree: huffmanTree,
      codes,
      encoded,
      stats: { originalBits: text.length * 8, compressedBits, compressionRatio: ((1 - compressedBits / (text.length * 8)) * 100).toFixed(2) }
    });

    return operationSteps;
  }, []);

  const handleSolve = () => {
    const text = userInput.toUpperCase() || inputText;
    const operationSteps = buildHuffmanTree(text);
    setSteps(operationSteps);
    setCurrentStep(0);
    setShowInput(false);
  };

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  const resetAnimation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setShowInput(true);
    setUserInput('');
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  React.useEffect(() => {
    if (isRunning && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, animationSpeed);
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length - 1) {
      setIsRunning(false);
    }
  }, [isRunning, currentStep, steps.length, animationSpeed]);

  const currentStepData = steps[currentStep] || {};

  const render = () => (
    <div className="space-y-6">
      <div className="bg-white/90 dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Zap className="text-blue-600" size={28} />
          Huffman Coding Visualization
        </h3>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Statistics */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-700">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Compression Stats</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Original Size</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currentStepData.stats?.originalBits} bits</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Compressed Size</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{currentStepData.stats?.compressedBits} bits</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Compression Ratio</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{currentStepData.stats?.compressionRatio}%</p>
                </div>
              </div>
            </div>

            {/* Character Frequencies */}
            {currentStepData.frequencies && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Character Frequencies</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {Object.entries(currentStepData.frequencies).sort((a, b) => b[1] - a[1]).map(([char, freq]) => (
                    <div key={char} className="flex items-center gap-2">
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-bold w-8">'{char}'</span>
                      <div className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full h-4">
                        <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${(freq / Math.max(...Object.values(currentStepData.frequencies))) * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-mono text-gray-600 dark:text-gray-400 w-12 text-right">{freq}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Codes */}
          <div className="space-y-4">
            {Object.keys(currentStepData.codes || {}).length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Huffman Codes</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {Object.entries(currentStepData.codes).sort((a, b) => a[1].length - b[1].length).map(([char, code]) => (
                    <div key={char} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-600 rounded">
                      <span className="font-mono text-green-600 dark:text-green-400 font-bold w-8">'{char}'</span>
                      <span className="font-mono bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded text-sm font-bold text-yellow-900 dark:text-yellow-300">{code}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{code.length} bits</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStepData.encoded && (
              <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4 border border-purple-300 dark:border-purple-700">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Encoded Output</h4>
                <div className="font-mono text-xs bg-white dark:bg-gray-800 p-3 rounded break-all max-h-20 overflow-y-auto text-purple-700 dark:text-purple-300">
                  {currentStepData.encoded}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const TheorySection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Huffman Coding Theory
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">What is Huffman Coding?</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Huffman coding is a lossless data compression algorithm that assigns variable-length codes to characters based on their frequency. More frequent characters get shorter codes, reducing overall file size. It's optimal for prefix-free codes and widely used in JPEG, PNG, and ZIP formats.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Key Principles</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Variable-length encoding</li>
              <li>Prefix-free property</li>
              <li>Optimal for frequency-based compression</li>
              <li>Greedy algorithm approach</li>
              <li>Binary tree representation</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">Algorithm Steps</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Count character frequencies</li>
              <li>Create leaf nodes for each character</li>
              <li>Build priority queue (min-heap)</li>
              <li>Repeatedly merge smallest nodes</li>
              <li>Assign codes (0 for left, 1 for right)</li>
              <li>Encode using generated codes</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Tree Building Process</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
            <p>1. Start with all characters as leaf nodes</p>
            <p>2. Repeatedly take two nodes with minimum frequency</p>
            <p>3. Create parent node with combined frequency</p>
            <p>4. Continue until only one tree remains</p>
            <p>5. Root node represents the complete Huffman tree</p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Complexity Analysis</h4>
          <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm font-mono">
            <p>Time: <span className="font-bold">O(n log n)</span></p>
            <p className="text-xs">where n is the number of unique characters</p>
            <p>Space: <span className="font-bold">O(n)</span> for the tree and codes</p>
          </div>
        </div>
      </div>
    </div>
  );

  const PseudocodeSection = () => (
    <div className="bg-white/95 dark:bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
        Huffman Coding Implementation
      </h2>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
        <h4 className="font-semibold mb-3 text-lg">Main Algorithm</h4>
        <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
          <code>{`HUFFMAN-ENCODE(text):
  // Step 1: Calculate frequencies
  frequencies = CALCULATE-FREQUENCIES(text)
  
  // Step 2: Create leaf nodes
  nodes = []
  for each (char, freq) in frequencies:
    create LEAF-NODE(char, freq)
    nodes.append(node)
  
  // Step 3: Build Huffman Tree
  priority_queue = MIN-HEAP(nodes)
  
  while priority_queue.size() > 1:
    left = priority_queue.pop()
    right = priority_queue.pop()
    parent = NODE(freq: left.freq + right.freq)
    parent.left = left
    parent.right = right
    priority_queue.push(parent)
  
  root = priority_queue.pop()
  
  // Step 4: Generate codes
  codes = {}
  GENERATE-CODES(root, "", codes)
  
  // Step 5: Encode text
  encoded = ""
  for each char in text:
    encoded += codes[char]
  
  return encoded, codes, root

GENERATE-CODES(node, code, codes):
  if node is LEAF:
    codes[node.char] = code
    return
  
  GENERATE-CODES(node.left, code + "0", codes)
  GENERATE-CODES(node.right, code + "1", codes)`}</code>
        </pre>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Advantages</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Optimal prefix-free code</li>
            <li>Significant compression gains</li>
            <li>Fast encoding/decoding</li>
            <li>Greedy approach</li>
            <li>Industry standard</li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <h4 className="font-semibold mb-2 text-green-900 dark:text-green-300">Applications</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>JPEG image compression</li>
            <li>PNG compression</li>
            <li>ZIP file format</li>
            <li>Text file compression</li>
            <li>Data transmission</li>
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
            Huffman Coding 
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Watch the greedy algorithm build an optimal binary tree and compress text using variable-length codes based on character frequency.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 shadow-lg mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: '', label: '', icon: Zap },
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

        {/* Input Section */}
        {tab === '' && showInput && (
          <div className="bg-white/80 dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Enter Text to Compress</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={inputText}
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSolve}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Encode
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Or click "Encode" to use default example: "{inputText}"</p>
          </div>
        )}

        {/* Controls */}
        {tab === '' && !showInput && (
          <div className="bg-white/80 dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <button
                onClick={handleSolve}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                <Zap size={18} /> Restart
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
                  <option value={1000}>Slow</option>
                  <option value={500}>Normal</option>
                  <option value={100}>Fast</option>
                  <option value={10}>Very Fast</option>
                </select>
              </div>
            </div>

            {steps.length > 0 && (
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Step {currentStep + 1} of {steps.length}</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{steps[currentStep]?.type?.toUpperCase().replace(/_/g, ' ')}</span>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        {tab === '' && !showInput && render()}
        {tab === 'theory' && <div className="mt-6"><TheorySection /></div>}
        {tab === 'pseudocode' && <div className="mt-6"><PseudocodeSection /></div>}

        {/* Step Information */}
        {tab === '' && steps[currentStep] && !showInput && (
          <div className="bg-white/90 dark:bg-gray-800 rounded-lg p-6 shadow-lg mt-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Current Step</h3>
            <p className="text-gray-700 dark:text-gray-300">{currentStepData.message}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 text-center shadow-lg">
          <h3 className="text-xl font-bold mb-2">Master Data Compression! 📊</h3>
          <p>Huffman coding demonstrates how greedy algorithms achieve optimal solutions and is fundamental to modern data compression and file formats.</p>
        </div>
      </div>
    </div>
  );
}

export default Huffman;