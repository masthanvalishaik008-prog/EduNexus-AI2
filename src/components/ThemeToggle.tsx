import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'segmented' | 'button';
  showLabel?: boolean;
}

export function ThemeToggle({
  className = '',
  variant = 'segmented',
  showLabel = true,
}: ThemeToggleProps) {
  const { theme, toggleTheme, setTheme } = useTheme();

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
          theme === 'dark'
            ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 shadow-sm'
            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
        } ${className}`}
        title={`Switch to ${theme === 'dark' ? 'White / Light' : 'Dark'} Theme`}
        aria-label="Toggle light or dark theme"
      >
        {theme === 'dark' ? (
          <>
            <Moon className="w-3.5 h-3.5 text-amber-300" />
            {showLabel && <span>Dark Theme</span>}
          </>
        ) : (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            {showLabel && <span>White Theme</span>}
          </>
        )}
      </button>
    );
  }

  // Segmented control: Clear choices for "White (Light)" and "Dark"
  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl border transition-all text-xs select-none ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-700/80'
          : 'bg-slate-100/90 border-slate-200'
      } ${className}`}
      role="group"
      aria-label="Select website theme"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          theme === 'light'
            ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/80'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Switch to White (Light) Theme"
      >
        <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500' : 'text-slate-400'}`} />
        <span>White</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          theme === 'dark'
            ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-400/50'
            : 'text-slate-500 hover:text-slate-900'
        }`}
        title="Switch to Dark Theme"
      >
        <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-blue-100' : 'text-slate-400'}`} />
        <span>Dark</span>
      </button>
    </div>
  );
}
