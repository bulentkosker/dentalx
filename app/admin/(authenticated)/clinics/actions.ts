"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function toggleActive(id: string, value: boolean) {
  const { error } = await supabaseAdmin
    .from("clinics")
    .update({ is_active: value, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/clinics");
}

export async function toggleVerified(id: string, value: boolean) {
  const { error } = await supabaseAdmin
    .from("clinics")
    .update({ is_verified: value, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/clinics");
}

export async function deleteClinic(id: string) {
  const { error } = await supabaseAdmin.from("clinics").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/clinics");
}

export async function createClinic(formData: FormData) {
  const name = formData.get("name") as string;
  const city_slug = formData.get("city_slug") as string;

  // slugify
  const translitMap: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
    з: "z", и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
    ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
    я: "ya", ә: "a", ғ: "g", қ: "q", ң: "n", ө: "o", ұ: "u", ү: "u", һ: "h", і: "i",
  };
  let slug = "";
  for (const ch of name.toLowerCase()) {
    if (translitMap[ch] !== undefined) slug += translitMap[ch];
    else if (/[a-z0-9]/.test(ch)) slug += ch;
    else slug += "-";
  }
  slug = slug.replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "clinic";
  slug += "-" + Date.now().toString(36);

  const { error } = await supabaseAdmin.from("clinics").insert({
    id: crypto.randomUUID(),
    name,
    slug,
    city: city_slug === "astana" ? "Astana" : "Almaty",
    city_slug,
    address: (formData.get("address") as string) || null,
    phone: (formData.get("phone") as string) || null,
    website: (formData.get("website") as string) || null,
    lat: formData.get("lat") ? parseFloat(formData.get("lat") as string) : null,
    lon: formData.get("lon") ? parseFloat(formData.get("lon") as string) : null,
    rating: formData.get("rating") ? parseFloat(formData.get("rating") as string) : null,
    reviews_count: formData.get("reviews_count") ? parseInt(formData.get("reviews_count") as string) : null,
    is_active: formData.get("is_active") === "on",
    source: "admin",
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/clinics");
  return { error: null };
}

export async function updateClinic(id: string, formData: FormData) {
  const city_slug = formData.get("city_slug") as string;
  const { error } = await supabaseAdmin
    .from("clinics")
    .update({
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      city: city_slug === "astana" ? "Astana" : "Almaty",
      city_slug,
      address: (formData.get("address") as string) || null,
      phone: (formData.get("phone") as string) || null,
      website: (formData.get("website") as string) || null,
      lat: formData.get("lat") ? parseFloat(formData.get("lat") as string) : null,
      lon: formData.get("lon") ? parseFloat(formData.get("lon") as string) : null,
      rating: formData.get("rating") ? parseFloat(formData.get("rating") as string) : null,
      reviews_count: formData.get("reviews_count") ? parseInt(formData.get("reviews_count") as string) : null,
      is_active: formData.get("is_active") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/clinics");
  return { error: null };
}

export async function getClinic(id: string) {
  const { data } = await supabaseAdmin.from("clinics").select("*").eq("id", id).maybeSingle();
  return data;
}
