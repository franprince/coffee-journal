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

            {recipes.length === 0 ? (
                <div className="modern-card p-12 text-center mt-6 rounded-3xl">
                    <div className="w-12 h-12 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                        <CoffeeIcon className="w-6 h-6 text-muted-foreground" />
                    </div>

                    {totalCount > 0 ? (
                        // Case: Recipes exist but filtered out
                        <>
                            <h3 className="font-sans text-lg font-bold mb-2">{t('noResultsTitle')}</h3>
                            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                                {t('noResultsDesc')}
                            </p>
                            <Button onClick={() => onSearchChange('')} variant="outline">
                                {t('clearSearch')}
                            </Button>
                        </>
                    ) : (
                        // Case: No recipes at all (Empty Collection)
                        <>
                            <h3 className="font-sans text-lg font-bold mb-2">{t('noRecipesTitle')}</h3>
                            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                                {t('noRecipesDesc')}
                            </p>
                            <Button onClick={onNewRecipe} variant="outline">
                                {t('createFirstRecipe')}
                            </Button>
                        </>
                    )}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 gap-6 mt-6">
                    {recipes.map((recipe, index) => (
                        <div key={recipe.id}>
                            <RecipeCard
                                recipe={recipe}
                                onDelete={onDeleteRecipe}
                                onFork={onForkRecipe}
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
