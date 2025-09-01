import { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateUser, uploadAvatar, deleteAvatar } from '../services/supabase';
import { Avatar } from '../components/common/Avatar';

export const Profile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    instituicao: user?.instituicao || '',
    telefone: user?.telefone || '',
    bio: user?.bio || '',
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email) {
      setError('Nome e email são obrigatórios');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await updateUser(user.id, formData);
      setSuccess('Perfil atualizado com sucesso!');
      setEditing(false);
      
      // Auto-hide success message
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Erro ao atualizar perfil: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    if (editing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🔄 Profile: Iniciando upload de avatar...');
      const newAvatarUrl = await uploadAvatar(user.id, file);
      console.log('✅ Profile: Upload concluído, nova URL:', newAvatarUrl);
      setSuccess('Foto atualizada com sucesso!');
      
      // Recarregar página para mostrar nova foto
      setTimeout(() => {
        console.log('🔄 Profile: Recarregando página...');
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error('❌ Profile: Erro no upload:', err);
      setError('Erro ao fazer upload da foto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Deseja remover sua foto de perfil?')) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteAvatar(user.id, user.avatar_url || undefined);
      setSuccess('Foto removida com sucesso!');
      
      // Recarregar página para atualizar avatar
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      setError('Erro ao remover foto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-2xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <Avatar
                src={user.avatar_url}
                name={user.nome}
                size="xl"
                onClick={editing ? handleAvatarClick : undefined}
                className={editing ? 'ring-4 ring-primary-100' : ''}
              />
              
              {editing && (
                <div className="absolute -bottom-2 -right-2 flex space-x-1">
                  <button
                    onClick={handleAvatarClick}
                    className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
                    title="Alterar foto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  
                  {user.avatar_url && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                      title="Remover foto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900">{user.nome}</h1>
            <p className="text-gray-600">{user.email}</p>
            
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  user.tipo === 'demo'
                  ? 'bg-orange-100 text-orange-800'
                  : user.tipo === 'coordenador'
                  ? 'bg-indigo-100 text-indigo-800'
                  : user.tipo === 'pesquisador'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.tipo === 'demo' ? 'Demonstração' :
                   user.tipo === 'coordenador' ? 'Coordenador' :
                   user.tipo === 'pesquisador' ? 'Pesquisador' :
                   'Extensionista'}
                </span>
                {user.is_admin && (
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                    Administrador
                  </span>
                )}
                {user.is_root && (
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                    Root
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editing ? 'Editando Perfil' : 'Informações do Perfil'}
            </h2>
            
            <div className="flex space-x-3">
              {editing ? (
                <>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        nome: user.nome || '',
                        email: user.email || '',
                        instituicao: user.instituicao || '',
                        telefone: user.telefone || '',
                        bio: user.bio || '',
                      });
                      setError(null);
                      setSuccess(null);
                    }}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Editar</span>
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user.nome}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instituição
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.instituicao}
                    onChange={(e) => setFormData(prev => ({ ...prev, instituicao: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user.instituicao || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user.telefone || '-'}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Conte um pouco sobre você..."
                />
              ) : (
                <p className="text-gray-900 py-2 whitespace-pre-wrap">
                  {user.bio || 'Nenhuma biografia informada.'}
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Informações do Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Criado em:</span>{' '}
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </div>
                <div>
                  <span className="font-medium">Última atualização:</span>{' '}
                  {new Date(user.updated_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          </form>
        </div>

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
  );
};