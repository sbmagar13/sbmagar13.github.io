import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BlogPost } from '@/utils/blog';

// Using Node.js built-in modules for file system operations
const blogDirectory = path.join(process.cwd(), 'content/blog');

export function getBlogSlugs() {
  return fs.readdirSync(blogDirectory)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace(/\.md$/, ''));
}

export function getBlogPostBySlug(slug: string): BlogPost {
  const fullPath = path.join(blogDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  
  return {
    id: data.id,
    title: data.title,
    excerpt: data.excerpt,
    date: data.date,
    readTime: data.readTime,
    tags: data.tags,
    featured: data.featured,
    slug,
    content
  };
}

export function getAllBlogPosts(): BlogPost[] {
  try {
    const slugs = getBlogSlugs();
    const posts = slugs.map(slug => getBlogPostBySlug(slug));
    
    // Sort posts by date (newest first)
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return [];
  }
}
