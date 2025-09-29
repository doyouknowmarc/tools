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

function formatTextPayload(text) {
  return text;
}

function formatWifiPayload({ ssid, password, security, hidden }) {
  const safeSecurity = security || 'WPA';
  const hiddenSegment = `H:${hidden ? 'true' : 'false'};`;

  if (safeSecurity === 'nopass') {
    return `WIFI:T:${safeSecurity};S:${ssid};${hiddenSegment};`;
  }

  return `WIFI:T:${safeSecurity};S:${ssid};P:${password};${hiddenSegment};`;
}

function isValidEmail(value) {
  if (!value) {
    return false;
  }

  return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);
}

function formatEmailPayload({ to, subject, body }) {
  const email = encodeURIComponent(to);
  const params = new URLSearchParams();

  if (subject) {
    params.set('subject', subject);
  }

  if (body) {
    params.set('body', body);
  }

  const query = params.toString();

  return query ? `mailto:${email}?${query}` : `mailto:${email}`;
}

function formatVCardPayload({ firstName, lastName, company, phone, email }) {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${[firstName, lastName].filter(Boolean).join(' ')}`,
  ];

  if (company) {
    lines.push(`ORG:${company}`);
  }

  if (phone) {
    lines.push(`TEL;TYPE=CELL:${phone}`);
  }

  if (email) {
    lines.push(`EMAIL:${email}`);
  }

  lines.push('END:VCARD');

  return lines.join('\n');
}

function truncateLabel(value) {
  if (!value) {
    return '';
  }

  if (value.length <= 50) {
    return value;
  }

  return `${value.slice(0, 47)}...`;
}

const helperMessages = {
  url: 'Enter one URL per line to generate multiple QR codes.',
  text: 'Enter the text you want to encode.',
  wifi: 'Provide network details to share Wi-Fi credentials.',
  email: 'Fill in the email recipient and optional details.',
  vcard: 'Enter contact information to generate a vCard QR code.',
};

const securityOptions = [
  { label: 'WPA/WPA2', value: 'WPA' },
  { label: 'WEP', value: 'WEP' },
  { label: 'Open (No Password)', value: 'nopass' },
];

const contentTypes = [
  { key: 'url', label: 'URL' },
  { key: 'text', label: 'Text' },
  { key: 'wifi', label: 'Wi-Fi' },
  { key: 'email', label: 'Email' },
  { key: 'vcard', label: 'vCard' },
];

const initialCodes = defaultUrls.map((url) => ({ label: url, value: url }));

const QrCodeGenerator = () => {
  const [selectedType, setSelectedType] = useState('url');
  const [urlInput, setUrlInput] = useState(defaultUrls.join('\n'));
  const [textInput, setTextInput] = useState('');
  const [wifiConfig, setWifiConfig] = useState({
    ssid: '',
    password: '',
    security: securityOptions[0].value,
    hidden: false,
  });
  const [emailConfig, setEmailConfig] = useState({ to: '', subject: '', body: '' });
  const [vcardConfig, setVcardConfig] = useState({
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    email: '',
  });
  const [generatedCodes, setGeneratedCodes] = useState(initialCodes);
  const [invalidUrls, setInvalidUrls] = useState([]);
  const [formError, setFormError] = useState('');
  const qrCanvasRefs = useRef({});

  const handleGenerate = () => {
    setFormError('');

    switch (selectedType) {
      case 'url': {
        const parsedUrls = sanitizeUrls(urlInput);
        const invalid = parsedUrls.filter((item) => !validateUrl(item));
        const validUrls = parsedUrls.filter(validateUrl);

        setInvalidUrls(invalid);

        if (parsedUrls.length === 0 || validUrls.length === 0) {
          setGeneratedCodes([]);
          qrCanvasRefs.current = {};
          return;
        }

        setGeneratedCodes(validUrls.map((url) => ({ label: url, value: url })));
        qrCanvasRefs.current = {};
        return;
      }
      case 'text': {
        const trimmed = textInput.trim();

        if (!trimmed) {
          setGeneratedCodes([]);
          setFormError('Enter some text to encode.');
          qrCanvasRefs.current = {};
          return;
        }

        setGeneratedCodes([
          {
            label: truncateLabel(trimmed.replace(/\s+/g, ' ')),
            value: formatTextPayload(textInput),
          },
        ]);
        setInvalidUrls([]);
        qrCanvasRefs.current = {};
        return;
      }
      case 'wifi': {
        const { ssid, password, security, hidden } = wifiConfig;
        const trimmedSsid = ssid.trim();
        const trimmedPassword = password.trim();

        if (!trimmedSsid) {
          setGeneratedCodes([]);
          setFormError('Enter the Wi-Fi network name (SSID).');
          qrCanvasRefs.current = {};
          return;
        }

        if (security !== 'nopass' && !trimmedPassword) {
          setGeneratedCodes([]);
          setFormError('Enter the Wi-Fi password or choose the open network option.');
          qrCanvasRefs.current = {};
          return;
        }

        const payload = formatWifiPayload({
          ssid: trimmedSsid,
          password: trimmedPassword,
          security,
          hidden,
        });

        setGeneratedCodes([
          {
            label: `Wi-Fi: ${trimmedSsid}`,
            value: payload,
          },
        ]);
        setInvalidUrls([]);
        qrCanvasRefs.current = {};
        return;
      }
      case 'email': {
        const { to, subject, body } = emailConfig;
        const trimmedTo = to.trim();

        if (!trimmedTo || !isValidEmail(trimmedTo)) {
          setGeneratedCodes([]);
          setFormError('Enter a valid recipient email address.');
          qrCanvasRefs.current = {};
          return;
        }

        const payload = formatEmailPayload({ to: trimmedTo, subject, body });

        setGeneratedCodes([
          {
            label: `Email: ${trimmedTo}`,
            value: payload,
          },
        ]);
        setInvalidUrls([]);
        qrCanvasRefs.current = {};
        return;
      }
      case 'vcard': {
        const { firstName, lastName, company, phone, email } = vcardConfig;
        const trimmedFirstName = firstName.trim();
        const trimmedLastName = lastName.trim();
        const trimmedEmail = email.trim();

        if (!trimmedFirstName && !trimmedLastName) {
          setGeneratedCodes([]);
          setFormError('Enter at least a first or last name for the contact.');
          qrCanvasRefs.current = {};
          return;
        }

        if (trimmedEmail && !isValidEmail(trimmedEmail)) {
          setGeneratedCodes([]);
          setFormError('Enter a valid email address for the contact or leave it blank.');
          qrCanvasRefs.current = {};
          return;
        }

        const payload = formatVCardPayload({
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          company: company.trim(),
          phone: phone.trim(),
          email: trimmedEmail,
        });

        setGeneratedCodes([
          {
            label: truncateLabel(`Contact: ${[trimmedFirstName, trimmedLastName]
              .filter(Boolean)
              .join(' ') || 'vCard'}`),
            value: payload,
          },
        ]);
        setInvalidUrls([]);
        qrCanvasRefs.current = {};
        return;
      }
      default:
        setGeneratedCodes([]);
        qrCanvasRefs.current = {};
    }
  };

  const handleDownload = (index, code) => {
    const canvas = qrCanvasRefs.current[index];

    if (!canvas) {
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    const slugSource = code.label || code.value || 'qr-code';
    link.download = `${slugSource.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'qr-code'}.png`;
    link.click();
  };

  const helperText = useMemo(() => {
    if (selectedType === 'url') {
      if (invalidUrls.length === 0) {
        return helperMessages.url;
      }

      return `The following URLs could not be parsed: ${invalidUrls.join(', ')}`;
    }

    if (formError) {
      return formError;
    }

    return helperMessages[selectedType];
  }, [selectedType, invalidUrls, formError]);

  const helperTextClassName = useMemo(() => {
    if (selectedType === 'url') {
      return invalidUrls.length === 0
        ? 'text-sm text-gray-500'
        : 'text-sm text-red-600';
    }

    return formError ? 'text-sm text-red-600' : 'text-sm text-gray-500';
  }, [selectedType, invalidUrls, formError]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {contentTypes.map((type) => (
            <button
              key={type.key}
              type="button"
              onClick={() => setSelectedType(type.key)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
                selectedType === type.key
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {selectedType === 'url' && (
          <>
            <label className="block text-sm font-medium text-gray-700">URLs</label>
            <textarea
              value={urlInput}
              onChange={(event) => setUrlInput(event.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              placeholder="https://example.com"
            />
          </>
        )}

        {selectedType === 'text' && (
          <>
            <label className="block text-sm font-medium text-gray-700">Text</label>
            <textarea
              value={textInput}
              onChange={(event) => setTextInput(event.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              placeholder="Type or paste text to encode"
            />
          </>
        )}

        {selectedType === 'wifi' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Wi-Fi Details</label>
            <input
              type="text"
              value={wifiConfig.ssid}
              onChange={(event) =>
                setWifiConfig((previous) => ({ ...previous, ssid: event.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              placeholder="Network name (SSID)"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="password"
                value={wifiConfig.password}
                onChange={(event) =>
                  setWifiConfig((previous) => ({ ...previous, password: event.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                placeholder="Password"
                disabled={wifiConfig.security === 'nopass'}
              />
              <select
                value={wifiConfig.security}
                onChange={(event) =>
                  setWifiConfig((previous) => ({ ...previous, security: event.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              >
                {securityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={wifiConfig.hidden}
                onChange={(event) =>
                  setWifiConfig((previous) => ({ ...previous, hidden: event.target.checked }))
                }
                className="h-4 w-4 text-gray-900 border-gray-300 rounded"
              />
              Hidden network
            </label>
          </div>
        )}

        {selectedType === 'email' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Email Details</label>
            <input
              type="email"
              value={emailConfig.to}
              onChange={(event) =>
                setEmailConfig((previous) => ({ ...previous, to: event.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              placeholder="Recipient email"
            />
            <input
              type="text"
              value={emailConfig.subject}
              onChange={(event) =>
                setEmailConfig((previous) => ({ ...previous, subject: event.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              placeholder="Subject (optional)"
            />
            <textarea
              value={emailConfig.body}
              onChange={(event) =>
                setEmailConfig((previous) => ({ ...previous, body: event.target.value }))
              }
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              placeholder="Message body (optional)"
            />
          </div>
        )}

        {selectedType === 'vcard' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Contact Details</label>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={vcardConfig.firstName}
                onChange={(event) =>
                  setVcardConfig((previous) => ({ ...previous, firstName: event.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                placeholder="First name"
              />
              <input
                type="text"
                value={vcardConfig.lastName}
                onChange={(event) =>
                  setVcardConfig((previous) => ({ ...previous, lastName: event.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                placeholder="Last name"
              />
            </div>
            <input
              type="text"
              value={vcardConfig.company}
              onChange={(event) =>
                setVcardConfig((previous) => ({ ...previous, company: event.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              placeholder="Company (optional)"
            />
            <input
              type="tel"
              value={vcardConfig.phone}
              onChange={(event) =>
                setVcardConfig((previous) => ({ ...previous, phone: event.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              placeholder="Phone (optional)"
            />
            <input
              type="email"
              value={vcardConfig.email}
              onChange={(event) =>
                setVcardConfig((previous) => ({ ...previous, email: event.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              placeholder="Email (optional)"
            />
          </div>
        )}

        <div className={helperTextClassName}>{helperText}</div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
      >
        Generate QR Codes
      </button>

      {generatedCodes.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {generatedCodes.map((code, index) => (
            <div
              key={`${code.value}-${index}`}
              className="border border-gray-200 rounded-lg p-4 space-y-4 flex flex-col items-center"
            >
              <QRCodeCanvas
                value={code.value}
                size={220}
                level="H"
                includeMargin
                ref={(node) => {
                  if (node) {
                    qrCanvasRefs.current[index] = node;
                  } else {
                    delete qrCanvasRefs.current[index];
                  }
                }}
              />
              <div className="text-sm text-gray-600 break-all text-center">{code.label}</div>
              <button
                type="button"
                onClick={() => handleDownload(index, code)}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Download PNG
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-sm">
          No QR code generated yet. Choose a type, complete the form, and click Generate.
        </div>
      )}
    </div>
  );
};

export default QrCodeGenerator;
