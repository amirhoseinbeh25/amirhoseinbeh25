import { NextResponse } from "next/server";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { readAttachmentFile } from "@/lib/attachments";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await verifySession();

  const { id } = await params;
  const attachment = await prisma.attachment.findUnique({ where: { id } });
  if (!attachment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await readAttachmentFile(attachment.filePath);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`,
      "Content-Length": String(attachment.size),
    },
  });
}
