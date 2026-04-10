-- Migration: add file upload support to claim_requests
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Add columns for file URLs
alter table claim_requests add column if not exists document_urls text[];
alter table claim_requests add column if not exists photo_urls text[];

-- 2. Create private storage bucket
insert into storage.buckets (id, name, public)
values ('claim-documents', 'claim-documents', false)
on conflict (id) do nothing;

-- 3. Storage RLS: anon users can upload but not read
create policy "anon can upload claim docs"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'claim-documents');
