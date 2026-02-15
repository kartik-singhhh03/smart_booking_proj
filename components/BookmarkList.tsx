'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Bookmark } from '@/lib/supabaseClient';
import BookmarkItem from './BookmarkItem';
import { BookmarkIcon, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from './Toast';

export default function BookmarkList() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (!userId) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setBookmarks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();

    // Set up realtime subscription
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let retryCount = 0;
    let retryTimeout: NodeJS.Timeout | null = null;
    let userId: string | undefined;

    const subscribe = () => {
      if (!userId) return;

      // Clean up previous channel if retrying
      if (channel) {
        supabase.removeChannel(channel);
      }

      channel = supabase
        .channel(`bookmarks_realtime_${retryCount}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'bookmarks',
          },
          (payload) => {
            const newBookmark = payload.new as Bookmark;
            // Client-side filter by user_id
            if (newBookmark.user_id !== userId) return;
            setBookmarks((prev) => {
              if (prev.some((b) => b.id === newBookmark.id)) return prev;
              return [newBookmark, ...prev];
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'bookmarks',
          },
          (payload) => {
            setBookmarks((prev) =>
              prev.filter((b) => b.id !== payload.old.id)
            );
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Realtime subscription active');
            retryCount = 0;
          }
          if (status === 'CHANNEL_ERROR') {
            retryCount++;
            console.warn(`Realtime error (attempt ${retryCount})`);
            if (retryCount <= 3) {
              retryTimeout = setTimeout(subscribe, retryCount * 2000);
            } else {
              toast('Realtime sync unavailable — changes will appear on refresh', 'info');
            }
          }
        });
    };

    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      userId = sessionData.session?.user?.id;
      if (userId) subscribe();
    };

    init();

    // Cleanup subscription on unmount
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchBookmarks, toast]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center animate-fade-in">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
        <p className="text-muted-foreground mt-4 text-sm">Loading your bookmarks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
          <BookmarkIcon className="w-8 h-8 text-primary/60" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No bookmarks yet</h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Start adding bookmarks using the form above to organize your favorite links
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Your Bookmarks
          <span className="text-sm font-normal text-muted-foreground">
            ({bookmarks.length})
          </span>
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>
      <div className="space-y-3">
        {bookmarks.map((bookmark) => (
          <BookmarkItem
            key={bookmark.id}
            bookmark={bookmark}
          />
        ))}
      </div>
    </div>
  );
}
