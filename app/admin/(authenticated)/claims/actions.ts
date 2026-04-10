"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function approveClaim(
  claimId: string,
  clinicId: string | null,
) {
  // Update clinic as claimed
  if (clinicId) {
    const { error: clinicError } = await supabaseAdmin
      .from("clinics")
      .update({
        is_claimed: true,
        claimed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", clinicId);

    if (clinicError) {
      console.error("Failed to update clinic:", clinicError.message);
      throw new Error(`Ошибка обновления клиники: ${clinicError.message}`);
    }
  } else {
    console.error("approveClaim: clinicId is null", { claimId });
  }

  // Update claim status
  const { error } = await supabaseAdmin
    .from("claim_requests")
    .update({ status: "approved" })
    .eq("id", claimId);

  if (error) {
    console.error("Failed to update claim_request:", error.message);
    throw new Error(`Ошибка обновления заявки: ${error.message}`);
  }

  revalidatePath("/admin/claims");
}

export async function getSignedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.storage
    .from("claim-documents")
    .createSignedUrl(path, 60 * 10); // 10 min
  if (error) {
    console.error("Signed URL error:", error.message);
    return null;
  }
  return data.signedUrl;
}

export async function rejectClaim(claimId: string) {
  const { error } = await supabaseAdmin
    .from("claim_requests")
    .update({ status: "rejected" })
    .eq("id", claimId);

  if (error) {
    console.error("Failed to reject claim:", error.message);
    throw new Error(`Ошибка отклонения заявки: ${error.message}`);
  }

  revalidatePath("/admin/claims");
}
