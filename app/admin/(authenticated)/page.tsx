import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [activeClinics, pendingClaims, verifiedClinics] = await Promise.all([
    supabaseAdmin
      .from("clinics")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabaseAdmin
      .from("claim_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabaseAdmin
      .from("clinics")
      .select("*", { count: "exact", head: true })
      .eq("is_verified", true),
  ]);

  const stats = [
    { label: "Активных клиник", value: activeClinics.count ?? 0 },
    { label: "Ожидающих заявок", value: pendingClaims.count ?? 0 },
    { label: "Верифицированных", value: verifiedClinics.count ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-slate-200 p-6"
          >
            <div className="text-3xl font-bold text-slate-900">{s.value}</div>
            <div className="mt-1 text-sm text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
