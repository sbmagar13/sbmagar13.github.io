'use client';

import Blog from '@/components/Blog/Blog';
import { useCallback, useEffect, useState } from 'react';
import { BlogPost } from '@/utils/blog';

// Client component that loads posts from the static JSON endpoint.
// /api/blog is a force-static route handler, so the static export
// ships it as a plain JSON file generated from content/blog/*.md.
export default function BlogPostsWrapper() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/blog');
      if (!response.ok) {
        throw new Error(`Failed to load blog posts (status ${response.status})`);
      }

      const data: BlogPost[] = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return <Blog posts={posts} loading={loading} error={error} onRetry={fetchPosts} />;
}
