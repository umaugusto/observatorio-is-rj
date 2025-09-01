import { useAuth } from '../../hooks/useAuth';

export const DemoBanner = () => {
  const { user } = useAuth();

  // Só mostrar se for usuário demo
  if (!user?.isDemo) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 text-center text-sm font-medium shadow-md relative z-40">
      <div className="flex items-center justify-center space-x-2">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>
          <strong>MODO DEMONSTRAÇÃO:</strong> Você está explorando a plataforma. 
          Nenhuma alteração será salva no banco de dados.
        </span>
        <div className="hidden sm:flex items-center space-x-4 text-xs opacity-90">
          <span>• Dados fictícios</span>
          <span>• Operações simuladas</span>
        </div>
      </div>
    </div>
  );
};