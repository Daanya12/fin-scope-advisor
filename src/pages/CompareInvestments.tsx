import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, TrendingUp } from "lucide-react";
import FinancialCard from "@/components/FinancialCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ComparisonResult {
  investments: Array<{
    name: string;
    risk: string;
    expectedReturn: string;
    recommendation: string;
    suitability: number;
  }>;
  bestChoice: string;
  reasoning: string;
}

const CompareInvestments = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    investment1: "",
    investment2: "",
    investment3: "",
    monthlyInvestment: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("compare-investments", {
        body: formData,
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Comparison Complete!",
        description: "Your investment analysis is ready.",
      });
    } catch (error) {
      console.error("Error comparing investments:", error);
      toast({
        title: "Comparison Failed",
        description: "There was an error comparing investments. Please try again.",
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
          <h1 className="text-4xl font-bold">Investment Comparison</h1>
          <p className="text-lg text-muted-foreground">
            Compare investment options and find the best fit for your financial situation
          </p>
        </div>

        <FinancialCard title="Investment Options" gradient>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="investment1">Investment Option 1</Label>
                <Input
                  id="investment1"
                  placeholder="e.g., Apple Stock (AAPL)"
                  value={formData.investment1}
                  onChange={(e) => setFormData({ ...formData, investment1: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="investment2">Investment Option 2</Label>
                <Input
                  id="investment2"
                  placeholder="e.g., S&P 500 Index Fund"
                  value={formData.investment2}
                  onChange={(e) => setFormData({ ...formData, investment2: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="investment3">Investment Option 3 (Optional)</Label>
                <Input
                  id="investment3"
                  placeholder="e.g., Government Bonds"
                  value={formData.investment3}
                  onChange={(e) => setFormData({ ...formData, investment3: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyInvestment">Monthly Investment Amount (£)</Label>
                <Input
                  id="monthlyInvestment"
                  type="number"
                  placeholder="300"
                  value={formData.monthlyInvestment}
                  onChange={(e) => setFormData({ ...formData, monthlyInvestment: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gradient-accent text-yellow-foreground font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Comparing...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 w-4 h-4" />
                  Compare Investments
                </>
              )}
            </Button>
          </form>
        </FinancialCard>

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <FinancialCard title="Investment Comparison Results" gradient>
              <div className="space-y-6">
                {result.investments.map((investment, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-lg border bg-card space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">{investment.name}</h3>
                      <div className="px-3 py-1 rounded-full bg-yellow/20 text-yellow-foreground border border-yellow/30 text-sm font-medium">
                        {investment.suitability}% Match
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Risk Level</div>
                        <div className="font-semibold">{investment.risk}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Expected Return</div>
                        <div className="font-semibold text-success">{investment.expectedReturn}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-muted-foreground">{investment.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FinancialCard>

            <FinancialCard title="AI Recommendation" gradient>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="text-sm text-success font-medium mb-2">Best Choice for You</div>
                  <div className="text-lg font-bold">{result.bestChoice}</div>
                </div>
                <p className="text-muted-foreground leading-relaxed">{result.reasoning}</p>
              </div>
            </FinancialCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareInvestments;
