import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';
import { useState, useEffect } from 'react';
import { getUnreadMessagesCount } from '../services/supabase';

interface DashboardCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
  badge?: number;
}

const DashboardCard = ({ icon, title, description, onClick, color, badge }: DashboardCardProps) => (
  <div
    onClick={onClick}
    className={`${color} rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 relative`}
  >
    {badge && badge > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-6 text-center">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
    <div className="text-3xl mb-3">{icon}</div>
    <h3 className="font-bold text-lg mb-2">{title}</h3>
    <p className="text-sm opacity-90">{description}</p>
  </div>
);

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Carregar contagem de mensagens não lidas
  useEffect(() => {
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

    loadUnreadCount();
    // Atualizar contagem a cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (!user) {
    navigate(ROUTES.LOGIN);
    return null;
  }

  const isAdmin = user.is_admin || user.tipo === 'demo';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Olá, {user.nome.split(' ')[0]}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Bem-vindo à sua área de trabalho
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          {/* Gerenciar Casos */}
          <DashboardCard
            icon="📊"
            title="Gerenciar Casos"
            description="Visualizar, editar e criar novos casos de inovação social"
            onClick={() => navigate(ROUTES.ADMIN_CASES)}
            color="bg-blue-100 text-blue-900 hover:bg-blue-200"
          />

          {/* Gerenciar Usuários - apenas para admins */}
          {isAdmin && (
            <DashboardCard
              icon="👥"
              title="Gerenciar Usuários"
              description="Administrar contas de usuários e permissões"
              onClick={() => navigate(ROUTES.ADMIN_USERS)}
              color="bg-purple-100 text-purple-900 hover:bg-purple-200"
            />
          )}

          {/* Mensagens */}
          <DashboardCard
            icon="📬"
            title="Mensagens"
            description="Visualizar e responder mensagens de contato"
            onClick={() => navigate(ROUTES.MESSAGES)}
            color="bg-green-100 text-green-900 hover:bg-green-200"
            badge={unreadCount}
          />

          {/* Meu Perfil */}
          <DashboardCard
            icon="👤"
            title="Meu Perfil"
            description="Editar informações pessoais e configurações"
            onClick={() => navigate(ROUTES.PROFILE)}
            color="bg-orange-100 text-orange-900 hover:bg-orange-200"
          />

          {/* Ver Mapa */}
          <DashboardCard
            icon="🗺️"
            title="Ver Mapa"
            description="Visualizar casos no mapa interativo"
            onClick={() => navigate(ROUTES.MAPA)}
            color="bg-teal-100 text-teal-900 hover:bg-teal-200"
          />

          {/* Sair */}
          <DashboardCard
            icon="🚪"
            title="Sair"
            description="Fazer logout da plataforma"
            onClick={handleSignOut}
            color="bg-red-100 text-red-900 hover:bg-red-200"
          />
        </div>

        {/* Quick Stats */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm text-gray-600">
              Você está conectado como {user.tipo === 'demo' ? 'Demonstração' : user.tipo}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};