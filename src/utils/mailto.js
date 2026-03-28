export const initialMailtoState = {
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

const encodeQueryValue = (value) => encodeURIComponent(value.replace(/\r?\n/g, '\r\n'));

export function generateMailto({ to, cc, bcc, subject, body }) {
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
}
