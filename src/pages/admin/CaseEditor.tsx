import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCasoById, createCaso, updateCaso } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES, CATEGORIES } from '../../utils/constants';
import type { CasoInovacao } from '../../types';
import type { DatabaseCasoInovacao } from '../../services/supabase';

interface CaseFormData {
  titulo: string;
  descricao: string;
  resumo: string;
  cep: string;
  cidade: string;
  estado: string;
  bairro: string;
  categoria: string;
  subcategoria: string;
  imagem_url: string;
  link_projeto: string;
  video_url: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
  pessoas_impactadas: number | null;
  orcamento: number | null;
  data_inicio: string;
  data_fim: string;
  status: string;
  tags: string[];
  contato_nome: string;
  contato_email: string;
  contato_telefone: string;
}

const initialFormData: CaseFormData = {
  titulo: '',
  descricao: '',
  resumo: '',
  cep: '',
  cidade: '',
  estado: '',
  bairro: '',
  categoria: '',
  subcategoria: '',
  imagem_url: '',
  link_projeto: '',
  video_url: '',
  instagram: '',
  facebook: '',
  whatsapp: '',
  pessoas_impactadas: null,
  orcamento: null,
  data_inicio: '',
  data_fim: '',
  status: 'planejamento',
  tags: [],
  contato_nome: '',
  contato_email: '',
  contato_telefone: '',
};

