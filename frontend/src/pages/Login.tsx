import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, ArrowRight, Activity, Zap, ShieldCheck } from "lucide-react";
import { useLogin, useRegister } from "@/api-client";
import { useAuth } from "@/hooks/use-auth";
import { Button, cn } from "@/components/Layout";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      if (isLogin) {
        const res = await loginMutation.mutateAsync({ data: { email, password } });
        login(res.token, res.user);
        setLocation("/dashboard");
      } else {
        const res = await registerMutation.mutateAsync({ data: { email, password, name } });
        login(res.token, res.user);
        setLocation("/");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred. Please try again.");
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      
      {/* Left side - Visual/Branding */}
      <div className="w-full md:w-1/2 relative hidden md:flex flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/modelsImage/dc7e12d1744c85bbd9706c6c66d83688.jpg`} 
            alt="Performance Silhouette" 
            className="w-full h-full object-cover opacity-30 grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-background/60 to-transparent" />
          <div className="absolute inset-0 cyber-grid opacity-10" />
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Dumbbell className="w-6 h-6 text-white animate-pulse-slow" />
          </div>
          <span className="font-display font-bold text-3xl tracking-tighter text-white">
            fit<span className="text-primary-gradient">.ai</span>
          </span>
        </div>

        <div className="relative z-10 max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white leading-[1.1] mb-6 tracking-tight">
              Your Evolution, <br />
              <span className="text-primary-gradient">Engineered by AI.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-sm">
              Experience the next generation of personal training. Hyper-personalized protocols generated in seconds.
            </p>
            
            <div className="space-y-4">
              {[
                { icon: Zap, text: "Instant Protocol Generation" },
                { icon: Activity, text: "Data-Driven Adaptations" },
                { icon: ShieldCheck, text: "Science-Backed Nutrition" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium text-gray-300">
                  <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center border border-white/5">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  {item.text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-50" />
        
        <div className="w-full max-w-md relative z-10">
          <div className="md:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <Dumbbell className="w-5 h-5 text-white animate-pulse-slow" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tighter text-white">
              fit<span className="text-primary-gradient">.ai</span>
            </span>
          </div>

          <div className="glass-panel rounded-3xl p-8 sm:p-10">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => { setIsLogin(true); setErrorMsg(""); }}
                className={cn(
                  "text-xl font-display font-semibold transition-all duration-300 relative",
                  isLogin ? "text-white" : "text-muted-foreground hover:text-gray-300"
                )}
              >
                Log In
                {isLogin && (
                  <motion.div layoutId="tab-indicator" className="absolute -bottom-2 left-0 right-0 h-0.5 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                )}
              </button>
              <button 
                onClick={() => { setIsLogin(false); setErrorMsg(""); }}
                className={cn(
                  "text-xl font-display font-semibold transition-all duration-300 relative",
                  !isLogin ? "text-white" : "text-muted-foreground hover:text-gray-300"
                )}
              >
                Register
                {!isLogin && (
                  <motion.div layoutId="tab-indicator" className="absolute -bottom-2 left-0 right-0 h-0.5 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.form 
                key={isLogin ? "login" : "register"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>

                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
                  >
                    {errorMsg}
                  </motion.div>
                )}

                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full mt-4 h-12 text-base font-bold group"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {isLogin ? "Enter Portal" : "Create Account"}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </motion.form>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
