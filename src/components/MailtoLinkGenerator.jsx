import React, { useMemo, useState } from 'react';

const initialState = {
  to: '',
  cc: '',
  bcc: '',
  subject: '',
  body: '',
};

const splitEmails = (value) =>
  value
    .split(',')
    .map((recipient) => recipient.trim())
    .filter(Boolean);

const encodeEmailList = (value) => splitEmails(value).map(encodeURIComponent).join(',');

const encodeQueryValue = (value) =>
  encodeURIComponent(value.replace(/\r?\n/g, '\r\n'));

const generateMailto = ({ to, cc, bcc, subject, body }) => {
  const baseRecipients = encodeEmailList(to);

  const queryParts = [];

  if (cc.trim()) {
    queryParts.push(`cc=${encodeEmailList(cc)}`);
  }

  if (bcc.trim()) {
    queryParts.push(`bcc=${encodeEmailList(bcc)}`);
  }

  if (subject.trim()) {
    queryParts.push(`subject=${encodeQueryValue(subject.trim())}`);
  }

  if (body.trim()) {
    queryParts.push(`body=${encodeQueryValue(body)}`);
  }

  const query = queryParts.join('&');
  return `mailto:${baseRecipients}${query ? `?${query}` : ''}`;
};

function MailtoLinkGenerator() {
  const [fields, setFields] = useState(initialState);
  const [copied, setCopied] = useState(false);

  const mailtoLink = useMemo(() => generateMailto(fields), [fields]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCopied(false);
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mailtoLink);
      setCopied(true);
    } catch (error) {
      console.error('Failed to copy mailto link:', error);
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Compose Email Details</h2>
        <p className="text-sm text-gray-500">
          Fill in the fields below to generate a sharable mailto link that opens a pre-filled email draft.
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="space-y-1">
          <label htmlFor="to" className="text-sm font-medium text-gray-700">
            To
          </label>
          <input
            id="to"
            name="to"
            value={fields.to}
            onChange={handleChange}
            placeholder="example@domain.com, another@domain.com"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="cc" className="text-sm font-medium text-gray-700">
            CC
          </label>
          <input
            id="cc"
            name="cc"
            value={fields.cc}
            onChange={handleChange}
            placeholder="Separate multiple addresses with commas"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="bcc" className="text-sm font-medium text-gray-700">
            BCC
          </label>
          <input
            id="bcc"
            name="bcc"
            value={fields.bcc}
            onChange={handleChange}
            placeholder="Separate multiple addresses with commas"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="subject" className="text-sm font-medium text-gray-700">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            value={fields.subject}
            onChange={handleChange}
            placeholder="Subject line"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="body" className="text-sm font-medium text-gray-700">
            Body
          </label>
          <textarea
            id="body"
            name="body"
            value={fields.body}
            onChange={handleChange}
            rows={6}
            placeholder="Write your message here..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="mailtoLink" className="text-sm font-medium text-gray-700">
          Generated mailto link
        </label>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0">
          <input
            id="mailtoLink"
            value={mailtoLink}
            readOnly
            className="flex-1 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Share this link to open an email draft with your provided details.
        </p>
      </div>
    </div>
  );
}

export default MailtoLinkGenerator;

export { generateMailto };
