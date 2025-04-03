'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDocker, FaGithub, FaExternalLinkAlt, FaServer, FaChartLine, FaBook } from 'react-icons/fa';

interface Project {
  id: number;
  name: string;
  namespace: string;
  description: string;
  tech: string[];
  status: 'Running' | 'Completed' | 'Maintenance' | 'In Progress';
  metrics: {
    uptime: string;
    performance: number;
    reliability: number;
  };
  links: {
    github?: string;
    live?: string;
    docs?: string;
  };
  logs: string[];
}

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'logs' | 'metrics' | 'docs'>('metrics');
  
  const projects: Project[] = [
    {
      id: 10,
      name: 'kubernetes-cluster-planner',
      namespace: 'infrastructure',
      description: 'Planning tool for Kubernetes cluster architecture, resource allocation, and scaling strategies. Currently in design phase.',
      tech: ['Kubernetes', 'Infrastructure Planning', 'Resource Optimization', 'Go'],
      status: 'In Progress',
      metrics: {
        uptime: 'N/A',
        performance: 60,
        reliability: 65,
      },
      links: {
        github: '#',
      },
      logs: [
        '2025-03-28T16:30:10Z [INFO] Initial architecture design completed',
        '2025-03-28T14:15:22Z [INFO] Resource calculation algorithm drafted',
        '2025-03-28T11:40:05Z [INFO] Started research on auto-scaling strategies',
        '2025-03-28T09:20:45Z [INFO] Project kickoff meeting',
        '2025-03-27T17:30:15Z [INFO] Requirements gathering completed'
      ]
    },
    {
      id: 11,
      name: 'mcp-agent-framework',
      namespace: 'ai',
      description: 'Framework for building specialized MCP agents with domain-specific knowledge and capabilities. Focused on DevOps and infrastructure management.',
      tech: ['TypeScript', 'MCP', 'AI Agents', 'Node.js'],
      status: 'In Progress',
      metrics: {
        uptime: 'N/A',
        performance: 55,
        reliability: 60,
      },
      links: {
        github: '#',
      },
      logs: [
        '2025-03-28T15:50:10Z [INFO] Core agent interface defined',
        '2025-03-28T13:25:22Z [INFO] Started implementing MCP server integration',
        '2025-03-28T10:45:05Z [INFO] Researching agent orchestration patterns',
        '2025-03-28T08:30:45Z [INFO] Project structure initialized',
        '2025-03-27T16:15:15Z [INFO] Initial planning completed'
      ]
    },
    {
      id: 12,
      name: 'llm-infra-analyzer',
      namespace: 'ai',
      description: 'AI-powered tool that analyzes infrastructure configurations, identifies optimization opportunities, and suggests improvements based on best practices.',
      tech: ['Python', 'LLMs', 'Infrastructure Analysis', 'Terraform'],
      status: 'In Progress',
      metrics: {
        uptime: 'N/A',
        performance: 50,
        reliability: 55,
      },
      links: {
        github: '#',
      },
      logs: [
        '2025-03-28T16:40:10Z [INFO] Started building training dataset',
        '2025-03-28T14:20:22Z [INFO] Defined infrastructure schema parser',
        '2025-03-28T12:10:05Z [INFO] Researching LLM fine-tuning approaches',
        '2025-03-28T09:45:45Z [INFO] Project initialization',
        '2025-03-27T18:20:15Z [INFO] Concept validation completed'
      ]
    },
    {
      id: 2,
      name: 'devops-ai-assistant',
      namespace: 'ai',
      description: 'Personal AI assistant for automating routine DevOps tasks using LLMs and MCP frameworks. A learning project to explore AI agent capabilities.',
      tech: ['Python', 'AI Agents', 'MCP', 'LLMs', 'Automation'],
      status: 'In Progress',
      metrics: {
        uptime: 'N/A',
        performance: 85,
        reliability: 88,
      },
      links: {
        github: '#',
        docs: '#',
      },
      logs: [
        '2025-03-28T15:45:10Z [INFO] Agent task completed successfully',
        '2025-03-28T14:30:22Z [INFO] New agent capability deployed',
        '2025-03-28T12:15:05Z [INFO] MCP server connection established',
        '2025-03-28T10:20:45Z [WARN] Model context limit reached',
        '2025-03-27T18:30:15Z [INFO] System health check passed'
      ]
    },
    {
      id: 7,
      name: 'llm-powered-documentation',
      namespace: 'ai',
      description: 'Documentation generator that uses LLMs to analyze codebases and create comprehensive, up-to-date technical documentation automatically.',
      tech: ['Python', 'LLMs', 'NLP', 'Documentation', 'API'],
      status: 'In Progress',
      metrics: {
        uptime: '97.2%',
        performance: 82,
        reliability: 85,
      },
      links: {
        github: '#',
        docs: '#',
      },
      logs: [
        '2025-03-28T16:10:15Z [INFO] Documentation generated for project X',
        '2025-03-28T14:22:30Z [INFO] New template added',
        '2025-03-28T11:45:05Z [WARN] Token limit reached for large codebase',
        '2025-03-28T09:30:45Z [INFO] API endpoint updated',
        '2025-03-27T17:15:20Z [INFO] System health check passed'
      ]
    },
    {
      id: 8,
      name: 'mcp-tools-explorer',
      namespace: 'ai',
      description: 'Experimental project to explore Model Context Protocol capabilities and build custom MCP servers for various DevOps automation tasks.',
      tech: ['TypeScript', 'MCP', 'Node.js', 'API Integration', 'Automation'],
      status: 'In Progress',
      metrics: {
        uptime: 'N/A',
        performance: 78,
        reliability: 80,
      },
      links: {
        github: '#',
      },
      logs: [
        '2025-03-28T15:30:20Z [INFO] New MCP server deployed',
        '2025-03-28T13:45:10Z [WARN] API rate limit approaching',
        '2025-03-28T11:20:05Z [INFO] Added weather service integration',
        '2025-03-28T09:15:30Z [INFO] Fixed TypeScript type definitions',
        '2025-03-27T16:40:15Z [INFO] Initial project setup completed'
      ]
    },
    {
      id: 3,
      name: 'kubernetes-monitoring',
      namespace: 'infrastructure',
      description: 'Kubernetes monitoring solution with custom dashboards for visualizing cluster health, resource usage, and application performance.',
      tech: ['Kubernetes', 'Prometheus', 'Grafana', 'Helm'],
      status: 'Maintenance',
      metrics: {
        uptime: '98.5%',
        performance: 90,
        reliability: 92,
      },
      links: {
        github: '#',
        docs: '#',
      },
      logs: [
        '2025-03-28T14:32:10Z [INFO] Dashboard update deployed',
        '2025-03-28T12:15:22Z [INFO] Alert rules updated',
        '2025-03-28T08:45:01Z [INFO] Added memory usage panels',
        '2025-03-27T22:30:45Z [WARN] High CPU utilization detected',
        '2025-03-27T16:20:33Z [INFO] Initial metrics collection configured'
      ]
    },
    {
      id: 4,
      name: 'ci-cd-pipeline-overhaul',
      namespace: 'devops',
      description: 'Modernized CI/CD pipeline with parallel execution, caching, and comprehensive testing integration.',
      tech: ['GitHub Actions', 'Jenkins', 'Docker', 'Python'],
      status: 'Running',
      metrics: {
        uptime: '98.5%',
        performance: 92,
        reliability: 94,
      },
      links: {
        github: '#',
        live: '#',
        docs: '#',
      },
      logs: [
        '2025-03-28T15:10:22Z [INFO] Pipeline execution #1245 successful',
        '2025-03-28T13:05:17Z [INFO] Deployed to staging environment',
        '2025-03-28T13:00:05Z [INFO] All tests passed',
        '2025-03-28T12:45:30Z [INFO] Build artifacts generated',
        '2025-03-28T12:30:00Z [INFO] Pipeline triggered by commit a8f2e3d'
      ]
    },
    {
      id: 5,
      name: 'monitoring-alerting-system',
      namespace: 'observability',
      description: 'Comprehensive monitoring and alerting platform with custom dashboards and intelligent alert routing.',
      tech: ['Prometheus', 'Grafana', 'AlertManager', 'Loki'],
      status: 'Running',
      metrics: {
        uptime: '99.95%',
        performance: 97,
        reliability: 99,
      },
      links: {
        github: '#',
        live: '#',
      },
      logs: [
        '2025-03-28T14:55:00Z [INFO] Alert rules updated',
        '2025-03-28T11:20:15Z [INFO] New dashboard created',
        '2025-03-28T09:30:22Z [INFO] Metrics retention policy updated',
        '2025-03-27T18:45:10Z [INFO] New data source connected',
        '2025-03-27T14:10:05Z [INFO] System health check passed'
      ]
    },
    {
      id: 6,
      name: 'terraform-modules-library',
      namespace: 'infrastructure',
      description: 'Collection of reusable Terraform modules for AWS infrastructure with built-in security and compliance checks.',
      tech: ['Terraform', 'AWS', 'IaC', 'Security'],
      status: 'Maintenance',
      metrics: {
        uptime: '100%',
        performance: 90,
        reliability: 96,
      },
      links: {
        github: '#',
        docs: '#',
      },
      logs: [
        '2025-03-28T13:40:30Z [INFO] Module version 2.3.0 released',
        '2025-03-28T10:15:45Z [INFO] Security compliance check passed',
        '2025-03-27T22:10:20Z [INFO] New AWS region support added',
        '2025-03-27T16:30:15Z [INFO] Documentation updated',
        '2025-03-27T11:45:00Z [INFO] Dependency versions updated'
      ]
    },
    {
      id: 9,
      name: 'llm-code-reviewer',
      namespace: 'ai',
      description: 'Automated code review tool that uses LLMs to analyze pull requests, suggest improvements, and detect potential bugs or security issues.',
      tech: ['Python', 'LLMs', 'GitHub API', 'Code Analysis'],
      status: 'Running',
      metrics: {
        uptime: '94.3%',
        performance: 80,
        reliability: 83,
      },
      links: {
        github: '#',
      },
      logs: [
        '2025-03-28T16:05:10Z [INFO] Reviewed PR #142',
        '2025-03-28T14:20:22Z [INFO] Updated language model',
        '2025-03-28T11:35:05Z [INFO] Added security vulnerability detection',
        '2025-03-28T09:50:45Z [WARN] Rate limit exceeded on GitHub API',
        '2025-03-27T18:15:15Z [INFO] System health check passed'
      ]
    },
    {
      id: 1,
      name: 'python-web-platform',
      namespace: 'web',
      description: 'Modern web application platform built with Python frameworks (Django, FastAPI, Flask) with RESTful APIs and responsive frontend.',
      tech: ['Python', 'Django', 'FastAPI', 'Flask', 'REST API'],
      status: 'Running',
      metrics: {
        uptime: '99.8%',
        performance: 94,
        reliability: 97,
      },
      links: {
        github: '#',
        live: '#',
        docs: '#',
      },
      logs: [
        '2025-03-28T16:20:10Z [INFO] API request processed successfully',
        '2025-03-28T15:45:22Z [INFO] Database migration completed',
        '2025-03-28T14:30:05Z [INFO] New endpoint deployed',
        '2025-03-28T12:15:45Z [INFO] Authentication system updated',
        '2025-03-27T18:30:15Z [INFO] System health check passed'
      ]
    }
  ];
  
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('metrics');
  };
  
  const handleCloseDetails = () => {
    setSelectedProject(null);
  };
  
  return (
    <div className="bg-gray-900 text-gray-100 p-6 rounded-lg border border-green-500 shadow-lg shadow-green-500/20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-green-500 mb-2">The Production Environment</h2>
        <p className="text-gray-400">
          Projects displayed as containers in a Kubernetes-style cluster view.
        </p>
      </div>
      
      {/* Cluster View */}
      {!selectedProject && (
        <div className="relative p-6 bg-gray-800 rounded-lg border border-gray-700">
          <div className="absolute top-4 right-4 flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
            <div className="flex items-center text-xs text-green-400">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
              <span>Running</span>
            </div>
            <div className="flex items-center text-xs text-yellow-400">
              <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-1.5"></span>
              <span>Maintenance</span>
            </div>
            <div className="flex items-center text-xs text-blue-400">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
              <span>In Progress</span>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-green-400 mb-6">Cluster Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  project.status === 'Running' 
                    ? 'border-green-600 bg-gray-800' 
                    : project.status === 'Maintenance'
                    ? 'border-yellow-600 bg-gray-800'
                    : 'border-blue-600 bg-gray-800'
                }`}
                whileHover={{ scale: 1.02, boxShadow: '0 4px 6px rgba(0, 255, 0, 0.1)' }}
                onClick={() => handleProjectClick(project)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center">
                      <FaDocker className="text-blue-400 mr-2" />
                      <h4 className="font-mono text-green-400">{project.name}</h4>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">namespace: {project.namespace}</div>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full ${
                    project.status === 'Running' 
                      ? 'bg-green-900 text-green-400' 
                      : project.status === 'Maintenance'
                      ? 'bg-yellow-900 text-yellow-400'
                      : 'bg-blue-900 text-blue-400'
                  }`}>
                    {project.status}
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tech.slice(0, 3).map((tech, i) => (
                    <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                  {project.tech.length > 3 && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                      +{project.tech.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <div>Uptime: {project.metrics.uptime}</div>
                  <div>Reliability: {project.metrics.reliability}%</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* Project Details */}
      {selectedProject && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-800 rounded-lg border border-gray-700"
        >
          <div className="p-4 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <FaDocker className="text-blue-400" />
              <h3 className="font-mono text-green-400 text-sm sm:text-base">{selectedProject.name}</h3>
              <span className="text-xs text-gray-400">namespace: {selectedProject.namespace}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                selectedProject.status === 'Running' 
                  ? 'bg-green-900 text-green-400' 
                  : selectedProject.status === 'Maintenance'
                  ? 'bg-yellow-900 text-yellow-400'
                  : 'bg-blue-900 text-blue-400'
              }`}>
                {selectedProject.status}
              </span>
            </div>
            <button 
              onClick={handleCloseDetails}
              className="text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          <div className="p-4">
            <p className="text-gray-300 mb-4">{selectedProject.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedProject.tech.map((tech, i) => (
                <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                  {tech}
                </span>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-3 mb-4">
              {selectedProject.links.github && (
                <a href={selectedProject.links.github} className="flex items-center text-sm text-blue-400 hover:text-blue-300">
                  <FaGithub className="mr-1" /> Repository
                </a>
              )}
              {selectedProject.links.live && (
                <a href={selectedProject.links.live} className="flex items-center text-sm text-blue-400 hover:text-blue-300">
                  <FaExternalLinkAlt className="mr-1" /> Live Demo
                </a>
              )}
              {selectedProject.links.docs && (
                <a href={selectedProject.links.docs} className="flex items-center text-sm text-blue-400 hover:text-blue-300">
                  <FaBook className="mr-1" /> Documentation
                </a>
              )}
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-700 mb-4">
              <div className="flex flex-wrap gap-2 sm:space-x-4">
                <button 
                  className={`py-2 px-4 font-medium ${activeTab === 'metrics' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-300'}`}
                  onClick={() => setActiveTab('metrics')}
                >
                  <FaChartLine className="inline mr-1" /> Metrics
                </button>
                <button 
                  className={`py-2 px-4 font-medium ${activeTab === 'logs' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-300'}`}
                  onClick={() => setActiveTab('logs')}
                >
                  <FaServer className="inline mr-1" /> Logs
                </button>
                <button 
                  className={`py-2 px-4 font-medium ${activeTab === 'docs' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-300'}`}
                  onClick={() => setActiveTab('docs')}
                >
                  <FaBook className="inline mr-1" /> Documentation
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="min-h-[200px]">
              {activeTab === 'metrics' && (
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-4">Performance Metrics</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="text-xs text-gray-400">Uptime</div>
                      <div className="text-xl font-mono">{selectedProject.metrics.uptime}</div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="text-xs text-gray-400">Performance</div>
                      <div className="text-xl font-mono">{selectedProject.metrics.performance}%</div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="text-xs text-gray-400">Reliability</div>
                      <div className="text-xl font-mono">{selectedProject.metrics.reliability}%</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-300 mb-2">Performance Trend (30 days)</h5>
                    <div className="h-16 sm:h-24 bg-gray-700 rounded-md flex items-end p-2">
                      {Array.from({ length: 30 }).map((_, i) => {
                        const height = Math.floor(Math.random() * 50) + 30;
                        return (
                          <div 
                            key={i} 
                            className="w-full bg-green-500 mx-0.5 rounded-t"
                            style={{ height: `${height}%` }}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <button className="mt-2 px-4 py-2 bg-green-700 text-green-100 rounded hover:bg-green-600 transition-colors">
                    Deploy to Your Brain
                  </button>
                </div>
              )}
              
              {activeTab === 'logs' && (
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-4">Recent Logs</h4>
                  <div className="bg-black rounded-md p-3 font-mono text-sm h-64 overflow-y-auto">
                    {selectedProject.logs.map((log, i) => {
                      const isError = log.includes('[ERROR]');
                      const isWarning = log.includes('[WARN]');
                      const logClass = isError ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-gray-300';
                      
                      return (
                        <div key={i} className={`mb-1 ${logClass}`}>
                          {log}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {activeTab === 'docs' && (
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-4">Technical Documentation</h4>
                  <div className="bg-gray-700 rounded-md p-4">
                    <h5 className="font-semibold mb-2">Project Overview</h5>
                    <p className="text-sm mb-4">
                      {selectedProject.description} This project was built to solve complex infrastructure challenges
                      and improve operational efficiency.
                    </p>
                    
                    <h5 className="font-semibold mb-2">Technical Architecture</h5>
                    <p className="text-sm mb-4">
                      The system uses a microservices architecture with containerized components deployed on Kubernetes.
                      It follows GitOps principles for deployment and configuration management.
                    </p>
                    
                    <h5 className="font-semibold mb-2">Key Features</h5>
                    <ul className="list-disc list-inside text-sm mb-4">
                      <li>Automated deployment and scaling</li>
                      <li>Comprehensive monitoring and alerting</li>
                      <li>Self-healing capabilities</li>
                      <li>Infrastructure as Code implementation</li>
                      <li>CI/CD integration</li>
                    </ul>
                    
                    <h5 className="font-semibold mb-2">Technologies Used</h5>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedProject.tech.map((tech, i) => (
                        <span key={i} className="text-xs bg-gray-600 text-gray-200 px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Projects;
