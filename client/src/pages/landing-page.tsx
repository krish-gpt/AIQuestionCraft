import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "wouter";
import { Check } from "lucide-react";

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

      {/* Pricing Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Select the perfect plan for your survey needs
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
        {/* Free Tier */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-3xl font-bold mb-6">$0</div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>2 surveys included</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>5 responses per survey</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>Basic analytics</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>AI-powered insights</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/auth">Get Started</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Monthly Subscription */}
        <Card className="flex flex-col border-primary">
          <CardHeader>
            <div className="text-center">
              <div className="bg-primary/10 text-primary text-sm font-semibold py-1 px-3 rounded-full inline-block mb-2">
                MOST POPULAR
              </div>
            </div>
            <CardTitle>Monthly</CardTitle>
            <CardDescription>For regular survey creators</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-3xl font-bold mb-6">
              $20
              <span className="text-lg text-muted-foreground font-normal">
                /month
              </span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>Unlimited surveys</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>Unlimited responses</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>Priority AI insights</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>Custom branding</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/auth">Subscribe Now</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Pay as You Go */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Pay as You Go</CardTitle>
            <CardDescription>For occasional surveys</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-3xl font-bold mb-6">
              $5
              <span className="text-lg text-muted-foreground font-normal">
                /survey
              </span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>Pay per survey</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>Unlimited responses</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>AI-powered insights</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/auth">Start Now</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
