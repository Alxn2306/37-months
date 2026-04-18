const START_DATE = new Date('2023-03-18T00:00:00');
const LOVE_NAME  = 'el amor de mi vida';
const PARAGRAPHS = [
  'No sé en qué momento te volviste tan importante para mí, pero pasó… y ahora estás en casi todo lo que pienso.',
  'Me gusta cómo eres, cómo me haces sentir, y cómo incluso en la distancia logras estar presente en mi día. No es fácil esto que tenemos, pero contigo todo vale la pena. Porque no se trata solo de estar cerca, sino de querer estar, y yo te quiero a ti.',
  'A veces te extraño más de lo que digo, pero también sonrío más de lo que imaginabas, gracias a ti.',
  'No sé qué venga después, pero sí sé algo: mientras estés tú, yo voy a seguir intentando, voy a seguir cuidando esto, porque lo nuestro me importa de verdad.',
  'Te amo, y no es por costumbre… es porque eres tú.'
];

/* ================================================================ */

const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
let W, H;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); buildPetals(); });

/* ─── Audio ─────────────────────────────────────────────────────── */
const audio   = new Audio();
audio.src     = 'patrick-watson-je-te-laisserai-des-mots.mp3';
audio.loop    = true;
audio.volume  = 0.5;
audio.preload = 'auto';

/* ─── Layout responsivo ─────────────────────────────────────────── */
/*
  ESCRITORIO (>1024 px, portrait o landscape):
    Árbol a la DERECHA (62% del ancho), texto a la izquierda.
    El árbol ocupa de tTop (≈52% H) a tBot (≈91% H).

  LANDSCAPE MÓVIL/TABLET (≤900 px landscape):
    Tratamos igual que tablet pero con árbol más alto para que quede
    centrado verticalmente y el texto quede a la izquierda (como escritorio).

  TABLET (601-1024 px, portrait):
    Árbol centrado horizontalmente, copa arriba (≈38% H),
    base en ≈78% H.

  MÓVIL (≤600 px, portrait):
    Árbol centrado, copa arriba (≈28% H), base en ≈68% H.
    Deja ≈32% inferior libre para texto + timer.
*/

const isLandscapeSmall = () => W <= 900 && W > H;   // móvil/tablet landscape
const isDesktop        = () => W > 1024 && !isLandscapeSmall();
const isTablet         = () => W > 600 && W <= 1024 && !isLandscapeSmall();
const isMobile         = () => W <= 600 && !isLandscapeSmall();

/* Centro X del árbol */
const tx = () => {
  if (isDesktop())        return W * 0.62;
  if (isLandscapeSmall()) return W * 0.62;  // texto a la izq, árbol a la der
  return W * 0.50;                           // centrado en portrait
};

/* Pie del tronco */
const tBot = () => {
  if (isDesktop())        return H * 0.91;
  if (isLandscapeSmall()) return H * 0.90;
  if (isMobile())         return H * 0.68;  // más arriba → más espacio abajo
  return H * 0.78;                          // tablet portrait
};

/* Cima del tronco (donde empieza la copa) */
const tTop = () => {
  if (isDesktop())        return H * 0.52;
  if (isLandscapeSmall()) return H * 0.18;
  if (isMobile())         return H * 0.28;  // copa en el tercio superior
  return H * 0.38;
};

/* Radio de la copa */
const cR = () => {
  const u = Math.min(W, H);
  if (isMobile())        return u * 0.190;
  if (isTablet())        return u * 0.215;
  if (isLandscapeSmall()) return u * 0.190;
  return u * 0.245;
};

const cX = () => tx();
const cY = () => tTop() - cR() * 0.72;

/* ─── Pétalos ───────────────────────────────────────────────────── */
const PETAL_N = 700;
const COLORS  = [
  '#c0182a','#d42035','#e02840','#b81020',
  '#e84060','#d03055','#c82845','#f06080',
  '#e05070','#cc2040','#d83050','#f090a8'
];

let petals = [];

function heartSDF(nx, ny) {
  const yn = ny + 0.12;
  return Math.pow(nx*nx + yn*yn - 1, 3) - nx*nx * Math.pow(yn, 3);
}

function buildPetals() {
  petals = [];
  let tries = 0;
  while (petals.length < PETAL_N && tries < PETAL_N * 80) {
    tries++;
    const nx = (Math.random() * 2.2) - 1.1;
    const ny = (Math.random() * 2.0) - 1.0;
    if (heartSDF(nx, ny) > -0.02) continue;
    const size     = 4 + Math.random() * 8;
    const colorIdx = Math.random() < 0.65
      ? Math.floor(Math.random() * 6)
      : 6 + Math.floor(Math.random() * 6);
    petals.push({
      nx, ny, size,
      color: COLORS[colorIdx],
      delay: Math.random() * 0.85,
      rot:   Math.random() * Math.PI * 2
    });
  }
}
buildPetals();

