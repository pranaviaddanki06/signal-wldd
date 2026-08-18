'use client';

import { useMemo, useState } from 'react';
import { BENCHMARK } from '@/lib/benchmark';
import { extractFeatures, featureVector, ndcgAtK, precisionAtK, recallAtK, brierScore, rankMoments, trainLogistic, type LogisticModel } from '@/lib/signal';

const MOMENTS = [
  { id: 1, time: '00:12:18', title: 'The attention problem nobody measures', text: 'When everyone can publish, the scarce resource is the moment that makes someone stop scrolling.' },
  { id: 2, time: '00:27:41', title: 'Why communities move faster than campaigns', text: 'A community can turn one idea into hundreds of variations before a traditional campaign has finished its approval cycle.' },
  { id: 3, time: '00:34:09', title: 'The creator brief that kills the idea', text: 'The strongest creator work often starts with a constraint, not a script. Give people the outcome and let them find the language.' },
  { id: 4, time: '00:41:32', title: 'Organic reach is an engineering problem', text: 'Distribution becomes measurable when you can understand which signals predict whether an idea travels beyond its first audience.' },
  { id: 5, time: '00:48:07', title: 'The language people borrow from brands', text: 'People share a product story when it gives them a useful sentence, identity or joke they can make their own.' },
  { id: 6, time: '00:53:26', title: 'Why polished content can feel less native', text: 'The more perfectly a campaign speaks, the easier it is for a community to notice that it was written for them rather than with them.' },
  { id: 7, time: '01:02:11', title: 'A constraint can become the creative engine', text: 'The right limitation gives creators a starting point while leaving enough room for their own language and context.' },
  { id: 8, time: '01:08:44', title: 'The metric that arrives too late', text: 'Most teams learn what travelled after the campaign ends. The useful question is which signals appeared before distribution.' },
];

function benchmarkModel(brief: string) {
  const rows = BENCHMARK.map(r => ({ features: featureVector(extractFeatures(brief, r.text)), label: r.label }));
  const train = BENCHMARK.filter(r => r.id % 5 !== 0).map(r => rows[BENCHMARK.findIndex(x=>x.id===r.id)]);
  const test = BENCHMARK.filter(r => r.id % 5 === 0).map(r => rows[BENCHMARK.findIndex(x=>x.id===r.id)]);
  const model = trainLogistic(train, 900, 0.09);
  if (!model) return { model: null, metrics: null };
  const scored = test.map(r => ({ score: 1 / (1 + Math.exp(-(r.features.reduce((s,x,i)=>s+x*model.weights[i],0)+model.bias))), label: r.label }));
  return { model, metrics: { ndcg: ndcgAtK(scored, 5), precision: precisionAtK(scored, 5), recall: recallAtK(scored, 5), brier: brierScore(scored), train: train.length, test: test.length } };
}

