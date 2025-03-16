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
          {/* Stripe Pricing Table Integration Section */}
          <div className="max-w-5xl mx-auto">
            {/* 
              Stripe Pricing Table will be integrated here
              The div below is a placeholder that will be replaced with the Stripe component
            */}
            <div
              data-stripe-pricing-table
              data-publishable-key="YOUR_STRIPE_PUBLISHABLE_KEY"
              className="w-full min-h-[600px] border rounded-lg p-8"
            >
              <div className="text-center text-muted-foreground">
                <p>Stripe Pricing Table will be displayed here</p>
                <p className="text-sm mt-2">Configure your Stripe integration to see the pricing plans</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-semibold mb-4">All plans include</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="font-medium mb-2">AI-Powered Survey Creation</h3>
                <p className="text-muted-foreground">
                  Generate engaging questions with AI assistance
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground">
                  Get detailed insights from your responses
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">24/7 Support</h3>
                <p className="text-muted-foreground">
                  Access to our dedicated support team
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}