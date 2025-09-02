import { useState, useEffect, useCallback } from 'react';
import { getAllMessages, updateMessageStatus, toggleMessageComplete, archiveMessage } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import type { ContactMessage } from '../types';
import { CONTACT_TYPES_LABELS } from '../utils/constants';

export const Messages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pendente' | 'lido' | 'respondido'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const { user } = useAuth();

  const loadMessages = useCallback(async () => {
    try {
      console.log('📬 Carregando mensagens de contato...');
      const data = await getAllMessages(showArchived);
      setMessages(data);
      console.log(`✅ ${data.length} mensagens carregadas`);
      // Se uma mensagem estava selecionada, atualize ela
      if (selectedMessage) {
        const updatedMessage = data.find(m => m.id === selectedMessage.id);
        setSelectedMessage(updatedMessage || null);
      }
    } catch (err: unknown) {
      console.error('❌ Erro ao carregar mensagens:', err);
      const message = err instanceof Error ? err.message : 'Erro ao carregar mensagens';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [showArchived, selectedMessage]);

  useEffect(() => {
    loadMessages();
  }, [showArchived, loadMessages]);

  // Função unificada para mudança de status (combina status da mensagem e conclusão)
  const handleUnifiedStatusChange = async (messageId: string, unifiedStatus: 'pendente' | 'lido' | 'respondido' | 'concluido') => {
    if (!user) return;
    try {
      let newMessageStatus: 'pendente' | 'lido' | 'respondido';
      let isComplete = false;
      
      // Mapear status unificado para status da mensagem e conclusão
      switch (unifiedStatus) {
        case 'pendente':
          newMessageStatus = 'pendente';
          isComplete = false;
          break;
        case 'lido':
          newMessageStatus = 'lido';
          isComplete = false;
          break;
        case 'respondido':
          newMessageStatus = 'respondido';
          isComplete = false;
          break;
        case 'concluido':
          newMessageStatus = 'respondido'; // Concluído implica que foi respondido
          isComplete = true;
          break;
        default:
          newMessageStatus = 'pendente';
          isComplete = false;
      }

      // Atualizar status da mensagem
      await updateMessageStatus(messageId, newMessageStatus, user.id);
      
      // Atualizar status de conclusão se necessário
      if (isComplete) {
        await toggleMessageComplete(messageId, isComplete, user.id);
      }
      
      // Atualizar estado local
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                status: newMessageStatus, 
                concluido: isComplete,
                respondido_por: newMessageStatus !== 'pendente' ? user.id : undefined 
              }
            : msg
        )
      );
      
      // Atualizar mensagem selecionada se for a mesma
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { 
          ...prev, 
          status: newMessageStatus, 
          concluido: isComplete,
          respondido_por: newMessageStatus !== 'pendente' ? user.id : undefined 
        } : null);
      }
      
      console.log(`✅ Status unificado atualizado para ${unifiedStatus}`);
    } catch (err: unknown) {
      console.error('❌ Erro ao atualizar status unificado:', err);
    }
  };

  // Função para obter status unificado baseado no status da mensagem e conclusão
  const getUnifiedStatus = (message: ContactMessage): 'pendente' | 'lido' | 'respondido' | 'concluido' => {
    if (message.concluido) {
      return 'concluido';
    }
    return message.status;
  };

  // Função para obter cor do status unificado
  const getUnifiedStatusColor = (status: 'pendente' | 'lido' | 'respondido' | 'concluido') => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'lido':
        return 'bg-blue-100 text-blue-800';
      case 'respondido':
        return 'bg-green-100 text-green-800';
      case 'concluido':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para obter label do status unificado
  const getUnifiedStatusLabel = (status: 'pendente' | 'lido' | 'respondido' | 'concluido') => {
    switch (status) {
      case 'pendente':
        return '⏳ Pendente';
      case 'lido':
        return '👀 Lida';
      case 'respondido':
        return '✅ Respondida';
      case 'concluido':
        return '🎯 Concluída';
      default:
        return '📋 Indefinido';
    }
  };

  const handleArchiveMessage = async (messageId: string, shouldArchive: boolean) => {
    if (!user) return;
    try {
      await archiveMessage(messageId, shouldArchive);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, arquivado: shouldArchive }
            : msg
        )
      );
      // Se a mensagem foi arquivada e não estamos mostrando arquivadas, remover da lista
      if (shouldArchive && !showArchived) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
      } else if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, arquivado: shouldArchive } : null);
      }
      console.log(`✅ Mensagem ${shouldArchive ? 'arquivada' : 'desarquivada'}`);
    } catch (err: unknown) {
      console.error('❌ Erro ao arquivar mensagem:', err);
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true;
    return msg.status === filter;
  });


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
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">📬 Mensagens de Contato</h1>
            
            {/* Toggle Arquivadas - Simplificado */}
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showArchived 
                  ? 'bg-gray-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>{showArchived ? '📂' : '🗄️'}</span>
              <span>{showArchived ? 'Ocultar Arquivadas' : 'Mostrar Arquivadas'}</span>
              {showArchived && messages.filter(m => m.arquivado).length > 0 && (
                <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">
                  {messages.filter(m => m.arquivado).length}
                </span>
              )}
            </button>
          </div>
          
          <p className="text-gray-600">
            Visualize e gerencie todas as mensagens recebidas através do formulário de contato.
          </p>
        </div>

        {/* Layout Master-Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-200px)]">
          
          {/* Lista de Mensagens - Coluna Esquerda */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Filtros Reformulados */}
            <div className="p-4 border-b bg-gray-50">
              <div className="mb-2">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Filtrar por Status:</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors text-left ${
                    filter === 'all'
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>📋</span>
                      <span>Todas</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      filter === 'all' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {messages.length}
                    </span>
                  </div>
                </button>
                
                <button
                  onClick={() => setFilter('pendente')}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors text-left ${
                    filter === 'pendente'
                      ? 'bg-yellow-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>⏳</span>
                      <span>Pendentes</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      filter === 'pendente' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {messages.filter(m => m.status === 'pendente').length}
                    </span>
                  </div>
                </button>
                
                <button
                  onClick={() => setFilter('lido')}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors text-left ${
                    filter === 'lido'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>👀</span>
                      <span>Lidas</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      filter === 'lido' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {messages.filter(m => m.status === 'lido').length}
                    </span>
                  </div>
                </button>
                
                <button
                  onClick={() => setFilter('respondido')}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors text-left ${
                    filter === 'respondido'
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>✅</span>
                      <span>Respondidas</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      filter === 'respondido' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {messages.filter(m => m.status === 'respondido').length}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Lista de Mensagens */}
            <div className="overflow-y-auto h-full">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">📭</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhuma mensagem encontrada
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {filter === 'all' 
                      ? 'Ainda não há mensagens de contato.' 
                      : `Não há mensagens com status "${filter}".`}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedMessage?.id === message.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">
                            <span className="font-medium">Assunto:</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                            {message.assunto}
                          </h4>
                        </div>
                        {/* Apenas tag de status - sem ícone pasta */}
                        <div className="ml-2 flex-shrink-0">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUnifiedStatusColor(getUnifiedStatus(message))}`}>
                            {getUnifiedStatusLabel(getUnifiedStatus(message)).replace(/^[^\s]+ /, '')}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Contato:</span>
                        </div>
                        <strong>{message.nome}</strong> • {message.email}
                      </div>
                      <div className="mb-2">
                        <div className="text-xs text-gray-500 mb-1">
                          <span className="font-medium">Mensagem:</span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {message.mensagem}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Enviado:</span> {new Date(message.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detalhes da Mensagem - Coluna Direita */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border overflow-hidden">
            {selectedMessage ? (
              <>
                {/* Header da Mensagem */}
                <div className="p-6 border-b bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedMessage.assunto}
                      </h2>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedMessage.tipo_solicitacao)}`}>
                          {CONTACT_TYPES_LABELS[selectedMessage.tipo_solicitacao]}
                        </span>
                        {selectedMessage.arquivado && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            📁 Arquivada
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Controles no lado direito */}
                    <div className="flex items-start gap-3">
                      {/* Controle de Status */}
                      <div className="flex flex-col items-end gap-1">
                        <label className="text-xs font-medium text-gray-600">Status</label>
                        <select
                          value={getUnifiedStatus(selectedMessage)}
                          onChange={(e) => handleUnifiedStatusChange(selectedMessage.id, e.target.value as 'pendente' | 'lido' | 'respondido' | 'concluido')}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[150px] bg-white shadow-sm"
                        >
                          <option value="pendente">⏳ Pendente</option>
                          <option value="lido">👀 Lida</option>
                          <option value="respondido">✅ Respondida</option>
                          <option value="concluido">🎯 Concluída</option>
                        </select>
                      </div>
                      
                      {/* Botão Arquivar */}
                      <div className="flex flex-col items-end gap-1">
                        <label className="text-xs font-medium text-gray-600">Arquivo</label>
                        <button
                          onClick={() => handleArchiveMessage(selectedMessage.id, !selectedMessage.arquivado)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 min-w-[120px] justify-center ${
                            selectedMessage.arquivado
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'bg-orange-500 text-white hover:bg-orange-600'
                          }`}
                        >
                          <span>{selectedMessage.arquivado ? '📂' : '📁'}</span>
                          <span>{selectedMessage.arquivado ? 'Desarquivar' : 'Arquivar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Informações de Contato */}
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Informações de Contato</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Nome:</span> {selectedMessage.nome}</p>
                      <p><span className="font-medium">Email:</span> {selectedMessage.email}</p>
                      {selectedMessage.telefone && (
                        <p><span className="font-medium">Telefone:</span> {selectedMessage.telefone}</p>
                      )}
                      <p><span className="font-medium">Enviado em:</span> {new Date(selectedMessage.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>

                </div>

                {/* Conteúdo da Mensagem */}
                <div className="p-6 overflow-y-auto">
                  <h3 className="font-semibold text-gray-900 mb-3">Mensagem</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.mensagem}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-8">
                <div>
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Selecione uma mensagem
                  </h3>
                  <p className="text-gray-600">
                    Clique em uma mensagem na lista ao lado para ver os detalhes.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};