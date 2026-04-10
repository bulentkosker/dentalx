"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ClaimPage() {
  const params = useParams<{ city: string; clinic: string }>();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Look up clinic_id by slug + city_slug
      const { data: clinic, error: lookupError } = await supabase
        .from("clinics")
        .select("id")
        .eq("slug", params.clinic)
        .eq("city_slug", params.city)
        .maybeSingle();

      if (lookupError) {
        console.error("Clinic lookup failed:", lookupError.message);
      }

      const fd = new FormData(e.currentTarget);

      // Only send columns that exist in claim_requests table:
      // id (auto), clinic_id, user_id, contact_name, contact_phone, contact_email, status, created_at (auto)
      const { error: insertError } = await supabase.from("claim_requests").insert({
        clinic_id: clinic?.id ?? null,
        contact_name: fd.get("name") as string,
        contact_phone: (fd.get("phone") as string) || null,
        contact_email: fd.get("email") as string,
        status: "pending",
      });

      if (insertError) {
        console.error("Claim insert failed:", insertError.message);
        setError(insertError.message);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Неизвестная ошибка";
      console.error("handleSubmit error:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Спасибо!</h1>
        <p className="mt-2 text-slate-600">
          Ваша заявка на подтверждение клиники отправлена. Мы свяжемся с вами в ближайшее время.
        </p>
        <Link
          href={`/${params.city}/${params.clinic}`}
          className="mt-6 inline-block px-5 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-700"
        >
          Вернуться к клинике
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-primary">Главная</Link>
        <span className="mx-2">/</span>
        <Link href={`/${params.city}`} className="hover:text-primary">{params.city}</Link>
        <span className="mx-2">/</span>
        <Link href={`/${params.city}/${params.clinic}`} className="hover:text-primary">Клиника</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Подтверждение</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-900">Подтвердить право собственности</h1>
      <p className="mt-2 text-slate-600">
        Заполните форму, чтобы подтвердить, что вы являетесь представителем данной клиники.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Имя <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            required
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary"
            placeholder="Ваше имя"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Должность</label>
          <input
            name="position"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary"
            placeholder="Директор, управляющий..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Телефон</label>
          <input
            name="phone"
            type="tel"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary"
            placeholder="+7 (___) ___-__-__"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary"
            placeholder="email@clinic.kz"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? "Отправка..." : "Отправить заявку"}
        </button>
      </form>
    </div>
  );
}
