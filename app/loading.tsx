import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <main className="min-h-screen bg-background">
            {/* Header Skeleton */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
                <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-10 h-10 rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-48 rounded-md" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-32 rounded-full" />
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-[1fr,400px] gap-8">
                    <div className="space-y-8">
                        {/* Tabs Skeleton */}
                        <div className="w-full sm:w-auto">
                            <div className="flex gap-4 border-b border-border/40 pb-2">
                                <Skeleton className="h-8 w-24 rounded-full" />
                                <Skeleton className="h-8 w-24 rounded-full" />
                                <Skeleton className="h-8 w-24 rounded-full" />
                            </div>
                        </div>

                        {/* Filters Skeleton */}
                        <div className="modern-card p-6 space-y-4">
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-20 rounded-full" />
                                <Skeleton className="h-8 w-20 rounded-full" />
                                <Skeleton className="h-8 w-20 rounded-full" />
                            </div>
                        </div>

                        {/* Recipe Cards Skeleton */}
                        <div className="grid sm:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="modern-card p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <Skeleton className="w-10 h-10 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-5 w-32 rounded-md" />
                                                <Skeleton className="h-3 w-20 rounded-md" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 py-2">
                                        <Skeleton className="h-8 w-full rounded-lg" />
                                        <Skeleton className="h-8 w-full rounded-lg" />
                                        <Skeleton className="h-8 w-full rounded-lg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="hidden lg:block space-y-6">
                        <Skeleton className="h-[400px] w-full rounded-3xl" />
                    </div>
                </div>
            </div>
        </main>
    )
}
