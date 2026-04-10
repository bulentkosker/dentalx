import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const revalidate = 300;

async function getCityCounts() {
  const [almaty, astana] = await Promise.all([
    supabase
      .from("clinics")
      .select("*", { count: "exact", head: true })
      .eq("city_slug", "almaty")
      .eq("is_active", true),
    supabase
      .from("clinics")
      .select("*", { count: "exact", head: true })
      .eq("city_slug", "astana")
      .eq("is_active", true),
  ]);
  return {
    almaty: almaty.count ?? 0,
    astana: astana.count ?? 0,
  };
}

export default async function HomePage() {
  let counts = { almaty: 0, astana: 0 };
  try {
    counts = await getCityCounts();
  } catch {
    // DB not yet provisioned — show zero counts.
  }

  return (
    <div>
      <section className="bg-gradient-to-b from-primary-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 text-balance">
            Найдите лучшую стоматологию рядом
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            DentalX — каталог проверенных стоматологических клиник в Казахстане.
            Реальные отзывы, рейтинги и контакты.
          </p>

          <form action="/almaty" className="mt-8 max-w-xl mx-auto">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-2">
              <input
                type="text"
                name="q"
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
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-semibold text-slate-900 mb-8">Города</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <CityCard slug="almaty" name="Алматы" count={counts.almaty} />
          <CityCard slug="astana" name="Астана" count={counts.astana} />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="grid gap-6 sm:grid-cols-3">
          <Feature
            title="Проверенные клиники"
            text="Актуальная информация и верифицированные профили."
          />
          <Feature
            title="Реальные отзывы"
            text="Оценки и рейтинги от настоящих пациентов."
          />
          <Feature
            title="Удобный поиск"
            text="Фильтры по рейтингу, расписанию и услугам."
          />
        </div>
      </section>
    </div>
  );
}

function CityCard({ slug, name, count }: { slug: string; name: string; count: number }) {
  return (
    <Link
      href={`/${slug}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-6 hover:border-primary hover:shadow-lg transition"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold text-slate-900 group-hover:text-primary">
            {name}
          </div>
          <div className="mt-1 text-slate-500">
            {count.toLocaleString("ru-RU")} клиник
          </div>
        </div>
        <div className="h-12 w-12 rounded-xl bg-primary-50 text-primary flex items-center justify-center text-xl">
          →
        </div>
      </div>
    </Link>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-6 bg-white">
      <div className="h-10 w-10 rounded-lg bg-primary-50 text-primary flex items-center justify-center mb-3">
        ✓
      </div>
      <div className="font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-600">{text}</div>
    </div>
  );
}
