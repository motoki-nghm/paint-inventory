const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB
const TARGET_LONG_EDGE = 1280; // downscale long edge for storage efficiency
const JPEG_QUALITY = 0.82;

export class ImageError extends Error {
  code: "type" | "size" | "decode";
  constructor(code: "type" | "size" | "decode", message: string) {
    super(message);
    this.code = code;
  }
}

function isImageFile(file: File) {
  return ALLOWED_TYPES.has(file.type);
}

function readAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error ?? new Error("file read failed"));
    r.readAsDataURL(blob);
  });
}

async function downscale(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode failed"));
      el.src = url;
    });
    const long = Math.max(img.naturalWidth, img.naturalHeight);
    const scale = long > TARGET_LONG_EDGE ? TARGET_LONG_EDGE / long : 1;
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new ImageError("decode", "canvas context が取得できません");
    ctx.drawImage(img, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob) throw new ImageError("decode", "画像のエンコードに失敗しました");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Validate, downscale, and convert an upload to a JPEG data URL.
 * Throws ImageError for type/size/decode problems.
 */
export async function fileToCompressedDataUrl(file: File): Promise<string> {
  if (!isImageFile(file)) {
    throw new ImageError("type", "対応していない画像形式です");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new ImageError("size", "画像サイズが上限 (8MB) を超えています");
  }
  try {
    const blob = await downscale(file);
    return await readAsDataUrl(blob);
  } catch (e) {
    if (e instanceof ImageError) throw e;
    // Fall back: try raw read
    return await readAsDataUrl(file);
  }
}
