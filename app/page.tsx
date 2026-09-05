'use client';
import { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Download,
  TrainFront,
  Play,
  Pause,
  Map,
  Mail,
  Code2 as Github,
  ContactRound as Linkedin,
  Leaf,
  MoveUpRight,
  Accessibility,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import Railway from './railway';
import { stops } from './stops';

export default function Home() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [riding, setRiding] = useState(false);
  const [simple, setSimple] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [details, setDetails] = useState(false);
  const [jump, setJump] = useState({ index: 0, key: 0 });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const change = () => {
      setReduced(mq.matches);
      if (mq.matches) setPlaying(false);
    };
    mq.addEventListener('change', change);
    return () => mq.removeEventListener('change', change);
  }, []);
  const select = (index: number) => {
    setActive(index);
    setJump((j) => ({ index, key: j.key + 1 }));
    setPlaying(false);
    if (simple)
      document
        .getElementById(`station-${index}`)
        ?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
  };
  const stop = stops[active];
  return (
    <main className={simple ? 'portfolio simple-mode' : 'portfolio'}>
      <a href="#journey" className="skip-link">
        Skip to portfolio content
      </a>
      <header className="site-header">
        <a className="brand" href="/" aria-label="Jaren Lim home">
          <span className="brand-icon">
            <TrainFront size={23} />
          </span>
          <span>
            Jaren Lim<span className="brand-sub">AN ENGINEERING JOURNEY</span>
          </span>
        </a>
        <div className="header-right">
          <span className="location">
            <span /> Based in Singapore
          </span>
          <button
            className="text-link"
            onClick={() => {
              setSimple(!simple);
              setPlaying(false);
            }}
          >
            {simple ? 'Back to the railway' : 'Skip ride · Read portfolio'}{' '}
            <ArrowUpRight size={16} />
          </button>
          <a className="resume-link" href="/Jaren_resume.pdf" download>
            <Download size={16} />
            <span>Resume</span>
          </a>
        </div>
      </header>
      {!simple && (
        <section
          className="experience"
          aria-label="Interactive miniature railway portfolio"
        >
          <div className="world">
            <Railway
              playing={playing && !details}
              riding={riding}
              reduced={reduced}
              jump={jump}
              onStop={setActive}
              onReady={() => setReady(true)}
              onError={() => {
                setFailed(true);
                setPlaying(false);
              }}
            />
          </div>
          <div className="introduction">
            <span className="eyebrow">
              <Leaf size={15} /> A LITTLE WORLD, BUILT WITH PURPOSE
            </span>
            <h1>
              Good systems.
              <br />
              Great journeys.
            </h1>
            <p>
              Hey, I’m Jaren. <span className="wave">✳</span>
              <br />I build reliable systems
              <br />
              and practical AI.
            </p>
            <div className="disciplines">
              Backend engineering<span>·</span>Platform & SRE<span>·</span>
              Applied AI
            </div>
            <Button
              className="ride-button"
              disabled={!ready || failed}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? <Pause size={17} /> : <Play size={17} />}{' '}
              {playing ? 'Pause the journey' : 'Take the scenic route'}
              <ArrowRight size={18} />
            </Button>
            <span className="intro-note">
              A small ride through the things I build.
            </span>
          </div>
          <div className="world-caption">
            <span className="line-dot" /> THE WOODLAND LINE <span>01 — 06</span>
          </div>
          <div className="world-options">
            <Button
              variant="outline"
              className="world-button"
              aria-pressed={riding}
              disabled={!ready || failed}
              onClick={() => setRiding(!riding)}
            >
              {riding ? <Map /> : <TrainFront />}
              {riding ? 'View whole world' : 'Ride along'}
            </Button>
            <Button
              variant="outline"
              className="world-button motion-button"
              aria-label={
                reduced ? 'Enable camera motion' : 'Reduce camera motion'
              }
              aria-pressed={reduced}
              onClick={() => {
                setReduced(!reduced);
                setPlaying(false);
              }}
            >
              <Accessibility />
              <span>{reduced ? 'Reduced motion on' : 'Reduce motion'}</span>
            </Button>
          </div>
          {!ready && !failed && (
            <div className="world-status" role="status">
              The little railway is warming up…
            </div>
          )}
          {failed && (
            <div className="world-status">
              The 3D railway couldn’t start on this device.
              <Button onClick={() => setSimple(true)}>
                Read the portfolio <ArrowRight />
              </Button>
            </div>
          )}
          <div className="scene-note">
            A gentle pace. A few meaningful stops.
          </div>
        </section>
      )}
      <section id="journey" className="journey" aria-label="Portfolio stations">
        <div className="route-heading">
          <span className="eyebrow">YOUR ITINERARY</span>
          <span>Pick a station. Stay a while.</span>
        </div>
        <nav className="route-stops" aria-label="Choose a portfolio station">
          {stops.map((s, i) => (
            <button
              key={s.name}
              className={`route-stop ${i === active ? 'selected' : ''}`}
              aria-current={i === active ? 'step' : undefined}
              onClick={() => select(i)}
            >
              <span className="stop-number">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{s.name}</span>
            </button>
          ))}
        </nav>
        {!simple && (
          <article className="station-preview" aria-live="polite">
            <div className="station-kicker">
              <span>{stop.kicker}</span>
              <strong>{stop.shortTitle}</strong>
            </div>
            <p>{stop.summary}</p>
            <Button
              variant="ghost"
              className="explore-button"
              onClick={() => {
                setDetails(true);
                setPlaying(false);
              }}
            >
              Explore this stop <MoveUpRight size={18} />
            </Button>
          </article>
        )}
        {simple && (
          <div className="readable-portfolio">
            <div className="readable-intro">
              <span className="eyebrow">JAREN LIM · SINGAPORE</span>
              <h1>
                I build reliable systems
                <br />
                and practical AI.
              </h1>
              <p>
                Backend engineering, platform reliability, and applied AI—from
                resilient infrastructure to tools that make everyday work
                easier.
              </p>
            </div>
            {stops.map((s, i) => (
              <article
                className="readable-stop"
                key={s.name}
                id={`station-${i}`}
              >
                <span className="eyebrow">
                  {String(i + 1).padStart(2, '0')} / {s.name}
                </span>
                <h2>{s.shortTitle}</h2>
                <StopContent index={i} />
              </article>
            ))}
          </div>
        )}
      </section>
      <footer className="site-footer">
        <span>Built with curiosity. Enjoy the ride.</span>
        <div>
          <a href="mailto:jarenlim100@gmail.com">
            <Mail size={16} />
            <span>Say hello</span>
            <ArrowUpRight size={13} />
          </a>
          <a
            href="https://github.com/jarenlimhaan"
            target="_blank"
            rel="noreferrer"
            aria-label="Jaren on GitHub"
          >
            <Github size={17} />
          </a>
          <a
            href="https://www.linkedin.com/in/jaren-lim/"
            target="_blank"
            rel="noreferrer"
            aria-label="Jaren on LinkedIn"
          >
            <Linkedin size={17} />
          </a>
        </div>
      </footer>
      <Sheet open={details} onOpenChange={setDetails}>
        <SheetContent className="station-sheet">
          <div className="sheet-inner">
            <span className="eyebrow">
              STATION {String(active + 1).padStart(2, '0')} / {stop.name}
            </span>
            <SheetTitle className="sheet-title">{stop.shortTitle}</SheetTitle>
            <SheetDescription className="sheet-summary">
              {stop.summary}
            </SheetDescription>
            <StopContent index={active} />
            <Button
              className="next-stop"
              onClick={() => select((active + 1) % stops.length)}
            >
              Next station <ArrowRight />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}
function StopContent({ index }: { index: number }) {
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
