'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDocker, FaGithub, FaServer, FaChartLine, FaBook } from 'react-icons/fa';
import CiCdPipeline from './CiCdPipeline';
import DockerContainers from './DockerContainers';
import ProjectsGraph from './ProjectsGraph';

// The same verified project set as the 3D data center
// (src/components/Experience3D/DataCenter.tsx). No invented uptimes,
// no fake performance scores. Facts are real, sourced from the resume.
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

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'logs' | 'metrics' | 'docs'>('metrics');

  const projects: Project[] = [
    {
      id: 'eventlogic',
      name: 'eventlogic',
      namespace: 'production',
      sublabel: 'multi-tenant SaaS · eu-north-1',
      description:
        'Swedish multi-tenant event-management SaaS. Sole platform owner. ECS Fargate services behind ALB, Aurora PostgreSQL with schema-per-tenant, ElastiCache Redis, Amazon MQ. Tenant routing via DynamoDB registry. Customers across Europe.',
      role: 'Sole platform owner',
      tech: ['ECS Fargate', 'Aurora PostgreSQL', 'ElastiCache', 'Amazon MQ', 'DynamoDB', 'CloudFront'],
      status: 'Running',
      facts: [
        { label: 'Region', value: 'eu-north-1' },
        { label: 'Tenancy', value: 'schema-per-tenant' },
      ],
      links: {},
      logs: [
        '[INFO] ECS Fargate services healthy behind the ALB',
        '[INFO] Aurora schema-per-tenant routing active',
        '[INFO] Tenant lookup served from the DynamoDB registry',
        '[INFO] CloudFront serving tenant assets at the edge',
        '[INFO] Amazon MQ broker connections stable',
      ],
    },
    {
      id: 'multi-region-dr',
      name: 'dr-failover',
      namespace: 'production',
      sublabel: 'cross-region disaster recovery',
      description:
        'Cross-region disaster recovery from eu-north-1 to eu-west-1. Built where none existed. Aurora Global Database for sub-second cross-region replication, EFS and ECR replication, shared KMS keys across regions. Documented runbook for promotion.',
      role: 'Designed and built solo',
      tech: ['Aurora Global DB', 'EFS', 'ECR', 'KMS', 'Route 53'],
      status: 'Running',
      facts: [
        { label: 'Primary', value: 'eu-north-1' },
        { label: 'Failover', value: 'eu-west-1' },
      ],
      links: {},
      logs: [
        '[INFO] Aurora Global Database replication nominal',
        '[INFO] EFS replication to eu-west-1 active',
        '[INFO] ECR cross-region image sync complete',
        '[INFO] KMS keys shared across both regions',
        '[INFO] Promotion runbook reviewed and versioned',
      ],
    },
    {
      id: 'tenant-orchestrator',
      name: 'tenant-orch',
      namespace: 'platform',
      sublabel: 'tenant provisioning service',
      description:
        'Python tenant-provisioning orchestrator. One API call sets up schema-per-tenant on Aurora, wires SQS and EventBridge, creates ALB listener rules, provisions a CloudFront / S3 distribution, configures Route 53 records, and registers the tenant in DynamoDB.',
      role: 'Author and operator',
      tech: ['Python', 'FastAPI', 'Aurora', 'SQS', 'EventBridge', 'Route 53'],
      status: 'Running',
      facts: [
        { label: 'Per tenant', value: 'one call' },
        { label: 'Steps', value: '6+' },
      ],
      links: {},
      logs: [
        '[INFO] Tenant schema created on Aurora',
        '[INFO] SQS and EventBridge wiring applied',
        '[INFO] ALB listener rule registered',
        '[INFO] CloudFront / S3 distribution provisioned',
        '[INFO] Route 53 record set, tenant registered in DynamoDB',
      ],
    },
    {
      id: 'reliability-program',
      name: 'reliability',
      namespace: 'sre',
      sublabel: 'incident · 19m outage fix',
      description:
        'Diagnosed a 19-minute full-platform outage caused by blocking Redis KEYS calls exhausting the Tomcat/JDBC thread pool. Added connection-pool checkout timeouts, tuned RDS parameters, and drove a 68-task reliability program across 11 epics and 7 sprints to prevent recurrence.',
      role: 'Incident lead, program driver',
      tech: ['Aurora', 'Redis', 'JDBC', 'Postmortem', 'SLOs'],
      status: 'Running',
      facts: [
        { label: 'Outage', value: '19 min' },
        { label: 'Tasks', value: '68 / 11 epics' },
      ],
      links: {},
      logs: [
        '[WARN] Blocking Redis KEYS call found in a hot path',
        '[INFO] Postmortem: KEYS calls exhausted the JDBC thread pool',
        '[INFO] Connection-pool checkout timeouts added',
        '[INFO] RDS parameter group tuned',
        '[INFO] Reliability program: 68 tasks, 11 epics, 7 sprints',
      ],
    },
    {
      id: 'oneuptime',
      name: 'oneuptime',
      namespace: 'observability',
      sublabel: 'self-hosted SRE platform',
      description:
        'Self-hosted OneUptime on K3s in eu-central-1 (separate region from primary). Status pages, uptime monitoring, on-call scheduling, incident management. Designed so observability survives a primary-region outage.',
      role: 'Built and operated solo',
      tech: ['K3s', 'OneUptime', 'OpenTelemetry', 'Loki'],
      status: 'Running',
      facts: [
        { label: 'Region', value: 'eu-central-1' },
        { label: 'Surface', value: 'status / on-call' },
      ],
      links: {},
      logs: [
        '[INFO] K3s cluster healthy in eu-central-1',
        '[INFO] Status pages serving',
        '[INFO] On-call schedule synced',
        '[INFO] Incident workflows tested',
        '[INFO] Runs outside the primary-region blast radius by design',
      ],
    },
    {
      id: 'otel-pipeline',
      name: 'otel',
      namespace: 'observability',
      sublabel: 'observability pipeline',
      description:
        'OpenTelemetry collector dual-exports metrics, logs, and traces to OneUptime and Loki at the same time. Consolidated fragmented monitoring into one observability stack. Grafana sits on top.',
      role: 'Designed and built solo',
      tech: ['OpenTelemetry', 'Loki', 'Grafana', 'Prometheus'],
      status: 'Running',
      facts: [
        { label: 'Exports', value: 'OneUptime + Loki' },
        { label: 'Signals', value: 'metrics / logs / traces' },
      ],
      links: {},
      logs: [
        '[INFO] Collector dual-exporting to OneUptime and Loki',
        '[INFO] Metrics, logs, and traces on one pipeline',
        '[INFO] Grafana dashboards reading unified data',
        '[INFO] Fragmented monitoring agents decommissioned',
        '[INFO] Prometheus scrape targets consolidated',
      ],
    },
    {
      id: 'es-cluster',
      name: 'es-cluster',
      namespace: 'platform',
      sublabel: '3-node Elasticsearch',
      description:
        'Self-managed three-node Elasticsearch cluster managed with Terraform and Ansible. Split deploy and split-restart playbooks so a single config change cannot cascade across the cluster.',
      role: 'Built and operated solo',
      tech: ['Elasticsearch', 'Terraform', 'Ansible'],
      status: 'Maintenance',
      facts: [
        { label: 'Nodes', value: '3' },
        { label: 'Deploy', value: 'split-restart' },
      ],
      links: {},
      logs: [
        '[INFO] Three-node cluster status green',
        '[INFO] Split-restart playbook executed, no cascade',
        '[INFO] Terraform plan clean, no drift',
        '[WARN] One node restarts at a time, by design',
        '[INFO] Ansible inventory verified',
      ],
    },
    {
      id: 'ci-cd-platform',
      name: 'ci-cd',
      namespace: 'devops',
      sublabel: 'pipelines · 3 platforms',
      description:
        'CI/CD pipelines spanning Jenkins, GitLab CI, and AWS CodePipeline / CodeBuild. Targets include ECS, Lambda, CloudFront, and EC2 deployments. App and infra share pipeline patterns.',
      role: 'Pipeline owner',
      tech: ['Jenkins', 'GitLab CI', 'CodePipeline', 'CodeBuild', 'Docker'],
      status: 'Running',
      facts: [
        { label: 'Platforms', value: '3' },
        { label: 'Targets', value: 'ECS · Lambda · CF · EC2' },
      ],
      links: {},
      logs: [
        '[INFO] GitLab CI pipeline green',
        '[INFO] Jenkins job deployed to ECS',
        '[INFO] CodePipeline release promoted',
        '[INFO] Lambda and CloudFront targets updated',
        '[INFO] Shared pipeline patterns applied to infra repos',
      ],
    },
    {
      id: 'aws-finops',
      name: 'finops',
      namespace: 'devops',
      sublabel: 'AWS cost optimization',
      description:
        'Cut monthly AWS spend by removing orphaned NAT Gateways, adding S3 and DynamoDB gateway endpoints to drop data-transfer cost, setting log-retention policies on CloudWatch, and right-sizing EBS volumes.',
      role: 'Cost owner',
      tech: ['VPC Endpoints', 'CloudWatch Logs', 'EBS', 'NAT'],
      status: 'Maintenance',
      facts: [
        { label: 'Levers', value: 'NAT / endpoints / retention' },
        { label: 'Cadence', value: 'ongoing' },
      ],
      links: {},
      logs: [
        '[INFO] Orphaned NAT Gateways removed',
        '[INFO] S3 and DynamoDB gateway endpoints added',
        '[INFO] CloudWatch log-retention policies set',
        '[INFO] EBS volumes right-sized',
        '[INFO] Monthly AWS bill reviewed',
      ],
    },
    {
      id: 'hashnode-mcp',
      name: 'hashnode-mcp',
      namespace: 'ai',
      sublabel: 'shelved · API terminated',
      description:
        'Open-source Model Context Protocol server that wired AI assistants like Claude into the Hashnode content API. Shelved after Hashnode terminated public API access. The pattern lives on in the broader agentic-DevOps work.',
      role: 'Open-source author',
      tech: ['Python', 'MCP', 'Hashnode API'],
      status: 'Completed',
      facts: [
        { label: 'License', value: 'open source' },
        { label: 'State', value: 'shelved' },
      ],
      links: {
        github: 'https://github.com/sbmagar13/hashnode-mcp-server',
      },
      logs: [
        '[INFO] MCP server released as open source',
        '[INFO] Claude wired into the Hashnode content API',
        '[WARN] Hashnode terminated public API access',
        '[INFO] Project shelved, repo stays public',
        '[INFO] Pattern reused in agentic-DevOps work',
      ],
    },
    {
      id: 'vqgan-clip',
      name: 'vqgan-clip',
      namespace: 'ai',
      sublabel: 'text-to-image · 2021',
      description:
        'Multimodal text-to-image generation using VQGAN + CLIP architectures in PyTorch. From the AI/ML era of the career, kept here as an artifact.',
      role: 'Personal research project',
      tech: ['PyTorch', 'CLIP', 'VQGAN', 'Python'],
      status: 'Completed',
      facts: [
        { label: 'Era', value: '2021' },
        { label: 'State', value: 'archived' },
      ],
      links: {
        github: 'https://github.com/sbmagar13/VQGAN-CLIP-Text-to-Image',
      },
      logs: [
        '[INFO] VQGAN + CLIP pipeline built in PyTorch',
        '[INFO] Text prompts rendered to images',
        '[INFO] Artifact from the AI/ML era, 2021',
        '[INFO] Repo public on GitHub',
        '[INFO] Archived, kept for the record',
      ],
    },
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
