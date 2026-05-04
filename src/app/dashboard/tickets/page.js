"use client";
import { useState } from "react";
import Link from "next/link";
import { useGetTicketsQuery, useDeleteTicketMutation } from "@/store/services/ticketsApi";

// ─── Config ───────────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    name: "Electrician",
    icon: "/icons/electrician.png",
    color: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-100",
    badge: "bg-amber-100 text-amber-700",
    appliances: [
      { name: "Wiring & Installation", icon: "/icons/wiring.png" },
      { name: "Electrical Repair",     icon: "/icons/electricalRepair.png" },
      { name: "Lighting Solutions",    icon: "/icons/lightingSolutions.png" },
      { name: "Fan Installation",      icon: "/icons/fan.png" },
      { name: "Other",                 icon: "/icons/other.png" },
    ],
  },
  {
    name: "Appliances Repair",
    icon: "/icons/appliances.png",
    color: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100",
    badge: "bg-blue-100 text-blue-700",
    appliances: [
      { name: "Washing Machine", icon: "/icons/washing-machine.png" },
      { name: "Refrigerator",    icon: "/icons/refrigerator.png" },
      { name: "Microwave",       icon: "/icons/microwaves.png" },
      { name: "Dishwasher",      icon: "/icons/dishwasher .png" },
      { name: "Air Conditioner", icon: "/icons/airConditioner.png" },
      { name: "Television",      icon: "/icons/television .png" },
      { name: "AC Repair",       icon: "/icons/airConditioner.png" },
      { name: "Other",           icon: "/icons/other.png" },
    ],
  },
  {
    name: "Car Service",
    icon: "/icons/car-service.png",
    color: "bg-green-50 border-green-100",
    iconBg: "bg-green-100",
    badge: "bg-green-100 text-green-700",
    appliances: [],
  },
];

const STATUS_COLORS = {
  NEW:         "bg-blue-50 text-blue-600",
  ASSIGNED:    "bg-violet-50 text-violet-600",
  IN_PROGRESS: "bg-amber-50 text-amber-600",
  RESOLVED:    "bg-green-50 text-green-600",
  CLOSED:      "bg-gray-100 text-gray-500",
  CANCELLED:   "bg-red-50 text-red-500",
};

const PRIORITY_COLORS = {
  LOW:    "bg-gray-100 text-gray-500",
  MEDIUM: "bg-amber-50 text-amber-600",
  HIGH:   "bg-red-50 text-red-500",
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function TicketsPage() {
  const { data: tickets = [], isLoading } = useGetTicketsQuery();
  const [deleteTicket, { isLoading: deleting }] = useDeleteTicketMutation();
  const [selectedCategory, setSelectedCategory] = useState(null); // category object
  const [selectedAppliance, setSelectedAppliance] = useState(null); // string
  const [confirmId, setConfirmId] = useState(null);

  const handleDelete = async (id) => {
    await deleteTicket(id);
    setConfirmId(null);
  };

  // ── Level 1: Category list ──────────────────────────────────────────────────
  if (!selectedCategory) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Tickets</h1>
            <p className="text-xs text-gray-400 mt-0.5">{tickets.length} total tickets</p>
          </div>
          <Link href="/dashboard/tickets/new"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition active:scale-95">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            New Ticket
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {(() => {
              const knownCategories = CATEGORIES.filter(c => c.name !== "Other").map(c => c.name.toLowerCase());
              const otherCount = tickets.filter(t => !knownCategories.includes(t.serviceCategory?.toLowerCase())).length;
              const categoriesWithOther = [
                ...CATEGORIES.filter(c => c.name !== "Other"),
                { name: "Other", icon: "/icons/other.png", color: "bg-gray-50 border-gray-100", iconBg: "bg-gray-100", badge: "bg-gray-100 text-gray-600", appliances: [], _isOther: true },
              ];
              return categoriesWithOther.map((cat) => {
                const count = cat._isOther
                  ? otherCount
                  : tickets.filter((t) => t.serviceCategory?.toLowerCase() === cat.name.toLowerCase()).length;
                if (count === 0) return null;
                return (
                <button key={cat.name} onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition active:scale-95 hover:shadow-sm ${cat.color}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.iconBg}`}>
                    <img src={cat.icon} alt={cat.name} className="w-7 h-7 object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{cat.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {cat.appliances.length > 0 ? `${cat.appliances.length} appliance types` : "General service"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${cat.badge}`}>{count}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </button>
                );
              });
            })()}
          </div>
        )}
      </div>
    );
  }

  // ── Level 2: Appliance list ─────────────────────────────────────────────────
  const categoryTickets = selectedCategory._isOther
    ? tickets.filter((t) => {
        const known = CATEGORIES.filter(c => c.name !== "Other").map(c => c.name.toLowerCase());
        return !known.includes(t.serviceCategory?.toLowerCase());
      })
    : tickets.filter((t) =>
        t.serviceCategory?.toLowerCase() === selectedCategory.name.toLowerCase()
      );

  if (!selectedAppliance) {
    // If no appliances defined, skip to level 3 directly
    if (selectedCategory.appliances.length === 0) {
      return (
        <TicketsList
          tickets={categoryTickets}
          title={selectedCategory.name}
          subtitle={`${categoryTickets.length} tickets`}
          onBack={() => setSelectedCategory(null)}
          onDelete={setConfirmId}
          confirmId={confirmId}
          deleting={deleting}
          onConfirmDelete={handleDelete}
          onCancelDelete={() => setConfirmId(null)}
        />
      );
    }

    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedCategory(null)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span>Tickets</span>
              <span>›</span>
              <span className="text-gray-700 font-medium">{selectedCategory.name}</span>
            </div>
            <p className="text-xs text-gray-400">{categoryTickets.length} tickets total</p>
          </div>
        </div>

        <div className="space-y-3">
          {(() => {
            const knownAppliances = selectedCategory.appliances
              .filter(a => a.name !== "Other").map(a => a.name.toLowerCase());
            const appliancesWithOther = selectedCategory.appliances.some(a => a.name === "Other")
              ? selectedCategory.appliances
              : [...selectedCategory.appliances, { name: "Other", icon: "/icons/other.png" }];
            return appliancesWithOther.map((appliance) => {
              const isOther = appliance.name === "Other";
              const count = isOther
                ? categoryTickets.filter(t => !knownAppliances.includes(t.appliance?.toLowerCase())).length
                : categoryTickets.filter((t) => t.appliance?.toLowerCase() === appliance.name.toLowerCase()).length;
              if (count === 0) return null;
              return (
                <button key={appliance.name} onClick={() => setSelectedAppliance(appliance.name)}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 text-left transition hover:shadow-sm active:scale-95">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedCategory.iconBg}`}>
                    <img src={appliance.icon} alt={appliance.name} className="w-6 h-6 object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{appliance.name}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${selectedCategory.badge}`}>{count}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </button>
              );
            });
          })()}
        </div>
      </div>
    );
  }

  // ── Level 3: Tickets list ───────────────────────────────────────────────────
  const knownAppliances = selectedCategory.appliances
    .filter(a => a.name !== "Other").map(a => a.name.toLowerCase());
  const applianceTickets = selectedAppliance === "Other"
    ? categoryTickets.filter(t => !knownAppliances.includes(t.appliance?.toLowerCase()))
    : categoryTickets.filter((t) => t.appliance?.toLowerCase() === selectedAppliance.toLowerCase());

  return (
    <>
      <TicketsList
        tickets={applianceTickets}
        title={selectedAppliance}
        subtitle={`${selectedCategory.name} · ${applianceTickets.length} tickets`}
        onBack={() => setSelectedAppliance(null)}
        onDelete={setConfirmId}
        confirmId={confirmId}
        deleting={deleting}
        onConfirmDelete={handleDelete}
        onCancelDelete={() => setConfirmId(null)}
        breadcrumb={[
          { label: "Tickets", onClick: () => { setSelectedCategory(null); setSelectedAppliance(null); } },
          { label: selectedCategory.name, onClick: () => setSelectedAppliance(null) },
          { label: selectedAppliance },
        ]}
      />
    </>
  );
}

