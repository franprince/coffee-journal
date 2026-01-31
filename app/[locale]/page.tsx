import { RecipeServiceServer, LogServiceServer, CoffeeServiceServer } from '@/lib/db-server';
import HomePageClient from '@/components/home/home-page-client';

export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';

export default async function CoffeeJournalPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch ONLY the user's recipes for the initial state of "My Recipes"
    const recipes = user ? await RecipeServiceServer.getRecipes(user.id) : [];
    // Fetch initial community recipes for guest/initial view
    const communityRecipes = await RecipeServiceServer.getRecipes();
    const logs = await LogServiceServer.getAllLogs();
    const coffees = await CoffeeServiceServer.getCoffees();

    return (
        <HomePageClient
            initialRecipes={recipes}
            initialCommunityRecipes={communityRecipes}
            initialLogs={logs}
            initialCoffees={coffees}
            user={user}
        />
    );
}
