// =============================================================================
// CAREER DATA · SINGLE SOURCE OF TRUTH
//
// Every career fact on the site lives here: identity, war stories, projects
// (racks), milestones, skills, and the avatar stat chips. Edit facts in this
// file, never in scene files. The Experience3D scenes (Hero, DataCenter,
// Journey, SkillsHall, Avatar) and any server-rendered pages import from here
// so the same fact never has to be maintained in two places.
//
// No 'use client' directive: this module must stay importable from server
// components (Next.js static export).
// =============================================================================

import { PALETTE } from '@/components/Experience3D/Materials';
// Type-only import: erased at compile time, so it does not pull the client
// component into server bundles.
import type { ScreenMode } from '@/components/Experience3D/AnimatedScreen';

export type { ScreenMode };

// -----------------------------------------------------------------------------
// Identity
// -----------------------------------------------------------------------------

export interface Identity {
  name: string;
  title: string;
  tagline: string;
  yearsLabel: string;
  location: string;
  email: string;
  links: {
    github: string;
    linkedin: string;
    blog: string;
    site: string;
  };
}

export const IDENTITY: Identity = {
  name: 'Sagar Budhathoki',
  title: 'Senior DevOps / SRE Engineer',
  tagline: 'building ai agents for ops · open to remote senior roles',
  yearsLabel: '5+ Years',
  location: 'Kathmandu, Nepal · open to remote',
  email: 'sagar@sagarbudhathoki.com',
  links: {
    github: 'https://github.com/sbmagar13',
    linkedin: 'https://linkedin.com/in/sbmagar13',
    blog: 'https://blog.budhathokisagar.com.np',
    site: 'https://sagarbudhathoki.com',
  },
};

// -----------------------------------------------------------------------------
// Hero: war stories, orbit order, chip labels, stat cards
// -----------------------------------------------------------------------------

export type ToolId =
  | 'kubernetes'
  | 'docker'
  | 'aws'
  | 'aurora'
  | 'terraform'
  | 'python'
  | 'grafana'
  | 'opentelemetry'
  | 'mcp';

export interface WarStory {
  tool: string;
  title: string;
  when: string;
  body: string;
}

// War stories: one per tool in the orbit, drawn from the resume's
// real production work. Clicking a tool in the Hero pops the matching
// story so the orbit reads as an interactive map of the career, not
// a decorative ring of icons.
export const STORIES: Record<ToolId, WarStory> = {
  kubernetes: {
    tool: 'Kubernetes (K3s)',
    title: 'Self-hosted SRE platform on K3s',
    when: '2025 · eu-central-1',
    body:
      'Stood up OneUptime on a K3s cluster in a separate region (eu-central-1) for status pages, uptime monitoring, on-call scheduling and incident management. Deliberately off the primary region so observability survives a primary-region outage.',
  },
  docker: {
    tool: 'Docker',
    title: 'CI/CD across three platforms',
    when: '2023 to present',
    body:
      'Containerised build and deploy pipelines on Jenkins, GitLab CI, and AWS CodePipeline / CodeBuild. Targets include ECS, Lambda, CloudFront and EC2. App and infra share pipeline patterns so a single change can flow through any of them.',
  },
  aws: {
    tool: 'AWS',
    title: 'Recovered a 19-minute platform outage',
    when: '2024 · production',
    body:
      'Diagnosed and resolved a 19-minute full-platform outage caused by blocking Redis KEYS calls exhausting the Tomcat/JDBC thread pool. Added connection-pool checkout timeouts, tuned RDS parameters, then drove a 68-task reliability program across 11 epics and 7 sprints to prevent recurrence.',
  },
  aurora: {
    tool: 'Aurora PostgreSQL',
    title: 'Built cross-region disaster recovery',
    when: '2024',
    body:
      'Established a cross-region DR path where none existed: Aurora Global Database from eu-north-1 to eu-west-1, EFS and ECR replication, shared KMS keys, and a documented runbook for promotion.',
  },
  terraform: {
    tool: 'Terraform',
    title: '3-node Elasticsearch with split-restart',
    when: 'production',
    body:
      'Self-managed three-node Elasticsearch cluster orchestrated with Terraform and Ansible. Split deploy and split-restart playbooks so a single config change cannot cascade across the cluster.',
  },
  python: {
    tool: 'Python',
    title: 'Tenant provisioning orchestrator',
    when: 'production',
    body:
      'One Python API call sets up schema-per-tenant on Aurora, wires SQS and EventBridge, creates ALB listener rules, provisions a CloudFront / S3 distribution, configures Route 53 records, and registers the tenant in DynamoDB.',
  },
  grafana: {
    tool: 'Grafana',
    title: 'One observability surface',
    when: 'rolling',
    body:
      'Consolidated fragmented monitoring into one stack. Grafana over Prometheus, Loki and CloudWatch with per-cluster, per-namespace and per-tenant dashboards. Alert routing wired to OneUptime on-call.',
  },
  opentelemetry: {
    tool: 'OpenTelemetry',
    title: 'Dual-export OTEL pipeline',
    when: '2025',
    body:
      'OpenTelemetry collector dual-exports metrics, logs and traces to OneUptime and Loki at the same time. The duplication is the point: if a primary-region failure takes the main observability stack down, the OneUptime side still pages.',
  },
  mcp: {
    tool: 'Anthropic MCP',
    title: 'AI agents for DevOps work',
    when: '2025 to present',
    body:
      'Self-learning track. Building MCP-based agents that wrap real DevOps tasks (log triage, runbook prompts, infra analysis) so Claude and similar assistants can drive them. Built an open-source Hashnode MCP server that wires AI assistants into the Hashnode content API. Current focus is the broader agentic-DevOps stack: MCP, LangGraph, local LLM inference.',
  },
};

