# Multi-Tool Web Application

A collection of useful web-based tools including a HEIC to JPG converter, text counter, and Pomodoro timer. All tools run locally in your browser without requiring server uploads.

## Features

### HEIC to JPG Converter
- 🖼️ Convert HEIC/HEIF images to JPG format
- 🔒 Privacy-focused: all processing happens in your browser
- 💾 Batch download all converted images

### Screenshot Optimizer
- 🪄 Compress PNG/JPEG screenshots with quality presets
- 📉 Compare original and optimised file sizes instantly
- 🧼 Re-encode assets to strip metadata before sharing

### Meeting Prep Assistant
- 🧭 Summarise agendas into clear objectives and prompts
- ❓ Surface targeted questions based on meeting type
- ✅ Generate actionable follow-up tasks ready to share

### Regex Tester & Explainer
- 🔍 Highlight regex matches against sample text instantly
- 🧠 Break patterns into human-friendly explanations
- 🎛️ Toggle flags to explore different matching behaviours

### Content Tone Adjuster
- ✍️ Rephrase copy across formal, friendly, concise, and supportive tones
- 📋 Copy ready-to-send rewrites with one click
- 📊 Track word, sentence, and reading time changes instantly

### API Latency Budget Calculator
- ⏱️ Model cumulative latency across service dependencies
- 🧮 Factor in concurrency, fan-out, and jitter for p95 estimates
- 📈 Highlight the biggest contributors and optimisation opportunities

### Text Counter
- 📝 Count characters, words, and sentences in text
- 📊 Real-time statistics as you type
- 🔍 Detailed breakdown of text metrics

### Pomodoro Timer
- ⏱️ Customizable work and break durations
- 🔄 Automatic switching between work and break periods
- 🔔 Audio notification when timer ends

### Public IP Address
- 🌐 Display your current public IP address
- 🔄 Refresh the value with a single click

## Technology Stack

- React.js for the UI
- Vite as the build tool
- TailwindCSS for styling
- heic2any for HEIC conversion
- react-dropzone for file uploads

## Development

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/doyouknowmarc/tools.git
cd tools

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Connecting the AI tools to Ollama

The Tone Adjuster and Meeting Prep Assistant can call a locally running [Ollama](https://ollama.ai) instance for live rewrites and briefings.

1. **Allow browser access** by setting the host and allowed origins when launching Ollama:

   ```bash
   OLLAMA_HOST=0.0.0.0:11434 \
   OLLAMA_ORIGINS="http://localhost:5173" \
   ollama serve
   ```
   
   Copy Paste Example:
   ```bash
   OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS="https://doyouknowmarc.github.io" \
   ollama serve
   ```
   
   If you run the dev server on another port (or deploy the app), add that origin to the `OLLAMA_ORIGINS` list. You can also make the change permanent by adding the values to `~/.ollama/config`:

   ```toml
   [server]
   listen = "0.0.0.0:11434"
   origins = [
     "http://localhost:5173",
     "http://127.0.0.1:5173"
   ]
   ```

   Restart Ollama after updating the configuration file.

3. **Verify the API is reachable**:

   ```bash
   curl http://localhost:11434/api/tags
   ```

   The response should list the available models.

4. **Load models inside the app** by entering the base URL (for example `http://localhost:11434`) in the Tone Adjuster or Meeting Prep panels and clicking **Refresh models**. Once connected, choose a model and trigger the rewrite/drafting buttons to call Ollama.

## Deployment to GitHub Pages

This project is configured for easy deployment to GitHub Pages. Follow these steps:

1. Create a GitHub repository for this project

2. Push your code to the GitHub repository:
   ```bash
   git remote add origin https://github.com/doyouknowmarc/tools.git
   git branch -M main
   git push -u origin main
   ```

3. GitHub Actions will automatically build and deploy your site to GitHub Pages whenever you push to the main branch

4. Go to your repository settings > Pages to check the deployment status

5. Your site will be available at: `https://doyouknowmarc.github.io/tools/`

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
