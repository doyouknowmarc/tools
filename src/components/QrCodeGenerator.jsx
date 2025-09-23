import React, { useMemo, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const defaultUrls = [
  'https://example.com',
  'https://openai.com',
];

function sanitizeUrls(rawInput) {
  return rawInput
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function validateUrl(url) {
  try {
    // The URL constructor will throw if it cannot parse the string.
    // eslint-disable-next-line no-new
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

const QrCodeGenerator = () => {
  const [inputValue, setInputValue] = useState(defaultUrls.join('\n'));
  const [urls, setUrls] = useState(defaultUrls);
  const [invalidUrls, setInvalidUrls] = useState([]);
  const qrCanvasRefs = useRef({});

  const handleGenerate = () => {
    const parsedUrls = sanitizeUrls(inputValue);
    const invalid = parsedUrls.filter((item) => !validateUrl(item));

    setInvalidUrls(invalid);

    if (parsedUrls.length === 0 || invalid.length === parsedUrls.length) {
      setUrls([]);
      return;
    }

    setUrls(parsedUrls.filter((item) => validateUrl(item)));
  };

  const handleDownload = (index, url) => {
    const canvas = qrCanvasRefs.current[index];

    if (!canvas) {
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${url.replace(/[^a-z0-9]/gi, '_') || 'qr-code'}.png`;
    link.click();
  };

  const helperText = useMemo(() => {
    if (invalidUrls.length === 0) {
      return 'Enter one URL per line to generate multiple QR codes.';
    }

    return `The following URLs could not be parsed: ${invalidUrls.join(', ')}`;
  }, [invalidUrls]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">URLs</label>
        <textarea
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
          placeholder="https://example.com"
        />
        <div
          className={
            invalidUrls.length === 0
              ? 'text-sm text-gray-500'
              : 'text-sm text-red-600'
          }
        >
          {helperText}
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
      >
        Generate QR Codes
      </button>

      {urls.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {urls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="border border-gray-200 rounded-lg p-4 space-y-4 flex flex-col items-center"
            >
              <QRCodeCanvas
                value={url}
                size={220}
                level="H"
                includeMargin
                ref={(node) => {
                  if (node) {
                    qrCanvasRefs.current[index] = node.canvasRef.current;
                  }
                }}
              />
              <div className="text-sm text-gray-600 break-all text-center">{url}</div>
              <button
                type="button"
                onClick={() => handleDownload(index, url)}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Download PNG
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-sm">No valid URLs to display yet.</div>
      )}
    </div>
  );
};

export default QrCodeGenerator;
