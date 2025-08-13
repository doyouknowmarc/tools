import React, { useState, useEffect, useRef } from 'react';
import { GripVertical, Upload, Download } from 'lucide-react';

// Define a type for colored ASCII characters (using JSDoc for clarity)
/** @typedef {{char: string, color: string}} ColoredChar */

export default function AsciiConverter() {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = 'black';
      document.body.style.backgroundColor = 'black';
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.documentElement.style.backgroundColor = '';
        document.body.style.backgroundColor = '';
      }
    };
  }, []);

  const [resolution, setResolution] = useState(0.11);
  const [inverted, setInverted] = useState(false);
  const [grayscale, setGrayscale] = useState(true);
  const [charSet, setCharSet] = useState('standard');
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [asciiArt, setAsciiArt] = useState('');
  const [coloredAsciiArt, setColoredAsciiArt] = useState([]);
  const [leftPanelWidth, setLeftPanelWidth] = useState(25);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [error, setError] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [sidebarNarrow, setSidebarNarrow] = useState(false);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);
  const outputCanvasRef = useRef(null);

  const charSets = {
    standard: ' .:-=+*#%@',
    detailed: ' .,:;i1tfLCG08@',
    blocks: ' ░▒▓█',
    minimal: ' .:█'
  };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    setIsDesktop(window.innerWidth >= 768);
    const handleResize = () => {
      const newIsDesktop = window.innerWidth >= 768;
      setIsDesktop(newIsDesktop);
      if (newIsDesktop !== isDesktop) {
        setLeftPanelWidth(25);
      }
    };
    window.addEventListener('resize', handleResize);
    loadDefaultImage();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isDesktop, isHydrated]);

  useEffect(() => {
    if (!isHydrated || !isDesktop) return;
    const checkSidebarWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const sidebarWidth = (leftPanelWidth / 100) * containerWidth;
        setSidebarNarrow(sidebarWidth < 350);
      }
    };
    checkSidebarWidth();
    window.addEventListener('resize', checkSidebarWidth);
    return () => {
      window.removeEventListener('resize', checkSidebarWidth);
    };
  }, [leftPanelWidth, isHydrated, isDesktop]);

  useEffect(() => {
    if (imageLoaded && imageRef.current) {
      convertToAscii();
    }
  }, [resolution, inverted, grayscale, charSet, imageLoaded]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        if (newLeftWidth >= 20 && newLeftWidth <= 80) {
          setLeftPanelWidth(newLeftWidth);
        }
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const startDragging = () => {
    setIsDragging(true);
  };

  const loadDefaultImage = () => {
    setLoading(true);
    setError(null);
    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (img.width === 0 || img.height === 0) {
        setError('Invalid image dimensions');
        setLoading(false);
        return;
      }
      imageRef.current = img;
      setImageLoaded(true);
      setLoading(false);
    };
    img.onerror = () => {
      setError('Failed to load image');
      setLoading(false);
    };
    img.src = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CleanShot%202025-04-21%20at%2007.18.50%402x-dZYTCjkP7AhQCvCtNcNHt4amOQSwtX.png';
  };

  const loadImage = (src) => {
    setLoading(true);
    setError(null);
    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (img.width === 0 || img.height === 0) {
        setError('Invalid image dimensions');
        setLoading(false);
        return;
      }
      imageRef.current = img;
      setImageLoaded(true);
      setLoading(false);
    };
    img.onerror = () => {
      setError('Failed to load image');
      setLoading(false);
    };
    img.src = src;
  };

  const handleFileUpload = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        loadImage(e.target.result);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };
  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const adjustColorBrightness = (r, g, b, factor) => {
    const minBrightness = 40;
    r = Math.max(Math.min(Math.round(r * factor), 255), minBrightness);
    g = Math.max(Math.min(Math.round(g * factor), 255), minBrightness);
    b = Math.max(Math.min(Math.round(b * factor), 255), minBrightness);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const renderToCanvas = () => {
    if (!outputCanvasRef.current || !asciiArt || coloredAsciiArt.length === 0) return;
    const canvas = outputCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const fontSize = 8;
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'top';
    const lineHeight = fontSize;
    const charWidth = fontSize * 0.6;
    if (grayscale) {
      const lines = asciiArt.split('\n');
      const maxLineLength = Math.max(...lines.map((line) => line.length));
      canvas.width = maxLineLength * charWidth;
      canvas.height = lines.length * lineHeight;
    } else {
      canvas.width = coloredAsciiArt[0].length * charWidth;
      canvas.height = coloredAsciiArt.length * lineHeight;
    }
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'top';
    if (grayscale) {
      ctx.fillStyle = 'white';
      asciiArt.split('\n').forEach((line, lineIndex) => {
        ctx.fillText(line, 0, lineIndex * lineHeight);
      });
    } else {
      coloredAsciiArt.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
          ctx.fillStyle = col.color;
          ctx.fillText(col.char, colIndex * charWidth, rowIndex * lineHeight);
        });
      });
    }
  };

  useEffect(() => {
    if (imageLoaded && !loading && !error) {
      renderToCanvas();
    }
  }, [asciiArt, coloredAsciiArt, grayscale, loading, error, imageLoaded]);

  const convertToAscii = () => {
    try {
      if (!canvasRef.current || !imageRef.current) {
        throw new Error('Canvas or image not available');
      }
      const img = imageRef.current;
      if (img.width === 0 || img.height === 0) {
        throw new Error('Invalid image dimensions');
      }
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      const width = Math.floor(img.width * resolution);
      const height = Math.floor(img.height * resolution);
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, img.width, img.height);
      let imageData;
      try {
        imageData = ctx.getImageData(0, 0, img.width, img.height);
      } catch (e) {
        throw new Error('Failed to get image data. This might be a CORS issue.');
      }
      const data = imageData.data;
      const chars = charSets[charSet];
      const fontAspect = 0.5;
      const widthStep = Math.ceil(img.width / width);
      const heightStep = Math.ceil(img.height / height / fontAspect);
      let result = '';
      const coloredResult = [];
      for (let y = 0; y < img.height; y += heightStep) {
        const coloredRow = [];
        for (let x = 0; x < img.width; x += widthStep) {
          const pos = (y * img.width + x) * 4;
          const r = data[pos];
          const g = data[pos + 1];
          const b = data[pos + 2];
          let brightness;
          if (grayscale) {
            brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
          } else {
            brightness = Math.sqrt(
              0.299 * (r / 255) * (r / 255) +
                0.587 * (g / 255) * (g / 255) +
                0.114 * (b / 255) * (b / 255)
            );
          }
          if (inverted) brightness = 1 - brightness;
          const charIndex = Math.floor(brightness * (chars.length - 1));
          const char = chars[charIndex];
          result += char;
          if (!grayscale) {
            const brightnessFactor = (charIndex / (chars.length - 1)) * 1.5 + 0.5;
            const color = adjustColorBrightness(r, g, b, brightnessFactor);
            coloredRow.push({ char, color });
          } else {
            coloredRow.push({ char, color: 'white' });
          }
        }
        result += '\n';
        coloredResult.push(coloredRow);
      }
      setAsciiArt(result);
      setColoredAsciiArt(coloredResult);
      setError(null);
    } catch (err) {
      console.error('Error converting to ASCII:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setAsciiArt('');
      setColoredAsciiArt([]);
    }
  };

  const downloadAsciiArt = () => {
    if (!asciiArt) {
      setError('No ASCII art to download');
      return;
    }
    const element = document.createElement('a');
    const file = new Blob([asciiArt], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'ascii-art.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div
        ref={containerRef}
        className="flex flex-col md:flex-row min-h-screen w-full overflow-hidden select-none"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          ref={previewRef}
          className={`order-1 md:order-2 flex-1 bg-black overflow-auto flex items-center justify-center ${
            isDraggingFile ? 'bg-opacity-50' : ''
          } relative`}
          style={
            isHydrated && isDesktop
              ? { width: `${100 - leftPanelWidth}%`, marginLeft: `${leftPanelWidth}%` }
              : {}
          }
        >
          {isDraggingFile && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10 select-none">
              <div className="text-white text-xl font-mono">Drop image here</div>
            </div>
          )}
          {loading ? (
            <div className="text-white font-mono select-none">Loading image...</div>
          ) : error ? (
            <div className="text-red-400 font-mono p-4 text-center select-none">
              {error}
              <div className="mt-2 text-white text-sm">Try uploading a different image or refreshing the page.</div>
            </div>
          ) : (
            <canvas
              ref={outputCanvasRef}
              className="max-w-full select-text"
              style={{
                fontSize: '0.4rem',
                lineHeight: '0.4rem',
                fontFamily: 'monospace'
              }}
            />
          )}
        </div>

        {isHydrated && isDesktop && (
          <div
            className="order-3 w-2 bg-stone-800 hover:bg-stone-700 cursor-col-resize items-center justify-center z-10 transition-opacity duration-300"
            onMouseDown={startDragging}
            style={{ position: 'absolute', left: `${leftPanelWidth}%`, top: 0, bottom: 0, display: 'flex' }}
          >
            <GripVertical className="h-6 w-6 text-stone-500" />
          </div>
        )}

        <div
          className={`order-2 md:order-1 w-full md:h-auto p-2 md:p-4 bg-stone-900 font-mono text-stone-300 transition-opacity duration-300 ${
            !isHydrated ? 'opacity-0' : 'opacity-100'
          }`}
          style={
            isHydrated && isDesktop
              ? {
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${leftPanelWidth}%`,
                  overflowY: 'auto'
                }
              : { width: '100%', height: 'auto', flex: '0 0 auto' }
          }
        >
          <div className="space-y-4 p-2 md:p-4 border border-stone-700 rounded-md">
            <div className="space-y-1">
              <h1 className="text-lg text-stone-100 font-bold">ASCII Art Converter</h1>
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2 border-t border-stone-700 pt-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="resolution" className="text-stone-300">
                    Resolution: {resolution.toFixed(2)}
                  </label>
                </div>
                <input
                  id="resolution"
                  type="range"
                  min="0.05"
                  max="0.3"
                  step="0.01"
                  value={resolution}
                  onChange={(e) => setResolution(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2 border-t border-stone-700 pt-4">
                <label htmlFor="charset" className="text-stone-300">
                  Character Set
                </label>
                <select
                  id="charset"
                  value={charSet}
                  onChange={(e) => setCharSet(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 p-2 rounded"
                >
                  <option value="standard">Standard</option>
                  <option value="detailed">Detailed</option>
                  <option value="blocks">Block Characters</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 border-t border-stone-700 pt-4">
                <input
                  id="invert"
                  type="checkbox"
                  checked={inverted}
                  onChange={(e) => setInverted(e.target.checked)}
                  className="form-checkbox"
                />
                <label htmlFor="invert" className="text-stone-300">
                  Invert Colors
                </label>
              </div>

              <div className="flex items-center space-x-2 border-t border-stone-700 pt-4">
                <input
                  id="grayscale"
                  type="checkbox"
                  checked={grayscale}
                  onChange={(e) => setGrayscale(e.target.checked)}
                  className="form-checkbox"
                />
                <label htmlFor="grayscale" className="text-stone-300">
                  Grayscale Mode
                </label>
              </div>

              <div className="hidden">
                <canvas ref={canvasRef} width="300" height="300"></canvas>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-stone-700">
                <button
                  onClick={() => {
                    if (!asciiArt) {
                      setError('No ASCII art to copy');
                      return;
                    }
                    const el = document.createElement('textarea');
                    el.value = asciiArt;
                    document.body.appendChild(el);
                    el.select();
                    document.execCommand('copy');
                    document.body.removeChild(el);
                    alert('ASCII art copied to clipboard!');
                  }}
                  className="flex-1 bg-stone-700 hover:bg-stone-600 text-stone-200 border border-stone-600 px-4 py-2 rounded"
                  disabled={loading || !imageLoaded}
                >
                  {sidebarNarrow ? 'Copy' : 'Copy ASCII Art'}
                </button>

                <button
                  onClick={downloadAsciiArt}
                  className="bg-stone-700 hover:bg-stone-600 text-stone-200 border border-stone-600 px-4 py-2 rounded"
                  title="Download ASCII Art"
                  disabled={loading || !imageLoaded || !asciiArt}
                >
                  <Download className="h-4 w-4" />
                </button>

                <button
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="bg-stone-700 hover:bg-stone-600 text-stone-200 border border-stone-600 px-4 py-2 rounded"
                  title="Upload Image"
                >
                  <Upload className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

