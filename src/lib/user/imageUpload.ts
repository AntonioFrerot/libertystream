const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type ImageUploadError = "avatarErrorInvalid" | "avatarErrorSize" | "avatarErrorRead";

export function readImageFile(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    return Promise.reject(new Error("avatarErrorInvalid"));
  }
  if (file.size > MAX_SIZE_BYTES) {
    return Promise.reject(new Error("avatarErrorSize"));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("avatarErrorRead"));
    };
    reader.onerror = () => reject(new Error("avatarErrorRead"));
    reader.readAsDataURL(file);
  });
}
