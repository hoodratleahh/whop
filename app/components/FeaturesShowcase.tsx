'use client';

import React, { useState, useEffect, useRef } from 'react';

function useMobile() {
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const check = () => setSmall(window.innerWidth < 500);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return small;
}

const FF = "'Plus Jakarta Sans', sans-serif";
const MONO = "'DM Mono', monospace";
const S1 = '#111116', S2 = '#17171e', S3 = '#1e1e27';
const BORDER = '#25252f';
const TEXT = '#edeef2', TEXT2 = '#888898', TEXT3 = '#55556a';
const AMBER = '#f0a020', GREEN = '#22c55e', RED = '#ef4444', BLUE = '#3b82f6', YELLOW = '#f59e0b';

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible] as const;
}

function DemoFrame({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div style={{ background: '#080810', border: '1px solid #2a2a38', borderRadius: 13, overflow: 'hidden', boxShadow: '0 36px 88px rgba(0,0,0,0.6), 0 0 0 1px rgba(240,160,32,0.06)' }}>
      <div style={{ padding: '9px 14px', background: S1, borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 7 }}>
        {['#ef4444', '#f59e0b', '#22c55e'].map((c, i) => (
          <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.6 }} />
        ))}
        <span style={{ fontSize: 11, color: TEXT3, fontFamily: FF, marginLeft: 5, fontWeight: 500 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function ScoreBadge({ score, sz = 30 }: { score: number; sz?: number }) {
  const hi = score >= 75, mid = score >= 50;
  const bg = hi ? 'rgba(34,197,94,0.14)' : mid ? 'rgba(240,160,32,0.12)' : 'rgba(239,68,68,0.12)';
  const col = hi ? GREEN : mid ? AMBER : RED;
  const bor = hi ? 'rgba(34,197,94,0.28)' : mid ? 'rgba(240,160,32,0.25)' : 'rgba(239,68,68,0.25)';
  return (
    <div style={{ width: sz, height: sz, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: sz <= 30 ? 10 : 12, fontWeight: 700, fontFamily: MONO, background: bg, color: col, border: `1px solid ${bor}`, flexShrink: 0, transition: 'all 0.45s ease' }}>
      {score}
    </div>
  );
}

const SEARCH_Q = 'Plumbers · Austin, TX';
const LEADS = [
  { name: 'Austin Plumbing Co.', addr: 'Austin, TX', score: 88, phone: '(512) 291-4455', website: 'austinplumbing.com', reviews: '4.8', count: 142, issues: [{ l: 'Outdated site', t: 'warn' }, { l: 'Slow load', t: 'warn' }] },
  { name: 'TX Pipe Masters', addr: 'Round Rock, TX', score: 71, phone: '(737) 333-5544', website: 'No website', reviews: '3.9', count: 67, issues: [{ l: 'No website', t: 'crit' }, { l: 'LinkedIn only', t: 'warn' }] },
  { name: 'Hill Country Plumb.', addr: 'Cedar Park, TX', score: 65, phone: '(512) 556-8822', website: 'hcplumbing.com', reviews: '4.2', count: 34, issues: [{ l: 'Mobile broken', t: 'warn' }, { l: '2yr old site', t: 'info' }] },
  { name: 'Capital Plumbers', addr: 'Austin, TX', score: 38, phone: '(512) 441-9999', website: 'No website', reviews: '2.1', count: 8, issues: [{ l: 'No website', t: 'crit' }, { l: 'No GMB', t: 'crit' }, { l: 'Unresponsive', t: 'warn' }] },
];

function LeadDiscoveryDemo() {
  const small = useMobile();
  const [phase, setPhase] = useState(-1);
  const [typed, setTyped] = useState(0);
  const [cards, setCards] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase(0), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase < 0) return;
    let cancelled = false;
    const timers: NodeJS.Timeout[] = [];

    if (phase === 0) {
      setTyped(0);
      setCards(0);
      timers.push(setTimeout(() => setPhase(1), 500));
    }
    if (phase === 1) {
      let i = 0;
      const go = () => {
        i++;
        setTyped(i);
        if (i < SEARCH_Q.length) timers.push(setTimeout(go, 46));
        else timers.push(setTimeout(() => setPhase(2), 480));
      };
      timers.push(setTimeout(go, 60));
    }
    if (phase === 2) {
      timers.push(setTimeout(() => setPhase(3), 1100));
    }
    if (phase === 3) {
      [0, 340, 680, 1020].forEach((d, i) => timers.push(setTimeout(() => setCards(i + 1), d)));
      timers.push(setTimeout(() => setPhase(4), 2700));
    }
    if (phase === 4) {
      timers.push(setTimeout(() => setPhase(0), 2000));
    }
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [phase]);

  const issueStyle = (t: string) => ({
    fontSize: 9,
    fontWeight: 700,
    padding: '2px 5px',
    borderRadius: 3,
    background: t === 'crit' ? 'rgba(239,68,68,0.12)' : 'rgba(240,160,32,0.1)',
    color: t === 'crit' ? RED : AMBER,
    border: `1px solid ${t === 'crit' ? 'rgba(239,68,68,0.22)' : 'rgba(240,160,32,0.2)'}`,
  });

  return (
    <DemoFrame title="Lead Discovery: Plumbers · Austin, TX">
      <div style={{ padding: 14, background: '#080810' }}>
        <div style={{ background: S2, borderRadius: 9, border: `1px solid ${phase >= 1 ? 'rgba(240,160,32,0.4)' : BORDER}`, display: 'flex', overflow: 'hidden', marginBottom: 11, transition: 'border-color 0.3s' }}>
          <div style={{ flex: 1, padding: '10px 13px', fontSize: 13, fontFamily: FF, color: typed > 0 ? TEXT : TEXT3, display: 'flex', alignItems: 'center', gap: 7, minHeight: 42 }}>
            <span style={{ opacity: 0.45, fontSize: 14 }}>⌕</span>
            {typed > 0 ? SEARCH_Q.slice(0, typed) : 'Search niche + location...'}
            {phase === 1 && <span style={{ display: 'inline-block', width: 2, height: 13, background: AMBER, verticalAlign: 'middle', marginLeft: 1, animation: 'blink 0.7s step-end infinite' }} />}
          </div>
          <div style={{ background: typed > 0 ? AMBER : '#2a2a38', color: typed > 0 ? '#0b0b0f' : TEXT3, padding: '0 16px', display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700, fontFamily: FF, flexShrink: 0, transition: 'background 0.3s, color 0.3s' }}>
            Search
          </div>
        </div>

        <div style={{ padding: '8px 11px', borderRadius: 7, marginBottom: 11, display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontFamily: FF, background: 'rgba(240,160,32,0.07)', border: '1px solid rgba(240,160,32,0.18)', opacity: phase >= 2 ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: AMBER, boxShadow: `0 0 8px ${AMBER}`, animation: phase >= 2 ? 'pulseGlow 1.4s ease-in-out infinite' : 'none' }} />
          <span style={{ color: AMBER, fontWeight: 600 }}>Scanning Google Maps</span>
          {phase >= 3 && <span style={{ marginLeft: 'auto', color: GREEN, fontWeight: 700, fontFamily: MONO, fontSize: 11 }}>✓ {42 + cards * 28}+ found</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: small ? '1fr' : '1fr 1fr', gap: 8 }}>
          {LEADS.map((l, i) => {
            const show = cards > i;
            return (
              <div key={i} style={{ background: S2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '11px 12px', opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.38s ease, transform 0.38s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: TEXT, flex: 1, marginRight: 6, lineHeight: 1.35 }}>
                    {l.name}
                  </div>
                  <ScoreBadge score={l.score} sz={24} />
                </div>
                <div style={{ fontSize: 9, color: TEXT3, marginBottom: 4, fontFamily: FF }}>{l.addr}</div>
                <div style={{ fontSize: 9, color: TEXT3, marginBottom: 3, fontFamily: MONO }}>☎ {l.phone}</div>
                <div style={{ fontSize: 9, color: l.website === 'No website' ? '#ef4444' : '#22c55e', marginBottom: 4, fontFamily: FF, fontWeight: 500 }}>
                  {l.website === 'No website' ? '❌ No website' : '🌐 ' + l.website}
                </div>
                <div style={{ fontSize: 9, color: TEXT3, marginBottom: 4, fontFamily: FF }}>⭐ {l.reviews} ({l.count} reviews)</div>
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {l.issues.map((iss, j) => (
                    <span key={j} style={issueStyle(iss.t) as React.CSSProperties}>
                      {iss.l}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        @keyframes blink {
          0%, 49%, 100% { opacity: 1; }
          50%, 99% { opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </DemoFrame>
  );
}

const KCOLS = [
  { id: 'new', label: 'New', color: TEXT2 },
  { id: 'called', label: 'Called', color: BLUE },
  { id: 'int', label: 'Interested', color: AMBER },
  { id: 'followup', label: 'Follow-up', color: '#f59e0b' },
  { id: 'closed', label: 'Closed', color: GREEN },
];
const KSTATIC = {
  new: [{ name: 'Austin HVAC', score: 82, time: '3h ago' }, { name: 'TX Roofers', score: 71, time: '5h ago' }],
  called: [{ name: 'Premier Elec.', score: 76, time: '1d ago' }],
  int: [{ name: 'Cedar Park Co.', score: 88, time: '2h ago' }],
  followup: [],
  closed: [{ name: 'Marble Falls', score: 91, time: '1w ago' }, { name: 'Lakeway AC', score: 85, time: '5d ago' }]
};
const KMOVING = { name: 'Round Rock Plumb.', phone: '(512) 555-0134', score: 79, time: 'now' };

function PipelineDemo() {
  const small = useMobile();
  const [col, setCol] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      setFading(true);
      const t = setTimeout(() => {
        setCol((c) => (c + 1) % KCOLS.length);
        setFading(false);
      }, 380);
      return () => clearTimeout(t);
    }, 2200);
    return () => clearInterval(iv);
  }, []);

  return (
    <DemoFrame title="Pipeline: Kanban Board">
      <div style={{ padding: 12, background: '#080810', overflowX: small ? 'auto' : 'visible', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', gap: 8, minWidth: small ? 'auto' : undefined }}>
        {KCOLS.map((kc, ci) => {
          const isActive = ci === col;
          const statics = KSTATIC[kc.id as keyof typeof KSTATIC] || [];
          const movingHere = ci === col;
          const colColor = kc.color;
          return (
            <div key={kc.id} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '7px 9px', background: S2, border: `1px solid ${BORDER}`, borderBottom: 'none', borderRadius: '7px 7px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: colColor, fontFamily: FF }}>
                  {kc.label}
                </span>
                <span style={{ fontSize: 9, fontFamily: MONO, color: TEXT3, background: S3, padding: '1px 5px', borderRadius: 3 }}>
                  {statics.length + (movingHere ? 1 : 0)}
                </span>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.01)', border: `1px solid ${isActive ? colColor + '55' : BORDER}`, borderTop: 'none', borderRadius: '0 0 7px 7px', padding: 6, display: 'flex', flexDirection: 'column', gap: 5, minHeight: 148, transition: 'border-color 0.4s' }}>
                {statics.map((card, si) => (
                  <div key={si} style={{ background: S2, border: `1px solid ${BORDER}`, borderRadius: 5, padding: '7px 8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <div style={{ fontSize: 9.5, fontWeight: 700, color: TEXT2, fontFamily: FF, flex: 1 }}>
                        {card.name}
                      </div>
                      <div style={{ width: 16, height: 16, borderRadius: 3, background: 'rgba(240,160,32,0.12)', border: '1px solid rgba(240,160,32,0.25)', color: AMBER, fontSize: 7, fontWeight: 700, fontFamily: MONO, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {card.score}
                      </div>
                    </div>
                    <div style={{ fontSize: 8, color: TEXT3, fontFamily: FF }}>
                      {card.time}
                    </div>
                  </div>
                ))}
                {movingHere && (
                  <div
                    style={{
                      background: `rgba(${ci === 0 ? '136,136,152' : ci === 1 ? '59,130,246' : ci === 2 ? '240,160,32' : ci === 3 ? '245,158,11' : '34,197,94'},0.1)`,
                      border: `1px solid ${colColor}60`,
                      borderRadius: 5,
                      padding: '7px 8px',
                      boxShadow: `0 0 12px ${colColor}20`,
                      opacity: fading ? 0 : 1,
                      transform: fading ? 'translateY(5px)' : 'translateY(0)',
                      transition: 'opacity 0.32s ease, transform 0.32s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <div style={{ fontSize: 9.5, fontWeight: 700, color: TEXT, fontFamily: FF, flex: 1 }}>
                        {KMOVING.name}
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: 3, background: 'rgba(240,160,32,0.12)', border: '1px solid rgba(240,160,32,0.25)', color: AMBER, fontSize: 8, fontWeight: 700, fontFamily: MONO, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {KMOVING.score}
                      </div>
                    </div>
                    <div style={{ fontSize: 8, color: TEXT3, fontFamily: MONO, marginBottom: 2 }}>
                      {KMOVING.phone}
                    </div>
                    <div style={{ fontSize: 8, color: GREEN, fontFamily: FF, fontWeight: 500 }}>
                      {KMOVING.time}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </DemoFrame>
  );
}

const SCRIPT_TARGET = { name: 'Austin Plumbing Co.', issue: 'Outdated website', score: 88, location: 'Austin, TX' };
const STEPS = [
  { n: '1', title: 'Opener', hint: 'Grab attention', body: 'Hey, is this the owner of Austin Plumbing Co.? Quick question: are you looking to get more customers this month?' },
  { n: '2', title: 'Identify Pain', hint: 'Find the hook', body: "I noticed your site is pretty dated. Most competitors in Austin have modern sites now. That's likely costing you leads every single day." },
  { n: '3', title: 'Offer', hint: 'Present value', body: 'We build fast, mobile-first sites for plumbers. Most clients see 40% more calls in month one. Worth a quick 15-min call?' },
];

function ScriptsDemo() {
  const [phase, setPhase] = useState(-1);
  const [shown, setShown] = useState(0);
  const [chars, setChars] = useState([0, 0, 0]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPhase(0), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase < 0) return;
    let cancelled = false;
    const timers: NodeJS.Timeout[] = [];

    const typeStep = (idx: number, next: () => void) => {
      setShown(idx + 1);
      const text = STEPS[idx].body;
      let i = 0;
      const go = () => {
        if (cancelled) return;
        i++;
        setChars((prev) => {
          const n = [...prev];
          n[idx] = i;
          return n;
        });
        if (i < text.length) timers.push(setTimeout(go, 15));
        else timers.push(setTimeout(next, 380));
      };
      timers.push(setTimeout(go, 60));
    };

    if (phase === 0) {
      setShown(0);
      setChars([0, 0, 0]);
      setCopied(false);
      timers.push(setTimeout(() => setPhase(1), 400));
    }
    if (phase === 1) {
      typeStep(0, () => setPhase(2));
    }
    if (phase === 2) {
      typeStep(1, () => setPhase(3));
    }
    if (phase === 3) {
      typeStep(2, () => {
        timers.push(setTimeout(() => setCopied(true), 500));
        timers.push(setTimeout(() => setPhase(4), 2000));
      });
    }
    if (phase === 4) {
      timers.push(setTimeout(() => setPhase(0), 1600));
    }
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [phase]);

  return (
    <DemoFrame title="Cold Call Scripts: Round Rock Plumb.">
      <div style={{ padding: '0 14px 14px', background: '#080810', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Lead Context Header */}
        <div style={{ background: 'rgba(240,160,32,0.08)', border: '1px solid rgba(240,160,32,0.2)', borderRadius: 8, padding: '11px 12px' }}>
          <div style={{ fontSize: 10, color: TEXT3, fontFamily: FF, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Lead Context
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: TEXT, fontFamily: FF }}>
                {SCRIPT_TARGET.name}
              </div>
              <div style={{ fontSize: 9, color: TEXT3, fontFamily: FF }}>
                {SCRIPT_TARGET.location}
              </div>
            </div>
            <ScoreBadge score={SCRIPT_TARGET.score} sz={24} />
          </div>
          <div style={{ fontSize: 9, color: AMBER, fontFamily: FF, fontWeight: 500 }}>
            Issue: {SCRIPT_TARGET.issue}
          </div>
        </div>

        {/* Scripts */}
        {STEPS.map((step, i) => {
          const show = shown > i;
          const text = step.body.slice(0, chars[i]);
          const typing = show && chars[i] < step.body.length;
          const done = show && chars[i] >= step.body.length;
          const isLast = i === STEPS.length - 1;
          return (
            <div key={i} style={{ background: S2, border: `1px solid ${BORDER}`, borderRadius: 9, overflow: 'hidden', opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(9px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 13px', borderBottom: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.018)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(240,160,32,0.12)', border: '1px solid rgba(240,160,32,0.25)', color: AMBER, fontSize: 10, fontWeight: 700, fontFamily: MONO, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {step.n}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: TEXT, fontFamily: FF }}>
                        {step.title}
                      </div>
                      <span style={{ fontSize: 9, color: TEXT3, fontFamily: FF }}>
                        ({step.n}/{STEPS.length})
                      </span>
                    </div>
                    <div style={{ fontSize: 9.5, color: TEXT3, fontFamily: FF, marginTop: 1 }}>
                      {step.hint}
                    </div>
                  </div>
                </div>
                {done && (
                  <button style={{ background: copied && isLast ? 'rgba(34,197,94,0.12)' : S3, border: `1px solid ${copied && isLast ? 'rgba(34,197,94,0.3)' : '#31313e'}`, color: copied && isLast ? GREEN : TEXT2, fontSize: 10, fontWeight: 700, padding: '4px 9px', borderRadius: 5, cursor: 'pointer', fontFamily: FF, transition: 'all 0.2s' }}>
                    {copied && isLast ? '✓ Copied!' : 'Copy'}
                  </button>
                )}
              </div>
              <div style={{ padding: '10px 13px', fontFamily: MONO, fontSize: 11.5, lineHeight: 1.85, color: TEXT2, minHeight: 34 }}>
                {text}
                {typing && <span style={{ display: 'inline-block', width: 2, height: 11, background: AMBER, verticalAlign: 'middle', marginLeft: 1, animation: 'blink 0.7s step-end infinite' }} />}
              </div>
            </div>
          );
        })}
      </div>
      <style jsx>{`
        @keyframes blink {
          0%, 49%, 100% { opacity: 1; }
          50%, 99% { opacity: 0; }
        }
      `}</style>
    </DemoFrame>
  );
}

const SCORING_TARGET = { name: 'Capital Plumbers', location: 'Austin, TX', score: 87 };
const CATEGORY_SCORES = [
  { label: 'Website', score: 92, icon: '🌐' },
  { label: 'Reviews', score: 76, icon: '⭐' },
  { label: 'Social', score: 84, icon: '📱' },
  { label: 'GMB', score: 65, icon: '📍' },
];
const ISSUE_TAGS = [
  { l: 'No HTTPS', t: 'crit' },
  { l: 'Slow load', t: 'crit' },
  { l: 'No mobile', t: 'warn' },
  { l: 'No GMB', t: 'warn' },
  { l: 'Old design', t: 'info' },
  { l: 'No contact', t: 'info' },
];
const RECOMMENDATIONS = [
  { l: 'Claim Google Business', t: 'action', icon: '📍' },
  { l: 'Add mobile responsiveness', t: 'action', icon: '📱' },
];

function ScoringDemo() {
  const small = useMobile();
  const [phase, setPhase] = useState(-1);
  const [score, setScore] = useState(0);
  const [stats, setStats] = useState([0, 0, 0]);
  const [catScores, setCatScores] = useState([0, 0, 0, 0]);
  const [tags, setTags] = useState(0);
  const [recs, setRecs] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase(0), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase < 0) return;
    let cancelled = false;
    const timers: NodeJS.Timeout[] = [];

    if (phase === 0) {
      setScore(0);
      setStats([0, 0, 0]);
      setCatScores([0, 0, 0, 0]);
      setTags(0);
      setRecs(0);
      timers.push(setTimeout(() => setPhase(1), 400));
    }
    if (phase === 1) {
      const TARGETS = [87, 6, 124000];
      const dur = 1700,
        start = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const p = Math.min((now - start) / dur, 1),
          e = 1 - Math.pow(1 - p, 3);
        setScore(Math.round(e * 87));
        setStats([Math.round(e * TARGETS[0]), Math.round(e * TARGETS[1]), Math.round(e * TARGETS[2] / 1000)]);
        setCatScores(CATEGORY_SCORES.map(c => Math.round(e * c.score)));
        if (p < 1) requestAnimationFrame(tick);
        else {
          ISSUE_TAGS.forEach((_, i) => timers.push(setTimeout(() => setTags(i + 1), 150 + i * 120)));
          RECOMMENDATIONS.forEach((_, i) => timers.push(setTimeout(() => setRecs(i + 1), 150 + ISSUE_TAGS.length * 120 + i * 100)));
          timers.push(setTimeout(() => setPhase(2), 150 + ISSUE_TAGS.length * 120 + RECOMMENDATIONS.length * 100 + 900));
        }
      };
      requestAnimationFrame(tick);
    }
    if (phase === 2) {
      timers.push(setTimeout(() => setPhase(0), 2000));
    }
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [phase]);

  const sColor = score >= 75 ? GREEN : score >= 50 ? AMBER : RED;
  const sBg = score >= 75 ? 'rgba(34,197,94,0.12)' : score >= 50 ? 'rgba(240,160,32,0.1)' : 'rgba(239,68,68,0.1)';
  const sBor = score >= 75 ? 'rgba(34,197,94,0.28)' : score >= 50 ? 'rgba(240,160,32,0.25)' : 'rgba(239,68,68,0.25)';
  const tagC = (t: string) =>
    t === 'crit'
      ? { bg: 'rgba(239,68,68,0.1)', col: RED, bor: 'rgba(239,68,68,0.22)' }
      : t === 'warn'
        ? { bg: 'rgba(240,160,32,0.1)', col: AMBER, bor: 'rgba(240,160,32,0.2)' }
        : { bg: S3, col: TEXT2, bor: BORDER };

  return (
    <DemoFrame title="Lead Scoring: Capital Plumbers">
      <div style={{ padding: 14, background: '#080810', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Company Header */}
        <div style={{ background: S2, border: `1px solid ${BORDER}`, borderRadius: 9, padding: '12px 13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: TEXT, fontFamily: FF }}>
                {SCORING_TARGET.name}
              </div>
              <div style={{ fontSize: 9, color: TEXT3, fontFamily: FF }}>
                {SCORING_TARGET.location}
              </div>
            </div>
            <ScoreBadge score={SCORING_TARGET.score} sz={32} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: small ? '1fr' : 'repeat(3,1fr)', gap: 8, marginBottom: 8 }}>
          {[
            { label: 'Lead Score', val: stats[0], suf: '%', col: sColor, bg: sBg, bor: sBor },
            { label: 'Issues Found', val: stats[1], suf: '', col: RED, bg: 'rgba(239,68,68,0.08)', bor: 'rgba(239,68,68,0.2)' },
            { label: 'Est. Value', val: stats[2], suf: 'k', col: GREEN, bg: 'rgba(34,197,94,0.08)', bor: 'rgba(34,197,94,0.2)', pre: '$' },
          ].map((c, i) => (
            <div key={i} style={{ background: S2, border: `1px solid ${BORDER}`, borderRadius: 9, padding: '12px 11px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: TEXT3, fontFamily: FF, marginBottom: 8 }}>
                {c.label}
              </div>
              <div style={{ fontSize: small ? 17 : 22, fontWeight: 800, fontFamily: MONO, lineHeight: 1, color: c.col, transition: 'color 0.5s' }}>
                {(c as any).pre || ''}
                {c.val.toLocaleString()}
                {c.suf}
              </div>
            </div>
          ))}
        </div>

        {/* Category Scores */}
        <div style={{ background: S2, border: `1px solid ${BORDER}`, borderRadius: 9, padding: '12px 13px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: TEXT3, fontFamily: FF, marginBottom: 10 }}>
            Score Breakdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CATEGORY_SCORES.map((cat, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 9, fontWeight: 600, color: TEXT2, fontFamily: FF }}>
                  <span>{cat.icon} {cat.label}</span>
                  <span style={{ color: catScores[i] >= 75 ? GREEN : catScores[i] >= 50 ? AMBER : RED, fontFamily: MONO }}>
                    {catScores[i]}%
                  </span>
                </div>
                <div style={{ height: 3, background: S3, borderRadius: 2, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${catScores[i]}%`,
                      background:
                        catScores[i] >= 75 ? GREEN : catScores[i] >= 50 ? AMBER : RED,
                      borderRadius: 2,
                      transition: 'width 0.1s linear',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

  
        <div style={{ background: S2, border: `1px solid ${BORDER}`, borderRadius: 9, padding: '11px 12px', marginBottom: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: TEXT3, fontFamily: FF, marginBottom: 9 }}>
            Issues Detected
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {ISSUE_TAGS.map((tag, i) => {
              const tc = tagC(tag.t);
              return (
                <span
                  key={i}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '3px 7px',
                    borderRadius: 4,
                    fontFamily: FF,
                    background: tc.bg,
                    color: tc.col,
                    border: `1px solid ${tc.bor}`,
                    opacity: tags > i ? 1 : 0,
                    transform: tags > i ? 'scale(1)' : 'scale(0.82)',
                    transition: 'opacity 0.28s ease, transform 0.28s ease',
                  }}
                >
                  {tag.l}
                </span>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 9, padding: '11px 12px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: GREEN, fontFamily: FF, marginBottom: 9 }}>
            Recommended Actions
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {RECOMMENDATIONS.map((rec, i) => (
              <span
                key={i}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontFamily: FF,
                  background: 'rgba(34,197,94,0.12)',
                  color: GREEN,
                  border: `1px solid rgba(34,197,94,0.3)`,
                  opacity: recs > i ? 1 : 0,
                  transform: recs > i ? 'scale(1)' : 'scale(0.82)',
                  transition: 'opacity 0.28s ease, transform 0.28s ease',
                }}
              >
                {rec.icon} {rec.l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </DemoFrame>
  );
}

function ShowcaseRow({ label, title, desc, demo, reversed }: { label: string; title: string; desc: string; demo: React.ReactNode; reversed: boolean }) {
  const [ref, visible] = useReveal();
  const base = { transition: 'opacity 0.85s ease, transform 0.85s ease' };
  const textAnim = { ...base, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(22px)' };
  const demoAnim = { ...base, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(22px)', transitionDelay: '140ms' };
  return (
    <div ref={ref} style={{ borderTop: '1px solid #1a1a24', padding: 'clamp(48px,7vh,80px) clamp(20px,5vw,72px)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(32px,5vw,72px)', alignItems: 'center', maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ ...textAnim, order: reversed ? 1 : 0 } as React.CSSProperties}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.2px', color: '#f0a020', textTransform: 'uppercase', fontFamily: FF, marginBottom: 14 }}>
            {label}
          </div>
          <h3 style={{ fontFamily: FF, fontWeight: 800, fontSize: 'clamp(22px,3.2vw,38px)', color: '#edeef2', letterSpacing: '-0.028em', lineHeight: 1.16, marginBottom: 16 }}>
            {title}
          </h3>
          <p style={{ fontFamily: FF, fontSize: 'clamp(14px,1.3vw,16px)', color: '#888898', lineHeight: 1.78 }}>
            {desc}
          </p>
        </div>
        <div style={{ ...demoAnim, order: reversed ? 0 : 1 } as React.CSSProperties}>
          {demo}
        </div>
      </div>
    </div>
  );
}

export function FeaturesShowcase() {
  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ textAlign: 'center', padding: 'clamp(56px,9vh,96px) 20px 0', borderTop: '1px solid #1a1a24' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', color: '#f0a020', textTransform: 'uppercase', fontFamily: FF, marginBottom: 14 }}>
          See it in action
        </div>
        <h2 style={{ fontFamily: FF, fontWeight: 800, fontSize: 'clamp(26px,4vw,50px)', color: '#edeef2', letterSpacing: '-0.028em', lineHeight: 1.12, maxWidth: 580, margin: '0 auto' }}>
          The complete sales intelligence toolkit.
        </h2>
      </div>
      <ShowcaseRow
        label="Lead Discovery"
        title="Find qualified leads automatically"
        desc="Type any niche and location. Recon AI scans Google Maps, scores every lead 0–100, and flags the easiest opportunities: missing sites, broken pages, and more."
        demo={<LeadDiscoveryDemo />}
        reversed={false}
      />
      <ShowcaseRow
        label="Pipeline Management"
        title="Organize every deal in one view"
        desc="Drag leads through your pipeline: New, Called, Interested, Closed. Know exactly where every prospect stands without digging through spreadsheets."
        demo={<PipelineDemo />}
        reversed={true}
      />
      <ShowcaseRow
        label="Cold Call Scripts"
        title="AI writes your opening every time"
        desc="Personalized cold calling scripts generated per lead: opener, pain point, and offer. Step-by-step. Copy to clipboard in one click and start dialing."
        demo={<ScriptsDemo />}
        reversed={false}
      />
      <ShowcaseRow
        label="Lead Scoring"
        title="Know which leads are worth your time"
        desc="Every lead scored 0–100. Issues ranked by severity, estimated deal value calculated, and opportunity signals surfaced so you focus on what closes."
        demo={<ScoringDemo />}
        reversed={true}
      />
    </div>
  );
}
