import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { Logo } from '../components/common/Logo';

export const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (newPassword.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (newPassword === '12345678') {
      setError('Você não pode usar a senha padrão. Escolha uma senha personalizada.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔑 ChangePassword: Atualizando senha...');
      
      // Atualizar senha no Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (authError) {
        throw authError;
      }

      // Atualizar flag na tabela usuarios
      const { error: dbError } = await supabase
        .from('usuarios')
        .update({ must_change_password: false, updated_at: new Date().toISOString() })
        .eq('id', user?.id);

      if (dbError) {
        console.error('❌ Erro ao atualizar flag no banco:', dbError);
        // Não falhar se só o flag der erro - senha já foi alterada
      }

      console.log('✅ ChangePassword: Senha alterada com sucesso');
      setSuccess(true);
      
      // Recarregar página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err: any) {
      console.error('❌ ChangePassword: Erro ao alterar senha:', err);
      setError(err.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
                <Logo size="md" showText={false} />
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-6 rounded-lg">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2">Senha Alterada!</h2>
              <p className="text-green-700">
                Sua senha foi alterada com sucesso. A página será recarregada automaticamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
              <Logo size="md" showText={false} />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Alteração de Senha Obrigatória
          </h2>
          <p className="mt-2 text-gray-600">
            Para sua segurança, você deve alterar a senha padrão antes de continuar
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-md sm:rounded-lg sm:px-10">
          
          {/* Alerta de segurança */}
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm mb-6">
            <div className="flex items-center">
              <span className="text-lg mr-2">🔒</span>
              <div>
                <div className="font-semibold">Primeira vez acessando?</div>
                <div>Altere a senha padrão para uma senha segura e personalizada.</div>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Nova Senha
              </label>
              <div className="mt-1">
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Digite sua nova senha (mín. 8 caracteres)"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Nova Senha
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Confirme sua nova senha"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
              <div className="font-semibold mb-1">Dicas para uma senha segura:</div>
              <ul className="text-xs space-y-1">
                <li>• Pelo menos 8 caracteres</li>
                <li>• Use letras, números e símbolos</li>
                <li>• Não use informações pessoais</li>
                <li>• Não use a senha padrão (12345678)</li>
              </ul>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Alterando senha...' : 'Alterar Senha'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};