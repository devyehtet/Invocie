
import React, { useState, useMemo } from 'react';
import { Client } from '../types';
import { Link, useNavigate } from 'react-router-dom';

interface ClientListProps {
  clients: Client[];
  onDeleteClients: (ids: string[]) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onDeleteClients }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const filteredClients = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return clients;

    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.address.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredClients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredClients.map((c) => c.id)));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} clients?`)) {
      onDeleteClients(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const isAllSelected = filteredClients.length > 0 && selectedIds.size === filteredClients.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Client Directory</h2>
          <p className="text-sm text-slate-500">Manage your advertising partners and billing contacts</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link to="/clients/new" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center space-x-2 shadow-lg shadow-blue-100 whitespace-nowrap">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            <span>Add Client</span>
          </Link>
        </div>
      </div>

      <div className="flex items-center space-x-2 px-2">
        <label className="flex items-center space-x-3 cursor-pointer group">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
              checked={isAllSelected}
              onChange={handleToggleSelectAll}
            />
          </div>
          <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </span>
        </label>
      </div>

      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div 
              key={client.id} 
              className={`bg-white p-6 rounded-2xl border transition-all relative group cursor-pointer ${
                selectedIds.has(client.id) 
                  ? 'border-blue-500 shadow-md ring-1 ring-blue-500' 
                  : 'border-slate-100 shadow-sm hover:shadow-md'
              }`}
              onClick={() => handleToggleSelect(client.id)}
            >
              <div className="absolute top-4 right-4 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/clients/edit/${client.id}`);
                  }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Client"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                  checked={selectedIds.has(client.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleToggleSelect(client.id);
                  }}
                />
              </div>

              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-colors ${
                  selectedIds.has(client.id) ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
                }`}>
                  {client.name.charAt(0)}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-1">{client.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-slate-500 mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span className="truncate">{client.email}</span>
              </div>
              
              <div className="pt-4 border-t border-slate-50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Billing Address</p>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{client.address}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                    {client.preferredCurrency}
                  </span>
                  {client.preferredCurrency !== 'USD' && (
                    <span className="text-[10px] text-slate-400 italic">Rate: 1:{client.exchangeRate}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No matching clients found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any clients matching "{searchQuery}". Try searching for a different name, email, or city.</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-6 text-blue-600 font-bold text-sm hover:underline"
          >
            Clear search filter
          </button>
        </div>
      )}

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-8 animate-in slide-in-from-bottom-8 duration-300 z-30 ring-1 ring-slate-700">
          <div className="flex items-center space-x-4 border-r border-slate-700 pr-8">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm animate-pulse">
              {selectedIds.size}
            </span>
            <span className="font-semibold">Items Selected</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBulkDelete}
              className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              <span>Delete Selected</span>
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
