"use client";

import { useState } from "react";
import { useCredits } from "@/lib/hooks/useCredits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { paymentApi } from "@/lib/api/payment";
import { useQueryClient } from "@tanstack/react-query";

const CREDIT_PACKAGES = [
  { amount: 10, price: 9, bonus: 0 },
  { amount: 25, price: 20, bonus: 2 },
  { amount: 50, price: 35, bonus: 5 },
  { amount: 100, price: 60, bonus: 15 },
];

export function CreditPurchase() {
  const { credits, isLoading: isCreditsLoading } = useCredits();
  const queryClient = useQueryClient();
  const [customAmount, setCustomAmount] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (creditAmount: number, priceAmount: number) => {
    try {
      setIsProcessing(true);
      setSelectedPackage(creditAmount);

      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        return;
      }

      // 1. Create Order on Backend
      const order = await paymentApi.createOrder({
        amount: priceAmount,
        credits: creditAmount,
      });

      // 2. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: order.amount,
        currency: order.currency,
        name: "AutoReels Pro",
        description: `Purchase ${creditAmount} Credits`,
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
            setSelectedPackage(null);
            setCustomAmount("");
            queryClient.invalidateQueries({ queryKey: ["credits"] });
            setTimeout(() => setPurchaseSuccess(false), 5000);
          } catch (err) {
            console.error("Verification failed", err);
            alert("Payment verification failed. Please contact support if amount was debited.");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com", // Should ideally fetch from auth context
        },
        theme: {
          color: "#7c3aed", // primary color
        },
        modal: {
          ondismiss: () => setIsProcessing(false),
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Something went wrong with the payment initialization.");
      setIsProcessing(false);
    }
  };

  const handlePackageSelect = (amount: number) => {
    setSelectedPackage(amount);
    setCustomAmount("");
  };

  const handleCustomPurchase = () => {
    const amount = parseInt(customAmount);
    if (amount > 0) {
      // Assuming 1 Credit = 1 INR for custom amounts or simple multiplier
      handlePurchase(amount, amount);
    }
  };

  return (
    <div className="space-y-8 p-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-2">Purchase Credits</h2>
        <p className="text-muted-foreground">
          Current balance: <Badge variant="default">{credits ?? 0} credits</Badge>
        </p>
      </div>

      {purchaseSuccess && (
        <div className="rounded-lg border border-green-500 bg-green-500/10 p-4 flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500" />
          <p className="text-sm text-green-700 dark:text-green-400">
            Credits purchased successfully!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CREDIT_PACKAGES.map((pkg) => (
          <Card
            key={pkg.amount}
            className={`cursor-pointer transition-all ${
              selectedPackage === pkg.amount
                ? "border-primary ring-2 ring-primary"
                : "hover:border-primary/50"
            }`}
            onClick={() => handlePackageSelect(pkg.amount)}
          >
            <div className="p-1">
              <CardHeader className="p-6 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{pkg.amount} Credits</CardTitle>
                {pkg.bonus > 0 && (
                  <Badge variant="secondary">+{pkg.bonus} bonus</Badge>
                )}
              </div>
              <CardDescription>
                ${pkg.price} • ${(pkg.price / (pkg.amount + pkg.bonus)).toFixed(2)} per credit
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <Button
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePurchase(pkg.amount + pkg.bonus, pkg.price);
                }}
                disabled={isProcessing}
                isLoading={isProcessing && selectedPackage === (pkg.amount + pkg.bonus)}
              >
                {isProcessing && selectedPackage === (pkg.amount + pkg.bonus) ? "Processing..." : "Purchase"}
              </Button>
            </CardContent>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-1">
          <CardHeader className="p-6 pb-2">
          <CardTitle>Custom Amount</CardTitle>
          <CardDescription>Purchase any amount of credits</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-4">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              min="1"
              className="flex-1"
            />
            <Button
              onClick={handleCustomPurchase}
              disabled={!customAmount || parseInt(customAmount) <= 0 || isProcessing}
              isLoading={isProcessing && selectedPackage === parseInt(customAmount)}
            >
              Purchase
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Secure payments handled via Razorpay.
          </p>
        </CardContent>
        </div>
      </Card>
    </div>
  );
}
