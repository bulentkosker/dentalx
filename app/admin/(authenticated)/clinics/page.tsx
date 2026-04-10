import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import ClinicsTable from "./ClinicsTable";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type Props = {
  searchParams: { page?: string };
};

export default async function AdminClinicsPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: clinics, count } = await supabaseAdmin
    .from("clinics")
    .select("id, name, city, rating, is_active, is_verified, is_claimed", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Клиники</h1>
        <Link
          href="/admin/clinics/new"
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-700"
        >
          + Добавить
        </Link>
      </div>
      <div className="mt-4 text-sm text-slate-500">{count ?? 0} клиник</div>

      <ClinicsTable clinics={clinics ?? []} />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/clinics${p > 1 ? `?page=${p}` : ""}`}
              className={
                "h-8 min-w-8 px-2 rounded text-sm flex items-center justify-center " +
                (p === page
                  ? "bg-primary text-white"
                  : "border border-slate-200 text-slate-700 hover:border-primary")
              }
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
