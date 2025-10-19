import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

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

interface TradeHistoryProps {
  trades: Trade[];
}

export const TradeHistory = ({ trades }: TradeHistoryProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(value);
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Entry Price</TableHead>
            <TableHead>Exit Price</TableHead>
            <TableHead>Entry Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>P&L</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No trades logged yet
              </TableCell>
            </TableRow>
          ) : (
            trades.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{trade.symbol}</div>
                    {trade.asset_name && (
                      <div className="text-xs text-muted-foreground">{trade.asset_name}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={trade.trade_type === 'buy' ? 'default' : 'secondary'}>
                    {trade.trade_type.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{trade.quantity}</TableCell>
                <TableCell>{formatCurrency(trade.entry_price)}</TableCell>
                <TableCell>
                  {trade.exit_price ? formatCurrency(trade.exit_price) : '-'}
                </TableCell>
                <TableCell>{formatDate(trade.entry_date)}</TableCell>
                <TableCell>
                  <Badge variant={trade.status === 'open' ? 'outline' : 'default'}>
                    {trade.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  {trade.pnl !== null ? (
                    <div className="flex items-center gap-1">
                      {trade.pnl >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-success" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      )}
                      <span className={trade.pnl >= 0 ? "text-success font-semibold" : "text-destructive font-semibold"}>
                        {formatCurrency(trade.pnl)}
                      </span>
                      {trade.pnl_percent !== null && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({trade.pnl_percent.toFixed(2)}%)
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};