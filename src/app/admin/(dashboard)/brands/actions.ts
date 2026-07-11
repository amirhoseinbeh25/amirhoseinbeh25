"use server";

import { redirect } from "next/navigation";
import { createBrand, updateBrand, deleteBrand } from "@/lib/repo";

function readFields(formData: FormData) {
  return {
    slug: String(formData.get("slug") || ""),
    name: String(formData.get("name") || ""),
  };
}

export async function createBrandAction(formData: FormData) {
  const data = readFields(formData);
  if (!data.name.trim()) redirect("/admin/brands/new?error=1");
  try {
    createBrand(data);
  } catch {
    redirect("/admin/brands/new?error=slug");
  }
  redirect("/admin/brands");
}

export async function updateBrandAction(id: number, formData: FormData) {
  const data = readFields(formData);
  if (!data.name.trim()) redirect(`/admin/brands/${id}/edit?error=1`);
  try {
    updateBrand(id, data);
  } catch {
    redirect(`/admin/brands/${id}/edit?error=slug`);
  }
  redirect("/admin/brands");
}

export async function deleteBrandAction(formData: FormData) {
  const id = Number(formData.get("id"));
  deleteBrand(id);
  redirect("/admin/brands");
}
