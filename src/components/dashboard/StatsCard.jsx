export default function StatsCard({ label, value, icon, color = "bg-slate-100", textColor = "text-slate-700" }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${textColor}`}>{value ?? "—"}</p>
      </div>
    </div>
  );
}
