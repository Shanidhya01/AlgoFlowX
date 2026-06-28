import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const MAX_RECENT = 10;

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export const AppProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => load('afxFavorites', []));
  const [recentlyViewed, setRecentlyViewed] = useState(() => load('afxRecent', []));
  const [visited, setVisited] = useState(() => load('afxVisited', {}));
  const [keyboardShortcutsOpen, setKeyboardShortcutsOpen] = useState(false);

  useEffect(() => { save('afxFavorites', favorites); }, [favorites]);
  useEffect(() => { save('afxRecent', recentlyViewed); }, [recentlyViewed]);
  useEffect(() => { save('afxVisited', visited); }, [visited]);

  const isFavorite = useCallback((title) => favorites.includes(title), [favorites]);

  const toggleFavorite = useCallback((title) => {
    setFavorites(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  }, []);

  const addRecentlyViewed = useCallback((algo) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(a => a.route !== algo.route);
      const updated = [{ ...algo, visitedAt: Date.now() }, ...filtered].slice(0, MAX_RECENT);
      return updated;
    });
    setVisited(prev => ({ ...prev, [algo.title]: true }));
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
  }, []);

  const getProgress = useCallback(() => {
    return Object.keys(visited).length;
  }, [visited]);

  return (
    <AppContext.Provider value={{
      favorites,
      isFavorite,
      toggleFavorite,
      recentlyViewed,
      addRecentlyViewed,
      clearRecentlyViewed,
      visited,
      getProgress,
      keyboardShortcutsOpen,
      setKeyboardShortcutsOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
};
