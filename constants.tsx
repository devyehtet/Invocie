
import { InvoiceStatus, Invoice, Client } from './types';

export const THB_RATE = 35.13;
export const MMK_RATE = 3200; // Market-ish rate
export const AD_MARGIN = 0.15;

export const MOCK_CLIENTS: Client[] = [
  { 
    id: 'c1', 
    name: 'Luxury Spa Resort', 
    email: 'marketing@luxespa.th', 
    address: '88 Sukhumvit Rd, Bangkok, Thailand',
    preferredCurrency: 'THB',
    exchangeRate: 35.13
  },
  { 
    id: 'c2', 
    name: 'TechGear Solutions', 
    email: 'ads@techgear.io', 
    address: 'Silicon Valley South, Austin, TX',
    preferredCurrency: 'USD',
    exchangeRate: 1
  },
  { 
    id: 'c3', 
    name: 'Organic Bites', 
    email: 'hello@organicbites.co', 
    address: '789 Green St, Chiang Mai',
    preferredCurrency: 'THB',
    exchangeRate: 35.50
  },
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'AD-2024-001',
    date: '2024-03-01',
    dueDate: '2024-03-15',
    client: MOCK_CLIENTS[0],
    status: InvoiceStatus.PAID,
    taxRate: 7,
    notes: 'Meta Ads campaign focused on Songkran festival bookings.',
    items: [
      { id: 'li1', description: 'Meta Ad Spend (Facebook/IG)', quantity: 1, price: 2000, isAdSpend: true },
      { id: 'li2', description: 'Social Media Management - March', quantity: 1, price: 800 },
    ]
  },
  {
    id: '2',
    invoiceNumber: 'AD-2024-002',
    date: '2024-03-10',
    dueDate: '2024-03-24',
    client: MOCK_CLIENTS[1],
    status: InvoiceStatus.PENDING,
    taxRate: 0,
    notes: 'Google Search Ads for Q1 Product Launch.',
    items: [
      { id: 'li3', description: 'Google Ads Search Network', quantity: 1, price: 5000, isAdSpend: true },
      { id: 'li4', description: 'Campaign Setup & Optimization', quantity: 1, price: 1200 },
    ]
  }
];
