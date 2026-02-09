'use client';

import { useState } from 'react';
import { useCredits } from '@/lib/hooks/useCredits';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Sparkles, Zap, ShieldCheck, Lock, RefreshCcw, ArrowRight } from 'lucide-react';
import { paymentApi, CreditPlan } from '@/lib/api/payment';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export function CreditPurchase() {
  const { credits, isLoading: isCreditsLoading } = useCredits();
  const queryClient = useQueryClient();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: plans, isLoading: isPlansLoading } = useQuery({
    queryKey: ['creditPlans'],
    queryFn: paymentApi.getPlans,
  });

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (planId: string) => {
    try {
      setIsProcessing(true);
      setSelectedPlanId(planId);

      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }

      const order = await paymentApi.createOrder({
        planId: planId,
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: order.amount,
        currency: order.currency,
        name: 'AutoReels Pro',
        description: `Purchase Credits`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            await paymentApi.verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            setPurchaseSuccess(true);
            setSelectedPlanId(null);
            queryClient.invalidateQueries({ queryKey: ['credits'] });
            setTimeout(() => setPurchaseSuccess(false), 5000);
          } catch (err) {
            console.error('Verification failed', err);
            alert('Payment verification failed. Please contact support if amount was debited.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: 'User',
          email: 'user@example.com',
        },
        theme: {
          color: '#7c3aed',
        },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Something went wrong with the payment initialization.');
      setIsProcessing(false);
    }
  };

  if (isPlansLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-4 px-4 sm:px-6 lg:px-8 space-y-4 animate-in fade-in duration-700">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 glass-strong p-6 md:p-8 shadow-2xl">
        {/* Animated Background Mesh */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground leading-tight">
              Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">Creation</span>
            </h2>
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground/60 font-medium">
                Choose a plan to fuel your AI journey.
              </p>
              <div className="w-px h-3 bg-white/10" />
              <p className="text-[10px] text-primary/80 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>1 credit = 1 generation</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-card border border-primary/20 shadow-xl min-w-[160px]">
            <Zap className="w-4 h-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-black text-foreground leading-none">
                {credits ?? 0}
              </span>
              <span className="text-[8px] font-extrabold uppercase text-muted-foreground tracking-[0.1em]">
                Credits Available
              </span>
            </div>
          </div>
        </div>

        {purchaseSuccess && (
          <div className="mb-8 rounded-[1.5rem] border border-green-500/30 bg-green-500/10 p-5 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-base font-bold text-green-700 dark:text-green-400">
                Purchase Successful!
              </p>
              <p className="text-sm text-green-600/80 font-medium">
                Your credits have been added to your account instantly.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
          {plans?.map((plan: CreditPlan, index: number) => {
            const isPopular = plan.tag === 'Most Popular';
            const pricePerCredit = (plan.price / plan.credits).toFixed(2);
            const savingsPercent = index === 1 ? '10%' : index === 2 ? '20%' : index === 3 ? '30%' : null;

            return (
              <div 
                key={plan.id}
                className={cn(
                  "animate-in fade-in slide-in-from-bottom-8 duration-700",
                  index === 1 ? "delay-100" : index === 2 ? "delay-200" : index === 3 ? "delay-300" : ""
                )}
              >
                <Card
                  className={cn(
                    'group relative flex flex-col h-full transition-all duration-500 cursor-default p-0.5 overflow-hidden min-h-[300px]',
                    isPopular
                      ? 'border-primary shadow-2xl bg-primary scale-[1.02] z-20 ring-2 ring-primary/20'
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20',
                    'rounded-[1.5rem]',
                  )}
                >
                  {/* Accent Gradient Border for Popular Plan */}
                  {isPopular && (
                    <div className="absolute inset-0 p-[1.5px] rounded-[1.5rem] bg-gradient-to-b from-primary via-indigo-500 to-transparent -z-10" />
                  )}

                  <CardHeader className="p-3 pb-0.5 text-center space-y-0.5">
                    <div className="flex justify-center mb-1.5">
                      {isPopular ? (
                        <div className="bg-white text-primary text-[8px] font-black tracking-widest px-3 py-1 rounded-full shadow-md">
                          POPULAR
                        </div>
                      ) : savingsPercent ? (
                        <div className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black tracking-widest px-3 py-1 rounded-full border border-emerald-500/20">
                          SAVE {savingsPercent}
                        </div>
                      ) : (
                        <div className="h-4" />
                      )}
                    </div>
                    
                    <CardTitle className={cn(
                      "text-3xl font-black tracking-tighter group-hover:scale-105 transition-transform duration-500",
                      isPopular ? "text-white" : "text-foreground"
                    )}>
                      {plan.credits}
                      <span className={cn(
                        "block text-[10px] font-black uppercase tracking-widest mt-0.5",
                        isPopular ? "text-white/60" : "text-muted-foreground/40"
                      )}>
                        Credits
                      </span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-3 pt-0 flex flex-col flex-1">
                    <div className="text-center mb-3">
                      <div className="inline-flex flex-col items-center">
                        <div className="flex items-start gap-0.5">
                          <span className={cn(
                            "text-lg font-bold mt-0.5",
                            isPopular ? "text-white/40" : "text-muted-foreground/40"
                          )}>
                            {plan.symbol}
                          </span>
                          <span className={cn(
                            "text-5xl font-black tracking-tight",
                            isPopular ? "text-white" : "text-foreground"
                          )}>
                            {plan.displayPrice}
                          </span>
                        </div>
                        <span className={cn(
                          "text-[9px] font-bold uppercase",
                          isPopular ? "text-white/40" : "text-muted-foreground/30"
                        )}>
                          {plan.symbol}{pricePerCredit}/cr
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 mb-3 flex-1 px-1">
                      <div className={cn(
                        "flex items-center gap-2 text-[10px] font-bold p-2 rounded-xl border",
                        isPopular 
                          ? "bg-white/10 border-white/10 text-white" 
                          : "bg-white/[0.01] border-white/5 text-muted-foreground/60"
                      )}>
                        <RefreshCcw className={cn("h-3 w-3", isPopular ? "text-white" : "text-primary/60")} />
                        <span>No Expiry</span>
                      </div>
                      <div className={cn(
                        "flex items-center gap-2 text-[10px] font-bold p-2 rounded-xl border",
                        isPopular 
                          ? "bg-white/10 border-white/10 text-white" 
                          : "bg-white/[0.01] border-white/5 text-muted-foreground/60"
                      )}>
                        <Check className={cn("h-3 w-3", isPopular ? "text-white" : "text-primary/60")} />
                        <span>Full Access</span>
                      </div>
                    </div>

                    <Button
                      className={cn(
                        'w-full h-9 rounded-lg font-black uppercase tracking-[0.1em] text-[9px] transition-all duration-300 group/btn',
                        isPopular
                          ? 'bg-white text-primary hover:bg-white/90 shadow-lg'
                          : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm',
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(plan.id);
                      }}
                      disabled={isProcessing}
                    >
                      {isProcessing && selectedPlanId === plan.id ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Processing</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>Buy Credits</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </div>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Proper Trust Section */}
        <div className="relative mt-4 pt-3 border-t border-white/5 flex flex-wrap justify-between items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-primary/40" />
            <span>Secure Payments</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCcw className="w-3 h-3 text-primary/40" />
            <span>Never Expires</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-primary/40" />
            <span>Instant Activation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
