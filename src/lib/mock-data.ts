/**
 * Mock datasets for query execution simulation.
 * Contains 250+ records each for Users, Products, and Orders,
 * covering all schema field types: string, number, date, enum, boolean.
 */

export interface MockUserRecord {
  id: string;
  name: string;
  age: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  country: string;
  createdAt: string; // ISO date
  isVerified: boolean;
}

export interface MockProductRecord {
  sku: string;
  productName: string;
  category: 'electronics' | 'clothing' | 'food' | 'books' | 'home' | 'sports';
  price: number;
  stock: number;
  isAvailable: boolean;
  listedAt: string; // ISO date
}

export interface MockOrderRecord {
  orderId: string;
  customerName: string;
  total: number;
  orderStatus: 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'crypto';
  orderDate: string; // ISO date
  isPaid: boolean;
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

const STATUSES: MockUserRecord['status'][] = ['active', 'inactive', 'pending', 'suspended'];

const PRODUCT_TEMPLATES = {
  electronics: ['Wireless Headphones', 'Mechanical Keyboard', 'Ergonomic Mouse', '4K Monitor', 'Smart Watch', 'Bluetooth Speaker', 'USB-C Hub', 'Webcam Pro'],
  clothing: ['Cotton T-Shirt', 'Denim Jacket', 'Wool Sweater', 'Running Shoes', 'Leather Belt', 'Sports Socks', 'Winter Coat', 'Cargo Shorts'],
  food: ['Organic Coffee Beans', 'Dark Chocolate Bar', 'Matcha Green Tea', 'Whole Wheat Bread', 'Almond Butter Jar', 'Extra Virgin Olive Oil', 'Wildflower Honey', 'Granola Mix'],
  books: ['Science Fiction Novel', 'History of Art Study', 'Cooking Masterclass', 'Python Programming', 'Self-Improvement Guide', 'Classic Poetry Collection', 'Mystery Thriller', 'Biography of a Visionary'],
  home: ['Aromatic Candle Set', 'Ceramic Mug', 'LED Desk Lamp', 'Velvet Throw Pillow', 'HEPA Air Purifier', 'Woven Storage Basket', 'Essential Oil Diffuser', 'Silicon Spatula Set'],
  sports: ['Non-Slip Yoga Mat', 'Adjustable Dumbbell Set', 'Insulated Water Bottle', 'Tennis Racket', '2-Person Camping Tent', 'Bicycle Pump', 'Resistance Bands', 'Sport Backpack'],
};

const ORDER_STATUSES: MockOrderRecord['orderStatus'][] = ['placed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PAYMENT_METHODS: MockOrderRecord['paymentMethod'][] = ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto'];

// Seeded pseudo-random for reproducibility
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function generateMockUsers(count: number, rand: () => number): MockUserRecord[] {
  const records: MockUserRecord[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];

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

function generateMockProducts(count: number, rand: () => number): MockProductRecord[] {
  const records: MockProductRecord[] = [];
  const categories = Object.keys(PRODUCT_TEMPLATES) as MockProductRecord['category'][];

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(rand() * categories.length)];
    const templates = PRODUCT_TEMPLATES[category];
    const baseName = templates[Math.floor(rand() * templates.length)];
    const skuNum = 1000 + Math.floor(rand() * 9000);
    const sku = `${category.substring(0, 3).toUpperCase()}-${skuNum}`;

    const price = Math.round((5 + rand() * 495) * 100) / 100;
    const stock = Math.floor(rand() * 500);

    const year = 2021 + Math.floor(rand() * 5);
    const month = Math.floor(rand() * 12);
    const day = 1 + Math.floor(rand() * 28);
    const date = new Date(year, month, day);

    records.push({
      sku,
      productName: `${baseName} (V${Math.floor(rand() * 5) + 1})`,
      category,
      price,
      stock,
      isAvailable: stock > 0 && rand() > 0.1,
      listedAt: date.toISOString().split('T')[0],
    });
  }
  return records;
}

function generateMockOrders(count: number, rand: () => number): MockOrderRecord[] {
  const records: MockOrderRecord[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];

    const year = 2023 + Math.floor(rand() * 3);
    const month = Math.floor(rand() * 12);
    const day = 1 + Math.floor(rand() * 28);
    const date = new Date(year, month, day);

    const status = ORDER_STATUSES[Math.floor(rand() * ORDER_STATUSES.length)];

    records.push({
      orderId: `ORD-${String(i + 1001).padStart(5, '0')}`,
      customerName: `${firstName} ${lastName}`,
      total: Math.round((10 + rand() * 1490) * 100) / 100,
      orderStatus: status,
      paymentMethod: PAYMENT_METHODS[Math.floor(rand() * PAYMENT_METHODS.length)],
      orderDate: date.toISOString().split('T')[0],
      isPaid: status !== 'cancelled' && (status === 'delivered' || status === 'shipped' || rand() > 0.2),
    });
  }
  return records;
}

// Initialize seed random once
const rand = seededRandom(1337);

export const MOCK_USERS: MockUserRecord[] = generateMockUsers(250, rand);
export const MOCK_PRODUCTS: MockProductRecord[] = generateMockProducts(250, rand);
export const MOCK_ORDERS: MockOrderRecord[] = generateMockOrders(250, rand);

/** Map of datasets by schema ID */
export const MOCK_DATASETS: Record<string, any[]> = {
  users: MOCK_USERS,
  products: MOCK_PRODUCTS,
  orders: MOCK_ORDERS,
};

/** Keep MOCK_DATA as Users data for backwards compatibility */
export const MOCK_DATA = MOCK_USERS;
export type MockRecord = MockUserRecord;
