import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus } from "lucide-react";
import FinancialCard from "@/components/FinancialCard";
import { Button } from "@/components/ui/button";
import { TradeForm } from "@/components/trades/TradeForm";
import { TradeHistory } from "@/components/trades/TradeHistory";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Portfolio {
  id: string;
  name: string;
  portfolio_type: string;
}

interface Trade {
  id: string;
  symbol: string;
  asset_name: string | null;
  trade_type: string;
  quantity: number;
  entry_price: number;
  exit_price: number | null;
  entry_date: string;
  exit_date: string | null;
  status: string;
  pnl: number | null;
  pnl_percent: number | null;
  notes: string | null;
}

const Trades = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Fetch portfolios
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from("user_portfolios")
        .select("*")
        .eq("user_id", session.user.id);

      if (!portfoliosError && portfoliosData) {
        setPortfolios(portfoliosData as unknown as Portfolio[]);
        if (portfoliosData.length > 0) {
          setSelectedPortfolio(portfoliosData[0].id);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (selectedPortfolio) {
      fetchTrades();
    }
  }, [selectedPortfolio]);

  const fetchTrades = async () => {
    if (!selectedPortfolio) return;

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("portfolio_id", selectedPortfolio)
      .order("entry_date", { ascending: false });

    if (!error && data) {
      setTrades(data as unknown as Trade[]);
    }
  };

  const calculateTotalPnL = () => {
    return trades
      .filter(t => t.pnl !== null)
      .reduce((sum, t) => sum + (t.pnl || 0), 0);
  };

  const calculateWinRate = () => {
    const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl !== null);
    if (closedTrades.length === 0) return 0;
    const winning = closedTrades.filter(t => (t.pnl || 0) > 0).length;
    return (winning / closedTrades.length) * 100;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Trade Journal</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Track your trades and analyze your performance
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Log Trade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log New Trade</DialogTitle>
                <DialogDescription>
                  Record your trade details for tracking and analysis
                </DialogDescription>
              </DialogHeader>
              {selectedPortfolio && (
                <TradeForm
                  portfolioId={selectedPortfolio}
                  onSuccess={() => {
                    fetchTrades();
                    setDialogOpen(false);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FinancialCard title="Total P&L" gradient>
            <div className="flex items-center gap-2">
              <div className={`text-3xl font-bold ${
                calculateTotalPnL() >= 0 ? "text-success" : "text-destructive"
              }`}>
                £{calculateTotalPnL().toFixed(2)}
              </div>
            </div>
          </FinancialCard>

          <FinancialCard title="Win Rate" gradient>
            <div className="text-3xl font-bold">{calculateWinRate().toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground mt-2">
              {trades.filter(t => t.status === 'closed').length} closed trades
            </p>
          </FinancialCard>

          <FinancialCard title="Open Positions" gradient>
            <div className="text-3xl font-bold">
              {trades.filter(t => t.status === 'open').length}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {trades.length} total trades
            </p>
          </FinancialCard>
        </div>

        <FinancialCard title="Trade History" gradient>
          <TradeHistory trades={trades} />
        </FinancialCard>
      </div>
    </div>
  );
};

export default Trades;