import { readFileSync } from 'fs';
import path from 'path';
import { 
  insertHSCode, 
  insertFTARate, 
  insertPriceStats, 
  insertDemoScenario 
} from './sqlite';

export async function seedDatabase() {
  try {
    // Read mock data
    const mockDataPath = path.join(process.cwd(), 'data', 'mock-data.json');
    const mockDataContent = readFileSync(mockDataPath, 'utf-8');
    const mockData = JSON.parse(mockDataContent);

    console.log('🌱 Seeding database...');

    // Seed HS Codes
    console.log('📦 Inserting HS codes...');
    for (const hsCode of mockData.hsCodes) {
      insertHSCode(hsCode);
    }

    // Seed FTA Rates
    console.log('🤝 Inserting FTA rates...');
    for (const ftaRate of mockData.ftaRates) {
      insertFTARate(ftaRate);
    }

    // Seed Price Statistics
    console.log('💰 Inserting price statistics...');
    for (const priceStat of mockData.priceStats) {
      insertPriceStats(priceStat);
    }

    // Seed Demo Scenarios
    console.log('🎬 Inserting demo scenarios...');
    for (const scenario of mockData.demoScenarios) {
      insertDemoScenario(scenario);
    }

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase().catch(console.error);
}