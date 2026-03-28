import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

const WORK_PHASE = 'work';
const BREAK_PHASE = 'break';
const MIN_DURATION_MINUTES = 1;
const NOTIFICATION_AUDIO_SRC =
  'data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=';

function clampDuration(value) {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue)) {
    return MIN_DURATION_MINUTES;
  }

  return Math.max(MIN_DURATION_MINUTES, parsedValue);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getPhaseDurationInSeconds(phase, workDuration, breakDuration) {
  return (phase === WORK_PHASE ? workDuration : breakDuration) * 60;
}

function getRemainingSeconds(endTime) {
  if (!endTime) {
    return 0;
  }

  return Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
}

export default function PomodoroTimer() {
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState(WORK_PHASE);

  const defaultTitleRef = useRef('');
  const endTimeRef = useRef(null);
  const notificationAudioRef = useRef(null);

  useEffect(() => {
    defaultTitleRef.current = document.title;

    if (typeof Audio !== 'undefined') {
      notificationAudioRef.current = new Audio(NOTIFICATION_AUDIO_SRC);
    }

    return () => {
      document.title = defaultTitleRef.current;
      endTimeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const defaultTitle = defaultTitleRef.current;

    if (isRunning) {
      document.title = `${phase === WORK_PHASE ? 'Work' : 'Break'} – ${formatTime(timeLeft)}`;
      return () => {
        document.title = defaultTitle;
      };
    }

    document.title = defaultTitle;

    return () => {
      document.title = defaultTitle;
    };
  }, [isRunning, phase, timeLeft]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const playNotification = () => {
      const notificationAudio = notificationAudioRef.current;

      if (!notificationAudio) {
        return;
      }

      notificationAudio.currentTime = 0;
      const playPromise = notificationAudio.play();
      playPromise?.catch?.(() => {});
    };

    const transitionPhase = () => {
      const nextPhase = phase === WORK_PHASE ? BREAK_PHASE : WORK_PHASE;
      const nextTimeLeft = getPhaseDurationInSeconds(nextPhase, workDuration, breakDuration);

      setPhase(nextPhase);
      setTimeLeft(nextTimeLeft);
      endTimeRef.current = Date.now() + nextTimeLeft * 1000;
      playNotification();
    };

    const tick = () => {
      const remainingSeconds = getRemainingSeconds(endTimeRef.current);

      if (remainingSeconds === 0) {
        transitionPhase();
        return;
      }

      setTimeLeft(remainingSeconds);
    };

    tick();
    const intervalId = window.setInterval(tick, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [breakDuration, isRunning, phase, workDuration]);

  const handleStartPause = () => {
    if (isRunning) {
      setTimeLeft((currentTimeLeft) =>
        endTimeRef.current ? getRemainingSeconds(endTimeRef.current) : currentTimeLeft
      );
      endTimeRef.current = null;
      setIsRunning(false);
      return;
    }

    const startingTimeLeft =
      timeLeft > 0 ? timeLeft : getPhaseDurationInSeconds(phase, workDuration, breakDuration);

    setTimeLeft(startingTimeLeft);
    endTimeRef.current = Date.now() + startingTimeLeft * 1000;
    setIsRunning(true);
  };

  const handleReset = () => {
    endTimeRef.current = null;
    setIsRunning(false);
    setPhase(WORK_PHASE);
    setTimeLeft(workDuration * 60);
  };

  const handleWorkDurationChange = (event) => {
    const value = clampDuration(event.target.value);
    setWorkDuration(value);

    if (phase === WORK_PHASE && !isRunning) {
      setTimeLeft(value * 60);
    }
  };

  const handleBreakDurationChange = (event) => {
    const value = clampDuration(event.target.value);
    setBreakDuration(value);

    if (phase === BREAK_PHASE && !isRunning) {
      setTimeLeft(value * 60);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-8">
      <div className="mb-4 flex space-x-4">
        <div>
          <label
            className="mb-1 block text-sm font-medium text-gray-700"
            htmlFor="work-duration"
          >
            Work Duration (min)
          </label>
          <input
            id="work-duration"
            type="number"
            min={MIN_DURATION_MINUTES}
            value={workDuration}
            onChange={handleWorkDurationChange}
            className="w-24 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
            disabled={isRunning}
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-medium text-gray-700"
            htmlFor="break-duration"
          >
            Break Duration (min)
          </label>
          <input
            id="break-duration"
            type="number"
            min={MIN_DURATION_MINUTES}
            value={breakDuration}
            onChange={handleBreakDurationChange}
            className="w-24 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
            disabled={isRunning}
          />
        </div>
      </div>

      <div className="text-center">
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">
          {phase === WORK_PHASE ? 'Work Time' : 'Break Time'}
        </h2>
        <div className="mb-8 text-6xl font-bold text-gray-800">{formatTime(timeLeft)}</div>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={handleStartPause}
          className="flex items-center space-x-2 rounded-lg bg-gray-900 px-6 py-3 text-white transition-colors hover:bg-gray-800"
        >
          {isRunning ? (
            <>
              <Pause className="h-5 w-5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              <span>Start</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center space-x-2 rounded-lg border border-gray-200 px-6 py-3 transition-colors hover:bg-gray-50"
        >
          <RotateCcw className="h-5 w-5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
