import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import BigTextTool from './BigTextTool';
import FullscreenColorTool from './FullscreenColorTool';

describe('BigTextTool', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shows typed text in the preview and in fullscreen', async () => {
    const user = userEvent.setup();
    render(<BigTextTool />);

    const input = screen.getByLabelText('Your message');
    await user.clear(input);
    await user.type(input, 'hey there');

    expect(screen.getByTestId('big-text')).toHaveTextContent('HEY THERE');

    await user.click(screen.getByRole('button', { name: /GO BIG/ }));
    const dialog = screen.getByRole('dialog', { name: 'Big text fullscreen' });
    expect(within(dialog).getByTestId('big-text')).toHaveTextContent('HEY THERE');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('asks for confirmation before enabling party mode', async () => {
    const user = userEvent.setup();
    render(<BigTextTool />);

    await user.click(screen.getByRole('button', { name: 'Enable party mode' }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Photosensitivity warning');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('button', { name: 'Enable party mode' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Enable party mode' }));
    await user.click(screen.getByRole('button', { name: /I understand/ }));
    expect(screen.getByRole('button', { name: 'Stop the party' })).toBeInTheDocument();
  });

  it('lets you type live in fullscreen without touching the saved message', async () => {
    const user = userEvent.setup();
    render(<BigTextTool />);

    await user.click(screen.getByLabelText(/Live typing/));
    await user.click(screen.getByRole('button', { name: /GO BIG/ }));
    await user.keyboard('yo');

    const dialog = screen.getByRole('dialog', { name: 'Big text fullscreen' });
    expect(within(dialog).getByTestId('big-text')).toHaveTextContent('YO');
    await user.keyboard('{Escape}');
    expect(screen.getByLabelText('Your message')).toHaveValue('HELLO 👋');
  });
});

describe('FullscreenColorTool', () => {
  it('cycles preset colors in fullscreen', async () => {
    const user = userEvent.setup();
    render(<FullscreenColorTool />);

    await user.click(screen.getByRole('button', { name: 'Black' }));
    expect(screen.getByLabelText('Hex color')).toHaveValue('#000000');

    await user.click(screen.getByRole('button', { name: /Go fullscreen/ }));
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Escape}');

    expect(screen.getByLabelText('Hex color')).toHaveValue('#ff0000');
  });
});
