"use server";

import { redirect } from "next/navigation";
import { createPost, updatePost, deletePost } from "@/lib/repo";

function readFields(formData: FormData) {
  return {
    slug: String(formData.get("slug") || ""),
    title: String(formData.get("title") || ""),
    date: String(formData.get("date") || ""),
    excerpt: String(formData.get("excerpt") || ""),
    content: String(formData.get("content") || ""),
  };
}

export async function createPostAction(formData: FormData) {
  const data = readFields(formData);
  if (!data.title.trim()) redirect("/admin/blog/new?error=1");
  try {
    createPost(data);
  } catch {
    redirect("/admin/blog/new?error=slug");
  }
  redirect("/admin/blog");
}

export async function updatePostAction(id: number, formData: FormData) {
  const data = readFields(formData);
  if (!data.title.trim()) redirect(`/admin/blog/${id}/edit?error=1`);
  try {
    updatePost(id, data);
  } catch {
    redirect(`/admin/blog/${id}/edit?error=slug`);
  }
  redirect("/admin/blog");
}

export async function deletePostAction(formData: FormData) {
  const id = Number(formData.get("id"));
  deletePost(id);
  redirect("/admin/blog");
}
