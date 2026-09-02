/* =========================================================================
   COMPATIBILITE ET DIAGNOSTIC
   Ce bloc doit rester en tete du fichier : il s'execute avant toute
   animation.

   1. Trois fonctions utilisees par les figures manquent aux navigateurs
      anterieurs a 2015 (Internet Explorer notamment). Sans elles, la
      figure qui les appelle leve une exception et se fige.
   2. Une exception levee pendant le dessin arretait la boucle de rendu
      SANS RIEN DIRE : la figure restait immobile et les curseurs
      semblaient morts. Elle est desormais affichee, sur la figure et
      dans un bandeau, pour qu'on puisse la signaler.
   ========================================================================= */
(function(global){
  "use strict";

  if(!Math.hypot) Math.hypot = function(){
    var s = 0, i;
    for(i = 0; i < arguments.length; i++) s += arguments[i] * arguments[i];
    return Math.sqrt(s);
  };
  if(!Math.log10) Math.log10 = function(x){ return Math.log(x) / Math.LN10; };
  if(!Math.sign)  Math.sign  = function(x){ return x > 0 ? 1 : (x < 0 ? -1 : 0); };

  /* ctx.ellipse n'existe pas avant Firefox 48 ni sur Internet Explorer :
     on la reconstruit avec un arc dans un repere mis a l'echelle. */
  var C = global.CanvasRenderingContext2D;
  if(C && C.prototype && !C.prototype.ellipse){
    C.prototype.ellipse = function(x, y, rx, ry, rot, a0, a1, acw){
      if(!(rx > 0) || !(ry > 0)) return;
      this.save();
      this.translate(x, y);
      this.rotate(rot || 0);
      this.scale(rx, ry);
      this.arc(0, 0, 1, a0, a1, acw);
      this.restore();
    };
  }

  /* ---------- signalement des erreurs ---------- */
  var VUES = [], banniere = null;

  function afficher(msg){
    if(!document.body) return;
    if(!banniere){
      banniere = document.createElement('div');
      banniere.id = 'mspc-erreurs';
      banniere.setAttribute('style',
        'position:fixed;left:0;right:0;bottom:0;z-index:9000;background:#2a1210;' +
        'border-top:2px solid #ff6a5e;color:#e8ece6;padding:11px 46px 12px 15px;' +
        'font:12px/1.6 "IBM Plex Mono",ui-monospace,monospace;max-height:32vh;overflow:auto');
      var t = document.createElement('div');
      t.setAttribute('style', 'color:#ff6a5e;margin-bottom:5px');
      t.textContent = 'Une figure n\u2019a pas pu s\u2019afficher. Copiez ce message et signalez-le :';
      banniere.appendChild(t);
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = '\u00d7';
      b.setAttribute('style', 'position:absolute;top:5px;right:12px;background:none;border:none;' +
        'color:#ff6a5e;font-size:22px;line-height:1;cursor:pointer');
      b.onclick = function(){ if(banniere.parentNode) banniere.parentNode.removeChild(banniere); };
      banniere.appendChild(b);
      document.body.appendChild(banniere);
    }
    var l = document.createElement('div');
    l.textContent = msg;
    banniere.appendChild(l);
  }

  function signaler(msg){
    if(VUES.length > 10) return;
    for(var i = 0; i < VUES.length; i++) if(VUES[i] === msg) return;   /* pas deux fois la meme */
    VUES.push(msg);
    if(global.console && console.error) console.error('[MSPC] ' + msg);
    if(document.body) afficher(msg);
    else if(document.addEventListener) document.addEventListener('DOMContentLoaded', function(){ afficher(msg); });
  }

  if(global.addEventListener) global.addEventListener('error', function(e){
    if(!e || !e.message) return;                     /* on ignore les echecs de chargement */
    signaler(e.message + '  [' + String(e.filename || '').split('/').pop() + ':' + (e.lineno || '?') + ']');
  });

  global.MSPCdiag = { signaler: signaler, erreurs: VUES };
})(window);

