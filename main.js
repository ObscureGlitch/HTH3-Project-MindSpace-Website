/* MindSpace landing page — interactions & motion (no dependencies) */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");

  var cfg = window.MINDSPACE_CONFIG || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var now = function () { return (window.performance && performance.now()) || Date.now(); };
  var hasIO = "IntersectionObserver" in window;

  /* ---------- Download buttons ---------- */
  var url = (cfg.downloadUrl || "").trim();
  $$("[data-download]").forEach(function (btn) {
    if (url) {
      btn.setAttribute("href", url);
      var sameOrigin = !/^https?:\/\//i.test(url) || url.indexOf(location.origin) === 0;
      if (sameOrigin) btn.setAttribute("download", cfg.fileName || "");
      else btn.setAttribute("rel", "noopener");
    } else {
      btn.setAttribute("href", "#download");
      btn.setAttribute("aria-disabled", "true");
      var label = $("[data-download-label]", btn);
      if (label) label.textContent = "Download coming soon";
      btn.addEventListener("click", function (e) { e.preventDefault(); });
    }
  });
  var detailsEl = $("[data-download-details]");
  if (detailsEl) detailsEl.textContent = [cfg.version, "Windows 10 and 11", cfg.fileSize].filter(Boolean).join(" · ");

  /* ---------- Split hero headline into animated words ---------- */
  $$("[data-split]").forEach(function (el) {
    var i = 0;
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "word"; w.setAttribute("aria-hidden", "true");
            var inner = document.createElement("span"); inner.textContent = part; inner.style.setProperty("--i", i++);
            w.appendChild(inner); frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) { walk(child); }
      });
    };
    el.setAttribute("aria-label", el.textContent);
    walk(el);
  });

  /* ---------- Reveal on scroll (staggered) ---------- */
  $$("[data-stagger]").forEach(function (group) {
    $$(".reveal", group).forEach(function (el, idx) { if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", idx); });
  });
  var toObserve = $$(".reveal, [data-observe]");
  if (hasIO && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    toObserve.forEach(function (el) { io.observe(el); });
  } else {
    toObserve.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Pause looping animations while off-screen ---------- */
  if (hasIO) {
    var pauseIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle("is-offscreen", !en.isIntersecting); });
    }, { rootMargin: "100px 0px" });
    $$(".hero, .breathe, .blobs, .care, .showcase").forEach(function (el) { pauseIO.observe(el); });
  }

  /* ---------- Background trailer ---------- */
  var heroVideo = $("[data-hero-video]");
  var toggle = $("[data-toggle-video]");
  var userPaused = false;
  function setVideoState(playing) {
    toggle.setAttribute("aria-pressed", String(!playing));
    $("[data-toggle-label]").textContent = playing ? "Pause background" : "Play background";
    $("[data-icon-pause]").toggleAttribute("hidden", !playing);
    $("[data-icon-play]").toggleAttribute("hidden", playing);
  }
  if (heroVideo) {
    heroVideo.playbackRate = 0.9;
    if (reduceMotion) { heroVideo.removeAttribute("autoplay"); heroVideo.pause(); userPaused = true; setVideoState(false); }
    toggle.addEventListener("click", function () {
      if (heroVideo.paused) { userPaused = false; heroVideo.play().catch(function () {}); setVideoState(true); }
      else { userPaused = true; heroVideo.pause(); setVideoState(false); }
    });
    if (hasIO) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (userPaused) return;
          if (en.isIntersecting) heroVideo.play().catch(function () {}); else heroVideo.pause();
        });
      }, { threshold: 0.05 }).observe(heroVideo);
    }
  }

  /* ---------- Dialogs: trailer + lightbox ---------- */
  var trailerDialog = $("[data-trailer-dialog]");
  var trailerVideo = $("[data-trailer-video]");
  if (cfg.trailerUrl) { trailerVideo.innerHTML = ""; trailerVideo.src = cfg.trailerUrl; }
  function openDialog(d) { if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", ""); }
  function closeDialog(d) { if (typeof d.close === "function") d.close(); else d.removeAttribute("open"); }
  $$("[data-open-trailer]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (heroVideo) heroVideo.pause();
      openDialog(trailerDialog); trailerVideo.currentTime = 0; trailerVideo.play().catch(function () {});
    });
  });
  trailerDialog.addEventListener("close", function () {
    trailerVideo.pause();
    if (heroVideo && !userPaused) heroVideo.play().catch(function () {});
  });
  var lightbox = $("[data-lightbox-dialog]");
  var lightImg = $("[data-lightbox-img]");
  $$("[data-lightbox]").forEach(function (b) {
    b.addEventListener("click", function () {
      var img = $("img", b);
      lightImg.src = b.getAttribute("data-lightbox"); lightImg.alt = img ? img.alt : "";
      openDialog(lightbox);
    });
  });
  $$("dialog").forEach(function (d) {
    $("[data-close-dialog]", d).addEventListener("click", function () { closeDialog(d); });
    d.addEventListener("click", function (e) { if (e.target === d) closeDialog(d); });
  });

  /* ---------- Guided breathing exercise ---------- */
  (function () {
    var root = $("[data-breathe]");
    if (!root) return;
    var el = {
      breather: $("[data-breather]", root),
      orb: $("[data-breath-orb]", root),
      halo: $(".breather__halo", root),
      ring: $("[data-breath-ring]", root),
      phase: $("[data-breath-phase]", root),
      count: $("[data-breath-count]", root),
      live: $("[data-breath-live]", root),
      toggle: $("[data-breath-toggle]", root),
      toggleLabel: $("[data-breath-toggle-label]", root),
      iconStart: $("[data-icon-start]", root),
      iconHold: $("[data-icon-hold]", root),
      reset: $("[data-breath-reset]", root),
      meter: $("[data-breath-meter]", root),
      stats: $("[data-breath-stats]", root),
      fields: $$(".seg", root)
    };
    var RING = 590.62, SMALL = .62, BIG = 1;
    var PATTERNS = {
      calm: [["in", "Breathe in", 4], ["out", "Breathe out", 6]],
      box: [["in", "Breathe in", 4], ["hold", "Hold", 4], ["out", "Breathe out", 4], ["rest", "Hold", 4]],
      "478": [["in", "Breathe in", 4], ["hold", "Hold", 7], ["out", "Breathe out", 8]]
    };
    var st = { state: "idle", pattern: "calm", length: 60, phaseIdx: 0, phaseStart: 0, phaseLeft: 0, elapsed: 0, breaths: 0, raf: 0, lastTick: 0, lastCount: -1 };

    var fmt = function (sec) { sec = Math.max(0, Math.ceil(sec)); return Math.floor(sec / 60) + ":" + ("0" + (sec % 60)).slice(-2); };
    var radio = function (name) { var r = $("input[name='" + name + "']:checked", root); return r ? r.value : null; };

    function setScale(scale, secs) {
      el.breather.style.setProperty("--dur", secs + "s");
      el.orb.style.transform = el.halo.style.transform = "scale(" + scale + ")";
    }
    function runRing(secs) {
      el.ring.style.transition = "none";
      el.ring.style.strokeDashoffset = RING;
      void el.ring.getBoundingClientRect();
      el.ring.style.transition = "stroke-dashoffset " + secs + "s linear";
      el.ring.style.strokeDashoffset = 0;
    }
    function freezeRing() {
      var cur = getComputedStyle(el.ring).strokeDashoffset;
      el.ring.style.transition = "none"; el.ring.style.strokeDashoffset = cur;
    }
    function freezeOrb() {
      [el.orb, el.halo].forEach(function (n) { var m = getComputedStyle(n).transform; n.style.transition = "none"; n.style.transform = m; });
    }
    function unfreezeOrb() { el.orb.style.transition = el.halo.style.transition = ""; }
    function setPhaseText(text) {
      el.phase.classList.add("is-swap");
      setTimeout(function () { el.phase.textContent = text; el.phase.classList.remove("is-swap"); }, 180);
      el.live.textContent = text;
    }
    function updateStats() {
      var left = st.length - st.elapsed;
      el.stats.textContent = st.breaths + (st.breaths === 1 ? " breath" : " breaths") + " · " + fmt(left) + " left";
      el.meter.style.transform = "scaleX(" + clamp(st.elapsed / st.length, 0, 1).toFixed(4) + ")";
    }
    function setButtons() {
      var running = st.state === "running";
      el.toggleLabel.textContent = running ? "Pause" : st.state === "paused" ? "Resume" : st.state === "done" ? "Go again" : "Start breathing";
      el.iconStart.toggleAttribute("hidden", running); el.iconHold.toggleAttribute("hidden", !running);
      el.reset.hidden = st.state === "idle";
      el.fields.forEach(function (f) { f.disabled = running || st.state === "paused"; });
      el.breather.setAttribute("data-state", st.state);
    }

    function startPhase(idx, remaining) {
      var steps = PATTERNS[st.pattern];
      st.phaseIdx = idx % steps.length;
      var step = steps[st.phaseIdx];
      var full = step[2];
      var secs = remaining != null ? remaining : full;
      st.phaseLeft = secs; st.phaseStart = now(); st.lastCount = -1;
      el.breather.setAttribute("data-phase", step[0]);
      if (remaining == null) { setPhaseText(step[1]); runRing(secs); }
      else {
        // resume: finish the ring from where it paused
        el.ring.style.transition = "stroke-dashoffset " + secs + "s linear";
        el.ring.style.strokeDashoffset = 0;
      }
      unfreezeOrb();
      if (step[0] === "in") setScale(BIG, secs);
      else if (step[0] === "out") setScale(SMALL, secs);
      if (remaining == null && step[0] === "out") st.breaths++;
    }

    function tick(t) {
      if (st.state !== "running") return;
      var dt = (t - st.lastTick) / 1000; st.lastTick = t;
      st.elapsed += dt;
      var phaseElapsed = (t - st.phaseStart) / 1000;
      var left = st.phaseLeft - phaseElapsed;
      var c = Math.ceil(left);
      if (c !== st.lastCount && c > 0) { st.lastCount = c; el.count.textContent = c; updateStats(); }
      if (left <= 0) {
        var steps = PATTERNS[st.pattern];
        var endOfCycle = st.phaseIdx === steps.length - 1;
        if (st.elapsed >= st.length && endOfCycle) return finish();
        startPhase(st.phaseIdx + 1);
      }
      st.raf = requestAnimationFrame(tick);
    }

    function start() {
      st.pattern = radio("breath-pattern") || "calm";
      st.length = parseInt(radio("breath-length"), 10) || 60;
      st.elapsed = 0; st.breaths = 0;
      st.state = "running"; setButtons();
      setScale(SMALL, 0.01);
      void el.orb.getBoundingClientRect();
      st.lastTick = now();
      startPhase(0);
      updateStats();
      st.raf = requestAnimationFrame(tick);
    }
    function pause() {
      if (st.state !== "running") return;
      cancelAnimationFrame(st.raf);
      st.phaseLeft -= (now() - st.phaseStart) / 1000;
      freezeRing(); freezeOrb();
      st.state = "paused"; setButtons();
      setPhaseText("Paused");
      el.count.textContent = "";
    }
    function resume() {
      st.state = "running"; setButtons();
      var steps = PATTERNS[st.pattern];
      setPhaseText(steps[st.phaseIdx][1]);
      st.lastTick = now();
      startPhase(st.phaseIdx, Math.max(st.phaseLeft, .3));
      st.raf = requestAnimationFrame(tick);
    }
    function finish() {
      cancelAnimationFrame(st.raf);
      st.state = "done"; setButtons();
      el.breather.removeAttribute("data-phase");
      el.orb.style.transform = el.halo.style.transform = "";
      el.ring.style.transition = "stroke-dashoffset .8s var(--ease)"; el.ring.style.strokeDashoffset = 0;
      setPhaseText("Nicely done.");
      el.count.textContent = st.breaths + " slow breaths";
      st.elapsed = st.length; updateStats();
    }
    function reset() {
      cancelAnimationFrame(st.raf);
      st.state = "idle"; st.elapsed = 0; st.breaths = 0;
      st.length = parseInt(radio("breath-length"), 10) || 60;
      el.breather.removeAttribute("data-phase");
      el.orb.style.transform = el.halo.style.transform = ""; unfreezeOrb();
      el.ring.style.transition = "none"; el.ring.style.strokeDashoffset = RING;
      setButtons(); setPhaseText("Ready when you are"); el.count.textContent = ""; updateStats();
    }

    el.toggle.addEventListener("click", function () {
      if (st.state === "running") pause();
      else if (st.state === "paused") resume();
      else start();
    });
    el.reset.addEventListener("click", reset);
    $$("input[name='breath-length']", root).forEach(function (r) {
      r.addEventListener("change", function () { if (st.state === "idle" || st.state === "done") { st.length = parseInt(r.value, 10); st.elapsed = 0; st.breaths = 0; updateStats(); } });
    });
    document.addEventListener("visibilitychange", function () { if (document.hidden) pause(); });
    if (hasIO) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (!en.isIntersecting) pause(); });
      }, { threshold: 0 }).observe(el.breather);
    }
    setButtons(); updateStats();
  })();

  /* ---------- Pointer effects: tilt cards + magnetic buttons (rAF-throttled) ---------- */
  if (finePointer && !reduceMotion) {
    var bindPointer = function (el, onMove, onLeave) {
      var pending = null, rect = null;
      el.addEventListener("pointerenter", function () { rect = el.getBoundingClientRect(); });
      el.addEventListener("pointermove", function (e) {
        if (!rect) rect = el.getBoundingClientRect();
        var wasPending = pending; pending = e;
        if (wasPending) return;
        requestAnimationFrame(function () { if (pending) onMove(pending, rect); pending = null; });
      });
      el.addEventListener("pointerleave", function () { pending = null; rect = null; onLeave(); });
    };
    $$("[data-tilt]").forEach(function (card) {
      bindPointer(card, function (e, r) {
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--ry", ((x - .5) * 8).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((.5 - y) * 8).toFixed(2) + "deg");
        card.style.setProperty("--gx", (x * 100).toFixed(1) + "%");
        card.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
      }, function () { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); });
    });
    $$("[data-magnetic]").forEach(function (btn) {
      bindPointer(btn, function (e, r) {
        btn.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + "px");
        btn.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + "px");
      }, function () { btn.style.setProperty("--mx", "0px"); btn.style.setProperty("--my", "0px"); });
    });
  }

  /* ---------- Tour: giant double circle, one stop per scroll gesture ---------- */
  var showcase = $("[data-showcase]");
  var tour = null;
  if (showcase) {
    tour = {
      orb: $("[data-orb]", showcase),
      outer: $("[data-orb-outer]", showcase),
      inner: $("[data-orb-inner]", showcase),
      marks: $$(".orb__marks li", showcase),
      imgs: $$("[data-orb-img]", showcase),
      stops: $$("[data-stop]", showcase),
      slides: $$("[data-slide]", showcase),
      fills: $$("[data-fills] , .showcase__bg", showcase),
      index: -1,
      lockUntil: 0, lastWheel: 0, lastAbs: 0,
      top: 0, total: 1
    };
    tour.n = tour.slides.length;

    tour.measure = function () {
      tour.top = showcase.getBoundingClientRect().top + window.scrollY;
      tour.total = Math.max(showcase.offsetHeight - window.innerHeight, 1);
    };
    tour.stopY = function (k) { return Math.round(tour.top + (k / (tour.n - 1)) * tour.total); };
    tour.pinned = function (y) { return y >= tour.top - 2 && y <= tour.top + tour.total + 2; };
    tour.atEdge = function (dir) { return (dir > 0 && tour.index >= tour.n - 1) || (dir < 0 && tour.index <= 0); };

    tour.render = function (k) {
      if (k === tour.index) return;
      var first = tour.index < 0;
      tour.index = k;
      [tour.slides, tour.stops, tour.imgs, tour.marks].forEach(function (list) {
        list.forEach(function (el, j) { el.classList.toggle("is-active", j === k); });
      });
      tour.slides.forEach(function (el, j) { el.setAttribute("aria-hidden", String(j !== k)); });
      tour.stops.forEach(function (el, j) { el.setAttribute("aria-current", j === k ? "step" : "false"); });
      // Colours: the new layer fades in over the previous one (opacity only — no repaints)
      tour.fills.forEach(function (group) {
        Array.prototype.forEach.call(group.children, function (el, j) {
          var wasActive = el.classList.contains("is-active");
          el.classList.toggle("is-prev", wasActive && j !== k && !first);
          if (!wasActive || j === k) el.classList.remove("is-prev");
          el.classList.toggle("is-active", j === k);
        });
      });
      // Turning: transform transitions on transparent overlay layers
      tour.outer.style.transform = "rotate(" + (-k * 72) + "deg)";
      tour.inner.style.transform = "rotate(" + (-k * 100) + "deg)";
      if (!first && !reduceMotion) { tour.orb.classList.remove("is-changing"); void tour.orb.offsetWidth; tour.orb.classList.add("is-changing"); }
    };

    // Go to a stop: jump the page to that stop's scroll position (invisible — the section is pinned)
    tour.go = function (k) {
      k = clamp(k, 0, tour.n - 1);
      tour.lockUntil = now() + (reduceMotion ? 250 : 700);
      tour.render(k);
      window.scrollTo({ top: tour.stopY(k), behavior: "instant" });
    };

    // Returns true when the gesture belongs to the tour
    tour.step = function (dir) {
      if (!tour.pinned(window.scrollY) || tour.atEdge(dir)) return false;
      if (now() >= tour.lockUntil) tour.go(tour.index + dir);
      return true;
    };

    // Wheel / trackpad: any small movement advances one stop; trailing inertia is ignored
    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey) return; // pinch-zoom
      var d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : 0;
      if (!d) return;
      var t = now(), abs = Math.abs(d);
      var newGesture = t - tour.lastWheel > 160 || abs > tour.lastAbs * 1.6 + 4;
      tour.lastWheel = t; tour.lastAbs = abs;
      var dir = d > 0 ? 1 : -1;
      if (!tour.pinned(window.scrollY) || tour.atEdge(dir)) return;
      e.preventDefault();
      if (newGesture || t >= tour.lockUntil + 350) tour.step(dir);
    }, { passive: false });

    // Touch: a short swipe advances one stop
    var touchY = null, touchUsed = false;
    window.addEventListener("touchstart", function (e) { touchY = e.touches[0].clientY; touchUsed = false; }, { passive: true });
    window.addEventListener("touchmove", function (e) {
      if (touchY === null) return;
      var dy = touchY - e.touches[0].clientY;
      var dir = dy > 0 ? 1 : -1;
      if (!tour.pinned(window.scrollY) || tour.atEdge(dir)) return;
      if (e.cancelable) e.preventDefault();
      if (!touchUsed && Math.abs(dy) > 10) { touchUsed = true; tour.step(dir); }
    }, { passive: false });
    window.addEventListener("touchend", function () { touchY = null; }, { passive: true });

    // Keyboard
    window.addEventListener("keydown", function (e) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      var tag = (e.target && e.target.tagName) || "";
      if (e.key === " " && /INPUT|TEXTAREA|SELECT|BUTTON|VIDEO|A/.test(tag)) return;
      var dir = 0;
      if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) dir = 1;
      else if (e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) dir = -1;
      if (dir && tour.step(dir)) e.preventDefault();
    });

    tour.stops.forEach(function (b, k) {
      b.addEventListener("click", function () {
        if (tour.pinned(window.scrollY)) tour.go(k);
        else window.scrollTo({ top: tour.stopY(k), behavior: reduceMotion ? "auto" : "smooth" });
      });
    });

    tour.render(0);
    tour.measure();
  }

  /* ---------- Scroll-linked effects: one rAF, all reads before writes ---------- */
  var nav = $("[data-nav]");
  var progress = $("[data-progress]");
  var heroCard = $(".hero__card");
  var parallax = $$("[data-parallax]").map(function (el) { return { el: el, img: $("img", el) }; });
  var parallaxBg = $$("[data-parallax-bg]");
  var lastY = window.scrollY, ticking = false, docMax = 1, vh = window.innerHeight;

  function measure() {
    vh = window.innerHeight;
    docMax = Math.max(document.documentElement.scrollHeight - vh, 1);
    if (tour) tour.measure();
  }

  function onFrame() {
    ticking = false;
    // ---- read ----
    var y = window.scrollY;
    var pRects = reduceMotion ? [] : parallax.map(function (p) { return p.el.getBoundingClientRect(); });
    var bRects = reduceMotion ? [] : parallaxBg.map(function (el) { return el.parentElement.getBoundingClientRect(); });

    // ---- write ----
    progress.style.transform = "scaleX(" + clamp(y / docMax, 0, 1).toFixed(4) + ")";
    nav.classList.toggle("is-scrolled", y > 40);
    if (y > vh && y > lastY + 2) nav.classList.add("is-hidden");
    else if (y < lastY - 2 || y <= vh) nav.classList.remove("is-hidden");
    lastY = y;

    // Scrollbar drags, anchor links, etc.: show the nearest stop
    if (tour && now() >= tour.lockUntil) {
      tour.render(Math.round(clamp((y - tour.top) / tour.total, 0, 1) * (tour.n - 1)));
    }
    if (reduceMotion) return;

    if (y < vh) {
      var hs = y / vh;
      heroVideo.style.transform = "translate3d(0," + (hs * 40).toFixed(1) + "px,0) scale(" + (1 + hs * .08).toFixed(4) + ")";
      heroCard.style.transform = "translate3d(0," + (hs * -60).toFixed(1) + "px,0)";
      heroCard.style.opacity = Math.max(0, 1 - hs * 1.2).toFixed(3);
    }
    parallax.forEach(function (p, i) {
      var r = pRects[i];
      if (r.bottom < -100 || r.top > vh + 100) return;
      p.img.style.transform = "translate3d(0," + ((r.top + r.height / 2 - vh / 2) * -0.06).toFixed(1) + "px,0) scale(1.1)";
    });
    parallaxBg.forEach(function (el, i) {
      var r = bRects[i];
      if (r.bottom < -100 || r.top > vh + 100) return;
      el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - vh / 2) * -0.12).toFixed(1) + "px,0)";
    });
  }
  function requestFrame() { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } }
  window.addEventListener("scroll", requestFrame, { passive: true });
  var resizeTimer;
  window.addEventListener("resize", function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(function () { measure(); requestFrame(); }, 120); });
  window.addEventListener("load", function () { measure(); requestFrame(); });
  if ("ResizeObserver" in window) new ResizeObserver(function () { measure(); }).observe(document.body);
  measure();
  onFrame();

  /* ---------- Active nav link ---------- */
  var links = $$(".nav__links a");
  if (hasIO) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-active"); });
        if (byId[en.target.id]) byId[en.target.id].classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) { var sec = document.getElementById(id); if (sec) navIO.observe(sec); });
  }
})();
