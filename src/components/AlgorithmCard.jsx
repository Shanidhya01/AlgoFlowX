import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const DIFF_BADGE = {
  Easy:   'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  Medium: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  Hard:   'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
};

const DIFF_DOT_COUNT = { Easy: 1, Medium: 2, Hard: 3 };

const AlgorithmCard = ({ title, description, symbol, difficulty, category, route, timeComplexity, spaceComplexity }) => {
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { isFavorite, toggleFavorite } = useApp();
  const fav = isFavorite(title);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const dotCount = DIFF_DOT_COUNT[difficulty] ?? 1;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      className="group relative w-full rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden
                 border border-gray-200/70 dark:border-gray-700/50
                 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-800 dark:to-gray-800/80
                 hover:border-blue-300 dark:hover:border-blue-700
                 hover:shadow-xl dark:hover:shadow-blue-900/20
                 hover:-translate-y-1"
      style={{ minHeight: '340px' }}
    >
      {/* Radial mouse-follow glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
        style={{
          background: hovered
            ? `radial-gradient(500px at ${mousePos.x}px ${mousePos.y}px, rgba(59,130,246,0.10), transparent 70%)`
            : 'transparent',
        }}
      />

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500 z-10" />

      {/* Top-right corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-violet-400/10 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />

      {/* Favorite button */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(title); }}
        aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
        className={`absolute top-3 right-3 z-20 p-2 rounded-xl transition-all duration-200
                   ${fav
                     ? 'bg-red-50 dark:bg-red-950/50 text-red-500 opacity-100'
                     : 'bg-gray-100/80 dark:bg-gray-700/80 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-400'
                   }`}
      >
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${fav ? 'scale-110 animate-heart-beat' : ''}`}
          fill={fav ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
      </button>

      {/* Card content */}
      <div className="relative h-full p-6 flex flex-col justify-between z-10">

        {/* Top section */}
        <div className="flex-1">
          {/* Symbol */}
          <div className="text-5xl mb-4 inline-block transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 origin-left">
            {symbol}
          </div>

          {/* Difficulty badge + dots */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${DIFF_BADGE[difficulty] ?? DIFF_BADGE.Medium}`}>
              {difficulty}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: dotCount }).map((_, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-70" />
              ))}
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium ml-1">{category}</span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2
                         group-hover:text-blue-600 dark:group-hover:text-blue-400
                         transition-colors duration-200 leading-snug line-clamp-2">
            {title}
          </h2>

          {/* Description */}
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>

        {/* Complexity info — appears on hover */}
        <div className={`grid grid-cols-2 gap-2 my-4 transition-all duration-300 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <div className="rounded-lg p-2.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
            <div className="flex items-center gap-1 mb-0.5">
              <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Time</span>
            </div>
            <span className="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">{timeComplexity}</span>
          </div>
          <div className="rounded-lg p-2.5 bg-violet-50/80 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/60">
            <div className="flex items-center gap-1 mb-0.5">
              <svg className="w-3 h-3 text-violet-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">Space</span>
            </div>
            <span className="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">{spaceComplexity}</span>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          to={route}
          className="group/btn relative flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl
                     bg-gradient-to-r from-blue-600 to-violet-600
                     hover:from-blue-500 hover:to-violet-500
                     text-white font-semibold text-sm
                     shadow-md hover:shadow-lg hover:shadow-blue-500/25
                     transition-all duration-200 active:scale-95 overflow-hidden mt-auto"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300" />
          <svg className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <span>Visualize &amp; Learn</span>
          <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default AlgorithmCard;
