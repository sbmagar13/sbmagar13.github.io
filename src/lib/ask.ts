// =============================================================================
// ASK ENGINE · "ask this site anything"
//
// A deterministic, offline, client-safe function that answers natural-language
// questions about Sagar from the real career data, with source links. No
// network, no API key, no LLM. Every factual clause traces back to a string in
// src/data/career.ts.
//
// Two layers:
//   1. INTENT MAP   - curated answers for the common recruiter questions.
//   2. FALLBACK     - token-overlap retrieval over war stories, projects,
//                     skills, and milestones when no intent matches.
//   3. NO-MATCH     - honest fallback that still points at /work + contact.
//
// No 'use client' directive: this module stays importable from server and
// client alike. Answers are plain ASCII text (rendered in the xterm terminal
// and in the DOM); they may contain '\n' but no Unicode beyond 0x20-0x7E.
// =============================================================================

import {
  IDENTITY,
  STORIES,
  RACKS,
  SKILLS,
  MILESTONES,
  realProjects,
  type ToolId,
  type RackData,
  type SkillData,
  type Milestone,
} from '@/data/career';

// -----------------------------------------------------------------------------
// Public contract
// -----------------------------------------------------------------------------

export interface AskSource {
  label: string;
  href: string;
}

export interface AskResult {
  answer: string;
  sources: AskSource[];
  matched: boolean;
}

// -----------------------------------------------------------------------------
// Internal route + link constants (all verified to exist in src/app)
// -----------------------------------------------------------------------------

const ROUTE_WORK = '/work';
const ROUTE_RESUME = '/resume';
const ROUTE_RESUME_PDF = '/resume.pdf';
const ROUTE_OUTAGE = '/writing/redis-keys-outage';

const SOURCE_WORK: AskSource = { label: '/work', href: ROUTE_WORK };
const SOURCE_RESUME: AskSource = { label: '/resume', href: ROUTE_RESUME };
const SOURCE_RESUME_PDF: AskSource = { label: '/resume.pdf', href: ROUTE_RESUME_PDF };
const SOURCE_OUTAGE: AskSource = { label: '/writing/redis-keys-outage', href: ROUTE_OUTAGE };
const SOURCE_GITHUB: AskSource = { label: 'github.com/sbmagar13', href: IDENTITY.links.github };
const SOURCE_LINKEDIN: AskSource = { label: 'linkedin.com/in/sbmagar13', href: IDENTITY.links.linkedin };

// The honest contact line, reused by several intents and the no-match path.
const CONTACT_LINE = `Email me at ${IDENTITY.email}, or find me on github.com/sbmagar13 and linkedin.com/in/sbmagar13.`;

// Drop duplicate sources by href, preserving first-seen order. A rack with no
// repo falls back to /work, which can then collide with an appended /work.
function dedupeSources(sources: AskSource[]): AskSource[] {
  const seen = new Set<string>();
  const out: AskSource[] = [];
  for (const source of sources) {
    if (seen.has(source.href)) continue;
    seen.add(source.href);
    out.push(source);
  }
  return out;
}

// -----------------------------------------------------------------------------
// Normalisation helpers
// -----------------------------------------------------------------------------

// Lowercase, strip punctuation to spaces, collapse whitespace. Keeps letters,
// digits, and spaces only so the intent patterns and tokenizer agree.
function normalize(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Synonym map folds common shorthand onto the vocabulary the data uses, so a
// query for "k8s" reaches the Kubernetes story and "iac" reaches Terraform.
const SYNONYMS: Record<string, string> = {
  k8s: 'kubernetes',
  kube: 'kubernetes',
  iac: 'terraform',
  tf: 'terraform',
  ci: 'pipeline',
  cd: 'pipeline',
  cicd: 'pipeline',
  pipelines: 'pipeline',
  db: 'database',
  databases: 'database',
  postgres: 'postgresql',
  pg: 'postgresql',
  otel: 'opentelemetry',
  obs: 'observability',
  monitoring: 'observability',
  dr: 'disaster',
  failover: 'disaster',
  llm: 'ai',
  agent: 'ai',
  agents: 'ai',
  agentic: 'ai',
  ml: 'ai',
  sre: 'reliability',
  postmortem: 'incident',
  outage: 'incident',
  cloud: 'aws',
  remote: 'location',
  relocate: 'location',
  timezone: 'location',
  cv: 'resume',
};

// Tokenize a normalized string into folded tokens (synonyms applied), dropping
// short stop-ish tokens that add noise to the overlap score.
const STOP_TOKENS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'do', 'does', 'for',
  'has', 'have', 'how', 'in', 'is', 'it', 'me', 'of', 'on', 'or', 'show', 'tell',
  'the', 'to', 'use', 'used', 'using', 'what', 'whats', 'with', 'you', 'your',
  'about', 'any', 'did', 'got', 'his', 'her', 'this', 'that', 'them', 'there',
  'know', 'knows', 'tell', 'show', 'give', 'want', 'need', 'whatre', 'were',
  'work', 'experience', 'much',
]);

