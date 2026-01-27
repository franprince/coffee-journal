export type GrinderId = 'comandante_c40' | 'timemore_c2' | 'baratza_encore' | 'fellow_ode_gen2' | '1zpresso_jx_pro';

export interface Grinder {
    id: GrinderId;
    name: string;
    clickRange: { min: number; max: number }; // General range
    micronPerClick: number; // Approximate
    zeroPoint?: number;
    settingFormat: (clicks: number) => string;
}

export const GRINDERS: Record<GrinderId, Grinder> = {
    'comandante_c40': {
        id: 'comandante_c40',
        name: 'Comandante C40 MK4',
        clickRange: { min: 0, max: 40 },
        micronPerClick: 30, // ~30 microns per click
        settingFormat: (c) => `${c} clicks`
    },
    'timemore_c2': {
        id: 'timemore_c2',
        name: 'Timemore C2',
        clickRange: { min: 6, max: 30 },
        micronPerClick: 25, // Rough estimate, C2 is stepped
        settingFormat: (c) => `${c} clicks`
    },
    'baratza_encore': {
        id: 'baratza_encore',
        name: 'Baratza Encore',
        clickRange: { min: 1, max: 40 },
        micronPerClick: 40, // Very rough average, it's non-linear
        settingFormat: (c) => `${c}`
    },
    'fellow_ode_gen2': {
        id: 'fellow_ode_gen2',
        name: 'Fellow Ode Gen 2',
        clickRange: { min: 1, max: 11 },
        micronPerClick: 100, // It's strictly stepped
        settingFormat: (c) => `${c}`
    },
    '1zpresso_jx_pro': {
        id: '1zpresso_jx_pro',
        name: '1Zpresso JX-Pro',
        clickRange: { min: 0, max: 50 }, // per rotation, 12.5 micron per click
        micronPerClick: 12.5,
        settingFormat: (c) => `${(c / 10).toFixed(1)} rotations` // Simplified
    }
};

// Simplified conversion logic: microns / micronsPerClick
export function micronsToClicks(microns: number, grinderId: GrinderId): string {
    const grinder = GRINDERS[grinderId];
    if (!grinder) return '';

    const clicks = Math.round(microns / grinder.micronPerClick);
    return grinder.settingFormat(clicks);
}

// Reverse conversion for potential future use or range display
export function clicksToMicrons(clicks: number, grinderId: GrinderId): number {
    const grinder = GRINDERS[grinderId];
    if (!grinder) return 0;
    return clicks * grinder.micronPerClick;
}
