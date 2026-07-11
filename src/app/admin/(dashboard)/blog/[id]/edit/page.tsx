import { notFound } from "next/navigation";
import { getPostById } from "@/lib/repo";
import PostForm from "../../PostForm";
import { updatePostAction } from "../../actions";

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const post = getPostById(Number(id));
  if (!post) notFound();

  const action = updatePostAction.bind(null, post.id);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">ویرایش مقاله</h1>
      <div className="mt-6">
        <PostForm post={post} action={action} error={error} />
      </div>
    </div>
  );
}
