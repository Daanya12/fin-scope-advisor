import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FinancialCard from "@/components/FinancialCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, Target, Shield } from "lucide-react";

interface PortfolioSetupProps {
  portfolioType: 'short-term' | 'long-term';
  onComplete: (portfolio: any) => void;
}

const PortfolioSetup = ({ portfolioType, onComplete }: PortfolioSetupProps) => {
  const [riskAppetite, setRiskAppetite] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      // Create single portfolio
      const { data, error } = await supabase
        .from("user_portfolios")
        .insert({
          user_id: user.id,
          risk_appetite: riskAppetite,
          portfolio_type: portfolioType,
          name: portfolioType === 'short-term' ? 'Short-term Portfolio' : 'Long-term Portfolio',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Portfolio Created!",
        description: `Your ${portfolioType} portfolio has been created.`,
      });

      onComplete(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const portfolioTitle = portfolioType === 'short-term' 
    ? 'Short-term Portfolio (1-3 years)' 
    : 'Long-term Portfolio (5+ years)';

  const portfolioDescription = portfolioType === 'short-term'
    ? 'Quick returns, higher liquidity, tactical investments'
    : 'Wealth building, retirement planning, compound growth';

  return (
    <FinancialCard title={`Set Up ${portfolioTitle}`} gradient>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>{portfolioTitle}</strong> - {portfolioDescription}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <Label className="text-lg font-semibold">What is your risk appetite for this portfolio?</Label>
          </div>
          <RadioGroup value={riskAppetite} onValueChange={setRiskAppetite} required>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="cursor-pointer flex-1">
                  <div className="font-semibold">Low Risk</div>
                  <div className="text-sm text-muted-foreground">
                    Prefer stable, conservative investments with minimal volatility
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="cursor-pointer flex-1">
                  <div className="font-semibold">Medium Risk</div>
                  <div className="text-sm text-muted-foreground">
                    Balanced approach with moderate growth potential
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="cursor-pointer flex-1">
                  <div className="font-semibold">High Risk</div>
                  <div className="text-sm text-muted-foreground">
                    Aggressive growth strategy, comfortable with volatility
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <Button
          type="submit"
          className="w-full gradient-primary text-primary-foreground"
          disabled={loading || !riskAppetite}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              Creating Portfolio...
            </>
          ) : (
            <>
              <TrendingUp className="mr-2 w-4 h-4" />
              Create Portfolio
            </>
          )}
        </Button>
      </form>
    </FinancialCard>
  );
};

export default PortfolioSetup;
