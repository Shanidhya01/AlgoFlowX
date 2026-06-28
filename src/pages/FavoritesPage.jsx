import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AlgorithmCard from '../components/AlgorithmCard';
import { useApp } from '../contexts/AppContext';
import { algorithms } from '../data/algorithms';

function FavoritesPage() {
  const { favorites, clearRecentlyViewed } = useApp();

  const favoriteAlgos = algorithms.filter(a => favorites.includes(a.title));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to home
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Favorites</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {favoriteAlgos.length} algorithm{favoriteAlgos.length !== 1 ? 's' : ''} saved
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {favoriteAlgos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
            <div className="text-7xl mb-6 animate-float">💔</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">No favorites yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md leading-relaxed">
              Click the ❤️ icon on any algorithm card or the floating heart button on algorithm pages to save your favorites here.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600
                         text-white font-semibold text-sm hover:from-blue-500 hover:to-violet-500
                         shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Explore Algorithms
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {favoriteAlgos.map((algo, i) => (
              <div
                key={algo.title}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
              >
                <AlgorithmCard
                  title={algo.title}
                  description={algo.description}
                  symbol={algo.symbol}
                  difficulty={algo.difficulty}
                  category={algo.category}
                  route={algo.route}
                  timeComplexity={algo.timeComplexity}
                  spaceComplexity={algo.spaceComplexity}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default FavoritesPage;
