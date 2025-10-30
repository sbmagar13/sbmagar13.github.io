'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaServer, FaDatabase, FaNetworkWired, FaDocker, FaCloud, FaLock, FaUserFriends, FaChartArea, FaRocket } from 'react-icons/fa';
import SocialConnections from './SocialConnections';
import SkillRadar from './SkillRadar';
import LiveMetrics from './LiveMetrics';

interface SkillMetric {
  name: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const About = () => {
  const [activeTab, setActiveTab] = useState('live-metrics');
  const [showConnectionsHint, setShowConnectionsHint] = useState(true);

  const skillMetrics: SkillMetric[] = [
    { name: 'Infrastructure', value: 92, icon: <FaServer />, color: 'bg-blue-500' },
    { name: 'Containers', value: 88, icon: <FaDocker />, color: 'bg-blue-400' },
    { name: 'Cloud', value: 90, icon: <FaCloud />, color: 'bg-blue-600' },
    { name: 'Python', value: 85, icon: <FaServer />, color: 'bg-purple-500' },
    { name: 'AI & Agents', value: 75, icon: <FaRocket />, color: 'bg-purple-600' },
    { name: 'Networking', value: 80, icon: <FaNetworkWired />, color: 'bg-blue-300' },
    { name: 'Databases', value: 82, icon: <FaDatabase />, color: 'bg-blue-700' },
    { name: 'Security', value: 84, icon: <FaLock />, color: 'bg-blue-800' },
  ];

  const radarSkills = [
    { name: 'DevOps', value: 92, color: '#10b981' },
    { name: 'Cloud', value: 90, color: '#3b82f6' },
    { name: 'Python', value: 85, color: '#8b5cf6' },
    { name: 'AI/ML', value: 75, color: '#f59e0b' },
    { name: 'Security', value: 84, color: '#ef4444' },
    { name: 'Monitoring', value: 88, color: '#06b6d4' }
  ];
  
  const incidents = [
    {
      id: 'INC-001',
      title: 'Legacy Monolith Migration',
      date: '2023-05-15',
      severity: 'Major',
      resolution: 'Successfully migrated to microservices architecture',
      learnings: 'Incremental migration with proper testing is key'
    },
    {
      id: 'INC-002',
      title: 'Database Performance Bottleneck',
      date: '2023-08-22',
      severity: 'Critical',
      resolution: 'Implemented query optimization and caching layer',
      learnings: 'Regular performance testing prevents production issues'
    },
    {
      id: 'INC-003',
      title: 'CI/CD Pipeline Failure',
      date: '2024-01-10',
      severity: 'Minor',
      resolution: 'Rebuilt pipeline with better error handling',
      learnings: 'Infrastructure as code makes recovery faster'
    }
  ];
  
  return (
    <div className="bg-gray-900 text-gray-100 p-6 rounded-lg border border-green-500 shadow-lg shadow-green-500/20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-green-500 mb-2">The Infrastructure Behind Sagar Budhathoki</h2>
        <p className="text-gray-400">
          A DevOps and AI Engineer with a passion for automation, infrastructure as code, building resilient systems, and exploring AI agents & MCP technologies.
        </p>
      </div>
      
      {/* System Uptime */}
      <div className="mb-6 p-3 sm:p-4 bg-gray-800 rounded-md">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-green-400 mb-1 sm:mb-0">System Uptime</h3>
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
            <span className="text-green-500 text-sm">OPERATIONAL</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
          <div className="bg-gray-700 p-3 rounded">
            <div className="text-xs text-gray-400">Years Active</div>
            <div className="text-xl font-mono">4+</div>
          </div>
          <div className="bg-gray-700 p-3 rounded">
            <div className="text-xs text-gray-400">Availability</div>
            <div className="text-xl font-mono">99.99%</div>
          </div>
          <div className="bg-gray-700 p-3 rounded">
            <div className="text-xs text-gray-400">Projects Deployed</div>
            <div className="text-xl font-mono">150+</div>
          </div>
          <div className="bg-gray-700 p-3 rounded">
            <div className="text-xs text-gray-400">Lemon Tea Consumed</div>
            <div className="text-xl font-mono">∞</div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-4 border-b border-gray-700">
        <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
          <button
            className={`py-2 px-3 font-medium ${activeTab === 'live-metrics' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('live-metrics')}
          >
            Live Metrics
          </button>
          <button
            className={`py-2 px-3 font-medium ${activeTab === 'skill-radar' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('skill-radar')}
          >
            <FaChartArea className="inline mr-1" />Skill Radar
          </button>
          <button
            className={`py-2 px-3 font-medium ${activeTab === 'metrics' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('metrics')}
          >
            System Metrics
          </button>
          <button
            className={`py-2 px-3 font-medium ${activeTab === 'incidents' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('incidents')}
          >
            Incident History
          </button>
          <button
            className={`py-2 px-3 font-medium ${activeTab === 'architecture' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('architecture')}
          >
            Architecture
          </button>
          <button
            className={`py-2 px-3 font-medium relative ${activeTab === 'connections' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => {
              setActiveTab('connections');
              setShowConnectionsHint(false);
            }}
          >
            <div className="flex items-center">
              <FaUserFriends className="mr-1" />
              <span>Connections</span>
              {showConnectionsHint && (
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
                  initial={{ scale: 0.8, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              )}
            </div>
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'live-metrics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <LiveMetrics />
          </motion.div>
        )}

        {activeTab === 'skill-radar' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <SkillRadar skills={radarSkills} />
            <div className="mt-6 text-center">
              <h4 className="text-lg font-semibold text-green-400 mb-2">Core Competencies</h4>
              <p className="text-sm text-gray-400 max-w-lg">
                This radar chart visualizes my expertise across key domains. Each axis represents
                a different skill area, with distance from center indicating proficiency level.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'metrics' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-green-400 mb-4">System Metrics Visualization</h3>
            {skillMetrics.map((metric, index) => (
              <div key={index} className="mb-4">
                <div className="flex items-center mb-1">
                  <span className="text-gray-300 mr-2">{metric.icon}</span>
                  <span className="text-gray-300">{metric.name}</span>
                  <span className="ml-auto text-gray-400 font-mono">{metric.value}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <motion.div 
                    className={`h-2.5 rounded-full ${metric.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  ></motion.div>
                </div>
              </div>
            ))}
            <div className="mt-6 text-xs sm:text-sm text-gray-400">
              <p>These metrics represent skill proficiency levels across different DevOps domains.</p>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'incidents' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-green-400 mb-4">Career Challenges Overcome</h3>
            <div className="space-y-4">
              {incidents.map((incident, index) => (
                <motion.div 
                  key={index}
                  className="bg-gray-800 border border-gray-700 rounded-md p-3 sm:p-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-green-400">{incident.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      incident.severity === 'Critical' ? 'bg-red-900 text-red-200' : 
                      incident.severity === 'Major' ? 'bg-yellow-900 text-yellow-200' : 
                      'bg-blue-900 text-blue-200'
                    }`}>
                      {incident.severity}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">ID: {incident.id} • Date: {incident.date}</div>
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-400">Resolution:</span>
                    <p className="text-sm text-gray-300">{incident.resolution}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-400">Learnings:</span>
                    <p className="text-sm text-gray-300">{incident.learnings}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
        {activeTab === 'architecture' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h3 className="text-lg font-semibold text-green-400 mb-4">Infrastructure as Code Representation</h3>
            <div className="bg-gray-800 p-2 sm:p-4 rounded-md font-mono text-xs sm:text-sm text-left overflow-x-auto">
              <pre className="text-gray-300">
{`resource "human_engineer" "devops_expert" {
  name        = "Sagar Budhathoki"
  version     = "3.7.2"
  description = "Infrastructure Architect & SRE, AI Engineer"
  
  skills = [
    "kubernetes", "terraform", "aws", "docker",
    "ci_cd", "monitoring", "security", "automation",
    "python", "django", "fastapi", "flask",
    "ai_agents", "mcp_technologies"
  ]
  
  certifications = [
    "aws_solutions_architect",
    "kubernetes_administrator",
    "terraform_associate"
  ]
  
  high_availability     = true
  continuous_learning   = true
  Lemon Tea_powered        = true
  
  tags = {
    specialization = "DevOps & AI"
    years_experience = "4+"
    problem_solver = "true"
  }
}`}
              </pre>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              This Terraform-style representation shows my skills and attributes as infrastructure code.
            </p>
          </motion.div>
        )}
        
        {activeTab === 'connections' && <SocialConnections />}
      </div>
    </div>
  );
};

export default About;
