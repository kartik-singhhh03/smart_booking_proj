'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase, Bookmark } from '@/lib/supabaseClient';
import BookmarkItem from './BookmarkItem';
import { useToast } from './Toast';
import { Bookmark as BookmarkIcon, Loader2 } from 'lucide-react';

interface BookmarkListProps {
  userId: string;
}

export default function BookmarkList({ userId }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const { toast } = useToast();

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      toast('Failed to load bookmarks', 'error');
      console.error('Fetch error:', error);
    } else {
      setBookmarks(data || []);
    }
    setLoading(false);
  }, [userId, toast]);

  useEffect(() => {
    fetchBookmarks();

    // Set up realtime subscription
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let retryCount = 0;
    let retryTimeout: NodeJS.Timeout | null = null;
    let currentUserId: string | undefined;

    const subscribe = () => {
      if (!currentUserId) return;

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
            if (newBookmark.user_id !== currentUserId) return;
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
            setIsLive(true);
            retryCount = 0;
          }
          if (status === 'CHANNEL_ERROR') {
            setIsLive(false);
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
      currentUserId = sessionData.session?.user?.id;
      if (currentUserId) subscribe();
    };

    init();

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchBookmarks, toast]);

  return (
    <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-foreground">Your Bookmarks</h2>
        {isLive && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-success bg-success-bg px-3 py-1.5 rounded-pill">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            Live
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="card-elevated p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-muted animate-spin" />
          <p className="text-sm text-muted">Loading your bookmarks...</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="card-elevated p-12 flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent/40 flex items-center justify-center">
            <BookmarkIcon className="w-7 h-7 text-primary-muted" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">No bookmarks yet</p>
            <p className="text-sm text-muted mt-1">
              Start adding bookmarks using the form above to organize your favorite links
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bookmark, i) => (
            <div
              key={bookmark.id}
              className="animate-fade-up"
              style={{ animationDelay: `${0.05 * i}s` }}
            >
              <BookmarkItem bookmark={bookmark} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
