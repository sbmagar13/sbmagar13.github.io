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
  status: 'Running' | 'Completed' | 'Maintenance';
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
      id: 2,
      name: 'ai-agent-automation',
      namespace: 'ai',
      description: 'Intelligent automation system using AI agents and MCP frameworks to streamline DevOps workflows and enhance productivity.',
      tech: ['Python', 'AI Agents', 'MCP', 'LLMs', 'Automation'],
      status: 'Running',
      metrics: {
        uptime: '99.5%',
        performance: 92,
        reliability: 95,
      },
      links: {
        github: '#',
        docs: '#',
      },
      logs: [
        '2025-03-28T15:45:10Z [INFO] Agent task completed successfully',
        '2025-03-28T14:30:22Z [INFO] New agent capability deployed',
        '2025-03-28T12:15:05Z [INFO] MCP server connection established',
        '2025-03-28T10:20:45Z [INFO] Model context updated',
        '2025-03-27T18:30:15Z [INFO] System health check passed'
      ]
    },
    {
      id: 3,
      name: 'kubernetes-cluster-automation',
      namespace: 'infrastructure',
      description: 'Automated Kubernetes cluster provisioning and management system with GitOps workflow integration.',
      tech: ['Kubernetes', 'Terraform', 'ArgoCD', 'Helm', 'Go'],
      status: 'Running',
      metrics: {
        uptime: '99.99%',
        performance: 95,
        reliability: 98,
      },
      links: {
        github: '#',
        docs: '#',
      },
      logs: [
        '2025-03-28T14:32:10Z [INFO] Cluster health check passed',
        '2025-03-28T12:15:22Z [INFO] Auto-scaling event triggered',
        '2025-03-28T08:45:01Z [INFO] Deployed new version v1.2.5',
        '2025-03-27T22:30:45Z [WARN] High CPU utilization detected',
        '2025-03-27T16:20:33Z [INFO] Backup completed successfully'
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
      name: 'infrastructure-as-code-framework',
      namespace: 'infrastructure',
      description: 'Modular, reusable infrastructure components with built-in security and compliance checks.',
      tech: ['Terraform', 'Pulumi', 'AWS CDK', 'CloudFormation'],
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
          <div className="absolute top-4 right-4 flex space-x-2">
            <div className="flex items-center text-xs text-green-400">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
              <span>Running</span>
            </div>
            <div className="flex items-center text-xs text-yellow-400">
              <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-1.5"></span>
              <span>Maintenance</span>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-green-400 mb-6">Cluster Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  project.status === 'Running' 
                    ? 'border-green-600 bg-gray-800' 
                    : 'border-yellow-600 bg-gray-800'
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
                      : 'bg-yellow-900 text-yellow-400'
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
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <div className="flex items-center">
              <FaDocker className="text-blue-400 mr-2" />
              <h3 className="font-mono text-green-400">{selectedProject.name}</h3>
              <span className="ml-2 text-xs text-gray-400">namespace: {selectedProject.namespace}</span>
              <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                selectedProject.status === 'Running' 
                  ? 'bg-green-900 text-green-400' 
                  : 'bg-yellow-900 text-yellow-400'
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
            
            <div className="flex space-x-3 mb-4">
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
              <div className="flex space-x-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                    <div className="h-24 bg-gray-700 rounded-md flex items-end p-2">
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
