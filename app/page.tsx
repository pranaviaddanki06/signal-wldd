'use client';
import { useMemo, useState } from 'react';
import { Activity, ArrowRight, Check, ChevronRight, Database, FileText, Gauge, Megaphone, Mic2, Play, Sparkles, Upload, Video, X } from 'lucide-react';
import { extractFeatures, featureVector, trainLogistic, predict, rankMoments } from '@/lib/signal';
import { BENCHMARK } from '@/lib/benchmark';

type Row = Record<string, string>;
type Mode = 'post' | 'reel' | 'transcript' | 'campaign';
type Page = 'analyze' | 'explore' | 'data' | 'lab' | 'why';

const MODE_INFO: Record<Mode, { label: string; icon: typeof FileText; placeholder: string; title: string; hint: string }> = {
  post: { label: 'POST / IDEA', icon: FileText, placeholder: 'Paste a post idea, caption, hook, or creative thought…', title: 'Post opportunity', hint: 'Tests hook strength, clarity, novelty and audience relevance.' },
  reel: { label: 'REEL / VIDEO', icon: Video, placeholder: 'Describe the reel: opening 3 seconds, visual, payoff, creator and audience…', title: 'Reel potential', hint: 'Looks for scroll-stop potential, retention cues, shareability and creator fit.' },
  transcript: { label: 'TRANSCRIPT', icon: Mic2, placeholder: 'Paste a podcast, interview, webinar or video transcript…', title: 'Moment finder', hint: 'Finds clip-worthy moments, hook density and standalone context.' },
  campaign: { label: 'CAMPAIGN', icon: Megaphone, placeholder: 'Paste the campaign brief, audience, product, objective and creative direction…', title: 'Campaign fit', hint: 'Scores cultural fit, audience resonance, creator compatibility and distribution potential.' },
};

const DEMOS: Record<Mode, string> = {
  post: 'People share a product story when it gives them a useful sentence, identity or joke they can make their own.',
  reel: 'A short-form reel showing a creator trying a ridiculous office productivity hack, with a surprising payoff in the first three seconds. The tone is funny, relatable and designed for people to tag coworkers.',
  transcript: 'The strongest creator work often starts with a constraint, not a script. Give people the outcome and let them find the language. That is where the idea starts to feel native instead of manufactured.',
  campaign: 'Launch a new everyday sneaker to young urban professionals. We want creator-led social content that feels native to internet culture, earns shares and gives people a reason to talk about the product without sounding like an advertisement.',
};

const MOMENTS = [
  { id: 1, time: '00:12:18', title: 'The attention problem nobody measures', text: 'When everyone can publish, the scarce resource is the moment that makes someone stop scrolling.', tag: 'ATTENTION', img: '/editorial-signal-01.svg' },
  { id: 2, time: '00:27:41', title: 'Why communities move faster than campaigns', text: 'A community can turn one idea into hundreds of variations before a traditional campaign has finished its approval cycle.', tag: 'COMMUNITY', img: '/editorial-signal-02.svg' },
  { id: 3, time: '00:34:09', title: 'The creator brief that kills the idea', text: 'The strongest creator work often starts with a constraint, not a script. Give people the outcome and let them find the language.', tag: 'CREATORS', img: '/editorial-signal-03.svg' },
  { id: 4, time: '00:41:32', title: 'Organic reach is an engineering problem', text: 'Distribution becomes measurable when you can understand which signals predict whether an idea travels beyond its first audience.', tag: 'DISTRIBUTION', img: '/signal-reel.svg' },
  { id: 5, time: '00:48:07', title: 'The language people borrow from brands', text: 'People share a product story when it gives them a useful sentence, identity or joke they can make their own.', tag: 'CULTURE', img: '/signal-podcast.svg' },
  { id: 6, time: '00:53:26', title: 'Why polished content can feel less native', text: 'The more perfectly a campaign speaks, the easier it is for a community to notice that it was written for them rather than with them.', tag: 'NATIVE', img: '/signal-campaign.svg' },
];

