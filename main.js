(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var video = document.querySelector('.hero__media video');
  if (video && reduce) { video.removeAttribute('autoplay'); video.pause(); }

  // nav gets a soft frosted background once you scroll
  var nav = document.getElementById('nav');
  function onScroll() { nav.classList.toggle('is-stuck', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // gentle reveal on scroll
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduce) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en, i) {
      if (en.isIntersecting) { setTimeout(function () { en.target.classList.add('is-in'); }, (en.target.dataset.d || 0)); io.unobserve(en.target); }
    });
  }, { threshold: 0.18 });
  els.forEach(function (e, i) { e.dataset.d = (i % 3) * 120; io.observe(e); });
})();
