import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Plus, ChevronRight, Activity, Calendar, Zap, AlertCircle } from "lucide-react";
import { useGetWorkoutPlans } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Layout, Button } from "@/components/Layout";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

export default function Dashboard() {
  const { user, getAuthHeaders, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const { data: plans, isLoading: plansLoading, error } = useGetWorkoutPlans({
    query: {
      enabled: !!user,
      queryKey: ['workoutPlans', user?.id],
    } as any,
    request: { headers: getAuthHeaders() as Record<string, string> }
  });

  if (authLoading || !user) return null;

  return (
    <Layout>
      <div className="relative min-h-[500px] flex flex-col justify-center overflow-hidden border-b border-white/5 bg-black">
        {/* Cinematic Model Hero */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/modelsImage/8209ea23316aeee5abcb509083cf1f10.jpg`} 
            alt="Performance" 
            className="w-full h-full object-cover object-top opacity-60 grayscale scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-black via-transparent to-transparent" />
          <div className="absolute inset-0 cyber-grid opacity-20" />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-20 max-w-6xl">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-8xl font-display font-extrabold text-white mb-4 tracking-tighter leading-[0.9]">
              DRIVEN BY <span className="text-primary-gradient">AI.</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 font-medium max-w-xl mb-10 leading-relaxed">
              Welcome back, {user.name?.split(' ')[0] || 'Athlete'}. Your engineered protocols are ready for execution.
            </p>
            
            <Link href="/generate">
              <Button size="lg" className="shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                <Plus className="w-6 h-6 mr-2" />
                Generate New Protocol
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-24 max-w-6xl relative">

        {plansLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-secondary/30 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive">
            <AlertCircle className="w-6 h-6" />
            <p className="font-medium">Failed to load workout plans. Please try again.</p>
          </div>
        ) : plans?.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full rounded-3xl border border-white/5 bg-card overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20">
              <img 
                src={`${import.meta.env.BASE_URL}images/empty-dashboard.png`} 
                alt="Empty state background" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-card via-card/80 to-transparent" />
            </div>
            
            <div className="relative z-10 p-12 md:p-24 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                <Zap className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-display font-bold text-white mb-4">No protocols found</h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
                Your journey starts here. Provide your stats and let our AI engineer the perfect workout plan for your body.
              </p>
              <Link href="/generate">
                <Button size="lg">Start Your First Plan</Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
            {plans?.map((plan, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={plan.id}
              >
                <Link href={`/plans/${plan.id}`}>
                  <SpotlightCard 
                    className="group h-full flex flex-col relative overflow-hidden border-white/5 hover:border-white/20 transition-all duration-500"
                    containerClassName="hover:translate-y-[-8px] transition-transform duration-500"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(plan.createdAt), "MMM d, yyyy")}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>

                    <h3 className="text-3xl font-display font-black text-white mb-2 tracking-tighter group-hover:text-primary transition-colors">
                      {plan.userProfile.goals}
                    </h3>
                    
                    <div className="mt-8 pt-6 grid grid-cols-3 gap-4 border-t border-white/5">
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">Weight</p>
                        <p className="font-semibold text-white">{plan.userProfile.weight}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">Activity</p>
                        <p className="font-semibold text-white capitalize text-sm truncate" title={plan.userProfile.activityLevel.replace('_', ' ')}>
                          {plan.userProfile.activityLevel.split('_')[0]}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">Status</p>
                        <div className="flex items-center gap-1 text-primary text-sm font-bold">
                          <Activity className="w-4 h-4" /> Active
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
