import { cn } from "@/lib/utils";

export default function Container({ className, children }: { className?: string, children: React.ReactNode }) {
    return (
        <div className={cn("mx-auto w-full max-w-screen-xl px-2.5 md:px-20px",className)}>
            {children}
        </div>
    )
}