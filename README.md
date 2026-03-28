# Helpful Tools

Helpful Tools is a React + Vite single-page app that bundles a growing set of browser-based utilities for image cleanup, text workflows, quick calculators, and small productivity helpers.

Most tools run entirely in the browser. The main optional integration is a locally running [Ollama](https://ollama.com) instance for AI-assisted writing features.

## Current toolset

### Image and document tools

- HEIC to JPG Converter
- Screenshot Optimizer
- Background Remover
- Document OCR

### Writing and text tools

- Text Counter
- Text Converter
- Base64 Encoder & Decoder
- Regex Tester & Explainer
- Content Tone Adjuster
- Meeting Prep Assistant
- Mailto Link Generator
- QR Code Generator

### Productivity and utilities

- Simple Counter
- Pomodoro Timer
- Local Voting Session
- Public IP Address
- Location Data Visualizer

### Calculators and demos

- RAG Token Calculator
- Token Production Rate Demo
- ES RAM Calculator

## Tech stack

- React 18
- Vite 5
- Tailwind CSS
- Vitest + Testing Library
- ESLint
- `heic2any` for HEIC conversion
- `@imgly/background-removal` for local background removal
- `tesseract.js`, `pdfjs-dist`, and `pdf-lib` for OCR and PDF handling
- `leaflet` for map-based location visualisation

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm

### Install and run

```bash
git clone https://github.com/doyouknowmarc/tools.git
cd tools
npm install
npm run dev
```

The Vite dev server starts on `http://localhost:5173` by default.

## Available scripts

```bash
npm run dev        # start the local development server
npm run build      # create a production build in dist/
npm run preview    # preview the production build locally
npm run lint       # run ESLint
npm run test       # start Vitest in watch mode
npm run test:run   # run the test suite once
```

## Ollama integration

The following tools can stream responses from a local Ollama server:

- Content Tone Adjuster
- Meeting Prep Assistant

### Start Ollama for local development

Allow the browser app to reach your Ollama instance:

```bash
OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS="http://localhost:5173"
ollama serve
```

If you also use the GitHub Pages deployment, add both local and hosted origins to `~/.ollama/config`:

```toml
[server]
listen = "0.0.0.0:11434"
origins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://doyouknowmarc.github.io"
]
```

Restart Ollama after updating the config file.

### Verify the API

```bash
curl http://localhost:11434/api/tags
```

If no models are listed yet, pull one first with `ollama pull <model-name>`.

### Connect from the app

1. Open either the Tone Adjuster or Meeting Prep tool.
2. Enter the Ollama base URL, usually `http://localhost:11434`.
3. Click `Refresh models`.
4. Choose a model and start streaming rewrites or briefings.

## Testing and deployment

The GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs:

1. `npm run lint`
2. `npm run test:run`
3. `npm run build`

If those steps pass on `main`, the generated `dist/` folder is deployed to GitHub Pages.

The Vite base path is configured in [`vite.config.js`](vite.config.js) as `/tools/`, so if the repository name changes you should update that value before deploying.

## Contributing

Contributions are welcome. Open an issue or submit a pull request if you want to add a tool, improve an existing workflow, or tighten tests and docs.
