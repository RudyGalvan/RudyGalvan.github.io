(function () {
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");
  var yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  if (toggle && nav) {
    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a[href^='#']").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }
})();

(function initStarfield() {
  var canvas = document.getElementById("starfield");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var stars = [];
  var rafId = 0;
  var t0 = performance.now();
  var resizeTimer = 0;

  var colors = ["#e8f7f2", "#ffffff", "#3dffce", "#9cf9e4", "#ffe600", "#ffc8ec"];

  function prefersReducedMotion() {
    return mqReduce.matches;
  }

  function seedStars(w, h) {
    stars = [];
    var area = w * h;
    var count = Math.min(520, Math.max(120, Math.floor(area / 2000)));
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        s: Math.random() < 0.72 ? 1 : 2,
        c: colors[(Math.random() * colors.length) | 0],
        phase: Math.random() * Math.PI * 2,
        speed: 0.35 + Math.random() * 1.1,
      });
    }
  }

  function layout() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedStars(w, h);
  }

  function drawFrame(now) {
    var w = window.innerWidth;
    var h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    var reduced = prefersReducedMotion();
    var t = reduced ? 0 : (now - t0) / 1000;

    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      var tw = reduced ? 1 : 0.38 + 0.62 * (0.5 + 0.5 * Math.sin(t * st.speed + st.phase));
      ctx.globalAlpha = tw;
      ctx.fillStyle = st.c;
      var x = Math.floor(st.x);
      var y = Math.floor(st.y);
      ctx.fillRect(x, y, st.s, st.s);
    }
    ctx.globalAlpha = 1;
  }

  function loop(now) {
    drawFrame(now);
    if (!prefersReducedMotion()) {
      rafId = window.requestAnimationFrame(loop);
    }
  }

  function cancelLoop() {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  function kick() {
    cancelLoop();
    layout();
    t0 = performance.now();
    drawFrame(t0);
    if (!prefersReducedMotion()) {
      rafId = window.requestAnimationFrame(loop);
    }
  }

  function onResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(kick, 120);
  }

  kick();
  window.addEventListener("resize", onResize);

  if (typeof mqReduce.addEventListener === "function") {
    mqReduce.addEventListener("change", kick);
  } else if (typeof mqReduce.addListener === "function") {
    mqReduce.addListener(kick);
  }
})();
