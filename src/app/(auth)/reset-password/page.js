"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useResetPasswordMutation } from "@/store/services/authApi";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [form, setForm] = useState({ phone: "", otp: "", newPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const phone = searchParams.get("phone");
    if (phone) setForm((f) => ({ ...f, phone }));
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      const res = await resetPassword(form).unwrap();
      setSuccess(res.message || "Password reset successful.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(err?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6">
      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">⚠️ {error}</div>}
      {success && <div className="mb-4 px-4 py-3 bg-green-50 border border-green-100 text-green-600 text-sm rounded-xl">✅ {success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required placeholder="9876543210"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">OTP</label>
          <input type="text" inputMode="numeric" maxLength={6} value={form.otp}
            onChange={(e) => setForm({ ...form, otp: e.target.value })} required placeholder="123456"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 tracking-widest text-center font-bold text-lg" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password</label>
          <div className="relative">
            <input type={showPass ? "text" : "password"} value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10" />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPass
                ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              }
            </button>
          </div>
        </div>
        <button type="submit" disabled={isLoading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 active:scale-95">
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-5">
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">← Back to Login</Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-xl font-bold text-white">Reset Password</h1>
          <p className="text-indigo-300 text-sm mt-0.5">Enter OTP and your new password</p>
        </div>
        <Suspense fallback={<div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
