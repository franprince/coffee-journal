'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecipeForm } from '@/components/recipe';
import { BrewLogCard, BrewLogDetailDialog } from '@/components/brew-log';
import type { Recipe, BrewLog, RecipeFilters, Coffee } from '@/lib/types';
import type { User } from '@supabase/supabase-js';
import { useJournal } from '@/lib/hooks/use-journal';
import { CoffeeManager } from '@/components/coffee';
import { SettingsDialog } from '@/components/shared';
import { BookOpen, FlaskConical, X, Bean } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Extracted Components
import { AppHeader } from './app-header';
import { RecipeList } from './recipe-list';

interface HomePageClientProps {
  initialRecipes: Recipe[];
  initialCommunityRecipes: Recipe[];
  initialLogs: BrewLog[];
  initialCoffees: Coffee[];
  user: User | null;
}

export default function HomePageClient(props: HomePageClientProps) {
  const t = useTranslations('HomePage');
  const tRecipeForm = useTranslations('RecipeForm');

  // Local UI State
  const [activeTab, setActiveTab] = useState('recipes');
  const [showNewRecipe, setShowNewRecipe] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [recipeViewMode, setRecipeViewMode] = useState<'my' | 'community'>(props.user ? 'my' : 'community');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<RecipeFilters>({
    methods: [],
    waterTypes: [],
    grindSizeRange: [0, 1400],
  });
  const [selectedLog, setSelectedLog] = useState<BrewLog | null>(null);

  // Data & Operations from Generic Hook
  const {
    user,
    myRecipes,
    communityRecipes,
    logs,
    coffees,
    isSaving,
    forkingRecipeId,
    deletingRecipeId,
    createRecipe,
    forkRecipe,
    deleteRecipe,
    refreshCommunityRecipes,
    addCoffee,
    updateCoffee,
    deleteCoffee,
    saveLogAsRecipe
  } = useJournal(props);

  // Derived Data (Filtering logic moves back to component)
  const currentRecipes = recipeViewMode === 'my'
    ? myRecipes
    : communityRecipes.filter(r => r.owner_id !== user?.id);

  const filteredRecipes = currentRecipes.filter(recipe => {
    if (searchQuery && !recipe.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filters.methods.length > 0 && !filters.methods.includes(recipe.method)) return false;
    if (filters.waterTypes.length > 0 && (!recipe.waterType || !filters.waterTypes.includes(recipe.waterType))) return false;
    if (recipe.grindSize < filters.grindSizeRange[0] || recipe.grindSize > filters.grindSizeRange[1]) return false;
    return true;
  });

  // Local Handlers
  const handleForkRecipe = async (recipe: Recipe) => {
    const success = await forkRecipe(recipe);
    if (success) {
      setRecipeViewMode('my');
    }
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    const success = await createRecipe(recipe);
    if (success) {
      setShowNewRecipe(false);
    }
  };

  const handleSwitchToCommunity = () => {
    setRecipeViewMode('community');
    refreshCommunityRecipes();
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-accent selection:text-accent-foreground">
      {/* Header */}
      <AppHeader
        user={user}
        onNewRecipe={() => setShowNewRecipe(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
          <TabsList className="w-full sm:w-auto bg-transparent border-b border-border p-0 h-auto gap-6 justify-start rounded-none">
            <TabsTrigger
              value="recipes"
              className="rounded-none border-b-2 border-transparent px-2 py-2 data-[state=active]:border-b-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all font-serif text-muted-foreground hover:text-foreground"
            >
              <FlaskConical className="w-4 h-4 mr-2" />
              {t('recipes')}
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="rounded-none border-b-2 border-transparent px-2 py-2 data-[state=active]:border-b-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all font-serif text-muted-foreground hover:text-foreground"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {t('brewLog')}
            </TabsTrigger>
            <TabsTrigger
              value="coffees"
              className="rounded-none border-b-2 border-transparent px-2 py-2 data-[state=active]:border-b-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all font-serif text-muted-foreground hover:text-foreground"
            >
              <Bean className="w-4 h-4 mr-2" />
              {t('pantry')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipes">
            <RecipeList
              user={user}
              recipes={filteredRecipes}
              totalCount={currentRecipes.length}
              recipeViewMode={recipeViewMode}
              onViewModeChange={(mode) => {
                setRecipeViewMode(mode);
                if (mode === 'community') refreshCommunityRecipes();
              }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              onFiltersChange={setFilters}
              onNewRecipe={() => setShowNewRecipe(true)}
              onDeleteRecipe={deleteRecipe}
              onForkRecipe={handleForkRecipe}
              forkingRecipeId={forkingRecipeId}
              deletingRecipeId={deletingRecipeId}
            />
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
                  <BrewLogCard
                    key={log.id}
                    log={log}
                    onClick={() => setSelectedLog(log)}
                  />
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
              user={user}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* New Recipe Slide-over / Modal */}
      {showNewRecipe && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/20 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border-l border-border h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-bold">{tRecipeForm('newTitle')}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowNewRecipe(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <RecipeForm onSave={handleSaveRecipe} isLoading={isSaving} />
          </div>
        </div>
      )}

      <BrewLogDetailDialog
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        onSaveAsRecipe={async (log, name) => {
          const newRecipeId = await saveLogAsRecipe(log, name);
          if (newRecipeId) {
            setSelectedLog(null);
          }
        }}
        isLoading={isSaving}
      />
    </main>
  );
}
