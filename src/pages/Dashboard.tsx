import { BarChart3, TrendingUp, Shield, AlertCircle } from "lucide-react";
import FinancialCard from "@/components/FinancialCard";
import HealthMeter from "@/components/HealthMeter";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

interface FinancialAnalysis {
  id: string;
  monthly_income: number;
  monthly_expenses: number;
  credit_score: number;
  debt_amount: number;
  financial_score: number;
  credit_utilization: number;
  debt_to_income_ratio: number;
  monthly_available: number;
  recommendations: {
    insights: string[];
    actions: string[];
    investments?: InvestmentRecommendation[];
  };
}

interface InvestmentSuggestion {
  name: string;
  ticker: string;
  price?: number;
  changePercent?: number;
}

interface InvestmentRecommendation {
  category: string;
  suggestions: InvestmentSuggestion[];
  riskLevel: "low" | "medium" | "high";
  timeHorizon: string;
  reasoning: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [analysis, setAnalysis] = useState<FinancialAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Fetch latest analysis
      const { data, error } = await supabase
        .from("financial_analyses")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setAnalysis(data as unknown as FinancialAnalysis);
      }

      setLoading(false);
    };

    fetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!analysis) {
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
                  <Button className="gradient-primary text-primary-foreground">
                    Analyze Finances
                  </Button>
                </Link>
                <Link to="/compare">
                  <Button variant="outline">Compare Investments</Button>
                </Link>
              </div>
            </div>
          </FinancialCard>
        </div>
      </div>
    );
  }

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
            <HealthMeter score={analysis.financial_score} label="Financial Score" size="lg" />
          </FinancialCard>

          <FinancialCard title="Credit Status" gradient>
            <div className="space-y-4">
              <Shield className="w-8 h-8 text-warning" />
              <div>
                <div className="text-2xl font-bold">{analysis.credit_score}</div>
                <div className="text-sm text-muted-foreground">Credit Score</div>
              </div>
            </div>
          </FinancialCard>

          <FinancialCard title="Investment Ready" gradient>
            <div className="space-y-4">
              <TrendingUp className="w-8 h-8 text-success" />
              <div>
                <div className="text-2xl font-bold">£{analysis.monthly_available.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">Monthly Available</div>
              </div>
            </div>
          </FinancialCard>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FinancialCard title="Financial Metrics" gradient>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-sm text-muted-foreground mb-1">Monthly Income</div>
                <div className="text-2xl font-bold">£{analysis.monthly_income.toFixed(0)}</div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-sm text-muted-foreground mb-1">Monthly Expenses</div>
                <div className="text-2xl font-bold">£{analysis.monthly_expenses.toFixed(0)}</div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-sm text-muted-foreground mb-1">Total Debt</div>
                <div className="text-2xl font-bold">£{analysis.debt_amount.toFixed(0)}</div>
              </div>
            </div>
          </FinancialCard>

          <FinancialCard title="Key Ratios" gradient>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-sm text-muted-foreground mb-1">Credit Utilization</div>
                <div className="text-2xl font-bold">{analysis.credit_utilization.toFixed(1)}%</div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-sm text-muted-foreground mb-1">Debt-to-Income Ratio</div>
                <div className="text-2xl font-bold">{analysis.debt_to_income_ratio.toFixed(1)}%</div>
              </div>
            </div>
          </FinancialCard>
        </div>

        {analysis.recommendations?.insights && (
          <FinancialCard title="Key Insights" gradient>
            <ul className="space-y-3">
              {analysis.recommendations.insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{insight}</span>
                </li>
              ))}
            </ul>
          </FinancialCard>
        )}

        {analysis.recommendations?.actions && (
          <FinancialCard title="Priority Actions" gradient>
            <ul className="space-y-3">
              {analysis.recommendations.actions.map((action, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    {index + 1}
                  </div>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </FinancialCard>
        )}

        {analysis.recommendations?.investments && analysis.recommendations.investments.length > 0 && (
          <FinancialCard title="Your Investment Recommendations" gradient>
            <div className="space-y-6">
              {analysis.recommendations.investments.map((inv, index) => (
                <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{inv.category}</h3>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        inv.riskLevel === "low" ? "bg-success/10 text-success" :
                        inv.riskLevel === "medium" ? "bg-warning/10 text-warning" :
                        "bg-destructive/10 text-destructive"
                      }`}>
                        {inv.riskLevel.toUpperCase()} RISK
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">
                        {inv.timeHorizon}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{inv.reasoning}</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Suggested investments:</p>
                    <ul className="space-y-2">
                      {inv.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-start gap-2 flex-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium">{suggestion.name}</span>
                              <span className="text-muted-foreground ml-2">({suggestion.ticker})</span>
                            </div>
                          </div>
                          {suggestion.price && (
                            <div className="text-right">
                              <div className="font-semibold">${suggestion.price.toFixed(2)}</div>
                              {suggestion.changePercent !== undefined && (
                                <div className={`text-xs ${suggestion.changePercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                                  {suggestion.changePercent >= 0 ? '▲' : '▼'} {Math.abs(suggestion.changePercent).toFixed(2)}%
                                </div>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </FinancialCard>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
