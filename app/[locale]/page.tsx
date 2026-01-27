import { RecipeServiceServer, LogServiceServer, CoffeeServiceServer } from '@/lib/db-server';
import HomePageClient from '@/components/coffee-journal/home-page-client';

export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';

export default async function CoffeeJournalPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch ONLY the user's recipes for the initial state of "My Recipes"
    // Community recipes will be fetched client-side on demand.
    const recipes = user ? await RecipeServiceServer.getRecipes(user.id) : [];
    const logs = await LogServiceServer.getAllLogs();
    const coffees = await CoffeeServiceServer.getCoffees();

    return (
        <HomePageClient
            initialRecipes={recipes}
            initialLogs={logs}
            initialCoffees={coffees}
            user={user}
        />
    );
}
