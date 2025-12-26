
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Invoice, InvoiceStatus, RecurringFrequency } from '../types';

interface DashboardProps {
  invoices: Invoice[];
}

const StatCard: React.FC<{ title: string, value: string, color: string, icon: React.ReactNode, trend?: string }> = ({ title, value, color, icon, trend }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
    {trend && (
      <div className="text-right">
        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-widest">{trend}</span>
      </div>
    )}
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ invoices }) => {
  const stats = useMemo(() => {
    const totalRevenue = invoices
      .filter(inv => inv.status === InvoiceStatus.PAID)
      .reduce((sum, inv) => sum + inv.items.reduce((iSum, item) => iSum + (item.quantity * item.price), 0), 0);
    
    const pendingAmount = invoices
      .filter(inv => inv.status === InvoiceStatus.PENDING)
      .reduce((sum, inv) => sum + inv.items.reduce((iSum, item) => iSum + (item.quantity * item.price), 0), 0);

    const overdueCount = invoices.filter(inv => inv.status === InvoiceStatus.OVERDUE).length;

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = invoices
      .filter(inv => inv.recurring?.isActive && inv.recurring.frequency !== RecurringFrequency.NONE)
      .reduce((sum, inv) => {
        const total = inv.items.reduce((iSum, item) => iSum + (item.quantity * item.price), 0);
        const freq = inv.recurring?.frequency;
        if (freq === RecurringFrequency.WEEKLY) return sum + (total * 4);
        if (freq === RecurringFrequency.MONTHLY) return sum + total;
        if (freq === RecurringFrequency.QUARTERLY) return sum + (total / 3);
        if (freq === RecurringFrequency.YEARLY) return sum + (total / 12);
        return sum;
      }, 0);

    return { totalRevenue, pendingAmount, overdueCount, mrr };
  }, [invoices]);

  const chartData = useMemo(() => {
    const data = [
      { name: 'Paid', value: invoices.filter(i => i.status === InvoiceStatus.PAID).length },
      { name: 'Pending', value: invoices.filter(i => i.status === InvoiceStatus.PENDING).length },
      { name: 'Overdue', value: invoices.filter(i => i.status === InvoiceStatus.OVERDUE).length },
      { name: 'Draft', value: invoices.filter(i => i.status === InvoiceStatus.DRAFT).length },
    ];
    return data;
  }, [invoices]);

  const revenueByClient = useMemo(() => {
    const clients: Record<string, number> = {};
    invoices.forEach(inv => {
      const total = inv.items.reduce((s, i) => s + (i.price * i.quantity), 0);
      clients[inv.client.name] = (clients[inv.client.name] || 0) + total;
    });
    return Object.entries(clients).map(([name, value]) => ({ name, value }));
  }, [invoices]);

  const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#94a3b8'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Paid" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          color="bg-emerald-50 text-emerald-600"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard 
          title="Pending" 
          value={`$${stats.pendingAmount.toLocaleString()}`} 
          color="bg-blue-50 text-blue-600"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
        />
        <StatCard 
          title="Estimated MRR" 
          value={`$${stats.mrr.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          color="bg-purple-50 text-purple-600"
          trend="Forecast"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
        />
        <StatCard 
          title="Overdue" 
          value={stats.overdueCount.toString()} 
          color="bg-red-50 text-red-600"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue by Client</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByClient}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} fontWeight="bold" />
                <YAxis fontSize={10} fontWeight="bold" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Invoice Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="ml-4 space-y-2">
              {chartData.map((d, i) => (
                <div key={d.name} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-xs text-slate-600 font-medium">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
