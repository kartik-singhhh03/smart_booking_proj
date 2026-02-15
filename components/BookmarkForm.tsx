'use client';

import { FormEvent, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Link as LinkIcon, Type, Loader2 } from 'lucide-react';
import { useToast } from './Toast';

interface BookmarkFormProps {
  onBookmarkAdded?: () => void;
}

export default function BookmarkForm({ onBookmarkAdded }: BookmarkFormProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const validateUrl = (urlString: string): boolean => {
    try {
      const parsed = new URL(urlString);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (!userId) {
        setError('User not authenticated');
        return;
      }

      const { error: insertError } = await supabase
        .from('bookmarks')
        .insert([
          {
            user_id: userId,
            title: title.trim(),
            url: url.trim(),
          },
        ]);

      if (insertError) {
        setError(insertError.message);
        toast(insertError.message, 'error');
        return;
      }

      setTitle('');
      setUrl('');
      toast('Bookmark added successfully!', 'success');
      onBookmarkAdded?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card rounded-2xl p-6 space-y-5 animate-fade-in"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Add New Bookmark</h2>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium animate-scale-in">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="bookmark-title" className="block text-sm font-medium text-muted-foreground">
            Title
          </label>
          <div className="relative">
            <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <input
              id="bookmark-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., My Favorite Blog"
              className="w-full pl-11 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 transition-all duration-200"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="bookmark-url" className="block text-sm font-medium text-muted-foreground">
            URL
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <input
              id="bookmark-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g., https://example.com"
              className="w-full pl-11 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 transition-all duration-200"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <button
        id="add-bookmark-button"
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-muted disabled:to-muted disabled:text-muted-foreground text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:shadow-none flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Add Bookmark
          </>
        )}
      </button>
    </form>
  );
}
