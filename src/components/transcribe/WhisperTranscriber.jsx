import React, { useState } from 'react';
import { Mic, Loader } from 'lucide-react';
import { pipeline, read_audio } from '@xenova/transformers';

export default function WhisperTranscriber() {
  const [file, setFile] = useState(null);
  const [transcriber, setTranscriber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult('');
    }
  };

  const handleTranscribe = async () => {
    if (!file || loading) return;
    setLoading(true);
    try {
      let t = transcriber;
      if (!t) {
        setModelLoading(true);
        t = await pipeline(
          'automatic-speech-recognition',
          'Xenova/whisper-tiny.en',
          { quantized: true }
        );
        setTranscriber(t);
        setModelLoading(false);
      }

      const objectUrl = URL.createObjectURL(file);
      const audio = await read_audio(objectUrl, 16000);
      URL.revokeObjectURL(objectUrl);

      const output = await t(audio);
      setResult(output.text.trim());
    } catch (err) {
      console.error(err);
      setResult('Transcription failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <label className="block text-sm font-medium text-gray-700">Upload an audio file</label>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button
        className="px-4 py-2 bg-gray-900 text-white rounded disabled:opacity-50 flex items-center space-x-2"
        onClick={handleTranscribe}
        disabled={!file || loading}
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span>{modelLoading ? 'Loading model...' : 'Transcribing...'}</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            <span>Transcribe</span>
          </>
        )}
      </button>
      <textarea
        className="w-full min-h-[10rem] p-3 border border-gray-200 rounded"
        placeholder="Transcription will appear here"
        value={result}
        readOnly
      />
    </div>
  );
}
