import React from 'react';

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
      {/* Logo SVG - Livro aberto com seta */}
      <div className={`${logoHeight} flex-shrink-0`}>
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Livro aberto */}
          <g>
            {/* Página esquerda (laranja) */}
            <path
              d="M15 25 C15 20, 20 15, 25 15 L45 15 C47 15, 50 18, 50 20 L50 75 C50 77, 47 80, 45 80 L25 80 C20 80, 15 75, 15 70 Z"
              fill="#E95420"
              stroke="#C2471A"
              strokeWidth="1"
            />
            
            {/* Página direita (verde) */}
            <path
              d="M50 20 C50 18, 53 15, 55 15 L75 15 C80 15, 85 20, 85 25 L85 70 C85 75, 80 80, 75 80 L55 80 C53 80, 50 77, 50 75 Z"
              fill="#4CAF50"
              stroke="#388E3C"
              strokeWidth="1"
            />
            
            {/* Lombada central */}
            <line
              x1="50"
              y1="15"
              x2="50"
              y2="80"
              stroke="#003F5C"
              strokeWidth="2"
            />
            
            {/* Linhas de texto na página esquerda */}
            <line x1="20" y1="30" x2="40" y2="30" stroke="#FFFFFF" strokeWidth="1" opacity="0.8"/>
            <line x1="20" y1="35" x2="42" y2="35" stroke="#FFFFFF" strokeWidth="1" opacity="0.6"/>
            <line x1="20" y1="40" x2="38" y2="40" stroke="#FFFFFF" strokeWidth="1" opacity="0.6"/>
            
            {/* Linhas de texto na página direita */}
            <line x1="60" y1="30" x2="80" y2="30" stroke="#FFFFFF" strokeWidth="1" opacity="0.8"/>
            <line x1="58" y1="35" x2="80" y2="35" stroke="#FFFFFF" strokeWidth="1" opacity="0.6"/>
            <line x1="62" y1="40" x2="80" y2="40" stroke="#FFFFFF" strokeWidth="1" opacity="0.6"/>
          </g>
          
          {/* Seta de crescimento/progresso no canto superior direito */}
          <g transform="translate(70, 10)">
            {/* Quadrado de fundo */}
            <rect
              x="0"
              y="0"
              width="25"
              height="25"
              rx="3"
              fill="#4CAF50"
              stroke="#388E3C"
              strokeWidth="1"
            />
            
            {/* Seta para cima e direita */}
            <path
              d="M8 17 L17 8 M17 8 L17 15 M17 8 L10 8"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>

      {/* Texto do logo */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold text-primary-600 leading-tight ${textSize}`}>
            Designário
          </h1>
          <span className={`text-accent-600 font-medium leading-tight ${subtitleSize} tracking-wide`}>
            OBSERVATÓRIO DE INOVAÇÃO SOCIAL
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;