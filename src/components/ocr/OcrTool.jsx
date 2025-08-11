import React, { useState, useCallback, useEffect } from 'react';
import { saveAs } from 'file-saver';
import Header from './Header';
import UploadZone from './UploadZone';
import ProcessingIndicator from './ProcessingIndicator';
import Footer from './Footer';
import { FileValidator } from './utils/fileValidator';
import { OCRProcessor } from './utils/ocrProcessor';

export default function OcrTool() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const generateFileId = () => Math.random().toString(36).substring(2, 15);

  const processFile = useCallback(async (file) => {
    try {
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
  }, []);

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
      OCRProcessor.terminateWorker();
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
