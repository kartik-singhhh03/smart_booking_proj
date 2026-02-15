import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        background: 'var(--background)',
        'background-secondary': 'var(--background-secondary)',
        card: 'var(--card)',
        'card-hover': 'var(--card-hover)',
        'card-elevated': 'var(--card-elevated)',
        primary: 'var(--primary)',
        'primary-light': 'var(--primary-light)',
        'primary-muted': 'var(--primary-muted)',
        accent: 'var(--accent)',
        'accent-dark': 'var(--accent-dark)',
        foreground: 'var(--foreground)',
        'foreground-secondary': 'var(--foreground-secondary)',
        muted: 'var(--muted)',
        'muted-light': 'var(--muted-light)',
        border: 'var(--border)',
        'border-light': 'var(--border-light)',
        destructive: 'var(--destructive)',
        'destructive-bg': 'var(--destructive-bg)',
        success: 'var(--success)',
        'success-bg': 'var(--success-bg)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
        'pill': '9999px',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'scale-in': 'scaleIn 0.3s ease forwards',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'toast-in': 'toast-in 0.4s ease forwards',
        'toast-out': 'toast-out 0.3s ease forwards',
      },
      boxShadow: {
        'sage': '0 4px 20px rgba(45, 58, 45, 0.06)',
        'sage-md': '0 8px 30px rgba(45, 58, 45, 0.08)',
        'sage-lg': '0 12px 40px rgba(45, 58, 45, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
