// ===== Supabase config (Project Settings → API). The anon key is safe to expose; RLS only allows inserts. =====
const SUPABASE_URL = "";      // e.g. "https://abcd1234.supabase.co"
const SUPABASE_ANON_KEY = ""; // publishable / anon key
const CONTACT_EMAIL = "hello@soulontape.com";

// ===== Projects — replace with real shoots. Put images in /assets/work/<slug>/ and list them here. =====
// type: wedding | portrait | music. First photo is the cover. featured: shows in the "Greatest hits" strip.
const ph = (seed, n, sizes = ["900/1125", "1200/800", "900/1200", "1000/1000"]) =>
  Array.from({ length: n }, (_, i) => `https://picsum.photos/seed/sot-${seed}-${i}/${sizes[i % sizes.length]}`);
const PROJECTS = [
  { title: "Golden Hour Vows", type: "wedding", place: "Brooklyn, NY", year: 2026, featured: true, photos: ph("gold", 6) },
  { title: "Studio Sessions", type: "music", place: "Manhattan, NY", year: 2026, featured: true, photos: ph("studio", 5) },
  { title: "Faces of Queens", type: "portrait", place: "Queens, NY", year: 2026, featured: true, photos: ph("queens", 5) },
  { title: "Rooftop Reception", type: "wedding", place: "Long Island City", year: 2025, featured: true, photos: ph("roof", 5) },
  { title: "Late Night Set", type: "music", place: "Bushwick, NY", year: 2025, featured: true, photos: ph("set", 4) },
  { title: "Graduation Light", type: "portrait", place: "Central Park", year: 2025, featured: true, photos: ph("grad", 4) },
  { title: "Courthouse & Coffee", type: "wedding", place: "Lower Manhattan", year: 2025, photos: ph("court", 4) },
  { title: "Self-Titled", type: "music", place: "Jersey City, NJ", year: 2024, photos: ph("self", 5) },
];
const LABEL = { wedding: "Wedding", portrait: "Portrait", music: "Music" };

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad = (n, l = 2) => String(n).padStart(l, "0");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

$("#yr").textContent = new Date().getFullYear();

// ---------- Preloader (tape counter) ----------
(function loader() {
  let seen = false;
  try { seen = sessionStorage.getItem("sot-seen") === "1"; sessionStorage.setItem("sot-seen", "1"); } catch {}
  const duration = reduceMotion ? 0 : seen ? 500 : 1600;
  const count = $("#count"), bar = $("#bar");
  let loaded = document.readyState === "complete";
  addEventListener("load", () => (loaded = true), { once: true });
  const start = performance.now();
  const hardStop = start + 4000; // never block the site longer than 4s
  (function step(now) {
    const p = Math.min(1, duration ? (now - start) / duration : 1);
    const shown = loaded || now > hardStop ? p : Math.min(p, 0.9);
    count.textContent = pad(Math.round(shown * 100), 3);
    bar.style.width = `${shown * 100}%`;
    if (shown >= 1) return document.body.classList.remove("loading");
    requestAnimationFrame(step);
  })(start);
})();

// ---------- Nav ----------
const nav = $(".nav"), menuBtn = $(".menu-btn");
const onScroll = () => nav.classList.toggle("scrolled", scrollY > 40);
addEventListener("scroll", onScroll, { passive: true }); onScroll();
const setMenu = (open) => {
  nav.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", open);
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};
menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
$$("#menu a, .book, .logo").forEach((a) => a.addEventListener("click", () => setMenu(false)));

// ---------- Hero ----------
const words = $$(".rotator span");
let wi = 0;
words[0].classList.add("on");
if (!reduceMotion) setInterval(() => {
  const prev = words[wi];
  prev.classList.replace("on", "off");
  setTimeout(() => prev.classList.remove("off"), 700);
  wi = (wi + 1) % words.length;
  words[wi].classList.add("on");
}, 2600);
const t0 = Date.now(), clock = $("#clock");
setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); clock.textContent = `${pad(s / 3600 | 0)}:${pad((s / 60 | 0) % 60)}:${pad(s % 60)}`; }, 1000);

// ---------- Selected work (horizontal scroll) ----------
const track = $("#workTrack"), workSec = $("#work");
track.innerHTML = PROJECTS.map((p, i) => ({ p, i })).filter(({ p }) => p.featured).map(({ p, i }, k) => `
  <button class="card" data-i="${i}" data-cursor="view">
    <div class="ph" data-n="${pad(k + 1)}"><img src="${esc(p.photos[0])}" alt="${esc(p.title)}" loading="lazy" /></div>
    <h3>${esc(p.title)}</h3><p>${LABEL[p.type]} · ${esc(p.place)}</p>
  </button>`).join("") + `<a class="card more" href="#tracklist" data-cursor="open">All projects &rarr;</a>`;

