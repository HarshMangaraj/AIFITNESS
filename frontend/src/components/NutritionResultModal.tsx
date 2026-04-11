import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/Layout";
import { Zap, Salad, Flame, Waves, PieChart } from "lucide-react";

interface NutritionData {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portionSize: string;
  confidence: number;
}

interface NutritionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: NutritionData | null;
}

export function NutritionResultModal({ isOpen, onClose, data }: NutritionResultModalProps) {
  if (!data) return null;

  const macros = [
    { label: "Protein", value: data.protein, unit: "g", color: "bg-blue-500", icon: <Salad className="w-4 h-4" /> },
    { label: "Carbs", value: data.carbs, unit: "g", color: "bg-amber-500", icon: <PieChart className="w-4 h-4" /> },
    { label: "Fats", value: data.fats, unit: "g", color: "bg-rose-500", icon: <Waves className="w-4 h-4" /> },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10 text-white overflow-hidden p-0">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                <Flame className="w-6 h-6 animate-pulse-slow" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight text-white leading-tight">
                  {data.foodName}
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-sm font-medium">
                  {data.portionSize}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-6">
            {/* Calories Card */}
            <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4 group hover:bg-white/10 transition-all duration-300">
              <div className="flex justify-between items-end relative z-10">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Energy</p>
                  <p className="text-4xl font-black text-white">{data.calories}<span className="text-sm font-medium text-zinc-500 ml-1">kcal</span></p>
                </div>
                <Zap className="w-12 h-12 text-primary/20 group-hover:text-primary/40 transition-colors" />
              </div>
            </div>

            {/* Macros Grid */}
            <div className="grid grid-cols-3 gap-3">
              {macros.map((macro) => (
                <div key={macro.label} className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/5 items-center text-center">
                  <div className={`p-2 rounded-lg ${macro.color}/20 text-white mb-1`}>
                    {macro.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{macro.label}</p>
                    <p className="text-lg font-black text-white">{macro.value}<span className="text-[10px] ml-0.5">{macro.unit}</span></p>
                  </div>
                </div>
              ))}
            </div>

            {/* Confidence Badge */}
            <div className="flex items-center justify-center pt-2">
              <div className="px-3 py-1 rounded-full bg-zinc-900 border border-white/5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  AI Confidence: {Math.round(data.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-2">
          <Button onClick={onClose} variant="primary" className="w-full">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
