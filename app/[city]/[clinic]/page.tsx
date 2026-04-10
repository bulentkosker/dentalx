import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const revalidate = 300;

const CITIES: Record<string, string> = {
  almaty: "Алматы",
  astana: "Астана",
};

type Props = { params: { city: string; clinic: string } };

export default async function ClinicPage({ params }: Props) {
  const cityName = CITIES[params.city];
  if (!cityName) notFound();

  const { data: clinic } = await supabase
    .from("clinics")
    .select("*")
    .eq("city_slug", params.city)
    .eq("slug", params.clinic)
    .eq("is_active", true)
    .maybeSingle();

  if (!clinic) notFound();

  const hours = renderHours(clinic.working_hours);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="text-sm text-slate-500">
        <Link href="/" className="hover:text-primary">Главная</Link>
        <span className="mx-2">/</span>
        <Link href={`/${params.city}`} className="hover:text-primary">{cityName}</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{clinic.name}</span>
      </div>

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold text-slate-900">{clinic.name}</h1>
              {clinic.is_verified && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary">
                  Проверено
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-4 text-slate-600">
              <div className="flex items-center gap-1">
                <span className="text-lg font-semibold text-slate-900">
                  {clinic.rating ? Number(clinic.rating).toFixed(1) : "—"}
                </span>
                <span className="text-sm">
                  ({(clinic.reviews_count ?? 0).toLocaleString("ru-RU")} отзывов)
                </span>
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/9] flex items-center justify-center">
            <div className="text-slate-400 text-sm">Карта</div>
            {clinic.lat && clinic.lon && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${clinic.lat},${clinic.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-primary hover:border-primary"
              >
                Открыть в картах
              </a>
            )}
          </div>

          {/* Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <InfoRow label="Адрес" value={clinic.address} />
            <InfoRow label="Телефон" value={clinic.phone} />
            <InfoRow
              label="Сайт"
              value={
                clinic.website ? (
                  <a href={clinic.website} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    {clinic.website}
                  </a>
                ) : null
              }
            />
            <InfoRow label="Часы работы" value={hours} />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {!clinic.is_claimed && (
            <div className="rounded-2xl border border-primary/30 bg-primary-50 p-5">
              <div className="font-semibold text-slate-900">
                Это ваша клиника?
              </div>
              <p className="mt-1 text-sm text-slate-700">
                Свяжитесь с нами, чтобы подтвердить право собственности и управлять профилем.
              </p>
              <a
                href="mailto:claim@dentalx.kz"
                className="mt-3 inline-flex items-center justify-center w-full px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-700"
              >
                Связаться с нами
              </a>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-sm text-slate-500">Город</div>
            <div className="font-medium text-slate-900">{cityName}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-32 shrink-0 text-sm text-slate-500">{label}</div>
      <div className="text-slate-900">{value || <span className="text-slate-400">—</span>}</div>
    </div>
  );
}

function renderHours(wh: unknown): React.ReactNode {
  if (!wh) return null;
  if (typeof wh === "object" && wh !== null) {
    const obj = wh as Record<string, string>;
    if (obj.type === "24/7") return "Круглосуточно";
    if (obj.raw) return obj.raw;
    const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const labels: Record<string, string> = {
      Mon: "Пн", Tue: "Вт", Wed: "Ср", Thu: "Чт", Fri: "Пт", Sat: "Сб", Sun: "Вс",
    };
    return (
      <ul className="space-y-0.5 text-sm">
        {order.filter((d) => obj[d]).map((d) => (
          <li key={d}><span className="inline-block w-8 text-slate-500">{labels[d]}</span> {obj[d]}</li>
        ))}
      </ul>
    );
  }
  return String(wh);
}
