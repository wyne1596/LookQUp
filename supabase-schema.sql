-- ============================================================
-- LookQUp — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Items table
CREATE TABLE IF NOT EXISTS items (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token           UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT DEFAULT 'Other',
  type            TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  location        TEXT,
  date_reported   DATE DEFAULT CURRENT_DATE,
  image_url       TEXT,
  status          TEXT DEFAULT 'available' CHECK (status IN ('available', 'pending', 'claimed')),
  contact_name    TEXT,
  contact_email   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Claims table
CREATE TABLE IF NOT EXISTS claims (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id             UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  claimant_name       TEXT NOT NULL,
  claimant_contact    TEXT NOT NULL,
  proof_description   TEXT,
  proof_image_url     TEXT,
  status              TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS items_status_idx    ON items(status);
CREATE INDEX IF NOT EXISTS items_type_idx      ON items(type);
CREATE INDEX IF NOT EXISTS items_category_idx  ON items(category);
CREATE INDEX IF NOT EXISTS claims_item_id_idx  ON claims(item_id);

-- 4. Row Level Security — allow public read/write (no login system)
ALTER TABLE items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read items
CREATE POLICY "Public read items"  ON items  FOR SELECT USING (true);
-- Allow anyone to insert items
CREATE POLICY "Public insert items" ON items FOR INSERT WITH CHECK (true);
-- Allow update only via token match (enforced in app logic)
CREATE POLICY "Public update items" ON items FOR UPDATE USING (true);
-- Allow delete only via token match (enforced in app logic)
CREATE POLICY "Public delete items" ON items FOR DELETE USING (true);

-- Allow anyone to read/insert claims
CREATE POLICY "Public read claims"   ON claims FOR SELECT USING (true);
CREATE POLICY "Public insert claims" ON claims FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update claims" ON claims FOR UPDATE USING (true);

-- 5. Storage bucket for item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads and reads on the bucket
CREATE POLICY "Public image uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'item-images');

CREATE POLICY "Public image reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'item-images');

CREATE POLICY "Public image deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'item-images');

-- ============================================================
-- Done! Your database is ready.
-- ============================================================
