'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Moon, Sun, Home } from 'lucide-react';
// components
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui';
import { useTheme } from 'next-themes';

const THEMES = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];

const Header = () => {
  const { setTheme, resolvedTheme = 'light' } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleThemeSelect = (value: string) => {
    setTheme(value);
    fetch('/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: value }),
    });
  };

  return (
    <div
      className="shadow-sm w-full sticky
    top-0 bg-white dark:bg-gray-900 z-[9]
        "
    >
      <div
        className="w-full mx-auto max-w-7xl
        py-2 px-5 flex items-center justify-between
        "
      >
        <div
          className="flex items-center
            flex-1 gap-9
            "
        >
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            <Link
              href="/dashboard"
              className="font-black text-[20px]
                      text-primary
                          "
            >
              Home
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`relative flex items-center justify-center h-8 w-8 rounded border transition-colors ${
                  resolvedTheme === 'dark' ? 'border-white' : 'border-gray-300'
                }`}
              >
                {isMounted &&
                  (resolvedTheme === 'dark' ? (
                    <Moon className="h-[1.2rem] w-[1.2rem] text-white" />
                  ) : (
                    <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
                  ))}
                <span className="sr-only">Toggle theme</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {THEMES.map(t => (
                <DropdownMenuItem key={t.value} onClick={() => handleThemeSelect(t.value)}>
                  {t.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Header;
