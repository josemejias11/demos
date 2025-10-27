/**
 * Test data for planatechnologies.com tests
 * Site-specific test data and fixtures
 */

// Contact form test data
export const contactFormData = {
  validEmail: 'test@example.com',
  invalidEmail: 'invalid-email',
  name: 'John Doe',
  website: 'https://example.com',
  message: 'Test inquiry message for Plan A Technologies',
};

// Expected site content
export const expectedContent = {
  statistics: {
    deployments: '400+',
    referrals: '75+',
    clients: '200+',
    awards: '30+',
  },
  serviceModels: [
    'Project-based',
    'Dedicated Talent',
    'Consulting',
  ],
};

// Page URLs
export const pageUrls = {
  home: 'https://planatechnologies.com',
  about: /about/i,
  careers: /career/i,
  blog: /blog|news/i,
  contact: /contact/i,
};
