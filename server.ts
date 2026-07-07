import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import bcrypt from "bcryptjs";

// Database File Path
const DB_FILE = path.join(process.cwd(), "database.json");

// Define in-memory database structure
interface UserRow {
  id: string;
  username: string;
  passwordHash: string;
  role: "admin" | "petshop";
}

interface PetshopRow {
  id: string;
  userId: string;
  namaPetshop: string;
  namaPemilik: string;
  email: string;
  telepon: string;
  alamat: string;
  status: "aktif" | "nonaktif";
  createdAt: string;
  totalPoints: number;
  lastPointUpdateAt: string;
}

interface PointLogRow {
  id: string;
  petshopId: string;
  petshopName: string;
  adminId: string;
  adminName: string;
  point: number;
  tipe: "tambah" | "kurang";
  keterangan: string;
  totalPointAfter: number;
  createdAt: string;
}

interface SessionRow {
  token: string;
  userId: string;
  createdAt: string;
}

interface SettingsRow {
  logoUrl: string;
  appName: string;
}

interface DBStructure {
  users: UserRow[];
  petshops: PetshopRow[];
  pointLogs: PointLogRow[];
  sessions: SessionRow[];
  settings: SettingsRow;
}

// In-Memory Database State
let db: DBStructure = {
  users: [],
  petshops: [],
  pointLogs: [],
  sessions: [],
  settings: {
    logoUrl: "",
    appName: "Leaderboard Petshop"
  }
};

// Helper to Load DB
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(content);
      if (!db.settings) {
        db.settings = {
          logoUrl: "",
          appName: "Leaderboard Petshop"
        };
      }
    } else {
      seedDB();
    }
  } catch (error) {
    console.error("Failed to load database, using defaults:", error);
    seedDB();
  }
}

// Helper to Save DB
function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save database:", error);
  }
}

