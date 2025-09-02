import React from 'react';
import logoImage from '../../assets/logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-16'
};

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl'
};

const subtitleSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const logoHeight = sizeClasses[size];
  const textSize = textSizeClasses[size];
  const subtitleSize = subtitleSizeClasses[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo PNG - Usando exatamente o vetor-01.png */}
      <div className={`${logoHeight} flex-shrink-0`}>
        <img 
          src={logoImage}
          alt="Designário Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Texto do logo */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold leading-tight ${textSize}`} style={{ color: '#002f42' }}>
            Designário
          </h1>
          <span className={`text-white px-2 py-0.5 rounded font-medium leading-tight ${subtitleSize} tracking-wide`} style={{ backgroundColor: '#ff6b6b' }}>
            OBSERVATÓRIO DE INOVAÇÃO SOCIAL
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;