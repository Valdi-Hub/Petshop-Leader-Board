import React, { useState, useEffect } from "react";
import { Lock, User, Key, PawPrint, Eye, EyeOff, AlertCircle } from "lucide-react";

interface AuthLoginProps {
  onLoginSuccess: (token: string, user: { id: string; username: string; role: 'admin' | 'petshop' }, petshop: any) => void;
}

export default function AuthLogin({ onLoginSuccess }: AuthLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({ logoUrl: "", appName: "Leaderboard Petshop" });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.appName) {
          setSettings(data);
        }
      })
      .catch((err) => console.error("Gagal memuat logo & pengaturan:", err));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal melakukan autentikasi.");
      }

      onLoginSuccess(data.token, data.user, data.petshop);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  const useDemoCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        
        {/* Header Logo */}
        <div className="text-center">
          {settings.logoUrl ? (
            <div className="mx-auto h-20 w-auto max-h-20 flex items-center justify-center mb-4">
              <img 
                src={settings.logoUrl} 
                alt="Logo Utama" 
                referrerPolicy="no-referrer"
                className="max-h-20 object-contain rounded-xl"
              />
            </div>
          ) : (
            <div className="mx-auto h-16 w-16 bg-[#244e42] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 mb-4">
              <PawPrint className="h-9 w-9" />
            </div>
          )}
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {settings.appName}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sistem Pemantauan Poin & Peringkat Petshop
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 font-medium">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#244e42] focus:border-[#244e42] text-sm"
                  placeholder="Masukkan username petshop/admin"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#244e42] focus:border-[#244e42] text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#244e42] hover:bg-[#1c3e34] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#244e42] transition duration-150 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Masuk ke Sistem"
              )}
            </button>
          </div>
        </form>

        {/* Demo Credentials Helper */}
        {/*<div className="mt-8 border-t border-slate-100 pt-6">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-4">
            Uji Coba Demo Akun
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => useDemoCredentials("admin", "admin123")}
              className="p-3 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 rounded-xl text-left transition duration-150"
            >
              <div className="flex items-center gap-1.5 text-[#244e42] font-bold text-xs mb-1">
                <Key className="h-3.5 w-3.5" />
                Role: Admin
              </div>
              <div className="text-slate-600 text-[11px]">
                U: <span className="font-mono font-bold">admin</span>
              </div>
              <div className="text-slate-600 text-[11px]">
                P: <span className="font-mono">admin123</span>
              </div>
            </button>

            <button
              onClick={() => useDemoCredentials("caringpaws", "paws123")}
              className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition duration-150"
            >
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs mb-1">
                <PawPrint className="h-3.5 w-3.5" />
                Role: Petshop
              </div>
              <div className="text-slate-600 text-[11px]">
                U: <span className="font-mono font-bold">caringpaws</span>
              </div>
              <div className="text-slate-600 text-[11px]">
                P: <span className="font-mono">paws123</span>
              </div>
            </button>
          </div>
        </div>*/}
      </div>
    </div>
  );
}
