import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  IDENTITY,
  RACKS,
  SKILLS,
  STORIES,
  EDUCATION,
  CERTIFICATIONS,
  type Category,
  type RackData,
  type SkillData,
} from '@/data/career';
import { SITE_URL, breadcrumb } from '@/lib/seo';
import './resume.css';

// =============================================================================
// /resume · print-perfect one-page A4 resume, server-rendered.
//
// Every fact on this page comes from src/data/career.ts. Bullets reference
// STORIES bodies and RACKS descriptions directly; the handful of strings that
// are single sentences inside a MILESTONES description are copied verbatim
// here, each tagged with the milestone year it came from. If a fact changes,
// change career.ts first, then re-sync the tagged literals.
//
// The orchestrator prints this page to /resume.pdf with headless Chrome, so
// resume.css owns the typography (em-based, rescaled once for print).
// =============================================================================

export const metadata: Metadata = {
  title: 'Resume',
  description: `One-page resume for ${IDENTITY.name}, ${IDENTITY.title}: AWS, Kubernetes, Terraform, CI/CD, observability, and AI agents for ops. Printable PDF.`,
  alternates: { canonical: '/resume/' },
  robots: { index: true, follow: true },
};

// Breadcrumb: Home -> Resume. Additive structured data; the Person node lives
// in the root layout and is not redeclared here.
const BREADCRUMB_JSON_LD = breadcrumb([
  { name: 'Home', url: `${SITE_URL}/` },
  { name: 'Resume', url: `${SITE_URL}/resume/` },
]);

// -----------------------------------------------------------------------------
// Derivation helpers
// -----------------------------------------------------------------------------

