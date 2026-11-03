(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }

  /* Barra de progreso y navegación activa */
  var prog = $("progress"), links = document.querySelectorAll("#nav a");
  window.addEventListener("scroll", function () {
    var h = document.documentElement;
    prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + "%";
  }, { passive: true });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("main section").forEach(function (s) { io.observe(s); });
  }

  /* Simulador de feed */
  var base = [
    { id: 0, t: "ÚLTIMO MOMENTO: lo que no quieren que sepas sobre el candidato", e: 95, v: false },
    { id: 1, t: "Video: dirigente anuncia que baja su candidatura (generado con IA)", e: 90, v: false },
    { id: 2, t: "¡Indignante! Compartí antes de que lo borren", e: 88, v: false },
    { id: 3, t: "Verificación: el video del candidato es falso, está hecho con IA", e: 40, v: true },
    { id: 4, t: "La Cámara Electoral confirma que la oferta electoral sigue vigente", e: 30, v: true },
    { id: 5, t: "Cómo detectar un video hecho con IA: señales y herramientas", e: 45, v: true },
    { id: 6, t: "Explicación: cómo funciona el escrutinio con boleta única", e: 25, v: true }
  ];
  var posts = base.map(function (p) { return { id: p.id, t: p.t, e: p.e, v: p.v }; });
  var range = $("peso"), list = $("lista"), big = $("m-falso"), txt = $("m-texto"), val = $("peso-val");
  var nodes = {};
  posts.forEach(function (p) {
    var li = el("li", p.v ? "ver" : "");
    li.appendChild(el("span", "t", p.t));
    var b = el("button", "", "Reaccionar");
    b.type = "button";
    b.setAttribute("aria-label", "Reaccionar a: " + p.t);
    b.addEventListener("click", function () { p.e = Math.min(100, p.e + 12); render(); });
    li.appendChild(b);
    var bar = el("div", "bar"); bar.appendChild(el("b")); li.appendChild(bar);
    li.appendChild(el("span", "tag"));
    nodes[p.id] = li;
  });
  function render() {
    var w = Number(range.value) / 100;
    var tops = {};
    posts.forEach(function (p) { tops[p.id] = nodes[p.id].getBoundingClientRect().top; });
    var ranked = posts.map(function (p) { return { p: p, s: (1 - w) * p.e + w * (p.v ? 100 : 0) }; })
      .sort(function (a, b) { return b.s - a.s; });
    var unver = 0;
    ranked.forEach(function (r, i) {
      var li = nodes[r.p.id];
      list.appendChild(li);
      li.className = (r.p.v ? "ver" : "") + (i >= 4 ? " cut" : "");
      li.querySelector(".bar b").style.width = Math.max(4, r.s) + "%";
      li.querySelector(".tag").textContent = (r.p.v ? "Verificada" : "Sin verificar") + " · interacción " + r.p.e + " · puesto " + (i + 1);
      if (i < 4 && !r.p.v) unver++;
    });
    if (!reduce) posts.forEach(function (p) {
      var dy = tops[p.id] - nodes[p.id].getBoundingClientRect().top;
      if (dy && nodes[p.id].animate) nodes[p.id].animate([{ transform: "translateY(" + dy + "px)" }, { transform: "none" }], { duration: 380, easing: "ease" });
    });
    big.textContent = unver;
    big.className = "big" + (unver === 0 ? " good" : "");
    val.textContent = w === 0 ? "Solo interacción: el ranking depende únicamente de cuánta reacción provoca cada publicación."
      : w === 1 ? "Solo verificación: el ranking depende únicamente de si la publicación está verificada."
      : "Mezcla: " + Math.round((1 - w) * 100) + " % interacción y " + Math.round(w * 100) + " % verificación.";
    txt.textContent = unver >= 3 ? "La interacción domina y el feed se llena de contenido dudoso."
      : unver === 0 ? "Con peso a la verificación, lo verificado sube aunque genere menos clics."
      : "Hay una mezcla de ambos tipos de contenido.";
  }
  range.addEventListener("input", render);
  $("reset").addEventListener("click", function () {
    base.forEach(function (b, i) { posts[i].e = b.e; });
    range.value = 0; render();
  });
  render();

  /* Etapas del recomendador */
  var stages = [
    ["1. Señales", "Registra clics, tiempo de permanencia, reacciones, comentarios y compartidos, además de datos de perfil y contexto.", "Cada gesto es un dato: es la materia prima del capitalismo de vigilancia (Zuboff, 2019)."],
    ["2. Candidatos", "De millones de publicaciones selecciona las parecidas a tu historial y al de usuarios similares (filtrado colaborativo).", "Acá nace la burbuja de filtro: lo ya afín entra primero (Pariser, 2011)."],
    ["3. Ranking", "Un modelo estima la probabilidad de que reacciones a cada publicación y las ordena con un puntaje.", "Ninguna etapa pregunta si algo es verdad: se optimiza la interacción."],
    ["4. Feedback", "Lo que hacés con lo que te muestran vuelve como dato de entrenamiento y el ciclo se repite.", "Lo que recibe reacción se muestra más y recibe aún más reacción. Probalo con el botón “Reaccionar” del simulador."]
  ];
  var tabs = $("tabs"), panel = $("tabpanel");
  function showStage(i) {
    Array.prototype.forEach.call(tabs.children, function (b, k) { b.setAttribute("aria-selected", k === i ? "true" : "false"); });
    panel.textContent = "";
    panel.appendChild(el("h3", "", stages[i][0]));
    panel.appendChild(el("p", "", stages[i][1]));
    panel.appendChild(el("p", "eg", stages[i][2]));
  }
  stages.forEach(function (s, i) {
    var b = el("button", "", s[0]); b.type = "button"; b.setAttribute("role", "tab");
    b.addEventListener("click", function () { showStage(i); });
    tabs.appendChild(b);
  });
  showStage(0);

  /* Línea de tiempo del caso */
  var events = [
    ["18 de mayo · CABA", "En las horas previas a la votación circuló en X un video falso de Mauricio Macri en el que parecía retirar la candidatura de Silvia Lospennato para apoyar a Manuel Adorni. El Tribunal Electoral porteño ordenó eliminarlo (Forbes Argentina, 2025)."],
    ["7 de septiembre · Prov. de Buenos Aires", "Antes de los comicios circularon dos videos editados con IA en los que Javier Milei y Axel Kicillof parecían hablar en contra de sus propios gobiernos (La Nación, 2025)."],
    ["26 de octubre · Elecciones nacionales", "En plena veda apareció un video de Jorge Taiana anunciando que bajaba su candidatura. Chequeado lo desmintió y la Cámara Nacional Electoral confirmó que la oferta seguía vigente. También circuló un video de Macri llamando a votar a Provincias Unidas, armado a partir de un spot de 2015."]
  ];
  var chips = $("chips"), ev = $("event");
  function showEvent(i) {
    Array.prototype.forEach.call(chips.children, function (b, k) { b.setAttribute("aria-selected", k === i ? "true" : "false"); });
    ev.textContent = "";
    ev.appendChild(el("h3", "", events[i][0]));
    ev.appendChild(el("p", "", events[i][1]));
  }
  events.forEach(function (e, i) {
    var b = el("button", "", e[0].split(" · ")[0]); b.type = "button"; b.setAttribute("role", "tab");
    b.addEventListener("click", function () { showEvent(i); });
    chips.appendChild(b);
  });
  showEvent(0);

  /* Contadores */
  function count(node) {
    var to = Number(node.getAttribute("data-to")), t0 = null;
    if (reduce) { node.textContent = to; return; }
    function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1200); node.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  var nums = document.querySelectorAll(".num");
  if ("IntersectionObserver" in window) {
    var io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { count(e.target); io2.unobserve(e.target); } }); }, { threshold: 0.6 });
    nums.forEach(function (n) { io2.observe(n); });
  } else nums.forEach(function (n) { n.textContent = n.getAttribute("data-to"); });

  /* Compromisos de diseño responsable */
  var pledges = ["Documentar qué se optimiza y qué efectos secundarios se evaluaron.", "Incluir calidad y diversidad informativa como objetivo o restricción.", "Auditar el modelo antes y después de desplegarlo, sobre todo en elecciones.", "Advertir y escalar los riesgos detectados: la responsabilidad es compartida, aunque no total."];
  var pl = $("pledge"), pout = $("pledge-out");
  function pledgeUpdate() {
    var n = pl.querySelectorAll("[aria-pressed=true]").length;
    pout.textContent = n === 0 ? "" : n < pledges.length ? n + " de " + pledges.length + " compromisos marcados." : "Los cuatro compromisos están marcados: así se vería un diseño que no optimiza a ciegas.";
  }
  pledges.forEach(function (p) {
    var li = el("li"), b = el("button"); b.type = "button"; b.setAttribute("aria-pressed", "false");
    b.appendChild(el("span", "box", "✓")); b.appendChild(el("span", "", p));
    b.addEventListener("click", function () { b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); pledgeUpdate(); });
    li.appendChild(b); pl.appendChild(li);
  });

  /* Quiz */
  var qs = [
    ["¿Qué optimiza principalmente un recomendador orientado a retención?", ["La veracidad de los contenidos", "La interacción de los usuarios", "La diversidad de fuentes"], 1, "Optimiza interacción (clics, reacciones, tiempo de permanencia). La veracidad no forma parte del puntaje."],
    ["Según Vosoughi et al. (2018), ¿qué explica sobre todo que las noticias falsas se difundan más?", ["Las personas, por novedad y emoción", "Los bots", "Los medios tradicionales"], 0, "La diferencia se debió sobre todo a las personas: lo falso es más novedoso y despierta más emoción."],
    ["¿Qué sostiene el trabajo sobre el efecto de los videos en las elecciones de 2025?", ["Cambiaron el resultado", "No puede medirse con la evidencia disponible", "No tuvieron ningún efecto"], 1, "No hay forma de medir su influencia en los votos. Sí se documentó la exposición del proceso informativo."],
    ["¿Cuál NO es una herramienta para detectar contenido sintético?", ["Metadatos de procedencia (C2PA)", "Búsqueda inversa de imágenes", "Contar los “me gusta” del video"], 2, "Los “me gusta” miden interacción, no autenticidad. Los otros dos ayudan a rastrear el origen."],
    ["Según el informe, ¿cuánta responsabilidad tiene quien diseña la función de optimización?", ["Total", "Compartida, pero no total", "Ninguna"], 1, "No controla el modelo de negocio, pero participa de decisiones que determinan el comportamiento del sistema."]
  ];
  var qb = $("quiz-box"), qi = 0, score = 0;
  function quiz() {
    qb.textContent = "";
    if (qi >= qs.length) {
      qb.appendChild(el("p", "small", "Resultado"));
      qb.appendChild(el("p", "score", score + " de " + qs.length));
      qb.appendChild(el("p", "", score === qs.length ? "Perfecto: dominás las ideas centrales del trabajo." : score >= 3 ? "Muy bien. Repasá las preguntas que fallaste en las secciones anteriores." : "Volvé a recorrer el simulador y el caso, y probá de nuevo."));
      var r = el("button", "next", "Reintentar"); r.type = "button";
      r.addEventListener("click", function () { qi = 0; score = 0; quiz(); });
      qb.appendChild(r); return;
    }
    var q = qs[qi];
    qb.appendChild(el("p", "small", "Pregunta " + (qi + 1) + " de " + qs.length));
    qb.appendChild(el("p", "q", q[0]));
    var opts = el("div", "opts"), fb = el("p", "fb"), done = false;
    q[1].forEach(function (o, k) {
      var b = el("button", "", o); b.type = "button";
      b.addEventListener("click", function () {
        if (done) return; done = true;
        if (k === q[2]) score++;
        Array.prototype.forEach.call(opts.children, function (c, j) { c.disabled = true; if (j === q[2]) c.className = "right"; else if (j === k) c.className = "wrong"; });
        fb.textContent = (k === q[2] ? "Correcto. " : "No es esa. ") + q[3];
        var n = el("button", "next", qi + 1 < qs.length ? "Siguiente" : "Ver resultado"); n.type = "button";
        n.addEventListener("click", function () { qi++; quiz(); });
        qb.appendChild(n); n.focus();
      });
      opts.appendChild(b);
    });
    qb.appendChild(opts); qb.appendChild(fb);
  }
  quiz();
  /* Fondo animado: propagación de contenido en una red */
  (function () {
    var cv = $("bg"), tg = $("bgtoggle");
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = 1, nodes2 = [], running = !reduce, last = 0, seedT = 0;
    var dark = window.matchMedia("(prefers-color-scheme: dark)");
    var BAD = "251,146,60", GOOD = "45,212,191", RANGE = 130;
    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(30, Math.min(85, Math.floor(W * H / 15000)));
      nodes2 = [];
      for (var i = 0; i < n; i++) nodes2.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18, e: 0, k: "" });
      if (!running) draw();
    }
    function seed(kind, x, y) {
      var best = null, bd = 1e9;
      nodes2.forEach(function (n) {
        var d = (n.x - x) * (n.x - x) + (n.y - y) * (n.y - y);
        if (d < bd) { bd = d; best = n; }
      });
      if (best) { best.e = 1; best.k = kind; }
    }
    function step(dt) {
      var i, j, a, b, dx, dy, d;
      nodes2.forEach(function (n) {
        n.x += n.vx * dt * 0.06; n.y += n.vy * dt * 0.06;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });
      var spread = [];
      for (i = 0; i < nodes2.length; i++) {
        a = nodes2[i];
        if (a.e > 0.5) {
          for (j = 0; j < nodes2.length; j++) {
            b = nodes2[j];
            if (b === a || b.e > 0) continue;
            dx = a.x - b.x; dy = a.y - b.y;
            if (dx * dx + dy * dy < RANGE * RANGE && Math.random() < (a.k === "bad" ? 0.09 : 0.03)) spread.push([b, a.k]);
          }
        }
      }
      spread.forEach(function (s) { if (s[0].e === 0) { s[0].e = 1; s[0].k = s[1]; } });
      nodes2.forEach(function (n) { if (n.e > 0) { n.e -= dt * (n.k === "bad" ? 0.00045 : 0.0006); if (n.e <= 0) { n.e = 0; n.k = ""; } } });
      seedT -= dt;
      if (seedT <= 0) {
        seed("bad", Math.random() * W, Math.random() * H);
        seed("good", Math.random() * W, Math.random() * H);
        seedT = 4500;
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var line = dark.matches ? "143,165,255" : "43,78,255", i, j, a, b, d, al;
      ctx.lineWidth = 1;
      for (i = 0; i < nodes2.length; i++) {
        a = nodes2[i];
        for (j = i + 1; j < nodes2.length; j++) {
          b = nodes2[j];
          d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > RANGE) continue;
          al = (1 - d / RANGE);
          var hot = Math.max(a.e, b.e), col = line, alpha = al * 0.14;
          if (hot > 0.05) { var k = a.e >= b.e ? a.k : b.k; col = k === "bad" ? BAD : GOOD; alpha = al * (0.14 + hot * 0.5); }
          ctx.strokeStyle = "rgba(" + col + "," + alpha + ")";
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      nodes2.forEach(function (n) {
        if (n.e > 0) {
          var c = n.k === "bad" ? BAD : GOOD;
          ctx.fillStyle = "rgba(" + c + "," + (0.25 + n.e * 0.6) + ")";
          ctx.beginPath(); ctx.arc(n.x, n.y, 2.5 + n.e * 4, 0, 6.2832); ctx.fill();
        } else {
          ctx.fillStyle = "rgba(" + line + ",.28)";
          ctx.beginPath(); ctx.arc(n.x, n.y, 2, 0, 6.2832); ctx.fill();
        }
      });
    }
    function loop(t) {
      if (!running) return;
      var dt = Math.min(50, t - last || 16); last = t;
      step(dt); draw();
      requestAnimationFrame(loop);
    }
    function start() { if (running && !document.hidden) { last = 0; requestAnimationFrame(loop); } }
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) start(); });
    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a,button,input,summary,label,details,header")) return;
      seed("bad", e.clientX, e.clientY);
    });
    if (reduce) { tg.style.display = "none"; }
    tg.addEventListener("click", function () {
      running = !running;
      tg.setAttribute("aria-pressed", running ? "false" : "true");
      tg.textContent = running ? "Pausar fondo" : "Reanudar fondo";
      if (running) start();
    });
    resize(); seed("bad", W * .3, H * .4); seed("good", W * .7, H * .6);
    if (running) start(); else draw();
  })();
})();