export const ORBIT_TOOLS: ToolId[] = [
  'kubernetes',
  'docker',
  'aws',
  'aurora',
  'terraform',
  'python',
  'grafana',
  'opentelemetry',
  'mcp',
];

// Short labels for the mobile chip row. On phones the scrolling
// overlay sits over the Canvas, so the orbit logos can't be tapped;
// these chips drive the same setPicked path instead.
export const CHIP_LABELS: Record<ToolId, string> = {
  kubernetes: 'K8s',
  docker: 'Docker',
  aws: 'AWS',
  aurora: 'Aurora',
  terraform: 'Terraform',
  python: 'Python',
  grafana: 'Grafana',
  opentelemetry: 'OTel',
  mcp: 'MCP',
};

export interface StatCard {
  label: string;
  value: string;
  sub?: string;
  color: string;
}

export const STAT_CARDS: StatCard[] = [
  { label: 'Experience', value: '5+ Years', color: 'text-cyan-300' },
  { label: 'Operates', value: 'Multi-tenant event SaaS', sub: 'Grails · ECS Fargate · Aurora', color: 'text-purple-300' },
  { label: 'Engineered', value: 'Cross-region DR', sub: 'Aurora Global · EFS · ECR', color: 'text-orange-300' },
  { label: 'Top Lang', value: 'Python', color: 'text-cyan-200' },
  { label: 'Building', value: 'AI Agents for DevOps', sub: 'self-learning projects', color: 'text-emerald-300' },
];

// -----------------------------------------------------------------------------
// Data center: racks (projects)
// -----------------------------------------------------------------------------

export interface RackMetric {
  label: string;
  value: string;
}

// 11 racks = 11 projects. Real names, real statuses. Edit at will.
export interface RackData {
  id: string;
  label: string;
  sublabel: string;
  status: string;
  description: string;
  tech: string[];
  metrics?: RackMetric[];
  github?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  screen?: ScreenMode;
}

