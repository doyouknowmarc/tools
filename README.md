# Helpful Tools

Helpful Tools is a React + Vite single-page app that bundles a growing set of browser-based utilities for image cleanup, text workflows, quick calculators, and small productivity helpers.

Most tools run entirely in the browser. The main optional integration is a locally running [Ollama](https://ollama.com) instance for AI-assisted writing features.

## Current toolset

### Image and document tools

- HEIC to JPG Converter
- Screenshot Optimizer
- Background Remover
- Contour Segmenter
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
- Pro & Con List

### Productivity and utilities

- Simple Counter
- Pomodoro Timer
- Local Voting Session
- Public IP Address
- Location Data Visualizer
- Color Picker
- Coming Soon placeholder

### Calculators and demos

- RAG Token Calculator
- Token Production Rate Demo
- ES RAM Calculator

## Tech stack

- React 18
- Vite 7
- Tailwind CSS
- Vitest + Testing Library
- Playwright for browser and screenshot coverage
- ESLint
- `heic2any` for HEIC conversion
- `@imgly/background-removal` for local background removal
- browser canvas and pixel-processing utilities for contour-based segmentation
- `tesseract.js`, `pdfjs-dist`, and `pdf-lib` for OCR and PDF handling
- `leaflet` for map-based location visualisation

## Getting started

### Prerequisites

- Node.js 20.19 or newer, or Node.js 22.12 or newer
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

The test suite includes smoke coverage for every visible sidebar tool, plus focused
regression tests for upload size/type validation, safe regex match rendering, and
transparent-image preview behavior.

Security-related guardrails currently covered:

- image processing tools reject unsupported or oversized uploads before expensive browser work
- Base64 image decoding rejects unsupported data URL MIME types and oversized decoded payloads
- the regex tester renders matches with React nodes instead of injected HTML
- dependency audit is expected to report zero known vulnerabilities

The GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs:

1. `npm run lint`
2. `npm run test:run`
3. `npm run build`

If those steps pass on `main`, the generated `dist/` folder is deployed to GitHub Pages.

The Vite base path is configured in [`vite.config.js`](vite.config.js) as `/tools/`, so if the repository name changes you should update that value before deploying.

## Tool screenshots

Each visible sidebar tool has a current desktop screenshot in [`docs/screenshots`](docs/screenshots).

| Tool | Screenshot |
| --- | --- |
| Simple Counter | ![Simple Counter](docs/screenshots/01-simple-counter.jpg) |
| HEIC to JPG | ![HEIC to JPG](docs/screenshots/02-heic-to-jpg.jpg) |
| Screenshot Optimizer | ![Screenshot Optimizer](docs/screenshots/03-screenshot-optimizer.jpg) |
| Background Remover | ![Background Remover](docs/screenshots/04-background-remover.jpg) |
| Contour Segmenter | ![Contour Segmenter](docs/screenshots/05-contour-segmenter.jpg) |
| Text Counter | ![Text Counter](docs/screenshots/06-text-counter.jpg) |
| Converter | ![Converter](docs/screenshots/07-converter.jpg) |
| Base64 Tool | ![Base64 Tool](docs/screenshots/08-base64-tool.jpg) |
| Pomodoro Timer | ![Pomodoro Timer](docs/screenshots/09-pomodoro-timer.jpg) |
| Meeting Prep | ![Meeting Prep](docs/screenshots/10-meeting-prep.jpg) |
| Voting Session | ![Voting Session](docs/screenshots/11-voting-session.jpg) |
| Public IP | ![Public IP](docs/screenshots/12-public-ip.jpg) |
| Location Data | ![Location Data](docs/screenshots/13-location-data.jpg) |
| Mailto Link | ![Mailto Link](docs/screenshots/14-mailto-link.jpg) |
| Tone Adjuster | ![Tone Adjuster](docs/screenshots/15-tone-adjuster.jpg) |
| Color Picker | ![Color Picker](docs/screenshots/16-color-picker.jpg) |
| QR Codes | ![QR Codes](docs/screenshots/17-qr-codes.jpg) |
| Document OCR | ![Document OCR](docs/screenshots/18-document-ocr.jpg) |
| RAG Calculator | ![RAG Calculator](docs/screenshots/19-rag-calculator.jpg) |
| Regex Tester | ![Regex Tester](docs/screenshots/20-regex-tester.jpg) |
| Token Rate Demo | ![Token Rate Demo](docs/screenshots/21-token-rate-demo.jpg) |
| ES RAM Calculator | ![ES RAM Calculator](docs/screenshots/22-es-ram-calculator.jpg) |
| Pro & Con List | ![Pro & Con List](docs/screenshots/23-pro-and-con-list.jpg) |
| Coming Soon | ![Coming Soon](docs/screenshots/24-coming-soon.jpg) |

## Contributing

Contributions are welcome. Open an issue or submit a pull request if you want to add a tool, improve an existing workflow, or tighten tests and docs.
