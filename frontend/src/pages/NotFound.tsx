import { Link } from "wouter";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/Layout";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-secondary/50 flex items-center justify-center border border-white/5 mx-auto mb-8">
          <Dumbbell className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-5xl font-display font-bold text-white mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          The protocol you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/">
          <Button size="lg" className="w-full">Return to Headquarters</Button>
        </Link>
      </div>
    </div>
  );
}
