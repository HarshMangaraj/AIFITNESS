import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Layout, Button } from "@/components/Layout";
import { Upload, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NutritionResultModal } from "@/components/NutritionResultModal";
import { useToast } from "@/components/ui/use-toast";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "environment"
};

export default function ScanAI() {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  const webcamRef = useRef<Webcam>(null);
  const { toast } = useToast();

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
    }
  }, [webcamRef]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!image) return;

    setIsScanning(true);
    try {
      const response = await fetch("/api/food/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image })
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = await response.json();
      setResult(data);
      setShowModal(true);
    } catch (error) {
      console.error(error);
      toast({
        title: "Scan Failed",
        description: "Could not analyze the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-zinc-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-2xl z-10">
          <header className="mb-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold uppercase tracking-widest mb-4"
            >
              <Sparkles className="w-3 h-3" />
              Next-Gen Nutrition AI
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
              Scan <span className="text-zinc-500">AI</span>
            </h1>
            <p className="text-zinc-400 font-medium">Point your camera at food to get instant macros.</p>
          </header>

          <main className="relative aspect-video md:aspect-16/10 rounded-3xl border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl group">
            <AnimatePresence mode="wait">
              {!image ? (
                <motion.div
                  key="webcam"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative w-full h-full"
                >
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    onUserMedia={() => setIsCameraReady(true)}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Camera GUI Overlay */}
                  <div className="absolute inset-0 pointer-events-none border-12 border-black/40 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/20 rounded-3xl" />
                  
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 pointer-events-auto">
                    <label className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer group-hover:scale-110">
                      <Upload className="w-6 h-6" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <button
                      onClick={capture}
                      disabled={!isCameraReady}
                      className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center bg-white group/btn active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                    >
                      <div className="w-16 h-16 rounded-full bg-white border-2 border-zinc-200" />
                    </button>
                    <div className="w-12 h-12" /> {/* Spacer */}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="w-full h-full bg-zinc-900 flex flex-col"
                >
                  <img src={image} className="w-full h-full object-cover opacity-80" alt="Capture" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <button 
                      onClick={reset}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/50 text-white backdrop-blur-md border border-white/10 hover:bg-black/70 transition-all font-bold text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retake
                    </button>
                  </div>

                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
                    <Button
                      onClick={handleScan}
                      disabled={isScanning}
                      className="w-full h-16 rounded-2xl bg-primary text-black hover:bg-zinc-200 transition-all shadow-xl font-black text-xl flex items-center justify-center gap-3"
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Analyzing Food...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6" />
                          Scan with AI
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <footer className="mt-8 flex justify-center">
            <p className="text-zinc-500 text-sm flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Gemini Vision AI Powered
            </p>
          </footer>
        </div>
      </div>

      <NutritionResultModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        data={result} 
      />
    </Layout>
  );
}
