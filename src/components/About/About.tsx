'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaServer, FaDatabase, FaDocker, FaLock, FaUserFriends, FaChartArea, FaPython, FaAws, FaDharmachakra, FaGithub, FaLinkedin } from 'react-icons/fa';
import SocialConnections from './SocialConnections';
import SkillRadar from './SkillRadar';
import LiveMetrics from './LiveMetrics';

// Years of production use per tool, same inventory as the 3D Skills Hall
// (src/components/Experience3D/SkillsHall.tsx). No invented percentages.
interface SkillMetric {
  name: string;
  years: number;
  icon: React.ReactNode;
  color: string;
}

const MAX_YEARS = 5;

const About = () => {
  const [activeTab, setActiveTab] = useState('live-metrics');
  const [showConnectionsHint, setShowConnectionsHint] = useState(true);

  const skillMetrics: SkillMetric[] = [
    { name: 'Python', years: 5, icon: <FaPython />, color: 'bg-purple-500' },
    { name: 'AWS', years: 4, icon: <FaAws />, color: 'bg-blue-500' },
    { name: 'Terraform', years: 4, icon: <FaServer />, color: 'bg-blue-600' },
    { name: 'Docker', years: 4, icon: <FaDocker />, color: 'bg-blue-400' },
    { name: 'PostgreSQL', years: 4, icon: <FaDatabase />, color: 'bg-blue-700' },
    { name: 'IAM & KMS', years: 4, icon: <FaLock />, color: 'bg-blue-800' },
    { name: 'Kubernetes (K3s)', years: 3, icon: <FaDharmachakra />, color: 'bg-blue-300' },
    { name: 'Prometheus & Grafana', years: 3, icon: <FaChartArea />, color: 'bg-purple-600' },
  ];

  const radarSkills = [
    { name: 'Python', years: 5 },
    { name: 'AWS', years: 4 },
    { name: 'Terraform', years: 4 },
    { name: 'Docker', years: 4 },
    { name: 'Kubernetes', years: 3 },
    { name: 'Observability', years: 3 },
  ];

  // Real war stories, same verified set as the 3D data center
  // (src/components/Experience3D/DataCenter.tsx).
  const incidents = [
    {
      id: 'INC-001',
      title: '19-Minute Full-Platform Outage',
      severity: 'Critical',
      resolution: 'Traced to blocking Redis KEYS calls exhausting the Tomcat/JDBC thread pool. Added connection-pool checkout timeouts and tuned RDS parameters.',
      learnings: 'Turned the postmortem into a 68-task reliability program across 11 epics and 7 sprints.'
    },
    {
      id: 'INC-002',
      title: 'No Disaster Recovery Existed',
      severity: 'Major',
      resolution: 'Built cross-region DR from eu-north-1 to eu-west-1: Aurora Global Database, EFS and ECR replication, shared KMS keys, documented promotion runbook.',
      learnings: 'A DR plan you have not written down and rehearsed is not a DR plan.'
    },
    {
      id: 'INC-003',
      title: 'Fragmented Monitoring',
      severity: 'Minor',
      resolution: 'Consolidated into one OpenTelemetry pipeline dual-exporting to self-hosted OneUptime and Loki, with Grafana on top.',
      learnings: 'Observability has to live outside the blast radius. OneUptime runs in a separate region.'
    }
  ];

  return (
    <div className="bg-gray-900 text-gray-100 p-6 rounded-lg border border-green-500 shadow-lg shadow-green-500/20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-green-500 mb-2">The Infrastructure Behind Sagar Budhathoki</h2>
        <p className="text-gray-400">
          Senior DevOps / SRE Engineer. 5+ years running production infrastructure: AWS, Terraform, containers, CI/CD, observability, and AI agents with MCP.
        </p>
        <div className="flex flex-wrap gap-4 mt-3">
          <a
            href="https://github.com/sbmagar13"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-gray-300 hover:text-green-400 transition-colors"
          >
            <FaGithub className="mr-1.5" /> github.com/sbmagar13
          </a>
          <a
            href="https://linkedin.com/in/sbmagar13"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-gray-300 hover:text-green-400 transition-colors"
          >
            <FaLinkedin className="mr-1.5" /> linkedin.com/in/sbmagar13
          </a>
        </div>
      </div>

      {/* System Status */}
      <div className="mb-6 p-3 sm:p-4 bg-gray-800 rounded-md">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-green-400 mb-1 sm:mb-0">System Status</h3>
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
            <span className="text-green-500 text-sm">OPERATIONAL</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
          <div className="bg-gray-700 p-3 rounded">
            <div className="text-xs text-gray-400">Years Active</div>
            <div className="text-xl font-mono">5+</div>
          </div>
          <div className="bg-gray-700 p-3 rounded">
            <div className="text-xs text-gray-400">AWS Regions</div>
            <div className="text-xl font-mono">3</div>
          </div>
          <div className="bg-gray-700 p-3 rounded">
            <div className="text-xs text-gray-400">AWS Services in Prod</div>
            <div className="text-xl font-mono">15+</div>
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
            Stack Years
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
            <SkillRadar skills={radarSkills} maxYears={MAX_YEARS} />
            <div className="mt-6 text-center">
              <h4 className="text-lg font-semibold text-green-400 mb-2">Core Competencies</h4>
              <p className="text-sm text-gray-400 max-w-lg">
                Each axis is a tool or domain from the resume. Distance from center is years
                of production use, with the outer ring at {MAX_YEARS} years.
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
            <h3 className="text-lg font-semibold text-green-400 mb-4">Years Running Each Tool in Production</h3>
            {skillMetrics.map((metric, index) => (
              <div key={index} className="mb-4">
                <div className="flex items-center mb-1">
                  <span className="text-gray-300 mr-2">{metric.icon}</span>
                  <span className="text-gray-300">{metric.name}</span>
                  <span className="ml-auto text-gray-400 font-mono">{metric.years} yrs</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <motion.div
                    className={`h-2.5 rounded-full ${metric.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(metric.years / MAX_YEARS) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  ></motion.div>
                </div>
              </div>
            ))}
            <div className="mt-6 text-xs sm:text-sm text-gray-400">
              <p>Bars show years of production use on a {MAX_YEARS}-year scale. Same data as the 3D Skills Hall, no invented proficiency scores.</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'incidents' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-green-400 mb-4">Production War Stories</h3>
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
                  <div className="text-xs text-gray-400 mb-2">ID: {incident.id}</div>
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
{`resource "human_engineer" "devops_sre" {
  name        = "Sagar Budhathoki"
  description = "Senior DevOps / SRE Engineer"

  skills = [
    "aws", "terraform", "docker", "kubernetes",
    "gitlab_ci", "observability", "security",
    "python", "fastapi", "django", "flask",
    "ai_agents", "mcp"
  ]

  regions = [
    "eu-north-1",   # production
    "eu-west-1",    # disaster recovery
    "eu-central-1", # observability
  ]

  high_availability   = true
  continuous_learning = true
  lemon_tea_powered   = true

  tags = {
    specialization   = "DevOps & SRE"
    years_experience = "5+"
    problem_solver   = "true"
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
