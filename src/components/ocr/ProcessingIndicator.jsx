import React, { useState } from 'react';
import { Download, X, FileText, Image, CheckCircle, AlertCircle, Loader, ChevronDown, ChevronUp, FileIcon, Globe } from 'lucide-react';
import { getLanguageName } from './utils/languageOptions';

export default function ProcessingIndicator({ files, onDownload, onRemove }) {
  const [expandedFiles, setExpandedFiles] = useState(new Set());
  if (files.length === 0) return null;
  const toggleExpanded = (fileId) => {
    setExpandedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension === 'pdf' ? FileText : Image;
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'error':
        return AlertCircle;
      default:
        return Loader;
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };
  const getBackgroundColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };
  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Processing Queue ({files.length} file{files.length !== 1 ? 's' : ''})
      </h3>
      <div className="space-y-3">
        {files.map((file) => {
          const FileIconComponent = getFileIcon(file.originalFile.name);
          const StatusIcon = getStatusIcon(file.status);
          const isExpanded = expandedFiles.has(file.id);
          const hasPageTexts = file.pageTexts && file.pageTexts.length > 0;
          return (
            <div
              key={file.id}
              className={`
                relative border rounded-lg transition-all duration-300
                ${getBackgroundColor(file.status)}
              `}
            >
              <div className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <FileIconComponent className="w-8 h-8 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {file.originalFile.name}
                      </h4>
                      <span className="text-xs text-gray-500">
                        ({(file.originalFile.size / (1024 * 1024)).toFixed(1)} MB)
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-2">
                      <StatusIcon
                        className={`w-4 h-4 ${getStatusColor(file.status)} ${file.status === 'processing' ? 'animate-spin' : ''}`}
                      />
                      <span className={`text-sm ${getStatusColor(file.status)}`}>
                        {file.status === 'pending' && 'Waiting...'}
                        {file.status === 'processing' && 'Processing OCR...'}
                        {file.status === 'completed' && 'OCR Complete'}
                        {file.status === 'error' && (file.error || 'Processing failed')}
                      </span>
                      {file.language && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Globe className="w-3 h-3" />
                          <span>{getLanguageName(file.language)}</span>
                        </div>
                      )}
                    </div>
                    {file.status === 'processing' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {file.progress}% complete
                        </div>
                      </div>
                    )}
                    {file.status === 'completed' && file.ocrText && (
                      <div className="mt-2 p-2 bg-white rounded border">
                        <div className="text-xs text-gray-600 mb-1">Extracted Text Preview:</div>
                        <div className="text-sm text-gray-800 max-h-20 overflow-y-auto">
                          {file.ocrText.substring(0, 200)}
                          {file.ocrText.length > 200 && '...'}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex items-center space-x-2">
                    {file.status === 'completed' && (
                      <button
                        onClick={() => onDownload(file)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors duration-200"
                        title="Download processed file"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                    {file.status === 'completed' && hasPageTexts && (
                      <button
                        onClick={() => toggleExpanded(file.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors duration-200"
                        title={isExpanded ? 'Hide page text' : 'Show page text'}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    )}
                    <button
                      onClick={() => onRemove(file.id)}
                      className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors duration-200"
                      title="Remove from queue"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              {isExpanded && file.status === 'completed' && hasPageTexts && (
                <div className="border-t border-gray-200 bg-white">
                  <div className="p-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <FileIcon className="w-4 h-4 mr-2" />
                      Extracted Text by Page ({file.pageTexts.length} page{file.pageTexts.length !== 1 ? 's' : ''})
                      {file.language && (
                        <span className="ml-2 text-xs text-gray-500 flex items-center">
                          <Globe className="w-3 h-3 mr-1" />
                          {getLanguageName(file.language)}
                        </span>
                      )}
                    </h5>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {file.pageTexts.map((pageText, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg">
                          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                            <h6 className="text-xs font-medium text-gray-700">
                              Page {index + 1}
                              <span className="ml-2 text-gray-500">({pageText.length} characters)</span>
                            </h6>
                          </div>
                          <div className="p-3">
                            {pageText.trim() ? (
                              <div className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                                {pageText}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500 italic">No text detected on this page</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-center">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
          <CheckCircle className="w-4 h-4" />
          <span>
            {files.filter((f) => f.status === 'completed').length} of {files.length} files processed
          </span>
        </div>
      </div>
    </div>
  );
}
