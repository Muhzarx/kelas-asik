# KelasAsik 🎓

Platform belajar online untuk guru & siswa **SMP dan SMA**: kelas per jenjang, live chat, video meet, kuis dengan skor & pembahasan, game edukasi, papan skor, absensi, pengumuman, XP/level/lencana, dan ruang khusus guru.

© muhzarx — hak cipta dilindungi (lihat `LICENSE`).

## Cara pasang di GitHub Pages
1. Buat repo baru di GitHub (misal `kelasasik`), upload **semua isi folder ini** (index.html, css/, js/, LICENSE, README.md).
2. Buka **Settings → Pages**, pilih branch `main` dan folder `/ (root)`, lalu Save.
3. Tunggu 1–2 menit. Web aktif di `https://muhzarx.github.io/kelasasik/`.

## Wajib diubah dulu (`js/config.js`)
- `teacherCode` — kode untuk masuk sebagai guru (bawaan: `GURU123`). **Ganti!**
- `roomPrefix` — kata unik untuk nama ruang video meet.
- `schoolName` — nama sekolahmu.

## Fitur
| Menu | Isi |
|---|---|
| Beranda | Misi harian, absensi hadir, pengumuman guru, lencana, XP & level |
| Materi | Ringkasan materi per mapel + video YouTube (guru bisa tambah materi) |
| Kuis | Timer, skor, bonus beruntun, pembahasan tiap soal, nilai akhir. **PAI: 10 soal uji coba + kunci jawaban** (juga Matematika & IPA) |
| Game | Memori Pasangan, Acak Kata, Cepat Hitung, Roda Acak (alat guru) |
| Live Chat | Ruang chat per kelas, emoji, penanda Guru, notifikasi pesan baru |
| Video Meet | Jitsi Meet tertanam + chat di samping |
| Papan Skor | Peringkat per kelas dari kuis & game |
| Ruang Guru | Tambah soal, lembar soal & kunci (unduh .txt), hasil siswa (unduh CSV), tambah kelas, cadangan data |

## Live chat, skor & absen antar perangkat (Firebase, gratis)
Tanpa pengaturan, aplikasi berjalan **mode lokal** (cocok untuk uji coba: buka 2 tab, chat tersambung). Agar HP & laptop yang berbeda saling terhubung:
1. Buka https://console.firebase.google.com → buat proyek.
2. **Build → Realtime Database → Create Database** (pilih lokasi Singapore).
3. Tab **Rules**, tempel lalu Publish:
   ```json
   { "rules": { ".read": true, ".write": true } }
   ```
   > Ini aturan terbuka untuk uji coba. Untuk produksi batasi sesuai kebutuhan sekolahmu.
4. Salin URL database (mis. `https://xxxx-default-rtdb.asia-southeast1.firebasedatabase.app`) ke `firebaseUrl` di `js/config.js`.

## Video meet
Memakai Jitsi Meet publik (`meet.jit.si`). Untuk kelas besar/rutin, pertimbangkan server Jitsi sendiri atau JaaS (8x8), lalu ubah `jitsiDomain`. Layanan publik bisa memberi batasan penggunaan tertanam; tombol **"Buka di tab baru"** selalu tersedia sebagai cadangan.

## Menambah / mengubah soal
- Lewat web: login Guru → **Ruang Guru → Tambah Soal** (tersimpan di browser tersebut).
- Permanen untuk semua orang: edit `js/data.js` (bagian `QUESTIONS`, `MATERI`, `PAIRS`, `WORDS`). Mapel baru: tambahkan di `SUBJECTS` lalu isi datanya.

## Catatan
- Progres (XP, lencana) disimpan di browser pemakai. Kode guru bersifat sederhana (sisi browser), bukan keamanan tingkat tinggi.
- Uji lokal: cukup buka `index.html` di browser.
