import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Recipe Detail View Container */}
                <div className="relative modern-card rounded-[2rem] overflow-hidden border-none shadow-xl">
                    {/* Back button */}
                    <Skeleton className="h-8 w-24 rounded-full mb-6 ml-8 mt-8" />

                    <div className="p-8 pt-0">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-10">
                            <Skeleton className="w-16 h-16 rounded-2xl" />
                            <div className="flex-1 space-y-3">
                                <Skeleton className="h-4 w-24 rounded-full" />
                                <Skeleton className="h-10 w-3/4 rounded-lg" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-10 w-10 rounded-full" />
                            </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-24 rounded-2xl" />
                            ))}
                        </div>

                        {/* Pour Timeline */}
                        <div className="mb-10 space-y-4 p-6 rounded-3xl border border-border/20">
                            <Skeleton className="h-6 w-32 rounded-md" />
                            <div className="space-y-4 pl-4 border-l border-border/20">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="h-4 w-4 rounded-full" />
                                        <Skeleton className="h-12 w-full rounded-xl" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Button */}
                        <Skeleton className="w-full h-16 rounded-full" />
                    </div>
                </div>

                {/* Brew Logs Section */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center px-4">
                        <Skeleton className="h-8 w-40 rounded-lg" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <Skeleton className="h-48 rounded-3xl" />
                        <Skeleton className="h-48 rounded-3xl" />
                    </div>
                </div>
            </div>
        </div>
    )
}
