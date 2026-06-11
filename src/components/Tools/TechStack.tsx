'use client';
/* eslint-disable react/no-unescaped-entities */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaDocker, FaAws,
  FaJenkins, FaGithub,
  FaPython,
  FaNetworkWired, FaLock, FaCode,
  FaBook, FaDatabase,
  FaCloud, FaTerminal,
  FaCogs, FaLayerGroup,
  FaSearch, FaThLarge,
  FaExclamationTriangle, FaShieldAlt,
  FaProjectDiagram, FaChartLine,
  FaUserShield
} from 'react-icons/fa';
import {
  SiKubernetes, SiTerraform,
  SiPostgresql, SiAmazonrds,
  SiGitlab, SiGithubactions,
  SiArchlinux, SiUbuntu,
  SiFfmpeg,
  SiElasticsearch,
  SiKibana, SiLogstash, SiAnsible,
  SiPrometheus, SiGrafana,
  SiAmazonroute53,
  SiPytorch,
  SiAwsfargate, SiAwslambda,
  SiRedis, SiAmazondynamodb,
  SiGnubash, SiTypescript,
  SiAwssecretsmanager
} from 'react-icons/si';

// Custom icons for technologies not available in react-icons
const SiLanggraph = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5zM9.5 16.5L4.5 12l5-4.5 1.5 1.5-3.5 3 3.5 3-1.5 1.5zm5 0l-1.5-1.5 3.5-3-3.5-3 1.5-1.5 5 4.5-5 4.5z" />
  </svg>
);

const SiAmazonCodePipeline = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 8h-8v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1z" />
  </svg>
);

interface TechImage {
  id: string;
  name: string;
  category: 'infrastructure' | 'cicd' | 'monitoring' | 'development' | 'security' | 'cloud' | 'database' | 'os' | 'ai-ml' | 'misc';
  icon: React.ReactNode;
  tags: string[];
  experience: number;
  description: string;
  vulnerabilities?: string[];
  isHighlighted?: boolean;
  codeSnippet?: string;
}

