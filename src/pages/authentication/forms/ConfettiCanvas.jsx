import { useEffect, useRef } from "react";

const COUNT = 1100;
const SPEED = 2.75;

export default function ConfettiCanvas() {
  const canvasRef = useRef(null);
  const piecesRef = useRef([]);
  const mxRef = useRef(0);
  const rafRef = useRef(null);
  const lastRef = useRef(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });

    let w = 0;
    let h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const palette = [
      [255, 214, 102],
      [255, 107, 107],
      [116, 185, 255],
      [120, 224, 143],
      [235, 235, 235]
    ];

    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = (arr) => arr[(Math.random() * arr.length) | 0];

    const spriteCache = new Map();

    function spriteKey(r, g, b, bw, bh, blur) {
      return `${r},${g},${b}|${bw}x${bh}|${blur}`;
    }

    function makeSprite(r, g, b, bw, bh, blur) {
      const pad = blur ? Math.ceil(blur * 3 + 6) : 2;
      const c = document.createElement("canvas");
      c.width = bw + pad * 2;
      c.height = bh + pad * 2;
      const cctx = c.getContext("2d");

      if (blur) {
        cctx.shadowColor = `rgb(${r},${g},${b})`;
        cctx.shadowBlur = blur;
      }

      cctx.fillStyle = `rgb(${r},${g},${b})`;
      cctx.fillRect(pad, pad, bw, bh);

      const dots = Math.max(18, Math.floor((bw * bh) / 9));
      for (let i = 0; i < dots; i++) {
        const x = pad + Math.random() * bw;
        const y = pad + Math.random() * bh;
        const v = Math.random() * 60 - 30;
        cctx.globalAlpha = 0.14 + Math.random() * 0.26;
        cctx.fillStyle = `rgb(
          ${Math.min(255, Math.max(0, r + v))},
          ${Math.min(255, Math.max(0, g + v))},
          ${Math.min(255, Math.max(0, b + v))}
        )`;
        cctx.fillRect(x, y, 1, 1);
      }

      cctx.globalAlpha = 1;
      return { img: c, ox: pad + bw / 2, oy: pad + bh / 2 };
    }

    function getSprite(r, g, b, bw, bh, blur) {
      const key = spriteKey(r, g, b, bw, bh, blur);
      if (!spriteCache.has(key)) {
        spriteCache.set(key, makeSprite(r, g, b, bw, bh, blur));
      }
      return spriteCache.get(key);
    }

    function makePiece(init) {
      const z = Math.random();
      const layer = z < 0.5 ? 0 : z < 0.85 ? 1 : 2;
      const hero = layer === 2 && Math.random() < 0.35;
      const ultra = layer === 2 && Math.random() < 0.05;

      const base =
        layer === 0 ? rand(2, 4)
        : layer === 1 ? rand(4, 7)
        : ultra ? rand(34, 55)
        : hero ? rand(18, 28)
        : rand(12, 20);

      const x = rand(-140, w + 140);
      const y = init ? rand(-80, h + 80) : rand(-260, -60);

      const rgb = pick(palette);
      const r = rgb[0] * 0.72;
      const g = rgb[1] * 0.72;
      const b = rgb[2] * 0.72;

      const bw = Math.max(2, base);
      const bh = Math.max(3, bw * rand(1, 1.5));

      return {
        x,
        y,
        layer,
        hero,
        ultra,
        spr: getSprite(r, g, b, bw, bh, ultra ? 3 : 0),
        vx: rand(0.1, 0.6),
        vy: rand(0.35, 2),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.02, 0.02),
        sway: rand(0, Math.PI * 2),
        swaySpeed: rand(0.01, 0.02),
        drift: rand(0.2, 0.6),
        flip: rand(0, Math.PI * 2),
        flipSpeed: rand(0.02, 0.12)
      };
    }

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    piecesRef.current = Array.from({ length: COUNT }, () => makePiece(true));
    resize();

    const onMove = (e) => {
      mxRef.current = (e.clientX / w) * 2 - 1;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);

    function loop(now) {
      const dt = Math.min(0.033, (now - lastRef.current) / 1000);
      lastRef.current = now;

      ctx.clearRect(0, 0, w, h);
      const wind = 0.5 + Math.sin(now * 0.00035) * 0.18 + mxRef.current * 0.3;

      for (let i = 0; i < piecesRef.current.length; i++) {
        const p = piecesRef.current[i];
        p.sway += p.swaySpeed * 60 * dt * SPEED;
        p.flip += p.flipSpeed * 60 * dt * SPEED;

        p.x += (wind + Math.sin(p.sway) * p.drift + p.vx) * 60 * dt * SPEED;
        p.y += p.vy * 60 * dt * SPEED;
        p.rot += p.vr * 60 * dt * SPEED;

        if (p.y > h + 300) piecesRef.current[i] = makePiece(false);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(0.06 + 0.94 * Math.abs(Math.sin(p.flip)), 1);
        ctx.globalAlpha = p.ultra ? 0.95 : p.hero ? 0.9 : 0.6;
        ctx.drawImage(p.spr.img, -p.spr.ox, -p.spr.oy);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1
      }}
    />
  );
}
