/* ============================================================
   CONFIGURACIÓN DEL EFECTO MÁQUINA DE ESCRIBIR  (editá estos valores)
   ============================================================ */
var TYPING_CONFIG = {
  speed: 55 /* milisegundos por letra al escribir */,
  deleteSpeed: 28 /* milisegundos por letra al borrar */,
  pause: 2200 /* cuánto queda el título completo antes de borrarse */,
  phrases: [
    "Soluciones informáticas a medida",
    "Calamuchita Software <>",
  ] /* textos que alterna el primer título */,
  respectReducedMotion: false /* true = quien tenga "reducir movimiento" en su sistema ve los textos fijos */,
};

/* ============================================================
   CONFIGURACIÓN DE LOS SÍMBOLOS FLOTANTES  (editá estos valores)
   ============================================================ */
var SYMBOLS_CONFIG = {
  count: 32 /* cuántos símbolos hay en pantalla */,
  symbols: [
    "{ }",
    "</>",
    "( )",
    "[ ]",
    ";",
    "=>",
    "&&",
    "0101",
    "#",
    "if",
    "//",
    "fn()",
    "++",
    "<div>",
    "null",
    "true",
    "==",
    "%",
    "*/",
    "$_",
    "git",
    "sql",
    "</p>",
    "!=",
    "int",
    "404",
  ],
  colors: [
    "#3dff9a",
    "#3dff9a",
    "#17c46a",
    "#ffb347",
  ] /* se reparten al azar; repetí un color para que aparezca más */,
  opacity: { min: 0.08, max: 0.32 } /* 0 = invisible, 1 = sólido */,
  size: { min: 14, max: 50 } /* tamaño de letra en px */,
  sizeBias: 2 /* 1 = tamaños parejos; más alto = más símbolos chicos y pocos grandes */,
  speed: {
    min: 8,
    max: 38,
  } /* px por segundo (los grandes se mueven más rápido) */,
  wobble: 14 /* cuánto "serpentean" mientras flotan */,
  rotation: 22 /* giro máximo en grados por segundo */,
  glow: true /* brillo alrededor de cada símbolo */,
};

