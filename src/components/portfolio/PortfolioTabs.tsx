import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import PortfolioOverview from "./PortfolioOverview";
import RecommendedAssets from "./RecommendedAssets";

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

interface PortfolioTabsProps {
  portfolios: Portfolio[];
  holdings: Holding[];
  userId: string;
  onSetupPortfolio: (portfolioType: 'short-term' | 'long-term') => void;
  onRefresh: () => void;
}

const PortfolioTabs = ({ portfolios, holdings, userId, onSetupPortfolio, onRefresh }: PortfolioTabsProps) => {
  const shortTermPortfolio = portfolios.find(p => p.portfolio_type === 'short-term');
  const longTermPortfolio = portfolios.find(p => p.portfolio_type === 'long-term');

  const getPortfolioHoldings = (portfolioId: string | undefined) => {
    if (!portfolioId) return [];
    return holdings.filter(h => h.portfolio_id === portfolioId);
  };

  return (
    <Tabs defaultValue="long-term" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="short-term">Short-term (1-3 years)</TabsTrigger>
        <TabsTrigger value="long-term">Long-term (5+ years)</TabsTrigger>
      </TabsList>

      <TabsContent value="short-term" className="space-y-8 mt-6">
        {shortTermPortfolio ? (
          <>
            <PortfolioOverview
              holdings={getPortfolioHoldings(shortTermPortfolio.id)}
              riskAppetite={shortTermPortfolio.risk_appetite}
              portfolioType="short-term"
              portfolioId={shortTermPortfolio.id}
              onUpdate={onRefresh}
            />
            <RecommendedAssets
              riskAppetite={shortTermPortfolio.risk_appetite}
              portfolioType="short-term"
              userId={userId}
            />
          </>
        ) : (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <h3 className="text-2xl font-bold">Short-term Portfolio</h3>
              <p className="text-muted-foreground">
                Set up a short-term portfolio for tactical investments and goals within 1-3 years. 
                Perfect for saving for a house, vacation, or other near-term objectives.
              </p>
              <Button onClick={() => onSetupPortfolio('short-term')} size="lg" className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </div>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="long-term" className="space-y-8 mt-6">
        {longTermPortfolio ? (
          <>
            <PortfolioOverview
              holdings={getPortfolioHoldings(longTermPortfolio.id)}
              riskAppetite={longTermPortfolio.risk_appetite}
              portfolioType="long-term"
              portfolioId={longTermPortfolio.id}
              onUpdate={onRefresh}
            />
            <RecommendedAssets
              riskAppetite={longTermPortfolio.risk_appetite}
              portfolioType="long-term"
              userId={userId}
            />
          </>
        ) : (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <h3 className="text-2xl font-bold">Long-term Portfolio</h3>
              <p className="text-muted-foreground">
                Build wealth over time with a long-term investment strategy (5+ years). 
                Ideal for retirement planning, education funds, or building generational wealth.
              </p>
              <Button onClick={() => onSetupPortfolio('long-term')} size="lg" className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </div>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default PortfolioTabs;
