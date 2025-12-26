
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Invoice, CurrencyCode, InvoiceStatus } from '../types';
import { AD_MARGIN, THB_RATE, MMK_RATE } from '../constants';

interface InvoicePreviewProps {
  invoices: Invoice[];
  onSave: (invoice: Invoice) => void;
}

interface ExportOptions {
  showNotes: boolean;
  showSummary: boolean;
  showMargin: boolean;
  showTax: boolean;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoices, onSave }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoice = invoices.find(inv => inv.id === id);
  
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>(
    invoice?.client.preferredCurrency || 'USD'
  );
  
  const [paymentStep, setPaymentStep] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    showNotes: true,
    showSummary: true,
    showMargin: true,
    showTax: true
  });

  useEffect(() => {
    if (invoice) {
      setDisplayCurrency(invoice.client.preferredCurrency);
    }
  }, [invoice]);

  if (!invoice) return <div className="p-20 text-center font-bold text-slate-400">Invoice not found.</div>;

  const calculateDetailedTotals = () => {
    let adSpendBase = 0;
    let serviceFees = 0;
    
    invoice.items.forEach(item => {
      const lineTotal = item.quantity * item.price;
      if (item.isAdSpend) {
        adSpendBase += lineTotal;
      } else {
        serviceFees += lineTotal;
      }
    });

    const marginEarned = exportOptions.showMargin ? adSpendBase * AD_MARGIN : 0;
    const subtotal = adSpendBase + serviceFees + marginEarned;
    const tax = exportOptions.showTax ? subtotal * (invoice.taxRate / 100) : 0;
    const total = subtotal + tax;

    return { adSpendBase, serviceFees, marginEarned, subtotal, tax, total };
  };

  const totals = calculateDetailedTotals();

  const formatValue = (val: number, currencyOverride?: CurrencyCode) => {
    const targetCurrency = currencyOverride || displayCurrency;
    const isUSD = targetCurrency === 'USD';
    let rate = 1;
    
    if (!isUSD) {
      if (targetCurrency === invoice.client.preferredCurrency) {
        rate = invoice.client.exchangeRate;
      } else {
        if (targetCurrency === 'THB') rate = THB_RATE;
        if (targetCurrency === 'MMK') rate = MMK_RATE;
      }
    }
    
    const amount = val * rate;
    
    if (targetCurrency === 'MMK') {
      return `K ${amount.toLocaleString(undefined, { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      })}`;
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handlePrint = () => {
    window.focus();
    window.print();
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from SOLOBILL ADS`);
    const body = encodeURIComponent(
      `Hi ${invoice.client.name},\n\nPlease find the attached invoice (${invoice.invoiceNumber}) for advertising services.\n\nTotal Amount Due: ${formatValue(totals.total)}\nDue Date: ${invoice.dueDate}\n\nThank you for your business!\n\nBest regards,\nJane Freelancer`
    );
    window.location.href = `mailto:${invoice.client.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Payment Overlays */}
      {paymentStep === 'SUCCESS' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 no-print">
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center space-y-4 max-w-sm mx-auto transform animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Payment Successful</h2>
            <p className="text-slate-500 text-sm">Invoice {invoice.invoiceNumber} has been settled.</p>
            <button onClick={() => setPaymentStep('IDLE')} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">Back to Invoice</button>
          </div>
        </div>
      )}

      {paymentStep === 'PROCESSING' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 no-print">
          <div className="bg-white p-12 rounded-3xl shadow-2xl text-center space-y-6 max-w-sm mx-auto">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Securing Payment</h2>
          </div>
        </div>
      )}

      <div className="mb-8 space-y-4 no-print">
        {/* Primary Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <button onClick={() => navigate('/invoices')} className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span>Exit Preview</span>
          </button>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl mr-2">
              {(['USD', 'THB', 'MMK'] as CurrencyCode[]).map(curr => (
                <button 
                  key={curr}
                  onClick={() => setDisplayCurrency(curr)} 
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest transition-all ${displayCurrency === curr ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <button 
              onClick={handlePrint}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center space-x-2 shadow-lg shadow-blue-500/10 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              <span className="text-sm">Export to PDF</span>
            </button>

            <button 
              onClick={handleSendEmail}
              className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-all flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <span className="text-sm">Send to Client</span>
            </button>
          </div>
        </div>

        {/* PDF Export Options Panel */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
          <div className="flex items-center space-x-2 mb-3">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">PDF Export Options</span>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                checked={exportOptions.showNotes} 
                onChange={(e) => setExportOptions({...exportOptions, showNotes: e.target.checked})}
              />
              <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Include Contractual Notes</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                checked={exportOptions.showSummary} 
                onChange={(e) => setExportOptions({...exportOptions, showSummary: e.target.checked})}
              />
              <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Include Summary Dashboard</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                checked={exportOptions.showMargin} 
                onChange={(e) => setExportOptions({...exportOptions, showMargin: e.target.checked})}
              />
              <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Show Ad Margin Breakdown</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                checked={exportOptions.showTax} 
                onChange={(e) => setExportOptions({...exportOptions, showTax: e.target.checked})}
              />
              <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Include Tax Surcharge</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-12 md:p-16 shadow-2xl border border-slate-100 rounded-3xl min-h-[1056px] flex flex-col relative overflow-hidden">
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 -mr-24 -mt-24 rounded-full opacity-50 no-print"></div>

        <div className="flex flex-col md:flex-row justify-between items-start mb-16 relative z-10 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">SOLOBILL ADS</h1>
            </div>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Digital Advertising & Performance Hub</p>
            <div className="mt-6 text-xs text-slate-500 leading-relaxed font-medium">
              <p>12/3 Sukhumvit Soi 11, Wattana</p>
              <p>Bangkok, Thailand 10110</p>
              <p className="font-bold text-slate-800 mt-1">VAT: 0123456789012</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-6xl font-black text-slate-100 uppercase tracking-tighter mb-4 opacity-50">Invoice</h2>
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-800">No. {invoice.invoiceNumber}</p>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Issued: {invoice.date}</p>
              <p className="text-[10px] text-red-500 font-bold tracking-widest uppercase">Due: {invoice.dueDate}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 relative z-10">
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Recipient Details
            </p>
            <h3 className="text-lg font-black text-slate-900 mb-1">{invoice.client.name}</h3>
            <p className="text-xs text-slate-500 mb-2 leading-relaxed whitespace-pre-wrap">{invoice.client.address}</p>
            <p className="text-xs text-blue-600 font-bold underline decoration-blue-200">{invoice.client.email}</p>
          </div>
          <div className="text-right flex flex-col justify-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Balance Due</p>
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{formatValue(totals.total)}</h3>
            <div className="mt-3">
               <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${
                 invoice.status === InvoiceStatus.PAID 
                   ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                   : 'bg-orange-50 text-orange-700 border-orange-100'
               }`}>
                {invoice.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/30">
                <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Service Description</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Units</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Rate</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-6 px-4">
                    <p className="font-bold text-slate-800 text-sm mb-1">{item.description}</p>
                    {item.isAdSpend && (
                      <div className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        <span className="text-[10px] text-blue-600 font-black uppercase tracking-tighter">Inventory Settlement</span>
                      </div>
                    )}
                  </td>
                  <td className="py-6 px-4 text-right text-xs text-slate-500 font-medium">{item.quantity}</td>
                  <td className="py-6 px-4 text-right text-xs text-slate-500 font-medium">{formatValue(item.price)}</td>
                  <td className="py-6 px-4 text-right font-black text-slate-900 text-sm">{formatValue(item.quantity * item.price)}</td>
                </tr>
              ))}
              {exportOptions.showMargin && totals.marginEarned > 0 && (
                <tr className="bg-emerald-50/30">
                  <td className="py-5 px-4 font-bold text-emerald-700 text-sm">Campaign Management Fee (15%)</td>
                  <td></td>
                  <td></td>
                  <td className="py-5 px-4 text-right font-black text-emerald-700 text-sm">{formatValue(totals.marginEarned)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-12 flex flex-col md:flex-row justify-between items-start pt-8 border-t border-slate-100 relative z-10 gap-8">
           <div className={`flex-1 max-w-md ${exportOptions.showNotes ? '' : 'hidden'}`}>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Billing Notes & Compliance</h4>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap italic font-medium">
                {invoice.notes || "Standard advertising terms: Ad inventory is billed as pass-through cost. Net 14 terms apply to agency fees. Late payments incur a 1.5% monthly surcharge."}
              </p>
            </div>
          </div>

          <div className={`w-full md:w-80 space-y-3 bg-slate-900 p-8 rounded-3xl text-slate-100 shadow-xl relative overflow-hidden ${exportOptions.showSummary ? '' : 'hidden'}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rounded-full blur-2xl"></div>
            
            <div className="flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-widest">
              <span>Subtotal (USD)</span>
              <span className="text-slate-200">{formatValue(totals.subtotal, 'USD')}</span>
            </div>
            {exportOptions.showTax && (
              <div className="flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-widest">
                <span>Tax / VAT ({invoice.taxRate}%)</span>
                <span className="text-slate-200">{formatValue(totals.tax, 'USD')}</span>
              </div>
            )}
            
            <div className="pt-4 border-t border-slate-800">
              <div className="flex justify-between text-3xl font-black text-white tracking-tighter mb-2">
                <span>TOTAL</span>
                <span className="text-blue-400">{formatValue(totals.total)}</span>
              </div>
              
              {displayCurrency !== 'USD' && (
                 <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-right">
                   <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Payable in local currency</p>
                   <p className="text-xs text-white font-bold tracking-tight">
                     Fixed Rate: 1 USD = {displayCurrency === invoice.client.preferredCurrency ? invoice.client.exchangeRate : (displayCurrency === 'THB' ? THB_RATE : MMK_RATE)} {displayCurrency}
                   </p>
                 </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-50 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] relative z-10">
          <span>Digitally Signed by SoloBill ADS System</span>
          <span>Thank you for your trust in our agency.</span>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
