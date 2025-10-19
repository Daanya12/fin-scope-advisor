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
import PortfolioTabs from "@/components/portfolio/PortfolioTabs";
import PortfolioSettings from "@/components/portfolio/PortfolioSettings";
import { Badge } from "@/components/ui/badge";

interface Portfolio {
  id: string;
  risk_appetite: string;
  portfolio_type: string;
  name: string;
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
  portfolio_id: string | null;
}

const Portfolio = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
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

      // Fetch all portfolios (short-term and long-term)
      const { data: portfolioData } = await supabase
        .from("user_portfolios")
        .select("*")
        .eq("user_id", session.user.id);

      if (portfolioData && portfolioData.length > 0) {
        setPortfolios(portfolioData as Portfolio[]);
        
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

  const handlePortfolioCreated = async () => {
    // Refresh portfolios after creation
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: portfolioData } = await supabase
        .from("user_portfolios")
        .select("*")
        .eq("user_id", session.user.id);

      if (portfolioData) {
        setPortfolios(portfolioData as Portfolio[]);
      }
    }
  };

  const handleSettingsUpdate = async () => {
    // Refresh portfolios after settings update
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: portfolioData } = await supabase
        .from("user_portfolios")
        .select("*")
        .eq("user_id", session.user.id);

      if (portfolioData) {
        setPortfolios(portfolioData as Portfolio[]);
      }
    }
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

  if (portfolios.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <PortfolioSetup onComplete={handlePortfolioCreated} />
        </div>
      </div>
    );
  }

  const riskAppetite = portfolios[0]?.risk_appetite || 'medium';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold">Investment Portfolio</h1>
            <p className="text-lg text-muted-foreground">
              Manage your investments and track performance
            </p>
          </div>
          <PortfolioSettings 
            userId={user?.id || ''} 
            currentRiskAppetite={riskAppetite}
            onUpdate={handleSettingsUpdate}
          />
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium">Risk Profile:</span>
            <Badge variant="secondary" className="capitalize">
              {riskAppetite}
            </Badge>
          </div>
        </Card>

        <PortfolioTabs 
          portfolios={portfolios}
          holdings={holdings}
          userId={user?.id || ''}
        />
      </div>
    </div>
  );
};

export default Portfolio;
