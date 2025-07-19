import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'demo.db');
const db = new Database(dbPath);

// Initialize database schema
export function initializeDatabase() {
  // HS Codes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS hscodes (
      code TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      description_en TEXT,
      base_tariff_rate TEXT,
      keywords TEXT,
      avg_price_usd REAL,
      price_std_dev REAL,
      common_origins TEXT
    )
  `);

  // FTA Rates table
  db.exec(`
    CREATE TABLE IF NOT EXISTS fta_rates (
      hscode TEXT,
      country TEXT,
      fta_rate TEXT,
      base_rate TEXT,
      requires_certificate INTEGER DEFAULT 0,
      certificate_type TEXT,
      PRIMARY KEY (hscode, country)
    )
  `);

  // Price Statistics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS price_stats (
      hscode TEXT PRIMARY KEY,
      avg_price REAL,
      std_dev REAL,
      min_price REAL,
      max_price REAL,
      sample_count INTEGER,
      last_updated TEXT
    )
  `);

  // Demo Scenarios table
  db.exec(`
    CREATE TABLE IF NOT EXISTS demo_scenarios (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      expected_outcome TEXT,
      input_data TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// HS Code operations
export function getHSCode(code: string) {
  const stmt = db.prepare('SELECT * FROM hscodes WHERE code = ?');
  return stmt.get(code);
}

export function searchHSCodes(keyword: string, limit: number = 10) {
  const stmt = db.prepare(`
    SELECT * FROM hscodes 
    WHERE description LIKE ? OR keywords LIKE ? 
    ORDER BY 
      CASE 
        WHEN description LIKE ? THEN 1
        WHEN keywords LIKE ? THEN 2
        ELSE 3
      END
    LIMIT ?
  `);
  const searchTerm = `%${keyword}%`;
  return stmt.all(searchTerm, searchTerm, `%${keyword}%`, `%${keyword}%`, limit);
}

export function getAllHSCodes(limit: number = 100) {
  const stmt = db.prepare('SELECT * FROM hscodes LIMIT ?');
  return stmt.all(limit);
}

// FTA operations
export function getFTARate(hscode: string, country: string) {
  const stmt = db.prepare('SELECT * FROM fta_rates WHERE hscode = ? AND country = ?');
  return stmt.get(hscode, country);
}

export function getFTARatesForHSCode(hscode: string) {
  const stmt = db.prepare('SELECT * FROM fta_rates WHERE hscode = ?');
  return stmt.all(hscode);
}

// Price statistics operations
export function getPriceStats(hscode: string) {
  const stmt = db.prepare('SELECT * FROM price_stats WHERE hscode = ?');
  return stmt.get(hscode);
}

// Demo scenarios operations
export function getDemoScenarios() {
  const stmt = db.prepare('SELECT * FROM demo_scenarios ORDER BY name');
  return stmt.all();
}

export function getDemoScenario(id: string) {
  const stmt = db.prepare('SELECT * FROM demo_scenarios WHERE id = ?');
  return stmt.get(id);
}

// Insert operations
export function insertHSCode(data: any) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO hscodes 
    (code, description, description_en, base_tariff_rate, keywords, avg_price_usd, price_std_dev, common_origins)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    data.code,
    data.description,
    data.description_en,
    data.base_tariff_rate,
    data.keywords,
    data.avg_price_usd,
    data.price_std_dev,
    data.common_origins
  );
}

export function insertFTARate(data: any) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO fta_rates 
    (hscode, country, fta_rate, base_rate, requires_certificate, certificate_type)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    data.hscode,
    data.country,
    data.fta_rate,
    data.base_rate,
    data.requires_certificate ? 1 : 0,
    data.certificate_type
  );
}

export function insertPriceStats(data: any) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO price_stats 
    (hscode, avg_price, std_dev, min_price, max_price, sample_count, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    data.hscode,
    data.avg_price,
    data.std_dev,
    data.min_price,
    data.max_price,
    data.sample_count,
    new Date().toISOString()
  );
}

export function insertDemoScenario(data: any) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO demo_scenarios 
    (id, name, description, expected_outcome, input_data)
    VALUES (?, ?, ?, ?, ?)
  `);
  return stmt.run(
    data.id,
    data.name,
    data.description,
    data.expected_outcome,
    JSON.stringify(data.input_data)
  );
}

// Initialize database on module load
initializeDatabase();