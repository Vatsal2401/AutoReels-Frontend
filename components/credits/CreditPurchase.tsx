"use client";

import { useState } from "react";
import { useCredits } from "@/lib/hooks/useCredits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const CREDIT_PACKAGES = [
  { amount: 10, price: 9, bonus: 0 },
  { amount: 25, price: 20, bonus: 2 },
  { amount: 50, price: 35, bonus: 5 },
  { amount: 100, price: 60, bonus: 15 },
];

export function CreditPurchase() {
  const { credits, purchaseCredits, isPurchasing } = useCredits();
  const [customAmount, setCustomAmount] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const handlePurchase = async (amount: number) => {
    try {
      await purchaseCredits({ amount });
      setPurchaseSuccess(true);
      setSelectedPackage(null);
      setCustomAmount("");
      setTimeout(() => setPurchaseSuccess(false), 3000);
    } catch (error) {
      console.error("Purchase failed:", error);
    }
  };

  const handlePackageSelect = (amount: number) => {
    setSelectedPackage(amount);
    setCustomAmount("");
  };

  const handleCustomPurchase = () => {
    const amount = parseInt(customAmount);
    if (amount > 0) {
      handlePurchase(amount);
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <CardHeader>
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
            <CardContent>
              <Button
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePurchase(pkg.amount + pkg.bonus);
                }}
                disabled={isPurchasing}
                isLoading={isPurchasing && selectedPackage === pkg.amount}
              >
                Purchase
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custom Amount</CardTitle>
          <CardDescription>Purchase any amount of credits</CardDescription>
        </CardHeader>
        <CardContent>
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
              disabled={!customAmount || parseInt(customAmount) <= 0 || isPurchasing}
              isLoading={isPurchasing}
            >
              Purchase
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Note: Payment integration coming soon. This is a placeholder for now.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
