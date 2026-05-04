"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function TechPerformanceChart({ data }) {
  if (!data || data.length === 0)
    return <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data</div>;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolved" />
        <Bar dataKey="assigned" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Assigned" />
      </BarChart>
    </ResponsiveContainer>
  );
}
