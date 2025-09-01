import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCasoById } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';
import { CaseMap } from '../components/common/CaseMap';
import type { CasoInovacao } from '../types';

export const CasoDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caso, setCaso] = useState<CasoInovacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    const loadCaso = async () => {
      if (!id) {
        setError('ID do caso não fornecido');
        setLoading(false);
        return;
      }

      try {
        const data = await getCasoById(id);
        if (!data) {
          setError('Caso não encontrado');
        } else {
          setCaso(data);
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar caso');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCaso();
  }, [id]);

  const getLocationString = () => {
    if (!caso) return '';
    
    if (caso.cidade) {
      const parts = [];
      if (caso.bairro) parts.push(caso.bairro);
      parts.push(caso.cidade);
      if (caso.estado) parts.push(caso.estado);
      return parts.join(', ');
    }
    return caso.localizacao || 'Localização não informada';
  };

  const canEdit = () => {
    if (!user || !caso) return false;
    return user.is_admin || user.tipo === 'demo' || user.id === caso.extensionista_id;
  };

  const handleEdit = () => {
    if (canEdit() && caso) {
      navigate(`${ROUTES.ADMIN_CASE_EDIT}/${caso.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !caso) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Caso não encontrado</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to={ROUTES.CASOS} className="btn-primary">
            Voltar aos Casos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {caso.titulo}
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {caso.categoria}
              </span>
              {!caso.status_ativo && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  Rascunho
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {canEdit() && (
              <button
                onClick={handleEdit}
                className="btn-primary"
              >
                Editar Caso
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Voltar
            </button>
          </div>
        </div>

        {/* Cover Photo Section */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="relative h-64 bg-gradient-to-br from-primary-100 to-primary-200">
            {caso.imagem_url && (
              <img
                src={caso.imagem_url}
                alt="Capa do caso"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'basic', label: 'Informações Básicas', icon: '📝' },
                { id: 'location', label: 'Localização', icon: '📍' },
                { id: 'media', label: 'Links & Redes', icon: '🔗' },
                { id: 'impact', label: 'Impacto', icon: '📊' },
                { id: 'contact', label: 'Equipe do Projeto', icon: '👥' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Informações Básicas */}
            {activeTab === 'basic' && (
              <div className="space-y-8">
                {/* Informações do Projeto e Responsável */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">📋 Projeto</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Título:</span>
                        <p className="text-gray-900 font-semibold">{caso.titulo}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Localização:</span>
                        <p className="text-gray-700 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {getLocationString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {caso.extensionista && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">👤 Catalogado por</h4>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-primary-600 font-bold">
                            {caso.extensionista.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{caso.extensionista.nome}</div>
                          <div className="text-sm text-gray-600">Extensionista</div>
                          {caso.extensionista.instituicao && (
                            <div className="text-sm text-gray-500">{caso.extensionista.instituicao}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
                  {caso.resumo ? (
                    <div className="bg-primary-50 p-4 rounded-lg">
                      <p className="text-primary-800 leading-relaxed">{caso.resumo}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Resumo não informado</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Descrição Completa</h3>
                  <div className="prose max-w-none text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-lg">
                    {caso.descricao.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Categoria</h4>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                      {caso.categoria}
                    </span>
                  </div>
                  {caso.subcategoria && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-2">Subcategoria</h4>
                      <p className="text-gray-700">{caso.subcategoria}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Localização */}
            {activeTab === 'location' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {caso.cep && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-2">CEP</h4>
                      <p className="text-gray-700 font-mono">{caso.cep}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Cidade</h4>
                    <p className="text-gray-700">{caso.cidade || 'Não informada'}</p>
                  </div>
                  {caso.estado && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-2">Estado</h4>
                      <p className="text-gray-700">{caso.estado}</p>
                    </div>
                  )}
                  {caso.bairro && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-2">Bairro</h4>
                      <p className="text-gray-700">{caso.bairro}</p>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-blue-800">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{getLocationString()}</span>
                  </div>
                </div>

                {/* Mapa Interativo */}
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Localização e Área de Impacto</h3>
                    <p className="text-gray-600 text-sm">
                      Visualize o local do projeto e sua área de impacto estimada
                    </p>
                  </div>
                  <div className="p-6">
                    <CaseMap caso={caso} className="h-96 rounded-lg" />
                  </div>
                </div>
              </div>
            )}

            {/* Links & Redes */}
            {activeTab === 'media' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Links do Projeto</h3>
                  <div className="space-y-4">
                    {caso.link_projeto ? (
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-2">Site/Link Principal</h4>
                        <a
                          href={caso.link_projeto}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          🔗 Acessar Site
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Link do projeto não informado</p>
                    )}
                    
                    {caso.video_url ? (
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-2">Vídeo</h4>
                        <a
                          href={caso.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          🎥 Assistir Vídeo
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Vídeo não informado</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Redes Sociais</h3>
                  {(caso.instagram_url || caso.facebook_url || caso.whatsapp) ? (
                    <div className="space-y-4">
                      {caso.instagram_url && (
                        <div>
                          <h4 className="text-md font-medium text-gray-900 mb-2">Instagram</h4>
                          <a
                            href={caso.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                          >
                            📸 Seguir no Instagram
                          </a>
                        </div>
                      )}
                      
                      {caso.facebook_url && (
                        <div>
                          <h4 className="text-md font-medium text-gray-900 mb-2">Facebook</h4>
                          <a
                            href={caso.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            📘 Curtir no Facebook
                          </a>
                        </div>
                      )}
                      
                      {caso.whatsapp && (
                        <div>
                          <h4 className="text-md font-medium text-gray-900 mb-2">WhatsApp</h4>
                          <a
                            href={`https://wa.me/${caso.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            💬 Conversar no WhatsApp
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Redes sociais não informadas</p>
                  )}
                </div>
              </div>
            )}

            {/* Impacto */}
            {activeTab === 'impact' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {caso.pessoas_impactadas ? caso.pessoas_impactadas.toLocaleString() : '—'}
                    </div>
                    <div className="text-blue-800 font-medium">Pessoas Impactadas</div>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {caso.orcamento ? `R$ ${(caso.orcamento / 1000).toFixed(0)}k` : '—'}
                    </div>
                    <div className="text-green-800 font-medium">Orçamento</div>
                  </div>
                  
                  <div className="bg-yellow-50 p-6 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600 mb-2 capitalize">
                      {caso.status?.replace('_', ' ') || '—'}
                    </div>
                    <div className="text-yellow-800 font-medium">Status Atual</div>
                  </div>
                  
                  <div className="bg-purple-50 p-6 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {(caso.data_inicio && caso.data_fim) ? 
                        `${Math.ceil((new Date(caso.data_fim).getTime() - new Date(caso.data_inicio).getTime()) / (1000 * 60 * 60 * 24 * 30))} meses` : '—'}
                    </div>
                    <div className="text-purple-800 font-medium">Duração</div>
                  </div>
                </div>
                
                {(caso.data_inicio || caso.data_fim) && (
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cronograma</h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-1">Data de Início</h4>
                        <p className="text-gray-700">
                          {caso.data_inicio ? new Date(caso.data_inicio).toLocaleDateString('pt-BR') : 'Não informada'}
                        </p>
                      </div>
                      <div className="text-gray-400 text-2xl">→</div>
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-1">Data de Fim</h4>
                        <p className="text-gray-700">
                          {caso.data_fim ? new Date(caso.data_fim).toLocaleDateString('pt-BR') : 'Em andamento'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Equipe do Projeto */}
            {activeTab === 'contact' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contato Principal</h3>
                  {(caso.contato_nome || caso.contato_email || caso.contato_telefone) ? (
                    <div className="space-y-4">
                      {caso.contato_nome && (
                        <div>
                          <h4 className="text-md font-medium text-gray-900 mb-1">Nome</h4>
                          <p className="text-gray-700 flex items-center">
                            <span className="mr-2">👤</span>
                            {caso.contato_nome}
                          </p>
                        </div>
                      )}
                      
                      {caso.contato_email && (
                        <div>
                          <h4 className="text-md font-medium text-gray-900 mb-1">Email</h4>
                          <a 
                            href={`mailto:${caso.contato_email}`}
                            className="text-primary-600 hover:text-primary-700 flex items-center"
                          >
                            <span className="mr-2">📧</span>
                            {caso.contato_email}
                          </a>
                        </div>
                      )}
                      
                      {caso.contato_telefone && (
                        <div>
                          <h4 className="text-md font-medium text-gray-900 mb-1">Telefone</h4>
                          <a 
                            href={`tel:${caso.contato_telefone}`}
                            className="text-primary-600 hover:text-primary-700 flex items-center"
                          >
                            <span className="mr-2">📞</span>
                            {caso.contato_telefone}
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Informações de contato não disponíveis</p>
                  )}
                </div>

                {/* Extensionista */}
                {caso.extensionista && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Catalogado por</h3>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-primary-600 font-bold text-lg">
                            {caso.extensionista.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-lg">{caso.extensionista.nome}</div>
                          <div className="text-gray-600">Extensionista</div>
                          {caso.extensionista.instituicao && (
                            <div className="text-gray-500 text-sm">{caso.extensionista.instituicao}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};