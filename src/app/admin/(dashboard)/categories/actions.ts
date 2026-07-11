"use server";

import { redirect } from "next/navigation";
import { createCategory, updateCategory, deleteCategory } from "@/lib/repo";

function readFields(formData: FormData) {
  return {
    slug: String(formData.get("slug") || ""),
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    color: String(formData.get("color") || "amber"),
  };
}

export async function createCategoryAction(formData: FormData) {
  const data = readFields(formData);
  if (!data.title.trim()) redirect("/admin/categories/new?error=1");
  try {
    createCategory(data);
  } catch {
    redirect("/admin/categories/new?error=slug");
  }
  redirect("/admin/categories");
}

export async function updateCategoryAction(id: number, formData: FormData) {
  const data = readFields(formData);
  if (!data.title.trim()) redirect(`/admin/categories/${id}/edit?error=1`);
  try {
    updateCategory(id, data);
  } catch {
    redirect(`/admin/categories/${id}/edit?error=slug`);
  }
  redirect("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData) {
  const id = Number(formData.get("id"));
  deleteCategory(id);
  redirect("/admin/categories");
}
