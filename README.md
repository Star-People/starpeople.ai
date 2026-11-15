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

This is the website repository. Field Station capture software, model training, and production data pipelines remain in their respective repositories. Creating this repository does not configure hosting or change the starpeople.ai domain.
