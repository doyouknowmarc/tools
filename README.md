# Multi-Tool Web App

A collection of useful web-based tools that run locally in your browser without requiring server uploads.

## Features

This application includes the following tools:

### HEIC to JPG Converter
- 🖼️ Convert HEIC/HEIF images to JPG format
- 🔒 Privacy-focused: all processing happens in your browser
- 💾 Batch download all converted images

### Text Counter
- 📝 Count characters, words, and sentences in text
- 📊 Real-time statistics as you type

### Pomodoro Timer
- ⏱️ Customizable work and break durations
- 🔄 Automatic switching between work and break periods
- 🔔 Audio notification when timer ends

### Public IP Address
- 🌐 Display your current public IP address
- 🔄 Refresh the value with a single click

### Stakeholder Matrix
- 🗺️ Map and manage project stakeholders
- 📥 Export matrix as an image

### Document OCR
- 📄 Extract text from images and PDF documents
- 🔍 Supports multiple languages

### RAG Token Calculator
- 🧮 Calculate tokens for Retrieval-Augmented Generation models
- 📈 Estimate costs for different models

### Token Production Rate Demo
- 🚀 Demonstrates token production rates for various models
- 📊 Compare real-time performance

## Technology Stack

- React.js for the UI
- Vite as the build tool
- TailwindCSS for styling
- `heic2any` for HEIC conversion
- `react-dropzone` for file uploads
- `tesseract.js` for OCR
- `pdf-lib` for PDF manipulation

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd <project-directory>

# Install dependencies
npm install

# Start development server
npm run dev
```
The application will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment

This project can be deployed to any static site hosting service, including GitHub Pages.

For GitHub Pages, you can use GitHub Actions to automate the build and deployment process. A typical workflow would build the project and deploy the `dist` directory to the `gh-pages` branch.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
