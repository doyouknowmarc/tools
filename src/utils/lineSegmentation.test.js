import { describe, expect, it } from 'vitest';
import {
  SegmentError,
  buildLineMask,
  segmentByOuterContour,
} from './lineSegmentation';

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

function alphaAt(image, x, y) {
  return image.data[(y * image.width + x) * 4 + 3];
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

function createOpenContourImage() {
  const image = createClosedContourImage();

  for (let y = 2; y <= 4; y += 1) {
    setPixel(image, 5, y, [255, 255, 255, 255]);
  }

  return image;
}

describe('line segmentation utilities', () => {
  it('detects dark contour pixels and ignores transparent pixels', () => {
    const image = createImage(2, 1, [255, 255, 255, 255]);
    setPixel(image, 0, 0, [0, 0, 0, 0]);
    setPixel(image, 1, 0, [0, 0, 0, 255]);

    const lineMask = buildLineMask(image, 10, { closeKernelSize: 1 });

    expect(Array.from(lineMask.data)).toEqual([0, 1]);
  });

  it('keeps the region inside a closed contour when requested', () => {
    const image = createClosedContourImage();

    const result = segmentByOuterContour(image, 10, {
      keepMode: 'inside',
      closeKernelSize: 3,
    });

    expect(alphaAt(result.outputRgba, 3, 3)).toBe(255);
    expect(alphaAt(result.outputRgba, 0, 0)).toBe(0);
    expect(alphaAt(result.outputRgba, 1, 1)).toBe(255);
  });

  it('keeps the region outside a closed contour when requested', () => {
    const image = createClosedContourImage();

    const result = segmentByOuterContour(image, 10, {
      keepMode: 'outside',
      closeKernelSize: 3,
    });

    expect(alphaAt(result.outputRgba, 0, 0)).toBe(255);
    expect(alphaAt(result.outputRgba, 3, 3)).toBe(0);
    expect(alphaAt(result.outputRgba, 1, 1)).toBe(255);
  });

  it('preserves contour pixels in both keep modes', () => {
    const image = createClosedContourImage();

    const insideResult = segmentByOuterContour(image, 10, { keepMode: 'inside' });
    const outsideResult = segmentByOuterContour(image, 10, { keepMode: 'outside' });

    expect(alphaAt(insideResult.outputRgba, 1, 3)).toBe(255);
    expect(alphaAt(outsideResult.outputRgba, 1, 3)).toBe(255);
  });

  it('throws when no dark contour line is found', () => {
    const image = createImage(5, 5);

    expect(() => segmentByOuterContour(image, 10)).toThrowError(SegmentError);
    expect(() => segmentByOuterContour(image, 10)).toThrow(
      'No dark contour line found. Increase the threshold.'
    );
  });

  it('throws when the contour is open and does not enclose an inside region', () => {
    const image = createOpenContourImage();

    expect(() => segmentByOuterContour(image, 10)).toThrowError(SegmentError);
    expect(() => segmentByOuterContour(image, 10)).toThrow(
      'No closed outer contour found. The line is likely open or the threshold is too low.'
    );
  });
});
