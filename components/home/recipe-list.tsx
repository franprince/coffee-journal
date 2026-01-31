'use client';

import { useTranslations } from 'next-intl';
import { RecipeCard, RecipeFiltersComponent } from '@/components/recipe';
import { Button } from '@/components/ui/button';
import { Coffee as CoffeeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Recipe, RecipeFilters } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

interface RecipeListProps {
    user: User | null;
    recipes: Recipe[];
    totalCount: number;
    recipeViewMode: 'my' | 'community';
    onViewModeChange: (mode: 'my' | 'community') => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    filters: RecipeFilters;
    onFiltersChange: (filters: RecipeFilters) => void;
    onNewRecipe: () => void;
    onDeleteRecipe: (recipeId: string) => Promise<boolean>;
    onForkRecipe: (recipe: Recipe) => Promise<void>;
    forkingRecipeId: string | null;
    deletingRecipeId: string | null;
}

export function RecipeList({
    user,
    recipes,
    totalCount,
    recipeViewMode,
    onViewModeChange,
    searchQuery,
    onSearchChange,
    filters,
    onFiltersChange,
    onNewRecipe,
    onDeleteRecipe,
    onForkRecipe,
    forkingRecipeId,
    deletingRecipeId
}: RecipeListProps) {
    const t = useTranslations('HomePage');

    return (
        <div className="animate-fade-in-up">
            <RecipeFiltersComponent
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                filters={filters}
                onFiltersChange={onFiltersChange}
                resultCount={recipes.length}
                totalCount={totalCount}
            />

            <div className="flex gap-4 mb-6 border-b border-border/40 pb-0">
                {user && (
                    <button
                        onClick={() => onViewModeChange('my')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                            recipeViewMode === 'my'
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {t('myRecipes')}
                    </button>
                )}
                <button
                    onClick={() => onViewModeChange('community')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        recipeViewMode === 'community'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground",
                        !user && "border-primary text-primary" // Active style for guests
                    )}
                >
                    {t('community')}
                </button>
            </div>

            {recipes.length === 0 ? (
                <div className="modern-card p-12 text-center mt-6 rounded-3xl">
                    <div className="w-12 h-12 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                        <CoffeeIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-sans text-lg font-bold mb-2">{t('noRecipesTitle')}</h3>
                    <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                        {t('noRecipesDesc')}
                    </p>
                    <Button onClick={onNewRecipe} variant="outline">
                        {t('createFirstRecipe')}
                    </Button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 gap-6 mt-6">
                    {recipes.map((recipe, index) => (
                        <div key={recipe.id} className={`animate-fade-in-up stagger-${Math.min(index + 1, 4)}`}>
                            <RecipeCard
                                recipe={recipe}
                                onDelete={recipeViewMode === 'my' ? onDeleteRecipe : undefined}
                                onFork={recipeViewMode === 'community' ? onForkRecipe : undefined}
                                isOwner={recipe.owner_id === user?.id}
                                isForking={forkingRecipeId === recipe.id}
                                isDeleting={deletingRecipeId === recipe.id}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
