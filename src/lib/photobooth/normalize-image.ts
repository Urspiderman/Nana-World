const SUPPORTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function normalizeImageFile(
  file: File
): Promise<File> {
  const extension = file.name
    .split(".")
    .pop()
    ?.toLowerCase();

  const isHeic =
    extension === "heic" ||
    extension === "heif" ||
    [
      "image/heic",
      "image/heif",
      "image/heic-sequence",
      "image/heif-sequence",
    ].includes(file.type.toLowerCase());

  if (!isHeic) {
    if (
      !SUPPORTED_TYPES.has(
        file.type.toLowerCase()
      )
    ) {
      throw new Error(
        "Format foto tidak didukung."
      );
    }

    return file;
  }

  const { default: heic2any } =
    await import("heic2any");

  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  });

  const blob = Array.isArray(converted)
    ? converted[0]
    : converted;

  const name = file.name.replace(
    /\.(heic|heif)$/i,
    ""
  );

  return new File(
    [blob],
    `${name}.jpg`,
    {
      type: "image/jpeg",
      lastModified: file.lastModified,
    }
  );
}