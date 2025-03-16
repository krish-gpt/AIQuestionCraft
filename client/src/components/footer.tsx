import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t py-12 mt-auto">
      <div className="container mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-bold mb-4">SurveyAI</h3>
          <p className="text-sm text-muted-foreground">
            Create engaging surveys in seconds with AI-generated questions.
            Collect responses and get instant insights.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/pricing">
                <a className="text-muted-foreground hover:text-foreground">
                  Pricing
                </a>
              </Link>
            </li>
            <li>
              <Link href="/auth">
                <a className="text-muted-foreground hover:text-foreground">
                  Get Started
                </a>
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://docs.example.com"
                className="text-muted-foreground hover:text-foreground"
              >
                Documentation
              </a>
            </li>
            <li>
              <a
                href="https://blog.example.com"
                className="text-muted-foreground hover:text-foreground"
              >
                Blog
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="/privacy"
                className="text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="/terms"
                className="text-muted-foreground hover:text-foreground"
              >
                Terms of Service
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-8 pt-8 border-t">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SurveyAI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
