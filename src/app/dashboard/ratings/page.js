"use client";
import { useState } from "react";
import { useGetRatingsQuery } from "@/store/services/ratingsApi";

function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array(5).fill(0).map((_, i) => (
        <span key={i} className={`text-sm ${i < rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
      ))}
    </div>
  );
}

export default function RatingsPage() {
  const { data: ratings = [], isLoading } = useGetRatingsQuery();
  const [search, setSearch] = useState("");
  const [starFilter, setStarFilter] = useState(0); // 0 = ALL

  const filtered = ratings.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || r.technician?.name?.toLowerCase().includes(q)
      || r.customer?.name?.toLowerCase().includes(q)
      || r.feedback?.toLowerCase().includes(q);
    const matchStar = starFilter === 0 || r.rating === starFilter;
    return matchSearch && matchStar;
  });

  // Summary stats
  const avg = ratings.length
    ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
    : "—";
  const dist = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: ratings.filter((r) => r.rating === s).length,
  }));

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-gray-900">Ratings</h1>
        <p className="text-xs text-gray-400 mt-0.5">{ratings.length} total reviews</p>
      </div>

      {/* Summary */}
      {!isLoading && ratings.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row gap-5 items-center">
          <div className="text-center flex-shrink-0">
            <p className="text-5xl font-bold text-gray-900">{avg}</p>
            <StarDisplay rating={Math.round(parseFloat(avg))} />
            <p className="text-xs text-gray-400 mt-1">{ratings.length} reviews</p>
          </div>
          <div className="flex-1 w-full space-y-1.5">
            {dist.map(({ star, count }) => {
              const pct = ratings.length ? Math.round((count / ratings.length) * 100) : 0;
              return (
                <button key={star} onClick={() => setStarFilter(starFilter === star ? 0 : star)}
                  className={`w-full flex items-center gap-2 group transition rounded-lg px-1 py-0.5
                    ${starFilter === star ? "bg-amber-50" : "hover:bg-gray-50"}`}>
                  <span className="text-xs text-gray-500 w-3">{star}</span>
                  <span className="text-amber-400 text-xs">★</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <input type="text" placeholder="Search technician, customer or feedback..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setStarFilter(0)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
              ${starFilter === 0 ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            All
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button key={s} onClick={() => setStarFilter(starFilter === s ? 0 : s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1
                ${starFilter === s ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {s} ★
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-300 text-sm">
          No ratings found
        </div>
      )}

      {/* Mobile Cards */}
      {!isLoading && filtered.length > 0 && (
        <>
          <div className="md:hidden space-y-3">
            {filtered.map((r) => (
              <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{r.technician?.name || "—"}</p>
                    <p className="text-xs text-gray-400">{r.technician?.phone}</p>
                  </div>
                  <StarDisplay rating={r.rating} />
                </div>
                {r.feedback && (
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2 italic">"{r.feedback}"</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>👤 {r.customer?.name || "—"}</span>
                  <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-50">
                <tr className="text-xs text-gray-400">
                  <th className="text-left px-5 py-3 font-medium">Technician</th>
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 font-medium">Rating</th>
                  <th className="text-left px-5 py-3 font-medium">Feedback</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800">{r.technician?.name || "—"}</p>
                      <p className="text-xs text-gray-400">{r.technician?.phone}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{r.customer?.name || "—"}</td>
                    <td className="px-5 py-3.5"><StarDisplay rating={r.rating} /></td>
                    <td className="px-5 py-3.5 text-gray-500 max-w-xs">
                      {r.feedback
                        ? <span className="italic text-xs">"{r.feedback}"</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
