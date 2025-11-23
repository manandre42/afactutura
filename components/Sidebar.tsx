import React from 'react';
import { LayoutDashboard, FileText, Users, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'invoices', label: 'Faturas', icon: <FileText size={20} /> },
    { id: 'clients', label: 'Clientes', icon: <Users size={20} /> },
    { id: 'settings', label: 'Definições', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="flex flex-col h-full bg-gray-900 text-gray-300 border-r border-gray-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-800 flex-shrink-0">
        <h1 className="text-xl font-bold text-white flex items-center space-x-2 tracking-tight">
          <span className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white font-black text-sm">A</span>
          <span>AFACTURA</span>
        </h1>
        <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-semibold">Faturação AGT</p>
      </div>

      {/* Navigation - Flex 1 to take available space */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-sm transition-all duration-200 group ${
              currentView === item.id 
                ? 'bg-blue-700 text-white shadow-md' 
                : 'hover:bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <span className={`${currentView === item.id ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
              {item.icon}
            </span>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer / Logout - Fixed at bottom via flex */}
      <div className="p-4 border-t border-gray-800 bg-gray-900 flex-shrink-0">
        <div className="bg-gray-800 p-3 rounded-sm mb-3 border border-gray-700">
          <div className="flex items-center space-x-2">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-xs font-mono text-gray-300">ONLINE</span>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 text-gray-400 hover:text-white hover:bg-red-900/30 px-4 py-3 rounded-sm text-sm transition-colors border border-transparent hover:border-red-900/50"
        >
          <LogOut size={18} />
          <span className="font-medium">Terminar Sessão</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;