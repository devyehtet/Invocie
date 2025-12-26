
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Invoice, InvoiceStatus, LineItem, Client, RecurringFrequency, RecurringConfig } from '../types';
import { generateProfessionalNotes } from '../services/geminiService';
import { AD_MARGIN } from '../constants';

interface InvoiceFormProps {
  onSave: (invoice: Invoice) => void;
  clients: Client[];
  invoices: Invoice[];
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSave, clients, invoices }) => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);

  // Helper to generate next sequential number
  const getNextInvoiceNumber = () => {
    const currentYear = new Date().getFullYear();
    const prefix = `ADV-${currentYear}-`;
    
    const yearInvoices = invoices.filter(inv => inv.invoiceNumber.startsWith(prefix));
    let nextNumber = 1;
    
    if (yearInvoices.length > 0) {
      const numbers = yearInvoices.map(inv => {
        const parts = inv.invoiceNumber.split('-');
        const lastPart = parts[parts.length - 1];
        return parseInt(lastPart, 10) || 0;
      });
      nextNumber = Math.max(...numbers) + 1;
    }
    
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  };

  const [formData, setFormData] = useState<Invoice>({
    id: Math.random().toString(36).substr(2, 9),
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    client: clients[0],
    items: [{ id: '1', description: '', quantity: 1, price: 0, isAdSpend: false }],
    status: InvoiceStatus.DRAFT,
    taxRate: 7,
    notes: '',
    recurring: {
      frequency: RecurringFrequency.NONE,
      isActive: false
    }
  });

  useEffect(() => {
    if (id) {
      const existing = invoices.find(inv => inv.id === id);
      if (existing) {
        setFormData(existing);
        if (existing.recurring?.isActive) setShowRecurring(true);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        invoiceNumber: getNextInvoiceNumber()
      }));
    }
  }, [id, invoices]);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { id: Math.random().toString(), description: '', quantity: 1, price: 0, isAdSpend: false }]
    });
  };

  const removeItem = (idx: number) => {
    const items = [...formData.items];
    if (items.length > 1) {
      items.splice(idx, 1);
      setFormData({ ...formData, items });
    }
  };

  const handleItemChange = (idx: number, field: keyof LineItem, value: any) => {
    const items = [...formData.items];
    items[idx] = { ...items[idx], [field]: value };
    setFormData({ ...formData, items });
  };

  const handleAiNotes = async () => {
    setAiGenerating(true);
    const context = formData.items.map(i => i.description).filter(Boolean).join(', ');
    const generated = await generateProfessionalNotes(context || "digital advertising and social media management");
    setFormData({ ...formData, notes: generated });
    setAiGenerating(false);
  };

  const calculateTotals = () => {
    let adSpendBase = 0;
    let serviceFees = 0;
    
    formData.items.forEach(item => {
      const lineTotal = (item.quantity || 0) * (item.price || 0);
      if (item.isAdSpend) {
        adSpendBase += lineTotal;
      } else {
        serviceFees += lineTotal;
      }
    });

    const marginEarned = adSpendBase * AD_MARGIN;
    const subtotal = adSpendBase + serviceFees + marginEarned;
    const tax = subtotal * (formData.taxRate / 100);
    const total = subtotal + tax;

    return { adSpendBase, serviceFees, marginEarned, subtotal, tax, total };
  };

  const totals = calculateTotals();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    navigate('/invoices');
  };

  const updateRecurring = (fields: Partial<RecurringConfig>) => {
    setFormData({
      ...formData,
      recurring: {
        ...(formData.recurring || { frequency: RecurringFrequency.NONE, isActive: false }),
        ...fields
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{id ? 'Edit Adv. Invoice' : 'New Advertising Invoice'}</h2>
          <p className="text-sm text-slate-500">Selected Client: <span className="font-bold text-blue-600">{formData.client.name}</span></p>
        </div>
        <button onClick={() => navigate('/invoices')} className="text-slate-500 hover:text-slate-700 font-medium transition-colors">Cancel</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Billing To</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.client.id}
                  onChange={(e) => setFormData({ ...formData, client: clients.find(c => c.id === e.target.value) || clients[0] })}
                >
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.preferredCurrency})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Invoice Date</label>
                  <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Due</label>
                  <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Invoice Identifier</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 font-mono text-slate-600 cursor-not-allowed" 
                  value={formData.invoiceNumber} 
                  readOnly 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Lifecycle Status</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as InvoiceStatus })}>
                  {Object.values(InvoiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Campaign Line Items
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-black uppercase tracking-wider">Calculated in USD</span>
            </div>
            {formData.items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-end bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                <div className="col-span-5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                  <input type="text" placeholder="e.g. Meta Ads Inventory" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={item.description} onChange={(e) => handleItemChange(idx, 'description', e.target.value)} />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Qty</label>
                  <input type="number" className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm text-center" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="col-span-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Price (USD)</label>
                  <input type="number" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm" value={item.price} onChange={(e) => handleItemChange(idx, 'price', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="col-span-2 flex flex-col items-center">
                  <label className="block text-[10px] font-black text-blue-600 uppercase mb-2">Ad Spend</label>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded accent-blue-600 cursor-pointer" 
                    checked={item.isAdSpend} 
                    onChange={(e) => handleItemChange(idx, 'isAdSpend', e.target.checked)} 
                  />
                </div>
                <div className="col-span-1 flex justify-center pb-2">
                  <button 
                    type="button" 
                    onClick={() => removeItem(idx)} 
                    className={`text-slate-300 hover:text-red-500 transition-colors ${formData.items.length === 1 ? 'opacity-20 cursor-not-allowed' : ''}`}
                    disabled={formData.items.length === 1}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addItem} className="text-blue-600 font-bold text-xs hover:bg-blue-50 px-3 py-2 rounded-lg transition-all flex items-center space-x-1 w-fit"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg><span>New Line Item</span></button>
          </div>

          {/* Recurring Settings Toggle */}
          <div className="pt-8 border-t border-slate-100">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${showRecurring ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Recurring Billing Schedule</h3>
                    <p className="text-xs text-slate-500">Automatically generate future invoices for this service</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={showRecurring} 
                    onChange={(e) => {
                      setShowRecurring(e.target.checked);
                      updateRecurring({ isActive: e.target.checked, frequency: e.target.checked ? RecurringFrequency.MONTHLY : RecurringFrequency.NONE });
                    }} 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
             </div>

             {showRecurring && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-purple-50/50 p-6 rounded-2xl border border-purple-100 animate-in fade-in zoom-in-95 duration-300">
                  <div>
                    <label className="block text-[10px] font-black text-purple-600 uppercase mb-2 tracking-widest">Billing Frequency</label>
                    <select 
                      className="w-full bg-white border border-purple-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
                      value={formData.recurring?.frequency}
                      onChange={(e) => updateRecurring({ frequency: e.target.value as RecurringFrequency })}
                    >
                      {Object.values(RecurringFrequency).filter(f => f !== RecurringFrequency.NONE).map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-purple-600 uppercase mb-2 tracking-widest">End Schedule (Optional)</label>
                    <div className="flex items-center space-x-4">
                       <input 
                        type="date" 
                        className="flex-1 bg-white border border-purple-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
                        value={formData.recurring?.endDate || ''}
                        onChange={(e) => updateRecurring({ endDate: e.target.value })}
                       />
                       <button 
                        type="button"
                        onClick={() => updateRecurring({ endDate: undefined })}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600"
                       >
                         Reset
                       </button>
                    </div>
                  </div>
               </div>
             )}
          </div>

          {/* Footer Notes & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">Contractual Notes</label>
                <button type="button" onClick={handleAiNotes} disabled={aiGenerating} className={`text-[10px] font-black px-3 py-1.5 rounded-full border transition-all flex items-center space-x-1 uppercase tracking-wider ${aiGenerating ? 'bg-slate-100 text-slate-400' : 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700 shadow-md shadow-purple-100'}`}><svg className={`w-3 h-3 ${aiGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg><span>{aiGenerating ? 'Syncing AI...' : 'AI Drafting'}</span></button>
              </div>
              <textarea rows={6} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white outline-none transition-all" placeholder="ROAS targets, flight dates, or platform specific terms..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}></textarea>
            </div>
            
            <div className="bg-slate-900 text-slate-100 p-8 rounded-3xl space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 -mr-16 -mt-16 rounded-full blur-3xl"></div>
              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] border-b border-slate-700 pb-3 flex justify-between items-center">
                <span>Summary Dashboard</span>
                <span>{formData.client.preferredCurrency} Profile</span>
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Inventory Costs</span>
                  <span className="font-mono">${totals.adSpendBase.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">15% Ad Margin</span>
                  <span className="text-emerald-400 font-bold">+$ {totals.marginEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Creative & Management</span>
                  <span className="font-mono">${totals.serviceFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm items-center border-t border-slate-700 pt-3">
                  <span className="text-slate-400">Tax Surcharge ({formData.taxRate}%)</span>
                  <input type="number" className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-right text-xs font-bold text-blue-400" value={formData.taxRate} onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-700">
                <div className="flex justify-between text-3xl font-black">
                  <span className="text-white">Total USD</span>
                  <span className="text-blue-400">${totals.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {formData.client.preferredCurrency !== 'USD' && (
                  <div className="flex justify-between text-xs font-bold mt-2 text-slate-400 italic bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="uppercase tracking-widest">Client Payable ({formData.client.preferredCurrency})</span>
                    <span className="text-white text-base">
                      {formData.client.preferredCurrency === 'THB' ? '฿' : 'K '}
                      {(totals.total * formData.client.exchangeRate).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {formData.client.preferredCurrency !== 'USD' && (
                  <p className="text-[10px] text-slate-500 mt-2 text-right">Fixed Rate: 1 USD = {formData.client.exchangeRate} {formData.client.preferredCurrency}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all transform hover:-translate-y-1 active:translate-y-0">
            Finalize Advertising Invoice
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
