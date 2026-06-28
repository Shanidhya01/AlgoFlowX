import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { algorithms } from '../data/algorithms';

const DIFF_COLORS = {
  Easy:   'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
  Medium: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
  Hard:   'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300',
};

function fuzzyMatch(query, str) {
  const q = query.toLowerCase();
  const s = str.toLowerCase();
  if (s.includes(q)) return true;
  let qi = 0;
  for (let i = 0; i < s.length && qi < q.length; i++) {
    if (s[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

function scoreMatch(query, algo) {
  const q = query.toLowerCase();
  const title = algo.title.toLowerCase();
  const cat = algo.category.toLowerCase();
  const desc = algo.description.toLowerCase();
  if (title === q) return 100;
  if (title.startsWith(q)) return 90;
  if (title.includes(q)) return 80;
  if (cat.includes(q)) return 60;
  if (desc.includes(q)) return 40;
  if (fuzzyMatch(q, title)) return 30;
  return 0;
}

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  const results = query.trim()
    ? algorithms
        .map(a => ({ ...a, score: scoreMatch(query, a) }))
        .filter(a => a.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
    : algorithms.slice(0, 8);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  const handleSelect = useCallback((algo) => {
    navigate(algo.route);
    onClose();
  }, [navigate, onClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[selectedIdx]) handleSelect(results[selectedIdx]);
  }, [results, selectedIdx, handleSelect, onClose]);

  useEffect(() => {
    const item = listRef.current?.children[selectedIdx];
    item?.scrollIntoView({ block: 'nearest' });
  }, [selectedIdx]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-drop-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200 dark:border-gray-700">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search algorithms..."
            className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm font-medium outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-72 overflow-y-auto py-1.5">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
              No algorithms match &ldquo;{query}&rdquo;
            </div>
          ) : results.map((algo, i) => (
            <button
              key={algo.title}
              onClick={() => handleSelect(algo)}
              onMouseEnter={() => setSelectedIdx(i)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-100 ${
                i === selectedIdx ? 'bg-blue-50 dark:bg-blue-950/50' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <span className="text-xl flex-shrink-0 w-8 text-center">{algo.symbol}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm font-semibold ${i === selectedIdx ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
                    {algo.title}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${DIFF_COLORS[algo.difficulty]}`}>
                    {algo.difficulty}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px] font-medium">{algo.category}</span>
                  <span className="font-mono text-[10px]">{algo.timeComplexity}</span>
                </div>
              </div>
              {i === selectedIdx && (
                <kbd className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">↵</kbd>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[10px]">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[10px]">↵</kbd> open</span>
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[10px]">esc</kbd> close</span>
          <span className="ml-auto">{algorithms.length} algorithms</span>
        </div>
      </div>
    </div>
  );
}
