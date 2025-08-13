import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/links';

function LinkSaver() {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [links, setLinks] = useState([]);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(setLinks)
      .catch((err) => console.error('Failed to load links', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    const newEntry = {
      url: url.trim(),
      description: description.trim(),
      tag: tag.trim(),
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
      if (!res.ok) throw new Error('Request failed');
      const saved = await res.json();
      setLinks([...links, saved]);
      setUrl('');
      setDescription('');
      setTag('');
    } catch (err) {
      console.error('Failed to save link', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Request failed');
      setLinks(links.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to delete link', err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Link"
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Tag"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          Save
        </button>
      </form>

      <ul className="mt-6 space-y-4">
        {links.map((item) => (
          <li
            key={item.id}
            className="border border-gray-200 rounded p-4 space-y-1"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {item.url}
            </a>
            {item.description && (
              <p className="text-gray-700">{item.description}</p>
            )}
            {item.tag && (
              <span className="text-sm text-gray-500">#{item.tag}</span>
            )}
            <div>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-sm text-red-500 hover:underline mt-2"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LinkSaver;

