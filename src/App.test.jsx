import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

function getSidebarButton(label) {
  return screen.getAllByRole('button', { name: label })[0];
}

describe('App', () => {
  it('shows a loading fallback before lazy tool content resolves', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(getSidebarButton('Meeting Prep'));

    expect(screen.getByRole('status')).toHaveTextContent('Loading tool');
    expect(await screen.findByText('Agenda')).toBeInTheDocument();
  });

  it.each([
    {
      heading: 'Meeting Prep Assistant',
      sidebarLabel: 'Meeting Prep',
      contentText: 'Connect to Ollama',
    },
    {
      heading: 'Content Tone Adjuster',
      sidebarLabel: 'Tone Adjuster',
      contentText: 'Original copy',
    },
    {
      heading: 'Document OCR',
      sidebarLabel: 'Document OCR',
      contentText: 'Upload Documents for OCR',
    },
    {
      heading: 'Location Data Visualizer',
      sidebarLabel: 'Location Data',
      contentText: 'Upload your location data JSON file',
    },
  ])('renders $heading when selecting $sidebarLabel', async ({ heading, sidebarLabel, contentText }) => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(getSidebarButton(sidebarLabel));

    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    expect(await screen.findByText(contentText)).toBeInTheDocument();
  });
});
