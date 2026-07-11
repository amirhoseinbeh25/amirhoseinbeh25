import PostForm from "../PostForm";
import { createPostAction } from "../actions";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">مقاله جدید</h1>
      <div className="mt-6">
        <PostForm action={createPostAction} error={error} />
      </div>
    </div>
  );
}