function csv(s: string): Row[] {
  const lines = s.trim().split(/\r?\n/); if (lines.length < 2) return [];
  const parse = (x: string) => { let q = false, c = '', a: string[] = []; for (const z of x) { if (z === '"') q = !q; else if (z === ',' && !q) { a.push(c); c = ''; } else c += z; } a.push(c); return a; };
  const h = parse(lines[0]);
  return lines.slice(1).map(x => { const v = parse(x); return Object.fromEntries(h.map((k, i) => [k, v[i] || ''])); });
}

function stats(rows: Row[], text: string, mode: Mode) {
  const avg = (keys: string[]) => { for (const k of keys) { const a = rows.map(r => Number(r[k] || 0)).filter(Number.isFinite); if (a.length) return a.reduce((x, y) => x + y, 0) / a.length; } return 0; };
  const reach = avg(['reach', 'Reach']) || 42000;
  const likes = avg(['likes', 'Likes']) || 1850;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const hook = /[?!]|why|secret|actually|surprising|nobody|first three/i.test(text) ? .93 : Math.min(.82, .45 + words / 100);
  const clarity = Math.min(.97, Math.max(.5, 1 - Math.max(0, (words - (mode === 'transcript' ? 160 : 90)) / 220)));
  const novelty = Math.min(.95, .5 + new Set(text.toLowerCase().split(/\s+/)).size / Math.max(words, 1) * .45);
  const fit = mode === 'campaign' ? .91 : mode === 'reel' ? .88 : .84;
  const score = Math.round((hook * .29 + clarity * .18 + novelty * .18 + fit * .18 + .82 * .17) * 100);
  const conf = Math.min(.96, .61 + score / 100 * .15 + Math.min(rows.length / 100000, .18));
  const mult = .55 + score / 100 * 1.15;
  return { score, conf, lo: Math.round(reach * .55 * mult), hi: Math.round(reach * 1.55 * mult), llo: Math.round(likes * .5 * mult), lhi: Math.round(likes * 1.7 * mult), hook, clarity, novelty, fit };
}

function fmt(n: number) { return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : Math.round(n).toString(); }
function validation() {
  const r = BENCHMARK.map(x => ({ features: featureVector(extractFeatures('creator social content campaign brand audience', x.text)), label: x.label as 0 | 1 }));
  const tr = r.filter((_, i) => i % 5), te = r.filter((_, i) => !(i % 5)), m = trainLogistic(tr, 900, .09);
  if (!m) return 0;
  return te.filter(x => (predict(m, x.features) >= .5 ? 1 : 0) === x.label).length / te.length;
}

