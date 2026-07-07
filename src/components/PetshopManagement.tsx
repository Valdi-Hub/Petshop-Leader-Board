import React, { useState } from "react";
import { 
  Plus, Edit2, Trash2, Key, Search, UserCheck, UserX, X, Mail, Phone, MapPin, 
  User, CheckCircle, AlertTriangle, Upload, ClipboardPaste, ArrowRight 
} from "lucide-react";
import { Petshop } from "../types";

interface PetshopManagementProps {
  petshops: (Petshop & { username: string })[];
  onRefresh: () => void;
  token: string;
}

export default function PetshopManagement({ petshops, onRefresh, token }: PetshopManagementProps) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"semua" | "aktif" | "nonaktif">("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  // Active petshop for edit or reset
  const [activePetshop, setActivePetshop] = useState<(Petshop & { username: string }) | null>(null);

  // Form inputs
  const [namaPetshop, setNamaPetshop] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [namaPemilik, setNamaPemilik] = useState("");
  const [email, setEmail] = useState("");
  const [telepon, setTelepon] = useState("");
  const [alamat, setAlamat] = useState("");
  const [status, setStatus] = useState<"aktif" | "nonaktif">("aktif");

  // Reset Password input
  const [newPassword, setNewPassword] = useState("");

  // Import states
  const [pasteData, setPasteData] = useState("");
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error" | null; msg: string }>({ type: null, msg: "" });
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);

  // Alert/Message states
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error" | null; msg: string }>({ type: null, msg: "" });

  const showToast = (type: "success" | "error", msg: string) => {
    setToastMsg({ type, msg });
    setTimeout(() => {
      setToastMsg({ type: null, msg: "" });
    }, 4000);
  };

  // Filter and search computation
  const filteredPetshops = petshops.filter((p) => {
    const matchesSearch = 
      p.namaPetshop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.namaPemilik.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "semua" ? true : p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredPetshops.length / itemsPerPage);
  const paginatedPetshops = filteredPetshops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset form inputs
  const resetForm = () => {
    setNamaPetshop("");
    setUsername("");
    setPassword("");
    setNamaPemilik("");
    setEmail("");
    setTelepon("");
    setAlamat("");
    setStatus("aktif");
    setActivePetshop(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditModal = (p: Petshop & { username: string }) => {
    setActivePetshop(p);
    setNamaPetshop(p.namaPetshop);
    setUsername(p.username); // Read-only during edit in standard systems
    setNamaPemilik(p.namaPemilik);
    setEmail(p.email);
    setTelepon(p.telepon);
    setAlamat(p.alamat);
    setStatus(p.status);
    setIsFormOpen(true);
  };

  const openResetModal = (p: Petshop & { username: string }) => {
    setActivePetshop(p);
    setNewPassword("");
    setIsResetOpen(true);
  };

  // Submit Add / Edit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: any = {
      namaPetshop,
      namaPemilik,
      email,
      telepon,
      alamat,
      status,
    };

    let url = "/api/admin/petshops";
    let method = "POST";

    if (activePetshop) {
      // Edit
      url = `/api/admin/petshops/${activePetshop.id}`;
      method = "PUT";
    } else {
      // Add
      payload.username = username;
      payload.password = password;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan petshop.");
      }

      showToast("success", data.message || "Petshop berhasil disimpan.");
      setIsFormOpen(false);
      resetForm();
      onRefresh();
    } catch (err: any) {
      showToast("error", err.message || "Terjadi kesalahan.");
    }
  };

  // Submit Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePetshop) return;

    try {
      const response = await fetch(`/api/admin/petshops/${activePetshop.id}/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mereset password.");
      }

      showToast("success", data.message || "Password berhasil diperbarui.");
      setIsResetOpen(false);
      setNewPassword("");
      setActivePetshop(null);
    } catch (err: any) {
      showToast("error", err.message || "Terjadi kesalahan.");
    }
  };

  // Delete Petshop Action
  const handleDeletePetshop = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus Petshop "${name}"?\nTindakan ini permanen dan akan menghapus semua riwayat koin petshop terkait.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/petshops/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus petshop.");
      }

      showToast("success", data.message || "Petshop berhasil dihapus.");
      onRefresh();
    } catch (err: any) {
      showToast("error", err.message || "Terjadi kesalahan.");
    }
  };

  // Parse Excel / CSV Copy Paste Data
  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPasteData(val);

    if (!val.trim()) {
      setParsedPreview([]);
      return;
    }

    const rows = val.split("\n");
    const parsed: any[] = [];

    // Columns format: Username | Password | Nama Petshop | Nama Pemilik | Email | Telepon | Alamat
    rows.forEach((row, idx) => {
      if (!row.trim()) return;
      
      // Split by tab (Excel Copy) or comma (CSV)
      const cols = row.includes("\t") ? row.split("\t") : row.split(",");
      if (cols.length >= 6) {
        parsed.push({
          username: cols[0]?.trim(),
          password: cols[1]?.trim(),
          namaPetshop: cols[2]?.trim(),
          namaPemilik: cols[3]?.trim(),
          email: cols[4]?.trim(),
          telepon: cols[5]?.trim(),
          alamat: cols[6]?.trim() || "-",
          isValid: cols[0] && cols[1] && cols[2] && cols[3] && cols[4] && cols[5],
        });
      }
    });

    setParsedPreview(parsed);
  };

  // File Upload Parser (Reads as CSV text)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setPasteData(text);
      
      // Parse CSV text
      const rows = text.split("\n");
      const parsed: any[] = [];

      rows.forEach((row, idx) => {
        if (!row.trim()) return;
        // Avoid header row if it contains descriptive words like 'username'
        if (idx === 0 && row.toLowerCase().includes("username") && row.toLowerCase().includes("password")) {
          return;
        }

        const cols = row.includes("\t") ? row.split("\t") : row.split(",");
        if (cols.length >= 6) {
          parsed.push({
            username: cols[0]?.replace(/^["']|["']$/g, "").trim(),
            password: cols[1]?.replace(/^["']|["']$/g, "").trim(),
            namaPetshop: cols[2]?.replace(/^["']|["']$/g, "").trim(),
            namaPemilik: cols[3]?.replace(/^["']|["']$/g, "").trim(),
            email: cols[4]?.replace(/^["']|["']$/g, "").trim(),
            telepon: cols[5]?.replace(/^["']|["']$/g, "").trim(),
            alamat: (cols[6] || "-").replace(/^["']|["']$/g, "").trim(),
            isValid: cols[0] && cols[1] && cols[2] && cols[3] && cols[4] && cols[5],
          });
        }
      });
      setParsedPreview(parsed);
    };
    reader.readAsText(file);
  };

  // Submit Bulk Import
  const handleBulkImport = async () => {
    const validItems = parsedPreview.filter(p => p.isValid);
    
    if (validItems.length === 0) {
      setImportStatus({ type: "error", msg: "Tidak ada baris data valid yang siap diimpor." });
      return;
    }

    try {
      const response = await fetch("/api/admin/petshops/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ items: validItems }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengimpor data.");
      }

      setImportStatus({ 
        type: "success", 
        msg: `Berhasil mengimpor ${data.successCount} Petshop!${data.skipCount > 0 ? ` Terlewati ${data.skipCount} baris.` : ""}` 
      });
      
      setTimeout(() => {
        setIsImportOpen(false);
        setPasteData("");
        setParsedPreview([]);
        setImportStatus({ type: null, msg: "" });
        onRefresh();
      }, 2500);

    } catch (err: any) {
      setImportStatus({ type: "error", msg: err.message || "Gagal menghubungi API server." });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Toast Alert */}
      {toastMsg.type && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-xl border shadow-lg transition duration-300 animate-slide-in ${
          toastMsg.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold">{toastMsg.msg}</span>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Mitra Petshop</h2>
          <p className="text-sm text-slate-500">Kelola informasi mitra, kredensial login, status aktif, dan import data massal.</p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition duration-150"
          >
            <Upload className="h-4 w-4" />
            Import Excel/CSV
          </button>
          
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#244e42] hover:bg-[#1c3e34] text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-200 transition duration-150"
          >
            <Plus className="h-4 w-4" />
            Tambah Petshop
          </button>
        </div>
      </div>

      {/* Search & Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Cari nama petshop, pemilik, username, atau email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="block w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#244e42] focus:border-[#244e42] text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
          <div className="inline-flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => { setStatusFilter("semua"); setCurrentPage(1); }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition duration-150 ${
                statusFilter === "semua" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Semua ({petshops.length})
            </button>
            <button
              onClick={() => { setStatusFilter("aktif"); setCurrentPage(1); }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition duration-150 ${
                statusFilter === "aktif" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Aktif ({petshops.filter(p => p.status === "aktif").length})
            </button>
            <button
              onClick={() => { setStatusFilter("nonaktif"); setCurrentPage(1); }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition duration-150 ${
                statusFilter === "nonaktif" ? "bg-rose-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Nonaktif ({petshops.filter(p => p.status === "nonaktif").length})
            </button>
          </div>
        </div>

      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Informasi Petshop</th>
                <th className="py-4 px-6">Kontak Pemilik</th>
                <th className="py-4 px-6 text-center">Status Akun</th>
                <th className="py-4 px-6 text-center">Total Poin</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedPetshops.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-base">
                    Tidak menemukan petshop yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                paginatedPetshops.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/30 transition duration-150">
                    {/* Petshop info */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800 text-base">{p.namaPetshop}</div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-slate-300" />
                          @{p.username}
                        </span>
                        <span>•</span>
                        <span>Dibuat: {new Date(p.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}</span>
                      </div>
                    </td>
                    
                    {/* Owner & Contact */}
                    <td className="py-4 px-6 space-y-1">
                      <div className="font-semibold text-slate-700">{p.namaPemilik}</div>
                      <div className="flex flex-col gap-0.5 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <Mail className="h-3.5 w-3.5 text-slate-300" />
                          {p.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-slate-300" />
                          {p.telepon}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        p.status === "aktif" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {p.status === "aktif" ? (
                          <>
                            <UserCheck className="h-3.5 w-3.5" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <UserX className="h-3.5 w-3.5" />
                            Nonaktif
                          </>
                        )}
                      </span>
                    </td>

                    {/* Total Points */}
                    <td className="py-4 px-6 text-center font-extrabold text-slate-900 text-base">
                      {p.totalPoints.toLocaleString("id-ID")}
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          title="Edit Data"
                          className="p-1.5 text-[#244e42] hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-lg transition duration-150"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => openResetModal(p)}
                          title="Reset Password"
                          className="p-1.5 text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 rounded-lg transition duration-150"
                        >
                          <Key className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDeletePetshop(p.id, p.namaPetshop)}
                          title="Hapus Petshop"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition duration-150"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Menampilkan {paginatedPetshops.length} dari {filteredPetshops.length} petshop
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 disabled:opacity-50 transition duration-150"
              >
                Sebelumnya
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition duration-150 ${
                    currentPage === idx + 1 
                      ? "bg-[#244e42] text-white shadow-sm" 
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 disabled:opacity-50 transition duration-150"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CRUD Add/Edit Dialog Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-[#244e42]" />
                {activePetshop ? "Edit Data Petshop" : "Tambah Petshop Baru"}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition duration-150"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 flex-1">
              
              {/* Row 1: Nama Petshop */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Petshop <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Happy Paws Pet Clinic"
                  value={namaPetshop}
                  onChange={(e) => setNamaPetshop(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#244e42]"
                />
              </div>

              {/* Row 2: Username & Password (Only on Create) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Username <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    disabled={!!activePetshop}
                    placeholder="caringpaws (tanpa spasi)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#244e42] disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
                
                {!activePetshop && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password <span className="text-rose-500">*</span></label>
                    <input
                      type="password"
                      required
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#244e42]"
                    />
                  </div>
                )}
              </div>

              {/* Row 3: Nama Pemilik & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Pemilik <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap owner"
                    value={namaPemilik}
                    onChange={(e) => setNamaPemilik(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#244e42]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email <span className="text-rose-500">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="owner@petshop.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#244e42]"
                  />
                </div>
              </div>

              {/* Row 4: No HP & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nomor HP / Telepon <span className="text-rose-500">*</span></label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={telepon}
                    onChange={(e) => setTelepon(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#244e42]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status Akun</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "aktif" | "nonaktif")}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#244e42]"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Alamat */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Alamat Lengkap</label>
                <textarea
                  placeholder="Ketik alamat lengkap petshop..."
                  rows={2}
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#244e42]"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-sm transition duration-150"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#244e42] hover:bg-[#1c3e34] text-white font-bold rounded-lg text-sm shadow-md shadow-emerald-200 transition duration-150"
                >
                  {activePetshop ? "Simpan Perubahan" : "Daftarkan Petshop"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetOpen && activePetshop && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-500" />
                Reset Password Petshop
              </h3>
              <button 
                onClick={() => setIsResetOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition duration-150"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Mitra Sasaran</span>
                <div className="font-bold text-slate-800 text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                  {activePetshop.namaPetshop} <span className="text-slate-400 font-normal">(@{activePetshop.username})</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password Baru <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ketik password baru minim 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[11px] text-amber-600 mt-1 flex items-start gap-1 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Mengganti password akan otomatis memutuskan semua sesi login aktif petshop ini.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResetOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-sm transition duration-150"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-sm transition duration-150"
                >
                  Reset Password Now
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Bulk Import Modal Dialog */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Upload className="h-5 w-5 text-[#244e42]" />
                Import Mitra dari Excel / CSV
              </h3>
              <button 
                onClick={() => setIsImportOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition duration-150"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              
              {/* Information / Instruction card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-800 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900 mb-1">
                  <CheckCircle className="h-4 w-4" />
                  Aturan Format Kolom Data:
                </div>
                <p>Mendukung file teks CSV atau Copy-Paste langsung baris kolom dari Microsoft Excel. Format kolom wajib berurutan sebagai berikut:</p>
                <div className="bg-white/80 p-2 rounded border border-emerald-100 font-mono text-[10px] text-emerald-900 overflow-x-auto whitespace-nowrap">
                  Username <span className="text-emerald-300">|</span> Password <span className="text-emerald-300">|</span> Nama Petshop <span className="text-emerald-300">|</span> Nama Pemilik <span className="text-emerald-300">|</span> Email <span className="text-emerald-300">|</span> Telepon <span className="text-emerald-300">|</span> Alamat (opsional)
                </div>
                <p className="italic text-[#244e42] font-medium">*Note: Pemisah antar kolom dapat berupa tombol Tab (bila copy dari excel) ataupun tanda koma (CSV).</p>
              </div>

              {/* Paste or Upload Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Upload Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Metode A: Upload File CSV</label>
                    <div className="border-2 border-dashed border-slate-200 hover:border-[#244e42] rounded-xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition duration-150 relative">
                      <input
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <span className="text-xs font-semibold text-slate-600 block">Klik atau seret file CSV/TXT ke sini</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Metode B: Tempel (Paste) Baris Excel</label>
                    <textarea
                      placeholder="Tempel data di sini... (Copy kolom dari excel lalu paste ke sini)"
                      rows={6}
                      value={pasteData}
                      onChange={handlePasteChange}
                      className="w-full p-3 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#244e42] focus:border-[#244e42]"
                    />
                  </div>
                </div>

                {/* Live Parser Preview */}
                <div className="border border-slate-100 rounded-xl bg-slate-50 p-4 flex flex-col max-h-[340px]">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Preview Deteksi ({parsedPreview.length} Baris)</span>
                  
                  <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                    {parsedPreview.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-12">
                        <ClipboardPaste className="h-8 w-8 text-slate-300 mb-2" />
                        Belum ada data dideteksi. Tempel baris excel atau upload CSV.
                      </div>
                    ) : (
                      parsedPreview.map((item, idx) => (
                        <div key={idx} className={`p-2.5 rounded-lg border text-xs flex justify-between items-start gap-2 ${
                          item.isValid 
                            ? "bg-white border-slate-200" 
                            : "bg-red-50 border-red-100 text-red-800"
                        }`}>
                          <div className="truncate flex-1">
                            <span className="font-bold text-slate-700 block truncate">{item.namaPetshop || "(Tanpa Nama)"}</span>
                            <span className="text-[10px] text-slate-400 font-medium">U: @{item.username} | P: {item.password}</span>
                          </div>
                          <div>
                            {item.isValid ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold text-[9px] uppercase tracking-wider">Ready</span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-extrabold text-[9px] uppercase tracking-wider">Gagal</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Status Alert */}
              {importStatus.type && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
                  importStatus.type === "success" 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}>
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <span className="font-bold">{importStatus.msg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsImportOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-sm transition duration-150"
                >
                  Batal
                </button>
                <button
                  onClick={handleBulkImport}
                  disabled={parsedPreview.filter(p => p.isValid).length === 0}
                  className="px-5 py-2 bg-[#244e42] hover:bg-[#1c3e34] text-white font-bold rounded-lg text-sm shadow-md shadow-emerald-200 transition duration-150 disabled:opacity-40"
                >
                  Mulai Impor ({parsedPreview.filter(p => p.isValid).length} Petshop) &rarr;
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
