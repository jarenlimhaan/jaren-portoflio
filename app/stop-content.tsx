import {
  Mail,
  ArrowUpRight,
  Download,
  Code2 as Github,
  ContactRound as Linkedin,
} from 'lucide-react';
import { stops } from './stops';
export default function StopContent({ index }: { index: number }) {
  const s = stops[index];
  return (
    <div className="stop-content">
      {s.entries.map((e) => (
        <div className="experience-entry" key={e.title}>
          <span className="entry-date">{e.date}</span>
          <h3>{e.title}</h3>
          <span className="entry-role">{e.role}</span>
          <p>{e.body}</p>
          {e.metric && (
            <div className="impact">
              <strong>{e.metric}</strong>
              <span>{e.metricLabel}</span>
            </div>
          )}
          <div className="tags">
            {e.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      ))}
      {index === 5 && (
        <div className="contact-list">
          <a href="mailto:jarenlim100@gmail.com">
            <Mail size={18} />
            jarenlim100@gmail.com
            <ArrowUpRight size={16} />
          </a>
          <a
            href="https://github.com/jarenlimhaan"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={18} />
            GitHub
            <ArrowUpRight size={16} />
          </a>
          <a
            href="https://www.linkedin.com/in/jaren-lim/"
            target="_blank"
            rel="noreferrer"
          >
            <Linkedin size={18} />
            LinkedIn
            <ArrowUpRight size={16} />
          </a>
          <a href="/Jaren_resume.pdf" download>
            <Download size={18} />
            Download my resume
          </a>
        </div>
      )}
    </div>
  );
}
