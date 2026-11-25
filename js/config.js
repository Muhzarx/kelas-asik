/* ============================================================
   KelasAsik — Pengaturan
   © muhzarx. Ubah nilai di bawah sesuai kebutuhan sekolahmu.
   ============================================================ */
window.CONFIG = {
  appName: "KelasAsik",
  owner: "muhzarx",
  schoolName: "Sekolah Kita",

  // Kode untuk masuk sebagai GURU. GANTI sebelum dipakai!
  // (Catatan: ini kode sederhana di sisi browser, bukan keamanan tingkat tinggi.)
  teacherCode: "GURU123",

  // Server video meet (Jitsi). Biarkan "meet.jit.si" untuk gratis.
  jitsiDomain: "meet.jit.si",
  // Awalan nama ruang meet. GANTI dengan kata unik agar ruangmu tidak bentrok dengan orang lain.
  roomPrefix: "kelasasik-muhzarx-ganti-ini",

  // LIVE CHAT / SKOR / ABSEN ANTAR PERANGKAT:
  // Kosong = mode lokal (hanya antar tab di browser yang sama, cocok untuk uji coba).
  // Isi dengan URL Firebase Realtime Database agar HP/laptop berbeda saling terhubung, contoh:
  //   firebaseUrl: "https://nama-proyekmu-default-rtdb.asia-southeast1.firebasedatabase.app"
  // Panduan lengkap ada di README.md
  firebaseUrl: ""
};
