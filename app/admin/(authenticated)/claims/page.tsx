import { supabaseAdmin } from "@/lib/supabase-admin";
import ClaimsTable from "./ClaimsTable";

export const dynamic = "force-dynamic";

export default async function AdminClaimsPage() {
  const { data: claims } = await supabaseAdmin
    .from("claim_requests")
    .select("*, clinics(name, slug, city_slug)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Заявки на подтверждение</h1>
      <div className="mt-1 text-sm text-slate-500">{claims?.length ?? 0} ожидающих</div>

      {claims && claims.length > 0 ? (
        <ClaimsTable claims={claims} />
      ) : (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Нет ожидающих заявок
        </div>
      )}
    </div>
  );
}
