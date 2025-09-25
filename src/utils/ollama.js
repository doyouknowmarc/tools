export async function readOllamaStream(response, onDelta) {
  if (!response.body || typeof response.body.getReader !== 'function') {
    const data = await response.json();
    const final = (data.response || data.output || '').trim();
    if (!final) {
      throw new Error('Ollama returned an empty response.');
    }
    if (final) {
      onDelta(final);
    }
    return final;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let collected = '';
  let completed = false;

  try {
    while (!completed) {
      const { value, done } = await reader.read();
      const chunk = value ? decoder.decode(value, { stream: !done }) : '';
      buffer += chunk;

      if (done) {
        buffer += decoder.decode();
      }

      const parts = buffer.split('\n');
      buffer = parts.pop() ?? '';

      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;

        let payload;
        try {
          payload = JSON.parse(trimmed);
        } catch (error) {
          console.warn('Skipping malformed Ollama chunk', error);
          continue;
        }

        if (payload.error) {
          throw new Error(payload.error);
        }

        const delta = payload.response || payload.output || '';
        if (delta) {
          collected += delta;
          onDelta(delta);
        }

        if (payload.done) {
          completed = true;
        }
      }

      if (done) {
        break;
      }
    }

    if (buffer.trim()) {
      try {
        const payload = JSON.parse(buffer.trim());
        if (payload.error) {
          throw new Error(payload.error);
        }
        const delta = payload.response || payload.output || '';
        if (delta) {
          collected += delta;
          onDelta(delta);
        }
      } catch (error) {
        console.warn('Unable to parse trailing Ollama buffer', error);
      }
    }
  } finally {
    if (!completed) {
      try {
        await reader.cancel();
      } catch (error) {
        console.debug('Ollama stream cancellation warning', error);
      }
    }
  }

  const final = collected.trim();
  if (!final) {
    throw new Error('Ollama returned an empty response.');
  }

  return final;
}
