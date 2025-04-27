'use client';

import Blog from '@/components/Blog/Blog';
import BlogPosts from './blog-posts';
import { useEffect, useState } from 'react';
import { BlogPost } from '@/utils/blog';

// This is a client component that uses the hardcoded blog posts
export default function BlogPostsWrapper() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  
  useEffect(() => {
    // Get the hardcoded blog posts
    const fetchPosts = async () => {
      const result = await BlogPosts();
      setPosts(result.posts);
    };
    
    fetchPosts();
  }, []);
  
  // Pass the posts to the Blog component
  return <Blog initialPosts={posts} />;
}
