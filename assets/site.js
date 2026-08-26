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
      dpr = Math.min(global.devicePixelRatio || 1, 2);
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

    function frame(ts){
      if(!running) return;
      var dt = last ? Math.min((ts - last) / 1000, 0.05) : 0;
      last = ts; t += dt;
      api.t = t; api.dt = dt;
      dessin(api);
      global.requestAnimationFrame(frame);
    }
    function start(){ if(running) return; running = true; last = 0; global.requestAnimationFrame(frame); }
    function stop(){ running = false; }

    global.addEventListener('resize', function(){ resize(); if(!running){ api.dt = 0; dessin(api); } });
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
        if(!running){ api.dt = 0; dessin(api); }
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

  global.MSPC = {
    anim: anim, ctrl: ctrl, reduce: reduce,
    fond: fond, mono: mono, titre: titre, axes: axes, jauge: jauge
  };
})(window);
