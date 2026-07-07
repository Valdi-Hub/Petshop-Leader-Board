import React, { useState, useEffect } from "react";
import { Trophy, Award, Search, RefreshCw, Sparkles, Medal } from "lucide-react";

interface LeaderboardItem {
  rank: number;
  id: string;
  namaPetshop: string;
  namaPemilik: string;
  totalPoints: number;
  status: "aktif" | "nonaktif";
  lastUpdated: string;
}

export default function LeaderboardView() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/leaderboard");
      const data = await response.json();
      if (response.ok) {
        setLeaderboard(data);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const filteredLeaderboard = leaderboard.filter((item) =>
    item.namaPetshop.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.namaPemilik.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Top 3 Podium helpers
  const gold = leaderboard[0];
  const silver = leaderboard[1];
  const bronze = leaderboard[2];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500 animate-pulse" />
            Klasemen Poin Realtime
          </h2>
          <p className="text-sm text-slate-500">
            Daftar peringkat petshop ter-update berdasarkan perolehan koin aktif saat ini.
          </p>
        </div>
        <button
          onClick={fetchLeaderboard}
          title="Refresh Data"
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition duration-150"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Podium Visualization */}
      {!searchTerm && leaderboard.length >= 3 && (
        <div className="podium-container">
          
          {/* Silver - Rank 2 */}
          {silver && (
            <div className="podium-card-silver order-2 md:order-1 md:h-64">
              <div className="podium-rank-badge podium-rank-silver">
                2
              </div>
              <div className="text-2xl mb-1">🥈</div>
              <h4 className="font-extrabold text-slate-800 text-base line-clamp-1">{silver.namaPetshop}</h4>
              <p className="text-xs text-slate-400 font-semibold mt-0.5 truncate w-full">Owner: {silver.namaPemilik}</p>
              <div className="mt-4 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-black text-lg">
                {silver.totalPoints.toLocaleString("id-ID")} <span className="text-xs font-normal text-slate-400">Pts</span>
              </div>
            </div>
          )}

          {/* Gold - Rank 1 */}
          {gold && (
            <div className="podium-card-gold order-1 md:order-2 md:h-76">
              <div className="podium-rank-badge podium-rank-gold animate-bounce">
                1
              </div>
              <div className="text-4xl mb-2">👑</div>
              <h4 className="font-black text-amber-900 text-lg line-clamp-1">{gold.namaPetshop}</h4>
              <p className="text-xs text-amber-600 font-bold mt-0.5 truncate w-full flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3" />
                Owner: {gold.namaPemilik}
              </p>
              <div className="mt-4 px-6 py-2 bg-amber-500 text-white border-2 border-amber-400 rounded-2xl font-black text-xl shadow-md shadow-amber-200">
                {gold.totalPoints.toLocaleString("id-ID")} <span className="text-xs font-normal opacity-75">Pts</span>
              </div>
            </div>
          )}

          {/* Bronze - Rank 3 */}
          {bronze && (
            <div className="podium-card-bronze order-3 md:order-3 md:h-56">
              <div className="podium-rank-badge podium-rank-bronze">
                3
              </div>
              <div className="text-2xl mb-1">🥉</div>
              <h4 className="font-extrabold text-slate-800 text-base line-clamp-1">{bronze.namaPetshop}</h4>
              <p className="text-xs text-slate-400 font-semibold mt-0.5 truncate w-full">Owner: {bronze.namaPemilik}</p>
              <div className="mt-4 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-black text-lg">
                {bronze.totalPoints.toLocaleString("id-ID")} <span className="text-xs font-normal text-slate-400">Pts</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Search Input Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Cari nama petshop atau nama pemilik di papan klasemen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#244e42] text-sm"
          />
        </div>
        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          Total: {filteredLeaderboard.length} Mitra
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6 text-center w-20">Peringkat</th>
                <th className="py-4 px-6">Mitra Petshop</th>
                <th className="py-4 px-6">Pemilik</th>
                <th className="py-4 px-6 text-right">Total Perolehan</th>
                <th className="py-4 px-6 text-center">Waktu Update Terakhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                    Memuat data klasemen...
                  </td>
                </tr>
              ) : filteredLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ada petshop yang terdaftar.
                  </td>
                </tr>
              ) : (
                filteredLeaderboard.map((item, index) => {
                  const isTop3 = item.rank <= 3;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition duration-150">
                      
                      {/* Rank Column */}
                      <td className="py-4 px-6 text-center">
                        {item.rank === 1 ? (
                          <span className="inline-flex items-center justify-center h-7 w-7 bg-amber-100 border border-amber-300 text-sm font-black rounded-full text-amber-800 shadow-sm shadow-amber-100">👑</span>
                        ) : item.rank === 2 ? (
                          <span className="inline-flex items-center justify-center h-7 w-7 bg-slate-100 border border-slate-200 text-sm font-black rounded-full text-slate-800 shadow-sm shadow-slate-100">🥈</span>
                        ) : item.rank === 3 ? (
                          <span className="inline-flex items-center justify-center h-7 w-7 bg-orange-50 border border-orange-200 text-sm font-black rounded-full text-orange-800 shadow-sm shadow-orange-100">🥉</span>
                        ) : (
                          <span className="text-slate-500 font-extrabold">{item.rank}</span>
                        )}
                      </td>

                      {/* Petshop Name */}
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-slate-800 text-base">{item.namaPetshop}</div>
                        {item.status === "nonaktif" && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 font-bold text-[9px] uppercase tracking-wider">Akun Ditangguhkan</span>
                        )}
                      </td>

                      {/* Owner Name */}
                      <td className="py-4 px-6 font-semibold text-slate-600">{item.namaPemilik}</td>

                      {/* Total Points */}
                      <td className="py-4 px-6 text-right font-black text-slate-900 text-base">
                        {item.totalPoints.toLocaleString("id-ID")} <span className="text-xs font-semibold text-slate-400">Pts</span>
                      </td>

                      {/* Last Updated */}
                      <td className="py-4 px-6 text-center text-xs text-slate-400 font-semibold whitespace-nowrap">
                        {new Date(item.lastUpdated).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
