"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import axios from "axios";

// Stripe Price IDs
const PRICE_ID_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_ID!;
const PRICE_ID_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY_ID!;

export default function Packages() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const { data: session } = useSession();
  const user = session?.user;
  

  async function startCheckout(priceId: string) {
    setLoadingPlan(priceId);
    try {
      const response = await axios.post("/api/subscription", {
        userId: user?.id,
        email: user?.email,
        priceId,
      }, {withCredentials: true});
      if (response.data.success) {
          window.location.href = response.data.data;
      }
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 400) {
        toast.error(error.response.data.message);
      }
      toast.error("Failed to subscribe");
      console.error(error);
    } 
      setLoadingPlan(null);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/30">
      <section className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-3xl mx-auto"
        >
          <Badge variant="secondary" className="mb-3">
            TransformAI
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Simple pricing for powerful AI tools
          </h1>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Generate AI images and remove backgrounds with ease. Pick a plan
            that works best for you.
          </p>
        </motion.div>

        <Separator className="mt-10" />

        {/* Pricing cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 max-w-5xl mx-auto">
          {/* Monthly */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
          >
            <Card className="relative h-full border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-2xl">Monthly</CardTitle>
                <CardDescription>
                  Great to try TransformAI or for lighter usage.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">$10</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {["AI image generation", "Background remover", "Standard rate limits"].map(
                    (item) => (
                      <li key={item} className="flex items-start gap-3 text-sm">
                        <Check className="mt-0.5 h-4 w-4" />
                        <span>{item}</span>
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => startCheckout(PRICE_ID_MONTHLY)}
                  disabled={loadingPlan === PRICE_ID_MONTHLY}
                >
                  {loadingPlan === PRICE_ID_MONTHLY
                    ? "Redirecting..."
                    : "Subscribe Monthly"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Yearly */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
          >
            <Card className="relative h-full border-2 border-border">
              <div className="absolute -top-3 right-4">
                <Badge>Save 17%</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Yearly</CardTitle>
                <CardDescription>
                  Best value for regular AI users.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">$100</span>
                  <span className="text-muted-foreground">/year</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {["Everything in Monthly", "Priority limits", "Priority support"].map(
                    (item) => (
                      <li key={item} className="flex items-start gap-3 text-sm">
                        <Check className="mt-0.5 h-4 w-4" />
                        <span>{item}</span>
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => startCheckout(PRICE_ID_YEARLY)}
                  disabled={loadingPlan === PRICE_ID_YEARLY}
                >
                  {loadingPlan === PRICE_ID_YEARLY
                    ? "Redirecting..."
                    : "Subscribe Yearly"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}