import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, Activity, ShieldCheck, Brain, Camera, Utensils } from "lucide-react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

const features = [
  {
    icon: Brain,
    title: "NEURAL PROTOCOLS",
    desc: "AI engines analyze metrics and history to generate elite fitness protocols.",
  },
  {
    icon: Zap,
    title: "INSTANT DEPLOYMENT",
    desc: "Receive comprehensive architectures in under 30 seconds. Elite speed.",
  },
  {
    icon: Camera,
    title: "VISION ANALYSIS",
    desc: "Neural vision assesses your physique with precision to calibrate reps.",
  },
  {
    icon: Activity,
    title: "EVOLVING METRICS",
    desc: "Daily photo logs allow the AI to recalibrate plans for progression.",
  },
  {
    icon: Utensils,
    title: "MACRO ARCHITECTURE",
    desc: "Optimized meal plans for allergies and maximal metabolic rate.",
  },
  {
    icon: ShieldCheck,
    title: "ELITE SAFETY",
    desc: "Intelligent rerouting around physical limitations to keep you safe.",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
      className="group"
    >
      <SpotlightCard className="h-full p-8 border-white/10 bg-white/3 backdrop-blur-3xl transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/8 shadow-xl relative overflow-hidden">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-white/10 bg-white/5 transition-all duration-300 group-hover:scale-105 group-hover:bg-white/10"
        >
          <feature.icon className="w-6 h-6 text-white" />
        </div>
        
        <h3 className="font-display text-xl font-black text-white mb-3 tracking-tighter uppercase italic group-hover:text-zinc-200">
          {feature.title}
        </h3>
        
        <p className="text-zinc-400 leading-tight font-bold text-xs tracking-tight group-hover:text-white transition-colors">
          {feature.desc}
        </p>
      </SpotlightCard>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isTitleInView = useInView(titleRef, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="w-full relative z-10">
        <div className="text-left mb-16 border-l-2 border-white pl-6">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4"
          >
            Engineering Features
          </motion.span>
          <motion.h2
            ref={titleRef}
            initial={{ opacity: 0, x: -20 }}
            animate={isTitleInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]"
          >
            THE SCIENCE OF <br />
            <span className="text-zinc-500 italic">TRANSFORMATION.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
