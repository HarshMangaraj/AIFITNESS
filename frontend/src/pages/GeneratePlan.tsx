import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Upload, SkipForward, Zap, Bot } from "lucide-react";
import { useGenerateWorkout, type UserProfileActivityLevel } from "@/api-client";
import { useAuth } from "@/hooks/use-auth";
import { Layout, cn } from "@/components/Layout";

interface Message {
  id: string;
  role: "coach" | "user";
  content: string;
  isPhoto?: boolean;
}

interface Question {
  id: string;
  coachText: string;
  type: "text" | "number" | "textarea" | "chips" | "multichips" | "photo";
  placeholder?: string;
  options?: { id: string; label: string; desc?: string }[];
  optional?: boolean;
}

const QUESTIONS: Question[] = [
  {
    id: "age",
    coachText: "Hey! I'm your fit.ai coach. I'll build a plan tailored just for you. Let's start simple — how old are you?",
    type: "number",
    placeholder: "e.g. 28",
  },
  {
    id: "height",
    coachText: "Great! And what's your height?",
    type: "text",
    placeholder: "e.g. 5ft 10in or 178cm",
  },
  {
    id: "weight",
    coachText: "What's your current weight?",
    type: "text",
    placeholder: "e.g. 80kg or 175lbs",
  },
  {
    id: "activityLevel",
    coachText: "How would you describe your current activity level?",
    type: "chips",
    options: [
      { id: "sedentary", label: "Sedentary", desc: "Little to no exercise" },
      { id: "lightly_active", label: "Lightly Active", desc: "1–3 days/week" },
      { id: "moderately_active", label: "Moderately Active", desc: "3–5 days/week" },
      { id: "very_active", label: "Very Active", desc: "6–7 days/week" },
      { id: "extremely_active", label: "Extremely Active", desc: "Physical job + training" },
    ],
  },
  {
    id: "goals",
    coachText: "What's your main fitness goal? Be as specific as you like — the more detail, the better your plan.",
    type: "textarea",
    placeholder: "e.g. Lose 10 lbs of fat, build visible muscle, run a 5K…",
  },
  {
    id: "equipment",
    coachText: "What equipment do you have access to? Select all that apply.",
    type: "multichips",
    options: [
      { id: "Full gym", label: "Full Gym" },
      { id: "Dumbbells", label: "Dumbbells" },
      { id: "Barbell & plates", label: "Barbell & Plates" },
      { id: "Resistance bands", label: "Resistance Bands" },
      { id: "Kettlebells", label: "Kettlebells" },
      { id: "Pull-up bar", label: "Pull-up Bar" },
      { id: "No equipment (bodyweight only)", label: "Bodyweight Only" },
    ],
  },
  {
    id: "injuries",
    coachText: "Any injuries or physical limitations I should know about? This helps me keep things safe for you.",
    type: "textarea",
    placeholder: "e.g. Bad lower back, knee pain, recovering from shoulder surgery…",
    optional: true,
  },
  {
    id: "allergies",
    coachText: "Any dietary restrictions or food allergies? I'll factor these into your nutrition plan.",
    type: "textarea",
    placeholder: "e.g. Vegan, lactose intolerant, nut allergy…",
    optional: true,
  },
  {
    id: "photo",
    coachText: "Last one — would you like to upload a physique photo? The AI can use it to tailor your plan even further. Totally optional.",
    type: "photo",
    optional: true,
  },
];

