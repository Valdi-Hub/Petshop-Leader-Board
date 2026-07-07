import React, { useState, useEffect } from "react";
import { 
  Trophy, Award, Calendar, ArrowUpRight, ArrowDownRight, RefreshCw, 
  User, Sparkles, LogOut, ShieldAlert, BookOpen, PawPrint 
} from "lucide-react";

interface PetshopPortalProps {
  token: string;
  onLogout: () => void;
}

export default function PetshopPortal({ token, onLogout }: PetshopPortalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);
  const [settings, setSettings] = useState({ logoUrl: "", appName: "Leaderboard Petshop" });

  const fetchPortalData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/petshop/dashboard", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const resData = await response.json();
      if (response.ok) {
        setData(resData);
      } else {
        setError(resData.message || "Gagal memuat portal petshop.");
      }
    } catch (err) {
      setError("Kesalahan koneksi jaringan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.appName) {
          setSettings(data);
        }
      })
      .catch((err) => console.error("Gagal memuat logo & pengaturan di portal:", err));
  }, [token]);

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-[#244e42] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-semibold text-sm">Menghubungkan ke portal Mitra...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 text-center max-w-md space-y-4">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-black text-slate-950">Akses Gagal</h3>
          <p className="text-sm text-slate-500">{error}</p>
          <button
            onClick={onLogout}
            className="w-full py-2 bg-[#244e42] hover:bg-[#1c3e34] text-white text-xs font-bold rounded-lg transition"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { petshop, currentPoints, currentRank, totalParticipants, topLeaderboard, historyLogs, chartData } = data;

  // Custom SVG Chart dimensions
  const chartWidth = 500;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  // Find max points to scale chart height
  const maxPoints = Math.max(...chartData.map((d: any) => d.points), 100);

  // Compute SVG Points coordinates
  const svgCoordinates = chartData.map((d: any, idx: number) => {
    const x = paddingX + (idx / (chartData.length - 1)) * (chartWidth - paddingX * 2);
    // Y counts from top 0 to bottom height
    const y = chartHeight - paddingY - (d.points / maxPoints) * (chartHeight - paddingY * 2);
    return { x, y, month: d.month, points: d.points };
  });

  // Build SVG Path
  let areaPath = "";
  let linePath = "";
  if (svgCoordinates.length > 0) {
    linePath = `M ${svgCoordinates[0].x} ${svgCoordinates[0].y}`;
    areaPath = `M ${svgCoordinates[0].x} ${chartHeight - paddingY}`;
    areaPath += ` L ${svgCoordinates[0].x} ${svgCoordinates[0].y}`;

    for (let i = 1; i < svgCoordinates.length; i++) {
      linePath += ` L ${svgCoordinates[i].x} ${svgCoordinates[i].y}`;
      areaPath += ` L ${svgCoordinates[i].x} ${svgCoordinates[i].y}`;
    }

    areaPath += ` L ${svgCoordinates[svgCoordinates.length - 1].x} ${chartHeight - paddingY} Z`;
  }

  // Format date helper
  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        
        {/* Branding */}
        <div className="flex items-center gap-3">
          {settings.logoUrl ? (
            <div className="h-11 w-11 flex items-center justify-center p-1 bg-white border border-slate-100 rounded-xl shadow-md">
              <img
                src={settings.logoUrl}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="h-9 w-9 object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="h-11 w-11 bg-[#244e42] rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-100/50">
              <PawPrint className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{settings.appName}</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Portal Mitra & Poin Panel</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPortalData}
            title="Refresh Data"
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 rounded-xl transition shadow-sm"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
          
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 font-bold rounded-xl text-xs transition shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            Keluar Portal
          </button>
        </div>

      </div>

      {/* Main Grid Container */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Banner Card */}
        <div className="bg-gradient-to-r from-[#16332b] via-[#244e42] to-[#0d1f1b] p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Trophy className="h-56 w-56 text-white" />
          </div>
          <div className="relative z-10">
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider bg-emerald-500/30 border border-emerald-400/30 px-3 py-1 rounded-full">
              Selamat Datang
            </span>
            <h2 className="text-3xl font-black mt-3 text-white leading-tight">{petshop.namaPetshop}</h2>
            
            <div className="mt-4 flex flex-col sm:flex-row gap-4 text-xs font-semibold text-emerald-100">
              <div>• Owner: <span className="font-extrabold text-white">{petshop.namaPemilik}</span></div>
              <div className="hidden sm:block">|</div>
              <div>• Email: <span className="font-extrabold text-white">{petshop.email}</span></div>
              <div className="hidden sm:block">|</div>
              <div>• Telepon: <span className="font-extrabold text-white">{petshop.telepon}</span></div>
            </div>
          </div>
        </div>

        {/* Personal Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Total Points */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Koin Akumulatif</span>
              <p className="text-4xl font-black text-[#244e42] mt-2">
                {currentPoints.toLocaleString("id-ID")} <span className="text-sm font-semibold text-slate-400">Pts</span>
              </p>
              <span className="text-[10px] text-slate-400 block mt-2 font-medium">Batas minimal penukaran: 100 Pts</span>
            </div>
            <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#244e42] shadow-sm shadow-emerald-50">
              💰
            </div>
          </div>

          {/* Card 2: Current Rank */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Peringkat Klasemen</span>
              <p className="text-4xl font-black text-amber-500 mt-2">
                #{currentRank} <span className="text-xs font-semibold text-slate-400">dari {totalParticipants} Mitra</span>
              </p>
              
              {/* Achievement description badge */}
              {currentRank <= 3 ? (
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 uppercase tracking-wider">
                  🏆 Podium Juara
                </span>
              ) : currentRank <= 10 ? (
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-[#244e42] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 uppercase tracking-wider">
                  🔥 Top 10 Unggulan
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 uppercase tracking-wider">
                  📈 Fokus Peningkatan
                </span>
              )}
            </div>
            <div className="h-14 w-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm shadow-amber-50">
              🏆
            </div>
          </div>

          {/* Card 3: Total Mitra Counter */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Mitra Terdaftar</span>
              <p className="text-4xl font-black text-slate-800 mt-2">
                {totalParticipants} <span className="text-sm font-semibold text-slate-400">Petshop</span>
              </p>
              <span className="text-[10px] text-slate-400 block mt-2 font-medium">Kualifikasi penentuan realtime 2026</span>
            </div>
            <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
              🤝
            </div>
          </div>

        </div>

        {/* Chart View & History Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Monthly Growth Line Chart (SVG Interactive) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Grafik Perkembangan Poin Bulanan (2026)
              </h4>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold uppercase tracking-wider border border-emerald-100 px-2 py-0.5 rounded-md">
                Kumulatif Pts
              </span>
            </div>

            {/* SVG responsive Chart box */}
            <div className="relative">
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-auto overflow-visible select-none"
              >
                {/* Gradients */}
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#244e42" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#244e42" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio: number, idx: number) => {
                  const y = paddingY + ratio * (chartHeight - paddingY * 2);
                  const pointValue = Math.round(maxPoints * (1 - ratio));
                  return (
                    <g key={idx} className="opacity-40">
                      <line 
                        x1={paddingX} 
                        y1={y} 
                        x2={chartWidth - paddingX} 
                        y2={y} 
                        stroke="#e2e8f0" 
                        strokeWidth="1" 
                        strokeDasharray="4 4" 
                      />
                      <text 
                        x={paddingX - 10} 
                        y={y + 4} 
                        textAnchor="end" 
                        fill="#94a3b8" 
                        fontSize="9" 
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {pointValue}
                      </text>
                    </g>
                  );
                })}

                {/* Fill Area */}
                <path d={areaPath} fill="url(#areaGradient)" />

                {/* Main Curve Line */}
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="#244e42" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {/* Chart Dots & Interaction Points */}
                {svgCoordinates.map((pt: { x: number; y: number; month: string; points: number }, idx: number) => {
                  const isActive = activeTooltipIndex === idx;
                  return (
                    <g key={idx}>
                      <circle 
                        cx={pt.x} 
                        cy={pt.y} 
                        r={isActive ? "7" : "5"} 
                        fill={isActive ? "#244e42" : "#ffffff"} 
                        stroke="#244e42" 
                        strokeWidth={isActive ? "3.5" : "2.5"} 
                        className="cursor-pointer transition-all duration-150"
                        onMouseEnter={() => setActiveTooltipIndex(idx)}
                        onMouseLeave={() => setActiveTooltipIndex(null)}
                      />
                      
                      {/* X Month labels */}
                      <text 
                        x={pt.x} 
                        y={chartHeight - 8} 
                        textAnchor="middle" 
                        fill={isActive ? "#1e293b" : "#94a3b8"} 
                        fontSize="9" 
                        fontWeight="bold"
                      >
                        {pt.month}
                      </text>
                    </g>
                  );
                })}

                {/* Interactive Tooltip over point */}
                {activeTooltipIndex !== null && (
                  <g>
                    {/* Tooltip Background */}
                    <rect 
                      x={svgCoordinates[activeTooltipIndex].x - 55} 
                      y={svgCoordinates[activeTooltipIndex].y - 38} 
                      width="110" 
                      height="26" 
                      rx="6" 
                      fill="#1e293b" 
                      shadow-sm="true"
                    />
                    <text 
                      x={svgCoordinates[activeTooltipIndex].x} 
                      y={svgCoordinates[activeTooltipIndex].y - 21} 
                      fill="#ffffff" 
                      fontSize="9.5" 
                      fontWeight="black" 
                      textAnchor="middle"
                    >
                      {svgCoordinates[activeTooltipIndex].month}: {svgCoordinates[activeTooltipIndex].points.toLocaleString("id-ID")} Pts
                    </text>
                  </g>
                )}

              </svg>
            </div>

            <p className="text-[10px] text-slate-400 italic text-center mt-2 font-medium">
              *Arahkan kursor / klik titik bulanan di atas untuk detail nominal angka koin kumulatif.
            </p>

          </div>

          {/* Top 10 Leaderboard Component (with highlight!) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-5 space-y-4">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Klasemen Top 10 Besar
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="pb-2 text-center w-12">No</th>
                    <th className="pb-2">Nama Petshop</th>
                    <th className="pb-2 text-right">Poin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {topLeaderboard.map((item: any, idx: number) => {
                    const isSelf = item.id === petshop.id;
                    return (
                      <tr 
                        key={item.id} 
                        className={`transition duration-150 ${
                          isSelf 
                            ? "bg-amber-500/10 hover:bg-amber-500/15 font-black text-amber-900 border-l-4 border-amber-500" 
                            : "hover:bg-slate-50/50 text-slate-600"
                        }`}
                      >
                        <td className="py-2.5 text-center">
                          {idx === 0 ? (
                            <span>🥇</span>
                          ) : idx === 1 ? (
                            <span>🥈</span>
                          ) : idx === 2 ? (
                            <span>🥉</span>
                          ) : (
                            <span className="font-bold">{idx + 1}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-1 truncate max-w-[150px]">
                          <span className={isSelf ? "font-black text-slate-900 text-sm" : "font-semibold text-slate-800"}>
                            {item.namaPetshop}
                          </span>
                          {isSelf && (
                            <span className="inline-block ml-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-white font-extrabold text-[8px] uppercase tracking-wider">
                              Mitra Anda
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-right font-extrabold text-slate-900 text-sm">
                          {item.totalPoints.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Points History logs (Personal audit history) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#244e42]" />
            Histori Mutasi & Buku Poin Anda
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Tanggal & Jam</th>
                  <th className="py-3.5 px-6 text-center">Aktivitas</th>
                  <th className="py-3.5 px-6 text-center">Nilai Poin</th>
                  <th className="py-3.5 px-6 text-center">Saldo Setelah Update</th>
                  <th className="py-3.5 px-6">Diberikan Oleh Admin</th>
                  <th className="py-3.5 px-6 w-1/3">Keterangan / Alasan Kerja Sama</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {historyLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-normal">
                      Belum ada catatan mutasi poin untuk Mitra Anda.
                    </td>
                  </tr>
                ) : (
                  historyLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="py-3.5 px-6 text-slate-400 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          log.tipe === "tambah" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}>
                          {log.tipe === "tambah" ? "Diterima" : "Dikurangi"}
                        </span>
                      </td>
                      <td className={`py-3.5 px-6 text-center font-black text-sm ${
                        log.tipe === "tambah" ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {log.tipe === "tambah" ? "+" : "-"}{log.point}
                      </td>
                      <td className="py-3.5 px-6 text-center font-extrabold text-slate-900 bg-slate-50/40">
                        {log.totalPointAfter}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">
                        {log.adminName || "Administrator"}
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 italic font-normal">
                        {log.keterangan}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
