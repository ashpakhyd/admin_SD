"use client";
import { useState } from "react";
import Link from "next/link";
import { useGetAllRedemptionsQuery, useVerifyRedemptionMutation } from "@/store/services/offersApi";

const STATUS_COLORS = {
  ACTIVE:  "bg-green-50 text-green-600",
  USED:    "bg-gray-100 text-gray-500",
  EXPIRED: "bg-red-50 text-red-500",
};

export default function RedemptionsPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 10, status: "", startDate: "", endDate: "" });
  const [verifyForm, setVerifyForm] = useState({ redemptionCode: "", action: "VERIFY", notes: "" });
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState("");

  const { data, isLoading, isFetching } = useGetAllRedemptionsQuery(filters);
  const [verifyRedemption, { isLoading: verifying }] = useVerifyRedemptionMutation();

  const redemptions = data?.redemptions || [];
  const pagination = data?.pagination;

  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: 1 }));

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyError(""); setVerifyResult(null);
    const payload = { redemptionCode: verifyForm.redemptionCode, action: verifyForm.action };
    if (verifyForm.action === "MARK_USED" && verifyForm.notes) payload.notes = verifyForm.notes;
    try {
      const res = await verifyRedemption(payload).unwrap();
      setVerifyResult(res);
    } catch (err) {
      setVerifyError(err?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/offers" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
          <BackIcon />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Redemptions</h1>
          <p className="text-xs text-gray-400 mt-0.5">{pagination?.totalRecords ?? 0} total</p>
        </div>
      </div>

      {/* Verify Code */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-sm font-semibold text-gray-700 mb-4">Verify Redemption Code</p>
        <form onSubmit={handleVerify} className="space-y-3">
          <div className="flex gap-2">
            <input type="text" placeholder="Enter redemption code (e.g. ABC123)"
              value={verifyForm.redemptionCode}
              onChange={(e) => setVerifyForm((f) => ({ ...f, redemptionCode: e.target.value }))}
              required
              className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono uppercase" />
            <select value={verifyForm.action} onChange={(e) => setVerifyForm((f) => ({ ...f, action: e.target.value }))}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
              <option value="VERIFY">VERIFY</option>
              <option value="MARK_USED">MARK USED</option>
            </select>
            <button type="submit" disabled={verifying}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-60">
              {verifying ? "..." : "Check"}
            </button>
          </div>
          {verifyForm.action === "MARK_USED" && (
            <input type="text" placeholder="Notes (optional)"
              value={verifyForm.notes} onChange={(e) => setVerifyForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          )}
        </form>

        {verifyError && <div className="mt-3 px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">⚠️ {verifyError}</div>}

        {verifyResult && (
          <div className={`mt-3 p-4 rounded-xl border ${verifyResult.valid ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
            <p className={`text-sm font-semibold mb-2 ${verifyResult.valid ? "text-green-700" : "text-red-600"}`}>
              {verifyResult.valid ? "✅ Valid Code" : "❌ Invalid Code"} — {verifyResult.message}
            </p>
            {verifyResult.redemption && (
              <div className="space-y-1 text-xs text-gray-600">
                <p>Customer: <span className="font-medium">{verifyResult.redemption.customer?.name}</span> · {verifyResult.redemption.customer?.phone}</p>
                <p>Offer: <span className="font-medium">{verifyResult.redemption.offer?.title}</span></p>
                <p>Status: <span className="font-medium">{verifyResult.redemption.status}</span></p>
                {verifyResult.redemption.expiresAt && <p>Expires: {new Date(verifyResult.redemption.expiresAt).toLocaleDateString()}</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {["", "ACTIVE", "USED", "EXPIRED"].map((s) => (
            <button key={s} onClick={() => setFilter("status", s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                ${filters.status === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {s || "All"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input type="date" value={filters.startDate} onChange={(e) => setFilter("startDate", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
            <input type="date" value={filters.endDate} onChange={(e) => setFilter("endDate", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
        </div>
      </div>

      {/* Loading */}
      {(isLoading || isFetching) && (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      )}

      {/* Empty */}
      {!isLoading && !isFetching && redemptions.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-300 text-sm">No redemptions found</div>
      )}

      {/* Mobile Cards */}
      {!isLoading && redemptions.length > 0 && (
        <>
          <div className="md:hidden space-y-3">
            {redemptions.map((r) => (
              <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm font-bold text-indigo-600">{r.redemptionCode}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{r.offer?.title}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-500"}`}>
                    {r.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-0.5">
                  <p>👤 {r.customer?.name} · {r.customer?.phone}</p>
                  <p>💰 {r.offer?.price?.original} {r.offer?.price?.currency}</p>
                  <p className="text-gray-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-50">
                <tr className="text-xs text-gray-400">
                  <th className="text-left px-5 py-3 font-medium">Code</th>
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 font-medium">Offer</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {redemptions.map((r) => (
                  <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-indigo-600">{r.redemptionCode}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800">{r.customer?.name || "—"}</p>
                      <p className="text-xs text-gray-400">{r.customer?.phone}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-gray-700">{r.offer?.title || "—"}</p>
                      <p className="text-xs text-gray-400">{r.offer?.category}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-500"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.total > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-5 py-3">
              <p className="text-xs text-gray-400">Page {pagination.current} of {pagination.total} · {pagination.totalRecords} records</p>
              <div className="flex gap-2">
                <button onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))} disabled={filters.page === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">Prev</button>
                <button onClick={() => setFilters((f) => ({ ...f, page: Math.min(pagination.total, f.page + 1) }))} disabled={filters.page === pagination.total}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BackIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>; }
