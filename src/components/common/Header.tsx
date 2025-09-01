import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES, APP_NAME } from '../../utils/constants';

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container-custom">
        <div className="flex justify-between items-center h-16">
          <Link to={ROUTES.HOME} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">OI</span>
            </div>
            <span className="font-semibold text-gray-900 hidden sm:block">
              {APP_NAME}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to={ROUTES.HOME} className="text-gray-600 hover:text-primary-600">
              Início
            </Link>
            <Link to={ROUTES.CASOS} className="text-gray-600 hover:text-primary-600">
              Casos
            </Link>
            <Link to="/categorias" className="text-gray-600 hover:text-primary-600">
              Categorias
            </Link>
            <Link to="/mapa" className="text-gray-600 hover:text-primary-600">
              Mapa
            </Link>
            <Link to="/sobre" className="text-gray-600 hover:text-primary-600">
              Sobre
            </Link>
            <Link to="/contato" className="text-gray-600 hover:text-primary-600">
              Contato
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Olá, {user.nome}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link to={ROUTES.LOGIN} className="btn-primary">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};