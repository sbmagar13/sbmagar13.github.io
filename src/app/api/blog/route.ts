import { NextResponse } from 'next/server';
import { getAllBlogPosts } from '@/lib/blog';

// Configure for static export
export const dynamic = 'force-static';

export async function GET() {
  try {
    const posts = getAllBlogPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
