CREATE TABLE pos_raw_imports (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id              UUID          NOT NULL REFERENCES sales_import_batches(id) ON DELETE CASCADE,
  plu                   INTEGER,
  charakteristika_1     TEXT,
  charakteristika_2     TEXT,
  barcode               TEXT,
  nazov                 TEXT          NOT NULL,
  plu_type_number       INTEGER,
  plu_type_text         TEXT,
  group_number          INTEGER,
  group_name            TEXT,
  outlet_number         INTEGER,
  outlet_name           TEXT,
  quantity              NUMERIC(12,2) NOT NULL,
  uom                   TEXT,
  total_price_excl_vat  NUMERIC(12,2),
  total_price_incl_vat  NUMERIC(12,2),
  total_cogs            NUMERIC(12,2),
  original_price_incl_vat NUMERIC(12,2),
  total_discount        NUMERIC(12,2),
  optional_text_1       TEXT,
  optional_text_2       TEXT,
  optional_text_3       TEXT,
  raw_json              JSONB,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pos_raw_imports_batch ON pos_raw_imports(batch_id);
CREATE INDEX idx_pos_raw_imports_nazov ON pos_raw_imports(nazov);
