import { RecipeServiceServer, LogServiceServer, CoffeeServiceServer } from '@/lib/db-server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import RecipeDetailClient from '@/components/coffee-journal/recipe-detail-client';
import { notFound } from 'next/navigation';
import { extractIdFromSlug } from '@/lib/utils';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const id = extractIdFromSlug(slug);
    const recipe = await RecipeServiceServer.getRecipe(id);

    if (!recipe) {
        return {
            title: 'Recipe Not Found | Brew Journal',
        };
    }

    const description = `${recipe.coffeeWeight}g ${recipe.method} recipe with 1:${(recipe.totalWaterWeight / recipe.coffeeWeight).toFixed(1)} ratio. Discover more on Brew Journal.`;

    return {
        title: `${recipe.name} | Brew Journal`,
        description,
        openGraph: {
            title: recipe.name,
            description,
            type: 'website',
            images: recipe.coffeeImageUrl ? [{ url: recipe.coffeeImageUrl }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: recipe.name,
            description,
            images: recipe.coffeeImageUrl ? [recipe.coffeeImageUrl] : [],
        },
    };
}

export default async function RecipePage({ params }: PageProps) {
    const { slug } = await params;
    const id = extractIdFromSlug(slug);

    const recipe = await RecipeServiceServer.getRecipe(id);

    if (!recipe) {
        notFound();
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const logs = await LogServiceServer.getLogsForRecipe(id);
    const coffees = await CoffeeServiceServer.getCoffees();

    return (
        <RecipeDetailClient
            recipeId={id}
            initialRecipe={recipe}
            initialLogs={logs}
            initialCoffees={coffees}
            currentUser={user}
        />
    );
}
