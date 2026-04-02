import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User as UserIcon, Activity, AlertTriangle, Apple, Camera, CheckCircle2 } from "lucide-react";
import { useGetWorkoutPlan } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Layout, Button } from "@/components/Layout";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

// A smart renderer for the unknown JSON structure returned by the AI
function SmartPlanRenderer({ data, level = 0 }: { data: any, level?: number }) {
  if (!data) return null;

  // If it's a string, just render it
  if (typeof data === "string") {
    return <p className={level > 1 ? "text-zinc-400 text-sm" : "text-zinc-300 leading-relaxed text-[15px]"}>{data}</p>;
  }

  // If it's an array
  if (Array.isArray(data)) {
    // Level 0/1 get the premium grid card style
    if (level <= 1) {
      return (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {data.map((item, i) => (
            <motion.li 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex h-full"
            >
              <SpotlightCard className="p-6 h-full flex flex-col border-white/10 bg-white/5 backdrop-blur-xl group hover:border-white/40 transition-all duration-500">
                <div className="flex gap-4 items-start h-full">
                  <div className="mt-1.5 shrink-0">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/30 transition-all duration-500 border border-white/20">
                      <CheckCircle2 className="w-4 h-4 text-white opacity-80 group-hover:opacity-100 transition-all shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                    </div>
                  </div>
                  <div className="flex-1 text-zinc-200">
                    <SmartPlanRenderer data={item} level={level + 1} />
                  </div>
                </div>
              </SpotlightCard>
            </motion.li>
          ))}
        </ul>
      );
    }

    // Level 2+ (e.g. Exercises within a day) get a simpler, more readable vertical list
    return (
      <ul className="space-y-4 mt-8">
        {data.map((item, i) => (
          <li key={i} className="flex gap-4 items-start p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all duration-300 group">
            <div className="w-2.5 h-2.5 rounded-full bg-white mt-1.5 shrink-0 transition-all" />
            <div className="flex-1">
              <SmartPlanRenderer data={item} level={level + 1} />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  // If it's an object
  if (typeof data === "object") {
    return (
      <div className={level > 1 ? "space-y-4" : "space-y-8"}>
        {Object.entries(data).map(([key, value]) => {
          // Format key nicely (e.g. "weeklySchedule" -> "Weekly Schedule")
          const title = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/_/g, ' ');

          // Level 2+ handles objects as simple labeled fields
          if (level > 1) {
            return (
              <div key={key} className="flex flex-col gap-1 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                <p className="text-[10px] text-primary/70 uppercase tracking-widest font-bold">{title}</p>
                <div className="text-sm font-medium">
                  <SmartPlanRenderer data={value} level={level + 1} />
                </div>
              </div>
            );
          }

          // Level 0/1 handles objects as main sections with big headings
          const isComplex = typeof value === 'object' && value !== null;

          return (
            <div key={key} className={isComplex ? "mt-16 first:mt-0" : "mt-8"}>
              <h3 className="text-3xl font-display font-black text-white mb-8 flex items-center gap-4 tracking-tighter uppercase">
                <div className="w-1.5 h-8 bg-white rounded-full" />
                {title}
              </h3>
              <div className="pl-0">
                <SmartPlanRenderer data={value} level={level + 1} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return <span>{String(data)}</span>;
}

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, getAuthHeaders, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const { data: plan, isLoading, error } = useGetWorkoutPlan(id || "", {
    query: {
      enabled: !!user && !!id,
    } as any,
    request: { headers: getAuthHeaders() as Record<string, string> }
  });

  if (authLoading || !user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <Button variant="ghost" onClick={() => setLocation("/")} className="mb-8 px-0 hover:bg-transparent text-muted-foreground hover:text-white">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
        </Button>

        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            <div className="h-12 w-3/4 bg-secondary rounded-xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-card rounded-2xl" />)}
            </div>
            <div className="h-96 bg-card rounded-3xl" />
          </div>
        ) : error || !plan ? (
          <div className="p-8 rounded-3xl bg-destructive/10 border border-destructive/20 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Protocol Not Found</h2>
            <p className="text-muted-foreground">We couldn't load this workout plan.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Header / Hero */}
            <div className="bg-black border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden min-h-[400px] flex flex-col justify-end">
              <div className="absolute inset-0 z-0">
                <img 
                  src={`${import.meta.env.BASE_URL}images/modelsImage/dc7e12d1744c85bbd9706c6c66d83688.jpg`} 
                  alt="Protocol Focus" 
                  className="w-full h-full object-cover opacity-30 grayscale blur-[2px] transition-all hover:blur-0 duration-1000"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 text-sm font-black text-zinc-400 mb-6 uppercase tracking-widest">
                  <Calendar className="w-4 h-4 text-white" />
                  Generated on {format(new Date(plan.createdAt), "MMMM d, yyyy")}
                </div>
                
                <h1 className="text-4xl md:text-7xl font-display font-black text-white leading-[0.9] mb-10 tracking-tighter uppercase">
                  {plan.userProfile.goals}
                </h1>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SpotlightCard className="p-5 h-full border-white/10">
                  <UserIcon className="w-5 h-5 text-primary mb-3" />
                  <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">Body Stats</p>
                  <p className="font-semibold text-white">{plan.userProfile.height}, {plan.userProfile.weight}</p>
                </SpotlightCard>
                <SpotlightCard className="p-5 h-full border-white/10">
                  <Activity className="w-5 h-5 text-primary mb-3" />
                  <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">Activity</p>
                  <p className="font-semibold text-white capitalize">{plan.userProfile.activityLevel.replace('_', ' ')}</p>
                </SpotlightCard>
                <motion.div 
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative z-10 bg-white hover:bg-zinc-200 rounded-2xl p-5 border border-white/20 flex flex-col justify-center items-center gap-2 group transition-all cursor-pointer shadow-xl hover:shadow-2xl" 
                  onClick={() => setLocation(`/plans/${id}/progress`)}
                >
                  <Camera className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
                  <p className="font-black text-black text-[10px] uppercase tracking-widest text-center">Track Progress</p>
                </motion.div>
                {plan.userProfile.injuries && (
                  <SpotlightCard className="p-5 h-full border-white/10">
                    <AlertTriangle className="w-5 h-5 text-red-500 mb-3" />
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">Injuries</p>
                    <p className="font-semibold text-white truncate" title={plan.userProfile.injuries}>{plan.userProfile.injuries}</p>
                  </SpotlightCard>
                )}
                {plan.userProfile.allergies && (
                  <SpotlightCard className="p-5 h-full border-white/10">
                    <Apple className="w-5 h-5 text-red-400 mb-3" />
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">Dietary</p>
                    <p className="font-semibold text-white truncate" title={plan.userProfile.allergies}>{plan.userProfile.allergies}</p>
                  </SpotlightCard>
                )}
              </div>
            </div>

            {/* Generated Plan Body */}
            <div className="bg-card/50 border border-white/5 rounded-3xl p-8 md:p-12 shadow-xl">
              <SmartPlanRenderer data={plan.plan} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
