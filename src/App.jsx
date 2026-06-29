import React, { useEffect, useState, Suspense, lazy, Component } from "react";

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 gap-4 p-8">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Something went wrong</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">{this.state.error?.message}</p>
          <button onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
            Back to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Analytics = lazy(() =>
  import('@vercel/analytics/react')
    .then(m => ({ default: m.Analytics }))
    .catch(() => ({ default: () => null }))
);

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './contexts/AppContext';
import { routeToAlgorithmMap } from './data/algorithms';
import FloatingControls from './components/FloatingControls';
import CommandPalette from './components/CommandPalette';
import MainLayout from './components/MainLayout';
import FavoritesPage from './pages/FavoritesPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

// Lazy-load all algorithm pages for code splitting
const BinarySearch        = lazy(() => import('./AlgorithmPages/Searching/BinarySearch'));
const LinearSearch        = lazy(() => import('./AlgorithmPages/Searching/LinearSearch'));
const JumpSearch          = lazy(() => import('./AlgorithmPages/Searching/JumpSearch'));
const InterpolationSearch = lazy(() => import('./AlgorithmPages/Searching/InterpolationSearch'));
const QuickSort           = lazy(() => import('./AlgorithmPages/Sorting/QuickSort'));
const BubbleSort          = lazy(() => import('./AlgorithmPages/Sorting/BubbleSort'));
const HeapSort            = lazy(() => import('./AlgorithmPages/Sorting/HeapSort'));
const MergeSort           = lazy(() => import('./AlgorithmPages/Sorting/MergeSort'));
const SelectionSort       = lazy(() => import('./AlgorithmPages/Sorting/SelectionSort'));
const InsertionSort       = lazy(() => import('./AlgorithmPages/Sorting/InsertionSort'));
const CountingSort        = lazy(() => import('./AlgorithmPages/Sorting/CountingSort'));
const BucketSort          = lazy(() => import('./AlgorithmPages/Sorting/BucketSort'));
const TopologicalSort     = lazy(() => import('./AlgorithmPages/Sorting/TopologicalSort'));
const ShellSort           = lazy(() => import('./AlgorithmPages/Sorting/ShellSort'));
const RadixSort           = lazy(() => import('./AlgorithmPages/Sorting/RadixSort'));
const DepthFirstSearch    = lazy(() => import('./AlgorithmPages/Graph/DepthFirstSearch'));
const BreadthFirstSearch  = lazy(() => import('./AlgorithmPages/Graph/BreadthFirstSearch'));
const Dijkstras           = lazy(() => import('./AlgorithmPages/Graph/Dijkstras'));
const BellmanFord         = lazy(() => import('./AlgorithmPages/Graph/BellmanFord'));
const FloydWarshall       = lazy(() => import('./AlgorithmPages/Graph/FloydWarshall'));
const KrushKals           = lazy(() => import('./AlgorithmPages/Graph/Krushkals'));
const Prims               = lazy(() => import('./AlgorithmPages/Graph/Prims'));
const UnionFindDSU        = lazy(() => import('./AlgorithmPages/Graph/UnionFindDSU'));
const NQueen              = lazy(() => import('./AlgorithmPages/Graph/NQueen'));
const AStar               = lazy(() => import('./AlgorithmPages/Graph/AStar'));
const TarjanSCC           = lazy(() => import('./AlgorithmPages/Graph/TarjanSCC'));
const KosarajuSCC         = lazy(() => import('./AlgorithmPages/Graph/KosarajuSCC'));
const FordFulkerson       = lazy(() => import('./AlgorithmPages/Graph/FordFulkerson'));
const Hierholzer          = lazy(() => import('./AlgorithmPages/Graph/Hierholzer'));
const BidirectionalSearch = lazy(() => import('./AlgorithmPages/Graph/BidirectionalSearch'));
const IDDFS               = lazy(() => import('./AlgorithmPages/Graph/IDDFS'));
const MultiSourceBFS      = lazy(() => import('./AlgorithmPages/Graph/MultiSourceBFS'));
const Huffman             = lazy(() => import('./AlgorithmPages/Greedy/Huffman'));
const ActivitySelection   = lazy(() => import('./AlgorithmPages/Greedy/ActivitySelection'));
const EgyptianFraction    = lazy(() => import('./AlgorithmPages/Greedy/EgyptianFraction'));
const Recursion           = lazy(() => import('./AlgorithmPages/Recursion/Recursion'));
const Knapsack            = lazy(() => import('./AlgorithmPages/DP/Knapsack'));
const Dynamic             = lazy(() => import('./AlgorithmPages/DP/Dynamic'));
const BackTrack           = lazy(() => import('./AlgorithmPages/DP/BackTrack'));
const LCS                 = lazy(() => import('./AlgorithmPages/DP/LCS'));
const EditDistance        = lazy(() => import('./AlgorithmPages/DP/EditDistance'));
const CoinChange          = lazy(() => import('./AlgorithmPages/DP/CoinChange'));
const LIS                 = lazy(() => import('./AlgorithmPages/DP/LIS'));
const LongestPalindromicSubsequence = lazy(() => import('./AlgorithmPages/DP/LongestPalindromicSubsequence'));
const WordBreak           = lazy(() => import('./AlgorithmPages/DP/WordBreak'));
const RodCutting          = lazy(() => import('./AlgorithmPages/DP/RodCutting'));
const EggDropping         = lazy(() => import('./AlgorithmPages/DP/EggDropping'));
const HouseRobber         = lazy(() => import('./AlgorithmPages/DP/HouseRobber'));
const MinPathSum          = lazy(() => import('./AlgorithmPages/DP/MinPathSum'));
const UniquePaths         = lazy(() => import('./AlgorithmPages/DP/UniquePaths'));
const PartitionSubset     = lazy(() => import('./AlgorithmPages/DP/PartitionSubset'));
const MatrixChain         = lazy(() => import('./AlgorithmPages/DP/MatrixChain'));
const Greedy              = lazy(() => import('./AlgorithmPages/Greedy/Greedy'));
const SudokuSolver        = lazy(() => import('./AlgorithmPages/Recursion/SudokuSolver'));
const KMPPatternMatcher   = lazy(() => import('./AlgorithmPages/Recursion/KMPPatternMatcher'));
const RabinKarp           = lazy(() => import('./AlgorithmPages/StringAlgorithms/RabinKarp'));
const RatMaze             = lazy(() => import('./AlgorithmPages/Backtracking/RatMaze'));
const KnightsTour         = lazy(() => import('./AlgorithmPages/Backtracking/KnightsTour'));
const GraphColoring       = lazy(() => import('./AlgorithmPages/Backtracking/GraphColoring'));
const CombinationSum      = lazy(() => import('./AlgorithmPages/Backtracking/CombinationSum'));
const Permutations        = lazy(() => import('./AlgorithmPages/Backtracking/Permutations'));
const Subsets             = lazy(() => import('./AlgorithmPages/Backtracking/Subsets'));
const BST                 = lazy(() => import('./AlgorithmPages/Trees/BST'));
const BinaryHeap          = lazy(() => import('./AlgorithmPages/Trees/BinaryHeap'));
const SieveEratosthenes   = lazy(() => import('./AlgorithmPages/Math/SieveEratosthenes'));
const EuclideanGCD        = lazy(() => import('./AlgorithmPages/Math/EuclideanGCD'));
const ExtendedEuclidean   = lazy(() => import('./AlgorithmPages/Math/ExtendedEuclidean'));
const FastExponentiation  = lazy(() => import('./AlgorithmPages/Math/FastExponentiation'));
const PrimeFactorization  = lazy(() => import('./AlgorithmPages/Math/PrimeFactorization'));
const MillerRabin         = lazy(() => import('./AlgorithmPages/Math/MillerRabin'));

