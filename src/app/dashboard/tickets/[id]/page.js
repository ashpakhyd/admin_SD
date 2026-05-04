"use client";
import { useState } from "react";
import { use } from "react";
import Link from "next/link";
import { useGetTicketQuery, useAssignTechnicianMutation } from "@/store/services/ticketsApi";
import { useGetTechniciansQuery } from "@/store/services/techniciansApi";

const STATUS_COLORS = {
  NEW:         "bg-blue-50 text-blue-600",
  ASSIGNED:    "bg-violet-50 text-violet-600",
  IN_PROGRESS: "bg-amber-50 text-amber-600",
  RESOLVED:    "bg-green-50 text-green-600",
  CLOSED:      "bg-gray-100 text-gray-500",
  CANCELLED:   "bg-red-50 text-red-500",
};

export default function TicketDetailPage({ params }) {
  const { id } = use(params);
  const { data: ticket, isLoading } = useGetTicketQuery(id);
  const { data: technicians = [] } = useGetTechniciansQuery();
  const [assignTechnician, { isLoading: assigning }] = useAssignTechnicianMutation();
  const [selectedTech, setSelectedTech] = useState("");
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  const handleAssign = async () => {
    if (!selectedTech) return;
    setAssignError(""); setAssignSuccess("");
    try {
      await assignTechnician({ id, technicianId: selectedTech }).unwrap();
      setAssignSuccess("Technician assigned successfully.");
      setSelectedTech("");
    } catch (err) {
      setAssignError(err?.data?.message || "Assignment failed");
    }
  };

  if (isLoading) return (
    <div className="max-w-3xl mx-auto space-y-4">
      {Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
    </div>
  );

  if (!ticket) return (
    <div className="text-center py-20 text-gray-300">Ticket not found</div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/tickets" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
          <BackIcon />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-gray-900 truncate">{ticket.title}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status] || "bg-gray-100 text-gray-500"}`}>
              {ticket.status}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">#{ticket._id}</p>
        </div>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard title="Ticket Details">
          <Row label="Appliance" value={ticket.appliance} />
          <Row label="Issue" value={ticket.issue} />
          <Row label="Category" value={ticket.serviceCategory} />
          <Row label="Priority" value={ticket.priority} />
          <Row label="Urgency" value={ticket.urgency} />
          <Row label="Time Slot" value={ticket.timeSlot} capitalize />
          <Row label="Address" value={ticket.address} />
          {ticket.houseDetails && <Row label="House" value={ticket.houseDetails} />}
          {ticket.description && <Row label="Description" value={ticket.description} />}
          <Row label="Created" value={ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "—"} />
        </InfoCard>

        {/* Attachments */}
        {ticket.attachments?.length > 0 && (
          <InfoCard title="Attachments">
            <div className="grid grid-cols-2 gap-2">
              {ticket.attachments.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer"
                  className="rounded-xl overflow-hidden border border-gray-100 aspect-video bg-gray-50 block">
                  <img src={url} alt={`attachment-${i}`} className="w-full h-full object-cover hover:opacity-90 transition" />
                </a>
              ))}
            </div>
          </InfoCard>
        )}

        <div className="space-y-4">
          <InfoCard title="Customer">
            <Row label="Name" value={ticket.customer?.name} />
            <Row label="Phone" value={ticket.customer?.phone} />
            {ticket.alternatePhone && <Row label="Alt Phone" value={ticket.alternatePhone} />}
          </InfoCard>

          <InfoCard title="Technician">
            {ticket.technician ? (
              <>
                <Row label="Name" value={ticket.technician.name} />
                <Row label="Phone" value={ticket.technician.phone} />
                {ticket.technician.experience && <Row label="Experience" value={ticket.technician.experience} />}
                {ticket.technician.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ticket.technician.skills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full">{s}</span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-300">Not assigned yet</p>
            )}
          </InfoCard>

          {/* OTPs — only show when relevant */}
          {ticket.otp && (
            <InfoCard title="OTP">
              <Row label="Start OTP" value={ticket.otp} />
              {ticket.finalOTP && <Row label="Completion OTP" value={ticket.finalOTP} />}
            </InfoCard>
          )}

          {/* Rating */}
          {ticket.rating && (
            <InfoCard title="Rating">
              <Row label="Stars" value={`${"★".repeat(ticket.rating.rating)}${"☆".repeat(5 - ticket.rating.rating)}`} />
              {ticket.rating.feedback && <Row label="Feedback" value={ticket.rating.feedback} />}
              <Row label="Date" value={new Date(ticket.rating.createdAt).toLocaleDateString()} />
            </InfoCard>
          )}
        </div>
      </div>

      {/* Assign Technician */}
      {(ticket.status === "NEW" || ticket.status === "ASSIGNED") && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Assign Technician</p>
          {assignError && <p className="text-xs text-red-500 mb-2">{assignError}</p>}
          {assignSuccess && <p className="text-xs text-green-600 mb-2">{assignSuccess}</p>}
          <div className="flex gap-3">
            <select value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
              <option value="">Select technician...</option>
              {technicians.filter((t) => t.isActive && t.isVerified).map((t) => (
                <option key={t._id} value={t._id}>{t.name} — {t.phone}</option>
              ))}
            </select>
            <button onClick={handleAssign} disabled={!selectedTech || assigning}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50">
              {assigning ? "Assigning..." : "Assign"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value, capitalize }) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-gray-400 flex-shrink-0">{label}</span>
      <span className={`text-gray-800 font-medium text-right ${capitalize ? "capitalize" : ""}`}>{value || "—"}</span>
    </div>
  );
}

function BackIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>;
}
