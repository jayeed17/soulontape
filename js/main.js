// ===== Supabase config (Project Settings → API). The anon key is safe to expose; RLS only allows inserts. =====
const SUPABASE_URL = "";      // e.g. "https://abcd1234.supabase.co"
const SUPABASE_ANON_KEY = ""; // publishable / anon key

// ===== Portfolio photos — swap the src values for real images in /assets =====
const PHOTOS = [
  ...Array.from({ length: 10 }, (_, i) => ({ src: `https://picsum.photos/seed/sot-w${i}/800/${[1000, 600, 1100, 800][i % 4]}`, cat: "wedding" })),
  ...Array.from({ length: 10 }, (_, i) => ({ src: `https://picsum.photos/seed/sot-p${i}/800/${[1100, 800, 1000, 600][i % 4]}`, cat: "portrait" })),
  ...Array.from({ length: 8 }, (_, i) => ({ src: `https://picsum.photos/seed/sot-m${i}/800/${[600, 1000, 800, 1100][i % 4]}`, cat: "music" })),
].sort(() => Math.random() - 0.5);

document.getElementById("yr").textContent = new Date().getFullYear();

// Nav
const nav = document.querySelector(".nav");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 40), { passive: true });
document.querySelector(".menu-btn").addEventListener("click", () => nav.classList.toggle("open"));
nav.querySelectorAll("nav a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));

// Rotating hero words
const words = [...document.querySelectorAll(".rotator span")];
let wi = 0;
words[0].classList.add("on");
setInterval(() => {
  words[wi].classList.replace("on", "off");
  const prev = words[wi];
  setTimeout(() => prev.classList.remove("off"), 700);
  wi = (wi + 1) % words.length;
  words[wi].classList.add("on");
}, 2600);

// Grid
const grid = document.getElementById("grid");
grid.innerHTML = PHOTOS.map((p) => `<figure class="reveal" data-cat="${p.cat}"><img src="${p.src}" alt="" loading="lazy" /></figure>`).join("");
document.querySelectorAll(".filters button").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelector(".filters .active").classList.remove("active");
    b.classList.add("active");
    grid.querySelectorAll("figure").forEach((f) => f.classList.toggle("hide", b.dataset.f !== "all" && f.dataset.cat !== b.dataset.f));
  })
);

// Reveal on scroll
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Lightbox
const lb = document.getElementById("lightbox");
grid.addEventListener("click", (e) => {
  const img = e.target.closest("figure")?.querySelector("img");
  if (!img) return;
  lb.querySelector("img").src = img.src;
  lb.classList.add("open");
});
lb.addEventListener("click", () => lb.classList.remove("open"));
addEventListener("keydown", (e) => e.key === "Escape" && lb.classList.remove("open"));

// Reel
const video = document.getElementById("reel");
const reel = video.parentElement;
document.getElementById("playBtn").addEventListener("click", () => {
  if (video.paused) {
    video.muted = false;
    video.play().then(() => reel.classList.add("playing")).catch(() => {
      document.querySelector(".reel-label").textContent = "REEL COMING SOON";
    });
  } else {
    video.pause();
    reel.classList.remove("playing");
  }
});

// Contact form → Supabase
const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");
let supabase = null;

async function getClient() {
  if (supabase || !SUPABASE_URL || !SUPABASE_ANON_KEY) return supabase;
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabase;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  if (d.company) return; // honeypot: bots fill hidden fields
  if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email) || !d.message.trim()) {
    return setStatus("Please add your name, a valid email, and a message.", "err");
  }
  const btn = form.querySelector("button");
  btn.disabled = true;
  setStatus("Sending…");

  const row = { name: d.name.trim(), email: d.email.trim(), kind: d.kind, event_date: d.date || null, message: d.message.trim() };
  try {
    const client = await getClient();
    if (!client) {
      // No Supabase yet: fall back to the visitor's email app
      location.href = `mailto:hello@soulontape.com?subject=${encodeURIComponent(`${row.kind} inquiry — ${row.name}`)}&body=${encodeURIComponent(`${row.message}\n\nDate: ${row.event_date || "TBD"}\nReply to: ${row.email}`)}`;
      setStatus("Opening your email app…", "ok");
    } else {
      const { error } = await client.from("contact_messages").insert(row);
      if (error) throw error;
      form.reset();
      setStatus("Got it — we'll be in touch soon.", "ok");
    }
  } catch (err) {
    console.error(err);
    setStatus("Something went wrong. Email hello@soulontape.com instead.", "err");
  } finally {
    btn.disabled = false;
  }
});

function setStatus(msg, cls = "") {
  status.textContent = msg;
  status.className = `form-status ${cls}`;
}
