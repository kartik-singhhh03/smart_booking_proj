'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from './Toast';
import { Plus, Type, Link2, Loader2 } from 'lucide-react';

interface BookmarkFormProps {
  userId: string;
}

export default function BookmarkForm({ userId }: BookmarkFormProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();

    if (!trimmedTitle || !trimmedUrl) {
      toast('Please fill in both title and URL', 'error');
      return;
    }

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      toast('URL must start with http:// or https://', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('bookmarks').insert({
        title: trimmedTitle,
        url: trimmedUrl,
        user_id: userId,
      });

      if (error) {
        toast('Failed to add bookmark', 'error');
        console.error('Insert error:', error);
      } else {
        toast('Bookmark added', 'success');
        setTitle('');
        setUrl('');
      }
    } catch {
      toast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-elevated p-6 sm:p-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Plus className="w-5 h-5 text-card-elevated" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Add New Bookmark</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-1.5">Title</label>
          <div className="relative">
            <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., My Favorite Blog"
              className="w-full pl-10 pr-4 py-3 bg-background border border-border-light rounded-xl text-foreground placeholder:text-muted-light text-sm focus:outline-none focus:border-primary-muted focus:ring-1 focus:ring-primary-muted/30 transition-all duration-200"
            />
          </div>
        </div>

        {/* URL */}
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-1.5">URL</label>
          <div className="relative">
            <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g., https://example.com"
              className="w-full pl-10 pr-4 py-3 bg-background border border-border-light rounded-xl text-foreground placeholder:text-muted-light text-sm focus:outline-none focus:border-primary-muted focus:ring-1 focus:ring-primary-muted/30 transition-all duration-200"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed !py-3.5 mt-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span>{loading ? 'Adding...' : 'Add Bookmark'}</span>
        </button>
      </form>
    </div>
  );
}
