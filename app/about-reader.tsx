'use client';
import { ArrowUpRight, Download, Mail, Code2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { stops } from './stops';

const projects = [
  {
    name: 'ESMOS Healthcare Portal',
    label: 'CLOUD & PLATFORM · DELL AWARD FINALIST',
    body: 'A healthcare enterprise platform deploying Odoo, Moodle, and osTicket on AWS. Terraform provisions the infrastructure, while Helm and ArgoCD manage Kubernetes deployments with automated security checks.',
    tags: ['AWS', 'Terraform', 'EKS', 'Helm', 'ArgoCD'],
    url: 'https://github.com/jarenlimhaan/ESM-G05T1-Milestone3',
  },
  {
    name: 'Lumina',
    label: 'COMMUNITY IMPACT · OGP INCUBATION SUPPORT',
    body: 'An AI-powered platform for medical escort and transport coordination, with eligibility checks, provider dispatch, and a voice assistant supporting seven Southeast Asian languages. Reduced manual administrative workflows by over 40%.',
    tags: ['React', 'FastAPI', 'Kafka', 'Twilio', 'SEA-LION'],
    url: null,
  },
  {
    name: 'TechSignal',
    label: 'APPLIED AI · NEWSLETTER INTELLIGENCE',
    body: 'A Python workflow that turns newsletter emails into a personalized five-story digest. It extracts stories, groups duplicates, ranks them by interest, and keeps a searchable archive, with a dashboard for reviewing the results.',
    tags: ['Python', 'Mistral', 'SQLite', 'Workflows'],
    url: 'https://github.com/jarenlimhaan/tech-signal',
  },
  {
    name: 'Meeting Battle Royale',
    label: 'APPLIED AI · COLLABORATION',
    body: 'A university meeting companion that turns approved transcripts into evidence-backed minutes, meeting contribution summaries, and a playful team-versus-obstacle battle recap. The project focuses on traceable meeting evidence rather than grading teammates.',
    tags: ['TypeScript', 'Next.js', 'PostgreSQL', 'Transcription'],
    url: 'https://github.com/jarenlimhaan/peer-evaluation',
  },
  {
    name: 'Skibidi Notes',
    label: 'LEARNING · SMU .HEAP PROJECT',
    body: 'A study platform that turns uploaded notes into bite-sized AI summaries, voiceovers, short-form video, and quick quizzes. Built to make revision feel more interactive and approachable.',
    tags: ['Next.js', 'FastAPI', 'Redis', 'AI voiceovers'],
    url: 'https://github.com/jarenlimhaan/Skibidi-Notes',
  },
];
const work = [
  stops[1].entries[0],
  stops[2].entries[0],
  stops[3].entries[0],
  stops[2].entries[1],
];
export default function AboutReader() {
  return (
    <div className="about-reader">
      <header className="reader-header">
        <span className="small-cap">THE PERSON BEHIND THE RAILWAY</span>
        <DialogTitle>Hey, I’m Jaren.</DialogTitle>
        <DialogDescription>
          Backend engineering, platform reliability, and applied AI.
          <br />
          Based in Singapore. Always building, always learning.
        </DialogDescription>
        <div className="reader-links">
          <a href="mailto:jarenlim100@gmail.com">
            <Mail size={15} />
            Email
          </a>
          <a
            href="https://github.com/jarenlimhaan"
            target="_blank"
            rel="noreferrer"
          >
            <Code2 size={15} />
            GitHub
            <ArrowUpRight size={13} />
          </a>
          <a
            href="https://www.linkedin.com/in/jaren-lim/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
            <ArrowUpRight size={13} />
          </a>
          <a href="/Jaren_resume.pdf" download>
            <Download size={15} />
            Resume
          </a>
        </div>
      </header>
      <Tabs defaultValue="about" className="reader-tabs">
        <TabsList className="reader-tab-list" aria-label="Read about Jaren">
          <TabsTrigger value="about">About me</TabsTrigger>
          <TabsTrigger value="projects">
            Projects <span className="project-count">{projects.length}</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="about" className="reader-scroll">
          <section className="reader-section">
            <h2>A builder across the stack.</h2>
            <p>
              I enjoy turning complicated problems into useful, dependable
              systems. My work brings together backend services, cloud
              infrastructure, and AI—from automating deployments to simplifying
              document processing and coordinating transport.
            </p>
            <p>
              I’m currently studying Information Systems at Singapore Management
              University and working across backend engineering and platform
              reliability at NTT DATA. I’m interested in opportunities where I
              can keep connecting these disciplines.
            </p>
          </section>
          <section className="reader-section">
            <span className="small-cap">ALONG THE WAY</span>
            <h2>Experience</h2>
            <div className="reader-timeline">
              {work.map((e) => (
                <article key={e.title}>
                  <span className="entry-date">{e.date}</span>
                  <h3>{e.title}</h3>
                  <span className="entry-role">{e.role}</span>
                  <p>{e.body}</p>
                  {e.metric && (
                    <div className="reader-result">
                      <strong>{e.metric}</strong>
                      <span>{e.metricLabel}</span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
          <section className="reader-section">
            <span className="small-cap">WHAT I WORK WITH</span>
            <h2>My toolkit</h2>
            {[
              [
                'Languages & backend',
                'Python, Go, Java, JavaScript / TypeScript, NestJS, Express.js, FastAPI',
              ],
              ['Frontend', 'React, Next.js'],
              [
                'Cloud & infrastructure',
                'AWS, Kubernetes, Docker, Terraform, Helm, ArgoCD, Linux',
              ],
              [
                'Delivery & observability',
                'GitLab CI/CD, GitHub Actions, Prometheus, Grafana, Datadog, ELK, Loki, Tempo',
              ],
              ['Data', 'PostgreSQL, MongoDB, SQLite'],
            ].map(([label, body]) => (
              <div className="reader-toolkit" key={label}>
                <h3>{label}</h3>
                <p>{body}</p>
              </div>
            ))}
          </section>
          <section className="reader-section">
            <span className="small-cap">STILL LEARNING</span>
            <h2>Education & certification</h2>
            <h3>Singapore Management University</h3>
            <p>
              Bachelor of Computing in Information Systems
              <br />
              August 2024 – expected September 2027
              <br />
              Projected honours: Magna Cum Laude
            </p>
            <p>AWS Certified Solutions Architect – Associate</p>
          </section>
          <section className="reader-section reader-contact">
            <h2>Let’s build something useful.</h2>
            <p>
              I’m interested in backend, platform / SRE, and applied AI
              opportunities.
            </p>
            <a href="mailto:jarenlim100@gmail.com">
              jarenlim100@gmail.com <ArrowUpRight size={17} />
            </a>
          </section>
        </TabsContent>
        <TabsContent value="projects" className="reader-scroll">
          <p className="reader-project-intro">
            A few things I’ve worked on, from cloud infrastructure to practical
            AI tools.
          </p>
          {projects.map((p, i) => (
            <article className="reader-project" key={p.name}>
              <span className="small-cap">
                {String(i + 1).padStart(2, '0')} / {p.label}
              </span>
              <h2>{p.name}</h2>
              <p>{p.body}</p>
              <div className="tags">
                {p.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              {p.url && (
                <a
                  className="repo-link"
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Explore on GitHub <ArrowUpRight size={16} />
                </a>
              )}
            </article>
          ))}
          <a
            className="all-projects-link"
            href="https://github.com/jarenlimhaan?tab=repositories"
            target="_blank"
            rel="noreferrer"
          >
            More from my GitHub <ArrowUpRight size={17} />
          </a>
        </TabsContent>
      </Tabs>
    </div>
  );
}
