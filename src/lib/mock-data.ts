/**
 * Mock dataset for query execution simulation.
 * 200+ records covering all schema field types: string, number, date, enum, boolean.
 */

export interface MockRecord {
  id: string;
  name: string;
  age: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  country: string;
  createdAt: string; // ISO date
  isVerified: boolean;
}

const FIRST_NAMES = [
  'Adaeze', 'Chidi', 'Emeka', 'Fatima', 'Grace', 'Ife', 'James', 'Kemi',
  'Lekan', 'Musa', 'Ngozi', 'Olu', 'Priya', 'Ravi', 'Sade', 'Tunde',
  'Uche', 'Victor', 'Wale', 'Yemi', 'Zainab', 'Aisha', 'Bola', 'Chioma',
  'Damilola', 'Elodie', 'Femi', 'Gbemisola', 'Hassan', 'Ibrahim',
  'Juliet', 'Kalu', 'Lateef', 'Maryam', 'Nnamdi', 'Obinna', 'Patience',
  'Rasheed', 'Sophia', 'Tobi', 'Uzoma', 'Vivian', 'William', 'Xander',
  'Yusuf', 'Zara', 'Amara', 'Benjamin', 'Carlos', 'Diana',
];

const LAST_NAMES = [
  'Adeyemi', 'Bakare', 'Chukwu', 'Danladi', 'Eze', 'Fashola', 'Gbenga',
  'Hassan', 'Igwe', 'Johnson', 'Kalu', 'Lawal', 'Mohammed', 'Nwosu',
  'Obi', 'Peters', 'Quadri', 'Rasheed', 'Santos', 'Thompson',
  'Usman', 'Vega', 'Williams', 'Xavier', 'Yusuf', 'Zubair',
  'Adebayo', 'Chen', 'Fernandez', 'Garcia', 'Huang', 'Ivanov',
  'Kim', 'Lee', 'Müller', 'Nakamura', 'O\'Brien', 'Patel', 'Rodriguez',
  'Sharma', 'Tanaka', 'Volkov', 'Wang', 'Yamamoto', 'Zhang',
];

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt', 'India',
  'United States', 'United Kingdom', 'Canada', 'Brazil', 'Germany',
  'Japan', 'Australia', 'France', 'Mexico', 'China', 'Indonesia',
  'South Korea', 'Netherlands', 'Singapore',
];

const STATUSES: MockRecord['status'][] = ['active', 'inactive', 'pending', 'suspended'];

// Seeded pseudo-random for reproducibility
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function generateMockData(count: number): MockRecord[] {
  const rand = seededRandom(42);
  const records: MockRecord[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];

    // Generate date between 2020-01-01 and 2025-12-31
    const year = 2020 + Math.floor(rand() * 6);
    const month = Math.floor(rand() * 12);
    const day = 1 + Math.floor(rand() * 28);
    const date = new Date(year, month, day);

    records.push({
      id: `USR-${String(i + 1).padStart(4, '0')}`,
      name: `${firstName} ${lastName}`,
      age: 18 + Math.floor(rand() * 50),
      status: STATUSES[Math.floor(rand() * STATUSES.length)],
      country: COUNTRIES[Math.floor(rand() * COUNTRIES.length)],
      createdAt: date.toISOString().split('T')[0],
      isVerified: rand() > 0.35,
    });
  }

  return records;
}

export const MOCK_DATA: MockRecord[] = generateMockData(250);
