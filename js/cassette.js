// 3D cassette tape hero — procedural, no model files needed.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const canvas = document.getElementById("tape");
const hero = document.querySelector(".hero");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0, 22);

// ---------- Lights ----------
scene.add(new THREE.AmbientLight(0xfff1e0, 0.35));
const key = new THREE.DirectionalLight(0xffe2c4, 2.2);
key.position.set(-6, 8, 10);
scene.add(key);
const rim = new THREE.PointLight(0xd0643a, 60, 40);
rim.position.set(7, -3, -4);
scene.add(rim);
const fill = new THREE.PointLight(0x7fa0c8, 18, 40);
fill.position.set(-8, -5, 6);
scene.add(fill);

// ---------- Cassette ----------
const tape = new THREE.Group();
const root = new THREE.Group(); // positioning wrapper
root.add(tape);
scene.add(root);

const W = 10, H = 6.4, D = 1.1, FZ = D / 2;

const shell = new THREE.Mesh(
  new RoundedBoxGeometry(W, H, D, 6, 0.32),
  new THREE.MeshPhysicalMaterial({ color: 0x1b1917, roughness: 0.38, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.25 })
);
tape.add(shell);

// Label texture (with a transparent window cut out)
function makeLabel() {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = "#efe7da";
  roundRect(g, 0, 0, 1024, 512, 28); g.fill();

  // color bands
  g.fillStyle = "#d0643a"; g.fillRect(0, 380, 1024, 46);
  g.fillStyle = "#e9a15a"; g.fillRect(0, 426, 1024, 22);
  g.fillStyle = "#3c2a22"; g.fillRect(0, 448, 1024, 10);

  // text
  g.fillStyle = "#1b1917";
  g.font = "italic 64px 'Instrument Serif', Georgia, serif";
  g.fillText("soul on tape", 60, 100);
  g.font = "22px 'Space Mono', monospace";
  g.fillText("SIDE A", 860, 92);
  g.fillText("C-90  ·  PHOTO / FILM", 60, 362);
  g.fillText("NR ●", 900, 362);

  // writing lines
  g.strokeStyle = "rgba(27,25,23,.35)"; g.lineWidth = 2;
  for (const y of [126]) { g.beginPath(); g.moveTo(60, y); g.lineTo(964, y); g.stroke(); }

  // cut the window
  g.globalCompositeOperation = "destination-out";
  roundRect(g, 167, 149, 690, 190, 95); g.fill();
  g.globalCompositeOperation = "source-over";
  g.strokeStyle = "rgba(27,25,23,.6)"; g.lineWidth = 4;
  roundRect(g, 167, 149, 690, 190, 95); g.stroke();

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}
function roundRect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

const labelMat = new THREE.MeshStandardMaterial({ map: makeLabel(), transparent: true, alphaTest: 0.5, roughness: 0.75 });
const label = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 4.3), labelMat);
label.position.set(0, 0.6, FZ + 0.05);
tape.add(label);
// redraw once fonts load so the label uses the real typefaces
document.fonts?.ready.then(() => { labelMat.map = makeLabel(); labelMat.needsUpdate = true; });

// Smoky window backing
const backing = new THREE.Mesh(
  new THREE.PlaneGeometry(6, 1.8),
  new THREE.MeshPhysicalMaterial({ color: 0x0b0a09, roughness: 0.15, metalness: 0.2, clearcoat: 1 })
);
backing.position.set(0, 0.7, FZ + 0.002);
tape.add(backing);

// Reels
const tapeMat = new THREE.MeshStandardMaterial({ color: 0x3a2619, roughness: 0.45, metalness: 0.3 });
const hubMat = new THREE.MeshStandardMaterial({ color: 0xf2ece2, roughness: 0.4 });
const holeMat = new THREE.MeshStandardMaterial({ color: 0x0d0c0b, roughness: 0.6 });

function makeReel(spoolR) {
  const reel = new THREE.Group();
  const spool = new THREE.Mesh(new THREE.CylinderGeometry(spoolR, spoolR, 0.02, 64), tapeMat);
  spool.rotation.x = Math.PI / 2;
  reel.add(spool);

  const hub = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.03, 48), hubMat);
  ring.rotation.x = Math.PI / 2; ring.position.z = 0.008;
  const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.032, 48), holeMat);
  hole.rotation.x = Math.PI / 2; hole.position.z = 0.01;
  hub.add(ring, hole);
  for (let i = 0; i < 6; i++) {
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.034), hubMat);
    const a = (i / 6) * Math.PI * 2;
    tooth.position.set(Math.cos(a) * 0.25, Math.sin(a) * 0.25, 0.011);
    tooth.rotation.z = a + Math.PI / 2;
    hub.add(tooth);
  }
  reel.add(hub);
  reel.userData.hub = hub;
  reel.position.z = FZ + 0.006;
  return reel;
}
const reelL = makeReel(1.35); reelL.position.set(-2.05, 0.7, reelL.position.z);
const reelR = makeReel(0.85); reelR.position.set(2.05, 0.7, reelR.position.z);
tape.add(reelL, reelR);

