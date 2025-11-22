import React, { useState, useMemo } from 'react';
import AlgorithmCard from './AlgorithmCard';
import { Search, Filter, LayoutGrid, Zap } from 'lucide-react';

const algorithms = [
  {
    title: 'Linear Search',
    description: 'A simple search algorithm that checks every element in the list until a match is found or the end is reached.',
    symbol: '➡️',
    category: 'Searching',
    difficulty: 'Easy'
  },
  {
    title: 'Binary Search',
    description: 'An efficient search algorithm that works on sorted arrays by repeatedly dividing the search interval in half.',
    symbol: '🔍',
    category: 'Searching',
    difficulty: 'Easy'
  },
  {
    title: 'Bubble Sort',
    description: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    symbol: '💭',
    category: 'Sorting',
    difficulty: 'Easy'
  },
  {
    title: 'Selection Sort',
    description: 'A simple sorting algorithm that repeatedly selects the smallest (or largest) element from the unsorted part of the list and moves it to the sorted part.',
    symbol: '🎯',
    category: 'Sorting',
    difficulty: 'Easy'
  },
  {
    title: 'Insertion Sort',
    description: 'A simple sorting algorithm that builds the sorted list one item at a time by inserting elements into their correct position.',
    symbol: '📝',
    category: 'Sorting',
    difficulty: 'Easy'
  },
  {
    title: 'Counting Sort',
    description: 'A non-comparative algorithm that counts the frequency of each element and calculates their positions in the sorted array.',
    symbol: '📊',
    category: 'Sorting',
    difficulty: 'Medium'
  },
  {
    title: 'Bucket Sort',
    description: 'A distribution-based algorithm that divides elements into buckets and sorts each bucket individually.',
    symbol: '🪣',
    category: 'Sorting',
    difficulty: 'Medium'
  },
  {
    title: 'Merge Sort',
    description: 'A divide-and-conquer sorting algorithm that divides the array into halves, sorts them, and then merges the sorted halves.',
    symbol: '🔀',
    category: 'Sorting',
    difficulty: 'Medium'
  },
  {
    title: 'Quick Sort',
    description: 'An efficient, recursive divide-and-conquer sorting algorithm that partitions the array and sorts the partitions independently.',
    symbol: '⚡',
    category: 'Sorting',
    difficulty: 'Medium'
  },
  {
    title: 'Disjoint Set Union (Union-Find)',
    description: 'A data structure that keeps track of elements partitioned into disjoint sets and efficiently supports union and find operations with optimizations like path compression and union by rank.',
    symbol: '🧩',
    category: 'Graph',
    difficulty: 'Medium'
  },
  {
    title: 'N-Queens Problem',
    description: 'A classic backtracking challenge where N queens must be placed on an N×N chessboard such that no two queens attack each other. Demonstrates recursion, constraints, and state exploration.',
    symbol: '♛',
    category: 'Backtracking',
    difficulty: 'Hard'
  },


  {
    title: 'Recursion',
    description: 'A problem-solving method where a function calls itself to solve smaller instances of the problem, often used with base cases to terminate recursion.',
    symbol: '🔁',
    category: 'Fundamentals',
    difficulty: 'Medium'
  },
  {
    title: 'Heap Sort',
    description: 'A comparison-based sorting algorithm that uses a binary heap to sort elements.',
    symbol: '🏔️',
    category: 'Sorting',
    difficulty: 'Medium'
  },
  {
    title: 'Depth-First Search',
    description: 'A graph traversal algorithm that explores as far as possible along each branch before backtracking.',
    symbol: '🌳',
    category: 'Graph',
    difficulty: 'Medium'
  },
  {
    title: 'Breadth-First Search',
    description: 'A graph traversal algorithm that explores all the vertices of a graph at the present depth prior to moving on to the vertices at the next depth level.',
    symbol: '🌊',
    category: 'Graph',
    difficulty: 'Medium'
  },
  {
    title: 'Dijkstra\'s Algorithm',
    description: 'Finds the shortest path between nodes in a weighted graph.',
    symbol: '🛤️',
    category: 'Graph',
    difficulty: 'Hard'
  },
  {
    title: 'Kruskal\'s Algorithm',
    description: 'Finds the minimum spanning tree for a connected weighted graph by adding edges in increasing order of weight.',
    symbol: '🌉',
    category: 'Graph',
    difficulty: 'Hard'
  },
  {
    title: 'Prim\'s Algorithm',
    description: 'Constructs the minimum spanning tree for a weighted graph by starting with a single vertex and growing the tree.',
    symbol: '🌲',
    category: 'Graph',
    difficulty: 'Hard'
  },
  {
    title: 'Bellman-Ford Algorithm',
    description: 'Computes shortest paths from a single source vertex to all other vertices in a graph, even with negative weight edges.',
    symbol: '🕰️',
    category: 'Graph',
    difficulty: 'Hard'
  },
  {
    title: 'Floyd-Warshall Algorithm',
    description: 'A dynamic programming algorithm to find shortest paths between all pairs of vertices in a graph.',
    symbol: '🔄',
    category: 'Graph',
    difficulty: 'Hard'
  },
  {
    title: 'Knapsack Problem',
    description: 'Solves optimization problems where you select items with given weights and values to maximize value without exceeding the weight limit.',
    symbol: '🎒',
    category: 'Dynamic Programming',
    difficulty: 'Hard'
  },
  {
    title: 'Backtracking Algorithm',
    description: 'A problem-solving algorithm that explores all possible solutions by building a solution incrementally and abandoning solutions that fail.',
    symbol: '🔙',
    category: 'Advanced',
    difficulty: 'Hard'
  },
  {
    title: 'Dynamic Programming',
    description: 'A method for solving problems by breaking them down into simpler subproblems, solving each just once, and storing their solutions.',
    symbol: '💡',
    category: 'Dynamic Programming',
    difficulty: 'Hard'
  },
  {
    title: 'Sudoku Solver',
    description: 'A backtracking algorithm that fills a 9×9 Sudoku grid by placing digits while respecting row, column, and sub-grid constraints, exploring and correcting choices through recursion.',
    symbol: '🔢',
    category: 'Backtracking',
    difficulty: 'Hard'
  },
  {
    title: 'KMP Pattern Matcher',
    description: 'An efficient string-matching algorithm that preprocesses the pattern using the LPS array to skip unnecessary comparisons, allowing linear-time substring search.',
    symbol: '🔍',
    category: 'String Algorithms',
    difficulty: 'Medium'
  },
  {
    title: 'Huffman Coding Tree',
    description: 'A greedy algorithm that builds an optimal prefix-free binary tree based on character frequencies, producing compressed binary codes used in lossless data compression.',
    symbol: '🌳',
    category: 'Greedy',
    difficulty: 'Medium'
  },
  {
    title: 'Greedy Algorithm',
    description: 'An algorithmic approach that makes the best choice at each step, assuming it will lead to the optimal solution.',
    symbol: '🤑',
    category: 'Advanced',
    difficulty: 'Medium'
  }
];

