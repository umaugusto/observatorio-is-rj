import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCasos } from '../services/supabase';
import { checkDatabaseSetup } from '../services/database-setup';
import { DatabaseSetup } from '../components/setup/DatabaseSetup';
import { ROUTES, APP_NAME } from '../utils/constants';
import type { CasoInovacao } from '../types';

// Componentes especializados para o bento box
const CaseCardLarge = ({ caso }: { caso: CasoInovacao }) => {
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

  return (
    <div 
      className="relative h-96 rounded-2xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-xl transition-all duration-300"
      onClick={() => navigate(`/caso/${caso.id}`)}
    >
      {caso.imagem_url ? (
        <img
          src={caso.imagem_url}
          alt={caso.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <span className="text-primary-600 font-semibold text-2xl">{caso.categoria}</span>
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      
      <div className="absolute top-6 left-6">
        <span className="inline-block bg-white/90 backdrop-blur-sm text-primary-800 text-sm px-3 py-1 rounded-full font-semibold">
          {caso.categoria}
        </span>
      </div>
      
      <div className="absolute bottom-6 left-6 right-6">
        <h3 className="text-3xl font-bold text-white mb-4 line-clamp-2 leading-tight">
          {caso.titulo}
        </h3>
        <p className="text-white/90 text-base mb-6 line-clamp-3 leading-relaxed">
          {caso.resumo || caso.descricao}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-800 text-sm bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {getLocationString()}
          </div>
          {caso.extensionista && (
            <div className="text-gray-800 text-sm font-medium bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full">
              {caso.extensionista.nome.split(' ')[0]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CaseCardMedium = ({ caso }: { caso: CasoInovacao }) => {
  const navigate = useNavigate();
  
  const getLocationString = () => {
    if (caso.cidade) {
      const parts = [];
      if (caso.bairro) parts.push(caso.bairro);
      parts.push(caso.cidade);
      return parts.join(', ');
    }
    return caso.localizacao || 'Local não informado';
  };

  return (
    <div 
      className="relative h-96 rounded-2xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-xl transition-all duration-300"
      onClick={() => navigate(`/caso/${caso.id}`)}
    >
      {caso.imagem_url ? (
        <img
          src={caso.imagem_url}
          alt={caso.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-secondary-100 to-secondary-200 flex items-center justify-center">
          <span className="text-secondary-600 font-semibold text-xl">{caso.categoria}</span>
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      
      <div className="absolute top-4 left-4">
        <span className="inline-block bg-white/90 backdrop-blur-sm text-primary-800 text-xs px-2 py-1 rounded-full font-medium">
          {caso.categoria}
        </span>
      </div>
      
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight">
          {caso.titulo}
        </h3>
        <p className="text-white/85 text-sm mb-4 line-clamp-2 leading-relaxed">
          {caso.resumo || caso.descricao}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-800 text-xs bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {getLocationString()}
          </div>
          {caso.extensionista && (
            <div className="text-gray-800 text-xs font-medium bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
              {caso.extensionista.nome.split(' ')[0]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CaseCardSmall = ({ caso }: { caso: CasoInovacao }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="relative h-48 rounded-xl overflow-hidden cursor-pointer group shadow-md hover:shadow-lg transition-all duration-300"
      onClick={() => navigate(`/caso/${caso.id}`)}
    >
      {caso.imagem_url ? (
        <img
          src={caso.imagem_url}
          alt={caso.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-gray-600 font-medium text-sm">{caso.categoria}</span>
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
      
      <div className="absolute top-3 left-3">
        <span className="inline-block bg-white/90 backdrop-blur-sm text-primary-800 text-xs px-2 py-1 rounded-full font-medium">
          {caso.categoria}
        </span>
      </div>
      
      <div className="absolute bottom-3 left-3 right-3">
        <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-tight">
          {caso.titulo}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-800 text-xs bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {caso.cidade || caso.localizacao || 'Local não informado'}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Home = () => {
  const [casos, setCasos] = useState<CasoInovacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbConfigured, setDbConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      const status = await checkDatabaseSetup();
      setDbConfigured(status.isConfigured);
      
      if (status.isConfigured) {
        await loadCasos();
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Erro ao verificar banco:', err);
      setDbConfigured(false);
      setLoading(false);
    }
  };

  const loadCasos = async () => {
    try {
      const data = await getCasos();
      setCasos(data.slice(0, 6)); // Mostrar apenas os 6 mais recentes
      setError(null);
    } catch (err: any) {
      // Se o erro for de tabela não encontrada, mostrar setup
      if (err.message?.includes('relation') || err.code === '42P01') {
        setDbConfigured(false);
      } else {
        setError('Erro ao carregar casos de inovação');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setDbConfigured(true);
    setLoading(true);
    loadCasos();
  };

  // Se o banco não estiver configurado, mostrar tela de setup
  if (dbConfigured === false) {
    return <DatabaseSetup onSetupComplete={handleSetupComplete} />;
  }

  // Loading inicial enquanto verifica o banco
  if (dbConfigured === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando configuração...</p>
        </div>
      </div>
    );
  }

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
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-12 max-w-7xl mx-auto">
              {/* Linha 1: Caso principal (2x2) + Caso destaque (1x2) */}
              {casos[0] && (
                <div className="lg:col-span-4 lg:row-span-2">
                  <CaseCardLarge caso={casos[0]} />
                </div>
              )}
              {casos[1] && (
                <div className="lg:col-span-2 lg:row-span-2">
                  <CaseCardMedium caso={casos[1]} />
                </div>
              )}
              
              {/* Linha 2: 3 casos quadrados */}
              {casos.slice(2, 5).map((caso) => (
                <div key={caso.id} className="lg:col-span-2">
                  <CaseCardSmall caso={caso} />
                </div>
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