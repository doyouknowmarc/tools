export const TONES = [
  {
    id: 'formal',
    label: 'Formal',
    description: 'Polished business tone with full sentences and courtesy cues.',
  },
  {
    id: 'friendly',
    label: 'Friendly',
    description: 'Warm, conversational voice with upbeat energy.',
  },
  {
    id: 'concise',
    label: 'Concise',
    description: 'Direct and trimmed down to essentials.',
  },
  {
    id: 'grammar',
    label: 'Grammar polish',
    description: 'Fix typos and grammar without changing the voice.',
  },
  {
    id: 'supportive',
    label: 'Supportive',
    description: 'Empathetic and reassuring responses for support teams.',
  },
];

function replaceContractions(text) {
  return text
    .replace(/\bI'm\b/gi, 'I am')
    .replace(/\bcan't\b/gi, 'cannot')
    .replace(/\bwon't\b/gi, 'will not')
    .replace(/\bdoesn't\b/gi, 'does not')
    .replace(/\bdon't\b/gi, 'do not')
    .replace(/\bwe're\b/gi, 'we are')
    .replace(/\bwe'll\b/gi, 'we will')
    .replace(/\bthat's\b/gi, 'that is')
    .replace(/\bit's\b/gi, 'it is')
    .replace(/\byou're\b/gi, 'you are');
}

function friendlyContractions(text) {
  return text
    .replace(/\bwe are\b/gi, "we're")
    .replace(/\bwe will\b/gi, "we'll")
    .replace(/\byou are\b/gi, "you're")
    .replace(/\bit is\b/gi, "it's")
    .replace(/\bdo not\b/gi, "don't")
    .replace(/\bcannot\b/gi, "can't");
}

function stripFiller(text) {
  return text
    .replace(/\b(just|really|very|actually|basically|kind of|sort of)\b/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/\s([,.!?])/g, '$1')
    .trim();
}

function ensurePunctuation(text) {
  return text.replace(/([a-zA-Z0-9])\s*$/g, '$1.');
}

export function applyTone(text, tone) {
  if (!text.trim()) {
    return '';
  }

  let output = text.trim();

  switch (tone) {
    case 'formal':
      output = replaceContractions(output);
      output = output.replace(/!+/g, '.');
      output = ensurePunctuation(output);
      if (!/thank/i.test(output)) {
        output = `${output} Thank you for your time.`;
      }
      break;
    case 'friendly':
      output = friendlyContractions(output);
      if (!/\bthanks\b/i.test(output)) {
        output = `${output} Thanks a ton!`;
      }
      output = output.replace(/\./g, '!');
      break;
    case 'concise':
      output = stripFiller(output);
      output = output.replace(/\s+/g, ' ');
      output = output.replace(/([.!?])\s*(?=[.!?])/g, '$1 ');
      break;
    case 'grammar':
      output = output.replace(/\s+/g, ' ');
      output = ensurePunctuation(output);
      break;
    case 'supportive':
      output = replaceContractions(output);
      if (!/\bthank/i.test(output)) {
        output = `${output} Thank you for letting us know.`;
      }
      output = `I understand how frustrating this can feel. ${output}`;
      output = output.replace(/!+/g, '.');
      break;
    default:
      break;
  }

  return output.trim();
}

export function analyseText(text) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.trim() ? text.trim().split(/[.!?]+/).filter(Boolean).length : 0;
  const readingTime = words === 0 ? 0 : Math.max(1, Math.round(words / 200));

  return { words, sentences, readingTime };
}

export function buildToneRemotePrompt(tone, sourceText) {
  const trimmed = sourceText.trim();
  if (!trimmed) {
    return '';
  }

  if (tone.id === 'grammar') {
    return `You are a meticulous copy editor. Correct grammar, spelling, and punctuation errors in the message below while preserving the original intent, voice, and formatting. Return the cleaned version only.\n\nMessage:\n${trimmed}\n\nCorrected message:`;
  }

  return `You are an expert communications assistant. Rewrite the message below so it matches a ${tone.label.toLowerCase()} tone. Retain all key facts, keep it concise, and respond with text ready to paste.\n\nMessage:\n${trimmed}\n\nRewritten message:`;
}
