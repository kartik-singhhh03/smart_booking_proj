'use client';

import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { LogOut, Bookmark } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  user?: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-light">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <Bookmark className="w-4.5 h-4.5 text-card-elevated" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">
            Smart<span className="font-serif italic text-primary-muted">Bookmark</span>
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user && (
            <>
              {/* User info */}
              <div className="flex items-center gap-2 pl-3 border-l border-border-light">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full ring-2 ring-accent ring-offset-1 ring-offset-background"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-foreground-secondary max-w-[140px] truncate">
                  {user.email}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="btn-secondary !py-2 !px-4 text-xs flex items-center gap-1.5 hover:!border-destructive hover:!text-destructive"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
