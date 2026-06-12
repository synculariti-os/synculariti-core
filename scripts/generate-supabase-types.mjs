import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');
const outputPath = join(__dirname, '..', 'packages', 'shared-supabase', 'src', 'types.ts');

// Read unified migrations only (exclude old ims/et schema files).
// Process in reverse so the earliest definition (fullest columns) wins.
const migrationFiles = readdirSync(migrationsDir).filter(f => f.endsWith('.sql') && (f.startsWith('20260611') || f.startsWith('20260612'))).sort().reverse();
let sql = '';
for (const file of migrationFiles) {
  sql += readFileSync(join(migrationsDir, file), 'utf-8') + '\n';
}

const PG_TO_TS = {
  uuid: 'string',
  text: 'string',
  varchar: 'string',
  boolean: 'boolean',
  integer: 'number',
  smallint: 'number',
  bigint: 'number',
  numeric: 'number',
  real: 'number',
  double: 'number',
  double_precision: 'number',
  decimal: 'number',
  jsonb: 'any',
  json: 'any',
  timestamp: 'string',
  timestamptz: 'string',
  date: 'string',
  time: 'string',
  oid: 'number',
  bytea: 'string',
  inet: 'string',
};

function pgTypeToTs(pgType) {
  const t = pgType.replace('[]', '').trim().toLowerCase();
  if (PG_TO_TS[t]) return PG_TO_TS[t];
  if (t.endsWith('_id')) return 'string';
  return 'string';
}

function isArrayType(pgType) {
  return pgType.includes('[]');
}

function parseForeignKey(createBlock) {
  const refs = [];
  // createBlock is the content between the outer parens of CREATE TABLE
  // Split into individual column definition lines
  const lines = createBlock.split('\n').map(l => l.trim()).filter(l => l);
  for (const line of lines) {
    // Skip constraint/primary key/index lines
    if (/^(CONSTRAINT|PRIMARY|UNIQUE|INDEX|CHECK|EXCLUDE|FOREIGN|UNIQUE)\b/i.test(line)) continue;
    // Extract inline REFERENCES: first_word type ... REFERENCES schema.table(column)
    const refMatch = line.match(/^(\w+)\s+.+?\bREFERENCES\s+(?:public\.)?(\w+)\s*\((\w+)\)/i);
    if (refMatch) {
      refs.push({ column: refMatch[1], foreignTable: refMatch[2], foreignColumn: refMatch[3] });
    }
  }
  return refs;
}

function parseColumnType(colDef) {
  const trimmed = colDef.trim();
  const match = trimmed.match(/^(\w+(?:\s*\[\])?)/);
  if (!match) return 'string';
  const base = match[1];
  const ts = pgTypeToTs(base);
  return isArrayType(base) ? `${ts}[]` : ts;
}

function parseNotNull(colDef) {
  return /\bNOT\s+NULL\b/i.test(colDef);
}

function parseColumns(createBlock) {
  const lines = createBlock.split('\n');
  const cols = [];
  const seen = new Set();
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('--') || trimmed.startsWith('CREATE') || trimmed.startsWith(')') || trimmed.startsWith(';') || trimmed.startsWith('PRIMARY') || trimmed.startsWith('FOREIGN') || trimmed.startsWith('UNIQUE') || trimmed.startsWith('INDEX') || trimmed.startsWith('CHECK') || trimmed.startsWith('REFERENCES') || trimmed.startsWith('CONSTRAINT') || trimmed.startsWith('ALTER') || trimmed.startsWith('GRANT') || trimmed.startsWith('--')) continue;
    if (trimmed.startsWith('INHERITS')) continue;
    const colMatch = trimmed.match(/^"?(\w+)"?\s+(.+?)(,?\s*)$/);
    if (!colMatch) continue;
    const [, name, rest] = colMatch;
    if (seen.has(name)) continue; // skip duplicates from overlapping migrations
    seen.add(name);
    const nullable = !parseNotNull(rest);
    cols.push({ name, type: parseColumnType(rest), nullable });
  }
  return cols;
}

const tableMap = new Map();
const viewMap = new Map();

// Parse CREATE TABLE IF NOT EXISTS statements (last definition wins)
const tableRegex = /CREATE TABLE IF NOT EXISTS public\.(\w+)\s*\(([\s\S]*?)\);/gi;
let match;
while ((match = tableRegex.exec(sql)) !== null) {
  tableMap.set(match[1], match[2]);
}