(function () {
  var RM = matchMedia("(prefers-reduced-motion: reduce)").matches,
    $ = function (s) {
      return document.querySelector(s);
    };
  var yy = $("#y");
  if (yy) yy.textContent = new Date().getFullYear();

  /* Menú móvil */
  var b = $(".menu"),
    m = $("#menu");
  if (b && m) {
    b.addEventListener("click", function () {
      b.setAttribute("aria-expanded", m.classList.toggle("open"));
    });
    m.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        m.classList.remove("open");
        b.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Símbolos de programación flotando libremente por toda la pantalla */
  function ensure(id) {
    /* si el HTML no tiene el elemento, lo crea (los estilos ya están en el CSS) */
    var e = document.getElementById(id);
    if (!e) {
      e = document.createElement("div");
      e.id = id;
      document.body.insertBefore(e, document.body.firstChild);
    }
    return e;
  }
  var F = ensure("field"),
    W,
    H,
    G = [],
    last = 0,
    C = SYMBOLS_CONFIG;
  F.setAttribute("aria-hidden", "true");
  function rnd(a, b) {
    return a + Math.random() * (b - a);
  }
  function size() {
    W = innerWidth;
    H = innerHeight;
  }
  function draw() {
    for (var i = 0; i < G.length; i++) {
      var g = G[i];
      g.e.style.transform =
        "translate3d(" + g.x + "px," + g.y + "px,0) rotate(" + g.r + "deg)";
    }
  }
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000),
      t = now / 1000;
    last = now;
    for (var i = 0; i < G.length; i++) {
      var g = G[i];
      g.x += g.vx * dt + Math.sin(t * g.w + g.ph) * g.amp * dt;
      g.y += g.vy * dt + Math.cos(t * g.w + g.ph) * g.amp * dt;
      g.r += g.vr * dt;
      if (g.x > W + g.m) g.x = -g.m;
      else if (g.x < -g.m) g.x = W + g.m;
      if (g.y > H + g.m) g.y = -g.m;
      else if (g.y < -g.m) g.y = H + g.m;
    }
    draw();
    requestAnimationFrame(frame);
  }
  size();
  for (var i = 0; i < C.count; i++) {
    var e = document.createElement("span"),
      txt = C.symbols[(Math.random() * C.symbols.length) | 0],
      k = Math.pow(Math.random(), C.sizeBias) /* 0 = chico, 1 = grande */,
      s = C.size.min + (C.size.max - C.size.min) * k,
      sp = (C.speed.min + (C.speed.max - C.speed.min) * k) * rnd(0.6, 1.2),
      a = rnd(0, 6.283),
      col = C.colors[(Math.random() * C.colors.length) | 0];
    e.className = "gl";
    e.textContent = txt;
    e.style.fontSize = s + "px";
    e.style.color = col;
    e.style.textShadow = C.glow ? "0 0 .45em currentColor" : "none";
    F.appendChild(e);
    G.push({
      e: e,
      x: rnd(0, W),
      y: rnd(0, H),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      r: rnd(0, 360),
      vr: rnd(-C.rotation, C.rotation) * (1 - k * 0.6),
      w: rnd(0.2, 0.7),
      ph: rnd(0, 6.283),
      amp: rnd(0, C.wobble) * (0.4 + k),
      m: s * txt.length * 0.65,
    });
    requestAnimationFrame(
      (function (el, o) {
        return function () {
          el.style.opacity = o;
        };
      })(e, rnd(C.opacity.min, C.opacity.max)),
    );
  }
  draw();
  if (!RM)
    requestAnimationFrame(function (n) {
      last = n;
      frame(n);
    });
  addEventListener("resize", size);

  /* Efecto máquina de escribir en los títulos */
  var TC = TYPING_CONFIG,
    tRM = RM && TC.respectReducedMotion;
  function prep(el) {
    var tx = el.textContent.trim(),
      a = document.createElement("span"),
      b = document.createElement("span");
    b.className = "tw-rest";
    b.textContent = tx;
    el.textContent = "";
    el.appendChild(a);
    el.appendChild(b);
    el._a = a;
    el._b = b;
    el._tx = tx;
  }
  function typeIn(el) {
    if (el._go) return;
    el._go = 1;
    var a = el._a,
      b = el._b,
      tx = el._tx,
      i = 0;
    a.className = "tw";
    (function s() {
      i++;
      a.textContent = tx.slice(0, i);
      b.textContent = tx.slice(i);
      if (i < tx.length) setTimeout(s, TC.speed * (0.6 + Math.random() * 0.8));
      else
        setTimeout(function () {
          a.className = "";
        }, 1400);
    })();
  }
  var HT = $("#hero-title") || $(".hero h1") || $("h1");
  var titles = [].filter.call(
    document.querySelectorAll("[data-sc]"),
    function (e) {
      return e !== HT;
    },
  );
  if (!tRM) {
    titles.forEach(prep);
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (es) {
          es.forEach(function (x) {
            if (x.isIntersecting) {
              typeIn(x.target);
              io.unobserve(x.target);
            }
          });
        },
        { threshold: 0.6 },
      );
      titles.forEach(function (e) {
        io.observe(e);
      });
    } else titles.forEach(typeIn);
  }

  /* Primer título: escribe, se borra y alterna entre las frases */
  if (HT && !tRM && TC.phrases.length) {
    var ph = TC.phrases,
      pi = 0,
      n = 0,
      dir = 1,
      ha = document.createElement("span"),
      hb = document.createElement("span");
    ha.className = "tw";
    hb.className = "tw-rest";
    HT.textContent = "";
    HT.appendChild(ha);
    HT.appendChild(hb);
    ha.setAttribute("aria-hidden", "true");
    hb.setAttribute("aria-hidden", "true");
    if (!HT.getAttribute("aria-label"))
      HT.setAttribute("aria-label", ph.slice().reverse().join(": "));
    function render() {
      ha.textContent = ph[pi].slice(0, n);
      hb.textContent = ph[pi].slice(n);
    }
    function reserve() {
      /* reserva la altura de la frase más larga para que la página no salte */
      HT.style.minHeight = "";
      var m = 0;
      ph.forEach(function (t) {
        ha.textContent = "";
        hb.textContent = t;
        m = Math.max(m, HT.offsetHeight);
      });
      HT.style.minHeight = m + "px";
      render();
    }
    function step() {
      var t = ph[pi];
      if (dir === 1) {
        n++;
        render();
        if (n >= t.length) {
          dir = -1;
          setTimeout(step, TC.pause);
        } else setTimeout(step, TC.speed * (0.6 + Math.random() * 0.8));
      } else {
        n--;
        render();
        if (n <= 0) {
          dir = 1;
          pi = (pi + 1) % ph.length;
          setTimeout(step, 380);
        } else setTimeout(step, TC.deleteSpeed);
      }
    }
    reserve();
    addEventListener("resize", reserve);
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(reserve);
    setTimeout(step, 350);
  }

  /* Terminal que se escribe sola */
  var T = $("#term"),
    L = [
      "$ calamuchita --servicios",
      "-> sistemas de ventas",
      "-> armado y mantenimiento de PC",
      "-> instalación de sistemas operativos",
      "-> desarrollo web front-end",
    ];
  if (!T) {
  } else if (tRM) {
    T.textContent = L.join("\n");
  } else {
    var li = 0,
      ci = 0,
      d = document.createElement("div");
    T.appendChild(d);
    (function ty() {
      if (li >= L.length) return;
      var l = L[li];
      if (ci < l.length) {
        d.textContent += l[ci++];
        setTimeout(ty, l[0] === "$" ? 45 : 18);
      } else {
        li++;
        ci = 0;
        if (li < L.length) {
          d = document.createElement("div");
          T.appendChild(d);
        }
        setTimeout(ty, 300);
      }
    })();
  }

  /* Brillo que sigue al mouse en las tarjetas */
  document.addEventListener("pointermove", function (e) {
    var c = e.target.closest && e.target.closest(".card");
    if (c) {
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", e.clientX - r.left + "px");
      c.style.setProperty("--my", e.clientY - r.top + "px");
    }
  });
})();
