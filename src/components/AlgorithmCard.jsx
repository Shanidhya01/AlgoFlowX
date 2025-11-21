import React, { useState } from 'react';
import { ArrowRight, Zap, Clock, TrendingUp } from 'lucide-react';

const AlgorithmCard = ({ title, description, symbol }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const getButtonLink = (title) => {
    const routes = {
      // Searching
      'Binary Search': '/binary-search',
      'Linear Search': '/linear-search',

      // Sorting
      'Bubble Sort': '/bubble-sort',
      'Quick Sort': '/quick-sort',
      'Merge Sort': '/merge-sort',
      'Selection Sort': '/selection-sort',
      'Heap Sort': '/heap-sort',
      'Insertion Sort': '/insertion-sort',
      'Counting Sort': '/counting-sort',
      'Bucket Sort': '/bucket-sort',

      // Graph
      'Depth-First Search': '/depth-first-search',
      'Breadth-First Search': '/breadth-first-search',
      "Dijkstra's Algorithm": '/dijkstras',
      'Bellman-Ford Algorithm': '/bellman-ford',
      'Floyd-Warshall Algorithm': '/Floyd-warshall',
      "Kruskal's Algorithm": '/Krushkals',
      "Prim's Algorithm": '/Prims',
      'Disjoint Set Union (Union-Find)': '/union-find',
      'N-Queens Problem': '/n-queen',

      // Recursion
      'Recursion': '/recursion',

      // Dynamic Programming
      'Knapsack Problem': '/knapsack',
      'Dynamic Programming': '/dynamic',
      'Backtracking Algorithm': '/backtrack',

      // Greedy
      'Greedy Algorithm': '/greedy',
    };

    return routes[title] || '#';
  };

  // Get complexity info based on algorithm
  const getComplexityInfo = (title) => {
    const complexities = {
      'Binary Search': { time: 'O(log n)', space: 'O(1)' },
      'Linear Search': { time: 'O(n)', space: 'O(1)' },
      'Bubble Sort': { time: 'O(n²)', space: 'O(1)' },
      'Quick Sort': { time: 'O(n log n)', space: 'O(log n)' },
      'Merge Sort': { time: 'O(n log n)', space: 'O(n)' },
      'Selection Sort': { time: 'O(n²)', space: 'O(1)' },
      'Heap Sort': { time: 'O(n log n)', space: 'O(1)' },
      'Insertion Sort': { time: 'O(n²)', space: 'O(1)' },
      'Counting Sort': { time: 'O(n + k)', space: 'O(k)' },
      'Bucket Sort': { time: 'O(n + k)', space: 'O(n + k)' },
      "Dijkstra's Algorithm": { time: 'O((V+E)log V)', space: 'O(V)' },
      'Bellman-Ford Algorithm': { time: 'O(V × E)', space: 'O(V)' },
      'Floyd-Warshall Algorithm': { time: 'O(V³)', space: 'O(V²)' },
      "Kruskal's Algorithm": { time: 'O(E log E)', space: 'O(V)' },
      "Prim's Algorithm": { time: 'O((V+E)log V)', space: 'O(V)' },
    };
    return complexities[title] || { time: 'N/A', space: 'N/A' };
  };

  // Get difficulty level
  const getDifficultyLevel = (title) => {
    const difficulties = {
      'Linear Search': 'Easy',
      'Binary Search': 'Easy',
      'Bubble Sort': 'Easy',
      'Selection Sort': 'Easy',
      'Insertion Sort': 'Easy',
      'Quick Sort': 'Medium',
      'Merge Sort': 'Medium',
      'Heap Sort': 'Medium',
      'Counting Sort': 'Medium',
      'Bucket Sort': 'Medium',
      'Recursion': 'Medium',
      'Greedy Algorithm': 'Medium',
      "Dijkstra's Algorithm": 'Hard',
      'Bellman-Ford Algorithm': 'Hard',
      'Floyd-Warshall Algorithm': 'Hard',
      "Kruskal's Algorithm": 'Hard',
      "Prim's Algorithm": 'Hard',
      'Backtracking Algorithm': 'Hard',
      'Dynamic Programming': 'Hard',
      'Knapsack Problem': 'Hard',
      'Depth-First Search': 'Medium',
      'Breadth-First Search': 'Medium',
    };
    return difficulties[title] || 'Medium';
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const complexity = getComplexityInfo(title);
  const difficulty = getDifficultyLevel(title);
  const difficultyColor = 
    difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
    difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
    'bg-red-100 text-red-800';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className="group relative w-full h-96 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 z-0"></div>
      
      {/* Animated Gradient Background */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
        style={{
          background: isHovered 
            ? `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 80%)`
            : 'transparent'
        }}
      ></div>

      {/* Animated Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-gray-200 group-hover:border-blue-400 transition-all duration-300 z-0"></div>

      {/* Glassmorphism Effect */}
      <div className="absolute inset-0 backdrop-blur-0 group-hover:backdrop-blur-sm transition-all duration-300 z-0 rounded-2xl"></div>

      {/* Content Container */}
      <div className="relative h-full p-7 flex flex-col justify-between z-10">
        {/* Header Section */}
        <div>
          {/* Symbol with Animation */}
          <div className="text-6xl mb-4 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 origin-left filter drop-shadow-lg">
            {symbol}
          </div>

          {/* Difficulty Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${difficultyColor}`}>
              {difficulty}
            </span>
            <div className="flex gap-1">
              {[...Array(difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              ))}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
            {title}
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
            {description}
          </p>
        </div>

        {/* Complexity Info */}
        <div className="grid grid-cols-2 gap-2 my-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 border border-gray-200">
            <div className="flex items-center gap-1 mb-1">
              <Clock size={14} className="text-blue-600" />
              <span className="text-xs font-semibold text-gray-700">Time</span>
            </div>
            <p className="text-sm font-mono font-bold text-gray-900">{complexity.time}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 border border-gray-200">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp size={14} className="text-purple-600" />
              <span className="text-xs font-semibold text-gray-700">Space</span>
            </div>
            <p className="text-sm font-mono font-bold text-gray-900">{complexity.space}</p>
          </div>
        </div>

        {/* Button with Icon */}
        <a
          href={getButtonLink(title)}
          className="group/btn relative mt-4 w-full px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl flex items-center justify-center gap-2 overflow-hidden"
        >
          {/* Button Background Animation */}
          <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"></div>
          
          {/* Button Content */}
          <span className="relative flex items-center gap-2">
            <Zap size={18} className="group-hover/btn:rotate-12 transition-transform duration-300" />
            Visualize & Learn
            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
          </span>
        </a>

        {/* Hover Indicator */}
        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full"></div>
      </div>

      {/* Corner Accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

export default AlgorithmCard;