function tokenize(normalized: string): string[] {
  const out: string[] = [];
  for (const raw of normalized.split(' ')) {
    if (!raw) continue;
    const folded = SYNONYMS[raw] ?? raw;
    if (folded.length < 2) continue;
    if (STOP_TOKENS.has(folded)) continue;
    out.push(folded);
  }
  return out;
}

// Trim a body of prose down to its first sentence so the fallback renders one
// clean clause rather than a whole paragraph. If that sentence is long (some
// career.ts bodies are a single 240-char sentence), keep it whole; only an
// even longer sentence is truncated, and then at a word boundary.
const MAX_SENTENCE = 260;
function firstSentence(text: string): string {
  const trimmed = text.trim();
  const period = trimmed.indexOf('. ');
  if (period > 0 && period < MAX_SENTENCE) {
    return trimmed.slice(0, period + 1);
  }
  if (trimmed.length <= MAX_SENTENCE) return trimmed;
  // Truncate at the last space before the cap so we never cut mid-word.
  const head = trimmed.slice(0, MAX_SENTENCE);
  const lastSpace = head.lastIndexOf(' ');
  return (lastSpace > 0 ? head.slice(0, lastSpace) : head).trimEnd() + '...';
}

// -----------------------------------------------------------------------------
// Intent map
// -----------------------------------------------------------------------------

// An intent is a set of trigger keywords (and optional multi-word phrases)
// plus a builder that returns a curated AskResult. The matcher scores every
// intent by how many distinct keywords/phrases hit the query and picks the
// highest score; ties break by declaration order. So specific intents are
// declared FIRST (kubernetes, incident, dr, ai, ...) and broad ones LAST
// (experience, availability, skills), which lets "production kubernetes
// experience" land on kubernetes rather than the generic experience pitch.
interface Intent {
  // Whole-token keywords; tested against the normalized query padded with
  // spaces so "ai" never matches inside "available".
  keywords: string[];
  // Optional multi-word phrases (already normalized, single-spaced) tested as
  // substrings of the padded query, used to disambiguate collisions like
  // "biggest problem" (incident) vs "biggest project" (projects).
  phrases?: string[];
  build: () => AskResult;
}

// Reused identity fragments, copied straight from career.ts (no embellishment).
const YEARS = IDENTITY.yearsLabel; // '5+ Years'
const TITLE = IDENTITY.title; // 'Senior DevOps / SRE Engineer'

// Python years, read from the SKILLS table so the number is never hand-typed.
function pySkillYears(): number {
  const py = SKILLS.find((s) => s.id === 'python');
  return py ? py.years : 5;
}

