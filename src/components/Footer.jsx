import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiGmail } from 'react-icons/si';
import { algorithms } from '../data/algorithms';

const SOCIAL_LINKS = [
  { href: 'https://github.com/Shanidhya01', Icon: FaGithub, label: 'GitHub', color: 'hover:text-gray-900 dark:hover:text-white' },
  { href: 'https://linkedin.com/in/shanidhya-kumar', Icon: FaLinkedinIn, label: 'LinkedIn', color: 'hover:text-blue-600' },
  { href: 'https://twitter.com/kshanidhya01', Icon: FaXTwitter, label: 'Twitter', color: 'hover:text-gray-900 dark:hover:text-white' },
  { href: 'https://instagram.com/kshanidhya', Icon: FaInstagram, label: 'Instagram', color: 'hover:text-pink-600' },
  { href: 'mailto:luckykumar0011s@gmail.com', Icon: SiGmail, label: 'Email', color: 'hover:text-red-600' },
];

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Favorites', to: '/favorites' },
  { label: 'Settings', to: '/settings' },
];

// Build category quick links from algorithm data
const categoryMap = {};
algorithms.forEach(a => {
  if (!categoryMap[a.category]) categoryMap[a.category] = a.route;
});
const CATEGORY_LINKS = Object.entries(categoryMap).slice(0, 6).map(([cat, route]) => ({
  label: cat,
  route,
}));

const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
    <defs>
      <linearGradient id="fLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6"/>
        <stop offset="100%" stopColor="#8b5cf6"/>
      </linearGradient>
    </defs>
    <path d="M20 4L34.64 29H5.36L20 4Z" fill="url(#fLogoGrad)" />
    <circle cx="20" cy="26" r="9" fill="url(#fLogoGrad)" />
    <path d="M15 23.5L20 28.5L25 23.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <Logo />
              <span className="text-lg font-extrabold text-gradient tracking-tight">AlgoFlowX</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
              A free, interactive algorithm visualization platform. Master data structures and algorithms through beautiful, step-by-step animations.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ href, Icon, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl
                             bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                             text-gray-500 dark:text-gray-400 ${color}
                             hover:border-gray-300 dark:hover:border-gray-600
                             hover:shadow-sm transition-all duration-200 active:scale-90`}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-500 transition-colors duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://shanidhya.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-500 transition-colors duration-200" />
                  Portfolio
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Shanidhya01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-500 transition-colors duration-200" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Algorithm categories */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {CATEGORY_LINKS.map(({ label, route }) => (
                <li key={label}>
                  <Link
                    to={route}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-500 transition-colors duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {year} AlgoFlowX. Crafted with ❤️ by{' '}
            <a
              href="https://shanidhya.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Shanidhya Kumar
            </a>
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {algorithms.length} algorithms · Free forever
            </span>
            <a
              href="https://github.com/Shanidhya01"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <FaGithub size={12} />
              Star on GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
