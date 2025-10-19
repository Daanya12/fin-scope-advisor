import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DebtChartProps {
  data: Array<{
    month: string;
    debt: number;
  }>;
}

const DebtChart = ({ data }: DebtChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="debtGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
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
          formatter={(value: number) => [`£${value.toFixed(0)}`, 'Total Debt']}
        />
        <Area 
          type="monotone" 
          dataKey="debt" 
          stroke="hsl(var(--accent))" 
          strokeWidth={3}
          fill="url(#debtGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default DebtChart;
