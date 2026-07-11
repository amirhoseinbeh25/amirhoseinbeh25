"use server";

import { redirect } from "next/navigation";
import { createProduct, updateProduct, deleteProduct } from "@/lib/repo";

function readFields(formData: FormData) {
  return {
    slug: String(formData.get("slug") || ""),
    title: String(formData.get("title") || ""),
    categoryId: Number(formData.get("categoryId")),
    brand: String(formData.get("brand") || "—"),
    summary: String(formData.get("summary") || ""),
    specsText: String(formData.get("specsText") || ""),
  };
}

export async function createProductAction(formData: FormData) {
  const data = readFields(formData);
  if (!data.title.trim() || !data.categoryId) redirect("/admin/products/new?error=1");
  try {
    createProduct(data);
  } catch {
    redirect("/admin/products/new?error=slug");
  }
  redirect("/admin/products");
}

export async function updateProductAction(id: number, formData: FormData) {
  const data = readFields(formData);
  if (!data.title.trim() || !data.categoryId) redirect(`/admin/products/${id}/edit?error=1`);
  try {
    updateProduct(id, data);
  } catch {
    redirect(`/admin/products/${id}/edit?error=slug`);
  }
  redirect("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  const id = Number(formData.get("id"));
  deleteProduct(id);
  redirect("/admin/products");
}
