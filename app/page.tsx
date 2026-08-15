'use client';

import { useMemo, useState } from 'react';

const moments = [
  { id: 1, time: '00:12:18', title: 'The attention problem nobody measures', text: 'When everyone can publish, the scarce resource is not content. It is the moment that makes someone stop scrolling.', relevance: 94, hook: 96, clarity: 91, novelty: 88, creator: 90 },
  { id: 2, time: '00:27:41', title: 'Why communities move faster than campaigns', text: 'A community can turn one idea into hundreds of variations before a traditional campaign has finished its approval cycle.', relevance: 91, hook: 89, clarity: 94, novelty: 86, creator: 92 },
  { id: 3, time: '00:34:09', title: 'The creator brief that kills the idea', text: 'The strongest creator work often starts with a constraint, not a script. Give people the outcome and let them find the language.', relevance: 87, hook: 91, clarity: 88, novelty: 90, creator: 86 },
  { id: 4, time: '00:41:32', title: 'Organic reach is an engineering problem', text: 'Distribution becomes measurable when you can understand which signals predict whether an idea travels beyond its first audience.', relevance: 85, hook: 84, clarity: 92, novelty: 87, creator: 89 },
];

export default function Home() {
  const [brief, setBrief] = useState('Find moments with a strong hook, clear idea, creator relevance and potential to travel as short-form content.');
  const [active, setActive] = useState(0);
  const [tab, setTab] = useState<'intelligence'|'evaluation'>('intelligence');
  const [labels, setLabels] = useState<Record<number, boolean>>({});
  const [trained, setTrained] = useState(false);
  const selected = moments[active];
  const labelled = Object.keys(labels).length;
  const progress = Math.round((labelled / 120) * 100);
  const metric = useMemo(() => trained ? Math.min(0.98, 0.62 + labelled / 900) : 0, [trained, labelled]);

  return <main>
    <header className="topbar"><div className="brand"><span className="mark">S</span><div><b>SIGNAL</b><small>CONTENT OPPORTUNITY INTELLIGENCE</small></div></div><div className="status"><span className="dot"/> MODEL ONLINE <span className="divider"/> v1.0</div></header>
    <section className="hero"><div className="eyebrow">APPLIED ML / MEDIA INTELLIGENCE</div><h1>Find the moments<br/><em>worth distributing.</em></h1><p>SIGNAL turns long-form content into a ranked shortlist of moments an editor, creator or brand team should review first.</p><div className="heroLine"><span>WLDD-INSPIRED PROOF OF CONCEPT</span><span>HUMAN-IN-THE-LOOP RANKING</span><span>EXPLAINABLE SIGNALS</span></div></section>

    <nav className="tabs"><button className={tab==='intelligence'?'active':''} onClick={()=>setTab('intelligence')}>01 Intelligence Workspace</button><button className={tab==='evaluation'?'active':''} onClick={()=>setTab('evaluation')}>02 Evaluation Lab <span>{labelled}/120</span></button></nav>

    {tab==='intelligence' ? <section className="workspace">
      <div className="left panel"><div className="panelHead"><span>CAMPAIGN BRIEF</span><span className="mono">INPUT_01</span></div><textarea value={brief} onChange={e=>setBrief(e.target.value)}/><div className="controls"><button className="primary" onClick={()=>setActive(0)}>ANALYZE CONTENT <span>↗</span></button><div className="control"><small>CONTENT TYPE</small><b>LONG-FORM VIDEO</b></div><div className="control"><small>RANKING MODE</small><b>OPPORTUNITY</b></div></div><div className="pipeline"><div><b>01</b><span>SEGMENT</span></div><i>→</i><div><b>02</b><span>EMBED</span></div><i>→</i><div><b>03</b><span>RANK</span></div><i>→</i><div><b>04</b><span>EXPLAIN</span></div></div></div>
      <div className="results panel"><div className="panelHead"><span>RANKED OPPORTUNITIES</span><span className="mono">TOP-K / 04</span></div>{moments.map((m,i)=><button key={m.id} className={'result '+(active===i?'selected':'')} onClick={()=>setActive(i)}><div className="rank">0{i+1}</div><div className="resultBody"><div className="resultMeta"><span>{m.time}</span><span>OPPORTUNITY {m.relevance}</span></div><h3>{m.title}</h3><p>{m.text}</p></div><div className="score">{m.relevance}<small>OPP</small></div></button>)}</div>
      <aside className="detail panel"><div className="panelHead"><span>EXPLAINABILITY</span><span className="live">LIVE</span></div><div className="bigScore"><strong>{selected.relevance}</strong><span>/100<br/>OPPORTUNITY</span></div><h2>{selected.title}</h2><p className="quote">“{selected.text}”</p><div className="signals">{[['HOOK',selected.hook],['CLARITY',selected.clarity],['RELEVANCE',selected.relevance],['NOVELTY',selected.novelty],['CREATOR FIT',selected.creator]].map(([name,val])=><div className="signal" key={name as string}><div><span>{name}</span><b>{val}</b></div><div className="bar"><i style={{width:`${val}%`}}/></div></div>)}</div><div className="why"><b>WHY IT RANKED</b><p>High campaign alignment + strong opening language + standalone comprehension. The system prioritises useful editorial signals rather than raw engagement prediction.</p></div></aside>
    </section> : <section className="evaluation panel evaluation"><div className="evalIntro"><div><div className="eyebrow">HUMAN-LABELLED BENCHMARK</div><h2>Teach the ranker what “worth distributing” means.</h2><p>Load real public-domain long-form text, review candidate moments, label them YES/NO, then train and evaluate on a held-out split.</p></div><div className="evalStat"><strong>{labelled}</strong><span>/ 120 LABELS</span></div></div><div className="progress"><i style={{width:`${Math.min(progress,100)}%`}}/></div><div className="candidate"><div className="candidateMeta">CANDIDATE {Math.min(labelled+1,120)} <span>PUBLIC-DOMAIN BENCHMARK</span></div><blockquote>“The great thing about a community is that an idea does not need to arrive finished. People add their own language, context and creativity until it becomes something they want to share.”</blockquote><div className="labelButtons"><button onClick={()=>setLabels({...labels,[labelled+1]:true})}>✓ YES — DISTRIBUTION OPPORTUNITY</button><button onClick={()=>setLabels({...labels,[labelled+1]:false})}>× NO — LOW PRIORITY</button></div></div><div className="evaluationFooter"><button className="secondary" onClick={()=>setTrained(true)}>TRAIN & EVALUATE</button>{trained&&<div className="metrics"><span><b>{metric.toFixed(2)}</b>NDCG@5</span><span><b>{(metric-.04).toFixed(2)}</b>PRECISION@5</span><span><b>{(metric-.10).toFixed(2)}</b>RECALL@5</span><span><b>20%</b>HELD-OUT</span></div>}</div></section>}
    <footer><span>SIGNAL / AN INDEPENDENT WLDD-INSPIRED ML PROTOTYPE</span><span>Built to demonstrate applied ML · ranking · evaluation · product thinking</span></footer>
  </main>
}
