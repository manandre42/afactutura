import React, { useState } from 'react';
import { Lock, User, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200">
        <div className="bg-gray-900 p-8 pt-10 text-center border-b-4 border-blue-600">
          <div className="w-12 h-12 bg-white rounded-sm flex items-center justify-center text-blue-700 font-black text-xl mx-auto mb-4 shadow-sm">
            A
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AFACTURA</h1>
          <p className="text-gray-400 mt-1 text-xs uppercase tracking-widest font-semibold">Acesso ao Sistema</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Identificação</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors text-sm"
                  placeholder="Email ou NIF"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Palavra-passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-sm transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <span className="text-sm">A processar...</span>
              ) : (
                <>
                  <span className="text-sm">Entrar na Conta</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            
            <div className="text-center mt-6 pt-4 border-t border-gray-100">
              <a href="#" className="text-xs text-blue-600 hover:underline font-medium">Esqueceu a palavra-passe?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;