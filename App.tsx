
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { MOCK_INVOICES, MOCK_CLIENTS } from './constants';
import { Invoice, Client, AppState } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import GeminiAssistant from './components/GeminiAssistant';
import ClientList from './components/ClientList';
import ClientForm from './components/ClientForm';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    invoices: MOCK_INVOICES,
    clients: MOCK_CLIENTS,
    baseExchangeRate: 35.13
  });

  const handleSaveInvoice = (invoice: Invoice) => {
    setState(prev => {
      const exists = prev.invoices.some(i => i.id === invoice.id);
      return {
        ...prev,
        invoices: exists 
          ? prev.invoices.map(i => i.id === invoice.id ? invoice : i)
          : [...prev.invoices, invoice]
      };
    });
  };

  const handleDeleteInvoice = (id: string) => {
    setState(prev => ({
      ...prev,
      invoices: prev.invoices.filter(i => i.id !== id)
    }));
  };

  const handleSaveClient = (client: Client) => {
    setState(prev => {
      const exists = prev.clients.some(c => c.id === client.id);
      return {
        ...prev,
        clients: exists
          ? prev.clients.map(c => c.id === client.id ? client : c)
          : [...prev.clients, client]
      };
    });
  };

  const handleDeleteClients = (ids: string[]) => {
    setState(prev => ({
      ...prev,
      clients: prev.clients.filter(c => !ids.includes(c.id))
    }));
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        
        {/* Removed 'no-print' from main and added print resets */}
        <main className="flex-1 md:ml-64 p-8 pb-24 print:m-0 print:p-0 print:ml-0">
          <Routes>
            <Route path="/" element={<Dashboard invoices={state.invoices} />} />
            <Route path="/invoices" element={<InvoiceList invoices={state.invoices} onDelete={handleDeleteInvoice} />} />
            <Route path="/invoices/new" element={<InvoiceForm onSave={handleSaveInvoice} clients={state.clients} invoices={state.invoices} />} />
            <Route path="/invoices/edit/:id" element={<InvoiceForm onSave={handleSaveInvoice} clients={state.clients} invoices={state.invoices} />} />
            <Route path="/invoices/preview/:id" element={<InvoicePreview invoices={state.invoices} onSave={handleSaveInvoice} />} />
            <Route path="/clients" element={<ClientList clients={state.clients} onDeleteClients={handleDeleteClients} />} />
            <Route path="/clients/new" element={<ClientForm onSave={handleSaveClient} clients={state.clients} />} />
            <Route path="/clients/edit/:id" element={<ClientForm onSave={handleSaveClient} clients={state.clients} />} />
          </Routes>
        </main>

        <GeminiAssistant invoices={state.invoices} />
      </div>
    </Router>
  );
};

export default App;
