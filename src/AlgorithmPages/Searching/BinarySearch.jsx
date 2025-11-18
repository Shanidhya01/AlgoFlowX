import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, RotateCcw, Code, BookOpen, RefreshCw } from 'lucide-react';

const DEFAULT_ARRAY_SIZE = 15;
const ANIMATION_DURATION = 0.5;

function Button({ onClick, disabled, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 bg-black text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${className}`}
    >
      {children}
    </button>
  );
}

function Input({ type, placeholder, onChange, className = "", value }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      className={`px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
}

function Card({ children, className = "" }) {
  return <div className={`bg-white shadow-md rounded-lg ${className}`}>{children}</div>;
}

function PseudoCode() {
  return (
    <div className="mt-4 bg-white shadow-md rounded-lg dark:bg-gray-800">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2 dark:text-white">Binary Search Pseudo-code</h3>
        <pre className="text-sm bg-gray-100 p-4 rounded-md overflow-x-auto dark:bg-gray-700 dark:text-white">
{`function binarySearch(arr, target):
    left = 0
    right = arr.length - 1

    while left <= right:
        mid = (left + right) // 2

        if arr[mid] == target:
            return mid
        else if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1`}
        </pre>
      </div>
    </div>
  );
}

function Theory() {
  return (
    <div className="mt-4 bg-white shadow-md rounded-lg dark:bg-gray-800">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2 dark:text-white">Binary Search Theory</h3>
        <p className="mb-2 dark:text-white">
          Binary search is an efficient algorithm for searching a sorted array by repeatedly dividing the search interval in half.
        </p>
        <h4 className="font-semibold mt-2 dark:text-white">Why use Binary Search?</h4>
        <ul className="list-disc pl-5 space-y-1 dark:text-white">
          <li>O(log n) complexity</li>
          <li>Very efficient for large sorted arrays</li>
          <li>Minimal comparisons</li>
        </ul>
        <h4 className="font-semibold mt-2 dark:text-white">How it works:</h4>
        <ol className="list-decimal pl-5 space-y-1 dark:text-white">
          <li>Take the middle element</li>
          <li>If equal → found</li>
          <li>If smaller → search right half</li>
          <li>If larger → search left half</li>
          <li>Repeat until found or empty</li>
        </ol>
      </div>
    </div>
  );
}

export default function BinarySearch() {
  const [array, setArray] = useState([]);
  const [target, setTarget] = useState("");
  const [steps, setSteps] = useState([]);
  const [stepDescriptions, setStepDescriptions] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);

  const [isSearching, setIsSearching] = useState(false);
  const [showPseudoCode, setShowPseudoCode] = useState(false);
  const [showTheory, setShowTheory] = useState(false);
  const [customArrayInput, setCustomArrayInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    generateDefaultArray();
  }, []);

  const generateDefaultArray = () => {
    const newArray = Array.from({ length: DEFAULT_ARRAY_SIZE }, (_, i) => i * 2 + 1);
    setArray(newArray);
    setCustomArrayInput(newArray.join(", "));
    setErrorMessage("");
  };

  const handleCustomArrayInput = (input) => {
    setCustomArrayInput(input);

    try {
      const newArray = input.split(",").map((num) => {
        const parsed = parseInt(num.trim(), 10);
        if (isNaN(parsed)) throw new Error("Invalid number");
        return parsed;
      });

      if (newArray.length === 0) throw new Error("Array cannot be empty");

      for (let i = 1; i < newArray.length; i++) {
        if (newArray[i] < newArray[i - 1]) {
          throw new Error("Array must be sorted in ascending order");
        }
      }

      setArray(newArray);
      setErrorMessage("");
    } catch (e) {
      setErrorMessage(e.message);
    }
  };

  const binarySearch = (arr, target) => {
    let left = 0,
      right = arr.length - 1;

    const s = [];
    const desc = [];

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      s.push({ left, right, mid, found: arr[mid] === target });

      desc.push(`Searching between ${left} and ${right} → Middle: ${mid} (value ${arr[mid]})`);

      if (arr[mid] === target) {
        desc.push(`🎯 Found ${target} at index ${mid}`);
        return [s, desc];
      }

      if (arr[mid] < target) {
        desc.push(`${arr[mid]} < ${target} → Search right half`);
        left = mid + 1;
      } else {
        desc.push(`${arr[mid]} > ${target} → Search left half`);
        right = mid - 1;
      }
    }

    s.push({ left, right, mid: -1, found: false });
    desc.push(`❌ Target ${target} not found`);
    return [s, desc];
  };

  const handleSearch = () => {
    if (target === "" || isNaN(target)) return;
    const [s, desc] = binarySearch(array, Number(target));
    setSteps(s);
    setStepDescriptions(desc);
    setCurrentStep(0);
    setIsSearching(true);
  };

  const current = steps[currentStep] || {};

  return (
    <Card className="w-full max-w-3xl mx-auto dark:bg-gray-800">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">Binary Search Visualization</h2>

        {/* Controls */}
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-grow flex items-center gap-2">
              <Input
                type="number"
                placeholder="Enter number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-32 dark:bg-gray-700 dark:text-white"
              />

              <Button onClick={handleSearch} disabled={isSearching || target === ""}>
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>

              <Button onClick={() => window.location.reload()}>
                <RotateCcw className="mr-2 h-4 w-4" /> Reset
              </Button>
            </div>

            <Button onClick={() => setShowPseudoCode(!showPseudoCode)} className="text-sm">
              <Code className="mr-2 h-4 w-4" /> {showPseudoCode ? "Hide Code" : "Show Code"}
            </Button>

            <Button onClick={() => setShowTheory(!showTheory)} className="text-sm">
              <BookOpen className="mr-2 h-4 w-4" /> {showTheory ? "Hide Theory" : "Show Theory"}
            </Button>
          </div>

          {/* Custom Array */}
          <div>
            <Input
              type="text"
              value={customArrayInput}
              placeholder="Enter custom array (comma-separated)"
              onChange={(e) => handleCustomArrayInput(e.target.value)}
              className="w-full dark:bg-gray-700 dark:text-white"
            />

            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

            <Button onClick={generateDefaultArray} className="text-sm mt-2">
              <RefreshCw className="mr-2 h-4 w-4" /> Reset to Default Array
            </Button>
          </div>
        </div>

        {/* ARRAY VISUALIZATION */}
        <div className="flex flex-wrap justify-center gap-2 mb-4 mt-8">
          {array.map((num, index) => {
            const highlightRange =
              currentStep >= 0 && index >= current.left && index <= current.right;

            return (
              <div key={index} className="flex flex-col items-center">
                <div className="h-6 mb-1">
                  {currentStep >= 0 && (
                    <>
                      {index === current.left && <span className="text-xs text-blue-500 font-bold">L</span>}
                      {index === current.right && <span className="text-xs text-blue-500 font-bold">R</span>}
                      {index === current.mid && <span className="text-xs text-yellow-500 font-bold">M</span>}
                    </>
                  )}
                </div>

                <motion.div
                  className={`w-10 h-10 flex items-center justify-center border ${
                    highlightRange ? "border-blue-500" : "border-gray-300"
                  } ${index === current.mid ? "bg-green-700" : ""} ${
                    current.found && index === current.mid ? "bg-green-300" : ""
                  }`}
                  animate={{ scale: index === current.mid ? 1.1 : 1 }}
                  transition={{ duration: ANIMATION_DURATION }}
                >
                  <span className="dark:text-white">{num}</span>
                </motion.div>

                <div className="text-xs mt-1 dark:text-gray-300">{index}</div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 my-4">
          <Button
            disabled={!isSearching || currentStep <= 0}
            onClick={() => setCurrentStep((p) => p - 1)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>

          <Button
            disabled={!isSearching || currentStep >= steps.length - 1}
            onClick={() => setCurrentStep((p) => p + 1)}
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Step Description */}
        {currentStep >= 0 && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Current Step:</h3>
            <p className="dark:text-gray-300">{stepDescriptions[currentStep]}</p>
          </div>
        )}

        {/* Final Message */}
        {currentStep >= 0 && (
          <div className="text-center mt-4 dark:text-white">
            {current.found
              ? `Found ${target} at index ${current.mid}`
              : currentStep === steps.length - 1
              ? `${target} not found`
              : `Searching...`}
          </div>
        )}

        {showPseudoCode && <PseudoCode />}
        {showTheory && <Theory />}
      </div>
    </Card>
  );
}
