"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClinic } from "../actions";

export default function NewClinicPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await createClinic(fd);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/admin/clinics");
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-slate-900">Добавить клинику</h1>
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 bg-white rounded-xl border border-slate-200 p-6">
        <Field label="Название" name="name" required />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Город</label>
          <select
            name="city_slug"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary"
          >
            <option value="almaty">Алматы</option>
            <option value="astana">Астана</option>
          </select>
        </div>
        <Field label="Адрес" name="address" />
        <Field label="Телефон" name="phone" />
        <Field label="Сайт" name="website" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Широта (lat)" name="lat" type="number" step="any" />
          <Field label="Долгота (lon)" name="lon" type="number" step="any" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Рейтинг" name="rating" type="number" step="0.1" />
          <Field label="Кол-во отзывов" name="reviews_count" type="number" />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="is_active" defaultChecked className="rounded" />
          Активна
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? "Сохранение..." : "Создать"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label, name, required, type = "text", step,
}: {
  label: string; name: string; required?: boolean; type?: string; step?: string;
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
        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary"
      />
    </div>
  );
}
