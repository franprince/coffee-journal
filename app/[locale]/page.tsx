import { RecipeServiceServer, LogServiceServer, CoffeeServiceServer } from '@/lib/db-server';
import HomePageClient from '@/components/coffee-journal/home-page-client';

export const dynamic = 'force-dynamic';

export default async function CoffeeJournalPage() {
    const recipes = await RecipeServiceServer.getRecipes();
    const logs = await LogServiceServer.getAllLogs();
    const coffees = await CoffeeServiceServer.getCoffees();

    return (
        <HomePageClient
            initialRecipes={recipes}
            initialLogs={logs}
            initialCoffees={coffees}
        />
    );
}
