import { Schema } from './types';

export const mockSchema: Schema = {
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