export default function GeneratePlan() {
  const { user, getAuthHeaders, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!authLoading && !user) setLocation("/login");
  }, [user, authLoading, setLocation]);

  const generateMutation = useGenerateWorkout({
    request: { headers: getAuthHeaders() as Record<string, string> },
  });

  const [messages, setMessages] = useState<Message[]>([
    { id: "q0", role: "coach", content: QUESTIONS[0].coachText },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingNextStep, setPendingNextStep] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingNextStep, isGenerating]);

  const addMessage = (msg: Omit<Message, "id">) => {
    setMessages(prev => [...prev, { ...msg, id: String(Date.now() + Math.random()) }]);
  };

  const advanceToStep = (nextStep: number, updatedProfile: Record<string, string>) => {
    if (nextStep >= QUESTIONS.length) {
      startGeneration(updatedProfile);
      return;
    }
    setPendingNextStep(true);
    setTimeout(() => {
      addMessage({ role: "coach", content: QUESTIONS[nextStep].coachText });
      setCurrentStep(nextStep);
      setInputValue("");
      setSelectedChips([]);
      setPendingNextStep(false);
    }, 500);
  };

  const handleAnswer = (_answer: string, displayAnswer: string, updatedProfile: Record<string, string>) => {
    addMessage({ role: "user", content: displayAnswer });
    advanceToStep(currentStep + 1, updatedProfile);
  };

  const handleTextSubmit = () => {
    const q = QUESTIONS[currentStep];
    const val = inputValue.trim();
    if (!val && !q.optional) return;
    const updated = { ...profile, [q.id]: val };
    setProfile(updated);
    handleAnswer(val, val || "Skipped", updated);
  };

  const handleChipSelect = (chipId: string) => {
    const q = QUESTIONS[currentStep];
    const updated = { ...profile, [q.id]: chipId };
    setProfile(updated);
    const label = q.options?.find(o => o.id === chipId)?.label || chipId;
    addMessage({ role: "user", content: label });
    advanceToStep(currentStep + 1, updated);
  };

  const handleMultiChipToggle = (chipId: string) => {
    setSelectedChips(prev =>
      prev.includes(chipId) ? prev.filter(c => c !== chipId) : [...prev, chipId]
    );
  };

  const handleMultiChipSubmit = () => {
    const q = QUESTIONS[currentStep];
    const chips = selectedChips.length > 0 ? selectedChips : [];
    const value = chips.join(", ") || "No equipment";
    const updated = { ...profile, [q.id]: value };
    setProfile(updated);
    const display = chips.length > 0 ? chips.map(c => q.options?.find(o => o.id === c)?.label || c).join(", ") : "No equipment";
    addMessage({ role: "user", content: display });
    advanceToStep(currentStep + 1, updated);
  };

  const handleSkip = () => {
    const q = QUESTIONS[currentStep];
    const updated = { ...profile };
    delete updated[q.id];
    setProfile(updated);
    addMessage({ role: "user", content: "Skipped" });
    advanceToStep(currentStep + 1, updated);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoBase64(result.split(",")[1]);
      const updated = { ...profile, photo: "uploaded" };
      setProfile(updated);
      addMessage({ role: "user", content: `📷 Photo uploaded: ${file.name}`, isPhoto: true });
      advanceToStep(currentStep + 1, updated);
    };
    reader.readAsDataURL(file);
  };

  const startGeneration = async (finalProfile: Record<string, string>) => {
    setIsGenerating(true);
    setSubmitError(null);
    addMessage({ role: "coach", content: "Perfect — I have everything I need. Building your personalized plan now…" });
    try {
      const result = await generateMutation.mutateAsync({
        data: {
          userProfile: {
            height: finalProfile.height || "",
            weight: finalProfile.weight || "",
            age: parseInt(finalProfile.age || "0", 10),
            activityLevel: (finalProfile.activityLevel || "moderately_active") as UserProfileActivityLevel,
            goals: finalProfile.goals || "",
            injuries: finalProfile.injuries || null,
            allergies: finalProfile.allergies || null,
            equipment: finalProfile.equipment || null,
          },
          photoBase64: photoBase64 || null,
        },
      });
      setLocation(`/plans/${result.id}`);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to generate plan. Please try again.";
      setSubmitError(msg);
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const q = QUESTIONS[currentStep];
    if (e.key === "Enter" && q.type === "text" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
    if (e.key === "Enter" && q.type === "number" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  const isDone = currentStep >= QUESTIONS.length;
  const q = !isDone ? QUESTIONS[currentStep] : null;

  if (authLoading || !user) return null;

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden bg-black">
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 z-0 opacity-20 contrast-125 grayscale">
          <img 
            src={`${import.meta.env.BASE_URL}images/modelsImage/b2f83fbb1d299f9230c0f3d5237fd01e.jpg`} 
            alt="Performance Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black via-transparent to-black" />
        </div>

        <div className="flex flex-col h-full max-w-2xl mx-auto w-full px-4 relative z-10">
          {/* Header */}
          <div className="py-6 border-b border-white/5 flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
              <Bot className="w-6 h-6 text-white animate-pulse-slow" />
            </div>
            <div>
              <h1 className="font-display font-black text-white text-xl tracking-tighter">fit.ai <span className="text-zinc-500">Coach</span></h1>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Protocol Engineering</p>
            </div>
          </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "coach" && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-xl transition-all duration-300 font-medium",
                    msg.role === "coach"
                      ? "glass-panel text-white rounded-tl-sm border-white/20 bg-white/5 backdrop-blur-md"
                      : "bg-white text-black font-black rounded-tr-sm shadow-xl"
                  )}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator while waiting for next question */}
          {pendingNextStep && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 items-start"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="glass-panel px-5 py-3.5 rounded-2xl rounded-tl-sm flex gap-2 items-center border-white/20 bg-white/5">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Generating state */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-8 gap-4"
            >
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
              <p className="text-muted-foreground text-sm text-center max-w-xs">
                Engineering your protocol… this takes about 10–20 seconds.
              </p>
            </motion.div>
          )}

          {submitError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-4"
            >
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center max-w-sm">
                {submitError}
              </div>
              <button
                onClick={() => startGeneration(profile)}
                className="text-sm text-primary underline underline-offset-4"
              >
                Try again
              </button>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!isDone && !isGenerating && !pendingNextStep && q && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="shrink-0 border-t border-white/5 pt-4 pb-6"
          >
            {/* Chips (single select) */}
            {q.type === "chips" && (
              <div className="flex flex-wrap gap-2">
                {q.options!.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleChipSelect(opt.id)}
                    className={cn(
                      "px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150",
                      "bg-card border-white/10 text-white hover:border-primary/60 hover:bg-primary/10"
                    )}
                  >
                    {opt.label}
                    {opt.desc && <span className="text-muted-foreground font-normal ml-1">· {opt.desc}</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Multi-chips */}
            {q.type === "multichips" && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {q.options!.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleMultiChipToggle(opt.id)}
                      className={cn(
                        "px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150",
                        selectedChips.includes(opt.id)
                          ? "bg-primary/15 border-primary text-primary"
                          : "bg-card border-white/10 text-white hover:border-primary/40"
                      )}
                    >
                      {selectedChips.includes(opt.id) && <span className="mr-1">✓</span>}
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleMultiChipSubmit}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary rounded-full text-black text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  {selectedChips.length === 0 ? "No equipment" : `Confirm (${selectedChips.length})`}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Photo upload */}
            {q.type === "photo" && (
              <div className="flex gap-3 flex-wrap">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-card border border-white/10 rounded-full text-white text-sm font-medium hover:border-primary/50 transition-colors"
                >
                  <Upload className="w-4 h-4" /> Upload Photo
                </button>
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-muted-foreground text-sm hover:text-white transition-colors"
                >
                  <SkipForward className="w-4 h-4" /> Skip
                </button>
              </div>
            )}

            {/* Text / number / textarea inputs */}
            {(q.type === "text" || q.type === "number" || q.type === "textarea") && (
              <div className="flex flex-col gap-2">
                <div className="flex items-end gap-2">
                  {q.type === "textarea" ? (
                    <textarea
                      ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder={q.placeholder}
                      rows={3}
                      autoFocus
                      className="flex-1 bg-card border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  ) : (
                    <input
                      ref={inputRef as React.RefObject<HTMLInputElement>}
                      type={q.type}
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={q.placeholder}
                      autoFocus
                      min={q.type === "number" ? 10 : undefined}
                      max={q.type === "number" ? 110 : undefined}
                      className="flex-1 bg-card border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  )}
                  <button
                    onClick={handleTextSubmit}
                    disabled={!inputValue.trim() && !q.optional}
                    className={cn(
                      "shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      inputValue.trim() || q.optional
                        ? "bg-primary hover:bg-primary/90 text-black"
                        : "bg-card border border-white/10 text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                {q.optional && (
                  <button
                    onClick={handleSkip}
                    className="self-start flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors pl-1"
                  >
                    <SkipForward className="w-3.5 h-3.5" /> Skip this question
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
    </Layout>
  );
}
