'use client';

interface MethodIconProps {
  method: string;
  className?: string;
}

export function MethodIcon({ method, className = 'w-6 h-6' }: MethodIconProps) {
  const iconProps = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  const methodLower = method.toLowerCase();

  // V60, Pour Over, Kalita Wave
  if (methodLower.includes('v60') || methodLower.includes('pour') || methodLower.includes('kalita')) {
    return (
      <svg {...iconProps}>
        <path d="M8 3h8l-1 8H9L8 3z" />
        <path d="M9 11l-1 8a2 2 0 002 2h4a2 2 0 002-2l-1-8" />
        <path d="M12 3v-1" />
        <circle cx="12" cy="15" r="1" fill="currentColor" />
      </svg>
    );
  }

  // Chemex
  if (methodLower.includes('chemex')) {
    return (
      <svg {...iconProps}>
        <path d="M8 2h8" />
        <path d="M9 2l-1 9h8l-1-9" />
        <path d="M8 11l-2 9a1 1 0 001 1h10a1 1 0 001-1l-2-9" />
        <path d="M10 8l4 0" />
      </svg>
    );
  }

  // AeroPress
  if (methodLower.includes('aero')) {
    return (
      <svg {...iconProps}>
        <rect x="7" y="4" width="10" height="14" rx="1" />
        <path d="M9 4V2h6v2" />
        <path d="M12 18v3" />
        <path d="M10 21h4" />
        <line x1="9" y1="8" x2="15" y2="8" />
      </svg>
    );
  }

  // French Press
  if (methodLower.includes('french') || methodLower.includes('press')) {
    return (
      <svg {...iconProps}>
        <rect x="6" y="4" width="12" height="16" rx="1" />
        <path d="M12 2v2" />
        <line x1="12" y1="4" x2="12" y2="10" />
        <line x1="6" y1="10" x2="18" y2="10" />
        <path d="M18 8h2a1 1 0 011 1v4a1 1 0 01-1 1h-2" />
      </svg>
    );
  }

  // Espresso, Moka Pot
  if (methodLower.includes('espresso') || methodLower.includes('moka')) {
    return (
      <svg {...iconProps}>
        <path d="M5 11h14v6a4 4 0 01-4 4H9a4 4 0 01-4-4v-6z" />
        <path d="M7 11V8a5 5 0 0110 0v3" />
        <path d="M19 13h1a2 2 0 010 4h-1" />
        <circle cx="12" cy="15" r="1" fill="currentColor" />
      </svg>
    );
  }

  // Default coffee cup
  return (
    <svg {...iconProps}>
      <path d="M17 8h1a4 4 0 110 8h-1" />
      <path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
      <path d="M6 1v3" />
      <path d="M10 1v3" />
      <path d="M14 1v3" />
    </svg>
  );
}
