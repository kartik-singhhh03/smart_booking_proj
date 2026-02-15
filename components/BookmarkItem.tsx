'use client';

import { useCallback, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Bookmark } from '@/lib/supabaseClient';
import { Trash2, ExternalLink, Globe } from 'lucide-react';
import { useToast } from './Toast';

interface BookmarkItemProps {
  bookmark: Bookmark;
  onDeleted?: () => void;
}

export default function BookmarkItem({ bookmark, onDeleted }: BookmarkItemProps) {
  const [deleting, setDeleting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { toast } = useToast();

  const faviconUrl = useMemo(() => {
    try {
      const parsed = new URL(bookmark.url);
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`;
    } catch {
      return null;
    }
  }, [bookmark.url]);

  const hostname = useMemo(() => {
    try {
      return new URL(bookmark.url).hostname.replace('www.', '');
    } catch {
      return bookmark.url;
    }
  }, [bookmark.url]);

  const formatRelativeTime = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return date.toLocaleDateString();
  }, []);

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmark.id);

      if (error) {
        console.error('Error deleting bookmark:', error);
        toast('Failed to delete bookmark', 'error');
        return;
      }

      toast('Bookmark deleted', 'info');
      onDeleted?.();
    } catch (error) {
      console.error('Error:', error);
      toast('An unexpected error occurred', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="glass-card rounded-xl hover:border-primary/20 transition-all duration-300 p-4 flex items-center gap-4 group animate-fade-in">
      {/* Favicon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
        {faviconUrl && !imgError ? (
          <img
            src={faviconUrl}
            alt=""
            width={20}
            height={20}
            className="w-5 h-5"
            onError={() => setImgError(true)}
          />
        ) : (
          <Globe className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group/link"
        >
          <h3 className="font-semibold text-foreground group-hover/link:text-primary transition-colors duration-200 truncate flex items-center gap-2">
            {bookmark.title}
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 flex-shrink-0" />
          </h3>
        </a>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground truncate">{hostname}</p>
          <span className="text-muted-foreground/40">·</span>
          <p className="text-xs text-muted-foreground/70 flex-shrink-0">
            {formatRelativeTime(bookmark.created_at)}
          </p>
        </div>
      </div>

      {/* Delete */}
      <button
        id={`delete-bookmark-${bookmark.id}`}
        onClick={handleDelete}
        disabled={deleting}
        className="flex-shrink-0 p-2 rounded-lg opacity-0 group-hover:opacity-100 bg-transparent hover:bg-destructive/10 disabled:bg-muted text-muted-foreground hover:text-destructive disabled:text-muted-foreground transition-all duration-200"
        aria-label={`Delete ${bookmark.title}`}
      >
        {deleting ? (
          <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
