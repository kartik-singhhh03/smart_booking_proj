'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import Navbar from '@/components/Navbar';
import BookmarkForm from '@/components/BookmarkForm';
import BookmarkList from '@/components/BookmarkList';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/login');
        return;
      }
      setUser(data.session.user);
      setLoading(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-7 h-7 text-primary-muted animate-spin" />
            <p className="text-sm text-muted font-medium">Loading your bookmarks...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page heading */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Your <span className="font-serif italic text-primary-muted">Collection</span>
          </h1>
          <p className="text-muted text-sm mt-1.5">
            Save, organize, and access your bookmarks in real-time
          </p>
        </div>

        {/* Form + List */}
        <div className="space-y-8">
          <BookmarkForm userId={user!.id} />
          <BookmarkList userId={user!.id} />
        </div>
      </main>
    </>
  );
}
