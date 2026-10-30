import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Covers the whole viewport and asks the browser for real fullscreen.
// Falls back to a fixed overlay when the Fullscreen API is unavailable (e.g. iOS Safari).
function FullscreenOverlay({ onClose, onKeyDown, className, style, children, ...rest }) {
  const containerRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const onKeyDownRef = useRef(onKeyDown);

  useEffect(() => {
    onCloseRef.current = onClose;
    onKeyDownRef.current = onKeyDown;
  });

  useEffect(() => {
    const element = containerRef.current;
    let enteredFullscreen = false;

    if (element?.requestFullscreen) {
      element
        .requestFullscreen()
        .then(() => {
          enteredFullscreen = true;
        })
        .catch(() => {});
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && enteredFullscreen) {
        onCloseRef.current?.();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCloseRef.current?.();
        return;
      }
      onKeyDownRef.current?.(event);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-[100] overflow-hidden ${className ?? ''}`}
      style={style}
      {...rest}
    >
      {children}
    </div>,
    document.body
  );
}

export default FullscreenOverlay;
