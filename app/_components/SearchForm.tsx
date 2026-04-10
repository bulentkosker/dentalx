"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchForm() {
  const router = useRouter();
  const [city, setCity] = useState("almaty");
  const [q, setQ] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    router.push(`/${city}${params}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-xl mx-auto">
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-2">
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="px-3 py-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:border-primary"
        >
          <option value="almaty">Алматы</option>
          <option value="astana">Астана</option>
        </select>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Название клиники, район, услуга..."
          className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-700 transition"
        >
          Найти
        </button>
      </div>
    </form>
  );
}