/* =========================================================================
   ATELIER MSPC — utilitaires communs aux pages de cours
   • MSPC.anim(id, dessin, opts)  : boucle canvas HiDPI, mise en pause
     automatique quand la figure sort de l'écran (indispensable : une page
     de cours porte une douzaine d'animations simultanées).
   • MSPC.ctrl(id, fn)            : branche un curseur / une case à cocher.
   • Helpers de dessin : grille, texte mono, arrondi, jauge.
   ========================================================================= */
(function(global){
  "use strict";

  var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* Plafond de finesse du rendu, commun a toutes les figures. Sur un poste
     sans acceleration materielle, dessiner en 2x represente quatre fois plus
     de pixels par image : la page devient si lente qu'elle parait figee.
     La premiere figure qui constate que la machine ne suit pas abaisse ce
     plafond, et toutes les autres s'y conforment a l'image suivante. */
  var DPRMAX = 2;
  function dprVoulu(){ return Math.min(global.devicePixelRatio || 1, DPRMAX); }

  function anim(id, dessin, opts){
    var cv = document.getElementById(id);
    if(!cv) return null;
    opts = opts || {};
    var ctx = cv.getContext('2d');
    var W = 0, H = 0, dpr = 1, t = 0, last = 0, visible = true, running = false;
    var ratio = opts.ratio || (cv.height && cv.width ? cv.height / cv.width : 0.34);
    // Dimensions déclarées par les attributs width/height du <canvas>, mémorisées
    // avant toute modification : c'est l'espace de dessin du mode « fixed ».
    var FW = cv.width || 900, FH = cv.height || 300;

    /* Trois modes de dimensionnement :
       • par défaut  : espace de dessin = taille CSS réelle, hauteur = largeur × ratio
       • fill        : le canvas remplit son conteneur (héros pleine hauteur)
       • fixed       : l'espace de dessin reste celui des attributs width/height.
                       Les coordonnées écrites dans le dessin ne bougent jamais ;
                       seule la finesse du rendu suit l'écran. */
    function resize(){
      dpr = dprVoulu();
      if(opts.fixed){
        W = FW; H = FH;
        cv.style.width = '100%';
      } else {
        var r = cv.getBoundingClientRect();
        W = r.width || cv.clientWidth || 900;
        H = opts.fill ? (r.height || 400) : W * ratio;
        if(!opts.fill) cv.style.height = H + 'px';
      }
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if(opts.onResize) opts.onResize(api);
    }

    var api = {
      ctx: ctx, canvas: cv, t: 0, dt: 0,
      get W(){ return W; }, get H(){ return H; },
      reduce: reduce,
      resize: resize
    };

    /* Une exception dans le dessin arretait la boucle sans rien dire, et la
       figure restait figee : les curseurs paraissaient morts alors que
       c'est le rendu qui etait mort. On l'attrape et on l'affiche. */
    function panne(err){
      running = false;
      var m = (err && err.message) ? err.message : String(err);
      if(global.MSPCdiag) global.MSPCdiag.signaler(id + ' : ' + m);
      try{
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = '#2a1210'; ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ff6a5e'; ctx.font = '13px "IBM Plex Mono",ui-monospace,monospace';
        ctx.fillText('FIGURE INTERROMPUE \u2014 ' + id, 20, 34);
        ctx.fillStyle = '#e8ece6'; ctx.font = '12px "IBM Plex Mono",ui-monospace,monospace';
        ctx.fillText(m.length > 88 ? m.slice(0, 88) + '\u2026' : m, 20, 58);
        ctx.fillStyle = '#9aa494';
        ctx.fillText('Le reste de la page fonctionne. Signalez ce message.', 20, 84);
      }catch(e){}
    }

    var lentes = 0, mesurees = 0;

    function frame(ts){
      if(!running) return;
      var dt = last ? Math.min((ts - last) / 1000, 0.05) : 0;
      last = ts; t += dt;
      api.t = t; api.dt = dt;

      /* La machine suit-elle ? Deux secondes de cadence trop basse et l'on
         repasse tout le site en resolution simple. */
      if(dt > 0){
        mesurees++;
        if(dt > 0.045) lentes++;
        if(mesurees >= 45){
          if(lentes > 30 && DPRMAX > 1) DPRMAX = 1;
          mesurees = 0; lentes = 0;
        }
      }
      if(dpr !== dprVoulu()) resize();

      try{ dessin(api); }
      catch(err){ panne(err); return; }
      global.requestAnimationFrame(frame);
    }
    function start(){ if(running) return; running = true; last = 0; global.requestAnimationFrame(frame); }
    function stop(){ running = false; }

    global.addEventListener('resize', function(){
      resize();
      if(!running){ api.dt = 0; try{ dessin(api); }catch(err){ panne(err); } }
    });
    resize();

    if('IntersectionObserver' in global){
      new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          visible = e.isIntersecting;
          if(visible) start(); else stop();
        });
      }, {rootMargin: '120px'}).observe(cv);
      // Premier rendu différé d'une frame, pour que la figure ne soit jamais
      // vide — mais après que le code appelant a fini son initialisation.
      global.requestAnimationFrame(function(){
        if(!running){ api.dt = 0; try{ dessin(api); }catch(err){ panne(err); } }
      });
    } else {
      start();
    }

    api.start = start; api.stop = stop;
    return api;
  }

  /* Branche un <input> et renvoie sa valeur courante via .val ; met à jour
     l'étiquette <span> associée si une fonction de format est fournie. */
  function ctrl(id, format, labelId){
    var el = document.getElementById(id);
    if(!el) return {val: 0, el: null};
    var lbl = labelId ? document.getElementById(labelId) : null;
    var o = {
      el: el,
      get val(){ return el.type === 'checkbox' ? el.checked : +el.value; }
    };
    function maj(){ if(lbl && format) lbl.textContent = format(o.val); }
    el.addEventListener('input', maj);
    el.addEventListener('change', maj);
    maj();
    return o;
  }

  /* ---------- helpers de dessin ---------- */
  function fond(ctx, W, H, pas){
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0d120f'); g.addColorStop(1, '#161d18');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if(pas !== 0){
      pas = pas || 36;
      ctx.strokeStyle = 'rgba(255,255,255,.045)'; ctx.lineWidth = 1;
      ctx.beginPath();
      for(var x = 0; x <= W; x += pas){ ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); }
      for(var y = 0; y <= H; y += pas){ ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); }
      ctx.stroke();
    }
  }

  function mono(ctx, txt, x, y, taille, couleur, align){
    ctx.font = (taille || 11) + 'px "IBM Plex Mono",ui-monospace,monospace';
    ctx.fillStyle = couleur || '#9aa494';
    ctx.textAlign = align || 'left';
    ctx.fillText(txt, x, y);
  }

  function titre(ctx, txt, x, y, taille, couleur, align){
    ctx.font = '700 ' + (taille || 18) + 'px "Saira Condensed",sans-serif';
    ctx.fillStyle = couleur || '#fff';
    ctx.textAlign = align || 'left';
    ctx.fillText(txt, x, y);
  }

  /* Axes cartésiens simples : renvoie les fonctions de conversion. */
  function axes(ctx, box, xmax, ymax, labelX, labelY){
    var x0 = box.x, y0 = box.y + box.h, x1 = box.x + box.w, y1 = box.y;
    ctx.strokeStyle = 'rgba(255,255,255,.30)'; ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0);
    ctx.stroke();
    if(labelX) mono(ctx, labelX, x1, y0 + 20, 10, '#7f8a7e', 'right');
    if(labelY) mono(ctx, labelY, x0 - 4, y1 - 8, 10, '#7f8a7e', 'left');
    return {
      X: function(v){ return x0 + (v / xmax) * box.w; },
      Y: function(v){ return y0 - (v / ymax) * box.h; },
      x0: x0, y0: y0, x1: x1, y1: y1
    };
  }

  /* Jauge horizontale à seuils (vert / orange / rouge). */
  function jauge(ctx, x, y, w, h, v, seuilO, seuilR){
    ctx.fillStyle = 'rgba(255,255,255,.10)'; ctx.fillRect(x, y, w, h);
    var c = v < seuilO ? '#93a415' : (v < seuilR ? '#f0a844' : '#b32017');
    ctx.fillStyle = c; ctx.fillRect(x, y, w * Math.max(0, Math.min(1, v)), h);
    return c;
  }

  /* Séparateur de milliers : toLocaleString('fr-FR') insère U+202F, que
     les polices du canvas ne rendent pas. On met une espace ordinaire. */
  function nb(x){ return String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  global.MSPC = {
    anim: anim, ctrl: ctrl, reduce: reduce, nb: nb,
    fond: fond, mono: mono, titre: titre, axes: axes, jauge: jauge
  };
})(window);

