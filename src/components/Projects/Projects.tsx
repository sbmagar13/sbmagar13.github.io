'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDocker, FaGithub, FaServer, FaChartLine, FaBook } from 'react-icons/fa';
import { RACKS } from '@/data/career';
import CiCdPipeline from './CiCdPipeline';
import DockerContainers from './DockerContainers';
import ProjectsGraph from './ProjectsGraph';

// The same verified project set as the 3D data center, derived from
// RACKS in src/data/career.ts (the single source of truth for career
// facts). No invented uptimes, no fake performance scores.
interface Project {
  id: string;
  name: string;
  namespace: string;
  sublabel: string;
  description: string;
  role: string;
  tech: string[];
  status: 'Running' | 'Completed' | 'Maintenance';
  facts: { label: string; value: string }[];
  links: {
    github?: string;
  };
  logs: string[];
}

// Presentation extras this cluster view layers on top of the shared
// rack data: a kubectl-style namespace, the role line, and a condensed
// log history per project. `facts` and `sublabel` override the rack
// where this view words things differently or the rack defines no
// metrics. Every rack id in RACKS needs an entry here.
interface ProjectExtras {
  namespace: string;
  role: string;
  logs: string[];
  sublabel?: string;
  facts?: { label: string; value: string }[];
}

const PROJECT_EXTRAS: Record<string, ProjectExtras> = {
  eventlogic: {
    namespace: 'production',
    role: 'Sole platform owner',
    logs: [
      '[INFO] ECS Fargate services healthy behind the ALB',
      '[INFO] Aurora schema-per-tenant routing active',
      '[INFO] Tenant lookup served from the DynamoDB registry',
      '[INFO] CloudFront serving tenant assets at the edge',
      '[INFO] Amazon MQ broker connections stable',
    ],
  },
  'multi-region-dr': {
    namespace: 'production',
    role: 'Designed and built solo',
    logs: [
      '[INFO] Aurora Global Database replication nominal',
      '[INFO] EFS replication to eu-west-1 active',
      '[INFO] ECR cross-region image sync complete',
      '[INFO] KMS keys shared across both regions',
      '[INFO] Promotion runbook reviewed and versioned',
    ],
  },
  'tenant-orchestrator': {
    namespace: 'platform',
    role: 'Author and operator',
    // The rack abbreviates this to 'provisioning service'.
    sublabel: 'tenant provisioning service',
    logs: [
      '[INFO] Tenant schema created on Aurora',
      '[INFO] SQS and EventBridge wiring applied',
      '[INFO] ALB listener rule registered',
      '[INFO] CloudFront / S3 distribution provisioned',
      '[INFO] Route 53 record set, tenant registered in DynamoDB',
    ],
  },
  'reliability-program': {
    namespace: 'sre',
    role: 'Incident lead, program driver',
    logs: [
      '[WARN] Blocking Redis KEYS call found in a hot path',
      '[INFO] Postmortem: KEYS calls exhausted the JDBC thread pool',
      '[INFO] Connection-pool checkout timeouts added',
      '[INFO] RDS parameter group tuned',
      '[INFO] Reliability program: 68 tasks, 11 epics, 7 sprints',
    ],
  },
  oneuptime: {
    namespace: 'observability',
    role: 'Built and operated solo',
    logs: [
      '[INFO] K3s cluster healthy in eu-central-1',
      '[INFO] Status pages serving',
      '[INFO] On-call schedule synced',
      '[INFO] Incident workflows tested',
      '[INFO] Runs outside the primary-region blast radius by design',
    ],
  },
  'otel-pipeline': {
    namespace: 'observability',
    role: 'Designed and built solo',
    // The rack defines no metrics; these chips are this view's own.
    facts: [
      { label: 'Exports', value: 'OneUptime + Loki' },
      { label: 'Signals', value: 'metrics / logs / traces' },
    ],
    logs: [
      '[INFO] Collector dual-exporting to OneUptime and Loki',
      '[INFO] Metrics, logs, and traces on one pipeline',
      '[INFO] Grafana dashboards reading unified data',
      '[INFO] Fragmented monitoring agents decommissioned',
      '[INFO] Prometheus scrape targets consolidated',
    ],
  },
  'es-cluster': {
    namespace: 'platform',
    role: 'Built and operated solo',
    logs: [
      '[INFO] Three-node cluster status green',
      '[INFO] Split-restart playbook executed, no cascade',
      '[INFO] Terraform plan clean, no drift',
      '[WARN] One node restarts at a time, by design',
      '[INFO] Ansible inventory verified',
    ],
  },
  'ci-cd-platform': {
    namespace: 'devops',
    role: 'Pipeline owner',
    // The rack metric abbreviates Lambda as a lambda glyph; this view
    // spells it out.
    facts: [
      { label: 'Platforms', value: '3' },
      { label: 'Targets', value: 'ECS · Lambda · CF · EC2' },
    ],
    logs: [
      '[INFO] GitLab CI pipeline green',
      '[INFO] Jenkins job deployed to ECS',
      '[INFO] CodePipeline release promoted',
      '[INFO] Lambda and CloudFront targets updated',
      '[INFO] Shared pipeline patterns applied to infra repos',
    ],
  },
  'aws-finops': {
    namespace: 'devops',
    role: 'Cost owner',
    facts: [
      { label: 'Levers', value: 'NAT / endpoints / retention' },
      { label: 'Cadence', value: 'ongoing' },
    ],
    logs: [
      '[INFO] Orphaned NAT Gateways removed',
      '[INFO] S3 and DynamoDB gateway endpoints added',
      '[INFO] CloudWatch log-retention policies set',
      '[INFO] EBS volumes right-sized',
      '[INFO] Monthly AWS bill reviewed',
    ],
  },
  'hashnode-mcp': {
    namespace: 'ai',
    role: 'Open-source author',
    facts: [
      { label: 'License', value: 'open source' },
      { label: 'State', value: 'shelved' },
    ],
    logs: [
      '[INFO] MCP server released as open source',
      '[INFO] Claude wired into the Hashnode content API',
      '[WARN] Hashnode terminated public API access',
      '[INFO] Project shelved, repo stays public',
      '[INFO] Pattern reused in agentic-DevOps work',
    ],
  },
  'vqgan-clip': {
    namespace: 'ai',
    role: 'Personal research project',
    facts: [
      { label: 'Era', value: '2021' },
      { label: 'State', value: 'archived' },
    ],
    logs: [
      '[INFO] VQGAN + CLIP pipeline built in PyTorch',
      '[INFO] Text prompts rendered to images',
      '[INFO] Artifact from the AI/ML era, 2021',
      '[INFO] Repo public on GitHub',
      '[INFO] Archived, kept for the record',
    ],
  },
};

