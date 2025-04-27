'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaTags, FaChevronRight, FaSearch, FaFilter, FaCode, FaServer, FaCloud, FaDocker, FaRocket } from 'react-icons/fa';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  featured: boolean;
  image?: string;
}

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: 'Kubernetes Troubleshooting Patterns',
      excerpt: 'A comprehensive guide to diagnosing and resolving common Kubernetes issues in production environments.',
      date: '2025-03-15',
      readTime: '8 min',
      tags: ['kubernetes', 'devops', 'troubleshooting'],
      featured: true
    },
    {
      id: 2,
      title: 'The Art of Blameless Postmortems',
      excerpt: 'How to conduct effective postmortems that focus on learning rather than blame, improving team culture and system reliability.',
      date: '2025-02-28',
      readTime: '12 min',
      tags: ['culture', 'incidents', 'learning'],
      featured: true
    },
    {
      id: 3,
      title: 'Terraform at Scale: Lessons Learned',
      excerpt: 'Scaling infrastructure as code across large organizations: patterns, pitfalls, and practical solutions.',
      date: '2025-01-10',
      readTime: '15 min',
      tags: ['terraform', 'iac', 'scaling'],
      featured: false
    },
    {
      id: 4,
      title: 'Automating Everything: My DevOps Philosophy',
      excerpt: 'Why automation should be at the core of your DevOps practice, and how to implement it effectively.',
      date: '2024-12-05',
      readTime: '10 min',
      tags: ['automation', 'culture', 'devops'],
      featured: false
    },
    {
      id: 5,
      title: 'Building Scalable APIs with Python Frameworks',
      excerpt: 'Comparing Django, FastAPI, and Flask for building high-performance, scalable APIs.',
      date: '2025-03-01',
      readTime: '14 min',
      tags: ['python', 'api', 'django', 'fastapi'],
      featured: true
    },
    {
      id: 6,
      title: 'Implementing GitOps with ArgoCD',
      excerpt: 'A step-by-step guide to implementing GitOps workflows using ArgoCD and Kubernetes.',
      date: '2025-02-15',
      readTime: '11 min',
      tags: ['gitops', 'argocd', 'kubernetes', 'ci-cd'],
      featured: false
    },
    {
      id: 7,
      title: 'Monitoring as Code: The Next Frontier',
      excerpt: 'How to define, version, and deploy your monitoring infrastructure using code.',
      date: '2025-01-22',
      readTime: '9 min',
      tags: ['monitoring', 'iac', 'observability'],
      featured: false
    },
    {
      id: 8,
      title: 'AI Agents in DevOps: Current State and Future',
      excerpt: 'Exploring how AI agents are transforming DevOps practices and what the future holds.',
      date: '2025-03-20',
      readTime: '13 min',
      tags: ['ai', 'agents', 'automation', 'future'],
      featured: true
    }
  ];
  
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
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 pl-10 text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <FaSearch />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
          <span className="text-gray-400 flex items-center whitespace-nowrap">
            <FaFilter className="mr-1" /> Filter:
          </span>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                selectedTag === tag 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => handleTagClick(tag)}
            >
              {getTagIcon(tag)}{tag}
            </button>
          ))}
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
              <p className="text-gray-300 mb-4">
                {selectedPost.excerpt}
              </p>
              
              <p className="text-gray-300 mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, 
                nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt,
                nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.
              </p>
              
              <h2 className="text-xl font-bold text-green-400 mt-6 mb-3">Key Concepts</h2>
              
              <p className="text-gray-300 mb-4">
                Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.
                Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.
              </p>
              
              <div className="bg-gray-900 p-4 rounded-md my-6 font-mono text-sm">
                <pre><code>{`# Example code
def example_function():
    """This is a sample function to demonstrate code blocks."""
    return "Hello, DevOps World!"

# Usage
result = example_function()
print(f"Result: {result}")
`}</code></pre>
              </div>
              
              <p className="text-gray-300 mb-4">
                Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.
                Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.
              </p>
              
              <h2 className="text-xl font-bold text-green-400 mt-6 mb-3">Conclusion</h2>
              
              <p className="text-gray-300 mb-4">
                Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.
                Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.
              </p>
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
          
          {filteredPosts.length === 0 && (
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
