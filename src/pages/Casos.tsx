import { useState, useEffect } from 'react';
import { getCasos, getCasosByCategory } from '../services/supabase';
import { CaseCard } from '../components/casos/CaseCard';
import { CATEGORIES } from '../utils/constants';
import type { CasoInovacao } from '../types';

export const Casos = () => {
  const [casos, setCasos] = useState<CasoInovacao[]>([]);
  const [filteredCasos, setFilteredCasos] = useState<CasoInovacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

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
        caso.localizacao.toLowerCase().includes(term)
      );
    }

    setFilteredCasos(filtered);
  }, [casos, selectedCategory, searchTerm]);

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

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                placeholder="Digite título, descrição ou localização..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por categoria
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryFilter('')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    !selectedCategory
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Todas
                </button>
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryFilter(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Carregando...' : `${filteredCasos.length} caso(s) encontrado(s)`}
            {selectedCategory && ` na categoria "${selectedCategory}"`}
            {searchTerm && ` para "${searchTerm}"`}
          </p>
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
        ) : filteredCasos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCasos.map((caso) => (
              <CaseCard key={caso.id} caso={caso} />
            ))}
          </div>
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