// Seed Initial Data
function seedDB() {
  const adminSalt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync("@Adminerapet123", adminSalt);

  const petshopSalt = bcrypt.genSaltSync(10);
  const petshopPass1 = bcrypt.hashSync("paws123", petshopSalt);
  const petshopPass2 = bcrypt.hashSync("meow123", petshopSalt);
  const petshopPass3 = bcrypt.hashSync("tail123", petshopSalt);
  const petshopPass4 = bcrypt.hashSync("groom123", petshopSalt);
  const petshopPass5 = bcrypt.hashSync("health123", petshopSalt);

  db = {
    users: [
      {
        id: "usr-admin",
        username: "adminerapet",
        passwordHash: adminPasswordHash,
        role: "admin",
      },
      {
        id: "usr-ps1",
        username: "caringpaws",
        passwordHash: petshopPass1,
        role: "petshop",
      },
      {
        id: "usr-ps2",
        username: "meowpet",
        passwordHash: petshopPass2,
        role: "petshop",
      },
      {
        id: "usr-ps3",
        username: "happytail",
        passwordHash: petshopPass3,
        role: "petshop",
      },
      {
        id: "usr-ps4",
        username: "groominghouse",
        passwordHash: petshopPass4,
        role: "petshop",
      },
      {
        id: "usr-ps5",
        username: "healthypets",
        passwordHash: petshopPass5,
        role: "petshop",
      },
    ],
    petshops: [
      {
        id: "ps-1",
        userId: "usr-ps1",
        namaPetshop: "Caring Paws Petshop",
        namaPemilik: "Ahmad Prasetyo",
        email: "ahmad@caringpaws.com",
        telepon: "081234567890",
        alamat: "Jl. Merdeka No. 12, Jakarta",
        status: "aktif",
        createdAt: "2026-01-10T10:00:00.000Z",
        totalPoints: 1500,
        lastPointUpdateAt: "2026-07-02T15:30:00.000Z",
      },
      {
        id: "ps-2",
        userId: "usr-ps2",
        namaPetshop: "Meow Pet Shop & Clinic",
        namaPemilik: "Siti Rahmawati",
        email: "siti@meowpet.com",
        telepon: "082345678901",
        alamat: "Jl. Sudirman No. 45, Bandung",
        status: "aktif",
        createdAt: "2026-01-15T11:00:00.000Z",
        totalPoints: 2100,
        lastPointUpdateAt: "2026-07-05T09:15:00.000Z",
      },
      {
        id: "ps-3",
        userId: "usr-ps3",
        namaPetshop: "Happy Tail Pet Care",
        namaPemilik: "Budi Santoso",
        email: "budi@happytail.com",
        telepon: "083456789012",
        alamat: "Jl. Diponegoro No. 88, Surabaya",
        status: "aktif",
        createdAt: "2026-02-01T09:30:00.000Z",
        totalPoints: 950,
        lastPointUpdateAt: "2026-06-28T14:20:00.000Z",
      },
      {
        id: "ps-4",
        userId: "usr-ps4",
        namaPetshop: "Grooming House Specialist",
        namaPemilik: "Dewi Lestari",
        email: "dewi@groominghouse.com",
        telepon: "084567890123",
        alamat: "Jl. Gajah Mada No. 101, Yogyakarta",
        status: "aktif",
        createdAt: "2026-02-10T14:15:00.000Z",
        totalPoints: 1200,
        lastPointUpdateAt: "2026-07-01T11:00:00.000Z",
      },
      {
        id: "ps-5",
        userId: "usr-ps5",
        namaPetshop: "Healthy Pets & Feed",
        namaPemilik: "Eko Wijaya",
        email: "eko@healthypets.com",
        telepon: "085678901234",
        alamat: "Jl. Pemuda No. 7, Semarang",
        status: "aktif",
        createdAt: "2026-03-05T08:00:00.000Z",
        totalPoints: 1800,
        lastPointUpdateAt: "2026-07-04T16:45:00.000Z",
      },
    ],
    pointLogs: [
      // Caring Paws Logs
      {
        id: "log-1",
        petshopId: "ps-1",
        petshopName: "Caring Paws Petshop",
        adminId: "usr-admin",
        adminName: "Administrator",
        point: 500,
        tipe: "tambah",
        keterangan: "Poin awal pendaftaran petshop",
        totalPointAfter: 500,
        createdAt: "2026-01-10T10:30:00.000Z",
      },
      {
        id: "log-2",
        petshopId: "ps-1",
        petshopName: "Caring Paws Petshop",
        adminId: "usr-admin",
        adminName: "Administrator",
        point: 1000,
        tipe: "tambah",
        keterangan: "Sponsorship event pet festival",
        totalPointAfter: 1500,
        createdAt: "2026-07-02T15:30:00.000Z",
      },
      // Meow Pet Shop Logs
      {
        id: "log-3",
        petshopId: "ps-2",
        petshopName: "Meow Pet Shop & Clinic",
        adminId: "usr-admin",
        adminName: "Administrator",
        point: 800,
        tipe: "tambah",
        keterangan: "Poin pendaftaran & kelengkapan profil",
        totalPointAfter: 800,
        createdAt: "2026-01-15T12:00:00.000Z",
      },
      {
        id: "log-4",
        petshopId: "ps-2",
        petshopName: "Meow Pet Shop & Clinic",
        adminId: "usr-admin",
        adminName: "Administrator",
        point: 1300,
        tipe: "tambah",
        keterangan: "Pencapaian penjualan pakan terbanyak Q1",
        totalPointAfter: 2100,
        createdAt: "2026-07-05T09:15:00.000Z",
      },
      // Happy Tail Logs
      {
        id: "log-5",
        petshopId: "ps-3",
        petshopName: "Happy Tail Pet Care",
        adminId: "usr-admin",
        adminName: "Administrator",
        point: 600,
        tipe: "tambah",
        keterangan: "Poin registrasi",
        totalPointAfter: 600,
        createdAt: "2026-02-01T10:00:00.000Z",
      },
      {
        id: "log-6",
        petshopId: "ps-3",
        petshopName: "Happy Tail Pet Care",
        adminId: "usr-admin",
        adminName: "Administrator",
        point: 350,
        tipe: "tambah",
        keterangan: "Mengikuti seminar kesehatan hewan",
        totalPointAfter: 950,
        createdAt: "2026-06-28T14:20:00.000Z",
      },
      // Grooming House Logs
      {
        id: "log-7",
        petshopId: "ps-4",
        petshopName: "Grooming House Specialist",
        adminId: "usr-admin",
        adminName: "Administrator",
        point: 1200,
        tipe: "tambah",
        keterangan: "Juara 1 Lomba Grooming Nasional 2026",
        totalPointAfter: 1200,
        createdAt: "2026-07-01T11:00:00.000Z",
      },
      // Healthy Pets Logs
      {
        id: "log-8",
        petshopId: "ps-5",
        petshopName: "Healthy Pets & Feed",
        adminId: "usr-admin",
        adminName: "Administrator",
        point: 1000,
        tipe: "tambah",
        keterangan: "Registrasi outlet cabang baru",
        totalPointAfter: 1000,
        createdAt: "2026-03-05T09:00:00.000Z",
      },
      {
        id: "log-9",
        petshopId: "ps-5",
        petshopName: "Healthy Pets & Feed",
        adminId: "usr-admin",
        adminName: "Administrator",
        point: 800,
        tipe: "tambah",
        keterangan: "Kontribusi kampanye adopsi kucing",
        totalPointAfter: 1800,
        createdAt: "2026-07-04T16:45:00.000Z",
      },
    ],
    sessions: [],
    settings: {
      logoUrl: "",
      appName: "Leaderboard Petshop"
    }
  };
  saveDB();
}

