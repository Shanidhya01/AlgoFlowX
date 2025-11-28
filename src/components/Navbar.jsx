import React, { useEffect, useState } from 'react';
import styles from '../styles/Navbar.module.css';

const themes = [
    { name: 'light', icon: '☀️' },
    { name: 'dark', icon: '🌙' }
];

const Logo = () => (
    <svg className={styles.logo} width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 5L33.6603 28.75H6.33975L20 5Z" fill="currentColor" />
        <circle cx="20" cy="25" r="10" fill="currentColor" />
        <path d="M15 22.5L20 27.5L25 22.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

function Navbar() {
    const [currentTheme, setCurrentTheme] = useState(themes[0]);
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

    // Apply theme to <html> element for global Tailwind + CSS variables
    const applyTheme = (themeName) => {
        const root = document.documentElement; // <html>
        // data-theme for CSS variable palettes (light/blue/green/dark)
        root.setAttribute('data-theme', themeName);
        // Tailwind dark variant toggling
        if (themeName === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem('algoflowx-theme');
        const allowed = new Set(['light','dark']);
        const selected = allowed.has(saved) ? saved : 'light';
        if (!allowed.has(saved)) {
            localStorage.setItem('algoflowx-theme', 'light');
        }
        const initial = themes.find(t => t.name === selected) || themes[0];
        setCurrentTheme(initial);
        applyTheme(initial.name);
    }, []);

    const handleThemeChange = (theme) => {
        setCurrentTheme(theme);
        applyTheme(theme.name);
        localStorage.setItem('algoflowx-theme', theme.name);
        setIsThemeMenuOpen(false);
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.leftSection}>
                <Logo />
                <h1 className={styles.brandName}>AlgoFlowX</h1>
            </div>
            <div className={styles.rightSection}>
                <div className={styles.themeSelector}>
                    <button
                        className={styles.themeButton}
                        onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                    >
                        {currentTheme.icon}
                    </button>
                    {isThemeMenuOpen && (
                        <div className={styles.themeMenu}>
                            {themes.map((theme) => (
                                <button
                                    key={theme.name}
                                    className={`${styles.themeOption} ${currentTheme.name === theme.name ? styles.active : ''}`}
                                    onClick={() => handleThemeChange(theme)}
                                >
                                    {theme.icon} {theme.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

