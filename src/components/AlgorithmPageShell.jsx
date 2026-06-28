import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import toast from 'react-hot-toast';

const SPEEDS = [
  { label: 'Slow', ms: 1200 },
  { label: 'Normal', ms: 600 },
  { label: 'Fast', ms: 200 },
  { label: '⚡', ms: 60 },
];

const DIFF_STYLE = {
  Easy:   'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  Medium: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  Hard:   'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
};

function ControlButton({ onClick, disabled, className, children, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center justify-center gap-1.5 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <pre className="text-sm leading-relaxed overflow-x-auto p-5 rounded-2xl bg-gray-950 dark:bg-gray-900 text-gray-100 border border-gray-800">
        <code>{code.trim()}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                   bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white
                   opacity-0 group-hover:opacity-100 transition-all duration-200"
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}

export { CodeBlock };

export function AlgorithmPageShell({
  title,
  description,
  category,
  difficulty,
  steps = [],
  currentStep = 0,
  isRunning = false,
  onPlay,
  onPause,
  onReset,
  onStepForward,
  onStepBack,
  speed = 600,
  onSpeedChange,
  onRandomize,
  customInput = '',
  onCustomInput,
  inputError = '',
  inputPlaceholder = '',
  inputLabel = '',
  showInput = true,
  stats = {},
  message = '',
  done = false,
  theory,
  code,
  children,
}) {
  const [tab, setTab] = useState('visualizer');
  const { isFavorite, toggleFavorite } = useApp();
  const fav = isFavorite(title);

  const progress = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;

  const handleFav = () => {
    toggleFavorite(title);
    toast(fav ? `Removed from favorites` : `Added to favorites ❤️`, {
      icon: fav ? '💔' : '❤️',
      style: {
        borderRadius: '12px',
        background: 'var(--bg-card)',
        color: 'var(--text-color)',
        border: '1px solid var(--border-color)',
        fontSize: '14px',
      },
      duration: 1800,
    });
  };

  const TABS = [
    { id: 'visualizer', label: '⚡ Visualizer' },
    { id: 'theory', label: '📖 Theory' },
    { id: 'code', label: '💻 Code' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 py-3">
            <Link
              to="/"
              title="Back to home"
              className="flex-shrink-0 p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                  {category}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${DIFF_STYLE[difficulty] || DIFF_STYLE.Medium}`}>
                  {difficulty}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{title}</h1>
            </div>

            <button
              onClick={handleFav}
              title={fav ? 'Remove from favorites (F)' : 'Add to favorites (F)'}
              className={`flex-shrink-0 p-2.5 rounded-xl border transition-all duration-200 active:scale-90 ${
                fav
                  ? 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-500'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-200 dark:hover:border-red-800'
              }`}
            >
              <svg className="w-4 h-4" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5 -mb-px">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl border-b-2 transition-all duration-200 ${
                  tab === id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visualizer Tab */}
      {tab === 'visualizer' && (
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-5">

            {/* Controls sidebar */}
            <aside className="lg:w-64 flex-shrink-0 space-y-4">

              {/* Playback */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Playback</p>

                <ControlButton
                  onClick={isRunning ? onPause : onPlay}
                  disabled={done && !isRunning && currentStep >= steps.length - 1}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-sm"
                  title={isRunning ? 'Pause (Space)' : 'Play (Space)'}
                >
                  {isRunning ? (
                    <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>Pause</>
                  ) : (
                    <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>{currentStep === 0 ? 'Play' : 'Resume'}</>
                  )}
                </ControlButton>

                <div className="grid grid-cols-2 gap-2">
                  <ControlButton
                    onClick={onStepBack}
                    disabled={isRunning || currentStep === 0}
                    className="py-2 px-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Step back (←)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                    Back
                  </ControlButton>
                  <ControlButton
                    onClick={onStepForward}
                    disabled={isRunning || currentStep >= steps.length - 1}
                    className="py-2 px-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Step forward (→)"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </ControlButton>
                </div>

                <ControlButton
                  onClick={onReset}
                  className="w-full py-2 px-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Reset (R)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  Reset
                </ControlButton>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1.5">
                    <span>Step {currentStep + 1} / {Math.max(steps.length, 1)}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Speed */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Speed</p>
                <div className="grid grid-cols-4 gap-1">
                  {SPEEDS.map(s => (
                    <button
                      key={s.ms}
                      onClick={() => onSpeedChange(s.ms)}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                        speed === s.ms
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              {showInput && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{inputLabel || 'Input'}</p>
                  <input
                    type="text"
                    value={customInput}
                    onChange={e => onCustomInput(e.target.value)}
                    placeholder={inputPlaceholder}
                    disabled={isRunning}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                               bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100
                               focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                               placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200
                               disabled:opacity-50"
                  />
                  {inputError && (
                    <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                      {inputError}
                    </p>
                  )}
                  <button
                    onClick={onRandomize}
                    disabled={isRunning}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold
                               bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500
                               text-white transition-all duration-150 active:scale-95 disabled:opacity-50"
                  >
                    🎲 Random Input
                  </button>
                </div>
              )}

              {/* Stats */}
              {Object.keys(stats).length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Statistics</p>
                  <div className="space-y-2">
                    {Object.entries(stats).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-sm font-bold font-mono text-gray-900 dark:text-gray-100">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            {/* Main area */}
            <main className="flex-1 min-w-0 space-y-4">
              {/* Step message */}
              <div className={`px-5 py-3.5 rounded-2xl text-sm font-medium border leading-relaxed transition-all duration-300 ${
                done
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-800/60 text-blue-800 dark:text-blue-300'
              }`}>
                {message || 'Press Play or use Step controls to start the visualization.'}
              </div>

              {/* Visualization */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 overflow-x-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      )}

      {/* Theory Tab */}
      {tab === 'theory' && (
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6">
          {theory || <p className="text-gray-400 dark:text-gray-500 text-center py-16">Theory content coming soon.</p>}
        </div>
      )}

      {/* Code Tab */}
      {tab === 'code' && (
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6">
          {code || <p className="text-gray-400 dark:text-gray-500 text-center py-16">Code examples coming soon.</p>}
        </div>
      )}
    </div>
  );
}

export function TheorySection({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-5">
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export function ComplexityTable({ rows }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-5 overflow-x-auto">
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Complexity Analysis</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Case</th>
            <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Time</th>
            <th className="text-left py-2 font-semibold text-gray-700 dark:text-gray-300">Space</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([c, t, s]) => (
            <tr key={c} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
              <td className="py-2 pr-4 text-gray-600 dark:text-gray-400 font-medium">{c}</td>
              <td className="py-2 pr-4 font-mono font-semibold text-blue-600 dark:text-blue-400">{t}</td>
              <td className="py-2 font-mono font-semibold text-violet-600 dark:text-violet-400">{s}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MultiLangCode({ implementations }) {
  const langs = Object.keys(implementations);
  const [lang, setLang] = useState(langs[0]);
  return (
    <div>
      <div className="flex gap-1 mb-3 flex-wrap">
        {langs.map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
              lang === l
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <CodeBlock code={implementations[lang]} lang={lang} />
    </div>
  );
}
