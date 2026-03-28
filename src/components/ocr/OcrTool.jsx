import React, { useState, useCallback, useEffect, useRef } from 'react';
import { saveAs } from 'file-saver';
import Header from './Header';
import UploadZone from './UploadZone';
import ProcessingIndicator from './ProcessingIndicator';
import Footer from './Footer';
import { FileValidator } from './utils/fileValidator';

export default function OcrTool() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processorRef = useRef(null);

  const loadProcessor = useCallback(async () => {
    if (!processorRef.current) {
      const module = await import('./utils/ocrProcessor');
      processorRef.current = module.OCRProcessor;
    }

    return processorRef.current;
  }, []);

  const generateFileId = () => crypto.randomUUID();

  const processFile = useCallback(
    async (file) => {
      try {
        const OCRProcessor = await loadProcessor();
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: 'processing', progress: 0 } : f
          )
        );
        const result = await OCRProcessor.processFile(
          file.originalFile,
          file.language || 'auto',
          (progress) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
            );
          }
        );
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: 'completed',
                  progress: 100,
                  ocrText: result.ocrText,
                  processedBlob: result.processedBlob,
                  pageTexts: result.pageTexts,
                }
              : f
          )
        );
      } catch (error) {
        console.error('Processing error:', error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: 'error',
                  error: error instanceof Error ? error.message : 'Processing failed',
                }
              : f
          )
        );
      }
    },
    [loadProcessor]
  );

  const handleFilesSelected = useCallback(
    async (selectedFiles, language) => {
      const newFiles = selectedFiles.map((file) => ({
        id: generateFileId(),
        originalFile: file,
        ocrText: '',
        status: 'pending',
        progress: 0,
        language,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
      setIsProcessing(true);
      for (const file of newFiles) {
        await processFile(file);
      }
      setIsProcessing(false);
    },
    [processFile]
  );

  const handleDownload = useCallback((file) => {
    if (file.processedBlob) {
      const fileName = file.originalFile.name.replace(/\.[^/.]+$/, '_ocr$&');
      saveAs(file.processedBlob, fileName);
    } else {
      const textBlob = new Blob([file.ocrText], { type: 'text/plain' });
      const fileName = file.originalFile.name.replace(/\.[^/.]+$/, '_ocr.txt');
      saveAs(textBlob, fileName);
    }
  }, []);

  const handleRemoveFile = useCallback((fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  useEffect(() => {
    return () => {
      processorRef.current?.terminateWorker();
    };
  }, []);

  const acceptedFormats = FileValidator.getAcceptedFormats().split(',');

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Header />
        <main className="flex flex-col items-center space-y-8">
          <UploadZone
            onFilesSelected={handleFilesSelected}
            isProcessing={isProcessing}
            acceptedFormats={acceptedFormats}
          />
          <ProcessingIndicator
            files={files}
            onDownload={handleDownload}
            onRemove={handleRemoveFile}
          />
        </main>
        <Footer />
      </div>
    </div>
  );
}
