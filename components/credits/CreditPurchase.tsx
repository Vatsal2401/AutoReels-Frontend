'use client';

import { useState } from 'react';
import { useCredits } from '@/lib/hooks/useCredits';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Sparkles, Zap } from 'lucide-react';
import { paymentApi, CreditPlan } from '@/lib/api/payment';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils'; // Assuming utils exists

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
        return;
      }

      // 1. Create Order on Backend
      const order = await paymentApi.createOrder({
        planId: planId,
      });

      // 2. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: order.amount,
        currency: order.currency,
        name: 'AutoReels Pro',
        description: `Purchase Credits`,
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify Payment on Backend
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
          email: 'user@example.com', // Should ideally fetch from auth context
        },
        theme: {
          color: '#7c3aed', // primary color
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
    <div className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-card rounded-[2rem] p-8 md:p-12 shadow-2xl border border-border/40 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Purchase Credits
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-lg">Current balance:</span>
            <Badge
              variant="secondary"
              className="px-4 py-1.5 text-base font-semibold bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <Sparkles className="w-4 h-4 mr-2 fill-primary/20" />
              {credits ?? 0} credits
            </Badge>
          </div>
        </div>

        {purchaseSuccess && (
          <div className="mb-8 rounded-xl border border-green-500/30 bg-green-500/10 p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-base font-medium text-green-700 dark:text-green-400">
              Credits purchased successfully! Your balance has been updated.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans?.map((plan: CreditPlan) => {
            const isPopular = plan.tag === 'Most Popular';
            const isBestValue = plan.tag?.includes('Best');

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative flex flex-col transition-all duration-300 hover:-translate-y-1 cursor-default',
                  isPopular
                    ? 'border-primary shadow-xl shadow-primary/10 scale-[1.02] z-10 ring-1 ring-primary/20 bg-background'
                    : 'border-border/60 hover:border-primary/30 hover:shadow-lg bg-card/50',
                  'rounded-2xl overflow-visible',
                )}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md z-20 whitespace-nowrap">
                    MOST POPULAR
                  </div>
                )}
                {isBestValue && !isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-[10px] font-bold px-3 py-1 rounded-full shadow-sm z-20 border border-border/50 whitespace-nowrap">
                    BEST VALUE
                  </div>
                )}

                <CardHeader className="p-6 pb-2 text-center pt-8">
                  <CardTitle className="text-xl font-bold text-foreground">
                    {plan.credits} Credits
                  </CardTitle>
                  <div className="h-10 flex items-center justify-center">
                    {plan.tag && !isPopular && !isBestValue && (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-medium text-muted-foreground border-border/60"
                      >
                        {plan.tag}
                      </Badge>
                    )}
                    {(isPopular || isBestValue) && (
                      <p className="text-xs text-muted-foreground font-medium">
                        {plan.credits >= 100 ? 'For power users' : 'Perfect for starting'}
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-0 flex flex-col flex-1">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-black text-foreground tracking-tight">
                      {plan.symbol}
                      {plan.displayPrice}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>Never expires</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>Use for all features</span>
                    </li>
                  </ul>

                  <Button
                    className={cn(
                      'w-full h-11 rounded-xl font-bold transition-all',
                      isPopular
                        ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30'
                        : 'bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary z-10',
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchase(plan.id);
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing && selectedPlanId === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      'Purchase'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
