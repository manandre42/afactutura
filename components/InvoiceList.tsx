
import React from 'react';
import { Invoice, InvoiceStatus, CompanyProfile } from '../types';
import { FileText, Printer, FileJson, FileCode } from 'lucide-react';
import { generateInvoiceXML, generateInvoiceJSON, downloadFile } from '../utils/serializers';

interface InvoiceListProps {
  invoices: Invoice[];
  companyProfile: CompanyProfile;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, companyProfile }) => {
  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.Paid: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case InvoiceStatus.Issued: return 'bg-blue-100 text-blue-800 border-blue-200';
      case InvoiceStatus.Draft: return 'bg-slate-100 text-slate-800 border-slate-200';
      case InvoiceStatus.Cancelled: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportXML = (invoice: Invoice) => {
    const xmlContent = generateInvoiceXML(invoice, companyProfile);
    downloadFile(`fatura_${invoice.series}_${invoice.number}.xml`, xmlContent, 'application/xml');
  };

  const handleExportJSON = (invoice: Invoice) => {
    const jsonContent = generateInvoiceJSON(invoice, companyProfile);
    downloadFile(`fatura_${invoice.series}_${invoice.number}.json`, jsonContent, 'application/json');
  };

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200 animate-fade-in">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800 tracking-tight">Histórico de Faturas</h2>
        <div className="flex gap-2">
          {/* Future filters could go here */}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-500 tracking-wider">
            <tr>
              <th className="px-6 py-4">Fatura</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Total (AOA)</th>
              <th className="px-6 py-4 text-center">Exportar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                  Nenhuma fatura encontrada. Comece por criar uma nova.
                </td>
              </tr>
            ) : (
              invoices.sort((a,b) => b.number - a.number).map((invoice) => (
                <tr key={invoice.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center space-x-2">
                      <FileText size={16} className="text-gray-400 group-hover:text-blue-600" />
                      <span className="font-mono">{invoice.series}/{invoice.number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{invoice.clientName}</div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">NIF: {invoice.clientNif}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {new Date(invoice.date).toLocaleDateString('pt-AO')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-sm text-[10px] uppercase font-bold border tracking-wide ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900 font-mono">
                    {new Intl.NumberFormat('pt-AO').format(invoice.total)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-1">
                      <button 
                        onClick={() => handleExportXML(invoice)}
                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-sm transition-colors" 
                        title="Exportar XML (AGT)"
                      >
                        <FileCode size={16} />
                      </button>
                      <button 
                        onClick={() => handleExportJSON(invoice)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-sm transition-colors" 
                        title="Exportar JSON"
                      >
                        <FileJson size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors" title="Imprimir PDF">
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceList;
