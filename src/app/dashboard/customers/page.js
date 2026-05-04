"use client";
import { useState, useCallback } from "react";
import { useGetCustomersQuery, useVerifyCustomerMutation, useDeactivateCustomerMutation, useActivateCustomerMutation } from "@/store/services/customersApi";

const STATUS_FILTERS = ["ALL", "VERIFIED", "UNVERIFIED", "ACTIVE", "INACTIVE"];
const LIMIT = 10;

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const { data, isLoading, isFetching } = useGetCustomersQuery({ search, page, limit: LIMIT });
  const [verify] = useVerifyCustomerMutation();
  const [deactivate] = useDeactivateCustomerMutation();
  const [activate] = useActivateCustomerMutation();

  const customers = data?.customers || [];
  const pagination = data?.pagination;

  // Client-side filter on top of server results
  const filtered = customers.filter((c) => {
    if (filter === "ALL") return true;
    if (filter === "VERIFIED") return c.isVerified;
    if (filter === "UNVERIFIED") return !c.isVerified;
    if (filter === "ACTIVE") return c.isActive;
    return !c.isActive;
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleAction = async (fn, id) => {
    setActionLoading(id);
    try { await fn(id).unwrap(); } finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-gray-900">Customers</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {pagination ? `${pagination.totalRecords} total customers` : ""}
        </p>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <div className="flex gap-2">
          <input type="text" placeholder="Search by name or phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          <button onClick={handleSearch}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition">
            Search
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                ${filter === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {(isLoading || isFetching) && (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isFetching && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-300 text-sm">
          No customers found
        </div>
      )}

      {/* Mobile Cards */}
      {!isLoading && filtered.length > 0 && (
        <>
          <div className="md:hidden space-y-3">
            {filtered.map((c) => (
              <div key={c._id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.phone}</p>
                    {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                      ${c.isVerified ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                      {c.isVerified ? "Verified" : "Unverified"}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                      ${c.isActive ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-500"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Joined {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                  {c.ticketOTPs?.length > 0 && ` · ${c.ticketOTPs.length} ticket(s)`}
                </p>
                <div className="flex gap-2 pt-2 border-t border-gray-50">
                  <button onClick={() => setSelected(c)}
                    className="flex-1 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">
                    View
                  </button>
                  {!c.isVerified && (
                    <button onClick={() => handleAction(verify, c._id)} disabled={actionLoading === c._id}
                      className="flex-1 py-2 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition disabled:opacity-50">
                      {actionLoading === c._id ? "..." : "Verify"}
                    </button>
                  )}
                  {c.isActive ? (
                    <button onClick={() => handleAction(deactivate, c._id)} disabled={actionLoading === c._id}
                      className="flex-1 py-2 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-50">
                      {actionLoading === c._id ? "..." : "Deactivate"}
                    </button>
                  ) : (
                    <button onClick={() => handleAction(activate, c._id)} disabled={actionLoading === c._id}
                      className="flex-1 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition disabled:opacity-50">
                      {actionLoading === c._id ? "..." : "Activate"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-50">
                <tr className="text-xs text-gray-400">
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 font-medium">Phone</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Tickets</th>
                  <th className="text-left px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800">{c.name}</p>
                      {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{c.phone}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium w-fit
                          ${c.isVerified ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                          {c.isVerified ? "Verified" : "Unverified"}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium w-fit
                          ${c.isActive ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-500"}`}>
                          {c.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{c.ticketOTPs?.length ?? 0}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelected(c)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition">
                          <EyeIcon />
                        </button>
                        {!c.isVerified && (
                          <button onClick={() => handleAction(verify, c._id)} disabled={actionLoading === c._id}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition disabled:opacity-50"
                            title="Verify">
                            <CheckIcon />
                          </button>
                        )}
                        {c.isActive ? (
                          <button onClick={() => handleAction(deactivate, c._id)} disabled={actionLoading === c._id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                            title="Deactivate">
                            <BanIcon />
                          </button>
                        ) : (
                          <button onClick={() => handleAction(activate, c._id)} disabled={actionLoading === c._id}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition disabled:opacity-50"
                            title="Activate">
                            <PlayIcon />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.total > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-5 py-3">
              <p className="text-xs text-gray-400">
                Page {pagination.current} of {pagination.total} · {pagination.totalRecords} records
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">
                  Prev
                </button>
                <button onClick={() => setPage((p) => Math.min(pagination.total, p + 1))} disabled={page === pagination.total}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <div>
                <p className="font-bold text-gray-800">{selected.name}</p>
                <p className="text-xs text-gray-400">{selected.phone}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Badges */}
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

              {/* Info */}
              <div className="space-y-2">
                {[
                  ["Email", selected.email],
                  ["Joined", selected.createdAt ? new Date(selected.createdAt).toLocaleString() : null],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-2 text-sm py-1.5 border-b border-gray-50">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-gray-700 font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>

              {/* Tickets */}
              {selected.ticketOTPs?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Tickets</p>
                  <div className="space-y-2">
                    {selected.ticketOTPs.map((tk) => (
                      <div key={tk._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-xs">
                        <div>
                          <p className="font-medium text-gray-700">{tk.title}</p>
                          <p className="text-gray-400">{tk.createdAt ? new Date(tk.createdAt).toLocaleDateString() : ""}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">{tk.status}</span>
                          {tk.otp && <span className="text-gray-400">OTP: {tk.otp}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
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

function EyeIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
function CheckIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>; }
function BanIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>; }
function PlayIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>; }
