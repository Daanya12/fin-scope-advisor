import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface CreditScoreChartProps {
  data: Array<{
    month: string;
    score: number;
  }>;
}

const CreditScoreChart = ({ data }: CreditScoreChartProps) => {
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
          domain={[300, 850]}
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          formatter={(value: number) => [value.toFixed(0), 'Credit Score']}
        />
        {/* Reference lines for credit score ranges */}
        <ReferenceLine y={740} stroke="hsl(var(--success))" strokeDasharray="3 3" opacity={0.5} />
        <ReferenceLine y={670} stroke="hsl(var(--warning))" strokeDasharray="3 3" opacity={0.5} />
        <ReferenceLine y={580} stroke="hsl(var(--destructive))" strokeDasharray="3 3" opacity={0.5} />
        
        <Line 
          type="monotone" 
          dataKey="score" 
          stroke="hsl(var(--warning))" 
          strokeWidth={3}
          dot={{ fill: 'hsl(var(--warning))', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CreditScoreChart;
