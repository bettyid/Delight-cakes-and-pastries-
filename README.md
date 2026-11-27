# Delight Cakes & Pastries

Static site (no build step): `index.html`, `style.css`, `main.js`, `assets/`, `fonts/`.

## Where to edit
- **Cakes, prices, photos:** `index.html`, section `#cakes` (`data-name`, `data-price`, text, `assets/cakes/`). The booking form's cake list is built from these cards automatically.
- **WhatsApp number / business name:** top of `main.js` (`WHATSAPP`, `BRAND`), plus the footer and floating button links in `index.html`.
- **Gallery ("Our Creations"):** add photos to `assets/gallery/` and list them in `GALLERY` in `main.js`. Until then, placeholder tiles show.
- **Testimonials:** add real reviews to `TESTIMONIALS` in `main.js`. Until then, a "share your feedback" card shows.
- **FAQ answers:** `index.html`, section `#faq`. Replace with your real policies (lead time, delivery, payment).
- **Instagram link:** add it in the footer (`footer__contact`) when available.
- **Colours and fonts:** `:root` at the top of `style.css`.

## Notes
- Orders open WhatsApp with the request pre-written. Nothing is stored on a server and no account is needed.
- Reference photos chosen in the form are previewed only; WhatsApp links cannot carry attachments, so customers send the photo in the chat.
