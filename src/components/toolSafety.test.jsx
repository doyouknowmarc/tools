import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import BackgroundRemovalTool from './BackgroundRemovalTool';
import Base64Tool from './Base64Tool';
import RegexTester from './RegexTester';

function oversizedImage(name = 'large.png', type = 'image/png', size = 26 * 1024 * 1024) {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('tool safety regressions', () => {
  it('rejects oversized background-removal uploads before processing', async () => {
    const user = userEvent.setup();
    const { container } = render(<BackgroundRemovalTool />);
    const input = container.querySelector('input[type="file"]');

    await user.upload(input, oversizedImage('huge.webp', 'image/webp'));

    expect(await screen.findByText('Please choose an image up to 25 MB.')).toBeInTheDocument();
    expect(screen.queryByText('Removing background…')).not.toBeInTheDocument();
  });

  it('rejects unsupported Base64 image data URLs', async () => {
    const user = userEvent.setup();
    render(<Base64Tool />);

    await user.type(
      screen.getByPlaceholderText('Paste a Base64 data URL or raw payload here...'),
      'data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+PC9zdmc+'
    );

    expect(
      await screen.findByText('Unsupported image type. Use PNG, JPEG, WebP, or GIF data.')
    ).toBeInTheDocument();
    expect(screen.queryByAltText('Decoded preview')).not.toBeInTheDocument();
  });

  it('rejects oversized Base64 image uploads before FileReader work starts', async () => {
    const user = userEvent.setup();
    const { container } = render(<Base64Tool />);
    const input = container.querySelector('input[type="file"]');

    await user.upload(input, oversizedImage('huge.png', 'image/png', 11 * 1024 * 1024));

    expect(await screen.findByText('Please select an image up to 10 MB.')).toBeInTheDocument();
    expect(screen.queryByText('Data URL')).not.toBeInTheDocument();
  });

  it('renders regex matches as text instead of injected HTML', async () => {
    const user = userEvent.setup();
    const { container } = render(<RegexTester />);

    await user.clear(screen.getByLabelText('Regular expression'));
    await user.click(screen.getByLabelText('Regular expression'));
    await user.paste('<img[^>]+>');
    await user.clear(screen.getByLabelText('Sample text'));
    await user.click(screen.getByLabelText('Sample text'));
    await user.paste('<img src=x onerror=alert(1)>');

    expect(container.querySelector('img')).toBeNull();
    expect(screen.getAllByText('<img src=x onerror=alert(1)>').length).toBeGreaterThan(0);
  });
});
