import React, { useState } from "react";
import { Coins, Plus, Minus, ArrowUpRight, ArrowDownRight, CheckCircle, Search, AlertCircle } from "lucide-react";
import { Petshop } from "../types";

interface PointManagementProps {
  petshops: Petshop[];
  token: string;
  onRefresh: () => void;
}

export default function PointManagement({ petshops, token, onRefresh }: PointManagementProps) {
  const [selectedPetshopId, setSelectedPetshopId] = useState("");
  const [pointAmount, setPointAmount] = useState("");
  const [operationType, setOperationType] = useState<"tambah" | "kurang">("tambah");
  const [reason, setReason] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Get active petshop for previewing current point status
  const activePetshop = petshops.find((p) => p.id === selectedPetshopId);

  // Filter list of petshops for search
  const filteredPetshops = petshops.filter(
    (p) =>
      p.namaPetshop.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.namaPemilik.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handlePointUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!selectedPetshopId) {
      setErrorMessage("Silakan pilih mitra petshop terlebih dahulu.");
      return;
    }

    const points = parseInt(pointAmount, 10);
    if (isNaN(points) || points <= 0) {
      setErrorMessage("Jumlah koin harus berupa angka positif.");
      return;
    }

    if (!reason.trim()) {
      setErrorMessage("Keterangan atau alasan penyesuaian koin wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          petshopId: selectedPetshopId,
          point: points,
          tipe: operationType,
          keterangan: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal melakukan penyesuaian koin.");
      }

      setSuccessMessage(data.message);
      setPointAmount("");
      setReason("");
      onRefresh();

      // Clear success alert after 3 seconds
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Alokasi Poin</h2>
        <p className="text-sm text-slate-500">Berikan reward tambahan koin atau kurangi koin beserta alasan otentik audit trail.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Form Controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-7 space-y-6">
          <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Coins className="h-5 w-5 text-[#244e42]" />
            Formulir Update Poin
          </h4>

          {/* Feedback alerts */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm font-semibold text-emerald-800">{successMessage}</div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-sm font-semibold text-rose-800">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handlePointUpdate} className="space-y-5">
            
            {/* Step 1: Search & Choose Petshop */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">1. Pilih Mitra Petshop <span className="text-rose-500">*</span></label>
              
              {/* Filter search for dropdown */}
              <div className="relative mb-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Ketik untuk memfilter daftar petshop..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#244e42]"
                />
              </div>

              <select
                value={selectedPetshopId}
                onChange={(e) => setSelectedPetshopId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#244e42]"
              >
                <option value="">-- Pilih Mitra Petshop --</option>
                {filteredPetshops.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.namaPetshop} - [Poin Saat Ini: {p.totalPoints} Pts]
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Choose Operation */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">2. Jenis Penyesuaian</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setOperationType("tambah")}
                  className={`py-3 px-4 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition duration-150 ${
                    operationType === "tambah"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  Tambah Poin
                </button>

                <button
                  type="button"
                  onClick={() => setOperationType("kurang")}
                  className={`py-3 px-4 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition duration-150 ${
                    operationType === "kurang"
                      ? "bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Minus className="h-4 w-4" />
                  Kurangi Poin
                </button>
              </div>
            </div>

            {/* Step 3: Input Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">3. Jumlah Koin / Poin <span className="text-rose-500">*</span></label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Masukkan nominal angka (contoh: 500)"
                  value={pointAmount}
                  onChange={(e) => setPointAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#244e42]"
                />
              </div>
            </div>

            {/* Step 4: Reason / Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">4. Alasan / Keterangan Penyesuaian <span className="text-rose-500">*</span></label>
              <textarea
                placeholder="Tulis alasan perubahan poin secara detail (misal: 'Sponsorship Kegiatan Pet Expo Q2', 'Pencapaian penjualan pakan', dsb.)"
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#244e42]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !selectedPetshopId}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white transition duration-150 shadow-md ${
                operationType === "tambah"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 disabled:bg-emerald-300"
                  : "bg-rose-600 hover:bg-rose-700 shadow-rose-100 disabled:bg-rose-300"
              }`}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                `${operationType === "tambah" ? "Tambahkan" : "Kurangi"} Poin Sekarang`
              )}
            </button>

          </form>
        </div>

        {/* Right Side: Active Petshop Info Card & Formula */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Petshop Status Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mitra Sasaran Terpilih</h4>
            
            {activePetshop ? (
              <div className="space-y-4">
                <div>
                  <h5 className="font-extrabold text-xl text-slate-900 leading-tight">{activePetshop.namaPetshop}</h5>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Pemilik: {activePetshop.namaPemilik}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Poin Saat Ini</span>
                    <p className="text-2xl font-black text-slate-800 mt-1">{activePetshop.totalPoints.toLocaleString("id-ID")}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Simulasi Akhir</span>
                    <p className={`text-2xl font-black mt-1 ${
                      operationType === "tambah" ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {operationType === "tambah"
                        ? (activePetshop.totalPoints + (parseInt(pointAmount, 10) || 0)).toLocaleString("id-ID")
                        : Math.max(0, activePetshop.totalPoints - (parseInt(pointAmount, 10) || 0)).toLocaleString("id-ID")
                      }
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>• Email: <span className="font-semibold text-slate-600">{activePetshop.email}</span></div>
                  <div>• Telepon: <span className="font-semibold text-slate-600">{activePetshop.telepon}</span></div>
                  <div>• Status: <span className="font-bold text-emerald-600 uppercase">{activePetshop.status}</span></div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Silakan pilih petshop di sebelah kiri untuk menampilkan rincian simulasi poin saat ini.
              </div>
            )}
          </div>

          {/* Audit Notification Warning */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-500 space-y-3">
            <h5 className="font-bold text-slate-700 flex items-center gap-1.5">
              💡 Catatan Audit Kepatuhan
            </h5>
            <p>Setiap penyesuaian koin langsung dicatat secara otomatis dalam log audit sistem yang bersifat <strong>READ-ONLY</strong> (tidak dapat diedit/dihapus).</p>
            <p>Pastikan alasan yang Anda ketikkan sesuai dengan bukti fisik surat keputusan/transaksi kerja sama yang asli.</p>
          </div>

        </div>

      </div>

    </div>
  );
}