// Declaration order doubles as tie-break priority: SPECIFIC intents first
// (a named tool or named story), GENERIC intents last (experience, hiring,
// stack). When "production kubernetes experience" hits both the kubernetes
// and experience intents at score 1, kubernetes wins because it is declared
// earlier. Likewise the why-hire pitch is declared before plain availability
// so "why should I hire you" picks the pitch, while "are you available to
// hire" still picks availability.
const INTENTS: Intent[] = [
  // ===== SPECIFIC: named tools and named stories ============================

  // --- kubernetes -------------------------------------------------------------
  {
    keywords: ['kubernetes', 'k3s'],
    build: () => ({
      answer:
        `Yes. I run a self-hosted SRE platform on K3s: OneUptime on a K3s cluster in eu-central-1 for status pages, uptime monitoring, on-call scheduling, and incident management. ` +
        `It sits in a separate region from primary so observability survives a primary-region outage.`,
      sources: [SOURCE_WORK],
      matched: true,
    }),
  },
  // --- docker / containers / CI / pipelines ----------------------------------
  {
    keywords: ['docker', 'container', 'containers', 'pipeline', 'pipelines', 'jenkins', 'gitlab', 'codepipeline'],
    build: () => ({
      answer:
        `I containerise build and deploy pipelines across three platforms: Jenkins, GitLab CI, and AWS CodePipeline / CodeBuild. ` +
        `Targets include ECS, Lambda, CloudFront, and EC2, and app and infra share the same pipeline patterns so one change can flow through any of them.`,
      sources: [SOURCE_WORK],
      matched: true,
    }),
  },
  // --- incident / outage / reliability ---------------------------------------
  {
    keywords: ['incident', 'outage', 'postmortem', 'reliability', 'redis'],
    phrases: ['biggest problem', 'hardest problem', 'biggest challenge'],
    build: () => ({
      answer:
        `My hardest incident: a 19-minute full-platform outage caused by blocking Redis KEYS calls exhausting the Tomcat/JDBC thread pool. ` +
        `I added connection-pool checkout timeouts, tuned RDS parameters, then drove a 68-task reliability program across 11 epics and 7 sprints to prevent recurrence.`,
      sources: [SOURCE_OUTAGE, SOURCE_WORK],
      matched: true,
    }),
  },
  // --- disaster recovery / failover ------------------------------------------
  {
    keywords: ['disaster', 'failover', 'multiregion', 'resilience'],
    phrases: ['disaster recovery'],
    build: () => ({
      answer:
        `I built cross-region disaster recovery where none existed: Aurora Global Database from eu-north-1 to eu-west-1, EFS and ECR replication, shared KMS keys, and a documented runbook for promotion.`,
      sources: [SOURCE_WORK],
      matched: true,
    }),
  },
  // --- AI / agents / MCP / LLM ------------------------------------------------
  {
    keywords: ['ai', 'mcp', 'agent', 'agents', 'agentic', 'llm', 'langgraph', 'langchain', 'claude', 'anthropic'],
    build: () => ({
      answer:
        `I am building MCP-based AI agents that wrap real DevOps tasks (log triage, runbook prompts, infra analysis) so Claude and similar assistants can drive them. ` +
        `The current focus is the broader agentic-DevOps stack: MCP, LangGraph, and local LLM inference.`,
      sources: [SOURCE_WORK],
      matched: true,
    }),
  },
  // --- terraform / IaC --------------------------------------------------------
  {
    keywords: ['terraform', 'terragrunt', 'ansible', 'iac'],
    build: () => ({
      answer:
        `Terraform is my primary IaC, with Terragrunt to keep it DRY across environments. ` +
        `One example: a self-managed three-node Elasticsearch cluster orchestrated with Terraform and Ansible, with split deploy and split-restart playbooks so a single config change cannot cascade.`,
      sources: [SOURCE_WORK],
      matched: true,
    }),
  },
  // --- python -----------------------------------------------------------------
  {
    keywords: ['python', 'fastapi', 'django', 'flask'],
    build: () => ({
      answer:
        `Python is my primary language, ${pySkillYears()}+ years, FastAPI / Django / Flask. ` +
        `I built a tenant-provisioning orchestrator where one Python API call sets up schema-per-tenant on Aurora, wires SQS and EventBridge, creates ALB listener rules, provisions a CloudFront / S3 distribution, configures Route 53 records, and registers the tenant in DynamoDB.`,
      sources: [SOURCE_WORK],
      matched: true,
    }),
  },
  // --- observability / monitoring --------------------------------------------
  {
    keywords: ['observability', 'monitoring', 'grafana', 'prometheus', 'loki', 'opentelemetry', 'otel'],
    build: () => ({
      answer:
        `I consolidated fragmented monitoring into one stack: Grafana over Prometheus, Loki, and CloudWatch with per-cluster, per-namespace, and per-tenant dashboards. ` +
        `An OpenTelemetry collector dual-exports metrics, logs, and traces to OneUptime and Loki, so if a primary-region failure takes the main stack down the OneUptime side still pages.`,
      sources: [SOURCE_WORK],
      matched: true,
    }),
  },
  // --- AWS / cloud ------------------------------------------------------------
  {
    keywords: ['aws', 'cloud', 'ecs', 'fargate', 'lambda'],
    build: () => ({
      answer:
        `I am the sole owner of a multi-tenant SaaS on AWS, running 15+ services in production: ECS Fargate behind ALB, Aurora PostgreSQL with schema-per-tenant, ElastiCache Redis, Amazon MQ, and a DynamoDB tenant registry.`,
      sources: [SOURCE_WORK],
      matched: true,
    }),
  },

  // ===== INTENT: actions and meta ===========================================

  // --- resume / cv ------------------------------------------------------------
  {
    keywords: ['resume', 'cv'],
    build: () => ({
      answer:
        `My full resume is at /resume, and there is a print-perfect PDF at /resume.pdf.`,
      sources: [SOURCE_RESUME, SOURCE_RESUME_PDF],
      matched: true,
    }),
  },
  // --- contact ----------------------------------------------------------------
  // No bare "github" keyword: "github actions" is a CI question, not a request
  // for contact links, and falls through to the fallback CI / skills match.
  {
    keywords: ['contact', 'email', 'reach', 'linkedin', 'message'],
    build: () => ({
      answer: CONTACT_LINE,
      sources: [SOURCE_RESUME, SOURCE_GITHUB, SOURCE_LINKEDIN],
      matched: true,
    }),
  },
  // --- salary / rate / comp ---------------------------------------------------
  // No "cost" keyword: that collides with "cost optimization" (a real
  // project), which we let the fallback answer instead.
  {
    keywords: ['salary', 'rate', 'compensation', 'comp', 'pay', 'expectation', 'expectations'],
    build: () => ({
      answer:
        `I do not list a number here. Happy to discuss compensation directly by email at ${IDENTITY.email} once we know the role fits.`,
      sources: [SOURCE_RESUME],
      matched: true,
    }),
  },
  // --- why hire / strength (declared before availability so "why hire" wins) -
  {
    keywords: ['why', 'strength', 'strengths', 'pitch'],
    phrases: ['why you', 'why hire', 'why should'],
    build: () => ({
      answer:
        `I am a ${TITLE} with ${YEARS} who owns a production multi-tenant SaaS on AWS end to end. ` +
        `I have recovered a 19-minute platform outage and driven the 68-task reliability program that followed, and I built cross-region disaster recovery from eu-north-1 to eu-west-1 where none existed. ` +
        `Lately I am building AI agents for real DevOps work with MCP and LangGraph.`,
      sources: [SOURCE_WORK, SOURCE_OUTAGE],
      matched: true,
    }),
  },
  // --- availability / hiring --------------------------------------------------
  {
    keywords: ['available', 'availability', 'hire', 'hiring', 'opportunity', 'opportunities'],
    build: () => ({
      answer:
        `Yes. I am open to remote senior DevOps / SRE roles. ` +
        `The fastest way to reach me is email: ${IDENTITY.email}.`,
      sources: [SOURCE_RESUME],
      matched: true,
    }),
  },
  // --- location / remote / timezone ------------------------------------------
  {
    keywords: ['location', 'where', 'based', 'kathmandu', 'nepal', 'timezone', 'relocate', 'remote'],
    build: () => ({
      // IDENTITY.location is 'Kathmandu, Nepal · open to remote'; take the
      // city/country half before the middot, never re-append a country.
      answer:
        `I am based in ${IDENTITY.location.split(' ·')[0]}, and set up to work remote. ` +
        `I am open to remote senior DevOps / SRE roles.`,
      sources: [SOURCE_WORK],
      matched: true,
    }),
  },

  // ===== GENERIC: broad, declared last so specific intents win ties =========

  // --- skills / stack ---------------------------------------------------------
  {
    keywords: ['skills', 'stack', 'tools', 'tech', 'technologies'],
    build: () => ({
      answer:
        `My core stack: AWS (sole owner of a multi-tenant SaaS, 15+ services), Terraform and Terragrunt for IaC, Docker and Kubernetes (K3s) for containers, ` +
        `GitLab CI / Jenkins / CodePipeline for delivery, Grafana / Prometheus / Loki / OpenTelemetry for observability, and Python as my primary language.`,
      sources: [SOURCE_WORK],
      matched: true,
    }),
  },
  // --- projects / portfolio ---------------------------------------------------
  // No bare "work"/"build" keyword: those collide with natural phrasings like
  // "your aurora work", which should reach the specific story via fallback.
  {
    keywords: ['projects', 'project', 'portfolio'],
    build: () => ({
      answer:
        `${realProjects().length} real projects are on the site, including the EventLogic multi-tenant SaaS I solely own, cross-region DR (eu-north-1 to eu-west-1), the Python tenant-provisioning orchestrator, the 19-minute outage reliability program, and self-hosted OneUptime observability on K3s. ` +
        `See them all at /work.`,
      sources: [SOURCE_WORK],
      matched: true,
    }),
  },
  // --- experience / seniority -------------------------------------------------
  {
    keywords: ['experience', 'years', 'senior', 'seniority'],
    build: () => ({
      answer:
        `I am Sagar Budhathoki, ${TITLE}, with ${YEARS} of experience. ` +
        `I am the sole owner of a production multi-tenant event SaaS on AWS: I build it, run it, and fix it end to end.`,
      sources: [SOURCE_WORK],
      matched: true,
    }),
  },
  // --- who / about / intro ----------------------------------------------------
  {
    keywords: ['who', 'introduce', 'introduction', 'bio', 'yourself', 'name'],
    build: () => ({
      answer:
        `I am Sagar Budhathoki, a ${TITLE} with ${YEARS}, based in Kathmandu and working remote. ` +
        `I am the sole owner of a Swedish multi-tenant event SaaS on AWS, and lately I am building AI agents for ops.`,
      sources: [SOURCE_WORK],
      matched: true,
    }),
  },
];

