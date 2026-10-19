export const DESIGN_MIME_EXTENSIONS = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/pdf": "pdf",
} as const;

export type DesignMimeType = keyof typeof DESIGN_MIME_EXTENSIONS;

export function isDesignMimeType(value: string): value is DesignMimeType {
  return Object.hasOwn(DESIGN_MIME_EXTENSIONS, value);
}

export function designSignatureMatches(
  bytes: Uint8Array,
  mimeType: DesignMimeType
): boolean {
  if (mimeType === "image/png") {
    return bytes.length >= 8 &&
      [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
  }
  if (mimeType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/webp") {
    return bytes.length >= 12 &&
      String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP";
  }
  return bytes.length >= 5 && String.fromCharCode(...bytes.subarray(0, 5)) === "%PDF-";
}
