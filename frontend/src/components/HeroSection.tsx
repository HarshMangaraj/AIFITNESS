import { motion } from "framer-motion";
import { Dumbbell, ArrowRight, Zap } from "lucide-react";
import { Link } from "wouter";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6 } 
    },
  };

  const headingVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-start px-6 pt-24 pb-16 overflow-hidden">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-left w-full"
      >
        <div className="max-w-4xl">
          {/* Logo badge - Compacted */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-lg mb-8"
          >
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-white/10 border border-white/10">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-black text-xl tracking-tighter text-white">
              fit<span className="text-zinc-500">.ai</span>
            </span>
          </motion.div>

          {/* Main heading - Scaled down for better balance */}
          <motion.h1
            variants={headingVariants}
            className="font-display text-5xl sm:text-7xl md:text-8xl font-black leading-none mb-6 tracking-tighter uppercase text-white"
          >
            <span className="block text-white">Protocol</span>
            <span className="block text-zinc-500 italic">Evolution.</span>
          </motion.h1>

          {/* Subtitle - Refined for compact Mission Control feel */}
          <motion.p
            variants={itemVariants}
            className="text-zinc-400 text-lg sm:text-xl max-w-xl mb-10 leading-tight font-bold tracking-tight text-pretty"
          >
            AI engineering for elite physique transformation. Deploy hyper-personalized protocols that evolve with your progress instantly.
          </motion.p>

          {/* CTA buttons - Compacted */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-start gap-4"
          >
            <Link href="/login">
              <button className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white text-black font-display font-black text-lg overflow-hidden transition-all duration-300 hover:bg-zinc-200 active:scale-95 shadow-lg">
                <Zap className="w-5 h-5 fill-current" />
                START PROTOCOL
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>
            </Link>

            <button className="bg-white/5 backdrop-blur-md border border-white/10 px-8 py-4 rounded-xl font-display font-black text-lg text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20 active:scale-95">
              REVEAL SCIENCE
            </button>
          </motion.div>

          {/* Stats row - Tighter alignment */}
          <motion.div
            variants={itemVariants}
            className="mt-16 flex flex-wrap items-center justify-start gap-10"
          >
            {[
              { value: "50K+", label: "Elite Athletes" },
              { value: "SOTA", label: "Visual Systems" },
            ].map((stat) => (
              <div key={stat.label} className="text-left border-l-2 border-white/10 pl-4 group">
                <div className="font-display text-2xl font-black text-white tracking-tighter uppercase italic group-hover:text-zinc-300 transition-colors">
                  {stat.value}
                </div>
                <div className="text-zinc-500 text-[10px] mt-0.5 font-black uppercase tracking-[0.3em]">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
