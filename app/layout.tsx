import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'Smart Bookmark — Save & Organize Your Links',
  description:
    'A modern, real-time bookmark manager powered by Supabase with Google OAuth. Save, organize, and sync your bookmarks across devices instantly.',
  keywords: ['bookmarks', 'links', 'organizer', 'realtime', 'supabase', 'nextjs'],
  authors: [{ name: 'Smart Bookmark' }],
  openGraph: {
    title: 'Smart Bookmark — Save & Organize Your Links',
    description: 'A modern, real-time bookmark manager powered by Supabase.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background">
        <ToastProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
