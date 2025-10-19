import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RatiosChartProps {
  data: Array<{
    month: string;
    dti: number;
    utilization: number;
  }>;
}

const RatiosChart = ({ data }: RatiosChartProps) => {
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
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="line"
        />
        <Line 
          type="monotone" 
          dataKey="dti" 
          stroke="hsl(var(--primary))" 
          strokeWidth={3}
          name="Debt-to-Income"
          dot={{ fill: 'hsl(var(--primary))', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="utilization" 
          stroke="hsl(var(--secondary))" 
          strokeWidth={3}
          name="Credit Utilization"
          dot={{ fill: 'hsl(var(--secondary))', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RatiosChart;
