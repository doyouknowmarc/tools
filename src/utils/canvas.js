const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getRadianAngle = (degreeValue) => (degreeValue * Math.PI) / 180;

const getRotatedSize = (width, height, rotation) => {
  const rotRad = getRadianAngle(rotation);

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height)
  };
};

const fillBackground = (ctx, width, height, backgroundColor) => {
  if (!backgroundColor || backgroundColor === 'transparent') {
    ctx.clearRect(0, 0, width, height);
    return;
  }

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
};

export async function getCroppedCanvas(imageSrc, pixelCrop, rotation = 0, backgroundColor = null, circle = false) {
  if (!pixelCrop) {
    throw new Error('Cropping information is missing.');
  }

  const image = await createImage(imageSrc);
  const rotRad = getRadianAngle(rotation);
  const { width: boundingWidth, height: boundingHeight } = getRotatedSize(image.width, image.height, rotation);

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = boundingWidth;
  tempCanvas.height = boundingHeight;
  const tempCtx = tempCanvas.getContext('2d');

  fillBackground(tempCtx, tempCanvas.width, tempCanvas.height, backgroundColor);

  tempCtx.translate(boundingWidth / 2, boundingHeight / 2);
  tempCtx.rotate(rotRad);
  tempCtx.drawImage(image, -image.width / 2, -image.height / 2);

  const data = tempCtx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = pixelCrop.width;
  outputCanvas.height = pixelCrop.height;
  const outputCtx = outputCanvas.getContext('2d');

  fillBackground(outputCtx, outputCanvas.width, outputCanvas.height, backgroundColor);
  outputCtx.putImageData(data, 0, 0);

  if (!circle) {
    return outputCanvas;
  }

  const circleSize = Math.min(outputCanvas.width, outputCanvas.height);
  const circleCanvas = document.createElement('canvas');
  circleCanvas.width = circleSize;
  circleCanvas.height = circleSize;
  const circleCtx = circleCanvas.getContext('2d');

  fillBackground(circleCtx, circleCanvas.width, circleCanvas.height, backgroundColor);
  circleCtx.save();
  circleCtx.beginPath();
  circleCtx.arc(circleSize / 2, circleSize / 2, circleSize / 2, 0, 2 * Math.PI);
  circleCtx.closePath();
  circleCtx.clip();

  const offsetX = (circleSize - outputCanvas.width) / 2;
  const offsetY = (circleSize - outputCanvas.height) / 2;
  circleCtx.drawImage(outputCanvas, offsetX, offsetY);
  circleCtx.restore();

  return circleCanvas;
}
