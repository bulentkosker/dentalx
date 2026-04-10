"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { approveClaim, rejectClaim, getSignedUrl } from "./actions";

type Claim = {
  id: string;
  clinic_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  document_urls: string[] | null;
  photo_urls: string[] | null;
  created_at: string;
};

export default function ClaimsTable({ claims }: { claims: Claim[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleApprove(claim: Claim) {
    setError(null);
    try {
      await approveClaim(claim.id, claim.clinic_id);
      router.refresh();
    } catch (e) {
      const msg = (e as Error).message;
      console.error("Approve failed:", msg);
      setError(msg);
    }
  }

  async function handleReject(claimId: string) {
    setError(null);
    try {
      await rejectClaim(claimId);
      router.refresh();
    } catch (e) {
      const msg = (e as Error).message;
      console.error("Reject failed:", msg);
      setError(msg);
    }
  }

  async function handleOpenFile(path: string) {
    const url = await getSignedUrl(path);
    if (url) {
      window.open(url, "_blank");
    } else {
      setError("Не удалось получить ссылку на файл");
    }
  }

  return (
    <div>
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 text-sm">
          {error}
        </div>
      )}
      <div className="mt-4 bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-3 font-medium">Дата</th>
              <th className="px-4 py-3 font-medium">Clinic ID</th>
              <th className="px-4 py-3 font-medium">Имя</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Телефон</th>
              <th className="px-4 py-3 font-medium">Файлы</th>
              <th className="px-4 py-3 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {new Date(c.created_at).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600 max-w-[140px] truncate">
                  {c.clinic_id ?? <span className="text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3 text-slate-900">{c.contact_name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{c.contact_email ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{c.contact_phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <FileLinks
                    label="Док"
                    paths={c.document_urls}
                    onOpen={handleOpenFile}
                  />
                  <FileLinks
                    label="Фото"
                    paths={c.photo_urls}
                    onOpen={handleOpenFile}
                  />
                </td>
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
    </div>
  );
}

function FileLinks({
  label,
  paths,
  onOpen,
}: {
  label: string;
  paths: string[] | null;
  onOpen: (path: string) => void;
}) {
  if (!paths || paths.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mb-0.5">
      {paths.map((p, i) => (
        <button
          key={p}
          onClick={() => onOpen(p)}
          className="text-primary hover:underline text-xs"
          title={p.split("/").pop()}
        >
          {label} {i + 1}
        </button>
      ))}
    </div>
  );
}