export const RACKS: RackData[] = [
  // ROW 1 (back row, eu-north-1 production stack)
  {
    id: 'eventlogic',
    label: 'eventlogic',
    sublabel: 'multi-tenant SaaS · eu-north-1',
    status: 'Running',
    description:
      'Swedish multi-tenant event-management SaaS. Sole platform owner. ECS Fargate services behind ALB, Aurora PostgreSQL with schema-per-tenant, ElastiCache Redis, Amazon MQ. Tenant routing via DynamoDB registry. Customers across Europe.',
    tech: ['ECS Fargate', 'Aurora PostgreSQL', 'ElastiCache', 'Amazon MQ', 'DynamoDB', 'CloudFront'],
    metrics: [
      { label: 'Region', value: 'eu-north-1' },
      { label: 'Tenancy', value: 'schema-per-tenant' },
    ],
    position: [-4.5, 0, -2.5],
    screen: 'graph',
  },
  {
    id: 'multi-region-dr',
    label: 'dr-failover',
    sublabel: 'cross-region disaster recovery',
    status: 'Running',
    description:
      'Cross-region disaster recovery from eu-north-1 to eu-west-1. Built where none existed. Aurora Global Database for sub-second cross-region replication, EFS and ECR replication, shared KMS keys across regions. Documented runbook for promotion.',
    tech: ['Aurora Global DB', 'EFS', 'ECR', 'KMS', 'Route 53'],
    metrics: [
      { label: 'Primary', value: 'eu-north-1' },
      { label: 'Failover', value: 'eu-west-1' },
    ],
    position: [-2.7, 0, -2.5],
    screen: 'pulse',
  },
  {
    id: 'tenant-orchestrator',
    label: 'tenant-orch',
    sublabel: 'provisioning service',
    status: 'Running',
    description:
      'Python tenant-provisioning orchestrator. One API call sets up schema-per-tenant on Aurora, wires SQS and EventBridge, creates ALB listener rules, provisions a CloudFront / S3 distribution, configures Route 53 records, and registers the tenant in DynamoDB.',
    tech: ['Python', 'FastAPI', 'Aurora', 'SQS', 'EventBridge', 'Route 53'],
    metrics: [
      { label: 'Per tenant', value: 'one call' },
      { label: 'Steps', value: '6+' },
    ],
    position: [-0.9, 0, -2.5],
    screen: 'terminal',
  },
  {
    id: 'reliability-program',
    label: 'reliability',
    sublabel: 'incident · 19m outage fix',
    status: 'Running',
    description:
      'Diagnosed a 19-minute full-platform outage caused by blocking Redis KEYS calls exhausting the Tomcat/JDBC thread pool. Added connection-pool checkout timeouts, tuned RDS parameters, and drove a 68-task reliability program across 11 epics and 7 sprints to prevent recurrence.',
    tech: ['Aurora', 'Redis', 'JDBC', 'Postmortem', 'SLOs'],
    metrics: [
      { label: 'Outage', value: '19 min' },
      { label: 'Tasks', value: '68 / 11 epics' },
    ],
    position: [0.9, 0, -2.5],
    screen: 'pulse',
  },
  {
    id: 'oneuptime',
    label: 'oneuptime',
    sublabel: 'self-hosted SRE platform',
    status: 'Running',
    description:
      'Self-hosted OneUptime on K3s in eu-central-1 (separate region from primary). Status pages, uptime monitoring, on-call scheduling, incident management. Designed so observability survives a primary-region outage.',
    tech: ['K3s', 'OneUptime', 'OpenTelemetry', 'Loki'],
    metrics: [
      { label: 'Region', value: 'eu-central-1' },
      { label: 'Surface', value: 'status / on-call' },
    ],
    position: [2.7, 0, -2.5],
    screen: 'htop',
  },
  {
    id: 'otel-pipeline',
    label: 'otel',
    sublabel: 'observability pipeline',
    status: 'Running',
    description:
      'OpenTelemetry collector dual-exports metrics, logs, and traces to OneUptime and Loki at the same time. Consolidated fragmented monitoring into one observability stack. Grafana sits on top.',
    tech: ['OpenTelemetry', 'Loki', 'Grafana', 'Prometheus'],
    position: [4.5, 0, -2.5],
    screen: 'logs',
  },

  // ROW 2 (front row, platform tooling + AI side projects)
  {
    id: 'es-cluster',
    label: 'es-cluster',
    sublabel: '3-node Elasticsearch',
    status: 'Maintenance',
    description:
      'Self-managed three-node Elasticsearch cluster managed with Terraform and Ansible. Split deploy and split-restart playbooks so a single config change cannot cascade across the cluster.',
    tech: ['Elasticsearch', 'Terraform', 'Ansible'],
    metrics: [
      { label: 'Nodes', value: '3' },
      { label: 'Deploy', value: 'split-restart' },
    ],
    position: [-4.5, 0, 2.5],
    rotation: [0, Math.PI, 0],
    screen: 'graph',
  },
  {
    id: 'ci-cd-platform',
    label: 'ci-cd',
    sublabel: 'pipelines · 3 platforms',
    status: 'Running',
    description:
      'CI/CD pipelines spanning Jenkins, GitLab CI, and AWS CodePipeline / CodeBuild. Targets include ECS, Lambda, CloudFront, and EC2 deployments. App and infra share pipeline patterns.',
    tech: ['Jenkins', 'GitLab CI', 'CodePipeline', 'CodeBuild', 'Docker'],
    metrics: [
      { label: 'Platforms', value: '3' },
      { label: 'Targets', value: 'ECS · λ · CF · EC2' },
    ],
    position: [-2.7, 0, 2.5],
    rotation: [0, Math.PI, 0],
    screen: 'terminal',
  },
  {
    id: 'aws-finops',
    label: 'finops',
    sublabel: 'AWS cost optimization',
    status: 'Maintenance',
    description:
      'Cut monthly AWS spend by removing orphaned NAT Gateways, adding S3 and DynamoDB gateway endpoints to drop data-transfer cost, setting log-retention policies on CloudWatch, and right-sizing EBS volumes.',
    tech: ['VPC Endpoints', 'CloudWatch Logs', 'EBS', 'NAT'],
    position: [-0.9, 0, 2.5],
    rotation: [0, Math.PI, 0],
    screen: 'graph',
  },
  {
    id: 'hashnode-mcp',
    label: 'hashnode-mcp',
    sublabel: 'AI assistant integration',
    status: 'Completed',
    description:
      'Open-source Model Context Protocol server that wires AI assistants like Claude into the Hashnode content API. The pattern carries into the broader agentic-DevOps work. (Note: Hashnode has since wound down public API access.)',
    tech: ['Python', 'MCP', 'Hashnode API'],
    github: 'https://github.com/sbmagar13/hashnode-mcp-server',
    position: [0.9, 0, 2.5],
    rotation: [0, Math.PI, 0],
    screen: 'matrix',
  },
  {
    id: 'vqgan-clip',
    label: 'vqgan-clip',
    sublabel: 'text-to-image · 2021',
    status: 'Completed',
    description:
      'Multimodal text-to-image generation using VQGAN + CLIP architectures in PyTorch. From the AI/ML era of the career, kept here as an artifact.',
    tech: ['PyTorch', 'CLIP', 'VQGAN', 'Python'],
    github: 'https://github.com/sbmagar13/VQGAN-CLIP-Text-to-Image',
    position: [2.7, 0, 2.5],
    rotation: [0, Math.PI, 0],
    screen: 'matrix',
  },
];

