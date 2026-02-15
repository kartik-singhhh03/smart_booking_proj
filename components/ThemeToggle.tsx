'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
    const [dark, setDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = stored === 'dark' || (!stored && prefersDark);
        setDark(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    }, []);

    const toggle = () => {
        const newDark = !dark;
        setDark(newDark);
        document.documentElement.classList.toggle('dark', newDark);
        localStorage.setItem('theme', newDark ? 'dark' : 'light');
    };

    if (!mounted) return null;

    return (
        <button
            id="theme-toggle"
            onClick={toggle}
            className="relative w-10 h-10 rounded-xl bg-muted hover:bg-accent/10 flex items-center justify-center transition-all duration-300 group"
            aria-label="Toggle dark mode"
        >
            {dark ? (
                <Sun className="w-[18px] h-[18px] text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
                <Moon className="w-[18px] h-[18px] text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" />
            )}
        </button>
    );
}
