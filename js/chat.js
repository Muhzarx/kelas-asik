/* ============================================================
   KelasAsik — Live Chat per kelas
   © muhzarx
   ============================================================ */
(function () {
  'use strict';
  const { h, store } = KA;
  const EMOJI = ['😀', '😂', '👍', '👏', '🎉', '❤️', '🤔', '🙏', '🔥', '💡', '📚', '✅'];
  const COLORS = ['#ef4444', '#f97316', '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#db2777'];
  const colorFor = s => { let x = 0; for (const ch of String(s)) x = (x * 31 + ch.charCodeAt(0)) >>> 0; return COLORS[x % COLORS.length]; };
  KA.colorFor = colorFor;

  KA.chat = {
    mount(host, opt) {
      opt = opt || {};
      const u = KA.user, cls = KA.curClass(), path = KA.cpath('chat'), RT = KA.rt;
      const list = h('div', { class: 'msgs', role: 'log', 'aria-live': 'polite' });
      const input = h('input', { class: 'input', placeholder: 'Tulis pesan…', maxlength: 500, autocomplete: 'off', 'aria-label': 'Pesan' });
      const emo = h('div', { class: 'emoji hidden' }, EMOJI.map(e => h('button', { type: 'button', onclick: () => { input.value += e; input.focus(); } }, e)));
      const form = h('form', { class: 'chat-form', onsubmit: ev => { ev.preventDefault(); send(); } },
        h('button', { type: 'button', class: 'icon-btn', title: 'Emoji', onclick: () => emo.classList.toggle('hidden') }, '😊'),
        input, h('button', { class: 'btn primary', type: 'submit' }, 'Kirim ➤'));
      const note = RT.mode === 'local'
        ? h('div', { class: 'notice' }, '💡 Mode lokal: pesan hanya terlihat di browser ini (coba buka 2 tab). Isi firebaseUrl di js/config.js supaya HP & laptop lain ikut terhubung.')
        : null;
      const box = h('section', { class: 'chat card' + (opt.compact ? ' compact' : '') },
        h('div', { class: 'chat-head' },
          h('div', null, h('b', null, '💬 Live Chat ' + cls.name), h('small', { class: 'muted' }, ' Ruang diskusi kelas')),
          h('span', { class: 'pill ' + (RT.mode === 'online' ? 'ok' : 'warn') }, RT.mode === 'online' ? '● Online' : '● Lokal')),
        note, list, emo, form);
      host.append(box);

      const t0 = Date.now();
      function add(m) {
        const near = list.scrollHeight - list.scrollTop - list.clientHeight < 90;
        if (m.type === 'sys') list.append(h('div', { class: 'sys' }, m.text));
        else {
          const me = m.name === u.name && m.role === u.role;
          list.append(h('div', { class: 'msg' + (me ? ' me' : '') },
            h('div', { class: 'avatar', style: { background: colorFor(m.name) } }, String(m.name || '?').charAt(0).toUpperCase()),
            h('div', { class: 'bubble' },
              h('div', { class: 'who' }, h('b', { style: { color: colorFor(m.name) } }, m.name), m.role === 'guru' && h('span', { class: 'tag' }, 'Guru'), h('time', null, KA.fmtTime(m.ts))),
              h('div', { class: 'txt' }, m.text))));
        }
        if (near || m.ts <= t0) list.scrollTop = list.scrollHeight;
      }
      const off = RT.listen(path, (k, m) => {
        add(m);
        if (m.ts > t0 && m.type !== 'sys' && !(m.name === u.name && m.role === u.role)) KA.sfx.play('msg');
      }, 100);
      list.scrollTop = list.scrollHeight;

      function send() {
        const text = input.value.trim(); if (!text) return;
        input.value = '';
        RT.send(path, { type: 'msg', name: u.name, role: u.role, text: text.slice(0, 500) }).catch(() => KA.toast('Pesan gagal terkirim. Cek koneksi / pengaturan Firebase.', 'err'));
        u.stats = u.stats || {}; u.stats.msgs = (u.stats.msgs || 0) + 1; KA.saveUser();
        KA.mission('chat'); if (u.stats.msgs >= 10) KA.badge('chatter');
      }
      const jk = 'lastjoin:' + path;
      if (Date.now() - store.get(jk, 0) > 10 * 60 * 1000) {
        store.set(jk, Date.now());
        RT.send(path, { type: 'sys', name: u.name, text: u.name + (u.role === 'guru' ? ' (Guru)' : '') + ' bergabung ke ruang chat' }).catch(() => { });
      }
      if (!opt.compact) setTimeout(() => input.focus(), 50);
      return () => off();
    }
  };

  KA.pages.chat = view => {
    view.append(KA.pageHead('Live Chat', 'Diskusi, tanya jawab, dan ngobrol santai bersama teman sekelas.'));
    KA.onLeave(KA.chat.mount(view));
  };
})();
