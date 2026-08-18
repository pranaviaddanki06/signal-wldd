export type BenchmarkCandidate = { id:number; text:string; label:0|1; category:string };

// Small, transparent starter benchmark. Labels are editorially curated for the demo,
// not collected from WLDD or any proprietary platform. They exist so the training
// and held-out evaluation pipeline is executable end-to-end without fake metrics.
export const BENCHMARK: BenchmarkCandidate[] = [
 {id:1,text:'The one sentence that changes how people see a familiar problem.',label:1,category:'insight'},
 {id:2,text:'A long explanation of the schedule for next week, with no clear takeaway.',label:0,category:'update'},
 {id:3,text:'Why communities can turn one idea into hundreds of creator-led variations.',label:1,category:'community'},
 {id:4,text:'The speaker lists five routine steps for uploading a file.',label:0,category:'tutorial'},
 {id:5,text:'Nobody talks about the tiny constraint that makes this creative idea work.',label:1,category:'creative'},
 {id:6,text:'A detailed recap of yesterday’s meeting with every attendee mentioned.',label:0,category:'recap'},
 {id:7,text:'The surprising reason a simple hook can outperform a polished campaign.',label:1,category:'marketing'},
 {id:8,text:'A generic introduction that repeats the title without adding context.',label:0,category:'intro'},
 {id:9,text:'Creators do not need a finished script; they need a sharp outcome and room to interpret it.',label:1,category:'creator'},
 {id:10,text:'A list of software settings read aloud with no narrative or opinion.',label:0,category:'tutorial'},
 {id:11,text:'When everyone can publish, the scarce resource is the moment that makes someone stop scrolling.',label:1,category:'attention'},
 {id:12,text:'The host thanks the audience and moves to the next agenda item.',label:0,category:'transition'},
 {id:13,text:'The mistake brands make when they ask creators to sound like a brand.',label:1,category:'creator'},
 {id:14,text:'A three-minute description of an internal process with no audience consequence.',label:0,category:'process'},
 {id:15,text:'A community can turn one idea into hundreds of variations before a traditional campaign finishes approval.',label:1,category:'community'},
 {id:16,text:'A chronological list of product features with no comparison or point of view.',label:0,category:'product'},
 {id:17,text:'The strongest creator work often starts with a constraint, not a script.',label:1,category:'creative'},
 {id:18,text:'The speaker repeats a previously stated statistic without explaining why it matters.',label:0,category:'statistic'},
 {id:19,text:'Distribution becomes measurable when you understand which signals predict whether an idea travels.',label:1,category:'distribution'},
 {id:20,text:'A routine status update about tasks completed during the afternoon.',label:0,category:'status'},
 {id:21,text:'The audience reaction is the clue: people share ideas that give them language for something they already feel.',label:1,category:'culture'},
 {id:22,text:'A long disclaimer about the limitations of the presentation.',label:0,category:'disclaimer'},
 {id:23,text:'The best short-form moments often contain a complete idea even after the surrounding context is removed.',label:1,category:'short-form'},
 {id:24,text:'A speaker reads a slide word for word and pauses between bullet points.',label:0,category:'presentation'},
 {id:25,text:'A small creative decision that makes an otherwise ordinary brand story feel native to the community.',label:1,category:'brand'},
 {id:26,text:'A technical definition is followed by another technical definition with no example.',label:0,category:'education'},
 {id:27,text:'The uncomfortable question that exposes why the old campaign playbook stopped working.',label:1,category:'strategy'},
 {id:28,text:'A list of dates, locations and contact details for upcoming events.',label:0,category:'information'},
 {id:29,text:'People do not share a product because it is complete; they share the story they can make from it.',label:1,category:'brand'},
 {id:30,text:'A closing summary that repeats three points already covered earlier in the talk.',label:0,category:'summary'}
];
