'use client';

import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  variant?: 'default' | 'white';
}

// Brand colors matching the new SVG logo
const colors = {
  waterBlue: '#2990fa',
  electricYellow: '#f9c53f',
  heatOrange: '#fb7832',
  lightGrey: '#B3B9C4',
};

export default function Logo({
  size = 'md',
  showText = true,
  showTagline = true,
  className = '',
  variant = 'default'
}: LogoProps) {
  const sizes = {
    sm: {
      icon: 'w-8 h-8',
      text: 'text-base xs:text-lg',
      tagline: 'text-[8px]',
      gap: 'gap-2'
    },
    md: {
      icon: 'w-10 h-10',
      text: 'text-lg xs:text-xl',
      tagline: 'text-[9px] xs:text-[10px]',
      gap: 'gap-2.5'
    },
    lg: {
      icon: 'w-12 h-12',
      text: 'text-xl xs:text-2xl',
      tagline: 'text-[10px] xs:text-xs',
      gap: 'gap-3'
    },
  };

  const s = sizes[size];
  const isWhite = variant === 'white';

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {/* External SVG Logo */}
      <div className={`${s.icon} relative`}>
        <Image
          src="/logo.svg"
          alt="Víz Villany Fűtés Logo"
          width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
          height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
          className="object-contain"
          priority
        />
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${s.text} font-semibold font-heading leading-tight tracking-tight`}>
            <span style={{ color: isWhite ? '#ffffff' : colors.waterBlue }}>Víz</span>
            <span style={{ color: isWhite ? '#FFE066' : colors.electricYellow }}>Villany</span>
            <span style={{ color: isWhite ? '#FFB088' : colors.heatOrange }}>Fűtés</span>
          </span>
          {showTagline && (
            <span
              className={`${s.tagline} leading-tight hidden sm:block tracking-[0.15em] uppercase font-medium`}
              style={{ color: isWhite ? 'rgba(255,255,255,0.7)' : colors.lightGrey }}
            >
              Budapest • Pest megye
            </span>
          )}
        </div>
      )}
    </div>
  );
}
