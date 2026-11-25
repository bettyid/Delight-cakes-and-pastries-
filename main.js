(function () {
  // ===== EDIT HERE =====
  var WHATSAPP = "2347085372814";          // WhatsApp number, country code first, no + or spaces
  var BRAND = "Delight Cakes & Pastries";
  // =====================

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var video = document.querySelector('.hero__media video');
  if (video && reduce) { video.removeAttribute('autoplay'); video.pause(); }

  function openWhatsApp(text) {
    var url = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(text);
    window.open(url, "_blank", "noopener");
  }

  // Fill the cake dropdown from the cards, so prices live in one place (the HTML)
  var cakes = Array.prototype.slice.call(document.querySelectorAll('.cake'));
  var select = document.getElementById('f-cake');
  cakes.forEach(function (c) {
    var o = document.createElement('option');
    o.value = c.dataset.name;
    o.textContent = c.dataset.name + " (" + c.querySelector('.price').textContent.trim() + ")";
    select.appendChild(o);
  });
  var custom = document.querySelector('.custom');
  var oc = document.createElement('option'); oc.value = custom.dataset.name; oc.textContent = "Custom cake (we will quote you)"; select.appendChild(oc);

  // "Order" button on each cake opens WhatsApp straight away
  cakes.forEach(function (c) {
    c.querySelector('.order-btn').addEventListener('click', function () {
      var msg = "Hello " + BRAND + "! I would like to order the " + c.dataset.name +
                " (" + c.querySelector('.price').textContent.trim() + "). Is it available?";
      openWhatsApp(msg);
    });
  });

  custom.querySelector('.order-btn').addEventListener('click', function () {
    openWhatsApp("Hello " + BRAND + "! I would like a custom cake. Please tell me what you need from me for a quote.");
  });

  // Booking form builds the WhatsApp message
  var form = document.getElementById('book');
  var err = document.getElementById('f-error');
  var date = document.getElementById('f-date');
  var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  date.min = today.toISOString().slice(0, 10);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('f-name').value.trim();
    var cake = select.value;
    var when = date.value;
    var notes = document.getElementById('f-notes').value.trim();
    if (!name || !cake || !when) {
      err.hidden = false;
      err.textContent = "Please add your name, choose a cake and pick the date you need it.";
      return;
    }
    err.hidden = true;
    var pretty = new Date(when + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    var msg = "Hello " + BRAND + "! My name is " + name + ".\n" +
              "I would like to order: " + cake + ".\n" +
              "Date needed: " + pretty + "." +
              (notes ? "\nNotes: " + notes : "") +
              "\nPlease confirm the price and delivery. Thank you!";
    openWhatsApp(msg);
  });

  // gentle reveal on scroll
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduce) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { var t = en.target; setTimeout(function () { t.classList.add('is-in'); }, +t.dataset.d || 0); io.unobserve(t); }
    });
  }, { threshold: 0.15 });
  els.forEach(function (e, i) { e.dataset.d = (i % 4) * 110; io.observe(e); });
})();
