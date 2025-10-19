import FinancialCard from "@/components/FinancialCard";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Target, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RiskAppetiteEditor } from "./RiskAppetiteEditor";

interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  current_price: number;
  total_value: number;
  profit_loss: number;
  profit_loss_percent: number;
}

interface PortfolioOverviewProps {
  holdings: Holding[];
  riskAppetite: string;
  portfolioType: string;
  portfolioId: string;
  onUpdate: () => void;
}

const PortfolioOverview = ({ holdings, riskAppetite, portfolioType, portfolioId, onUpdate }: PortfolioOverviewProps) => {
  const totalValue = holdings.reduce((sum, h) => sum + h.total_value, 0);
  const totalProfitLoss = holdings.reduce((sum, h) => sum + h.profit_loss, 0);
  const totalProfitLossPercent = totalValue > 0 ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100 : 0;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <FinancialCard title="Portfolio Value" gradient>
        <div className="space-y-4">
          <DollarSign className="w-8 h-8 text-success" />
          <div>
            <div className="text-3xl font-bold">£{totalValue.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Total Holdings</div>
          </div>
          <div className={`flex items-center gap-2 ${totalProfitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
            {totalProfitLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="font-semibold">
              £{Math.abs(totalProfitLoss).toFixed(2)} ({Math.abs(totalProfitLossPercent).toFixed(2)}%)
            </span>
          </div>
        </div>
      </FinancialCard>

      <FinancialCard title="Risk Profile" gradient>
        <div className="space-y-4">
          <Shield className="w-8 h-8 text-warning" />
          <div>
            <Badge className={`${
              riskAppetite === 'low' ? 'bg-success/10 text-success' :
              riskAppetite === 'medium' ? 'bg-warning/10 text-warning' :
              'bg-destructive/10 text-destructive'
            }`}>
              {riskAppetite.toUpperCase()} RISK
            </Badge>
            <div className="text-sm text-muted-foreground mt-2">Risk Appetite</div>
          </div>
          <RiskAppetiteEditor 
            portfolioId={portfolioId} 
            currentRiskAppetite={riskAppetite}
            onUpdate={onUpdate}
          />
        </div>
      </FinancialCard>

      <FinancialCard title="Portfolio Type" gradient>
        <div className="space-y-4">
          <Target className="w-8 h-8 text-primary" />
          <div>
            <Badge className="bg-primary/10 text-primary">
              {portfolioType === 'short-term' ? 'SHORT-TERM' : 'LONG-TERM'}
            </Badge>
            <div className="text-sm text-muted-foreground mt-2">
              {portfolioType === 'short-term' ? '1-3 years' : '5+ years'}
            </div>
          </div>
        </div>
      </FinancialCard>
    </div>
  );
};

export default PortfolioOverview;
