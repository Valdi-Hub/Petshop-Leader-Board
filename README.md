# 👑 Sistem Leaderboard & Portal Mitra Petshop

Sistem manajemen koin, peringkat, dan leaderboard petshop realtime yang andal dan mudah dikembangkan. Proyek ini dibangun menggunakan **React (TypeScript)** di sisi client, didukung oleh **Express (TypeScript)** di sisi server, serta menggunakan **Tailwind CSS** dengan pemisahan desain antarmuka yang dipusatkan pada file CSS eksternal.

---

## 💻 Panduan Menjalankan & Mengedit di Visual Studio / VS Code

Proyek ini sepenuhnya kompatibel dengan **Visual Studio Code (VS Code)** atau **Visual Studio (2022+)** yang memiliki beban kerja pengembangan web Node.js.

### 📋 Prasyarat Sistem
Pastikan Anda telah memasang:
1. **Node.js** (Sangat disarankan Versi 18 LTS atau lebih baru)
2. **VS Code** (atau Visual Studio dengan modul pengembangan Node.js)

---

### 🚀 Cara Menjalankan Proyek Secara Lokal

1. **Unduh atau Ekstrak Proyek** ke folder lokal di komputer Anda.
2. **Buka di Editor**:
   - Jika menggunakan **VS Code**: Buka VS Code, klik `File` -> `Open Folder`, lalu pilih folder root proyek ini.
   - Jika menggunakan **Visual Studio**: Pilih `Open a local folder` pada layar pembuka dan arahkan ke folder ini.
3. **Buka Terminal Terintegrasi** (`Ctrl + ~` di VS Code, atau melalui menu `Terminal -> New Terminal`).
4. **Instal Dependensi**:
   Jalankan perintah berikut untuk mengunduh modul-modul Node yang diperlukan:
   ```bash
   npm install
   ```
5. **Jalankan dalam Mode Pengembangan (Dev Mode)**:
   Jalankan server dan client secara bersamaan dengan perintah:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan dan dapat diakses di browser Anda pada alamat:
   - **http://localhost:3000** (Port standar server proxy)

6. **Kompilasi Siap Produksi (Build)**:
   Untuk membuat versi rilis siap produksi, gunakan perintah:
   ```bash
   npm run build
   ```
   Hasil build akan masuk ke dalam folder `dist/` dan backend server dikompilasi menjadi `dist/server.cjs`.

---

## 🎨 Panduan Desain UI Terpisah di CSS (`/src/ui-styles.css`)

Sesuai permintaan Anda, seluruh desain UI utama saat ini telah dipisahkan dari inline utility classes yang panjang dan diletakkan secara teratur di dalam file CSS eksternal:
👉 **`/src/ui-styles.css`**

File ini diimpor langsung melalui `/src/index.css` dengan baris:
```css
@import "./ui-styles.css";
```

### 🧩 Struktur Class UI yang Tersedia di `ui-styles.css`:

Anda dapat mengedit desain visual, skema warna, margin, ukuran, dan transisi UI secara langsung di dalam file `ui-styles.css` tanpa perlu mengubah baris kode JSX di file komponen TypeScript. Berikut pembagian kelas kuncinya:

1. **Variabel Warna & Tema (`:root`)**
   - `--color-primary`: Warna biru utama portal (`#2563eb`).
   - `--color-accent`: Warna emas leaderboard podium ke-1 (`#f59e0b`).
   - `--color-slate-bg`: Warna latar belakang dasar halaman (`#f8fafc`).
   - *Ubah nilai warna di sini untuk mengganti tema warna seluruh aplikasi secara instan!*

2. **Komponen Navigasi & Sidebar**
   - `.sidebar-panel`: Latar belakang gelap (`Slate 900`) dan tata letak sidebar.
   - `.sidebar-nav-item`, `.sidebar-nav-item-active`, `.sidebar-nav-item-inactive`: Desain tombol menu navigasi aktif/tidak aktif lengkap dengan transisi hover yang halus.

3. **Komponen Kartu (`Card UI`)**
   - `.card-ui-base`: Bingkai putih melengkung elegan (`rounded-2xl`) dengan bayangan halus.
   - `.card-ui-banner`: Desain banner gradasi biru menyambut mitra petshop.

4. **Komponen Form & Input**
   - `.form-text-input`, `.form-select-input`: Desain kolom input teks dan dropdown lengkap dengan transisi warna border saat kolom aktif (`focus:ring-2`).

5. **Tombol Aksi (`Button UI`)**
   - `.btn-ui-primary`: Tombol biru utama untuk konfirmasi/simpan.
   - `.btn-ui-secondary`: Tombol putih elegan dengan border abu-abu untuk batal/kembali.
   - `.btn-ui-danger`: Tombol merah berlatar cerah untuk hapus/tangguhkan akun.

6. **Sistem Tabel Kustom (`Table UI`)**
   - `.custom-table-wrapper`, `.custom-table`, `.custom-table-head-cell`, `.custom-table-row`, `.custom-table-cell`: Pengaturan tata letak baris tabel agar responsif dan nyaman dibaca.

7. **Desain Papan Klasemen (`Podium Leaderboard`)**
   - `.podium-container`, `.podium-card-gold`, `.podium-card-silver`, `.podium-card-bronze`: Mengatur visual tangga podium 1, 2, dan 3 yang dinamis di halaman depan.
   - `.podium-rank-badge`: Desain pin lingkaran peringkat (`1`, `2`, `3`) dengan efek animasi melenting khusus untuk juara ke-1.

---

## 🛠️ Rekomendasi Ekstensi VS Code untuk Pengembangan Maksimal

Bila menggunakan **VS Code**, kami sangat menyarankan untuk memasang ekstensi resmi berikut di marketplace guna mempercepat penulisan kode:
1. **TypeScript Nightly** - Untuk dukungan pengecekan tipe statis TypeScript yang presisi.
2. **Tailwind CSS IntelliSense** - Untuk autocompletion utilitas styling pendukung.
3. **ESLint** - Membantu menjaga kerapihan kode dan mendeteksi kesalahan sintaks secara instan sebelum kompilasi.
4. **Prettier - Code formatter** - Merapikan struktur tanda kurung, indentasi spasi, dan titik koma saat file disimpan secara otomatis.