// Whole-word keyword test against the space-padded normalized query, so "ai"
// never matches inside "available" and "ci" never matches inside "incident".
function hasKeyword(padded: string, keyword: string): boolean {
  return padded.includes(` ${keyword} `);
}

// Score = distinct keyword hits + distinct phrase hits. Highest score wins;
// ties break by declaration order (specific intents are declared first).
function scoreIntent(padded: string, intent: Intent): number {
  let score = 0;
  for (const kw of intent.keywords) {
    if (hasKeyword(padded, kw)) score += 1;
  }
  if (intent.phrases) {
    for (const phrase of intent.phrases) {
      // padded carries a leading and trailing space, so this matches the
      // phrase as a whole multi-word unit anywhere, start or end included.
      if (padded.includes(` ${phrase} `)) score += 1;
    }
  }
  return score;
}

function matchIntent(normalized: string): AskResult | null {
  const padded = ` ${normalized} `;
  let best: Intent | null = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    const score = scoreIntent(padded, intent);
    // Strictly greater keeps the earlier (more specific) intent on ties.
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  return best ? best.build() : null;
}

// -----------------------------------------------------------------------------
// Fallback retrieval: score items by token overlap
// -----------------------------------------------------------------------------

interface Candidate {
  // Text the query tokens are scored against.
  haystack: string;
  // Rendered when this candidate wins.
  render: () => { answer: string; sources: AskSource[] };
}

