#!/usr/bin/env node
/**
 * Import dental_clinics_test.json into Supabase `clinics` table.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (anon key cannot bypass RLS
 * for inserts). Run:  node scripts/import-clinics.mjs
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Minimal .env.local loader (avoids adding dotenv as dep).
const envFile = path.join(rootDir, '.env.local');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '[warn] SUPABASE_SERVICE_ROLE_KEY not set — falling back to anon key. ' +
      'Inserts will fail unless RLS allows public writes.',
  );
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

// Cyrillic -> Latin transliteration (loose GOST-ish map).
const translitMap = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
  з: 'z', и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
  я: 'ya',
  // Kazakh
  ә: 'a', ғ: 'g', қ: 'q', ң: 'n', ө: 'o', ұ: 'u', ү: 'u', һ: 'h', і: 'i',
};

function slugify(input) {
  const lower = (input || '').toLowerCase();
  let out = '';
  for (const ch of lower) {
    if (translitMap[ch] !== undefined) out += translitMap[ch];
    else if (/[a-z0-9]/.test(ch)) out += ch;
    else out += '-';
  }
  return out
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'clinic';
}

function parseWorkingHours(wh) {
  if (!wh) return null;
  if (wh === '24/7') return { type: '24/7' };
  const days = {};
  for (const part of String(wh).split(/\s+/)) {
    const m = part.match(/^(\w+):(.+)$/);
    if (m) days[m[1]] = m[2];
  }
  return Object.keys(days).length ? days : { raw: wh };
}

async function main() {
  const jsonPath = path.join(rootDir, 'data', 'dental_clinics_test.json');
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${raw.length} clinics from ${jsonPath}`);

  // Deduplicate by id — keep first occurrence
  const seenIds = new Set();
  const deduped = raw.filter((c) => {
    if (seenIds.has(c.id)) return false;
    seenIds.add(c.id);
    return true;
  });
  console.log(`Deduplicated: ${deduped.length} unique clinics`);

  const usedSlugs = new Set();
  const rows = deduped.map((c) => {
    let slug = slugify(c.name);
    let candidate = slug;
    let i = 2;
    while (usedSlugs.has(candidate)) candidate = `${slug}-${i++}`;
    usedSlugs.add(candidate);

    const cityNorm = (c.city || '').toLowerCase();
    const city_slug = cityNorm.includes('astana') ? 'astana' : 'almaty';

    return {
      id: c.id,
      name: c.name,
      slug: candidate,
      city: c.city,
      city_slug,
      address: c.address ?? null,
      lat: c.lat ?? null,
      lon: c.lon ?? null,
      phone: c.phone ?? null,
      website: c.website ?? null,
      rating: c.rating ?? null,
      reviews_count: c.reviews_count ?? null,
      working_hours: parseWorkingHours(c.working_hours),
      photos: [],
      services: [],
      source: '2gis',
      raw_data: c,
    };
  });

  const batchSize = 100;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from('clinics').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Batch ${i / batchSize + 1} failed:`, error.message);
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`  upserted ${inserted}/${rows.length}`);
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
