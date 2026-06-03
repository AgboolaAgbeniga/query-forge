import { Schema } from './types';

export interface DataSource {
  id: string;
  name: string;
  description: string;
  schema: Schema;
}

const usersSchema: Schema = {
  id: {
    name: 'id',
    label: 'User ID',
    type: 'string',
  },
  name: {
    name: 'name',
    label: 'Full Name',
    type: 'string',
  },
  age: {
    name: 'age',
    label: 'Age',
    type: 'number',
  },
  status: {
    name: 'status',
    label: 'Account Status',
    type: 'enum',
    options: ['active', 'inactive', 'pending', 'suspended'],
  },
  country: {
    name: 'country',
    label: 'Country',
    type: 'string',
  },
  createdAt: {
    name: 'createdAt',
    label: 'Created At',
    type: 'date',
  },
  isVerified: {
    name: 'isVerified',
    label: 'Is Verified',
    type: 'boolean',
  },
};

const productsSchema: Schema = {
  sku: {
    name: 'sku',
    label: 'SKU',
    type: 'string',
  },
  productName: {
    name: 'productName',
    label: 'Product Name',
    type: 'string',
  },
  category: {
    name: 'category',
    label: 'Category',
    type: 'enum',
    options: ['electronics', 'clothing', 'food', 'books', 'home', 'sports'],
  },
  price: {
    name: 'price',
    label: 'Price ($)',
    type: 'number',
  },
  stock: {
    name: 'stock',
    label: 'Stock Quantity',
    type: 'number',
  },
  isAvailable: {
    name: 'isAvailable',
    label: 'Available',
    type: 'boolean',
  },
  listedAt: {
    name: 'listedAt',
    label: 'Listed At',
    type: 'date',
  },
};

const ordersSchema: Schema = {
  orderId: {
    name: 'orderId',
    label: 'Order ID',
    type: 'string',
  },
  customerName: {
    name: 'customerName',
    label: 'Customer Name',
    type: 'string',
  },
  total: {
    name: 'total',
    label: 'Total ($)',
    type: 'number',
  },
  orderStatus: {
    name: 'orderStatus',
    label: 'Order Status',
    type: 'enum',
    options: ['placed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
  },
  paymentMethod: {
    name: 'paymentMethod',
    label: 'Payment Method',
    type: 'enum',
    options: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto'],
  },
  orderDate: {
    name: 'orderDate',
    label: 'Order Date',
    type: 'date',
  },
  isPaid: {
    name: 'isPaid',
    label: 'Is Paid',
    type: 'boolean',
  },
};

export const DATA_SOURCES: DataSource[] = [
  {
    id: 'users',
    name: 'Users',
    description: 'User accounts database',
    schema: usersSchema,
  },
  {
    id: 'products',
    name: 'Products',
    description: 'Product catalog',
    schema: productsSchema,
  },
  {
    id: 'orders',
    name: 'Orders',
    description: 'Order transactions',
    schema: ordersSchema,
  },
];

/** Default schema (Users). Kept for backward compatibility. */
export const mockSchema = usersSchema;

/** Get schema by data source ID */
export function getSchemaById(id: string): Schema {
  const source = DATA_SOURCES.find((s) => s.id === id);
  return source?.schema ?? usersSchema;
}
