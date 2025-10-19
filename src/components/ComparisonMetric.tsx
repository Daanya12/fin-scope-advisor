import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ComparisonMetricProps {
  label: string;
  current: number;
  previous?: number;
  format?: 'currency' | 'percentage' | 'score';
}

const ComparisonMetric = ({ label, current, previous, format = 'currency' }: ComparisonMetricProps) => {
  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return `£${value.toFixed(0)}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'score':
        return value.toFixed(0);
      default:
        return value.toString();
    }
  };

  const getChangeInfo = () => {
    if (!previous || previous === 0) return null;
    
    const change = current - previous;
    const percentChange = ((change / previous) * 100).toFixed(1);
    const isPositive = change > 0;
    const isNeutral = change === 0;
    
    // For debt and expenses, negative is good
    const isGoodChange = (label.toLowerCase().includes('debt') || label.toLowerCase().includes('expense'))
      ? change < 0
      : change > 0;

    return {
      change,
      percentChange,
      isPositive,
      isNeutral,
      isGoodChange
    };
  };

  const changeInfo = getChangeInfo();

  return (
    <div className="p-4 rounded-lg bg-muted space-y-2">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold">{formatValue(current)}</div>
        {changeInfo && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            changeInfo.isNeutral 
              ? 'text-muted-foreground'
              : changeInfo.isGoodChange 
                ? 'text-success' 
                : 'text-destructive'
          }`}>
            {changeInfo.isNeutral ? (
              <Minus className="w-4 h-4" />
            ) : changeInfo.isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(parseFloat(changeInfo.percentChange))}%</span>
          </div>
        )}
      </div>
      {previous !== undefined && (
        <div className="text-xs text-muted-foreground">
          Previous: {formatValue(previous)}
        </div>
      )}
    </div>
  );
};

export default ComparisonMetric;
