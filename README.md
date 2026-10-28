# HIPAM Batuguluk

Aplikasi pengelolaan pelanggan HIPAM, kwitansi pembayaran, ringkasan transaksi,
dan profil admin berbasis Next.js, Prisma ORM, serta MySQL.

## Menjalankan aplikasi

1. Salin `.env.example` menjadi `.env`, lalu isi `DATABASE_URL` dengan URL MySQL
   dan buat `AUTH_SECRET` acak minimal 32 karakter.
2. Pasang dependency dengan `npm install`.
3. Generate Prisma Client dan sesuaikan skema database:

   ```sh
   npm run db:generate
   npm run db:push
   ```

4. Isi data awal administrator dan profil HIPAM:

   ```sh
   npm run db:seed
   ```

5. Jalankan `npm run dev`, lalu buka `http://localhost:3000/login`.

Seed pengembangan membuat akun awal `admin@hipam.local` dengan password
`admin123`. Segera ganti password tersebut melalui menu **Pengaturan** sebelum
menggunakan aplikasi di lingkungan publik. Password disimpan dengan scrypt.

## API utama

- `POST /api/auth/login` — memverifikasi email/password dan membuat sesi admin.
- `POST /api/auth/logout` — mengakhiri sesi admin.
- `GET, POST /api/pelanggan` — membaca dan menambahkan pelanggan.
- `PATCH, DELETE /api/pelanggan/:id` — memperbarui dan menghapus pelanggan.
- `POST /api/kwitansi` — menyimpan kwitansi pembayaran.
- `GET, PATCH /api/pengaturan` — membaca dan memperbarui profil aplikasi/admin.

Dashboard dan endpoint pengelolaan dilindungi sesi bertanda tangan. Setiap
perubahan pada `prisma/schema.prisma` perlu diterapkan ke MySQL dengan
`npm run db:push`.
