import Tesseract from 'tesseract.js';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export class OCRProcessor {
  static workers = new Map();

  static async initializeWorker(language = 'eng') {
    const workerLanguage = language === 'auto' ? 'eng' : language;

    if (this.workers.has(workerLanguage)) {
      return this.workers.get(workerLanguage);
    }

    const worker = await Tesseract.createWorker(workerLanguage, 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          // progress handled elsewhere
        }
      },
    });

    this.workers.set(workerLanguage, worker);
    return worker;
  }

  static async terminateWorker(language) {
    if (language) {
      const worker = this.workers.get(language);
      if (worker) {
        await worker.terminate();
        this.workers.delete(language);
      }
    } else {
      for (const [lang, worker] of this.workers.entries()) {
        await worker.terminate();
        this.workers.delete(lang);
      }
    }
  }

  static async processFile(file, language, onProgress) {
    const worker = await this.initializeWorker(language);
    try {
      if (file.type === 'application/pdf') {
        return await this.processPDF(file, worker, language, onProgress);
      } else {
        return await this.processImage(file, worker, language, onProgress);
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async processImage(file, worker, language, onProgress) {
    onProgress(10);
    const recognizeOptions = { rectangle: undefined };
    if (language !== 'auto') {
      recognizeOptions.lang = language;
    }
    const { data } = await worker.recognize(file, recognizeOptions);
    onProgress(100);
    return {
      ocrText: data.text,
      processedBlob: file,
      pageTexts: [data.text],
    };
  }

  static async processPDF(file, worker, language, onProgress) {
    onProgress(5);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdfDoc.numPages;
      onProgress(10);
      let allText = '';
      const pageTexts = [];
      const progressPerPage = 75 / numPages;
      const recognizeOptions = { rectangle: undefined };
      if (language !== 'auto') {
        recognizeOptions.lang = language;
      }
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        try {
          const page = await pdfDoc.getPage(pageNum);
          const scale = 2.0;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) {
            throw new Error('Failed to get canvas context');
          }
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const renderContext = {
            canvasContext: context,
            viewport,
          };
          await page.render(renderContext).promise;
          const imageBlob = await new Promise((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else throw new Error('Failed to convert canvas to blob');
            }, 'image/png');
          });
          const { data } = await worker.recognize(imageBlob, recognizeOptions);
          const pageText = data.text.trim();
          pageTexts.push(pageText);
          allText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
          canvas.remove();
        } catch (pageError) {
          console.warn(`Failed to process page ${pageNum}:`, pageError);
          const errorText = '[OCR processing failed for this page]';
          pageTexts.push(errorText);
          allText += `\n--- Page ${pageNum} ---\n${errorText}\n`;
        }
        onProgress(10 + pageNum * progressPerPage);
      }
      onProgress(90);
      const freshArrayBuffer = await file.arrayBuffer();
      const newPdfDoc = await PDFDocument.load(freshArrayBuffer);
      const pages = newPdfDoc.getPages();
      const textLines = allText
        .split('\n')
        .filter((line) => line.trim() && !line.startsWith('---'));
      pages.forEach((page, pageIndex) => {
        const { width, height } = page.getSize();
        const fontSize = 8;
        const lineHeight = fontSize * 1.2;
        const maxLines = Math.floor(height / lineHeight) - 5;
        const linesPerPage = Math.ceil(textLines.length / pages.length);
        const startLine = pageIndex * linesPerPage;
        const endLine = Math.min(startLine + linesPerPage, textLines.length);
        const pageLines = textLines.slice(startLine, endLine);
        pageLines.slice(0, maxLines).forEach((line, lineIndex) => {
          if (line.trim()) {
            try {
              page.drawText(line.substring(0, 100), {
                x: 10,
                y: height - 30 - lineIndex * lineHeight,
                size: fontSize,
                color: rgb(0, 0, 0),
                opacity: 0,
              });
            } catch (textError) {
              console.warn('Failed to add text to PDF:', textError);
            }
          }
        });
      });
      const pdfBytes = await newPdfDoc.save();
      onProgress(100);
      return {
        ocrText: allText,
        processedBlob: new Blob([pdfBytes], { type: 'application/pdf' }),
        pageTexts,
      };
    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error(`PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

