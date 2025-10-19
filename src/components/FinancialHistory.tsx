import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FinancialAnalysis {
  id: string;
  month: number;
  year: number;
  monthly_income: number;
  monthly_expenses: number;
  credit_score: number;
  debt_amount: number;
  financial_score: number;
  credit_utilization: number;
  debt_to_income_ratio: number;
  monthly_available: number;
}

interface FinancialHistoryProps {
  data: FinancialAnalysis[];
  onSelectMonth: (month: number, year: number) => void;
}

const FinancialHistory = ({ data, onSelectMonth }: FinancialHistoryProps) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-success/10 text-success border-success/20">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-warning/10 text-warning border-warning/20">Good</Badge>;
    return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Needs Work</Badge>;
  };

  const getChangeIndicator = (current: number, previous: number | undefined, isDebtOrExpense = false) => {
    if (!previous || previous === 0) return null;
    
    const change = current - previous;
    if (change === 0) return <Minus className="w-4 h-4 text-muted-foreground" />;
    
    // For debt and expenses, negative is good
    const isGood = isDebtOrExpense ? change < 0 : change > 0;
    
    return change > 0 ? (
      <TrendingUp className={`w-4 h-4 ${isGood ? 'text-success' : 'text-destructive'}`} />
    ) : (
      <TrendingDown className={`w-4 h-4 ${isGood ? 'text-success' : 'text-destructive'}`} />
    );
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Month</TableHead>
            <TableHead className="text-right font-semibold">Health Score</TableHead>
            <TableHead className="text-right font-semibold">Income</TableHead>
            <TableHead className="text-right font-semibold">Expenses</TableHead>
            <TableHead className="text-right font-semibold">Debt</TableHead>
            <TableHead className="text-right font-semibold">Credit Score</TableHead>
            <TableHead className="text-right font-semibold">Available</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record, index) => {
            const previousRecord = index < data.length - 1 ? data[index + 1] : undefined;
            
            return (
              <TableRow 
                key={record.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onSelectMonth(record.month, record.year)}
              >
                <TableCell className="font-medium">
                  {monthNames[record.month - 1]} {record.year}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-semibold">{record.financial_score}</span>
                    {getScoreBadge(record.financial_score)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span>£{record.monthly_income.toFixed(0)}</span>
                    {getChangeIndicator(record.monthly_income, previousRecord?.monthly_income)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span>£{record.monthly_expenses.toFixed(0)}</span>
                    {getChangeIndicator(record.monthly_expenses, previousRecord?.monthly_expenses, true)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span>£{record.debt_amount.toFixed(0)}</span>
                    {getChangeIndicator(record.debt_amount, previousRecord?.debt_amount, true)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span>{record.credit_score}</span>
                    {getChangeIndicator(record.credit_score, previousRecord?.credit_score)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={record.monthly_available >= 0 ? 'text-success font-semibold' : 'text-destructive font-semibold'}>
                    £{record.monthly_available.toFixed(0)}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default FinancialHistory;
