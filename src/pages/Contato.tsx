import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { createContactMessage } from '../services/supabase';
import { CONTACT_TYPES_LABELS, ROUTES } from '../utils/constants';
import type { ContactMessageInput } from '../types';

export const Contato = () => {
  const [searchParams] = useSearchParams();
  const tipo = searchParams.get('tipo') as keyof typeof CONTACT_TYPES_LABELS;
  
  const [formData, setFormData] = useState<ContactMessageInput>({
    nome: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: '',
    tipo_solicitacao: tipo && Object.keys(CONTACT_TYPES_LABELS).includes(tipo) ? tipo : 'duvida'
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Se veio da página de login com tipo "acesso", pré-popular o assunto
  useEffect(() => {
    if (tipo === 'acesso') {
      setFormData(prev => ({
        ...prev,
        assunto: 'Solicitação de acesso como extensionista',
        tipo_solicitacao: 'acesso'
      }));
    }
  }, [tipo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome || !formData.email || !formData.assunto || !formData.mensagem) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    console.log('📬 Enviando mensagem de contato:', formData.assunto);
    setLoading(true);
    setError(null);

    try {
      await createContactMessage(formData);
      setSuccess(true);
      console.log('✅ Mensagem enviada com sucesso');
      
      // Limpar formulário
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        assunto: '',
        mensagem: '',
        tipo_solicitacao: 'duvida'
      });
    } catch (err: any) {
      console.error('❌ Erro ao enviar mensagem:', err);
      setError(err.message || 'Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Mensagem Enviada!</h2>
          <p className="text-gray-600 mb-6">
            Sua mensagem foi enviada com sucesso. Nossa equipe irá analisar e responder em breve.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setSuccess(false)}
              className="w-full btn-primary"
            >
              Enviar Outra Mensagem
            </button>
            <Link to={ROUTES.HOME} className="block w-full btn-secondary text-center">
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Entre em Contato</h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Tem dúvidas, sugestões ou precisa de acesso como extensionista? 
            Envie uma mensagem e nossa equipe responderá em breve.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label htmlFor="tipo_solicitacao" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Solicitação
                </label>
                <select
                  id="tipo_solicitacao"
                  name="tipo_solicitacao"
                  value={formData.tipo_solicitacao}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {Object.entries(CONTACT_TYPES_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="assunto" className="block text-sm font-medium text-gray-700 mb-2">
                Assunto *
              </label>
              <input
                type="text"
                id="assunto"
                name="assunto"
                value={formData.assunto}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Resumo do que você precisa"
              />
            </div>

            <div>
              <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem *
              </label>
              <textarea
                id="mensagem"
                name="mensagem"
                value={formData.mensagem}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Descreva detalhadamente sua solicitação, dúvida ou sugestão..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Mensagem'}
              </button>
              <Link 
                to={ROUTES.HOME} 
                className="flex-1 btn-secondary text-center"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>

        {/* Informações adicionais */}
        <div className="mt-8 bg-primary-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary-800 mb-3">📬 Sobre as Mensagens</h3>
          <ul className="text-sm text-primary-700 space-y-2">
            <li>• Todas as mensagens são visualizadas pelos extensionistas da plataforma</li>
            <li>• Respostas são enviadas diretamente para seu email</li>
            <li>• Para solicitações de acesso, inclua informações sobre sua instituição</li>
            <li>• Tempo médio de resposta: 2-3 dias úteis</li>
          </ul>
        </div>
      </div>
    </div>
  );
};