import { useState, useEffect, useRef } from 'react';
import { getAllUsers, updateUser, deleteUser, toggleUserStatus, uploadAvatarOnly, createUserWithPassword, resetUserPassword as resetToDefaultPassword } from '../../services/supabase';
import { formatTelefone } from '../../utils/formatters';
import { Avatar } from '../../components/common/Avatar';
import type { User } from '../../types';

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Carregar usuários
  const loadUsers = async () => {
    try {
      setLoading(true);
      const userData = await getAllUsers();
      setUsers(userData);
      setError(null);
    } catch (err: any) {
      setError('Erro ao carregar usuários: ' + err.message);
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Alternar status do usuário
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus(userId, !currentStatus);
      await loadUsers(); // Recarregar lista
    } catch (err: any) {
      setError('Erro ao alterar status: ' + err.message);
    }
  };

  // Excluir usuário
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await deleteUser(userId);
      await loadUsers(); // Recarregar lista
    } catch (err: any) {
      setError('Erro ao excluir usuário: ' + err.message);
    }
  };

  // Enviar email de reset de senha
  const handleResetPassword = async (userId: string, userName: string, userEmail: string) => {
    if (!confirm(`Enviar email de redefinição de senha para "${userName}" (${userEmail})?`)) {
      return;
    }

    try {
      await resetToDefaultPassword(userId, userEmail);
      alert(`Email de redefinição de senha enviado para ${userEmail}. O usuário receberá instruções para criar uma nova senha.`);
      await loadUsers(); // Recarregar lista
    } catch (err: any) {
      setError('Erro ao enviar email de reset: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
              <p className="text-gray-600 mt-2">
                Gerencie extensionistas e administradores do sistema
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Novo Usuário</span>
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tabela de usuários */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Usuários ({users.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo / Permissões
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instituição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={user.avatar_url}
                          name={user.nome}
                          size="md"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.nome}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.tipo === 'demo'
                          ? 'bg-orange-100 text-orange-800'
                          : user.tipo === 'coordenador'
                          ? 'bg-indigo-100 text-indigo-800'
                          : user.tipo === 'pesquisador'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.tipo === 'demo' ? 'Demo' :
                           user.tipo === 'coordenador' ? 'Coordenador' :
                           user.tipo === 'pesquisador' ? 'Pesquisador' :
                           'Extensionista'}
                        </span>
                        {user.is_admin && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        )}
                        {user.is_root && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Root
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.instituicao || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="inline-flex items-center justify-center w-8 h-8 text-primary-600 bg-primary-50 hover:bg-primary-100 hover:text-primary-700 rounded-full transition-colors"
                          title="Editar usuário"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.id, user.nome, user.email)}
                          className="inline-flex items-center justify-center w-8 h-8 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-full transition-colors"
                          title="Enviar email de redefinição de senha"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id, user.ativo)}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                            user.ativo 
                              ? 'text-orange-600 bg-orange-50 hover:bg-orange-100 hover:text-orange-700' 
                              : 'text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700'
                          }`}
                          title={user.ativo ? 'Desativar usuário' : 'Ativar usuário'}
                        >
                          {user.ativo ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.nome)}
                          className="inline-flex items-center justify-center w-8 h-8 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-full transition-colors"
                          title="Excluir usuário"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <p className="text-lg">Nenhum usuário encontrado</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para criar/editar usuário */}
      {(showCreateModal || editingUser) && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setShowCreateModal(false);
            setEditingUser(null);
          }}
          onSave={loadUsers}
          onError={setError}
        />
      )}
    </div>
  );
};

// Modal para criar/editar usuário
interface UserModalProps {
  user?: User | null;
  onClose: () => void;
  onSave: () => void;
  onError: (error: string) => void;
}

const UserModal = ({ user, onClose, onSave, onError }: UserModalProps) => {
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    tipo: user?.tipo || 'extensionista' as 'extensionista' | 'pesquisador' | 'coordenador',
    is_admin: user?.is_admin ?? false,
    telefone: user?.telefone || '',
    bio: user?.bio || '',
    ativo: user?.ativo ?? true,
    // Campos de senha para criação
    password: '',
    confirmPassword: '',
    useDefaultPassword: true, // Por padrão, usar senha padrão
    must_change_password: true, // Por padrão, forçar troca
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(user?.avatar_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    try {
      // Usar função que não tenta atualizar o banco
      const avatarUrl = await uploadAvatarOnly(file, user?.id);
      setTempAvatarUrl(avatarUrl);
    } catch (err: any) {
      onError('Erro no upload da foto: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email) {
      onError('Nome e email são obrigatórios');
      return;
    }
    
    // Se não estiver usando senha padrão, validar senha customizada
    if (!user && !formData.useDefaultPassword) {
      if (!formData.password) {
        onError('Por favor, defina uma senha');
        return;
      }
      if (formData.password.length < 8) {
        onError('A senha deve ter pelo menos 8 caracteres');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        onError('As senhas não coincidem');
        return;
      }
      if (formData.password === '12345678') {
        onError('Por favor, escolha uma senha diferente da padrão');
        return;
      }
    }

    setSaving(true);
    try {
      if (user) {
        // Editar usuário existente
        const userData = { 
          nome: formData.nome,
          email: formData.email,
          tipo: formData.tipo,
          is_admin: formData.is_admin,
          telefone: formData.telefone,
          bio: formData.bio,
          ativo: formData.ativo,
          avatar_url: tempAvatarUrl,
          instituicao: 'UFRJ'
        };
        await updateUser(user.id, userData);
      } else {
        // Criar novo usuário
        await createUserWithPassword({
          email: formData.email,
          nome: formData.nome,
          tipo: formData.tipo,
          is_admin: formData.is_admin,
          password: formData.useDefaultPassword ? undefined : formData.password,
          must_change_password: formData.useDefaultPassword || formData.must_change_password,
          telefone: formData.telefone,
          bio: formData.bio,
          ativo: formData.ativo,
          avatar_url: tempAvatarUrl,
          instituicao: 'UFRJ'
        });
      }
      
      onSave();
      onClose();
    } catch (err: any) {
      onError('Erro ao salvar usuário: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {user ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <p className="text-primary-100 text-sm">
                {user ? 'Modifique as informações do usuário' : 'Adicione um novo usuário ao sistema'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Avatar Section */}
          <div className="flex justify-center mb-6">
            <div className="relative flex flex-col items-center group">
              <div className="relative">
                <Avatar
                  src={tempAvatarUrl}
                  name={formData.nome || 'Novo Usuário'}
                  size="xl"
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer hover:ring-4 hover:ring-primary-100 transition-all shadow-lg"
                />
                
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-b-transparent"></div>
                  </div>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 text-center mt-3 group-hover:text-primary-600 transition-colors" title="Clique para alterar foto de perfil">
                {tempAvatarUrl ? 'Clique para alterar foto' : 'Clique para adicionar foto'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informações Básicas
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: João da Silva"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="joao@ufrj.br"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Perfil e Acesso */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Perfil e Acesso
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Usuário
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'extensionista' | 'pesquisador' | 'coordenador' }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="extensionista">Extensionista</option>
                    <option value="pesquisador">Pesquisador</option>
                    <option value="coordenador">Coordenador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, ativo: true }))}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                        formData.ativo
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Ativo</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, ativo: false }))}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                        !formData.ativo
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Inativo</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Checkbox para permissões administrativas */}
              <div className="mt-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_admin}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_admin: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Conceder permissões administrativas
                  </span>
                </label>
                <p className="ml-7 text-xs text-gray-500 mt-1">
                  Permite criar/editar/excluir usuários e gerenciar o sistema
                </p>
              </div>
            </div>

            {/* Configuração de Senha (apenas para novos usuários) */}
            {!user && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Configuração de Senha
                </h4>
                
                {/* Opção de usar senha padrão ou customizada */}
                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        useDefaultPassword: true,
                        must_change_password: true,
                        password: '',
                        confirmPassword: ''
                      }))}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                        formData.useDefaultPassword
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="font-medium">Senha Padrão</span>
                        <span className="text-xs mt-1">12345678</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        useDefaultPassword: false,
                        must_change_password: false
                      }))}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                        !formData.useDefaultPassword
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        <span className="font-medium">Senha Personalizada</span>
                        <span className="text-xs mt-1">Definir agora</span>
                      </div>
                    </button>
                  </div>
                  
                  {/* Mostrar alerta baseado na escolha */}
                  {formData.useDefaultPassword ? (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">🔑</span>
                        <div>
                          <div className="font-semibold">Senha padrão será aplicada</div>
                          <div>O usuário receberá a senha <code className="bg-blue-100 px-1 rounded">12345678</code> e será obrigado a alterá-la no primeiro acesso.</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Campos de senha personalizada */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Senha
                          </label>
                          <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Mínimo 8 caracteres"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Senha
                          </label>
                          <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Digite a senha novamente"
                          />
                        </div>
                        
                        {/* Checkbox para forçar troca mesmo com senha personalizada */}
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.must_change_password}
                            onChange={(e) => setFormData(prev => ({ ...prev, must_change_password: e.target.checked }))}
                            className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Exigir alteração de senha no primeiro login
                          </span>
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Detalhes Adicionais */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Detalhes Adicionais
              </h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instituição
                    </label>
                    <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-700 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      UFRJ
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefone: formatTelefone(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="(21) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografia
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Conte um pouco sobre o usuário, sua área de atuação, experiência, etc."
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  disabled={saving || uploadingAvatar}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-50"
                  disabled={saving || uploadingAvatar}
                >
                  {saving ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-b-transparent mr-2"></div>
                      Salvando...
                    </div>
                  ) : (
                    user ? 'Salvar Alterações' : 'Criar Usuário'
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};