const desktopScroll = matchMedia("(min-width: 961px) and (hover: hover)");
let travel = 0;
function sizeWork() {
  if (!desktopScroll.matches) { workSec.style.height = ""; track.style.transform = ""; return; }
  travel = Math.max(0, track.scrollWidth - innerWidth);
  workSec.style.height = `${innerHeight + travel}px`;
  moveWork();
}
function moveWork() {
  if (!desktopScroll.matches) return;
  const p = Math.min(1, Math.max(0, -workSec.getBoundingClientRect().top / (workSec.offsetHeight - innerHeight || 1)));
  track.style.transform = `translate3d(${-p * travel}px,0,0)`;
}
addEventListener("scroll", moveWork, { passive: true });
addEventListener("resize", sizeWork);
desktopScroll.addEventListener?.("change", sizeWork);
track.querySelectorAll("img").forEach((img) => img.addEventListener("load", sizeWork, { once: true }));
sizeWork();

// ---------- Tracklist ----------
const tracks = $("#tracks");
tracks.innerHTML = PROJECTS.map((p, i) => `
  <li class="track reveal" data-cat="${p.type}">
    <button data-i="${i}" data-cursor="open">
      <span class="no">${pad(i + 1)}</span>
      <span class="t">${esc(p.title)}</span>
      <span class="meta">${LABEL[p.type]} — ${esc(p.place)} — ${p.year}</span>
      <span class="len">${pad(p.photos.length)} frames</span>
    </button>
  </li>`).join("");
$$(".filters button").forEach((b) => {
  const f = b.dataset.f;
  const n = f === "all" ? PROJECTS.length : PROJECTS.filter((p) => p.type === f).length;
  b.insertAdjacentHTML("beforeend", `<span>${n}</span>`);
  b.addEventListener("click", () => {
    $$(".filters button").forEach((x) => { x.classList.toggle("active", x === b); x.setAttribute("aria-selected", x === b); });
    $$(".track").forEach((t) => t.classList.toggle("hide", f !== "all" && t.dataset.cat !== f));
  });
});
// hover preview that follows the cursor
const preview = $(".preview"), pImg = $("img", preview);
let px = 0, py = 0, tx = 0, ty = 0;
tracks.addEventListener("pointerover", (e) => {
  const b = e.target.closest(".track button");
  if (!b || e.pointerType !== "mouse") return;
  pImg.src = PROJECTS[b.dataset.i].photos[0];
  preview.classList.add("on");
});
tracks.addEventListener("pointerleave", () => preview.classList.remove("on"));

// ---------- Project viewer ----------
const viewer = $("#viewer"), vImg = $("#vImg"), vThumbs = $("#vThumbs");
let cur = null, idx = 0, lastFocus = null;
function openProject(i, start = 0) {
  cur = PROJECTS[i]; idx = start; lastFocus = document.activeElement;
  $("#vTitle").textContent = cur.title;
  vThumbs.innerHTML = cur.photos.map((src, k) => `<button data-k="${k}" aria-label="Photo ${k + 1}"><img src="${esc(src)}" alt="" loading="lazy" /></button>`).join("");
  viewer.hidden = false;
  requestAnimationFrame(() => viewer.classList.add("open"));
  document.body.style.overflow = "hidden";
  show(idx);
  $("#vClose").focus();
}
function show(k) {
  if (!cur) return;
  idx = (k + cur.photos.length) % cur.photos.length;
  vImg.classList.add("fade");
  const src = cur.photos[idx];
  const swap = () => { vImg.src = src; vImg.alt = `${cur.title} — photo ${idx + 1}`; vImg.classList.remove("fade"); };
  reduceMotion ? swap() : setTimeout(swap, 120);
  $("#vCount").textContent = `${pad(idx + 1)} / ${pad(cur.photos.length)}`;
  $$("button", vThumbs).forEach((b, j) => b.classList.toggle("on", j === idx));
  new Image().src = cur.photos[(idx + 1) % cur.photos.length]; // preload next
}
function closeViewer() {
  if (viewer.hidden) return;
  viewer.classList.remove("open");
  document.body.style.overflow = "";
  setTimeout(() => { viewer.hidden = true; cur = null; }, reduceMotion ? 0 : 300);
  lastFocus?.focus?.({ preventScroll: true });
}
document.addEventListener("click", (e) => {
  const b = e.target.closest(".card[data-i], .track button");
  if (b) openProject(+b.dataset.i);
});
$("#vClose").addEventListener("click", closeViewer);
$("#vPrev").addEventListener("click", () => show(idx - 1));
$("#vNext").addEventListener("click", () => show(idx + 1));
vThumbs.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) show(+b.dataset.k); });
$(".viewer-stage").addEventListener("click", (e) => { if (e.target === e.currentTarget) closeViewer(); });
addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeViewer(); setMenu(false); }
  if (viewer.hidden) return;
  if (e.key === "ArrowRight") show(idx + 1);
  if (e.key === "ArrowLeft") show(idx - 1);
  if (e.key === "Tab") { // keep focus inside the dialog
    const f = $$("button", viewer).filter((b) => b.offsetParent);
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
  }
});
let sx = null;
viewer.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
viewer.addEventListener("touchend", (e) => {
  if (sx === null) return;
  const dx = e.changedTouches[0].clientX - sx; sx = null;
  if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
});

