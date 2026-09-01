/** Turn Drive share links / file ids / data URLs into something an <img> can load. */
export function toDisplayPhoto(raw?: string | null): string | null {
  if (!raw) return null;
  const value = String(raw).trim();
  if (!value) return null;
  if (value.startsWith("data:image")) return value;

  const fromPath = value.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const fromQuery = value.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const fromThumb = value.match(/thumbnail\?id=([a-zA-Z0-9_-]+)/);
  const fromLh = value.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  const id = fromPath?.[1] || fromQuery?.[1] || fromThumb?.[1] || fromLh?.[1];

  if (id) {
    return `https://lh3.googleusercontent.com/d/${id}=w800`;
  }

  if (/^https?:\/\//i.test(value)) return value;
  return value;
}

export async function fileToCompressedDataUrl(file: File, maxSize = 720) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return readAsDataUrl(file);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.78);
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
