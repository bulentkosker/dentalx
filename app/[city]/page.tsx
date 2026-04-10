import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const revalidate = 300;

const CITIES: Record<string, string> = {
  almaty: "Алматы",
  astana: "Астана",
};

const PAGE_SIZE = 20;

type Props = {
  params: { city: string };
  searchParams: { page?: string; rating?: string; open?: string; q?: string };
};

export default async function CityPage({ params, searchParams }: Props) {
  const cityName = CITIES[params.city];
  if (!cityName) notFound();

  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const minRating = parseFloat(searchParams.rating || "0") || 0;
  const q = (searchParams.q || "").trim();

  let query = supabase
    .from("clinics")
    .select(
      "id, name, slug, city_slug, address, rating, reviews_count, working_hours, is_claimed, is_verified",
      { count: "exact" },
    )
    .eq("city_slug", params.city)
    .eq("is_active", true)
    .order("rating", { ascending: false, nullsFirst: false })
    .order("reviews_count", { ascending: false, nullsFirst: false });

  if (minRating > 0) query = query.gte("rating", minRating);
  if (q) query = query.ilike("name", `%${q}%`);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data: clinics, count, error } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <div className="text-sm text-slate-500">
            <Link href="/" className="hover:text-primary">Главная</Link>
            <span className="mx-2">/</span>
            <span>{cityName}</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Стоматологии в {cityName === "Алматы" ? "Алматы" : "Астане"}
          </h1>
          <p className="mt-1 text-slate-500">
            {(count ?? 0).toLocaleString("ru-RU")} клиник
          </p>
        </div>
      </div>

      {/* Filters */}
      <form className="mt-6 flex flex-wrap items-center gap-3 bg-white border border-slate-200 rounded-xl p-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Поиск по названию..."
          className="flex-1 min-w-[200px] px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-primary"
        />
        <select
          name="rating"
          defaultValue={String(minRating || "")}
          className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-slate-700"
        >
          <option value="">Любой рейтинг</option>
          <option value="4">4.0+</option>
          <option value="4.5">4.5+</option>
          <option value="4.8">4.8+</option>
        </select>
        <label className="inline-flex items-center gap-2 text-sm text-slate-600 px-2">
          <input
            type="checkbox"
            name="open"
            value="1"
            defaultChecked={searchParams.open === "1"}
            className="rounded border-slate-300 text-primary focus:ring-primary"
          />
          Открыто сейчас
        </label>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-700"
        >
          Применить
        </button>
      </form>

      {/* List */}
      <div className="mt-6 space-y-3">
        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            Не удалось загрузить клиники. Проверьте настройки Supabase.
          </div>
        )}
        {!error && clinics && clinics.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Клиники не найдены
          </div>
        )}
        {clinics?.map((c) => (
          <Link
            key={c.id}
            href={`/${params.city}/${c.slug}`}
            className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-primary hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-900 truncate">{c.name}</h3>
                  {c.is_verified && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary">
                      Проверено
                    </span>
                  )}
                  {c.is_claimed && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      Клиника подтверждена
                    </span>
                  )}
                </div>
                {c.address && (
                  <div className="mt-1 text-sm text-slate-500 truncate">{c.address}</div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-semibold text-slate-900">
                  {c.rating ? c.rating.toFixed(1) : "—"}
                </div>
                <div className="text-xs text-slate-500">
                  {(c.reviews_count ?? 0).toLocaleString("ru-RU")} отзывов
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => {
            const sp = new URLSearchParams();
            if (q) sp.set("q", q);
            if (minRating) sp.set("rating", String(minRating));
            if (searchParams.open === "1") sp.set("open", "1");
            if (p > 1) sp.set("page", String(p));
            const href = `/${params.city}${sp.toString() ? "?" + sp.toString() : ""}`;
            const isActive = p === page;
            return (
              <Link
                key={p}
                href={href}
                className={
                  "h-9 min-w-9 px-3 rounded-lg flex items-center justify-center text-sm " +
                  (isActive
                    ? "bg-primary text-white"
                    : "border border-slate-200 text-slate-700 hover:border-primary")
                }
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
