import { useLocation, Link } from "wouter";
import { useEffect } from "react";

const NotFound = () => {
  const [location] = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location);
  }, [location]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-black tracking-tighter uppercase italic">404</h1>
        <p className="mb-8 text-xl text-zinc-400 font-bold">Oops! Protocol not found</p>
        <Link href="/" className="text-primary font-black uppercase tracking-widest hover:text-zinc-200 transition-colors border-b-2 border-primary">
          Return to Mission Control
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
