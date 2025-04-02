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
  FaSearch, FaThLarge, FaDownload,
  FaExclamationTriangle, FaShieldAlt,
  FaProjectDiagram, FaChartLine
} from 'react-icons/fa';
import { 
  SiKubernetes, SiTerraform, 
  SiPostgresql, SiAmazonrds,
  SiGitlab, SiGithubactions,
  SiArchlinux, SiUbuntu, SiCentos,
  SiHeroku, SiFfmpeg,
  SiElasticsearch,
  SiKibana, SiLogstash, SiAnsible,
  SiPrometheus, SiGrafana, SiIstio,
  SiAmazonroute53, SiOpenai,
  SiPytorch
} from 'react-icons/si';
import {
  FaUserShield, FaRadiation
} from 'react-icons/fa';

// Custom icons for technologies not available in react-icons
const SiLangchain = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5zM9.5 16.5L4.5 12l5-4.5 1.5 1.5-3.5 3 3.5 3-1.5 1.5zm5 0l-1.5-1.5 3.5-3-3.5-3 1.5-1.5 5 4.5-5 4.5z" />
  </svg>
);

const SiHuggingface = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9.5c0 .83-.67 1.5-1.5 1.5S7 11.33 7 10.5 7.67 9 8.5 9s1.5.67 1.5 1.5zm5 0c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zM12 14c-1.66 0-3 1.34-3 3h6c0-1.66-1.34-3-3-3z" />
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
  pullCount: number;
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
      experience: 6,
      description: 'High-level programming language known for its readability and versatility.',
      pullCount: 2900,
      isHighlighted: true,
      codeSnippet: `def hello_world():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    hello_world()`,
    },
    // AI/LLM Technologies
    {
      id: 'openai',
      name: 'OpenAI API',
      category: 'ai-ml',
      icon: <SiOpenai />,
      tags: ['ai', 'llm', 'gpt', 'api'],
      experience: 2,
      description: 'API for accessing OpenAI&apos;s large language models like GPT-4 for natural language processing and generation.',
      pullCount: 1800,
      isHighlighted: true,
      codeSnippet: `import openai\n\nopenai.api_key = os.getenv("OPENAI_API_KEY")\n\nresponse = openai.ChatCompletion.create(\n  model="gpt-4",\n  messages=[\n    {"role": "system", "content": "You are a helpful assistant."},\n    {"role": "user", "content": "Hello, world!"}\n  ]\n)`,
    },
    {
      id: 'huggingface',
      name: 'Hugging Face',
      category: 'ai-ml',
      icon: <SiHuggingface />,
      tags: ['ai', 'llm', 'transformers', 'nlp'],
      experience: 1,
      description: 'Platform for building, training and deploying state-of-the-art machine learning models.',
      pullCount: 1600,
      codeSnippet: `from transformers import pipeline\n\nclassifier = pipeline("sentiment-analysis")\nresult = classifier("I love working with transformers!")[0]\nprint(f"label: {result[&apos;label&apos;]}, score: {round(result[&apos;score&apos;], 4)}")`,
    },
    {
      id: 'langchain',
      name: 'LangChain',
      category: 'ai-ml',
      icon: <SiLangchain />,
      tags: ['ai', 'llm', 'agents', 'rag'],
      experience: 1,
      description: 'Framework for developing applications powered by language models through composability.',
      pullCount: 1500,
      codeSnippet: `from langchain.llms import OpenAI\nfrom langchain.chains import LLMChain\nfrom langchain.prompts import PromptTemplate\n\nllm = OpenAI(temperature=0.9)\nprompt = PromptTemplate(input_variables=["product"], template="What is a good name for a company that makes {product}?")\nchain = LLMChain(llm=llm, prompt=prompt)\n\nprint(chain.run("eco-friendly water bottles"))`,
    },
    {
      id: 'pytorch',
      name: 'PyTorch',
      category: 'ai-ml',
      icon: <SiPytorch />,
      tags: ['ai', 'deep-learning', 'neural-networks'],
      experience: 2,
      description: 'Open source machine learning framework that accelerates the path from research prototyping to production deployment.',
      pullCount: 2100,
      codeSnippet: `import torch\nimport torch.nn as nn\n\nclass SimpleNN(nn.Module):\n    def __init__(self):\n        super(SimpleNN, self).__init__()\n        self.linear = nn.Linear(10, 1)\n        \n    def forward(self, x):\n        return torch.sigmoid(self.linear(x))\n\nmodel = SimpleNN()`,
    },
    {
      id: 'mcp',
      name: 'Model Context Protocol',
      category: 'ai-ml',
      icon: <FaProjectDiagram />,
      tags: ['ai', 'llm', 'integration', 'protocol'],
      experience: 1,
      description: 'Protocol for integrating AI models with external tools, data sources, and capabilities.',
      pullCount: 1200,
      codeSnippet: `import { Server } from '@modelcontextprotocol/sdk/server';\n\nconst server = new Server(\n  { name: 'weather-server', version: '0.1.0' },\n  { capabilities: { tools: {}, resources: {} } }\n);\n\nserver.setRequestHandler(ListToolsRequestSchema, async () => ({\n  tools: [{ name: 'get_weather', description: 'Get weather for a location' }]\n}));`,
    },
    // Cloud Technologies
    {
      id: 'aws',
      name: 'Amazon Web Services',
      category: 'cloud',
      icon: <FaAws />,
      tags: ['cloud', 'iaas', 'paas', 'serverless'],
      experience: 4,
      description: 'Comprehensive cloud computing platform offering over 200 fully featured services from data centers globally.',
      pullCount: 3000,
      isHighlighted: true,
      codeSnippet: `// AWS SDK for JavaScript example\nimport { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";\n\nconst client = new S3Client({ region: "us-west-2" });\nconst command = new PutObjectCommand({\n  Bucket: "my-bucket",\n  Key: "my-file.txt",\n  Body: "Hello S3!"\n});\n\nawait client.send(command);`,
    },
    {
      id: 'azure',
      name: 'Microsoft Azure',
      category: 'cloud',
      icon: <FaCloud />,
      tags: ['cloud', 'iaas', 'paas', 'microsoft'],
      experience: 3,
      description: 'Microsoft&apos;s cloud computing platform providing a range of cloud services including compute, analytics, storage, and networking.',
      pullCount: 2500,
      codeSnippet: `// Azure SDK for JavaScript example\nimport { BlobServiceClient } from "@azure/storage-blob";\n\nconst blobServiceClient = BlobServiceClient.fromConnectionString(\n  "DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=mykey;EndpointSuffix=core.windows.net"\n);\nconst containerClient = blobServiceClient.getContainerClient("my-container");\nconst blockBlobClient = containerClient.getBlockBlobClient("my-blob.txt");\n\nawait blockBlobClient.upload("Hello Azure!", Buffer.byteLength("Hello Azure!"));`,
    },
    {
      id: 'aws-rds',
      name: 'AWS RDS',
      category: 'database',
      icon: <SiAmazonrds />,
      tags: ['database', 'cloud', 'managed-service'],
      experience: 3,
      description: 'Managed relational database service that makes it easy to set up, operate, and scale a database in the cloud.',
      pullCount: 2200,
    },
    {
      id: 'heroku',
      name: 'Heroku',
      category: 'cloud',
      icon: <SiHeroku />,
      tags: ['paas', 'deployment', 'cloud'],
      experience: 2,
      description: 'Platform as a service (PaaS) that enables developers to build, run, and operate applications entirely in the cloud.',
      pullCount: 1800,
    },
    // Infrastructure Technologies
    {
      id: 'kubernetes',
      name: 'Kubernetes',
      category: 'infrastructure',
      icon: <SiKubernetes />,
      tags: ['container-orchestration', 'infrastructure', 'cloud-native'],
      experience: 3,
      description: 'Container orchestration platform for automating deployment, scaling, and management of containerized applications.',
      pullCount: 2500,
      isHighlighted: true,
      codeSnippet: `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: nginx-deployment\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: nginx`,
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
      isHighlighted: true,
      codeSnippet: `FROM python:3.9-slim\n\nWORKDIR /app\nCOPY . .\nRUN pip install -r requirements.txt\n\nCMD ["python", "app.py"]`,
    },
    {
      id: 'terraform',
      name: 'Terraform',
      category: 'infrastructure',
      icon: <SiTerraform />,
      tags: ['iac', 'infrastructure', 'automation'],
      experience: 4,
      description: 'Infrastructure as Code tool for building, changing, and versioning infrastructure safely and efficiently.',
      pullCount: 2100,
      isHighlighted: true,
      codeSnippet: `provider "aws" {\n  region = "us-west-2"\n}\n\nresource "aws_instance" "example" {\n  ami           = "ami-0c55b159cbfafe1f0"\n  instance_type = "t2.micro"\n}`,
    },
    // CI/CD
    {
      id: 'aws-codepipeline',
      name: 'AWS CodePipeline',
      category: 'cicd',
      icon: <SiAmazonCodePipeline />,
      tags: ['aws', 'ci-cd', 'automation', 'devops'],
      experience: 3,
      description: 'Fully managed continuous delivery service that helps automate release pipelines for fast and reliable application updates.',
      pullCount: 1900,
      codeSnippet: `{\n  "pipeline": {\n    "name": "MyPipeline",\n    "roleArn": "arn:aws:iam::123456789012:role/service-role/AmazonCodePipeline-ServiceRole",\n    "stages": [\n      {\n        "name": "Source",\n        "actions": []\n      },\n      {\n        "name": "Build",\n        "actions": []\n      }\n    ]\n  }\n}`,
    },
    {
      id: 'gitlab-ci',
      name: 'GitLab CI',
      category: 'cicd',
      icon: <SiGitlab />,
      tags: ['ci-cd', 'automation', 'pipeline'],
      experience: 3,
      description: 'Continuous Integration service integrated with GitLab for automating builds, tests, and deployments.',
      pullCount: 1900,
      codeSnippet: `stages:\n  - build\n  - test\n  - deploy\n\nbuild_job:\n  stage: build\n  script:\n    - echo "Building the app"`,
    },
    {
      id: 'jenkins',
      name: 'Jenkins',
      category: 'cicd',
      icon: <FaJenkins />,
      tags: ['ci-cd', 'automation', 'pipeline'],
      experience: 2,
      description: 'Open-source automation server for building, testing, and deploying code.',
      pullCount: 1800,
    },
    {
      id: 'github-actions',
      name: 'GitHub Actions',
      category: 'cicd',
      icon: <SiGithubactions />,
      tags: ['ci-cd', 'automation', 'github'],
      experience: 3,
      description: 'CI/CD platform integrated with GitHub repositories.',
      pullCount: 1500,
      codeSnippet: `name: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v2\n      - run: npm ci\n      - run: npm test`,
    },
    // Databases
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      category: 'database',
      icon: <SiPostgresql />,
      tags: ['database', 'sql', 'relational'],
      experience: 4,
      description: 'Powerful, open-source object-relational database system with a strong reputation for reliability and data integrity.',
      pullCount: 2300,
      codeSnippet: `CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  username VARCHAR(50) UNIQUE NOT NULL,\n  email VARCHAR(100) UNIQUE NOT NULL\n);`,
    },
    // Operating Systems
    {
      id: 'arch-linux',
      name: 'Arch Linux',
      category: 'os',
      icon: <SiArchlinux />,
      tags: ['linux', 'os', 'rolling-release'],
      experience: 5,
      description: 'Lightweight and flexible Linux distribution that aims to Keep It Simple.',
      pullCount: 2000,
      isHighlighted: true,
      codeSnippet: `# Arch Linux package installation\npacman -S nginx postgresql docker`,
    },
    {
      id: 'ubuntu',
      name: 'Ubuntu',
      category: 'os',
      icon: <SiUbuntu />,
      tags: ['linux', 'os', 'debian-based'],
      experience: 6,
      description: 'Popular Linux distribution based on Debian, focused on ease of use and regular releases.',
      pullCount: 2800,
    },
    {
      id: 'centos',
      name: 'CentOS',
      category: 'os',
      icon: <SiCentos />,
      tags: ['linux', 'os', 'rhel-based'],
      experience: 4,
      description: 'Community-driven free software effort focused on delivering a robust open source ecosystem around a Linux platform.',
      pullCount: 1900,
    },
    // Misc Tools
    {
      id: 'ffmpeg',
      name: 'FFmpeg/LIVE555',
      category: 'misc',
      icon: <SiFfmpeg />,
      tags: ['multimedia', 'streaming', 'video-processing'],
      experience: 2,
      description: 'Complete, cross-platform solution to record, convert and stream audio and video.',
      pullCount: 1500,
    },
    // ELK Stack
    {
      id: 'elk-stack',
      name: 'ELK Stack',
      category: 'monitoring',
      icon: <SiElasticsearch />,
      tags: ['log-management', 'search', 'analytics', 'monitoring'],
      experience: 4,
      description: 'Comprehensive log management and analytics platform combining Elasticsearch, Logstash, and Kibana.',
      pullCount: 2200,
      codeSnippet: `# Elasticsearch query\nGET /logs/_search\n{\n  "query": {\n    "match": {\n      "status": "error"\n    }\n  }\n}`,
    },
    {
      id: 'elasticsearch',
      name: 'Elasticsearch',
      category: 'monitoring',
      icon: <SiElasticsearch />,
      tags: ['search', 'analytics', 'database', 'distributed'],
      experience: 4,
      description: 'Distributed, RESTful search and analytics engine capable of addressing a growing number of use cases.',
      pullCount: 2100,
    },
    {
      id: 'kibana',
      name: 'Kibana',
      category: 'monitoring',
      icon: <SiKibana />,
      tags: ['visualization', 'dashboards', 'analytics', 'elk'],
      experience: 4,
      description: 'Data visualization dashboard software for Elasticsearch that provides visualization capabilities on top of content indexed on an Elasticsearch cluster.',
      pullCount: 1900,
    },
    {
      id: 'logstash',
      name: 'Logstash',
      category: 'monitoring',
      icon: <SiLogstash />,
      tags: ['data-processing', 'pipeline', 'etl', 'elk'],
      experience: 3,
      description: 'Server-side data processing pipeline that ingests data from multiple sources, transforms it, and then sends it to a &quot;stash&quot; like Elasticsearch.',
      pullCount: 1800,
    },
    // DNS Systems
    {
      id: 'dns-management',
      name: 'DNS Management',
      category: 'infrastructure',
      icon: <SiAmazonroute53 />,
      tags: ['networking', 'domain', 'route53', 'dns'],
      experience: 5,
      description: 'Domain Name System services and management, including AWS Route53 and other DNS providers.',
      pullCount: 2300,
    },
    
    // AWS Security Services
    {
      id: 'aws-iam',
      name: 'AWS IAM',
      category: 'security',
      icon: <FaUserShield />,
      tags: ['aws', 'identity', 'access-management', 'security'],
      experience: 5,
      description: 'AWS Identity and Access Management for secure resource access control and permission management.',
      pullCount: 2400,
      codeSnippet: `{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Action": "s3:ListBucket",\n      "Resource": "arn:aws:s3:::example-bucket"\n    }\n  ]\n}`,
    },
    {
      id: 'aws-waf-shield',
      name: 'AWS WAF & Shield',
      category: 'security',
      icon: <FaShieldAlt />,
      tags: ['aws', 'firewall', 'ddos-protection', 'security'],
      experience: 3,
      description: 'Web Application Firewall and DDoS protection services for securing applications and APIs.',
      pullCount: 1700,
    },
    {
      id: 'aws-guardduty',
      name: 'AWS GuardDuty',
      category: 'security',
      icon: <FaRadiation />,
      tags: ['aws', 'threat-detection', 'monitoring', 'security'],
      experience: 3,
      description: 'Intelligent threat detection service that continuously monitors for malicious activity and unauthorized behavior.',
      pullCount: 1600,
    },
    
    // Additional DevOps Tools
    {
      id: 'ansible',
      name: 'Ansible',
      category: 'infrastructure',
      icon: <SiAnsible />,
      tags: ['configuration-management', 'automation', 'iac'],
      experience: 4,
      description: 'Simple, agentless IT automation platform for application deployment and configuration management.',
      pullCount: 2200,
      codeSnippet: `---\n- name: Install and configure web server\n  hosts: webservers\n  tasks:\n    - name: Install nginx\n      apt:\n        name: nginx\n        state: present\n    - name: Start nginx\n      service:\n        name: nginx\n        state: started`,
    },
    {
      id: 'prometheus',
      name: 'Prometheus',
      category: 'monitoring',
      icon: <SiPrometheus />,
      tags: ['metrics', 'monitoring', 'alerting', 'time-series'],
      experience: 3,
      description: 'Open-source systems monitoring and alerting toolkit with a dimensional data model and powerful query language.',
      pullCount: 1900,
    },
    {
      id: 'grafana',
      name: 'Grafana',
      category: 'monitoring',
      icon: <SiGrafana />,
      tags: ['visualization', 'dashboards', 'monitoring'],
      experience: 3,
      description: 'Open-source platform for monitoring and observability with beautiful dashboards.',
      pullCount: 1700,
    },
    {
      id: 'istio',
      name: 'Istio',
      category: 'infrastructure',
      icon: <SiIstio />,
      tags: ['service-mesh', 'microservices', 'traffic-management'],
      experience: 2,
      description: 'Service mesh platform that provides traffic management, security, and observability for microservices architectures.',
      pullCount: 1500,
      codeSnippet: `apiVersion: networking.istio.io/v1alpha3\nkind: VirtualService\nmetadata:\n  name: reviews\nspec:\n  hosts:\n  - reviews\n  http:\n  - route:\n    - destination:\n        host: reviews\n        subset: v1\n      weight: 75\n    - destination:\n        host: reviews\n        subset: v2\n      weight: 25`,
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
      
      {/* Search, Filter and View Toggle */}
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
      <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

export default TechStack;
