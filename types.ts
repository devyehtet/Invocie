
export enum InvoiceStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  PAID = 'Paid',
  OVERDUE = 'Overdue'
}

export enum RecurringFrequency {
  NONE = 'None',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  YEARLY = 'Yearly'
}

export type CurrencyCode = 'USD' | 'THB' | 'MMK';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  isAdSpend?: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
  preferredCurrency: CurrencyCode;
  exchangeRate: number; // Rate relative to 1 USD
}

export interface RecurringConfig {
  frequency: RecurringFrequency;
  isActive: boolean;
  endDate?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  client: Client;
  items: LineItem[];
  status: InvoiceStatus;
  taxRate: number;
  notes: string;
  exchangeRate?: number;
  recurring?: RecurringConfig;
}

export interface AppState {
  invoices: Invoice[];
  clients: Client[];
  baseExchangeRate: number;
}
