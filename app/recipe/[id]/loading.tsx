import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Recipe Detail View Container */}
                <div className="relative glass-card rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                    {/* Back button */}
                    <Skeleton className="h-8 w-32 rounded-xl mb-4 ml-6 mt-6" />

                    <div className="p-6 pt-0">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-8">
                            <Skeleton className="w-12 h-12 rounded-2xl" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-64" />
                            </div>
                            <div className="flex gap-1">
                                <Skeleton className="h-9 w-9 rounded-xl" />
                                <Skeleton className="h-9 w-9 rounded-xl" />
                            </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-20 rounded-2xl" />
                            ))}
                        </div>

                        {/* Pour Timeline */}
                        <div className="mb-8 space-y-4">
                            <Skeleton className="h-8 w-40" />
                            <div className="space-y-4 pl-4 border-l border-white/10">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="h-4 w-12" />
                                        <Skeleton className="h-16 w-full rounded-xl" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Button */}
                        <Skeleton className="w-full h-14 rounded-full" />
                    </div>
                </div>

                {/* Brew Logs Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Skeleton className="h-40 rounded-2xl" />
                        <Skeleton className="h-40 rounded-2xl" />
                    </div>
                </div>
            </div>
        </div>
    )
}
