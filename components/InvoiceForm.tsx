import React, { useState } from 'react';
import { Invoice, InvoiceItem, Client, TaxRate, PaymentMethod, InvoiceStatus, DocumentType } from '../types';
import { EXEMPTION_REASONS } from '../constants';
import { Plus, Trash2, Save, Send, ArrowLeft } from 'lucide-react';

interface InvoiceFormProps {
  clients: Client[];
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
  nextInvoiceNumber: number;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ clients, onSave, onCancel, nextInvoiceNumber }) => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
  const [docType, setDocType] = useState<DocumentType>(DocumentType.Invoice);
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, taxRate: TaxRate.Standard, total: 0 }
  ]);

  // Calculations
  const calculateTotals = (currentItems: InvoiceItem[]) => {
    let sub = 0;
    let tax = 0;
    currentItems.forEach(item => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemTax = itemTotal * (item.taxRate / 100);
      sub += itemTotal;
      tax += itemTax;
    });
    return { subtotal: sub, taxTotal: tax, total: sub + tax };
  };

  const totals = calculateTotals(items);

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
           updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems([...items, { 
      id: Date.now().toString(), 
      description: '', 
      quantity: 1, 
      unitPrice: 0, 
      taxRate: TaxRate.Standard, 
      total: 0 
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const handleSubmit = (status: InvoiceStatus) => {
    if (!selectedClientId) {
      alert("Por favor selecione um cliente.");
      return;
    }

    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;

    const isValid = items.every(i => i.description && i.quantity > 0 && i.unitPrice >= 0);
    if (!isValid) {
      alert("Verifique os itens da fatura. Descrição e valores são obrigatórios.");
      return;
    }

    const newInvoice: Invoice = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      series: '2025A',
      number: nextInvoiceNumber,
      type: docType,
      date: new Date(date).toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      clientId: client.id,
      clientName: client.name,
      clientNif: client.nif,
      clientAddress: client.address,
      items: items.map(i => ({...i, total: i.quantity * i.unitPrice})),
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      total: totals.total,
      currency: 'AOA',
      status: status,
      paymentMethod: paymentMethod,
      auditTrail: [
        {
          action: 'CREATED',
          user: 'Admin',
          timestamp: new Date().toISOString(),
          detail: `Documento criado com status ${status}`
        }
      ]
    };

    onSave(newInvoice);
  };

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
      {/* Header Toolbar */}
      <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="md:hidden text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Nova Fatura</h2>
            <p className="text-xs text-gray-500 font-mono">SERIE 2025A / DOC #{nextInvoiceNumber}</p>
          </div>
        </div>
        
        {/* Mobile Action Buttons - Grid for full width, Flex for desktop */}
        <div className="grid grid-cols-3 md:flex w-full md:w-auto gap-2 md:space-x-2">
          <button 
            onClick={onCancel}
            className="hidden md:block px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-sm text-sm font-medium transition-colors border border-transparent"
          >
            Cancelar
          </button>
          <button 
            onClick={() => handleSubmit(InvoiceStatus.Draft)}
            className="col-span-1 flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-white bg-gray-50 rounded-sm text-xs md:text-sm font-medium transition-colors"
          >
            <Save size={16} />
            <span>Rascunho</span>
          </button>
          <button 
            onClick={() => handleSubmit(InvoiceStatus.Issued)}
            className="col-span-2 flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-sm text-xs md:text-sm font-medium shadow-sm transition-colors"
          >
            <Send size={16} />
            <span>Emitir Documento</span>
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Left Col: Settings (Mobile: Top, Desktop: Left Sidebar style) */}
        <div className="md:col-span-4 lg:col-span-3 space-y-5 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Dados do Cabeçalho</h3>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Cliente</label>
            <select 
              className="w-full p-2.5 bg-white border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none text-sm"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
            >
              <option value="">Selecionar...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {selectedClientId && (
              <div className="mt-3 p-3 bg-blue-50/50 border border-blue-100 rounded-sm text-xs text-gray-600">
                <p className="font-bold text-gray-800">{clients.find(c => c.id === selectedClientId)?.name}</p>
                <p className="font-mono mt-1">NIF: {clients.find(c => c.id === selectedClientId)?.nif}</p>
              </div>
            )}
          </div>
          
          <div>
             <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tipo de Documento</label>
             <select 
               className="w-full p-2.5 bg-white border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-600 outline-none text-sm"
               value={docType}
               onChange={(e) => setDocType(e.target.value as DocumentType)}
             >
               <option value={DocumentType.Invoice}>Fatura (FT)</option>
               <option value={DocumentType.Receipt}>Recibo (RC)</option>
               <option value={DocumentType.CreditNote}>Nota de Crédito (NC)</option>
             </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Emissão</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-white border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-600 outline-none text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Vencimento</label>
              <input 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2 bg-white border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-600 outline-none text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Forma Pagamento</label>
            <select 
              className="w-full p-2.5 bg-white border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-600 outline-none text-sm"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              {Object.values(PaymentMethod).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Col: Items (Main) */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Itens da Fatura</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-sm border border-gray-200 font-mono">AOA</span>
          </div>

          <div className="bg-white rounded-sm border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 gap-0 border-b border-gray-200 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4 p-3 border-r border-gray-100">Descrição</div>
              <div className="col-span-2 p-3 text-right border-r border-gray-100">Qtd</div>
              <div className="col-span-2 p-3 text-right border-r border-gray-100">Preço</div>
              <div className="col-span-2 p-3 text-right border-r border-gray-100 hidden md:block">IVA</div>
              <div className="col-span-4 md:col-span-2 p-3 text-right">Total</div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-0 items-start group hover:bg-blue-50/20 transition-colors">
                  <div className="col-span-4 p-2 border-r border-gray-100 space-y-1">
                    <input 
                      type="text" 
                      placeholder="Descrição do item"
                      className="w-full p-1 bg-transparent border-b border-transparent focus:border-blue-600 outline-none text-sm font-medium text-gray-900"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    />
                    {item.taxRate === 0 && (
                      <select 
                        className="w-full text-[10px] p-1 bg-amber-50 border border-amber-100 rounded-sm text-amber-900 outline-none mt-1"
                        value={item.exemptionReason || ''}
                        onChange={(e) => handleItemChange(item.id, 'exemptionReason', e.target.value)}
                      >
                        <option value="">Selecionar motivo isenção...</option>
                        {EXEMPTION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    )}
                  </div>
                  <div className="col-span-2 p-2 border-r border-gray-100">
                    <input 
                      type="number" 
                      min="1"
                      className="w-full p-1 text-right bg-transparent border-b border-transparent focus:border-blue-600 outline-none text-sm font-mono"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2 p-2 border-r border-gray-100">
                    <input 
                      type="number" 
                      min="0"
                      className="w-full p-1 text-right bg-transparent border-b border-transparent focus:border-blue-600 outline-none text-sm font-mono"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2 p-2 border-r border-gray-100 hidden md:block">
                     <select 
                      className="w-full p-1 text-right bg-transparent outline-none text-xs"
                      value={item.taxRate}
                      onChange={(e) => handleItemChange(item.id, 'taxRate', parseInt(e.target.value))}
                    >
                      <option value={TaxRate.Standard}>14%</option>
                      <option value={TaxRate.Reduced}>7%</option>
                      <option value={TaxRate.Exempt}>0%</option>
                    </select>
                  </div>
                  <div className="col-span-4 md:col-span-2 p-2 flex items-center justify-end space-x-2">
                    <span className="text-sm font-mono font-medium text-gray-900">
                      {(item.quantity * item.unitPrice).toLocaleString('pt-AO')}
                    </span>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all rounded hover:bg-red-50"
                      disabled={items.length === 1}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-2 border-t border-gray-100 bg-gray-50/50">
              <button 
                onClick={addItem}
                className="flex items-center space-x-2 text-blue-700 text-xs font-bold uppercase tracking-wide hover:text-blue-800 p-2 hover:bg-blue-50 rounded-sm transition-colors"
              >
                <Plus size={14} />
                <span>Adicionar Linha</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-end items-end gap-6">
             {/* Notes / Observations could go here */}
            <div className="w-full md:w-80 bg-gray-50 p-6 rounded-sm border border-gray-200 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-mono">{totals.subtotal.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Imposto (IVA)</span>
                <span className="font-mono">{totals.taxTotal.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</span>
              </div>
              <div className="border-t border-gray-300 my-2 pt-2 flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">Total Geral</span>
                <span className="text-xl font-bold text-gray-900 font-mono">
                  {totals.total.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;