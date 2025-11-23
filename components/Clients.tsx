import React, { useState } from 'react';
import { Client } from '../types';
import { Search, Plus, User, Mail, Phone, MapPin } from 'lucide-react';

interface ClientsProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
}

const Clients: React.FC<ClientsProps> = ({ clients, onAddClient }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.nif.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClient.name && newClient.nif) {
      onAddClient({
        id: Date.now().toString(),
        name: newClient.name,
        nif: newClient.nif,
        email: newClient.email || '',
        phone: newClient.phone || '',
        address: newClient.address || ''
      });
      setNewClient({});
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Clientes</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-sm transition-colors"
        >
          <Plus size={18} />
          <span>Novo Cliente</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou NIF..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                <User size={24} />
              </div>
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">NIF: {client.nif}</span>
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">{client.name}</h3>
            <div className="space-y-2 text-sm text-slate-500">
              <div className="flex items-center space-x-2">
                <Mail size={14} />
                <span>{client.email || 'Sem email'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={14} />
                <span>{client.phone || 'Sem telefone'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={14} />
                <span className="truncate">{client.address || 'Sem morada'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Adicionar Cliente</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                <input required type="text" className="w-full border p-2 rounded-lg outline-none focus:border-blue-500" value={newClient.name || ''} onChange={e => setNewClient({...newClient, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NIF *</label>
                <input required type="text" className="w-full border p-2 rounded-lg outline-none focus:border-blue-500" value={newClient.nif || ''} onChange={e => setNewClient({...newClient, nif: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" className="w-full border p-2 rounded-lg outline-none focus:border-blue-500" value={newClient.email || ''} onChange={e => setNewClient({...newClient, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                  <input type="tel" className="w-full border p-2 rounded-lg outline-none focus:border-blue-500" value={newClient.phone || ''} onChange={e => setNewClient({...newClient, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Morada</label>
                <textarea className="w-full border p-2 rounded-lg outline-none focus:border-blue-500" rows={2} value={newClient.address || ''} onChange={e => setNewClient({...newClient, address: e.target.value})} />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
