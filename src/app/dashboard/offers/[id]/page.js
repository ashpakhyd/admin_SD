"use client";
import { useState, use } from "react";
import Link from "next/link";
import { useGetOfferDetailsQuery, useUpdateOfferMutation, useUpdateOfferStatusMutation } from "@/store/services/offersApi";
import ImageUploader from "@/components/ui/ImageUploader";

const STATUS_COLORS = {
  DRAFT: "bg-gray-100 text-gray-500", ACTIVE: "bg-green-50 text-green-600",
  INACTIVE: "bg-amber-50 text-amber-600", EXPIRED: "bg-red-50 text-red-500",
};
const STATUSES       = ["DRAFT", "ACTIVE", "INACTIVE", "EXPIRED"];
const CATEGORIES     = ["PRODUCT", "SERVICE", "DISCOUNT"];
const TYPES          = ["OFFER", "PRODUCT"];
const AUDIENCE_TYPES = ["ALL", "VERIFIED", "PREMIUM"];

export default function OfferDetailPage({ params }) {
  const { id } = use(params);
  const { data, isLoading, isError, refetch } = useGetOfferDetailsQuery({ id, include: "all" });
  const [updateOffer, { isLoading: updating }] = useUpdateOfferMutation();
  const [updateStatus, { isLoading: statusUpdating }] = useUpdateOfferStatusMutation();

  const [editing, setEditing]       = useState(false);
  const [editForm, setEditForm]     = useState({});
  const [statusForm, setStatusForm] = useState({ status: "", isPublished: "" });
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");

  const offer       = data?.offer;
  const analytics   = data?.analytics;
  const redemptions = data?.redemptions?.data || [];
  const redemPagination = data?.redemptions?.pagination;
  const recentActivity  = data?.recentActivity || [];

  const startEdit = () => {
    if (!offer) return;
    setEditForm({
      title: offer.title || "",
      description: offer.description || "",
      category: offer.category || "DISCOUNT",
      type: offer.type || "OFFER",
      price: {
        original: offer.price?.original || "",
        discounted: offer.price?.discounted || "",
        currency: offer.price?.currency || "PKR",
      },
      validFrom: offer.validFrom ? new Date(offer.validFrom).toISOString().slice(0, 16) : "",
      validTill: offer.validTill ? new Date(offer.validTill).toISOString().slice(0, 16) : "",
      termsConditions: offer.termsConditions || "",
      maxRedemptions: offer.maxRedemptions || "",
      tags: offer.tags?.join(", ") || "",
      targetAudience: {
        customerType: offer.targetAudience?.customerType || "ALL",
        locations: offer.targetAudience?.locations?.join(", ") || "",
      },
      priority: offer.priority || "",
      images: offer.images || [],
    });
    setEditing(true);
  };

  const addEditImage = (url) =>
    setEditForm((f) => ({ ...f, images: [...(f.images || []), url] }));
  const removeEditImage = (i) =>
    setEditForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    // Client-side date validation
    if (editForm.validFrom && editForm.validTill && editForm.validTill <= editForm.validFrom) {
      setError("Valid Till must be after Valid From.");
      return;
    }

    const payload = {
      title: editForm.title,
      description: editForm.description,
      category: editForm.category,
      type: editForm.type,
      price: {
        original: parseFloat(editForm.price.original),
        currency: editForm.price.currency,
        ...(editForm.price.discounted ? { discounted: parseFloat(editForm.price.discounted) } : {}),
      },
      validFrom: editForm.validFrom,
      validTill: editForm.validTill,
      images: editForm.images || [],
    };
    // Convert datetime-local to ISO string
    if (payload.validFrom) payload.validFrom = new Date(payload.validFrom).toISOString();
    if (payload.validTill) payload.validTill = new Date(payload.validTill).toISOString();
    if (editForm.termsConditions) payload.termsConditions = editForm.termsConditions;
    if (editForm.maxRedemptions)  payload.maxRedemptions  = parseInt(editForm.maxRedemptions);
    if (editForm.priority)        payload.priority        = parseInt(editForm.priority);
    if (editForm.tags)            payload.tags            = editForm.tags.split(",").map((t) => t.trim()).filter(Boolean);
    payload.targetAudience = {
      customerType: editForm.targetAudience.customerType,
      locations: editForm.targetAudience.locations
        ? editForm.targetAudience.locations.split(",").map((l) => l.trim()).filter(Boolean)
        : [],
    };
    try {
      await updateOffer({ id, ...payload }).unwrap();
      setSuccess("Offer updated successfully.");
      setEditing(false);
      refetch();
    } catch (err) {
      setError(err?.data?.message || "Update failed");
    }
  };

  const handleStatusUpdate = async () => {
    setError(""); setSuccess("");
    const body = {};
    if (statusForm.status)       body.status      = statusForm.status;
    if (statusForm.isPublished !== "") body.isPublished = statusForm.isPublished === "true";
    if (!Object.keys(body).length) return;
    try {
      await updateStatus({ id, ...body }).unwrap();
      setSuccess("Status updated successfully.");
      setStatusForm({ status: "", isPublished: "" });
      refetch();
    } catch (err) {
      setError(err?.data?.message || "Status update failed");
    }
  };

  if (isLoading) return (
    <div className="max-w-3xl mx-auto space-y-4">
      {Array(4).fill(0).map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
    </div>
  );

  if (isError || !offer) return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/dashboard/offers" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
          <BackIcon />
        </Link>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
        <p className="text-gray-300 text-sm">Offer not found or failed to load.</p>
        <button onClick={refetch} className="mt-3 text-xs text-indigo-600 hover:underline">Try again</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/offers" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
          <BackIcon />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-gray-900 truncate">{offer.title}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[offer.status] || "bg-gray-100 text-gray-500"}`}>
              {offer.status}
            </span>
            {offer.isPublished && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600">Published</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">#{offer._id}</p>
        </div>
        <button onClick={startEdit}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl transition">
          Edit
        </button>
      </div>

      {error   && <div className="px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">⚠️ {error}</div>}
      {success && <div className="px-4 py-3 bg-green-50 border border-green-100 text-green-600 text-sm rounded-xl">✅ {success}</div>}

      {/* Images Gallery */}
      {offer.images?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Images</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {offer.images.map((url, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-gray-100 aspect-video bg-gray-50">
                <img src={url} alt={`offer-${i}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Views",        value: analytics.views },
            { label: "Redemptions",  value: analytics.redemptions },
            { label: "Shares",       value: analytics.shares },
          ].map((a) => (
            <div key={a.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{a.value ?? 0}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Offer Info + Status Update */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Offer Details</p>
          <div className="space-y-2">
            {[
              ["Category",        offer.category],
              ["Type",            offer.type],
              ["Original Price",  `${offer.price?.original} ${offer.price?.currency}`],
              ["Discounted",      offer.price?.discounted ? `${offer.price.discounted} ${offer.price?.currency}` : "—"],
              ["Valid From",      offer.validFrom ? new Date(offer.validFrom).toLocaleDateString() : "—"],
              ["Valid Till",      offer.validTill ? new Date(offer.validTill).toLocaleDateString() : "—"],
              ["Max Redemptions", offer.maxRedemptions ?? "Unlimited"],
              ["Priority",        offer.priority ?? 0],
              ["Published",       offer.isPublished ? "Yes" : "No"],
              ["Created By",      offer.createdBy?.name],
              ["Audience",        offer.targetAudience?.customerType],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-2 text-sm py-1 border-b border-gray-50 last:border-0">
                <span className="text-gray-400 flex-shrink-0">{label}</span>
                <span className="text-gray-700 font-medium text-right">{value || "—"}</span>
              </div>
            ))}
            {offer.targetAudience?.locations?.length > 0 && (
              <div className="text-sm py-1">
                <span className="text-gray-400 text-xs">Locations</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {offer.targetAudience.locations.map((l, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{l}</span>
                  ))}
                </div>
              </div>
            )}
            {offer.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {offer.tags.map((t, i) => (
                  <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs">{t}</span>
                ))}
              </div>
            )}
            {offer.description && (
              <div className="pt-2 border-t border-gray-50">
                <p className="text-xs text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-600">{offer.description}</p>
              </div>
            )}
            {offer.termsConditions && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Terms & Conditions</p>
                <p className="text-xs text-gray-500">{offer.termsConditions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Update */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Update Status</p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select value={statusForm.status} onChange={(e) => setStatusForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
              <option value="">— Keep current ({offer.status}) —</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Published</label>
            <select value={statusForm.isPublished} onChange={(e) => setStatusForm((f) => ({ ...f, isPublished: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
              <option value="">— Keep current ({offer.isPublished ? "Published" : "Unpublished"}) —</option>
              <option value="true">Publish</option>
              <option value="false">Unpublish</option>
            </select>
          </div>
          <button onClick={handleStatusUpdate} disabled={statusUpdating || (!statusForm.status && statusForm.isPublished === "")}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50">
            {statusUpdating ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Recent Activity</p>
          <div className="space-y-2">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0 text-sm">
                <p className="text-gray-600 text-xs">{a.description || JSON.stringify(a)}</p>
                <p className="text-xs text-gray-400 flex-shrink-0">
                  {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Redemptions */}
      {redemptions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700">Redemptions</p>
            {redemPagination && (
              <p className="text-xs text-gray-400">{redemPagination.totalRecords} total</p>
            )}
          </div>
          <div className="space-y-2">
            {redemptions.map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800">{r.customer?.name || "—"}</p>
                  <p className="text-xs text-gray-400">{r.customer?.phone}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-mono text-xs font-semibold text-indigo-600">{r.redemptionCode}</p>
                  <div className="flex items-center gap-1.5 justify-end mt-0.5">
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium
                      ${r.status === "USED" ? "bg-gray-100 text-gray-500" : r.status === "EXPIRED" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>
                      {r.status}
                    </span>
                    <p className="text-xs text-gray-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0"
          onClick={() => setEditing(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-50 sticky top-0 bg-white z-10">
              <p className="font-bold text-gray-800">Edit Offer</p>
              <button onClick={() => setEditing(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <EF label="Title" value={editForm.title} onChange={(v) => setEditForm((f) => ({ ...f, title: v }))} />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} rows={2}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ESF label="Category" value={editForm.category} onChange={(v) => setEditForm((f) => ({ ...f, category: v }))} options={CATEGORIES} />
                <ESF label="Type" value={editForm.type} onChange={(v) => setEditForm((f) => ({ ...f, type: v }))} options={TYPES} />
              </div>

              {/* Images */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Images</label>
                <ImageUploader
                  images={editForm.images || []}
                  onChange={(imgs) => setEditForm((f) => ({ ...f, images: imgs }))}
                  maxImages={5}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <EF label="Original" value={editForm.price?.original} onChange={(v) => setEditForm((f) => ({ ...f, price: { ...f.price, original: v } }))} type="number" />
                <EF label="Discounted" value={editForm.price?.discounted} onChange={(v) => setEditForm((f) => ({ ...f, price: { ...f.price, discounted: v } }))} type="number" />
                <EF label="Currency" value={editForm.price?.currency} onChange={(v) => setEditForm((f) => ({ ...f, price: { ...f.price, currency: v } }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Valid From</label>
                  <input type="datetime-local" value={editForm.validFrom || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, validFrom: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Valid Till</label>
                  <input type="datetime-local" value={editForm.validTill || ""}
                    min={editForm.validFrom || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, validTill: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  {editForm.validFrom && editForm.validTill && editForm.validTill <= editForm.validFrom && (
                    <p className="text-xs text-red-500 mt-1">Must be after Valid From</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Terms & Conditions</label>
                <textarea value={editForm.termsConditions || ""} onChange={(e) => setEditForm((f) => ({ ...f, termsConditions: e.target.value }))} rows={2}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
              </div>
              <EF label="Tags (comma separated)" value={editForm.tags} onChange={(v) => setEditForm((f) => ({ ...f, tags: v }))} />
              <div className="grid grid-cols-2 gap-3">
                <EF label="Max Redemptions" value={editForm.maxRedemptions} onChange={(v) => setEditForm((f) => ({ ...f, maxRedemptions: v }))} type="number" />
                <EF label="Priority" value={editForm.priority} onChange={(v) => setEditForm((f) => ({ ...f, priority: v }))} type="number" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ESF label="Target Audience" value={editForm.targetAudience?.customerType} onChange={(v) => setEditForm((f) => ({ ...f, targetAudience: { ...f.targetAudience, customerType: v } }))} options={AUDIENCE_TYPES} />
                <EF label="Locations (comma)" value={editForm.targetAudience?.locations} onChange={(v) => setEditForm((f) => ({ ...f, targetAudience: { ...f.targetAudience, locations: v } }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={updating}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function EF({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
    </div>
  );
}
function ESF({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
function BackIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>; }
