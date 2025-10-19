import { useState, useEffect } from "react";
import FinancialCard from "@/components/FinancialCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: string;
}

interface RecommendedAssetsProps {
  riskAppetite: string;
  portfolioType: string;
  userId: string;
}

const RecommendedAssets = ({ riskAppetite, portfolioType, userId }: RecommendedAssetsProps) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('yahoo-finance', {
          body: {
            action: 'recommendations',
            riskAppetite,
            portfolioType,
          },
        });

        if (error) throw error;

        setAssets(data.recommendations || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to fetch recommendations",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [riskAppetite, portfolioType, toast]);

  const handleAddToPortfolio = async (asset: Asset) => {
    toast({
      title: "Coming Soon",
      description: "IG.com trading integration will be added soon. For now, use this as investment research.",
    });
  };

  if (loading) {
    return (
      <FinancialCard title="Recommended Assets" gradient>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </FinancialCard>
    );
  }

  return (
    <FinancialCard title="Recommended Assets" gradient>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Based on your <span className="font-medium capitalize">{riskAppetite}</span> risk profile 
          and <span className="font-medium">{portfolioType === 'short-term' ? 'short-term' : 'long-term'}</span> investment horizon
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          {assets.map((asset) => (
            <div key={asset.symbol} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">{asset.symbol}</div>
                  <div className="text-sm text-muted-foreground">{asset.name}</div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {asset.type.toUpperCase()}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">${asset.price.toFixed(2)}</div>
                  <div className={`flex items-center gap-1 text-sm ${
                    asset.changePercent >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {asset.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{Math.abs(asset.changePercent).toFixed(2)}%</span>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  onClick={() => handleAddToPortfolio(asset)}
                  className="gradient-primary"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Invest
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <strong>Note:</strong> IG.com trading integration coming soon. These recommendations are for research purposes.
        </div>
      </div>
    </FinancialCard>
  );
};

export default RecommendedAssets;
