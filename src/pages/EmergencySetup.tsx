import { useState } from 'react';
import { supabase } from '../services/supabase';

export const EmergencySetup = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createRootUser = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      console.log('🚨 EmergencySetup: Criando usuário root...');
      
      // 1. Primeiro verificar se já existe na tabela usuarios
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', 'antonio.aas@ufrj.br')
        .single();

      if (existingUser) {
        setMessage('Usuário root já existe na tabela usuarios! Tente fazer login.');
        return;
      }

      // 2. Buscar usuário no Auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        throw new Error('Erro ao listar usuários do Auth: ' + authError.message);
      }

      const authUser = authUsers.users.find(u => u.email === 'antonio.aas@ufrj.br');
      
      if (!authUser) {
        // 3. Criar usuário no Auth se não existir
        const { data: newAuthUser, error: createAuthError } = await supabase.auth.admin.createUser({
          email: 'antonio.aas@ufrj.br',
          password: 'temporaria123', // ALTERAR DEPOIS!
          email_confirm: true
        });

        if (createAuthError) {
          throw createAuthError;
        }

        if (!newAuthUser.user) {
          throw new Error('Usuário criado no Auth mas dados não retornados');
        }

        // 4. Inserir na tabela usuarios
        const { error: dbError } = await supabase
          .from('usuarios')
          .insert({
            id: newAuthUser.user.id,
            email: 'antonio.aas@ufrj.br',
            nome: 'Antonio Augusto Silva',
            tipo: 'admin',
            ativo: true,
            must_change_password: true, // Forçar troca da senha temporária
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (dbError) {
          throw dbError;
        }

        setMessage('✅ Usuário root criado com sucesso!\n\n' +
                  'Email: antonio.aas@ufrj.br\n' +
                  'Senha temporária: temporaria123\n\n' +
                  '⚠️ IMPORTANTE: Você será obrigado a alterar a senha no primeiro login!\n\n' +
                  'Agora você pode fazer login normalmente.');

      } else {
        // Usuário existe no Auth, apenas criar na tabela usuarios
        const { error: dbError } = await supabase
          .from('usuarios')
          .insert({
            id: authUser.id,
            email: 'antonio.aas@ufrj.br',
            nome: 'Antonio Augusto Silva',
            tipo: 'admin',
            ativo: true,
            must_change_password: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (dbError) {
          throw dbError;
        }

        setMessage('✅ Usuário root adicionado à tabela usuarios!\n\n' +
                  'Agora você pode fazer login com sua senha atual.');
      }

    } catch (err: any) {
      console.error('❌ EmergencySetup: Erro:', err);
      setError('Erro: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚨</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Setup de Emergência
          </h1>
          <p className="text-gray-600 text-sm">
            Use apenas se não conseguir fazer login como root
          </p>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 text-sm whitespace-pre-line">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6 text-sm">
          <div className="font-semibold mb-1">Este script irá:</div>
          <ul className="text-xs space-y-1">
            <li>• Verificar se usuário root existe</li>
            <li>• Criar no Supabase Auth se necessário</li>
            <li>• Adicionar à tabela usuarios como admin</li>
            <li>• Permitir login normal</li>
          </ul>
        </div>

        <button
          onClick={createRootUser}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Criando usuário root...' : '🔧 Criar Usuário Root'}
        </button>

        <div className="mt-4 text-center">
          <a 
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Voltar para login
          </a>
        </div>
      </div>
    </div>
  );
};