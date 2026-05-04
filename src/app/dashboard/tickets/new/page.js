"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCreateTicketMutation } from "@/store/services/ticketsApi";
import ImageUploader from "@/components/ui/ImageUploader";

const TIME_SLOTS  = ["morning", "afternoon", "evening"];
const PRIORITIES  = ["LOW", "MEDIUM", "HIGH"];
const URGENCIES   = ["normal", "urgent"];

const SERVICE_CATEGORIES = ["Electrician", "Appliances Repair", "Car Service", "Other"];

const APPLIANCES_BY_CATEGORY = {
  "Electrician":       ["Wiring & Installation", "Electrical Repair", "Lighting Solutions", "Fan Installation", "Other"],
  "Appliances Repair": ["Washing Machine", "Refrigerator", "Microwave", "Dishwasher", "Air Conditioner", "Television", "AC Repair", "Other"],
  "Car Service":       ["Other"],
  "Other":             ["Other"],
};

export default function NewTicketPage() {
  const router = useRouter();
  const [createTicket, { isLoading }] = useCreateTicketMutation();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", appliance: "", issue: "", serviceCategory: "Electrician", address: "",
    timeSlot: "morning", description: "", priority: "MEDIUM", urgency: "normal",
    alternatePhone: "", houseDetails: "", latitude: "", longitude: "", customerId: "",
    attachments: [],
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCategoryChange = (v) => {
    const appliances = APPLIANCES_BY_CATEGORY[v] || ["Other"];
    setForm((f) => ({ ...f, serviceCategory: v, appliance: appliances[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = { ...form };
    if (payload.latitude)  payload.latitude  = parseFloat(payload.latitude);
    if (payload.longitude) payload.longitude = parseFloat(payload.longitude);
    Object.keys(payload).forEach((k) => { if (payload[k] === "") delete payload[k]; });
    try {
      await createTicket(payload).unwrap();
      router.push("/dashboard/tickets");
    } catch (err) {
      setError(err?.data?.message || "Failed to create ticket");
    }
  };

  const applianceOptions = APPLIANCES_BY_CATEGORY[form.serviceCategory] || ["Other"];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/tickets" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
          <BackIcon />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900">New Ticket</h1>
          <p className="text-xs text-gray-400">Create a new service ticket</p>
        </div>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">⚠️ {error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Required */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Required Details</p>

          <Field label="Title *" value={form.title} onChange={(v) => set("title", v)} placeholder="AC Repair" required />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label="Service Category *" value={form.serviceCategory} onChange={handleCategoryChange} options={SERVICE_CATEGORIES} />
            <SelectField label="Appliance *" value={form.appliance} onChange={(v) => set("appliance", v)} options={applianceOptions} />
          </div>

          <Field label="Issue *" value={form.issue} onChange={(v) => set("issue", v)} placeholder="Not cooling" required />
          <Field label="Address *" value={form.address} onChange={(v) => set("address", v)} placeholder="123 Main St, Pune" required />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectField label="Time Slot *" value={form.timeSlot} onChange={(v) => set("timeSlot", v)} options={TIME_SLOTS} />
            <SelectField label="Priority" value={form.priority} onChange={(v) => set("priority", v)} options={PRIORITIES} />
            <SelectField label="Urgency" value={form.urgency} onChange={(v) => set("urgency", v)} options={URGENCIES} />
          </div>
        </div>

        {/* Optional */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Optional Details</p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              rows={3} placeholder="Additional details..."
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Alternate Phone" value={form.alternatePhone} onChange={(v) => set("alternatePhone", v)} placeholder="9876543210" />
            <Field label="House Details" value={form.houseDetails} onChange={(v) => set("houseDetails", v)} placeholder="Flat 4B" />
            <Field label="Latitude" value={form.latitude} onChange={(v) => set("latitude", v)} placeholder="18.5204" type="number" />
            <Field label="Longitude" value={form.longitude} onChange={(v) => set("longitude", v)} placeholder="73.8567" type="number" />
            <Field label="Customer ID" value={form.customerId} onChange={(v) => set("customerId", v)} placeholder="For creating on behalf" className="sm:col-span-2" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Attachments (Optional)</label>
            <ImageUploader
              images={form.attachments}
              onChange={(imgs) => set("attachments", imgs)}
              maxImages={5}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard/tickets"
            className="flex-1 py-3 text-center rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </Link>
          <button type="submit" disabled={isLoading}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
            {isLoading ? "Creating..." : "Create Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", required, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required}
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
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function BackIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>;
}
