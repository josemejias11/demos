export const testData = {
  // Search locations with expected results
  locations: {
    miami: {
      name: 'Miami',
      searchTerm: 'Miami',
      expectedHotels: ['Andaz Miami Beach', 'The St. Regis Bal Harbour Resort', 'W Miami'],
      minExpectedResults: 10
    },
    orlando: {
      name: 'Orlando',
      searchTerm: 'Orlando',
      expectedHotels: ['Margaritaville Resort Orlando', 'Hard Rock Hotel at Universal Orlando'],
      minExpectedResults: 15
    },
    lasVegas: {
      name: 'Las Vegas',
      searchTerm: 'Las Vegas',
      expectedHotels: ['Bellagio', 'MGM Grand', 'Caesars Palace'],
      minExpectedResults: 20
    }
  },

  // Test dates (using future dates to ensure availability)
  dates: {
    weekday: {
      checkin: '2025-02-15', // Saturday
      checkout: '2025-02-16'  // Sunday
    },
    weekend: {
      checkin: '2025-02-22', // Saturday
      checkout: '2025-02-23'  // Sunday
    },
    longStay: {
      checkin: '2025-03-01',
      checkout: '2025-03-03'
    }
  },

  // Product types and pricing expectations
  products: {
    dayPass: {
      type: 'Pool & Beach Day Pass',
      minPrice: 50,
      maxPrice: 150,
      amenities: ['Pool access', 'Beach access', 'Towels']
    },
    daybed: {
      type: 'Pool Daybed',
      minPrice: 100,
      maxPrice: 300,
      amenities: ['Pool access', 'Dedicated daybed', 'Poolside service']
    },
    premiumDaybed: {
      type: 'Premium Double Daybed',
      minPrice: 200,
      maxPrice: 500,
      amenities: ['Pool access', 'Premium location', 'Enhanced service']
    },
    spaPass: {
      type: 'Spa Pass',
      minPrice: 150,
      maxPrice: 400,
      amenities: ['Spa access', 'Pool access', 'Relaxation areas']
    }
  },

  // Guest configurations
  guests: {
    single: { adults: 1, children: 0, infants: 0 },
    couple: { adults: 2, children: 0, infants: 0 },
    family: { adults: 2, children: 2, infants: 1 },
    group: { adults: 4, children: 0, infants: 0 }
  },

  // User account test data
  testUser: {
    email: 'test.user@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1-555-123-4567'
  },

  // Expected UI elements and validation
  ui: {
    searchForm: {
      locationPlaceholder: 'Enter a location',
      datePickerFormat: 'MM/DD/YYYY',
      searchButtonText: 'Search'
    },
    hotelCard: {
      requiredElements: ['hotel name', 'rating', 'price', 'availability'],
      priceFormat: /^\$\d+/,
      ratingRange: { min: 0, max: 5 }
    },
    productCard: {
      requiredElements: ['product name', 'price', 'amenities', 'select button'],
      availabilityStates: ['Available', 'Only X Left', 'Sold Out']
    }
  },

  // API endpoints (if accessible for direct testing)
  api: {
    searchEndpoint: '/api/search',
    hotelsEndpoint: '/api/hotels',
    bookingEndpoint: '/api/booking',
    userEndpoint: '/api/user'
  }
};
