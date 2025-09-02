import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCasos } from '../services/supabase';
import { CATEGORIES, ROUTES } from '../utils/constants';
import type { CasoInovacao } from '../types';
import { 
  GraduationCap, 
  Heart, 
  Leaf, 
  DollarSign, 
  Palette, 
  Cpu, 
  Users, 
  Home
} from 'lucide-react';

interface CategoriaStats {
  categoria: string;
  count: number;
  casos: CasoInovacao[];
  color: string;
  icon: React.ElementType;
  totalPessoas: number;
  orcamentoTotal: number;
  casosAtivos: number;
  cidadesAtendidas: number;
}

const getCategoryIcon = (categoria: string): React.ElementType => {
  const icons: Record<string, React.ElementType> = {
    'Educação': GraduationCap,
    'Saúde': Heart,
    'Meio Ambiente': Leaf,
    'Geração de Renda': DollarSign,
    'Cultura': Palette,
    'Tecnologia Social': Cpu,
    'Direitos Humanos': Users,
    'Habitação': Home,
  };
  return icons[categoria] || Users;
};

const getCategoryColor = (categoria: string): string => {
  const colors: Record<string, string> = {
    'Educação': 'text-blue-600',
    'Saúde': 'text-red-600',
    'Meio Ambiente': 'text-green-600',
    'Geração de Renda': 'text-yellow-600',
    'Cultura': 'text-purple-600',
    'Tecnologia Social': 'text-gray-600',
    'Direitos Humanos': 'text-pink-600',
    'Habitação': 'text-indigo-600',
  };
  return colors[categoria] || 'text-gray-600';
};

