import { useState, useEffect } from 'react';
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

  const loadMessages = async () => {
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
    } catch (err: any) {
      console.error('❌ Erro ao carregar mensagens:', err);
      setError(err.message || 'Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [showArchived]);

  const handleStatusChange = async (messageId: string, newStatus: 'pendente' | 'lido' | 'respondido') => {
    if (!user) return;
    try {
      await updateMessageStatus(messageId, newStatus, user.id);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: newStatus, respondido_por: newStatus !== 'pendente' ? user.id : undefined }
            : msg
        )
      );
      // Atualizar mensagem selecionada se for a mesma
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, status: newStatus, respondido_por: newStatus !== 'pendente' ? user.id : undefined } : null);
      }
      console.log(`✅ Status atualizado para ${newStatus}`);
    } catch (err: any) {
      console.error('❌ Erro ao atualizar status:', err);
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
      // Atualizar mensagem selecionada se for a mesma
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, concluido: newComplete } : null);
      }
      console.log(`✅ Mensagem marcada como ${newComplete ? 'concluída' : 'não concluída'}`);
    } catch (err: any) {
      console.error('❌ Erro ao alterar status de conclusão:', err);
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
    } catch (err: any) {
      console.error('❌ Erro ao arquivar mensagem:', err);
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
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">📬 Mensagens de Contato</h1>
            
            {/* Toggle Arquivadas - Mais Visível */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
              <span className="text-sm font-medium text-gray-700">Visualização:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Incluir arquivadas
                </span>
              </label>
              {showArchived && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {messages.filter(m => m.arquivado).length} arquivadas
                </span>
              )}
            </div>
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
                        <div className="flex gap-1 ml-2 flex-shrink-0">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(message.status)}`}>
                            {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                          </span>
                          {message.concluido && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              ✅
                            </span>
                          )}
                          {message.arquivado && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              📁
                            </span>
                          )}
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
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Enviado:</span> {new Date(message.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        {/* Botão Arquivar na lista */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevenir seleção da mensagem
                            handleArchiveMessage(message.id, !message.arquivado);
                          }}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            message.arquivado
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                          title={message.arquivado ? 'Desarquivar mensagem' : 'Arquivar mensagem'}
                        >
                          {message.arquivado ? '📂' : '🗄️'}
                        </button>
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
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedMessage.status)}`}>
                          {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedMessage.tipo_solicitacao)}`}>
                          {CONTACT_TYPES_LABELS[selectedMessage.tipo_solicitacao]}
                        </span>
                        {selectedMessage.concluido && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            ✅ Concluída
                          </span>
                        )}
                        {selectedMessage.arquivado && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            📁 Arquivada
                          </span>
                        )}
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

                  {/* Controles */}
                  <div className="flex flex-wrap gap-3">
                    {/* Dropdown de Status com Conclusão */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-700">Status da Mensagem</label>
                      <select
                        value={selectedMessage.status}
                        onChange={(e) => handleStatusChange(selectedMessage.id, e.target.value as 'pendente' | 'lido' | 'respondido')}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[140px]"
                      >
                        <option value="pendente">📋 Pendente</option>
                        <option value="lido">👀 Lida</option>
                        <option value="respondido">✅ Respondida</option>
                      </select>
                    </div>

                    {/* Dropdown de Conclusão */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-700">Status da Tarefa</label>
                      <select
                        value={selectedMessage.concluido ? 'concluida' : 'pendente'}
                        onChange={(e) => handleToggleComplete(selectedMessage.id, e.target.value === 'pendente')}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[140px]"
                      >
                        <option value="pendente">⏳ Em Andamento</option>
                        <option value="concluida">✅ Concluída</option>
                      </select>
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