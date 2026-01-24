import { Recipe, BrewLog } from './types';

export const SAMPLE_RECIPES: Recipe[] = [
    {
        id: '1',
        name: 'Morning V60',
        method: 'v60',
        coffeeWeight: 18,
        totalWaterWeight: 300,
        grindSize: 45,
        waterType: 'filtered',
        pours: [
            { id: '1a', time: '00:00', waterAmount: 50, temperature: 93, temperatureUnit: 'C', notes: 'bloom' },
            { id: '1b', time: '00:45', waterAmount: 100, temperature: 93, temperatureUnit: 'C', notes: 'spiral pour' },
            { id: '1c', time: '01:30', waterAmount: 75, temperature: 92, temperatureUnit: 'C', notes: '' },
            { id: '1d', time: '02:15', waterAmount: 75, temperature: 91, temperatureUnit: 'C', notes: 'center pour' },
        ],
        createdAt: new Date('2025-01-20'),
    },
    {
        id: '2',
        name: 'Weekend Chemex',
        method: 'chemex',
        coffeeWeight: 32,
        totalWaterWeight: 500,
        grindSize: 55,
        waterType: 'spring',
        pours: [
            { id: '2a', time: '00:00', waterAmount: 80, temperature: 94, temperatureUnit: 'C', notes: 'bloom' },
            { id: '2b', time: '01:00', waterAmount: 150, temperature: 93, temperatureUnit: 'C', notes: '' },
            { id: '2c', time: '02:00', waterAmount: 150, temperature: 92, temperatureUnit: 'C', notes: '' },
            { id: '2d', time: '03:00', waterAmount: 120, temperature: 91, temperatureUnit: 'C', notes: '' },
        ],
        createdAt: new Date('2025-01-18'),
    },
];

export const SAMPLE_LOGS: BrewLog[] = [
    {
        id: 'log1',
        recipeId: '1',
        recipeName: 'Morning V60',
        method: 'v60',
        date: new Date('2025-01-24'),
        tasteProfile: { acidity: 70, sweetness: 65, body: 50, bitterness: 25 },
        rating: 4,
        notes: 'Slightly sour, try grinding finer next time',
    },
    {
        id: 'log2',
        recipeId: '2',
        recipeName: 'Weekend Chemex',
        method: 'chemex',
        date: new Date('2025-01-21'),
        tasteProfile: { acidity: 55, sweetness: 75, body: 60, bitterness: 20 },
        rating: 5,
        notes: 'Perfect extraction, keep this recipe',
    },
];