const getCategoryBg = (categoria: string): string => {
  const colors: Record<string, string> = {
    'Educação': 'bg-blue-50',
    'Saúde': 'bg-red-50',
    'Meio Ambiente': 'bg-green-50',
    'Geração de Renda': 'bg-yellow-50',
    'Cultura': 'bg-purple-50',
    'Tecnologia Social': 'bg-gray-50',
    'Direitos Humanos': 'bg-pink-50',
    'Habitação': 'bg-indigo-50',
  };
  return colors[categoria] || 'bg-gray-50';
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
        
        // Filtrar apenas casos com categoria válida
        const casosValidos = data.filter(caso => 
          caso.categoria && 
          caso.categoria.trim() !== '' && 
          CATEGORIES.includes(caso.categoria as any)
        );
        
        // Log casos com categoria problemática para debug
        const casosProblematicos = data.filter(caso => 
          !caso.categoria || 
          caso.categoria.trim() === '' || 
          !CATEGORIES.includes(caso.categoria as any)
        );
        
        if (casosProblematicos.length > 0) {
          console.warn(`🚨 Encontrados ${casosProblematicos.length} casos com categoria problemática:`, 
            casosProblematicos.map(c => ({ id: c.id, titulo: c.titulo, categoria: c.categoria }))
          );
        }
        
        // Calcular estatísticas por categoria
        const stats: CategoriaStats[] = CATEGORIES.map(categoria => {
          const casosDaCategoria = casosValidos.filter(caso => caso.categoria === categoria);
          
          // Calcular métricas agregadas
          const totalPessoas = casosDaCategoria.reduce((sum, caso) => 
            sum + (caso.pessoas_impactadas || 0), 0
          );
          
          const orcamentoTotal = casosDaCategoria.reduce((sum, caso) => 
            sum + (caso.orcamento || 0), 0
          );
          
          const casosAtivos = casosDaCategoria.filter(caso => 
            caso.status === 'ativo' || !caso.status
          ).length;
          
          const cidadesUnicas = new Set(casosDaCategoria
            .map(caso => caso.cidade)
            .filter(Boolean)
          );
          
          return {
            categoria,
            count: casosDaCategoria.length,
            casos: casosDaCategoria.slice(0, 3), // Primeiros 3 casos para preview
            color: getCategoryColor(categoria),
            icon: getCategoryIcon(categoria),
            totalPessoas,
            orcamentoTotal,
            casosAtivos,
            cidadesAtendidas: cidadesUnicas.size
          };
        });

        setCategoriaStats(stats);
        setCasos(casosValidos); // Usar apenas casos válidos
      } catch (err) {
        setError('Erro ao carregar categorias');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCasos();
  }, []);

  // Ordenar categorias por quantidade (maior para menor)
  const sortedStats = categoriaStats.sort((a, b) => b.count - a.count);

  const totalCasos = casos.length;
  const categoriasAtivas = categoriaStats.filter(cat => cat.count > 0).length;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header com big numbers globais */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-8">
          {/* Título */}
          <div className="mb-8">
            <h1 className="text-4xl font-light text-gray-900 mb-3">
              Categorias
            </h1>
            <p className="text-gray-600 text-lg font-light max-w-2xl">
              Uma visão geral das áreas de inovação social
            </p>
          </div>

          {/* Big Numbers Globais */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{totalCasos}</div>
              <div className="text-sm text-gray-500 font-medium">Casos Registrados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{categoriasAtivas}</div>
              <div className="text-sm text-gray-500 font-medium">Categorias Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {casos.reduce((sum, caso) => sum + (caso.pessoas_impactadas || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 font-medium">Pessoas Impactadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {new Set(casos.map(c => c.cidade).filter(Boolean)).size}
              </div>
              <div className="text-sm text-gray-500 font-medium">Cidades Atendidas</div>
            </div>
          </div>
        </div>

        {/* Grid de categorias */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border border-gray-200 border-t-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-gray-500">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedStats.map((categoria) => {
              const IconComponent = categoria.icon;
              
              return (
                <div 
                  key={categoria.categoria}
                  className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-gray-200 hover:shadow-lg transition-all duration-200 shadow-sm"
                >
                  {/* Header com ícone e nome */}
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`p-2 rounded-lg ${getCategoryBg(categoria.categoria)}`}>
                      <IconComponent className={`w-5 h-5 ${categoria.color}`} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{categoria.categoria}</h3>
                  </div>

                  {categoria.count > 0 ? (
                    <>
                      {/* Big Numbers Grid 2x2 */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {/* Total de Projetos */}
                        <div className={`${getCategoryBg(categoria.categoria)} p-4 rounded-lg text-center`}>
                          <div className={`text-2xl font-bold ${categoria.color} mb-1`}>
                            {categoria.count}
                          </div>
                          <div className="text-xs text-gray-600 font-medium">
                            {categoria.count === 1 ? 'Projeto' : 'Projetos'}
                          </div>
                        </div>

                        {/* Pessoas Impactadas */}
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-700 mb-1">
                            {categoria.totalPessoas > 0 ? 
                              (categoria.totalPessoas > 999 ? 
                                `${Math.round(categoria.totalPessoas / 1000)}k` : 
                                categoria.totalPessoas.toLocaleString()
                              ) : '—'
                            }
                          </div>
                          <div className="text-xs text-gray-600 font-medium">
                            Pessoas
                          </div>
                        </div>

                        {/* Projetos Ativos */}
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-700 mb-1">
                            {categoria.casosAtivos}
                          </div>
                          <div className="text-xs text-gray-600 font-medium">
                            Ativos
                          </div>
                        </div>

                        {/* Alcance ou Orçamento */}
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          {categoria.orcamentoTotal > 0 ? (
                            <>
                              <div className="text-2xl font-bold text-purple-700 mb-1">
                                {categoria.orcamentoTotal > 999999 ? 
                                  `${(categoria.orcamentoTotal / 1000000).toFixed(1)}M` :
                                  `${Math.round(categoria.orcamentoTotal / 1000)}k`
                                }
                              </div>
                              <div className="text-xs text-gray-600 font-medium">
                                R$
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-2xl font-bold text-purple-700 mb-1">
                                {categoria.cidadesAtendidas || '—'}
                              </div>
                              <div className="text-xs text-gray-600 font-medium">
                                {categoria.cidadesAtendidas === 1 ? 'Cidade' : 'Cidades'}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* CTA */}
                      <Link 
                        to={`${ROUTES.CASOS}?categoria=${encodeURIComponent(categoria.categoria)}`}
                        className="block w-full text-center py-3 px-4 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg transition-colors"
                      >
                        Ver todos os {categoria.count} {categoria.count === 1 ? 'projeto' : 'projetos'}
                      </Link>
                    </>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="text-3xl text-gray-200 mb-2">—</div>
                      <div className="text-xs text-gray-400">
                        Nenhum projeto
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};