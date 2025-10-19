import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Sparkles, ArrowRight } from "lucide-react";
import FinancialCard from "@/components/FinancialCard";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent border border-accent/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Financial Intelligence</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Your Complete{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Financial Health
              </span>{" "}
              in One Place
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              FinScope connects your credit health with investment decisions. Get AI-powered insights
              that help you understand how your financial habits impact your investment opportunities.
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/analyze">
                <Button size="lg" className="gradient-primary text-primary-foreground">
                  Analyze My Finances
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/compare">
                <Button size="lg" variant="outline">
                  Compare Investments
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why FinScope is Different</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Most tools show you either credit or investments. We show you how they work together.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FinancialCard
              title="Credit Analysis"
              description="Understand your financial health"
              gradient
            >
              <div className="space-y-4">
                <Shield className="w-12 h-12 text-accent" />
                <p className="text-sm text-muted-foreground">
                  Get insights into your debt-to-income ratio, credit utilization, and payment patterns.
                  See exactly how to improve your score.
                </p>
              </div>
            </FinancialCard>

            <FinancialCard
              title="Investment Guidance"
              description="Smart comparisons for your situation"
              gradient
            >
              <div className="space-y-4">
                <TrendingUp className="w-12 h-12 text-success" />
                <p className="text-sm text-muted-foreground">
                  Compare investment options based on risk, returns, and your current financial stability.
                  Make informed decisions.
                </p>
              </div>
            </FinancialCard>

            <FinancialCard
              title="AI Recommendations"
              description="Personalized action steps"
              gradient
            >
              <div className="space-y-4">
                <Sparkles className="w-12 h-12 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Our AI connects the dots between your credit and investments, giving you clear,
                  actionable advice tailored to your situation.
                </p>
              </div>
            </FinancialCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8 p-8 rounded-2xl gradient-card border">
            <h2 className="text-4xl font-bold">
              Ready to Take Control of Your Financial Future?
            </h2>
            <p className="text-lg text-muted-foreground">
              Start with a free financial health check. No credit card required.
            </p>
            <Link to="/analyze">
              <Button size="lg" className="gradient-primary text-primary-foreground">
                Get Started Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