// -----------------------------------------------------------------------------
// Journey: milestones
// -----------------------------------------------------------------------------

export type MilestoneShape = 'tower' | 'cluster' | 'orb' | 'cube' | 'helix' | 'book';

export interface Milestone {
  year: string;
  title: string;
  description: string;
  // Which monument shape to draw (procedural, no models needed).
  shape: MilestoneShape;
  color: string;
}

export const MILESTONES: Milestone[] = [
  {
    year: '2020',
    title: 'AI / ML beginnings',
    description:
      'VolgAI, Genese Cloud Academy, IBZ Networks. Built AI chatbots with RASA (NLP), backend APIs with Django and Flask, RTSP/FFmpeg pipelines for CCTV image processing. Async work via Celery and RabbitMQ. AWS AI/ML Internship at Genese.',
    shape: 'book',
    color: PALETTE.ledWhite,
  },
  {
    year: '2021',
    title: 'Bachelor + first DevOps role',
    description:
      'Graduated Bachelor in Computer Engineering from Tribhuvan University (IOE, Pokhara). Joined Cloudyfox Technology in September as DevOps Engineer. First Terraform / Terragrunt at scale across AWS.',
    shape: 'tower',
    color: PALETTE.neonCyan,
  },
  {
    year: '2022',
    title: 'Containers and pipelines',
    description:
      'Ran Kubernetes for containerized workloads at Cloudyfox. Built CI/CD on GitLab CI and Jenkins for both app and infra deploys. SysOps, Linux admin, OpenVPN, centralized logging with CloudWatch, ELK, Grafana.',
    shape: 'cluster',
    color: PALETTE.neonBlue,
  },
  {
    year: '2023',
    title: 'Sole owner of a production platform',
    description:
      'Joined Threadcode Technologies as DevOps / SRE for EventLogic, a Swedish multi-tenant event-management SaaS. Owner of the entire AWS platform end to end: ECS Fargate, Aurora PostgreSQL, ElastiCache Redis, Amazon MQ in eu-north-1. Technical Reviewer for Python for DevOps (Packt).',
    shape: 'cube',
    color: PALETTE.neonMagenta,
  },
  {
    year: '2024',
    title: 'Reliability + multi-region DR',
    description:
      'Diagnosed and resolved a 19-minute platform outage caused by blocking Redis KEYS calls exhausting the JDBC thread pool. Drove a 68-task reliability program across 11 epics and 7 sprints. Built cross-region DR from eu-north-1 to eu-west-1 with Aurora Global Database, EFS replication, and shared KMS keys.',
    shape: 'orb',
    color: PALETTE.ledAmber,
  },
  {
    year: '2025',
    title: 'Observability + first MCP work',
    description:
      'Deployed self-hosted OneUptime on K3s in eu-central-1 for status pages, uptime monitoring, and on-call. OpenTelemetry collector dual-exports to OneUptime and Loki so observability survives a primary-region outage. Shipped an open-source Hashnode MCP server that wires AI assistants like Claude into the Hashnode content API.',
    shape: 'helix',
    color: PALETTE.neonPurple,
  },
  {
    year: '2026',
    title: 'Agentic DevOps + platform hardening',
    description:
      'Still running the production platform end to end. Hardening the multi-region story, sharpening SLOs, and going deep on AI agents for DevOps work: MCP, LangGraph, local LLM inference, self-learning side projects that wrap real ops tasks. Shipped this 3D portfolio as the public face of the practice. Open to remote senior DevOps / SRE roles.',
    shape: 'orb',
    color: PALETTE.neonCyan,
  },
];