function bare(url: string): string {
  return url.replace(/^https?:\/\//, '');
}

function rackById(id: string): RackData {
  const rack = RACKS.find((r) => r.id === id);
  if (!rack) throw new Error(`resume: no rack with id "${id}" in career.ts`);
  return rack;
}

// Leading sentences of a career.ts string, verbatim. Used to trim site-voice
// trailers (e.g. "kept here as an artifact") without rewording anything.
function firstSentences(text: string, count: number): string {
  const head = text.split('. ').slice(0, count).join('. ');
  return head.endsWith('.') ? head : `${head}.`;
}

function skillsFor(categories: Category[]): SkillData[] {
  return SKILLS.filter((s) => categories.includes(s.category));
}

// -----------------------------------------------------------------------------
// Content assembled from career.ts
// -----------------------------------------------------------------------------

// Each clause traces to career.ts: title + yearsLabel + tagline (IDENTITY),
// the platform stack (MILESTONES '2023' / RACKS 'eventlogic'), and the
// agentic-DevOps toolset (MILESTONES '2026').
const SUMMARY = [
  `${IDENTITY.title} with ${IDENTITY.yearsLabel.toLowerCase()} of experience.`,
  'Sole platform owner of a Swedish multi-tenant event-management SaaS on AWS: ECS Fargate, Aurora PostgreSQL with schema-per-tenant, ElastiCache Redis, Amazon MQ in eu-north-1.',
  'Building AI agents for ops (MCP, LangGraph, local LLM inference); open to remote senior roles.',
].join(' ');

interface ResumeJob {
  role: string;
  org: string;
  period: string;
  bullets: string[];
}

const JOBS: ResumeJob[] = [
  {
    // MILESTONES '2023': "Joined Threadcode Technologies as DevOps / SRE for
    // EventLogic, a Swedish multi-tenant event-management SaaS."
    role: 'DevOps / SRE Engineer',
    org: 'Threadcode Technologies Pvt. Ltd. · EventLogic, Swedish multi-tenant event-management SaaS · Lalitpur, Nepal',
    period: 'May 2023 · present',
    bullets: [
      // Verbatim from MILESTONES '2023'.
      'Owner of the entire AWS platform end to end: ECS Fargate, Aurora PostgreSQL, ElastiCache Redis, Amazon MQ in eu-north-1.',
      STORIES.aws.body,
      STORIES.aurora.body,
      STORIES.python.body,
      STORIES.kubernetes.body,
      STORIES.terraform.body,
      rackById('aws-finops').description,
      // Verbatim from MILESTONES '2023'.
      'Technical Reviewer for Python for DevOps (Packt).',
    ],
  },
  {
    // MILESTONES '2021': "Joined Cloudyfox Technology in September as DevOps
    // Engineer."
    role: 'DevOps Engineer',
    org: 'Cloudyfox Technology Pvt. Ltd. · Kathmandu, Nepal',
    period: 'Sep 2021 · Apr 2023',
    bullets: [
      // Verbatim from MILESTONES '2022'.
      'Ran Kubernetes for containerized workloads at Cloudyfox. Built CI/CD on GitLab CI and Jenkins for both app and infra deploys.',
      // Verbatim from MILESTONES '2021'.
      'First Terraform / Terragrunt at scale across AWS.',
      // Verbatim from MILESTONES '2022'.
      'SysOps, Linux admin, OpenVPN, centralized logging with CloudWatch, ELK, Grafana.',
    ],
  },
  {
    // MILESTONES '2020': companies, verbatim.
    role: 'AI/ML and Backend Engineer (earlier roles)',
    org: 'VolgAI · Genese Cloud Academy · IBZ Networks · Kathmandu, Nepal',
    period: '2020 · 2021',
    bullets: [
      // Verbatim from MILESTONES '2020'.
      'Built AI chatbots with RASA (NLP), backend APIs with Django and Flask, RTSP/FFmpeg pipelines for CCTV image processing.',
      // Verbatim from MILESTONES '2020'.
      'Async work via Celery and RabbitMQ. AWS AI/ML Internship at Genese.',
    ],
  },
];

// Display grouping only; the skills and their categories live in career.ts.
const SKILL_GROUPS: Array<{ label: string; categories: Category[] }> = [
  { label: 'Cloud & Infrastructure', categories: ['cloud', 'infrastructure'] },
  { label: 'CI/CD', categories: ['cicd'] },
  { label: 'Observability', categories: ['monitoring'] },
  { label: 'Databases', categories: ['database'] },
  { label: 'Languages & Frameworks', categories: ['development'] },
  { label: 'Security', categories: ['security'] },
  { label: 'AI / ML', categories: ['ai-ml'] },
  { label: 'OS & Tooling', categories: ['os', 'misc'] },
];

const PRIMARY_SKILL_IDS = new Set(['python', 'terraform', 'kubernetes', 'aws']);

// Project entries; `sentences` trims trailing site-voice from descriptions.
const PROJECTS: Array<{ rack: RackData; sentences: number }> = [
  { rack: rackById('hashnode-mcp'), sentences: 2 },
  { rack: rackById('vqgan-clip'), sentences: 1 },
];

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

function Section({
  title,
  flow,
  children,
}: {
  title: string;
  flow?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={flow ? 'resume-section resume-section-flow' : 'resume-section'}>
      <h2 className="resume-h2">{title}</h2>
      {children}
    </section>
  );
}

export default function ResumePage() {
  // 'Kathmandu, Nepal' from IDENTITY.location ('Kathmandu, Nepal · open to remote').
  const city = IDENTITY.location.split(' · ')[0];

  return (
    <div className="resume-root">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSON_LD) }}
      />
      <div className="resume-topbar print:hidden">
        <Link href="/">{bare(IDENTITY.links.site)}</Link>
        <div>
          <a className="resume-download" href="/resume.pdf" download>
            Download PDF
          </a>
          <span className="resume-topbar-hint">or press Cmd+P</span>
        </div>
      </div>

      <main className="resume-sheet">
        <header className="resume-header">
          <h1 className="resume-name">{IDENTITY.name}</h1>
          <p className="resume-title">{IDENTITY.title}</p>
          <p className="resume-contact">
            {city} (remote)
            {' · '}
            <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a>
            {' · '}
            <a href={IDENTITY.links.site}>{bare(IDENTITY.links.site)}</a>
            {' · '}
            <a href={IDENTITY.links.github}>{bare(IDENTITY.links.github)}</a>
            {' · '}
            <a href={IDENTITY.links.linkedin}>{bare(IDENTITY.links.linkedin)}</a>
          </p>
        </header>

        <Section title="Summary">
          <p>{SUMMARY}</p>
        </Section>

        <Section title="Experience" flow>
          {JOBS.map((job) => (
            <article key={job.org} className="resume-job">
              <div className="resume-job-head">
                <p>
                  <span className="resume-job-role">{job.role}</span>
                  <span className="resume-job-org"> · {job.org}</span>
                </p>
                <span className="resume-job-period">{job.period}</span>
              </div>
              <ul className="resume-bullets">
                {job.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </Section>

        <Section title="Skills">
          <ul className="resume-skills">
            {SKILL_GROUPS.map((group) => {
              const skills = skillsFor(group.categories);
              if (!skills.length) return null;
              return (
                <li key={group.label}>
                  <span className="resume-skills-label">{group.label}: </span>
                  {skills.map((skill, i) => (
                    <span key={skill.id}>
                      {PRIMARY_SKILL_IDS.has(skill.id) ? (
                        <strong>{skill.name}</strong>
                      ) : (
                        skill.name
                      )}
                      {i < skills.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </li>
              );
            })}
          </ul>
        </Section>

        <Section title="Projects">
          {PROJECTS.map(({ rack, sentences }) => (
            <div key={rack.id} className="resume-project">
              <p>
                <span className="resume-project-name">
                  {rack.github ? bare(rack.github).split('/').pop() : rack.label}
                </span>
                <span className="resume-project-note"> · {rack.sublabel}</span>
                {rack.github ? (
                  <>
                    {' · '}
                    <a href={rack.github}>{bare(rack.github)}</a>
                  </>
                ) : null}
              </p>
              <p>{firstSentences(rack.description, sentences)}</p>
            </div>
          ))}
        </Section>

        <Section title="Certifications & Recognition">
          {CERTIFICATIONS.map((cert) => (
            <div key={cert.title} className="resume-edu">
              <p>
                {cert.title}
                <span className="resume-job-org"> · {cert.issuer}</span>
              </p>
              <span className="resume-job-period">{cert.year}</span>
            </div>
          ))}
        </Section>

        <Section title="Education">
          {/* EDUCATION: Bachelor in Computer Engineering, Tribhuvan University,
              Western Regional Campus (IOE), Pokhara, 2016 to 2020. */}
          {EDUCATION.map((edu) => (
            <div key={edu.degree} className="resume-edu">
              <p>
                {edu.degree}
                <span className="resume-job-org"> · {edu.institution} · {edu.location}</span>
              </p>
              <span className="resume-job-period">{edu.period}</span>
            </div>
          ))}
        </Section>
      </main>
    </div>
  );
}