// ---------- Reel ----------
const video = $("#reel"), reelWrap = $("#reelWrap"), playBtn = $("#playBtn");
const markMissing = () => { reelWrap.classList.add("missing"); reelWrap.removeAttribute("data-cursor"); };
$("source", video).addEventListener("error", markMissing);
video.addEventListener("error", markMissing);
if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) markMissing();
function toggleReel() {
  if (reelWrap.classList.contains("missing")) return;
  if (video.paused) {
    video.play().then(() => reelWrap.classList.add("playing")).catch(markMissing);
  } else { video.pause(); reelWrap.classList.remove("playing"); }
}
reelWrap.addEventListener("click", (e) => { if (e.target !== playBtn && !playBtn.contains(e.target)) toggleReel(); });
playBtn.addEventListener("click", toggleReel);
video.addEventListener("timeupdate", () => { const s = video.currentTime | 0; $("#reelTime").textContent = `${pad(s / 60 | 0)}:${pad(s % 60)}`; });

// ---------- Reveal on scroll ----------
$$(".section-head, .work-head, .about-img, .about-copy, .quotes figure, .contact-copy, #contactForm, .reel").forEach((el) => el.classList.add("reveal"));
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
$$(".reveal").forEach((el) => io.observe(el));

// ---------- Custom cursor + preview follow (desktop only) ----------
const cursor = $(".cursor"), cLabel = $("span", cursor);
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
if (fine) {
  let cx = innerWidth / 2, cy = innerHeight / 2, mx = cx, my = cy;
  addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  document.addEventListener("pointerover", (e) => {
    const t = e.target.closest("[data-cursor]");
    cursor.classList.toggle("big", !!t);
    cLabel.textContent = t ? t.dataset.cursor.toUpperCase() : "";
  });
  (function loop() {
    cx += (mx - cx) * 0.25; cy += (my - cy) * 0.25;
    cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    tx += (mx - tx) * 0.12; ty += (my - ty) * 0.12;
    preview.style.left = `${tx}px`; preview.style.top = `${ty}px`;
    requestAnimationFrame(loop);
  })();
}

// ---------- Contact form → Supabase ----------
const form = $("#contactForm"), status = $("#formStatus");
let supabase = null;
async function getClient() {
  if (supabase || !SUPABASE_URL || !SUPABASE_ANON_KEY) return supabase;
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabase;
}
const setStatus = (msg, cls = "") => { status.textContent = msg; status.className = `form-status ${cls}`; };
form.addEventListener("input", (e) => e.target.classList.remove("bad"));
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  if (d.company) return; // honeypot
  const bad = [];
  if (!d.name.trim()) bad.push("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) bad.push("email");
  if (!d.message.trim()) bad.push("message");
  $$("input, textarea", form).forEach((el) => el.classList.toggle("bad", bad.includes(el.name)));
  if (bad.length) { form.elements[bad[0]].focus(); return setStatus("Please add your name, a valid email, and a message.", "err"); }

  const btn = $("button[type=submit]", form);
  btn.disabled = true;
  setStatus("Sending…");
  const row = { name: d.name.trim(), email: d.email.trim(), kind: d.kind || "Other", event_date: d.date || null, message: d.message.trim() };
  try {
    const client = await getClient();
    if (!client) {
      location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`${row.kind} inquiry — ${row.name}`)}&body=${encodeURIComponent(`${row.message}\n\nDate: ${row.event_date || "TBD"}\nReply to: ${row.email}`)}`;
      setStatus("Opening your email app…", "ok");
    } else {
      const { error } = await client.from("contact_messages").insert(row);
      if (error) throw error;
      form.reset();
      setStatus("Got it, you're on tape. I'll be in touch soon.", "ok");
    }
  } catch (err) {
    console.warn(err);
    setStatus(`Something went wrong. Email ${CONTACT_EMAIL} instead.`, "err");
  } finally {
    btn.disabled = false;
  }
});
