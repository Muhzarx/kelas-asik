/* ============================================================
   KelasAsik — Inti: util, penyimpanan, realtime, suara, konfeti, modal
   © muhzarx
   ============================================================ */
(function () {
  'use strict';
  const C = window.CONFIG;
  const KA = (window.KA = { pages: {} });

  /* ---------- DOM helper ---------- */
  KA.$ = (s, r) => (r || document).querySelector(s);
  KA.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  KA.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  KA.h = function (tag, attrs) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k of Object.keys(attrs)) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') {
          for (const sk of Object.keys(v)) {
            if (sk.slice(0, 2) === '--') el.style.setProperty(sk, v[sk]);
            else el.style[sk] = v[sk];
          }
        } else el.setAttribute(k, v === true ? '' : v);
      }
    }
    const kids = Array.prototype.slice.call(arguments, 2);
    (function add(list) {
      list.forEach(k => {
        if (k == null || k === false) return;
        if (Array.isArray(k)) return add(k);
        el.append(k.nodeType ? k : document.createTextNode(String(k)));
      });
    })(kids);
    return el;
  };
  const h = KA.h;

  /* ---------- util ---------- */
  KA.shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  KA.rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  KA.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  KA.dayStr = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  KA.today = () => KA.dayStr(new Date());
  KA.fmtTime = ts => new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  KA.fmtDateTime = ts => new Date(ts).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  KA.fmtDate = () => new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  KA.pageHead = (t, sub) => h('div', { class: 'page-head' }, h('h1', null, t), sub && h('p', { class: 'muted' }, sub));
  KA.download = (name, text, mime) => {
    const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' })), download: name });
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  /* ---------- penyimpanan (localStorage + cadangan memori) ---------- */
  const mem = {};
  KA.store = {
    get(k, d) { try { const v = localStorage.getItem('ka:' + k); if (v != null) return JSON.parse(v); } catch (e) { if (k in mem) return mem[k]; } return k in mem ? mem[k] : d; },
    set(k, v) { mem[k] = v; try { localStorage.setItem('ka:' + k, JSON.stringify(v)); } catch (e) { /* penuh/diblokir */ } },
    del(k) { delete mem[k]; try { localStorage.removeItem('ka:' + k); } catch (e) { } },
    keys() { const r = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('ka:') === 0) r.push(k.slice(3)); } } catch (e) { } return r; }
  };
  const store = KA.store;

  /* ---------- pengguna, XP, lencana ---------- */
  KA.user = null;
  KA.AVATARS = ['🦊', '🐼', '🐯', '🦁', '🐸', '🐙', '🦄', '🐧', '🐳', '🦉'];
  KA.BADGES = {
    first: { icon: '🌱', name: 'Langkah Pertama', desc: 'Menyelesaikan kuis pertama' },
    perfect: { icon: '💯', name: 'Nilai Sempurna', desc: 'Mendapat nilai 100 di sebuah kuis' },
    streak5: { icon: '🔥', name: 'Beruntun 5', desc: '5 jawaban benar berturut-turut' },
    gamer: { icon: '🎮', name: 'Gamer Kelas', desc: 'Memainkan 3 game' },
    hadir: { icon: '✅', name: 'Rajin Hadir', desc: 'Absen hadir pertama kali' },
    chatter: { icon: '💬', name: 'Aktif Diskusi', desc: 'Mengirim 10 pesan chat' },
    week: { icon: '📅', name: 'Konsisten', desc: 'Belajar 3 hari berturut-turut' },
    reader: { icon: '📚', name: 'Kutu Buku', desc: 'Membaca 3 materi' }
  };
  KA.loadUser = () => { KA.user = store.get('user', null); };
  KA.saveUser = () => {
    if (!KA.user) return;
    store.set('user', KA.user);
    const p = store.get('profiles', {});
    p[KA.user.name.toLowerCase() + '|' + KA.user.role] = KA.user;
    store.set('profiles', p);
  };
  KA.level = xp => Math.floor(xp / 200) + 1;
  KA.levelPct = xp => (xp % 200) / 2;
  KA.addXP = n => {
    const u = KA.user; n = Math.round(n);
    if (!u || !n) return;
    const before = KA.level(u.xp);
    u.xp += n; KA.saveUser();
    if (KA.level(u.xp) > before) { KA.toast('🎉 Naik ke Level ' + KA.level(u.xp) + '!', 'ok'); KA.sfx.play('win'); KA.confetti(80); }
    if (KA.refreshHeader) KA.refreshHeader();
  };
  KA.badge = id => {
    const u = KA.user; if (!u || !KA.BADGES[id]) return;
    u.badges = u.badges || [];
    if (u.badges.indexOf(id) >= 0) return;
    u.badges.push(id); KA.saveUser();
    KA.toast('🏅 Lencana baru: ' + KA.BADGES[id].icon + ' ' + KA.BADGES[id].name, 'ok');
  };

  /* ---------- misi harian ---------- */
  KA.MISSIONS = [
    { id: 'absen', t: 'Absen hadir hari ini', xp: 10 },
    { id: 'materi', t: 'Baca 1 materi', xp: 10 },
    { id: 'kuis', t: 'Selesaikan 1 kuis', xp: 20 },
    { id: 'game', t: 'Mainkan 1 game', xp: 15 },
    { id: 'chat', t: 'Kirim 1 pesan di chat', xp: 5 }
  ];
  KA.missionState = () => store.get('mission:' + KA.today(), {});
  KA.mission = id => {
    const s = KA.missionState();
    const m = KA.MISSIONS.find(x => x.id === id);
    if (!m || s[id]) return;
    s[id] = true; store.set('mission:' + KA.today(), s);
    KA.toast('🎯 Misi selesai: ' + m.t + ' (+' + m.xp + ' XP)', 'ok');
    KA.addXP(m.xp);
    if (KA.MISSIONS.every(x => s[x.id]) && !s.__bonus) {
      s.__bonus = true; store.set('mission:' + KA.today(), s);
      KA.addXP(50); KA.confetti(); KA.toast('🏅 Semua misi harian selesai! Bonus +50 XP', 'ok');
    }
  };

  /* ---------- toast & modal ---------- */
  KA.toast = (msg, type) => {
    const root = KA.$('#toasts'); if (!root) return;
    const t = h('div', { class: 'toast ' + (type || 'info') }, msg);
    root.append(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 3200);
  };
  KA.modal = (title, body, opt) => {
    opt = opt || {};
    const root = KA.$('#modal-root');
    const onKey = e => { if (e.key === 'Escape') close(); };
    const close = () => { ov.remove(); document.removeEventListener('keydown', onKey); if (opt.onClose) opt.onClose(); };
    const ov = h('div', { class: 'overlay', onclick: e => { if (e.target === ov) close(); } },
      h('div', { class: 'modal' + (opt.wide ? ' wide' : ''), role: 'dialog', 'aria-modal': 'true' },
        h('div', { class: 'modal-head' }, h('h3', null, title), h('button', { class: 'icon-btn', onclick: close, 'aria-label': 'Tutup' }, '✕')),
        h('div', { class: 'modal-body' }, body)));
    document.addEventListener('keydown', onKey);
    root.append(ov);
    return { close };
  };
  KA.confirm = (msg, onYes) => {
    const m = KA.modal('Konfirmasi', h('div', null, h('p', null, msg),
      h('div', { class: 'row end' }, h('button', { class: 'btn', onclick: () => m.close() }, 'Batal'),
        h('button', { class: 'btn primary', onclick: () => { m.close(); onYes(); } }, 'Ya, lanjut'))));
  };

  /* ---------- suara ---------- */
  KA.sfx = {
    on: store.get('sound', true), ctx: null,
    tone(f, dur, type, vol, delay) {
      if (!this.on) return;
      try {
        this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
        const c = this.ctx, o = c.createOscillator(), g = c.createGain(), t = c.currentTime + (delay || 0);
        o.type = type || 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(vol || 0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur);
      } catch (e) { }
    },
    play(n) {
      const t = (f, d, ty, v, de) => this.tone(f, d, ty, v, de);
      if (n === 'ok') { t(660, .1); t(880, .14, 'sine', .08, .1); }
      else if (n === 'bad') t(200, .25, 'sawtooth', .05);
      else if (n === 'tick') t(500, .05, 'square', .03);
      else if (n === 'win') [523, 659, 784, 1047].forEach((f, i) => t(f, .18, 'triangle', .08, i * .12));
      else if (n === 'pop') t(760, .07);
      else if (n === 'msg') { t(900, .06); t(1200, .08, 'sine', .06, .07); }
    }
  };

  /* ---------- konfeti ---------- */
  KA.confetti = n => {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    n = n || 140;
    const cv = h('canvas', { class: 'confetti' }); document.body.append(cv);
    cv.width = innerWidth; cv.height = innerHeight;
    const ctx = cv.getContext('2d'), cols = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff', '#ff9f1c'];
    const ps = Array.from({ length: n }, () => ({
      x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * .5, vx: (Math.random() - .5) * 4, vy: 2 + Math.random() * 4,
      s: 5 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: cols[Math.floor(Math.random() * cols.length)]
    }));
    const t0 = performance.now();
    (function f(t) {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .04; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6); ctx.restore(); });
      if (t - t0 < 3500) requestAnimationFrame(f); else cv.remove();
    })(t0);
  };

  /* ============================================================
     REALTIME: chat, skor, absen, pengumuman
     - mode "local"  : localStorage + BroadcastChannel (antar tab, 1 browser)
     - mode "online" : Firebase Realtime Database via REST + EventSource
     ============================================================ */
  const RT = (KA.rt = {});
  const base = String(C.firebaseUrl || '').trim().replace(/\/+$/, '');
  RT.mode = base ? 'online' : 'local';
  RT.safe = s => String(s).replace(/[^A-Za-z0-9_-]/g, '_');
  const listeners = {};
  let bc = null;
  function emit(path, key, val) { (listeners[path] || []).forEach(fn => { try { fn(key, val); } catch (e) { console.error(e); } }); }
  try { bc = new BroadcastChannel('kelasasik'); bc.onmessage = e => emit(e.data.path, e.data.key, e.data.val); } catch (e) { }

  RT.send = async (path, obj) => {
    const val = Object.assign({ ts: Date.now() }, obj);
    if (RT.mode === 'online') {
      const r = await fetch(base + '/' + path + '.json', { method: 'POST', body: JSON.stringify(val) });
      if (!r.ok) throw new Error('RT ' + r.status);
      return (await r.json()).name;
    }
    const key = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const map = store.get('rt:' + path, {});
    map[key] = val;
    const ks = Object.keys(map).sort();
    while (ks.length > 400) delete map[ks.shift()];
    store.set('rt:' + path, map);
    emit(path, key, val);
    if (bc) bc.postMessage({ path, key, val });
    return key;
  };

  RT.listen = (path, cb, limit) => {
    limit = limit || 100;
    const seen = new Set();
    const wrapped = (k, v) => { if (seen.has(k) || !v) return; seen.add(k); cb(k, v); };
    if (RT.mode === 'online') {
      const es = new EventSource(base + '/' + path + '.json?orderBy=%22%24key%22&limitToLast=' + limit);
      const handle = ev => {
        try {
          const m = JSON.parse(ev.data); if (!m) return;
          if (m.path === '/') { if (m.data && typeof m.data === 'object') Object.keys(m.data).sort().forEach(k => wrapped(k, m.data[k])); }
          else { const p = m.path.split('/').filter(Boolean); if (p.length === 1 && m.data) wrapped(p[0], m.data); }
        } catch (e) { }
      };
      es.addEventListener('put', handle); es.addEventListener('patch', handle);
      return () => es.close();
    }
    const set = listeners[path] || (listeners[path] = new Set());
    set.add(wrapped);
    const map = store.get('rt:' + path, {});
    Object.keys(map).sort().slice(-limit).forEach(k => wrapped(k, map[k]));
    return () => set.delete(wrapped);
  };

  KA.cpath = base_ => base_ + '/' + RT.safe(KA.user.classId);
})();
