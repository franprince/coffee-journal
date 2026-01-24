import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function Loading() {
    return (
        <main className="min-h-screen bg-background">
            {/* Header Skeleton */}
            <header className="sticky top-0 z-50 bg-background/50 backdrop-blur-xl border-b border-white/5 shadow-2xl">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-12 h-12 rounded-2xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-32 hidden sm:block" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-32 rounded-full" />
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid lg:grid-cols-[1fr,400px] gap-6">
                    <div className="space-y-6">
                        {/* Tabs Skeleton */}
                        <div className="w-full sm:w-auto p-1">
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </div>

                        {/* Filters Skeleton */}
                        <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-20 rounded-full" />
                                <Skeleton className="h-8 w-20 rounded-full" />
                                <Skeleton className="h-8 w-20 rounded-full" />
                            </div>
                        </div>

                        {/* Recipe Cards Skeleton */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <Skeleton className="w-10 h-10 rounded-xl" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-5 w-32" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 py-2">
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
                        <Skeleton className="h-[400px] w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        </main>
    )
}
