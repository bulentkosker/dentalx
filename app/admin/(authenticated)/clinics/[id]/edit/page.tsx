"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getClinic, updateClinic } from "../../actions";

export default function EditClinicPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [clinic, setClinic] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getClinic(params.id).then(setClinic);
  }, [params.id]);

  if (!clinic) {
    return <div className="text-slate-400">Загрузка...</div>;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await updateClinic(params.id, fd);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/admin/clinics");
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-slate-900">Редактировать клинику</h1>
      <p className="text-sm text-slate-500 mt-1 font-mono">{params.id}</p>
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 bg-white rounded-xl border border-slate-200 p-6">
        <Field label="Название" name="name" required defaultValue={String(clinic.name ?? "")} />
        <Field label="Slug" name="slug" required defaultValue={String(clinic.slug ?? "")} />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Город</label>
          <select
            name="city_slug"
            defaultValue={String(clinic.city_slug ?? "almaty")}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary"
          >
            <option value="almaty">Алматы</option>
            <option value="astana">Астана</option>
          </select>
        </div>
        <Field label="Адрес" name="address" defaultValue={String(clinic.address ?? "")} />
        <Field label="Телефон" name="phone" defaultValue={String(clinic.phone ?? "")} />
        <Field label="Сайт" name="website" defaultValue={String(clinic.website ?? "")} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Широта" name="lat" type="number" step="any" defaultValue={clinic.lat != null ? String(clinic.lat) : ""} />
          <Field label="Долгота" name="lon" type="number" step="any" defaultValue={clinic.lon != null ? String(clinic.lon) : ""} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Рейтинг" name="rating" type="number" step="0.1" defaultValue={clinic.rating != null ? String(clinic.rating) : ""} />
          <Field label="Кол-во отзывов" name="reviews_count" type="number" defaultValue={clinic.reviews_count != null ? String(clinic.reviews_count) : ""} />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="is_active" defaultChecked={!!clinic.is_active} className="rounded" />
          Активна
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? "Сохранение..." : "Сохранить"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label, name, required, type = "text", step, defaultValue = "",
}: {
  label: string; name: string; required?: boolean; type?: string; step?: string; defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        type={type}
        step={step}
        required={required}
        defaultValue={defaultValue}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary"
      />
    </div>
  );
}