// One card per rack, in RACKS order. The career facts (name, sublabel,
// description, tech, status, metrics, GitHub link) come straight from
// career.ts, so an edit there shows up here too.
const projects: Project[] = RACKS.map((rack) => {
  const extras = PROJECT_EXTRAS[rack.id];
  return {
    id: rack.id,
    name: rack.label,
    namespace: extras.namespace,
    sublabel: extras.sublabel ?? rack.sublabel,
    description: rack.description,
    role: extras.role,
    tech: rack.tech,
    status: rack.status as Project['status'],
    facts: extras.facts ?? rack.metrics ?? [],
    links: { github: rack.github },
    logs: extras.logs,
  };
});

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'logs' | 'metrics' | 'docs'>('metrics');

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
          The real production estate and side projects, rendered as a cluster. Click a workload to inspect.
        </p>
      </div>

      {/* Project Ecosystem Graph */}
      <ProjectsGraph />

      {/* CI/CD Pipeline Visualization */}
      <CiCdPipeline />

      {/* Docker Containers Visualization */}
      <DockerContainers />

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
              <span>Completed</span>
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
                <div className="text-xs text-gray-400 truncate">{project.sublabel}</div>
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

            {selectedProject.links.github && (
              <div className="flex flex-wrap gap-3 mb-4">
                <a
                  href={selectedProject.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                >
                  <FaGithub className="mr-1" /> Repository
                </a>
              </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-700 mb-4">
              <div className="flex flex-wrap gap-2 sm:space-x-4">
                <button
                  className={`py-2 px-4 font-medium ${activeTab === 'metrics' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-300'}`}
                  onClick={() => setActiveTab('metrics')}
                >
                  <FaChartLine className="inline mr-1" /> Facts
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
                  <h4 className="text-lg font-semibold text-green-400 mb-4">Key Facts</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="text-xs text-gray-400">Role</div>
                      <div className="text-sm font-mono mt-1">{selectedProject.role}</div>
                    </div>
                    {selectedProject.facts.map((fact, i) => (
                      <div key={i} className="bg-gray-700 p-3 rounded">
                        <div className="text-xs text-gray-400">{fact.label}</div>
                        <div className="text-sm font-mono mt-1">{fact.value}</div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-400 mb-4">
                    No invented uptimes or scores here. Same verified data as the 3D data center.
                  </p>

                  <button className="mt-2 px-4 py-2 bg-green-700 text-green-100 rounded hover:bg-green-600 transition-colors">
                    Deploy to Your Brain
                  </button>
                </div>
              )}

              {activeTab === 'logs' && (
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-4">Operational Log</h4>
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
                  <p className="text-xs text-gray-400 mt-2">
                    Condensed history of the real work, not a live tail.
                  </p>
                </div>
              )}

              {activeTab === 'docs' && (
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-4">Technical Documentation</h4>
                  <div className="bg-gray-700 rounded-md p-4">
                    <h5 className="font-semibold mb-2">Overview</h5>
                    <p className="text-sm mb-4">{selectedProject.description}</p>

                    <h5 className="font-semibold mb-2">Role</h5>
                    <p className="text-sm mb-4">{selectedProject.role}</p>

                    <h5 className="font-semibold mb-2">Status</h5>
                    <p className="text-sm mb-4">{selectedProject.status} · {selectedProject.sublabel}</p>

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
