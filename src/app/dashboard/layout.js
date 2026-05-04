"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/dashboard/tickets": "Tickets",
  "/dashboard/tickets/new": "New Ticket",
  "/dashboard/technicians": "Technicians",
  "/dashboard/customers": "Customers",
  "/dashboard/offers": "Offers",
  "/dashboard/offers/new": "New Offer",
  "/dashboard/offers/redemptions": "Redemptions",
  "/dashboard/ratings": "Ratings",
  "/dashboard/register": "Register User",
};

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const user = useSelector((s) => s.auth.user);
  const title = PAGE_TITLES[pathname] ||
    (pathname.startsWith("/dashboard/tickets/") ? "Ticket Detail" :
     pathname.startsWith("/dashboard/offers/") ? "Offer Detail" : "Dashboard");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 transition-transform duration-200
        lg:relative lg:translate-x-0 lg:flex lg:flex-shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-4 bg-white border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900">{title}</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Store Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name || "Admin"}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
