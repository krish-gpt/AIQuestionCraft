import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/landing-nav";
import { Footer } from "@/components/footer";
import { Link } from "wouter";
import { ClipboardList } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1">
        <div className="container mx-auto py-16 px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-5xl font-bold mb-6">
              Create Intelligent Surveys with AI
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Design smart surveys, gather responses, and get AI-powered
              insights to make better decisions. Transform your feedback
              collection with powerful analytics.
            </p>
            <Link href="/pricing">
              <Button size="lg" className="font-semibold">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Features Section */}
          <div className="grid gap-8 md:grid-cols-3 mt-16">
            <div className="text-center p-6">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Smart Survey Creation
              </h3>
              <p className="text-muted-foreground">
                Generate engaging questions with AI assistance and create
                professional surveys in minutes.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                Get detailed insights and sentiment analysis from your survey
                responses automatically.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Results</h3>
              <p className="text-muted-foreground">
                Monitor responses and trends in real-time with our intuitive
                dashboard.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
