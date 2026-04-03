import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ContourSegmenter from './ContourSegmenter';

function createImage(width, height, fill = [255, 255, 255, 255]) {
  const data = new Uint8ClampedArray(width * height * 4);

  for (let index = 0; index < width * height; index += 1) {
    const channelIndex = index * 4;
    data[channelIndex] = fill[0];
    data[channelIndex + 1] = fill[1];
    data[channelIndex + 2] = fill[2];
    data[channelIndex + 3] = fill[3];
  }

  return { width, height, data };
}

function setPixel(image, x, y, rgba) {
  const index = (y * image.width + x) * 4;
  image.data[index] = rgba[0];
  image.data[index + 1] = rgba[1];
  image.data[index + 2] = rgba[2];
  image.data[index + 3] = rgba[3];
}

function createClosedContourImage() {
  const image = createImage(7, 7);

  for (let x = 1; x <= 5; x += 1) {
    setPixel(image, x, 1, [0, 0, 0, 255]);
    setPixel(image, x, 5, [0, 0, 0, 255]);
  }

  for (let y = 1; y <= 5; y += 1) {
    setPixel(image, 1, y, [0, 0, 0, 255]);
    setPixel(image, 5, y, [0, 0, 0, 255]);
  }

  return image;
}

function createCanvasMock(sourceImageData) {
  const context = {
    createImageData: vi.fn((width, height) => ({
      width,
      height,
      data: new Uint8ClampedArray(width * height * 4),
    })),
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({
      width: sourceImageData.width,
      height: sourceImageData.height,
      data: new Uint8ClampedArray(sourceImageData.data),
    })),
    putImageData: vi.fn(),
  };

  return {
    width: 0,
    height: 0,
    getContext: vi.fn(() => context),
    toBlob: vi.fn((callback) => {
      callback(new Blob(['png'], { type: 'image/png' }));
    }),
  };
}

describe('ContourSegmenter', () => {
  const sourceImageData = createClosedContourImage();
  const originalCreateElement = document.createElement.bind(document);
  let objectUrlCount = 0;

  beforeEach(() => {
    objectUrlCount = 0;

    vi.stubGlobal(
      'Image',
      class MockImage {
        constructor() {
          this.width = sourceImageData.width;
          this.height = sourceImageData.height;
          this.naturalWidth = sourceImageData.width;
          this.naturalHeight = sourceImageData.height;
          this.onload = null;
          this.onerror = null;
        }

        set src(_value) {
          queueMicrotask(() => {
            this.onload?.();
          });
        }
      }
    );

    vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
      objectUrlCount += 1;
      return `blob:mock-${objectUrlCount}`;
    });
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      if (tagName === 'canvas') {
        return createCanvasMock(sourceImageData);
      }

      return originalCreateElement(tagName, options);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('uploads an image, renders previews, and reprocesses when keep mode changes', async () => {
    const user = userEvent.setup();

    render(<ContourSegmenter />);

    const input = screen.getByLabelText('Upload image');
    const file = new File([new Uint8Array([1, 2, 3])], 'outline.png', { type: 'image/png' });

    await user.upload(input, file);

    expect(await screen.findByAltText('Original upload')).toBeInTheDocument();
    expect(await screen.findByAltText('Detected line mask')).toBeInTheDocument();
    expect(await screen.findByAltText('Segmented result')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download transparent PNG' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Outside' }));

    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalledTimes(5);
    });
  });
});
