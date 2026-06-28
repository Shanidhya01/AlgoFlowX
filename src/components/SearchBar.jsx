import React, { useRef, useState } from 'react';
import { useSearch } from '../contexts/SearchContext';

function SearchBar() {
  const { searchTerm, setSearchTerm } = useSearch();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  // Register as the global Ctrl+K target
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setAttribute('data-search-input', 'true');
    }
  }, []);

  const handleClear = () => {
    setSearchTerm('');
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-5 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-2xl mx-auto">
        <div
          className={`relative flex items-center rounded-2xl border-2 transition-all duration-200 shadow-sm overflow-hidden
                      bg-white dark:bg-gray-800 ${
                        focused
                          ? 'border-blue-500 dark:border-blue-500 shadow-lg shadow-blue-500/10 dark:shadow-blue-500/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
        >
          {/* Search icon */}
          <div className={`pl-4 transition-colors duration-200 ${focused ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            data-search-input="true"
            type="text"
            placeholder="Search algorithms by name, category, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1 px-4 py-3.5 text-sm font-medium bg-transparent text-gray-900 dark:text-gray-100
                       placeholder-gray-400 dark:placeholder-gray-500 outline-none"
            aria-label="Search algorithms"
          />

          {/* Clear button */}
          {searchTerm && (
            <button
              onClick={handleClear}
              aria-label="Clear search"
              className="mr-2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          )}

          {/* Keyboard shortcut hint */}
          {!focused && !searchTerm && (
            <div className="hidden sm:flex items-center gap-1 mr-3 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
              <kbd className="text-xs font-mono text-gray-500 dark:text-gray-400">Ctrl</kbd>
              <span className="text-xs text-gray-400 dark:text-gray-500">+</span>
              <kbd className="text-xs font-mono text-gray-500 dark:text-gray-400">K</kbd>
            </div>
          )}
        </div>

        {/* Search hint */}
        {searchTerm && (
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center animate-fade-in">
            Searching for "<span className="font-semibold text-blue-600 dark:text-blue-400">{searchTerm}</span>"
            · <button onClick={handleClear} className="hover:underline">clear</button>
          </p>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
