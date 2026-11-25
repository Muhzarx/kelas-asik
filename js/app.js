/* ============================================================
   KelasAsik — Aplikasi utama: login, kerangka, router, halaman
   © muhzarx
   ============================================================ */
(function () {
  'use strict';
  const { $, h, store } = KA;
  const C = window.CONFIG, D = window.DATA;
  let leave = [];
  KA.onLeave = fn => { leave.push(fn); };

  KA.classes = () => D.CLASSES.concat(store.get('classes.custom', []));
  KA.curClass = () => KA.classes().find(c => c.id === KA.user.classId) || KA.classes()[0];
  KA.isTeacher = () => !!KA.user && KA.user.role === 'guru';

  const NAV = [
    { id: 'beranda', icon: '🏠', label: 'Beranda' },
    { id: 'materi', icon: '📚', label: 'Materi' },
    { id: 'kuis', icon: '📝', label: 'Kuis' },
    { id: 'game', icon: '🎮', label: 'Game' },
    { id: 'chat', icon: '💬', label: 'Live Chat' },
    { id: 'meet', icon: '🎥', label: 'Video Meet' },
    { id: 'skor', icon: '🏆', label: 'Papan Skor' },
    { id: 'guru', icon: '👩‍🏫', label: 'Ruang Guru', teacher: true }
  ];

  /* ---------- tema ---------- */
  function applyTheme() {
    const t = store.get('theme', (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', t);
    const b = $('#theme-btn'); if (b) b.textContent = t === 'dark' ? '☀️' : '🌙';
  }

  /* ---------- login ---------- */
  function showLogin() {
    const app = $('#app'); app.replaceChildren();
    let role = 'siswa';
    const name = h('input', { class: 'input', placeholder: 'Nama lengkap / panggilan', maxlength: 24, autocomplete: 'name', required: true, 'aria-label': 'Nama' });
    const code = h('input', { class: 'input', placeholder: 'Kode guru', type: 'password', autocomplete: 'off' });
    const codeBox = h('label', { class: 'field hidden' }, 'Kode guru', code);
    const sel = h('select', { class: 'input', 'aria-label': 'Kelas' });
    ['SMP', 'SMA'].forEach(lv => {
      const g = h('optgroup', { label: lv });
      KA.classes().filter(c => c.level === lv).forEach(c => g.append(h('option', { value: c.id }, c.name)));
      sel.append(g);
    });
    const roles = ['siswa', 'guru'];
    const roleBtns = roles.map(r => h('button', { type: 'button', class: 'seg' + (r === role ? ' on' : ''), onclick: () => {
      role = r; roleBtns.forEach((b, i) => b.classList.toggle('on', roles[i] === role)); codeBox.classList.toggle('hidden', role !== 'guru');
    } }, r === 'siswa' ? '🎒 Siswa' : '👩‍🏫 Guru'));

    const form = h('form', { class: 'login-card card', onsubmit: e => {
      e.preventDefault();
      const nm = name.value.trim();
      if (nm.length < 2) { KA.toast('Isi nama minimal 2 huruf.', 'err'); return; }
      if (role === 'guru' && code.value.trim() !== C.teacherCode) { KA.toast('Kode guru salah.', 'err'); return; }
      const key = nm.toLowerCase() + '|' + role, prof = store.get('profiles', {})[key];
      KA.user = prof ? Object.assign({}, prof, { classId: sel.value }) :
        { name: nm, role, classId: sel.value, xp: 0, badges: [], streak: 0, lastDay: '', stats: { msgs: 0, quiz: 0, games: 0 }, avatar: KA.AVATARS[KA.rand(0, KA.AVATARS.length - 1)] };
      KA.saveUser(); KA.sfx.play('pop'); startApp();
    } },
      h('h2', null, 'Masuk ke kelas'),
      h('div', { class: 'seg-wrap' }, roleBtns),
      h('label', { class: 'field' }, 'Nama', name), codeBox,
      h('label', { class: 'field' }, 'Pilih kelas', sel),
      h('button', { class: 'btn primary lg block', type: 'submit' }, 'Mulai belajar 🚀'),
      h('p', { class: 'muted small center' }, 'Tanpa daftar akun. Progresmu tersimpan di browser ini.'));

    app.append(h('div', { class: 'login-wrap' },
      h('div', { class: 'login-art' },
        h('div', { class: 'logo big' }, '🎓'), h('h1', null, C.appName), h('p', { class: 'lead' }, 'Belajar online yang seru untuk guru & siswa SMP dan SMA — ' + C.schoolName + '.'),
        h('ul', { class: 'feat' },
          h('li', null, '💬 Live chat per kelas'), h('li', null, '🎥 Video meet tatap muka'), h('li', null, '📝 Kuis + skor + pembahasan'),
          h('li', null, '🎮 Game edukasi & papan skor'), h('li', null, '🏅 XP, level, lencana, misi harian'))),
      h('div', { class: 'login-side' }, form, h('p', { class: 'foot-mini' }, '© ' + new Date().getFullYear() + ' ', h('b', null, C.owner), '. Hak cipta dilindungi.'))));
  }

  /* ---------- kerangka ---------- */
  KA.refreshHeader = () => {
    const u = KA.user, el = $('#xp'); if (!el || !u) return;
    el.replaceChildren(h('b', null, 'Lv ' + KA.level(u.xp)), h('div', { class: 'xpbar' }, h('i', { style: { width: KA.levelPct(u.xp) + '%' } })), h('small', null, u.xp + ' XP'));
  };

  let unread = 0, unreadOff = null;
  function paintUnread() { const d = $('#chat-dot'); if (!d) return; d.textContent = unread; d.classList.toggle('hidden', unread === 0); }
  function listenUnread() {
    if (unreadOff) unreadOff();
    const t0 = Date.now();
    unreadOff = KA.rt.listen(KA.cpath('chat'), (k, v) => {
      if (v.ts <= t0 || v.type === 'sys' || (v.name === KA.user.name && v.role === KA.user.role)) return;
      const p = KA.route && KA.route.page; if (p === 'chat' || p === 'meet') return;
      unread++; paintUnread(); KA.sfx.play('msg');
    }, 1);
  }

  function startApp() {
    const u = KA.user, t = KA.today();
    u.stats = u.stats || { msgs: 0, quiz: 0, games: 0 }; u.badges = u.badges || [];
    if (!KA.classes().some(c => c.id === u.classId)) u.classId = KA.classes()[0].id;
    if (u.lastDay !== t) { const y = KA.dayStr(new Date(Date.now() - 864e5)); u.streak = u.lastDay === y ? (u.streak || 0) + 1 : 1; u.lastDay = t; }
    KA.saveUser();
    if (u.streak >= 3) KA.badge('week');

    const app = $('#app'); app.replaceChildren();
    const nav = NAV.filter(n => !n.teacher || KA.isTeacher()).map(n =>
      h('a', { href: '#/' + n.id, 'data-id': n.id, class: 'nav-item' }, h('span', { class: 'ni' }, n.icon), h('span', { class: 'nl' }, n.label),
        n.id === 'chat' && h('em', { class: 'dot hidden', id: 'chat-dot' }, '0')));
    const side = h('aside', { class: 'side' },
      h('a', { class: 'brand', href: '#/beranda' }, h('span', { class: 'logo' }, '🎓'), h('div', null, h('b', null, C.appName), h('small', null, 'by ' + C.owner))),
      h('nav', { class: 'nav' }, nav));

    const sel = h('select', { class: 'input mini', id: 'class-sel', 'aria-label': 'Pilih kelas', onchange: e => {
      KA.user.classId = e.target.value; KA.saveUser(); unread = 0; paintUnread(); listenUnread(); route();
    } });
    ['SMP', 'SMA'].forEach(lv => {
      const g = h('optgroup', { label: lv });
      KA.classes().filter(c => c.level === lv).forEach(c => g.append(h('option', { value: c.id, selected: c.id === u.classId }, c.name)));
      sel.append(g);
    });
    const top = h('header', { class: 'top' },
      h('div', { class: 'top-l' }, h('span', { class: 'avatar sm' }, u.avatar || '🦊'), h('div', null, h('b', null, u.name), h('small', { class: 'muted' }, u.role === 'guru' ? 'Guru' : 'Siswa'))),
      h('div', { class: 'top-m' }, sel),
      h('div', { class: 'top-r' }, h('div', { class: 'xp', id: 'xp' }),
        h('button', { class: 'icon-btn', id: 'theme-btn', title: 'Ganti tema', 'aria-label': 'Ganti tema', onclick: () => { store.set('theme', document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); applyTheme(); } }, '🌙'),
        h('button', { class: 'icon-btn', id: 'snd-btn', title: 'Suara', 'aria-label': 'Suara', onclick: () => { KA.sfx.on = !KA.sfx.on; store.set('sound', KA.sfx.on); $('#snd-btn').textContent = KA.sfx.on ? '🔊' : '🔇'; } }, KA.sfx.on ? '🔊' : '🔇'),
        h('button', { class: 'icon-btn', title: 'Keluar', 'aria-label': 'Keluar', onclick: () => KA.confirm('Keluar dari akun? Progres tetap tersimpan di browser ini.', () => { store.del('user'); KA.user = null; if (unreadOff) unreadOff(); leave.forEach(f => { try { f(); } catch (e) { } }); leave = []; showLogin(); }) }, '🚪')));
    const view = h('main', { class: 'view', id: 'view', tabindex: '-1' });
    const foot = h('footer', { class: 'foot' }, '© ' + new Date().getFullYear() + ' ', h('b', null, C.owner), '. Hak cipta dilindungi · ' + C.appName);
    app.append(h('div', { class: 'shell' }, side, h('div', { class: 'main' }, top, view, foot)));
    applyTheme(); KA.refreshHeader(); listenUnread();
    route();
  }

  /* ---------- router ---------- */
  function route() {
    if (!KA.user) return;
    leave.forEach(fn => { try { fn(); } catch (e) { } }); leave = [];
    const parts = (location.hash.replace(/^#\/?/, '') || 'beranda').split('/');
    let page = parts[0];
    if (!KA.pages[page] || (page === 'guru' && !KA.isTeacher())) page = 'beranda';
    KA.$$('.nav-item').forEach(a => a.classList.toggle('active', a.dataset.id === page));
    const view = $('#view'); if (!view) return;
    view.replaceChildren(); view.className = 'view page-' + page;
    KA.route = { page, args: parts.slice(1) };
    if (page === 'chat' || page === 'meet') { unread = 0; paintUnread(); }
    window.scrollTo(0, 0);
    try { KA.pages[page](view, parts.slice(1)); }
    catch (e) { console.error(e); view.replaceChildren(h('div', { class: 'card' }, h('h3', null, 'Ups, terjadi kesalahan 😢'), h('p', { class: 'muted' }, String(e && e.message || e)))); }
  }
  KA.reroute = route;
  window.addEventListener('hashchange', route);

  /* ============================================================
     HALAMAN: BERANDA
     ============================================================ */
  KA.pages.beranda = view => {
    const u = KA.user, cls = KA.curClass(), RT = KA.rt;
    const ms = KA.missionState();

    view.append(h('section', { class: 'hero card' },
      h('div', null, h('p', { class: 'eyebrow' }, KA.fmtDate()),
        h('h1', null, 'Halo, ' + u.name + '! ', h('span', { class: 'wave' }, '👋')),
        h('p', { class: 'muted' }, (u.role === 'guru' ? 'Guru' : 'Siswa') + ' · ' + cls.name + ' (' + cls.level + ') · ' + C.schoolName),
        h('div', { class: 'row' }, h('a', { class: 'btn primary', href: '#/kuis' }, '📝 Mulai kuis'), h('a', { class: 'btn', href: '#/meet' }, '🎥 Masuk meet'))),
      h('div', { class: 'hero-art' }, u.avatar || '🎓')));

    view.append(h('div', { class: 'grid g4 gap' },
      h('div', { class: 'stat' }, h('b', null, u.xp), h('span', null, '⭐ Total XP')),
      h('div', { class: 'stat' }, h('b', null, KA.level(u.xp)), h('span', null, '🚀 Level')),
      h('div', { class: 'stat' }, h('b', null, u.streak || 1), h('span', null, '🔥 Hari beruntun')),
      h('div', { class: 'stat' }, h('b', null, (u.badges || []).length), h('span', null, '🏅 Lencana'))));

    /* misi */
    const done = KA.MISSIONS.filter(m => ms[m.id]).length;
    const missions = h('section', { class: 'card' }, h('h3', null, '🎯 Misi hari ini ', h('span', { class: 'pill' }, done + '/' + KA.MISSIONS.length)),
      h('div', { class: 'bar' }, h('i', { style: { width: (done / KA.MISSIONS.length * 100) + '%' } })),
      h('ul', { class: 'missions' }, KA.MISSIONS.map(m => h('li', { class: ms[m.id] ? 'done' : '' }, h('span', null, ms[m.id] ? '✅' : '⬜'), h('span', null, m.t), h('em', null, '+' + m.xp + ' XP')))),
      h('p', { class: 'muted small' }, 'Selesaikan semua misi untuk bonus +50 XP!'));

    /* absen */
    const absenPath = RT.safe('absen') + '/' + RT.safe(u.classId) + '/' + KA.today();
    const present = new Map();
    const absenList = h('div', { class: 'chips' });
    const absenBtn = h('button', { class: 'btn primary', onclick: () => {
      RT.send(absenPath, { name: u.name, role: u.role }).then(() => { KA.badge('hadir'); KA.mission('absen'); }).catch(() => KA.toast('Gagal absen.', 'err'));
    } }, '✋ Saya hadir');
    function paintAbsen() {
      const me = present.has(u.name + '|' + u.role);
      absenBtn.disabled = me; absenBtn.textContent = me ? '✅ Sudah hadir' : '✋ Saya hadir';
      absenList.replaceChildren(...(present.size ? Array.from(present.values()).map(p => h('span', { class: 'chip' }, (p.role === 'guru' ? '👩‍🏫 ' : '') + p.name)) : [h('span', { class: 'muted small' }, 'Belum ada yang absen hari ini.')]));
    }
    KA.onLeave(RT.listen(absenPath, (k, v) => { present.set(v.name + '|' + v.role, v); paintAbsen(); }, 200));
    const absen = h('section', { class: 'card' }, h('h3', null, '🗓️ Absensi hari ini'), h('div', { class: 'row' }, absenBtn, h('span', { class: 'muted small' }, 'Hadir tercatat per kelas.')), absenList);
    paintAbsen();

    view.append(h('div', { class: 'grid g2 gap' }, missions, absen));

    /* pengumuman */
    const annPath = KA.cpath('ann');
    const anns = [];
    const annList = h('div', { class: 'stack' });
    function paintAnn() {
      annList.replaceChildren(...(anns.length ? anns.slice().sort((a, b) => b.ts - a.ts).slice(0, 8).map(a => h('div', { class: 'ann' }, h('div', { class: 'row between' }, h('b', null, '📢 ' + a.name), h('small', { class: 'muted' }, KA.fmtDateTime(a.ts))), h('p', null, a.text)))
        : [h('p', { class: 'muted' }, 'Belum ada pengumuman.')]));
    }
    KA.onLeave(RT.listen(annPath, (k, v) => { anns.push(v); paintAnn(); }, 30));
    let annForm = null;
    if (KA.isTeacher()) {
      const ta = h('textarea', { class: 'input', rows: 2, placeholder: 'Tulis pengumuman untuk ' + cls.name + '…', maxlength: 400 });
      annForm = h('form', { class: 'ann-form', onsubmit: e => { e.preventDefault(); const t = ta.value.trim(); if (!t) return; RT.send(annPath, { name: u.name, text: t }).catch(() => KA.toast('Gagal mengirim.', 'err')); ta.value = ''; KA.toast('Pengumuman terkirim 📢', 'ok'); } },
        ta, h('button', { class: 'btn primary', type: 'submit' }, 'Kirim pengumuman'));
    }
    view.append(h('section', { class: 'card' }, h('h3', null, '📢 Pengumuman ' + cls.name), annForm, annList));
    paintAnn();

    /* lencana */
    view.append(h('section', { class: 'card' }, h('h3', null, '🏅 Koleksi lencana'),
      h('div', { class: 'badges' }, Object.keys(KA.BADGES).map(id => { const b = KA.BADGES[id], has = (u.badges || []).indexOf(id) >= 0;
        return h('div', { class: 'badge-item' + (has ? '' : ' locked'), title: b.desc }, h('div', { class: 'bi' }, has ? b.icon : '🔒'), h('b', null, b.name), h('small', { class: 'muted' }, b.desc)); }))));
  };

  /* ============================================================
     HALAMAN: MATERI
     ============================================================ */
  function ytId(url) { const m = String(url || '').match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/); return m ? m[1] : null; }
  function renderBody(lines) {
    const out = []; let ul = null;
    lines.forEach(l => {
      if (l.indexOf('- ') === 0) { if (!ul) { ul = h('ul'); out.push(ul); } ul.append(h('li', null, l.slice(2))); }
      else { ul = null; out.push(l.indexOf('## ') === 0 ? h('h4', null, l.slice(3)) : h('p', null, l)); }
    });
    return out;
  }
  KA.pages.materi = (view, args) => {
    const sid = KA.subject(args[0]) ? args[0] : D.SUBJECTS[0].id;
    const subj = KA.subject(sid);
    const custom = () => store.get('materi.custom', []).filter(m => m.subject === sid);
    const read = () => store.get('read', {});

    view.append(KA.pageHead('Materi Belajar', 'Baca ringkasan materi dan tonton video dari guru. Setiap materi baru memberi +5 XP.'),
      h('div', { class: 'tabs' }, D.SUBJECTS.map(s => h('a', { class: 'tab' + (s.id === sid ? ' on' : ''), href: '#/materi/' + s.id }, s.icon + ' ' + s.short))));
    const grid = h('div', { class: 'grid g3 gap' });

    function open(m) {
      const body = h('div', { class: 'prose' }, renderBody(m.body || []));
      const vid = ytId(m.video);
      const node = h('div', null, vid && h('div', { class: 'video' }, h('iframe', { src: 'https://www.youtube-nocookie.com/embed/' + vid, title: m.title, allowfullscreen: true, allow: 'accelerometer; encrypted-media; picture-in-picture', loading: 'lazy' })), body);
      KA.modal((m.icon || '📄') + ' ' + m.title, node, { wide: true });
      const r = read();
      if (!r[m.id]) { r[m.id] = 1; store.set('read', r); KA.addXP(5); KA.mission('materi'); if (Object.keys(r).length >= 3) KA.badge('reader'); paint(); }
    }
    function paint() {
      const items = (D.MATERI[sid] || []).concat(custom());
      const r = read();
      grid.replaceChildren(...items.map(m => h('div', { class: 'mat-card card' },
        h('div', { class: 'mi', style: { background: subj.color } }, m.icon || '📄'),
        h('h3', null, m.title), h('p', { class: 'muted small' }, (m.video ? '🎬 Ada video · ' : '') + (r[m.id] ? '✅ Sudah dibaca' : 'Belum dibaca')),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: () => open(m) }, 'Buka'),
          m.custom && KA.isTeacher() && h('button', { class: 'btn small', onclick: () => { store.set('materi.custom', store.get('materi.custom', []).filter(x => x.id !== m.id)); paint(); } }, '🗑')))));
      if (!items.length) grid.append(h('p', { class: 'muted' }, 'Belum ada materi.'));
    }
    if (KA.isTeacher()) {
      view.append(h('div', { class: 'row end' }, h('button', { class: 'btn', onclick: () => {
        const t = h('input', { class: 'input', placeholder: 'Judul materi', required: true });
        const b = h('textarea', { class: 'input', rows: 6, placeholder: 'Isi materi. Awali baris dengan "- " untuk poin atau "## " untuk judul kecil.' });
        const v = h('input', { class: 'input', placeholder: 'Tautan YouTube (opsional)' });
        const m = KA.modal('➕ Tambah materi — ' + subj.short, h('form', { class: 'form', onsubmit: e => {
          e.preventDefault(); if (!t.value.trim()) return;
          const list = store.get('materi.custom', []); list.push({ id: 'c_' + KA.uid(), subject: sid, title: t.value.trim(), icon: '📄', body: b.value.split('\n').map(s => s.trim()).filter(Boolean), video: v.value.trim(), custom: true });
          store.set('materi.custom', list); m.close(); paint(); KA.toast('Materi ditambahkan ✅', 'ok');
        } }, h('label', { class: 'field' }, 'Judul', t), h('label', { class: 'field' }, 'Isi', b), h('label', { class: 'field' }, 'Video', v), h('button', { class: 'btn primary', type: 'submit' }, 'Simpan')), { wide: true });
      } }, '➕ Tambah materi')));
    }
    view.append(grid); paint();
  };

  /* ============================================================
     HALAMAN: KUIS (pilih mapel)
     ============================================================ */
  KA.pages.kuis = view => {
    let count = 10, timer = true;
    view.append(KA.pageHead('Kuis', 'Pilih mata pelajaran, jawab soal, dapatkan skor, XP, dan pembahasan.'));
    const cOpt = h('div', { class: 'seg-wrap' }), tOpt = h('div', { class: 'seg-wrap' });
    function paintOpts() {
      cOpt.replaceChildren(...[5, 10].map(n => h('button', { class: 'seg' + (count === n ? ' on' : ''), onclick: () => { count = n; paintOpts(); } }, n + ' soal')));
      tOpt.replaceChildren(...[[true, '⏱ Pakai timer'], [false, '🧘 Santai']].map(o => h('button', { class: 'seg' + (timer === o[0] ? ' on' : ''), onclick: () => { timer = o[0]; paintOpts(); } }, o[1])));
    }
    paintOpts();
    view.append(h('div', { class: 'row' }, cOpt, tOpt));
    view.append(h('div', { class: 'grid g3 gap' }, D.SUBJECTS.map(s => {
      const n = KA.bank(s.id).length;
      return h('div', { class: 'subj-card card', style: { '--c': s.color } },
        h('div', { class: 'mi', style: { background: s.color } }, s.icon), h('h3', null, s.name),
        h('p', { class: 'muted small' }, n + ' soal' + (s.id === 'pai' ? ' · 10 soal uji coba + kunci' : '')),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: () => KA.quiz.start(view, s.id, { count, timer }) }, '▶ Mulai'),
          KA.isTeacher() && h('button', { class: 'btn', onclick: () => KA.answerKey(s.id) }, '📋 Kunci')));
    })));
  };

  /* ============================================================
     HALAMAN: PAPAN SKOR
     ============================================================ */
  KA.pages.skor = view => {
    const RT = KA.rt, cls = KA.curClass();
    const rows = []; let filter = 'all', pending = 0;
    const DEMO = [['Alya', 340, 6], ['Bima', 295, 5], ['Citra', 260, 5], ['Dimas', 180, 3], ['Eka', 120, 2]];
    const body = h('div'), tabs = h('div', { class: 'tabs' });
    function paint() {
      pending = 0;
      const use = rows.filter(r => filter === 'all' || r.kind === filter);
      const agg = new Map();
      use.forEach(r => { const a = agg.get(r.name) || { name: r.name, pts: 0, n: 0 }; a.pts += Number(r.pts) || 0; a.n++; agg.set(r.name, a); });
      let list = Array.from(agg.values());
      const demo = RT.mode === 'local' && list.length < 5 && filter === 'all';
      if (demo) DEMO.forEach(d => { if (!agg.has(d[0])) list.push({ name: d[0], pts: d[1], n: d[2], demo: true }); });
      list.sort((a, b) => b.pts - a.pts);
      const medal = ['🥇', '🥈', '🥉'];
      const podium = list.slice(0, 3);
      body.replaceChildren(
        h('div', { class: 'podium' }, [1, 0, 2].map(pos => podium[pos] && h('div', { class: 'pod p' + (pos + 1) },
          h('div', { class: 'pm' }, medal[pos]), h('div', { class: 'avatar', style: { background: KA.colorFor(podium[pos].name) } }, podium[pos].name.charAt(0).toUpperCase()),
          h('b', null, podium[pos].name), h('span', null, podium[pos].pts + ' poin')))),
        h('div', { class: 'card' }, h('div', { class: 'table-wrap' }, h('table', { class: 'table' },
          h('thead', null, h('tr', null, ['#', 'Nama', 'Aktivitas', 'Poin'].map(t => h('th', null, t)))),
          h('tbody', null, list.length ? list.map((a, i) => h('tr', { class: a.name === KA.user.name ? 'me' : '' },
            h('td', null, medal[i] || (i + 1)), h('td', null, a.name, a.demo && h('span', { class: 'tag' }, 'contoh')), h('td', null, a.n + 'x'), h('td', null, h('b', null, a.pts))))
            : h('tr', null, h('td', { colspan: 4, class: 'muted' }, 'Belum ada skor. Kerjakan kuis atau main game — jadilah yang pertama! 🚀')))))),
        demo && h('p', { class: 'muted small' }, 'Baris bertanda "contoh" hanya data demo agar papan skor terlihat hidup. Akan hilang saat sudah ada 5 siswa nyata.'));
    }
    function paintTabs() {
      tabs.replaceChildren(...[['all', '🏆 Semua'], ['kuis', '📝 Kuis'], ['game', '🎮 Game']].map(t => h('button', { class: 'tab' + (filter === t[0] ? ' on' : ''), onclick: () => { filter = t[0]; paintTabs(); paint(); } }, t[1])));
    }
    KA.onLeave(RT.listen(KA.cpath('scores'), (k, v) => { rows.push(v); if (!pending) { pending = 1; setTimeout(paint, 60); } }, 500));
    view.append(KA.pageHead('Papan Skor ' + cls.name, 'Peringkat dari skor kuis dan game di kelasmu.'), tabs, body);
    paintTabs(); paint();
  };

  /* ---------- mulai ---------- */
  function boot() {
    KA.loadUser(); applyTheme();
    if (KA.user) startApp(); else showLogin();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
