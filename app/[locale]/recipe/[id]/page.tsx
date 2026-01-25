import { RecipeServiceServer, LogServiceServer, CoffeeServiceServer } from '@/lib/db-server';
import RecipeDetailClient from '@/components/coffee-journal/recipe-detail-client';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function RecipePage({ params }: PageProps) {
    const { id } = await params;

    const recipe = await RecipeServiceServer.getRecipe(id);

    if (!recipe) {
        notFound();
    }

    const logs = await LogServiceServer.getLogsForRecipe(id);
    const coffees = await CoffeeServiceServer.getCoffees();

    return (
        <RecipeDetailClient
            recipeId={id}
            initialRecipe={recipe}
            initialLogs={logs}
            initialCoffees={coffees}
        />
    );
}
