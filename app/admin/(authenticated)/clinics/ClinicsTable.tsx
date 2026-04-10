"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleActive, toggleVerified, deleteClinic } from "./actions";

type ClinicRow = {
  id: string;
  name: string;
  city: string;
  rating: number | null;
  is_active: boolean;
  is_verified: boolean;
  is_claimed: boolean;
};

export default function ClinicsTable({ clinics }: { clinics: ClinicRow[] }) {
  const router = useRouter();

  async function handleToggle(id: string, field: "active" | "verified", current: boolean) {
    try {
      if (field === "active") await toggleActive(id, !current);
      else await toggleVerified(id, !current);
      router.refresh();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Удалить клинику "${name}"?`)) return;
    try {
      await deleteClinic(id);
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
            <th className="px-4 py-3 font-medium">ID</th>
            <th className="px-4 py-3 font-medium">Название</th>
            <th className="px-4 py-3 font-medium">Город</th>
            <th className="px-4 py-3 font-medium">Рейтинг</th>
            <th className="px-4 py-3 font-medium">Активна</th>
            <th className="px-4 py-3 font-medium">Верифиц.</th>
            <th className="px-4 py-3 font-medium">Claimed</th>
            <th className="px-4 py-3 font-medium">Действия</th>
          </tr>
        </thead>
        <tbody>
          {clinics.map((c) => (
            <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-4 py-3 font-mono text-xs text-slate-400 max-w-[100px] truncate">
                {c.id}
              </td>
              <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">
                {c.name}
              </td>
              <td className="px-4 py-3 text-slate-600">{c.city}</td>
              <td className="px-4 py-3 text-slate-600">
                {c.rating != null ? Number(c.rating).toFixed(1) : "—"}
              </td>
              <td className="px-4 py-3">
                <Toggle
                  value={c.is_active}
                  onChange={() => handleToggle(c.id, "active", c.is_active)}
                />
              </td>
              <td className="px-4 py-3">
                <Toggle
                  value={c.is_verified}
                  onChange={() => handleToggle(c.id, "verified", c.is_verified)}
                />
              </td>
              <td className="px-4 py-3">
                <span
                  className={
                    c.is_claimed
                      ? "text-emerald-600 font-medium"
                      : "text-slate-400"
                  }
                >
                  {c.is_claimed ? "Да" : "Нет"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/clinics/${c.id}/edit`}
                    className="text-primary hover:underline text-xs"
                  >
                    Ред.
                  </Link>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    className="text-red-500 hover:underline text-xs"
                  >
                    Удалить
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

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={
        "relative w-9 h-5 rounded-full transition " +
        (value ? "bg-primary" : "bg-slate-300")
      }
    >
      <span
        className={
          "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform " +
          (value ? "left-[18px]" : "left-0.5")
        }
      />
    </button>
  );
}
