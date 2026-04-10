"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function approveClaim(claimId: string, clinicId: string | null) {
  if (clinicId) {
    await supabaseAdmin
      .from("clinics")
      .update({
        is_claimed: true,
        claimed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", clinicId);
  }
  const { error } = await supabaseAdmin
    .from("claim_requests")
    .update({ status: "approved" })
    .eq("id", claimId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/claims");
}

export async function rejectClaim(claimId: string) {
  const { error } = await supabaseAdmin
    .from("claim_requests")
    .update({ status: "rejected" })
    .eq("id", claimId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/claims");
}
