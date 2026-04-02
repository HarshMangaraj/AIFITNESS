import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Dumbbell, LogOut, User, Menu, X, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all duration-300 border border-white/10 group-hover:border-white/30">
              <Dumbbell className="w-5 h-5 text-white animate-pulse-slow" />
            </div>
            <span className="font-display font-black text-2xl tracking-tighter text-white group-hover:text-white transition-colors duration-300">
              fit<span className="text-zinc-500 group-hover:text-white transition-colors duration-300">.ai</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                My Plans
              </Link>
              <Link href="/generate" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                <Plus className="w-4 h-4" />
                New Plan
              </Link>
              
              <div className="h-6 w-px bg-white/10" />
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-white/5">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-foreground">{user.name || user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          {user && (
            <button 
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {user && mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-b border-white/5 bg-card overflow-hidden"
            >
              <div className="p-4 flex flex-col gap-4">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-xl bg-secondary/50 text-foreground font-medium">
                  My Plans
                </Link>
                <Link href="/generate" onClick={() => setMobileMenuOpen(false)} className="flex p-3 rounded-xl bg-primary/10 text-primary font-medium items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Generate New Plan
                </Link>
                <div className="h-px w-full bg-white/5 my-2" />
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full p-3 rounded-xl flex items-center gap-2 text-destructive font-medium hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Log out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 w-full">
        {children}
      </main>
    </div>
  );
}

export function Button({ 
  className, 
  variant = "primary", 
  size = "md", 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive",
  size?: "sm" | "md" | "lg" | "icon"
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] tracking-tight",
        {
          "bg-white text-black shadow-lg hover:shadow-xl hover:bg-zinc-200 transition-all": variant === "primary",
          "bg-zinc-900 backdrop-blur-md text-white border border-white/10 hover:bg-zinc-800 hover:border-white/20 hover:shadow-xl transition-all": variant === "secondary",
          "border-2 border-white/20 bg-transparent text-white hover:bg-white/5 hover:border-white/40 transition-all": variant === "outline",
          "hover:bg-white/5 text-zinc-400 hover:text-white transition-all": variant === "ghost",
          "bg-accent text-white hover:opacity-90 shadow-md transition-all": variant === "destructive",
          "h-9 px-4 text-xs tracking-wide uppercase": size === "sm",
          "h-11 px-6": size === "md",
          "h-14 px-8 text-lg font-bold tracking-tight": size === "lg",
          "h-11 w-11": size === "icon",
        },
        className
      )}
      {...props}
    />
  );
}
