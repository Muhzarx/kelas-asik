/* ============================================================
   KelasAsik — Data bawaan: kelas, mapel, soal, materi, game
   © muhzarx
   Tambah / ubah soal langsung di sini, atau lewat menu "Ruang Guru".
   Format soal: { q: "pertanyaan", o: [4 pilihan], a: indeks jawaban benar (0-3), e: "pembahasan" }
   ============================================================ */
window.DATA = {
  CLASSES: [
    { id: "7A", name: "Kelas 7A", level: "SMP" },
    { id: "7B", name: "Kelas 7B", level: "SMP" },
    { id: "8A", name: "Kelas 8A", level: "SMP" },
    { id: "8B", name: "Kelas 8B", level: "SMP" },
    { id: "9A", name: "Kelas 9A", level: "SMP" },
    { id: "9B", name: "Kelas 9B", level: "SMP" },
    { id: "X-1", name: "Kelas X-1", level: "SMA" },
    { id: "X-2", name: "Kelas X-2", level: "SMA" },
    { id: "XI-IPA", name: "Kelas XI IPA", level: "SMA" },
    { id: "XI-IPS", name: "Kelas XI IPS", level: "SMA" },
    { id: "XII-IPA", name: "Kelas XII IPA", level: "SMA" },
    { id: "XII-IPS", name: "Kelas XII IPS", level: "SMA" }
  ],

  SUBJECTS: [
    { id: "pai", name: "Pendidikan Agama Islam", short: "Agama", icon: "🕌", color: "#10b981" },
    { id: "mat", name: "Matematika", short: "Matematika", icon: "🧮", color: "#6366f1" },
    { id: "ipa", name: "Ilmu Pengetahuan Alam", short: "IPA", icon: "🔬", color: "#f59e0b" }
  ],

  QUESTIONS: {
    /* ---------- PAI: 10 soal uji coba lengkap dengan kunci & pembahasan ---------- */
    pai: [
      { q: "Berapa jumlah Rukun Islam?", o: ["3", "4", "5", "6"], a: 2,
        e: "Rukun Islam ada 5: syahadat, shalat, zakat, puasa Ramadan, dan haji bagi yang mampu." },
      { q: "Malaikat yang bertugas menyampaikan wahyu kepada para nabi adalah ...", o: ["Mikail", "Jibril", "Israfil", "Izrail"], a: 1,
        e: "Malaikat Jibril adalah penyampai wahyu dari Allah kepada para nabi dan rasul." },
      { q: "Kitab suci yang diturunkan kepada Nabi Musa a.s. adalah ...", o: ["Zabur", "Taurat", "Injil", "Al-Qur'an"], a: 1,
        e: "Taurat untuk Nabi Musa, Zabur untuk Nabi Daud, Injil untuk Nabi Isa, dan Al-Qur'an untuk Nabi Muhammad SAW." },
      { q: "Jumlah Rukun Iman adalah ...", o: ["4", "5", "6", "7"], a: 2,
        e: "Rukun Iman ada 6: iman kepada Allah, malaikat, kitab, rasul, hari akhir, serta qada dan qadar." },
      { q: "Shalat Maghrib dikerjakan sebanyak ... rakaat.", o: ["2", "3", "4", "5"], a: 1,
        e: "Jumlah rakaat: Subuh 2, Zuhur 4, Asar 4, Maghrib 3, dan Isya 4." },
      { q: "Puasa wajib bagi umat Islam dilaksanakan pada bulan ...", o: ["Syaban", "Ramadan", "Syawal", "Zulhijah"], a: 1,
        e: "Puasa wajib dilaksanakan pada bulan Ramadan, bulan ke-9 dalam kalender Hijriah." },
      { q: "Surah pertama dalam urutan mushaf Al-Qur'an adalah ...", o: ["Al-Baqarah", "Al-Ikhlas", "Al-Fatihah", "An-Nas"], a: 2,
        e: "Al-Fatihah (\"Pembukaan\") adalah surah pertama dan dibaca dalam setiap rakaat shalat." },
      { q: "Jika nun sukun atau tanwin bertemu huruf ba (ب), hukum bacaannya adalah ...", o: ["Izhar", "Idgham", "Iqlab", "Ikhfa"], a: 2,
        e: "Iqlab: nun sukun/tanwin bertemu ba dibaca seperti mim dengan dengung samar." },
      { q: "Zakat fitrah sebaiknya dikeluarkan ...", o: ["Setelah shalat Idul Fitri", "Sebelum shalat Idul Fitri", "Pada bulan Zulhijah", "Pada awal Muharram"], a: 1,
        e: "Zakat fitrah ditunaikan pada bulan Ramadan sampai sebelum shalat Idul Fitri dilaksanakan." },
      { q: "Hijrah Nabi Muhammad SAW adalah perpindahan dari ... ke ...", o: ["Mekah ke Madinah", "Madinah ke Mekah", "Mekah ke Habasyah", "Madinah ke Yaman"], a: 0,
        e: "Hijrah dari Mekah ke Madinah. Peristiwa ini menjadi awal penanggalan tahun Hijriah." }
    ],

    mat: [
      { q: "12 × 8 = ...", o: ["86", "96", "108", "88"], a: 1, e: "12 × 8 = 96." },
      { q: "3/4 + 1/8 = ...", o: ["4/12", "7/8", "1", "5/8"], a: 1, e: "3/4 = 6/8, jadi 6/8 + 1/8 = 7/8." },
      { q: "Nilai x dari 2x + 5 = 17 adalah ...", o: ["5", "6", "7", "8"], a: 1, e: "2x = 17 − 5 = 12, maka x = 6." },
      { q: "Luas persegi dengan sisi 9 cm adalah ...", o: ["18 cm²", "36 cm²", "81 cm²", "72 cm²"], a: 2, e: "Luas = sisi × sisi = 9 × 9 = 81 cm²." },
      { q: "√144 = ...", o: ["11", "12", "13", "14"], a: 1, e: "12 × 12 = 144, jadi akar kuadratnya 12." },
      { q: "15% dari 200 adalah ...", o: ["15", "20", "30", "35"], a: 2, e: "15/100 × 200 = 30." },
      { q: "Keliling lingkaran berjari-jari 7 cm (π = 22/7) adalah ...", o: ["22 cm", "44 cm", "154 cm", "49 cm"], a: 1, e: "K = 2πr = 2 × 22/7 × 7 = 44 cm." },
      { q: "Gradien garis y = 3x − 2 adalah ...", o: ["−2", "2", "3", "−3"], a: 2, e: "Pada y = mx + c, gradien adalah m = 3." },
      { q: "Nilai sin 30° adalah ...", o: ["1/2", "√3/2", "1", "√2/2"], a: 0, e: "sin 30° = 1/2 (sudut istimewa)." },
      { q: "2⁵ = ...", o: ["10", "16", "25", "32"], a: 3, e: "2 × 2 × 2 × 2 × 2 = 32." }
    ],

    ipa: [
      { q: "Planet yang paling dekat dengan Matahari adalah ...", o: ["Venus", "Merkurius", "Bumi", "Mars"], a: 1, e: "Urutan dari Matahari: Merkurius, Venus, Bumi, Mars, Yupiter, Saturnus, Uranus, Neptunus." },
      { q: "Rumus kimia air adalah ...", o: ["CO₂", "O₂", "H₂O", "NaCl"], a: 2, e: "Satu molekul air terdiri dari 2 atom hidrogen dan 1 atom oksigen." },
      { q: "Alat pernapasan ikan adalah ...", o: ["Paru-paru", "Insang", "Trakea", "Stomata"], a: 1, e: "Ikan mengambil oksigen terlarut dalam air menggunakan insang." },
      { q: "Gas yang diserap tumbuhan saat fotosintesis adalah ...", o: ["Oksigen", "Nitrogen", "Karbon dioksida", "Hidrogen"], a: 2, e: "Tumbuhan menyerap CO₂ dan air, lalu menghasilkan glukosa dan oksigen." },
      { q: "Satuan gaya dalam SI adalah ...", o: ["Joule", "Newton", "Watt", "Pascal"], a: 1, e: "Gaya diukur dalam Newton (N)." },
      { q: "Perubahan wujud dari cair menjadi gas disebut ...", o: ["Mencair", "Membeku", "Menguap", "Mengembun"], a: 2, e: "Cair → gas = menguap. Gas → cair = mengembun." },
      { q: "Bagian sel yang mengatur seluruh aktivitas sel adalah ...", o: ["Inti sel", "Vakuola", "Dinding sel", "Ribosom"], a: 0, e: "Inti sel (nukleus) menyimpan DNA dan mengendalikan aktivitas sel." },
      { q: "Rumus kecepatan adalah ...", o: ["jarak × waktu", "jarak ÷ waktu", "waktu ÷ jarak", "jarak + waktu"], a: 1, e: "v = s / t (jarak dibagi waktu)." },
      { q: "Galaksi tempat tata surya kita berada adalah ...", o: ["Andromeda", "Bima Sakti", "Triangulum", "Sombrero"], a: 1, e: "Tata surya berada di galaksi Bima Sakti (Milky Way)." },
      { q: "Gas yang paling banyak terdapat di atmosfer Bumi adalah ...", o: ["Oksigen", "Nitrogen", "Argon", "Karbon dioksida"], a: 1, e: "Atmosfer terdiri dari sekitar 78% nitrogen dan 21% oksigen." }
    ]
  },

  /* Materi bawaan. Baris diawali "## " = judul kecil, "- " = poin, selain itu = paragraf. */
  MATERI: {
    pai: [
      { id: "pai1", title: "Rukun Iman & Rukun Islam", icon: "🌙", body: [
        "## Rukun Iman (6)",
        "- Iman kepada Allah", "- Iman kepada malaikat", "- Iman kepada kitab-kitab Allah",
        "- Iman kepada rasul", "- Iman kepada hari akhir", "- Iman kepada qada dan qadar",
        "## Rukun Islam (5)",
        "- Syahadat", "- Shalat lima waktu", "- Zakat", "- Puasa di bulan Ramadan", "- Haji bagi yang mampu"
      ]},
      { id: "pai2", title: "Shalat Fardhu Lima Waktu", icon: "🕋", body: [
        "Shalat fardhu wajib dikerjakan setiap muslim yang sudah baligh dan berakal.",
        "- Subuh: 2 rakaat", "- Zuhur: 4 rakaat", "- Asar: 4 rakaat", "- Maghrib: 3 rakaat", "- Isya: 4 rakaat",
        "Sebelum shalat, pastikan suci dari hadas dengan berwudhu, pakaian dan tempat bersih, serta menghadap kiblat."
      ]},
      { id: "pai3", title: "Hukum Nun Sukun & Tanwin", icon: "📖", body: [
        "Ada empat hukum bacaan ketika nun sukun atau tanwin bertemu huruf hijaiyah:",
        "- Izhar: dibaca jelas jika bertemu huruf halqi (ء ه ع ح غ خ)",
        "- Idgham: dibaca melebur jika bertemu huruf ي ن م و (bighunnah) atau ل ر (bilaghunnah)",
        "- Iqlab: bertemu huruf ب, dibaca mim dengan dengung samar",
        "- Ikhfa: dibaca samar jika bertemu 15 huruf lainnya"
      ]}
    ],
    mat: [
      { id: "mat1", title: "Bangun Datar: Luas & Keliling", icon: "📐", body: [
        "## Rumus penting",
        "- Persegi: L = s × s, K = 4 × s",
        "- Persegi panjang: L = p × l, K = 2 × (p + l)",
        "- Segitiga: L = ½ × alas × tinggi",
        "- Lingkaran: L = π × r², K = 2 × π × r",
        "Gunakan π = 22/7 jika jari-jari kelipatan 7, dan π = 3,14 untuk lainnya."
      ]},
      { id: "mat2", title: "Pecahan & Persen", icon: "🍰", body: [
        "Untuk menjumlah pecahan, samakan dulu penyebutnya.",
        "Contoh: 3/4 + 1/8 = 6/8 + 1/8 = 7/8.",
        "Persen berarti \"per seratus\". 15% dari 200 = 15/100 × 200 = 30."
      ]},
      { id: "mat3", title: "Persamaan Linear Satu Variabel", icon: "⚖️", body: [
        "Prinsipnya seperti timbangan: apa pun yang dilakukan di satu sisi harus dilakukan di sisi lain.",
        "Contoh: 2x + 5 = 17",
        "- Kurangi kedua sisi dengan 5: 2x = 12",
        "- Bagi kedua sisi dengan 2: x = 6"
      ]}
    ],
    ipa: [
      { id: "ipa1", title: "Tata Surya", icon: "🪐", body: [
        "Tata surya terdiri dari Matahari dan benda langit yang mengelilinginya.",
        "Urutan planet dari yang terdekat: Merkurius, Venus, Bumi, Mars, Yupiter, Saturnus, Uranus, Neptunus.",
        "Tata surya kita berada di galaksi Bima Sakti."
      ]},
      { id: "ipa2", title: "Fotosintesis", icon: "🌱", body: [
        "Fotosintesis adalah proses tumbuhan membuat makanan dengan bantuan cahaya matahari di kloroplas.",
        "## Persamaan",
        "6CO₂ + 6H₂O + cahaya → C₆H₁₂O₆ + 6O₂",
        "Hasilnya berupa glukosa (makanan) dan oksigen yang dilepas ke udara."
      ]},
      { id: "ipa3", title: "Wujud Zat & Perubahannya", icon: "🧊", body: [
        "Wujud zat: padat, cair, dan gas.",
        "- Mencair: padat → cair", "- Membeku: cair → padat", "- Menguap: cair → gas",
        "- Mengembun: gas → cair", "- Menyublim: padat → gas"
      ]}
    ]
  },

  /* Pasangan kartu untuk game Memori */
  PAIRS: {
    pai: [["Syahadat", "Pengakuan iman"], ["Zakat", "Mengeluarkan harta wajib"], ["Puasa", "Menahan lapar & haus"],
          ["Haji", "Ibadah ke Baitullah"], ["Jibril", "Malaikat pembawa wahyu"], ["Al-Fatihah", "Surah pertama"]],
    mat: [["Luas persegi", "s × s"], ["Keliling persegi", "4 × s"], ["Luas segitiga", "½ × a × t"],
          ["Luas lingkaran", "π × r²"], ["Pythagoras", "a² + b² = c²"], ["Volume kubus", "s³"]],
    ipa: [["Merkurius", "Planet terdekat Matahari"], ["Fotosintesis", "Tumbuhan membuat makanan"], ["Menguap", "Cair menjadi gas"],
          ["Newton", "Satuan gaya"], ["Mitokondria", "Pembangkit energi sel"], ["H₂O", "Air"]]
  },

  /* Kata untuk game Acak Kata */
  WORDS: {
    pai: [{ w: "ZAKAT", h: "Rukun Islam ke-3" }, { w: "WUDHU", h: "Bersuci sebelum shalat" }, { w: "HIJRAH", h: "Perpindahan Nabi ke Madinah" },
          { w: "RAMADAN", h: "Bulan puasa" }, { w: "JIBRIL", h: "Malaikat penyampai wahyu" }, { w: "SYAHADAT", h: "Rukun Islam pertama" },
          { w: "TAJWID", h: "Ilmu cara membaca Al-Qur'an" }, { w: "KIBLAT", h: "Arah menghadap saat shalat" }],
    mat: [{ w: "PECAHAN", h: "Contohnya 3/4" }, { w: "KELILING", h: "Jumlah panjang semua sisi" }, { w: "DIAMETER", h: "Dua kali jari-jari" },
          { w: "GRADIEN", h: "Kemiringan garis" }, { w: "SEGITIGA", h: "Bangun datar bersisi tiga" }, { w: "PERSEN", h: "Per seratus" },
          { w: "VARIABEL", h: "Huruf pengganti bilangan, misal x" }, { w: "SUDUT", h: "Diukur dengan derajat" }],
    ipa: [{ w: "FOTOSINTESIS", h: "Tumbuhan membuat makanan" }, { w: "GRAVITASI", h: "Gaya tarik Bumi" }, { w: "ATMOSFER", h: "Lapisan udara pembungkus Bumi" },
          { w: "MOLEKUL", h: "Gabungan atom" }, { w: "ENERGI", h: "Kemampuan melakukan usaha" }, { w: "PLANET", h: "Bumi adalah salah satunya" },
          { w: "KLOROPLAS", h: "Tempat fotosintesis" }, { w: "EVAPORASI", h: "Penguapan" }]
  }
};
