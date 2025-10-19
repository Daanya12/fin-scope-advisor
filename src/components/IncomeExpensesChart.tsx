import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface IncomeExpensesChartProps {
  data: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
}

const IncomeExpensesChart = ({ data }: IncomeExpensesChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="month" 
          className="text-xs" 
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={(value) => `£${value}`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          formatter={(value: number) => [`£${value.toFixed(0)}`, '']}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="line"
        />
        <Line 
          type="monotone" 
          dataKey="income" 
          stroke="hsl(var(--success))" 
          strokeWidth={3}
          name="Income"
          dot={{ fill: 'hsl(var(--success))', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          stroke="hsl(var(--destructive))" 
          strokeWidth={3}
          name="Expenses"
          dot={{ fill: 'hsl(var(--destructive))', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default IncomeExpensesChart;