// ─── Tickets List Component ────────────────────────────────────────────────────
function TicketsList({ tickets, title, subtitle, onBack, onDelete, confirmId, deleting, onConfirmDelete, onCancelDelete, breadcrumb }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const STATUSES = ["ALL", "NEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "CANCELLED"];

  const filtered = tickets.filter((t) => {
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || t.title?.toLowerCase().includes(q)
      || t.customer?.name?.toLowerCase().includes(q)
      || t.customer?.phone?.includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        </button>
        <div className="flex-1 min-w-0">
          {breadcrumb && (
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-0.5 flex-wrap">
              {breadcrumb.map((b, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span>›</span>}
                  {b.onClick
                    ? <button onClick={b.onClick} className="hover:text-indigo-600 transition">{b.label}</button>
                    : <span className="text-gray-700 font-medium">{b.label}</span>}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-base font-bold text-gray-900 truncate">{title}</h1>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        <Link href="/dashboard/tickets/new"
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl transition active:scale-95">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          New
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <input type="text" placeholder="Search title, customer..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                ${statusFilter === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center text-gray-300 text-sm">
          No tickets found
        </div>
      )}

      {/* Mobile Cards */}
      {filtered.length > 0 && (
        <>
          <div className="md:hidden space-y-3">
            {filtered.map((t) => (
              <div key={t._id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link href={`/dashboard/tickets/${t._id}`}
                    className="font-semibold text-gray-800 text-sm hover:text-indigo-600 leading-snug">
                    {t.title}
                  </Link>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_COLORS[t.status] || "bg-gray-100 text-gray-500"}`}>
                    {t.status}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>👤 {t.customer?.name || "—"} · {t.customer?.phone || ""}</p>
                  <p>🔧 {t.technician?.name || "Unassigned"}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[t.priority] || "bg-gray-100 text-gray-500"}`}>
                      {t.priority || "—"}
                    </span>
                    <span className="capitalize">{t.timeSlot}</span>
                    <span className="ml-auto text-gray-300">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ""}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                  <Link href={`/dashboard/tickets/${t._id}`}
                    className="flex-1 py-2 text-center text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">
                    View Details
                  </Link>
                  <button onClick={() => onDelete(t._id)}
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
                  <th className="text-left px-5 py-3 font-medium">Title</th>
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 font-medium">Technician</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Priority</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3.5">
                      <Link href={`/dashboard/tickets/${t._id}`} className="font-medium text-gray-800 hover:text-indigo-600">{t.title}</Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-gray-700">{t.customer?.name || "—"}</p>
                      <p className="text-xs text-gray-400">{t.customer?.phone}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{t.technician?.name || <span className="text-gray-300">Unassigned</span>}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[t.status] || "bg-gray-100 text-gray-500"}`}>{t.status}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[t.priority] || "bg-gray-100 text-gray-500"}`}>{t.priority || "—"}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/tickets/${t._id}`} className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </Link>
                        <button onClick={() => onDelete(t._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete Ticket?</h3>
            <p className="text-sm text-gray-400 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={onCancelDelete}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={() => onConfirmDelete(confirmId)} disabled={deleting}
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
