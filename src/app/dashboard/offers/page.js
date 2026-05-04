"use client";
import { useState } from "react";
import Link from "next/link";
import { useGetOffersQuery, useDeleteOfferMutation, useUpdateOfferStatusMutation, useBulkActionMutation } from "@/store/services/offersApi";

const STATUS_COLORS = {
  DRAFT:    "bg-gray-100 text-gray-500",
  ACTIVE:   "bg-green-50 text-green-600",
  INACTIVE: "bg-amber-50 text-amber-600",
  EXPIRED:  "bg-red-50 text-red-500",
};

const STATUSES   = ["", "DRAFT", "ACTIVE", "INACTIVE", "EXPIRED"];
const CATEGORIES = ["", "PRODUCT", "SERVICE", "DISCOUNT"];
const TYPES      = ["", "OFFER", "PRODUCT"];
const BULK_ACTIONS = ["ACTIVATE", "DEACTIVATE", "PUBLISH", "UNPUBLISH"];

export default function OffersPage() {
  const [filters, setFilters] = useState({ search: "", status: "", category: "", type: "", page: 1, limit: 10, sortBy: "createdAt", sortOrder: "desc" });
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState([]); // bulk select ids
  const [bulkAction, setBulkAction] = useState("ACTIVATE");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const { data, isLoading, isFetching } = useGetOffersQuery(filters);
  const [deleteOffer, { isLoading: deleting }] = useDeleteOfferMutation();
  const [updateStatus] = useUpdateOfferStatusMutation();
  const [bulkActionMutation, { isLoading: bulking }] = useBulkActionMutation();

  const offers = data?.offers || [];
  const pagination = data?.pagination;

  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: 1 }));

  const handleSearch = () => setFilter("search", searchInput);

  const toggleSelect = (id) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const toggleAll = () =>
    setSelected(selected.length === offers.length ? [] : offers.map((o) => o._id));

  const handleBulk = async () => {
    if (!selected.length) return;
    setActionLoading("bulk");
    try { await bulkActionMutation({ action: bulkAction, offerIds: selected }).unwrap(); setSelected([]); }
    finally { setActionLoading(null); }
  };

  const handleStatusToggle = async (offer) => {
    const newStatus = offer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setActionLoading(offer._id);
    try { await updateStatus({ id: offer._id, status: newStatus }).unwrap(); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (id) => {
    setActionLoading(id);
    try { await deleteOffer(id).unwrap(); setConfirmDelete(null); }
    catch (e) { alert(e?.data?.message || "Delete failed"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Offers</h1>
          <p className="text-xs text-gray-400 mt-0.5">{pagination?.totalRecords ?? 0} total offers</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/offers/redemptions"
            className="px-3 py-2.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-50 transition">
            Redemptions
          </Link>
          <Link href="/dashboard/offers/new"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition active:scale-95">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            New Offer
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <div className="flex gap-2">
          <input type="text" placeholder="Search offers..." value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          <button onClick={handleSearch}
            className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition">
            Search
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter("status", s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                ${filters.status === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {s || "All Status"}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setFilter("category", c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                ${filters.category === c ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {c || "All Category"}
            </button>
          ))}
          {TYPES.map((t) => (
            <button key={t} onClick={() => setFilter("type", t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                ${filters.type === t ? "bg-sky-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {t || "All Type"}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-400">Sort:</span>
          <select value={filters.sortBy} onChange={(e) => setFilter("sortBy", e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300">
            {["createdAt", "title", "validFrom", "validTill", "priority"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={() => setFilter("sortOrder", filters.sortOrder === "desc" ? "asc" : "desc")}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition">
            {filters.sortOrder === "desc" ? "↓ Desc" : "↑ Asc"}
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-indigo-700">{selected.length} selected</span>
          <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}
            className="px-3 py-1.5 text-sm border border-indigo-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300">
            {BULK_ACTIONS.map((a) => <option key={a}>{a}</option>)}
          </select>
          <button onClick={handleBulk} disabled={bulking}
            className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition disabled:opacity-60">
            {bulking ? "Processing..." : "Apply"}
          </button>
          <button onClick={() => setSelected([])} className="text-xs text-indigo-500 hover:text-indigo-700 ml-auto">
            Clear
          </button>
        </div>
      )}

      {/* Loading */}
      {(isLoading || isFetching) && (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      )}

      {/* Empty */}
      {!isLoading && !isFetching && offers.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-300 text-sm">No offers found</div>
      )}

      {/* Mobile Cards */}
      {!isLoading && offers.length > 0 && (
        <>
          <div className="md:hidden space-y-3">
            {offers.map((o) => (
              <div key={o._id} className={`bg-white rounded-2xl border p-4 transition ${selected.includes(o._id) ? "border-indigo-300" : "border-gray-100"}`}>
                <div className="flex items-start gap-3 mb-2">
                  <input type="checkbox" checked={selected.includes(o._id)} onChange={() => toggleSelect(o._id)}
                    className="mt-1 accent-indigo-600" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      {o.images?.[0] && (
                        <img src={o.images[0]} alt={o.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="font-semibold text-gray-800 text-sm truncate">{o.title}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                        </div>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          <span className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full text-xs">{o.category}</span>
                          <span className="px-2 py-0.5 bg-sky-50 text-sky-600 rounded-full text-xs">{o.type}</span>
                          {o.isPublished && <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs">Published</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {o.price?.original} {o.price?.currency}{o.price?.discounted ? ` → ${o.price.discounted}` : ""}
                        </p>
                        {o.createdBy?.name && <p className="text-xs text-gray-400">By {o.createdBy.name}</p>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-50">
                  <Link href={`/dashboard/offers/${o._id}`}
                    className="flex-1 py-2 text-center text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">
                    View
                  </Link>
                  <button onClick={() => handleStatusToggle(o)} disabled={actionLoading === o._id}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition disabled:opacity-50
                      ${o.status === "ACTIVE" ? "text-amber-600 bg-amber-50 hover:bg-amber-100" : "text-green-600 bg-green-50 hover:bg-green-100"}`}>
                    {o.status === "ACTIVE" ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => setConfirmDelete(o._id)}
                    className="px-3 py-2 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-50">
                <tr className="text-xs text-gray-400">
                  <th className="px-4 py-3">
                    <input type="checkbox" checked={selected.length === offers.length && offers.length > 0}
                      onChange={toggleAll} className="accent-indigo-600" />
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Title</th>
                  <th className="text-left px-4 py-3 font-medium">Category / Type</th>
                  <th className="text-left px-4 py-3 font-medium">Price</th>
                  <th className="text-left px-4 py-3 font-medium">Valid</th>
                  <th className="text-left px-4 py-3 font-medium">Created By</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => (
                  <tr key={o._id} className={`border-b border-gray-50 transition ${selected.includes(o._id) ? "bg-indigo-50/40" : "hover:bg-gray-50/50"}`}>
                    <td className="px-4 py-3.5 text-center">
                      <input type="checkbox" checked={selected.includes(o._id)} onChange={() => toggleSelect(o._id)} className="accent-indigo-600" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {o.images?.[0] && (
                          <img src={o.images[0]} alt={o.title} className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{o.title}</p>
                          {o.isPublished && <span className="text-xs text-green-600">● Published</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full text-xs w-fit">{o.category}</span>
                        <span className="px-2 py-0.5 bg-sky-50 text-sky-600 rounded-full text-xs w-fit">{o.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 text-xs">
                      <p className="font-medium">{o.price?.original} {o.price?.currency}</p>
                      {o.price?.discounted && <p className="text-green-600">↓ {o.price.discounted}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs">
                      <p>{o.validFrom ? new Date(o.validFrom).toLocaleDateString() : "—"}</p>
                      <p>{o.validTill ? new Date(o.validTill).toLocaleDateString() : "—"}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{o.createdBy?.name || "—"}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/offers/${o._id}`}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition">
                          <EyeIcon />
                        </Link>
                        <button onClick={() => handleStatusToggle(o)} disabled={actionLoading === o._id}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition disabled:opacity-50"
                          title={o.status === "ACTIVE" ? "Deactivate" : "Activate"}>
                          <ToggleIcon active={o.status === "ACTIVE"} />
                        </button>
                        <button onClick={() => setConfirmDelete(o._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
                          <TrashIcon />
                        </button>
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

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete Offer?</h3>
            <p className="text-sm text-gray-400 mb-5">If active redemptions exist, this will fail.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition disabled:opacity-60">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EyeIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
function TrashIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>; }
function ToggleIcon({ active }) {
  return active
    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>;
}
