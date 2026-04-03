export class SegmentError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SegmentError';
  }
}

function normalizeRgbaImage(imageData) {
  if (!imageData || typeof imageData.width !== 'number' || typeof imageData.height !== 'number' || !imageData.data) {
    throw new TypeError('Expected image data with width, height, and RGBA pixel data.');
  }

  const { width, height } = imageData;

  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new TypeError('Expected positive integer dimensions for the RGBA image.');
  }

  const expectedLength = width * height * 4;
  const sourceData = imageData.data;

  if (sourceData.length !== expectedLength) {
    throw new TypeError(`Expected ${expectedLength} RGBA values but received ${sourceData.length}.`);
  }

  const data =
    sourceData instanceof Uint8ClampedArray ? sourceData : new Uint8ClampedArray(sourceData);

  return { width, height, data };
}

function createMask(width, height, data) {
  return { width, height, data };
}

function createRgba(width, height, data) {
  return { width, height, data };
}

function dilate(mask, width, height, kernelSize) {
  const radius = Math.floor(kernelSize / 2);
  const output = new Uint8Array(mask.length);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let value = 0;

      for (let offsetY = -radius; offsetY <= radius && !value; offsetY += 1) {
        const nextY = y + offsetY;
        if (nextY < 0 || nextY >= height) {
          continue;
        }

        for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
          const nextX = x + offsetX;
          if (nextX < 0 || nextX >= width) {
            continue;
          }

          if (mask[nextY * width + nextX]) {
            value = 1;
            break;
          }
        }
      }

      output[y * width + x] = value;
    }
  }

  return output;
}

function erode(mask, width, height, kernelSize) {
  const radius = Math.floor(kernelSize / 2);
  const output = new Uint8Array(mask.length);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let value = 1;

      for (let offsetY = -radius; offsetY <= radius && value; offsetY += 1) {
        const nextY = y + offsetY;
        if (nextY < 0 || nextY >= height) {
          value = 0;
          break;
        }

        for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
          const nextX = x + offsetX;
          if (nextX < 0 || nextX >= width || !mask[nextY * width + nextX]) {
            value = 0;
            break;
          }
        }
      }

      output[y * width + x] = value;
    }
  }

  return output;
}

function morphologicalClose(mask, width, height, kernelSize) {
  if (kernelSize <= 1) {
    return new Uint8Array(mask);
  }

  const expanded = dilate(mask, width, height, kernelSize);
  return erode(expanded, width, height, kernelSize);
}

function floodFillOutside(freeSpace, width, height) {
  const outside = new Uint8Array(freeSpace.length);
  const queue = new Int32Array(freeSpace.length);
  let head = 0;
  let tail = 0;
  let hasBorderFreeSpace = false;

  const enqueue = (index) => {
    if (!freeSpace[index] || outside[index]) {
      return;
    }

    outside[index] = 1;
    queue[tail] = index;
    tail += 1;
    hasBorderFreeSpace = true;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }

  for (let y = 0; y < height; y += 1) {
    enqueue(y * width);
    enqueue(y * width + (width - 1));
  }

  while (head < tail) {
    const index = queue[head];
    head += 1;

    const x = index % width;
    const y = Math.floor(index / width);

    if (x > 0) {
      enqueue(index - 1);
    }
    if (x < width - 1) {
      enqueue(index + 1);
    }
    if (y > 0) {
      enqueue(index - width);
    }
    if (y < height - 1) {
      enqueue(index + width);
    }
  }

  return { outside, hasBorderFreeSpace };
}