// -----------------------------------------------------------------------------
// Education + certifications (resume facts, used by server-rendered pages)
// -----------------------------------------------------------------------------

export interface Education {
  degree: string;
  institution: string;
  location: string;
  period: string;
}

// Bachelor in Computer Engineering, Tribhuvan University, Western Regional
// Campus (IOE), Pokhara, 2016 to 2020.
export const EDUCATION: Education[] = [
  {
    degree: 'Bachelor in Computer Engineering',
    institution: 'Tribhuvan University, Western Regional Campus (IOE)',
    location: 'Pokhara, Nepal',
    period: '2016 · 2020',
  },
];

export interface Certification {
  title: string;
  issuer: string;
  year: string;
}

// Certifications and recognition, in resume order.
export const CERTIFICATIONS: Certification[] = [
  {
    title: 'Technical Reviewer, Python for DevOps',
    issuer: 'Packt Publishing',
    year: '2023',
  },
  {
    title: 'Generative AI: From GANs to CLIP with Python and PyTorch',
    issuer: 'Udemy',
    year: '2021',
  },
  {
    title: 'AWS AI/ML Internship',
    issuer: 'Genese Cloud Academy',
    year: '2020 · 2021',
  },
];

// -----------------------------------------------------------------------------
// Skills hall: skills inventory + category colors
// -----------------------------------------------------------------------------

export type Category =
  | 'infrastructure'
  | 'cicd'
  | 'cloud'
  | 'database'
  | 'monitoring'
  | 'development'
  | 'security'
  | 'ai-ml'
  | 'os'
  | 'misc';

export interface SkillData {
  id: string;
  name: string;
  category: Category;
  years: number;
  highlight?: boolean;
  blurb?: string;
}

