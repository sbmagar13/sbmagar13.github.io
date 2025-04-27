'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaTags, FaChevronRight, FaSearch, FaFilter, FaCode, FaServer, FaCloud, FaDocker, FaRocket } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { BlogPost } from '@/utils/blog';

interface BlogProps {
  initialPosts?: BlogPost[];
}

const Blog = ({ initialPosts = [] }: BlogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialPosts);
  const [loading, setLoading] = useState(initialPosts.length === 0);
  const [error] = useState<string | null>(null);
  
  // Initialize blog posts from props
  useEffect(() => {
    if (initialPosts.length > 0) {
      setBlogPosts(initialPosts);
      setLoading(false);
    }
  }, [initialPosts]);
  
  // Get all unique tags
  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags)));
  
  // Filter posts based on search query and selected tag
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
    
    return matchesSearch && matchesTag;
  });
  
  // Sort posts by date (newest first)
  const sortedPosts = [...filteredPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Featured posts
  const featuredPosts = sortedPosts.filter(post => post.featured);
  
  // Regular posts (non-featured)
  const regularPosts = sortedPosts.filter(post => !post.featured);
  
  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };
  
  const getTagIcon = (tag: string) => {
    switch (tag) {
      case 'kubernetes':
        return <FaCloud className="mr-1" />;
      case 'devops':
        return <FaRocket className="mr-1" />;
      case 'terraform':
        return <FaServer className="mr-1" />;
      case 'python':
        return <FaCode className="mr-1" />;
      case 'docker':
        return <FaDocker className="mr-1" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-gray-900 text-gray-100 p-6 rounded-lg border border-green-500 shadow-lg shadow-green-500/20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-green-500 mb-2">DevOps Runbooks & Insights</h2>
        <p className="text-gray-400">
          Technical articles, guides, and thoughts on DevOps, infrastructure, and software development.
        </p>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-3 px-4 pl-10 text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-3 top-3.5 text-gray-400">
            <FaSearch />
          </div>
          {searchQuery && (
            <button 
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-300"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>
        
        {/* Filter Tags */}
        <div className="bg-gray-800 rounded-md p-3 border border-gray-700">
          <div className="flex items-center mb-2">
            <FaFilter className="mr-2 text-green-500" />
            <span className="text-gray-300 font-medium">Filter by tag:</span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
            {allTags.map(tag => (
              <button
                key={tag}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${
                  selectedTag === tag 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => handleTagClick(tag)}
              >
                {getTagIcon(tag)}{tag}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {selectedPost ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button 
            onClick={() => setSelectedPost(null)}
            className="mb-4 flex items-center text-green-400 hover:text-green-300"
          >
            <span className="transform rotate-180"><FaChevronRight /></span>
            <span className="ml-1">Back to articles</span>
          </button>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-green-400 mb-4">{selectedPost.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-6 text-sm text-gray-400">
              <div className="flex items-center">
                <FaCalendarAlt className="mr-1" />
                <span>{selectedPost.date}</span>
              </div>
              <div className="flex items-center">
                <FaClock className="mr-1" />
                <span>{selectedPost.readTime} read</span>
              </div>
              <div className="flex items-center">
                <FaTags className="mr-1" />
                <span>{selectedPost.tags.join(', ')}</span>
              </div>
            </div>
            
            <div className="prose prose-invert prose-green max-w-none">
              <ReactMarkdown
                components={{
                  // Style code blocks
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  code: ({ className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && typeof children === 'string';
                    
                    if (isInline) {
                      return <code className="bg-gray-800 px-1 rounded text-green-400" {...props}>{children}</code>;
                    }
                    
                    return (
                      <div className="bg-gray-900 p-4 rounded-md my-6 font-mono text-sm overflow-auto">
                        <pre><code className={className} {...props}>{children}</code></pre>
                      </div>
                    );
                  },
                  // Style headings
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  h1: ({ children }: any) => <h1 className="text-2xl font-bold text-green-400 mt-6 mb-3">{children}</h1>,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  h2: ({ children }: any) => <h2 className="text-xl font-bold text-green-400 mt-6 mb-3">{children}</h2>,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  h3: ({ children }: any) => <h3 className="text-lg font-bold text-green-400 mt-5 mb-2">{children}</h3>,
                  // Style paragraphs
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  p: ({ children }: any) => <p className="text-gray-300 mb-4">{children}</p>,
                  // Style lists
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ul: ({ children }: any) => <ul className="list-disc pl-6 mb-4 text-gray-300">{children}</ul>,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ol: ({ children }: any) => <ol className="list-decimal pl-6 mb-4 text-gray-300">{children}</ol>,
                  // Style links
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  a: ({ href, children }: any) => <a href={href} className="text-green-400 hover:underline">{children}</a>,
                }}
              >
                {selectedPost.content}
              </ReactMarkdown>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-green-400 mb-4">Featured Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredPosts.map(post => (
                  <motion.div
                    key={post.id}
                    className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-green-500 transition-colors cursor-pointer"
                    whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 255, 128, 0.1)' }}
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="p-5">
                      <h4 className="text-xl font-bold text-green-400 mb-2">{post.title}</h4>
                      <p className="text-gray-300 mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex justify-between items-center text-sm text-gray-400">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-1" />
                          <span>{post.date}</span>
                        </div>
                        <div className="flex items-center">
                          <FaClock className="mr-1" />
                          <span>{post.readTime} read</span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTagClick(tag);
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Regular Posts */}
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-4">All Articles</h3>
            <div className="grid grid-cols-1 gap-4">
              {regularPosts.map(post => (
                <motion.div
                  key={post.id}
                  className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-green-500 transition-colors cursor-pointer"
                  whileHover={{ x: 5 }}
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="p-5">
                    <h4 className="text-lg font-bold text-green-400 mb-2">{post.title}</h4>
                    <p className="text-gray-300 mb-3">{post.excerpt}</p>
                    <div className="flex justify-between items-center text-sm text-gray-400">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center">
                        <FaClock className="mr-1" />
                        <span>{post.readTime} read</span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTagClick(tag);
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <div className="text-gray-400">Loading blog posts...</div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-400 mb-4">Error: {error}</div>
              <button 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : filteredPosts.length === 0 && (
            <div className="text-center py-10">
              <div className="text-gray-400 mb-2">No articles found matching your criteria.</div>
              <button 
                className="text-green-500 hover:text-green-400"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag(null);
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Blog;
