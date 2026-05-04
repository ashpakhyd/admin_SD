"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCreateOfferMutation } from "@/store/services/offersApi";
import ImageUploader from "@/components/ui/ImageUploader";

const CATEGORIES     = ["PRODUCT", "SERVICE", "DISCOUNT"];
const TYPES          = ["OFFER", "PRODUCT"];
const AUDIENCE_TYPES = ["ALL", "VERIFIED", "PREMIUM"];

export default function NewOfferPage() {
  const router = useRouter();
  const [createOffer, { isLoading }] = useCreateOfferMutation();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", category: "DISCOUNT", type: "OFFER",
    price: { original: "", discounted: "", currency: "PKR" },
    validFrom: "", validTill: "",
    termsConditions: "", maxRedemptions: "",
    targetAudience: { customerType: "ALL", locations: "" },
    tags: "", priority: "",
    images: [],
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setPrice = (k, v) => setForm((f) => ({ ...f, price: { ...f.price, [k]: v } }));
  const setAudience = (k, v) => setForm((f) => ({ ...f, targetAudience: { ...f.targetAudience, [k]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side date validation
    if (form.validFrom && form.validTill && form.validTill <= form.validFrom) {
      setError("Valid Till must be after Valid From.");
      return;
    }

    const payload = {
      title: form.title, description: form.description,
      category: form.category, type: form.type,
      price: {
        original: parseFloat(form.price.original),
        currency: form.price.currency || "PKR",
        ...(form.price.discounted ? { discounted: parseFloat(form.price.discounted) } : {}),
      },
      validFrom: form.validFrom, validTill: form.validTill,
    };
    // Convert datetime-local to ISO string
    if (payload.validFrom) payload.validFrom = new Date(payload.validFrom).toISOString();
    if (payload.validTill) payload.validTill = new Date(payload.validTill).toISOString();
    if (form.images.length)      payload.images = form.images;
    if (form.termsConditions)    payload.termsConditions = form.termsConditions;
    if (form.maxRedemptions)     payload.maxRedemptions = parseInt(form.maxRedemptions);
    if (form.priority)           payload.priority = parseInt(form.priority);
    if (form.tags)               payload.tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    payload.targetAudience = {
      customerType: form.targetAudience.customerType,
      locations: form.targetAudience.locations
        ? form.targetAudience.locations.split(",").map((l) => l.trim()).filter(Boolean)
        : [],
    };
    try {
      await createOffer(payload).unwrap();
      router.push("/dashboard/offers");
    } catch (err) {
      setError(err?.data?.message || "Failed to create offer");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/offers" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
          <BackIcon />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900">New Offer</h1>
          <p className="text-xs text-gray-400">Create a new offer or product</p>
        </div>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">⚠️ {error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic */}
        <Section title="Basic Info">
          <Field label="Title *" value={form.title} onChange={(v) => set("title", v)} placeholder="Summer Sale" required />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} required rows={3}
              placeholder="Describe the offer..."
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Category *" value={form.category} onChange={(v) => set("category", v)} options={CATEGORIES} />
            <SelectField label="Type *" value={form.type} onChange={(v) => set("type", v)} options={TYPES} />
          </div>
        </Section>

        {/* Images */}
        <Section title="Images (Optional)">
          <ImageUploader
            images={form.images}
            onChange={(imgs) => set("images", imgs)}
            maxImages={5}
          />
        </Section>

        {/* Price */}
        <Section title="Pricing">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Original Price *" value={form.price.original} onChange={(v) => setPrice("original", v)} placeholder="1000" type="number" required />
            <Field label="Discounted Price" value={form.price.discounted} onChange={(v) => setPrice("discounted", v)} placeholder="500" type="number" />
            <Field label="Currency" value={form.price.currency} onChange={(v) => setPrice("currency", v)} placeholder="PKR" />
          </div>
        </Section>

        {/* Validity */}
        <Section title="Validity">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Valid From *</label>
              <input type="datetime-local" value={form.validFrom} required
                onChange={(e) => set("validFrom", e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Valid Till *</label>
              <input type="datetime-local" value={form.validTill} required
                min={form.validFrom || ""}
                onChange={(e) => set("validTill", e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              {form.validFrom && form.validTill && form.validTill <= form.validFrom && (
                <p className="text-xs text-red-500 mt-1">Must be after Valid From</p>
              )}
            </div>
          </div>
        </Section>

        {/* Optional */}
        <Section title="Optional Settings">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Terms & Conditions</label>
            <textarea value={form.termsConditions} onChange={(e) => set("termsConditions", e.target.value)} rows={2}
              placeholder="Terms and conditions..."
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Max Redemptions" value={form.maxRedemptions} onChange={(v) => set("maxRedemptions", v)} placeholder="100 (blank = unlimited)" type="number" />
            <Field label="Priority" value={form.priority} onChange={(v) => set("priority", v)} placeholder="0" type="number" />
          </div>
          <Field label="Tags (comma separated)" value={form.tags} onChange={(v) => set("tags", v)} placeholder="sale, discount, summer" />
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Target Audience" value={form.targetAudience.customerType} onChange={(v) => setAudience("customerType", v)} options={AUDIENCE_TYPES} />
            <Field label="Locations (comma separated)" value={form.targetAudience.locations} onChange={(v) => setAudience("locations", v)} placeholder="Pune, Mumbai" />
          </div>
        </Section>

        <div className="flex gap-3">
          <Link href="/dashboard/offers"
            className="flex-1 py-3 text-center rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </Link>
          <button type="submit" disabled={isLoading}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
            {isLoading ? "Creating..." : "Create Offer"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</p>
      {children}
    </div>
  );
}
function Field({ label, value, onChange, placeholder, type = "text", required, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
    </div>
  );
}
function SelectField({ label, value, onChange, options }) {
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
