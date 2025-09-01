import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm', 
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-2xl'
};

export const Avatar = ({ src, name, size = 'md', className = '', onClick }: AvatarProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Gerar iniciais do nome
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(word => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const sizeClass = sizeClasses[size];
  
  // Se tem imagem válida e não houve erro, mostrar imagem
  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={`Avatar de ${name}`}
        className={`${sizeClass} rounded-full object-cover border-2 border-gray-200 ${onClick ? 'cursor-pointer hover:border-primary-300' : ''} ${className}`}
        onError={() => setImageError(true)}
        onClick={onClick}
      />
    );
  }

  // Fallback para iniciais
  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold border-2 border-gray-200 ${onClick ? 'cursor-pointer hover:border-primary-300' : ''} ${className}`}
      onClick={onClick}
    >
      {getInitials(name)}
    </div>
  );
};