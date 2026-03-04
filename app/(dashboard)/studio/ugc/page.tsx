"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/format";
import { ugcApi, type UgcActor, type UgcStyle } from "@/lib/api/ugc";
import { Plus, X, ChevronRight, ChevronLeft, Loader2, Play, Check } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step1Data {
  productName: string;
  productDescription: string;
  benefits: string[];
  targetAudience: string;
  callToAction: string;
}

interface WizardState {
  step: 1 | 2 | 3 | 4 | 5;
  step1: Step1Data;
  ugcStyle: UgcStyle;
  selectedActorId: string;
  actors: UgcActor[];
  actorsLoading: boolean;
  mediaId: string | null;
  submitting: boolean;
  error: string | null;
}

const UGC_STYLES: { id: UgcStyle; label: string; description: string }[] = [
  { id: "selfie_review", label: "Selfie Review", description: "Personal review talking to camera" },
  { id: "unboxing", label: "Unboxing", description: "First impressions & product reveal" },
  { id: "problem_solution", label: "Problem / Solution", description: "Identify pain point, present fix" },
  { id: "before_after", label: "Before / After", description: "Show transformation result" },
  { id: "tiktok_story", label: "TikTok Story", description: "Narrative hook with reveal" },
];

const STEP_LABELS = [
  "Product Info",
  "UGC Style",
  "Choose Actor",
  "Confirm",
  "Generating",
];

// ─── Step Components ──────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors",
              i + 1 < current
                ? "bg-primary border-primary text-primary-foreground"
                : i + 1 === current
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground"
            )}
          >
            {i + 1 < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={cn(
                "w-8 h-0.5 mx-1",
                i + 1 < current ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
      <span className="ml-2 text-sm text-muted-foreground font-medium">
        {STEP_LABELS[current - 1]}
      </span>
    </div>
  );
}

function Step1({ data, onChange }: { data: Step1Data; onChange: (d: Step1Data) => void }) {
  const addBenefit = () => onChange({ ...data, benefits: [...data.benefits, ""] });
  const removeBenefit = (i: number) =>
    onChange({ ...data, benefits: data.benefits.filter((_, idx) => idx !== i) });
  const updateBenefit = (i: number, val: string) => {
    const b = [...data.benefits];
    b[i] = val;
    onChange({ ...data, benefits: b });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1.5">Product Name *</label>
        <Input
          value={data.productName}
          onChange={(e) => onChange({ ...data, productName: e.target.value })}
          placeholder="e.g. GlowBoost Serum"
          maxLength={120}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Description *</label>
        <Textarea
          value={data.productDescription}
          onChange={(e) => onChange({ ...data, productDescription: e.target.value })}
          placeholder="2-3 sentences about what the product does..."
          rows={3}
          maxLength={600}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Key Benefits</label>
        <div className="space-y-2">
          {data.benefits.map((b, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={b}
                onChange={(e) => updateBenefit(i, e.target.value)}
                placeholder={`Benefit ${i + 1}`}
                maxLength={100}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeBenefit(i)}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addBenefit}
            disabled={data.benefits.length >= 5}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Benefit
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Target Audience *</label>
        <Input
          value={data.targetAudience}
          onChange={(e) => onChange({ ...data, targetAudience: e.target.value })}
          placeholder="e.g. Women 18-35 with oily skin"
          maxLength={200}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Call to Action *</label>
        <Input
          value={data.callToAction}
          onChange={(e) => onChange({ ...data, callToAction: e.target.value })}
          placeholder="e.g. Shop now at link in bio"
          maxLength={200}
        />
      </div>
    </div>
  );
}

function Step2({
  selected,
  onSelect,
}: {
  selected: UgcStyle;
  onSelect: (s: UgcStyle) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {UGC_STYLES.map((style) => (
        <button
          key={style.id}
          onClick={() => onSelect(style.id)}
          className={cn(
            "text-left rounded-xl border-2 px-4 py-4 transition-all hover:border-primary/60",
            selected === style.id
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:bg-muted/30"
          )}
        >
          <div className="font-semibold text-sm mb-0.5">{style.label}</div>
          <div className="text-xs text-muted-foreground">{style.description}</div>
        </button>
      ))}
    </div>
  );
}

function ActorCard({
  actor,
  isSelected,
  onSelect,
}: {
  actor: UgcActor;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative text-left rounded-xl border-2 overflow-hidden transition-all hover:border-primary/60",
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"
      )}
    >
      {/* Portrait */}
      <div className="aspect-[3/4] bg-muted flex items-center justify-center relative">
        {actor.portrait_url ? (
          <img
            src={actor.portrait_url}
            alt={actor.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-4xl text-muted-foreground/30">👤</div>
        )}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
        {actor.preview_url && (
          <div className="absolute bottom-2 left-2 bg-black/60 rounded-md px-2 py-0.5 flex items-center gap-1 text-white text-[10px]">
            <Play className="w-2.5 h-2.5" /> 5s
          </div>
        )}
      </div>
      {/* Info */}
      <div className="px-3 py-2">
        <div className="font-semibold text-sm truncate">{actor.name}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          {actor.gender} · {actor.age_group} · {actor.region.toUpperCase()}
        </div>
      </div>
    </button>
  );
}

function Step3({
  actors,
  loading,
  selectedId,
  onSelect,
}: {
  actors: UgcActor[];
  loading: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-3 text-sm text-muted-foreground">Loading actors...</span>
      </div>
    );
  }

  if (actors.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-sm">No actors available yet.</p>
        <p className="text-xs mt-1">Ask your admin to seed the actor catalog.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {actors.map((actor) => (
        <ActorCard
          key={actor.id}
          actor={actor}
          isSelected={actor.id === selectedId}
          onSelect={() => onSelect(actor.id)}
        />
      ))}
    </div>
  );
}