const TechStack = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTech, setSelectedTech] = useState<TechImage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'terminal'>('grid');
  
  const techImages: TechImage[] = [
    // Languages
    {
      id: 'python',
      name: 'Python',
      category: 'development',
      icon: <FaPython />,
      tags: ['programming', 'scripting', 'automation', 'web'],
      experience: 5,
      description: 'Default tool for 5+ years. FastAPI, Django, and Flask services, plus the tenant provisioning orchestrator.',
      isHighlighted: true,
    },
    {
      id: 'bash',
      name: 'Bash',
      category: 'development',
      icon: <SiGnubash />,
      tags: ['scripting', 'automation', 'linux'],
      experience: 5,
      description: 'Shell scripting for deploy automation and runbooks.',
    },
    {
      id: 'typescript',
      name: 'JavaScript / TypeScript',
      category: 'development',
      icon: <SiTypescript />,
      tags: ['programming', 'web', 'tooling'],
      experience: 4,
      description: 'Light frontend work, Node tooling, and infra glue. This site is Next.js + TypeScript.',
    },
    // AI/LLM Technologies
    {
      id: 'mcp',
      name: 'Model Context Protocol',
      category: 'ai-ml',
      icon: <FaProjectDiagram />,
      tags: ['ai', 'llm', 'integration', 'protocol'],
      experience: 1,
      description: 'Built an MCP server for Hashnode end to end: tool registration, request handlers, Claude integration.',
      isHighlighted: true,
      codeSnippet: `import { Server } from '@modelcontextprotocol/sdk/server';\n\nconst server = new Server(\n  { name: 'hashnode-mcp', version: '1.0.0' },\n  { capabilities: { tools: {} } }\n);\n\nserver.setRequestHandler(ListToolsRequestSchema, async () => ({\n  tools: [\n    { name: 'publish_article', description: 'Publish a draft to Hashnode' },\n    { name: 'get_articles', description: 'List posts from a publication' },\n  ],\n}));`,
    },
    {
      id: 'langgraph',
      name: 'LangGraph',
      category: 'ai-ml',
      icon: <SiLanggraph />,
      tags: ['ai', 'agents', 'orchestration'],
      experience: 1,
      description: 'Graph-based orchestration for multi-step LLM agent workflows.',
    },
    {
      id: 'local-llm',
      name: 'Local LLM Inference',
      category: 'ai-ml',
      icon: <FaTerminal />,
      tags: ['ai', 'llm', 'self-hosted', 'privacy'],
      experience: 1,
      description: 'Self-hosted models for private inference when the data cannot leave the box.',
    },
    {
      id: 'pytorch',
      name: 'PyTorch',
      category: 'ai-ml',
      icon: <SiPytorch />,
      tags: ['ai', 'deep-learning', 'neural-networks'],
      experience: 2,
      description: 'VQGAN + CLIP experiments and deep learning prototypes.',
    },
    // Cloud Technologies
    {
      id: 'aws',
      name: 'AWS',
      category: 'cloud',
      icon: <FaAws />,
      tags: ['cloud', 'iaas', 'serverless', 'multi-tenant'],
      experience: 4,
      description: 'Sole platform owner of a multi-tenant SaaS running 15+ AWS services in production.',
      isHighlighted: true,
    },
    {
      id: 'ecs-fargate',
      name: 'ECS Fargate',
      category: 'cloud',
      icon: <SiAwsfargate />,
      tags: ['containers', 'serverless', 'aws'],
      experience: 3,
      description: 'Serverless container orchestration. The main SaaS workloads run here.',
      isHighlighted: true,
    },
    {
      id: 'aws-lambda',
      name: 'AWS Lambda',
      category: 'cloud',
      icon: <SiAwslambda />,
      tags: ['serverless', 'functions', 'aws'],
      experience: 4,
      description: 'Serverless functions wired into pipelines and event flows.',
    },
    // Infrastructure Technologies
    {
      id: 'kubernetes',
      name: 'Kubernetes (K3s)',
      category: 'infrastructure',
      icon: <SiKubernetes />,
      tags: ['container-orchestration', 'k3s', 'self-hosted'],
      experience: 3,
      description: 'Self-hosted K3s cluster in eu-central-1 running OneUptime.',
      isHighlighted: true,
      codeSnippet: `# checking on the K3s cluster\nkubectl get nodes -o wide\nkubectl -n oneuptime rollout status deploy/oneuptime\nkubectl -n oneuptime logs deploy/oneuptime --since=15m | grep -i error`,
    },
    {
      id: 'docker',
      name: 'Docker',
      category: 'infrastructure',
      icon: <FaDocker />,
      tags: ['containerization', 'infrastructure', 'devops'],
      experience: 4,
      description: 'Daily driver for every service. Multi-stage builds and image hygiene.',
      isHighlighted: true,
      codeSnippet: `FROM python:3.12-slim AS build\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --prefix=/install -r requirements.txt\n\nFROM python:3.12-slim\nCOPY --from=build /install /usr/local\nCOPY . /app\nCMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]`,
    },
    {
      id: 'terraform',
      name: 'Terraform',
      category: 'infrastructure',
      icon: <SiTerraform />,
      tags: ['iac', 'infrastructure', 'automation'],
      experience: 4,
      description: 'Primary IaC tool: reusable modules, remote state, drift detection across environments.',
      isHighlighted: true,
      codeSnippet: `module "ecs_service" {\n  source = "../../modules/ecs-service"\n\n  name          = "api"\n  cluster_arn   = module.ecs_cluster.arn\n  image         = var.api_image\n  desired_count = 2\n}`,
    },
    {
      id: 'terragrunt',
      name: 'Terragrunt',
      category: 'infrastructure',
      icon: <SiTerraform />,
      tags: ['iac', 'terraform', 'dry'],
      experience: 3,
      description: 'Keeps Terraform DRY across environments: one module tree, thin per-env configs.',
      isHighlighted: true,
      codeSnippet: `# live/prod/eu-central-1/ecs-service/terragrunt.hcl\ninclude "root" {\n  path = find_in_parent_folders()\n}\n\nterraform {\n  source = "../../../../modules//ecs-service"\n}\n\ninputs = {\n  environment = "prod"\n}`,
    },
    {
      id: 'ansible',
      name: 'Ansible',
      category: 'infrastructure',
      icon: <SiAnsible />,
      tags: ['configuration-management', 'automation', 'iac'],
      experience: 4,
      description: 'Config management. Split-restart playbooks for the self-managed Elasticsearch cluster.',
    },
    {
      id: 'route53',
      name: 'Route 53',
      category: 'infrastructure',
      icon: <SiAmazonroute53 />,
      tags: ['networking', 'dns', 'aws'],
      experience: 4,
      description: 'DNS for multi-tenant routing.',
    },
    // CI/CD
    {
      id: 'gitlab-ci',
      name: 'GitLab CI',
      category: 'cicd',
      icon: <SiGitlab />,
      tags: ['ci-cd', 'automation', 'pipeline'],
      experience: 4,
      description: 'Primary pipeline platform for app and infra deploys.',
      isHighlighted: true,
    },
    {
      id: 'jenkins',
      name: 'Jenkins',
      category: 'cicd',
      icon: <FaJenkins />,
      tags: ['ci-cd', 'automation', 'pipeline'],
      experience: 4,
      description: 'Long-running automation server driving ECS, Lambda, and EC2 deploys.',
    },
    {
      id: 'aws-codepipeline',
      name: 'AWS CodePipeline',
      category: 'cicd',
      icon: <SiAmazonCodePipeline />,
      tags: ['aws', 'ci-cd', 'automation', 'devops'],
      experience: 3,
      description: 'AWS-native release pipelines paired with CodeBuild.',
    },
    {
      id: 'github-actions',
      name: 'GitHub Actions',
      category: 'cicd',
      icon: <SiGithubactions />,
      tags: ['ci-cd', 'automation', 'github'],
      experience: 3,
      description: 'Workflows that live next to the code, including the deploy for this site.',
    },
    // Databases
    {
      id: 'aurora-postgresql',
      name: 'Aurora PostgreSQL',
      category: 'database',
      icon: <SiAmazonrds />,
      tags: ['database', 'aws', 'multi-region'],
      experience: 3,
      description: 'Schema-per-tenant Aurora with a multi-region Global Database for disaster recovery.',
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      category: 'database',
      icon: <SiPostgresql />,
      tags: ['database', 'sql', 'relational'],
      experience: 4,
      description: 'The default relational store. EXPLAIN plans, indexing, replication.',
    },
    {
      id: 'redis',
      name: 'Redis / ElastiCache',
      category: 'database',
      icon: <SiRedis />,
      tags: ['cache', 'database', 'aws'],
      experience: 3,
      description: 'Caching, rate limits, ephemeral state. Connection-pool tuning resolved a 19-minute production outage.',
    },
    {
      id: 'dynamodb',
      name: 'DynamoDB',
      category: 'database',
      icon: <SiAmazondynamodb />,
      tags: ['database', 'nosql', 'aws'],
      experience: 3,
      description: 'Tenant registry and key-value lookups on hot paths.',
    },
    // Operating Systems
    {
      id: 'arch-linux',
      name: 'Arch Linux',
      category: 'os',
      icon: <SiArchlinux />,
      tags: ['linux', 'os', 'rolling-release'],
      experience: 5,
      description: 'Daily driver for 5+ years. Rolling release, KISS.',
      isHighlighted: true,
      codeSnippet: `# the daily ritual\nsudo pacman -Syu`,
    },
    {
      id: 'ubuntu',
      name: 'Ubuntu',
      category: 'os',
      icon: <SiUbuntu />,
      tags: ['linux', 'os', 'debian-based'],
      experience: 6,
      description: 'Production servers and the default container base image.',
    },
    // Misc Tools
    {
      id: 'ffmpeg',
      name: 'FFmpeg',
      category: 'misc',
      icon: <SiFfmpeg />,
      tags: ['multimedia', 'streaming', 'video-processing'],
      experience: 2,
      description: 'RTSP camera streams, NVR storage, and video processing pipelines.',
    },
    // Monitoring & Observability
    {
      id: 'prometheus',
      name: 'Prometheus',
      category: 'monitoring',
      icon: <SiPrometheus />,
      tags: ['metrics', 'monitoring', 'alerting', 'time-series'],
      experience: 3,
      description: 'Metrics collection, PromQL, and alerting rules.',
    },
    {
      id: 'grafana',
      name: 'Grafana',
      category: 'monitoring',
      icon: <SiGrafana />,
      tags: ['visualization', 'dashboards', 'monitoring'],
      experience: 3,
      description: 'Dashboards pulling from Prometheus, Loki, and CloudWatch.',
    },
    {
      id: 'elk-stack',
      name: 'ELK Stack',
      category: 'monitoring',
      icon: <SiElasticsearch />,
      tags: ['log-management', 'search', 'analytics', 'monitoring'],
      experience: 4,
      description: 'Self-managed three-node Elasticsearch, Logstash, and Kibana for log management.',
    },
    {
      id: 'elasticsearch',
      name: 'Elasticsearch',
      category: 'monitoring',
      icon: <SiElasticsearch />,
      tags: ['search', 'analytics', 'distributed'],
      experience: 4,
      description: 'Self-managed cluster, upgraded with split-restart rollouts to keep ingest alive.',
    },
    {
      id: 'kibana',
      name: 'Kibana',
      category: 'monitoring',
      icon: <SiKibana />,
      tags: ['visualization', 'dashboards', 'elk'],
      experience: 4,
      description: 'Log exploration and dashboards on the self-managed cluster.',
    },
    {
      id: 'logstash',
      name: 'Logstash',
      category: 'monitoring',
      icon: <SiLogstash />,
      tags: ['data-processing', 'pipeline', 'elk'],
      experience: 3,
      description: 'Ingest pipelines feeding the self-managed Elasticsearch cluster.',
    },
    // Security
    {
      id: 'aws-iam',
      name: 'AWS IAM',
      category: 'security',
      icon: <FaUserShield />,
      tags: ['aws', 'identity', 'access-management', 'security'],
      experience: 4,
      description: 'Roles, fine-grained policies, and cross-account access for the whole platform.',
      isHighlighted: true,
    },
    {
      id: 'aws-kms',
      name: 'AWS KMS',
      category: 'security',
      icon: <FaLock />,
      tags: ['aws', 'encryption', 'security'],
      experience: 4,
      description: 'Shared KMS keys enabling cross-region disaster recovery.',
    },
    {
      id: 'secrets-manager',
      name: 'Secrets Manager',
      category: 'security',
      icon: <SiAwssecretsmanager />,
      tags: ['aws', 'secrets', 'security'],
      experience: 3,
      description: 'Secret rotation and secure injection into ECS tasks.',
    },
    {
      id: 'cloudtrail',
      name: 'CloudTrail',
      category: 'security',
      icon: <FaSearch />,
      tags: ['aws', 'audit', 'security'],
      experience: 4,
      description: 'API audit trail with multi-account aggregation.',
    },
  ];
  
  const categories = [
    { id: 'all', name: 'All', icon: <FaDocker /> },
    { id: 'infrastructure', name: 'Infrastructure', icon: <FaNetworkWired /> },
    { id: 'cloud', name: 'Cloud', icon: <FaCloud /> },
    { id: 'cicd', name: 'CI/CD', icon: <FaGithub /> },
    { id: 'monitoring', name: 'Monitoring', icon: <FaChartLine /> },
    { id: 'development', name: 'Development', icon: <FaCode /> },
    { id: 'database', name: 'Databases', icon: <FaDatabase /> },
    { id: 'os', name: 'Operating Systems', icon: <FaTerminal /> },
    { id: 'ai-ml', name: 'AI & ML', icon: <FaCogs /> },
    { id: 'misc', name: 'Misc Tools', icon: <FaLayerGroup /> },
    { id: 'security', name: 'Security', icon: <FaLock /> },
  ].filter(category => category.id === 'all' || techImages.some(tech => tech.category === category.id));
  
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
          Docker-style &quot;images&quot; of the tools I actually run, in production and on my own machines.
        </p>
      </div>
      
      {/* Search, Filter and View Toggle */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
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
        
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <button
              className={`px-3 py-2 rounded-md flex items-center space-x-1 ${
                viewMode === 'grid' 
                  ? 'bg-blue-700 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <span><FaThLarge /></span>
              <span>Grid</span>
            </button>
            <button
              className={`px-3 py-2 rounded-md flex items-center space-x-1 ${
                viewMode === 'terminal' 
                  ? 'bg-purple-700 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setViewMode('terminal')}
            >
              <span><FaTerminal /></span>
              <span>Terminal</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Categories */}
      <div className="mb-6 flex flex-wrap gap-2 pb-2">
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
      
      {/* Tech Grid or Terminal View */}
      {!selectedTech && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredTech.map(tech => (
            <motion.div
              key={tech.id}
              className={`bg-gray-800 border ${tech.isHighlighted ? 'border-blue-500' : 'border-gray-700'} rounded-lg overflow-hidden cursor-pointer`}
              whileHover={{ scale: 1.02, boxShadow: tech.isHighlighted ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 4px 6px rgba(0, 255, 0, 0.1)' }}
              onClick={() => handleTechClick(tech)}
            >
              <div className={`p-4 border-b ${tech.isHighlighted ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700'} flex justify-between items-center`}>
                <div className="flex items-center">
                  <div className={`${tech.isHighlighted ? 'text-blue-400' : 'text-blue-400'} mr-2 text-xl`}>
                    {tech.icon}
                  </div>
                  <div>
                    <h3 className={`font-mono ${tech.isHighlighted ? 'text-blue-400' : 'text-green-400'}`}>{tech.name}</h3>
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
                    <span key={i} className={`text-xs ${tech.isHighlighted ? 'bg-blue-900/50 text-blue-200' : 'bg-gray-700 text-gray-300'} px-2 py-1 rounded`}>
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-end text-xs text-gray-400">
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
      
      {/* Terminal View */}
      {!selectedTech && viewMode === 'terminal' && (
        <div className="bg-black rounded-lg border border-green-500 p-4 font-mono text-sm">
          <div className="mb-4 flex items-center">
            <div className="mr-2 text-red-500">●</div>
            <div className="mr-2 text-yellow-500">●</div>
            <div className="mr-2 text-green-500">●</div>
            <div className="flex-1 text-center text-gray-500 text-xs">bash - 80x24</div>
          </div>
          
          <div className="text-green-500 mb-2">[user@server ~]$ ls -la tech/</div>
          
          <div className="mb-4">
            {filteredTech.map(tech => (
              <div 
                key={tech.id} 
                className="flex cursor-pointer hover:bg-gray-900 p-1"
                onClick={() => handleTechClick(tech)}
              >
                <span className="text-blue-400 w-8">{tech.icon}</span>
                <span className={`w-32 ${tech.isHighlighted ? 'text-blue-400' : 'text-green-400'}`}>{tech.name}</span>
                <span className="text-yellow-500 w-16">{tech.experience}+ yrs</span>
                <span className="text-gray-400 flex-1 truncate">{tech.tags.join(', ')}</span>
              </div>
            ))}
          </div>
          
          <div className="text-green-500 mb-2">[user@server ~]$ cat /etc/motd</div>
          <div className="text-cyan-400 mb-4">
            Welcome to Sagar Budhathoki's Tech Registry.<br/>
            Explore my skills and experience using the commands above.<br/>
            Type 'help' for more information or click on any technology to view details.
          </div>
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
            
            {selectedTech.codeSnippet && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-blue-400 mb-2">Code Snippet</h4>
                <div className="bg-gray-900 p-4 rounded-md font-mono text-sm text-blue-300 overflow-x-auto">
                  {selectedTech.codeSnippet.split('\n').map((line, i) => (
                    <div key={i} className="whitespace-pre">{line}</div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-green-400 mb-2">Experience</h4>
              <div className="bg-gray-700 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <div className="text-gray-300">Years of Experience</div>
                  <div className="font-mono text-xl">{selectedTech.experience}+</div>
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
            
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
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

export default TechStack;
