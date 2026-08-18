# SIGNAL — Content Opportunity Intelligence

**WLDD-inspired applied ML portfolio project**

SIGNAL is an independent product prototype for a media/content team: given a campaign objective and long-form content, it ranks moments that deserve editorial review first and exposes the signals behind each ranking.

## What changed in v2

The original concept was a polished static ranking demo. SIGNAL v2 turns the core idea into an executable ML workflow:

- **TF-IDF semantic features** compare a campaign brief with each candidate moment.
- **Editorial feature extraction** scores hook strength, clarity, novelty and creator fit.
- **Logistic ranking model** is trained in the browser with gradient descent; there is no hard-coded ranking formula presented as a trained model.
- **Held-out evaluation** uses a deterministic 80/20 candidate split and reports NDCG@5, Precision@5, Recall@5 and Brier score.
- **Human-in-the-loop review** lets an editor label candidate moments YES/NO, retrain the same model and inspect the resulting held-out metrics.
- **Explainability** exposes the feature signals and model probability behind every ranked opportunity.
- **Reproducibility** means the demo requires no API key, database or proprietary dataset.

## Product flow

`Campaign brief → candidate moments → TF-IDF + editorial features → logistic ranking → explainability → human feedback → held-out evaluation`

## Evaluation integrity

The included 30-record starter benchmark is **editorially curated demonstration data**. It is not WLDD data, platform engagement data, or a claim of real-world virality. Its purpose is to make the training and evaluation pipeline executable end-to-end without inventing benchmark numbers.

The app deliberately labels the benchmark as curated and keeps the evaluation protocol visible. For production validation, the next step would be a much larger human-labelled dataset with real downstream outcomes.

## Architecture

```text
Campaign brief + candidate text
            ↓
     Tokenization / TF-IDF
            ↓
  Semantic + editorial features
            ↓
      Logistic ranker
            ↓
 Probability / opportunity score
            ↓
 Explainable ranked shortlist
            ↓
 Human labels → retraining
            ↓
 Held-out ranking metrics
```

## Production evolution

A production implementation could replace the browser components with:

1. Whisper or another ASR service for timestamped transcription.
2. Sentence-transformer or multimodal embeddings for semantic relevance.
3. Candidate segmentation and editorial quality gates.
4. Learning-to-rank / calibrated classification at larger scale.
5. PostgreSQL + pgvector for content and embeddings.
6. FastAPI or a worker service for inference at scale.
7. Human editorial feedback as training data.
8. Monitoring for ranking quality, latency, cost and drift.

## Why this project

The Applied ML Engineer role at WLDD emphasizes practical ML, classification/recommendation/ranking, structured and unstructured data, embedding workflows, evaluation, APIs, product integration and shipping usable features. SIGNAL is deliberately built around that intersection rather than as a generic chatbot.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy

The repository is a standard Next.js application and is connected to Vercel for production deployment. Vercel automatically builds the `main` branch.

## Portfolio positioning

> I researched the content/distribution problem space and identified a potential ML leverage point: prioritizing which moments in a large content library deserve human distribution attention. I built SIGNAL as an independent proof of concept with an executable ranking model, held-out evaluation, explainability and human-in-the-loop retraining rather than adding an unnecessary chatbot layer.

## Interview talking points

- **Why ranking?** Distribution teams have more candidate moments than humans can review; ranking is a direct way to allocate editorial attention.
- **Why TF-IDF first?** It is transparent, deterministic and dependency-light for a portfolio prototype; production can replace it with transformer or multimodal embeddings.
- **Why logistic regression?** It gives a calibrated baseline, interpretable weights and a clean bridge from editorial features to ranking probability.
- **Why held-out evaluation?** A model should be evaluated on candidates it did not train on; the demo therefore reports metrics from a deterministic hold-out rather than a training-set score.
- **Why human-in-the-loop?** Editorial judgment is the label source. The review queue demonstrates how those judgments can become training data instead of being treated as an afterthought.

## Disclaimer

SIGNAL is an independent portfolio project inspired by publicly observable characteristics of the media/content problem space. It is not an official WLDD product and does not claim access to WLDD internal data, systems or processes.
