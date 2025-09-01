import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface PasswordChangeGuardProps {
  children: ReactNode;
}

export const PasswordChangeGuard = ({ children }: PasswordChangeGuardProps) => {
  const { user, loading } = useAuth();

  // Aguardar carregamento
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Se usuário não está logado, não fazer nada (ProtectedRoute cuida disso)
  if (!user) {
    return <>{children}</>;
  }

  // Se usuário deve trocar senha, redirecionar para troca de senha
  if (user.must_change_password === true) {
    console.log('🔑 PasswordChangeGuard: Usuário deve trocar senha, redirecionando...');
    return <Navigate to="/change-password" replace />;
  }

  // Caso contrário, mostrar conteúdo normal
  return <>{children}</>;
};