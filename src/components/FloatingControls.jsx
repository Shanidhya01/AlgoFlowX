import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { routeToAlgorithmMap } from '../data/algorithms';

function ShareToast({ onDone }) {
  useEffect(() => {
    const id = setTimeout(onDone, 2000);
    return () => clearTimeout(id);
  }, [onDone]);
  return (
    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 rounded-xl text-xs font-semibold
                    bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900
                    shadow-lg whitespace-nowrap animate-fade-in-up pointer-events-none">
      Link copied! ✓
    </div>
  );
}

function FloatingControls({ onOpenCommandPalette }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useApp();
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  const algo = routeToAlgorithmMap[location.pathname];

  // All hooks must run unconditionally — guard is after hooks
  const fav = isFavorite(algo?.title ?? '');

  useEffect(() => {
    if (!algo) return;
    const handler = (e) => {
      if (e.key === 'f' || e.key === 'F') {
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') toggleFavorite(algo.title);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [algo?.title, toggleFavorite]);

  useEffect(() => {
    setVisible(false);
    if (!algo) return;
    const id = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(id);
  }, [location.pathname, !!algo]);

  // Early return AFTER all hooks
  if (!algo || location.pathname === '/') return null;

  const handleShare = async () => {
    try { await navigator.clipboard.writeText(window.location.href); } catch {}
    setCopied(true);
  };

  const btnBase = `relative flex items-center justify-center w-10 h-10 rounded-xl
                   bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                   shadow-sm hover:shadow-md text-gray-600 dark:text-gray-400
                   hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600
                   transition-all duration-200 active:scale-95`;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {/* Algorithm info pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                      bg-white/95 dark:bg-gray-800/95 border border-gray-200/70 dark:border-gray-700/70
                      shadow-md backdrop-blur-sm text-xs font-semibold text-gray-700 dark:text-gray-300">
        <span>{algo.symbol}</span>
        <span className="max-w-[120px] truncate">{algo.title}</span>
        <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
          algo.difficulty === 'Easy' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
          algo.difficulty === 'Medium' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
          'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
        }`}>
          {algo.difficulty}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          aria-label="Back to home"
          title="Back to home"
          className={btnBase}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
        </button>

        {/* Favorite button */}
        <button
          onClick={() => toggleFavorite(algo.title)}
          aria-label={fav ? 'Remove from favorites (F)' : 'Add to favorites (F)'}
          title={fav ? 'Remove from favorites (F)' : 'Add to favorites (F)'}
          className={`${btnBase} ${fav ? 'text-red-500 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 hover:text-red-600' : ''}`}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${fav ? 'scale-110' : ''}`}
            fill={fav ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>

        {/* Share / copy link button */}
        <div className="relative">
          {copied && <ShareToast onDone={() => setCopied(false)} />}
          <button
            onClick={handleShare}
            aria-label="Copy link"
            title="Copy link to clipboard"
            className={btnBase}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default FloatingControls;