export function buildLineMask(
  imageData,
  threshold,
  { closeKernelSize = 3, minVisibleAlpha = 1 } = {}
) {
  const { width, height, data } = normalizeRgbaImage(imageData);
  const rawMask = new Uint8Array(width * height);

  for (let pixelIndex = 0; pixelIndex < rawMask.length; pixelIndex += 1) {
    const channelIndex = pixelIndex * 4;
    const alpha = data[channelIndex + 3];
    const isVisible = alpha >= minVisibleAlpha;

    if (!isVisible) {
      continue;
    }

    const red = data[channelIndex];
    const green = data[channelIndex + 1];
    const blue = data[channelIndex + 2];
    const gray = Math.round(red * 0.299 + green * 0.587 + blue * 0.114);

    if (gray <= threshold) {
      rawMask[pixelIndex] = 1;
    }
  }

  const lineMask = morphologicalClose(rawMask, width, height, closeKernelSize);
  return createMask(width, height, lineMask);
}

export function segmentByOuterContour(
  imageData,
  threshold,
  { keepMode = 'inside', closeKernelSize = 3 } = {}
) {
  if (!['inside', 'outside'].includes(keepMode)) {
    throw new TypeError("keepMode must be either 'inside' or 'outside'.");
  }

  const rgba = normalizeRgbaImage(imageData);
  const lineMask = buildLineMask(rgba, threshold, { closeKernelSize });

  if (!lineMask.data.some(Boolean)) {
    throw new SegmentError('No dark contour line found. Increase the threshold.');
  }

  const freeSpace = new Uint8Array(lineMask.data.length);
  for (let index = 0; index < lineMask.data.length; index += 1) {
    freeSpace[index] = lineMask.data[index] ? 0 : 1;
  }

  const { outside, hasBorderFreeSpace } = floodFillOutside(freeSpace, rgba.width, rgba.height);

  if (!hasBorderFreeSpace) {
    throw new SegmentError('The image border is fully blocked. The outer contour cannot be determined.');
  }

  const inside = new Uint8Array(freeSpace.length);
  let hasInside = false;

  for (let index = 0; index < freeSpace.length; index += 1) {
    if (freeSpace[index] && !outside[index]) {
      inside[index] = 1;
      hasInside = true;
    }
  }

  if (!hasInside) {
    throw new SegmentError(
      'No closed outer contour found. The line is likely open or the threshold is too low.'
    );
  }

  const keepFreeSpace = keepMode === 'inside' ? inside : outside;
  const keepMaskData = new Uint8Array(freeSpace.length);

  for (let index = 0; index < keepMaskData.length; index += 1) {
    keepMaskData[index] = keepFreeSpace[index] || lineMask.data[index] ? 1 : 0;
  }

  const outputData = new Uint8ClampedArray(rgba.data);

  for (let pixelIndex = 0; pixelIndex < keepMaskData.length; pixelIndex += 1) {
    if (!keepMaskData[pixelIndex]) {
      outputData[pixelIndex * 4 + 3] = 0;
    }
  }

  return {
    outputRgba: createRgba(rgba.width, rgba.height, outputData),
    lineMask,
    keepMask: createMask(rgba.width, rgba.height, keepMaskData),
    outsideMask: createMask(rgba.width, rgba.height, outside),
    threshold,
    keepMode,
  };
}

export function maskPreview(mask) {
  if (!mask || typeof mask.width !== 'number' || typeof mask.height !== 'number' || !mask.data) {
    throw new TypeError('Expected mask data with width, height, and pixel values.');
  }

  const previewData = new Uint8ClampedArray(mask.width * mask.height * 4);

  for (let index = 0; index < mask.data.length; index += 1) {
    const channelIndex = index * 4;
    const value = mask.data[index] ? 255 : 0;

    previewData[channelIndex] = value;
    previewData[channelIndex + 1] = value;
    previewData[channelIndex + 2] = value;
    previewData[channelIndex + 3] = 255;
  }

  return createRgba(mask.width, mask.height, previewData);
}

export function rgbaToPngBlob(imageData) {
  const { width, height, data } = normalizeRgbaImage(imageData);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas rendering is not available in this browser.');
  }

  const nextImageData = context.createImageData(width, height);
  nextImageData.data.set(data);
  context.putImageData(nextImageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Unable to export the segmented image as PNG.'));
        return;
      }

      resolve(blob);
    }, 'image/png');
  });
}