// Real skills inventory pulled from the Senior DevOps / SRE resume.
// Highlighted ones are where Sagar has owned production end to end.
export const SKILLS: SkillData[] = [
  // Cloud and infrastructure (heavy AWS)
  { id: 'aws', name: 'AWS', category: 'cloud', years: 4, highlight: true, blurb: 'Sole owner of multi-tenant SaaS on AWS. 15+ services in production.' },
  { id: 'ecs-fargate', name: 'ECS Fargate', category: 'cloud', years: 3, highlight: true, blurb: 'Serverless container orchestration. EventLogic runs here.' },
  { id: 'lambda', name: 'AWS Lambda', category: 'cloud', years: 4, blurb: 'Serverless functions wired into pipelines and event flows.' },
  { id: 'aurora', name: 'Aurora PostgreSQL', category: 'database', years: 3, highlight: true, blurb: 'Schema-per-tenant, multi-region Global Database.' },
  { id: 'elasticache', name: 'ElastiCache (Redis)', category: 'database', years: 3, blurb: 'Managed Redis. Connection-pool tuning saved a 19-min outage.' },
  { id: 'amazon-mq', name: 'Amazon MQ', category: 'cloud', years: 2, blurb: 'Managed message broker for inter-service queues.' },
  { id: 'dynamodb', name: 'DynamoDB', category: 'database', years: 3, blurb: 'Tenant registry, key-value lookups, hot paths.' },
  { id: 'aws-dms', name: 'AWS DMS', category: 'database', years: 2, blurb: 'Database Migration Service for cutovers and replication.' },
  { id: 'cloudfront', name: 'CloudFront', category: 'cloud', years: 4, blurb: 'CDN + edge for tenant distribution.' },
  { id: 's3', name: 'S3', category: 'cloud', years: 4, blurb: 'Object storage. Static assets, backups, logs.' },
  { id: 'api-gateway', name: 'API Gateway', category: 'cloud', years: 3, blurb: 'Managed API frontends for Lambda and ECS.' },
  { id: 'route53', name: 'Route 53', category: 'infrastructure', years: 4, blurb: 'DNS for multi-tenant routing.' },
  { id: 'vpc', name: 'VPC Networking', category: 'infrastructure', years: 4, blurb: 'Subnets, peering, endpoints, NAT, security groups.' },
  { id: 'efs', name: 'EFS', category: 'cloud', years: 2, blurb: 'Cross-region replication for stateful workloads.' },
  { id: 'ecr', name: 'ECR', category: 'cloud', years: 4, blurb: 'Container registry with cross-region replication.' },

  // IaC and configuration
  { id: 'terraform', name: 'Terraform', category: 'infrastructure', years: 4, highlight: true, blurb: 'Primary IaC. Modules, remote state, drift detection.' },
  { id: 'terragrunt', name: 'Terragrunt', category: 'infrastructure', years: 3, highlight: true, blurb: 'DRY Terraform across environments.' },
  { id: 'cloudformation', name: 'CloudFormation', category: 'infrastructure', years: 3, blurb: 'AWS-native IaC for legacy stacks.' },
  { id: 'cdk', name: 'AWS CDK', category: 'infrastructure', years: 2, blurb: 'Code-first IaC for AWS.' },
  { id: 'ansible', name: 'Ansible', category: 'infrastructure', years: 4, blurb: 'Config management. Split-restart playbooks for Elasticsearch.' },

  // Containers and orchestration
  { id: 'docker', name: 'Docker', category: 'infrastructure', years: 4, highlight: true, blurb: 'Multi-stage builds. Image hygiene. Daily driver.' },
  { id: 'kubernetes', name: 'Kubernetes (K3s)', category: 'infrastructure', years: 3, highlight: true, blurb: 'Self-hosted K3s in eu-central-1 for OneUptime.' },

  // CI/CD
  { id: 'gitlab-ci', name: 'GitLab CI', category: 'cicd', years: 4, highlight: true, blurb: 'Primary pipeline platform for app and infra deploys.' },
  { id: 'jenkins', name: 'Jenkins', category: 'cicd', years: 4, blurb: 'Long-running automation. ECS, Lambda, EC2 deploys.' },
  { id: 'aws-codepipeline', name: 'CodePipeline', category: 'cicd', years: 3, blurb: 'AWS-native release pipelines with CodeBuild.' },
  { id: 'github-actions', name: 'GitHub Actions', category: 'cicd', years: 3, blurb: 'Workflows close to the code.' },

  // Observability
  { id: 'prometheus', name: 'Prometheus', category: 'monitoring', years: 3, highlight: true, blurb: 'Metrics + PromQL + alerting.' },
  { id: 'grafana', name: 'Grafana', category: 'monitoring', years: 3, highlight: true, blurb: 'Dashboards across Prometheus, Loki, CloudWatch.' },
  { id: 'loki', name: 'Loki', category: 'monitoring', years: 2, blurb: 'Log aggregation. Dual-export target with OneUptime.' },
  { id: 'opentelemetry', name: 'OpenTelemetry', category: 'monitoring', years: 2, highlight: true, blurb: 'Unified collector. Dual-export to OneUptime + Loki.' },
  { id: 'cloudwatch', name: 'AWS CloudWatch', category: 'monitoring', years: 4, blurb: 'Metrics, logs, alarms, dashboards.' },
  { id: 'oneuptime', name: 'OneUptime', category: 'monitoring', years: 1, blurb: 'Self-hosted SRE platform. Status pages + on-call.' },
  { id: 'elk', name: 'ELK Stack', category: 'monitoring', years: 4, blurb: '3-node self-managed Elasticsearch cluster.' },
  { id: 'elasticsearch', name: 'Elasticsearch', category: 'monitoring', years: 4, blurb: 'Self-managed cluster with split-restart safety.' },

  // Databases (continued)
  { id: 'postgresql', name: 'PostgreSQL', category: 'database', years: 4, blurb: 'EXPLAIN, indexes, replication.' },
  { id: 'redis', name: 'Redis', category: 'database', years: 3, blurb: 'Cache, rate limits, ephemeral state.' },

  // Security
  { id: 'aws-iam', name: 'AWS IAM', category: 'security', years: 4, highlight: true, blurb: 'Roles, fine-grained policies, cross-account.' },
  { id: 'kms', name: 'AWS KMS', category: 'security', years: 4, blurb: 'Shared KMS keys for cross-region DR.' },
  { id: 'secrets-manager', name: 'Secrets Manager', category: 'security', years: 3, blurb: 'Rotation, secure injection into ECS.' },
  { id: 'aws-inspector', name: 'AWS Inspector', category: 'security', years: 2, blurb: 'Continuous vulnerability scanning.' },
  { id: 'cloudtrail', name: 'CloudTrail', category: 'security', years: 4, blurb: 'API audit trail. Multi-account aggregation.' },
  { id: 'openvpn', name: 'OpenVPN', category: 'security', years: 3, blurb: 'Production access. User and route management.' },

  // Programming
  { id: 'python', name: 'Python', category: 'development', years: 5, highlight: true, blurb: 'FastAPI, Django, Flask. Tenant orchestrator. Default tool.' },
  { id: 'fastapi', name: 'FastAPI', category: 'development', years: 3, blurb: 'Typed async APIs.' },
  { id: 'django', name: 'Django', category: 'development', years: 3, blurb: 'Admin-heavy CRUD services.' },
  { id: 'flask', name: 'Flask', category: 'development', years: 3, blurb: 'Small standalone services.' },
  { id: 'bash', name: 'Bash', category: 'development', years: 5, blurb: 'Shell scripting, deploy automation, runbooks.' },
  { id: 'javascript', name: 'JavaScript', category: 'development', years: 4, blurb: 'Light frontend, Node tooling, infra glue.' },

  // AI/ML and tooling
  { id: 'mcp', name: 'Anthropic MCP', category: 'ai-ml', years: 1, highlight: true, blurb: 'Built Hashnode MCP server. Tool integration for Claude.' },
  { id: 'langgraph', name: 'LangGraph', category: 'ai-ml', years: 1, blurb: 'Agent orchestration graphs.' },
  { id: 'langchain', name: 'LangChain', category: 'ai-ml', years: 1, blurb: 'LLM-powered workflows.' },
  { id: 'local-llm', name: 'Local LLM Inference', category: 'ai-ml', years: 1, blurb: 'Self-hosted models for private inference.' },
  { id: 'pytorch', name: 'PyTorch', category: 'ai-ml', years: 2, blurb: 'VQGAN + CLIP. Deep learning prototypes.' },
  { id: 'rasa', name: 'RASA', category: 'ai-ml', years: 2, blurb: 'Conversational AI / NLP chatbots.' },

  // Data pipelines
  { id: 'airflow', name: 'Apache Airflow', category: 'misc', years: 2, blurb: 'DAG-based scheduling.' },
  { id: 'airbyte', name: 'Airbyte', category: 'misc', years: 1, blurb: 'ELT connectors.' },
  { id: 'celery', name: 'Celery + RabbitMQ', category: 'misc', years: 3, blurb: 'Async task processing.' },
  { id: 'ffmpeg', name: 'FFmpeg', category: 'misc', years: 2, blurb: 'RTSP / NVR / video pipelines.' },

  // OS
  { id: 'arch', name: 'Arch Linux', category: 'os', years: 5, highlight: true, blurb: 'Daily driver. KISS. Rolling release.' },
  { id: 'ubuntu', name: 'Ubuntu', category: 'os', years: 6, blurb: 'Production servers, default base image.' },
];

