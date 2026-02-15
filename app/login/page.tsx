'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Bookmark, Shield, Zap, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signInError) {
        setError(signInError.message);
        console.error('Error signing in:', signInError);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error:', err);
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="glass-card rounded-3xl p-8 sm:p-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 glow">
                <Bookmark className="w-10 h-10 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                Smart<span className="gradient-text">Bookmark</span>
              </h1>
              <p className="text-muted-foreground mt-2">
                Save and organize your links with real-time sync
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-foreground">Realtime Sync</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-foreground">Secure & Private</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium text-center animate-scale-in">
              {error}
            </div>
          )}

          {/* Sign in button */}
          <button
            id="google-signin-button"
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            className="w-full px-6 py-3.5 bg-card border-2 border-border hover:border-primary/50 text-foreground font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 group hover:shadow-lg hover:shadow-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {signingIn ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="group-hover:scale-110 transition-transform duration-200"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            <span>{signingIn ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>

          {/* Info */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              We only support Google authentication for security and simplicity.
              Your bookmarks are private and secured with Row Level Security.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground/60 text-xs mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
