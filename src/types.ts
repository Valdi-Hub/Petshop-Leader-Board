export interface User {
  id: string;
  username: string;
  role: 'admin' | 'petshop';
}

export interface Petshop {
  id: string;
  userId: string;
  namaPetshop: string;
  namaPemilik: string;
  email: string;
  telepon: string;
  alamat: string;
  status: 'aktif' | 'nonaktif';
  createdAt: string;
  totalPoints: number;
  lastPointUpdateAt: string;
}

export interface PointLog {
  id: string;
  petshopId: string;
  petshopName: string;
  adminId: string;
  adminName: string;
  point: number; // positive or negative
  tipe: 'tambah' | 'kurang';
  keterangan: string;
  totalPointAfter: number;
  createdAt: string;
}

export interface DashboardStats {
  totalPetshops: number;
  totalPointsGiven: number;
  topPetshops: {
    rank: number;
    id: string;
    namaPetshop: string;
    totalPoints: number;
  }[];
  recentActivities: PointLog[];
}
