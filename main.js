(function () {
  var COUNT = 149, FPS = 12;
  var canvas = document.getElementById('film');
  var ctx = canvas.getContext('2d');
  var stage = document.getElementById('stage');
  var tint = document.getElementById('tint');
  var bar = document.getElementById('bar');
  var topbar = document.getElementById('topbar');
  var chaps = Array.prototype.slice.call(document.querySelectorAll('.chap'));
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var TINTS = {
    none: 'rgba(0,0,0,0)', orchid: 'rgba(190,92,169,.14)', plum: 'rgba(77,58,77,.16)', pink: 'rgba(213,156,197,.22)'
  };

  var imgs = new Array(COUNT);
  var loaded = 0;
  var target = 0, cur = 0, last = 0, running = false;

  function src(i) { return 'assets/frames/f_' + String(i + 1).padStart(4, '0') + '.webp'; }
  function load(i) {
    return new Promise(function (res) {
      var im = new Image();
      im.decoding = 'async';
      im.onload = function () { imgs[i] = im; loaded++; root.style.setProperty('--load', (loaded / COUNT).toFixed(3)); res(); };
      im.onerror = function () { res(); };
      im.src = src(i);
    });
  }

  function frameAt(i) {
    for (var k = i; k >= 0; k--) if (imgs[k]) return imgs[k];
    for (var j = i + 1; j < COUNT; j++) if (imgs[j]) return imgs[j];
    return null;
  }

  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.imageSmoothingQuality = 'high';
  }

  function cover(im, alpha, zoom) {
    var cw = canvas.width, ch = canvas.height;
    var s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight) * zoom;
    var w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.globalAlpha = alpha;
    ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  function draw() {
    var idx = cur * (COUNT - 1);
    var i0 = Math.floor(idx), f = idx - i0;
    var zoom = 1.01 + 0.04 * cur;
    var a = frameAt(i0);
    if (!a) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cover(a, 1, zoom);
    var b = imgs[Math.min(i0 + 1, COUNT - 1)];
    if (b && f > 0.03) cover(b, f, zoom);
    ctx.globalAlpha = 1;
  }

  var activeTint = '';
  function chapters() {
    var t = cur * (COUNT - 1) / FPS;
    for (var i = 0; i < chaps.length; i++) {
      var c = chaps[i];
      var on = t >= parseFloat(c.dataset.from) && t <= parseFloat(c.dataset.to);
      if (on !== c.classList.contains('is-on')) c.classList.toggle('is-on', on);
      if (on && c.dataset.tint !== activeTint) { activeTint = c.dataset.tint; tint.style.backgroundColor = TINTS[activeTint] || TINTS.none; }
    }
    bar.style.transform = 'scaleX(' + cur.toFixed(4) + ')';
  }

  function readTarget() {
    var total = stage.offsetHeight - window.innerHeight;
    var top = stage.getBoundingClientRect().top;
    target = Math.min(1, Math.max(0, -top / total));
    root.classList.toggle('is-scrolled', target > 0.004);
    topbar.classList.toggle('on-dark', stage.getBoundingClientRect().bottom < 70);
  }

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    cur = reduce ? target : cur + (target - cur) * (1 - Math.exp(-dt * 9));
    if (Math.abs(target - cur) < 0.00015) cur = target;
    draw();
    chapters();
    if (cur !== target) requestAnimationFrame(frame); else running = false;
  }
  function kick() {
    readTarget();
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
  }

  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', function () { size(); kick(); draw(); });
  size();

  load(0).then(function () {
    kick(); draw(); chapters();
    // first chapter is visible immediately
    var queue = []; for (var i = 1; i < COUNT; i++) queue.push(i);
    var workers = 6, done = 0;
    function next() {
      if (!queue.length) { if (++done === workers) { root.classList.add('is-loaded'); } return; }
      load(queue.shift()).then(next);
    }
    for (var w = 0; w < workers; w++) next();
  });
})();
