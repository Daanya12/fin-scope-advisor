import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import FinancialCard from "@/components/FinancialCard";
import HealthMeter from "@/components/HealthMeter";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  healthScore: number;
  creditScore: number;
  debtToIncomeRatio: number;
  creditUtilization: number;
  insights: string[];
  recommendations: string[];
}

const AnalyzeFinances = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    income: "",
    expenses: "",
    debt: "",
    creditScore: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-finances", {
        body: formData,
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Analysis Complete!",
        description: "Your financial health report is ready.",
      });
    } catch (error) {
      console.error("Error analyzing finances:", error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your finances. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Financial Health Analysis</h1>
          <p className="text-lg text-muted-foreground">
            Enter your financial information to get personalized insights and recommendations
          </p>
        </div>

        <FinancialCard title="Your Financial Information" gradient>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="income">Monthly Income (£)</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="2500"
                  value={formData.income}
                  onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expenses">Monthly Expenses (£)</Label>
                <Input
                  id="expenses"
                  type="number"
                  placeholder="1900"
                  value={formData.expenses}
                  onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="debt">Total Debt (£)</Label>
                <Input
                  id="debt"
                  type="number"
                  placeholder="1200"
                  value={formData.debt}
                  onChange={(e) => setFormData({ ...formData, debt: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditScore">Credit Score (Optional)</Label>
                <Input
                  id="creditScore"
                  type="number"
                  placeholder="720"
                  value={formData.creditScore}
                  onChange={(e) => setFormData({ ...formData, creditScore: e.target.value })}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary text-primary-foreground"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 w-4 h-4 text-yellow" />
                  Analyze My Finances
                </>
              )}
            </Button>
          </form>
        </FinancialCard>

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <FinancialCard title="Your Financial Health Score" gradient>
              <div className="space-y-6">
                <HealthMeter score={result.healthScore} label="Overall Health" size="lg" />
                <HealthMeter score={result.creditScore} label="Credit Score" size="md" />
                
                <div className="grid md:grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-sm text-muted-foreground mb-1">Debt-to-Income Ratio</div>
                    <div className="text-2xl font-bold">{result.debtToIncomeRatio}%</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-sm text-muted-foreground mb-1">Credit Utilization</div>
                    <div className="text-2xl font-bold">{result.creditUtilization}%</div>
                  </div>
                </div>
              </div>
            </FinancialCard>

            <FinancialCard title="Key Insights" gradient>
              <ul className="space-y-3">
                {result.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{insight}</span>
                  </li>
                ))}
              </ul>
            </FinancialCard>

            <FinancialCard title="Recommended Actions" gradient>
              <ul className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      {index + 1}
                    </div>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </FinancialCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzeFinances;
