import React, { useEffect, useRef, useState } from 'react';
import { stats } from '../data/algorithms';

const STAT_ITEMS = [
  { value: stats.total, label: 'Algorithms', suffix: '+', color: 'from-blue-500 to-cyan-500' },
  { value: stats.categories, label: 'Categories', suffix: '', color: 'from-purple-500 to-pink-500' },
  { value: 100, label: 'Interactive', suffix: '%', color: 'from-emerald-500 to-teal-500' },
  { value: 0, label: 'Cost', suffix: '$', color: 'from-orange-500 to-amber-500' },
];

const FEATURES = ['Step-by-step', 'Animated', 'Interactive', 'Educational'];

const FLOATING_LABELS = [
  { text: 'O(n log n)', x: '8%', y: '20%', delay: '0s', rotate: '-8deg' },
  { text: 'graph.dfs()', x: '75%', y: '15%', delay: '0.4s', rotate: '6deg' },
  { text: 'while(l<=r)', x: '82%', y: '60%', delay: '0.8s', rotate: '-4deg' },
  { text: 'dp[i][j]', x: '5%', y: '68%', delay: '1.2s', rotate: '5deg' },
  { text: '⚡ O(1)', x: '60%', y: '78%', delay: '0.6s', rotate: '-6deg' },
];

function AnimatedCounter({ target, suffix, duration = 1500 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const animate = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(ease * target));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  const display = suffix === '$' ? `${suffix}${count}` : `${count}${suffix}`;
  return <span ref={ref}>{display}</span>;
}

function Hero() {
  const [featureIdx, setFeatureIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFeatureIdx(i => (i + 1) % FEATURES.length), 2000);
    return () => clearInterval(id);
  }, []);

  const scrollToGrid = () => {
    document.getElementById('algorithm-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/10 py-20 md:py-28">

      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient glow blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-400/10 dark:bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating code labels */}
      {FLOATING_LABELS.map(({ text, x, y, delay, rotate }) => (
        <div
          key={text}
          className="absolute hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold
                     bg-white/80 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60
                     text-blue-600 dark:text-blue-400 shadow-sm backdrop-blur-sm
                     animate-float pointer-events-none select-none"
          style={{ left: x, top: y, animationDelay: delay, transform: `rotate(${rotate})` }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          {text}
        </div>
      ))}

      {/* Main content */}
      <div className="relative max-w-5xl mx-auto px-6 text-center">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8
                     bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/50
                     text-blue-700 dark:text-blue-300"
          style={{ animation: 'fadeInDown 0.5s ease-out' }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          Interactive Algorithm Learning Platform
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.08]"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.1s both' }}
        >
          <span className="text-gray-900 dark:text-white">Master </span>
          <span className="text-gradient">Algorithms</span>
          <br />
          <span className="text-gray-900 dark:text-white">Visually</span>
        </h1>

        {/* Rotating feature text */}
        <div
          className="flex items-center justify-center gap-3 mb-6"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}
        >
          <span className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-medium">
            Learn through
          </span>
          <span
            key={featureIdx}
            className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400"
            style={{ animation: 'fadeInUp 0.35s ease-out' }}
          >
            {FEATURES[featureIdx]}
          </span>
          <span className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-medium">
            visualizations
          </span>
        </div>

        {/* Subtitle */}
        <p
          className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}
        >
          Explore {stats.total}+ algorithms across {stats.categories} categories with step-by-step
          animations, pseudocode, complexity analysis, and interactive controls — completely free.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}
        >
          <button
            onClick={scrollToGrid}
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base
                       bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500
                       text-white shadow-lg hover:shadow-blue-500/30 hover:shadow-xl
                       transition-all duration-200 active:scale-95"
          >
            <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Explore Algorithms
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <a
            href="https://github.com/Shanidhya01"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base
                       bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700
                       text-gray-800 dark:text-gray-200 hover:border-blue-400 dark:hover:border-blue-500
                       shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>

        {/* Stats row */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.5s both' }}
        >
          {STAT_ITEMS.map(({ value, label, suffix, color }) => (
            <div
              key={label}
              className="group relative rounded-2xl p-4 bg-white/70 dark:bg-gray-800/60
                         border border-gray-200/60 dark:border-gray-700/40
                         backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200
                         hover:-translate-y-0.5"
            >
              <div className={`text-3xl font-extrabold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-1`}>
                <AnimatedCounter target={value} suffix={suffix} />
              </div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {label}
              </div>
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-3/4 bg-gradient-to-r ${color} rounded-full transition-all duration-300`} />
            </div>
          ))}
        </div>

        {/* Difficulty breakdown */}
        <div
          className="flex items-center justify-center gap-6 mt-8"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.6s both' }}
        >
          {[
            { label: 'Easy', count: stats.easy, color: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
            { label: 'Medium', count: stats.medium, color: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' },
            { label: 'Hard', count: stats.hard, color: 'bg-red-500', text: 'text-red-700 dark:text-red-400' },
          ].map(({ label, count, color, text }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className={`text-sm font-semibold ${text}`}>{count} {label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
