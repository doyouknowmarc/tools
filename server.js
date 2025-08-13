import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(process.cwd(), 'links.json');

app.use(cors());
app.use(express.json());

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

app.get('/links', (req, res) => {
  fs.readFile(DATA_FILE, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read data' });
    try {
      const links = JSON.parse(data);
      res.json(links);
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse data' });
    }
  });
});

app.post('/links', (req, res) => {
  const { url, description = '', tag = '' } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });

  fs.readFile(DATA_FILE, 'utf-8', (err, data) => {
    let links = [];
    if (!err) {
      try {
        links = JSON.parse(data);
      } catch (_) {}
    }

    const newLink = { id: Date.now(), url, description, tag };
    links.push(newLink);

    fs.writeFile(DATA_FILE, JSON.stringify(links, null, 2), (writeErr) => {
      if (writeErr) return res.status(500).json({ error: 'Failed to save data' });
      res.status(201).json(newLink);
    });
  });
});

app.delete('/links/:id', (req, res) => {
  const id = Number(req.params.id);
  fs.readFile(DATA_FILE, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read data' });
    let links = [];
    try {
      links = JSON.parse(data);
    } catch (_) {}

    const updated = links.filter((l) => l.id !== id);
    fs.writeFile(DATA_FILE, JSON.stringify(updated, null, 2), (writeErr) => {
      if (writeErr) return res.status(500).json({ error: 'Failed to save data' });
      res.json({ success: true });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

