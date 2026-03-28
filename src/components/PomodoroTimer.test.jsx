import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PomodoroTimer from './PomodoroTimer';

describe('PomodoroTimer', () => {
  let audioPlayMock;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-28T12:00:00.000Z'));

    audioPlayMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal(
      'Audio',
      vi.fn(() => ({
        currentTime: 0,
        play: audioPlayMock,
      }))
    );

    document.title = 'Helpful Tools';
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('counts down and restores the document title when paused', () => {
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('24:59')).toBeInTheDocument();
    expect(document.title).toBe('Work – 24:59');

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));

    expect(document.title).toBe('Helpful Tools');
  });

  it('switches to break time and plays a notification when work ends', () => {
    render(<PomodoroTimer />);

    fireEvent.change(screen.getByLabelText('Work Duration (min)'), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText('Break Duration (min)'), {
      target: { value: '2' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(screen.getByText('Break Time')).toBeInTheDocument();
    expect(screen.getByText('2:00')).toBeInTheDocument();
    expect(audioPlayMock).toHaveBeenCalledTimes(1);
  });

  it('clamps invalid durations to at least one minute', () => {
    render(<PomodoroTimer />);

    const workInput = screen.getByLabelText('Work Duration (min)');

    fireEvent.change(workInput, { target: { value: '0' } });
    expect(workInput).toHaveValue(1);
    expect(screen.getByText('1:00')).toBeInTheDocument();

    fireEvent.change(workInput, { target: { value: '-5' } });
    expect(workInput).toHaveValue(1);
    expect(screen.getByText('1:00')).toBeInTheDocument();
  });

  it('resets back to the configured work duration', () => {
    render(<PomodoroTimer />);

    fireEvent.change(screen.getByLabelText('Work Duration (min)'), {
      target: { value: '3' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByText('Work Time')).toBeInTheDocument();
    expect(screen.getByText('3:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
  });
});