export const CaseEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = id === 'novo';

  const [caso, setCaso] = useState<CasoInovacao | null>(null);
  const [formData, setFormData] = useState<CaseFormData>(initialFormData);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      loadCaso(id);
    }
  }, [id, isNew]);

  const loadCaso = async (casoId: string) => {
    try {
      setLoading(true);
      const casoData = await getCasoById(casoId);
      if (!casoData) {
        setError('Caso não encontrado');
        return;
      }
      
      setCaso(casoData);
      setFormData({
        titulo: casoData.titulo,
        descricao: casoData.descricao,
        resumo: casoData.resumo || '',
        cep: '', // Novo campo - vazio por padrão
        cidade: casoData.localizacao || '', // Mapear localização existente para cidade
        estado: '', // Novo campo - vazio por padrão
        bairro: casoData.bairro || '',
        categoria: casoData.categoria,
        subcategoria: casoData.subcategoria || '',
        imagem_url: casoData.imagem_url || '',
        link_projeto: casoData.link_projeto || '',
        video_url: casoData.video_url || '',
        instagram: '', // Novo campo - vazio por padrão
        facebook: '', // Novo campo - vazio por padrão
        whatsapp: '', // Novo campo - vazio por padrão
        pessoas_impactadas: casoData.pessoas_impactadas || null,
        orcamento: casoData.orcamento || null,
        data_inicio: casoData.data_inicio || '',
        data_fim: casoData.data_fim || '',
        status: casoData.status || 'planejamento',
        tags: casoData.tags || [],
        contato_nome: casoData.contato_nome || '',
        contato_email: casoData.contato_email || '',
        contato_telefone: casoData.contato_telefone || '',
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar caso');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'coordenadas_lat' || name === 'coordenadas_lng' || name === 'pessoas_impactadas' || name === 'orcamento') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseFloat(value) : null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, imagem_url: imageUrl }));
  };

  const handleCoverImageUpload = async (file: File) => {
    try {
      // Validar arquivo
      if (file.size > 1 * 1024 * 1024) {
        alert('Arquivo muito grande. Máximo 1MB.');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Apenas imagens são permitidas.');
        return;
      }

      // Usar a função de upload existente
      const { uploadCaseImage } = await import('../../services/supabase');
      const imageUrl = await uploadCaseImage(file);
      handleImageChange(imageUrl);
    } catch (error: any) {
      alert(`Erro no upload: ${error.message}`);
    }
  };

  const searchCep = async (cep: string) => {
    if (!cep || cep.length !== 8) return;
    
    try {
      setCepLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        alert('CEP não encontrado');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado,
        bairro: data.bairro || prev.bairro,
      }));
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setCepLoading(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, cep: cep }));
    
    if (cep.length === 8) {
      searchCep(cep);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async (shouldPublish: boolean = false) => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);

      // Combinar cidade e estado para o campo localizacao (compatibilidade)
      const localizacao = formData.estado 
        ? `${formData.cidade}, ${formData.estado}` 
        : formData.cidade;

      const casoData: Omit<DatabaseCasoInovacao, 'id' | 'created_at' | 'updated_at'> = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        resumo: formData.resumo || undefined,
        localizacao: localizacao,
        bairro: formData.bairro || undefined,
        categoria: formData.categoria,
        subcategoria: formData.subcategoria || undefined,
        imagem_url: formData.imagem_url || undefined,
        link_projeto: formData.link_projeto || undefined,
        video_url: formData.video_url || undefined,
        coordenadas_lat: undefined,
        coordenadas_lng: undefined,
        pessoas_impactadas: formData.pessoas_impactadas || undefined,
        orcamento: formData.orcamento || undefined,
        data_inicio: formData.data_inicio || undefined,
        data_fim: formData.data_fim || undefined,
        status: formData.status || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        contato_nome: formData.contato_nome || undefined,
        contato_email: formData.contato_email || undefined,
        contato_telefone: formData.contato_telefone || undefined,
        extensionista_id: user.id,
        status_ativo: shouldPublish,
        visualizacoes: caso?.visualizacoes || 0,
      };

      if (isNew) {
        await createCaso(casoData);
      } else if (id) {
        await updateCaso(id, casoData);
      }

      navigate(ROUTES.ADMIN_CASES);
    } catch (error: any) {
      setError(error.message || 'Erro ao salvar caso');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !caso && !isNew) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Erro</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(ROUTES.ADMIN_CASES)}
            className="btn-primary"
          >
            Voltar para Lista
          </button>
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
              {isNew ? 'Novo Caso' : 'Editar Caso'}
            </h1>
            <p className="text-gray-600">
              {isNew ? 'Cadastre um novo caso de inovação social' : 'Edite as informações do caso'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : 'Salvar Rascunho'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving || !formData.titulo || !formData.descricao || !formData.categoria || !formData.cidade}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Publicando...' : 'Publicar'}
            </button>
            <button
              onClick={() => navigate(ROUTES.ADMIN_CASES)}
              className="btn-secondary"
            >
              Voltar
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Cover Photo Section */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="relative h-64 bg-gradient-to-br from-primary-100 to-primary-200">
            {formData.imagem_url ? (
              <img
                src={formData.imagem_url}
                alt="Capa do caso"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-primary-600">
                  <div className="text-4xl mb-2">📸</div>
                  <p className="text-lg font-medium">Adicione uma foto de capa</p>
                  <p className="text-sm opacity-75">Clique para selecionar uma imagem</p>
                </div>
              </div>
            )}
            
            {/* Upload Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center group cursor-pointer"
                 onClick={() => document.getElementById('cover-image-input')?.click()}>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center text-white">
                <div className="text-3xl mb-2">📷</div>
                <p className="font-medium">{formData.imagem_url ? 'Alterar Imagem' : 'Adicionar Imagem'}</p>
                <p className="text-sm opacity-75">Máximo 1MB - JPG, PNG, GIF</p>
              </div>
            </div>
          </div>
          
          {/* Hidden file input */}
          <input
            id="cover-image-input"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleCoverImageUpload(file);
              }
            }}
            className="hidden"
          />
          
          {formData.imagem_url && (
            <div className="p-4 bg-gray-50 border-t">
              <button
                type="button"
                onClick={() => handleImageChange('')}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remover imagem
              </button>
            </div>
          )}
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
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-md">
          
          {/* Tab: Informações Básicas */}
          {activeTab === 'basic' && (
            <div className="p-8 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações Básicas</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Digite o título do caso"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    rows={6}
                    value={formData.descricao}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Descreva detalhadamente o caso de inovação social"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label htmlFor="resumo" className="block text-sm font-medium text-gray-700 mb-2">
                    Resumo
                  </label>
                  <textarea
                    id="resumo"
                    name="resumo"
                    rows={3}
                    value={formData.resumo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Breve resumo do caso (opcional)"
                  />
                </div>

                <div>
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="subcategoria" className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategoria
                  </label>
                  <input
                    type="text"
                    id="subcategoria"
                    name="subcategoria"
                    value={formData.subcategoria}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Subcategoria específica (opcional)"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Status do Projeto
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'planejamento', label: 'Planejamento', color: 'bg-gray-100 text-gray-800 border-gray-300' },
                      { value: 'ativo', label: 'Ativo', color: 'bg-green-100 text-green-800 border-green-300' },
                      { value: 'concluido', label: 'Concluído', color: 'bg-blue-100 text-blue-800 border-blue-300' },
                      { value: 'pausado', label: 'Pausado', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' }
                    ].map((status) => (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, status: status.value }))}
                        className={`
                          px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all duration-200
                          ${formData.status === status.value 
                            ? `${status.color} border-current shadow-md` 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }
                        `}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Digite uma tag e pressione Enter"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="btn-secondary"
                      >
                        Adicionar
                      </button>
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-2 text-primary-600 hover:text-primary-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Localização */}
          {activeTab === 'location' && (
            <div className="p-8 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Localização</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-2">
                    CEP
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="cep"
                      value={formData.cep}
                      onChange={handleCepChange}
                      maxLength={8}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="00000000"
                    />
                    {cepLoading && (
                      <div className="absolute right-3 top-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Digite o CEP para preenchimento automático</p>
                </div>

                <div>
                  <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Nome da cidade"
                  />
                </div>

                <div>
                  <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <input
                    type="text"
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="UF do estado"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-2">
                    Bairro
                  </label>
                  <input
                    type="text"
                    id="bairro"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Nome do bairro"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Mídia & Links */}
          {activeTab === 'media' && (
            <div className="p-8 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Links & Redes Sociais</h2>
              
              {/* Links */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="link_projeto" className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="inline-flex items-center">
                      🔗 Link do Projeto
                    </span>
                  </label>
                  <input
                    type="url"
                    id="link_projeto"
                    name="link_projeto"
                    value={formData.link_projeto}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://exemplo.com"
                  />
                </div>

                <div>
                  <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="inline-flex items-center">
                      📹 Link do Vídeo
                    </span>
                  </label>
                  <input
                    type="url"
                    id="video_url"
                    name="video_url"
                    value={formData.video_url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="inline-flex items-center">
                      📸 Instagram
                    </span>
                  </label>
                  <input
                    type="url"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://instagram.com/usuario"
                  />
                </div>

                <div>
                  <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="inline-flex items-center">
                      👥 Facebook
                    </span>
                  </label>
                  <input
                    type="url"
                    id="facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://facebook.com/pagina"
                  />
                </div>

                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="inline-flex items-center">
                      💬 WhatsApp
                    </span>
                  </label>
                  <input
                    type="text"
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="(21) 99999-9999"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Impacto */}
          {activeTab === 'impact' && (
            <div className="p-8 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Dados de Impacto</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="pessoas_impactadas" className="block text-sm font-medium text-gray-700 mb-2">
                    Pessoas Impactadas
                  </label>
                  <input
                    type="number"
                    id="pessoas_impactadas"
                    name="pessoas_impactadas"
                    min="0"
                    value={formData.pessoas_impactadas || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Número de pessoas beneficiadas"
                  />
                </div>

                <div>
                  <label htmlFor="orcamento" className="block text-sm font-medium text-gray-700 mb-2">
                    Orçamento (R$)
                  </label>
                  <input
                    type="number"
                    id="orcamento"
                    name="orcamento"
                    min="0"
                    step="0.01"
                    value={formData.orcamento || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Valor em reais"
                  />
                </div>

                <div>
                  <label htmlFor="data_inicio" className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    id="data_inicio"
                    name="data_inicio"
                    value={formData.data_inicio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="data_fim" className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Fim
                  </label>
                  <input
                    type="date"
                    id="data_fim"
                    name="data_fim"
                    value={formData.data_fim}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Equipe do Projeto */}
          {activeTab === 'contact' && (
            <div className="p-8 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Equipe do Projeto</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="contato_nome" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Responsável
                  </label>
                  <input
                    type="text"
                    id="contato_nome"
                    name="contato_nome"
                    value={formData.contato_nome}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Nome da pessoa responsável"
                  />
                </div>

                <div>
                  <label htmlFor="contato_email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email de Contato
                  </label>
                  <input
                    type="email"
                    id="contato_email"
                    name="contato_email"
                    value={formData.contato_email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <label htmlFor="contato_telefone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone de Contato
                  </label>
                  <input
                    type="tel"
                    id="contato_telefone"
                    name="contato_telefone"
                    value={formData.contato_telefone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="(21) 99999-9999"
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
