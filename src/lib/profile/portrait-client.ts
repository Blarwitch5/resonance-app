import { PORTRAIT_EDGE } from "@/lib/profile/portrait";

export async function shrinkPortraitFile(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = PORTRAIT_EDGE;
    canvas.height = PORTRAIT_EDGE;
    const context = canvas.getContext("2d");

    if (!context) {
      bitmap.close();
      return file;
    }

    const scale = Math.max(PORTRAIT_EDGE / bitmap.width, PORTRAIT_EDGE / bitmap.height);
    const width = bitmap.width * scale;
    const height = bitmap.height * scale;
    context.drawImage(bitmap, (PORTRAIT_EDGE - width) / 2, (PORTRAIT_EDGE - height) / 2, width, height);
    bitmap.close();

    const blob =
      (await canvasBlob(canvas, "image/webp", 0.7)) ?? (await canvasBlob(canvas, "image/jpeg", 0.7));

    if (!blob || blob.size === 0 || blob.size >= file.size) {
      return file;
    }

    const name = blob.type === "image/webp" ? "portrait.webp" : "portrait.jpg";
    return new File([blob], name, { type: blob.type });
  } catch {
    return file;
  }
}

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}
