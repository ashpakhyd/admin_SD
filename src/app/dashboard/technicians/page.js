"use client";
import { useState } from "react";
import Image from "next/image";
import {
  useGetTechniciansQuery,
  useVerifyTechnicianMutation,
  useDeactivateTechnicianMutation,
  useActivateTechnicianMutation,
} from "@/store/services/techniciansApi";

const FILTERS = ["ALL", "VERIFIED", "UNVERIFIED", "ACTIVE", "INACTIVE"];

export default function TechniciansPage() {
  const { data: technicians = [], isLoading } = useGetTechniciansQuery();
  const [verify] = useVerifyTechnicianMutation();
  const [deactivate] = useDeactivateTechnicianMutation();
  const [activate] = useActivateTechnicianMutation();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState(null); // detail drawer
  const [actionLoading, setActionLoading] = useState(null);

  const filtered = technicians.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.name?.toLowerCase().includes(q) || t.phone?.includes(q) || t.skills?.join(" ").toLowerCase().includes(q);
    const matchFilter =
      filter === "ALL" ? true :
      filter === "VERIFIED" ? t.isVerified :
      filter === "UNVERIFIED" ? !t.isVerified :
      filter === "ACTIVE" ? t.isActive :
      !t.isActive;
    return matchSearch && matchFilter;
  });

  const handleAction = async (fn, id) => {
    setActionLoading(id);
    try { await fn(id).unwrap(); } finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-gray-900">Technicians</h1>
        <p className="text-xs text-gray-400 mt-0.5">{technicians.length} total</p>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <input type="text" placeholder="Search name, phone or skill..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                ${filter === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-300 text-sm">
          No technicians found
        </div>
      )}

      {/* Cards */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((t) => (
            <div key={t._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3">
              {/* Top */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex-shrink-0 overflow-hidden">
                  {t.profilePhoto
                    ? <img src={t.profilePhoto} alt={t.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                        {t.name?.[0]?.toUpperCase()}
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.phone}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                      ${t.isVerified ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                      {t.isVerified ? "Verified" : "Unverified"}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                      ${t.isActive ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-500"}`}>
                      {t.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1 text-xs text-gray-500">
                {t.experience && <p>🕐 {t.experience}</p>}
                {t.serviceAreas && <p>📍 {t.serviceAreas}</p>}
                {t.certification && <p>🎓 {t.certification}</p>}
                {t.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {t.skills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1 border-t border-gray-50">
                <button onClick={() => setSelected(t)}
                  className="flex-1 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">
                  View
                </button>
                {!t.isVerified && (
                  <button onClick={() => handleAction(verify, t._id)}
                    disabled={actionLoading === t._id}
                    className="flex-1 py-2 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition disabled:opacity-50">
                    {actionLoading === t._id ? "..." : "Verify"}
                  </button>
                )}
                {t.isActive ? (
                  <button onClick={() => handleAction(deactivate, t._id)}
                    disabled={actionLoading === t._id}
                    className="flex-1 py-2 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-50">
                    {actionLoading === t._id ? "..." : "Deactivate"}
                  </button>
                ) : (
                  <button onClick={() => handleAction(activate, t._id)}
                    disabled={actionLoading === t._id}
                    className="flex-1 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition disabled:opacity-50">
                    {actionLoading === t._id ? "..." : "Activate"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 overflow-hidden flex-shrink-0">
                  {selected.profilePhoto
                    ? <img src={selected.profilePhoto} alt={selected.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                        {selected.name?.[0]?.toUpperCase()}
                      </div>
                  }
                </div>
                <div>
                  <p className="font-bold text-gray-800">{selected.name}</p>
                  <p className="text-xs text-gray-400">{selected.phone}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Status badges */}
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium
                  ${selected.isVerified ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                  {selected.isVerified ? "✓ Verified" : "⏳ Unverified"}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium
                  ${selected.isActive ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-500"}`}>
                  {selected.isActive ? "● Active" : "● Inactive"}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2">
                {[
                  ["Email", selected.email],
                  ["Experience", selected.experience],
                  ["Service Areas", selected.serviceAreas],
                  ["Certification", selected.certification],
                  ["Address", selected.address],
                  ["ID Type", selected.idType],
                  ["ID Number", selected.idNumber],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-2 text-sm py-1.5 border-b border-gray-50">
                    <span className="text-gray-400 flex-shrink-0">{label}</span>
                    <span className="text-gray-700 font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>

              {/* Skills */}
              {selected.skills?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.skills.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* ID Document */}
              {selected.idDocument && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">ID Document</p>
                  <a href={selected.idDocument} target="_blank" rel="noreferrer"
                    className="text-xs text-indigo-600 underline">View Document</a>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex gap-2 pt-2">
                {!selected.isVerified && (
                  <button onClick={() => { handleAction(verify, selected._id); setSelected(null); }}
                    className="flex-1 py-2.5 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-xl transition">
                    Verify
                  </button>
                )}
                {selected.isActive ? (
                  <button onClick={() => { handleAction(deactivate, selected._id); setSelected(null); }}
                    className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition">
                    Deactivate
                  </button>
                ) : (
                  <button onClick={() => { handleAction(activate, selected._id); setSelected(null); }}
                    className="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition">
                    Activate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
