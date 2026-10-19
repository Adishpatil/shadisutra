export type DesignFileKind = "image" | "pdf";

export function getDesignFileKind(
  filePath: string,
  eventId: string,
  designId: string
): DesignFileKind | null {
  const [pathEventId, pathDesignId, filename, ...extra] = filePath.split("/");
  if (
    pathEventId !== eventId ||
    pathDesignId !== designId ||
    !filename ||
    extra.length > 0 ||
    !/^[A-Za-z0-9_-]+\.(png|jpg|webp|pdf)$/i.test(filename)
  ) {
    return null;
  }
  return filename.toLowerCase().endsWith(".pdf") ? "pdf" : "image";
}
