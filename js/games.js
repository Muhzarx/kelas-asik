/* ============================================================
   KelasAsik — Game: Memori, Acak Kata, Cepat Hitung, Roda Acak
   © muhzarx
   ============================================================ */
(function () {
  'use strict';
  const { h } = KA;
  const D = window.DATA;

  const GAMES = [
    { id: 'memori', icon: '🃏', name: 'Memori Pasangan', desc: 'Cocokkan istilah dengan artinya secepat mungkin.', subj: true },
    { id: 'acak', icon: '🔤', name: 'Acak Kata', desc: 'Susun huruf acak jadi kata benar dalam 60 detik.', subj: true },
    { id: 'hitung', icon: '⚡', name: 'Cepat Hitung', desc: 'Jawab soal hitung kilat. Makin lancar makin sulit!', subj: false },
    { id: 'roda', icon: '🎡', name: 'Roda Acak', desc: 'Alat bantu kelas: pilih siswa atau kelompok secara acak.', subj: false }
  ];

  function back() { return h('a', { class: 'btn ghost', href: '#/game' }, '← Menu game'); }

  function finish(gid, title, pts, lines, again) {
    pts = Math.max(0, Math.round(pts));
    const u = KA.user;
    KA.addXP(pts);
    u.stats = u.stats || {}; u.stats.games = (u.stats.games || 0) + 1; KA.saveUser();
    if (u.stats.games >= 3) KA.badge('gamer');
    KA.mission('game');
    if (u.role === 'siswa' && pts > 0) KA.rt.send(KA.cpath('scores'), { name: u.name, pts, src: title, kind: 'game' }).catch(() => { });
    KA.sfx.play('win'); if (pts >= 60) KA.confetti(100);
    const m = KA.modal('🎉 Permainan selesai!', h('div', { class: 'center-box' },
      h('h2', null, title), h('div', { class: 'pts' }, '+' + pts + ' poin'),
      h('ul', { class: 'tips' }, lines.map(l => h('li', null, l))),
      h('div', { class: 'row center' },
        h('button', { class: 'btn primary', onclick: () => { m.close(); again(); } }, '🔁 Main lagi'),
        h('a', { class: 'btn', href: '#/game', onclick: () => m.close() }, 'Menu game'),
        h('a', { class: 'btn', href: '#/skor', onclick: () => m.close() }, '🏆 Papan skor'))));
  }

  /* ---------------- Memori ---------------- */
  function memori(view, sid) {
    const subj = KA.subject(sid), pairs = D.PAIRS[sid];
    const cards = KA.shuffle(pairs.reduce((a, p, i) => a.concat([{ id: i, t: p[0], k: 'term' }, { id: i, t: p[1], k: 'def' }]), []));
    let first = null, lock = false, moves = 0, matched = 0, sec = 0, tm = null;
    const mv = h('b', null, '0'), tt = h('b', null, '0');
    KA.onLeave(() => clearInterval(tm));
    const els = cards.map(c => {
      const el = h('button', { class: 'mcard ' + c.k, 'aria-label': 'Kartu' },
        h('div', { class: 'inner' }, h('div', { class: 'front' }, '❓'), h('div', { class: 'back' }, c.t)));
      el.addEventListener('click', () => flip(c, el));
      return el;
    });
    function flip(c, el) {
      if (lock || el.classList.contains('done') || el.classList.contains('flip')) return;
      if (!tm) tm = setInterval(() => { sec++; tt.textContent = sec; }, 1000);
      el.classList.add('flip'); KA.sfx.play('pop');
      if (!first) { first = { c, el }; return; }
      moves++; mv.textContent = moves;
      const a = first; first = null;
      if (a.c.id === c.id) {
        a.el.classList.add('done'); el.classList.add('done'); matched++; KA.sfx.play('ok');
        if (matched === pairs.length) {
          clearInterval(tm);
          const pts = Math.max(20, 120 - moves * 3 - Math.floor(sec / 3));
          setTimeout(() => finish('memori', 'Memori ' + subj.short, pts, ['Langkah: ' + moves, 'Waktu: ' + sec + ' detik'], () => memori(view, sid)), 500);
        }
      } else {
        lock = true;
        setTimeout(() => { a.el.classList.remove('flip'); el.classList.remove('flip'); lock = false; }, 900);
      }
    }
    view.replaceChildren(
      h('div', { class: 'row between' }, back(), h('div', { class: 'row' }, h('span', { class: 'pill' }, subj.icon + ' ' + subj.name), h('span', { class: 'pill' }, '👣 ', mv), h('span', { class: 'pill' }, '⏱ ', tt, ' dtk'))),
      h('p', { class: 'muted' }, 'Pasangkan kartu istilah (biru) dengan kartu artinya (ungu).'),
      h('div', { class: 'mgrid' }, els));
  }

  /* ---------------- Acak Kata ---------------- */
  function acak(view, sid) {
    const subj = KA.subject(sid), queue = KA.shuffle(D.WORDS[sid]);
    let qi = 0, score = 0, solved = 0, left = 60, hinted = false, cur = null, tm = null, over = false;
    const tiles = h('div', { class: 'tiles' }), hint = h('p', { class: 'muted center' });
    const inp = h('input', { class: 'input big', placeholder: 'Ketik jawabanmu lalu Enter…', autocomplete: 'off', autocapitalize: 'characters', 'aria-label': 'Jawaban' });
    const sc = h('b', null, '0'), tl = h('b', null, '60');
    function mix(w) { let s, n = 0; do { s = KA.shuffle(w.split('')).join(''); n++; } while (s === w && n < 10); return s; }
    function load() {
      cur = queue[qi % queue.length]; qi++; hinted = false;
      tiles.replaceChildren(...mix(cur.w).split('').map(c => h('span', { class: 'tile' }, c)));
      hint.textContent = '💡 Klik "Petunjuk" jika butuh bantuan (−3 poin).';
      inp.value = ''; inp.focus();
    }
    function submit() {
      if (over) return;
      const v = inp.value.trim().toUpperCase().replace(/\s+/g, '');
      if (!v) return;
      if (v === cur.w) {
        const g = hinted ? 7 : 10; score += g; solved++; sc.textContent = score; KA.sfx.play('ok'); load();
      } else { KA.sfx.play('bad'); inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake'); }
    }
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
    tm = setInterval(() => {
      left--; tl.textContent = left; if (left <= 5 && left > 0) KA.sfx.play('tick');
      if (left <= 0) { clearInterval(tm); over = true; finish('acak', 'Acak Kata ' + subj.short, score, ['Kata terjawab: ' + solved], () => acak(view, sid)); }
    }, 1000);
    KA.onLeave(() => clearInterval(tm));
    view.replaceChildren(
      h('div', { class: 'row between' }, back(), h('div', { class: 'row' }, h('span', { class: 'pill' }, subj.icon + ' ' + subj.name), h('span', { class: 'pill score' }, '⭐ ', sc), h('span', { class: 'pill' }, '⏱ ', tl, ' dtk'))),
      h('div', { class: 'card game-box' }, h('p', { class: 'center muted' }, 'Susun huruf berikut menjadi kata yang benar:'), tiles, hint, inp,
        h('div', { class: 'row center' },
          h('button', { class: 'btn primary', onclick: submit }, 'Cek ✔'),
          h('button', { class: 'btn', onclick: () => { tiles.replaceChildren(...mix(cur.w).split('').map(c => h('span', { class: 'tile' }, c))); inp.focus(); } }, '🔀 Acak ulang'),
          h('button', { class: 'btn', onclick: () => { if (!hinted) { hinted = true; } hint.textContent = '💡 ' + cur.h + ' (' + cur.w.length + ' huruf)'; inp.focus(); } }, '💡 Petunjuk'),
          h('button', { class: 'btn', onclick: () => { score = Math.max(0, score - 2); sc.textContent = score; load(); } }, '⏭ Lewati (−2)'))));
    load();
  }

  /* ---------------- Cepat Hitung ---------------- */
  function gen(L) {
    const r = KA.rand, ops = L < 2 ? ['+', '-'] : L < 3 ? ['+', '-', '×'] : ['+', '-', '×', '÷'];
    const op = ops[r(0, ops.length - 1)], max = 10 + L * 10;
    let a, b, ans;
    if (op === '+') { a = r(1, max); b = r(1, max); ans = a + b; }
    else if (op === '-') { a = r(2, max); b = r(1, a); ans = a - b; }
    else if (op === '×') { a = r(2, 5 + L); b = r(2, 9); ans = a * b; }
    else { b = r(2, 9); ans = r(2, 5 + L); a = b * ans; }
    return { text: a + ' ' + op + ' ' + b + ' = ?', ans };
  }
  function hitung(view) {
    let left = 45, score = 0, combo = 0, right = 0, wrong = 0, cur = null, tm = null, over = false;
    const qEl = h('div', { class: 'bigq' }), sc = h('b', null, '0'), tl = h('b', null, '45'), cb = h('b', null, '0');
    const inp = h('input', { class: 'input big', inputmode: 'numeric', autocomplete: 'off', placeholder: 'Jawabanmu…', 'aria-label': 'Jawaban' });
    function next() { cur = gen(1 + Math.floor(right / 4)); qEl.textContent = cur.text; inp.value = ''; inp.focus(); }
    function check(force) {
      if (over) return;
      const v = inp.value.trim(); if (!v) return;
      if (force || v.length >= String(cur.ans).length) {
        if (Number(v) === cur.ans) { combo++; right++; score += 10 + Math.min(combo, 5) * 2; KA.sfx.play('ok'); }
        else { combo = 0; wrong++; KA.sfx.play('bad'); inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake'); }
        sc.textContent = score; cb.textContent = combo; next();
      }
    }
    inp.addEventListener('input', () => check(false));
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(true); });
    tm = setInterval(() => {
      left--; tl.textContent = left; if (left <= 5 && left > 0) KA.sfx.play('tick');
      if (left <= 0) { clearInterval(tm); over = true; finish('hitung', 'Cepat Hitung', score, ['Benar: ' + right, 'Salah: ' + wrong, 'Level akhir: ' + (1 + Math.floor(right / 4))], () => hitung(view)); }
    }, 1000);
    KA.onLeave(() => clearInterval(tm));
    view.replaceChildren(
      h('div', { class: 'row between' }, back(), h('div', { class: 'row' }, h('span', { class: 'pill score' }, '⭐ ', sc), h('span', { class: 'pill fire' }, '🔥 ', cb), h('span', { class: 'pill' }, '⏱ ', tl, ' dtk'))),
      h('div', { class: 'card game-box' }, qEl, inp, h('p', { class: 'muted center' }, 'Jawaban otomatis terkirim saat jumlah digitnya pas. Enter juga bisa.')));
    next();
  }

  /* ---------------- Roda Acak ---------------- */
  function roda(view) {
    const cv = h('canvas', { width: 380, height: 380, class: 'wheel', 'aria-label': 'Roda acak' });
    const ta = h('textarea', { class: 'input', rows: 8, 'aria-label': 'Daftar nama' });
    ta.value = 'Andi\nBudi\nCitra\nDewi\nEka\nFajar\nGita\nHadi';
    const rm = h('input', { type: 'checkbox', id: 'rmv' });
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#84cc16', '#f97316', '#14b8a6'];
    let ang = 0, spinning = false, raf = 0;
    const names = () => ta.value.split('\n').map(s => s.trim()).filter(Boolean);
    function draw() {
      const ctx = cv.getContext('2d'), n = names(), R = 180, cx = 190, cy = 190;
      ctx.clearRect(0, 0, 380, 380);
      if (!n.length) { ctx.fillStyle = '#94a3b8'; ctx.font = '16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Isi nama di sebelah', cx, cy); return; }
      const seg = Math.PI * 2 / n.length;
      n.forEach((nm, i) => {
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, ang + i * seg, ang + (i + 1) * seg); ctx.closePath();
        ctx.fillStyle = colors[i % colors.length]; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang + (i + .5) * seg); ctx.textAlign = 'right'; ctx.fillStyle = '#fff';
        ctx.font = 'bold ' + (n.length > 14 ? 11 : 15) + 'px sans-serif'; ctx.fillText(nm.length > 14 ? nm.slice(0, 13) + '…' : nm, R - 14, 5); ctx.restore();
      });
      ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    }
    function spin() {
      if (spinning) return;
      const n = names(); if (n.length < 2) { KA.toast('Isi minimal 2 nama.', 'err'); return; }
      spinning = true;
      const start = ang, extra = Math.PI * 2 * (5 + Math.random() * 3) + Math.random() * Math.PI * 2, dur = 4200, t0 = performance.now();
      (function f(t) {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
        ang = start + extra * e; draw();
        if (p < 1) raf = requestAnimationFrame(f);
        else {
          spinning = false;
          const seg = Math.PI * 2 / n.length, a = (((1.5 * Math.PI - ang) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const idx = Math.min(n.length - 1, Math.floor(a / seg)), w = n[idx];
          KA.sfx.play('win'); KA.confetti(90);
          if (rm.checked) { n.splice(idx, 1); ta.value = n.join('\n'); draw(); }
          KA.modal('🎉 Terpilih!', h('div', { class: 'center-box' }, h('div', { class: 'pts' }, w), h('p', { class: 'muted' }, 'Selamat! Giliranmu 😄')));
        }
      })(t0);
    }
    KA.onLeave(() => cancelAnimationFrame(raf));
    ta.addEventListener('input', draw);
    view.replaceChildren(
      h('div', { class: 'row between' }, back(), h('span', { class: 'pill' }, '🎡 Alat bantu kelas')),
      h('div', { class: 'wheel-grid' },
        h('div', { class: 'wheel-wrap' }, h('div', { class: 'pointer' }, '▼'), cv, h('button', { class: 'btn primary lg', onclick: spin }, '🎡 Putar!')),
        h('div', { class: 'card' }, h('label', { class: 'field' }, 'Daftar nama (satu per baris)', ta),
          h('label', { class: 'check' }, rm, ' Hapus nama yang sudah terpilih'),
          h('p', { class: 'muted small' }, 'Cocok untuk memilih siswa yang menjawab, membagi kelompok, atau giliran presentasi.'))));
    draw();
  }

  /* ---------------- Menu game ---------------- */
  KA.pages.game = (view, args) => {
    const sid = KA.subject(args[1]) ? args[1] : KA.store.get('gsubj', D.SUBJECTS[0].id);
    const g = args[0];
    if (g === 'memori') return memori(view, sid);
    if (g === 'acak') return acak(view, sid);
    if (g === 'hitung') return hitung(view);
    if (g === 'roda') return roda(view);

    let cur = sid;
    const sel = h('select', { class: 'input mini', 'aria-label': 'Mapel game', onchange: e => { cur = e.target.value; KA.store.set('gsubj', cur); } },
      D.SUBJECTS.map(s => h('option', { value: s.id, selected: s.id === cur }, s.icon + ' ' + s.name)));
    view.append(KA.pageHead('Arena Game', 'Belajar sambil bermain. Setiap game memberi poin, XP, dan masuk papan skor kelas!'),
      h('div', { class: 'row' }, h('label', { class: 'muted' }, 'Mapel untuk game kata & memori:'), sel),
      h('div', { class: 'grid g2 gap' }, GAMES.map(x => h('a', { class: 'game-card card', href: '#', onclick: e => { e.preventDefault(); location.hash = '#/game/' + x.id + (x.subj ? '/' + cur : ''); } },
        h('div', { class: 'gi' }, x.icon), h('div', null, h('h3', null, x.name), h('p', { class: 'muted' }, x.desc), x.subj && h('span', { class: 'tag' }, 'Ikut mapel terpilih'))))));
  };
})();