function petalPx(p) {
  return {
    x: cX() + p.nx * cR() * 1.02,
    y: cY() - (p.ny - 0.12) * cR() * 0.96
  };
}

/* ─── Corazón pequeño ───────────────────────────────────────────── */
function heart(hx, hy, s, color, alpha, rot) {
  if (alpha <= 0 || s <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.fillStyle   = color;
  ctx.translate(hx, hy);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, s * 0.25);
  ctx.bezierCurveTo(-s*.95, -s*.40, -s*1.45,  s*.20,  0,  s*1.05);
  ctx.bezierCurveTo( s*1.45,  s*.20,  s*.95, -s*.40,  0,  s*0.25);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function bg() {
  ctx.fillStyle = '#f7eeea';
  ctx.fillRect(0, 0, W, H);
}

function drawSeed(p) {
  const y = H * 0.05 + (tBot() - H * 0.1) * p;
  heart(tx(), y, 9, '#c0182a', 1, 0);
}

/* ══════════════════════════════════════════════════════════════
   TRONCO + RAMAS
═══════════════════════════════════════════════════════════════ */
function drawBranch(x0, y0, cpx, cpy, x1, y1, wStart, wEnd, t) {
  if (t <= 0) return;
  const steps = 14;
  const n     = Math.floor(steps * t);
  if (n < 1) return;
  for (let i = 0; i < n; i++) {
    const ta = i / steps;
    const tb = (i + 1) / steps;
    const ax = (1-ta)*(1-ta)*x0 + 2*(1-ta)*ta*cpx + ta*ta*x1;
    const ay = (1-ta)*(1-ta)*y0 + 2*(1-ta)*ta*cpy + ta*ta*y1;
    const bx = (1-tb)*(1-tb)*x0 + 2*(1-tb)*tb*cpx + tb*tb*x1;
    const by = (1-tb)*(1-tb)*y0 + 2*(1-tb)*tb*cpy + tb*tb*y1;
    const w  = wStart + (wEnd - wStart) * ta;
    ctx.lineWidth = Math.max(0.8, w);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }
}

function screenToHeart(sx, sy) {
  const r  = cR();
  const nx = (sx - cX()) / (r * 1.02);
  const ny = -((sy - cY()) / (r * 0.96)) + 0.12;
  return { nx, ny };
}

function clampedT(x0, y0, cpxv, cpyv, x1, y1) {
  const steps = 50;
  for (let i = 1; i <= steps; i++) {
    const t  = i / steps;
    const bx = (1-t)*(1-t)*x0 + 2*(1-t)*t*cpxv + t*t*x1;
    const by = (1-t)*(1-t)*y0 + 2*(1-t)*t*cpyv + t*t*y1;
    const h  = screenToHeart(bx, by);
    if (heartSDF(h.nx, h.ny) > 0.04) return (i - 1) / steps;
  }
  return 1;
}

function drawTrunk(progress) {
  const x  = tx();
  const by = tBot();
  const ty = tTop();
  const h  = by - ty;
  const u  = Math.min(W, H);

  ctx.save();
  ctx.strokeStyle = '#7a4020';
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';

  const tp = Math.min(1, progress / 0.45);
  drawBranch(x, by, x + u*0.008, by - h*0.5, x + u*0.010, ty, u*0.042, u*0.018, tp);

  if (progress < 0.45) { ctx.restore(); return; }

  const bp   = Math.min(1, (progress - 0.45) / 0.55);
  const ex   = x + u*0.010;
  const ey   = ty;
  const bfx  = ex;
  const bfy  = ey + h * 0.05;
  const midX = x + u*0.008;
  const midY = ty + h * 0.22;
  const lowX = x + u*0.004;
  const lowY = ty + h * 0.45;

  const ramas = [
    { x0:bfx, y0:bfy, cpx:bfx-u*.04, cpy:bfy-u*.06, x1:bfx-u*.07, y1:bfy-u*.12,
      ws:u*.016, we:u*.008, delay:0.00,
      children:[
        { cpx:-u*.04, cpy:-u*.06, x1:-u*.08, y1:-u*.12, ws:u*.007, we:u*.003, delay:0.30,
          children:[
            { cpx:-u*.03, cpy:-u*.04, x1:-u*.05, y1:-u*.09, ws:u*.004, we:u*.001, delay:0.60 },
            { cpx: u*.01, cpy:-u*.04, x1: u*.01, y1:-u*.08, ws:u*.003, we:u*.001, delay:0.65 },
          ]
        },
        { cpx: u*.01, cpy:-u*.05, x1: u*.01, y1:-u*.10, ws:u*.006, we:u*.002, delay:0.35 },
      ]
    },
    { x0:bfx, y0:bfy, cpx:bfx+u*.04, cpy:bfy-u*.06, x1:bfx+u*.07, y1:bfy-u*.12,
      ws:u*.016, we:u*.008, delay:0.00,
      children:[
        { cpx: u*.04, cpy:-u*.06, x1: u*.08, y1:-u*.12, ws:u*.007, we:u*.003, delay:0.30,
          children:[
            { cpx: u*.03, cpy:-u*.04, x1: u*.05, y1:-u*.09, ws:u*.004, we:u*.001, delay:0.60 },
            { cpx:-u*.01, cpy:-u*.04, x1:-u*.01, y1:-u*.08, ws:u*.003, we:u*.001, delay:0.65 },
          ]
        },
        { cpx:-u*.01, cpy:-u*.05, x1:-u*.01, y1:-u*.10, ws:u*.006, we:u*.002, delay:0.35 },
      ]
    },
    { x0:midX, y0:midY, cpx:midX-u*.045, cpy:midY-u*.055, x1:midX-u*.09, y1:midY-u*.12,
      ws:u*.013, we:u*.005, delay:0.12,
      children:[
        { cpx:-u*.04, cpy:-u*.05, x1:-u*.08, y1:-u*.11, ws:u*.005, we:u*.002, delay:0.42,
          children:[
            { cpx:-u*.03, cpy:-u*.04, x1:-u*.05, y1:-u*.08, ws:u*.003, we:u*.001, delay:0.68 },
          ]
        },
        { cpx:-u*.06, cpy:-u*.02, x1:-u*.10, y1:-u*.05, ws:u*.004, we:u*.001, delay:0.45 },
      ]
    },
    { x0:midX, y0:midY, cpx:midX+u*.045, cpy:midY-u*.055, x1:midX+u*.09, y1:midY-u*.12,
      ws:u*.013, we:u*.005, delay:0.12,
      children:[
        { cpx: u*.04, cpy:-u*.05, x1: u*.08, y1:-u*.11, ws:u*.005, we:u*.002, delay:0.42,
          children:[
            { cpx: u*.03, cpy:-u*.04, x1: u*.05, y1:-u*.08, ws:u*.003, we:u*.001, delay:0.68 },
          ]
        },
        { cpx: u*.06, cpy:-u*.02, x1: u*.10, y1:-u*.05, ws:u*.004, we:u*.001, delay:0.45 },
      ]
    },
    { x0:lowX, y0:lowY, cpx:lowX-u*.05, cpy:lowY-u*.04, x1:lowX-u*.11, y1:lowY-u*.10,
      ws:u*.011, we:u*.004, delay:0.18,
      children:[
        { cpx:-u*.04, cpy:-u*.05, x1:-u*.08, y1:-u*.10, ws:u*.004, we:u*.001, delay:0.50 },
      ]
    },
    { x0:lowX, y0:lowY, cpx:lowX+u*.05, cpy:lowY-u*.04, x1:lowX+u*.11, y1:lowY-u*.10,
      ws:u*.011, we:u*.004, delay:0.18,
      children:[
        { cpx: u*.04, cpy:-u*.05, x1: u*.08, y1:-u*.10, ws:u*.004, we:u*.001, delay:0.50 },
      ]
    },
  ];

  function renderNode(node, parentX, parentY, bp) {
    const sx   = (node.x0 !== undefined) ? node.x0 : parentX;
    const sy   = (node.y0 !== undefined) ? node.y0 : parentY;
    const ex2  = (node.x0 !== undefined) ? node.x1 : parentX + node.x1;
    const ey2  = (node.y0 !== undefined) ? node.y1 : parentY + node.y1;
    const cpxv = (node.x0 !== undefined) ? node.cpx : parentX + node.cpx;
    const cpyv = (node.y0 !== undefined) ? node.cpy : parentY + node.cpy;
    const lp   = Math.min(1, Math.max(0, (bp - node.delay) / (1.001 - node.delay)));
    if (lp <= 0) return;
    const maxT   = clampedT(sx, sy, cpxv, cpyv, ex2, ey2);
    const finalT = Math.min(lp, maxT);
    drawBranch(sx, sy, cpxv, cpyv, ex2, ey2, node.ws, node.we, finalT);
    const tr   = finalT;
    const endX = (1-tr)*(1-tr)*sx + 2*(1-tr)*tr*cpxv + tr*tr*ex2;
    const endY = (1-tr)*(1-tr)*sy + 2*(1-tr)*tr*cpyv + tr*tr*ey2;
    if (lp > 0.55 && node.children) {
      node.children.forEach(child => renderNode(child, endX, endY, bp));
    }
  }

  ramas.forEach(r => renderNode(r, 0, 0, bp));
  ctx.restore();
}

/* ─── Copa ──────────────────────────────────────────────────────── */
function drawCrown(progress) {
  petals.forEach(p => {
    if (p.delay > progress) return;
    const pp    = Math.min(1, (progress - p.delay) / Math.max(0.001, 0.3));
    const eased = 1 - Math.pow(1 - Math.min(pp, 1), 2);
    const pos   = petalPx(p);
    heart(pos.x, pos.y, p.size * eased, p.color, eased, p.rot);
  });
}

/* ─── Hojas cayendo ─────────────────────────────────────────────── */
let falling = [];

function spawnLeaf() {
  const src = petals[Math.floor(Math.random() * petals.length)];
  const pos = petalPx(src);
  falling.push({
    x:     pos.x + (Math.random() - .5) * 14,
    y:     pos.y + (Math.random() - .5) * 14,
    vx:    (Math.random() - .5) * 1.8,
    vy:    .8 + Math.random() * 2.2,
    size:  3 + Math.random() * 5.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: 1,
    angle: Math.random() * Math.PI * 2,
    rot:   (Math.random() - .5) * .055
  });
}

function updateLeaves() {
  falling = falling.filter(f => f.alpha > 0.03);
  falling.forEach(f => {
    f.x += f.vx; f.y += f.vy; f.angle += f.rot;
    if (f.y > H * .76) f.alpha -= .018;
    heart(f.x, f.y, f.size, f.color, f.alpha, f.angle);
  });
}

/* ─── Loop ──────────────────────────────────────────────────────── */
const DUR = { seed:1100, trunk:3200, crown:3500, text:700 };
let phase = 'idle', phaseStart = 0, rafId = null, timerTick = null;

function loop(ts) {
  const e = ts - phaseStart;
  resize(); bg();
  if      (phase === 'seed')  { drawSeed(Math.min(1, e / DUR.seed));  if (e >= DUR.seed)  next(ts, 'trunk'); }
  else if (phase === 'trunk') { drawSeed(1); drawTrunk(Math.min(1, e / DUR.trunk)); if (e >= DUR.trunk) next(ts, 'crown'); }
  else if (phase === 'crown') { drawTrunk(1); drawCrown(Math.min(1, e / DUR.crown)); if (e >= DUR.crown) next(ts, 'text'); }
  else if (phase === 'text')  { drawTrunk(1); drawCrown(1); if (e >= DUR.text) next(ts, 'fall'); }
  else if (phase === 'fall')  { drawTrunk(1); drawCrown(1); if (Math.random() < .22) spawnLeaf(); updateLeaves(); }
  rafId = requestAnimationFrame(loop);
}

function next(ts, p) {
  phase = p; phaseStart = ts;
  if (p === 'text') showText();
  if (p === 'fall') showTimer();
}

/* ─── Texto párrafo por párrafo ─────────────────────────────────── */
function showText() {
  const wrap = document.getElementById('love-text');
  wrap.style.opacity = '1';
  wrap.innerHTML = '';

  PARAGRAPHS.forEach((txt, i) => {
    const p = document.createElement('p');
    p.className       = 'love-para';
    p.style.opacity   = '0';
    p.style.transform = 'translateY(10px)';
    p.style.transition= 'opacity 1s ease, transform 1s ease';
    p.textContent     = txt;
    wrap.appendChild(p);
    setTimeout(() => {
      p.style.opacity   = '1';
      p.style.transform = 'translateY(0)';
    }, 400 + i * 1400);
  });
}

/* ─── Timer ─────────────────────────────────────────────────────── */
function showTimer() {
  document.getElementById('timer-wrap').style.opacity = '1';
  updateTimer();
  timerTick = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const diff = Math.floor((Date.now() - START_DATE.getTime()) / 1000);
  const d = Math.floor(diff / 86400);
  const h = Math.floor((diff % 86400) / 3600);
  const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
  const s = String(diff % 60).padStart(2, '0');

  /* En móvil portrait usamos saltos de línea para que no desborde */
  const isMobilePortrait = window.innerWidth <= 600 && window.innerHeight > window.innerWidth;
  document.getElementById('timer-display').textContent = isMobilePortrait
    ? `${d} días · ${h}h ${m}m ${s}s`
    : `${d} días  ${h} horas  ${m} minutos  ${s} segundos`;
}

/* ─── Inicio ────────────────────────────────────────────────────── */
document.addEventListener('click', (e) => {
  if (phase !== 'idle') return;
  /* Si el toque fue dentro del texto, ignorarlo */
  if (e.target.closest('#love-text')) return;
  const ss = document.getElementById('start-screen');
  ss.style.opacity = '0';
  setTimeout(() => ss.style.display = 'none', 700);
  audio.load();
  audio.play().catch(() => setTimeout(() => audio.play().catch(() => {}), 500));
  phase      = 'seed';
  phaseStart = performance.now();
  rafId      = requestAnimationFrame(loop);
});