// Parse ALTER TABLE ADD COLUMN statements to augment existing table definitions
const alterRegex = /ALTER TABLE (?:IF EXISTS )?public\.(\w+)\s+ADD COLUMN (?:IF NOT EXISTS )?"?(\w+)"?\s+([^,;]+)/gi;
while ((match = alterRegex.exec(sql)) !== null) {
  const tableName = match[1];
  const colName = match[2];
  const colDef = match[3].trim();
  if (tableMap.has(tableName)) {
    tableMap.set(tableName, tableMap.get(tableName) + `\n  ${colName} ${colDef},`);
  }
}

// Build reverse mapping: sourceTable → viewNames (for FK relationships)
const viewSourceMap = new Map();

// Parse CREATE OR REPLACE VIEW statements
const viewRegex = /CREATE OR REPLACE VIEW public\.(\w+)\s+AS\s+(SELECT\s+)(.+?)\s+FROM\s+public\.(\w+)/gis;
while ((match = viewRegex.exec(sql)) !== null) {
  const viewName = match[1];
  const selectClause = match[3].trim();
  const sourceTable = match[4];

  // Track view-to-source-table mapping for FK relationship aliases
  if (!viewSourceMap.has(sourceTable)) viewSourceMap.set(sourceTable, []);
  viewSourceMap.get(sourceTable).push(viewName);

  // If SELECT *, inherit source table columns
  if (selectClause === '*' && tableMap.has(sourceTable)) {
    viewMap.set(viewName, tableMap.get(sourceTable));
  }
}

const tableBlocks = Array.from(tableMap.entries()).map(([name, createBlock]) => ({ name, createBlock }));
const viewBlocks = Array.from(viewMap.entries()).map(([name, createBlock]) => ({ name, createBlock }));

// Merge views into tables so supabase.from() works with both
for (const v of viewBlocks) {
  if (!tableMap.has(v.name)) {
    tableBlocks.push(v);
  }
}

let output = `// Auto-generated from migration SQL - do not edit directly
// Run: node scripts/generate-supabase-types.mjs

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
`;

for (const { name, createBlock } of tableBlocks) {
  const cols = parseColumns(createBlock);
  const rowProps = cols.map(c => {
    const optional = c.nullable ? ' | null' : '';
    return `          ${c.name}: ${c.type}${optional}`;
  }).join('\n');
  const insertProps = cols.map(c => {
    return `          ${c.name}?: ${c.type} | null`;
  }).join('\n');
  const updateProps = cols.map(c => {
    return `          ${c.name}?: ${c.type} | null`;
  }).join('\n');

  const foreignKeys = parseForeignKey(createBlock);
  const relEntries = [];
  for (const fk of foreignKeys) {
    // Primary FK entry
    relEntries.push({
      foreignKeyName: `${name}_${fk.column}_fkey`,
      columns: [fk.column],
      isOneToOne: false,
      referencedRelation: fk.foreignTable,
      referencedColumns: [fk.foreignColumn]
    });
    // If the referenced table has views (backward-compat aliases), add entries for them too
    const viewNames = viewSourceMap.get(fk.foreignTable) || [];
    for (const vn of viewNames) {
      relEntries.push({
        foreignKeyName: `${name}_${fk.column}_fkey__${vn}`,
        columns: [fk.column],
        isOneToOne: false,
        referencedRelation: vn,
        referencedColumns: [fk.foreignColumn]
      });
    }
  }
  const relProps = relEntries.map(rel => {
    return `          {
            foreignKeyName: "${rel.foreignKeyName}",
            columns: ${JSON.stringify(rel.columns)},
            isOneToOne: ${rel.isOneToOne},
            referencedRelation: "${rel.referencedRelation}",
            referencedColumns: ${JSON.stringify(rel.referencedColumns)}
          }`;
  }).join(',\n');

  output += `      ${name}: {
        Row: {\n${rowProps}\n        }
        Insert: {\n${insertProps}\n        }
        Update: {\n${updateProps}\n        }
        Relationships: [\n${relProps}\n        ]
      }
`;
}

output += `    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
export type CompositeTypes<T extends keyof Database['public']['CompositeTypes']> = Database['public']['CompositeTypes'][T];
`;

writeFileSync(outputPath, output, 'utf-8');
console.log(`Generated types at ${outputPath}`);
console.log(`Total tables: ${tableBlocks.length}`);
