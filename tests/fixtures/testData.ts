export const testData = {
  contactForm: {
    valid: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@testcompany.com',
      country: 'USA',
      companyName: 'Test Company Inc.',
      jobTitle: 'QA Engineer',
      phone: '+1234567890',
      businessNeeds: 'We are interested in AI-powered solutions for our enterprise. Please provide more information about your services and pricing.'
    },
    aiInquiry: {
      firstName: 'Jane',
      lastName: 'Smith', 
      email: 'jane.smith@company.com',
      country: 'USA',
      companyName: 'Tech Innovations LLC',
      jobTitle: 'CTO',
      businessNeeds: 'We are interested in your AI-powered solutions for manufacturing optimization. Please provide more details about implementation timeline and costs.'
    },
    partnership: {
      firstName: 'David',
      lastName: 'Johnson',
      email: 'david.johnson@partner.com',
      country: 'CANADA',
      companyName: 'Strategic Partners Ltd.',
      jobTitle: 'Business Development Director',
      businessNeeds: 'We would like to explore partnership opportunities with FPT Software for joint solutions in the North American market.'
    },
    career: {
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@email.com',
      country: 'SPAIN', 
      companyName: 'Freelancer',
      jobTitle: 'Software Developer',
      businessNeeds: 'I am interested in career opportunities at FPT Software, particularly in AI and machine learning roles.'
    },
    invalid: {
      email: 'invalid-email',
      firstName: '',
      lastName: '',
      companyName: '',
      businessNeeds: ''
    }
  },
  
  industries: [
    {
      name: 'Aviation',
      description: 'With over a decade of experience with 100+ aviation leaders',
      keywords: ['aviation', 'aerospace', 'flight', 'aircraft']
    },
    {
      name: 'Automotive', 
      description: 'We deliver services to automakers, Tier-1 suppliers',
      keywords: ['automotive', 'cars', 'manufacturing', 'tier-1']
    },
    {
      name: 'Banking & Financial Services',
      description: 'For 20+ years, we help financial institutions modernize',
      keywords: ['banking', 'financial', 'fintech', 'modernize']
    },
    {
      name: 'Healthcare',
      description: 'For 20+ years, we offer tailored solutions to streamline',
      keywords: ['healthcare', 'medical', 'patient care', 'digital health']
    },
    {
      name: 'Manufacturing',
      description: 'With 150+ manufacturing clients',
      keywords: ['manufacturing', 'smart factory', 'IoT', 'automation']
    },
    {
      name: 'Retail',
      description: 'We support 100+ retail clients',
      keywords: ['retail', 'omnichannel', 'e-commerce', 'customer experience']
    }
  ],

  services: [
    {
      name: 'Artificial Intelligence',
      trending: true,
      description: 'We develop AI solutions to optimize operations',
      keywords: ['AI', 'machine learning', 'optimization', 'NVIDIA', 'LandingAI']
    },
    {
      name: 'Cloud',
      trending: true,
      description: 'Cloud transformation and modernization',
      keywords: ['cloud', 'AWS', 'Azure', 'migration', 'scalability']
    },
    {
      name: 'Data & Analytics',
      trending: false,
      description: 'Data-driven insights and analytics',
      keywords: ['data', 'analytics', 'insights', 'big data', 'visualization']
    },
    {
      name: 'IoT',
      trending: false,
      description: 'Internet of Things solutions',
      keywords: ['IoT', 'sensors', 'connectivity', 'smart devices']
    },
    {
      name: 'Cybersecurity',
      trending: false,
      description: 'Security solutions and consulting',
      keywords: ['security', 'cybersecurity', 'protection', 'compliance']
    }
  ],

  globalStats: {
    branches: '88',
    clients: '1,100+',
    employees: '33,000+',
    countries: '30'
  },

  companyInfo: {
    name: 'FPT Software Company Limited',
    address: 'FPT Cau Giay Building, Duy Tan Street, Cau Giay Ward, Hanoi City, Vietnam',
    phone: '(+84) 243 768 9048',
    email: {
      marketing: 'MCP.PR@fpt.com',
      hr: 'Recruitment@fpt.com',
      dpo: 'Michael.Hering@fpt.com',
      sustainability: 'SDM@fpt.com'
    }
  },

  urls: {
    base: 'https://fptsoftware.com',
    services: '/services-and-industries',
    contact: '/contact-us',
    about: '/about-us',
    careers: 'https://career.fpt-software.com/',
    search: '/search-result'
  },

  selectors: {
    navigation: {
      logo: 'img[alt*="FPT"]',
      services: 'link[name="Services"]',
      contact: 'link[name="Contact"]',
      search: 'link[name="Search"]'
    },
    homepage: {
      hero: 'heading:has-text("AI-First Company")',
      exploreButton: 'link:has-text("Explore The Possibilities")'
    },
    contact: {
      form: 'iframe',
      submitButton: 'button:has-text("Contact us")'
    }
  }
};

export const expectedTexts = {
  homepage: {
    title: 'FPT Software | Leading in Digital transformation',
    hero: 'We Are An AI-First Company',
    subtitle: 'Providing comprehensive, AI-powered solutions'
  },
  services: {
    title: 'Services And Industries | FPT Software',
    intro: 'We empower enterprises to achieve highest potential'
  },
  contact: {
    title: 'Contact us | FPT Software',
    heading: 'Contact Us',
    formTitle: 'Get in Touch with Us'
  }
};

export const testEnvironments = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 }
};