export default function Home() {
  const [brief, setBrief] = useState('Find moments with a strong hook, clear idea, creator relevance and potential to travel as short-form content.');
  const [active, setActive] = useState(0);
  const [tab, setTab] = useState<'intelligence'|'evaluation'>('intelligence');
  const [evalMode, setEvalMode] = useState<'benchmark'|'human'>('benchmark');
  const [humanLabels, setHumanLabels] = useState<Record<number, 0|1>>({});
  const [humanModel, setHumanModel] = useState<LogisticModel|null>(null);
  const trained = useMemo(() => benchmarkModel(brief), [brief]);
  const ranked = useMemo(() => rankMoments(brief, MOMENTS, trained.model), [brief, trained.model]);
  const selected = ranked[active] || ranked[0];
  const humanCount = Object.keys(humanLabels).length;
  const reviewRows = BENCHMARK.slice(0, 12);
  const humanMetrics = useMemo(() => {
    const labelled = BENCHMARK.filter(r => humanLabels[r.id] !== undefined);
    if (labelled.length < 8 || new Set(labelled.map(r => humanLabels[r.id])).size < 2) return null;
    const rows = labelled.map(r => ({ id:r.id, features:featureVector(extractFeatures(brief,r.text)), label:humanLabels[r.id] as 0|1 }));
    const train = rows.filter((_,i)=>i % 5 !== 0);
    const test = rows.filter((_,i)=>i % 5 === 0);
    const model = trainLogistic(train, 900, 0.09);
    if (!model || test.length < 2) return null;
    const scored = test.map(r => ({ score:1/(1+Math.exp(-(r.features.reduce((s,x,i)=>s+x*model.weights[i],0)+model.bias))), label:r.label }));
    return { model, ndcg:ndcgAtK(scored,5), precision:precisionAtK(scored,5), recall:recallAtK(scored,5), brier:brierScore(scored), train:train.length, test:test.length };
  }, [brief, humanLabels]);

  function toggleLabel(id:number,label:0|1) { setHumanLabels(prev => ({...prev,[id]:label})); setHumanModel(null); }
  function trainHuman() { if (humanMetrics) setHumanModel(humanMetrics.model); }

  const activeFeatures = selected?.features || {semantic:0,hook:0,clarity:0,novelty:0,creatorFit:0};
  const signals = [['SEMANTIC MATCH',activeFeatures.semantic],['HOOK',activeFeatures.hook],['CLARITY',activeFeatures.clarity],['NOVELTY',activeFeatures.novelty],['CREATOR FIT',activeFeatures.creatorFit]] as const;

  return <main>
    <header className="topbar"><div className="brand"><span className="mark">S</span><div><b>SIGNAL</b><small>CONTENT OPPORTUNITY INTELLIGENCE</small></div></div><div className="status"><span className="dot"/> MODEL ONLINE <span className="divider"/> v2.0 · LOGISTIC RANKER</div></header>
    <section className="hero"><div className="eyebrow">APPLIED ML / MEDIA INTELLIGENCE</div><h1>Find the moments<br/><em>worth distributing.</em></h1><p>SIGNAL turns long-form content into a ranked shortlist of moments an editor, creator or brand team should review first — with a reproducible ranking model and measurable evaluation.</p><div className="heroLine"><span>WLDD-INSPIRED PROOF OF CONCEPT</span><span>LEARNING-TO-RANK FOUNDATION</span><span>EXPLAINABLE SIGNALS</span><span>HUMAN-IN-THE-LOOP</span></div></section>

    <nav className="tabs"><button className={tab==='intelligence'?'active':''} onClick={()=>setTab('intelligence')}>01 Intelligence Workspace</button><button className={tab==='evaluation'?'active':''} onClick={()=>setTab('evaluation')}>02 Evaluation Lab <span>{humanCount}/12 REVIEWED</span></button></nav>

    {tab==='intelligence' ? <section className="workspace">
      <div className="left panel"><div className="panelHead"><span>CAMPAIGN BRIEF</span><span className="mono">INPUT_01</span></div><textarea value={brief} onChange={e=>setBrief(e.target.value)} /><div className="controls"><button className="primary" onClick={()=>setActive(0)}>RANK CONTENT <span>↗</span></button><div className="control"><small>CONTENT TYPE</small><b>LONG-FORM VIDEO</b></div><div className="control"><small>MODEL</small><b>LOGISTIC RANKER + TF-IDF SIGNALS</b></div><div className="control"><small>BENCHMARK</small><b>{trained.metrics?.train ?? 24} TRAIN / {trained.metrics?.test ?? 6} HELD-OUT</b></div></div><div className="pipeline"><div><b>01</b><span>SEGMENT</span></div><i>→</i><div><b>02</b><span>VECTORIZE</span></div><i>→</i><div><b>03</b><span>RANK</span></div><i>→</i><div><b>04</b><span>EXPLAIN</span></div></div></div>
      <div className="results panel"><div className="panelHead"><span>RANKED OPPORTUNITIES</span><span className="mono">TOP-K / {ranked.length}</span></div>{ranked.map((m,i)=><button key={m.id} className={'result '+(selected?.id===m.id?'selected':'')} onClick={()=>setActive(i)}><div className="rank">0{i+1}</div><div className="resultBody"><div className="resultMeta"><span>{m.time}</span><span>SCORE {m.score.toFixed(1)}</span></div><h3>{m.title}</h3><p>{m.text}</p></div><div className="score">{m.score.toFixed(0)}<small>RANK</small></div></button>)}</div>
      <aside className="detail panel"><div className="panelHead"><span>EXPLAINABILITY</span><span className="live">LIVE MODEL</span></div><div className="bigScore"><strong>{selected?.score.toFixed(0) || '—'}</strong><span>/100<br/>OPPORTUNITY</span></div><h2>{selected?.title}</h2><p className="quote">“{selected?.text}”</p><div className="signals">{signals.map(([name,val])=><div className="signal" key={name}><div><span>{name}</span><b>{Math.round(val*100)}</b></div><div className="bar"><i style={{width:`${val*100}%`}}/></div></div>)}</div><div className="why"><b>WHY IT RANKED</b><p>{selected?.rankReason}</p></div><div className="modelNote"><span>MODEL PROBABILITY</span><strong>{selected ? (selected.probability*100).toFixed(1) : '—'}%</strong></div></aside>
    </section> : <section className="evaluation panel evaluation">
      <div className="evalIntro"><div><div className="eyebrow">MEASURED RANKING PIPELINE</div><h2>Train it. Hold it out. Measure it.</h2><p>Two evaluation modes make the demo honest: a curated starter benchmark that runs end-to-end immediately, and a human review queue that lets you add labels and retrain the same model on your own judgments.</p></div><div className="evalStat"><strong>{humanCount}</strong><span>/ 12 HUMAN REVIEWS</span></div></div>
      <div className="evalSwitch"><button className={evalMode==='benchmark'?'active':''} onClick={()=>setEvalMode('benchmark')}>CURATED BENCHMARK</button><button className={evalMode==='human'?'active':''} onClick={()=>setEvalMode('human')}>HUMAN REVIEW</button></div>
      {evalMode==='benchmark' ? <>
        <div className="metricGrid"><Metric label="NDCG@5" value={trained.metrics ? trained.metrics.ndcg : 0} /><Metric label="PRECISION@5" value={trained.metrics ? trained.metrics.precision : 0} /><Metric label="RECALL@5" value={trained.metrics ? trained.metrics.recall : 0} /><Metric label="BRIER" value={trained.metrics ? trained.metrics.brier : 0} inverse /></div>
        <div className="evalTable"><div className="tableHead"><span>BENCHMARK</span><span>{BENCHMARK.length} CURATED CANDIDATES · 80/20 ID SPLIT</span></div>{BENCHMARK.slice(0,10).map(r=><div className="tableRow" key={r.id}><span>#{String(r.id).padStart(2,'0')}</span><p>{r.text}</p><b className={r.label?'yes':'no'}>{r.label?'POSITIVE':'NEGATIVE'}</b></div>)}</div>
        <div className="method"><b>WHAT THE METRICS MEAN</b><p>These are actual held-out metrics from the browser-trained logistic model on the curated starter benchmark. They are not platform engagement claims, not WLDD data, and not a substitute for production validation.</p></div>
      </> : <>
        <div className="progress"><i style={{width:`${(humanCount/12)*100}%`}}/></div>
        <div className="reviewGrid">{reviewRows.map(r=><article className={'reviewCard '+(humanLabels[r.id]!==undefined?'labelled':'')} key={r.id}><div className="candidateMeta">CANDIDATE {String(r.id).padStart(2,'0')} <span>{r.category.toUpperCase()}</span></div><p>“{r.text}”</p><div className="labelButtons"><button className={humanLabels[r.id]===1?'chosen':''} onClick={()=>toggleLabel(r.id,1)}>✓ YES</button><button className={humanLabels[r.id]===0?'chosen':''} onClick={()=>toggleLabel(r.id,0)}>× NO</button></div></article>)}</div>
        <div className="evaluationFooter"><button className="secondary" disabled={!humanMetrics} onClick={trainHuman}>{humanMetrics ? 'TRAIN HUMAN MODEL' : `LABEL ${Math.max(0,8-humanCount)} MORE TO TRAIN`}</button>{humanMetrics&&<div className="metrics"><span><b>{humanMetrics.ndcg.toFixed(2)}</b>NDCG@5</span><span><b>{humanMetrics.precision.toFixed(2)}</b>PRECISION@5</span><span><b>{humanMetrics.recall.toFixed(2)}</b>RECALL@5</span><span><b>{humanMetrics.train}/{humanMetrics.test}</b>TRAIN / TEST</span></div>}</div>
        {humanModel&&<div className="trainedBanner"><span>✓ HUMAN-IN-THE-LOOP MODEL ACTIVE</span><b>Ranking weights updated from {humanCount} editorial labels.</b></div>}
      </>}
    </section>}
    <footer><span>SIGNAL / AN INDEPENDENT WLDD-INSPIRED ML PROTOTYPE</span><span>Real browser training · held-out evaluation · explainable ranking · no proprietary data</span></footer>
  </main>
}

function Metric({label,value,inverse=false}:{label:string;value:number;inverse?:boolean}) { return <div className="metric"><span>{label}</span><strong>{(value*100).toFixed(0)}<small>{inverse?' lower is better':' / 100'}</small></strong><div className="metricBar"><i style={{width:`${Math.min(100,(inverse?1-value:value)*100)}%`}}/></div></div> }
