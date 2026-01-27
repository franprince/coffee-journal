import { cn } from "@/lib/utils";

export function CoffeeLoader({ className }: { className?: string }) {
    return (
        <div className={cn("relative flex flex-col items-center justify-center", className)}>
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Steam */}
                <div className="absolute -top-[50%] left-1/2 -translate-x-1/2 flex justify-center gap-[15%] opacity-0 animate-fade-in w-[60%] h-[50%] pointer-events-none">
                    <div className="w-[15%] h-[60%] bg-current opacity-30 rounded-full animate-steam-1" />
                    <div className="w-[15%] h-[80%] bg-current opacity-30 rounded-full animate-steam-2" />
                    <div className="w-[15%] h-[60%] bg-current opacity-30 rounded-full animate-steam-3" />
                </div>

                {/* Cup */}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-full h-full animate-pulse-slow"
                >
                    <path d="M17 21h-13a4 4 0 0 1 -4 -4v-6a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v6a4 4 0 0 1 -4 4z" />
                    <path d="M6 7v-3a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v3" />
                    <path d="M17 12h1a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-1" />
                </svg>
            </div>
        </div>
    );
}
