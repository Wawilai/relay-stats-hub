import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface EmailChartProps {
  data: Array<{
    date: string;
    sending: number;
    success: number;
    fail: number;
  }>;
}

const EmailChart = ({ data }: EmailChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>แสดงกราฟการส่งอีเมล</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Sending" />
            <Line type="monotone" dataKey="success" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Success" />
            <Line type="monotone" dataKey="fail" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Fail" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default EmailChart;