function rackSource(rack: RackData): AskSource {
  return rack.github
    ? { label: rack.github.replace('https://', ''), href: rack.github }
    : SOURCE_WORK;
}

function buildCandidates(): Candidate[] {
  const candidates: Candidate[] = [];

  // War stories.
  (Object.keys(STORIES) as ToolId[]).forEach((id) => {
    const story = STORIES[id];
    const isOutage = id === 'aws';
    candidates.push({
      haystack: `${story.tool} ${story.title} ${story.body}`,
      render: () => ({
        answer: `${story.title}: ${firstSentence(story.body)}`,
        sources: isOutage ? [SOURCE_OUTAGE, SOURCE_WORK] : [SOURCE_WORK],
      }),
    });
  });

  // Projects (racks).
  RACKS.forEach((rack: RackData) => {
    candidates.push({
      haystack: `${rack.label} ${rack.sublabel} ${rack.description} ${rack.tech.join(' ')}`,
      render: () => ({
        answer: `${rack.label} (${rack.sublabel}): ${firstSentence(rack.description)}`,
        sources: [rackSource(rack), SOURCE_WORK],
      }),
    });
  });

  // Skills (only those with a blurb carry enough text to answer with).
  SKILLS.forEach((skill: SkillData) => {
    if (!skill.blurb) return;
    candidates.push({
      haystack: `${skill.name} ${skill.category} ${skill.blurb}`,
      render: () => ({
        answer: `${skill.name} (${skill.years}+ years): ${skill.blurb}`,
        sources: [SOURCE_WORK],
      }),
    });
  });

  // Milestones (career timeline).
  MILESTONES.forEach((milestone: Milestone) => {
    candidates.push({
      haystack: `${milestone.year} ${milestone.title} ${milestone.description}`,
      render: () => ({
        answer: `${milestone.year}, ${milestone.title}: ${firstSentence(milestone.description)}`,
        sources: [SOURCE_WORK],
      }),
    });
  });

  return candidates;
}

