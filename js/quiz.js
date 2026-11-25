/* ============================================================
   KelasAsik — Mesin Kuis (skor, waktu, beruntun, pembahasan)
   © muhzarx
   ============================================================ */
(function () {
  'use strict';
  const { h } = KA;
  const TIME = 30;

  KA.subject = id => window.DATA.SUBJECTS.find(s => s.id === id);
  KA.bank = sid => (window.DATA.QUESTIONS[sid] || []).concat((KA.store.get('bank', {})[sid]) || []);

  KA.quiz = {
    start(view, sid, opt) {
      opt = Object.assign({ count: 10, timer: true }, opt);
      const subj = KA.subject(sid);
      const pool = KA.shuffle(KA.bank(sid)).slice(0, opt.count).map(q => {
        const order = KA.shuffle(q.o.map((_, i) => i));
        return { q: q.q, o: order.map(i => q.o[i]), a: order.indexOf(q.a), e: q.e || '' };
      });
      if (!pool.length) { view.replaceChildren(h('div', { class: 'card' }, 'Belum ada soal untuk mapel ini.')); return; }

      let i = 0, score = 0, correct = 0, streak = 0, best = 0, left = 0, locked = false, tm = null;
      const answers = [];

      const onKey = e => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) return;
        if (e.key === 'Enter' && locked) { e.preventDefault(); next(); return; }
        if (e.key.length !== 1 || locked) return;
        let k = '1234'.indexOf(e.key); if (k < 0) k = 'abcd'.indexOf(e.key.toLowerCase());
        if (k >= 0) pick(k);
      };
      document.addEventListener('keydown', onKey);
      KA.onLeave(() => { document.removeEventListener('keydown', onKey); clearInterval(tm); });

      let tbar, tnum, fb, nextBtn, optEls;

      function show() {
        clearInterval(tm); locked = false;
        const q = pool[i];
        tbar = h('i'); tnum = h('span');
        fb = h('div', { class: 'fb' });
        nextBtn = h('button', { class: 'btn primary lg hidden', onclick: next }, i === pool.length - 1 ? 'Lihat Hasil 🎉' : 'Lanjut →');
        optEls = q.o.map((t, k) => h('button', { class: 'opt', onclick: () => pick(k) }, h('b', null, 'ABCD'.charAt(k)), h('span', null, t)));
        view.replaceChildren(h('div', { class: 'quiz card' },
          h('div', { class: 'quiz-top' },
            h('span', { class: 'pill' }, subj.icon + ' ' + subj.name),
            h('span', { class: 'muted' }, 'Soal ' + (i + 1) + ' / ' + pool.length),
            h('span', { class: 'pill score' }, '⭐ ' + score),
            streak >= 2 && h('span', { class: 'pill fire' }, '🔥 ' + streak + ' beruntun')),
          h('div', { class: 'bar' }, h('i', { style: { width: (i / pool.length * 100) + '%' } })),
          opt.timer && h('div', { class: 'timer' }, h('div', { class: 'tbar' }, tbar), tnum),
          h('h2', { class: 'q' }, q.q),
          h('div', { class: 'opts' }, optEls),
          fb,
          h('div', { class: 'row end' }, nextBtn),
          h('p', { class: 'muted small' }, 'Tips: tekan 1–4 atau A–D untuk menjawab, Enter untuk lanjut.')));
        if (opt.timer) {
          left = TIME; paintTimer();
          tm = setInterval(() => { left--; paintTimer(); if (left <= 5 && left > 0) KA.sfx.play('tick'); if (left <= 0) pick(-1); }, 1000);
        }
      }
      function paintTimer() { tbar.style.width = (left / TIME * 100) + '%'; tbar.parentNode.classList.toggle('low', left <= 8); tnum.textContent = left + ' dtk'; }

      function pick(k) {
        if (locked) return; locked = true; clearInterval(tm);
        const q = pool[i], ok = k === q.a;
        let gain = 0;
        if (ok) {
          streak++; best = Math.max(best, streak); correct++;
          gain = 10 + (opt.timer ? Math.round(left / 3) : 0) + (streak >= 3 ? 5 : 0);
          score += gain; KA.sfx.play('ok');
        } else { streak = 0; KA.sfx.play('bad'); }
        answers.push({ q: q.q, chosen: k >= 0 ? q.o[k] : '(waktu habis)', right: q.o[q.a], ok, e: q.e });
        optEls.forEach((b, idx) => { b.disabled = true; if (idx === q.a) b.classList.add('right'); else if (idx === k) b.classList.add('wrong'); });
        fb.className = 'fb show ' + (ok ? 'good' : 'bad');
        fb.replaceChildren(h('b', null, ok ? '✅ Benar! +' + gain + ' poin' : (k < 0 ? '⏰ Waktu habis. ' : '❌ Kurang tepat. ') + 'Jawaban: ' + q.o[q.a]), q.e && h('p', null, '💡 ' + q.e));
        nextBtn.classList.remove('hidden');
        if (opt.timer) tbar.parentNode.classList.remove('low');
      }

      function next() {
        if (!locked) return; locked = false;
        if (i < pool.length - 1) { i++; show(); } else finish();
      }

      function finish() {
        document.removeEventListener('keydown', onKey);
        const total = pool.length, pct = Math.round(correct / total * 100), u = KA.user;
        const msg = pct >= 90 ? 'Luar biasa! 🌟' : pct >= 75 ? 'Bagus sekali! 👏' : pct >= 60 ? 'Lumayan, terus berlatih! 💪' : 'Jangan menyerah, ayo coba lagi! 📖';
        KA.addXP(score);
        u.stats = u.stats || {}; u.stats.quiz = (u.stats.quiz || 0) + 1; KA.saveUser();
        KA.badge('first'); if (pct === 100) KA.badge('perfect'); if (best >= 5) KA.badge('streak5');
        KA.mission('kuis');
        if (u.role === 'siswa') {
          KA.rt.send(KA.cpath('results'), { name: u.name, classId: u.classId, subject: sid, subjectName: subj.name, correct, total, pct, score }).catch(() => { });
          KA.rt.send(KA.cpath('scores'), { name: u.name, pts: score, src: 'Kuis ' + subj.short, kind: 'kuis' }).catch(() => { });
        }
        if (pct >= 80) { KA.sfx.play('win'); KA.confetti(); }
        view.replaceChildren(h('div', { class: 'quiz card result' },
          h('h2', null, 'Hasil Kuis ' + subj.name),
          h('div', { class: 'ring', style: { '--p': pct } }, h('div', null, h('b', null, pct), h('small', null, 'nilai'))),
          h('p', { class: 'big-msg' }, msg),
          h('div', { class: 'stats-row' },
            h('div', null, h('b', null, correct + '/' + total), h('span', null, 'Benar')),
            h('div', null, h('b', null, score), h('span', null, 'Poin (+XP)')),
            h('div', null, h('b', null, best), h('span', null, 'Beruntun terbaik'))),
          u.role === 'guru' && h('p', { class: 'muted small' }, 'Mode guru: skor tidak masuk papan skor siswa.'),
          h('div', { class: 'row center' },
            h('button', { class: 'btn primary', onclick: () => KA.quiz.start(view, sid, opt) }, '🔁 Ulangi'),
            h('button', { class: 'btn', onclick: () => KA.reroute() }, '📚 Mapel lain'),
            h('a', { class: 'btn', href: '#/skor' }, '🏆 Papan skor')),
          h('h3', null, 'Pembahasan'),
          h('div', { class: 'review' }, answers.map((a, n) => h('details', { class: a.ok ? 'ok' : 'no' },
            h('summary', null, (a.ok ? '✅ ' : '❌ ') + (n + 1) + '. ' + a.q),
            h('p', null, h('b', null, 'Jawabanmu: '), a.chosen),
            h('p', null, h('b', null, 'Jawaban benar: '), a.right),
            a.e && h('p', { class: 'muted' }, '💡 ' + a.e))))));
        window.scrollTo(0, 0);
      }

      show();
    }
  };
})();
