import { COVER_EDGE, MAX_COVER_STORED_BYTES } from "@/lib/collection/cover";

const QUALITIES = [0.72, 0.56, 0.42] as const;

export async function shrinkCoverFile(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, COVER_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) {
      bitmap.close();
      return file;
    }

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await lightestCoverStill(canvas);

    if (!blob || blob.size === 0 || blob.size >= file.size) {
      return file;
    }

    const name = blob.type === "image/webp" ? "cover.webp" : "cover.jpg";
    return new File([blob], name, { type: blob.type });
  } catch {
    return file;
  }
}

async function lightestCoverStill(canvas: HTMLCanvasElement): Promise<Blob | null> {
  let smallest: Blob | null = null;

  for (const quality of QUALITIES) {
    const candidate = lighterStill(
      await canvasBlob(canvas, "image/webp", quality),
      await canvasBlob(canvas, "image/jpeg", quality),
    );

    if (!candidate) {
      continue;
    }

    if (!smallest || candidate.size < smallest.size) {
      smallest = candidate;
    }

    if (candidate.size <= MAX_COVER_STORED_BYTES) {
      return candidate;
    }
  }

  return smallest;
}

function lighterStill(first: Blob | null, second: Blob | null): Blob | null {
  if (!first || first.size === 0) {
    return second && second.size > 0 ? second : null;
  }

  if (!second || second.size === 0 || first.size <= second.size) {
    return first;
  }

  return second;
}

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}
