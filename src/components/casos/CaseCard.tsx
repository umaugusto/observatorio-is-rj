import { CasoInovacao } from '../../types';

interface CaseCardProps {
  caso: CasoInovacao;
  onClick?: () => void;
}

export const CaseCard = ({ caso, onClick }: CaseCardProps) => {
  return (
    <div 
      className="card cursor-pointer transform hover:scale-105 transition-transform duration-200"
      onClick={onClick}
    >
      {caso.imagem_url ? (
        <img
          src={caso.imagem_url}
          alt={caso.titulo}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <span className="text-primary-600 font-semibold text-lg">
            {caso.categoria}
          </span>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full font-medium">
            {caso.categoria}
          </span>
          <span className="text-gray-500 text-sm">
            {caso.data_cadastro || caso.created_at 
              ? new Date(caso.data_cadastro || caso.created_at).toLocaleDateString('pt-BR')
              : 'Data não disponível'}
          </span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {caso.titulo}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {caso.descricao}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center">
            📍 {caso.localizacao}
          </span>
          {caso.extensionista && (
            <span>
              Por {caso.extensionista.nome}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};