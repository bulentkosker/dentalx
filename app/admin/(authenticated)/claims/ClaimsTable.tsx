"use client";

import { useRouter } from "next/navigation";
import { approveClaim, rejectClaim } from "./actions";

type Claim = {
  id: string;
  clinic_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
};

export default function ClaimsTable({ claims }: { claims: Claim[] }) {
  const router = useRouter();

  async function handleApprove(claim: Claim) {
    try {
      await approveClaim(claim.id, claim.clinic_id);
      router.refresh();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function handleReject(claimId: string) {
    try {
      await rejectClaim(claimId);
      router.refresh();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <div className="mt-4 bg-white rounded-xl border border-slate-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="px-4 py-3 font-medium">Дата</th>
            <th className="px-4 py-3 font-medium">Clinic ID</th>
            <th className="px-4 py-3 font-medium">Имя</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Телефон</th>
            <th className="px-4 py-3 font-medium">Действия</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((c) => (
            <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                {new Date(c.created_at).toLocaleDateString("ru-RU")}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-400 max-w-[120px] truncate">
                {c.clinic_id ?? "—"}
              </td>
              <td className="px-4 py-3 text-slate-900">{c.contact_name ?? "—"}</td>
              <td className="px-4 py-3 text-slate-600">{c.contact_email ?? "—"}</td>
              <td className="px-4 py-3 text-slate-600">{c.contact_phone ?? "—"}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(c)}
                    className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100"
                  >
                    Одобрить
                  </button>
                  <button
                    onClick={() => handleReject(c.id)}
                    className="px-3 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100"
                  >
                    Отклонить
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
