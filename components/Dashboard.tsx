import React from 'react';
import { Invoice, InvoiceStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, FileText, AlertCircle, TrendingUp } from 'lucide-react';

interface DashboardProps {
  invoices: Invoice[];
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(val);
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color} text-white`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ invoices }) => {
  
  const totalRevenue = invoices
    .filter(i => i.status !== InvoiceStatus.Cancelled && i.status !== InvoiceStatus.Draft)
    .reduce((acc, curr) => acc + curr.total, 0);

  const pendingCount = invoices.filter(i => i.status === InvoiceStatus.Issued).length;
  const draftCount = invoices.filter(i => i.status === InvoiceStatus.Draft).length;
  
  // Prepare data for chart (Last 7 days simplified logic)
  const chartData = invoices.reduce((acc: any[], curr) => {
    const date = new Date(curr.date).toLocaleDateString('pt-AO', { day: '2-digit', month: '2-digit' });
    const existing = acc.find(item => item.name === date);
    if (existing) {
      existing.amount += curr.total;
    } else {
      acc.push({ name: date, amount: curr.total });
    }
    return acc;
  }, []).slice(-7).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
        <span className="text-sm text-slate-500">Regime Geral • IVA 14%</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Faturação Total" 
          value={formatCurrency(totalRevenue)} 
          icon={<DollarSign size={24} />} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Faturas Emitidas" 
          value={invoices.length.toString()} 
          icon={<FileText size={24} />} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Pagamentos Pendentes" 
          value={pendingCount.toString()} 
          icon={<AlertCircle size={24} />} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Rascunhos" 
          value={draftCount.toString()} 
          icon={<TrendingUp size={24} />} 
          color="bg-slate-500" 
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Volume de Vendas (Últimos dias)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
