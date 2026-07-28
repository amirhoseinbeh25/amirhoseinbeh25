import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 64 * 1024 * 1024;

/** فقط همین قالب‌ها پذیرفته می‌شوند تا فایل اجرایی روی سرور ننشیند. */
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "application/pdf": "pdf",
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "وارد نشده‌اید." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "فایلی فرستاده نشد." }, { status: 400 });
  }

  const extension = ALLOWED[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: `قالب ${file.type || "نامشخص"} پذیرفته نمی‌شود.` },
      { status: 415 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "حجم فایل بیش از ۶۴ مگابایت است." },
      { status: 413 },
    );
  }

  // نام فایل از ورودی کاربر ساخته نمی‌شود تا مسیر دستکاری نشود
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${extension}`;
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, filename),
    Buffer.from(await file.arrayBuffer()),
  );

  const publicPath = `/uploads/${filename}`;
  const asset = await db.mediaAsset.create({
    data: {
      filename,
      path: publicPath,
      mimeType: file.type,
      bytes: file.size,
      title: file.name.slice(0, 200),
    },
  });

  return NextResponse.json({ path: asset.path, id: asset.id });
}
