import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/common/Logo';
import { ROUTES } from '../utils/constants';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, signIn, signInDemo } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver logado
  if (user) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    console.log('📝 Login: Iniciando processo de login para:', email);
    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Login: Chamando signIn...');
      const userData = await signIn(email, password);
      
      console.log('✅ Login: signIn completado com usuário:', userData.email);
      console.log('👤 Login: Dados do usuário:', userData);
      setLoading(false);
      
      console.log('🚀 Login: Navegando para home...');
      navigate(ROUTES.HOME);
      
    } catch (err: any) {
      console.error('❌ Login: Erro capturado:', err);
      setError(err.message || 'Erro ao fazer login');
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    console.log('🎭 Login: Iniciando modo demonstração');
    setLoading(true);
    setError(null);

    try {
      await signInDemo();
      console.log('✅ Login: Modo demo ativado, navegando para home...');
      navigate(ROUTES.HOME);
    } catch (err: any) {
      console.error('❌ Login: Erro no modo demo:', err);
      setError('Erro ao entrar no modo demonstração');
    } finally {
      setLoading(false);
    }
  };

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
            Área do Extensionista
          </h2>
          <p className="mt-2 text-gray-600">
            Faça login para gerenciar casos de inovação social
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-md sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
              
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {loading ? 'Carregando...' : 'Entrar em Demonstração'}
              </button>
              
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">
                  O modo demonstração permite explorar todas as funcionalidades<br/>
                  sem fazer alterações no banco de dados.
                </p>
              </div>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Precisa de acesso?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Entre em contato com o administrador para criar sua conta de extensionista.
              </p>
              <div className="space-y-2">
                <Link 
                  to={`${ROUTES.CONTATO}?tipo=acesso`}
                  className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                >
                  📝 Solicitar acesso como extensionista
                </Link>
                
                <div className="text-sm text-gray-500">
                  <span>Admin com problemas de acesso? </span>
                  <Link 
                    to="/emergency-setup"
                    className="text-red-600 hover:text-red-700 hover:underline font-medium"
                  >
                    🚨 Setup de Emergência
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};