function AlgorithmGrid({ searchTerm = '' }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  // Get unique categories
  const categories = ['All', ...new Set(algorithms.map(algo => algo.category))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  // Filter and sort algorithms
  const filteredAlgorithms = useMemo(() => {
    let filtered = algorithms.filter(algorithm => {
      const matchesSearch = 
        algorithm.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        algorithm.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || algorithm.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || algorithm.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    // Sort
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'difficulty') {
      const diffOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
      filtered.sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
    }

    return filtered;
  }, [searchTerm, selectedCategory, selectedDifficulty, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header Section */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <LayoutGrid className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Algorithm Hub</h1>
                <p className="text-gray-600 text-sm">Master coding algorithms with interactive visualizations</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{filteredAlgorithms.length}</div>
              <p className="text-gray-600 text-sm">Algorithms</p>
            </div>
          </div>

          {/* Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Filter size={16} /> Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Zap size={16} /> Difficulty
              </label>
              <div className="flex flex-wrap gap-2">
                {difficulties.map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedDifficulty === diff
                        ? diff === 'Easy' ? 'bg-green-600 text-white'
                          : diff === 'Medium' ? 'bg-yellow-600 text-white'
                          : 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } shadow-md`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none font-medium transition-colors duration-300 bg-white"
              >
                <option value="name">Name (A-Z)</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredAlgorithms.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No algorithms found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find what you're looking for</p>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <p className="text-gray-700">
                <span className="font-bold text-blue-600">{filteredAlgorithms.length}</span> algorithm{filteredAlgorithms.length !== 1 ? 's' : ''} found
                {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                {selectedDifficulty !== 'All' && ` • ${selectedDifficulty} level`}
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlgorithms.map((algorithm, index) => (
                <div
                  key={index}
                  className="transform transition-all duration-300 hover:scale-105 animate-fade-in"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeIn 0.6s ease-out forwards'
                  }}
                >
                  <AlgorithmCard
                    title={algorithm.title}
                    description={algorithm.description}
                    symbol={algorithm.symbol}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-xl font-bold mb-2">Master Algorithms with Interactive Learning</h3>
          <p className="text-blue-100">Visualize, understand, and practice algorithms in an engaging way</p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default AlgorithmGrid;