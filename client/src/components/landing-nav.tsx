import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function LandingNav() {
  return (
    <div className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl">
            SurveyAI
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth?tab=login">
            <Button variant="outline">Sign in</Button>
          </Link>
          <Link href="/pricing">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}