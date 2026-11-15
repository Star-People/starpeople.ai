# Star People — starpeople.ai

Star People is an observation network for people with wonder: distributed sky-watching cameras and sensors using a shared anomaly model to detect, review, and archive observations.

This repository contains the current website and branding concept, including the hardware setup guide, real detection examples, public archive presentation, and model-comparison section. The concept is still in development.

## Local preview

The site is static and has no build step:

```sh
python3 -m http.server 8787 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:8787/. The setup guide is `/join.html`; image and asset attribution is in `/credits.html`.

## Files

- `dist/index.html`: homepage
- `dist/join.html` and `dist/setup.js`: hardware and Codex setup guide
- `dist/style.css` and `dist/app.js`: site styles and behavior
- `dist/assets/`: detection examples, video previews, imagery, and branding
- `dist/vendor/`: local design-system styles and fonts

The foundation is [glenn-sorrentino/design-system](https://github.com/glenn-sorrentino/design-system), reference commit `f89ec1a`. Existing source credits are retained in `dist/credits.html`.

This is the website repository. Field Station capture software, model training, and production data pipelines remain in their respective repositories. GitHub Pages publishes `dist/` to https://starpeople.ai after changes to `main`. The workflow uses GitHub-hosted runners; DNS remains managed at Njalla.

## Model leaderboard

The public table and `dist/assets/model-comparison.json` are generated together
from the latest completed four-model Field Station comparison. They show a dated
training-set comparison, not live or held-out accuracy. Refresh before publishing:

```sh
python3 scripts/update-leaderboard.py /path/to/observation-metrics-export.json
```

The script validates equal evaluation populations, derives metrics from confusion
matrices, and ranks the weighted harmonic score with shared ranks for ties.
Only aggregate scores, model hashes, and settings revisions are published; keep
raw API exports outside this repository. A new export must be committed and
deployed for the public snapshot to change.

## Image delivery

Background photographs use resized WebP assets with smaller mobile variants.
Detection crops retain their original pixel dimensions and use lossless WebP
only when smaller than the original. The archive video uses a direct media source and native playback controls, so
it remains playable without JavaScript. Automatic playback respects reduced-motion
preferences when JavaScript is available.
