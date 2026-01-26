import { RecipeServiceServer, LogServiceServer, CoffeeServiceServer } from '@/lib/db-server';
import HomePageClient from '@/components/coffee-journal/home-page-client';

export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';

export default async function CoffeeJournalPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch ONLY the user's recipes for the initial state of "My Recipes"
    // Community recipes will be fetched client-side on demand, or we could pass them too if we wanted SSR for them.
    // For now, let's fix the bug by ensuring initialRecipes are OWNED by the user.
    const recipes = await RecipeServiceServer.getRecipes(user?.id);
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
