/**
 * Get country flag emoji from country name
 * Uses fuzzy matching for common coffee-producing countries
 */
export function getCountryFlag(countryName?: string): string {
    if (!countryName) return '';

    const normalized = countryName.toLowerCase().trim();

    // Map of country names/variations to flag emojis
    const countryFlags: Record<string, string> = {
        // Africa
        'ethiopia': '🇪🇹',
        'ethiopian': '🇪🇹',
        'kenya': '🇰🇪',
        'kenyan': '🇰🇪',
        'rwanda': '🇷🇼',
        'rwandan': '🇷🇼',
        'burundi': '🇧🇮',
        'tanzania': '🇹🇿',
        'tanzanian': '🇹🇿',
        'uganda': '🇺🇬',
        'ugandan': '🇺🇬',

        // Central/South America
        'colombia': '🇨🇴',
        'colombian': '🇨🇴',
        'brazil': '🇧🇷',
        'brazilian': '🇧🇷',
        'costa rica': '🇨🇷',
        'costarica': '🇨🇷',
        'costa rican': '🇨🇷',
        'guatemala': '🇬🇹',
        'guatemalan': '🇬🇹',
        'honduras': '🇭🇳',
        'honduran': '🇭🇳',
        'nicaragua': '🇳🇮',
        'nicaraguan': '🇳🇮',
        'el salvador': '🇸🇻',
        'elsalvador': '🇸🇻',
        'salvadoran': '🇸🇻',
        'panama': '🇵🇦',
        'panamanian': '🇵🇦',
        'peru': '🇵🇪',
        'peruvian': '🇵🇪',
        'ecuador': '🇪🇨',
        'ecuadorian': '🇪🇨',
        'bolivia': '🇧🇴',
        'bolivian': '🇧🇴',
        'mexico': '🇲🇽',
        'mexican': '🇲🇽',

        // Asia/Pacific
        'indonesia': '🇮🇩',
        'indonesian': '🇮🇩',
        'vietnam': '🇻🇳',
        'vietnamese': '🇻🇳',
        'india': '🇮🇳',
        'indian': '🇮🇳',
        'yemen': '🇾🇪',
        'yemeni': '🇾🇪',
        'papua new guinea': '🇵🇬',
        'png': '🇵🇬',
        'thailand': '🇹🇭',
        'thai': '🇹🇭',
        'china': '🇨🇳',
        'chinese': '🇨🇳',
        'hawaii': '🇺🇸',
        'hawaiian': '🇺🇸',
    };

    return countryFlags[normalized] || '';
}
