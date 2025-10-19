import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, DollarSign, PieChart, Plus } from "lucide-react";
import FinancialCard from "@/components/FinancialCard";
import { useToast } from "@/hooks/use-toast";
import PortfolioSetup from "@/components/portfolio/PortfolioSetup";
import PortfolioOverview from "@/components/portfolio/PortfolioOverview";
import RecommendedAssets from "@/components/portfolio/RecommendedAssets";

interface Portfolio {
  risk_appetite: string;
  investment_goal: string;
}

interface Holding {
  id: string;
  symbol: string;
  name: string;
  asset_type: string;
  quantity: number;
  average_price: number;
  current_price: number;
  total_value: number;
  profit_loss: number;
  profit_loss_percent: number;
}

const Portfolio = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Fetch portfolio preferences
      const { data: portfolioData } = await supabase
        .from("user_portfolios")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (portfolioData) {
        setPortfolio(portfolioData as Portfolio);
        
        // Fetch holdings
        const { data: holdingsData } = await supabase
          .from("user_holdings")
          .select("*")
          .eq("user_id", session.user.id);

        if (holdingsData) {
          setHoldings(holdingsData as Holding[]);
        }
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

  const handlePortfolioCreated = (newPortfolio: Portfolio) => {
    setPortfolio(newPortfolio);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <PortfolioSetup onComplete={handlePortfolioCreated} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Investment Portfolio</h1>
          <p className="text-lg text-muted-foreground">
            Manage your investments and track performance
          </p>
        </div>

        <PortfolioOverview 
          holdings={holdings} 
          riskAppetite={portfolio.risk_appetite}
          investmentGoal={portfolio.investment_goal}
        />

        <RecommendedAssets 
          riskAppetite={portfolio.risk_appetite}
          investmentGoal={portfolio.investment_goal}
          userId={user?.id || ''}
        />
      </div>
    </div>
  );
};

export default Portfolio;
