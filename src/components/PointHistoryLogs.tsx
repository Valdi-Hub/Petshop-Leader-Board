import React, { useState, useEffect } from "react";
import { FileText, Download, Printer, Search, Filter, Calendar, RefreshCw, X } from "lucide-react";
import { PointLog, Petshop } from "../types";

interface PointHistoryLogsProps {
  petshops: Petshop[];
  token: string;
}

export default function PointHistoryLogs({ petshops, token }: PointHistoryLogsProps) {
  const [logs, setLogs] = useState<PointLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters state
  const [selectedPetshopId, setSelectedPetshopId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Print Preview Modal state
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedPetshopId) queryParams.append("petshopId", selectedPetshopId);
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (searchQuery) queryParams.append("search", searchQuery);

      const response = await fetch(`/api/admin/logs?${queryParams.toString()}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedPetshopId, startDate, endDate]); // Auto-fetch on major filters

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleResetFilters = () => {
    setSelectedPetshopId("");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
  };

  // Trigger fetch of logs when search query is cleared manually
  useEffect(() => {
    if (searchQuery === "") {
      fetchLogs();
    }
  }, [searchQuery]);

  // Format date helper
  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // EXPORT TO EXCEL (CSV)
  const exportToExcel = () => {
    // CSV Header row
    const headers = [
      "ID Log",
      "Tanggal & Jam",
      "Petshop Sasaran",
      "Admin Operator",
      "Jenis Aktivitas",
      "Jumlah Poin (Magnitude)",
      "Poin Setelah Update",
      "Keterangan/Alasan"
    ];

    // CSV Data rows
    const rows = logs.map((log) => [
      log.id,
      formatDateTime(log.createdAt).replace(/,/g, " -"), // avoid separating commas in text
      log.petshopName.replace(/,/g, " "),
      log.adminName.replace(/,/g, " "),
      log.tipe === "tambah" ? "TAMBAH POIN" : "KURANG POIN",
      log.point,
      log.totalPointAfter,
      log.keterangan.replace(/"/g, '""').replace(/,/g, " ") // escape quotes & commas
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.join(","))
    ].join("\n");

    // Download setup
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Audit_Log_Point_Petshop_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // TRIGGER PRINT SYSTEM
  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Log Audit & Transaksi Poin</h2>
          <p className="text-sm text-slate-500">Histori penyesuaian koin seluruh petshop. Catatan transaksi bersifat permanen dan tidak dapat diubah.</p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportToExcel}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition duration-150 disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Excel (CSV)
          </button>
          
          <button
            onClick={() => setShowPrintPreview(true)}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#244e42] hover:bg-[#1c3e34] text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-200 transition duration-150 disabled:opacity-40"
          >
            <Printer className="h-4 w-4" />
            PDF & Cetak
          </button>
        </div>
      </div>

      {/* Filter Toolbar Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="h-4 w-4" />
          Filter & Pencarian Laporan
        </h4>

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          
          {/* Petshop Filter */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Pilih Petshop</label>
            <select
              value={selectedPetshopId}
              onChange={(e) => setSelectedPetshopId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#244e42]"
            >
              <option value="">-- Semua Petshop --</option>
              {petshops.map((p) => (
                <option key={p.id} value={p.id}>{p.namaPetshop}</option>
              ))}
            </select>
          </div>

          {/* Date Picker Start */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Mulai Tanggal</label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#244e42]"
              />
            </div>
          </div>

          {/* Date Picker End */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#244e42]"
            />
          </div>

          {/* Generic Search */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Kata Kunci Keterangan / Admin</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari kata kunci alasan, admin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#244e42]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2 px-3 bg-[#244e42] hover:bg-[#1c3e34] text-white text-xs font-bold rounded-lg transition duration-150 flex items-center justify-center gap-1.5"
            >
              Cari
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset Filter"
              className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition duration-150 flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

        </form>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Tanggal & Jam</th>
                <th className="py-4 px-6">Mitra Petshop</th>
                <th className="py-4 px-6">Admin Penginput</th>
                <th className="py-4 px-6 text-center">Tipe</th>
                <th className="py-4 px-6 text-center">Nilai Poin</th>
                <th className="py-4 px-6 text-center font-bold">Total Akhir</th>
                <th className="py-4 px-6 w-1/4">Keterangan / Alasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="h-6 w-6 border-2 border-[#244e42] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <span className="block mt-2 font-semibold">Sedang memuat riwayat koin...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    Belum ada riwayat aktivitas poin terdaftar dengan filter ini.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="py-4 px-6 text-slate-400 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                    <td className="py-4 px-6 font-bold text-slate-800 text-sm">{log.petshopName}</td>
                    <td className="py-4 px-6 text-slate-600 font-semibold">{log.adminName}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        log.tipe === "tambah" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {log.tipe}
                      </span>
                    </td>
                    <td className={`py-4 px-6 text-center font-black text-sm ${
                      log.tipe === "tambah" ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {log.tipe === "tambah" ? "+" : "-"}{log.point}
                    </td>
                    <td className="py-4 px-6 text-center font-extrabold text-slate-900 text-sm bg-slate-50/30">
                      {log.totalPointAfter}
                    </td>
                    <td className="py-4 px-6 text-slate-500 italic font-normal line-clamp-2 max-w-[250px]" title={log.keterangan}>
                      {log.keterangan}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Corporate PDF / Print Preview Modal */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col print:shadow-none print:border-none print:max-h-full print:overflow-visible">
            
            {/* Modal Header Controls (Hidden during print) */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between print:hidden">
              <h4 className="text-sm font-black text-slate-700 flex items-center gap-1.5">
                <FileText className="h-4.5 w-4.5 text-[#244e42]" />
                Review Cetak PDF Laporan
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={triggerPrint}
                  className="px-4 py-1.5 bg-[#244e42] hover:bg-[#1c3e34] text-white font-bold rounded-lg text-xs transition duration-150 flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print / Cetak Laporan
                </button>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Print Body */}
            <div className="p-8 space-y-6 flex-1 print:p-0" id="print-sheet">
              
              {/* Corporate Invoice Style Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Sistem Leaderboard Point Petshop</h1>
                  <p className="text-xs text-slate-500 font-bold uppercase mt-1">Laporan Audit Transaksi & Alokasi Koin Mitra</p>
                  <div className="text-[10px] text-slate-400 mt-2 font-medium">
                    <div>Dicetak Oleh: Administrator</div>
                    <div>Waktu Cetak: {new Date().toLocaleString("id-ID")}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-10 w-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold font-mono text-lg ml-auto">
                    LP
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-2">Dokumen Resmi</span>
                </div>
              </div>

              {/* Selection summary metadata info */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 print:bg-white print:border-none">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kriteria Filter Petshop</span>
                  <p className="mt-0.5 text-slate-800">
                    {selectedPetshopId 
                      ? petshops.find(p => p.id === selectedPetshopId)?.namaPetshop 
                      : "Semua Mitra Terdaftar"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rentang Rentang Tanggal</span>
                  <p className="mt-0.5 text-slate-800">
                    {startDate || endDate 
                      ? `${startDate || "Awal"} s/d ${endDate || "Hari Ini"}` 
                      : "Semua Histori Sejak Pendaftaran"}
                  </p>
                </div>
              </div>

              {/* Main Print Table */}
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b-2 border-slate-400 bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <th className="py-2 px-3">Tanggal & Jam</th>
                    <th className="py-2 px-3">Mitra Petshop</th>
                    <th className="py-2 px-3">Operator</th>
                    <th className="py-2 px-3 text-center">Tipe</th>
                    <th className="py-2 px-3 text-center">Koin</th>
                    <th className="py-2 px-3 text-center">Total Akhir</th>
                    <th className="py-2 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="align-top">
                      <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{log.petshopName}</td>
                      <td className="py-2 px-3 text-slate-600 font-semibold">{log.adminName}</td>
                      <td className="py-2 px-3 text-center uppercase font-bold">{log.tipe}</td>
                      <td className="py-2 px-3 text-center font-bold">{log.tipe === "tambah" ? "+" : "-"}{log.point}</td>
                      <td className="py-2 px-3 text-center font-bold bg-slate-50/50">{log.totalPointAfter}</td>
                      <td className="py-2 px-3 text-slate-500 italic max-w-[200px]">{log.keterangan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bottom Signature Lines */}
              <div className="pt-12 grid grid-cols-2 gap-12 text-center text-xs text-slate-700 print:pt-24">
                <div className="space-y-16">
                  <div>Dibuat Oleh:</div>
                  <div className="font-bold border-t border-slate-300 pt-1.5 w-1/2 mx-auto">Sistem Otomatisasi</div>
                </div>
                <div className="space-y-16">
                  <div>Disetujui Oleh:</div>
                  <div className="font-bold border-t border-slate-300 pt-1.5 w-1/2 mx-auto">Administrator Utama</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Global CSS Style for hiding other elements during printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-sheet, #print-sheet * {
            visibility: visible;
          }
          #print-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

    </div>
  );
}
