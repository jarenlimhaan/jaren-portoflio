'use client';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  Download,
  Flag,
  HelpCircle,
  Leaf,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  Ticket,
  TrainFront,
  Accessibility,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import Woodland, { type RideStats, type ViewMode } from './woodland';
import { emptyInput, type DriveInput } from './ride-physics';
import { stops } from './stops';
import StopContent from './stop-content';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { characters, type CharacterId } from './characters';
import CharacterPreview from './character-preview';
import AboutReader from './about-reader';

const destinations = [
  'Hearthside Station',
  'Infrastructure Heights',
  'The AI Workshop',
  'Backend Junction',
  'Community Crossing',
  'The Next Chapter',
];
const viewNames: Record<ViewMode, string> = {
  pov: 'Front seat',
  chase: 'Follow train',
  world: 'Whole world',
};
type Panel = 'journal' | 'station' | 'controls' | 'about' | null;
export default function Home() {
  const [character, setCharacter] = useState<CharacterId>('capybara');
  const [started, setStarted] = useState(false),
    [mode, setMode] = useState<'scenic' | 'drive'>('scenic'),
    [paused, setPaused] = useState(false),
    [view, setView] = useState<ViewMode>('pov');
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [reduced, setReduced] = useState(false),
    [input, setInput] = useState<DriveInput>(emptyInput);
  const [active, setActive] = useState(0),
    [inspect, setInspect] = useState(0),
    [visited, setVisited] = useState<number[]>([]),
    [arrival, setArrival] = useState<number | null>(null),
    [panel, setPanel] = useState<Panel>(null),
    [reset, setReset] = useState(0);
  const [stats, setStats] = useState<RideStats>({
    speed: 0,
    power: 0,
    brake: 0,
    progress: 0,
    slope: 0,
  });
  const game = useRef<HTMLElement>(null),
    arrivalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playing = started && !paused && !panel && !failed;
  const cycleCamera = () =>
    setView((v) => (v === 'pov' ? 'chase' : v === 'chase' ? 'world' : 'pov'));
  const showStation = (n = active) => {
    setInspect(n);
    setPanel('station');
    setInput(emptyInput);
  };
  const arrive = (n: number) => {
    setActive(n);
    setVisited((v) => (v.includes(n) ? v : [...v, n]));
    setArrival(n);
    if (arrivalTimer.current) clearTimeout(arrivalTimer.current);
    arrivalTimer.current = setTimeout(() => setArrival(null), 8500);
  };
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReduced(mq.matches);
      if (mq.matches) setView('world');
    };
    update();
    mq.addEventListener('change', update);
    return () => {
      mq.removeEventListener('change', update);
      if (arrivalTimer.current) clearTimeout(arrivalTimer.current);
    };
  }, []);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!started || panel) return;
      const k = e.key.toLowerCase();
      const held: Record<string, keyof DriveInput> = {
        w: 'power',
        arrowup: 'power',
        s: 'brake',
        arrowdown: 'brake',
        a: 'left',
        arrowleft: 'left',
        d: 'right',
        arrowright: 'right',
      };
      if (held[k]) {
        e.preventDefault();
        setInput((i) => ({ ...i, [held[k]]: true }));
      }
      if (e.code === 'Space' && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        setInput((i) => ({ ...i, brake: true }));
      }
      if (e.repeat) return;
      if (k === 'c') cycleCamera();
      if (k === 'p' || k === 'escape') {
        setPaused((v) => !v);
        setInput(emptyInput);
      }
      if (k === 'e') showStation();
      if (k === 'm') {
        setPanel('journal');
        setInput(emptyInput);
      }
      if (k === 'h') {
        setPanel('controls');
        setInput(emptyInput);
      }
    };
    const up = (e: KeyboardEvent) => {
      const keys: Record<string, keyof DriveInput> = {
        w: 'power',
        arrowup: 'power',
        s: 'brake',
        arrowdown: 'brake',
        ' ': 'brake',
        a: 'left',
        arrowleft: 'left',
        d: 'right',
        arrowright: 'right',
      };
      const key = keys[e.key.toLowerCase()];
      if (key) setInput((i) => ({ ...i, [key]: false }));
    };
    const blur = () => {
      setInput(emptyInput);
      if (started) setPaused(true);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [started, panel, active]);
  const start = (m: 'scenic' | 'drive') => {
    setMode(m);
    setStarted(true);
    setPaused(false);
    setInput(emptyInput);
    setView(reduced ? 'world' : 'chase');
    requestAnimationFrame(() => game.current?.focus());
  };
  const restart = () => {
    setReset((r) => r + 1);
    setVisited([]);
    setArrival(null);
    setActive(0);
    setPaused(false);
    setInput(emptyInput);
    requestAnimationFrame(() => game.current?.focus());
  };
  const hold = (key: keyof DriveInput, pressed: boolean) =>
    setInput((i) => ({ ...i, [key]: pressed }));
  const closePanel = () => {
    setPanel(null);
    requestAnimationFrame(() => game.current?.focus());
  };
  const fullScreen = () => {
    if (!document.fullscreenElement)
      void document.documentElement.requestFullscreen().catch(() => {});
    else void document.exitFullscreen();
  };
  return (
    <main
      className={`game ${started ? 'is-playing' : 'at-station'}`}
      ref={game}
      tabIndex={-1}
      aria-label="Jaren’s Little Rails interactive portfolio game"
    >
      <Woodland
        character={character}
        started={started}
        playing={playing}
        mode={mode}
        view={view}
        reduced={reduced}
        input={input}
        reset={reset}
        onReady={() => setReady(true)}
        onError={() => setFailed(true)}
        onStation={arrive}
        onStats={setStats}
      />
      <div className="game-vignette" aria-hidden="true" />
      {!started && (
        <>
          <div className="title-shade" />
          <button
            className="about-menu-tab hud-panel"
            onClick={() => setPanel('about')}
          >
            <BookOpen size={16} />
            About me
          </button>
          <section className="boarding-panel" aria-label="Choose your ride">
            <div className="boarding-top">
              <TrainFront size={21} />
              <span>JAREN LIM’S WOODLAND RAILWAY</span>
              <span className="signal-light" />
            </div>
            <span className="small-cap">BACKEND · PLATFORM · APPLIED AI</span>
            <h1>
              Little rails.
              <br />
              Big ideas.
            </h1>
            <p className="boarding-copy">
              A little world of things I’ve built.
              <br />
              Hop aboard. You’re at the controls.
            </p>
            <fieldset className="character-picker">
              <legend className="small-cap">CHOOSE YOUR LITTLE RIDER</legend>
              <div className="rider-introduction">
                <CharacterPreview character={character} />
                <div>
                  <strong>
                    {characters.find((c) => c.id === character)?.name}
                  </strong>
                  <p>{characters.find((c) => c.id === character)?.note}</p>
                </div>
              </div>
              <RadioGroup
                value={character}
                onValueChange={(value) => setCharacter(value as CharacterId)}
                className="character-options"
                aria-label="Choose your character"
              >
                {characters.map((c) => (
                  <label
                    key={c.id}
                    className={`character-option ${character === c.id ? 'chosen' : ''}`}
                  >
                    <RadioGroupItem value={c.id} />
                    <span>{c.name}</span>
                  </label>
                ))}
              </RadioGroup>
            </fieldset>
            <div className="choose-label">
              <span className="small-cap">CHOOSE YOUR RIDE</span>
              <span>Make yourself at home.</span>
            </div>
            <button
              className="ride-choice"
              disabled={!ready || failed}
              onClick={() => start('drive')}
            >
              <span className="choice-icon">
                <TrainFront />
              </span>
              <span>
                <strong>Take the controls</strong>
                <small>Accelerate, brake, and lean into the turns.</small>
              </span>
              <ChevronRight size={20} />
              <span className="mode-tag">DRIVE</span>
            </button>
            <button
              className="ride-choice scenic-choice"
              disabled={!ready || failed}
              onClick={() => start('scenic')}
            >
              <span className="choice-icon">
                <Leaf />
              </span>
              <span>
                <strong>The scenic route</strong>
                <small>Settle in. Let the railway do the driving.</small>
              </span>
              <ChevronRight size={20} />
              <span className="mode-tag">RELAX</span>
            </button>
            <div className="boarding-bottom">
              <button onClick={() => setPanel('controls')}>
                <HelpCircle size={15} />
                Learn the controls
              </button>
              <span>6 stops to discover</span>
            </div>
            {!ready && !failed && (
              <p className="loading-state" aria-live="polite">
                Opening the signal box…
              </p>
            )}
            {failed && (
              <p className="loading-state">
                The 3D world couldn’t start on this device. You can still
                explore the journey book below.
              </p>
            )}
          </section>
          <div className="title-footer">
            <span>
              <span className="signal-light" /> GOLDEN HOUR AT HEARTHSIDE
            </span>
            <button onClick={() => setPanel('about')}>
              <BookOpen size={15} />
              Just here for the portfolio? Read about me{' '}
              <ArrowUpRight size={14} />
            </button>
          </div>
        </>
      )}
      {started && (
        <>
          <header className="game-header">
            <button
              className="game-brand hud-panel"
              onClick={() => {
                setPaused(true);
                setStarted(false);
                setInput(emptyInput);
              }}
              aria-label="Return to ride selection"
            >
              <TrainFront size={22} />
              <span>
                <strong>Little Rails</strong>
                <small>JAREN LIM</small>
              </span>
            </button>
            <button
              className="about-ride-tab hud-panel"
              onClick={() => {
                setPanel('about');
                setInput(emptyInput);
              }}
            >
              About me
            </button>
            <div className="station-hud hud-panel">
              <span className="small-cap">{destinations[active]}</span>
              <span>
                {mode === 'drive'
                  ? 'YOU’RE AT THE CONTROLS'
                  : 'TAKE IN THE VIEW'}
                <i />
                NEXT: {destinations[(active + 1) % 6]}
              </span>
            </div>
            <div className="top-controls hud-panel">
              <span
                className="quiet-speed"
                aria-label={`Speed: ${Math.round(stats.speed)} kilometers per hour`}
              >
                <span>{Math.round(stats.speed)}</span>
                <small>km/h</small>
              </span>
              <span className="control-divider" />
              <Button
                variant="ghost"
                onClick={cycleCamera}
                className="hud-button"
                aria-label={`Camera: ${viewNames[view]}. Change camera`}
              >
                <Camera size={18} />
                <span>{reduced ? 'Whole world' : viewNames[view]}</span>
                <kbd>C</kbd>
              </Button>
              <span className="control-divider" />
              <Button
                variant="ghost"
                className="hud-button icon-only"
                aria-label="Driving controls"
                onClick={() => {
                  setPanel('controls');
                  setInput(emptyInput);
                }}
              >
                <HelpCircle size={17} />
              </Button>
              <Button
                variant="ghost"
                className="hud-button icon-only"
                onClick={() => {
                  setPaused(!paused);
                  setInput(emptyInput);
                }}
                aria-label={paused ? 'Resume ride' : 'Pause ride'}
              >
                {paused ? <Play size={18} /> : <Pause size={18} />}
              </Button>
              <Button
                variant="ghost"
                className="hud-button icon-only fullscreen-button"
                onClick={fullScreen}
                aria-label="Toggle fullscreen"
              >
                <Maximize size={18} />
              </Button>
            </div>
          </header>
          <div className="mission-hud">
            <button
              className="passport-button hud-panel"
              onClick={() => {
                setPanel('journal');
                setInput(emptyInput);
              }}
            >
              <Ticket size={20} />
              <span>
                <strong>
                  {visited.length} <span>/ 6</span>
                </strong>
                <small>STATION STAMPS</small>
              </span>
              <BookOpen size={16} />
            </button>
            <div
              className="stamp-dots"
              aria-label={`${visited.length} of six stations discovered`}
            >
              {destinations.map((d, i) => (
                <span
                  key={d}
                  className={visited.includes(i) ? 'stamped' : ''}
                  title={d}
                >
                  {visited.includes(i) ? <Check size={10} /> : i + 1}
                </span>
              ))}
            </div>
          </div>
          {arrival !== null && !panel && !paused && (
            <aside className="arrival-card hud-panel" aria-live="polite">
              <span className="small-cap">
                <Flag size={13} />
                {visited.length === 6
                  ? 'ALL SIX STAMPS COLLECTED'
                  : 'STATION DISCOVERED'}{' '}
                · {String(arrival + 1).padStart(2, '0')}
              </span>
              <h2>{stops[arrival].shortTitle}</h2>
              <p>{stops[arrival].summary}</p>
              <button onClick={() => showStation(arrival)}>
                Open this chapter <kbd>E</kbd>
                <ArrowRight size={16} />
              </button>
            </aside>
          )}
          {paused && !panel && (
            <section className="pause-card hud-panel" aria-label="Ride paused">
              <span className="small-cap">NO HURRY AT ALL</span>
              <h2>A little breather.</h2>
              <p>Your train is waiting right here.</p>
              <Button
                className="gold-button"
                onClick={() => {
                  setPaused(false);
                  game.current?.focus();
                }}
              >
                <Play size={17} />
                Continue the ride
              </Button>
              <button className="quiet-button" onClick={restart}>
                <RotateCcw size={15} />
                Back to the first station
              </button>
            </section>
          )}
          {failed && (
            <section className="pause-card hud-panel">
              <h2>The railway needs a rest.</h2>
              <p>The 3D view is unavailable on this device.</p>
              <Button onClick={() => setPanel('journal')}>
                Open the journey book
              </Button>
            </section>
          )}
          <button className="station-shortcut" onClick={() => showStation()}>
            <BookOpen size={15} /> Read this station <kbd>E</kbd>
          </button>
          <div className="touch-driving" aria-label="Driving controls">
            {mode === 'drive' && (
              <button
                aria-label="Hold to accelerate"
                className={input.power ? 'held' : ''}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  hold('power', true);
                }}
                onPointerUp={() => hold('power', false)}
                onPointerCancel={() => hold('power', false)}
                onLostPointerCapture={() => hold('power', false)}
              >
                <ChevronUp />
                POWER
              </button>
            )}
            <button
              aria-label="Hold to brake"
              className={input.brake ? 'held' : ''}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                hold('brake', true);
              }}
              onPointerUp={() => hold('brake', false)}
              onPointerCancel={() => hold('brake', false)}
              onLostPointerCapture={() => hold('brake', false)}
            >
              <ChevronDown />
              BRAKE
            </button>
          </div>
        </>
      )}
      <Dialog
        open={panel !== null}
        onOpenChange={(open) => {
          if (!open) closePanel();
        }}
      >
        <DialogContent
          className={`journey-dialog ${panel === 'station' ? 'chapter-dialog' : ''} ${panel === 'about' ? 'about-dialog' : ''}`}
        >
          <div className="dialog-inner">
            {panel === 'about' && <AboutReader />}
            {panel === 'controls' && (
              <>
                <span className="small-cap">THE HEARTHSIDE DRIVER’S GUIDE</span>
                <DialogTitle>Make yourself at home.</DialogTitle>
                <DialogDescription>
                  A gentle coaster through backend engineering, cloud
                  reliability, and applied AI. Collect a stamp each time you
                  pass a station.
                </DialogDescription>
                <div className="key-guide">
                  {[
                    ['W / ↑', 'Hold to accelerate'],
                    ['S / ↓ / Space', 'Hold to brake'],
                    ['A / D', 'Lean left / right'],
                    ['C', 'Front seat → follow train → whole world'],
                    ['P / Escape', 'Pause or continue'],
                    ['E', 'Read the current station'],
                    ['M', 'Open your journey book'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <kbd>{k}</kbd>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
                <p className="guide-note">
                  The scenic route handles the throttle for you. On a
                  touchscreen, hold the power and brake buttons. Your train
                  stays safely on the rails.
                </p>
                <button
                  className={`motion-choice ${reduced ? 'enabled' : ''}`}
                  aria-pressed={reduced}
                  onClick={() => {
                    setReduced(!reduced);
                    if (!reduced) setView('world');
                  }}
                >
                  <Accessibility size={20} />
                  <span>
                    <strong>Reduced motion</strong>
                    <small>
                      Fixed world camera, no leaning or ambient animation.
                    </small>
                  </span>
                  <span>{reduced ? 'ON' : 'OFF'}</span>
                </button>
                <Button className="gold-button" onClick={closePanel}>
                  {started ? 'Back to the ride' : 'Got it'}
                  <ArrowRight size={16} />
                </Button>
              </>
            )}
            {panel === 'journal' && (
              <>
                <div className="journal-heading">
                  <span className="small-cap">JAREN LIM · SINGAPORE</span>
                  <Ticket size={28} />
                </div>
                <DialogTitle>The journey book.</DialogTitle>
                <DialogDescription>
                  Six chapters. One curious engineer.
                  <br />
                  Find them on the railway, or open a chapter here.
                </DialogDescription>
                <div className="journal-grid">
                  {stops.map((s, i) => (
                    <button
                      className="journal-chapter"
                      key={s.name}
                      onClick={() => showStation(i)}
                    >
                      <span
                        className={`journal-stamp ${visited.includes(i) ? 'collected' : ''}`}
                      >
                        {visited.includes(i) ? (
                          <Check size={23} />
                        ) : (
                          String(i + 1).padStart(2, '0')
                        )}
                      </span>
                      <span>
                        <small>{destinations[i]}</small>
                        <strong>{s.name}</strong>
                      </span>
                      <ArrowUpRight size={18} />
                    </button>
                  ))}
                </div>
                <div className="journal-footer">
                  <span>
                    {visited.length === 6
                      ? 'All aboard, all discovered. Thanks for riding.'
                      : `${visited.length} of 6 stamps collected on the railway`}
                  </span>
                  <a href="/Jaren_resume.pdf" download>
                    <Download size={16} />
                    Resume
                  </a>
                </div>
              </>
            )}
            {panel === 'station' && (
              <>
                <button
                  className="back-to-book"
                  onClick={() => setPanel('journal')}
                >
                  <BookOpen size={15} />
                  Journey book
                </button>
                <span className="small-cap">
                  CHAPTER {String(inspect + 1).padStart(2, '0')} ·{' '}
                  {destinations[inspect]}
                </span>
                <DialogTitle>{stops[inspect].shortTitle}</DialogTitle>
                <DialogDescription>{stops[inspect].summary}</DialogDescription>
                <StopContent index={inspect} />
                <div className="chapter-bottom">
                  <Button className="gold-button" onClick={closePanel}>
                    <TrainFront size={17} />
                    {started ? 'Back to the ride' : 'Back to the railway'}
                  </Button>
                  <button onClick={() => setInspect((i) => (i + 1) % 6)}>
                    Next chapter <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
