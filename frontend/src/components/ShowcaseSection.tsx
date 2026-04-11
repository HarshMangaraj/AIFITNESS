import { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { MessageSquare, BarChart3, Dumbbell } from "lucide-react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

const steps = [
  {
    icon: MessageSquare,
    step: "01",
    title: "INITIATE PROTOCOL",
    desc: "Communicate metrics, goals, and constraints to the AI engine via secure interface.",
  },
  {
    icon: Dumbbell,
    step: "02",
    title: "RECEIVE ARCHITECTURE",
    desc: "Instant deployment of workout and nutrition blueprints, engineered for your physiology.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "EVOLVE TRACKING",
    desc: "Submit transformation logs. AI recalibrates protocol for zero-stagnation results.",
  },
];

export default function ShowcaseSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Decorative vertical line matching Dashboard layout - Compacted */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px hidden lg:block bg-linear-to-b from-transparent via-white/10 to-transparent" />

      <div className="w-full relative z-10">
        <div className="text-right mb-16 border-r-2 border-white pr-6">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4"
          >
            Operation Workflow
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]"
          >
            PHASED <br />
            <span className="text-zinc-500 italic">DEPLOYMENT.</span>
          </motion.h2>
        </div>

        <motion.div 
          ref={containerRef}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8"
        >
          {steps.map((step) => (
            <motion.div
              key={step.step}
              variants={itemVariants}
              className="group"
            >
              <SpotlightCard className="h-full p-8 border-white/10 bg-white/3 backdrop-blur-3xl relative overflow-hidden transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/8 shadow-xl">
                {/* Step number watermark - Compacted */}
                <div
                  className="absolute -top-6 -right-6 font-display text-[120px] font-black leading-none select-none text-white/3 group-hover:text-white/5 transition-all duration-500 italic"
                >
                  {step.step}
                </div>

                <div className="relative z-10">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-8 border border-white/10 bg-white/5 transition-all duration-300 group-hover:scale-105 group-hover:bg-white/10"
                  >
                    <step.icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-3">
                    PHASE {step.step}
                  </div>

                  <h3 className="font-display text-2xl font-black text-white mb-4 uppercase tracking-tighter leading-tight italic group-hover:text-zinc-200">
                    {step.title}
                  </h3>

                  <p className="text-zinc-400 font-bold leading-tight text-xs tracking-tight group-hover:text-white transition-colors">
                    {step.desc}
                  </p>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