// Start Server Wrapper
async function startServer() {
  loadDB();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS headers for local/iframe flexibility
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Authentication Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Akses ditolak. Token tidak disediakan." });
    }

    const session = db.sessions.find((s) => s.token === token);
    if (!session) {
      return res.status(403).json({ message: "Token tidak valid atau kedaluwarsa." });
    }

    const user = db.users.find((u) => u.id === session.userId);
    if (!user) {
      return res.status(403).json({ message: "User tidak ditemukan." });
    }

    req.user = user;
    next();
  };

  // Admin-Only Middleware
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak. Memerlukan hak akses Admin." });
    }
    next();
  };

  // API ROUTE: Login
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password wajib diisi." });
    }

    // Find user
    const user = db.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: "Username atau password salah." });
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Username atau password salah." });
    }

    // Check if petshop is nonaktif
    let petshopInfo: PetshopRow | undefined;
    if (user.role === "petshop") {
      petshopInfo = db.petshops.find((p) => p.userId === user.id);
      if (petshopInfo && petshopInfo.status === "nonaktif") {
        return res.status(403).json({ message: "Akun Petshop Anda sedang dinonaktifkan oleh Admin." });
      }
    }

    // Generate token (simple random string)
    const token = "token-" + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

    // Save session
    db.sessions.push({
      token,
      userId: user.id,
      createdAt: new Date().toISOString(),
    });
    saveDB();

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      petshop: petshopInfo
        ? {
            id: petshopInfo.id,
            namaPetshop: petshopInfo.namaPetshop,
            namaPemilik: petshopInfo.namaPemilik,
            email: petshopInfo.email,
          }
        : null,
    });
  });

  // API ROUTE: Logout
  app.post("/api/auth/logout", authenticateToken, (req: any, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      db.sessions = db.sessions.filter((s) => s.token !== token);
      saveDB();
    }
    res.json({ message: "Berhasil logout." });
  });

  // API ROUTE: Leaderboard (Public/Both roles can access)
  app.get("/api/leaderboard", (req, res) => {
    // Sort petshops: Total Points DESC, then lastPointUpdateAt ASC (whoever reached/updated first is ranked higher)
    const sortedPetshops = [...db.petshops].sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return new Date(a.lastPointUpdateAt).getTime() - new Date(b.lastPointUpdateAt).getTime();
    });

    const leaderboard = sortedPetshops.map((p, idx) => ({
      rank: idx + 1,
      id: p.id,
      namaPetshop: p.namaPetshop,
      namaPemilik: p.namaPemilik,
      totalPoints: p.totalPoints,
      status: p.status,
      lastUpdated: p.lastPointUpdateAt,
    }));

    res.json(leaderboard);
  });

  // GET Settings (Public)
  app.get("/api/settings", (req, res) => {
    res.json(db.settings || { logoUrl: "", appName: "Leaderboard Petshop" });
  });

  // POST Settings (Admin Only)
  app.post("/api/admin/settings", authenticateToken, requireAdmin, (req, res) => {
    const { logoUrl, appName } = req.body;
    if (!appName) {
      return res.status(400).json({ message: "Nama aplikasi (app title) wajib diisi." });
    }
    db.settings = {
      logoUrl: logoUrl || "",
      appName: appName.trim(),
    };
    saveDB();
    res.json({ message: "Pengaturan logo & judul berhasil diperbarui.", settings: db.settings });
  });

  // ================= ADMIN ROUTES =================

  // Admin Dashboard Stats
  app.get("/api/admin/dashboard-stats", authenticateToken, requireAdmin, (req, res) => {
    const totalPetshops = db.petshops.length;
    const totalPointsGiven = db.pointLogs.reduce((sum, log) => {
      return log.tipe === "tambah" ? sum + log.point : sum - log.point;
    }, 0);

    // Top 10 sorted
    const sortedPetshops = [...db.petshops].sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return new Date(a.lastPointUpdateAt).getTime() - new Date(b.lastPointUpdateAt).getTime();
    });

    const topPetshops = sortedPetshops.slice(0, 10).map((p, idx) => ({
      rank: idx + 1,
      id: p.id,
      namaPetshop: p.namaPetshop,
      totalPoints: p.totalPoints,
    }));

    // Recent point activities (last 5 logs)
    const recentActivities = [...db.pointLogs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    res.json({
      totalPetshops,
      totalPointsGiven,
      topPetshops,
      recentActivities,
    });
  });

  // Admin CRUD: Get Petshops
  app.get("/api/admin/petshops", authenticateToken, requireAdmin, (req, res) => {
    // Join with username
    const result = db.petshops.map((p) => {
      const u = db.users.find((user) => user.id === p.userId);
      return {
        ...p,
        username: u ? u.username : "",
      };
    });
    res.json(result);
  });

  // Admin CRUD: Create Petshop
  app.post("/api/admin/petshops", authenticateToken, requireAdmin, (req, res) => {
    const {
      username,
      password,
      namaPetshop,
      namaPemilik,
      email,
      telepon,
      alamat,
      status,
    } = req.body;

    // Validation
    if (!username || !password || !namaPetshop || !namaPemilik || !email || !telepon) {
      return res.status(400).json({ message: "Harap isi semua kolom wajib (username, password, nama petshop, pemilik, email, telepon)." });
    }

    // Check if username already exists
    const exists = db.users.some((u) => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      return res.status(400).json({ message: `Username "${username}" sudah digunakan.` });
    }

    const userId = "usr-" + Math.random().toString(36).substring(2, 9);
    const petshopId = "ps-" + Math.random().toString(36).substring(2, 9);

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Create user row
    const newUser: UserRow = {
      id: userId,
      username: username.toLowerCase().trim(),
      passwordHash,
      role: "petshop",
    };

    // Create petshop row
    const newPetshop: PetshopRow = {
      id: petshopId,
      userId,
      namaPetshop,
      namaPemilik,
      email,
      telepon,
      alamat: alamat || "",
      status: status || "aktif",
      createdAt: new Date().toISOString(),
      totalPoints: 0,
      lastPointUpdateAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.petshops.push(newPetshop);
    saveDB();

    res.status(201).json({
      message: "Petshop berhasil ditambahkan.",
      petshop: {
        id: petshopId,
        username: newUser.username,
        namaPetshop: newPetshop.namaPetshop,
        namaPemilik: newPetshop.namaPemilik,
      },
    });
  });

  // Admin CRUD: Update Petshop
  app.put("/api/admin/petshops/:id", authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    const {
      namaPetshop,
      namaPemilik,
      email,
      telepon,
      alamat,
      status,
    } = req.body;

    const petshopIdx = db.petshops.findIndex((p) => p.id === id);
    if (petshopIdx === -1) {
      return res.status(404).json({ message: "Petshop tidak ditemukan." });
    }

    if (!namaPetshop || !namaPemilik || !email || !telepon) {
      return res.status(400).json({ message: "Harap isi semua kolom wajib (nama petshop, pemilik, email, telepon)." });
    }

    // Update properties
    db.petshops[petshopIdx] = {
      ...db.petshops[petshopIdx],
      namaPetshop,
      namaPemilik,
      email,
      telepon,
      alamat: alamat || "",
      status: status || "aktif",
    };

    saveDB();
    res.json({ message: "Data petshop berhasil diperbarui.", petshop: db.petshops[petshopIdx] });
  });

  // Admin CRUD: Reset Password Petshop
  app.put("/api/admin/petshops/:id/reset-password", authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "Password baru wajib diisi." });
    }

    const petshop = db.petshops.find((p) => p.id === id);
    if (!petshop) {
      return res.status(404).json({ message: "Petshop tidak ditemukan." });
    }

    const userIdx = db.users.findIndex((u) => u.id === petshop.userId);
    if (userIdx === -1) {
      return res.status(404).json({ message: "User terkait petshop tidak ditemukan." });
    }

    const salt = bcrypt.genSaltSync(10);
    db.users[userIdx].passwordHash = bcrypt.hashSync(newPassword, salt);

    // Evict sessions for this user so they are forced to log in again with new password
    db.sessions = db.sessions.filter((s) => s.userId !== petshop.userId);

    saveDB();
    res.json({ message: `Password petshop "${petshop.namaPetshop}" berhasil di-reset.` });
  });

  // Admin CRUD: Delete Petshop
  app.delete("/api/admin/petshops/:id", authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;

    const petshopIdx = db.petshops.findIndex((p) => p.id === id);
    if (petshopIdx === -1) {
      return res.status(404).json({ message: "Petshop tidak ditemukan." });
    }

    const petshop = db.petshops[petshopIdx];
    const userId = petshop.userId;

    // Delete petshop, user, sessions, and point logs
    db.petshops.splice(petshopIdx, 1);
    db.users = db.users.filter((u) => u.id !== userId);
    db.sessions = db.sessions.filter((s) => s.userId !== userId);
    db.pointLogs = db.pointLogs.filter((l) => l.petshopId !== id);

    saveDB();
    res.json({ message: "Petshop beserta seluruh data point log berhasil dihapus." });
  });

  // Admin CRUD: Bulk Import Petshops (JSON/CSV)
  app.post("/api/admin/petshops/import", authenticateToken, requireAdmin, (req, res) => {
    const { items } = req.body; // Array of { username, password, namaPetshop, namaPemilik, email, telepon, alamat }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Format data import salah atau kosong." });
    }

    let successCount = 0;
    let skipCount = 0;
    const skippedUsernames: string[] = [];

    const salt = bcrypt.genSaltSync(10);

    for (const item of items) {
      const { username, password, namaPetshop, namaPemilik, email, telepon, alamat } = item;

      if (!username || !password || !namaPetshop || !namaPemilik || !email || !telepon) {
        skipCount++;
        continue;
      }

      const exists = db.users.some((u) => u.username.toLowerCase() === username.toLowerCase().trim());
      if (exists) {
        skippedUsernames.push(username);
        skipCount++;
        continue;
      }

      const userId = "usr-" + Math.random().toString(36).substring(2, 9);
      const petshopId = "ps-" + Math.random().toString(36).substring(2, 9);
      const passwordHash = bcrypt.hashSync(password, salt);

      // Create user
      db.users.push({
        id: userId,
        username: username.toLowerCase().trim(),
        passwordHash,
        role: "petshop",
      });

      // Create petshop
      db.petshops.push({
        id: petshopId,
        userId,
        namaPetshop: namaPetshop.trim(),
        namaPemilik: namaPemilik.trim(),
        email: email.trim(),
        telepon: telepon.trim(),
        alamat: alamat ? alamat.trim() : "",
        status: "aktif",
        createdAt: new Date().toISOString(),
        totalPoints: 0,
        lastPointUpdateAt: new Date().toISOString(),
      });

      successCount++;
    }

    if (successCount > 0) {
      saveDB();
    }

    res.json({
      message: `Berhasil mengimpor ${successCount} Petshop.${skipCount > 0 ? ` Lewatkan ${skipCount} data karena konflik atau data tidak lengkap.` : ""}`,
      successCount,
      skipCount,
      skippedUsernames,
    });
  });

  // Admin Management Point: Add/Subtract Points
  app.post("/api/admin/points", authenticateToken, requireAdmin, (req: any, res) => {
    const { petshopId, point, tipe, keterangan } = req.body;

    if (!petshopId || point === undefined || !tipe || !keterangan) {
      return res.status(400).json({ message: "Data penambahan/pengurangan point tidak lengkap." });
    }

    const parsedPoint = parseInt(point, 10);
    if (isNaN(parsedPoint) || parsedPoint <= 0) {
      return res.status(400).json({ message: "Jumlah point harus berupa angka positif." });
    }

    const petshopIdx = db.petshops.findIndex((p) => p.id === petshopId);
    if (petshopIdx === -1) {
      return res.status(404).json({ message: "Petshop tidak ditemukan." });
    }

    const petshop = db.petshops[petshopIdx];

    // Calculate new total points
    let finalPointDiff = tipe === "tambah" ? parsedPoint : -parsedPoint;
    const previousTotal = petshop.totalPoints;
    let newTotal = previousTotal + finalPointDiff;

    // Prevent negative points if business logic dictates (often points can't go below 0)
    if (newTotal < 0) {
      newTotal = 0;
      finalPointDiff = -previousTotal; // adjust actual point changed
    }

    const now = new Date().toISOString();

    // Create unique ID for log
    const logId = "log-" + Math.random().toString(36).substring(2, 9);

    const newLog: PointLogRow = {
      id: logId,
      petshopId: petshop.id,
      petshopName: petshop.namaPetshop,
      adminId: req.user.id,
      adminName: req.user.username === "admin" ? "Administrator" : req.user.username,
      point: parsedPoint, // Keep magnitude in log, or keep original? Magnitude is cleaner
      tipe: tipe as "tambah" | "kurang",
      keterangan: keterangan,
      totalPointAfter: newTotal,
      createdAt: now,
    };

    // Update petshop total points & updated timestamp
    db.petshops[petshopIdx].totalPoints = newTotal;
    db.petshops[petshopIdx].lastPointUpdateAt = now;

    db.pointLogs.push(newLog);
    saveDB();

    res.json({
      message: `Poin petshop "${petshop.namaPetshop}" berhasil diperbarui. Total poin saat ini: ${newTotal}.`,
      log: newLog,
    });
  });

  // Admin Logs Filter & Fetch (Excel and PDF views will fetch this complete list too)
  app.get("/api/admin/logs", authenticateToken, requireAdmin, (req, res) => {
    const { petshopId, startDate, endDate, search } = req.query;

    let filtered = [...db.pointLogs];

    // Filter petshop
    if (petshopId) {
      filtered = filtered.filter((l) => l.petshopId === petshopId);
    }

    // Filter start date
    if (startDate) {
      const start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((l) => new Date(l.createdAt) >= start);
    }

    // Filter end date
    if (endDate) {
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((l) => new Date(l.createdAt) <= end);
    }

    // Search query
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.petshopName.toLowerCase().includes(q) ||
          l.keterangan.toLowerCase().includes(q) ||
          l.adminName.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(filtered);
  });

  // ================= PETSHOP PORTAL ROUTES =================

  // Petshop Personal Dashboard Details
  app.get("/api/petshop/dashboard", authenticateToken, (req: any, res) => {
    if (req.user.role !== "petshop") {
      return res.status(403).json({ message: "Akses khusus portal petshop." });
    }

    const petshop = db.petshops.find((p) => p.userId === req.user.id);
    if (!petshop) {
      return res.status(404).json({ message: "Detail petshop tidak ditemukan." });
    }

    // Count rank
    const sortedPetshops = [...db.petshops].sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return new Date(a.lastPointUpdateAt).getTime() - new Date(b.lastPointUpdateAt).getTime();
    });

    const rankIdx = sortedPetshops.findIndex((p) => p.id === petshop.id);
    const currentRank = rankIdx !== -1 ? rankIdx + 1 : 0;
    const totalParticipants = db.petshops.length;

    // Get personal point logs (history) sorted newest first
    const historyLogs = db.pointLogs
      .filter((l) => l.petshopId === petshop.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Top 10 Leaderboard
    const topPetshops = sortedPetshops.slice(0, 10).map((p, idx) => ({
      rank: idx + 1,
      id: p.id,
      namaPetshop: p.namaPetshop,
      totalPoints: p.totalPoints,
    }));

    // Generate monthly chart values (grouped by month of current year 2026)
    // Month abbreviations
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    // Track cumulative total running up to each month
    // Let's calculate the cumulative point balance at the end of each month in 2026
    const chartData = months.map((monthName, monthIndex) => {
      // Find cumulative points up to the last millisecond of this month
      const targetYear = 2026;
      const endOfMonth = new Date(targetYear, monthIndex + 1, 0, 23, 59, 59, 999);

      // Sum initial points/adjustments of logs before endOfMonth
      const personalLogsUpToMonth = db.pointLogs.filter(
        (l) => l.petshopId === petshop.id && new Date(l.createdAt) <= endOfMonth
      );

      // Sort chronological to compute the last point after update
      const sortedLogs = [...personalLogsUpToMonth].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const cumulativePoints = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1].totalPointAfter : 0;

      return {
        month: monthName,
        points: cumulativePoints,
      };
    });

    res.json({
      petshop: {
        id: petshop.id,
        namaPetshop: petshop.namaPetshop,
        namaPemilik: petshop.namaPemilik,
        email: petshop.email,
        telepon: petshop.telepon,
        alamat: petshop.alamat,
        status: petshop.status,
      },
      currentPoints: petshop.totalPoints,
      currentRank,
      totalParticipants,
      topLeaderboard: topPetshops,
      historyLogs,
      chartData,
    });
  });

  // ================= STATIC FILES / VITE SERVING =================

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
