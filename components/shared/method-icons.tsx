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

  // V60 - Cone with spiral/ridges hint
  if (methodLower.includes('v60')) {
    return (
      <svg {...iconProps}>
        {/* Cone body */}
        <path d="M4 5h16l-7 13a2 2 0 0 1-2 0L4 5z" />
        {/* Base/Carafe hint */}
        <path d="M7 5l3 6" opacity="0.5" />
        <path d="M17 5l-3 6" opacity="0.5" />
        <path d="M2 5h20" />
      </svg>
    );
  }

  // Kalita Wave - Flat bottom
  if (methodLower.includes('kalita')) {
    return (
      <svg {...iconProps}>
        {/* Wave body */}
        <path d="M3 5h18l-3 8h-12z" />
        <path d="M6 13l1 4h10l1-4" />
        {/* Wave ridges hint */}
        <path d="M5 5l1 8" opacity="0.3" />
        <path d="M8 5l1 8" opacity="0.3" />
        <path d="M11 5l1 8" opacity="0.3" />
        <path d="M14 5l-1 8" opacity="0.3" />
        <path d="M17 5l-1 8" opacity="0.3" />
        <path d="M19 5l-1 8" opacity="0.3" />
      </svg>
    );
  }

  // Origami - Zigzag edges
  if (methodLower.includes('origami')) {
    return (
      <svg {...iconProps}>
        {/* Zigzag top */}
        <path d="M2 5l2 2 2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2 2-2" />
        {/* Body */}
        <path d="M4 6l6 12 1 2h2l1-2 6-12" />
        <path d="M12 18v3" />
      </svg>
    );
  }

  // Hario Switch (V60 with a switch block at bottom)
  if (methodLower.includes('switch')) {
    return (
      <svg {...iconProps}>
        {/* Cone */}
        <path d="M4 4h16l-6.5 12h-3z" />
        {/* Switch mechanism */}
        <rect x="9" y="16" width="6" height="4" rx="1" />
        <circle cx="12" cy="18" r="1" fill="currentColor" />
        {/* Lever */}
        <path d="M15 17h2a1 1 0 0 1 1 1v0" />
      </svg>
    );
  }

  // AeroPress - Plunger
  if (methodLower.includes('aero') || methodLower.includes('opress')) {
    return (
      <svg {...iconProps}>
        {/* Cylinder Body */}
        <path d="M7 5v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5" />
        {/* Flanges */}
        <path d="M5 5h14" />
        <path d="M6 18h12" />
        {/* Plunger Top */}
        <path d="M9 1V5h6V1z" />
        <line x1="12" y1="1" x2="12" y2="5" />
        {/* Piston inside hint */}
        <line x1="8" y1="14" x2="16" y2="14" opacity="0.3" />
      </svg>
    );
  }

  // Chemex - Hourglass
  if (methodLower.includes('chemex')) {
    return (
      <svg {...iconProps}>
        {/* Top Funnel */}
        <path d="M7 3l4 8" />
        <path d="M17 3l-4 8" />
        <path d="M7 3h10" />
        {/* Collar */}
        <rect x="10" y="10" width="4" height="2" rx="0.5" fill="currentColor" opacity="0.2" />
        {/* Bottom Carafe */}
        <path d="M11 12l-5 8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l-5-8" />
      </svg>
    );
  }

  // French Press
  if (methodLower.includes('french') || methodLower.includes('press')) {
    return (
      <svg {...iconProps}>
        <rect x="7" y="6" width="10" height="14" rx="1" />
        <path d="M12 2v4" />
        <rect x="9" y="2" width="6" height="2" rx="0.5" />
        {/* Plunger Base */}
        <line x1="8" y1="15" x2="16" y2="15" opacity="0.5" strokeDasharray="4 4" />
        <line x1="12" y1="6" x2="12" y2="15" />
      </svg>
    );
  }

  // Moka Pot - Geometric
  if (methodLower.includes('moka')) {
    return (
      <svg {...iconProps}>
        {/* Bottom Chamber */}
        <path d="M6 21l2-8h8l2 8H6z" />
        {/* Separation */}
        <line x1="8" y1="13" x2="16" y2="13" />
        {/* Top Chamber */}
        <path d="M8 13L6 5h12l-2 8" />
        {/* Lid */}
        <path d="M12 2l3 3H9z" />
        {/* Handle */}
        <path d="M17 7c2 0 3 2 3 5s-2 5-2 5" />
      </svg>
    );
  }

  // Espresso - Portafilter
  if (methodLower.includes('espresso')) {
    return (
      <svg {...iconProps}>
        {/* Basket */}
        <path d="M4 6h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6z" />
        {/* Spout */}
        <path d="M11 13v2a1 1 0 0 0 2 0v-2" />
        {/* Handle */}
        <path d="M20 7h3v2h-3" />
      </svg>
    );
  }

  // Default Coffee Cup
  return (
    <svg {...iconProps}>
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
      <path d="M6 1v3" />
      <path d="M10 1v3" />
      <path d="M14 1v3" />
    </svg>
  );
}
