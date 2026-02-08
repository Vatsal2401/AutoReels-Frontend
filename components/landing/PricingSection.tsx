'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { paymentApi } from '@/lib/api/payment';
import { cn } from '@/lib/utils';

export function PricingSection() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['publicPlans'],
    queryFn: paymentApi.getPublicPlans,
  });

  if (isLoading) {
    return (
      <section id="pricing" className="py-24 px-4 container mx-auto max-w-6xl text-center">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-24 px-4 container mx-auto max-w-6xl text-center">
      <div className="mb-16 space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Simple, Credit-Based Pricing
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          No monthly subscriptions. No hidden fees. <br className="hidden sm:block" />
          Buy credits as you need them and scale at your own pace.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="h-3 w-3" />
            Credits Never Expire
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="h-3 w-3" />
            Pay As You Go
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans?.map((plan) => {
          const isPopular = plan.tag === 'Most Popular'; // Or based on ID/Name logic
          // Calculate per credit price for display
          const perCredit = (plan.displayPrice / plan.credits).toFixed(2);

          return (
            <div
              key={plan.id}
              className={cn(
                'relative p-8 rounded-2xl border flex flex-col transition-all text-left',
                isPopular
                  ? 'border-primary shadow-xl scale-[1.02] bg-white ring-1 ring-primary/20'
                  : 'border-border/60 bg-card/10',
              )}
            >
              {plan.tag && (
                <div
                  className={cn(
                    'absolute top-4 right-4 px-2 py-0.5 rounded-md text-[10px] font-bold',
                    isPopular ? 'bg-primary text-white' : 'bg-green-500/10 text-green-600',
                  )}
                >
                  {plan.tag}
                </div>
              )}

              <div className="mb-6 space-y-1">
                <h3 className="text-lg font-bold tracking-tight">{plan.name}</h3>
                <div className="text-3xl font-black text-foreground">{plan.credits} Credits</div>
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="text-xl font-bold">
                    {plan.symbol}
                    {plan.displayPrice}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    • {plan.symbol}
                    {perCredit} per credit
                  </span>
                </div>
              </div>
              {/* 
            <div className="flex-1 mb-8">
               <p className="text-xs text-muted-foreground font-medium italic">
                  {plan.description} 
               </p>
            </div>
            */}
              <div className="mt-auto">
                <Link href="/signup">
                  <Button
                    variant={isPopular ? 'default' : 'outline'}
                    className="w-full rounded-xl font-bold h-11"
                  >
                    Purchase
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
