"use server";

import { redirect } from "next/navigation";
import { updateSiteSettings } from "@/lib/repo";

export async function updateSettingsAction(formData: FormData) {
  updateSiteSettings({
    nameLatin: String(formData.get("nameLatin") || "Kemkan"),
    nameFa: String(formData.get("nameFa") || ""),
    tagline: String(formData.get("tagline") || ""),
    shortDescription: String(formData.get("shortDescription") || ""),
    phone1: String(formData.get("phone1") || ""),
    phone2: String(formData.get("phone2") || ""),
    email: String(formData.get("email") || ""),
    address: String(formData.get("address") || ""),
    mapEmbedUrl: String(formData.get("mapEmbedUrl") || ""),
    workHours: String(formData.get("workHours") || ""),
    socialTelegram: String(formData.get("socialTelegram") || ""),
    socialInstagram: String(formData.get("socialInstagram") || ""),
    socialWhatsapp: String(formData.get("socialWhatsapp") || ""),
    socialLinkedin: String(formData.get("socialLinkedin") || ""),
  });
  redirect("/admin/settings?saved=1");
}
