import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, Users, Coins, FileText, Trophy, LogOut, 
  Menu, X, PawPrint, Calendar, RefreshCw, User as UserIcon
} from "lucide-react";

import AuthLogin from "./components/AuthLogin";
import DashboardOverview from "./components/DashboardOverview";
import PetshopManagement from "./components/PetshopManagement";
import PointManagement from "./components/PointManagement";
import PointHistoryLogs from "./components/PointHistoryLogs";
import LeaderboardView from "./components/LeaderboardView";
import PetshopPortal from "./components/PetshopPortal";

import { User, Petshop } from "./types";

export default function App() {
  // Session states
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [petshopInfo, setPetshopInfo] = useState<any | null>(null);

  // Layout navigation states
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data states (Shared for Admin views)
  const [petshops, setPetshops] = useState<(Petshop & { username: string })[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [settings, setSettings] = useState({ logoUrl: "", appName: "Leaderboard Petshop" });

  // Load settings and session from sessionStorage on startup
  useEffect(() => {
    // Restore session
    const savedToken = sessionStorage.getItem("petshop_token");
    const savedUser = sessionStorage.getItem("petshop_user");
    const savedPetshop = sessionStorage.getItem("petshop_info");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      if (savedPetshop) {
        setPetshopInfo(JSON.parse(savedPetshop));
      }
    }

    // Load settings
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.appName) {
          setSettings(data);
        }
      })
      .catch((err) => console.error("Gagal mengambil konfigurasi branding:", err));
  }, []);

  // Fetch petshops & stats if logged in as Admin
  const fetchAdminData = async (activeToken: string) => {
    setLoadingStats(true);
    try {
      // Fetch petshops
      const petshopsRes = await fetch("/api/admin/petshops", {
        headers: { "Authorization": `Bearer ${activeToken}` }
      });
      const petshopsData = await petshopsRes.json();
      if (petshopsRes.ok) {
        setPetshops(petshopsData);
      }

      // Fetch dashboard stats
      const statsRes = await fetch("/api/admin/dashboard-stats", {
        headers: { "Authorization": `Bearer ${activeToken}` }
      });
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setStats(statsData);
      }
    } catch (err) {
      console.error("Gagal memuat data admin:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Trigger refresh of data when Admin changes tabs or triggers manually
  useEffect(() => {
    if (token && user && user.role === "admin") {
      fetchAdminData(token);
    }
  }, [token, user, activeTab]);

  const handleLoginSuccess = (newToken: string, loggedUser: User, petshopMetadata: any) => {
    setToken(newToken);
    setUser(loggedUser);
    setPetshopInfo(petshopMetadata);

    sessionStorage.setItem("petshop_token", newToken);
    sessionStorage.setItem("petshop_user", JSON.stringify(loggedUser));
    if (petshopMetadata) {
      sessionStorage.setItem("petshop_info", JSON.stringify(petshopMetadata));
    } else {
      sessionStorage.removeItem("petshop_info");
    }

    // Set initial view based on role
    if (loggedUser.role === "admin") {
      setActiveTab("dashboard");
      fetchAdminData(newToken);
    }
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Failed to call logout API:", err);
      }
    }

    setToken(null);
    setUser(null);
    setPetshopInfo(null);
    setStats(null);
    setPetshops([]);
    sessionStorage.removeItem("petshop_token");
    sessionStorage.removeItem("petshop_user");
    sessionStorage.removeItem("petshop_info");
  };

  // If not logged in, show Auth Login Screen
  if (!token || !user) {
    return <AuthLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // If logged in as Petshop, show customized Petshop Portal Layout
  if (user.role === "petshop") {
    return <PetshopPortal token={token} onLogout={handleLogout} />;
  }

  // Define sidebar navigation items for Admin
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "petshops", label: "Mitra Petshop", icon: Users },
    { id: "points", label: "Update Koin", icon: Coins },
    { id: "logs", label: "Histori & Log", icon: FileText },
    { id: "leaderboard", label: "Klasemen Poin", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* 1. Mobile Top Bar (Hidden on desktop) */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo"
              referrerPolicy="no-referrer"
              className="h-8 w-8 object-cover rounded bg-white p-0.5"
            />
          ) : (
            <div className="h-8 w-8 bg-[#244e42] rounded flex items-center justify-center text-white">
              <PawPrint className="h-4.5 w-4.5" />
            </div>
          )}
          <span className="font-extrabold tracking-tight text-sm truncate max-w-[180px]">{settings.appName}</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* 2. Responsive Left Sidebar (For desktop, or as menu Drawer on mobile) */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen shrink-0
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
          {settings.logoUrl ? (
            <div className="h-10 w-10 flex items-center justify-center bg-white border border-slate-800 p-1 rounded-xl shadow-md">
              <img
                src={settings.logoUrl}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="h-8 w-8 object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="h-10 w-10 bg-[#244e42] rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-950/50">
              <PawPrint className="h-5.5 w-5.5" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-black text-white text-sm leading-tight truncate">{settings.appName}</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Admin Portal</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition duration-150 ${
                  isActive 
                    ? "bg-[#244e42] text-white shadow-lg shadow-emerald-950/40" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <IconComponent className="h-5 w-5 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer Admin Info & Logout */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/20">
          <div className="flex items-center gap-3 px-2 py-1.5 mb-4">
            <div className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-300">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-slate-200 block text-xs truncate">Administrator</span>
              <span className="text-[10px] font-semibold text-emerald-500 block">Sesi Aktif</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-rose-400 font-bold rounded-xl text-xs transition duration-150"
          >
            <LogOut className="h-4 w-4" />
            Keluar Sistem
          </button>
        </div>

      </div>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto">
        <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          
          {/* Top Refresh Control */}
          <div className="flex justify-end mb-4 print:hidden">
            <button
              onClick={() => token && fetchAdminData(token)}
              disabled={loadingStats}
              title="Refresh Data"
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-slate-700 font-semibold text-xs transition bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingStats ? "animate-spin" : ""}`} />
              {loadingStats ? "Sedang Memuat..." : "Refresh Klasemen"}
            </button>
          </div>

          {/* Render Tab Panel */}
          {activeTab === "dashboard" && stats && (
            <DashboardOverview stats={stats} onNavigate={setActiveTab} />
          )}

          {activeTab === "petshops" && (
            <PetshopManagement 
              petshops={petshops} 
              token={token} 
              onRefresh={() => fetchAdminData(token)} 
            />
          )}

          {activeTab === "points" && (
            <PointManagement 
              petshops={petshops} 
              token={token} 
              onRefresh={() => fetchAdminData(token)} 
            />
          )}

          {activeTab === "logs" && (
            <PointHistoryLogs petshops={petshops} token={token} />
          )}

          {activeTab === "leaderboard" && (
            <LeaderboardView />
          )}

        </main>
      </div>

    </div>
  );
}
