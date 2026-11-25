/* ============================================================
   KelasAsik — Video Meet (Jitsi Meet) + chat di samping
   © muhzarx
   ============================================================ */
(function () {
  'use strict';
  const { h, store } = KA;
  const C = window.CONFIG;

  let loading = null;
  function loadApi() {
    if (window.JitsiMeetExternalAPI) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://' + C.jitsiDomain + '/external_api.js';
      s.onload = () => res();
      s.onerror = () => { loading = null; rej(new Error('gagal memuat')); };
      document.head.append(s);
      setTimeout(() => { if (!window.JitsiMeetExternalAPI) { loading = null; rej(new Error('timeout')); } }, 12000);
    });
    return loading;
  }

  KA.pages.meet = view => {
    const u = KA.user, cls = KA.curClass();
    const room = C.roomPrefix + '-' + KA.rt.safe(cls.id);
    const link = 'https://' + C.jitsiDomain + '/' + room;
    const isGuru = u.role === 'guru';
    let api = null;
    const stage = h('div', { class: 'stage card' });

    function dispose() { if (api) { try { api.dispose(); } catch (e) { } api = null; } }
    KA.onLeave(dispose);

    function copy() {
      (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(
        () => KA.toast('Tautan ruang meet disalin 🔗', 'ok'), () => KA.toast(link, 'info'));
    }

    function lobby(errMsg) {
      stage.replaceChildren(h('div', { class: 'lobby' },
        h('div', { class: 'big' }, '🎥'),
        h('h2', null, 'Ruang Video Meet ' + cls.name),
        h('p', { class: 'muted' }, isGuru ? 'Klik tombol untuk memulai kelas online. Siswa tinggal klik "Gabung Kelas".' : 'Tunggu guru memulai kelas, lalu klik "Gabung Kelas".'),
        errMsg && h('div', { class: 'notice err' }, errMsg),
        h('div', { class: 'row center' },
          h('button', { class: 'btn primary lg', onclick: join }, isGuru ? '▶ Mulai Kelas' : '🚪 Gabung Kelas'),
          h('a', { class: 'btn', href: link, target: '_blank', rel: 'noopener' }, '↗ Buka di tab baru'),
          h('button', { class: 'btn', onclick: copy }, '🔗 Salin tautan')),
        h('ul', { class: 'tips' },
          h('li', null, '🎤 Izinkan akses mikrofon/kamera saat diminta browser.'),
          h('li', null, '✋ Gunakan tombol "angkat tangan" di dalam meet untuk bertanya.'),
          h('li', null, '🖥️ Guru dapat berbagi layar untuk menampilkan materi.'),
          h('li', null, '💬 Chat kelas ada di panel samping.'))));
    }

    async function join() {
      stage.replaceChildren(h('div', { class: 'lobby' }, h('div', { class: 'spinner' }), h('p', null, 'Menyiapkan ruang meet…')));
      try { await loadApi(); } catch (e) {
        lobby('Tidak bisa memuat Jitsi Meet (cek internet atau gunakan "Buka di tab baru").'); return;
      }
      stage.replaceChildren();
      const holder = h('div', { class: 'jitsi' });
      stage.append(holder);
      try {
        api = new window.JitsiMeetExternalAPI(C.jitsiDomain, {
          roomName: room, parentNode: holder, width: '100%', height: '100%',
          userInfo: { displayName: u.name + (isGuru ? ' (Guru)' : '') },
          configOverwrite: { prejoinPageEnabled: false, startWithAudioMuted: !isGuru, startWithVideoMuted: true, subject: 'Kelas ' + cls.name },
          interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false, MOBILE_APP_PROMO: false }
        });
        api.addEventListener('videoConferenceLeft', () => { dispose(); lobby(); });
      } catch (e) { dispose(); lobby('Gagal memulai meet. Coba "Buka di tab baru".'); return; }
      const k = 'meetxp:' + KA.today();
      if (!store.get(k, false)) { store.set(k, true); KA.addXP(10); KA.toast('🎥 +10 XP karena ikut kelas online!', 'ok'); }
    }

    view.append(KA.pageHead('Video Meet', 'Kelas tatap muka online dengan video, suara, dan berbagi layar.'));
    const side = h('div', { class: 'meet-side' });
    view.append(h('div', { class: 'meet-grid' }, stage, side));
    lobby();
    KA.onLeave(KA.chat.mount(side, { compact: true }));
  };
})();
