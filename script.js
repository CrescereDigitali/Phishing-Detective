(() => {
  const GAME_INFO = {
    detective: { name: 'Phishing Detective', max: 180, threshold: 126 },
    realorscam: { name: 'Real or Scam?', max: 140, threshold: 98 },
    engineer: { name: 'Social Engineer Challenge', max: 180, threshold: 126 },
    hotspot: { name: 'Clicca i segnali', max: 225, threshold: 158 }
  };

  const state = {
    total: 0,
    results: {
      detective: null,
      realorscam: null,
      engineer: null,
      hotspot: null
    },
    current: null
  };

  const screens = {
    home: document.getElementById('home'),
    game: document.getElementById('gameScreen')
  };
  const gameContent = document.getElementById('gameContent');
  const totalScore = document.getElementById('totalScore');
  const homeBtn = document.getElementById('homeBtn');
  const introPanel = document.getElementById('introPanel');
  const gameHub = document.getElementById('gameHub');
  const enterGameBtn = document.getElementById('enterGameBtn');

  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const closeModalBtn = document.getElementById('closeModal');

  function esc(s='') {
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  function resetSession() {
    state.total = 0;
    state.current = null;
    Object.keys(state.results).forEach(k => state.results[k] = null);
    totalScore.textContent = '0';
    updateCards();
  }

  function enterGameHub() {
    resetSession();
    introPanel.classList.add('hidden');
    gameHub.classList.remove('hidden');
    homeBtn.classList.add('hidden');
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  enterGameBtn.addEventListener('click', enterGameHub);

  function openGame(name) {
    state.current = name;
    screens.home.classList.remove('active');
    screens.game.classList.add('active');
    homeBtn.classList.remove('hidden');
    window.scrollTo({top:0, behavior:'smooth'});
    ({
      detective: renderDetective,
      realorscam: renderRealOrScam,
      engineer: renderEngineer,
      hotspot: renderHotspot
    }[name]());
  }

  function goHome() {
    state.current = null;
    screens.game.classList.remove('active');
    screens.home.classList.add('active');
    homeBtn.classList.add('hidden');
    gameHub.classList.remove('hidden');
    introPanel.classList.add('hidden');
    gameContent.innerHTML = '';
    updateCards();
    window.scrollTo({top:0, behavior:'smooth'});
  }

  document.querySelectorAll('[data-game]').forEach(btn => {
    btn.addEventListener('click', () => openGame(btn.dataset.game));
  });
  homeBtn.addEventListener('click', goHome);

  function bindZoomableImages(scope=document) {
    scope.querySelectorAll('img[data-zoomable]').forEach(img => {
      if (img.dataset.zoomBound === '1') return;
      img.dataset.zoomBound = '1';
      img.addEventListener('click', () => {
        modalImg.src = img.getAttribute('src');
        modalImg.alt = img.getAttribute('alt') || 'Anteprima immagine';
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      });
    });
  }

  function closeModal() {
    modal.classList.add('hidden');
    modalImg.src = '';
    document.body.style.overflow = '';
  }
  closeModalBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => {
    if (e.target.hasAttribute('data-close-modal')) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });

  function showToast(message, type='neutral') {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  function addTransientMarker(stage, x, y, good) {
    const m = document.createElement('div');
    m.className = `marker ${good ? 'good' : 'bad'}`;
    m.style.left = `${x}%`;
    m.style.top = `${y}%`;
    m.textContent = good ? '✓' : '✕';
    stage.appendChild(m);
    setTimeout(() => m.remove(), 1500);
  }

  function updateCards() {
    Object.entries(state.results).forEach(([key, result]) => {
      const card = document.querySelector(`[data-card="${key}"]`);
      if (!card) return;
      const status = card.querySelector('.game-status');
      card.classList.remove('passed', 'failed');

      if (!result) {
        status.textContent = 'Non ancora svolto';
        return;
      }
      if (result.passed) {
        card.classList.add('passed');
        status.textContent = `Superato · ${result.score}/${GAME_INFO[key].max}`;
      } else {
        card.classList.add('failed');
        status.textContent = `Da rifare · ${result.score}/${GAME_INFO[key].max}`;
      }
    });
  }

  function recalcTotal() {
    state.total = Object.values(state.results).reduce((sum, r) => sum + (r ? r.score : 0), 0);
    totalScore.textContent = state.total;
  }

  function recordResult(key, score) {
    const info = GAME_INFO[key];
    const passed = score >= info.threshold;

    // Manteniamo il punteggio migliore ottenuto per ogni gioco.
    const prev = state.results[key];
    if (!prev || score > prev.score) {
      state.results[key] = { score, passed };
    }
    recalcTotal();
    updateCards();
    return state.results[key];
  }

  function allGamesPassed() {
    return Object.values(state.results).every(r => r && r.passed);
  }

  function allGamesAttempted() {
    return Object.values(state.results).every(Boolean);
  }

  function maybeShowOverallStatus() {
    if (allGamesPassed()) {
      showFinalCelebration();
      return true;
    }

    if (allGamesAttempted()) {
      const failed = Object.entries(state.results)
        .filter(([, r]) => !r.passed)
        .map(([key]) => `${GAME_INFO[key].name}: servono almeno ${GAME_INFO[key].threshold}/${GAME_INFO[key].max} punti`);

      setTimeout(() => {
        showToast(
          'Per completare la missione devi superare ogni gioco con almeno il 70%. Puoi rifare quelli in rosso.',
          'bad'
        );
      }, 250);
    }
    return false;
  }

  function showFinalCelebration() {
    homeBtn.classList.add('hidden');
    gameContent.innerHTML = `
      <div class="panel final-celebration">
        <div class="kicker">MISSIONE COMPLETATA</div>
        <h2>Hai completato tutte le sfide!</h2>
        <p>Hai superato tutti e 4 i giochi con almeno il 70%.</p>

        <div class="final-animation" id="finalAnimation">
          <img class="active" src="assets/finale-1.png" alt="Hacker con cappuccio">
          <img src="assets/finale-2.png" alt="L'hacker si toglie il cappuccio">
          <img src="assets/finale-3.png" alt="Ragazzo senza cappuccio">
          <img src="assets/finale-4.png" alt="Bravo, hai smascherato l'hacker">
        </div>

        <div class="toolbar">
          <button class="primary" id="finalHome" type="button">Torna ai giochi</button>
        </div>
      </div>`;

    const frames = [...document.querySelectorAll('#finalAnimation img')];
    const timings = [900, 850, 1050, 2400];
    let current = 0;

    function showFrame(index) {
      frames.forEach((frame, i) => frame.classList.toggle('active', i === index));
    }
    function advance() {
      if (current >= frames.length - 1) return;
      setTimeout(() => {
        current++;
        showFrame(current);
        advance();
      }, timings[current]);
    }
    advance();

    document.getElementById('finalHome').addEventListener('click', goHome);
  }

  function showGameResult(key, score, tips, replayKey) {
    const info = GAME_INFO[key];
    const result = recordResult(key, score);
    const passed = score >= info.threshold;

    gameContent.innerHTML = `
      <div class="panel final-score">
        <div class="kicker">${esc(info.name)} · completato</div>
        <div class="big">${score}/${info.max}</div>
        <div class="rank">${passed ? 'SUPERATO' : 'DA RIFARE'}</div>
        <div class="pass-line ${passed ? 'ok' : 'no'}">
          ${passed
            ? `Hai superato il 70% richiesto.`
            : `Per superare questo gioco servono almeno ${info.threshold} punti su ${info.max}.`}
        </div>
        <div class="review">${tips.map(t => `<div class="review-item">${esc(t)}</div>`).join('')}</div>
        <div class="toolbar">
          <button class="primary" id="resultHome" type="button">Torna ai giochi</button>
          <button class="secondary" id="replay" type="button">Rigioca</button>
        </div>
      </div>`;

    document.getElementById('resultHome').addEventListener('click', () => {
      if (passed && allGamesPassed()) {
        showFinalCelebration();
        return;
      }
      goHome();
      if (!passed) {
        setTimeout(() => {
          showToast(
            `Per superare ${info.name} devi ottenere almeno ${info.threshold}/${info.max} punti. Puoi rifarlo quando vuoi.`,
            'bad'
          );
        }, 250);
      } else if (allGamesAttempted() && !allGamesPassed()) {
        setTimeout(() => {
          showToast(
            'Per completare la missione devi superare tutti i giochi con almeno il 70%. Rifai quelli in rosso.',
            'bad'
          );
        }, 250);
      }
    });

    document.getElementById('replay').addEventListener('click', () => openGame(replayKey));
  }

  // ---------------- GAME 1 ----------------
  const detectiveCases = [
    {
      title:'Email Instagram',
      image:'assets/instagram_mail.png',
      intro:'Osserva la schermata e seleziona tutti gli indizi che ti sembrano sospetti. Attenzione: possono esserci più risposte corrette.',
      options:[
        {text:'Il dominio del mittente è instagram-alerts.net', ok:true, why:'Il dominio non è quello ufficiale di Instagram.'},
        {text:'Milano, Italia · Chrome · Windows', ok:false, why:'Questo dato, da solo, non dimostra una truffa.'},
        {text:'La frase “verifica il tuo account entro 24 ore” crea urgenza', ok:true, why:'L’urgenza è una leva tipica del social engineering.'},
        {text:'Il link porta a instagram.security-check.com/login', ok:true, why:'Il dominio reale è security-check.com, non instagram.com.'}
      ]
    },
    {
      title:'DM su Discord',
      image:'assets/discord_leo.png',
      intro:'Seleziona tutti gli elementi che indicano impersonificazione o manipolazione. Possono esserci più risposte corrette.',
      options:[
        {text:'La frase “mi serve un favore al volo” è già una prova di truffa', ok:false, why:'Da sola non basta.'},
        {text:'La minaccia di ban permanente entro oggi crea pressione', ok:true, why:'Paura e fretta servono a farti agire senza verificare.'},
        {text:'La storia “ho segnalato per sbaglio il tuo account” è sospetta', ok:true, why:'È uno schema usato per spaventare la vittima.'},
        {text:'Il contatto chiede di scrivere a @DiscordSupport_Official', ok:true, why:'Un nome che sembra ufficiale non garantisce autenticità.'}
      ]
    },
    {
      title:'Poster con QR code',
      image:'assets/wifi_poster.png',
      intro:'Seleziona tutti i segnali di rischio. Anche qui possono esserci più risposte corrette.',
      options:[
        {text:'Il titolo “FREE WIFI” è automaticamente una prova di attacco', ok:false, why:'L’offerta può essere reale; il problema sono le richieste successive.'},
        {text:'La richiesta di accesso con account Google è sospetta', ok:true, why:'Per un Wi‑Fi pubblico non è normale richiedere l’account Google.'},
        {text:'La richiesta della password è un segnale critico', ok:true, why:'Una password non dovrebbe essere richiesta per accedere a un Wi‑Fi.'},
        {text:'Il QR code nasconde la destinazione finché non lo scansioni', ok:true, why:'Il QR code non mostra subito dove porta.'}
      ]
    }
  ];

  function renderDetective() {
    let ci = 0, score = 0;

    function draw() {
      const c = detectiveCases[ci];
      gameContent.innerHTML = `
        <div class="game-shell">
          <div class="game-top">
            <div><div class="kicker">01 · Phishing Detective</div><h2>Trova gli indizi sospetti</h2></div>
            <div class="progress">Caso ${ci+1} / ${detectiveCases.length} · ${score} pt</div>
          </div>
          <div class="panel">
            <p class="small">${esc(c.intro)}</p>
            <div class="image-wrap"><img data-zoomable src="${c.image}" alt="${esc(c.title)}"></div>
            <div class="option-grid">
              ${c.options.map((opt, idx) => `<button class="option" type="button" data-opt="${idx}">${esc(opt.text)}</button>`).join('')}
            </div>
            <div class="toolbar">
              <button class="primary" id="checkBtn" type="button">Controlla</button>
              <button class="secondary hidden" id="nextBtn" type="button">${ci===detectiveCases.length-1?'Vedi risultato':'Caso successivo →'}</button>
            </div>
            <div id="detectiveFeedback"></div>
          </div>
        </div>`;

      bindZoomableImages(gameContent);
      const selected = new Set();
      let locked = false;

      gameContent.querySelectorAll('[data-opt]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (locked) return;
          const i = +btn.dataset.opt;
          if (selected.has(i)) {
            selected.delete(i);
            btn.classList.remove('selected');
          } else {
            selected.add(i);
            btn.classList.add('selected');
          }
        });
      });

      document.getElementById('checkBtn').addEventListener('click', () => {
        if (locked) return;
        locked = true;
        let gained = 0;
        const review = [];

        gameContent.querySelectorAll('[data-opt]').forEach(btn => {
          const i = +btn.dataset.opt;
          const opt = c.options[i];
          const picked = selected.has(i);

          if (opt.ok && picked) {
            btn.classList.add('correct');
            gained += 20;
          } else if (!opt.ok && picked) {
            btn.classList.add('wrong');
            gained -= 10;
          } else if (opt.ok && !picked) {
            btn.classList.add('wrong');
          }
          review.push(`<div class="review-item"><strong>${opt.ok ? '✓' : '×'}</strong> ${esc(opt.why)}</div>`);
        });

        gained = Math.max(0, gained);
        score += gained;

        document.getElementById('detectiveFeedback').innerHTML =
          `<div class="feedback neutral"><strong>+${gained} pt</strong><div class="review">${review.join('')}</div></div>`;

        document.getElementById('checkBtn').disabled = true;
        document.getElementById('nextBtn').classList.remove('hidden');
      });

      document.getElementById('nextBtn').addEventListener('click', () => {
        if (ci < detectiveCases.length - 1) {
          ci++;
          draw();
        } else {
          showGameResult('detective', score, [
            'Controlla il dominio del mittente e dei link.',
            'Urgenza e paura sono segnali importanti.',
            'Un QR code può nascondere una destinazione sospetta.'
          ], 'detective');
        }
      });
    }
    draw();
  }

  // ---------------- GAME 2 ----------------
  const realScamRounds = [
    {
      title:'PlayStation',
      left:{label:'Messaggio A', image:'assets/playstation_legit.png'},
      right:{label:'Messaggio B', image:'assets/playstation_phish.png'},
      scam:'right',
      why:'Il messaggio B usa pressione temporale e un dominio non ufficiale.'
    },
    {
      title:'Spedizione',
      left:{label:'Messaggio A', image:'assets/consegne24_phish.png'},
      right:{label:'Messaggio B', image:'assets/poste_legit.png'},
      scam:'left',
      why:'Il messaggio A chiede un pagamento immediato e rimanda a un dominio sospetto.'
    }
  ];

  function renderRealOrScam() {
    let ri = 0, score = 0;

    function draw() {
      const r = realScamRounds[ri];
      gameContent.innerHTML = `
        <div class="game-shell">
          <div class="game-top">
            <div><div class="kicker">02 · Real or Scam?</div><h2>Quale messaggio è una truffa?</h2></div>
            <div class="progress">Round ${ri+1} / ${realScamRounds.length} · ${score} pt</div>
          </div>
          <div class="panel">
            <p class="small">Osserva le due immagini. Per scegliere usa il pulsante sotto l’immagine.</p>

            <div class="choice-grid">
              <div class="choice">
                <span class="choice-label">${esc(r.left.label)}</span>
                <div class="image-wrap compact"><img src="${r.left.image}" alt="${esc(r.left.label)}"></div>
                <button class="secondary pick-button" type="button" data-pick="left">Scelgo il messaggio A</button>
              </div>

              <div class="choice">
                <span class="choice-label">${esc(r.right.label)}</span>
                <div class="image-wrap compact"><img src="${r.right.image}" alt="${esc(r.right.label)}"></div>
                <button class="secondary pick-button" type="button" data-pick="right">Scelgo il messaggio B</button>
              </div>
            </div>

            <div id="rosFeedback"></div>
            <div class="toolbar">
              <button class="primary hidden" id="rosNext" type="button">${ri===realScamRounds.length-1?'Vedi risultato':'Round successivo →'}</button>
            </div>
          </div>
        </div>`;

      let locked = false;
      gameContent.querySelectorAll('[data-pick]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (locked) return;
          locked = true;

          const pick = btn.dataset.pick;
          const ok = pick === r.scam;
          if (ok) score += 70;

          gameContent.querySelectorAll('[data-pick]').forEach(b => {
            if (b.dataset.pick === r.scam) b.classList.add('correct');
            else if (b.dataset.pick === pick) b.classList.add('wrong');
          });

          document.getElementById('rosFeedback').innerHTML =
            `<div class="feedback ${ok?'good':'bad'}"><strong>${ok?'Corretto. +70 pt':'Risposta non corretta.'}</strong><br>${esc(r.why)}</div>`;

          document.getElementById('rosNext').classList.remove('hidden');
        });
      });

      document.getElementById('rosNext').addEventListener('click', () => {
        if (ri < realScamRounds.length - 1) {
          ri++;
          draw();
        } else {
          showGameResult('realorscam', score, [
            'Confronta sempre mittente, dominio e tipo di richiesta.',
            'Un messaggio legittimo non dovrebbe spingerti verso link strani.'
          ], 'realorscam');
        }
      });
    }
    draw();
  }

  // ---------------- GAME 3 ----------------
  const engineerScenarios = [
    {
      image:'assets/discord_leo.png',
      caption:'Scenario 1: messaggio diretto su Discord',
      questions:[
        {
          q:'Quale leva psicologica compare con più evidenza?',
          opts:['Autorità + paura + urgenza','Curiosità','Premio immediato','Appartenenza al gruppo'],
          ans:0,
          why:'L’attaccante crea paura del ban e spinge ad agire subito.'
        },
        {
          q:'Qual è il rischio principale?',
          opts:['Ricevere troppi messaggi','Perdere l’immagine profilo','Essere indirizzato verso un falso supporto che prova a rubare l’account','Aggiornare il profilo'],
          ans:2,
          why:'Lo schema punta a farti contattare un impostore.'
        },
        {
          q:'Qual è la risposta migliore?',
          opts:['Girare il messaggio a un amico','Scrivere il codice se poi lo cancelli','Contattare subito @DiscordSupport_Official','Ignorare, verificare dai canali ufficiali e contattare l’amico in un altro modo'],
          ans:3,
          why:'La soluzione più sicura è verificare in modo indipendente.'
        }
      ]
    },
    {
      image:'assets/marta_mail.png',
      caption:'Scenario 2: email che punta sulla curiosità',
      questions:[
        {
          q:'Quale leva è dominante?',
          opts:['Autorità tecnica','Conferma sociale','Curiosità','Reciprocità'],
          ans:2,
          why:'Il messaggio cerca di farti cliccare sfruttando la curiosità.'
        },
        {
          q:'Qual è il segnale tecnico più utile da notare?',
          opts:['L’orario del messaggio','Il link abbreviato bit.ly','Il colore dell’interfaccia Gmail','Il fatto che l’email sia in italiano'],
          ans:1,
          why:'Un link abbreviato nasconde la destinazione reale.'
        },
        {
          q:'Quale comportamento è corretto?',
          opts:['Non cliccare, verificare il contatto e cercare conferma con altri mezzi','Inoltrare l’email per vedere se altri la aprono','Aprire il link perché non hai ancora fatto login','Scaricare tutto per sicurezza'],
          ans:0,
          why:'Se il contenuto è sospetto, verifica prima il mittente usando un altro canale.'
        }
      ]
    }
  ];

  function renderEngineer() {
    let si = 0, qi = 0, score = 0;

    function draw() {
      const s = engineerScenarios[si];
      const q = s.questions[qi];

      gameContent.innerHTML = `
        <div class="game-shell">
          <div class="game-top">
            <div><div class="kicker">03 · Social Engineer Challenge</div><h2>Capisci come ti stanno manipolando</h2></div>
            <div class="progress">${score} pt</div>
          </div>

          <div class="panel">
            <div class="counter-row">
              <span class="counter-badge">Scenario ${si+1} / ${engineerScenarios.length}</span>
              <span class="counter-badge">Domanda ${qi+1} / ${s.questions.length}</span>
            </div>

            <p class="small">${esc(s.caption)}</p>
            <div class="image-wrap"><img data-zoomable src="${s.image}" alt="${esc(s.caption)}"></div>

            <div class="question-block">
              <div class="question-title">${esc(q.q)}</div>
              <div class="options">
                ${q.opts.map((opt, idx) => `<button class="option" type="button" data-qopt="${idx}">${esc(opt)}</button>`).join('')}
              </div>
              <div id="engFeedback"></div>
            </div>
          </div>
        </div>`;

      bindZoomableImages(gameContent);
      let locked = false;

      gameContent.querySelectorAll('[data-qopt]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (locked) return;
          locked = true;

          const pick = +btn.dataset.qopt;
          const ok = pick === q.ans;
          if (ok) score += 30;

          gameContent.querySelectorAll('[data-qopt]').forEach(b => {
            if (+b.dataset.qopt === q.ans) b.classList.add('correct');
            else if (+b.dataset.qopt === pick) b.classList.add('wrong');
          });

          const isLastQuestion = qi === s.questions.length - 1;
          const isLastScenario = si === engineerScenarios.length - 1;
          const nextLabel = isLastQuestion
            ? (isLastScenario ? 'Vedi risultato' : 'Scenario successivo →')
            : 'Domanda successiva →';

          document.getElementById('engFeedback').innerHTML =
            `<div class="feedback ${ok?'good':'bad'}"><strong>${ok?'Corretto. +30 pt':'Risposta non corretta.'}</strong><br>${esc(q.why)}
              <div class="toolbar"><button class="primary" id="engNext" type="button">${nextLabel}</button></div>
            </div>`;

          document.getElementById('engNext').addEventListener('click', () => {
            if (qi < s.questions.length - 1) {
              qi++;
              draw();
              return;
            }
            if (si < engineerScenarios.length - 1) {
              si++;
              qi = 0;
              draw();
              return;
            }
            showGameResult('engineer', score, [
              'Curiosità, paura, urgenza e autorità sono leve comuni.',
              'Verifica sempre il mittente usando un canale indipendente.'
            ], 'engineer');
          });
        });
      });
    }
    draw();
  }

  // ---------------- GAME 4 ----------------
  const hotspotScenes = [
    {
      title:'Email Instagram',
      image:'assets/instagram_mail_hotspot.png',
      help:'Trova i 3 elementi che rendono sospetta questa email.',
      hints:[
        'Controlla chi ha realmente inviato il messaggio e il dominio usato.',
        'Guarda le frasi che cercano di metterti fretta e poi osserva dove porta il link.'
      ],
      targets:[
        {x:21.0,y:21.5,w:23.0,h:5.5,good:true,text:'Il dominio del mittente non è quello ufficiale di Instagram.'},
        {x:20.5,y:59.0,w:42.5,h:6.0,good:true,text:'La richiesta di verificare entro 24 ore crea urgenza e pressione.'},
        {x:20.5,y:79.5,w:31.5,h:6.0,good:true,text:'Il link porta a security-check.com, non a instagram.com.'},
        {x:20.5,y:49.0,w:25.0,h:6.0,good:false,text:'Milano, Chrome e Windows possono comparire anche in una comunicazione reale.'},
        {x:20.0,y:33.0,w:21.0,h:14.0,good:false,text:'Il logo può essere copiato facilmente e, da solo, non dimostra nulla.'}
      ]
    },
    {
      title:'DM su Discord',
      image:'assets/discord_leo.png',
      help:'Trova i 3 elementi di social engineering nella conversazione.',
      hints:[
        'Concentrati su ciò che il contatto vuole farti credere e sulla persona a cui ti chiede di scrivere.',
        'Cerca frasi che creano paura o urgenza e un nome che prova a sembrare ufficiale.'
      ],
      targets:[
        {x:36.5,y:52.0,w:42.0,h:5.5,good:true,text:'La storia della segnalazione “per sbaglio” serve a creare paura e confusione.'},
        {x:36.5,y:56.5,w:43.0,h:5.5,good:true,text:'Il falso contatto “DiscordSupport_Official” cerca di sembrare un canale ufficiale.'},
        {x:36.5,y:61.0,w:39.0,h:5.5,good:true,text:'La minaccia del ban permanente crea urgenza.'},
        {x:36.5,y:46.0,w:20.0,h:5.5,good:false,text:'“Mi serve un favore al volo” da solo non basta a dimostrare un attacco.'},
        {x:7.0,y:30.0,w:21.0,h:42.0,good:false,text:'La lista dei contatti è una normale parte dell’interfaccia Discord.'}
      ]
    },
    {
      title:'Poster con QR code',
      image:'assets/wifi_poster.png',
      help:'Trova i 3 elementi realmente sospetti nel volantino.',
      hints:[
        'Chiediti quali informazioni vengono richieste per ottenere un semplice Wi‑Fi.',
        'Osserva il QR code e le due richieste scritte subito sotto.'
      ],
      targets:[
        {x:40.0,y:39.0,w:18.5,h:22.0,good:true,text:'Il QR code nasconde la destinazione reale finché non viene aperto.'},
        {x:41.0,y:67.0,w:31.0,h:8.5,good:true,text:'Per un Wi‑Fi pubblico non è normale accedere con il proprio account Google.'},
        {x:41.0,y:75.0,w:30.0,h:8.0,good:true,text:'La richiesta della password è un segnale critico.'},
        {x:31.0,y:23.0,w:38.0,h:14.0,good:false,text:'La scritta “FREE WIFI” da sola non dimostra una truffa.'},
        {x:80.0,y:10.0,w:18.0,h:22.0,good:false,text:'La presenza di una fermata e di un autobus non è un segnale di attacco.'}
      ]
    }
  ];

  function renderHotspot() {
    let si = 0, score = 0;

    function draw() {
      const scene = hotspotScenes[si];
      const goodTargets = scene.targets.filter(t => t.good);
      const found = new Set();

      const zonesHtml = scene.targets.map((t, idx) => `
        <button type="button" class="hotspot-zone" data-zone="${idx}"
          aria-label="Punto interattivo ${idx+1}"
          style="left:${t.x}%;top:${t.y}%;width:${t.w}%;height:${t.h}%"></button>
      `).join('');

      gameContent.innerHTML = `
        <div class="game-shell">
          <div class="game-top">
            <div><div class="kicker">04 · Clicca i segnali</div><h2>Trova i punti che indicano un possibile attacco</h2></div>
            <div class="progress">Immagine ${si+1} / ${hotspotScenes.length} · ${score} pt</div>
          </div>

          <div class="panel">
            <p class="small">${esc(scene.help)}</p>
            <div class="legend"><span class="pill">Clicca direttamente sui dettagli sospetti</span></div>

            <div class="hotspot-stage">
              <div class="hotspot-image-box" id="hotspotImageBox">
                <img src="${scene.image}" alt="${esc(scene.title)}">
                ${zonesHtml}
              </div>
            </div>

            <div class="progress-line">Indizi trovati: <span id="foundCount">0</span> / ${goodTargets.length}</div>

            <div class="toolbar">
              <button class="secondary help-btn" id="hotspotHelp" type="button">Chiedi aiuto</button>
              <button class="primary hidden" id="hotspotNext" type="button">${si===hotspotScenes.length-1?'Vedi risultato':'Immagine successiva →'}</button>
            </div>
          </div>
        </div>`;

      const box = document.getElementById('hotspotImageBox');
      const counter = document.getElementById('foundCount');
      const nextBtn = document.getElementById('hotspotNext');
      const helpBtn = document.getElementById('hotspotHelp');
      let helpCount = 0;

      function markerAtTarget(target, good) {
        addTransientMarker(box, target.x + target.w/2, target.y + target.h/2, good);
      }

      box.querySelectorAll('.hotspot-zone').forEach(btn => {
        btn.addEventListener('click', ev => {
          ev.stopPropagation();
          const idx = Number(btn.dataset.zone);
          const target = scene.targets[idx];
          const key = String(idx);

          if (target.good) {
            if (found.has(key)) {
              showToast('Questo indizio lo hai già trovato.', 'neutral');
              return;
            }
            found.add(key);
            score += 25;
            counter.textContent = found.size;
            markerAtTarget(target, true);
            showToast('✓ ' + target.text, 'good');
            if (found.size === goodTargets.length) nextBtn.classList.remove('hidden');
          } else {
            markerAtTarget(target, false);
            showToast('✗ ' + target.text, 'bad');
          }
        });
      });

      box.addEventListener('click', ev => {
        if (ev.target.classList.contains('hotspot-zone')) return;
        const rect = box.getBoundingClientRect();
        const x = ((ev.clientX - rect.left) / rect.width) * 100;
        const y = ((ev.clientY - rect.top) / rect.height) * 100;
        addTransientMarker(box, x, y, false);
        showToast('✗ Questo punto non è un segnale di attacco.', 'bad');
      });

      helpBtn.addEventListener('click', () => {
        const remaining = scene.targets
          .map((t, idx) => ({...t, idx}))
          .filter(t => t.good && !found.has(String(t.idx)));

        if (!remaining.length) {
          showToast('Hai già trovato tutti gli indizi.', 'neutral');
          return;
        }

        if (helpCount === 0) {
          showToast('Aiuto: ' + scene.hints[0], 'neutral');
          helpCount++;
          helpBtn.textContent = 'Chiedi un altro aiuto';
          return;
        }

        if (helpCount === 1) {
          showToast('Aiuto: ' + scene.hints[1], 'neutral');
          const target = remaining[0];
          const zone = box.querySelector(`[data-zone="${target.idx}"]`);
          if (zone) {
            zone.classList.add('help-highlight');
            setTimeout(() => zone.classList.remove('help-highlight'), 3600);
          }
          helpCount++;
          helpBtn.textContent = 'Aiuti terminati';
          helpBtn.disabled = true;
        }
      });

      nextBtn.addEventListener('click', () => {
        if (si < hotspotScenes.length - 1) {
          si++;
          draw();
        } else {
          showGameResult('hotspot', score, [
            'Controlla sempre chi ti scrive, cosa ti chiede e quanto ti mette fretta.',
            'Link, QR code e nomi “ufficiali” possono essere copiati.'
          ], 'hotspot');
        }
      });
    }

    draw();
  }
})();