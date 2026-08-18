# SIGNAL — Content Opportunity Intelligence

**WLDD-inspired applied ML portfolio project**

SIGNAL is an independent product prototype for a media/content team: given a campaign objective and long-form content, it ranks moments that deserve editorial review first and exposes the signals behind each ranking.

## What changed in v3 — real-data audit

SIGNAL now includes an audited **29,999-row Instagram analytics dataset** supplied for this project. The raw CSV is intentionally kept outside the repository; the app stores a compact aggregate artifact used by the Real Data Audit page.

The audit found:

- 29,999 posts
- 20 accounts
- 10 content categories
- 3 media types
- 6 traffic sources
- 0 missing values
- 0 duplicate rows
- dates spanning November 2024 to November 2025
- an almost perfectly balanced four-class performance label

### Leakage control

A critical ML finding is that `likes`, `comments`, `shares`, `saves`, `reach`, `impressions`, `engagement_rate` and `followers_gained` are **post-publication outcomes**. They must not be used as predictors for a pre-publication opportunity model.

SIGNAL therefore treats these fields as outcomes for descriptive analysis only. The pre-publication ranking layer remains based on campaign relevance and editorial features. The Real Data Audit page makes this distinction explicit instead of inflating model performance with target leakage.

## What changed in v2

- **TF-IDF semantic features** compare a campaign brief with each candidate moment.
- **Editorial feature extraction** scores hook strength, clarity, novelty and creator fit.
- **Logistic ranking model** is trained in the browser with gradient descent; there is no hard-coded ranking formula presented as a trained model.
- **Held-out evaluation** uses a deterministic 80/20 candidate split and reports NDCG@5, Precision@5, Recall@5 and Brier score.
- **Human-in-the-loop review** lets an editor label candidate moments YES/NO, retrain the same model and inspect the resulting held-out metrics.
- **Explainability** exposes feature signals and model probability behind every ranked opportunity.
- **Real Data Audit** exposes dataset health, label balance, category/media aggregates and leakage rules.

## Product flow

`Campaign brief → candidate moments → TF-IDF + editorial features → logistic ranking → explainability → human feedback → held-out evaluation`

## Evaluation integrity

The original 30-record starter benchmark is **editorially curated demonstration data**. It is not WLDD data, platform engagement data, or a claim of real-world virality.

The Instagram dataset is used as a separate evidence layer. Because its performance label is balanced and appears outcome-derived, SIGNAL does not claim that it can predict real-world virality from the available pre-publication fields without further validation. This is intentional: the project demonstrates leakage-aware ML reasoning rather than manufacturing impressive metrics.

For production validation, the next step is a human-labelled content-opportunity dataset with genuine downstream distribution outcomes and a temporal test set.

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

Historical Instagram dataset
            ↓
      Data audit / EDA
            ↓
 Leakage checks + descriptive calibration
            ↓
   Evidence shown separately
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
9. Temporal evaluation against real downstream distribution outcomes.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The real-data audit is available at `/data`.

## Deploy

The repository is connected to Vercel for production deployment. Vercel automatically builds the `main` branch.

## Portfolio positioning

> I researched the content/distribution problem space and identified a potential ML leverage point: prioritizing which moments in a large content library deserve human distribution attention. I built SIGNAL as an independent proof of concept with an executable ranking model, held-out evaluation, explainability, human-in-the-loop retraining, and a leakage-aware audit of a 29,999-post Instagram analytics dataset.

## Interview talking points

- **Why ranking?** Distribution teams have more candidate moments than humans can review; ranking is a direct way to allocate editorial attention.
- **Why TF-IDF first?** It is transparent, deterministic and dependency-light for a portfolio prototype; production can replace it with transformer or multimodal embeddings.
- **Why logistic regression?** It gives an interpretable baseline and a clean bridge from editorial features to ranking probability.
- **Why held-out evaluation?** A model should be evaluated on candidates it did not train on; the demo therefore reports metrics from a deterministic hold-out rather than a training-set score.
- **Why human-in-the-loop?** Editorial judgment is the label source. The review queue demonstrates how those judgments can become training data.
- **Why not use engagement metrics as predictors?** Because likes, shares, reach and engagement rate occur after publication. Using them would create target leakage and produce an invalid pre-publication predictor.
- **What did the real dataset teach you?** The dataset is clean and balanced, but its outcome structure requires provenance and leakage checks before predictive claims. Treating that limitation explicitly is part of the ML work.

## Disclaimer

SIGNAL is an independent portfolio project inspired by publicly observable characteristics of the media/content problem space. It is not an official WLDD product and does not claim access to WLDD internal data, systems or processes.
