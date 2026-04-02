import { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ShowcaseSection from "@/components/ShowcaseSection";
import CTASection from "@/components/CTASection";
import { api } from "@/lib/api";

export default function Index() {
  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await api.get<{ status: string }>("/healthz");
        console.log("Backend status:", response.status === "ok" ? "Connected" : "Error");
      } catch (error) {
        console.error("Failed to connect to backend:", error);
      }
    }
    checkBackend();
  }, []);

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden selection:bg-primary/30 selection:text-white">
      {/* GLOBAL BACKGROUND INTEGRATION - HIGH QUALITY ATHLETE FOCUS */}
      <div className="fixed inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/modelsImage/8209ea23316aeee5abcb509083cf1f10.jpg`} 
          alt="Global Protocol Background" 
          className="w-full h-full object-cover grayscale opacity-[0.25] contrast-[1.1]"
        />
        {/* Softer global overlays for total parity and consistent readability */}
        <div className="absolute inset-0 bg-background/80 md:bg-background/60" />
        <div className="absolute inset-0 cyber-grid opacity-[0.15]" />
      </div>

      {/* Dynamic Ambient Glows (Subtle Mission Control vibe) */}
      <div className="fixed top-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-white/3 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-white/3 blur-[150px] pointer-events-none" />

      {/* Content wrapper with more standard vertical spacing */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="w-full max-w-7xl">
          <HeroSection />
          <FeaturesSection />
          <ShowcaseSection />
          <CTASection />
        </div>
      </div>
    </div>
  );
}
