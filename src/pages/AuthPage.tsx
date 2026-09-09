import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password, phone);
      }
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#FBFBFA]">
      <div className="w-full max-w-md bg-white border border-[#E8E6E1] p-8 shadow-sm rounded-none">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-[#6E706E] font-mono">Nirvana Republic</p>
          <h1 className="text-2xl font-serif text-[#1C201D] mt-2 font-normal">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-[#E8E6E1] mb-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(""); }}
            className={`flex-1 pb-3 text-center transition-colors ${
              isLogin ? "border-b-2 border-[#1C201D] text-[#1C201D]" : "text-[#8C8F8A] hover:text-[#1C201D]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(""); }}
            className={`flex-1 pb-3 text-center transition-colors ${
              !isLogin ? "border-b-2 border-[#1C201D] text-[#1C201D]" : "text-[#8C8F8A] hover:text-[#1C201D]"
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 bg-[#FDF2F2] border border-[#F8B4B4] text-xs text-[#9B1C1C]">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#6E706E] mb-1 font-mono">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D5D3CC] text-sm focus:outline-none focus:border-[#1C201D]"
                  placeholder="Amara Sen"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#6E706E] mb-1 font-mono">Phone (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D5D3CC] text-sm focus:outline-none focus:border-[#1C201D]"
                  placeholder="+91 98765 43210"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#6E706E] mb-1 font-mono">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-[#D5D3CC] text-sm focus:outline-none focus:border-[#1C201D]"
              placeholder="you@domain.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#6E706E] mb-1 font-mono">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[#D5D3CC] text-sm focus:outline-none focus:border-[#1C201D]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 mt-4 bg-[#1C201D] hover:bg-[#2F3430] text-white text-xs uppercase tracking-widest transition-colors font-medium disabled:opacity-50"
          >
            {submitting ? "Authenticating..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;