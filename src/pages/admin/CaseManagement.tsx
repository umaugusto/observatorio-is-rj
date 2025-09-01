import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCasos, deleteCaso, toggleCasoStatus } from '../../services/supabase';
import { ROUTES, CATEGORIES } from '../../utils/constants';
import type { CasoInovacao } from '../../types';

export const CaseManagement = () => {
  const [casos, setCasos] = useState<CasoInovacao[]>([]);
  const [filteredCasos, setFilteredCasos] = useState<CasoInovacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const loadCasos = async () => {
    try {
      setLoading(true);
      const data = await getAllCasos();
      setCasos(data);
      setFilteredCasos(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar casos');
      console.error('Erro ao carregar casos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCasos();
  }, []);

  useEffect(() => {
    let filtered = casos;

    if (selectedCategory) {
      filtered = filtered.filter(caso => caso.categoria === selectedCategory);
    }

    if (selectedStatus) {
      if (selectedStatus === 'published') {
        filtered = filtered.filter(caso => caso.status_ativo);
      } else if (selectedStatus === 'draft') {
        filtered = filtered.filter(caso => !caso.status_ativo);
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(caso =>
        caso.titulo.toLowerCase().includes(term) ||
        caso.descricao.toLowerCase().includes(term) ||
        caso.localizacao?.toLowerCase().includes(term) ||
        caso.extensionista?.nome.toLowerCase().includes(term)
      );
    }

    setFilteredCasos(filtered);
  }, [casos, selectedCategory, selectedStatus, searchTerm]);

  const handleEdit = (casoId: string) => {
    navigate(`${ROUTES.ADMIN_CASE_EDIT}/${casoId}`);
  };

  const handleToggleStatus = async (casoId: string, currentStatus: boolean) => {
    try {
      await toggleCasoStatus(casoId, !currentStatus);
      await loadCasos(); // Recarregar lista
    } catch (error: any) {
      alert(`Erro ao alterar status: ${error.message}`);
    }
  };

  const handleDelete = async (casoId: string, titulo: string) => {
    if (!confirm(`Tem certeza que deseja excluir o caso "${titulo}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await deleteCaso(casoId);
      await loadCasos(); // Recarregar lista
    } catch (error: any) {
      alert(`Erro ao excluir caso: ${error.message}`);
    }
  };

  const handleCreateNew = () => {
    navigate(`${ROUTES.ADMIN_CASE_EDIT}/novo`);
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestão de Casos
            </h1>
            <p className="text-gray-600">
              Gerencie todos os casos de inovação social cadastrados
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="btn-primary"
          >
            Novo Caso
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar casos
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Título, descrição, localização..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas as categorias</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos os status</option>
                <option value="published">Publicados</option>
                <option value="draft">Rascunhos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredCasos.length} caso(s) encontrado(s)
            {selectedCategory && ` na categoria "${selectedCategory}"`}
            {selectedStatus && ` com status "${selectedStatus === 'published' ? 'Publicado' : 'Rascunho'}"`}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadCasos}
              className="mt-2 text-red-700 underline hover:no-underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Cases Table */}
        {filteredCasos.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Caso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Extensionista
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCasos.map((caso) => (
                    <tr key={caso.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {caso.imagem_url ? (
                            <img
                              src={caso.imagem_url}
                              alt={caso.titulo}
                              className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-gray-400 text-xs font-medium">
                                {caso.categoria.substring(0, 3)}
                              </span>
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">
                              {caso.titulo}
                            </div>
                            <div className="text-sm text-gray-500">
                              {caso.localizacao}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {caso.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {caso.extensionista?.nome || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          caso.status_ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {caso.status_ativo ? 'Publicado' : 'Rascunho'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(caso.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(caso.id)}
                            className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Editar caso"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleToggleStatus(caso.id, caso.status_ativo)}
                            className={`p-2 rounded-lg transition-colors ${
                              caso.status_ativo
                                ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50'
                                : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            }`}
                            title={caso.status_ativo ? 'Despublicar caso' : 'Publicar caso'}
                          >
                            {caso.status_ativo ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDelete(caso.id, caso.titulo)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir caso"
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
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum caso encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              {casos.length === 0 
                ? 'Ainda não há casos cadastrados no sistema.'
                : 'Nenhum caso corresponde aos filtros aplicados.'
              }
            </p>
            <button
              onClick={handleCreateNew}
              className="btn-primary"
            >
              Criar Primeiro Caso
            </button>
          </div>
        )}
      </div>
    </div>
  );
};