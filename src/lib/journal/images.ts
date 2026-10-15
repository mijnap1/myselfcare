function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image."));
    image.src = source;
  });
}

/** Downscales any image to a JPEG no larger than `maxSize` on its long edge. */
export async function optimizeImage(source: Blob, maxSize = 900, quality = 0.72): Promise<Blob> {
  const objectUrl = URL.createObjectURL(source);
  try {
    const image = await loadImage(objectUrl);
    const ratio = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * ratio));
    const height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is not available.");
    }
    context.fillStyle = "#111518";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode image."))),
        "image/jpeg",
        quality
      );
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function getPastedImage(event: React.ClipboardEvent): File | null {
  const item = Array.from(event.clipboardData.items).find((entry) => entry.type.startsWith("image/"));
  return item?.getAsFile() ?? null;
}
