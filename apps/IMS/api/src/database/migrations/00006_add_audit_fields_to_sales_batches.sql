ALTER TABLE sales_import_batches
  ADD COLUMN file_url              TEXT,
  ADD COLUMN uploaded_by           UUID REFERENCES users(id),
  ADD COLUMN original_file_name    TEXT,
  ADD COLUMN total_rows            INTEGER,
  ADD COLUMN imported_rows         INTEGER;
