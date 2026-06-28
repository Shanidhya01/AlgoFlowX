import React, { useEffect, useState, Suspense, lazy } from "react";
import { Analytics } from '@vercel/analytics/react';
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
const Huffman             = lazy(() => import('./AlgorithmPages/Greedy/Huffman'));
const ActivitySelection   = lazy(() => import('./AlgorithmPages/Greedy/ActivitySelection'));
const Recursion           = lazy(() => import('./AlgorithmPages/Recursion/Recursion'));
const Knapsack            = lazy(() => import('./AlgorithmPages/DP/Knapsack'));
const Dynamic             = lazy(() => import('./AlgorithmPages/DP/Dynamic'));
const BackTrack           = lazy(() => import('./AlgorithmPages/DP/BackTrack'));
const LCS                 = lazy(() => import('./AlgorithmPages/DP/LCS'));
const EditDistance        = lazy(() => import('./AlgorithmPages/DP/EditDistance'));
const Greedy              = lazy(() => import('./AlgorithmPages/Greedy/Greedy'));
const SudokuSolver        = lazy(() => import('./AlgorithmPages/Recursion/SudokuSolver'));
const KMPPatternMatcher   = lazy(() => import('./AlgorithmPages/Recursion/KMPPatternMatcher'));
const RabinKarp           = lazy(() => import('./AlgorithmPages/StringAlgorithms/RabinKarp'));
const RatMaze             = lazy(() => import('./AlgorithmPages/Backtracking/RatMaze'));
const BST                 = lazy(() => import('./AlgorithmPages/Trees/BST'));
const SieveEratosthenes   = lazy(() => import('./AlgorithmPages/Math/SieveEratosthenes'));

function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
      </div>
      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Loading visualization…</p>
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

          {/* Greedy */}
          <Route path="/huffman-coding" element={<Huffman />} />
          <Route path="/activity-selection" element={<ActivitySelection />} />
          <Route path="/greedy" element={<Greedy />} />

          {/* DP */}
          <Route path="/knapsack" element={<Knapsack />} />
          <Route path="/dynamic" element={<Dynamic />} />
          <Route path="/lcs" element={<LCS />} />
          <Route path="/edit-distance" element={<EditDistance />} />

          {/* Backtracking */}
          <Route path="/backtrack" element={<BackTrack />} />
          <Route path="/rat-in-maze" element={<RatMaze />} />

          {/* Trees */}
          <Route path="/bst" element={<BST />} />

          {/* String Algorithms */}
          <Route path="/kmp-pattern-matcher" element={<KMPPatternMatcher />} />
          <Route path="/rabin-karp" element={<RabinKarp />} />

          {/* Math */}
          <Route path="/sieve-of-eratosthenes" element={<SieveEratosthenes />} />

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
    <Router>
      <Analytics />
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  );
}

export default App;
