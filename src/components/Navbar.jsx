import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const SunIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6"/>
        <stop offset="100%" stopColor="#8b5cf6"/>
      </linearGradient>
    </defs>
    <path d="M20 4L34.64 29H5.36L20 4Z" fill="url(#logoGrad)" />
    <circle cx="20" cy="26" r="9" fill="url(#logoGrad)" />
    <path d="M15 23.5L20 28.5L25 23.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const KBD_SHORTCUTS = [
  { keys: ['Ctrl', 'K'], description: 'Focus search' },
  { keys: ['Esc'], description: 'Close overlays / Go back' },
  { keys: ['Space'], description: 'Play / Pause visualization' },
  { keys: ['→'], description: 'Step forward' },
  { keys: ['←'], description: 'Step backward' },
  { keys: ['R'], description: 'Reset visualization' },
  { keys: ['F'], description: 'Toggle favorite' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
];

function KeyboardShortcutsModal({ onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>
            </svg>
            Keyboard Shortcuts
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="space-y-2">
          {KBD_SHORTCUTS.map(({ keys, description }) => (
            <div key={description} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <span className="text-sm text-gray-600 dark:text-gray-400">{description}</span>
              <div className="flex items-center gap-1">
                {keys.map(k => (
                  <kbd key={k} className="inline-flex items-center px-2 py-1 text-xs font-mono font-semibold
                                         bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600
                                         rounded text-gray-700 dark:text-gray-300 shadow-sm">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
          Press <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded font-mono">?</kbd> anytime to open this panel
        </p>
      </div>
    </div>
  );
}

function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { favorites } = useApp();

  useEffect(() => {
    const saved = localStorage.getItem('algoflowx-theme');
    const dark = saved === 'dark';
    setIsDark(dark);
    applyTheme(dark);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          setShortcutsOpen(v => !v);
        }
      }
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setShortcutsOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('[data-search-input]')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const applyTheme = (dark) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
    localStorage.setItem('algoflowx-theme', next ? 'dark' : 'light');
  };

  const isHome = location.pathname === '/';

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Algorithms', to: '/#algorithm-grid', scroll: true },
    { label: `Favorites${favorites.length ? ` (${favorites.length})` : ''}`, to: '/favorites' },
    { label: 'Settings', to: '/settings' },
  ];

  const handleNavClick = (link, e) => {
    if (link.scroll && isHome) {
      e.preventDefault();
      document.getElementById('algorithm-grid')?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-sm border-b border-gray-200/80 dark:border-gray-800/80'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <Logo />
              </div>
              <span
                className="text-xl font-extrabold tracking-tight text-gradient"
                style={{ letterSpacing: '-0.02em' }}
              >
                AlgoFlowX
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => {
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={(e) => handleNavClick(link, e)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Keyboard shortcut hint */}
              <button
                onClick={() => setShortcutsOpen(true)}
                title="Keyboard shortcuts (?)"
                aria-label="Keyboard shortcuts"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                           text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200
                           hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700
                           transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M7 16h10"/>
                </svg>
                <kbd className="font-mono">?</kbd>
              </button>

              {/* GitHub */}
              <a
                href="https://github.com/Shanidhya01"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100
                           hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100
                           hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 relative overflow-hidden"
              >
                <div className="transition-all duration-300" style={{ transform: isDark ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                  {isDark ? <SunIcon /> : <MoonIcon />}
                </div>
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(v => !v)}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100
                           hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <div className="w-5 h-4 flex flex-col justify-between relative">
                  <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                  <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
                  <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={(e) => handleNavClick(link, e)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.to
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => { setShortcutsOpen(true); setMobileOpen(false); }}
                className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition-all duration-200"
              >
                Keyboard Shortcuts
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Keyboard shortcuts modal */}
      {shortcutsOpen && <KeyboardShortcutsModal onClose={() => setShortcutsOpen(false)} />}
    </>
  );
}

export default Navbar;
