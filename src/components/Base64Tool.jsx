import React, { useEffect, useMemo, useState, useRef } from 'react';

function encodeTextToBase64(value) {
  if (!value) {
    return '';
  }

  const encoder = new TextEncoder();
  const bytes = encoder.encode(value);
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function decodeBase64ToText(value) {
  if (!value) {
    return '';
  }

  const cleaned = value.replace(/\s+/g, '');
  const binary = atob(cleaned);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const decoder = new TextDecoder();

  return decoder.decode(bytes);
}

function useFlashMessage() {
  const [message, setMessage] = useState('');
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const flashMessage = (value) => {
    setMessage(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setMessage('');
    }, 2000);
  };

  return [message, flashMessage];
}

function formatBytes(size) {
  if (!size && size !== 0) {
    return '';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let index = 0;
  let value = size;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export default function Base64Tool() {
  const [textMode, setTextMode] = useState('encode');
  const [textInput, setTextInput] = useState('');
  const [textResult, setTextResult] = useState('');
  const [textError, setTextError] = useState('');
  const [textFeedback, flashTextFeedback] = useFlashMessage();

  const [encodedImage, setEncodedImage] = useState('');
  const [imageMeta, setImageMeta] = useState(null);
  const [imageError, setImageError] = useState('');
  const [imageFeedback, flashImageFeedback] = useFlashMessage();

  const [decodeInput, setDecodeInput] = useState('');
  const [decodedImage, setDecodedImage] = useState({ dataUrl: '', mimeType: 'image/png' });
  const [decodeError, setDecodeError] = useState('');
  const [decodeFeedback, flashDecodeFeedback] = useFlashMessage();

  useEffect(() => {
    if (!textInput) {
      setTextResult('');
      setTextError('');
      return;
    }

    try {
      if (textMode === 'encode') {
        setTextResult(encodeTextToBase64(textInput));
      } else {
        setTextResult(decodeBase64ToText(textInput));
      }
      setTextError('');
    } catch (error) {
      setTextResult('');
      setTextError('The provided input is not valid for this operation.');
    }
  }, [textInput, textMode]);

  useEffect(() => {
    if (!decodeInput.trim()) {
      setDecodedImage({ dataUrl: '', mimeType: 'image/png' });
      setDecodeError('');
      return;
    }

    try {
      const trimmed = decodeInput.trim();
      const prefixMatch = trimmed.match(/^data:([^;]+);base64,/i);
      const mimeType = prefixMatch ? prefixMatch[1] : 'image/png';
      const base64Part = prefixMatch ? trimmed.split(',')[1] : trimmed;
      const cleaned = base64Part.replace(/\s+/g, '');

      atob(cleaned);

      setDecodedImage({
        dataUrl: `data:${mimeType};base64,${cleaned}`,
        mimeType,
      });
      setDecodeError('');
    } catch (error) {
      setDecodedImage({ dataUrl: '', mimeType: 'image/png' });
      setDecodeError('Unable to decode image data. Please verify the Base64 string.');
    }
  }, [decodeInput]);

  const base64Payload = useMemo(() => {
    if (!encodedImage) {
      return '';
    }

    const commaIndex = encodedImage.indexOf(',');
    return commaIndex === -1 ? encodedImage : encodedImage.slice(commaIndex + 1);
  }, [encodedImage]);

  const handleCopyTextResult = async () => {
    if (!textResult) {
      return;
    }

    if (!navigator?.clipboard?.writeText) {
      flashTextFeedback('Clipboard is not available.');
      return;
    }

    try {
      await navigator.clipboard.writeText(textResult);
      flashTextFeedback('Copied to clipboard.');
    } catch (error) {
      flashTextFeedback('Clipboard copy failed.');
    }
  };

  const handleImageUpload = (event) => {
    const [file] = event.target.files;

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setImageError('Please select an image file.');
      setEncodedImage('');
      setImageMeta(null);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result?.toString() ?? '';
      setEncodedImage(result);
      setImageError('');
      setImageMeta({
        name: file.name,
        size: file.size,
        type: file.type,
      });

      const image = new Image();
      image.onload = () => {
        setImageMeta((current) =>
          current
            ? {
                ...current,
                width: image.width,
                height: image.height,
              }
            : current
        );
      };
      image.src = result;
    };

    reader.onerror = () => {
      setImageError('Unable to read the selected file.');
      setEncodedImage('');
      setImageMeta(null);
    };

    reader.readAsDataURL(file);
  };

  const handleCopyEncodedImage = async (value) => {
    if (!value) {
      return;
    }

    if (!navigator?.clipboard?.writeText) {
      flashImageFeedback('Clipboard is not available.');
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      flashImageFeedback('Copied to clipboard.');
    } catch (error) {
      flashImageFeedback('Clipboard copy failed.');
    }
  };

  const handleDownloadDecodedImage = async () => {
    if (!decodedImage.dataUrl) {
      return;
    }

    try {
      const response = await fetch(decodedImage.dataUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const extension = decodedImage.mimeType.split('/')[1] || 'png';

      link.href = url;
      link.download = `decoded-image.${extension}`;
      link.click();

      URL.revokeObjectURL(url);
      flashDecodeFeedback('Image downloaded.');
    } catch (error) {
      flashDecodeFeedback('Unable to download image.');
    }
  };

  const handleCopyDecodedDataUrl = async () => {
    if (!decodedImage.dataUrl) {
      return;
    }

    if (!navigator?.clipboard?.writeText) {
      flashDecodeFeedback('Clipboard is not available.');
      return;
    }

    try {
      await navigator.clipboard.writeText(decodedImage.dataUrl);
      flashDecodeFeedback('Copied to clipboard.');
    } catch (error) {
      flashDecodeFeedback('Clipboard copy failed.');
    }
  };

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Text conversion</h2>
            <p className="text-sm text-gray-500">
              Encode plain text to Base64 or decode Base64 strings back into readable text.
            </p>
          </div>
          <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white text-sm font-medium">
            <button
              type="button"
              className={`px-4 py-2 ${
                textMode === 'encode'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setTextMode('encode')}
            >
              Encode
            </button>
            <button
              type="button"
              className={`px-4 py-2 ${
                textMode === 'decode'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setTextMode('decode')}
            >
              Decode
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {textMode === 'encode' ? 'Text to encode' : 'Base64 to decode'}
            </label>
            <textarea
              className="w-full min-h-[10rem] rounded-lg border border-gray-200 p-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder={
                textMode === 'encode'
                  ? 'Type or paste the text you want to encode...'
                  : 'Paste the Base64 string you want to decode...'
              }
              value={textInput}
              onChange={(event) => setTextInput(event.target.value)}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {textMode === 'encode' ? 'Base64 result' : 'Decoded text'}
              </label>
              <button
                type="button"
                className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                onClick={handleCopyTextResult}
                disabled={!textResult}
              >
                Copy
              </button>
            </div>
            <textarea
              className="w-full min-h-[10rem] rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 focus:outline-none"
              value={textResult}
              readOnly
              placeholder="Your result will appear here..."
            />
            {textError ? (
              <p className="mt-2 text-sm text-red-600">{textError}</p>
            ) : textFeedback ? (
              <p className="mt-2 text-sm text-green-600">{textFeedback}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Image conversion</h2>
          <p className="text-sm text-gray-500">
            Convert image files into Base64 strings or preview Base64 payloads as images.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-xl border border-gray-200 p-4">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">Image to Base64</h3>
              <p className="text-sm text-gray-500">
                Select an image to generate a Base64 data URL and payload for easy sharing or embedding.
              </p>
            </div>

            <label className="block cursor-pointer rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600 hover:border-gray-400">
              <span className="font-medium text-gray-700">Click to upload</span>
              <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
            </label>

            {imageMeta ? (
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                <p className="font-medium text-gray-700">{imageMeta.name}</p>
                <p>{imageMeta.type}</p>
                <p>{formatBytes(imageMeta.size)}</p>
                {imageMeta.width && imageMeta.height ? (
                  <p>
                    {imageMeta.width} × {imageMeta.height}px
                  </p>
                ) : null}
              </div>
            ) : null}

            {encodedImage ? (
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700">Data URL</h4>
                    <button
                      type="button"
                      className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      onClick={() => handleCopyEncodedImage(encodedImage)}
                    >
                      Copy
                    </button>
                  </div>
                  <textarea
                    className="w-full min-h-[8rem] rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 focus:outline-none"
                    value={encodedImage}
                    readOnly
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700">Base64 payload</h4>
                    <button
                      type="button"
                      className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      onClick={() => handleCopyEncodedImage(base64Payload)}
                    >
                      Copy
                    </button>
                  </div>
                  <textarea
                    className="w-full min-h-[8rem] rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 focus:outline-none"
                    value={base64Payload}
                    readOnly
                  />
                </div>
              </div>
            ) : null}

            {imageError ? (
              <p className="text-sm text-red-600">{imageError}</p>
            ) : imageFeedback ? (
              <p className="text-sm text-green-600">{imageFeedback}</p>
            ) : null}
          </div>

          <div className="space-y-4 rounded-xl border border-gray-200 p-4">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">Base64 to image</h3>
              <p className="text-sm text-gray-500">
                Paste a Base64 string or data URL to preview the decoded image and download it locally.
              </p>
            </div>

            <textarea
              className="w-full min-h-[12rem] rounded-lg border border-gray-200 p-3 text-xs text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Paste a Base64 data URL or raw payload here..."
              value={decodeInput}
              onChange={(event) => setDecodeInput(event.target.value)}
            />

            {decodedImage.dataUrl ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <img src={decodedImage.dataUrl} alt="Decoded preview" className="h-48 w-full object-contain bg-gray-50" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    onClick={handleDownloadDecodedImage}
                  >
                    Download image
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    onClick={handleCopyDecodedDataUrl}
                  >
                    Copy data URL
                  </button>
                </div>
              </div>
            ) : null}

            {decodeError ? (
              <p className="text-sm text-red-600">{decodeError}</p>
            ) : decodeFeedback ? (
              <p className="text-sm text-green-600">{decodeFeedback}</p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
