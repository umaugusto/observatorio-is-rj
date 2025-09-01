import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from './Avatar';
import { Logo } from './Logo';
import { ROUTES } from '../../utils/constants';
import { getUnreadMessagesCount } from '../../services/supabase';

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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

  const handleMessages = () => {
    navigate(ROUTES.MESSAGES);
    setDropdownOpen(false);
  };

  // Carregar contagem de mensagens não lidas
  const loadUnreadCount = async () => {
    if (user && ['admin', 'extensionista', 'coordenador', 'pesquisador'].includes(user.tipo)) {
      try {
        const count = await getUnreadMessagesCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Erro ao carregar contagem de mensagens:', error);
      }
    }
  };

  useEffect(() => {
    loadUnreadCount();
    // Atualizar contagem a cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

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
          <Link to={ROUTES.HOME} className="flex items-center">
            <Logo size="md" showText={true} />
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

                    {(user.is_admin || user.tipo === 'demo') && (
                      <>
                        <button
                          onClick={handleUserManagement}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>Gerenciar Usuários</span>
                        </button>
                        
                        <button
                          onClick={() => { navigate(ROUTES.ADMIN_CASES); setDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Gerenciar Casos</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={handleMessages}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Mensagens</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-5 text-center">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                    
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