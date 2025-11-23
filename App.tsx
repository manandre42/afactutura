import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import InvoiceForm from './components/InvoiceForm';
import Clients from './components/Clients';
import Login from './components/Login';
import Settings from './components/Settings';
import { Invoice, Client, CompanyProfile } from './types';
import { MOCK_CLIENTS, DEFAULT_COMPANY } from './constants';
import { Menu, X } from 'lucide-react';
import { db } from './db';
import { logAction } from './utils/security';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // State for data
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(DEFAULT_COMPANY);
  const [isLoading, setIsLoading] = useState(true);
  
  // Navigation State
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load data from IndexedDB
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const dbInvoices = await db.invoices.toArray();
        const dbClients = await db.clients.toArray();
        const dbSettings = await db.settings.get('profile');

        if (dbSettings && dbSettings.value) {
          setCompanyProfile(dbSettings.value);
        } else {
          // Init default settings if empty
          await db.settings.put({ key: 'profile', value: DEFAULT_COMPANY });
        }

        if (dbClients.length === 0) {
          await db.clients.bulkAdd(MOCK_CLIENTS);
          setClients(MOCK_CLIENTS);
        } else {
          setClients(dbClients);
        }

        if (dbInvoices.length === 0) {
          setInvoices([]); 
        } else {
          setInvoices(dbInvoices.sort((a, b) => b.number - a.number));
        }
      } catch (error) {
        console.error("Failed to load data from DB", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated]);

  const handleLogin = async () => {
    setIsAuthenticated(true);
    await logAction('LOGIN', 'User logged in successfully');
  };

  const handleLogout = async () => {
    await logAction('LOGOUT', 'User logged out');
    setIsAuthenticated(false);
    setCurrentView('dashboard');
    setIsMobileMenuOpen(false);
  };

  const handleSaveInvoice = async (invoice: Invoice) => {
    try {
      await db.invoices.add(invoice);
      setInvoices([invoice, ...invoices]);
      await logAction('INVOICE_CREATE', `Invoice ${invoice.series}/${invoice.number} created with status ${invoice.status}`);
      setCurrentView('invoices');
    } catch (error) {
      console.error("Error saving invoice", error);
      alert("Erro ao guardar fatura.");
    }
  };

  const handleAddClient = async (client: Client) => {
    try {
      await db.clients.add(client);
      setClients([client, ...clients]);
      await logAction('CLIENT_ADD', `Client ${client.name} added`);
    } catch (error) {
      console.error("Error saving client", error);
    }
  };
  
  const handleUpdateProfile = (profile: CompanyProfile) => {
    setCompanyProfile(profile);
  };

  // Login Screen
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    if (isLoading) {
      return <div className="flex h-full items-center justify-center text-gray-500 font-mono text-sm">Carregando dados...</div>;
    }

    switch(currentView) {
      case 'dashboard':
        return <Dashboard invoices={invoices} />;
      case 'invoices':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Faturas</h2>
                <p className="text-sm text-gray-500">Gestão de documentos fiscais de: <span className="font-bold text-gray-700">{companyProfile.name}</span></p>
              </div>
              <button 
                onClick={() => setCurrentView('new-invoice')}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-sm shadow-sm hover:bg-blue-700 transition-colors font-medium text-sm flex items-center"
              >
                + Nova Fatura
              </button>
            </div>
            <InvoiceList invoices={invoices} companyProfile={companyProfile} />
          </div>
        );
      case 'new-invoice':
        return (
          <InvoiceForm 
            clients={clients} 
            onSave={handleSaveInvoice}
            onCancel={() => setCurrentView('invoices')}
            nextInvoiceNumber={invoices.length > 0 ? (Math.max(...invoices.map(i => i.number || 0)) + 1) : 1}
          />
        );
      case 'clients':
        return <Clients clients={clients} onAddClient={handleAddClient} />;
      case 'settings':
        return <Settings currentProfile={companyProfile} onUpdateProfile={handleUpdateProfile} />;
      default:
        return <Dashboard invoices={invoices} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-gray-900 text-white px-4 py-3 z-50 flex justify-between items-center shadow-md">
        <h1 className="font-semibold text-lg flex items-center gap-2 tracking-tight">
          <span className="bg-blue-600 w-6 h-6 flex items-center justify-center font-bold text-xs">A</span> 
          AFACTURA
        </h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 rounded hover:bg-gray-800">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`
        fixed inset-y-0 left-0 z-[60] w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out shadow-2xl
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-auto md:shadow-none
      `}>
         <Sidebar 
            currentView={currentView} 
            onChangeView={(view) => {
              setCurrentView(view);
              setIsMobileMenuOpen(false);
            }} 
            onLogout={handleLogout}
         />
      </div>

      <main className="flex-1 overflow-y-auto h-full w-full">
        <div className="md:hidden h-14"></div>
        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20">
          {renderView()}
        </div>
      </main>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[55] md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default App;