'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import BookmarkForm from '@/components/BookmarkForm';
import BookmarkList from '@/components/BookmarkList';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          router.push('/login');
          return;
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      }
    });

    return () => {
      data?.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="glass-card rounded-2xl p-12 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="gradient-text">Save Your Links</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-md mx-auto">
            Store and organize your bookmarks with real-time sync across all your devices
          </p>
        </div>

        {/* Form */}
        <BookmarkForm />

        {/* List */}
        <BookmarkList />
      </div>
    </div>
  );
}
