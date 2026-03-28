import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Download, FileImage, Trash } from 'lucide-react';
import clsx from 'clsx';

const createFileKey = (file) => `${file.name}-${file.lastModified}-${file.size}`;

export default function HeicToJpgConverter() {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [processingFiles, setProcessingFiles] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState('neutral');
  const convertedFilesRef = useRef([]);

  const showFeedback = useCallback((message, tone = 'neutral') => {
    setFeedback(message);
    setFeedbackTone(tone);
  }, []);

  useEffect(() => {
    convertedFilesRef.current = convertedFiles;
  }, [convertedFiles]);

  useEffect(() => {
    return () => {
      convertedFilesRef.current.forEach((file) => {
        URL.revokeObjectURL(file.url);
      });
    };
  }, []);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const heicFiles = acceptedFiles.filter(
        (file) =>
          file.name.toLowerCase().endsWith('.heic') ||
          file.type === 'image/heic' ||
          file.type === 'image/heif'
      );

      if (!heicFiles.length) {
        showFeedback('Please upload HEIC files only.', 'error');
        return;
      }

      setUploadedFiles((previous) => [...previous, ...heicFiles]);
      showFeedback(`${heicFiles.length} file${heicFiles.length === 1 ? '' : 's'} ready to convert.`, 'success');
    },
    [showFeedback]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeUploadedFile = (fileKey) => {
    setUploadedFiles((previous) =>
      previous.filter((file) => createFileKey(file) !== fileKey)
    );
    setProcessingFiles((previous) => previous.filter((key) => key !== fileKey));
    setProcessedFiles((previous) => previous.filter((key) => key !== fileKey));
  };

  const removeConvertedFile = (fileKey) => {
    setConvertedFiles((previous) => {
      const nextFiles = previous.filter((file) => {
        if (file.fileKey === fileKey) {
          URL.revokeObjectURL(file.url);
          return false;
        }

        return true;
      });

      return nextFiles;
    });
  };

  const convertFiles = async () => {
    if (!uploadedFiles.length) {
      showFeedback('Please upload files first.', 'error');
      return;
    }

    setIsConverting(true);
    showFeedback('Converting files…');

    const pendingFiles = uploadedFiles.filter(
      (file) => !processedFiles.includes(createFileKey(file))
    );

    if (!pendingFiles.length) {
      showFeedback('All uploaded files are already converted.', 'success');
      setIsConverting(false);
      return;
    }

    setProcessingFiles(pendingFiles.map(createFileKey));

    const nextConvertedFiles = [...convertedFiles];
    const { default: heic2any } = await import('heic2any');

    for (const file of pendingFiles) {
      const fileKey = createFileKey(file);

      try {
        const jpegBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8,
        });

        const objectUrl = URL.createObjectURL(jpegBlob);
        nextConvertedFiles.push({
          blob: jpegBlob,
          fileKey,
          name: file.name.replace(/\.heic$/i, '.jpg'),
          originalName: file.name,
          url: objectUrl,
        });

        setProcessedFiles((previous) => [...previous, fileKey]);
      } catch (error) {
        console.error(`Error converting ${file.name}:`, error);
        showFeedback(
          `We could not convert ${file.name}. Try another file or retry the conversion.`,
          'error'
        );
      } finally {
        setProcessingFiles((previous) => previous.filter((key) => key !== fileKey));
      }
    }

    setConvertedFiles(nextConvertedFiles);
    setIsConverting(false);
    showFeedback('Conversion finished.', 'success');
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
    convertedFiles.forEach((file) => {
      downloadFile(file);
    });
  };

  const feedbackClassName = useMemo(() => {
    if (feedbackTone === 'error') {
      return 'border-red-200 bg-red-50 text-red-700';
    }

    if (feedbackTone === 'success') {
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }

    return 'border-gray-200 bg-gray-50 text-gray-600';
  }, [feedbackTone]);

  return (
    <>
      <div className="mb-6 flex space-x-4">
        <button
          type="button"
          className={clsx(
            'rounded-full px-4 py-2 text-sm font-medium',
            activeTab === 'upload' ? 'bg-gray-100' : 'text-gray-500'
          )}
          onClick={() => setActiveTab('upload')}
        >
          Uploaded Files ({uploadedFiles.length})
        </button>
        <button
          type="button"
          className={clsx(
            'rounded-full px-4 py-2 text-sm font-medium',
            activeTab === 'results' ? 'bg-gray-100' : 'text-gray-500'
          )}
          onClick={() => setActiveTab('results')}
        >
          Converted Files ({convertedFiles.length})
        </button>
      </div>

      {feedback ? (
        <div className={clsx('mb-6 rounded-lg border px-4 py-3 text-sm', feedbackClassName)}>
          {feedback}
        </div>
      ) : null}

      {activeTab === 'upload' ? (
        <>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Drop your HEIC files here
            </label>
            <div
              {...getRootProps()}
              className={clsx(
                'cursor-pointer rounded-lg border-2 border-dashed p-8',
                isDragActive ? 'border-rose-400 bg-rose-50' : 'border-gray-200'
              )}
            >
              <input {...getInputProps()} accept=".heic,image/heic,image/heif" />
              <div className="text-center">
                <FileImage className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500">
                  {isDragActive
                    ? 'Drop the files here'
                    : 'Click or drag and drop to upload HEIC files'}
                </p>
                <button type="button" className="mt-2 text-sm text-rose-500">
                  Browse Files
                </button>
              </div>
            </div>
          </div>

          {uploadedFiles.length > 0 ? (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-medium text-gray-700">Uploaded Files</h3>
              <div className="divide-y rounded-lg border border-gray-200">
                {uploadedFiles.map((file) => {
                  const fileKey = createFileKey(file);
                  return (
                    <div key={fileKey} className="flex items-center justify-between p-3">
                      <div className="flex items-center">
                        <FileImage className="mr-2 h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                      </div>
                      <div className="flex items-center">
                        {processingFiles.includes(fileKey) ? (
                          <span className="mr-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 animate-pulse">
                            Processing...
                          </span>
                        ) : null}
                        {processedFiles.includes(fileKey) ? (
                          <span className="mr-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                            Done
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => removeUploadedFile(fileKey)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            className="w-full rounded-lg bg-rose-400 py-3 text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-gray-300"
            onClick={convertFiles}
            disabled={!uploadedFiles.length || isConverting}
          >
            {isConverting ? 'Converting...' : 'Convert to JPG'}
          </button>
        </>
      ) : convertedFiles.length > 0 ? (
        <>
          <div className="divide-y rounded-lg border border-gray-200">
            {convertedFiles.map((file) => (
              <div key={file.fileKey} className="flex items-center justify-between p-3">
                <div className="flex items-center">
                  <FileImage className="mr-2 h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => downloadFile(file)}
                    className="text-gray-400 hover:text-blue-500"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeConvertedFile(file.fileKey)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={downloadAllFiles}
              className="flex items-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 text-white shadow-md transition-colors hover:bg-blue-600"
            >
              <Download className="h-4 w-4" />
              <span>Download All</span>
            </button>
          </div>
        </>
      ) : (
        <div className="py-8 text-center">
          <p className="text-gray-500">
            No converted files yet. Upload and convert some files first.
          </p>
        </div>
      )}
    </>
  );
}
