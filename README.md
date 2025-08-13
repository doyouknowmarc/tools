# Multi-Tool Web Application

A collection of useful web-based tools including a HEIC to JPG converter, text counter, and Pomodoro timer. All tools run locally in your browser without requiring server uploads.

## Features

### HEIC to JPG Converter
- 🖼️ Convert HEIC/HEIF images to JPG format
- 🔒 Privacy-focused: all processing happens in your browser
- 💾 Batch download all converted images

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

### Link Saver
- 🔖 Save links with descriptions and tags
- 💾 Stores data locally in your browser

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
