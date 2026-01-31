import React from 'react';
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface GenerationProgressProps {
  status: 'idle' | 'generating' | 'completed' | 'error';
  progress?: number;
  currentStep?: string;
}

const STEPS = [
  { id: 'start', label: 'Starting Generation' },
  { id: 'script', label: 'Generating Script' },
  { id: 'audio', label: 'Creating Audio' },
  { id: 'assets', label: 'Processing Assets' },
  { id: 'render', label: 'Rendering Video' },
];

export function GenerationProgress({ status, progress = 0, currentStep = 'start' }: GenerationProgressProps) {
  // Determine active step index for visualization
  const activeStepIndex = STEPS.findIndex(s => s.id === currentStep);
  
  if (status === 'idle') {
      return (
          <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center space-y-4 border border-border rounded-xl bg-card shadow-sm">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Ready to Synthesize</h3>
              <p className="text-sm text-muted-foreground max-w-[200px] font-medium">
                  Configure your parameters on the left to begin the creation process.
              </p>
          </div>
      );
  }

  return (
    <div className="h-full w-full p-8 rounded-xl border border-border bg-card flex flex-col relative overflow-hidden shadow-sm">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50" />
      
      {/* Header */}
      <div className="space-y-6 mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold tracking-widest text-primary uppercase">
           <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
           AI Engine Active
        </div>
        
        <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Cinematic Synthesis
            </h2>
            <p className="text-sm text-muted-foreground w-3/4 font-medium">
                Our neural engine is orchestrating your visual story with high-fidelity assets.
            </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-12 relative z-10">
         <div className="flex justify-between text-xs font-medium text-muted-foreground">
             <span>Overall Progress</span>
             <span className="text-primary font-bold">{progress}%</span>
         </div>
         <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
             <div 
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }} 
             />
         </div>
         <p className="text-[10px] text-primary/80 italic text-right pt-1 font-medium">
            Current Node: {STEPS[activeStepIndex]?.label}...
         </p>
      </div>

      {/* Steps List */}
      <div className="space-y-6 relative z-10 flex-1">
         {STEPS.map((step, idx) => {
             const isCompleted = idx < activeStepIndex;
             const isCurrent = idx === activeStepIndex;
             const isPending = idx > activeStepIndex;

             return (
                 <div key={step.id} className={cn("flex items-center gap-4 group", isPending && "opacity-40 grayscale")}>
                     {/* Icon */}
                     <div className="relative shrink-0">
                         {isCompleted ? (
                             <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
                                 <CheckCircle2 className="w-4 h-4 text-primary" />
                             </div>
                         ) : isCurrent ? (
                             <div className="w-8 h-8 rounded-full border border-primary/50 flex items-center justify-center relative">
                                 <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping" />
                                 <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                             </div>
                         ) : (
                            <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center">
                                <Circle className="w-3 h-3 text-muted-foreground" />
                            </div>
                         )}
                         {idx !== STEPS.length - 1 && (
                            <div className={cn(
                                "absolute top-8 left-1/2 -translate-x-1/2 w-px h-6",
                                isCompleted ? "bg-primary/30" : "bg-border"
                            )} />
                         )}
                     </div>

                     {/* Text */}
                     <div className="space-y-0.5">
                         <span className={cn(
                             "text-xs font-bold uppercase tracking-wider block",
                             isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"
                         )}>
                             {step.label}
                         </span>
                         {(isCompleted || isCurrent) && (
                             <span className="text-[10px] text-muted-foreground block font-medium">
                                 {isCompleted ? "Verification Successful" : isCurrent ? "Optimizing parameters..." : "Queueing resource..."}
                             </span>
                         )}
                     </div>
                     
                     {isCurrent && (
                         <div className="ml-auto">
                              <Loader2 className="w-3 h-3 text-primary animate-spin" />
                         </div>
                     )}
                 </div>
             )
         })}
      </div>

      {/* Footer Estimate */}
      <div className="mt-8 pt-6 border-t border-border flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground">
                  <span className="text-xs font-mono">C</span>
              </div>
              <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estimated Wait</div>
                  <div className="text-xs font-bold text-foreground">30-60 Seconds</div>
              </div>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground/50 italic">POWERED BY MULTI-MODAL AI</span>
      </div>
    </div>
  );
}
