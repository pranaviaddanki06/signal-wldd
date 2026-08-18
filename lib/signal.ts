export type SignalFeatures = {
  semantic: number;
  hook: number;
  clarity: number;
  novelty: number;
  creatorFit: number;
};

export type RankedMoment = {
  id: number;
  time: string;
  title: string;
  text: string;
  features: SignalFeatures;
  score: number;
  probability: number;
  rankReason: string;
};

export type TrainingRow = {
  text: string;
  label: 0 | 1;
  id: number;
};

const STOP = new Set([
  'a','an','and','are','as','at','be','by','for','from','has','have','how','in','is','it','its','of','on','or','that','the','their','this','to','was','what','when','where','which','with','why','you','your','we','our','they','them','can','will','into','than','then','there','these','those','but','not','more','most','very','just','about','after','before','over','under','through','while','who','do','does','did','i','me','my','he','she','his','her','so','if'
]);

export function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').split(/\s+/).filter(Boolean).filter(w => !STOP.has(w));
}

function tfidfCosine(a: string, b: string): number {
  const docs = [tokenize(a), tokenize(b)];
  const df = new Map<string, number>();
  docs.forEach(doc => new Set(doc).forEach(t => df.set(t, (df.get(t) || 0) + 1)));
  const vocab = new Set([...docs[0], ...docs[1]]);
  const vector = (doc: string[]) => {
    const counts = new Map<string, number>();
    doc.forEach(t => counts.set(t, (counts.get(t) || 0) + 1));
    return [...vocab].map(t => {
      const tf = (counts.get(t) || 0) / Math.max(doc.length, 1);
      const idf = Math.log((2 + 1) / ((df.get(t) || 0) + 1)) + 1;
      return tf * idf;
    });
  };
  const x = vector(docs[0]);
  const y = vector(docs[1]);
  let dot = 0, nx = 0, ny = 0;
  for (let i = 0; i < x.length; i++) { dot += x[i] * y[i]; nx += x[i] ** 2; ny += y[i] ** 2; }
  return nx && ny ? dot / Math.sqrt(nx * ny) : 0;
}

function clamp(n: number) { return Math.max(0, Math.min(1, n)); }

function hookScore(text: string): number {
  const first = text.split(/[.!?]/)[0].trim();
  const words = tokenize(first);
  const length = words.length;
  const lengthFit = 1 - Math.min(Math.abs(length - 14) / 18, 1);
  const punctuation = /[?!:]/.test(first) ? 0.16 : 0;
  const directness = /\b(why|how|when|nobody|everyone|secret|problem|truth|mistake|first|only|actually)\b/i.test(first) ? 0.12 : 0;
  return clamp(0.52 * lengthFit + punctuation + directness + 0.2);
}

function clarityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).map(s => tokenize(s).length).filter(Boolean);
  const avg = sentences.reduce((a,b) => a+b, 0) / Math.max(sentences.length, 1);
  const sentenceFit = 1 - Math.min(Math.abs(avg - 15) / 25, 1);
  const longWords = tokenize(text).filter(w => w.length >= 11).length / Math.max(tokenize(text).length, 1);
  return clamp(0.65 * sentenceFit + 0.35 * (1 - longWords));
}

function noveltyScore(text: string): number {
  const words = tokenize(text);
  const unique = new Set(words).size / Math.max(words.length, 1);
  const concrete = words.filter(w => w.length >= 7).length / Math.max(words.length, 1);
  return clamp(0.45 * unique + 0.55 * Math.min(concrete * 2.2, 1));
}

function creatorFitScore(brief: string, text: string): number {
  const briefTerms = new Set(tokenize(brief));
  const textTerms = new Set(tokenize(text));
  if (!briefTerms.size) return 0.5;
  let overlap = 0;
  textTerms.forEach(t => { if (briefTerms.has(t)) overlap++; });
  const intentBoost = /creator|short.form|video|meme|community|brand|campaign|social|share|distribution/i.test(brief) && /creator|community|brand|video|share|audience|campaign|content/i.test(text) ? 0.25 : 0;
  return clamp((overlap / Math.max(Math.min(briefTerms.size, 12), 1)) * 2.2 + intentBoost + 0.35);
}