const CANDIDATES = buildCandidates();

// Score a candidate by counting how many query tokens appear as whole words in
// its (normalized) haystack. Whole-word matching avoids "s3" hitting inside
// other tokens and keeps short tokens honest.
function scoreCandidate(queryTokens: string[], haystack: string): number {
  const paddedHay = ` ${normalize(haystack)} `;
  let score = 0;
  for (const token of queryTokens) {
    if (paddedHay.includes(` ${token} `)) score += 1;
  }
  return score;
}

// At least this many overlapping tokens before the fallback trusts a match.
const FALLBACK_THRESHOLD = 2;

function matchFallback(queryTokens: string[]): AskResult | null {
  if (queryTokens.length === 0) return null;

  let best: Candidate | null = null;
  let bestScore = 0;
  for (const candidate of CANDIDATES) {
    const score = scoreCandidate(queryTokens, candidate.haystack);
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  // A single-token query can still match on one strong token (e.g. "ecr"),
  // but multi-token queries must clear the threshold to avoid noise.
  const required = queryTokens.length <= 1 ? 1 : FALLBACK_THRESHOLD;
  if (best && bestScore >= required) {
    const { answer, sources } = best.render();
    return { answer, sources: dedupeSources(sources), matched: true };
  }
  return null;
}

// -----------------------------------------------------------------------------
// No-match fallback
// -----------------------------------------------------------------------------

function noMatch(): AskResult {
  return {
    answer:
      `I do not have that on file. Here is the work (/work), and here is how to reach Sagar: ` +
      CONTACT_LINE,
    sources: [SOURCE_WORK, SOURCE_RESUME, SOURCE_GITHUB, SOURCE_LINKEDIN],
    matched: false,
  };
}

// -----------------------------------------------------------------------------
// Public entry point
// -----------------------------------------------------------------------------

export function askSite(query: string): AskResult {
  const normalized = normalize(query);
  if (!normalized) return noMatch();

  // 1. Curated intents first.
  const intentResult = matchIntent(normalized);
  if (intentResult) return intentResult;

  // 2. Token-overlap retrieval across the real data.
  const fallbackResult = matchFallback(tokenize(normalized));
  if (fallbackResult) return fallbackResult;

  // 3. Honest no-match.
  return noMatch();
}

// -----------------------------------------------------------------------------
// Sample recruiter questions (drives the empty-state of the ask UI)
// -----------------------------------------------------------------------------

export const SAMPLE_QUESTIONS: string[] = [
  'Do you have production Kubernetes experience?',
  'What was your hardest incident?',
  'Are you open to remote senior roles?',
  'What do you use Python for?',
  'Show me your biggest project.',
  'How many years of experience do you have?',
  'What are you building with AI agents?',
];
