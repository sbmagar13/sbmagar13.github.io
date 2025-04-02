'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaDocker, FaAws, 
  FaJenkins, FaGithub, FaLinux,
  FaPython, FaJs, FaReact, 
  FaNetworkWired, FaLock, FaCode,
  FaBook
} from 'react-icons/fa';

interface TechImage {
  id: string;
  name: string;
  category: 'infrastructure' | 'cicd' | 'monitoring' | 'development' | 'security';
  icon: React.ReactNode;
  tags: string[];
  experience: number;
  description: string;
  vulnerabilities?: string[];
  pullCount: number;
}

const TechStack = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTech, setSelectedTech] = useState<TechImage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const techImages: TechImage[] = [
    {
      id: 'ai-agents',
      name: 'AI & Agents',
      category: 'development',
      icon: <FaCode />,
      tags: ['ai', 'agents', 'mcp', 'automation'],
      experience: 0.5,
      description: 'Exploring AI agent technologies, MCP frameworks, and building intelligent automation systems.',
      pullCount: 1200,
    },
    {
      id: 'kubernetes',
      name: 'Kubernetes',
      category: 'infrastructure',
      icon: <FaDocker />, // Using Docker icon as a substitute
      tags: ['container-orchestration', 'infrastructure', 'cloud-native'],
      experience: 1.5,
      description: 'Container orchestration platform for automating deployment, scaling, and management of containerized applications.',
      pullCount: 2500,
    },
    {
      id: 'docker',
      name: 'Docker',
      category: 'infrastructure',
      icon: <FaDocker />,
      tags: ['containerization', 'infrastructure', 'devops'],
      experience: 4,
      description: 'Platform for developing, shipping, and running applications in containers.',
      pullCount: 3200,
    },
    {
      id: 'aws',
      name: 'AWS',
      category: 'infrastructure',
      icon: <FaAws />,
      tags: ['cloud', 'infrastructure', 'services'],
      experience: 4,
      description: 'Comprehensive cloud computing platform with a wide range of services.',
      pullCount: 2800,
    },
    {
      id: 'terraform',
      name: 'Terraform',
      category: 'infrastructure',
      icon: <FaCode />,
      tags: ['iac', 'infrastructure', 'automation'],
      experience: 4,
      description: 'Infrastructure as Code tool for building, changing, and versioning infrastructure safely and efficiently.',
      pullCount: 2100,
    },
    {
      id: 'jenkins',
      name: 'Jenkins',
      category: 'cicd',
      icon: <FaJenkins />,
      tags: ['ci-cd', 'automation', 'pipeline'],
      experience: 2,
      description: 'Open-source automation server for building, testing, and deploying code.',
      vulnerabilities: ['Legacy plugin system', 'Resource intensive'],
      pullCount: 1800,
    },
    {
      id: 'github-actions',
      name: 'GitHub Actions',
      category: 'cicd',
      icon: <FaGithub />,
      tags: ['ci-cd', 'automation', 'github'],
      experience: 3,
      description: 'CI/CD platform integrated with GitHub repositories.',
      pullCount: 1500,
    },
    {
      id: 'prometheus',
      name: 'Prometheus',
      category: 'monitoring',
      icon: <FaChartLine />,
      tags: ['monitoring', 'metrics', 'alerting'],
      experience: 2,
      description: 'Open-source monitoring and alerting toolkit designed for reliability and scalability.',
      pullCount: 1900,
    },
    {
      id: 'grafana',
      name: 'Grafana',
      category: 'monitoring',
      icon: <FaChartBar />,
      tags: ['visualization', 'dashboards', 'monitoring'],
      experience: 3,
      description: 'Open-source platform for monitoring and observability with beautiful dashboards.',
      pullCount: 1700,
    },
    {
      id: 'python',
      name: 'Python',
      category: 'development',
      icon: <FaPython />,
      tags: ['programming', 'scripting', 'automation', 'web'],
      experience: 6,
      description: 'High-level programming language known for its readability and versatility.',
      pullCount: 2900,
    },
    {
      id: 'django',
      name: 'Django',
      category: 'development',
      icon: <FaPython />,
      tags: ['python', 'web-framework', 'backend', 'orm'],
      experience: 4,
      description: 'High-level Python web framework that encourages rapid development and clean, pragmatic design.',
      pullCount: 2200,
    },
    {
      id: 'fastapi',
      name: 'FastAPI',
      category: 'development',
      icon: <FaPython />,
      tags: ['python', 'web-framework', 'api', 'async'],
      experience: 3,
      description: 'Modern, fast web framework for building APIs with Python based on standard type hints.',
      pullCount: 1800,
    },
    {
      id: 'flask',
      name: 'Flask',
      category: 'development',
      icon: <FaPython />,
      tags: ['python', 'web-framework', 'microframework', 'lightweight'],
      experience: 4,
      description: 'Lightweight WSGI web application framework designed to make getting started quick and easy.',
      pullCount: 2100,
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      category: 'development',
      icon: <FaJs />,
      tags: ['programming', 'web', 'frontend'],
      experience: 3,
      description: 'Programming language that enables interactive web pages and applications.',
      pullCount: 2700,
    },
    {
      id: 'react',
      name: 'React',
      category: 'development',
      icon: <FaReact />,
      tags: ['frontend', 'ui', 'javascript'],
      experience: 2,
      description: 'JavaScript library for building user interfaces.',
      vulnerabilities: ['Rapid ecosystem changes'],
      pullCount: 2200,
    },
    {
      id: 'vault',
      name: 'Vault',
      category: 'security',
      icon: <FaLock />,
      tags: ['secrets', 'security', 'encryption'],
      experience: 3,
      description: 'Tool for securely accessing secrets like API keys, passwords, and certificates.',
      pullCount: 1400,
    },
    {
      id: 'linux',
      name: 'Linux',
      category: 'infrastructure',
      icon: <FaLinux />,
      tags: ['os', 'server', 'infrastructure'],
      experience: 7,
      description: 'Open-source operating system kernel that forms the foundation of many distributions.',
      pullCount: 3500,
    },
  ];
  
  const categories = [
    { id: 'all', name: 'All', icon: <FaDocker /> },
    { id: 'infrastructure', name: 'Infrastructure', icon: <FaNetworkWired /> },
    { id: 'cicd', name: 'CI/CD', icon: <FaGithub /> },
    { id: 'monitoring', name: 'Monitoring', icon: <FaChartLine /> },
    { id: 'development', name: 'Development', icon: <FaCode /> },
    { id: 'security', name: 'Security', icon: <FaLock /> },
  ];
  
  const filteredTech = techImages.filter(tech => {
    const matchesCategory = selectedCategory === 'all' || tech.category === selectedCategory;
    const matchesSearch = tech.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tech.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
  
  const handleTechClick = (tech: TechImage) => {
    setSelectedTech(tech);
  };
  
  const handleCloseDetails = () => {
    setSelectedTech(null);
  };
  
  return (
    <div className="bg-gray-900 text-gray-100 p-6 rounded-lg border border-green-500 shadow-lg shadow-green-500/20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-green-500 mb-2">The Registry</h2>
        <p className="text-gray-400">
          Docker-style &quot;images&quot; of technologies I&apos;ve mastered and am currently learning.
        </p>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search technologies..."
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 pl-10 text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <FaSearch />
          </div>
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category.id}
              className={`px-3 py-2 rounded-md flex items-center space-x-1 whitespace-nowrap ${
                selectedCategory === category.id 
                  ? 'bg-green-700 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Tech Grid */}
      {!selectedTech && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTech.map(tech => (
            <motion.div
              key={tech.id}
              className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden cursor-pointer"
              whileHover={{ scale: 1.02, boxShadow: '0 4px 6px rgba(0, 255, 0, 0.1)' }}
              onClick={() => handleTechClick(tech)}
            >
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="text-blue-400 mr-2 text-xl">
                    {tech.icon}
                  </div>
                  <div>
                    <h3 className="font-mono text-green-400">{tech.name}</h3>
                    <div className="text-xs text-gray-400">v{tech.experience}.0.0</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {tech.experience}+ years
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-3 text-sm text-gray-300 line-clamp-2">
                  {tech.description}
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {tech.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between text-xs text-gray-400">
                  <div className="flex items-center">
                    <FaDownload className="mr-1" /> {tech.pullCount.toLocaleString()}
                  </div>
                  {tech.vulnerabilities ? (
                    <div className="text-yellow-400 flex items-center">
                      <FaExclamationTriangle className="mr-1" /> {tech.vulnerabilities.length}
                    </div>
                  ) : (
                    <div className="text-green-400 flex items-center">
                      <FaShieldAlt className="mr-1" /> Secure
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Tech Details */}
      {selectedTech && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-800 rounded-lg border border-gray-700"
        >
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <div className="flex items-center">
              <div className="text-blue-400 mr-3 text-2xl">
                {selectedTech.icon}
              </div>
              <div>
                <h3 className="font-mono text-xl text-green-400">{selectedTech.name}</h3>
                <div className="text-sm text-gray-400">Category: {selectedTech.category}</div>
              </div>
            </div>
            <button 
              onClick={handleCloseDetails}
              className="text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          <div className="p-4">
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-green-400 mb-2">Description</h4>
              <p className="text-gray-300">{selectedTech.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold text-green-400 mb-2">Experience</h4>
                <div className="bg-gray-700 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-gray-300">Years of Experience</div>
                    <div className="font-mono text-xl">{selectedTech.experience}</div>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2.5 mb-4">
                    <div 
                      className="h-2.5 rounded-full bg-blue-500"
                      style={{ width: `${(selectedTech.experience / 10) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <div>Beginner</div>
                    <div>Intermediate</div>
                    <div>Expert</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-green-400 mb-2">Usage Statistics</h4>
                <div className="bg-gray-700 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-gray-300">Pull Count</div>
                    <div className="font-mono text-xl">{selectedTech.pullCount.toLocaleString()}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-gray-300">Last Used</div>
                    <div className="font-mono">Today</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-green-400 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedTech.tags.map((tag, i) => (
                  <span key={i} className="text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            
            {selectedTech.vulnerabilities && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-yellow-400 mb-2">
                  <FaExclamationTriangle className="inline mr-2" />
                  Areas for Improvement
                </h4>
                <div className="bg-yellow-900/30 border border-yellow-800 p-4 rounded-md">
                  <ul className="list-disc list-inside text-yellow-200">
                    {selectedTech.vulnerabilities.map((vuln, i) => (
                      <li key={i}>{vuln}</li>
                    ))}
                  </ul>
                  <div className="mt-3 text-sm text-yellow-200">
                    Currently working on improving these areas through continuous learning and practice.
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between">
              <button className="px-4 py-2 bg-blue-700 text-blue-100 rounded hover:bg-blue-600 transition-colors flex items-center">
                <FaBook className="mr-2" /> Documentation
              </button>
              <button className="px-4 py-2 bg-green-700 text-green-100 rounded hover:bg-green-600 transition-colors flex items-center">
                <FaProjectDiagram className="mr-2" /> Related Projects
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Additional icons
const FaChartLine = (props: React.SVGProps<SVGSVGElement>) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" {...props}>
    <path d="M496 384H64V80c0-8.84-7.16-16-16-16H16C7.16 64 0 71.16 0 80v336c0 17.67 14.33 32 32 32h464c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM464 96H345.94c-21.38 0-32.09 25.85-16.97 40.97l32.4 32.4L288 242.75l-73.37-73.37c-12.5-12.5-32.76-12.5-45.25 0l-68.69 68.69c-6.25 6.25-6.25 16.38 0 22.63l22.62 22.62c6.25 6.25 16.38 6.25 22.63 0L192 237.25l73.37 73.37c12.5 12.5 32.76 12.5 45.25 0l96-96 32.4 32.4c15.12 15.12 40.97 4.41 40.97-16.97V112c.01-8.84-7.15-16-15.99-16z"></path>
  </svg>
);

const FaChartBar = (props: React.SVGProps<SVGSVGElement>) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" {...props}>
    <path d="M332.8 320h38.4c6.4 0 12.8-6.4 12.8-12.8V172.8c0-6.4-6.4-12.8-12.8-12.8h-38.4c-6.4 0-12.8 6.4-12.8 12.8v134.4c0 6.4 6.4 12.8 12.8 12.8zm96 0h38.4c6.4 0 12.8-6.4 12.8-12.8V76.8c0-6.4-6.4-12.8-12.8-12.8h-38.4c-6.4 0-12.8 6.4-12.8 12.8v230.4c0 6.4 6.4 12.8 12.8 12.8zm-288 0h38.4c6.4 0 12.8-6.4 12.8-12.8v-70.4c0-6.4-6.4-12.8-12.8-12.8h-38.4c-6.4 0-12.8 6.4-12.8 12.8v70.4c0 6.4 6.4 12.8 12.8 12.8zm96 0h38.4c6.4 0 12.8-6.4 12.8-12.8V108.8c0-6.4-6.4-12.8-12.8-12.8h-38.4c-6.4 0-12.8 6.4-12.8 12.8v198.4c0 6.4 6.4 12.8 12.8 12.8zM496 384H64V80c0-8.84-7.16-16-16-16H16C7.16 64 0 71.16 0 80v336c0 17.67 14.33 32 32 32h464c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16z"></path>
  </svg>
);

const FaSearch = (props: React.SVGProps<SVGSVGElement>) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" {...props}>
    <path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path>
  </svg>
);

const FaDownload = (props: React.SVGProps<SVGSVGElement>) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" {...props}>
    <path d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path>
  </svg>
);

const FaExclamationTriangle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" {...props}>
    <path d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"></path>
  </svg>
);

const FaShieldAlt = (props: React.SVGProps<SVGSVGElement>) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" {...props}>
    <path d="M466.5 83.7l-192-80a48.15 48.15 0 0 0-36.9 0l-192 80C27.7 91.1 16 108.6 16 128c0 198.5 114.5 335.7 221.5 380.3 11.8 4.9 25.1 4.9 36.9 0C360.1 472.6 496 349.3 496 128c0-19.4-11.7-36.9-29.5-44.3zM256.1 446.3l-.1-381 175.9 73.3c-3.3 151.4-82.1 261.1-175.8 307.7z"></path>
  </svg>
);

const FaProjectDiagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="1em" width="1em" {...props}>
    <path d="M384 320H256c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h128c17.67 0 32-14.33 32-32V352c0-17.67-14.33-32-32-32zM192 32c0-17.67-14.33-32-32-32H32C14.33 0 0 14.33 0 32v128c0 17.67 14.33 32 32 32h95.72l73.16 128.04C211.98 300.98 232.4 288 256 288h.28L192 175.51V128h224V64H192V32zM608 0H480c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h128c17.67 0 32-14.33 32-32V32c0-17.67-14.33-32-32-32z"></path>
  </svg>
);

export default TechStack;