export const CATEGORY_COLORS: Record<Category, string> = {
  infrastructure: PALETTE.neonCyan,
  cicd: PALETTE.neonBlue,
  cloud: '#0ea5e9',
  database: PALETTE.ledGreen,
  monitoring: PALETTE.ledAmber,
  development: PALETTE.neonMagenta,
  security: PALETTE.ledRed,
  'ai-ml': PALETTE.neonPurple,
  os: PALETTE.ledWhite,
  misc: '#94a3b8',
};

// -----------------------------------------------------------------------------
// Avatar: identity stat chips
// -----------------------------------------------------------------------------

// Stat panel data. Each chip is a specific fact from the resume so the
// page reads as Sagar's actual story rather than a template. `detail`
// is what the DOM overlay shows on click; it only expands on what the
// chip itself claims, no new facts.
export interface AvatarStat {
  id: string;
  label: string;
  value: string;
  color: string;
  position: [number, number, number];
  detail: string;
}

export const AVATAR_STATS: AvatarStat[] = [
  {
    id: 'role',
    label: 'Role',
    value: 'Senior DevOps · SRE',
    color: PALETTE.neonCyan,
    position: [2.3, 1.4, 0.2],
    detail:
      'Senior DevOps / SRE Engineer, the same title the identity card above carries. Platform operations and reliability are the day job, not a side interest.',
  },
  {
    id: 'specialty',
    label: 'Specialty',
    value: 'Sole platform operator',
    color: PALETTE.neonMagenta,
    position: [2.4, 0.3, 0.4],
    detail:
      'One person runs the production platform end to end, rather than one seat on a larger infra team. Build it, run it, fix it.',
  },
  {
    id: 'built',
    label: 'Engineered',
    value: 'Cross-region DR',
    color: PALETTE.neonPurple,
    position: [2.2, -0.7, 0.1],
    detail:
      'Built disaster recovery across two regions, so the platform has somewhere real to fail over to when the primary region goes down.',
  },
  {
    id: 'forte',
    label: 'Forte',
    value: 'Python + AI Agents',
    color: PALETTE.neonCyan,
    position: [-2.3, 1.4, 0.2],
    detail:
      'Python is the primary language, and AI agents are where it gets pointed lately. The forte is the overlap: agents written in Python that do useful work.',
  },
  {
    id: 'lately',
    label: 'Lately',
    value: 'AI agents for DevOps',
    color: PALETTE.neonMagenta,
    position: [-2.4, 0.3, 0.4],
    detail:
      'Recent focus is bringing AI agents into DevOps work itself: agents that handle real operational tasks, not chat demos.',
  },
  {
    id: 'based',
    label: 'Based in',
    value: 'Kathmandu · remote',
    color: PALETTE.neonPurple,
    position: [-2.2, -0.7, 0.1],
    detail:
      'Based in Kathmandu, Nepal, and set up to work remote, same as the identity card says. Open to remote roles.',
  },
];

// -----------------------------------------------------------------------------
// Derived helpers for server-rendered pages
// -----------------------------------------------------------------------------

// All racks are real projects; alias kept so pages can ask the question
// in their own vocabulary.
export function realProjects(): RackData[] {
  return RACKS;
}

// STORIES as an array, in orbit order, with the tool id attached.
export function warStories(): Array<WarStory & { id: ToolId }> {
  return ORBIT_TOOLS.map((id) => ({ id, ...STORIES[id] }));
}

// SKILLS grouped by category, categories in CATEGORY_COLORS order,
// skills in their original SKILLS order within each group.
export function skillsByCategory(): Record<Category, SkillData[]> {
  const grouped = {} as Record<Category, SkillData[]>;
  for (const category of Object.keys(CATEGORY_COLORS) as Category[]) {
    grouped[category] = [];
  }
  for (const skill of SKILLS) {
    grouped[skill.category].push(skill);
  }
  return grouped;
}