/* =========================================================================
   MSPC.nav() — navigation de lecture pour les pages de cours.
   Ces pages font 200 à 450 Ko et comptent jusqu'à 18 chapitres : le
   défilement seul ne suffit plus. Tout est engendré ici, aucune page
   n'a de balisage à ajouter.

   • une barre collante qui suit la lecture, avec barre de progression ;
   • un tiroir de sommaire indexant les chapitres ET leurs sous-titres,
     filtrable — c'est au niveau du sous-titre qu'on cherche vraiment ;
   • le repli de chaque chapitre, pour ne projeter que celui du jour ;
   • un « mode cours » : typographie agrandie, exercices repliés,
     fiches professeur révélées.
   ========================================================================= */
(function(global){
  "use strict";
  if(!global.MSPC) return;

  function memo(cle, val){
    try{
      if(val === undefined) return global.localStorage.getItem(cle);
      global.localStorage.setItem(cle, val);
    }catch(e){ return null; }
  }

  /* La barre .sitenav est collante (position:sticky) sur toutes les pages :
     elle ne doit plus disparaître au défilement. On mesure sa hauteur réelle
     (elle varie selon la largeur d'écran, la barre pouvant passer sur deux
     lignes) pour que la barre de lecture .lecture, elle aussi collante,
     vienne s'empiler juste en dessous plutôt que sous elle. */
  function majNavH(){
    var el = document.querySelector('.sitenav');
    if(!el) return;
    document.documentElement.style.setProperty('--nav-h', el.offsetHeight + 'px');
  }
  function initNavH(){
    majNavH();
    global.addEventListener('resize', majNavH);
    if('ResizeObserver' in global){
      var el = document.querySelector('.sitenav');
      if(el) new ResizeObserver(majNavH).observe(el);
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initNavH);
  else initNavH();

  function nav(){
    var chs = [].slice.call(document.querySelectorAll('section.ch'));
    if(chs.length < 3) return null;

    var doc = document.documentElement;
    var entrees = [];

    chs.forEach(function(ch, i){
      if(!ch.id) ch.id = 'ch-auto-' + i;
      var h2 = ch.querySelector('.ch-title h2');
      var num = ch.querySelector('.ch-num');
      entrees.push({
        el: ch, id: ch.id,
        num: num ? num.textContent.trim() : String(i + 1),
        titre: h2 ? h2.textContent.trim() : ('Chapitre ' + (i + 1)),
        sous: [],
        texte: (ch.textContent || '').toLowerCase()
      });
      var e = entrees[entrees.length - 1];
      [].slice.call(ch.querySelectorAll('.ch-body h3')).forEach(function(h3, j){
        if(!h3.id) h3.id = ch.id + '-s' + j;
        e.sous.push({ id: h3.id, titre: h3.textContent.trim() });
      });
    });

    /* ---------------- la barre collante ---------------- */
    var bar = document.createElement('div');
    bar.className = 'lecture';
    bar.innerHTML =
      '<button type="button" data-act="tiroir" aria-label="Ouvrir le sommaire">☰ <span class="lbl">Sommaire</span></button>' +
      '<div class="titre"><span class="n"></span><span class="t"></span></div>' +
      '<button type="button" data-act="cours" aria-pressed="false"><span class="lbl">Mode cours</span></button>' +
      '<div class="fleches">' +
        '<button type="button" data-act="prec" aria-label="Chapitre précédent">◀</button>' +
        '<button type="button" data-act="suiv" aria-label="Chapitre suivant">▶</button>' +
      '</div>' +
      '<div class="prog"></div>';

    var nav0 = document.querySelector('.sitenav');
    if(nav0 && nav0.parentNode) nav0.parentNode.insertBefore(bar, nav0.nextSibling);
    else document.body.insertBefore(bar, document.body.firstChild);

    var elNum = bar.querySelector('.titre .n');
    var elTit = bar.querySelector('.titre .t');
    var elProg = bar.querySelector('.prog');
    var btnCours = bar.querySelector('[data-act=cours]');

    /* ---------------- le tiroir ---------------- */
    var voile = document.createElement('div');
    voile.className = 'voile';
    var tiroir = document.createElement('nav');
    tiroir.className = 'tiroir';
    tiroir.setAttribute('aria-label', 'Sommaire du cours');
    tiroir.innerHTML =
      '<div class="tete"><h3>Sommaire</h3>' +
      '<input type="search" placeholder="chercher dans tout le cours…" aria-label="Filtrer le sommaire"></div>' +
      '<div class="liste"></div>' +
      '<div class="pied"><kbd>←</kbd> <kbd>→</kbd> chapitre précédent / suivant<br>' +
      '<kbd>S</kbd> sommaire &nbsp;·&nbsp; <kbd>C</kbd> mode cours &nbsp;·&nbsp; <kbd>Échap</kbd> fermer</div>';
    document.body.appendChild(voile);
    document.body.appendChild(tiroir);

    var liste = tiroir.querySelector('.liste');
    var filtre = tiroir.querySelector('input[type=search]');

    function peupler(q){
      q = (q || '').trim().toLowerCase();
      var html = '', trouve = 0;
      entrees.forEach(function(e){
        var okTitre = !q || e.titre.toLowerCase().indexOf(q) >= 0;
        var subs = e.sous.filter(function(s){ return !q || s.titre.toLowerCase().indexOf(q) >= 0; });
        var okTexte = !q || e.texte.indexOf(q) >= 0;
        if(!okTitre && !subs.length && !okTexte) return;
        trouve++;
        html += '<a class="ch" href="#' + e.id + '" data-ch="' + e.id + '">' +
                '<span class="n">' + e.num + '</span>' + e.titre + '</a>';
        // sans filtre on n'ouvre que le chapitre courant, sinon la liste devient illisible
        var montrer = q ? subs : (e.id === courantId ? e.sous : []);
        montrer.forEach(function(s){
          html += '<a class="sub" href="#' + s.id + '">' + s.titre + '</a>';
        });
      });
      liste.innerHTML = trouve ? html : '<div class="vide">aucun résultat</div>';
      majCourant();
    }

    var ouvert = false;
    function basculeTiroir(force){
      ouvert = (force === undefined) ? !ouvert : force;
      voile.classList.toggle('ouvert', ouvert);
      tiroir.classList.toggle('ouvert', ouvert);
      if(ouvert){ peupler(filtre.value); filtre.focus(); }
    }

    /* ---------------- repli des chapitres ---------------- */
    entrees.forEach(function(e){
      var tete = e.el.querySelector('.ch-head');
      if(!tete) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ch-plier';
      b.setAttribute('aria-label', 'Replier ou déplier ce chapitre');
      b.textContent = '–';
      b.addEventListener('click', function(){
        var plie = e.el.classList.toggle('plie');
        b.textContent = plie ? '+' : '–';
        b.setAttribute('aria-expanded', plie ? 'false' : 'true');
      });
      tete.appendChild(b);
      e.bouton = b;
    });

    function replierTout(sauf){
      entrees.forEach(function(e){
        var plie = e.id !== sauf;
        e.el.classList.toggle('plie', plie);
        if(e.bouton) e.bouton.textContent = plie ? '+' : '–';
      });
    }
    function deplierTout(){
      entrees.forEach(function(e){
        e.el.classList.remove('plie');
        if(e.bouton) e.bouton.textContent = '–';
      });
    }

    /* ---------------- mode cours ---------------- */
    function modeCours(on){
      document.body.classList.toggle('mode-cours', on);
      document.body.classList.toggle('prof', on);
      btnCours.classList.toggle('actif', on);
      btnCours.setAttribute('aria-pressed', on ? 'true' : 'false');
      memo('mspc-cours', on ? '1' : '0');
      if(on) replierTout(courantId); else deplierTout();
    }
    if(memo('mspc-cours') === '1') modeCours(true);

    /* ---------------- suivi de la lecture ---------------- */
    var courantId = entrees[0].id, idx = 0;

    function majCourant(){
      [].slice.call(liste.querySelectorAll('a')).forEach(function(a){
        a.classList.toggle('courant', a.getAttribute('href') === '#' + courantId);
      });
    }

    function aller(i){
      i = Math.max(0, Math.min(entrees.length - 1, i));
      var e = entrees[i];
      if(document.body.classList.contains('mode-cours')) replierTout(e.id);
      e.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    var tic = false;
    function suivre(){
      if(tic) return;
      tic = true;
      global.requestAnimationFrame(function(){
        tic = false;
        var y = global.scrollY || doc.scrollTop;
        bar.classList.toggle('visible', y > 180);

        var h = doc.scrollHeight - global.innerHeight;
        elProg.style.width = (h > 0 ? Math.min(100, y / h * 100) : 0) + '%';

        var n = 0;
        for(var i = 0; i < entrees.length; i++){
          if(entrees[i].el.getBoundingClientRect().top <= 96) n = i; else break;
        }
        if(entrees[n].id !== courantId){
          courantId = entrees[n].id; idx = n;
          elNum.textContent = entrees[n].num;
          elTit.textContent = entrees[n].titre;
          if(ouvert) peupler(filtre.value); else majCourant();
        }
      });
    }
    elNum.textContent = entrees[0].num;
    elTit.textContent = entrees[0].titre;
    global.addEventListener('scroll', suivre, { passive: true });
    global.addEventListener('resize', suivre);
    suivre();

    /* ---------------- branchements ---------------- */
    bar.addEventListener('click', function(ev){
      var b = ev.target.closest('button');
      if(!b) return;
      var a = b.getAttribute('data-act');
      if(a === 'tiroir') basculeTiroir();
      else if(a === 'cours') modeCours(!document.body.classList.contains('mode-cours'));
      else if(a === 'prec') aller(idx - 1);
      else if(a === 'suiv') aller(idx + 1);
    });
    voile.addEventListener('click', function(){ basculeTiroir(false); });
    liste.addEventListener('click', function(ev){
      var a = ev.target.closest('a');
      if(!a) return;
      if(document.body.classList.contains('mode-cours')){
        var cible = a.getAttribute('data-ch') || (a.closest ? null : null);
        if(cible) replierTout(cible);
        else {
          // un sous-titre : on déplie le chapitre qui le contient
          var el = document.querySelector(a.getAttribute('href'));
          var ch = el && el.closest('section.ch');
          if(ch) replierTout(ch.id);
        }
      }
      basculeTiroir(false);
    });
    filtre.addEventListener('input', function(){ peupler(filtre.value); });

    document.addEventListener('keydown', function(ev){
      var t = ev.target.tagName;
      if(t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || ev.metaKey || ev.ctrlKey || ev.altKey){
        if(ev.key === 'Escape' && ouvert){ basculeTiroir(false); filtre.blur(); }
        return;
      }
      if(ev.key === 'Escape'){ basculeTiroir(false); }
      else if(ev.key === 'ArrowRight'){ aller(idx + 1); }
      else if(ev.key === 'ArrowLeft'){ aller(idx - 1); }
      else if(ev.key === 's' || ev.key === 'S'){ ev.preventDefault(); basculeTiroir(); }
      else if(ev.key === 'c' || ev.key === 'C'){ modeCours(!document.body.classList.contains('mode-cours')); }
    });

    document.body.classList.add('nav-on');
    peupler('');
    return { aller: aller, modeCours: modeCours, tiroir: basculeTiroir };
  }

  global.MSPC.nav = nav;
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', nav);
  else nav();
})(window);
