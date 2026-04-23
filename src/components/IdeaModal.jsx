import React, { useCallback, useState } from 'react';
import { Send, X } from 'lucide-react';

const IDEA_EMAIL = 'myapplemarc@gmail.com';

export default function IdeaModal({ onClose }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = useCallback(() => {
    const fullSubject = `[Idea] ${subject.trim()}`;
    const mailtoUrl = `mailto:${IDEA_EMAIL}?subject=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    onClose();
  }, [subject, body, onClose]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Share an Idea</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="idea-subject" className="mb-1.5 block text-sm font-medium text-gray-700">
              Subject
            </label>
            <div className="flex items-center rounded-lg border border-gray-300 focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500">
              <span className="select-none whitespace-nowrap pl-3 text-sm text-gray-400">
                [Idea]
              </span>
              <input
                id="idea-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Your idea title"
                autoFocus
                className="min-w-0 flex-1 bg-transparent py-2 pl-1.5 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="idea-body" className="mb-1.5 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="idea-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe your idea in as much detail as you like…"
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!subject.trim()}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              Send Idea
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
