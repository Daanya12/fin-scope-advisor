import { BarChart3, TrendingUp, Shield, AlertCircle } from "lucide-react";
import FinancialCard from "@/components/FinancialCard";
import HealthMeter from "@/components/HealthMeter";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  // This would typically come from backend/state management
  const hasAnalysis = false;

  if (!hasAnalysis) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <FinancialCard title="Your Financial Dashboard" gradient>
            <div className="text-center py-12 space-y-6">
              <div className="w-20 h-20 rounded-full bg-muted/50 mx-auto flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No Data Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Complete a financial analysis or investment comparison to see your personalized dashboard
                </p>
              </div>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link to="/analyze">
                  <Button className="gradient-accent text-yellow-foreground font-semibold">
                    Analyze Finances
                  </Button>
                </Link>
                <Link to="/compare">
                  <Button variant="outline" className="border-yellow/50 hover:bg-yellow/10">Compare Investments</Button>
                </Link>
              </div>
            </div>
          </FinancialCard>
        </div>
      </div>
    );
  }

  // Example dashboard with data (would be populated from actual analysis)
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Financial Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Your complete financial health overview
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FinancialCard title="Overall Health" gradient>
            <HealthMeter score={75} label="Financial Score" size="lg" />
          </FinancialCard>

          <FinancialCard title="Credit Status" gradient>
            <div className="space-y-4">
              <Shield className="w-8 h-8 text-warning" />
              <div>
                <div className="text-2xl font-bold">720</div>
                <div className="text-sm text-muted-foreground">Credit Score</div>
              </div>
            </div>
          </FinancialCard>

          <FinancialCard title="Investment Ready" gradient>
            <div className="space-y-4">
              <TrendingUp className="w-8 h-8 text-success" />
              <div>
                <div className="text-2xl font-bold">£600</div>
                <div className="text-sm text-muted-foreground">Monthly Available</div>
              </div>
            </div>
          </FinancialCard>
        </div>

        <FinancialCard title="Priority Actions" gradient>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-warning/10 border border-warning/20">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold mb-1">Reduce Credit Utilization</div>
                <p className="text-sm text-muted-foreground">
                  Your credit utilization is at 48%. Paying off £400 could improve your score by ~20 points.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-success/10 border border-success/20">
              <TrendingUp className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold mb-1">Start Investing</div>
                <p className="text-sm text-muted-foreground">
                  After improving your credit, invest £300/month in S&P 500 for steady growth.
                </p>
              </div>
            </div>
          </div>
        </FinancialCard>
      </div>
    </div>
  );
};

export default Dashboard;
