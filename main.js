(function () {
  'use strict';

  // ================= EDIT HERE =================
  var WHATSAPP = "2347085372814";            // WhatsApp number: country code first, no + or spaces
  var BRAND = "Delight Cakes & Pastries";
  // Gallery photos: put files in assets/gallery/ and list them, e.g.
  //   { src: "assets/gallery/birthday-cake.webp", alt: "A pink birthday cake with gold sprinkles" }
  var GALLERY = [];
  // Real customer reviews only, e.g.
  //   { quote: "The cake was beautiful and delicious.", name: "Amaka O.", photo: "assets/reviews/amaka.webp" }   (photo optional)
  var TESTIMONIALS = [];
  // =============================================

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function waUrl(text) { return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(text); }

  // ---------- Hero video: respect reduced motion ----------
  var video = $('.hero__media video');
  if (video && reduce) { video.removeAttribute('autoplay'); video.pause(); }

  // ---------- Toast ----------
  var toast = $('#toast'), toastTimer;
  function showToast(msg) {
    toast.textContent = msg; toast.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 2600);
  }

  // ---------- Navigation ----------
  var nav = $('#nav'), menuBtn = $('#menu-btn'), menu = $('#menu');
  function onScroll() { nav.classList.toggle('is-stuck', window.scrollY > 30); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    menu.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
  document.addEventListener('click', function (e) { if (!menu.hidden && !nav.contains(e.target)) setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 900) setMenu(false); });

  // ---------- Reveal on scroll ----------
  var reveals = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduce) {
    reveals.forEach(function (n) { n.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target; setTimeout(function () { t.classList.add('is-in'); }, +t.dataset.d || 0); io.unobserve(t);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
    reveals.forEach(function (n, i) { n.dataset.d = (i % 4) * 90; io.observe(n); });
  }

  // ---------- Form basics ----------
  var form = $('#book');
  var f = {
    name: $('#f-name'), phone: $('#f-phone'), cake: $('#f-cake'), size: $('#f-size'), qty: $('#f-qty'),
    flavour: $('#f-flavour'), date: $('#f-date'), loc: $('#f-loc'), notes: $('#f-notes'), img: $('#f-img')
  };
  var locWrap = $('#loc-wrap');
  var CUSTOM = "Custom cake";

  // Cake dropdown is built from the cards so names and prices live in one place (the HTML)
  var cards = $$('.card');
  var ph = document.createElement('option'); ph.value = ''; ph.textContent = 'Choose a cake'; f.cake.appendChild(ph);
  cards.forEach(function (c) {
    var o = document.createElement('option'); o.value = c.dataset.name;
    o.textContent = c.dataset.name + ' (' + c.dataset.price + ')'; f.cake.appendChild(o);
  });
  var oc = document.createElement('option'); oc.value = CUSTOM; oc.textContent = 'Custom cake (we will quote you)'; f.cake.appendChild(oc);
  function priceOf(name) {
    for (var i = 0; i < cards.length; i++) if (cards[i].dataset.name === name) return cards[i].dataset.price;
    return name === CUSTOM ? 'price on request' : '';
  }

  // date: today or later
  var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  var todayStr = today.toISOString().slice(0, 10); f.date.min = todayStr;

  // quantity stepper
  function clampQty(v) { v = parseInt(v, 10); if (isNaN(v)) v = 1; return Math.min(99, Math.max(1, v)); }
  $('#qty-minus').addEventListener('click', function () { f.qty.value = clampQty((parseInt(f.qty.value, 10) || 1) - 1); clearErr('qty'); });
  $('#qty-plus').addEventListener('click', function () { f.qty.value = clampQty((parseInt(f.qty.value, 10) || 0) + 1); clearErr('qty'); });

  // delivery / pickup
  function fulfil() { var r = $('input[name="fulfil"]:checked', form); return r ? r.value : ''; }
  $$('input[name="fulfil"]', form).forEach(function (r) {
    r.addEventListener('change', function () {
      var d = fulfil() === 'Delivery'; locWrap.hidden = !d; clearErr('fulfil');
      if (!d) { f.loc.value = ''; clearErr('loc'); }
    });
  });

  // reference photo (preview only: WhatsApp links cannot carry attachments)
  var prev = $('#prev'), prevImg = $('#prev-img'), prevUrl = null;
  function resetImg() { if (prevUrl) URL.revokeObjectURL(prevUrl); prevUrl = null; prev.hidden = true; prevImg.removeAttribute('src'); f.img.value = ''; clearErr('img'); }
  f.img.addEventListener('change', function () {
    var file = f.img.files && f.img.files[0]; clearErr('img');
    if (!file) { resetImg(); return; }
    if (!/^image\//.test(file.type)) { resetImg(); setErr('img', 'Please choose an image file (a photo or screenshot).', f.img); return; }
    if (file.size > 8 * 1024 * 1024) { resetImg(); setErr('img', 'That photo is too large. Please choose one under 8 MB.', f.img); return; }
    if (prevUrl) URL.revokeObjectURL(prevUrl);
    prevUrl = URL.createObjectURL(file); prevImg.src = prevUrl; prev.hidden = false;
  });
  $('#prev-x').addEventListener('click', resetImg);

  // ---------- Validation ----------
  function setErr(key, msg, input) {
    var p = $('#e-' + key); if (!p) return; p.textContent = msg; p.hidden = false;
    if (input) input.setAttribute('aria-invalid', 'true');
  }
  function clearErr(key) {
    var p = $('#e-' + key); if (p) { p.hidden = true; p.textContent = ''; }
    var map = { name: f.name, phone: f.phone, cake: f.cake, qty: f.qty, date: f.date, loc: f.loc, img: f.img };
    if (map[key]) map[key].removeAttribute('aria-invalid');
  }
  ['name', 'phone', 'cake', 'date', 'loc'].forEach(function (k) {
    var n = f[k]; n.addEventListener('input', function () { clearErr(k); }); n.addEventListener('change', function () { clearErr(k); });
  });
  f.qty.addEventListener('input', function () { clearErr('qty'); });

  function validate() {
    var firstBad = null;
    function bad(key, msg, input) { setErr(key, msg, input); if (!firstBad) firstBad = input; }
    ['name', 'phone', 'cake', 'qty', 'date', 'fulfil', 'loc'].forEach(clearErr);

    var name = f.name.value.trim();
    if (name.length < 2) bad('name', 'Please enter your name.', f.name);

    var phone = f.phone.value.trim(), digits = phone.replace(/[\s\-().+]/g, '');
    if (!phone) bad('phone', 'Please enter your phone number so we can reach you.', f.phone);
    else if (!/^\d{7,15}$/.test(digits)) bad('phone', 'That number doesn\u2019t look right. Use digits only, e.g. 0801 234 5678.', f.phone);

    if (!f.cake.value) bad('cake', 'Please choose a cake.', f.cake);

    var q = parseInt(f.qty.value, 10);
    if (isNaN(q) || q < 1 || q > 99) bad('qty', 'Enter a quantity from 1 to 99.', f.qty);

    if (!f.date.value) bad('date', 'Please pick the date you need your cake.', f.date);
    else if (f.date.value < todayStr) bad('date', 'That date has passed. Please choose today or later.', f.date);

    if (!fulfil()) bad('fulfil', 'Please choose delivery or pickup.', $('#f-pickup'));
    else if (fulfil() === 'Delivery' && f.loc.value.trim().length < 3) bad('loc', 'Please tell us where to deliver.', f.loc);

    if (f.img.getAttribute('aria-invalid') === 'true') { if (!firstBad) firstBad = f.img; }
    return firstBad;
  }

  // ---------- Order data, summary and WhatsApp message ----------
  function pretty(dateStr) {
    try { return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { return dateStr; }
  }
  var NS = 'Not specified';
  function collect() {
    var file = f.img.files && f.img.files[0];
    return {
      name: f.name.value.trim(), phone: f.phone.value.trim(), cake: f.cake.value, price: priceOf(f.cake.value),
      size: f.size.value.trim() || NS, qty: String(clampQty(f.qty.value)), flavour: f.flavour.value.trim() || NS,
      date: pretty(f.date.value), fulfil: fulfil(), loc: fulfil() === 'Delivery' ? f.loc.value.trim() : '',
      notes: f.notes.value.trim() || 'None', image: file ? file.name : ''
    };
  }
  function buildMessage(o) {
    var L = [];
    L.push('Hello ' + BRAND + '! I would like to request an order.');
    L.push('');
    L.push('*Name:* ' + o.name);
    L.push('*Phone:* ' + o.phone);
    L.push('*Cake:* ' + o.cake + (o.price ? ' (' + o.price + ')' : ''));
    L.push('*Size:* ' + o.size);
    L.push('*Quantity:* ' + o.qty);
    L.push('*Flavour:* ' + o.flavour);
    L.push('*Date needed:* ' + o.date);
    L.push('*Delivery or pickup:* ' + o.fulfil);
    if (o.fulfil === 'Delivery') L.push('*Delivery location:* ' + o.loc);
    L.push('*Notes:* ' + o.notes);
    if (o.image) L.push('*Reference photo:* I will send it in this chat.');
    L.push('');
    L.push('Please confirm availability and the final price. Thank you!');
    return L.join('\n');
  }

  var dlg = $('#summary'), sumList = $('#sum-list'), sumReview = $('#sum-review'), sumSent = $('#sum-sent'), sumLink = $('#sum-link');
  var currentUrl = '', lastFocus = null;
  function openDialog() {
    lastFocus = document.activeElement;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  function closeDialog() { if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open'); }
  dlg.addEventListener('close', function () { if (lastFocus && lastFocus.focus) lastFocus.focus(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDialog(); });

  function row(label, value) {
    var d = el('div', 'sum-row'); d.appendChild(el('dt', null, label)); d.appendChild(el('dd', null, value)); return d;
  }
  function showSummary(o) {
    sumList.textContent = '';
    sumList.appendChild(row('Name', o.name));
    sumList.appendChild(row('Phone', o.phone));
    sumList.appendChild(row('Cake', o.cake + (o.price ? ' (' + o.price + ')' : '')));
    sumList.appendChild(row('Size', o.size));
    sumList.appendChild(row('Quantity', o.qty));
    sumList.appendChild(row('Flavour', o.flavour));
    sumList.appendChild(row('Date needed', o.date));
    sumList.appendChild(row('Delivery or pickup', o.fulfil));
    if (o.fulfil === 'Delivery') sumList.appendChild(row('Delivery location', o.loc));
    sumList.appendChild(row('Notes', o.notes));
    if (o.image) sumList.appendChild(row('Reference photo', o.image + ' (you will send it in the WhatsApp chat)'));
    currentUrl = waUrl(buildMessage(o)); sumLink.href = currentUrl;
    sumReview.hidden = false; sumSent.hidden = true; openDialog();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = validate();
    if (bad) { bad.focus(); if (bad.scrollIntoView) bad.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); return; }
    showSummary(collect());
  });
  $('#sum-edit').addEventListener('click', closeDialog);
  $('#sum-done').addEventListener('click', closeDialog);
  $('#sum-send').addEventListener('click', function () {
    window.open(currentUrl, '_blank', 'noopener');
    sumReview.hidden = true; sumSent.hidden = false;
  });

  // ---------- Card "Order" buttons and custom cake ----------
  function pickCake(name, message) {
    f.cake.value = name; clearErr('cake');
    cards.forEach(function (c) { c.classList.toggle('is-picked', c.dataset.name === name); });
    var wrap = f.cake.parentNode; wrap.classList.remove('pulse'); void wrap.offsetWidth; wrap.classList.add('pulse');
    form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    showToast(message);
    setTimeout(function () { var target = !f.name.value.trim() ? f.name : f.phone.value.trim() ? f.date : f.phone; target.focus({ preventScroll: true }); }, reduce ? 0 : 700);
  }
  $$('.js-order').forEach(function (b) {
    b.addEventListener('click', function () {
      var c = b.closest('.card'); var label = b.textContent;
      b.textContent = 'Added \u2713'; setTimeout(function () { b.textContent = label; }, 1600);
      pickCake(c.dataset.name, c.dataset.name + ' added to your booking form');
    });
  });
  var customBtn = $('.js-custom');
  if (customBtn) customBtn.addEventListener('click', function () { pickCake(CUSTOM, 'Tell us about your custom cake below'); });

  // ---------- Gallery ----------
  var gallery = $('#gallery');
  if (GALLERY.length) {
    GALLERY.forEach(function (g) {
      var fig = el('figure'); var img = document.createElement('img');
      img.src = g.src; img.alt = g.alt || 'A cake made by Delight'; img.loading = 'lazy'; img.decoding = 'async';
      fig.appendChild(img); gallery.appendChild(fig);
    });
  } else {
    $('#creations-lead').textContent = 'Photos from our kitchen are coming soon.';
    for (var i = 0; i < 6; i++) {
      var t = el('div', 'ph'); t.setAttribute('role', 'img'); t.setAttribute('aria-label', 'Cake photo coming soon');
      t.innerHTML = '<svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true"><path d="M10 24h28l-4 17a3 3 0 0 1-3 2H17a3 3 0 0 1-3-2z" fill="currentColor"/><path d="M12 24c-3 0-4-5 0-6 0-5 5-8 9-6 2-4 9-4 11 0 5-1 8 5 4 8-1 3-3 4-4 4z" fill="currentColor"/></svg><span>Photo coming soon</span>';
      gallery.appendChild(t);
    }
  }

  // ---------- Testimonials ----------
  var quotes = $('#quotes');
  if (TESTIMONIALS.length) {
    TESTIMONIALS.forEach(function (q) {
      var bq = el('blockquote', 'quote'); bq.appendChild(el('p', null, '\u201C' + q.quote + '\u201D'));
      var ft = el('footer'); if (q.photo) { var im = document.createElement('img'); im.src = q.photo; im.alt = q.name; im.loading = 'lazy'; ft.appendChild(im); }
      ft.appendChild(el('span', null, q.name)); bq.appendChild(ft); quotes.appendChild(bq);
    });
  } else {
    var box = el('div', 'quotes__empty');
    box.appendChild(el('h3', null, 'Ordered from Delight?'));
    box.appendChild(el('p', null, 'We would love to hear how your cake turned out. Customer reviews will appear here.'));
    var share = el('a', 'btn btn--dark', 'Share your feedback');
    share.href = waUrl('Hello ' + BRAND + '! I would like to share feedback about my order: '); share.target = '_blank'; share.rel = 'noopener';
    box.appendChild(share); quotes.appendChild(box);
  }
})();