export function extractFeatures(brief: string, text: string): SignalFeatures {
  return {
    semantic: clamp(tfidfCosine(brief, text) * 2.4),
    hook: hookScore(text),
    clarity: clarityScore(text),
    novelty: noveltyScore(text),
    creatorFit: creatorFitScore(brief, text),
  };
}

export function featureVector(f: SignalFeatures): number[] {
  return [f.semantic, f.hook, f.clarity, f.novelty, f.creatorFit];
}

export function baselineScore(f: SignalFeatures): number {
  return 100 * (0.34*f.semantic + 0.22*f.hook + 0.16*f.clarity + 0.13*f.novelty + 0.15*f.creatorFit);
}

export type LogisticModel = { weights: number[]; bias: number; epochs: number; trainRows: number };

function sigmoid(z: number) { return 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z)))); }

export function trainLogistic(rows: { features: number[]; label: 0 | 1 }[], epochs = 700, lr = 0.08): LogisticModel | null {
  if (rows.length < 8 || new Set(rows.map(r => r.label)).size < 2) return null;
  const w = [0,0,0,0,0]; let b = 0;
  for (let epoch=0; epoch<epochs; epoch++) {
    const grad = [0,0,0,0,0]; let gb = 0;
    rows.forEach(r => {
      const p = sigmoid(r.features.reduce((s,x,i)=>s+x*w[i],0)+b);
      const e = p-r.label;
      r.features.forEach((x,i)=>grad[i]+=e*x);
      gb += e;
    });
    for(let i=0;i<w.length;i++) w[i] -= lr * grad[i] / rows.length;
    b -= lr * gb / rows.length;
  }
  return {weights:w,bias:b,epochs,trainRows:rows.length};
}

export function predict(model: LogisticModel, features: number[]): number {
  return sigmoid(features.reduce((s,x,i)=>s+x*model.weights[i],0)+model.bias);
}

export function rankMoments(brief: string, moments: {id:number;time:string;title:string;text:string}[], model?: LogisticModel | null): RankedMoment[] {
  return moments.map(m => {
    const features = extractFeatures(brief, m.text);
    const baseline = baselineScore(features);
    const probability = model ? predict(model, featureVector(features)) : baseline / 100;
    const score = model ? probability * 100 : baseline;
    const ranked = [
      ['semantic match', features.semantic],
      ['opening hook', features.hook],
      ['clarity', features.clarity],
      ['novelty', features.novelty],
      ['creator fit', features.creatorFit],
    ].sort((a,b)=>Number(b[1])-Number(a[1]))[0][0];
    return { ...m, features, score, probability, rankReason: `Led by ${ranked}; the score combines campaign relevance, editorial quality and creator fit.` };
  }).sort((a,b)=>b.score-a.score).map((m,i)=>({...m,rankReason:m.rankReason}));
}

export function ndcgAtK(items: {score:number; label:number}[], k=5): number {
  const ranked = [...items].sort((a,b)=>b.score-a.score).slice(0,k);
  const dcg = ranked.reduce((sum,x,i)=>sum + ((2**x.label-1) / Math.log2(i+2)), 0);
  const ideal = [...items].sort((a,b)=>b.label-a.label).slice(0,k).reduce((sum,x,i)=>sum + ((2**x.label-1) / Math.log2(i+2)), 0);
  return ideal ? dcg/ideal : 0;
}

export function precisionAtK(items: {score:number; label:number}[], k=5): number {
  const ranked = [...items].sort((a,b)=>b.score-a.score).slice(0,k);
  return ranked.reduce((s,x)=>s+x.label,0)/Math.max(ranked.length,1);
}

export function recallAtK(items: {score:number; label:number}[], k=5): number {
  const positives = items.reduce((s,x)=>s+x.label,0);
  if (!positives) return 0;
  const ranked = [...items].sort((a,b)=>b.score-a.score).slice(0,k);
  return ranked.reduce((s,x)=>s+x.label,0)/positives;
}

export function brierScore(items: {score:number; label:number}[]): number {
  if (!items.length) return 0;
  return items.reduce((s,x)=>s+(x.score-x.label)**2,0)/items.length;
}
