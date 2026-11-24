// The background stays a still frame until the visitor scrolls,
// then the video fades into motion. Respects reduced-motion settings.
(function () {
  var video = document.querySelector('.bg__video');
  if (!video) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var started = false;
  function start() {
    if (started) return;
    started = true;
    document.documentElement.classList.add('is-playing');
    var p = video.play();
    if (p && p.catch) p.catch(function () { started = false; });
  }

  window.addEventListener('scroll', function () {
    if (window.scrollY > 6) start();
  }, { passive: true });
  ['wheel', 'touchmove', 'keydown'].forEach(function (evt) {
    window.addEventListener(evt, start, { once: true, passive: true });
  });
})();
