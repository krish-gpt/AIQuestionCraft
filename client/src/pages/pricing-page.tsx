import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/landing-nav";
import { Footer } from "@/components/footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1">
        <div className="container mx-auto py-12">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose the plan that best fits your needs
            </p>
          </div>
          <div
            data-stripe-pricing-table
            data-publishable-key="YOUR_STRIPE_PUBLISHABLE_KEY"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
