import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { CopyPath } from "@/components/admin/CopyPath";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const assets = await db.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <MediaUploader />

      {assets.length === 0 ? (
        <p className="text-sm text-muted">هنوز فایلی بارگذاری نشده است.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <li
              key={asset.id}
              className="overflow-hidden rounded-2xl border border-border bg-surface"
            >
              {asset.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={asset.path}
                  alt={asset.title ?? asset.filename}
                  className="aspect-video w-full object-cover"
                />
              ) : asset.mimeType.startsWith("video/") ? (
                <video
                  src={asset.path}
                  muted
                  playsInline
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center text-sm text-muted">
                  {asset.mimeType}
                </div>
              )}

              <div className="p-4">
                <p className="truncate text-sm font-medium">
                  {asset.title ?? asset.filename}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {(asset.bytes / 1024 / 1024).toFixed(2)} مگابایت
                </p>
                <CopyPath path={asset.path} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
