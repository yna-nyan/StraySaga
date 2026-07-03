import React from 'react';

interface CatIconProps {
  avatarId: string;
  type?: 'portrait' | 'avatar' | 'sleeping' | 'shivering' | 'scared';
  className?: string;
  size?: number;
  facingBack?: boolean;
}

export const CatIcon: React.FC<CatIconProps> = ({
  avatarId,
  type = 'portrait',
  className = '',
  size = 64,
  facingBack = false
}) => {
  // Map avatarId to the folder and prefix
  let folderName = '';
  let filePrefix = '';

  switch (avatarId) {
    case 'calico':
      folderName = 'calico cat';
      filePrefix = 'calico';
      break;
    case 'tabby':
      folderName = 'gray cat';
      filePrefix = 'gray';
      break;
    case 'black':
      folderName = 'black cat';
      filePrefix = 'black';
      break;
    case 'tuxedo':
    default:
      folderName = 'white cat';
      filePrefix = 'white';
      break;
  }

  // Choose back image if facing back is requested
  const isBack = facingBack;
  const fileName = isBack ? `${filePrefix}back.png` : `${filePrefix}front.png`;
  // Encode the spaces in folder names correctly for standard URL safety
  const imgSrc = `/${encodeURIComponent(folderName)}/${fileName}`;

  // Choose appropriate CSS animation and styles based on state
  let animationClass = '';
  if (type === 'shivering') {
    animationClass = 'animate-shake';
  } else if (type === 'scared') {
    animationClass = 'animate-pulse scale-105';
  } else if (type === 'sleeping') {
    // Elegant tilt for sleeping cats
    animationClass = 'rotate-12 opacity-95';
  }

  return (
    <img
      src={imgSrc}
      alt={`${avatarId} (${type})`}
      width={size}
      height={size}
      className={`object-contain select-none pointer-events-none transition-transform duration-200 ${animationClass} ${className}`}
      referrerPolicy="no-referrer"
      style={{ width: size, height: size }}
      id={`cat-${type}-${avatarId}`}
      onError={(e) => {
        console.warn(`Failed to load cat image: ${imgSrc}`);
      }}
    />
  );
};
