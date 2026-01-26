import { RecipeServiceServer, LogServiceServer, CoffeeServiceServer } from '@/lib/db-server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import RecipeDetailClient from '@/components/coffee-journal/recipe-detail-client';
import { notFound } from 'next/navigation';
import { extractIdFromSlug } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ slug: string }>;
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