// Bit Manipulation
const CountingSetBits     = lazy(() => import('./AlgorithmPages/BitManipulation/CountingSetBits'));
const PowerOfTwo          = lazy(() => import('./AlgorithmPages/BitManipulation/PowerOfTwo'));
const XORTricks           = lazy(() => import('./AlgorithmPages/BitManipulation/XORTricks'));
const GrayCode            = lazy(() => import('./AlgorithmPages/BitManipulation/GrayCode'));
const SubsetBitmask       = lazy(() => import('./AlgorithmPages/BitManipulation/SubsetBitmask'));

// Data Structures
const Stack               = lazy(() => import('./AlgorithmPages/DataStructures/Stack'));
const Queue               = lazy(() => import('./AlgorithmPages/DataStructures/Queue'));
const LinkedList          = lazy(() => import('./AlgorithmPages/DataStructures/LinkedList'));
const HashTable           = lazy(() => import('./AlgorithmPages/DataStructures/HashTable'));
const LRUCache            = lazy(() => import('./AlgorithmPages/DataStructures/LRUCache'));
const PriorityQueue       = lazy(() => import('./AlgorithmPages/DataStructures/PriorityQueue'));
const CircularQueue       = lazy(() => import('./AlgorithmPages/DataStructures/CircularQueue'));
const DoublyLinkedList    = lazy(() => import('./AlgorithmPages/DataStructures/DoublyLinkedList'));
const Deque               = lazy(() => import('./AlgorithmPages/DataStructures/Deque'));
// SkipList page not yet implemented

