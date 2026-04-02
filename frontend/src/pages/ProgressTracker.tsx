import { useState, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { format } from "date-fns";
import { Camera, ImagePlus, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useGetProgressEntries, useCreateProgressEntry } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";

export default function ProgressTracker() {
  const { id: planId } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getAuthHeaders } = useAuth();
  
  const { data: entries = [], isLoading, refetch } = useGetProgressEntries(
    { planId: planId || "" },
    {
      query: {
        enabled: !!planId,
      } as any,
      request: { headers: getAuthHeaders() as Record<string, string> },
    }
  );

  const createMutation = useCreateProgressEntry({
    request: { headers: getAuthHeaders() as Record<string, string> },
  });

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          let width = img.width;
          let height = img.height;
          const maxDim = 800; // Scale down for AI efficiency and payload limits
          
          if (width > height && width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          } else if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Output high compression JPEG (0.6 quality)
          const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
          const base64 = dataUrl.split(",")[1];
          if (!base64) reject(new Error("Failed to process image"));
          resolve(base64);
        };
        img.onerror = () => reject(new Error("Failed to load image for compression"));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error("FileReader failed"));
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const base64String = await compressImage(file);
      
      await createMutation.mutateAsync({
        data: { 
          photoBase64: base64String,
          planId: planId || ""
        }
      });

      toast({
        title: "Progress uploaded",
        description: "AI feedback has been generated for your progress photo!",
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to analyze photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl shrink-0">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation(`/plans/${planId}`)} className="hover:bg-white/5">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-display font-black text-white tracking-tighter uppercase">
              Daily <span className="text-zinc-500">Progress</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Upload Section */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-white/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[50px]" />
          <div className="text-center space-y-4 relative z-10">
            <h2 className="text-3xl font-display font-black text-white tracking-tighter uppercase">Track Evolution</h2>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed font-medium">
              Upload your physique protocols to receive AI-engineered analysis.
            </p>
            
            <div className="pt-6">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handlePhotoUpload} 
              />
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="primary"
                size="lg"
                className="px-10 h-14"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Engineering Feedback...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-5 w-5" />
                    Upload Progress Photo
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-display font-black text-white flex items-center gap-4 tracking-tighter uppercase">
            <div className="w-1.5 h-6 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
            Evolving Timeline
          </h3>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center p-8 glass-panel rounded-xl border border-white/5 border-dashed">
              <p className="text-muted-foreground">No progress entries yet. Upload your first photo above!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {entries.map((entry) => (
                <div key={entry.id} className="glass-panel rounded-2xl overflow-hidden border border-white/5 flex flex-col md:flex-row shadow-2xl">
                  <div className="md:w-1/3 bg-black/40 relative">
                    <img 
                      src={`data:image/jpeg;base64,${entry.photoBase64}`} 
                      alt="Progress" 
                      className="w-full h-auto object-cover aspect-3/4 md:aspect-square"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-background/40 to-transparent md:hidden" />
                  </div>
                  <div className="p-8 md:w-2/3 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-[10px] text-white bg-white/10 px-4 py-2 rounded-full w-fit mb-5 border border-white/20 font-black uppercase tracking-[0.2em] shadow-md">
                      {format(new Date(entry.createdAt), "MMMM d, yyyy")}
                    </div>
                    <div className="prose prose-invert max-w-none text-[15px] leading-relaxed text-zinc-300 whitespace-pre-line font-medium">
                      {entry.aiFeedback}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
