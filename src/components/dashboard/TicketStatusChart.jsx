"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

export default function TicketStatusChart({ data }) {
  if (!data || data.length === 0)
    return <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data</div>;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(val) => [val, "Tickets"]} />
        <Legend iconType="circle" iconSize={8} />
      </PieChart>
    </ResponsiveContainer>
  );
}