// Bottom trapezoid plate with holes
const plateShape = new THREE.Shape();
plateShape.moveTo(-2.9, -1.95); plateShape.lineTo(2.9, -1.95);
plateShape.lineTo(3.6, -3.2); plateShape.lineTo(-3.6, -3.2); plateShape.closePath();
for (const x of [-1.9, 1.9]) {
  const h = new THREE.Path(); h.absarc(x, -2.6, 0.2, 0, Math.PI * 2, true); plateShape.holes.push(h);
}
for (const x of [-0.75, 0.75]) {
  const h = new THREE.Path();
  h.moveTo(x - 0.16, -2.75); h.lineTo(x + 0.16, -2.75); h.lineTo(x + 0.16, -2.45); h.lineTo(x - 0.16, -2.45); h.closePath();
  plateShape.holes.push(h);
}
const plate = new THREE.Mesh(
  new THREE.ExtrudeGeometry(plateShape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }),
  new THREE.MeshPhysicalMaterial({ color: 0x24211e, roughness: 0.5, clearcoat: 0.6 })
);
plate.position.z = FZ - 0.04;
tape.add(plate);

// Screws
const screwMat = new THREE.MeshStandardMaterial({ color: 0xb9b2a6, metalness: 1, roughness: 0.3 });
for (const [x, y] of [[-4.65, 2.9], [4.65, 2.9], [-4.65, -2.9], [4.65, -2.9], [0, -2.25]]) {
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 20), screwMat);
  s.rotation.x = Math.PI / 2; s.position.set(x, y, FZ + 0.01);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.02), holeMat);
  slot.position.set(x, y, FZ + 0.035); slot.rotation.z = Math.random() * Math.PI;
  tape.add(s, slot);
}

// Exposed tape along the bottom edge
const strip = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.05, D * 0.7), tapeMat);
strip.position.set(0, -H / 2 + 0.02, 0);
tape.add(strip);

// Floating dust
const dustGeo = new THREE.BufferGeometry();
const N = 260, pos = new Float32Array(N * 3);
for (let i = 0; i < N; i++) {
  pos[i * 3] = (Math.random() - 0.5) * 40;
  pos[i * 3 + 1] = (Math.random() - 0.5) * 24;
  pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
}
dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xefe7da, size: 0.05, transparent: true, opacity: 0.5 }));
scene.add(dust);

tape.rotation.set(-0.15, -0.45, 0.08);

// ---------- Layout ----------
function layout() {
  const w = hero.clientWidth, h = hero.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
  const halfW = halfH * camera.aspect;
  // Fit the tape into the empty space next to (desktop) or above (mobile) the hero text.
  const u = (2 * halfH) / h; // world units per CSS pixel
  const copy = document.querySelector(".hero-copy").getBoundingClientRect();
  const top = hero.getBoundingClientRect().top;
  if (w <= 860 && h > w) {
    const y0 = 80, y1 = Math.max(y0 + 80, copy.top - top - 16);   // between nav and text
    const s = Math.min(1, ((y1 - y0) * u) / (H * 1.25), (w * 0.88 * u) / (W * 1.1));
    root.scale.setScalar(s);
    root.position.set(0, halfH - ((y0 + y1) / 2) * u, 0);
  } else {
    const x0 = copy.right + 24, x1 = w - 32;                      // right of the text
    const s = Math.min(1, ((x1 - x0) * u) / (W * 1.15), (h * 0.7 * u) / H);
    root.scale.setScalar(s);
    root.position.set(((x0 + x1) / 2 - w / 2) * u, 0, 0);
  }
}
document.fonts?.ready.then(layout);
window.addEventListener("resize", layout);
layout();

// ---------- Interaction ----------
const mouse = { x: 0, y: 0 };
let drag = null, spinVel = 0, spinY = 0;
window.addEventListener("pointermove", (e) => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = (e.clientY / innerHeight) * 2 - 1;
  if (drag) { spinVel = (e.clientX - drag) * 0.004; drag = e.clientX; }
});
canvas.addEventListener("pointerdown", (e) => { drag = e.clientX; canvas.style.cursor = "grabbing"; });
window.addEventListener("pointerup", () => { drag = null; canvas.style.cursor = "grab"; });
canvas.style.cursor = "grab";
canvas.style.touchAction = "pan-y";

let visible = true;
new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(hero);

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clock = new THREE.Clock();
let rx = -0.15, ry = -0.45;

function tick() {
  requestAnimationFrame(tick);
  if (!visible) return;
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  const scroll = Math.min(scrollY / innerHeight, 1);

  spinY += spinVel;
  spinVel *= 0.94;

  const targetX = -0.15 + mouse.y * 0.25 + scroll * 0.6;
  const targetY = -0.45 + mouse.x * 0.45 + (reduce ? 0 : Math.sin(t * 0.4) * 0.12);
  rx += (targetX - rx) * 0.06;
  ry += (targetY - ry) * 0.06;
  tape.rotation.x = rx;
  tape.rotation.y = ry + spinY;
  tape.position.y = reduce ? 0 : Math.sin(t * 0.8) * 0.25;
  tape.position.z = -scroll * 6;

  // reels play (spin faster while the user is dragging or scrolling)
  const speed = reduce ? 0 : 1.6 + Math.abs(spinVel) * 60;
  reelL.userData.hub.rotation.z += dt * speed;
  reelR.userData.hub.rotation.z += dt * speed * 1.55;

  dust.rotation.y = t * 0.01;
  dust.position.y = Math.sin(t * 0.2) * 0.4;

  renderer.render(scene, camera);
}
tick();
