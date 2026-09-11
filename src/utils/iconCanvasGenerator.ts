import { AppIconConfig } from '../types';

/**
 * Renders the user's configured app icon (emoji, monogram, preset, or uploaded image)
 * on an HTML Canvas and exports it as a clean base64 PNG string.
 */
export async function generateAppIconBase64(
  icon: AppIconConfig,
  appName: string,
  size: number = 192
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Clear canvas
  ctx.clearRect(0, 0, size, size);

  // Determine corner radius based on shape
  let radius = 0;
  if (icon.shape === 'circle') {
    radius = size / 2;
  } else if (icon.shape === 'squircle') {
    radius = size * 0.28; // Standard modern Android squircle
  } else if (icon.shape === 'rounded') {
    radius = size * 0.18;
  } else {
    radius = size * 0.08;
  }

  // Draw clipped background
  ctx.save();
  ctx.beginPath();
  if (icon.shape === 'circle') {
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  } else {
    // Rounded rect
    ctx.roundRect(0, 0, size, size, radius);
  }
  ctx.closePath();
  ctx.clip();

  // Fill background
  ctx.fillStyle = icon.bgColor || '#2563EB';
  ctx.fillRect(0, 0, size, size);

  // Render content
  if (icon.type === 'uploaded' && icon.value) {
    try {
      await drawImageOnCanvas(ctx, icon.value, size);
    } catch {
      // Fallback to text if image fails
      drawTextOnCanvas(ctx, appName.charAt(0).toUpperCase() || 'A', size);
    }
  } else {
    const symbol = icon.value?.trim() || appName.charAt(0).toUpperCase() || '★';
    drawTextOnCanvas(ctx, symbol, size);
  }

  ctx.restore();

  // Export data URL and strip header to get pure base64
  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl.replace(/^data:image\/png;base64,/, '');
}

/**
 * Loads and centers an image (data URL or web URL) inside the canvas
 */
function drawImageOnCanvas(
  ctx: CanvasRenderingContext2D,
  imageSrc: string,
  size: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Scale image to fit comfortably with padding (80% of size)
      const padding = size * 0.1;
      const targetSize = size - padding * 2;

      let drawWidth = targetSize;
      let drawHeight = targetSize;

      if (img.width > img.height) {
        drawHeight = (img.height / img.width) * targetSize;
      } else {
        drawWidth = (img.width / img.height) * targetSize;
      }

      const x = (size - drawWidth) / 2;
      const y = (size - drawHeight) / 2;

      ctx.drawImage(img, x, y, drawWidth, drawHeight);
      resolve();
    };
    img.onerror = (err) => {
      reject(err);
    };
    img.src = imageSrc;
  });
}

/**
 * Draws centered text or emoji on canvas
 */
function drawTextOnCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  size: number
): void {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Check if string contains emoji or multiple chars
  const isEmoji = /\p{Extended_Pictographic}/u.test(text);
  const fontSize = isEmoji ? Math.floor(size * 0.52) : Math.floor(size * 0.44);

  ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", sans-serif`;
  ctx.fillStyle = '#FFFFFF';

  // Add subtle shadow for monograms
  if (!isEmoji) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
  }

  // Emoji baseline tweak
  const yOffset = isEmoji ? size * 0.04 : 0;
  ctx.fillText(text, size / 2, size / 2 + yOffset);
}
