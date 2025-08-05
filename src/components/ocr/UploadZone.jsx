import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileText, Image, AlertCircle } from 'lucide-react';
import { FileValidator } from './utils/fileValidator';
import LanguageSelector from './LanguageSelector';
import { getLastLanguage, saveLastLanguage } from './utils/languageOptions';

export default function UploadZone({ onFilesSelected, isProcessing, acceptedFormats }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(getLastLanguage());
  const fileInputRef = useRef(null);

  const handleLanguageChange = useCallback((language) => {
    setSelectedLanguage(language);
    saveLastLanguage(language);
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setIsDragActive(false);
      }
      return newCount;
    });
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      setDragCounter(0);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const { validFiles, errors } = FileValidator.validateFiles(files);
        if (errors.length > 0) {
          console.warn('File validation errors:', errors);
          alert('Some files were rejected:\n' + errors.join('\n'));
        }
        if (validFiles.length > 0) {
          onFilesSelected(validFiles, selectedLanguage);
        }
      }
    },
    [onFilesSelected, selectedLanguage]
  );

  const handleFileInput = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        const { validFiles, errors } = FileValidator.validateFiles(files);
        if (errors.length > 0) {
          console.warn('File validation errors:', errors);
          alert('Some files were rejected:\n' + errors.join('\n'));
        }
        if (validFiles.length > 0) {
          onFilesSelected(validFiles, selectedLanguage);
        }
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onFilesSelected, selectedLanguage]
  );

  const handleClick = useCallback(() => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  }, [isProcessing]);

  const handleKeyDown = useCallback(
    (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !isProcessing) {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick, isProcessing]
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={handleLanguageChange}
          disabled={isProcessing}
        />
      </div>
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer
          ${isDragActive ? 'border-black bg-gray-50 scale-105' : 'border-gray-300 hover:border-gray-400'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Upload files for OCR processing"
        aria-disabled={isProcessing}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={isProcessing}
        />
        <div className="flex flex-col items-center space-y-4">
          <div className={`
            p-6 rounded-full transition-all duration-300
            ${isDragActive ? 'bg-gray-100' : 'bg-gray-100'}
          `}>
            <Upload className={`
              w-12 h-12 transition-colors duration-300
              ${isDragActive ? 'text-black' : 'text-gray-600'}
            `} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {isDragActive ? 'Drop files here' : 'Upload Documents for OCR'}
            </h3>
            <p className="text-gray-600">
              Drag and drop files here, or <span className="text-black font-medium">click to browse</span>
            </p>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </div>
            <div className="flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <span>JPG, PNG, TIFF</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <AlertCircle className="w-3 h-3" />
            <span>Maximum file size: 25MB</span>
          </div>
        </div>
        {isDragActive && (
          <div className="absolute inset-0 rounded-xl bg-black bg-opacity-10 flex items-center justify-center">
            <div className="text-black font-semibold text-lg">Release to upload files</div>
          </div>
        )}
      </div>
      <div className="mt-6 text-center">
        <div className="text-sm text-gray-500 mb-2">
          Supported formats: {FileValidator.getSupportedTypesDisplay()}
        </div>
        <div className="text-xs text-gray-400">
          All processing happens locally in your browser for complete privacy
        </div>
      </div>
    </div>
  );
}
