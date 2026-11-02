(function () {
  var posts = [
    { t: "ÚLTIMO MOMENTO: lo que no quieren que sepas sobre el candidato", e: 95, v: false },
    { t: "Video: dirigente anuncia que baja su candidatura (generado con IA)", e: 90, v: false },
    { t: "¡Indignante! Compartí antes de que lo borren", e: 88, v: false },
    { t: "Verificación: el video del candidato es falso, está hecho con IA", e: 40, v: true },
    { t: "La Cámara Electoral confirma que la oferta electoral sigue vigente", e: 30, v: true },
    { t: "Cómo detectar un video hecho con IA: señales y herramientas", e: 45, v: true },
    { t: "Explicación: cómo funciona el escrutinio con boleta única", e: 25, v: true }
  ];
  var range = document.getElementById("peso");
  var list = document.getElementById("lista");
  var big = document.getElementById("m-falso");
  var txt = document.getElementById("m-texto");
  var val = document.getElementById("peso-val");
  if (!range || !list) return;

  function render() {
    var w = Number(range.value) / 100;
    var ranked = posts.map(function (p) {
      return { p: p, s: (1 - w) * p.e + w * (p.v ? 100 : 0) };
    }).sort(function (a, b) { return b.s - a.s; });

    list.textContent = "";
    var unver = 0;
    ranked.forEach(function (r, i) {
      var li = document.createElement("li");
      if (r.p.v) li.className = "ver";
      if (i >= 4) li.className += " cut";
      var span = document.createElement("span");
      span.textContent = r.p.t;
      var tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = (r.p.v ? "Verificada" : "Sin verificar") + " · interacción " + r.p.e;
      li.appendChild(span);
      li.appendChild(tag);
      list.appendChild(li);
      if (i < 4 && !r.p.v) unver++;
    });
    big.textContent = unver;
    big.className = "big" + (unver === 0 ? " good" : "");
    if (w === 0) {
      val.textContent = "Solo interacción: el ranking depende únicamente de cuánta reacción provoca cada publicación.";
    } else if (w === 1) {
      val.textContent = "Solo verificación: el ranking depende únicamente de si la publicación está verificada.";
    } else {
      val.textContent = "Mezcla: " + Math.round((1 - w) * 100) + " % interacción y " + Math.round(w * 100) + " % verificación.";
    }
    txt.textContent = unver >= 3
      ? "La interacción domina y el feed se llena de contenido dudoso."
      : unver === 0
        ? "Con peso a la verificación, el contenido verificado sube, aunque genere menos clics."
        : "Hay una mezcla de ambos tipos de contenido.";
  }
  range.addEventListener("input", render);
  render();
})();
