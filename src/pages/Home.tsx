import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCasos } from '../services/supabase';
import { CaseCard } from '../components/casos/CaseCard';
import { ROUTES, APP_NAME } from '../utils/constants';
import type { CasoInovacao } from '../types';

export const Home = () => {
  const [casos, setCasos] = useState<CasoInovacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCasos = async () => {
      try {
        const data = await getCasos();
        setCasos(data.slice(0, 6)); // Mostrar apenas os 6 mais recentes
      } catch (err) {
        setError('Erro ao carregar casos de inovação');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCasos();
  }, []);

  const casosStats = {
    total: casos.length,
    categorias: new Set(casos.map(caso => caso.categoria)).size,
    extensionistas: new Set(casos.map(caso => caso.extensionista_id)).size,
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              {APP_NAME}
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Conectando extensionistas universitários com iniciativas de impacto social 
              no Rio de Janeiro. Descubra, catalogueAndre contribua para a transformação social.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={ROUTES.CASOS} className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                Explorar Casos
              </Link>
              <Link to={ROUTES.LOGIN} className="btn-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600">
                Área do Extensionista
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {casosStats.total}
              </div>
              <div className="text-gray-600 font-medium">
                Casos Catalogados
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {casosStats.categorias}
              </div>
              <div className="text-gray-600 font-medium">
                Categorias Ativas
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {casosStats.extensionistas}
              </div>
              <div className="text-gray-600 font-medium">
                Extensionistas
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cases Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Casos em Destaque
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Conheça algumas das iniciativas de inovação social mais impactantes 
              do Rio de Janeiro catalogadas por nossos extensionistas.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : casos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {casos.map((caso) => (
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
                Seja o primeiro a cadastrar um caso de inovação social!
              </p>
            </div>
          )}

          {casos.length > 0 && (
            <div className="text-center">
              <Link to={ROUTES.CASOS} className="btn-primary">
                Ver Todos os Casos
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};