// New Searching
const ExponentialSearch   = lazy(() => import('./AlgorithmPages/Searching/ExponentialSearch'));
const TernarySearch       = lazy(() => import('./AlgorithmPages/Searching/TernarySearch'));
const FibonacciSearch     = lazy(() => import('./AlgorithmPages/Searching/FibonacciSearch'));

// New Sorting
const TimSort             = lazy(() => import('./AlgorithmPages/Sorting/TimSort'));
const CombSort            = lazy(() => import('./AlgorithmPages/Sorting/CombSort'));
const CocktailSort        = lazy(() => import('./AlgorithmPages/Sorting/CocktailSort'));
const CycleSort           = lazy(() => import('./AlgorithmPages/Sorting/CycleSort'));
const PigeonholeSort      = lazy(() => import('./AlgorithmPages/Sorting/PigeonholeSort'));
const IntroSort           = lazy(() => import('./AlgorithmPages/Sorting/IntroSort'));

// New Trees
const AVLTree             = lazy(() => import('./AlgorithmPages/Trees/AVLTree'));
const Trie                = lazy(() => import('./AlgorithmPages/Trees/Trie'));
const SegmentTree         = lazy(() => import('./AlgorithmPages/Trees/SegmentTree'));
const FenwickTree         = lazy(() => import('./AlgorithmPages/Trees/FenwickTree'));

// New String Algorithms
const BoyerMoore          = lazy(() => import('./AlgorithmPages/StringAlgorithms/BoyerMoore'));
const ZAlgorithm          = lazy(() => import('./AlgorithmPages/StringAlgorithms/ZAlgorithm'));
const AhoCorasick         = lazy(() => import('./AlgorithmPages/StringAlgorithms/AhoCorasick'));
const Manacher            = lazy(() => import('./AlgorithmPages/StringAlgorithms/Manacher'));
const SuffixArray         = lazy(() => import('./AlgorithmPages/StringAlgorithms/SuffixArray'));

// New Greedy
const FractionalKnapsack  = lazy(() => import('./AlgorithmPages/Greedy/FractionalKnapsack'));
const JobSequencing       = lazy(() => import('./AlgorithmPages/Greedy/JobSequencing'));
const MinPlatforms        = lazy(() => import('./AlgorithmPages/Greedy/MinPlatforms'));

function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
      </div>
      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Loading visualizationâ€¦</p>
    </div>
  );
}

