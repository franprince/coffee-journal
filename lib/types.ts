export type BrewMethod =
  | 'pour-over'
  | 'v60'
  | 'chemex'
  | 'aeropress'
  | 'french-press'
  | 'espresso';

export type WaterType =
  | 'filtered'
  | 'spring'
  | 'distilled'
  | 'tap'
  | 'third-wave';

export type GrindSize =
  | 'extra-fine'
  | 'fine'
  | 'medium-fine'
  | 'medium'
  | 'medium-coarse'
  | 'coarse';

export interface Pour {
  id: string;
  time: string; // mm:ss format
  waterAmount: number; // grams
  temperature?: number; // °C or °F
  temperatureUnit?: 'C' | 'F';
  notes?: string;
}

export interface Recipe {
  id: string;
  name: string;
  method: string; // Allows custom methods beyond BrewMethod
  coffeeWeight: number; // grams
  totalWaterWeight: number; // grams
  grindSize: number; // 0-1400 microns
  waterType?: string; // Allows custom water types
  pours: Pour[];
  createdAt: Date;
  coffeeId?: string;
  coffeeImageUrl?: string;
  owner_id?: string;
}

export const METHOD_SUGGESTIONS = [
  'V60',
  'Pour Over',
  'Chemex',
  'AeroPress',
  'French Press',
  'Espresso',
  'Moka Pot',
  'Cold Brew',
  'Siphon',
  'Kalita Wave',
];

export const WATER_SUGGESTIONS = [
  'Filtered',
  'Spring',
  'Distilled',
  'Tap',
  'Third Wave Water',
  'Mineral',
  'RO Water',
];

export interface TasteProfile {
  acidity: number; // 0-100
  sweetness: number; // 0-100
  body: number; // 0-100
  bitterness: number; // 0-100
}

export type RoastLevel = 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';

export interface Coffee {
  id: string;
  name: string;
  roaster: string;
  roastLevel?: RoastLevel;
  origin?: string;
  process?: string;
  notes?: string;
  imageUrl?: string;
  isArchived?: boolean;
}

export interface BrewLog {
  id: string;
  recipeId: string;
  recipeName: string;
  method: string;
  date: Date;

  // Coffee Used
  coffeeId?: string;
  coffeeName?: string; // Snapshot in case coffee is deleted

  tasteProfile: TasteProfile;
  rating: number; // 1-5

  notes?: string;
  imageUrls?: string[]; // Up to 5 images
  // Tweaks/Overrides for this specific brew
  coffeeWeight?: number;
  totalWaterWeight?: number;
  grindSize?: number;
  temperature?: number;
  pours?: Pour[];
}

export const METHOD_LABELS: Record<BrewMethod, string> = {
  'pour-over': 'Pour Over',
  'v60': 'V60',
  'chemex': 'Chemex',
  'aeropress': 'AeroPress',
  'french-press': 'French Press',
  'espresso': 'Espresso',
};

export const WATER_TYPE_LABELS: Record<WaterType, string> = {
  'filtered': 'Filtered',
  'spring': 'Spring',
  'distilled': 'Distilled',
  'tap': 'Tap',
  'third-wave': 'Third Wave',
};



export interface RecipeFilters {
  methods: string[];
  waterTypes: string[];
  grindSizeRange: [number, number];
}
