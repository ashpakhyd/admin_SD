"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForgotPasswordMutation } from "@/store/services/authApi";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      const res = await forgotPassword({ phone }).unwrap();
      setSuccess(res.message || "OTP sent to your phone.");
      setTimeout(() => router.push(`/reset-password?phone=${phone}`), 1500);
    } catch (err) {
      setError(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-xl font-bold text-white">Forgot Password</h1>
          <p className="text-indigo-300 text-sm mt-0.5">We'll send an OTP to your phone</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">⚠️ {error}</div>}
          {success && <div className="mb-4 px-4 py-3 bg-green-50 border border-green-100 text-green-600 text-sm rounded-xl">✅ {success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="9876543210"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent" />
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 active:scale-95">
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            <Link href="/login" className="text-indigo-600 font-medium hover:underline">← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
