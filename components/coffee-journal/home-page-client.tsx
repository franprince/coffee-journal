'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecipeForm } from '@/components/coffee-journal/recipe-form';
import { RecipeCard } from '@/components/coffee-journal/recipe-card';
import { BrewLogCard } from '@/components/coffee-journal/brew-log-card';
import { RecipeFiltersComponent } from '@/components/coffee-journal/recipe-filters';
import type { Recipe, BrewLog, RecipeFilters, Coffee } from '@/lib/types';
import { useRecipes, useCoffees, useAllLogs } from '@/lib/hooks';
import { CoffeeManager } from '@/components/coffee-journal/coffee-manager';
import {
  Coffee as CoffeeIcon,
  Plus,
  BookOpen,
  FlaskConical,
  X,
  Bean
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HomePageClientProps {
  initialRecipes: Recipe[];
  initialLogs: BrewLog[];
  initialCoffees: Coffee[];
}

export default function HomePageClient({ initialRecipes, initialLogs, initialCoffees }: HomePageClientProps) {
  const t = useTranslations('HomePage');
  const tCommon = useTranslations('Common');
  const { recipes, refresh: refreshRecipes, deleteRecipe } = useRecipes(initialRecipes);
  const { logs, addLog: createLog } = useAllLogs(initialLogs);
  const { coffees, addCoffee, updateCoffee, deleteCoffee } = useCoffees(initialCoffees);

  const [activeTab, setActiveTab] = useState('recipes');
  const [showNewRecipe, setShowNewRecipe] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<RecipeFilters>({
    methods: [],
    waterTypes: [],
    grindSizeRange: [0, 100],
  });

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    if (searchQuery && !recipe.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filters.methods.length > 0 && !filters.methods.includes(recipe.method)) return false;
    if (filters.waterTypes.length > 0 && (!recipe.waterType || !filters.waterTypes.includes(recipe.waterType))) return false;
    if (recipe.grindSize < filters.grindSizeRange[0] || recipe.grindSize > filters.grindSizeRange[1]) return false;
    return true;
  });

  const handleSaveRecipe = async (recipe: Recipe) => {
    try {
      const { RecipeService } = await import('@/lib/db-client');
      await RecipeService.createRecipe(recipe);
      await refreshRecipes();
      setShowNewRecipe(false);
    } catch (error) {
      console.error('Failed to save recipe:', error);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-accent selection:text-accent-foreground">
      {/* Header: Clean & Solid */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground border border-primary">
                <CoffeeIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold tracking-tight text-primary">
                  Brew Journal
                </h1>
              </div>
            </div>

            <Button
              onClick={() => setShowNewRecipe(true)}
              className="rounded-md bg-accent text-accent-foreground hover:bg-accent/90 font-medium shadow-none border border-transparent"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('createFirstRecipe')}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
          <TabsList className="w-full sm:w-auto bg-transparent border-b border-border p-0 h-auto gap-6 justify-start rounded-none">
            <TabsTrigger
              value="recipes"
              className="rounded-none border-b-2 border-transparent px-2 py-2 data-[state=active]:border-accent data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all font-serif text-muted-foreground hover:text-foreground"
            >
              <FlaskConical className="w-4 h-4 mr-2 opacity-70" />
              {t('recipes')}
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="rounded-none border-b-2 border-transparent px-2 py-2 data-[state=active]:border-accent data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all font-serif text-muted-foreground hover:text-foreground"
            >
              <BookOpen className="w-4 h-4 mr-2 opacity-70" />
              {t('brewLog')}
            </TabsTrigger>
            <TabsTrigger
              value="coffees"
              className="rounded-none border-b-2 border-transparent px-2 py-2 data-[state=active]:border-accent data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all font-serif text-muted-foreground hover:text-foreground"
            >
              <Bean className="w-4 h-4 mr-2 opacity-70" />
              {t('pantry')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipes" className="animate-fade-in-up">
            <RecipeFiltersComponent
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              onFiltersChange={setFilters}
              resultCount={filteredRecipes.length}
              totalCount={recipes.length}
            />

            {recipes.length === 0 ? (
              <div className="modern-card p-12 text-center mt-6 rounded-3xl">
                <div className="w-12 h-12 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                  <CoffeeIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-sans text-lg font-bold mb-2">{t('noRecipesTitle')}</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                  {t('noRecipesDesc')}
                </p>
                <Button onClick={() => setShowNewRecipe(true)} variant="outline">
                  {t('createFirstRecipe')}
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6 mt-6">
                {filteredRecipes.map((recipe, index) => (
                  <div key={recipe.id} className={`animate-fade-in-up stagger-${Math.min(index + 1, 4)}`}>
                    <RecipeCard recipe={recipe} onDelete={deleteRecipe} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs" className="animate-fade-in-up">
            {logs.length === 0 ? (
              <div className="journal-card p-12 text-center mt-6">
                <h3 className="font-serif text-lg font-bold mb-2">{t('noLogsTitle')}</h3>
                <p className="text-muted-foreground text-sm">{t('noLogsDesc')}</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {logs.map((log) => (
                  <BrewLogCard key={log.id} log={log} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="coffees" className="animate-fade-in-up">
            <CoffeeManager
              coffees={coffees}
              onAddCoffee={addCoffee}
              onUpdateCoffee={updateCoffee}
              onDeleteCoffee={deleteCoffee}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* New Recipe Slide-over / Modal */}
      {showNewRecipe && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/20 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border-l border-border h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-bold">{useTranslations('RecipeForm')('newTitle')}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowNewRecipe(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <RecipeForm onSave={handleSaveRecipe} />
          </div>
        </div>
      )}
    </main>
  );
}
