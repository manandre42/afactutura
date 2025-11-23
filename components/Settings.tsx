
import React, { useState, useEffect } from 'react';
import { CompanyProfile, AuditLog } from '../types';
import { Save, Shield, Database, FileText, AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { db } from '../db';
import { logAction, createSecureBackup } from '../utils/security';

interface SettingsProps {
  currentProfile: CompanyProfile;
  onUpdateProfile: (profile: CompanyProfile) => void;
}

const Settings: React.FC<SettingsProps> = ({ currentProfile, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'company' | 'security' | 'logs'>('company');
  const [profile, setProfile] = useState<CompanyProfile>(currentProfile);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [backupPassword, setBackupPassword] = useState('');
  const [isBackupLoading, setIsBackupLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs();
    }
  }, [activeTab]);

  const loadLogs = async () => {
    const l = await db.logs.orderBy('timestamp').reverse().limit(100).toArray();
    setLogs(l);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.settings.put({ key: 'profile', value: profile });
      onUpdateProfile(profile);
      await logAction('SETTINGS_UPDATE', 'Company profile updated');
      alert('Definições guardadas com sucesso.');
    } catch (err) {
      console.error(err);
      alert('Erro ao guardar.');
    }
  };

  const handleBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (backupPassword.length < 8) {
      alert("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    
    setIsBackupLoading(true);
    try {
      await createSecureBackup(backupPassword);
      setBackupPassword('');
    } catch (error) {
      alert("Falha ao criar backup.");
    } finally {
      setIsBackupLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200 animate-fade-in">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('company')}
            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'company' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText size={16} />
              <span>Dados da Empresa</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'security' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Shield size={16} />
              <span>Segurança e Backups</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'logs' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Database size={16} />
              <span>Logs de Auditoria</span>
            </div>
          </button>
        </nav>
      </div>

      <div className="p-6 md:p-8">
        {activeTab === 'company' && (
          <form onSubmit={handleProfileSave} className="max-w-2xl space-y-6">
            <div className="bg-blue-50 p-4 rounded-sm border border-blue-100 flex items-start gap-3">
              <AlertTriangle className="text-blue-600 shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-blue-800">
                <p className="font-bold">Atenção:</p>
                <p>Estes dados aparecerão no cabeçalho de todas as faturas e arquivos XML/JSON exportados para a AGT.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nome da Empresa (Razão Social)</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-600 outline-none"
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">NIF</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-600 outline-none font-mono"
                  value={profile.nif}
                  onChange={e => setProfile({...profile, nif: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Regime IVA</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-600 outline-none"
                  value={profile.regime}
                  onChange={e => setProfile({...profile, regime: e.target.value as any})}
                >
                  <option value="Geral">Regime Geral</option>
                  <option value="Simplificado">Regime Simplificado</option>
                  <option value="Exclusão">Regime de Exclusão</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Morada Completa</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-600 outline-none"
                  rows={2}
                  value={profile.address}
                  onChange={e => setProfile({...profile, address: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full p-2 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-600 outline-none"
                  value={profile.email}
                  onChange={e => setProfile({...profile, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Telefone</label>
                <input 
                  type="tel" 
                  className="w-full p-2 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-600 outline-none"
                  value={profile.phone}
                  onChange={e => setProfile({...profile, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-sm font-medium transition-colors"
              >
                <Save size={18} />
                <span>Guardar Alterações</span>
              </button>
            </div>
          </form>
        )}

        {activeTab === 'security' && (
          <div className="max-w-2xl space-y-8">
            <div className="border border-gray-200 rounded-sm p-6 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Shield size={20} className="text-emerald-600" />
                Criptografia e Backup Seguro
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Gere uma cópia de segurança completa (faturas, clientes e logs) encriptada com <strong>AES-256</strong>. 
                Este arquivo só poderá ser restaurado com a senha definida abaixo.
              </p>

              <form onSubmit={handleBackup} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Definir Senha do Backup</label>
                  <input 
                    type="password" 
                    required
                    minLength={8}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full p-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-600 outline-none"
                    value={backupPassword}
                    onChange={e => setBackupPassword(e.target.value)}
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={isBackupLoading}
                  className="flex items-center justify-center space-x-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-sm font-medium transition-colors w-full disabled:opacity-70"
                >
                  {isBackupLoading ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  <span>{isBackupLoading ? 'A encriptar dados...' : 'Baixar Backup Encriptado (.enc)'}</span>
                </button>
              </form>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-gray-900">Compliance & Retenção</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Dados são armazenados localmente (IndexedDB).</li>
                <li>Logs de auditoria são imutáveis (append-only).</li>
                <li>A retenção legal recomendada é de 10 anos (Lei Geral Tributária).</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-700 uppercase">Últimos 100 Registos</h3>
              <button onClick={loadLogs} className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                <RefreshCw size={14} /> Atualizar
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-xs uppercase text-gray-500 font-bold">
                  <tr>
                    <th className="px-4 py-3">Data/Hora</th>
                    <th className="px-4 py-3">Utilizador</th>
                    <th className="px-4 py-3">Ação</th>
                    <th className="px-4 py-3">Detalhe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.length === 0 ? (
                    <tr><td colSpan={4} className="p-4 text-center text-gray-400">Sem registos.</td></tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString('pt-AO')}
                        </td>
                        <td className="px-4 py-2 text-gray-700">{log.user}</td>
                        <td className="px-4 py-2 font-semibold text-gray-800">{log.action}</td>
                        <td className="px-4 py-2 text-gray-600">{log.detail}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
