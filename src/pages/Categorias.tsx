import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCasos } from '../services/supabase';
import { CATEGORIES, ROUTES } from '../utils/constants';
import type { CasoInovacao } from '../types';

interface CategoriaStats {
  categoria: string;
  count: number;
  casos: CasoInovacao[];
  color: string;
  icon: string;
}

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

const getCategoryColor = (categoria: string): string => {
  const colors: Record<string, string> = {
    'Educação': 'from-blue-400 to-blue-600',
    'Saúde': 'from-red-400 to-red-600',
    'Meio Ambiente': 'from-green-400 to-green-600',
    'Cultura': 'from-purple-400 to-purple-600',
    'Tecnologia': 'from-gray-400 to-gray-600',
    'Empreendedorismo': 'from-orange-400 to-orange-600',
    'Inclusão Social': 'from-pink-400 to-pink-600',
    'Urbanismo': 'from-indigo-400 to-indigo-600',
    'Alimentação': 'from-yellow-400 to-yellow-600',
    'Esporte': 'from-emerald-400 to-emerald-600',
  };
  return colors[categoria] || 'from-gray-400 to-gray-600';
};

export const Categorias = () => {
  const [casos, setCasos] = useState<CasoInovacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriaStats, setCategoriaStats] = useState<CategoriaStats[]>([]);

  useEffect(() => {
    const loadCasos = async () => {
      try {
        const data = await getCasos();
        setCasos(data);
        
        // Calcular estatísticas por categoria
        const stats: CategoriaStats[] = CATEGORIES.map(categoria => {
          const casosDaCategoria = data.filter(caso => caso.categoria === categoria);
          return {
            categoria,
            count: casosDaCategoria.length,
            casos: casosDaCategoria.slice(0, 3), // Primeiros 3 casos para preview
            color: getCategoryColor(categoria),
            icon: getCategoryIcon(categoria)
          };
        }).sort((a, b) => b.count - a.count); // Ordenar por quantidade

        setCategoriaStats(stats);
      } catch (err) {
        setError('Erro ao carregar categorias');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCasos();
  }, []);

  const totalCasos = casos.length;
  const categoriasAtivas = categoriaStats.filter(cat => cat.count > 0).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Categorias de Inovação Social
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Explore os casos de inovação social organizados por categoria. 
            Cada categoria representa diferentes áreas de impacto social no Rio de Janeiro.
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{totalCasos}</div>
                <div className="text-gray-600">Total de Casos</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{categoriasAtivas}</div>
                <div className="text-gray-600">Categorias Ativas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriaStats.map((categoria) => (
              <div 
                key={categoria.categoria}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                {/* Header compacto */}
                <div className={`relative bg-gradient-to-r ${categoria.color} p-4 text-white h-24 flex items-center justify-between overflow-hidden`}>
                  {/* Imagem de fundo sutil */}
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative flex items-center">
                    <div className="text-2xl mr-3">{categoria.icon}</div>
                    <h3 className="text-lg font-bold">{categoria.categoria}</h3>
                  </div>
                  <div className="relative text-right">
                    <div className="text-xl font-bold">{categoria.count}</div>
                    <div className="text-xs opacity-90">
                      {categoria.count === 1 ? 'caso' : 'casos'}
                    </div>
                  </div>
                </div>

                {/* Conteúdo com melhor legibilidade e layout flex */}
                <div className="p-6 flex flex-col h-80">
                  {categoria.count > 0 ? (
                    <>
                      <div className="flex-1 mb-6">
                        <h4 className="font-semibold text-gray-900 mb-4 text-base">Casos recentes:</h4>
                        <div className="space-y-4">
                          {categoria.casos.map((caso) => (
                            <div key={caso.id} className="border-l-4 border-gray-200 pl-4 py-2 hover:border-primary-300 transition-colors">
                              <div className="text-gray-900 font-semibold text-sm leading-tight mb-1 line-clamp-2">
                                {caso.titulo}
                              </div>
                              <div className="flex items-center text-gray-500 text-xs">
                                <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span className="truncate">
                                  {(() => {
                                    if (caso.cidade) {
                                      const parts = [];
                                      if (caso.bairro) parts.push(caso.bairro);
                                      parts.push(caso.cidade);
                                      return parts.join(', ');
                                    }
                                    return caso.localizacao || 'Localização não informada';
                                  })()}
                                </span>
                              </div>
                              {caso.pessoas_impactadas && (
                                <div className="text-primary-600 text-xs font-medium mt-1">
                                  {caso.pessoas_impactadas.toLocaleString()} pessoas impactadas
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Botão fixo na parte inferior */}
                      <div className="mt-auto">
                        <Link 
                          to={`${ROUTES.CASOS}?categoria=${encodeURIComponent(categoria.categoria)}`}
                          className="w-full btn-primary block text-center text-sm py-3"
                        >
                          Ver todos os {categoria.count} casos
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                      <div className="text-4xl mb-3">🔍</div>
                      <p className="text-sm text-center">
                        Nenhum caso cadastrado<br />nesta categoria ainda.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};