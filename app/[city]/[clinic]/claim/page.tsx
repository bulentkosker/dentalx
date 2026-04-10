"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function ClaimPage() {
  const params = useParams<{ city: string; clinic: string }>();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const docInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: File[]): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Файл "${file.name}" превышает 10 МБ`);
      }
      const path = `${params.city}/${params.clinic}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from("claim-documents")
        .upload(path, file);
      if (error) {
        throw new Error(`Ошибка загрузки "${file.name}": ${error.message}`);
      }
      if (data) urls.push(data.path);
    }
    return urls;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);

    if (documents.length === 0) {
      setError("Прикрепите хотя бы один документ");
      return;
    }
    if (documents.length > MAX_FILES) {
      setError(`Максимум ${MAX_FILES} документов`);
      return;
    }
    if (photos.length > MAX_FILES) {
      setError(`Максимум ${MAX_FILES} фотографий`);
      return;
    }

    setLoading(true);

    try {
      // Upload files to Storage
      const docUrls = await uploadFiles(documents);
      const photoUrls = photos.length > 0 ? await uploadFiles(photos) : [];

      // Look up clinic_id
      const { data: clinic, error: lookupError } = await supabase
        .from("clinics")
        .select("id")
        .eq("slug", params.clinic)
        .eq("city_slug", params.city)
        .maybeSingle();

      if (lookupError) {
        console.error("Clinic lookup failed:", lookupError.message);
      }

      const { error: insertError } = await supabase.from("claim_requests").insert({
        clinic_id: clinic?.id ?? null,
        contact_name: fd.get("name") as string,
        contact_phone: (fd.get("phone") as string) || null,
        contact_email: fd.get("email") as string,
        document_urls: docUrls,
        photo_urls: photoUrls,
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

        {/* Documents upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Документы <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Учредительные документы, лицензия, доверенность. PDF или изображение, макс. 5 файлов, до 10 МБ каждый.
          </p>
          <input
            ref={docInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(e) => {
              setDocuments(prev => [...prev, ...Array.from(e.target.files || [])]);
              if (docInputRef.current) docInputRef.current.value = "";
            }}
            className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary file:font-medium file:cursor-pointer hover:file:bg-primary-100"
          />
          {documents.length > 0 && (
            <div className="mt-2 space-y-1">
              {documents.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                  <span>{f.name} ({(f.size / 1024).toFixed(0)} KB)</span>
                  <button type="button" onClick={() => setDocuments(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Photos upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Фотографии клиники
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Фото клиники, вывески, рабочего места. Макс. 5 файлов.
          </p>
          <input
            ref={photoInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp"
            onChange={(e) => {
              setPhotos(prev => [...prev, ...Array.from(e.target.files || [])]);
              if (photoInputRef.current) photoInputRef.current.value = "";
            }}
            className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-medium file:cursor-pointer hover:file:bg-slate-200"
          />
          {photos.length > 0 && (
            <div className="mt-2 space-y-1">
              {photos.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                  <span>{f.name} ({(f.size / 1024).toFixed(0)} KB)</span>
                  <button type="button" onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">×</button>
                </div>
              ))}
            </div>
          )}
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
