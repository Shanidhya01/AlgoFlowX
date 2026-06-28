import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../contexts/AppContext';
import { algorithms, stats } from '../data/algorithms';

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex-1 pr-4">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                   transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                   ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200
                     ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden mb-5">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
          <span>{icon}</span>
          {title}
        </h2>
      </div>
      <div className="px-6">{children}</div>
    </div>
  );
}

function SettingsPage() {
  const { favorites, recentlyViewed, visited, getProgress, clearRecentlyViewed } = useApp();
  const [isDark, setIsDark] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    setReducedMotion(localStorage.getItem('afxReducedMotion') === 'true');
  }, []);

  const toggleDark = (v) => {
    setIsDark(v);
    const root = document.documentElement;
    if (v) { root.classList.add('dark'); root.setAttribute('data-theme', 'dark'); }
    else { root.classList.remove('dark'); root.setAttribute('data-theme', 'light'); }
    localStorage.setItem('algoflowx-theme', v ? 'dark' : 'light');
  };

  const toggleReducedMotion = (v) => {
    setReducedMotion(v);
    localStorage.setItem('afxReducedMotion', String(v));
    document.documentElement.style.setProperty('--transition-base', v ? '0ms' : '200ms');
    document.documentElement.style.setProperty('--transition-slow', v ? '0ms' : '400ms');
  };

  const handleClearRecent = () => {
    clearRecentlyViewed();
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  const progress = getProgress();
  const pct = Math.round((progress / stats.total) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
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
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Preferences & your learning profile</p>
            </div>
          </div>
        </div>

        {/* Progress section */}
        <Section title="Your Progress" icon="📈">
          <div className="py-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">Algorithms explored</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{progress} / {stats.total}</span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: 'Favorites', value: favorites.length, icon: '❤️' },
                { label: 'Visited', value: progress, icon: '✅' },
                { label: 'Remaining', value: stats.total - progress, icon: '🎯' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" icon="🎨">
          <Toggle
            checked={isDark}
            onChange={toggleDark}
            label="Dark Mode"
            description="Use a dark color scheme to reduce eye strain"
          />
          <Toggle
            checked={reducedMotion}
            onChange={toggleReducedMotion}
            label="Reduce Motion"
            description="Minimize animations and transitions throughout the app"
          />
        </Section>

        {/* Privacy / Data */}
        <Section title="Data & Privacy" icon="🗂️">
          <div className="py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recently Viewed History</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{recentlyViewed.length} algorithm{recentlyViewed.length !== 1 ? 's' : ''} in history</p>
              </div>
              <button
                onClick={handleClearRecent}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  cleared
                    ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400'
                }`}
              >
                {cleared ? '✓ Cleared' : 'Clear history'}
              </button>
            </div>
          </div>
          <div className="py-4">
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              All data (favorites, progress, history) is stored locally in your browser. No account required. No data is sent to any server.
            </p>
          </div>
        </Section>

        {/* About */}
        <Section title="About AlgoFlowX" icon="ℹ️">
          <div className="py-5 space-y-3">
            {[
              { label: 'Version', value: '2.0.0' },
              { label: 'Algorithms', value: `${stats.total} visualizers` },
              { label: 'Categories', value: `${stats.categories} topics` },
              { label: 'Developer', value: 'Shanidhya Kumar' },
              { label: 'License', value: 'MIT · Open Source' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
              </div>
            ))}
            <div className="pt-3 flex gap-3">
              <a
                href="https://github.com/Shanidhya01"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                           border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50
                           text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <a
                href="https://shanidhya.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                           bg-gradient-to-r from-blue-600 to-violet-600 text-white
                           hover:from-blue-500 hover:to-violet-500 shadow-sm transition-all duration-200"
              >
                🎯 Portfolio
              </a>
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}

export default SettingsPage;