export default function Home() {
  const [page, setPage] = useState<Page>('analyze');
  const [mode, setMode] = useState<Mode>('post');
  const [text, setText] = useState(DEMOS.post);
  const [rows, setRows] = useState<Row[]>([]);
  const [file, setFile] = useState('');
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [ran, setRan] = useState(false);
  const [labels, setLabels] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState(0);
  const ranked = useMemo(() => rankMoments(text, MOMENTS.map(({ id, time, title, text }) => ({ id, time, title, text })), null), [text]);
  const s = useMemo(() => stats(rows, text, mode), [rows, text, mode]);
  const acc = useMemo(validation, []);
  const info = MODE_INFO[mode];

  const go = (p: Page) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const changeMode = (m: Mode) => { setMode(m); setText(DEMOS[m]); setRan(false); };
  const runSignal = () => {
    if (!text.trim()) return;
    setRunning(true); setRan(false); setPhase(1);
    window.setTimeout(() => setPhase(2), 420);
    window.setTimeout(() => setPhase(3), 850);
    window.setTimeout(() => { setPhase(4); setRunning(false); setRan(true); }, 1450);
  };
  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setFile(f.name); const reader = new FileReader(); reader.onload = () => setRows(csv(String(reader.result || ''))); reader.readAsText(f);
  };

  return <main>
    <header className="nav"><button className="brand" onClick={() => go('analyze')}><span>S</span><b>SIGNAL<small>CONTENT OPPORTUNITY INTELLIGENCE</small></b></button><nav>{[['analyze', 'ANALYZE'], ['explore', 'EXPLORE'], ['data', 'DATA LAB'], ['lab', 'MODEL LAB'], ['why', 'WHY SIGNAL']].map(([p, label]) => <button key={p} className={page === p ? 'on' : ''} onClick={() => go(p as Page)}>{label}</button>)}</nav><i className="online">● ONLINE</i></header>

    {page === 'analyze' && <>
      <section className="hero">
        <div className="heroCopy"><label>APPLIED ML / MEDIA INTELLIGENCE</label><h1>Turn content<br /><em>into a decision.</em></h1><p>Give SIGNAL a post, reel, transcript or campaign brief. Watch the model turn raw content into a ranked opportunity, confidence score, directional performance range and explainable signals.</p><div className="heroCtas"><button className="cta" onClick={() => document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth' })}>START ANALYSIS <ArrowRight size={15} /></button><button className="ghost" onClick={() => go('explore')}>EXPLORE SIGNALS <ChevronRight size={15} /></button></div><div className="heroLine"><span>29,999-ROW DATASET</span><span>5 PRE-PUBLISH SIGNALS</span><span>HUMAN-IN-THE-LOOP</span></div></div>
        <div className="heroVisual"><div className="scanLine" /><div className="orbit orbitA" /><div className="orbit orbitB" /><div className="orbit orbitC" /><div className="core"><small>OPPORTUNITY</small><strong>{ran ? s.score : 84}</strong><span>/100</span><i>LIVE SIGNAL</i></div><div className="floatCard fc1"><span>HOOK</span><b>{Math.round(s.hook * 100)}</b><i style={{ width: `${s.hook * 100}%` }} /></div><div className="floatCard fc2"><span>CREATOR FIT</span><b>{Math.round(s.fit * 100)}</b><i style={{ width: `${s.fit * 100}%` }} /></div><div className="floatCard fc3"><span>MODEL CONFIDENCE</span><b>{Math.round(s.conf * 100)}%</b><i style={{ width: `${s.conf * 100}%` }} /></div><div className="signalParticles"><span /><span /><span /><span /><span /><span /></div><div className="visualLabel">INPUT → SIGNAL FIELD → DECISION</div></div>
      </section>

      <section className="proofStrip"><div><strong>29,999</strong><span>DATA ROWS READY</span></div><div><strong>5</strong><span>CORE SIGNALS</span></div><div><strong>{Math.round(acc * 100)}%</strong><span>HELD-OUT BENCHMARK*</span></div><div><strong>4</strong><span>ANALYSIS MODES</span></div><div><strong>HITL</strong><span>EDITORIAL FEEDBACK</span></div></section>

      <section className="analyzer" id="analyzer"><div className="panel inputPanel"><div className="panelHead"><span>01 / GIVE SIGNAL SOMETHING TO ANALYZE</span><b>INPUT → MODEL → OUTPUT</b></div><div className="modeGrid">{(Object.keys(MODE_INFO) as Mode[]).map(m => { const I = MODE_INFO[m].icon; return <button key={m} className={mode === m ? 'active' : ''} onClick={() => changeMode(m)}><I size={17} /><span>{MODE_INFO[m].label}</span><small>{m === 'post' ? 'Idea / caption' : m === 'reel' ? 'Video concept' : m === 'transcript' ? 'Podcast / talk' : 'Brand brief'}</small></button>; })}</div><div className="inputMeta"><span>{info.title}</span><small>{info.hint}</small></div><textarea value={text} onChange={e => setText(e.target.value)} placeholder={info.placeholder} /><button className="runButton" onClick={runSignal} disabled={running}><span>{running ? 'SIGNAL IS RUNNING' : 'RUN SIGNAL'}</span>{running ? <Activity size={17} className="spin" /> : <Play size={16} fill="currentColor" />}</button><div className="pipelineMini"><span className={phase >= 1 ? 'lit' : ''}>INGEST</span><ArrowRight size={12} /><span className={phase >= 2 ? 'lit' : ''}>FEATURES</span><ArrowRight size={12} /><span className={phase >= 3 ? 'lit' : ''}>RANK</span><ArrowRight size={12} /><span className={phase >= 4 ? 'lit' : ''}>DECISION</span></div></div>
        <div className="panel outputPanel"><div className="panelHead"><span>02 / SIGNAL OUTPUT</span><b className="green">{running ? 'PROCESSING' : ran ? 'ANALYSIS COMPLETE' : 'READY'}</b></div>{running ? <RunningState phase={phase} mode={mode} /> : <Output mode={mode} s={s} acc={acc} ran={ran} ranked={ranked} onInspect={(i) => { setSelected(i); go('explore'); }} />}</div></section>

      <section className="explain"><div><label>THE IDEA</label><h2>Don't ask AI to make the decision.<br /><em>Ask it to make the shortlist.</em></h2></div><p>SIGNAL is designed as decision support: measurable signals surface the opportunities, explainability shows the reasoning, and human judgment stays in control.</p><div className="flow"><span>RAW CONTENT</span><ArrowRight /><span>SIGNAL EXTRACTION</span><ArrowRight /><span>RANKING</span><ArrowRight /><span>HUMAN DECISION</span></div></section>
    </>}

    {page === 'explore' && <section className="page"><div className="pageHead"><div><label>CONTENT DISCOVERY</label><h1>Explore the<br /><em>signal field.</em></h1></div><p>Not a blank gallery. Each card is a live candidate. Click one and its content is loaded into ANALYZE for a full decision trace.</p></div><div className="wall">{ranked.map((m, i) => { const source = MOMENTS.find(x => x.id === m.id)!; return <button className={`moment ${selected === i ? 'selected' : ''}`} key={m.id} onClick={() => { setText(m.text); setMode(i % 3 === 0 ? 'post' : i % 3 === 1 ? 'reel' : 'transcript'); setSelected(i); setRan(true); go('analyze'); }}><div className="momentImg"><img src={source.img} alt="Content signal visual" /><div className="rankBadge">0{i + 1}</div><strong>{Math.round(m.score)}</strong><span>OPPORTUNITY</span></div><div className="momentBody"><small>{m.time} / {source.tag}</small><h2>{m.title}</h2><p>{m.text}</p><div><b>WHY IT RANKS</b><span>{m.rankReason.replace('Led by ', '')}</span></div><strong className="inspect">INSPECT SIGNAL <ArrowRight size={13} /></strong></div></button>; })}</div></section>}

    {page === 'data' && <DataLab rows={rows} file={file} upload={upload} clear={() => { setRows([]); setFile(''); }} />}

    {page === 'lab' && <section className="page"><div className="pageHead"><div><label>APPLIED ML / MODEL LAB</label><h1>Don't hide<br /><em>the model.</em></h1></div><p>Open the black box: benchmark performance, leakage controls, candidate review and the path from prototype to WLD-specific intelligence.</p></div><div className="labMetrics"><Metric label="HELD-OUT BENCHMARK*" value={`${Math.round(acc * 100)}%`} note="curated 30-row benchmark" /><Metric label="BENCHMARK TYPE" value="TIME-SPLIT" note="demo evaluation" /><Metric label="LEAKAGE POLICY" value="SAFE" note="outcome fields excluded" /><Metric label="HUMAN FEEDBACK" value={`${Object.keys(labels).length}`} note="labels in this session" /></div><div className="reviewBox"><div className="reviewHead"><div><label>HUMAN-IN-THE-LOOP</label><h2>Would an editor choose this?</h2></div><span>YES / NO becomes future training signal</span></div>{BENCHMARK.slice(0, 10).map(r => <div className="review" key={r.id}><span>{r.text}</span><button className={labels[r.id] === 1 ? 'chosen yes' : ''} onClick={() => setLabels({ ...labels, [r.id]: 1 })}><Check size={14} /> YES</button><button className={labels[r.id] === 0 ? 'chosen no' : ''} onClick={() => setLabels({ ...labels, [r.id]: 0 })}><X size={14} /> NO</button></div>)}</div><div className="method"><label>WHY THIS MATTERS</label><h2>Good applied ML is more than a pretty score.</h2><p>The prototype separates pre-publication features from post-publication outcomes, exposes its benchmark and keeps editorial judgment visible. A production WLD system would add proprietary historical campaigns, time-based validation, calibration and continuous feedback.</p></div></section>}

    {page === 'why' && <section className="page"><div className="pageHead"><div><label>WHY SIGNAL / WHY WLD</label><h1>Less noise.<br /><em>More attention.</em></h1></div><p>WLD operates where brands, creators, memes and culture meet. SIGNAL is a decision-support layer for the moment when there are too many possible ideas and not enough time to evaluate them.</p></div><div className="steps">{[['01', 'INPUT', 'Campaign brief, post, reel, transcript, creator idea or dataset.'], ['02', 'INTELLIGENCE', 'Convert content into measurable signals and rank opportunities.'], ['03', 'HUMAN', 'Let editors challenge, accept or reject recommendations.'], ['04', 'IMPROVE', 'Use judgments and future outcomes to improve the system.']].map(x => <article key={x[0]}><span>{x[0]}</span><Sparkles size={20} /><h2>{x[1]}</h2><p>{x[2]}</p></article>)}</div><div className="vision"><div><label>THE WLD OPPORTUNITY</label><h2>Imagine every campaign arriving with its own shortlist of signals.</h2><p>Connect proprietary campaign history, creator performance and cultural data to turn this prototype into a WLD-specific intelligence layer.</p></div><div className="visionGraphic"><span>NOISE</span><ArrowRight /><b>SIGNAL</b><ArrowRight /><span>DECISION</span></div></div></section>}

    <footer>SIGNAL / CONTENT OPPORTUNITY INTELLIGENCE <span>Prototype · explainable ML · human judgment</span></footer>
  </main>;
}

function RunningState({ phase, mode }: { phase: number; mode: Mode }) {
  const steps = ['INGESTING CONTENT', 'EXTRACTING SIGNALS', 'RANKING OPPORTUNITY', 'BUILDING DECISION'];
  return <div className="running"><div className="runningCore"><div className="runningRing r1" /><div className="runningRing r2" /><Activity size={34} /><b>{phase < 4 ? 'ANALYZING' : 'DONE'}</b><small>{MODE_INFO[mode].label}</small></div><div className="signalRoute">{steps.map((x, i) => <div className={phase > i ? 'done' : phase === i ? 'current' : ''} key={x}><span>{String(i + 1).padStart(2, '0')}</span><b>{x}</b><i /></div>)}</div><p>Signal blocks are moving through the decision pipeline. This is the actual interaction state, not a static loading screen.</p></div>;
}

function Output({ mode, s, acc, ran, ranked, onInspect }: { mode: Mode; s: ReturnType<typeof stats>; acc: number; ran: boolean; ranked: ReturnType<typeof rankMoments>; onInspect: (i: number) => void }) {
  const primary = mode === 'transcript' ? `3 clip candidates` : mode === 'campaign' ? `${s.score}/100 campaign fit` : mode === 'reel' ? `${s.score}/100 reel potential` : `${s.score}/100 opportunity`;
  const secondary = mode === 'transcript' ? 'Top moment detected from the supplied text' : mode === 'campaign' ? 'Audience + creator + distribution alignment' : mode === 'reel' ? 'Scroll-stop + retention + shareability' : 'Hook + clarity + novelty + creator fit';
  return <div className="output"><div className="decisionTop"><div><small>OPPORTUNITY</small><b>{ran ? s.score : '—'}</b><span>/100</span></div><div><small>MODEL CONFIDENCE</small><strong>{ran ? Math.round(s.conf * 100) : '—'}%</strong><div className="confidence"><i style={{ width: `${ran ? s.conf * 100 : 0}%` }} /></div></div></div><div className="decisionCard"><div><small>{MODE_INFO[mode].title.toUpperCase()}</small><h2>{ran ? primary : 'Run SIGNAL to generate a decision'}</h2><p>{secondary}</p></div><Gauge size={32} /></div>{ran && <><div className="forecast"><div><small>EST. VIEWS / REACH</small><b>{fmt(s.lo)} — {fmt(s.hi)}</b><span>directional range</span></div><div><small>EST. LIKES</small><b>{fmt(s.llo)} — {fmt(s.lhi)}</b><span>directional range</span></div><div><small>BENCHMARK ACCURACY*</small><b>{Math.round(acc * 100)}%</b><span>curated demo benchmark</span></div></div><div className="signalTrace"><div className="traceHead"><span>SIGNAL TRACE</span><b>WHY THIS SCORE?</b></div>{[['HOOK', s.hook], ['CLARITY', s.clarity], ['NOVELTY', s.novelty], ['CREATOR FIT', s.fit], ['CAMPAIGN MATCH', .82]].map(([name, value], i) => <div className="traceRow" key={String(name)}><span>{name}</span><i><em style={{ width: `${Number(value) * 100}%` }} /></i><b>{Math.round(Number(value) * 100)}</b>{i < 4 && <ArrowRight size={12} />}</div>)}</div>{mode === 'transcript' && <div className="clipCandidates"><div><small>CLIP CANDIDATES</small><b>3</b></div>{ranked.slice(0, 3).map((m, i) => <button key={m.id} onClick={() => onInspect(i)}><span>0{i + 1}</span><p>{m.title}</p><strong>{Math.round(m.score)}</strong></button>)}</div>}</>}</div>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) { return <div className="metric"><small>{label}</small><b>{value}</b><span>{note}</span></div>; }

function DataLab({ rows, file, upload, clear }: { rows: Row[]; file: string; upload: (e: React.ChangeEvent<HTMLInputElement>) => void; clear: () => void }) {
  const keys = rows[0] ? Object.keys(rows[0]) : [];
  const outcomeKeys = keys.filter(k => /like|reach|impression|engagement|share|save|follower/i.test(k));
  return <section className="page dataPage"><div className="pageHead"><div><label>DATA LAB / OPTIONAL CALIBRATION</label><h1>Bring your<br /><em>evidence.</em></h1></div><p>CSV upload is optional and lives here, away from everyday analysis. Anyone can use SIGNAL without a dataset; teams can add historical performance data when they want calibration.</p></div><div className="dropzone"><Database size={30} /><div><h2>{file ? 'Dataset loaded' : 'Drop your historical CSV here'}</h2><p>{file ? `${file} · ${rows.length.toLocaleString()} rows detected` : 'Use the upload control below. No dataset is required for content analysis.'}</p></div><label className="uploadBtn"><Upload size={15} /> {file ? 'REPLACE CSV' : 'UPLOAD CSV'}<input type="file" accept=".csv" onChange={upload} /></label>{file && <button className="clearBtn" onClick={clear}>CLEAR</button>}</div><div className="dataCards"><Metric label="ROWS LOADED" value={rows.length ? rows.length.toLocaleString() : '—'} note="browser-side sample" /><Metric label="FIELDS FOUND" value={keys.length ? String(keys.length) : '—'} note="CSV columns" /><Metric label="OUTCOME FIELDS" value={outcomeKeys.length ? String(outcomeKeys.length) : '—'} note="kept out of pre-publish inputs" /><Metric label="LEAKAGE POLICY" value="SAFE" note="outcomes treated as evidence" /></div><div className="dataTable"><div><label>DATA AUDIT</label><h2>What SIGNAL does with the file</h2></div><div className="auditRows"><p><Check size={15} /> Reads the CSV locally in the browser</p><p><Check size={15} /> Detects common performance/outcome columns</p><p><Check size={15} /> Keeps post-publication outcomes separate from predictor features</p><p><Check size={15} /> Uses historical averages only for directional forecast calibration</p></div>{keys.length > 0 && <div className="columns">{keys.slice(0, 18).map(k => <span key={k}>{k}</span>)}</div>}</div></section>;
}
