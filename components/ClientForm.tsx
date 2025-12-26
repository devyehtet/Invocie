
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Client, CurrencyCode } from '../types';
import { THB_RATE, MMK_RATE } from '../constants';

interface ClientFormProps {
  onSave: (client: Client) => void;
  clients: Client[];
}

const ClientForm: React.FC<ClientFormProps> = ({ onSave, clients }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  
  const [formData, setFormData] = useState<Omit<Client, 'id'>>({
    name: '',
    email: '',
    address: '',
    preferredCurrency: 'USD',
    exchangeRate: 1
  });

  useEffect(() => {
    if (id) {
      const existingClient = clients.find(c => c.id === id);
      if (existingClient) {
        setFormData({
          name: existingClient.name,
          email: existingClient.email,
          address: existingClient.address,
          preferredCurrency: existingClient.preferredCurrency,
          exchangeRate: existingClient.exchangeRate
        });
      }
    }
  }, [id, clients]);

  const handleCurrencyChange = (currency: CurrencyCode) => {
    let rate = 1;
    if (currency === 'THB') rate = THB_RATE;
    if (currency === 'MMK') rate = MMK_RATE;
    
    setFormData({
      ...formData,
      preferredCurrency: currency,
      exchangeRate: rate
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clientToSave: Client = {
      ...formData,
      id: id || Math.random().toString(36).substr(2, 9),
    };
    onSave(clientToSave);
    navigate('/clients');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{id ? 'Update Client Profile' : 'Add New Client'}</h2>
          <p className="text-sm text-slate-500">{id ? 'Modify information for your business partner' : 'Register a new business partner for invoicing'}</p>
        </div>
        <button 
          type="button"
          onClick={() => navigate('/clients')} 
          className="text-slate-500 hover:text-slate-700 font-medium transition-colors"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-8">
        {/* Basic Info */}
        <div className="space-y-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Identity & Contact</h3>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Company / Client Name</label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="e.g. Acme Corporation"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Email</label>
              <input
                type="email"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="billing@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Billing Address</label>
              <textarea
                required
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
                placeholder="Street address, City, Country, ZIP code"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Currency & Financial Settings */}
        <div className="space-y-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Billing Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Currency</label>
              <div className="relative">
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none appearance-none transition-all cursor-pointer"
                  value={formData.preferredCurrency}
                  onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
                >
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="THB">THB - Thai Baht (฿)</option>
                  <option value="MMK">MMK - Myanmar Kyat (K)</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Custom Exchange Rate</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-medium text-sm">1 USD =</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  disabled={formData.preferredCurrency === 'USD'}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-16 pr-12 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    formData.preferredCurrency === 'USD' 
                      ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400' 
                      : 'focus:bg-white'
                  }`}
                  value={formData.exchangeRate}
                  onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 0 })}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-bold text-xs uppercase">{formData.preferredCurrency}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-700 leading-relaxed font-medium">
              {formData.preferredCurrency === 'USD' 
                ? 'Clients billing in USD will use a default 1:1 ratio.'
                : `This custom rate (1 USD to ${formData.exchangeRate} ${formData.preferredCurrency}) will be used to automatically calculate totals on all invoices for this client.`
              }
            </p>
          </div>
        </div>

        <div className="pt-6 flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Discard
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            {id ? 'Save Changes' : 'Create Client Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;
