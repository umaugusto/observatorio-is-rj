import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from './Avatar';
import { ROUTES, APP_NAME } from '../../utils/constants';

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate(ROUTES.HOME);
      setDropdownOpen(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleUserManagement = () => {
    navigate(ROUTES.ADMIN_USERS);
    setDropdownOpen(false);
  };

  const handleProfile = () => {
    navigate(ROUTES.PROFILE);
    setDropdownOpen(false);
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-3 text-sm text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  <span className="hidden sm:block">Olá, {user.nome}</span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <Avatar
                    src={user.avatar_url}
                    name={user.nome}
                    size="sm"
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={handleProfile}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Meu Perfil</span>
                    </button>
                    
                    {user.tipo === 'admin' && (
                      <button
                        onClick={handleUserManagement}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <span>Gerenciar Usuários</span>
                      </button>
                    )}
                    
                    <hr className="my-1" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-800 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sair</span>
                    </button>
                  </div>
                )}
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