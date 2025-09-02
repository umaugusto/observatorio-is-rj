import { useState, useEffect } from 'react';
import { getAllMessages, updateMessageStatus, toggleMessageComplete } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import type { ContactMessage } from '../types';
import { CONTACT_TYPES_LABELS } from '../utils/constants';

export const Messages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pendente' | 'lido' | 'respondido'>('all');

  const { user } = useAuth();

  const loadMessages = async () => {
    try {
      console.log('📬 Carregando mensagens de contato...');
      const data = await getAllMessages();
      setMessages(data);
      console.log(`✅ ${data.length} mensagens carregadas`);
    } catch (err: any) {
      console.error('❌ Erro ao carregar mensagens:', err);
      setError(err.message || 'Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleMarkAsRead = async (messageId: string) => {
    if (!user) return;
    try {
      await updateMessageStatus(messageId, 'lido', user.id);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'lido', respondido_por: user.id }
            : msg
        )
      );
      console.log('✅ Mensagem marcada como lida');
    } catch (err: any) {
      console.error('❌ Erro ao marcar como lida:', err);
    }
  };

  const handleMarkAsPending = async (messageId: string) => {
    if (!user) return;
    try {
      await updateMessageStatus(messageId, 'pendente');
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'pendente', respondido_por: undefined }
            : msg
        )
      );
      console.log('✅ Mensagem marcada como pendente');
    } catch (err: any) {
      console.error('❌ Erro ao marcar como pendente:', err);
    }
  };

  const handleToggleComplete = async (messageId: string, currentComplete: boolean) => {
    if (!user) return;
    try {
      const newComplete = !currentComplete;
      await toggleMessageComplete(messageId, newComplete, user.id);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, concluido: newComplete }
            : msg
        )
      );
      console.log(`✅ Mensagem marcada como ${newComplete ? 'concluída' : 'não concluída'}`);
    } catch (err: any) {
      console.error('❌ Erro ao alterar status de conclusão:', err);
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true;
    return msg.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'lido':
        return 'bg-blue-100 text-blue-800';
      case 'respondido':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'acesso':
        return 'bg-purple-100 text-purple-800';
      case 'duvida':
        return 'bg-blue-100 text-blue-800';
      case 'sugestao':
        return 'bg-green-100 text-green-800';
      case 'outro':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando mensagens...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadMessages}
            className="btn-primary"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">📬 Mensagens de Contato</h1>
          <p className="text-gray-600">
            Visualize e gerencie todas as mensagens recebidas através do formulário de contato.
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({messages.length})
            </button>
            <button
              onClick={() => setFilter('pendente')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pendente'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendentes ({messages.filter(m => m.status === 'pendente').length})
            </button>
            <button
              onClick={() => setFilter('lido')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'lido'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Lidas ({messages.filter(m => m.status === 'lido').length})
            </button>
            <button
              onClick={() => setFilter('respondido')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'respondido'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Respondidas ({messages.filter(m => m.status === 'respondido').length})
            </button>
          </div>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma mensagem encontrada
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Ainda não há mensagens de contato.' 
                : `Não há mensagens com status "${filter}".`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {message.assunto}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(message.status)}`}>
                          {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(message.tipo_solicitacao)}`}>
                          {CONTACT_TYPES_LABELS[message.tipo_solicitacao]}
                        </span>
                        {message.concluido && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            ✅ Concluída
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <strong>{message.nome}</strong> • {message.email}
                        {message.telefone && ` • ${message.telefone}`}
                      </div>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {message.mensagem}
                      </p>
                      <div className="text-xs text-gray-500">
                        Enviado em: {new Date(message.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4 border-t flex-wrap">
                    {/* Botões de Status */}
                    {message.status === 'pendente' && (
                      <button
                        onClick={() => handleMarkAsRead(message.id)}
                        className="btn-secondary text-sm"
                      >
                        📖 Marcar como Lida
                      </button>
                    )}
                    
                    {message.status === 'lido' && (
                      <button
                        onClick={() => handleMarkAsPending(message.id)}
                        className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                      >
                        ⏳ Marcar como Pendente
                      </button>
                    )}
                    
                    {/* Botão de Conclusão */}
                    <button
                      onClick={() => handleToggleComplete(message.id, message.concluido || false)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        message.concluido
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {message.concluido ? '❌ Marcar como Não Concluída' : '✅ Marcar como Concluída'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};