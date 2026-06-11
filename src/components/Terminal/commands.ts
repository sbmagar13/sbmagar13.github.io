import { asciiArt } from './ascii';
import { askSite, SAMPLE_QUESTIONS } from '@/lib/ask';
import {
  DISCOVERIES,
  getUnlocked,
  discoveryProgress,
  unlockDiscovery,
} from '@/lib/discoveries';

// Command history for persistence
const commandHistory: string[] = [];

// Vim gag state: once the user runs `vim`, they're trapped until a proper quit
let vimActive = false;

// Function to trigger deployment animation
const triggerDeployAnimation = () => {
  // Call the global function exposed by CiCdPipeline component
  if (typeof window !== 'undefined' && window.startPipelineDeployment) {
    console.log('Calling global startPipelineDeployment function from commands.ts');
    window.startPipelineDeployment();
  } else {
    console.log('Global startPipelineDeployment function not found');
  }
};

// Function to trigger Docker container animation
const triggerDockerAnimation = () => {
  // Call the global function exposed by DockerContainers component
  if (typeof window !== 'undefined' && window.startDockerAnimation) {
    console.log('Calling global startDockerAnimation function from commands.ts');
    window.startDockerAnimation();
  } else {
    console.log('Global startDockerAnimation function not found');
  }
};

// Helper functions for visualizations
function generateBar(percentage: number): string {
  // Use a smaller width on mobile devices
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const width = isMobile ? 10 : 20;
  
  // Ensure percentage is between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const filledChars = Math.floor((clampedPercentage / 100) * width);
  // Pure ASCII bar: the block glyph isn't in Geist Mono and falls back
  // to a mismatched font, which is what garbled the old banner.
  return '#'.repeat(filledChars) + '-'.repeat(width - filledChars);
}

