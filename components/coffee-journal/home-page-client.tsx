'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecipeForm } from '@/components/coffee-journal/recipe-form';
import { RecipeCard } from '@/components/coffee-journal/recipe-card';
import { PourTimeline } from '@/components/coffee-journal/pour-timeline';
import { BrewLogForm } from '@/components/coffee-journal/brew-log-form';
import { BrewLogCard } from '@/components/coffee-journal/brew-log-card';
import { RecipeFiltersComponent } from '@/components/coffee-journal/recipe-filters';
import type { Recipe, BrewLog, RecipeFilters, Coffee } from '@/lib/types';
import { useRecipes, useCoffees, useAllLogs } from '@/lib/hooks';
import { METHOD_LABELS } from '@/lib/types';
import { MethodIcon } from '@/components/coffee-journal/method-icons';
import { CoffeeManager } from '@/components/coffee-journal/coffee-manager';
import {
  Coffee as CoffeeIcon,
  Plus,
  BookOpen,
  FlaskConical,
  X,
  ChevronLeft,
  Bean
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
// Removed SAMPLE_LOGS import as we now use real data

interface HomePageClientProps {
  initialRecipes: Recipe[];
  initialLogs: BrewLog[];
  initialCoffees: Coffee[];
}

export default function HomePageClient({ initialRecipes, initialLogs, initialCoffees }: HomePageClientProps) {
  const { recipes, refresh: refreshRecipes, deleteRecipe } = useRecipes(initialRecipes);
  const { logs, addLog: createLog, refresh: refreshLogs } = useAllLogs(initialLogs);
  const { coffees, addCoffee, updateCoffee, deleteCoffee } = useCoffees(initialCoffees);

  const [activeTab, setActiveTab] = useState('recipes');
  const [showNewRecipe, setShowNewRecipe] = useState(false);
  const [showBrewLog, setShowBrewLog] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<RecipeFilters>({
    methods: [],
    waterTypes: [],
    grindSizeRange: [0, 100],
  });

  // Filter recipes based on search and filters
  const filteredRecipes = recipes.filter(recipe => {
    // Search query
    if (searchQuery && !recipe.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Method filter
    if (filters.methods.length > 0 && !filters.methods.includes(recipe.method)) {
      return false;
    }
    // Water type filter
    if (filters.waterTypes.length > 0 && (!recipe.waterType || !filters.waterTypes.includes(recipe.waterType))) {
      return false;
    }
    // Grind size filter
    if (recipe.grindSize < filters.grindSizeRange[0] || recipe.grindSize > filters.grindSizeRange[1]) {
      return false;
    }
    return true;
  });

  const handleSaveRecipe = async (recipe: Recipe) => {
    try {
      // Import RecipeService at the top if not already, or use hook if we had addRecipe there.
      // Ideally we move this logic to useRecipes hook completely, but for now:
      const { RecipeService } = await import('@/lib/db-client');
      await RecipeService.createRecipe(recipe);
      await refreshRecipes(); // Refresh the list from DB
      setShowNewRecipe(false);
    } catch (error) {
      console.error('Failed to save recipe:', error);
      // TODO: Show error toast to user
    }
  };

  const handleAddLog = async (log: BrewLog) => {
    try {
      await createLog(log); // This calls service and refreshes
      setShowBrewLog(false);
    } catch (error) {
      console.error('Failed to save log:', error);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header - Neon Espresso Style */}
      <header className="sticky top-0 z-50 bg-background/50 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary shadow-lg shadow-primary/10 animate-pulse-glow">
                <CoffeeIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-gradient tracking-tight">
                  Brew Journal
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block font-medium tracking-wide uppercase opacity-80">
                  Perfect your pour
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  setShowNewRecipe(true);
                }}
                className="rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground gap-2 shadow-[0_0_20px_oklch(0.65_0.18_55_/_0.3)] transition-all duration-300 border-0"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline font-bold">New Recipe</span>
              </Button>
            </div>
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
                <TabsTrigger
                  value="coffees"
                  className="flex-1 sm:flex-initial gap-2 data-[state=active]:bg-coffee-espresso data-[state=active]:text-coffee-crema"
                >
                  <Bean className="w-4 h-4" />
                  My Coffees
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
                      <CoffeeIcon className="w-8 h-8 text-coffee-espresso" />
                    </div>
                    <h3 className="font-display text-lg text-coffee-espresso mb-2">No recipes yet</h3>
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
                      <CoffeeIcon className="w-8 h-8 text-coffee-espresso" />
                    </div>
                    <h3 className="font-display text-lg text-coffee-espresso mb-2">No recipes found</h3>
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
                          onDelete={deleteRecipe}
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
                    <h3 className="font-display text-lg text-coffee-espresso mb-2">No brew logs yet</h3>
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

              <TabsContent value="coffees" className="mt-6">
                <CoffeeManager
                  coffees={coffees}
                  onAddCoffee={addCoffee}
                  onUpdateCoffee={updateCoffee}
                  onDeleteCoffee={deleteCoffee}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Side Panel - Recipe Form Only */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className={cn(
              'glass-card subtle-glow rounded-2xl overflow-hidden transition-all duration-300 border border-border',
              showNewRecipe ? 'opacity-100' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto hidden lg:block lg:invisible'
            )}>
              {/* New Recipe Form */}
              {showNewRecipe && (
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
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile new recipe modal overlay */}
      {showNewRecipe && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowNewRecipe(false)}
        />
      )}

      {/* Mobile side panel */}
      <div className={cn(
        'fixed inset-x-0 bottom-0 z-50 lg:hidden transition-transform duration-300',
        showNewRecipe ? 'translate-y-0' : 'translate-y-full'
      )}>
        <div className="bg-card rounded-t-3xl max-h-[85vh] overflow-hidden border-t border-x border-border shadow-lg">
          {showNewRecipe && (
            <div className="relative">
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur">
                <h3 className="font-display text-lg font-semibold text-coffee-espresso">New Recipe</h3>
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
          )}
        </div>
      </div>
    </main>
  );
}
