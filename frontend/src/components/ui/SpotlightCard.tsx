import { cn } from "@/components/Layout";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function SpotlightCard({
  children,
  className,
  containerClassName,
}: SpotlightCardProps) {

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/10 bg-card/60 p-6 shadow-2xl backdrop-blur-xl overflow-hidden",
        containerClassName
      )}
    >
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}