// Available commands
const commands: Record<string, (args: string[]) => string> = {
  '404': () => {
    return `
\x1b[1;31m   _____ _    _  _____   _   _  ____ _______   ______ ____  _    _ _   _ _____  \x1b[0m
\x1b[1;31m  / ____| |  | |/ ____| | \\ | |/ __ \\__   __| |  ____/ __ \\| |  | | \\ | |  __ \\ \x1b[0m
\x1b[1;31m | |    | |  | | (___   |  \\| | |  | | | |    | |__ | |  | | |  | |  \\| | |  | |\x1b[0m
\x1b[1;31m | |    | |  | |\\___ \\  | . \` | |  | | | |    |  __|| |  | | |  | | . \` | |  | |\x1b[0m
\x1b[1;31m | |____| |__| |____) | | |\\  | |__| | | |    | |   | |__| | |__| | |\\  | |__| |\x1b[0m
\x1b[1;31m  \\_____|\\____/|_____/  |_| \\_|\\____/  |_|    |_|    \\____/ \\____/|_| \\_|_____/ \x1b[0m
                                                                                
\x1b[1;33mHTTP 404: Resource Not Found\x1b[0m

\x1b[1;36mThe page you're looking for has been:
  a) Containerized and shipped to another environment
  b) Load balanced into oblivion
  c) Scaled to zero instances
  d) Trapped in a Kubernetes Init Container loop\x1b[0m

\x1b[1;33mTroubleshooting steps:\x1b[0m
  1. Check your DNS configuration (it's always DNS)
  2. Verify your Ingress rules aren't sending traffic to /dev/null
  3. Make sure your service mesh isn't playing practical jokes
  4. Try turning it off and on again (works 60% of the time, every time)

\x1b[1;32mFor immediate assistance, please submit a ticket to /dev/null\x1b[0m
\x1b[90mResponse time: Between now and heat death of the universe\x1b[0m
`;
  },
  help: () => {
    return `
\x1b[1;32m=== AVAILABLE COMMANDS ===\x1b[0m

\x1b[1;33mCore Commands:\x1b[0m
  \x1b[1;36mhelp\x1b[0m                 Show this help message
  \x1b[1;36mask [question]\x1b[0m       Ask this site anything, e.g. 'ask production k8s?' (alias: ?)
  \x1b[1;36mclear\x1b[0m                Clear the terminal (Ctrl+L works too)
  \x1b[1;36mhistory\x1b[0m              Show command history
  \x1b[1;36mtour\x1b[0m                 Guided tour, auto-runs the good commands (alias: demo)
  \x1b[1;36mexit\x1b[0m                 Exit terminal mode (switch to GUI)

\x1b[1;33mFilesystem:\x1b[0m
  \x1b[1;36mls\x1b[0m                   List the files here ('ls -la' works too)
  \x1b[1;36mcat [file]\x1b[0m           Read a file, e.g. 'cat about.txt'

\x1b[1;33mProfile Commands:\x1b[0m
  \x1b[1;36mabout\x1b[0m                Show information about me
  \x1b[1;36mwhois\x1b[0m                Who am I?
  \x1b[1;36muptime\x1b[0m               Career uptime, honestly measured
  \x1b[1;36mcontact\x1b[0m              Show contact information
  \x1b[1;36mconnect\x1b[0m              Show social connection endpoints
  \x1b[1;36mskills\x1b[0m               The real stack, nothing padded
  \x1b[1;36mprojects\x1b[0m             Real production work

\x1b[1;33mDevOps Commands:\x1b[0m
  \x1b[1;36mdeploy\x1b[0m               This site's actual deploy pipeline
  \x1b[1;36mdocker [command]\x1b[0m     Docker container operations (animation)
  \x1b[1;36mmonitor\x1b[0m              Honest monitoring: this tab is the infra
  \x1b[1;36mincident\x1b[0m             The real 19-minute outage postmortem
  \x1b[1;36mchaos\x1b[0m                Release a chaos monkey on a static site
  \x1b[1;36minfra\x1b[0m                The production platform, simplified

\x1b[1;33mContent Commands:\x1b[0m
  \x1b[1;36mblog\x1b[0m                 Open the blog
  \x1b[1;36mtools\x1b[0m                Open the tech stack

\x1b[1;33mFun Commands:\x1b[0m
  \x1b[1;36msudo [command]\x1b[0m       Try it and see what happens
  \x1b[1;36mcoffee\x1b[0m               Coffee??, but you'll get a virtual Lemon Tea
  \x1b[1;36mascii [name]\x1b[0m         Show ASCII art
  \x1b[1;36mfortune\x1b[0m              Get a random DevOps fortune
  \x1b[1;36m404\x1b[0m                  Show a not found page

\x1b[90mTab completes. Up arrow recalls. Pipe to filter: 'skills | grep aws'.\x1b[0m
\x1b[90mThere are more commands than this list admits.\x1b[0m
`;
  },
  
  clear: () => {
    return '\x1b[2J\x1b[3J\x1b[H';
  },

  ls: () => {
    // ls -la theatre: the perms and owner are set dressing, but the
    // size column is real, it is the exact length of what 'cat'
    // prints for that file. Flags are accepted and ignored, so plain
    // 'ls' and 'ls -la' both land here.
    const names = Object.keys(FILES).sort();
    const sizes = names.map((name) => FILES[name]().length);
    const sizeWidth = Math.max(...sizes.map((size) => String(size).length));
    const rows = names.map(
      (name, i) =>
        `-rw-r--r--  1 sagar  sagar  ${String(sizes[i]).padStart(sizeWidth)} \x1b[1;36m${name}\x1b[0m`
    );

    return `
total ${names.length}
${rows.join('\n')}

\x1b[90mcat <file> to read\x1b[0m
`;
  },

  cat: (args: string[]) => {
    if (args.length === 0 || !args[0]) {
      return `
usage: cat <file>
\x1b[90mTry 'ls' to see what is readable here.\x1b[0m
`;
    }

    // './about.txt' and 'about.txt' both resolve, like a real shell
    const name = args[0].replace(/^\.\//, '');
    if (!(name in FILES)) {
      return `cat: ${args[0]}: No such file or directory`;
    }

    return FILES[name]();
  },

  about: () => {
    return `
\x1b[1;32m=== SYSTEM INFORMATION ===\x1b[0m

\x1b[1;36mName:\x1b[0m Sagar Budhathoki
\x1b[1;36mRole:\x1b[0m Senior DevOps / SRE Engineer
\x1b[1;36mUptime:\x1b[0m 5+ years in production (and counting)
\x1b[1;36mKernel:\x1b[0m Human v3.7.2
\x1b[1;36mShell:\x1b[0m Bash/Zsh with custom aliases
\x1b[1;36mPackages:\x1b[0m see 'skills' (curated, no padding)
\x1b[1;36mProcesses:\x1b[0m Multithreaded problem-solving
\x1b[1;36mSwap:\x1b[0m Lemon Tea-powered memory extension

Type 'skills' to see my technical stack.
Type 'projects' to see my work.
`;
  },
  
  projects: () => {
    return `
\x1b[1;32m=== PRODUCTION WORK (all real) ===\x1b[0m

\x1b[1;33m[1] EventLogic platform\x1b[0m
    \x1b[1;36mWhat:\x1b[0m Swedish multi-tenant event-management SaaS, sole platform owner
    \x1b[1;36mTech:\x1b[0m ECS Fargate, Aurora PostgreSQL (schema-per-tenant), ElastiCache Redis, Amazon MQ
    \x1b[1;36mRegion:\x1b[0m eu-north-1

\x1b[1;33m[2] Cross-region disaster recovery\x1b[0m
    \x1b[1;36mWhat:\x1b[0m DR path from eu-north-1 to eu-west-1, built where none existed
    \x1b[1;36mTech:\x1b[0m Aurora Global Database, EFS + ECR replication, shared KMS keys
    \x1b[1;36mExtra:\x1b[0m documented runbook for promotion

\x1b[1;33m[3] Tenant provisioning orchestrator\x1b[0m
    \x1b[1;36mWhat:\x1b[0m one Python API call provisions a full tenant
    \x1b[1;36mSteps:\x1b[0m Aurora schema, SQS + EventBridge, ALB rules, CloudFront/S3, Route 53, DynamoDB

\x1b[1;33m[4] Self-hosted SRE platform\x1b[0m
    \x1b[1;36mWhat:\x1b[0m OneUptime on K3s in eu-central-1: status pages, on-call, incidents
    \x1b[1;36mWhy:\x1b[0m observability that survives a primary-region outage

\x1b[1;33m[5] OpenTelemetry dual-export pipeline\x1b[0m
    \x1b[1;36mWhat:\x1b[0m OTEL collector ships metrics, logs, traces to OneUptime and Loki at once
    \x1b[1;36mTech:\x1b[0m Grafana over Prometheus, Loki and CloudWatch

\x1b[1;33m[6] 3-node Elasticsearch cluster\x1b[0m
    \x1b[1;36mWhat:\x1b[0m self-managed, Terraform + Ansible, split-restart playbooks
    \x1b[1;36mWhy:\x1b[0m a single config change can never cascade across the cluster

\x1b[1;33m[7] Hashnode MCP server (shelved)\x1b[0m
    \x1b[1;36mWhat:\x1b[0m open-source MCP server wiring Claude into the Hashnode API
    \x1b[1;36mStatus:\x1b[0m shelved after Hashnode terminated public API access
    \x1b[1;36mCode:\x1b[0m https://github.com/sbmagar13/hashnode-mcp-server

Type 'incident' for the war story. Type 'infra' for the platform map.
`;
  },
  
  skills: () => {
    // Strictly the verified stack. If a tool is not in real use, it is
    // not on this list. No keyword stuffing.
    return `
\x1b[1;32m=== SKILLS ===\x1b[0m
\x1b[90mThe real stack. If it's not here, I don't claim it.\x1b[0m

\x1b[1;33mCloud / AWS:\x1b[0m
  \x1b[0mAWS (15+ services in production, sole platform owner), ECS Fargate, Lambda,
  CloudFront, S3, API Gateway, Amazon MQ, EFS, ECR, Route 53, VPC networking\x1b[0m

\x1b[1;33mInfrastructure as Code:\x1b[0m
  \x1b[1;36mTerraform (primary)\x1b[0m, Terragrunt, CloudFormation, AWS CDK, Ansible

\x1b[1;33mContainers:\x1b[0m
  Docker, \x1b[1;36mKubernetes (K3s self-hosted)\x1b[0m

\x1b[1;33mCI/CD:\x1b[0m
  \x1b[0mGitLab CI (primary), Jenkins, AWS CodePipeline, GitHub Actions\x1b[0m

\x1b[1;33mObservability:\x1b[0m
  \x1b[0mPrometheus, Grafana, Loki, OpenTelemetry, CloudWatch,
  Elasticsearch / ELK (self-managed 3-node), OneUptime (self-hosted)\x1b[0m

\x1b[1;33mData:\x1b[0m
  \x1b[0mAurora PostgreSQL (Global Database), PostgreSQL, Redis / ElastiCache, DynamoDB\x1b[0m

\x1b[1;33mSecurity:\x1b[0m
  \x1b[0mIAM, KMS, Secrets Manager, AWS Inspector, CloudTrail, OpenVPN\x1b[0m

\x1b[1;33mLanguages:\x1b[0m
  \x1b[1;36mPython, 5+ yrs\x1b[0m (FastAPI, Django, Flask), Bash, JavaScript / TypeScript

\x1b[1;33mAI / Agents:\x1b[0m
  \x1b[0mAnthropic MCP, LangGraph, local LLM inference, PyTorch, LLM engineering\x1b[0m

\x1b[1;33mOS:\x1b[0m
  \x1b[0mArch Linux (daily driver), Ubuntu\x1b[0m

\x1b[1;33mFrontend (this site):\x1b[0m
  \x1b[0mNext.js, React Three Fiber, TypeScript, Tailwind\x1b[0m
`;
  },
  
  contact: () => {
    return `
\x1b[1;32m=== CONNECTION DETAILS ===\x1b[0m

\x1b[1;36mName:\x1b[0m Sagar Budhathoki
\x1b[1;36mEmail:\x1b[0m sagar@sagarbudhathoki.com (or hello@sagarbudhathoki.com)
\x1b[1;36mWebsite:\x1b[0m https://sagarbudhathoki.com
\x1b[1;36mGitHub:\x1b[0m https://github.com/sbmagar13
\x1b[1;36mLinkedIn:\x1b[0m https://linkedin.com/in/sbmagar13
\x1b[1;36mTwitter:\x1b[0m https://twitter.com/S_agarM_agar

\x1b[1;33mPreferred Communication Protocol:\x1b[0m
SSH into my inbox with a clear subject line and I'll respond within 24 hours.

Type 'connect' for more detailed social connection options.
`;
  },
  
  connect: () => {
    return `
\x1b[1;32m=== SOCIAL CONNECTION ENDPOINTS ===\x1b[0m

\x1b[1;33mProfessional Networks:\x1b[0m
  \x1b[1;36mLinkedIn:      \x1b[0m https://linkedin.com/in/sbmagar13
  \x1b[1;36mGitHub:        \x1b[0m https://github.com/sbmagar13
  \x1b[1;36mStack Overflow:\x1b[0m https://stackoverflow.com/users/10819100/sagar-budhathoki-magar
  \x1b[1;36mdaily.dev:     \x1b[0m https://app.daily.dev/sbmagar13

\x1b[1;33mSocial Media:\x1b[0m
  \x1b[1;36mTwitter:       \x1b[0m https://twitter.com/S_agarM_agar
  \x1b[1;36mroadmap.sh:    \x1b[0m https://roadmap.sh/u/sbmagar13
  \x1b[1;36mSpotify:       \x1b[0m https://open.spotify.com/user/qzb6mxppi1qt8o50cgkrbyw4v

\x1b[1;33mDirect Contact:\x1b[0m
  \x1b[1;36mEmail:        \x1b[0m sagar@sagarbudhathoki.com (or hello@sagarbudhathoki.com)
  \x1b[1;36mWebsite:      \x1b[0m https://sagarbudhathoki.com

\x1b[1;33mConnection Status:\x1b[0m
  \x1b[1;32m* ONLINE\x1b[0m - All endpoints available and ready for connection
  \x1b[1;36mResponse Time:\x1b[0m < 24 hours
  \x1b[1;36mPreferred Protocols:\x1b[0m Email, LinkedIn

\x1b[90mPro tip: Use 'about' command and navigate to the Connections tab for a more visual interface.\x1b[0m
`;
  },
  
  blog: () => {
    return `
\x1b[1;32m=== BLOG ===\x1b[0m

The writing lives in the \x1b[1;36mBlog\x1b[0m tab (press 5 if it didn't just open).
Kubernetes troubleshooting, blameless postmortems, Terraform at scale,
AI agents in DevOps.

\x1b[90mThis terminal only points at it. The posts speak for themselves.\x1b[0m
`;
  },

  tools: () => {
    return `
\x1b[1;32m=== TOOLBOX ===\x1b[0m

Opening the \x1b[1;36mTech Stack\x1b[0m tab (press 4 if it didn't switch).

\x1b[1;33mDaily drivers:\x1b[0m \x1b[1;36mTerraform\x1b[0m, \x1b[1;36mKubernetes\x1b[0m, \x1b[1;36mPython\x1b[0m, Docker, GitLab CI, Grafana
\x1b[1;33mOS:\x1b[0m Arch Linux (daily driver), Ubuntu on servers

\x1b[90mFull, honest list: type 'skills'.\x1b[0m
`;
  },
  
  whois: () => {
    return `
\x1b[1;32m$ whois devops-expert\x1b[0m

Domain Information:
  Name: Sagar Budhathoki
  Registrar: Life Experience Inc.
  Registered (DevOps): 2020, 5+ years ago
  Status: Continuously learning

Contact Information:
  Type: Human
  Role: Senior DevOps / SRE Engineer
  Location: The Cloud (occasionally on Earth)

DNS Records:
  Skills: See 'skills' command
  Projects: See 'projects' command
  Blog: See 'blog' command
  Connect: See 'connect' command

Whois Server Response:
  A passionate technologist who believes in automation,
  infrastructure as code, and the power of DevOps culture.
  Expert in building resilient systems and scalable web applications
  using Python frameworks (Django, FastAPI, Flask).
  Currently exploring AI agents and MCP technologies.
`;
  },
  
  uptime: () => {
    // No made-up counters here: the site is a static export on GitHub Pages,
    // so there is no server to have uptime. The career numbers are real.
    return `
\x1b[1;32m=== SYSTEM UPTIME ===\x1b[0m

\x1b[1;36mSite Uptime:\x1b[0m static export on GitHub Pages. No server, nothing to crash.
\x1b[1;36mCareer Uptime:\x1b[0m 5+ years in DevOps / SRE, still in production
\x1b[1;36mIncidents Resolved:\x1b[0m enough to have strong opinions about Redis KEYS
\x1b[1;36mLemon Tea Consumed:\x1b[0m unmeasured, deliberately

\x1b[1;33mStatus:\x1b[0m \x1b[1;32mOPERATIONAL\x1b[0m
\x1b[1;33mCurrent Task:\x1b[0m Keeping this terminal honest
`;
  },
  
  deploy: () => {
    // Trigger the deployment animation in the CI/CD Pipeline component
    triggerDeployAnimation();

    return `
\x1b[1;32m=== DEPLOY: sagarbudhathoki.com ===\x1b[0m

\x1b[1;33mThis site's actual pipeline, no embellishment:\x1b[0m

<<SEQUENTIAL_START>>
\x1b[1;36m[1/4]\x1b[0m next build (static export)... \x1b[1;32m✓\x1b[0m
\x1b[1;36m[2/4]\x1b[0m git push to GitHub... \x1b[1;32m✓\x1b[0m
\x1b[1;36m[3/4]\x1b[0m GitHub Pages publishes the branch... \x1b[1;32m✓\x1b[0m
\x1b[1;36m[4/4]\x1b[0m CDN serves the new version... \x1b[1;32m✓\x1b[0m
<<SEQUENTIAL_END>>

\x1b[1;32mDeployed. No servers were restarted, because there are none.\x1b[0m

\x1b[1;33mThe pipelines I run at work:\x1b[0m GitLab CI (primary), Jenkins,
AWS CodePipeline / CodeBuild, GitHub Actions.
\x1b[1;33mTargets:\x1b[0m ECS, Lambda, CloudFront, EC2.

\x1b[90mVisual pipeline animation triggered in the Projects section.\x1b[0m
`;
  },
  
  incident: () => {
    // One incident, and it actually happened. No fabricated feed.
    return `
\x1b[1;32m=== POSTMORTEM: THE 19-MINUTE OUTAGE (real) ===\x1b[0m

\x1b[1;33mDate:\x1b[0m 2024, production
\x1b[1;33mImpact:\x1b[0m full platform down for 19 minutes
\x1b[1;33mSeverity:\x1b[0m the kind where people stand behind your desk

\x1b[1;36mWhat happened:\x1b[0m
Blocking Redis KEYS calls exhausted the Tomcat/JDBC thread pool.
Every request thread ended up waiting on Redis. The platform went dark.

\x1b[1;36mImmediate fix:\x1b[0m
Connection-pool checkout timeouts, tuned RDS parameters.

\x1b[1;36mFollow-through:\x1b[0m
A 68-task reliability program across 11 epics and 7 sprints,
so it could not happen the same way twice.

\x1b[1;36mLesson:\x1b[0m
Never run KEYS against a production Redis. SCAN exists for a reason.
`;
  },
  
  chaos: () => {
    // Genuine curiosity reward: ran the chaos command. Side-effect-light,
    // SSR-safe (the lib guards window); no toast here, the flavor text below
    // is the contextual feedback.
    unlockDiscovery('chaos');
    // Obvious parody. There is nothing here to break, and that's the joke.
    return `
\x1b[1;32m=== CHAOS ENGINEERING (static-site edition) ===\x1b[0m

\x1b[1;31m🐒 Releasing the chaos monkey...\x1b[0m

\x1b[1;33mTarget:\x1b[0m a pile of HTML on GitHub Pages
\x1b[1;33mHypothesis:\x1b[0m you cannot crash what does not run

The monkey looked for pods to evict. There are none.
It looked for a server to kill. There isn't one.
It is now sitting quietly, reading the page source.

\x1b[1;32mExperiment over. Steady state was never at risk.\x1b[0m
\x1b[90mFor chaos with real stakes, type 'incident'.\x1b[0m
`;
  },

  ask: (args: string[]) => {
    const query = args.join(' ').trim();

    // Bare 'ask': short usage plus a couple of real sample questions.
    if (!query) {
      const samples = SAMPLE_QUESTIONS.slice(0, 3)
        .map((q) => `  \x1b[1;36mask\x1b[0m ${q}`)
        .join('\n');
      return `
\x1b[1;32m=== ASK THIS SITE ===\x1b[0m

usage: ask <question>

\x1b[1;33mTry:\x1b[0m
${samples}
`;
    }

    // Genuine curiosity reward: asked the site a question. SSR-safe, the lib
    // guards window; no toast here, the answer itself is the feedback.
    unlockDiscovery('ask');

    const result = askSite(query);

    // Sanitize to printable ASCII at the terminal boundary: career.ts
    // strings (rack sublabels, metrics) carry middots and a lambda that
    // Geist Mono does not ship, and they would garble in xterm. Mirrors
    // the same strip used on the last-login line. The DOM ask UI keeps
    // the original characters; only the terminal needs this.
    const ascii = (s: string) => s.replace(/[^\x20-\x7E\n]/g, '-');

    // The answer is plain text and may carry '\n'. Render it in the
    // normal color, then a dim 'sources:' list of 'label  href' lines.
    const sourceLines = result.sources
      .map((source) => `  ${ascii(source.label)}  ${ascii(source.href)}`)
      .join('\n');

    return `
${ascii(result.answer)}
${
  result.sources.length > 0
    ? `\n\x1b[90msources:\x1b[0m\n\x1b[90m${sourceLines}\x1b[0m\n`
    : ''
}`;
  },

  '?': (args: string[]) => commands['ask'](args),

  achievements: () => {
    const unlocked = getUnlocked();
    const rows = Object.keys(DISCOVERIES)
      .map((id) => {
        const discovery = DISCOVERIES[id];
        const found = unlocked.includes(id);
        const marker = found ? '[x]' : '[ ]';
        const color = found ? '\x1b[1;32m' : '\x1b[90m';
        return `  ${color}${marker} ${discovery.title}\x1b[0m\n      ${color}${discovery.detail}\x1b[0m`;
      })
      .join('\n');
    const { found, total } = discoveryProgress();

    return `
\x1b[1;32m=== ACHIEVEMENTS ===\x1b[0m

${rows}

\x1b[1;33mfound ${found} of ${total}\x1b[0m
`;
  },

  trophies: (args: string[]) => commands['achievements'](args),

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
  
  monitor: () => {
    // The only honest metric a static site has: how long this tab has
    // been open. Everything else here is verifiable fact, not dashboard
    // theatre.
    const seconds =
      typeof performance !== 'undefined' ? Math.floor(performance.now() / 1000) : 0;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `
\x1b[1;32m=== MONITORING (honest edition) ===\x1b[0m

\x1b[1;33mTarget:\x1b[0m this browser tab, the only infrastructure this site has
\x1b[1;36mHost:\x1b[0m GitHub Pages, static export, zero servers
\x1b[1;36mSession uptime:\x1b[0m ${mins}m ${secs}s (since you loaded the page)
\x1b[1;36mError budget:\x1b[0m intact, there is no backend to burn it
\x1b[1;36mAlerts firing:\x1b[0m 0, and it will stay that way

\x1b[1;33mThe stack I actually monitor with at work:\x1b[0m
  Prometheus, Grafana, Loki, OpenTelemetry, CloudWatch,
  Elasticsearch / ELK, OneUptime (self-hosted, on-call wired in)
`;
  },
  
  ping: (args: string[]) => {
    const host = args[0] || 'sagarbudhathoki.com';

    return `
\x1b[1;32mPING ${host}:\x1b[0m pong.

\x1b[1;36mRound trip:\x1b[0m 0ms. This page is a static export; it was already
in your browser cache before you asked.

\x1b[90mSent with love from Kathmandu.\x1b[0m
`;
  },

  trace: () => {
    return `
\x1b[1;36mbrowser → CDN → browser.\x1b[0m That is the whole trace.
Static export, no hops worth instrumenting.

\x1b[90mThe real tracing happens at work: OpenTelemetry, dual-exported to OneUptime and Loki.\x1b[0m
`;
  },
  
  docker: (args: string[]) => {
    const command = args[0] || 'run';
    
    // Trigger the Docker container animation
    console.log('Executing docker command:', command);
    triggerDockerAnimation();
    
    return `
\x1b[1;32m=== DOCKER CONTAINERIZATION ===\x1b[0m

\x1b[1;33mInitiating Docker ${command} operation...\x1b[0m

<<SEQUENTIAL_START>>
\x1b[1;36m[1/5]\x1b[0m Creating application network... \x1b[1;32m✓ Created\x1b[0m
\x1b[1;36m[2/5]\x1b[0m Pulling container images... \x1b[1;32m✓ Downloaded\x1b[0m
\x1b[1;36m[3/5]\x1b[0m Starting database container... \x1b[1;32m✓ Running\x1b[0m
\x1b[1;36m[4/5]\x1b[0m Starting application containers... \x1b[1;32m✓ Running\x1b[0m
\x1b[1;36m[5/5]\x1b[0m Configuring network connections... \x1b[1;32m✓ Connected\x1b[0m
<<SEQUENTIAL_END>>

\x1b[1;32mDocker containers running successfully!\x1b[0m
\x1b[1;36mContainer Network:\x1b[0m app-network
\x1b[1;36mRunning Containers:\x1b[0m 4
\x1b[1;36mStatus:\x1b[0m \x1b[1;32mHEALTHY\x1b[0m

\x1b[1;33mContainer orchestration visualization triggered in the Projects section!\x1b[0m
`;
  },
  
  scale: () => {
    return `
GitHub Pages already scales this site harder than any replica count I could type here.

\x1b[90mAt work, scaling is ECS service autoscaling and capacity math, not vibes.\x1b[0m
`;
  },
  
  infra: () => {
    return `
\x1b[1;32m=== THE PLATFORM I RUN (simplified, real) ===\x1b[0m

\x1b[1;36m  Internet\x1b[0m
\x1b[1;36m     |\x1b[0m
\x1b[1;36m  Route 53 --- CloudFront --- ALB\x1b[0m
\x1b[1;36m     |\x1b[0m
\x1b[1;36m  ECS Fargate services (eu-north-1)\x1b[0m
\x1b[1;36m     +-- Aurora PostgreSQL --- Global DB replica, eu-west-1 (DR)\x1b[0m
\x1b[1;36m     +-- ElastiCache Redis\x1b[0m
\x1b[1;36m     \`-- Amazon MQ\x1b[0m

\x1b[1;33mObservability:\x1b[0m
  OTEL collector dual-exports to OneUptime (K3s, eu-central-1) and Loki.
  Grafana on top of Prometheus, Loki and CloudWatch.

\x1b[1;33mProvisioning:\x1b[0m
  Terraform + Terragrunt for infra. One Python API call per new tenant.

Type 'projects' for the rack-by-rack tour. Type 'incident' for the war story.
`;
  },
  
  sudo: (args: string[]) => {
    const command = args.join(' ');

    if (command === 'make me a sandwich') {
      return `
\x1b[1;32mOkay.\x1b[0m 🥪
\x1b[90m(xkcd 149 compliance achieved.)\x1b[0m
`;
    }

    if (command === 'rm -rf /') {
      return commands['rm'](['-rf', '/']);
    }

    if (!command) {
      return `
usage: sudo [command]
\x1b[90mNot that it will help.\x1b[0m
`;
    }

    return `
\x1b[1;33m[sudo] password for visitor:\x1b[0m ********

\x1b[1;31mvisitor is not in the sudoers file.  This incident will be reported.\x1b[0m
\x1b[90mReported to whom? It's a static site. Nobody is listening. But it has been noted.\x1b[0m
`;
  },

  rm: (args: string[]) => {
    const flags = args.join(' ');

    if (flags.startsWith('-rf') || flags.startsWith('-fr')) {
      return `
\x1b[1;33mrm: nothing to delete.\x1b[0m

This is a static export. There is no server to cry on, no disk to wipe,
and GitHub Pages will just keep serving the same files out of spite.

\x1b[90mYour browser cache is the only thing at risk, and that one is on you.\x1b[0m
`;
    }

    return `rm: cannot remove '${flags || '?'}': read-only filesystem (it's a portfolio)`;
  },

  top: () => {
    // Parody process table for this site's scenes. Every value is a
    // joke on purpose; nothing here should read as a real metric.
    return `
\x1b[1;32m=== top (portfolio edition) ===\x1b[0m
\x1b[90mload average: chill, chill, chill\x1b[0m

\x1b[1;36m  PID  COMMAND        CPU   MEM         TIME      STATE\x1b[0m
    1  hero-orbit     yes   a few MB    forever   floating
    2  datacenter     yes   11 racks    static    humming
    3  journey        yes   since 2020  static    walking
    4  skills-hall    yes   curated     static    honest
    5  terminal       yes   this tab    now       you are here

\x1b[90mAll numbers are jokes. The scenes are real. Press nothing to exit.\x1b[0m
`;
  },

  htop: (args: string[]) => commands['top'](args),

  sl: () => {
    // For everyone who meant 'ls'. Tradition demands a train.
    return `
\x1b[1;33mYou typed 'sl'. You meant 'ls'. The train cares not.\x1b[0m

\x1b[1;36m      ====        ________                ___________
  _D _|  |_______/        \\__I_I_____===__|_________|
   |(_)---  |   H\\________/ |   |        =|___ ___|
   /     |  |   H  |  |     |   |         ||_| |_||
  |      |  |   H  |__--------------------| [___] |
  | ________|___H__/__|_____/[][]~\\_______|       |
  |/ |   |-----------I_____I [][] []  D   |=======|
__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__
 |/-=|___|=    ||    ||    ||    |_____/~\\___/
  \\_/      \\_O=====O=====O=====O_/      \\_/\x1b[0m

\x1b[90mNo brakes on the typo train. ('ls' does exist here; you just missed it.)\x1b[0m
`;
  },
  
  coffee: () => {
    // Calculate coffee brewing metrics
    const brewTemp = 94;
    const extractionTime = 25 + Math.floor(Math.random() * 5);
    const caffeineLevel = 85 + Math.floor(Math.random() * 15);
    const coffeeVersion = '2.5.' + Math.floor(Math.random() * 10);
    
    // For sequential display, we'll use a special marker that the terminal component will recognize
    // The terminal will look for this marker and handle the sequential display
    return `
\x1b[1;32m=== coffee DEPLOYMENT PIPELINE ===\x1b[0m

\x1b[1;33mInitiating coffee microservice deployment...\x1b[0m

<<SEQUENTIAL_START>>
\x1b[1;36m[1/6]\x1b[0m Provisioning water resources to ${brewTemp}°C... \x1b[1;32m✓ Done\x1b[0m
\x1b[1;36m[2/6]\x1b[0m Containerizing coffee beans (Alpine grind)... \x1b[1;32m✓ Done\x1b[0m
\x1b[1;36m[3/6]\x1b[0m Establishing bean-to-water handshake... \x1b[1;32m✓ Connected\x1b[0m
\x1b[1;36m[4/6]\x1b[0m Extracting caffeine payload (${extractionTime}s)... \x1b[1;32m✓ Extracted\x1b[0m
\x1b[1;36m[5/6]\x1b[0m Load balancing to your mug... \x1b[1;32m✓ Distributed\x1b[0m
\x1b[1;36m[6/6]\x1b[0m Running health checks... \x1b[1;32m✓ Aromatic\x1b[0m
<<SEQUENTIAL_END>>

\x1b[1;32mcoffee v${coffeeVersion} successfully deployed!\x1b[0m

${asciiArt.coffee}

\x1b[1;33mService Status:\x1b[0m
  \x1b[1;36mBrew Pressure:   \x1b[0m [${generateBar(90)}] plenty (measured in vibes, not bars)
  \x1b[1;36mCaffeine Level:  \x1b[0m [${generateBar(caffeineLevel)}] ${caffeineLevel}%
  \x1b[1;36mFlavor Profile:  \x1b[0m [${generateBar(90)}] Excellent
  \x1b[1;36mUptime Impact:   \x1b[0m [${generateBar(95)}] Productivity +95%

\x1b[1;33mEnjoy your virtual Lemon Tea!\x1b[0m
\x1b[90mRemember: The best error message is the one that never needs to be displayed (because you had Lemon Tea first).\x1b[0m
\x1b[90mPro tip: For a stronger brew, try 'coffee | Lemon Tea > mug.big'\x1b[0m
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
  
  matrix: () => {
    // Generate a simple matrix-like effect
    const characters = '01';
    const lines = [];
    
    for (let i = 0; i < 15; i++) {
      let line = '';
      for (let j = 0; j < 50; j++) {
        // Random character from the characters string
        const char = characters.charAt(Math.floor(Math.random() * characters.length));
        // Random color intensity
        const intensity = Math.random() > 0.7 ? '1;32' : '0;32'; // bright green or dark green
        line += `\x1b[${intensity}m${char}\x1b[0m`;
      }
      lines.push(line);
    }
    
    return `
\x1b[1;32m=== ENTERING THE MATRIX ===\x1b[0m

${lines.join('\n')}

\x1b[1;33mWake up, DevOps Engineer...\x1b[0m
\x1b[1;33mThe Matrix has you...\x1b[0m
\x1b[1;33mFollow the white rabbit to Kubernetes...\x1b[0m

\x1b[90mRemember: There is no spoon, only infrastructure as code.\x1b[0m
`;
  },
  
  cowsay: (args: string[]) => {
    const message = args.join(' ') || 'Moo! I\'m a DevOps cow!';
    const messageLines = [];
    
    // Split message into lines of max 40 characters
    let currentLine = '';
    message.split(' ').forEach(word => {
      if ((currentLine + ' ' + word).length <= 40) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        messageLines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) {
      messageLines.push(currentLine);
    }
    
    // Create the speech bubble
    const bubbleWidth = Math.max(...messageLines.map(line => line.length)) + 2;
    const top = ' ' + '_'.repeat(bubbleWidth);
    const bottom = ' ' + '‾'.repeat(bubbleWidth);
    const lines = messageLines.map((line, i) => {
      const padding = ' '.repeat(bubbleWidth - line.length - 2);
      if (messageLines.length === 1) {
        return `< ${line}${padding} >`;
      } else if (i === 0) {
        return `/ ${line}${padding} \\`;
      } else if (i === messageLines.length - 1) {
        return `\\ ${line}${padding} /`;
      } else {
        return `| ${line}${padding} |`;
      }
    });
    
    // Combine the speech bubble with the cow
    return `
\x1b[1;32m=== COWSAY ===\x1b[0m

\x1b[1;36m${top}
${lines.join('\n')}
${bottom}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||\x1b[0m

\x1b[90mPro tip: Try 'cowsay [your message]' to make the cow say something else!\x1b[0m
`;
  },
  
  fortune: () => {
    const fortunes = [
      "The best way to predict the future is to implement it.",
      "A good SRE knows how to break things. A great SRE knows what will break without intervention.",
      "Given enough eyeballs, all bugs are shallow. Given enough Lemon Tea, all PRs get reviewed.",
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
      "The cloud is where your data goes to meet data from other companies.",
      "Kubernetes: Because 'container orchestration' sounds better than 'Docker babysitting'.",
      "A DevOps engineer walks into a bar. No wait, that was a pub/sub system.",
      "Why did the developer go broke? Because they used up all their cache.",
      "What's a DevOps engineer's favorite movie? The NeverEnding Story (also known as log files).",
      "Docker: Helping developers answer 'but it works on my machine' since 2013.",
      "Git happens. That's why we have branches.",
      "I would tell you a UDP joke, but you might not get it.",
      "I'd tell you a TCP joke, but I'd have to keep repeating it until you got it.",
      "Why do programmers prefer dark mode? Because light attracts bugs.",
      "The problem with troubleshooting is that trouble shoots back.",
      "To understand recursion, you must first understand recursion.",
      "Always code as if the person who will maintain your code is a violent psychopath who knows where you live.",
      "The best performance improvement is the one that's not needed. Ship less code.",
      "Terraform: Making infrastructure so easy to create that you'll have 17 different AWS accounts by lunchtime."
    ];
    
    const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];

    return `
\x1b[1;32m=== DEVOPS FORTUNE ===\x1b[0m

\x1b[1;33m" ${randomFortune} "\x1b[0m

\x1b[90mYour DevOps fortune cookie has been consumed. No refunds.\x1b[0m
\x1b[90mRemember: In case of emergency, break glass and run 'kubectl delete pod --all'.\x1b[0m
`;
  },

  kubectl: (args: string[]) => {
    if (args.length === 0) {
      return `
kubectl controls the sagarbudhathoki.com cluster.

Usage:
  \x1b[1;36mkubectl get pods\x1b[0m     List this site's sections as pods

That's the whole API surface. RBAC here is extremely strict.
`;
    }

    if (args[0] === 'get' && ['pods', 'pod', 'po'].includes(args[1])) {
      return `
\x1b[1;36mNAME                 READY   STATUS    RESTARTS   AGE\x1b[0m
hero-7f8d9           1/1     Running   0          static
avatar-3c41b         1/1     Running   0          static
datacenter-a2e57     1/1     Running   0          static
journey-66f1d        1/1     Running   0          static
skills-hall-b9d04    1/1     Running   0          static
terminal-1f4a2       1/1     Running   0          static
blog-7c9e0           1/1     Running   0          static

\x1b[90mAll Running. No CrashLoopBackOff on this resume.\x1b[0m
`;
    }

    return `
\x1b[1;31mError from server (Forbidden):\x1b[0m "${args.join(' ')}" is above this terminal's pay grade. Try 'kubectl get pods'.
`;
  },

  terraform: (args: string[]) => {
    if (args[0] === 'plan') {
      return `
\x1b[1;32m=== terraform plan ===\x1b[0m

Terraform will perform the following actions:

  \x1b[1;32m# site_visitor.you\x1b[0m will be created
  \x1b[1;32m+\x1b[0m resource "site_visitor" "you" {
      \x1b[1;32m+\x1b[0m impressed  = (known after apply)
      \x1b[1;32m+\x1b[0m tab_status = "open"
      \x1b[1;32m+\x1b[0m next_step  = "type 'contact'"
    }

\x1b[1;33mPlan: 1 to add, 0 to change, 0 to destroy.\x1b[0m
`;
    }

    if (args[0] === 'apply') {
      return `
\x1b[1;31mError: approval required\x1b[0m

This plan changes head count, and auto-approve is disabled for
career resources. To apply: hire him. Type 'contact' to start.
`;
    }

    return `
Usage: terraform [plan|apply]
\x1b[90mState is stored in his head, with locking enabled.\x1b[0m
`;
  },

  neofetch: () => {
    return `
\x1b[1;36m${asciiArt.brain}\x1b[0m

\x1b[1;32msagar\x1b[0m@\x1b[1;32msagarbudhathoki.com\x1b[0m
-------------------------
\x1b[1;33mOS:\x1b[0m        Static export (no server harmed in serving this page)
\x1b[1;33mHost:\x1b[0m      GitHub Pages
\x1b[1;33mFramework:\x1b[0m Next.js 15
\x1b[1;33mRenderer:\x1b[0m  React Three Fiber (the 3D home), plain DOM here
\x1b[1;33mShell:\x1b[0m     this terminal
\x1b[1;33mUptime:\x1b[0m    static, there is nothing to go down
\x1b[1;33mPackages:\x1b[0m  see 'skills'
\x1b[1;33mTheme:\x1b[0m     green on black, as nature intended
`;
  },

  vim: (args: string[]) => {
    vimActive = true;
    const file = args[0] || 'resume.txt';

    return `
\x1b[1;32m"${file}"\x1b[0m [New File]

~
~                  VIM - Vi IMproved
~
~              You are now inside Vim.
~         Statistically, some never leave.
~
~    Type \x1b[1;36m:q!\x1b[0m and press Enter to get out.
~

\x1b[1;31mE37: No write since last change (add ! to override)\x1b[0m
`;
  },

  ssh: (args: string[]) => {
    const host = args[0] || 'production';

    return `
\x1b[1;33mConnecting to ${host}...\x1b[0m

\x1b[1;31m${host}: Permission denied (publickey,hire_me).\x1b[0m

No stray SSH keys here. Production access goes through onboarding,
least privilege, and an offer letter. Type 'contact' to begin auth.
`;
  },

  git: (args: string[]) => {
    if (args[0] === 'log') {
      return `
\x1b[1;32m=== git log --oneline career ===\x1b[0m

\x1b[1;33m9f3a1c2\x1b[0m (2025) Deploy self-hosted observability platform on K3s: OneUptime in eu-central-1
\x1b[1;33m7d4b8e1\x1b[0m (2024) Build cross-region DR: Aurora Global Database, EFS + ECR replication, shared KMS keys
\x1b[1;33m3c9f2a7\x1b[0m (2024) Fix 19-minute platform outage: blocking Redis KEYS calls exhausted the JDBC pool
\x1b[1;33m5e1d6b4\x1b[0m Ship tenant provisioning API: one call wires Aurora, SQS, ALB, CloudFront, Route 53
\x1b[1;33m1a2f9c8\x1b[0m (2023) Take sole ownership of a production AWS platform: ECS Fargate, Aurora, Redis
\x1b[1;33m0b8e4d3\x1b[0m (2020) Initial commit: start the DevOps career

\x1b[90mEvery one of these shipped to production. No force pushes.\x1b[0m
`;
    }

    return `
git: this portfolio is already committed. Try 'git log'.
`;
  },

  tour: () => {
    // The real tour lives in the Terminal component, because it needs
    // the terminal instance to auto-type. This fallback only appears
    // if the registry is invoked directly (e.g. through a grep pipe).
    return `
tour: a guided walkthrough (about, skills, projects, incident), auto-typed.
Run it at the interactive prompt.
`;
  },

  demo: (args: string[]) => commands['tour'](args)
};

// Strip ANSI color escapes so grep matching and the YAML rendering
// operate on the text a human actually sees.
function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}

// Re-render the canonical 'skills' output as YAML-ish text. Derived
// from the command itself, so the file and the command can never
// drift apart. Section headers become keys, wrapped lines fold.
function skillsAsYaml(): string {
  const lines = stripAnsi(commands['skills']([])).split('\n');
  const out: string[] = [
    '# skills.yaml',
    '# Same data as the skills command. If it is not here, it is not claimed.',
    '',
  ];
  let key: string | null = null;
  let values: string[] = [];

  const flush = () => {
    if (key && values.length === 1) {
      out.push(`${key}: ${values[0]}`);
    } else if (key && values.length > 1) {
      out.push(`${key}: >-`);
      values.forEach((value) => out.push(`  ${value}`));
    }
    key = null;
    values = [];
  };

  for (const line of lines) {
    if (!line.trim()) continue;
    if (!/^\s/.test(line) && line.trimEnd().endsWith(':')) {
      flush();
      key = line
        .trimEnd()
        .slice(0, -1)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
    } else if (key && /^\s/.test(line)) {
      values.push(line.trim());
    }
  }
  flush();

  return `\n${out.join('\n')}\n`;
}

// Virtual filesystem backing 'ls' and 'cat'. Every file reuses the
// honest command outputs above; nothing here is a second copy that
// could rot out of sync.
const FILES: Record<string, () => string> = {
  'about.txt': () => commands['about']([]),
  'skills.yaml': () => skillsAsYaml(),
  'projects.md': () => commands['projects']([]),
  'incident-2024.md': () => commands['incident']([]),
  'infra.txt': () => commands['infra']([]),
  'contact.txt': () => commands['contact']([]),
};

// Levenshtein distance, used for 'did you mean' suggestions
function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }

  return row[b.length];
}

// Whether the vim trap is holding the terminal. The Terminal shell
// checks this before its own side paths (local clear, section
// navigation, loading spinners) so nothing bypasses the trap.
export function isVimActive(): boolean {
  return vimActive;
}

// Every registered command name, for the shell's tab completion.
// New commands join automatically because the registry is the
// single source of truth (same as the did-you-mean index).
export function getCommandNames(): string[] {
  return Object.keys(commands);
}

// Execute a command and return the output
export function executeCommand(input: string): string {
  // Add to history (the full line, pipe and all, like a real shell)
  commandHistory.push(input);

  // Vim trap: once inside, only a proper quit gets you out
  if (vimActive) {
    const vimInput = input.trim();
    if ([':q', ':q!', ':wq', ':wq!', ':x', ':qa', ':qa!'].includes(vimInput)) {
      vimActive = false;
      // Genuine curiosity reward: found the way out of the vim trap. SSR-safe
      // (the lib guards window); the flavor text below is the feedback.
      unlockDiscovery('vim-escape');
      return `
\x1b[1;32mYou escaped Vim. Genuinely impressive.\x1b[0m
Back in the shell. Type 'help' to continue.
`;
    }
    return `
\x1b[1;31mE492: Not an editor command: ${vimInput}\x1b[0m
\x1b[90mStill inside Vim. The way out is ':q!' then Enter.\x1b[0m
`;
  }

  // One pipe stage: '<command> | grep [-i] <pattern>'. The left side
  // runs through the normal dispatch (runCommand, so it is not pushed
  // into history a second time); a line survives the filter when its
  // ANSI-stripped text contains the pattern case-insensitively, and
  // matched lines keep their original coloring.
  const pipeIndex = input.indexOf('|');
  if (pipeIndex !== -1) {
    const left = input.slice(0, pipeIndex).trim();
    const right = input.slice(pipeIndex + 1).trim();
    const grepMatch = right.match(/^grep\s+(?:-i\s+)?(.+)$/);

    if (input.indexOf('|', pipeIndex + 1) !== -1 || !grepMatch) {
      return "\nonly '| grep <pattern>' is supported in this shell\n";
    }

    let pattern = grepMatch[1].trim();
    // Tolerate quotes: grep "redis" and grep redis both work
    if (
      pattern.length >= 2 &&
      ((pattern.startsWith('"') && pattern.endsWith('"')) ||
        (pattern.startsWith("'") && pattern.endsWith("'")))
    ) {
      pattern = pattern.slice(1, -1);
    }
    const needle = pattern.toLowerCase();

    // No matches means empty output, exactly like real grep.
    return runCommand(left)
      .split('\n')
      .filter((line) => stripAnsi(line).toLowerCase().includes(needle))
      .join('\n');
  }

  return runCommand(input);
}

// Dispatch a single plain command: no pipe handling, no history push.
function runCommand(input: string): string {
  // Parse command and arguments
  const [command, ...args] = input.trim().split(' ');

  // Check if command exists
  if (command in commands) {
    // Get the command output
    let output = commands[command](args);

    // Check if we're on mobile and need to adapt the output
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      // For mobile, simplify ASCII art and long outputs
      output = adaptOutputForMobile(output);
    }

    return output;
  }

  // Unknown command: suggest the closest registered command (edit distance <= 2)
  let suggestion: string | null = null;
  let bestDistance = 3;
  for (const name of Object.keys(commands)) {
    const distance = editDistance(command.toLowerCase(), name);
    if (distance < bestDistance) {
      bestDistance = distance;
      suggestion = name;
    }
  }

  return `
\x1b[1;31mCommand not found: ${command}\x1b[0m${suggestion ? `\nDid you mean \x1b[1;36m${suggestion}\x1b[0m?` : ''}
Type 'help' to see available commands.
`;
}

// Helper function to adapt command outputs for mobile
function adaptOutputForMobile(output: string): string {
  // Split output into lines
  const lines = output.split('\n');
  
  // Process each line
  const processedLines = lines.map(line => {
    // If it's an ASCII art line with complex characters, simplify it for mobile
    if (line.includes('\x1b[') && (
        line.includes('█') || 
        line.includes('═') || 
        line.includes('│') || 
        line.includes('┌') || 
        line.includes('┐') || 
        line.includes('└') || 
        line.includes('┘') || 
        line.includes('├') || 
        line.includes('┤') || 
        line.includes('┬') || 
        line.includes('┴') || 
        line.includes('┼')
      )) {
      // For complex ASCII art, provide a simplified version
      if (line.includes('Infrastructure Diagram') || line.includes('Kubernetes') || line.includes('Load Balancer')) {
        return line; // Keep headers
      }
      
      // Simplify complex ASCII art lines but don't remove them completely
      if (line.trim().length > 0) {
        // Replace complex box drawing characters with simpler ones
        return line
          .replace(/[┌┐└┘├┤┬┴┼]/g, '+')
          .replace(/[═│]/g, '-')
          .replace(/[█]/g, '#');
      }
    }
    
    // For other lines, keep them as is - they'll wrap naturally
    return line;
  });
  
  // Remove consecutive empty lines (keep single empty lines for spacing)
  const filteredLines = [];
  let lastLineEmpty = false;
  
  for (const line of processedLines) {
    if (line.trim() === '') {
      if (!lastLineEmpty) {
        filteredLines.push(line);
        lastLineEmpty = true;
      }
    } else {
      filteredLines.push(line);
      lastLineEmpty = false;
    }
  }
  
  return filteredLines.join('\n');
}