function Step4({
  step1,
  ugcStyle,
  actor,
}: {
  step1: Step1Data;
  ugcStyle: UgcStyle;
  actor: UgcActor | null;
}) {
  const styleLabel = UGC_STYLES.find((s) => s.id === ugcStyle)?.label ?? ugcStyle;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Review your inputs before generating. The AI will create the script, voice-over, and final video.
      </p>

      <div className="rounded-xl border border-border divide-y divide-border">
        <Row label="Product" value={step1.productName} />
        <Row label="Style" value={styleLabel} />
        <Row label="Actor" value={actor?.name ?? "—"} />
        <Row label="Audience" value={step1.targetAudience} />
        <Row label="CTA" value={step1.callToAction} />
        {step1.benefits.length > 0 && (
          <Row label="Benefits" value={step1.benefits.filter(Boolean).join(", ")} />
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
        Generation takes 2–4 minutes (AI actor rendering). You'll get a notification when it's done.
        <br />
        <strong>Cost: 3 credits</strong>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 px-4 py-3 text-sm">
      <span className="text-muted-foreground w-24 shrink-0">{label}</span>
      <span className="font-medium flex-1">{value}</span>
    </div>
  );
}

function Step5({ mediaId }: { mediaId: string | null }) {
  const router = useRouter();

  return (
    <div className="text-center py-8 space-y-6">
      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>

      <div>
        <h3 className="text-lg font-semibold">Generating Your UGC Video</h3>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
          Script → Voice-over → AI Actor rendering → Final composition. This takes 2–4 minutes.
        </p>
      </div>

      <div className="space-y-2.5 text-left max-w-xs mx-auto">
        {[
          "Script generated",
          "Voice-over created",
          "AI Actor rendering...",
          "B-roll selection",
          "Final composition",
        ].map((label, i) => (
          <div key={i} className={cn("flex items-center gap-2.5 text-sm", i > 1 ? "text-muted-foreground" : "text-foreground")}>
            {i < 2 ? (
              <Check className="w-4 h-4 text-green-500 shrink-0" />
            ) : i === 2 ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-border shrink-0" />
            )}
            {label}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="outline" onClick={() => router.push("/projects")}>
          Go to Projects
        </Button>
        {mediaId && (
          <Button onClick={() => router.push(`/videos/${mediaId}`)}>
            View Progress
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UgcStudioPage() {
  const router = useRouter();

  const [state, setState] = useState<WizardState>({
    step: 1,
    step1: {
      productName: "",
      productDescription: "",
      benefits: [],
      targetAudience: "",
      callToAction: "",
    },
    ugcStyle: "selfie_review",
    selectedActorId: "",
    actors: [],
    actorsLoading: false,
    mediaId: null,
    submitting: false,
    error: null,
  });

  const update = useCallback((patch: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const loadActors = useCallback(async () => {
    update({ actorsLoading: true });
    try {
      const actors = await ugcApi.listActors();
      update({ actors, actorsLoading: false });
    } catch {
      update({ actorsLoading: false });
    }
  }, [update]);

  const canProceed = (): boolean => {
    const { step, step1, selectedActorId } = state;
    if (step === 1) {
      return (
        step1.productName.trim().length >= 3 &&
        step1.productDescription.trim().length >= 20 &&
        step1.targetAudience.trim().length >= 5 &&
        step1.callToAction.trim().length >= 5
      );
    }
    if (step === 2) return true;
    if (step === 3) return !!selectedActorId;
    if (step === 4) return true;
    return false;
  };

  const goNext = async () => {
    if (!canProceed()) return;

    if (state.step === 2 && state.actors.length === 0) {
      await loadActors();
    }

    if (state.step === 4) {
      // Submit
      update({ submitting: true, error: null });
      try {
        const result = await ugcApi.createVideo({
          productName: state.step1.productName,
          productDescription: state.step1.productDescription,
          benefits: state.step1.benefits.filter(Boolean),
          targetAudience: state.step1.targetAudience,
          callToAction: state.step1.callToAction,
          actorId: state.selectedActorId,
          ugcStyle: state.ugcStyle,
        });
        update({ step: 5, mediaId: result.id, submitting: false });
      } catch (err: any) {
        const msg = err?.response?.data?.message || "Failed to create UGC video. Please try again.";
        update({ submitting: false, error: msg });
      }
      return;
    }

    update({ step: (state.step + 1) as WizardState["step"] });
  };

  const goBack = () => {
    if (state.step > 1) {
      update({ step: (state.step - 1) as WizardState["step"] });
    } else {
      router.push("/studio");
    }
  };

  const selectedActor = state.actors.find((a) => a.id === state.selectedActorId) ?? null;

  return (
    <DashboardLayout>
      <div className="h-full overflow-y-auto custom-scrollbar bg-muted/20 min-h-full">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">UGC Video Ad</h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered influencer-style video ads for TikTok & Instagram Reels
            </p>
          </div>

          <StepIndicator current={state.step} total={5} />

          {/* Step Content */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
            {state.step === 1 && (
              <Step1 data={state.step1} onChange={(step1) => update({ step1 })} />
            )}
            {state.step === 2 && (
              <Step2
                selected={state.ugcStyle}
                onSelect={(ugcStyle) => update({ ugcStyle })}
              />
            )}
            {state.step === 3 && (
              <Step3
                actors={state.actors}
                loading={state.actorsLoading}
                selectedId={state.selectedActorId}
                onSelect={(selectedActorId) => update({ selectedActorId })}
              />
            )}
            {state.step === 4 && (
              <Step4
                step1={state.step1}
                ugcStyle={state.ugcStyle}
                actor={selectedActor}
              />
            )}
            {state.step === 5 && <Step5 mediaId={state.mediaId} />}

            {/* Error */}
            {state.error && (
              <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-2.5 text-sm text-destructive">
                {state.error}
              </div>
            )}

            {/* Navigation */}
            {state.step < 5 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button variant="ghost" onClick={goBack} className="gap-1.5">
                  <ChevronLeft className="w-4 h-4" />
                  {state.step === 1 ? "Cancel" : "Back"}
                </Button>

                <Button
                  onClick={goNext}
                  disabled={!canProceed() || state.submitting}
                  className="gap-1.5 min-w-[120px]"
                >
                  {state.submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : state.step === 4 ? (
                    "Generate Video"
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
