import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
}

const PortfolioTabs = ({ portfolios, holdings, userId }: PortfolioTabsProps) => {
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
            />
            <RecommendedAssets
              riskAppetite={shortTermPortfolio.risk_appetite}
              portfolioType="short-term"
              userId={userId}
            />
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Short-term portfolio not found. Please contact support.
          </div>
        )}
      </TabsContent>

      <TabsContent value="long-term" className="space-y-8 mt-6">
        {longTermPortfolio ? (
          <>
            <PortfolioOverview
              holdings={getPortfolioHoldings(longTermPortfolio.id)}
              riskAppetite={longTermPortfolio.risk_appetite}
              portfolioType="long-term"
            />
            <RecommendedAssets
              riskAppetite={longTermPortfolio.risk_appetite}
              portfolioType="long-term"
              userId={userId}
            />
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Long-term portfolio not found. Please contact support.
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default PortfolioTabs;
