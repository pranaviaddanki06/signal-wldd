# SIGNAL — Content Opportunity Intelligence

**WLDD-inspired applied ML portfolio project**

SIGNAL is a product prototype for a media/content team: given a campaign objective and long-form content, it ranks moments that deserve editorial review first and exposes the signals behind each ranking.

## Why this project

The Applied ML Engineer role at WLDD emphasizes practical ML, classification/recommendation/ranking, structured and unstructured data, LLM/embedding workflows, evaluation, APIs, product integration, and shipping usable features. SIGNAL is deliberately built around that intersection rather than as a generic chatbot.

## Product flow

`Campaign brief → candidate moments → feature signals → ranking → explainability → human feedback → evaluation`

## Demo

The live app has two modes:

- **Intelligence Workspace:** inspect ranked content opportunities and the interpretable signals behind them.
- **Evaluation Lab:** create a human-labelled benchmark and experiment with the ranking workflow.

The included benchmark language is public-domain-oriented and is not WLDD proprietary data. This is an independent proof of concept and should not be presented as trained on WLDD data.

## Production evolution

A production implementation could replace the prototype components with:

1. Whisper or another ASR service for timestamped transcription.
2. Sentence-transformer embeddings for semantic relevance.
3. Candidate segmentation and editorial quality gates.
4. Learning-to-rank / calibrated classification.
5. PostgreSQL + pgvector for content and embeddings.
6. FastAPI or a worker service for inference at scale.
7. Human editorial feedback as training data.
8. Monitoring for quality, latency, cost and drift.

## Evaluation philosophy

Do not claim benchmark numbers that have not actually been measured. The intended evaluation protocol is a human-labelled candidate set with a held-out split and metrics such as Precision@5, Recall@5, NDCG@5, calibration/Brier score, latency and cost.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

Import this GitHub repository into Vercel. The project is a standard Next.js app and requires no environment variables for the demo.

## Portfolio positioning

> I researched WLDD's content and distribution model and identified a potential ML leverage point: prioritizing which moments in a large content library deserve human distribution attention. I built SIGNAL as an independent proof of concept, focusing on ranking, explainability, human feedback and evaluation rather than adding an unnecessary chatbot layer.

## Disclaimer

SIGNAL is an independent portfolio project inspired by publicly observable characteristics of the media/content problem space. It is not an official WLDD product and does not claim access to WLDD internal data, systems or processes.
