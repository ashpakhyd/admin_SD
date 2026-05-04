"use client";
import {
  useGetStatsQuery,
  useGetTicketStatusQuery,
  useGetTechnicianPerformanceQuery,
  useGetTechnicianRatingsQuery,
} from "@/store/services/dashboardApi";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

function StatCard({ label, value, icon, bg, color }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
        <span className={`text-xl ${color}`}>{icon}</span>
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value ?? "—"}</p>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <p className="text-sm font-semibold text-gray-700 mb-4">{title}</p>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: sl } = useGetStatsQuery();
  const { data: ticketStatus, isLoading: tsl } = useGetTicketStatusQuery();
  const { data: techPerf, isLoading: tpl } = useGetTechnicianPerformanceQuery();
  const { data: techRatings, isLoading: trl } = useGetTechnicianRatingsQuery();

  // Map ticket-status _id → name for chart
  const ticketChartData = ticketStatus?.map((t) => ({ ...t, name: t._id })) || [];

  const statCards = [
    { label: "Total Tickets",    value: stats?.tickets?.total,           icon: "🎫", bg: "bg-indigo-50",  color: "text-indigo-600" },
    { label: "Open Tickets",     value: stats?.tickets?.open,            icon: "📂", bg: "bg-amber-50",   color: "text-amber-600" },
    { label: "Completed",        value: stats?.tickets?.completed,       icon: "✅", bg: "bg-green-50",   color: "text-green-600" },
    { label: "Technicians",      value: stats?.users?.technicians,       icon: "🔧", bg: "bg-violet-50",  color: "text-violet-600" },
    { label: "Customers",        value: stats?.users?.customers,         icon: "👥", bg: "bg-sky-50",     color: "text-sky-600" },
    { label: "Active Offers",    value: stats?.offers?.active,           icon: "🏷️", bg: "bg-rose-50",    color: "text-rose-600" },
  ];

  const recentRedemptions = stats?.recentActivity?.recentRedemptions || [];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {sl
          ? Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-[84px]" />)
          : statCards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Offers summary row */}
      {!sl && stats?.offers && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Offers",      value: stats.offers.total,            bg: "bg-white", text: "text-gray-800" },
            { label: "Active Offers",     value: stats.offers.active,           bg: "bg-white", text: "text-indigo-600" },
            { label: "Total Redemptions", value: stats.offers.totalRedemptions, bg: "bg-white", text: "text-green-600" },
          ].map((item) => (
            <div key={item.label} className={`${item.bg} rounded-2xl border border-gray-100 p-4 text-center`}>
              <p className={`text-2xl font-bold ${item.text}`}>{item.value ?? "—"}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Ticket Status">
          {tsl ? <Skeleton className="h-52" /> : ticketChartData.length === 0 ? (
            <p className="text-center text-gray-300 text-sm py-10">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={ticketChartData} dataKey="count" nameKey="name"
                  cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {ticketChartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Technician Performance">
          {tpl ? <Skeleton className="h-52" /> : !techPerf?.length ? (
            <p className="text-center text-gray-300 text-sm py-10">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={techPerf} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <Tooltip />
                <Bar dataKey="completedJobs" fill="#6366f1" radius={[4, 4, 0, 0]} name="Completed" />
                <Bar dataKey="totalJobs" fill="#e0e7ff" radius={[4, 4, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Technician Ratings + Recent Redemptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Technician Ratings">
          {trl ? <Skeleton className="h-40" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-50">
                    <th className="text-left pb-3 font-medium">Name</th>
                    <th className="text-left pb-3 font-medium">Phone</th>
                    <th className="text-left pb-3 font-medium">Rating</th>
                    <th className="text-left pb-3 font-medium">Reviews</th>
                  </tr>
                </thead>
                <tbody>
                  {techRatings?.length > 0 ? techRatings.map((t, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="py-2.5 font-medium text-gray-800">{t.name}</td>
                      <td className="py-2.5 text-gray-400 text-xs">{t.phone}</td>
                      <td className="py-2.5">
                        <span className="flex items-center gap-1 font-semibold text-gray-700">
                          <span className="text-amber-400">★</span>
                          {t.avgRating?.toFixed(1) ?? "—"}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-400">{t.totalRatings ?? 0}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="py-8 text-center text-gray-300 text-sm">No data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Recent Redemptions">
          {sl ? <Skeleton className="h-40" /> : recentRedemptions.length === 0 ? (
            <p className="text-center text-gray-300 text-sm py-10">No recent redemptions</p>
          ) : (
            <div className="space-y-3">
              {recentRedemptions.map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{r.customer}</p>
                    <p className="text-xs text-gray-400 truncate">{r.offer}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-mono font-semibold text-indigo-600">{r.redemptionCode}</p>
                    <p className="text-xs text-gray-400">
                      {r.redeemedAt ? new Date(r.redeemedAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
