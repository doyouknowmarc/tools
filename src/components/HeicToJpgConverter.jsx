import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import heic2any from 'heic2any';
import { FileImage, Download, Trash } from 'lucide-react';
import clsx from 'clsx';

export default function HeicToJpgConverter() {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [processingFiles, setProcessingFiles] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);

  const onDrop = useCallback(acceptedFiles => {
    // Filter for HEIC files only
    const heicFiles = acceptedFiles.filter(file => 
      file.name.toLowerCase().endsWith('.heic') || 
      file.type === 'image/heic' || 
      file.type === 'image/heif'
    );
    
    if (heicFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...heicFiles]);
    } else {
      alert('Please upload HEIC files only');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeUploadedFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeConvertedFile = (index) => {
    setConvertedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const convertFiles = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload files first');
      return;
    }
    
    setIsConverting(true);
    
    const filesToProcess = uploadedFiles
      .map((_, index) => index)
      .filter(index => !processedFiles.includes(index));
    
    setProcessingFiles([...filesToProcess]);
    
    const converted = [];
    
    for (const [index, file] of uploadedFiles.entries()) {
      try {
        const jpegBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        });
        
        const objectUrl = URL.createObjectURL(jpegBlob);
        const newFileName = file.name.replace(/\.heic$/i, '.jpg');
        
        converted.push({
          originalName: file.name,
          name: newFileName,
          url: objectUrl,
          blob: jpegBlob
        });
        
        setProcessingFiles(prev => prev.filter(i => i !== index));
        setProcessedFiles(prev => [...prev, index]);
      } catch (error) {
        console.error(`Error converting ${file.name}:`, error);
        setProcessingFiles(prev => prev.filter(i => i !== index));
      }
    }
    
    setConvertedFiles(converted);
    setIsConverting(false);
  };

  const downloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllFiles = () => {
    convertedFiles.forEach(file => {
      downloadFile(file);
    });
  };

  return (
    <>
      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button 
          className={clsx(
            "px-4 py-2 rounded-full text-sm font-medium",
            activeTab === 'upload' ? "bg-gray-100" : "text-gray-500"
          )}
          onClick={() => setActiveTab('upload')}
        >
          Uploaded Files ({uploadedFiles.length})
        </button>
        <button 
          className={clsx(
            "px-4 py-2 rounded-full text-sm font-medium",
            activeTab === 'results' ? "bg-gray-100" : "text-gray-500"
          )}
          onClick={() => setActiveTab('results')}
        >
          Converted Files ({convertedFiles.length})
        </button>
      </div>

      {activeTab === 'upload' ? (
        <>
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Drop your HEIC files here
            </label>
            <div 
              {...getRootProps()} 
              className={clsx(
                "border-2 border-dashed rounded-lg p-8 cursor-pointer",
                isDragActive ? "border-rose-400 bg-rose-50" : "border-gray-200"
              )}
            >
              <input {...getInputProps()} accept=".heic,image/heic,image/heif" />
              <div className="text-center">
                <FileImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {isDragActive ? "Drop the files here" : "Click or drag and drop to upload HEIC files"}
                </p>
                <button className="text-rose-500 text-sm mt-2">Browse Files</button>
              </div>
            </div>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files</h3>
              <div className="border border-gray-200 rounded-lg divide-y">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3">
                    <div className="flex items-center">
                      <FileImage className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                    </div>
                    <div className="flex items-center">
                      {processingFiles.includes(index) && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2 animate-pulse">
                          Processing...
                        </span>
                      )}
                      {processedFiles.includes(index) && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mr-2">
                          Done
                        </span>
                      )}
                      <button 
                        onClick={() => removeUploadedFile(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Convert Button */}
          <button 
            className="w-full bg-rose-400 text-white py-3 rounded-lg hover:bg-rose-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={convertFiles}
            disabled={uploadedFiles.length === 0 || isConverting}
          >
            {isConverting ? "Converting..." : "Convert to JPG"}
          </button>
        </>
      ) : (
        <>
          {/* Converted Files */}
          {convertedFiles.length > 0 ? (
            <>
              <div className="border border-gray-200 rounded-lg divide-y">
                {convertedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3">
                    <div className="flex items-center">
                      <FileImage className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => downloadFile(file)}
                        className="text-gray-400 hover:text-blue-500"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeConvertedFile(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Download All Button */}
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={downloadAllFiles}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download All</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No converted files yet. Upload and convert some files first.</p>
            </div>
          )}
        </>
      )}
    </>
  );
}