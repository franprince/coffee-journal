'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecipeForm } from '@/components/coffee-journal/recipe-form';
import { RecipeCard } from '@/components/coffee-journal/recipe-card';
import { PourTimeline } from '@/components/coffee-journal/pour-timeline';
import { BrewLogForm } from '@/components/coffee-journal/brew-log-form';
import { BrewLogCard } from '@/components/coffee-journal/brew-log-card';
import { RecipeFiltersComponent } from '@/components/coffee-journal/recipe-filters';
import type { Recipe, BrewLog, RecipeFilters } from '@/lib/types';
import { METHOD_LABELS } from '@/lib/types';
import { MethodIcon } from '@/components/coffee-journal/method-icons';
import {
  Coffee,
  Plus,
  BookOpen,
  FlaskConical,
  X,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Sample data for demo
const SAMPLE_RECIPES: Recipe[] = [
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

const SAMPLE_LOGS: BrewLog[] = [
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

export default function CoffeeJournalPage() {
  const [recipes, setRecipes] = useState<Recipe[]>(SAMPLE_RECIPES);
  const [logs, setLogs] = useState<BrewLog[]>(SAMPLE_LOGS);
  const [activeTab, setActiveTab] = useState('recipes');
  const [showNewRecipe, setShowNewRecipe] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showBrewLog, setShowBrewLog] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<RecipeFilters>({
    methods: [],
    waterTypes: [],
    grindSizeRange: [0, 100],
  });

  // Filter recipes based on search and filters
  const filteredRecipes = recipes.filter((recipe) => {
    // Search filter
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Method filter
    const matchesMethod = filters.methods.length === 0 ||
      filters.methods.some(m => recipe.method.toLowerCase() === m.toLowerCase());
    if (!matchesMethod) return false;

    // Water type filter
    const matchesWaterType = filters.waterTypes.length === 0 ||
      (recipe.waterType && filters.waterTypes.some(w => recipe.waterType?.toLowerCase() === w.toLowerCase()));
    if (!matchesWaterType) return false;

    // Grind size filter
    const matchesGrindSize = recipe.grindSize >= filters.grindSizeRange[0] &&
      recipe.grindSize <= filters.grindSizeRange[1];
    if (!matchesGrindSize) return false;

    return true;
  });

  const handleSaveRecipe = (recipe: Recipe) => {
    setRecipes(prev => [recipe, ...prev]);
    setShowNewRecipe(false);
    setSelectedRecipe(recipe);
  };

  const handleSaveLog = (log: BrewLog) => {
    setLogs(prev => [log, ...prev]);
    setShowBrewLog(false);
    setActiveTab('logs');
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowBrewLog(false);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-card via-card to-secondary/20 backdrop-blur-md border-b border-border shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-coffee-espresso text-coffee-crema shadow-lg">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-serif text-xl md:text-2xl font-bold text-coffee-espresso">
                  Brew Journal
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Perfect your pour
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                setShowNewRecipe(true);
                setSelectedRecipe(null);
              }}
              className="bg-coffee-espresso hover:bg-coffee-espresso/90 text-coffee-crema gap-2 shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Recipe</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr,400px] gap-6">
          {/* Main Content Area */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full sm:w-auto bg-card p-1 border border-border shadow-sm">
                <TabsTrigger
                  value="recipes"
                  className="flex-1 sm:flex-initial gap-2 data-[state=active]:bg-coffee-espresso data-[state=active]:text-coffee-crema"
                >
                  <FlaskConical className="w-4 h-4" />
                  Recipes
                </TabsTrigger>
                <TabsTrigger
                  value="logs"
                  className="flex-1 sm:flex-initial gap-2 data-[state=active]:bg-coffee-espresso data-[state=active]:text-coffee-crema"
                >
                  <BookOpen className="w-4 h-4" />
                  Brew Log
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recipes" className="mt-6">
                {/* Search and Filters */}
                <RecipeFiltersComponent
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  filters={filters}
                  onFiltersChange={setFilters}
                  resultCount={filteredRecipes.length}
                  totalCount={recipes.length}
                />

                {recipes.length === 0 ? (
                  <div className="glass-card rounded-2xl p-12 text-center border border-border">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
                      <Coffee className="w-8 h-8 text-coffee-espresso" />
                    </div>
                    <h3 className="font-serif text-lg text-coffee-espresso mb-2">No recipes yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Create your first coffee recipe to get started
                    </p>
                    <Button
                      onClick={() => setShowNewRecipe(true)}
                      className="bg-coffee-espresso hover:bg-coffee-espresso/90 text-coffee-crema"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Recipe
                    </Button>
                  </div>
                ) : filteredRecipes.length === 0 ? (
                  <div className="glass-card rounded-2xl p-12 text-center border border-border mt-6">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
                      <Coffee className="w-8 h-8 text-coffee-espresso" />
                    </div>
                    <h3 className="font-serif text-lg text-coffee-espresso mb-2">No recipes found</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Try adjusting your search or filters
                    </p>
                    <Button
                      onClick={() => {
                        setSearchQuery('');
                        setFilters({ methods: [], waterTypes: [], grindSizeRange: [0, 100] });
                      }}
                      variant="outline"
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4 mt-6">
                    {filteredRecipes.map((recipe, index) => (
                      <div
                        key={recipe.id}
                        className={`animate-fade-in-up stagger-${Math.min(index + 1, 4)}`}
                      >
                        <RecipeCard
                          recipe={recipe}
                          onSelect={handleSelectRecipe}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="logs" className="mt-6">
                {logs.length === 0 ? (
                  <div className="glass-card rounded-2xl p-12 text-center border border-border">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
                      <BookOpen className="w-8 h-8 text-coffee-espresso" />
                    </div>
                    <h3 className="font-serif text-lg text-coffee-espresso mb-2">No brew logs yet</h3>
                    <p className="text-muted-foreground text-sm">
                      Select a recipe and log your first brew
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {logs.map((log) => (
                      <BrewLogCard key={log.id} log={log} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Side Panel - Recipe Form / Recipe Detail */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className={cn(
              'glass-card subtle-glow rounded-2xl overflow-hidden transition-all duration-300 border border-border',
              (showNewRecipe || selectedRecipe) ? 'opacity-100' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'
            )}>
              {/* New Recipe Form */}
              {showNewRecipe ? (
                <div className="relative">
                  <button
                    onClick={() => setShowNewRecipe(false)}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="p-5 max-h-[calc(100vh-8rem)] overflow-y-auto">
                    <RecipeForm onSave={handleSaveRecipe} />
                  </div>
                </div>
              ) : selectedRecipe ? (
                // Recipe Detail View
                <div className="relative">
                  {/* Close/back button */}
                  <button
                    onClick={() => setSelectedRecipe(null)}
                    className="absolute top-4 left-4 p-2 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground z-10 flex items-center gap-1 text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back</span>
                  </button>

                  <div className="p-5 pt-14 max-h-[calc(100vh-8rem)] overflow-y-auto">
                    {/* Recipe Header - Compact & Cohesive */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-3 rounded-xl bg-coffee-espresso text-coffee-crema shadow-sm hover:shadow-md transition-shadow">
                        <MethodIcon method={selectedRecipe.method} className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                          <div>
                            <h2 className="font-serif text-xl font-bold text-coffee-espresso">
                              {selectedRecipe.name}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                              {METHOD_LABELS[selectedRecipe.method as keyof typeof METHOD_LABELS] || selectedRecipe.method}
                            </p>
                          </div>
                        </div>

                        {/* Consolidated Stats Row */}
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          {/* Ratio */}
                          <div className="flex items-baseline gap-1">
                            <span className="font-serif text-xl font-bold text-coffee-espresso">
                              1:{(selectedRecipe.totalWaterWeight / selectedRecipe.coffeeWeight).toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">ratio</span>
                          </div>

                          <div className="w-px h-8 bg-border" />

                          {/* Coffee */}
                          <div className="flex flex-col">
                            <span className="font-mono font-semibold text-coffee-espresso leading-none">
                              {selectedRecipe.coffeeWeight}g
                            </span>
                            <span className="text-[10px] text-muted-foreground">coffee</span>
                          </div>

                          <div className="w-px h-8 bg-border" />

                          {/* Water */}
                          <div className="flex flex-col">
                            <span className="font-mono font-semibold text-coffee-water leading-none">
                              {selectedRecipe.totalWaterWeight}g
                            </span>
                            <span className="text-[10px] text-muted-foreground">water</span>
                          </div>
                        </div>
                      </div>

                      {/* Log Brew Button - Moved to Header */}
                      {!showBrewLog && (
                        <div className="hidden sm:block">
                          <Button
                            onClick={() => setShowBrewLog(true)}
                            className="bg-coffee-espresso hover:bg-coffee-espresso/90 text-coffee-crema shadow-sm hover:shadow-md transition-all"
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Log Brew
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Pour Timeline */}
                    <div className="mb-6">
                      <PourTimeline pours={selectedRecipe.pours} totalWater={selectedRecipe.totalWaterWeight} />
                    </div>

                    {/* Log Brew Button / Form */}
                    {!showBrewLog ? (
                      // Mobile layout only - button shown in header for desktop
                      <div className="sm:hidden">
                        <Button
                          onClick={() => setShowBrewLog(true)}
                          className="w-full bg-coffee-espresso hover:bg-coffee-espresso/90 text-coffee-crema h-12 text-base shadow-sm"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Log This Brew
                        </Button>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-border">
                        <BrewLogForm
                          recipe={selectedRecipe}
                          onSave={handleSaveLog}
                          onCancel={() => setShowBrewLog(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Empty state
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
                    <Coffee className="w-8 h-8 text-coffee-espresso" />
                  </div>
                  <h3 className="font-serif text-lg text-coffee-espresso mb-2">
                    Select a Recipe
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a recipe to view details and log your brew
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile selected recipe modal overlay */}
      {(selectedRecipe || showNewRecipe) && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => {
            setSelectedRecipe(null);
            setShowNewRecipe(false);
          }}
        />
      )}

      {/* Mobile side panel */}
      <div className={cn(
        'fixed inset-x-0 bottom-0 z-50 lg:hidden transition-transform duration-300',
        (selectedRecipe || showNewRecipe) ? 'translate-y-0' : 'translate-y-full'
      )}>
        <div className="bg-card rounded-t-3xl max-h-[85vh] overflow-hidden border-t border-x border-border shadow-lg">
          {showNewRecipe ? (
            <div className="relative">
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur">
                <h3 className="font-serif text-lg font-semibold text-coffee-espresso">New Recipe</h3>
                <button
                  onClick={() => setShowNewRecipe(false)}
                  className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[calc(85vh-4rem)]">
                <RecipeForm onSave={handleSaveRecipe} />
              </div>
            </div>
          ) : selectedRecipe && (
            <div className="relative">
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur">
                <div className="flex items-center gap-3">
                  <MethodIcon method={selectedRecipe.method} className="w-5 h-5 text-coffee-espresso" />
                  <h3 className="font-serif text-lg font-semibold text-coffee-espresso">
                    {selectedRecipe.name}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedRecipe(null);
                    setShowBrewLog(false);
                  }}
                  className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[calc(85vh-4rem)]">
                {/* Ratio */}
                <div className="flex items-center justify-center gap-6 mb-6">
                  <div className="text-center p-3 rounded-xl bg-secondary border border-border">
                    <div className="font-mono text-xl text-coffee-espresso font-semibold">{selectedRecipe.coffeeWeight}g</div>
                    <div className="text-xs text-muted-foreground">coffee</div>
                  </div>
                  <div className="font-serif text-3xl font-bold text-coffee-espresso">
                    1:{(selectedRecipe.totalWaterWeight / selectedRecipe.coffeeWeight).toFixed(1)}
                  </div>
                  <div className="text-center p-3 rounded-xl bg-coffee-water/10 border border-coffee-water/20">
                    <div className="font-mono text-xl text-coffee-water font-semibold">{selectedRecipe.totalWaterWeight}g</div>
                    <div className="text-xs text-muted-foreground">water</div>
                  </div>
                </div>

                {/* Pour Timeline */}
                <div className="mb-6">
                  <PourTimeline pours={selectedRecipe.pours} totalWater={selectedRecipe.totalWaterWeight} />
                </div>

                {/* Log Brew Button/Form */}
                {!showBrewLog ? (
                  <Button
                    onClick={() => setShowBrewLog(true)}
                    className="w-full bg-coffee-espresso hover:bg-coffee-espresso/90 text-coffee-crema h-12 text-base shadow-sm"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Log This Brew
                  </Button>
                ) : (
                  <BrewLogForm
                    recipe={selectedRecipe}
                    onSave={handleSaveLog}
                    onCancel={() => setShowBrewLog(false)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
