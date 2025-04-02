import { asciiArt } from './ascii';

// Command history for persistence
const commandHistory: string[] = [];

// Helper functions for visualizations
function generateBar(percentage: number): string {
  const width = 20;
  const filledChars = Math.floor((percentage / 100) * width);
  return '█'.repeat(filledChars) + '░'.repeat(width - filledChars);
}

function generateSparkline(): string {
  const values = [];
  // Generate random values with a slight trend
  let value = 50 + Math.random() * 20;
  for (let i = 0; i < 24; i++) {
    value = Math.max(10, Math.min(90, value + (Math.random() * 20 - 10)));
    values.push(value);
  }
  
  // Map values to sparkline characters
  const chars = '▁▂▃▄▅▆▇█';
  return values.map(v => {
    const index = Math.floor((v / 100) * (chars.length - 1));
    return chars[index];
  }).join('');
}

// Available commands
const commands: Record<string, (args: string[]) => string> = {
  help: () => {
    return `
\x1b[1;32m=== AVAILABLE COMMANDS ===\x1b[0m

\x1b[1;33mCore Commands:\x1b[0m
  \x1b[1;36mhelp\x1b[0m                 Show this help message
  \x1b[1;36mclear\x1b[0m                Clear the terminal
  \x1b[1;36mhistory\x1b[0m              Show command history
  \x1b[1;36mexit\x1b[0m                 Exit terminal mode (switch to GUI)

\x1b[1;33mProfile Commands:\x1b[0m
  \x1b[1;36mabout\x1b[0m                Show information about me
  \x1b[1;36mwhois\x1b[0m                Who am I?
  \x1b[1;36muptime\x1b[0m               Show my experience uptime
  \x1b[1;36mcontact\x1b[0m              Show contact information
  \x1b[1;36mskills\x1b[0m               Show my technical skills
  \x1b[1;36mprojects\x1b[0m             List my projects

\x1b[1;33mDevOps Commands:\x1b[0m
  \x1b[1;36mdeploy [project]\x1b[0m     Deploy a project (simulation)
  \x1b[1;36mmonitor [service]\x1b[0m    Monitor a service (simulation)
  \x1b[1;36mincident [id]\x1b[0m        View incident reports
  \x1b[1;36mchaos [target]\x1b[0m       Trigger chaos monkey (simulation)
  \x1b[1;36mtrace [request]\x1b[0m      Trace a request through the system
  \x1b[1;36mscale [service] [n]\x1b[0m  Scale a service (simulation)

\x1b[1;33mContent Commands:\x1b[0m
  \x1b[1;36mblog [id]\x1b[0m            Access my tech blog/runbooks
  \x1b[1;36mtools [id]\x1b[0m           Show my DevOps tools
  \x1b[1;36minfra\x1b[0m                View infrastructure diagram

\x1b[1;33mFun Commands:\x1b[0m
  \x1b[1;36msudo [command]\x1b[0m       Try it and see what happens
  \x1b[1;36mcoffee\x1b[0m               Get a virtual coffee
  \x1b[1;36mascii [name]\x1b[0m         Show ASCII art
  \x1b[1;36mfortune\x1b[0m              Get a random DevOps fortune
`;
  },
  
  clear: () => {
    return '\x1b[2J\x1b[3J\x1b[H';
  },
  
  about: () => {
    return `
\x1b[1;32m=== SYSTEM INFORMATION ===\x1b[0m

\x1b[1;36mName:\x1b[0m Sagar Budhathoki
\x1b[1;36mRole:\x1b[0m Infrastructure Architect & SRE, Python Web Developer, AI Engineer
\x1b[1;36mUptime:\x1b[0m 99.99% (4+ years in production)
\x1b[1;36mKernel:\x1b[0m Human v3.7.2
\x1b[1;36mShell:\x1b[0m Bash/Zsh with custom aliases
\x1b[1;36mPackages:\x1b[0m 150+ technologies integrated
\x1b[1;36mProcesses:\x1b[0m Multithreaded problem-solving
\x1b[1;36mMemory:\x1b[0m 128TB of technical knowledge
\x1b[1;36mSwap:\x1b[0m Coffee-powered memory extension

Type 'skills' to see my technical stack.
Type 'projects' to see my work.
`;
  },
  
  projects: () => {
    return `
\x1b[1;32m=== PRODUCTION ENVIRONMENT ===\x1b[0m

\x1b[1;33m[1] Kubernetes Cluster Automation\x1b[0m
    \x1b[1;36mNamespace:\x1b[0m Infrastructure
    \x1b[1;36mTech:\x1b[0m Kubernetes, Terraform, ArgoCD, Helm
    \x1b[1;36mStatus:\x1b[0m Running (99.99% uptime)
    \x1b[1;36mDescription:\x1b[0m Automated cluster provisioning and management

\x1b[1;33m[2] CI/CD Pipeline Overhaul\x1b[0m
    \x1b[1;36mNamespace:\x1b[0m DevOps
    \x1b[1;36mTech:\x1b[0m GitHub Actions, Jenkins, Docker
    \x1b[1;36mStatus:\x1b[0m Running (98.5% success rate)
    \x1b[1;36mDescription:\x1b[0m Reduced deployment time by 75%

\x1b[1;33m[3] Monitoring & Alerting System\x1b[0m
    \x1b[1;36mNamespace:\x1b[0m Observability
    \x1b[1;36mTech:\x1b[0m Prometheus, Grafana, AlertManager
    \x1b[1;36mStatus:\x1b[0m Running (1.2M metrics collected)
    \x1b[1;36mDescription:\x1b[0m Complete observability platform

\x1b[1;33m[4] Infrastructure as Code Framework\x1b[0m
    \x1b[1;36mNamespace:\x1b[0m Infrastructure
    \x1b[1;36mTech:\x1b[0m Terraform, Pulumi, AWS CDK
    \x1b[1;36mStatus:\x1b[0m Running (100% infrastructure coverage)
    \x1b[1;36mDescription:\x1b[0m Modular, reusable infrastructure components

\x1b[1;33m[5] Enterprise API Platform\x1b[0m
    \x1b[1;36mNamespace:\x1b[0m Development
    \x1b[1;36mTech:\x1b[0m Python, Django, FastAPI, PostgreSQL
    \x1b[1;36mStatus:\x1b[0m Running (99.95% uptime)
    \x1b[1;36mDescription:\x1b[0m Scalable API platform serving 10M+ requests daily

Type 'deploy [number]' to see deployment details.
`;
  },
  
  skills: () => {
    return `
\x1b[1;32m=== PACKAGE REGISTRY ===\x1b[0m

\x1b[1;33mInfrastructure:\x1b[0m
  • AWS, GCP, Azure (Multi-cloud architecture)
  • Kubernetes, Docker, Containerd
  • Terraform, CloudFormation, Pulumi
  • Linux System Administration

\x1b[1;33mCI/CD & Automation:\x1b[0m
  • GitHub Actions, Jenkins, CircleCI
  • ArgoCD, Flux, Spinnaker
  • Bash, Python, Go scripting
  • GitOps workflows

\x1b[1;33mMonitoring & Observability:\x1b[0m
  • Prometheus, Grafana, Datadog
  • ELK Stack, Loki, Jaeger
  • SLOs, SLIs, Error Budgets
  • Incident Response

\x1b[1;33mSecurity:\x1b[0m
  • Infrastructure Security
  • Secret Management (Vault, AWS KMS)
  • Compliance Automation
  • Vulnerability Scanning

\x1b[1;33mPython Web Development:\x1b[0m
  • Django (Full-stack web framework)
  • FastAPI (Modern, high-performance APIs)
  • Flask (Lightweight web applications)
  • RESTful API design and implementation
  • Database ORM (SQLAlchemy, Django ORM)

\x1b[1;33mAI & Machine Learning:\x1b[0m
  • AI Agents & MCP Technologies
  • LLM Integration & Prompt Engineering
  • Automation with AI capabilities
  • Python ML libraries & frameworks

\x1b[1;33mFrontend Development:\x1b[0m
  • React, Next.js, TypeScript
  • Modern JavaScript frameworks
  • Responsive web design
  • UI/UX implementation
`;
  },
  
  contact: () => {
    return `
\x1b[1;32m=== CONNECTION DETAILS ===\x1b[0m

\x1b[1;36mName:\x1b[0m Sagar Budhathoki
\x1b[1;36mEmail:\x1b[0m mail@budhathokisagar.com.np
\x1b[1;36mGitHub:\x1b[0m github.com/sbmagar13
\x1b[1;36mLinkedIn:\x1b[0m linkedin.com/in/sbmagar13
\x1b[1;36mTwitter:\x1b[0m twitter.com/S_agarM_agar

\x1b[1;33mPreferred Communication Protocol:\x1b[0m
SSH into my inbox with a clear subject line and I'll respond within 24 hours.
`;
  },
  
  blog: () => {
    return `
\x1b[1;32m=== RUNBOOK REPOSITORY ===\x1b[0m

\x1b[1;33m[1] Kubernetes Troubleshooting Patterns\x1b[0m
    \x1b[1;36mTags:\x1b[0m #kubernetes #debugging #postmortem
    \x1b[1;36mDate:\x1b[0m 2025-03-15
    \x1b[1;36mReadTime:\x1b[0m 8 minutes

\x1b[1;33m[2] The Art of Blameless Postmortems\x1b[0m
    \x1b[1;36mTags:\x1b[0m #culture #incidents #learning
    \x1b[1;36mDate:\x1b[0m 2025-02-28
    \x1b[1;36mReadTime:\x1b[0m 12 minutes

\x1b[1;33m[3] Terraform at Scale: Lessons Learned\x1b[0m
    \x1b[1;36mTags:\x1b[0m #terraform #iac #bestpractices
    \x1b[1;36mDate:\x1b[0m 2025-01-10
    \x1b[1;36mReadTime:\x1b[0m 15 minutes

\x1b[1;33m[4] Automating Everything: My DevOps Philosophy\x1b[0m
    \x1b[1;36mTags:\x1b[0m #automation #culture #devops
    \x1b[1;36mDate:\x1b[0m 2024-12-05
    \x1b[1;36mReadTime:\x1b[0m 10 minutes

\x1b[1;33m[5] Building Scalable APIs with Python Frameworks\x1b[0m
    \x1b[1;36mTags:\x1b[0m #python #django #fastapi #flask #api
    \x1b[1;36mDate:\x1b[0m 2025-03-01
    \x1b[1;36mReadTime:\x1b[0m 14 minutes

Type 'blog [number]' to read a specific article.
`;
  },
  
  tools: () => {
    return `
\x1b[1;32m=== DEVOPS TOOLKIT ===\x1b[0m

\x1b[1;33m[1] Infrastructure Visualizer\x1b[0m
    \x1b[1;36mPurpose:\x1b[0m Generate architecture diagrams from code
    \x1b[1;36mTech:\x1b[0m Python, D3.js, Terraform parser
    \x1b[1;36mStatus:\x1b[0m Available for demo

\x1b[1;33m[2] Chaos Testing Framework\x1b[0m
    \x1b[1;36mPurpose:\x1b[0m Simulate failures to test resilience
    \x1b[1;36mTech:\x1b[0m Go, Kubernetes API, Chaos Mesh
    \x1b[1;36mStatus:\x1b[0m Available for demo

\x1b[1;33m[3] SLO Dashboard Generator\x1b[0m
    \x1b[1;36mPurpose:\x1b[0m Create beautiful SLO dashboards
    \x1b[1;36mTech:\x1b[0m Grafana, Prometheus, React
    \x1b[1;36mStatus:\x1b[0m Available for demo

\x1b[1;33m[4] Cost Optimization Analyzer\x1b[0m
    \x1b[1;36mPurpose:\x1b[0m Find cloud resource optimization opportunities
    \x1b[1;36mTech:\x1b[0m Python, AWS/GCP APIs, ML
    \x1b[1;36mStatus:\x1b[0m Available for demo

Type 'tools [number]' to see a demo.
`;
  },
  
  whois: () => {
    return `
\x1b[1;32m$ whois devops-expert\x1b[0m

Domain Information:
  Name: Sagar Budhathoki
  Registrar: Life Experience Inc.
  Creation Date: ${new Date().getFullYear() - 4} years ago
  Status: Continuously learning

Contact Information:
  Type: Human
  Role: Infrastructure Architect & SRE, Python Web Developer, AI Engineer
  Location: The Cloud (occasionally on Earth)

DNS Records:
  Skills: See 'skills' command
  Projects: See 'projects' command
  Blog: See 'blog' command

Whois Server Response:
  A passionate technologist who believes in automation,
  infrastructure as code, and the power of DevOps culture.
  Expert in building resilient systems and scalable web applications
  using Python frameworks (Django, FastAPI, Flask).
  Currently exploring AI agents and MCP technologies.
`;
  },
  
  uptime: () => {
    // Calculate days based on 4 years
    const uptimeDays = 4 * 365 + Math.floor(Math.random() * 200); // Randomize for realism
    const availability = (99.99).toFixed(2);
    
    return `
\x1b[1;32m=== SYSTEM UPTIME ===\x1b[0m

\x1b[1;36mCareer Uptime:\x1b[0m 4+ years (${uptimeDays} days)
\x1b[1;36mAvailability:\x1b[0m ${availability}%
\x1b[1;36mMean Time Between Failures:\x1b[0m Very high
\x1b[1;36mMean Time To Recovery:\x1b[0m Very low
\x1b[1;36mIncidents Resolved:\x1b[0m Countless
\x1b[1;36mCoffee Consumed:\x1b[0m ${Math.floor(uptimeDays * 2.5)} cups

\x1b[1;33mStatus:\x1b[0m \x1b[1;32mOPERATIONAL\x1b[0m
\x1b[1;33mLoad Average:\x1b[0m [||||||||||||||||||||] 85%
\x1b[1;33mCurrent Task:\x1b[0m Building awesome portfolio website
`;
  },
  
  deploy: (args: string[]) => {
    const projectNumber = args[0];
    
    if (!projectNumber) {
      return `
\x1b[1;31mError: Missing project number\x1b[0m
Usage: deploy [project_number]
Example: deploy 1
`;
    }
    
    return `
\x1b[1;32m=== DEPLOYMENT PIPELINE ===\x1b[0m

\x1b[1;33mInitiating deployment for Project #${projectNumber}...\x1b[0m

\x1b[1;36m[1/7]\x1b[0m Running tests... \x1b[1;32m✓ Passed\x1b[0m
\x1b[1;36m[2/7]\x1b[0m Building artifacts... \x1b[1;32m✓ Completed\x1b[0m
\x1b[1;36m[3/7]\x1b[0m Scanning for vulnerabilities... \x1b[1;32m✓ No issues found\x1b[0m
\x1b[1;36m[4/7]\x1b[0m Pushing to registry... \x1b[1;32m✓ Uploaded\x1b[0m
\x1b[1;36m[5/7]\x1b[0m Updating infrastructure... \x1b[1;32m✓ Applied\x1b[0m
\x1b[1;36m[6/7]\x1b[0m Deploying to production... \x1b[1;32m✓ Deployed\x1b[0m
\x1b[1;36m[7/7]\x1b[0m Running smoke tests... \x1b[1;32m✓ Verified\x1b[0m

\x1b[1;32mDeployment completed successfully!\x1b[0m
\x1b[1;36mDeployment ID:\x1b[0m d-${Math.random().toString(36).substring(2, 10)}
\x1b[1;36mDuration:\x1b[0m 3m 42s
\x1b[1;36mStatus:\x1b[0m \x1b[1;32mHEALTHY\x1b[0m

\x1b[1;33mMonitoring deployment for the next 15 minutes...\x1b[0m
`;
  },
  
  incident: (args: string[]) => {
    const incidentNumber = args[0] || Math.floor(Math.random() * 3) + 1;
    
    const incidents = [
      `
\x1b[1;32m=== INCIDENT REPORT #001 ===\x1b[0m

\x1b[1;33mTitle:\x1b[0m Database Connection Pool Exhaustion
\x1b[1;33mDate:\x1b[0m 2024-11-15
\x1b[1;33mDuration:\x1b[0m 47 minutes
\x1b[1;33mSeverity:\x1b[0m SEV2 (Major degradation)

\x1b[1;36mSummary:\x1b[0m
Connection pool exhaustion caused by a query that was not properly closed,
leading to resource leakage and eventual service degradation.

\x1b[1;36mRoot Cause:\x1b[0m
A recent code change introduced a connection leak in the user authentication service.

\x1b[1;36mResolution:\x1b[0m
1. Implemented proper connection closing in finally blocks
2. Added connection timeout settings
3. Increased monitoring on connection pool metrics
4. Added circuit breaker pattern to prevent cascading failures

\x1b[1;36mLessons Learned:\x1b[0m
1. Always verify resource cleanup in code reviews
2. Implement better testing for resource leaks
3. Set up more proactive alerting on connection pools
`,
      `
\x1b[1;32m=== INCIDENT REPORT #002 ===\x1b[0m

\x1b[1;33mTitle:\x1b[0m Kubernetes Node OOM Events
\x1b[1;33mDate:\x1b[0m 2025-01-23
\x1b[1;33mDuration:\x1b[0m 2 hours 12 minutes
\x1b[1;33mSeverity:\x1b[0m SEV1 (Critical service impact)

\x1b[1;36mSummary:\x1b[0m
Multiple Kubernetes nodes experienced Out of Memory (OOM) events,
causing pod evictions and service disruptions across the platform.

\x1b[1;36mRoot Cause:\x1b[0m
Memory limits were not properly set on some workloads, allowing them
to consume excessive resources during peak traffic.

\x1b[1;36mResolution:\x1b[0m
1. Implemented proper resource requests and limits
2. Added memory usage monitoring and alerting
3. Deployed node autoscaling based on memory pressure
4. Created runbook for handling OOM events

\x1b[1;36mLessons Learned:\x1b[0m
1. Always set appropriate resource constraints
2. Test workloads under peak load conditions
3. Implement better monitoring for resource usage
4. Have clear escalation procedures for resource-related incidents
`,
      `
\x1b[1;32m=== INCIDENT REPORT #003 ===\x1b[0m

\x1b[1;33mTitle:\x1b[0m CI/CD Pipeline Failure
\x1b[1;33mDate:\x1b[0m 2025-02-10
\x1b[1;33mDuration:\x1b[0m 4 hours 35 minutes
\x1b[1;33mSeverity:\x1b[0m SEV2 (Major degradation)

\x1b[1;36mSummary:\x1b[0m
CI/CD pipeline failures prevented teams from deploying changes,
causing a backlog of pending releases and feature delays.

\x1b[1;36mRoot Cause:\x1b[0m
A dependency update in the build system introduced incompatibilities
with existing build scripts and test frameworks.

\x1b[1;36mResolution:\x1b[0m
1. Rolled back the problematic dependency
2. Implemented dependency version pinning
3. Added integration tests for the build system itself
4. Created a staging environment for testing build changes

\x1b[1;36mLessons Learned:\x1b[0m
1. Treat build infrastructure as critical production systems
2. Test infrastructure changes thoroughly before deployment
3. Have clear rollback procedures for all infrastructure components
4. Implement better monitoring for build system health
`
    ];
    
    return incidents[Number(incidentNumber) - 1] || incidents[0];
  },
  
  chaos: () => {
    const services = ['api-gateway', 'user-service', 'payment-processor', 'recommendation-engine', 'notification-service'];
    const randomService = services[Math.floor(Math.random() * services.length)];
    const chaosTypes = ['pod-failure', 'network-latency', 'cpu-hog', 'memory-hog', 'disk-fill'];
    const randomChaos = chaosTypes[Math.floor(Math.random() * chaosTypes.length)];
    
    return `
\x1b[1;32m=== CHAOS MONKEY EXPERIMENT ===\x1b[0m

\x1b[1;31m🐒 Releasing the Chaos Monkey! 🐒\x1b[0m

\x1b[1;33mTarget Service:\x1b[0m ${randomService}
\x1b[1;33mChaos Type:\x1b[0m ${randomChaos}
\x1b[1;33mDuration:\x1b[0m 5 minutes
\x1b[1;33mScope:\x1b[0m 25% of service instances

\x1b[1;36m[1/5]\x1b[0m Preparing experiment... \x1b[1;32m✓ Ready\x1b[0m
\x1b[1;36m[2/5]\x1b[0m Verifying monitoring... \x1b[1;32m✓ Active\x1b[0m
\x1b[1;36m[3/5]\x1b[0m Executing chaos... \x1b[1;32m✓ Injected\x1b[0m
\x1b[1;36m[4/5]\x1b[0m Monitoring service health... \x1b[1;33m⚠ Degraded but functioning\x1b[0m
\x1b[1;36m[5/5]\x1b[0m Restoring normal operation... \x1b[1;32m✓ Recovered\x1b[0m

\x1b[1;32mExperiment completed successfully!\x1b[0m

\x1b[1;33mResults:\x1b[0m
- Service degraded but remained available
- Failover mechanisms activated properly
- 95% of requests succeeded during chaos
- Recovery time: 12.3 seconds

\x1b[1;33mRecommendations:\x1b[0m
- Improve retry logic in client applications
- Add circuit breakers to prevent cascading failures
- Increase replica count for faster recovery

Remember: "Chaos in production teaches us more in an hour than a month of testing in staging."
`;
  },
  
  history: () => {
    if (commandHistory.length === 0) {
      return '\x1b[1;33mNo commands in history yet.\x1b[0m';
    }
    
    return `
\x1b[1;32m=== COMMAND HISTORY ===\x1b[0m

${commandHistory.map((cmd, i) => `\x1b[1;36m${i + 1}:\x1b[0m ${cmd}`).join('\n')}
`;
  },
  
  exit: () => {
    return `
\x1b[1;33mExiting terminal mode...\x1b[0m
\x1b[1;32mSwitching to GUI interface.\x1b[0m
`;
  },
  
  monitor: (args: string[]) => {
    const service = args[0] || 'all';
    const services = {
      'api-gateway': { status: 'healthy', latency: '23ms', requests: '1.2k/s', errors: '0.01%' },
      'auth-service': { status: 'healthy', latency: '45ms', requests: '850/s', errors: '0.00%' },
      'user-service': { status: 'degraded', latency: '120ms', requests: '650/s', errors: '2.30%' },
      'payment-service': { status: 'healthy', latency: '67ms', requests: '320/s', errors: '0.05%' },
      'notification-service': { status: 'healthy', latency: '35ms', requests: '210/s', errors: '0.00%' },
    };
    
    if (service !== 'all' && !services[service as keyof typeof services]) {
      return `
\x1b[1;31mError: Unknown service "${service}"\x1b[0m
Available services: api-gateway, auth-service, user-service, payment-service, notification-service, all
`;
    }
    
    if (service === 'all') {
      return `
\x1b[1;32m=== SYSTEM MONITORING DASHBOARD ===\x1b[0m
\x1b[1;37mLast updated: ${new Date().toISOString()}\x1b[0m

\x1b[1;33mService Status:\x1b[0m
${Object.entries(services).map(([name, metrics]) => 
  `  \x1b[1;36m${name.padEnd(20)}\x1b[0m ${metrics.status === 'healthy' ? '\x1b[1;32m●\x1b[0m HEALTHY' : '\x1b[1;33m●\x1b[0m DEGRADED'}`
).join('\n')}

\x1b[1;33mSystem Metrics:\x1b[0m
  \x1b[1;36mCPU Usage:      \x1b[0m [${generateBar(65)}] 65%
  \x1b[1;36mMemory Usage:   \x1b[0m [${generateBar(78)}] 78%
  \x1b[1;36mNetwork Traffic:\x1b[0m [${generateBar(42)}] 42%
  \x1b[1;36mDisk I/O:       \x1b[0m [${generateBar(30)}] 30%

\x1b[1;33mAlerts:\x1b[0m
  \x1b[1;33m⚠ user-service latency above threshold (120ms > 100ms)\x1b[0m
  \x1b[1;33m⚠ user-service error rate above threshold (2.30% > 1.00%)\x1b[0m

Type 'monitor [service-name]' for detailed metrics.
`;
    }
    
    const metrics = services[service as keyof typeof services];
    const isHealthy = metrics.status === 'healthy';
    
    return `
\x1b[1;32m=== ${service.toUpperCase()} MONITORING ===\x1b[0m
\x1b[1;37mLast updated: ${new Date().toISOString()}\x1b[0m

\x1b[1;33mStatus:\x1b[0m ${isHealthy ? '\x1b[1;32m● HEALTHY\x1b[0m' : '\x1b[1;33m● DEGRADED\x1b[0m'}
\x1b[1;33mLatency (p95):\x1b[0m ${metrics.latency} ${parseInt(metrics.latency) > 100 ? '\x1b[1;33m⚠\x1b[0m' : ''}
\x1b[1;33mRequests:\x1b[0m ${metrics.requests}
\x1b[1;33mError Rate:\x1b[0m ${metrics.errors} ${parseFloat(metrics.errors) > 1.0 ? '\x1b[1;33m⚠\x1b[0m' : ''}

\x1b[1;33mLatency Trend (24h):\x1b[0m
${generateSparkline()}

\x1b[1;33mEndpoint Health:\x1b[0m
  \x1b[1;36m/health       \x1b[0m \x1b[1;32m200 OK\x1b[0m
  \x1b[1;36m/metrics      \x1b[0m \x1b[1;32m200 OK\x1b[0m
  \x1b[1;36m/api/v1/users \x1b[0m ${isHealthy ? '\x1b[1;32m200 OK\x1b[0m' : '\x1b[1;33m429 Too Many Requests\x1b[0m'}
  \x1b[1;36m/api/v1/auth  \x1b[0m \x1b[1;32m200 OK\x1b[0m

\x1b[1;33mLogs:\x1b[0m
${isHealthy ? 
  '  \x1b[90m2025-04-02T00:15:23Z INFO  Connection pool stable\x1b[0m\n' +
  '  \x1b[90m2025-04-02T00:14:57Z INFO  Processed 1000 requests\x1b[0m\n' +
  '  \x1b[90m2025-04-02T00:14:32Z INFO  Cache hit ratio: 94.5%\x1b[0m' :
  '  \x1b[1;31m2025-04-02T00:15:23Z ERROR Connection timeout exceeded\x1b[0m\n' +
  '  \x1b[1;33m2025-04-02T00:14:57Z WARN  High memory usage detected\x1b[0m\n' +
  '  \x1b[1;33m2025-04-02T00:14:32Z WARN  Slow query detected (450ms)\x1b[0m'
}

Type 'scale ${service} [replicas]' to adjust capacity.
`;
  },
  
  trace: (args: string[]) => {
    const requestId = args[0] || Math.random().toString(36).substring(2, 10);
    
    return `
\x1b[1;32m=== REQUEST TRACE ${requestId} ===\x1b[0m

\x1b[1;33mRequest Path:\x1b[0m
\x1b[1;36mClient\x1b[0m → \x1b[1;36mLoad Balancer\x1b[0m → \x1b[1;36mAPI Gateway\x1b[0m → \x1b[1;36mAuth Service\x1b[0m → \x1b[1;36mUser Service\x1b[0m → \x1b[1;36mDatabase\x1b[0m

\x1b[1;33mTimeline:\x1b[0m
  \x1b[1;36m[+0ms]    \x1b[0m Client initiates request
  \x1b[1;36m[+15ms]   \x1b[0m Load Balancer receives request
  \x1b[1;36m[+28ms]   \x1b[0m API Gateway validates request
  \x1b[1;36m[+45ms]   \x1b[0m Auth Service authenticates user
  \x1b[1;36m[+120ms]  \x1b[0m User Service processes request \x1b[1;33m⚠ Slow\x1b[0m
  \x1b[1;36m[+145ms]  \x1b[0m Database query executed
  \x1b[1;36m[+160ms]  \x1b[0m User Service prepares response
  \x1b[1;36m[+175ms]  \x1b[0m API Gateway formats response
  \x1b[1;36m[+185ms]  \x1b[0m Response sent to client

\x1b[1;33mService Performance:\x1b[0m
  \x1b[1;36mLoad Balancer      \x1b[0m [${generateBar(10)}] 13ms
  \x1b[1;36mAPI Gateway        \x1b[0m [${generateBar(15)}] 17ms
  \x1b[1;36mAuth Service       \x1b[0m [${generateBar(20)}] 25ms
  \x1b[1;36mUser Service       \x1b[0m [${generateBar(60)}] 75ms \x1b[1;33m⚠\x1b[0m
  \x1b[1;36mDatabase           \x1b[0m [${generateBar(25)}] 25ms

\x1b[1;33mHotspots:\x1b[0m
  • User Service: Database connection pool contention
  • User Service: Unoptimized query execution

\x1b[1;33mRecommendations:\x1b[0m
  • Increase connection pool size
  • Add index to improve query performance
  • Implement caching for frequent queries
`;
  },
  
  scale: (args: string[]) => {
    const service = args[0];
    const replicas = parseInt(args[1]) || 3;
    
    if (!service) {
      return `
\x1b[1;31mError: Missing service name\x1b[0m
Usage: scale [service] [replicas]
Example: scale user-service 5
`;
    }
    
    return `
\x1b[1;32m=== SCALING ${service.toUpperCase()} ===\x1b[0m

\x1b[1;33mCurrent state:\x1b[0m
  \x1b[1;36mReplicas:\x1b[0m 2
  \x1b[1;36mCPU:\x1b[0m 85% utilized
  \x1b[1;36mMemory:\x1b[0m 75% utilized
  \x1b[1;36mLoad:\x1b[0m High

\x1b[1;33mScaling operation:\x1b[0m
  \x1b[1;36mTarget replicas:\x1b[0m ${replicas}
  \x1b[1;36mChange:\x1b[0m +${replicas - 2} instances

\x1b[1;36m[1/4]\x1b[0m Updating deployment configuration... \x1b[1;32m✓ Done\x1b[0m
\x1b[1;36m[2/4]\x1b[0m Provisioning new instances... \x1b[1;32m✓ Done\x1b[0m
\x1b[1;36m[3/4]\x1b[0m Waiting for readiness checks... \x1b[1;32m✓ Done\x1b[0m
\x1b[1;36m[4/4]\x1b[0m Updating load balancer... \x1b[1;32m✓ Done\x1b[0m

\x1b[1;32mScaling completed successfully!\x1b[0m

\x1b[1;33mNew state:\x1b[0m
  \x1b[1;36mReplicas:\x1b[0m ${replicas}
  \x1b[1;36mCPU:\x1b[0m ${Math.floor(85 * 2 / replicas)}% utilized
  \x1b[1;36mMemory:\x1b[0m ${Math.floor(75 * 2 / replicas)}% utilized
  \x1b[1;36mLoad:\x1b[0m ${replicas >= 4 ? 'Normal' : 'Moderate'}

\x1b[1;33mRecommendation:\x1b[0m
  ${replicas < 3 ? 'Consider scaling to at least 3 replicas for high availability' : 
    replicas > 5 ? 'Consider implementing autoscaling for cost optimization' : 
    'Current replica count is optimal for the current load'}
`;
  },
  
  infra: () => {
    return `
\x1b[1;32m=== INFRASTRUCTURE DIAGRAM ===\x1b[0m

\x1b[1;36m                                  ┌───────────────┐                                  \x1b[0m
\x1b[1;36m                                  │   Internet    │                                  \x1b[0m
\x1b[1;36m                                  └───────┬───────┘                                  \x1b[0m
\x1b[1;36m                                          │                                          \x1b[0m
\x1b[1;36m                                          ▼                                          \x1b[0m
\x1b[1;36m                                  ┌───────────────┐                                  \x1b[0m
\x1b[1;36m                                  │  CloudFront   │                                  \x1b[0m
\x1b[1;36m                                  └───────┬───────┘                                  \x1b[0m
\x1b[1;36m                                          │                                          \x1b[0m
\x1b[1;36m                                          ▼                                          \x1b[0m
\x1b[1;36m                                  ┌───────────────┐                                  \x1b[0m
\x1b[1;36m                                  │ Load Balancer │                                  \x1b[0m
\x1b[1;36m                                  └───────┬───────┘                                  \x1b[0m
\x1b[1;36m                                          │                                          \x1b[0m
\x1b[1;36m                    ┌───────────────┬─────┴─────┬───────────────┐                    \x1b[0m
\x1b[1;36m                    │               │           │               │                    \x1b[0m
\x1b[1;36m                    ▼               ▼           ▼               ▼                    \x1b[0m
\x1b[1;36m            ┌───────────────┐┌───────────────┐┌───────────────┐┌───────────────┐    \x1b[0m
\x1b[1;36m            │  API Gateway  ││  API Gateway  ││  API Gateway  ││  API Gateway  │    \x1b[0m
\x1b[1;36m            └───────┬───────┘└───────┬───────┘└───────┬───────┘└───────┬───────┘    \x1b[0m
\x1b[1;36m                    │               │           │               │                    \x1b[0m
\x1b[1;36m                    └───────────────┴─────┬─────┴───────────────┘                    \x1b[0m
\x1b[1;36m                                          │                                          \x1b[0m
\x1b[1;36m                                          ▼                                          \x1b[0m
\x1b[1;36m            ┌───────────────┐      ┌───────────────┐      ┌───────────────┐        \x1b[0m
\x1b[1;36m            │  Auth Service │◄────►│ Service Mesh  │◄────►│  User Service │        \x1b[0m
\x1b[1;36m            └───────────────┘      └───────┬───────┘      └───────────────┘        \x1b[0m
\x1b[1;36m                                          │                                          \x1b[0m
\x1b[1;36m                                          ▼                                          \x1b[0m
\x1b[1;36m            ┌───────────────┐      ┌───────────────┐      ┌───────────────┐        \x1b[0m
\x1b[1;36m            │Payment Service│◄────►│ Service Mesh  │◄────►│   Notification│        \x1b[0m
\x1b[1;36m            └───────────────┘      └───────┬───────┘      └───────────────┘        \x1b[0m
\x1b[1;36m                                          │                                          \x1b[0m
\x1b[1;36m                    ┌───────────────┬─────┴─────┬───────────────┐                    \x1b[0m
\x1b[1;36m                    │               │           │               │                    \x1b[0m
\x1b[1;36m                    ▼               ▼           ▼               ▼                    \x1b[0m
\x1b[1;36m            ┌───────────────┐┌───────────────┐┌───────────────┐┌───────────────┐    \x1b[0m
\x1b[1;36m            │  PostgreSQL   ││    MongoDB    ││     Redis     ││   Kafka       │    \x1b[0m
\x1b[1;36m            └───────────────┘└───────────────┘└───────────────┘└───────────────┘    \x1b[0m

\x1b[1;33mMonitoring & Observability:\x1b[0m
  • Prometheus + Grafana for metrics
  • ELK Stack for logging
  • Jaeger for distributed tracing
  • AlertManager for alerting

\x1b[1;33mInfrastructure as Code:\x1b[0m
  • Terraform for cloud resources
  • Kubernetes manifests for services
  • Helm charts for applications
  • ArgoCD for GitOps deployments

Type 'monitor' to check system status.
Type 'deploy' to simulate a deployment.
`;
  },
  
  sudo: (args: string[]) => {
    const command = args.join(' ');
    
    if (command === 'make me a sandwich') {
      return `
\x1b[1;32m$ sudo make me a sandwich\x1b[0m

🥪 Coming right up! Sandwich ready.

\x1b[1;33mNote:\x1b[0m This command executed successfully because you used sudo.
If you had just typed 'make me a sandwich', I would have said 'Make it yourself'.
`;
    }
    
    if (!command) {
      return `
\x1b[1;31mError: Missing command\x1b[0m
Usage: sudo [command]
Example: sudo make me a sandwich
`;
    }
    
    return `
\x1b[1;32m$ sudo ${command}\x1b[0m

\x1b[1;33m[sudo] password for devops-user:\x1b[0m ********

\x1b[1;31mPermission denied\x1b[0m

\x1b[1;33mThis incident will be reported.\x1b[0m
`;
  },
  
  coffee: () => {
    return `
\x1b[1;32m=== BREWING COFFEE ===\x1b[0m

\x1b[1;33mInitiating coffee brewing sequence...\x1b[0m

\x1b[1;36m[1/5]\x1b[0m Heating water to 94°C... \x1b[1;32m✓ Done\x1b[0m
\x1b[1;36m[2/5]\x1b[0m Grinding beans (medium-fine)... \x1b[1;32m✓ Done\x1b[0m
\x1b[1;36m[3/5]\x1b[0m Blooming grounds... \x1b[1;32m✓ Done\x1b[0m
\x1b[1;36m[4/5]\x1b[0m Brewing pour-over... \x1b[1;32m✓ Done\x1b[0m
\x1b[1;36m[5/5]\x1b[0m Serving in your favorite mug... \x1b[1;32m✓ Done\x1b[0m

\x1b[1;32mCoffee ready!\x1b[0m

${asciiArt.coffee}

\x1b[1;33mEnjoy your virtual coffee!\x1b[0m
\x1b[90mRemember: "Coffee is just a hug in a mug."\x1b[0m
`;
  },
  
  ascii: (args: string[]) => {
    const artName = args[0] || 'brain';
    
    if (!(artName in asciiArt)) {
      return `
\x1b[1;31mError: ASCII art not found: ${artName}\x1b[0m
Available options: ${Object.keys(asciiArt).join(', ')}
`;
    }
    
    return `
\x1b[1;32m=== ASCII ART: ${artName.toUpperCase()} ===\x1b[0m

\x1b[1;36m${asciiArt[artName as keyof typeof asciiArt]}\x1b[0m
`;
  },
  
  fortune: () => {
    const fortunes = [
      "The best way to predict the future is to implement it.",
      "A good SRE knows how to break things. A great SRE knows what will break without intervention.",
      "Given enough eyeballs, all bugs are shallow. Given enough coffee, all PRs get reviewed.",
      "The cloud is just someone else's computer, but with better uptime than yours.",
      "Weeks of coding can save you hours of planning.",
      "In DevOps, we trust the process because we automated and tested it thoroughly.",
      "There are two hard problems in computer science: cache invalidation, naming things, and off-by-one errors.",
      "If it hurts, do it more often. Especially deployments.",
      "Your infrastructure should be cattle, not pets. Unless you're running a pet store website.",
      "The best monitoring alert is the one you never receive because self-healing kicked in.",
      "Documentation is like code comments - you always wish for more until you have to maintain them.",
      "The 'O' in DevOps stands for 'Oh no, who deployed on Friday?'",
      "The most dangerous phrase in DevOps: 'It works on my machine'.",
      "Chaos engineering is just breaking things with style and purpose.",
      "The cloud is where your data goes to meet data from other companies."
    ];
    
    const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    
    return `
\x1b[1;32m=== DEVOPS FORTUNE ===\x1b[0m

\x1b[1;33m" ${randomFortune} "\x1b[0m

\x1b[90mYour DevOps fortune cookie has been consumed. No refunds.\x1b[0m
`;
  }
};

// Execute a command and return the output
export function executeCommand(input: string): string {
  // Add to history
  commandHistory.push(input);
  
  // Parse command and arguments
  const [command, ...args] = input.trim().split(' ');
  
  // Check if command exists
  if (command in commands) {
    return commands[command](args);
  }
  
  // Handle unknown command
  return `
\x1b[1;31mCommand not found: ${command}\x1b[0m
Type 'help' to see available commands.
`;
}
