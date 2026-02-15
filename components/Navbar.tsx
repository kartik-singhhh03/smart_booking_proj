'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { LogOut, Bookmark } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      data?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow duration-300">
            <Bookmark className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">
            Smart<span className="gradient-text">Bookmark</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {!loading && user ? (
            <>
              {user.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full ring-2 ring-border"
                />
              )}
              <span className="hidden sm:block text-sm text-muted-foreground max-w-[180px] truncate">
                {user.email}
              </span>
              <button
                id="logout-button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-muted hover:bg-destructive/10 hover:text-destructive text-muted-foreground font-medium text-sm transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : !loading ? (
            <Link
              href="/login"
              id="login-link"
              className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
            >
              Login
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
