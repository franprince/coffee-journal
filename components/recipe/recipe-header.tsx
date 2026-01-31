'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { MethodIcon } from '@/components/shared';
import { Edit2, Trash2, Heart } from 'lucide-react';
import type { Recipe } from '@/lib/types';
import { METHOD_LABELS } from '@/lib/types';

interface RecipeHeaderProps {
    recipe: Recipe;
    isOwner: boolean;
    currentUser: any; // Using any for Supabase User to avoid complex type deps here, or import User type
    onEdit: () => void;
    onDelete: () => void;
    onFork: () => void;
    isForking: boolean;
}

export function RecipeHeader({
    recipe,
    isOwner,
    currentUser,
    onEdit,
    onDelete,
    onFork,
    isForking
}: RecipeHeaderProps) {
    const tMethods = useTranslations('Methods');

    return (
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6 md:mb-10">
            <div className="flex items-start gap-3 md:gap-4">
                <div className="flex flex-col items-center gap-2">
                    <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                        <MethodIcon method={recipe.method} className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <span className="px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-[9px] md:text-[10px] font-bold uppercase tracking-wide text-center">
                        {METHOD_LABELS[recipe.method as keyof typeof METHOD_LABELS] ? tMethods(recipe.method) : recipe.method}
                    </span>
                </div>
                <div className="pt-1">
                    <h2 className="text-2xl md:text-4xl font-bold text-foreground leading-tight tracking-tight">
                        {recipe.name}
                    </h2>
                </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2 absolute top-0 right-0 p-4 sm:relative sm:p-0">
                {isOwner ? (
                    <>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground hover:text-primary rounded-full hover:bg-secondary"
                            onClick={onEdit}
                        >
                            <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/10"
                            onClick={onDelete}
                        >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                    </>
                ) : (
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground hover:text-primary rounded-full hover:bg-secondary"
                        onClick={onFork}
                        disabled={!currentUser || isForking}
                        title={!currentUser ? "Sign in to fork" : "Save to My Recipes"}
                    >
                        {isForking ? (
                            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        ) : (
                            <Heart className="w-4 h-4 md:w-5 md:h-5" />
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}
