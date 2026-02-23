const MOBILE_BREAKPOINT = 900;

// ===== Mobile menu =====
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");

let menuOpen = false;

function openMenu() {
  if (!burger || !mobileMenu) return;
  if (window.innerWidth > MOBILE_BREAKPOINT) return;

  menuOpen = true;
  burger.setAttribute("aria-expanded", "true");

  mobileMenu.hidden = false;
  requestAnimationFrame(() => mobileMenu.classList.add("is-open"));

  document.body.style.overflow = "hidden";
}

function closeMenu() {
  if (!burger || !mobileMenu) return;

  menuOpen = false;
  burger.setAttribute("aria-expanded", "false");

  mobileMenu.classList.remove("is-open");
  // po animacijos paslepiam
  setTimeout(() => {
    if (!menuOpen) mobileMenu.hidden = true;
  }, 200);

  document.body.style.overflow = "";
}

function toggleMenu() {
  if (!burger || !mobileMenu) return;
  if (menuOpen) closeMenu();
  else openMenu();
}

burger?.addEventListener("click", toggleMenu);

mobileMenu?.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => closeMenu());
});

// click outside closes (mobile)
document.addEventListener("click", (e) => {
  if (!menuOpen) return;
  if (!mobileMenu || !burger) return;

  const t = e.target;
  const clickedInside = mobileMenu.contains(t) || burger.contains(t);
  if (!clickedInside) closeMenu();
});

// ESC closes menu
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuOpen) closeMenu();
});

// resize: jei pereina į desktop, uždarom ir paslepiam
window.addEventListener("resize", () => {
  if (window.innerWidth > MOBILE_BREAKPOINT) closeMenu();
});

// ===== Lightbox (dialog) =====
const dialog = document.getElementById("lightbox");
const imgEl = document.getElementById("lightboxImg");
const btnClose = dialog?.querySelector(".lightbox__close");
const btnPrev = dialog?.querySelector(".lightbox__nav--prev");
const btnNext = dialog?.querySelector(".lightbox__nav--next");

const galleries = {
  stay: [
    "/gallery/apgyvendinimas/fattoria.webp",
    "/gallery/apgyvendinimas/renacchi.webp",
    "/gallery/apgyvendinimas/san_michele.webp",
  ],
  atvykimas: [
    "/gallery/atvykimas/piza_oro_uostas.png",
    "/gallery/atvykimas/florencija_oro_uostas.png",
  ],
};

let currentGallery = "stay";
let currentIndex = 0;
let touchStartX = null;

function showImage(galleryKey, index) {
  currentGallery = galleryKey;
  const arr = galleries[galleryKey] || [];
  if (!arr.length) return;

  currentIndex = (index + arr.length) % arr.length;
  const src = arr[currentIndex];

  imgEl.src = src;
  imgEl.alt = `${galleryKey} ${currentIndex + 1}`;

  const many = arr.length > 1;
  if (btnPrev) btnPrev.style.display = many ? "block" : "none";
  if (btnNext) btnNext.style.display = many ? "block" : "none";
}

function openDialog(galleryKey, index) {
  if (!dialog || !imgEl) return;
  showImage(galleryKey, index);
  dialog.showModal();
  document.body.style.overflow = "hidden";
}

function closeDialog() {
  if (!dialog) return;
  dialog.close();
  document.body.style.overflow = "";
}

function prev() {
  const arr = galleries[currentGallery] || [];
  if (!arr.length) return;
  showImage(currentGallery, currentIndex - 1);
}

function next() {
  const arr = galleries[currentGallery] || [];
  if (!arr.length) return;
  showImage(currentGallery, currentIndex + 1);
}

document.querySelectorAll(".js-open-gallery").forEach((btn) => {
  btn.addEventListener("click", () => {
    const g = btn.getAttribute("data-gallery") || "stay";
    const i = Number(btn.getAttribute("data-index") || "0");
    openDialog(g, i);
  });
});

btnClose?.addEventListener("click", closeDialog);
btnPrev?.addEventListener("click", prev);
btnNext?.addEventListener("click", next);

// click on backdrop closes
dialog?.addEventListener("click", (e) => {
  const rect = dialog.getBoundingClientRect();
  const inside =
    e.clientX >= rect.left && e.clientX <= rect.right &&
    e.clientY >= rect.top && e.clientY <= rect.bottom;

  if (!inside) closeDialog();
});

// keyboard arrows for lightbox
window.addEventListener("keydown", (e) => {
  if (!dialog || !dialog.open) return;
  if (e.key === "ArrowLeft") prev();
  if (e.key === "ArrowRight") next();
});

// swipe
imgEl?.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches?.[0]?.clientX ?? null;
}, { passive: true });

imgEl?.addEventListener("touchend", (e) => {
  if (touchStartX == null) return;
  const endX = e.changedTouches?.[0]?.clientX ?? touchStartX;
  const dx = endX - touchStartX;
  touchStartX = null;

  if (Math.abs(dx) < 40) return;
  if (dx > 0) prev(); else next();
}, { passive: true });
