'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = saved === 'dark' || (!saved && prefersDark);
        setDark(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    }, []);

    const toggle = () => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggle}
            className="w-9 h-9 rounded-full bg-card border border-border-light flex items-center justify-center hover:bg-card-hover transition-all duration-200 hover:scale-105"
            aria-label="Toggle theme"
        >
            {dark ? (
                <Sun className="w-4 h-4 text-accent" />
            ) : (
                <Moon className="w-4 h-4 text-primary-muted" />
            )}
        </button>
    );
}
