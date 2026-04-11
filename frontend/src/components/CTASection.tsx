import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Link } from "wouter";

export default function CTASection() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full text-center relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-12 md:p-24 rounded-[3rem] shadow-xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
          {/* Dashboard-style light rays - Compacted */}
          <div className="absolute top-[-50%] inset-s-[-20%] w-full h-full bg-white/5 blur-[100px] pointer-events-none rotate-45" />
          
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter leading-[0.9] italic group-hover:text-zinc-200 transition-colors">
            BECOME <br />
            <span className="text-zinc-500">UNSTOPPABLE.</span>
          </h2>
          
          <p className="text-zinc-300 text-lg sm:text-xl max-w-xl mx-auto mb-12 font-bold tracking-tight text-pretty group-hover:text-white transition-colors">
            Join the elite who’ve moved beyond guesswork. Deploy your personal AI-engineered protocol today.
          </p>

          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-black font-display font-black text-xl overflow-hidden transition-all duration-500 hover:bg-zinc-200 active:scale-95 shadow-lg"
            >
              <Zap className="w-6 h-6 fill-current" />
              START TRANSFORMATION
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Footer - Consistent with Mission Control branding - Compacted */}
      <div className="mt-24 w-full border-t border-white/10 pt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">
          <div className="flex items-center gap-2 group">
            <span className="text-white text-2xl font-display tracking-tighter italic lowercase group-hover:text-zinc-300 transition-colors">
              fit<span className="text-zinc-600">.ai</span>
            </span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-all">Protocol</a>
            <a href="#" className="hover:text-white transition-all">Privacy</a>
            <a href="#" className="hover:text-white transition-all">Terms</a>
          </div>
          <span className="font-medium">© 2026 fit.ai. Mission Active.</span>
        </div>
      </div>
    </section>
  );
}
