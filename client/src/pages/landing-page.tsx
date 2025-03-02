import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function LandingPage() {
  return (
    <div className="container max-w-6xl py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">
          Create and Analyze Surveys with AI
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Design intelligent surveys, gather responses, and get AI-powered
          insights to make better decisions.
        </p>
      </div>

      {/* Pricing Section with Stripe Pricing Table */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Select the perfect plan for your survey needs
        </p>

        {/* @ts-ignore */}
        <stripe-pricing-table
          pricing-table-id="prctbl_1QxmeTJZmwspn7QsW5nq4XT9"
          publishable-key="pk_live_51Qt0eyJZmwspn7Qs0vUGE1wrKDbZQ1zIA3xIKZ4Q5lGAmHPmu8xzdksKHpZ3Ts2lxKZvcCoh1uBbMINrhOHN0P7E00LToN2aRA">
        </stripe-pricing-table>
      </div>
    </div>
  );
}