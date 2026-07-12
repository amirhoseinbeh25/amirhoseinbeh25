import "server-only";
import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

export async function saveAttachmentFile(letterId: string, file: File) {
  const dir = path.join(UPLOADS_ROOT, letterId);
  await mkdir(dir, { recursive: true });

  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const storedName = `${Date.now()}-${safeName}`;
  const filePath = path.join(letterId, storedName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOADS_ROOT, filePath), buffer);

  return {
    fileName: file.name,
    filePath,
    mimeType: file.type || "application/octet-stream",
    size: buffer.byteLength,
  };
}

export async function readAttachmentFile(filePath: string) {
  return readFile(path.join(UPLOADS_ROOT, filePath));
}
