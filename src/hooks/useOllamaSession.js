import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchOllamaModels,
  normalizeOllamaHost,
  streamOllamaPrompt,
} from '../utils/ollama';

const DEFAULT_OLLAMA_HOST = 'http://localhost:11434';

export function useOllamaSession({ taskLabel }) {
  const [ollamaHost, setOllamaHost] = useState(DEFAULT_OLLAMA_HOST);
  const [models, setModels] = useState([]);
  const [modelsMessage, setModelsMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [generationError, setGenerationError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const normalisedHost = useMemo(() => normalizeOllamaHost(ollamaHost), [ollamaHost]);
  const hasRemoteConnection = models.length > 0;

  useEffect(() => {
    if (!models.length) {
      return;
    }

    if (!selectedModel) {
      const firstModel = models[0];
      const name = firstModel?.name || firstModel?.model || '';
      setSelectedModel(name);
      return;
    }

    if (!models.some((model) => (model.name || model.model) === selectedModel)) {
      setSelectedModel('');
    }
  }, [models, selectedModel]);

  const loadModels = useCallback(async () => {
    if (!normalisedHost) {
      setModelsMessage('Enter the Ollama address to load models.');
      return [];
    }

    try {
      setModelsMessage('Connecting to Ollama…');
      const nextModels = await fetchOllamaModels(normalisedHost);
      setModels(nextModels);

      if (!nextModels.length) {
        setModelsMessage(
          'No models available on the Ollama server. Pull one with "ollama pull" then refresh.'
        );
      } else {
        setModelsMessage(
          `Ready – ${nextModels.length} model${
            nextModels.length === 1 ? '' : 's'
          } found. Select one to stream ${taskLabel}.`
        );
      }

      return nextModels;
    } catch (error) {
      console.error('Failed to load Ollama models', error);
      setModels([]);
      setSelectedModel('');
      setModelsMessage(
        error instanceof Error ? error.message : 'Unable to reach Ollama.'
      );
      return [];
    }
  }, [normalisedHost, taskLabel]);

  const generateText = useCallback(
    async ({
      prompt,
      missingPromptMessage,
      missingModelMessage,
      requestFailureMessage,
    }) => {
      if (!selectedModel) {
        setGenerationError(missingModelMessage);
        return null;
      }

      if (!prompt.trim()) {
        setGenerationError(missingPromptMessage);
        return null;
      }

      try {
        setIsGenerating(true);
        setGenerationError('');
        setGeneratedText('');

        const final = await streamOllamaPrompt({
          host: normalisedHost,
          model: selectedModel,
          prompt,
          onDelta: (delta) => {
            setGeneratedText((previous) => previous + delta);
          },
        });

        setGeneratedText(final);
        return final;
      } catch (error) {
        console.error('Failed to generate Ollama output', error);
        setGenerationError(
          error instanceof Error && error.message
            ? error.message
            : requestFailureMessage
        );
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [normalisedHost, selectedModel]
  );

  const resetGeneratedText = useCallback(() => {
    setGeneratedText('');
    setGenerationError('');
  }, []);

  return {
    generatedText,
    generationError,
    hasRemoteConnection,
    isGenerating,
    loadModels,
    models,
    modelsMessage,
    normalisedHost,
    ollamaHost,
    resetGeneratedText,
    selectedModel,
    setGeneratedText,
    setGenerationError,
    setOllamaHost,
    setSelectedModel,
    generateText,
  };
}
