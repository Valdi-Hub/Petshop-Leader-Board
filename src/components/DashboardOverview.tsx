import React, { useState, useEffect } from "react";
import { 
  Users, Coins, Trophy, Calendar, ArrowUpRight, ArrowDownRight, Award, 
  Settings, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle, Save, PawPrint 
} from "lucide-react";
import { PointLog } from "../types";

interface DashboardOverviewProps {
  stats: {
    totalPetshops: number;
    totalPointsGiven: number;
    topPetshops: { rank: number; id: string; namaPetshop: string; totalPoints: number }[];
    recentActivities: PointLog[];
  };
  onNavigate: (tab: string) => void;
}

const PRESET_LOGOS = [
  {
    name: "Golden Paw",
    url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=120&auto=format&fit=crop&q=80"
  },
  {
    name: "Royal Meow",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=120&auto=format&fit=crop&q=80"
  },
  {
    name: "Green Guard",
    url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=120&auto=format&fit=crop&q=80"
  },
  {
    name: "Mint Pet",
    url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=120&auto=format&fit=crop&q=80"
  },
  {
    name: "Erapet",
    url: "https://assets.zyrosite.com/Va5rmXJmW6qWe8U3/asset-41-uh6h0aIJORww1y8k.webp"
  }
];

export default function DashboardOverview({ stats, onNavigate }: DashboardOverviewProps) {
  const [logoUrl, setLogoUrl] = useState("");
  const [appName, setAppName] = useState("Leaderboard Petshop");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setLogoUrl(data.logoUrl || "");
          setAppName(data.appName || "Leaderboard Petshop");
        }
      })
      .catch((err) => console.error("Gagal mengambil konfigurasi branding:", err));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const activeToken = sessionStorage.getItem("petshop_token") || "";
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`
        },
        body: JSON.stringify({ logoUrl, appName })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal memperbarui logo dan pengaturan.");
      }

      setMessage({ text: "Branding dan logo berhasil disimpan! Muat ulang halaman login untuk melihat perubahan.", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Terjadi kesalahan sistem.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Extract top 3 for custom podium visualization
  const podium = stats.topPetshops.slice(0, 3);

  return (
    <div className="space-y-8 font-sans">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Total Petshop Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Mitra Petshop</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalPetshops}</h3>
            <button 
              onClick={() => onNavigate("petshops")}
              className="text-xs font-semibold text-[#244e42] hover:text-[#1c3e34] flex items-center gap-1 mt-3"
            >
              Kelola Petshop &rarr;
            </button>
          </div>
          <div className="h-14 w-14 bg-emerald-50 text-[#244e42] rounded-2xl flex items-center justify-center">
            <Users className="h-7 w-7" />
          </div>
        </div>

        {/* Total Points Pool Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Poin Terdistribusi</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
              {stats.totalPointsGiven.toLocaleString("id-ID")} <span className="text-sm font-normal text-slate-400">Pts</span>
            </h3>
            <button 
              onClick={() => onNavigate("points")}
              className="text-xs font-semibold text-[#244e42] hover:text-[#1c3e34] flex items-center gap-1 mt-3"
            >
              Update Poin Baru &rarr;
            </button>
          </div>
          <div className="h-14 w-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Coins className="h-7 w-7" />
          </div>
        </div>

        {/* Average Points Card (Bonus Visual Highlight) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between md:col-span-2 lg:col-span-1">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Rata-Rata Poin</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
              {stats.totalPetshops > 0 
                ? Math.round(stats.totalPointsGiven / stats.totalPetshops).toLocaleString("id-ID")
                : 0} <span className="text-sm font-normal text-slate-400">Pts</span>
            </h3>
            <button 
              onClick={() => onNavigate("leaderboard")}
              className="text-xs font-semibold text-[#244e42] hover:text-[#1c3e34] flex items-center gap-1 mt-3"
            >
              Lihat Klasemen &rarr;
            </button>
          </div>
          <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Trophy className="h-7 w-7" />
          </div>
        </div>
      </div>

      {/* Podium Showcase (Highlighting Top 3) */}
      {podium.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Trophy className="h-64 w-64 text-white" />
          </div>
          
          <h4 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Award className="h-5 w-5 text-amber-400" />
            Juara Klasemen Terkini
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
            {/* 2nd Place */}
            {podium[1] && (
              <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-400 bg-slate-700/60 px-2 py-0.5 rounded-full uppercase tracking-wider">Peringkat 2</span>
                  <h5 className="font-bold text-lg mt-2 truncate">{podium[1].namaPetshop}</h5>
                </div>
                <div className="mt-4 text-slate-300">
                  <span className="text-2xl font-black text-white">{podium[1].totalPoints.toLocaleString("id-ID")}</span> Pts
                </div>
              </div>
            )}

            {/* 1st Place */}
            {podium[0] && (
              <div className="bg-amber-500/10 border-2 border-amber-400/50 p-6 rounded-2xl flex flex-col justify-between shadow-lg shadow-amber-950/20">
                <div>
                  <span className="text-xs font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 w-max">
                    👑 Pemenang Utama
                  </span>
                  <h5 className="font-black text-xl mt-3 truncate text-amber-200">{podium[0].namaPetshop}</h5>
                </div>
                <div className="mt-4 text-amber-300">
                  <span className="text-3xl font-black text-amber-400">{podium[0].totalPoints.toLocaleString("id-ID")}</span> Pts
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {podium[2] && (
              <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-400 bg-slate-700/60 px-2 py-0.5 rounded-full uppercase tracking-wider">Peringkat 3</span>
                  <h5 className="font-bold text-lg mt-2 truncate">{podium[2].namaPetshop}</h5>
                </div>
                <div className="mt-4 text-slate-300">
                  <span className="text-2xl font-black text-white">{podium[2].totalPoints.toLocaleString("id-ID")}</span> Pts
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Bottom Section: Top 10 vs Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Top 10 Table Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#244e42]" />
              Top 10 Petshop Tertinggi
            </h4>
            <button 
              onClick={() => onNavigate("leaderboard")}
              className="text-xs font-bold text-[#244e42] hover:underline"
            >
              Lihat Semua &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3 text-center w-12">No</th>
                  <th className="pb-3">Nama Petshop</th>
                  <th className="pb-3 text-right">Total Poin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.topPetshops.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400 text-sm">
                      Belum ada data petshop terdaftar.
                    </td>
                  </tr>
                ) : (
                  stats.topPetshops.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="py-3 text-center">
                        {idx === 0 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 bg-amber-100 text-amber-700 text-xs font-extrabold rounded-full">🥇</span>
                        ) : idx === 1 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 bg-slate-100 text-slate-700 text-xs font-extrabold rounded-full">🥈</span>
                        ) : idx === 2 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 bg-orange-100 text-orange-700 text-xs font-extrabold rounded-full">🥉</span>
                        ) : (
                          <span className="text-slate-500 font-medium text-sm">{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-3 font-semibold text-slate-800 text-sm truncate max-w-xs">{p.namaPetshop}</td>
                      <td className="py-3 text-right font-bold text-slate-900 text-sm">
                        {p.totalPoints.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activities Log */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#244e42]" />
              Aktivitas Poin Terbaru
            </h4>
            <button 
              onClick={() => onNavigate("logs")}
              className="text-xs font-bold text-[#244e42] hover:underline"
            >
              Semua Log &rarr;
            </button>
          </div>

          <div className="flow-root">
            <ul className="-my-5 divide-y divide-slate-100">
              {stats.recentActivities.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Belum ada aktivitas perubahan poin.
                </div>
              ) : (
                stats.recentActivities.map((log) => (
                  <li key={log.id} className="py-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        log.tipe === "tambah" 
                          ? "bg-emerald-50 text-emerald-600" 
                          : "bg-rose-50 text-rose-600"
                      }`}>
                        {log.tipe === "tambah" ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {log.petshopName}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate italic">
                          "{log.keterangan}"
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                          <span>Oleh: {log.adminName}</span>
                          <span className="text-slate-200">•</span>
                          <span>{formatDateTime(log.createdAt)}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-sm font-extrabold ${
                          log.tipe === "tambah" ? "text-emerald-600" : "text-rose-600"
                        }`}>
                          {log.tipe === "tambah" ? "+" : "-"}{log.point}
                        </span>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          Akhir: {log.totalPointAfter}
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

      </div>

      {/* Dynamic Branding & Logo Settings Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-8">
        <div className="flex items-center gap-2.5 mb-6 border-b border-slate-50 pb-4">
          <div className="p-2 bg-emerald-50 text-[#244e42] rounded-xl">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">Pengaturan Identitas & Logo Sistem</h4>
            <p className="text-xs text-slate-500">Sesuaikan logo dan judul portal yang tampil pada halaman depan login aplikasi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Settings */}
          <form onSubmit={handleSaveSettings} className="lg:col-span-7 space-y-5">
            {message.text && (
              <div className={`p-4 rounded-xl flex items-start gap-3 border ${
                message.type === "success" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                  : "bg-red-50 border-red-200 text-red-800"
              }`}>
                {message.type === "success" ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-bold text-slate-700">Nama Aplikasi / Judul</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#244e42] focus:border-[#244e42] text-sm"
                placeholder="Contoh: Leaderboard Petshop"
                required
              />
              <p className="text-[11px] text-slate-400">Judul utama yang akan dipajang dengan huruf tebal di halaman depan login.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Tautan Gambar Logo (URL)</label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#244e42] focus:border-[#244e42] text-sm font-mono"
                placeholder="https://contoh.com/logo-petshop.png"
              />
              <p className="text-[11px] text-slate-400">Masukkan tautan langsung (direct link) logo Anda. Biarkan kosong untuk menggunakan ikon default.</p>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Rekomendasi Logo Hewan Cantik</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_LOGOS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setLogoUrl(preset.url)}
                    className={`p-2 border rounded-xl flex flex-col items-center gap-1.5 transition duration-150 group hover:border-[#244e42] ${
                      logoUrl === preset.url ? "border-[#244e42] bg-emerald-50/20" : "border-slate-100 bg-slate-50/50"
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-lg object-cover shadow-sm group-hover:scale-105 transition"
                    />
                    <span className="text-[10px] font-bold text-slate-600 truncate max-w-full">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-[#244e42] hover:bg-[#1c3e34] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition disabled:opacity-50"
              >
                {saving ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setLogoUrl("");
                  setAppName("Leaderboard Petshop");
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Gunakan Pengaturan Awal
              </button>
            </div>
          </form>

          {/* Live Preview Panel */}
          <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-6 block">Pratinjau Live Halaman Login</span>
            
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-md w-full max-w-[260px] transform transition hover:scale-[1.02]">
              {/* Logo Preview */}
              {logoUrl ? (
                <div className="mx-auto h-14 w-auto max-h-14 flex items-center justify-center mb-3">
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    referrerPolicy="no-referrer"
                    className="max-h-14 object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="mx-auto h-12 w-12 bg-[#244e42] rounded-xl flex items-center justify-center text-white shadow-md mb-3">
                  <PawPrint className="h-7 w-7" />
                </div>
              )}
              
              {/* Name Preview */}
              <h5 className="font-extrabold text-slate-900 text-sm tracking-tight truncate">
                {appName || "Tanpa Judul"}
              </h5>
              <p className="text-[10px] text-slate-400 mt-0.5">Sistem Pemantauan Poin Petshop</p>
              
              {/* Dummy Login inputs */}
              <div className="mt-4 space-y-1.5 text-left opacity-60">
                <div className="h-6 bg-slate-100 rounded-md w-full"></div>
                <div className="h-6 bg-slate-100 rounded-md w-full"></div>
                <div className="h-7 bg-[#244e42]/80 rounded-md w-full mt-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
