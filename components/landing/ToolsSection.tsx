import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOOL_REGISTRY } from "@/lib/studio/tool-registry";
import { cn } from "@/lib/utils/format";

export function ToolsSection() {
  return (
    <section className="py-24 px-4 bg-muted/30" id="tools">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
            AI Studio
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Every Tool You Need to Create
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
            From AI-generated reels to free video utilities — everything lives in one place.
            No installs. No sign up for each tool. Just create.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOOL_REGISTRY.map((tool) => {
            const Icon = tool.icon;
            const isFree = !tool.creditCost || tool.creditCost === 0;

            return (
              <Link key={tool.id} href="/signup" className="group block">
                <div className="h-full p-6 rounded-2xl bg-white border border-border/40 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/25 transition-all flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={cn(
                        "text-[11px] font-bold px-2 py-0.5 rounded-full",
                        isFree
                          ? "bg-green-100 text-green-700"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {isFree ? "Free" : `${tool.creditCost} Credit`}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-1.5">{tool.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Try free
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link href="/signup">
            <Button size="lg" className="h-12 px-8 rounded-xl font-bold shadow-sm shadow-primary/20">
              Start Creating Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            No credit card required • 10 free credits on signup
          </p>
        </div>
      </div>
    </section>
  );
}