function RouteTracker() {
  const location = useLocation();
  const { addRecentlyViewed } = useApp();

  useEffect(() => {
    const algo = routeToAlgorithmMap[location.pathname];
    if (algo) addRecentlyViewed(algo);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, addRecentlyViewed]);

  return null;
}

function AppContent() {
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <RouteTracker />
      <FloatingControls onOpenCommandPalette={() => setCmdPaletteOpen(true)} />
      <CommandPalette open={cmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} />
      <Toaster position="bottom-right" />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Searching */}
          <Route path="/binary-search" element={<BinarySearch />} />
          <Route path="/linear-search" element={<LinearSearch />} />
          <Route path="/jump-search" element={<JumpSearch />} />
          <Route path="/interpolation-search" element={<InterpolationSearch />} />

          {/* New Searching */}
          <Route path="/exponential-search" element={<ExponentialSearch />} />
          <Route path="/ternary-search" element={<TernarySearch />} />
          <Route path="/fibonacci-search" element={<FibonacciSearch />} />

          {/* Sorting */}
          <Route path="/bubble-sort" element={<BubbleSort />} />
          <Route path="/quick-sort" element={<QuickSort />} />
          <Route path="/heap-sort" element={<HeapSort />} />
          <Route path="/merge-sort" element={<MergeSort />} />
          <Route path="/selection-sort" element={<SelectionSort />} />
          <Route path="/insertion-sort" element={<InsertionSort />} />
          <Route path="/counting-sort" element={<CountingSort />} />
          <Route path="/bucket-sort" element={<BucketSort />} />
          <Route path="/topological-sort" element={<TopologicalSort />} />
          <Route path="/shell-sort" element={<ShellSort />} />
          <Route path="/radix-sort" element={<RadixSort />} />
          <Route path="/tim-sort" element={<TimSort />} />
          <Route path="/comb-sort" element={<CombSort />} />
          <Route path="/cocktail-sort" element={<CocktailSort />} />
          <Route path="/cycle-sort" element={<CycleSort />} />
          <Route path="/pigeonhole-sort" element={<PigeonholeSort />} />
          <Route path="/intro-sort" element={<IntroSort />} />

          {/* Graph */}
          <Route path="/depth-first-search" element={<DepthFirstSearch />} />
          <Route path="/breadth-first-search" element={<BreadthFirstSearch />} />
          <Route path="/dijkstras" element={<Dijkstras />} />
          <Route path="/bellman-ford" element={<BellmanFord />} />
          <Route path="/Floyd-warshall" element={<FloydWarshall />} />
          <Route path="/Krushkals" element={<KrushKals />} />
          <Route path="/Prims" element={<Prims />} />
          <Route path="/union-find" element={<UnionFindDSU />} />
          <Route path="/n-queen" element={<NQueen />} />
          <Route path="/a-star" element={<AStar />} />
          <Route path="/tarjan-scc" element={<TarjanSCC />} />
          <Route path="/kosaraju-scc" element={<KosarajuSCC />} />
          <Route path="/ford-fulkerson" element={<FordFulkerson />} />
          <Route path="/hierholzer" element={<Hierholzer />} />
          <Route path="/bidirectional-search" element={<BidirectionalSearch />} />
          <Route path="/iddfs" element={<IDDFS />} />
          <Route path="/multi-source-bfs" element={<MultiSourceBFS />} />

          {/* Greedy */}
          <Route path="/huffman-coding" element={<Huffman />} />
          <Route path="/activity-selection" element={<ActivitySelection />} />
          <Route path="/greedy" element={<Greedy />} />
          <Route path="/egyptian-fraction" element={<EgyptianFraction />} />
          <Route path="/fractional-knapsack" element={<FractionalKnapsack />} />
          <Route path="/job-sequencing" element={<JobSequencing />} />
          <Route path="/min-platforms" element={<MinPlatforms />} />

          {/* DP */}
          <Route path="/knapsack" element={<Knapsack />} />
          <Route path="/dynamic" element={<Dynamic />} />
          <Route path="/lcs" element={<LCS />} />
          <Route path="/edit-distance" element={<EditDistance />} />
          <Route path="/coin-change" element={<CoinChange />} />
          <Route path="/lis" element={<LIS />} />
          <Route path="/longest-palindromic-subsequence" element={<LongestPalindromicSubsequence />} />
          <Route path="/word-break" element={<WordBreak />} />
          <Route path="/rod-cutting" element={<RodCutting />} />
          <Route path="/egg-dropping" element={<EggDropping />} />
          <Route path="/house-robber" element={<HouseRobber />} />
          <Route path="/min-path-sum" element={<MinPathSum />} />
          <Route path="/unique-paths" element={<UniquePaths />} />
          <Route path="/partition-subset" element={<PartitionSubset />} />
          <Route path="/matrix-chain" element={<MatrixChain />} />

          {/* Backtracking */}
          <Route path="/backtrack" element={<BackTrack />} />
          <Route path="/rat-in-maze" element={<RatMaze />} />
          <Route path="/knights-tour" element={<KnightsTour />} />
          <Route path="/graph-coloring" element={<GraphColoring />} />
          <Route path="/combination-sum" element={<CombinationSum />} />
          <Route path="/permutations" element={<Permutations />} />
          <Route path="/subsets" element={<Subsets />} />

          {/* Trees */}
          <Route path="/bst" element={<BST />} />
          <Route path="/binary-heap" element={<BinaryHeap />} />
          <Route path="/avl-tree" element={<AVLTree />} />
          <Route path="/trie" element={<Trie />} />
          <Route path="/segment-tree" element={<SegmentTree />} />
          <Route path="/fenwick-tree" element={<FenwickTree />} />

          {/* String Algorithms */}
          <Route path="/kmp-pattern-matcher" element={<KMPPatternMatcher />} />
          <Route path="/rabin-karp" element={<RabinKarp />} />
          <Route path="/boyer-moore" element={<BoyerMoore />} />
          <Route path="/z-algorithm" element={<ZAlgorithm />} />
          <Route path="/aho-corasick" element={<AhoCorasick />} />
          <Route path="/manacher" element={<Manacher />} />
          <Route path="/suffix-array" element={<SuffixArray />} />

          {/* Math */}
          <Route path="/sieve-of-eratosthenes" element={<SieveEratosthenes />} />
          <Route path="/euclidean-gcd" element={<EuclideanGCD />} />
          <Route path="/extended-euclidean" element={<ExtendedEuclidean />} />
          <Route path="/fast-exponentiation" element={<FastExponentiation />} />
          <Route path="/prime-factorization" element={<PrimeFactorization />} />
          <Route path="/miller-rabin" element={<MillerRabin />} />

          {/* Bit Manipulation */}
          <Route path="/counting-set-bits" element={<CountingSetBits />} />
          <Route path="/power-of-two" element={<PowerOfTwo />} />
          <Route path="/xor-tricks" element={<XORTricks />} />
          <Route path="/gray-code" element={<GrayCode />} />
          <Route path="/subset-bitmask" element={<SubsetBitmask />} />

          {/* Data Structures */}
          <Route path="/stack" element={<Stack />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/linked-list" element={<LinkedList />} />
          <Route path="/hash-table" element={<HashTable />} />
          <Route path="/lru-cache" element={<LRUCache />} />
          <Route path="/priority-queue" element={<PriorityQueue />} />
          <Route path="/circular-queue" element={<CircularQueue />} />
          <Route path="/doubly-linked-list" element={<DoublyLinkedList />} />
          <Route path="/deque" element={<Deque />} />
          {/* Fundamentals */}
          <Route path="/recursion" element={<Recursion />} />
          <Route path="/sudoku-solver" element={<SudokuSolver />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={null}><Analytics /></Suspense>
        <AppProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </AppProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
