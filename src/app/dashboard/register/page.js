"use client";
import { useState } from "react";
import Link from "next/link";
import { useRegisterMutation } from "@/store/services/authApi";

const ROLES = ["CUSTOMER", "TECHNICIAN", "ADMIN"];

export default function RegisterUserPage() {
  const [register, { isLoading }] = useRegisterMutation();
  const [form, setForm] = useState({
    name: "", phone: "", password: "", role: "CUSTOMER",
    address: { house: "", colony: "", area: "", city: "", district: "", state: "", country: "India", pincode: "" },
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setAddr = (key, val) => setForm((f) => ({ ...f, address: { ...f.address, [key]: val } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const payload = { name: form.name, phone: form.phone, role: form.role };
    if (form.password) payload.password = form.password;
    if (form.role === "CUSTOMER") {
      const addr = form.address;
      if (Object.values(addr).some((v) => v)) payload.address = addr;
    }
    try {
      const res = await register(payload).unwrap();
      setSuccess(res.message || "Registered successfully. OTP sent.");
      setForm({ name: "", phone: "", password: "", role: "CUSTOMER",
        address: { house: "", colony: "", area: "", city: "", district: "", state: "", country: "India", pincode: "" } });
    } catch (err) {
      setError(err?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
          <BackIcon />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Register User</h1>
          <p className="text-xs text-gray-400">Create a new customer, technician or admin</p>
        </div>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">⚠️ {error}</div>}
      {success && <div className="px-4 py-3 bg-green-50 border border-green-100 text-green-600 text-sm rounded-xl">✅ {success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">User Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="Rahul Sharma"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
              <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} required placeholder="9876543210"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
              <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Optional"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role *</label>
              <select value={form.role} onChange={(e) => set("role", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        {form.role === "CUSTOMER" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Address (Optional)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[["house","House/Flat"],["colony","Colony"],["area","Area"],["city","City"],["district","District"],["state","State"],["country","Country"],["pincode","Pincode"]].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs text-gray-600 mb-1">{label}</label>
                  <input value={form.address[key]} onChange={(e) => setAddr(key, e.target.value)} placeholder={label}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" disabled={isLoading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
          {isLoading ? "Registering..." : "Register User"}
        </button>
      </form>
    </div>
  );
}

function BackIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>;
}
