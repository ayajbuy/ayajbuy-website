// ---- Settings: change these to your real values ----
const THRESHOLD = 20000; // bag threshold in naira
const items = [
  { e: "💡", n: "Desk lamp", p: 4000 },
  { e: "📱", n: "Phone case", p: 2000 },
  { e: "👜", n: "Tote bag", p: 3000 },
  { e: "☕", n: "Kettle", p: 6000 },
  { e: "🧦", n: "Socks", p: 1500 },
  { e: "🎧", n: "Headphones", p: 7000 },
];
// -----------------------------------------------------

const $ = (id) => document.getElementById(id);
const fmt = (n) => "₦" + n.toLocaleString("en-NG");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
let total = 0;
let shipping = false;

// Footer year
$("year").textContent = new Date().getFullYear();

// ---- Fill-the-bag demo ----
items.forEach((it) => {
  const b = document.createElement("button");
  b.className = "item";
  b.type = "button";
  b.innerHTML = `<span class="e">${it.e}</span><span class="n">${it.n}</span><span class="p">${fmt(it.p)}</span>`;
  b.onclick = () => buy(it, b);
  $("shelf").appendChild(b);
});

function update() {
  const pct = Math.min(100, (total / THRESHOLD) * 100);
  $("bar").style.width = pct + "%";
  $("fill").style.height = pct + "%";
  $("meter").setAttribute("aria-valuenow", total);
  $("msg").textContent =
    total === 0
      ? `${fmt(0)} of ${fmt(THRESHOLD)}. Your bag is empty.`
      : `${fmt(total)} of ${fmt(THRESHOLD)}. ${fmt(Math.max(0, THRESHOLD - total))} to go.`;
}

function buy(it, btn) {
  if (shipping) return;
  btn.disabled = true;
  total += it.p;
  const s = document.createElement("span");
  s.textContent = it.e;
  $("pile").appendChild(s);
  const w = $("bagwrap");
  w.classList.remove("pop");
  void w.offsetWidth;
  setTimeout(() => w.classList.add("pop"), 500);
  update();
  if (total >= THRESHOLD) ship();
}

function ship() {
  shipping = true;
  $("msg").textContent = "Your bag is full and on its way.";
  $("stage").classList.add("go");
  setTimeout(() => {
    $("pile").innerHTML = "";
    $("fill").style.height = "0";
    $("msg").textContent = "Delivered. Ready for the next bag?";
    $("again").hidden = false;
  }, reduce ? 400 : 3300);
}

$("again").onclick = () => {
  total = 0;
  shipping = false;
  $("stage").classList.remove("go");
  document.querySelectorAll(".item").forEach((b) => (b.disabled = false));
  $("again").hidden = true;
  update();
};

// ---- Scrolling banner ----
const words = ["Pay per item", "Fill your bag", "Free delivery", "Delivered to you"];
$("track").innerHTML = [...words, ...words, ...words, ...words]
  .map((w) => `<span>${w}</span>`)
  .join("");

// ---- Steps line draws on scroll ----
try {
  new IntersectionObserver(
    (en, ob) => {
      if (en[0].isIntersecting) {
        $("steps").classList.add("in");
        ob.disconnect();
      }
    },
    { threshold: 0.4 }
  ).observe($("steps"));
} catch (e) {
  $("steps").classList.add("in");
}

// ---- Looping ring ----
function ringLoop() {
  const rf = $("rf"), rn = $("rn"), rt = $("rt");
  if (reduce) {
    rf.style.strokeDashoffset = 0;
    rn.textContent = fmt(THRESHOLD);
    rt.textContent = "ships now";
    return;
  }
  let t0 = null;
  const D = 3200, H = 1800;
  function frame(t) {
    if (!t0) t0 = t;
    const k = (t - t0) % (D + H);
    const p = Math.min(1, k / D);
    const e = 1 - Math.pow(1 - p, 2);
    rf.style.strokeDashoffset = 565.5 * (1 - e);
    rn.textContent = fmt(Math.round((THRESHOLD * e) / 100) * 100);
    rt.textContent = p >= 1 ? "ships now" : "of " + fmt(THRESHOLD) + " threshold";
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
try {
  new IntersectionObserver(
    (en, ob) => {
      if (en[0].isIntersecting) {
        ringLoop();
        ob.disconnect();
      }
    },
    { threshold: 0.3 }
  ).observe($("ring"));
} catch (e) {
  ringLoop();
}