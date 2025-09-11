import { faker } from '@faker-js/faker';

export interface UserPersona {
  type: 'new_user' | 'existing_customer' | 'premium_user';
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
}

export const testUsers: Record<string, UserPersona> = {
  newUser: {
    type: 'new_user',
    email: faker.internet.email(),
    password: 'TestPass123!',
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    dateOfBirth: '01/15/1985',
    ssn: '123-45-6789', // Test SSN
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zipCode: faker.location.zipCode(),
    },
    phone: faker.phone.number(),
  },
  existingCustomer: {
    type: 'existing_customer',
    email: 'existing@example.com',
    password: 'ExistingPass123!',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '06/20/1980',
    ssn: '987-65-4321',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '90210',
    },
    phone: '(555) 123-4567',
  },
  premiumUser: {
    type: 'premium_user',
    email: 'premium@example.com',
    password: 'PremiumPass123!',
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '03/10/1975',
    ssn: '456-78-9012',
    address: {
      street: '456 Oak Ave',
      city: 'Premium City',
      state: 'NY',
      zipCode: '10001',
    },
    phone: '(555) 987-6543',
  },
};

export const creditScoreData = {
  excellent: { min: 800, max: 850, color: 'green' },
  veryGood: { min: 740, max: 799, color: 'blue' },
  good: { min: 670, max: 739, color: 'yellow' },
  fair: { min: 580, max: 669, color: 'orange' },
  poor: { min: 300, max: 579, color: 'red' },
};

export const productData = {
  creditCards: [
    {
      name: 'Experian Smart Money™ Digital Checking Account & Debit Card',
      type: 'checking',
      benefits: ['Build credit history', 'No monthly fees', 'Fraud protection'],
    },
    {
      name: 'Capital One Venture Rewards',
      type: 'travel',
      benefits: ['2x miles on all purchases', 'No foreign transaction fees'],
    },
  ],
  loans: [
    {
      type: 'personal',
      rates: '6.99% - 35.99% APR',
      amounts: '$1,000 - $50,000',
    },
    {
      type: 'auto',
      rates: '3.99% - 18.99% APR',
      amounts: '$5,000 - $100,000',
    },
  ],
};

export const securityQuestions = [
  "What was the name of your first pet?",
  "In what city were you born?",
  "What was your mother's maiden name?",
  "What was the name of your elementary school?",
  "What was the make of your first car?",
];

export const testData = {
  users: testUsers,
  creditScore: creditScoreData,
  products: productData,
  security: securityQuestions,
};
