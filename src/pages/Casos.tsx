import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getCasos, getCasosByCategory } from '../services/supabase';
import { CATEGORIES } from '../utils/constants';
import type { CasoInovacao } from '../types';

const getCategoryIcon = (categoria: string): string => {
  const icons: Record<string, string> = {
    'Educação': '🎓',
    'Saúde': '🏥',
    'Meio Ambiente': '🌱',
    'Cultura': '🎭',
    'Tecnologia': '💻',
    'Empreendedorismo': '🚀',
    'Inclusão Social': '🤝',
    'Urbanismo': '🏙️',
    'Alimentação': '🍽️',
    'Esporte': '⚽',
  };
  return icons[categoria] || '📋';
};

// Card aprimorado para a tela de casos
const EnhancedCaseCard = ({ caso }: { caso: CasoInovacao }) => {
  const navigate = useNavigate();
  
  const getLocationString = () => {
    if (caso.cidade) {
      const parts = [];
      if (caso.bairro) parts.push(caso.bairro);
      parts.push(caso.cidade);
      if (caso.estado) parts.push(caso.estado);
      return parts.join(', ');
    }
    return caso.localizacao || 'Localização não informada';
  };

  // URLs de exemplo caso não tenha imagem
  const getImageUrl = () => {
    if (caso.imagem_url) return caso.imagem_url;
    
    // Imagens de fallback por categoria
    const fallbackImages: Record<string, string> = {
      'Educação': 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=400&h=300&fit=crop&crop=center',
      'Saúde': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
      'Meio Ambiente': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center',
      'Cultura': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop&crop=center',
      'Tecnologia': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop&crop=center',
      'Empreendedorismo': 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400&h=300&fit=crop&crop=center',
    };
    
    return fallbackImages[caso.categoria] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop&crop=center';
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden h-[420px] flex flex-col"
      onClick={() => navigate(`/caso/${caso.id}`)}
    >
      {/* Imagem de destaque */}
      <div className="relative h-48 bg-gray-200 overflow-hidden flex-shrink-0">
        <img
          src={getImageUrl()}
          alt={caso.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback para gradiente se a imagem não carregar
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
          }}
        />
        <div className="hidden absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <span className="text-primary-600 font-semibold text-lg">{getCategoryIcon(caso.categoria)}</span>
        </div>
        
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-600 text-white">
            {caso.categoria}
          </span>
        </div>
        
        {!caso.status_ativo && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 text-white">
              Rascunho
            </span>
          </div>
        )}
      </div>
      
      {/* Conteúdo com layout flex */}
      <div className="p-6 flex flex-col flex-1">
        {/* Seção superior - título e descrição */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-primary-700 transition-colors">
            {caso.titulo}
          </h3>
          
          {/* Caixa de descrição com altura fixa */}
          <div className="h-16 mb-4">
            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
              {caso.resumo || caso.descricao}
            </p>
          </div>
        </div>
        
        {/* Seção inferior - informações fixas */}
        <div className="flex-shrink-0">
          {/* Informações de rodapé */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center text-gray-500 text-sm">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="truncate">{getLocationString()}</span>
            </div>
            
            {caso.extensionista && (
              <div className="text-gray-400 text-xs font-medium ml-2 truncate">
                {caso.extensionista.nome.split(' ')[0]}
              </div>
            )}
          </div>
          
          {/* Indicadores de impacto */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 min-h-[32px]">
            {caso.pessoas_impactadas && (
              <div className="flex items-center text-xs text-gray-500">
                <span className="mr-1">👥</span>
                {caso.pessoas_impactadas.toLocaleString()} pessoas
              </div>
            )}
            {caso.orcamento && (
              <div className="flex items-center text-xs text-gray-500">
                <span className="mr-1">💰</span>
                R$ {(caso.orcamento / 1000).toFixed(0)}k
              </div>
            )}
            {!caso.pessoas_impactadas && !caso.orcamento && (
              <div className="text-xs text-gray-400 italic">
                Dados de impacto não informados
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Casos = () => {
  const [searchParams] = useSearchParams();
  const [casos, setCasos] = useState<CasoInovacao[]>([]);
  const [filteredCasos, setFilteredCasos] = useState<CasoInovacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('categoria') || '');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [paginatedCasos, setPaginatedCasos] = useState<CasoInovacao[]>([]);

  useEffect(() => {
    const loadCasos = async () => {
      try {
        const data = await getCasos();
        setCasos(data);
        setFilteredCasos(data);
      } catch (err) {
        setError('Erro ao carregar casos de inovação');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCasos();
  }, []);

  useEffect(() => {
    let filtered = casos;

    if (selectedCategory) {
      filtered = filtered.filter(caso => caso.categoria === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(caso =>
        caso.titulo.toLowerCase().includes(term) ||
        caso.descricao.toLowerCase().includes(term) ||
        (caso.localizacao && caso.localizacao.toLowerCase().includes(term)) ||
        (caso.cidade && caso.cidade.toLowerCase().includes(term)) ||
        (caso.bairro && caso.bairro.toLowerCase().includes(term)) ||
        (caso.estado && caso.estado.toLowerCase().includes(term)) ||
        (caso.extensionista?.nome && caso.extensionista.nome.toLowerCase().includes(term))
      );
    }

    setFilteredCasos(filtered);
    setCurrentPage(1); // Reset para primeira página quando filtros mudam
  }, [casos, selectedCategory, searchTerm]);

  // Paginação dos casos filtrados
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedCasos(filteredCasos.slice(startIndex, endIndex));
  }, [filteredCasos, currentPage, itemsPerPage]);

  const handleCategoryFilter = async (category: string) => {
    if (category === selectedCategory) {
      setSelectedCategory('');
      return;
    }

    setSelectedCategory(category);
    setLoading(true);

    try {
      const data = category ? await getCasosByCategory(category) : await getCasos();
      setCasos(data);
    } catch (err) {
      setError('Erro ao filtrar casos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Casos de Inovação Social
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Explore todas as iniciativas de inovação social catalogadas 
            por extensionistas universitários no Rio de Janeiro.
          </p>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
          {/* Search Bar */}
          <div className="p-6 border-b border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Busque por título, descrição, localização ou extensionista..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Category Filters */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Filtrar por categoria</h3>
              {selectedCategory && (
                <button
                  onClick={() => handleCategoryFilter('')}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Limpar filtro
                </button>
              )}
            </div>
            
            {/* Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {CATEGORIES.map((category) => {
                const categoryCount = casos.filter(caso => caso.categoria === category).length;
                const isActive = selectedCategory === category;
                
                return (
                  <button
                    key={category}
                    onClick={() => {
                      if (isActive) {
                        // Se já está ativo, remove o filtro
                        handleCategoryFilter('');
                      } else {
                        // Se não está ativo, aplica o filtro
                        handleCategoryFilter(category);
                      }
                    }}
                    disabled={categoryCount === 0}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all duration-200 text-left group
                      ${isActive
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : categoryCount > 0
                          ? 'border-gray-200 hover:border-primary-200 hover:bg-primary-25 hover:shadow-sm'
                          : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-2xl ${categoryCount === 0 ? 'grayscale' : ''}`}>
                        {getCategoryIcon(category)}
                      </span>
                      {categoryCount > 0 && (
                        <span className={`
                          text-xs px-2 py-1 rounded-full font-medium
                          ${isActive 
                            ? 'bg-primary-100 text-primary-700' 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-primary-100 group-hover:text-primary-700'
                          }
                        `}>
                          {categoryCount}
                        </span>
                      )}
                    </div>
                    
                    <div className={`
                      text-sm font-medium mb-1
                      ${isActive 
                        ? 'text-primary-900' 
                        : categoryCount > 0 
                          ? 'text-gray-900 group-hover:text-primary-700' 
                          : 'text-gray-400'
                      }
                    `}>
                      {category}
                    </div>
                    
                    <div className={`
                      text-xs
                      ${isActive 
                        ? 'text-primary-600' 
                        : categoryCount > 0 
                          ? 'text-gray-500 group-hover:text-primary-500' 
                          : 'text-gray-300'
                      }
                    `}>
                      {categoryCount === 0 ? 'Nenhum caso' : `${categoryCount} caso${categoryCount !== 1 ? 's' : ''}`}
                    </div>

                    {isActive && (
                      <div className="absolute -top-1 -right-1">
                        <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Header with Pagination Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <p className="text-gray-600 text-lg font-medium">
              {loading ? 'Carregando...' : `${filteredCasos.length} caso(s) encontrado(s)`}
              {selectedCategory && ` na categoria "${selectedCategory}"`}
              {searchTerm && ` para "${searchTerm}"`}
            </p>
            {!loading && filteredCasos.length > 0 && (
              <p className="text-gray-500 text-sm mt-1">
                Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCasos.length)} - {Math.min(currentPage * itemsPerPage, filteredCasos.length)} de {filteredCasos.length}
              </p>
            )}
          </div>
          
          {!loading && filteredCasos.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="itemsPerPage" className="text-sm font-medium text-gray-700">
                  Por página:
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Cases Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : paginatedCasos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedCasos.map((caso) => (
                <EnhancedCaseCard key={caso.id} caso={caso} />
              ))}
            </div>
            
            {/* Pagination */}
            {filteredCasos.length > itemsPerPage && (
              <div className="flex items-center justify-center mt-12 gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                {Array.from({ length: Math.ceil(filteredCasos.length / itemsPerPage) }, (_, i) => {
                  const page = i + 1;
                  const isCurrentPage = page === currentPage;
                  const showPage = page === 1 || page === Math.ceil(filteredCasos.length / itemsPerPage) || 
                                 Math.abs(page - currentPage) <= 2;
                                 
                  if (!showPage && page !== currentPage - 3 && page !== currentPage + 3) {
                    return null;
                  }
                  
                  if (page === currentPage - 3 || page === currentPage + 3) {
                    return <span key={page} className="px-2 text-gray-400">...</span>;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        isCurrentPage
                          ? 'text-primary-600 bg-primary-50 border border-primary-300'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(Math.ceil(filteredCasos.length / itemsPerPage), currentPage + 1))}
                  disabled={currentPage === Math.ceil(filteredCasos.length / itemsPerPage)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum caso encontrado
            </h3>
            <p className="text-gray-600">
              Tente ajustar os filtros ou termos de busca.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};