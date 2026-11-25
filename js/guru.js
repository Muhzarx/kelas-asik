/* ============================================================
   KelasAsik — Ruang Guru: tambah soal, kunci jawaban, hasil siswa, kelas, data
   © muhzarx
   ============================================================ */
(function () {
  'use strict';
  const { h, store } = KA;
  const D = window.DATA;

  /* Lembar soal + kunci jawaban (dipakai juga di halaman Kuis untuk guru) */
  KA.answerKey = function (sid) {
    const subj = KA.subject(sid), qs = KA.bank(sid);
    const txt = () => 'LEMBAR SOAL & KUNCI JAWABAN — ' + subj.name + '\n© muhzarx · KelasAsik\n\n' + qs.map((q, i) =>
      (i + 1) + '. ' + q.q + '\n' + q.o.map((o, k) => '   ' + 'ABCD'.charAt(k) + '. ' + o).join('\n') +
      '\n   Jawaban: ' + 'ABCD'.charAt(q.a) + (q.e ? '\n   Pembahasan: ' + q.e : '') + '\n').join('\n');
    const body = h('div', null,
      h('div', { class: 'row between' }, h('span', { class: 'muted' }, qs.length + ' soal'),
        h('button', { class: 'btn', onclick: () => KA.download('soal-' + sid + '.txt', txt()) }, '⬇ Unduh .txt')),
      h('ol', { class: 'key' }, qs.map(q => h('li', null,
        h('b', null, q.q),
        h('ul', null, q.o.map((o, k) => h('li', { class: k === q.a ? 'right' : '' }, 'ABCD'.charAt(k) + '. ' + o + (k === q.a ? '  ✅' : '')))),
        q.e && h('small', { class: 'muted' }, '💡 ' + q.e)))));
    KA.modal('📋 Soal & Kunci — ' + subj.name, body, { wide: true });
  };

  function csvCell(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }

  KA.pages.guru = view => {
    let tab = 'soal';
    const panel = h('div');
    const TABS = [['soal', '➕ Tambah Soal'], ['kunci', '📋 Kunci Jawaban'], ['hasil', '📊 Hasil Siswa'], ['kelas', '🏫 Kelas'], ['data', '⚙️ Data & Info']];
    const tabsEl = h('div', { class: 'tabs' });
    let stopResults = null;

    function paintTabs() {
      tabsEl.replaceChildren(...TABS.map(t => h('button', { class: 'tab' + (t[0] === tab ? ' on' : ''), onclick: () => { tab = t[0]; paintTabs(); render(); } }, t[1])));
    }
    KA.onLeave(() => { if (stopResults) stopResults(); });

    function render() {
      if (stopResults) { stopResults(); stopResults = null; }
      panel.replaceChildren();
      ({ soal: tSoal, kunci: tKunci, hasil: tHasil, kelas: tKelas, data: tData })[tab]();
    }

    /* --- Tambah soal --- */
    function tSoal() {
      const sub = h('select', { class: 'input' }, D.SUBJECTS.map(s => h('option', { value: s.id }, s.icon + ' ' + s.name)));
      const q = h('textarea', { class: 'input', rows: 2, placeholder: 'Tulis pertanyaan…', required: true });
      const os = [0, 1, 2, 3].map(k => h('input', { class: 'input', placeholder: 'Pilihan ' + 'ABCD'.charAt(k), required: true }));
      const ans = h('select', { class: 'input' }, ['A', 'B', 'C', 'D'].map((l, k) => h('option', { value: k }, 'Jawaban benar: ' + l)));
      const ex = h('input', { class: 'input', placeholder: 'Pembahasan singkat (opsional)' });
      const list = h('div');
      function paintList() {
        const bank = store.get('bank', {});
        const items = [];
        Object.keys(bank).forEach(sid => (bank[sid] || []).forEach((it, idx) => items.push({ sid, idx, it })));
        list.replaceChildren(h('h3', null, 'Soal buatanmu (' + items.length + ')'),
          items.length ? h('div', { class: 'stack' }, items.map(x => h('div', { class: 'list-item' },
            h('div', null, h('b', null, x.it.q), h('div', { class: 'muted small' }, KA.subject(x.sid).short + ' · jawaban ' + 'ABCD'.charAt(x.it.a) + ': ' + x.it.o[x.it.a])),
            h('button', { class: 'btn small', onclick: () => { const b = store.get('bank', {}); b[x.sid].splice(x.idx, 1); store.set('bank', b); paintList(); } }, '🗑'))))
            : h('p', { class: 'muted' }, 'Belum ada. Soal yang kamu tambah otomatis muncul di kuis semua mapel terkait di browser ini.'));
      }
      panel.append(h('form', { class: 'card form', onsubmit: e => {
        e.preventDefault();
        if (!q.value.trim() || os.some(o => !o.value.trim())) { KA.toast('Lengkapi pertanyaan dan 4 pilihan.', 'err'); return; }
        const bank = store.get('bank', {}); (bank[sub.value] = bank[sub.value] || []).push({ q: q.value.trim(), o: os.map(o => o.value.trim()), a: Number(ans.value), e: ex.value.trim() });
        store.set('bank', bank); KA.toast('Soal ditambahkan ✅', 'ok'); q.value = ''; os.forEach(o => o.value = ''); ex.value = ''; paintList();
      } }, h('h3', null, 'Buat soal pilihan ganda'), h('label', { class: 'field' }, 'Mata pelajaran', sub), h('label', { class: 'field' }, 'Pertanyaan', q),
        h('div', { class: 'grid g2 gap' }, os.map((o, k) => h('label', { class: 'field' }, 'Pilihan ' + 'ABCD'.charAt(k), o))),
        h('div', { class: 'grid g2 gap' }, h('label', { class: 'field' }, 'Kunci', ans), h('label', { class: 'field' }, 'Pembahasan', ex)),
        h('button', { class: 'btn primary', type: 'submit' }, 'Simpan soal')), list);
      paintList();
    }

    /* --- Kunci jawaban --- */
    function tKunci() {
      panel.append(h('div', { class: 'card' }, h('h3', null, 'Lembar soal & kunci jawaban'),
        h('p', { class: 'muted' }, 'Pilih mapel untuk melihat semua soal, kunci, dan pembahasan. Bisa diunduh sebagai .txt untuk dicetak.'),
        h('div', { class: 'row' }, D.SUBJECTS.map(s => h('button', { class: 'btn', onclick: () => KA.answerKey(s.id) }, s.icon + ' ' + s.name)))));
    }

    /* --- Hasil siswa --- */
    function tHasil() {
      const rows = [];
      const tbody = h('tbody');
      const info = h('span', { class: 'muted' }, '0 hasil');
      function paint() {
        const sorted = rows.slice().sort((a, b) => b.ts - a.ts).slice(0, 300);
        info.textContent = rows.length + ' hasil';
        tbody.replaceChildren(...(sorted.length ? sorted.map(r => h('tr', null,
          h('td', null, KA.fmtDateTime(r.ts)), h('td', null, r.name), h('td', null, r.subjectName), h('td', null, r.correct + '/' + r.total),
          h('td', null, h('b', null, r.pct)), h('td', null, r.score)))
          : [h('tr', null, h('td', { colspan: 6, class: 'muted' }, 'Belum ada siswa yang mengerjakan kuis di kelas ini.'))]));
      }
      stopResults = KA.rt.listen(KA.cpath('results'), (k, v) => { rows.push(v); paint(); }, 300);
      const csv = () => {
        const head = ['Waktu', 'Nama', 'Kelas', 'Mapel', 'Benar', 'Total', 'Nilai', 'Poin'];
        const lines = [head.map(csvCell).join(',')].concat(rows.slice().sort((a, b) => a.ts - b.ts).map(r =>
          [new Date(r.ts).toLocaleString('id-ID'), r.name, r.classId, r.subjectName, r.correct, r.total, r.pct, r.score].map(csvCell).join(',')));
        KA.download('hasil-' + KA.curClass().id + '.csv', '﻿' + lines.join('\n'), 'text/csv');
      };
      panel.append(h('div', { class: 'card' },
        h('div', { class: 'row between' }, h('h3', null, 'Hasil kuis ' + KA.curClass().name), h('div', { class: 'row' }, info, h('button', { class: 'btn', onclick: csv }, '⬇ Unduh CSV'))),
        KA.rt.mode === 'local' ? h('div', { class: 'notice' }, 'Mode lokal: hanya hasil yang dikerjakan di browser ini yang tampil. Aktifkan Firebase agar hasil dari semua perangkat siswa terkumpul.') : null,
        h('div', { class: 'table-wrap' }, h('table', { class: 'table' }, h('thead', null, h('tr', null, ['Waktu', 'Nama', 'Mapel', 'Benar', 'Nilai', 'Poin'].map(t => h('th', null, t)))), tbody))));
      paint();
    }

    /* --- Kelas --- */
    function tKelas() {
      const nm = h('input', { class: 'input', placeholder: 'Contoh: 8C atau XII IPA 2', required: true });
      const lv = h('select', { class: 'input' }, h('option', { value: 'SMP' }, 'SMP'), h('option', { value: 'SMA' }, 'SMA'));
      const list = h('div');
      function paint() {
        const custom = store.get('classes.custom', []);
        list.replaceChildren(h('h3', null, 'Daftar kelas'),
          h('div', { class: 'stack' }, KA.classes().map(c => h('div', { class: 'list-item' },
            h('div', null, h('b', null, c.name), h('span', { class: 'tag' }, c.level)),
            custom.some(x => x.id === c.id) ? h('button', { class: 'btn small', onclick: () => { store.set('classes.custom', custom.filter(x => x.id !== c.id)); paint(); KA.toast('Kelas dihapus. Muat ulang halaman untuk memperbarui menu kelas.', 'info'); } }, '🗑') : h('span', { class: 'muted small' }, 'bawaan')))));
      }
      panel.append(h('form', { class: 'card form', onsubmit: e => {
        e.preventDefault();
        const name = nm.value.trim(); if (!name) return;
        const id = KA.rt.safe(name);
        if (KA.classes().some(c => c.id === id)) { KA.toast('Kelas sudah ada.', 'err'); return; }
        const custom = store.get('classes.custom', []); custom.push({ id, name: 'Kelas ' + name, level: lv.value }); store.set('classes.custom', custom);
        nm.value = ''; paint(); KA.toast('Kelas ditambahkan. Muat ulang halaman untuk melihatnya di menu kelas.', 'ok');
      } }, h('h3', null, 'Tambah kelas'), h('div', { class: 'grid g2 gap' }, h('label', { class: 'field' }, 'Nama kelas', nm), h('label', { class: 'field' }, 'Jenjang', lv)),
        h('button', { class: 'btn primary', type: 'submit' }, 'Tambah')), list);
      paint();
    }

    /* --- Data & info --- */
    function tData() {
      const C = window.CONFIG;
      const file = h('input', { type: 'file', accept: 'application/json', class: 'hidden', onchange: ev => {
        const f = ev.target.files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = () => { try { const o = JSON.parse(r.result); Object.keys(o).forEach(k => store.set(k, o[k])); KA.toast('Cadangan dipulihkan. Memuat ulang…', 'ok'); setTimeout(() => location.reload(), 800); } catch (e) { KA.toast('File cadangan tidak valid.', 'err'); } };
        r.readAsText(f);
      } });
      panel.append(
        h('div', { class: 'card' }, h('h3', null, 'Status sistem'),
          h('ul', { class: 'tips' },
            h('li', null, '📡 Realtime: ', h('b', null, KA.rt.mode === 'online' ? 'Online (Firebase)' : 'Lokal (1 browser)')),
            h('li', null, '🎥 Server meet: ', h('b', null, C.jitsiDomain)),
            h('li', null, '🔑 Kode guru: ubah di js/config.js (teacherCode)'),
            h('li', null, '© ', h('b', null, C.owner), ' — hak cipta dilindungi'))),
        h('div', { class: 'card' }, h('h3', null, 'Cadangan data (browser ini)'),
          h('div', { class: 'row' },
            h('button', { class: 'btn', onclick: () => { const o = {}; store.keys().forEach(k => o[k] = store.get(k)); KA.download('kelasasik-backup.json', JSON.stringify(o), 'application/json'); } }, '⬇ Ekspor'),
            h('button', { class: 'btn', onclick: () => file.click() }, '⬆ Impor'), file,
            h('button', { class: 'btn danger', onclick: () => KA.confirm('Hapus SEMUA data KelasAsik di browser ini (profil, XP, soal buatan, chat lokal)?', () => { store.keys().forEach(k => store.del(k)); location.hash = ''; location.reload(); }) }, '🗑 Reset semua'))));
    }

    view.append(KA.pageHead('Ruang Guru', 'Kelola soal, pantau hasil siswa, dan atur kelas.'), tabsEl, panel);
    paintTabs(); render();
  };
})();
