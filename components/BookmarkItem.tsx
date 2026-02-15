'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Bookmark } from '@/lib/supabaseClient';
import { useToast } from './Toast';
import { Trash2, ExternalLink, Globe } from 'lucide-react';

interface BookmarkItemProps {
  bookmark: Bookmark;
}

export default function BookmarkItem({ bookmark }: BookmarkItemProps) {
  const [deleting, setDeleting] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const { toast } = useToast();

  const hostname = (() => {
    try {
      return new URL(bookmark.url).hostname.replace('www.', '');
    } catch {
      return bookmark.url;
    }
  })();

  const timeAgo = (() => {
    const diff = Date.now() - new Date(bookmark.created_at).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  })();

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from('bookmarks').delete().eq('id', bookmark.id);
    if (error) {
      toast('Failed to delete bookmark', 'error');
      setDeleting(false);
    } else {
      toast('Bookmark removed', 'info');
    }
  };

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

  return (
    <div className="group card-sage p-4 sm:p-5 flex items-start gap-4">
      {/* Favicon */}
      <div className="w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center flex-shrink-0 border border-border-light">
        {faviconError ? (
          <Globe className="w-4.5 h-4.5 text-muted" />
        ) : (
          <img
            src={faviconUrl}
            alt=""
            className="w-5 h-5 rounded-sm"
            onError={() => setFaviconError(true)}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link flex items-center gap-1.5"
        >
          <h3 className="text-sm font-semibold text-foreground truncate group-hover/link:text-primary-muted transition-colors">
            {bookmark.title}
          </h3>
          <ExternalLink className="w-3 h-3 text-muted-light opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0" />
        </a>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted truncate">{hostname}</span>
          <span className="text-xs text-muted-light">·</span>
          <span className="text-xs text-muted-light">{timeAgo}</span>
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="opacity-0 group-hover:opacity-100 transition-all duration-200 w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-destructive hover:bg-destructive-bg flex-shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
